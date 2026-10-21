/* Driving: get into any parked car (F), arcade handling with speed-sensitive steering, collisions against the
   city's colliders and traffic, a chase camera (Q swaps to the driver's seat), horn (H), headlight beams after
   dark, and you step out (F) on the kerb side that's clear. */
import * as THREE from "three";
import { buildVehicle, animateVehicle } from "./models.js";

const _fwd = new THREE.Vector3(), _cam = new THREE.Vector3(), _look = new THREE.Vector3();

// Extra parked cars for the open city: [x, z, yaw, kind, colour].
const PARKED = [
    [-160, 18.75, 0, "sedan", 0x3a5a7a], [-205, 27.1, Math.PI, "checker"], [-300, 18.75, 0, "limo"], [-330, 27.1, Math.PI, "sedan", 0x7a6a4a],
    [-240, 91.8, 0, "sedan", 0x5a2a2a], [24, 145.6, 0, "sedan", 0x2a4a3a], [140, 154.4, Math.PI, "checker"], [228, 18.75, 0, "van", 0x4a4a52],
    [252, -60, Math.PI / 2, "sedan", 0x6a6a72], [255, 60, -Math.PI / 2, "van", 0x2f4a3a], [44, -106, 0, "sedan", 0x8a7a5a], [-60, -165.8, Math.PI, "checker"],
    [-120, -114.2, 0, "police"], [150, -174.2, Math.PI, "sedan", 0x2a3a5a],
];

