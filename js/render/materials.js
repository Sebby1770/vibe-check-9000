/* One pass over the finished world: PBR maps at real-world scale, physically sensible wet surfaces, painted
   lane lines, and light from signs and lamps smeared across the wet road. */
import * as THREE from "three";

const _c = new THREE.Color();

/** Maps a material's textures by world position (planar by dominant normal), so bricks, slabs and asphalt
    keep their real size on every box, batch and instance. */
function worldUV(material, tile) {
    const inv = new THREE.Vector2(1 / tile[0], 1 / tile[1]);
    material.onBeforeCompile = (shader) => {
        shader.uniforms.uWorldTile = { value: inv };
        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nuniform vec2 uWorldTile;")
            .replace("#include <uv_vertex>", `#include <uv_vertex>
            {
                vec4 wpw = vec4( position, 1.0 );
                #ifdef USE_INSTANCING
                    wpw = instanceMatrix * wpw;
                #endif
                wpw = modelMatrix * wpw;
                vec3 aw = abs( normalize( mat3( modelMatrix ) * normal ) );
                vec2 wuv = aw.y > max( aw.x, aw.z ) ? wpw.xz : ( aw.x > aw.z ? vec2( wpw.z, wpw.y ) : wpw.xy );
                wuv *= uWorldTile;
                #ifdef USE_MAP
                    vMapUv = wuv;
                #endif
                #ifdef USE_NORMALMAP
                    vNormalMapUv = wuv;
                #endif
                #ifdef USE_ROUGHNESSMAP
                    vRoughnessMapUv = wuv;
                #endif
            }`);
    };
    material.customProgramCacheKey = () => "vc9k-world-uv";
    material.needsUpdate = true;
}

export function upgradeMaterials(scene) {
    const seen = new Set();
    scene.traverse((o) => {
        if (!o.isMesh) return;
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
            if (!m || seen.has(m) || !m.isMeshStandardMaterial) continue;
            seen.add(m);
            const pbr = m.map?.userData?.pbr;
            if (pbr) {
                m.normalMap = pbr.normalMap;
                m.normalScale = new THREE.Vector2(1, 1);
                m.roughnessMap = pbr.roughnessMap;
                if (pbr.worldTile) worldUV(m, pbr.worldTile);
                m.needsUpdate = true;
            }
            // Asphalt and standing water are not metals: wetness lives in roughness and Fresnel.
            if (m.metalness > 0.5 && m.roughness < 0.35 && !m.map && m.color.r + m.color.g + m.color.b < 0.12) { m.metalness = 0; m.roughness = Math.min(m.roughness, 0.06); m.envMapIntensity = 1.4; }
            if (pbr && pbr.worldTile?.[0] === 7) { m.metalness = 0; m.roughness = 1; m.color.multiplyScalar(0.8); m.envMapIntensity = 1.5; }
        }
    });
}

/** Double yellow centre line and white lane edges along 47th, broken at the crossings. */
export function addRoadMarkings(scene) {
    const yellow = new THREE.MeshStandardMaterial({ color: 0xc9971f, roughness: 0.55, metalness: 0 });
    const white = new THREE.MeshStandardMaterial({ color: 0xcfcabd, roughness: 0.6, metalness: 0 });
    const group = new THREE.Group();
    group.name = "Road markings";
    const crossings = [-28.5, -0.8, 24];
    const runs = [];
    let x = -95;
    for (const c of [...crossings, 183]) { runs.push([x, c - 3.2]); x = c + 3.2; }
    const strip = (x0, x1, z, w, mat, dash = 0) => {
        if (!dash) {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, w), mat);
            m.rotation.x = -Math.PI / 2;
            m.position.set((x0 + x1) / 2, 0.038, z);
            m.receiveShadow = true;
            group.add(m);
            return;
        }
        for (let d = x0; d < x1 - dash; d += dash * 2) strip(d, d + dash, z, w, mat);
    };
    for (const [a, b] of runs) {
        strip(a, b, 22.68, 0.11, yellow);
        strip(a, b, 22.92, 0.11, yellow);
        strip(a, b, 19.25, 0.1, white, 3);
        strip(a, b, 26.35, 0.1, white, 3);
    }
    scene.add(group);
    return group;
}

