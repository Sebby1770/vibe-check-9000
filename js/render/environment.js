/* Image-based lighting that follows the clock: a PMREM of the current sky (plus a dark street and warm
   city glow below the horizon) outdoors, and a warm lamp-lit room for interiors. */
import * as THREE from "three";

function roomScene() {
    const s = new THREE.Scene();
    const wall = new THREE.MeshBasicMaterial({ color: 0x2e241c, side: THREE.BackSide });
    s.add(new THREE.Mesh(new THREE.BoxGeometry(22, 7, 22), wall));
    const lamp = new THREE.MeshBasicMaterial({ color: new THREE.Color(5.5, 4.4, 3.0) });
    for (const [x, z] of [[-5, -5], [5, -5], [-5, 5], [5, 5], [0, 0]]) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), lamp);
        p.rotation.x = Math.PI / 2;
        p.position.set(x, 3.4, z);
        s.add(p);
    }
    const window_ = new THREE.Mesh(new THREE.PlaneGeometry(9, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 1.25, 1.5) }));
    window_.position.set(0, 1.2, -10.9);
    s.add(window_);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshBasicMaterial({ color: 0x4a3524 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.4;
    s.add(floor);
    return s;
}

export function createEnvironment(renderer, sky, dusk, size = 128) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = pmrem.fromScene(roomScene(), 0.02).texture;

    // A private scene that borrows the live sky materials, so it always matches what you see.
    const skyScene = new THREE.Scene();
    const physical = new THREE.Mesh(sky.sky.geometry, sky.sky.material);
    physical.scale.setScalar(80);
    const gradient = new THREE.Mesh(new THREE.SphereGeometry(70, 32, 16), dusk.sky.material);
    const ground = new THREE.Mesh(
        new THREE.SphereGeometry(60, 32, 16, 0, Math.PI * 2, Math.PI / 2 + 0.04, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0x1c1a1c, side: THREE.BackSide }),
    );
    // Lit windows and signs along the horizon: what wet asphalt and chrome reflect at night.
    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.5, 0.8), side: THREE.DoubleSide });
    const glow = new THREE.Group();
    for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + (i % 3) * 0.07;
        const q = new THREE.Mesh(new THREE.PlaneGeometry(3 + (i % 4), 1.4 + (i % 3) * 1.1), glowMat);
        q.position.set(Math.cos(a) * 55, 1.5 + (i % 5) * 2.6, Math.sin(a) * 55);
        q.lookAt(0, q.position.y, 0);
        glow.add(q);
    }
    skyScene.add(physical, gradient, ground, glow);

    let outdoor = null;
    let lastHour = -99;
    let lastDay = -1;
    const env = {
        room,
        get outdoor() { return outdoor?.texture || room; },
        /** Re-bakes the outdoor probe when the light has changed enough to notice. Cheap otherwise. */
        update(look) {
            const day = sky.mix;
            if (Math.abs(look.hour - lastHour) < 0.2 && Math.abs(day - lastDay) < 0.06) return false;
            lastHour = look.hour;
            lastDay = day;
            glowMat.color.setRGB(2.2, 1.5, 0.8).multiplyScalar(0.25 + (1 - day) * 1.1);
            ground.material.color.setHex(day > 0.5 ? 0x4a4642 : 0x1c1a1c);
            // The probe only adds sky-tinted fill and reflections; the hemisphere and sun do the lighting.
            const gain = sky.sky.material.uniforms.skyGain;
            const shown = gain.value;
            gain.value = shown * (0.16 + (1 - day) * 0.5);
            const prev = outdoor;
            outdoor = pmrem.fromScene(skyScene, 0, 0.5, 200);
            gain.value = shown;
            prev?.dispose();
            return true;
        },
        dispose() { outdoor?.dispose(); room.dispose(); pmrem.dispose(); },
    };
    env.size = size;
    return env;
}