export function createDriving({ scene, camera, colliders, city, audio, hud, avenues = null }) {
    const cars = [...(city.parked || [])];
    for (const [x, z, yaw, kind, color] of PARKED) {
        const car = buildVehicle(kind, { color, driver: false, seed: Math.round(Math.abs(x)) });
        car.position.set(x, 0, z);
        car.rotation.y = yaw;
        scene.add(car);
        cars.push(car);
    }
    // Every parked car is solid to a pedestrian: one collider each, moved with the car when you drive it.
    for (const car of cars) {
        const spec = car.userData.spec || { length: 4.9, width: 1.85 };
        let box = colliders.boxes.find((b) => b.maxY > 1 && b.maxY < 2.6 && car.position.x > b.minX && car.position.x < b.maxX && car.position.z > b.minZ && car.position.z < b.maxZ);
        if (!box) { box = { minX: 0, maxX: 0, minZ: 0, maxZ: 0, minY: -1, maxY: 1.95 }; colliders.boxes.push(box); }
        car.userData.collider = box;
        placeCollider(car, spec);
    }

    const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff2c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const beams = new THREE.Group();
    for (const z of [-0.62, 0.62]) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 14, 16, 1, true), beamMat);
        cone.rotation.z = Math.PI / 2;
        cone.position.set(9.4, 0.8, z);
        cone.userData.noShadow = true;
        beams.add(cone);
    }
    const pool = new THREE.Mesh(new THREE.CircleGeometry(4, 24), beamMat);
    pool.rotation.x = -Math.PI / 2;
    pool.scale.set(2.2, 1, 1);
    pool.position.set(9, 0.06, 0);
    beams.add(pool);

    let car = null, lastCar = null, speed = 0, steer = 0, firstPerson = false, hornCool = 0;
    const keys = {};
    const camPos = new THREE.Vector3();
    window.addEventListener("keydown", (e) => {
        if (!car) return;
        const k = e.key.toLowerCase();
        keys[k] = true;
        if (k === "q" && !e.repeat) firstPerson = !firstPerson;
        if (k === "h" && hornCool <= 0) { audio.horn(); hornCool = 0.6; }
        if ([" ", "w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
    window.addEventListener("blur", () => { for (const k of Object.keys(keys)) keys[k] = false; });

    function placeCollider(c, spec = c.userData.spec) {
        const box = c.userData.collider;
        if (!box) return;
        const cos = Math.abs(Math.cos(c.rotation.y)), sin = Math.abs(Math.sin(c.rotation.y));
        const hx = (spec.length / 2) * cos + (spec.width / 2) * sin, hz = (spec.length / 2) * sin + (spec.width / 2) * cos;
        Object.assign(box, { minX: c.position.x - hx, maxX: c.position.x + hx, minZ: c.position.z - hz, maxZ: c.position.z + hz, minY: -1, maxY: 1.95 });
    }
    function blocked(x, z, yaw, spec) {
        const half = spec.length / 2 - 0.9, cx = Math.cos(yaw), cz = -Math.sin(yaw);
        for (const k of [-1, 0, 1]) {
            const px = x + cx * half * k, pz = z + cz * half * k, r = spec.width / 2 + 0.05;
            for (const b of colliders.boxes) {
                if (b === car.userData.collider || b.maxY < 0.45 || b.minY > 1.3) continue;
                if (px + r > b.minX && px - r < b.maxX && pz + r > b.minZ && pz - r < b.maxZ) return true;
            }
            const B = colliders.bounds;
            if (px < B.minX || px > B.maxX || pz < B.minZ || pz > B.maxZ) return true;
            for (const t of city.traffic) if (Math.abs(t.position.x - px) < (t.userData.spec?.length || 5) / 2 + 0.7 && Math.abs(t.position.z - pz) < 1.9) return true;
            if (avenues?.blocks(px, pz, r)) return true;
        }
        return false;
    }

    return {
        get active() { return !!car; },
        get car() { return car; },
        /** The car you last got out of, wherever you left it (traffic treats it as solid). */
        get lastCar() { return lastCar; },
        get speed() { return speed; },
        /** The nearest parked car within reach of a pedestrian, if any. */
        nearest(p, reach = 3.4) {
            let best = null, bd = reach;
            for (const c of cars) {
                if (!c.visible) continue;
                const d = Math.hypot(c.position.x - p.x, c.position.z - p.z) - (c.userData.spec?.length || 5) * 0.32;
                if (d < bd) { bd = d; best = c; }
            }
            return best;
        },
        enter(c) {
            car = c;
            speed = 0;
            steer = 0;
            const box = c.userData.collider;
            if (box) { box.minY = -5; box.maxY = -4; } // out of the way while it's moving
            car.add(beams);
            camPos.copy(camera.position);
            hud.toast(`${(c.userData.kind || "car").toUpperCase()} · W/S DRIVE · A/D STEER · SPACE BRAKE · Q VIEW · H HORN · F GET OUT`, "#f2a541");
            document.body.classList.add("driving");
        },
        /** Steps out on whichever kerb side is clear. Returns {x, z, lookX, lookZ}. */
        exit() {
            if (!car) return null;
            const c = car, spec = c.userData.spec;
            const right = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), c.rotation.y);
            let spot = null;
            for (const side of [-1, 1, -1.6, 1.6]) {
                const x = c.position.x + right.x * side * (spec.width / 2 + 1), z = c.position.z + right.z * side * (spec.width / 2 + 1);
                if (!colliders.boxes.some((b) => b.minY < 1.7 && b.maxY > 1.7 && x > b.minX - 0.3 && x < b.maxX + 0.3 && z > b.minZ - 0.3 && z < b.maxZ + 0.3)) { spot = { x, z }; break; }
            }
            spot ||= { x: c.position.x, z: c.position.z + 3 };
            c.remove(beams);
            placeCollider(c);
            lastCar = c;
            animateVehicle(c, 0, { braking: false });
            car = null;
            document.body.classList.remove("driving");
            return { ...spot, lookX: c.position.x, lookZ: c.position.z };
        },
        update(dt, { stick = { x: 0, y: 0 }, night = 0 } = {}) {
            if (!car) return;
            hornCool -= dt;
            const spec = car.userData.spec;
            const throttle = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0) - stick.y;
            const turn = (keys.a || keys.arrowleft ? 1 : 0) - (keys.d || keys.arrowright ? 1 : 0) - stick.x;
            const handbrake = !!keys[" "];
            // Engine, brakes, rolling resistance and drag.
            if (throttle > 0) speed += (speed < 0 ? 16 : 7.5 * (1 - speed / 26)) * throttle * dt;
            else if (throttle < 0) speed += (speed > 0 ? -16 : -5 * (1 + speed / 7)) * -throttle * dt;
            else speed -= Math.sign(speed) * Math.min(Math.abs(speed), (2 + Math.abs(speed) * 0.08) * dt);
            if (handbrake) speed -= Math.sign(speed) * Math.min(Math.abs(speed), 20 * dt);
            speed = Math.max(-7, Math.min(26, speed));
            const lock = 0.55 / (1 + Math.abs(speed) * 0.06);
            steer += (turn * lock - steer) * Math.min(1, dt * 7);
            const yawRate = (speed / spec.wheelbase) * Math.tan(steer) * (handbrake ? 1.35 : 1);
            const yaw = car.rotation.y + yawRate * dt;
            _fwd.set(Math.cos(yaw), 0, -Math.sin(yaw));
            const nx = car.position.x + _fwd.x * speed * dt, nz = car.position.z + _fwd.z * speed * dt;
            if (!blocked(nx, nz, yaw, spec)) { car.position.x = nx; car.position.z = nz; car.rotation.y = yaw; }
            else if (!blocked(car.position.x, car.position.z, yaw, spec)) { car.rotation.y = yaw; speed *= -0.25; }
            else { speed *= -0.3; if (Math.abs(speed) > 4) audio.horn?.(); }
            animateVehicle(car, speed * dt, { steer: steer * 1.4, braking: throttle < 0 && speed > 0.5 || handbrake });
            beamMat.opacity = night * 0.16;
            beams.visible = night > 0.1;
            // Cameras.
            _fwd.set(Math.cos(car.rotation.y), 0, -Math.sin(car.rotation.y));
            if (firstPerson) {
                _cam.copy(spec.driverSeat).applyAxisAngle(THREE.Object3D.DEFAULT_UP, car.rotation.y).add(car.position);
                camera.position.copy(_cam);
                _look.copy(_cam).addScaledVector(_fwd, 10);
                _look.y -= 0.5;
            } else {
                const back = 6.2 + Math.abs(speed) * 0.12;
                _cam.copy(car.position).addScaledVector(_fwd, -back);
                _cam.y = 2.5 + Math.abs(speed) * 0.03;
                camPos.lerp(_cam, 1 - Math.exp(-dt * 6));
                camera.position.copy(camPos);
                _look.copy(car.position).addScaledVector(_fwd, 4);
                _look.y = 1.1;
            }
            camera.lookAt(_look);
        },
    };
}