/** Streaks of colour under lamps and neon, lying across the wet asphalt. Additive and see-through, so the
    sign audit and road-ray tests never see them. Returns an updater that fades them by daylight. */
export function addStreetReflections(scene, city) {
    const grad = document.createElement("canvas");
    grad.width = 32; grad.height = 256;
    const g = grad.getContext("2d");
    const lg = g.createLinearGradient(0, 0, 0, 256);
    lg.addColorStop(0, "rgba(255,255,255,0)");
    lg.addColorStop(0.18, "rgba(255,255,255,0.9)");
    lg.addColorStop(0.5, "rgba(255,255,255,0.35)");
    lg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = lg;
    g.fillRect(0, 0, 32, 256);
    const rg = g.createLinearGradient(0, 0, 32, 0);
    rg.addColorStop(0, "rgba(0,0,0,1)"); rg.addColorStop(0.5, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = rg;
    g.fillRect(0, 0, 32, 256);
    const tex = new THREE.CanvasTexture(grad);
    tex.colorSpace = THREE.SRGBColorSpace;

    const streaks = [];
    const geo = new THREE.PlaneGeometry(1, 1);
    const add = (x, z0, z1, color, width, strength) => {
        const m = new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: true });
        const mesh = new THREE.Mesh(geo, m);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = z1 > z0 ? Math.PI : 0;
        mesh.scale.set(width, Math.abs(z1 - z0), 1);
        mesh.position.set(x, 0.045, (z0 + z1) / 2);
        mesh.userData.noShadow = true;
        mesh.renderOrder = 2;
        scene.add(mesh);
        streaks.push({ mesh, strength });
    };
    // Street lamps and shop-front lights along 47th.
    scene.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    scene.traverse((o) => {
        if (!o.isPointLight) return;
        o.getWorldPosition(v);
        if (v.y < 1.5 || v.y > 9 || v.z < 12 || v.z > 34 || v.x < -60 || v.x > 60) return;
        const toward = v.z < 22.8 ? 1 : -1;
        const edge = v.z < 22.8 ? Math.max(v.z, 18.6) : Math.min(v.z, 27);
        add(v.x, edge, edge + toward * 5.5, _c.copy(o.color).getHex(), 1.1, 0.55);
    });
    // Lit signs facing the street: sample each sign's average colour once.
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const pg = probe.getContext("2d", { willReadFrequently: true });
    (city?.root || scene).traverse((o) => {
        const m = o.material;
        if (!o.isMesh || !m?.isMeshBasicMaterial || !m.map?.image || m.transparent || o.geometry.type !== "PlaneGeometry") return;
        o.getWorldPosition(v);
        if (v.y < 2.5 || v.y > 13 || v.z < 11 || v.z > 35) return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        const w = (o.geometry.boundingBox.max.x - o.geometry.boundingBox.min.x) * o.scale.x;
        if (w < 1.2) return;
        let col = 0xffd9a0;
        try { pg.drawImage(m.map.image, 0, 0, 1, 1); const d = pg.getImageData(0, 0, 1, 1).data; col = (Math.min(255, d[0] * 2.2) << 16) | (Math.min(255, d[1] * 2.2) << 8) | Math.min(255, d[2] * 2.2); } catch { /* tainted or empty: keep warm white */ }
        const toward = v.z < 22.8 ? 1 : -1;
        const edge = v.z < 22.8 ? 18.7 : 26.9;
        add(v.x, edge, edge + toward * Math.min(6, 2.5 + v.y * 0.4), col, Math.min(3.2, w * 0.5), 0.4);
    });
    return {
        streaks,
        update(daylight, outside) {
            const k = (1 - Math.min(1, daylight * 1.4)) * (outside ? 1 : 0.4);
            for (const s of streaks) { s.mesh.material.opacity = s.strength * k; s.mesh.visible = k > 0.02; }
        },
    };
}
