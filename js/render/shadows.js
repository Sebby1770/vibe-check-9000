/* One sun (or moon) shadow map that follows the player, snapped to its texel grid so edges never shimmer. */
import * as THREE from "three";

const _dir = new THREE.Vector3();
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _snap = new THREE.Vector3();
const _view = new THREE.Matrix4();
const _eye = new THREE.Object3D();

function lit(material) {
    const m = Array.isArray(material) ? material[0] : material;
    return !!m && (m.isMeshStandardMaterial || m.isMeshPhongMaterial || m.isMeshLambertMaterial || m.isMeshToonMaterial);
}

/**
 * Flags casters and receivers under `root`. Signs, neon, glass and glow planes (basic or see-through
 * materials) neither cast nor receive; flat ground slabs only receive. Safe to call again for new objects.
 */
export function markShadows(root, { cast = true, receive = true, maxCaster = 140 } = {}) {
    root.traverse((o) => {
        if (!(o.isMesh || o.isSkinnedMesh || o.isInstancedMesh) || o.userData.noShadow) return;
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        if (!lit(o.material) || (m.transparent && m.opacity < 0.95)) { o.castShadow = o.receiveShadow = false; return; }
        o.receiveShadow = receive;
        if (!cast) return;
        if (o.isInstancedMesh || o.isSkinnedMesh) { o.castShadow = true; return; }
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        _box.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld).getSize(_size);
        const flat = _size.y < 0.18 && Math.max(_size.x, _size.z) > 3;
        o.castShadow = !flat && Math.max(_size.x, _size.y, _size.z) < maxCaster;
    });
}

export function createSunShadow(renderer, light, scene, quality) {
    renderer.shadowMap.enabled = !!quality.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    light.castShadow = !!quality.shadows;
    const extent = quality.tier === "ultra" ? 70 : 52;
    const size = quality.shadowMapSize || 2048;
    light.shadow.mapSize.set(size, size);
    Object.assign(light.shadow.camera, { left: -extent, right: extent, top: extent, bottom: -extent, near: 2, far: 420 });
    light.shadow.camera.updateProjectionMatrix();
    light.shadow.bias = -0.00035;
    light.shadow.normalBias = 0.035;
    light.shadow.radius = 3;
    if (!light.target.parent) scene.add(light.target);
    const texel = (extent * 2) / size;
    let frame = 0;

    return {
        enabled: !!quality.shadows,
        /** Points the light along `look` from above the player and refreshes the map every other frame. */
        update(camPos, look, { outside, strength }) {
            if (!this.enabled) return;
            const sunUp = look.sunY > 6;
            const y = sunUp ? look.sunY : Math.max(30, look.moonY);
            _dir.set(sunUp ? look.sunX : look.moonX, y, sunUp ? look.sunZ : look.moonZ).normalize();
            // Snap the shadow centre to whole texels in light space.
            _eye.position.copy(_dir).multiplyScalar(200);
            _eye.lookAt(0, 0, 0);
            _eye.updateMatrixWorld();
            _view.copy(_eye.matrixWorld).invert();
            _snap.set(camPos.x, 0, camPos.z).applyMatrix4(_view);
            _snap.x = Math.round(_snap.x / texel) * texel;
            _snap.y = Math.round(_snap.y / texel) * texel;
            _snap.applyMatrix4(_eye.matrixWorld);
            light.target.position.copy(_snap);
            light.target.updateMatrixWorld();
            light.position.copy(_snap).addScaledVector(_dir, 200);
            const want = outside && strength > 0.08;
            renderer.shadowMap.needsUpdate = want && (frame++ & 1) === 0;
        },
    };
}
