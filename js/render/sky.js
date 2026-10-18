/* Physical daytime sky (Preetham, on a sphere so tests never mistake it for a box), stars for the night,
   and the hand-painted dusk gradient layered on top as the sun goes down. */
import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";

const _sun = new THREE.Vector3();

export function createSky(scene, dusk, radius = 300) {
    const sky = new Sky();
    sky.geometry.dispose();
    sky.geometry = new THREE.SphereGeometry(1, 48, 24);
    sky.scale.setScalar(radius);
    sky.name = "Physical sky";
    sky.frustumCulled = false;
    sky.renderOrder = -3;
    const m = sky.material;
    m.depthWrite = false;
    m.uniforms.skyGain = { value: 0.55 };
    m.fragmentShader = "uniform float skyGain;\n" + m.fragmentShader.replace(
        "gl_FragColor = vec4( retColor, 1.0 );",
        "gl_FragColor = vec4( pow( retColor, vec3( 2.2 ) ) * skyGain, 1.0 );", // Sky.js gamma-encodes; undo it for the linear pipeline
    );
    Object.assign(m.uniforms.turbidity, { value: 4.2 });    // a little coal-smoke haze over 1954 Manhattan
    Object.assign(m.uniforms.rayleigh, { value: 2.6 });
    Object.assign(m.uniforms.mieCoefficient, { value: 0.005 });
    Object.assign(m.uniforms.mieDirectionalG, { value: 0.8 });
    scene.add(sky);

    // The gradient sky now sits in front and fades out as the physical sky takes over.
    dusk.sky.material.transparent = true;
    dusk.sky.renderOrder = -2;

    const count = 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    let seed = 1954;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
        const u = rnd() * Math.PI * 2;
        const v = Math.acos(1 - rnd() * 0.92);  // upper dome only
        const r = radius * 0.9;
        pos.set([Math.sin(v) * Math.cos(u) * r, Math.cos(v) * r, Math.sin(v) * Math.sin(u) * r], i * 3);
        const warm = rnd();
        const b = 0.45 + rnd() * rnd() * 0.75;
        col.set([b * (0.85 + warm * 0.15), b * 0.9, b * (1.05 - warm * 0.2)], i * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
        size: 1.7, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0,
        depthWrite: false, fog: false,
    }));
    stars.name = "Stars";
    stars.frustumCulled = false;
    stars.renderOrder = -1;
    scene.add(stars);

    return {
        sky, stars,
        /** 0 at night, 1 in full day: how much of the physical sky shows through the gradient. */
        mix: 0,
        update(camPos, look, outside) {
            _sun.set(look.sunX, look.sunY, look.sunZ).normalize();
            m.uniforms.sunPosition.value.copy(_sun);
            const elev = _sun.y;
            this.mix = THREE.MathUtils.smoothstep(elev, -0.06, 0.22);
            sky.position.copy(camPos);
            stars.position.copy(camPos);
            sky.visible = this.mix > 0.01;
            dusk.sky.material.opacity = 1 - this.mix * 0.94;
            const night = THREE.MathUtils.smoothstep(1 - look.daylight, 0.8, 1);
            stars.material.opacity = outside ? night * 0.85 : night * 0.4;
            stars.visible = stars.material.opacity > 0.02;
            stars.rotation.y = look.hour * 0.0436; // the sky wheels slowly through the night
            m.uniforms.skyGain.value = this.gain = 0.9 - 0.62 * this.mix;
        },
    };
}
