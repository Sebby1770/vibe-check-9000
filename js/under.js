/* Subway under 47th. Visuals + train. zones.js owns the stairs. */

import * as THREE from "three";
import { addBox, unitBox, neonCanvas } from "./kit.js";
import { SUBWAY_Y, PLATFORM, SUB_STAIRS } from "./zones.js";
import { randomPedestrian } from "./human.js";

export function buildSubway(root, scene, mats) {
    const y = SUBWAY_Y;
    const tile = new THREE.MeshStandardMaterial({ color: 0xc4b496, roughness: 0.55, metalness: 0.08 });
    const tileDark = new THREE.MeshStandardMaterial({ color: 0x3a3428, roughness: 0.7 });
    const white = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.45 });
    const track = new THREE.MeshStandardMaterial({ color: 0x2a2a28, roughness: 0.4, metalness: 0.7 });
    const crowds = [];

    const cx = (PLATFORM.minX + PLATFORM.maxX) / 2;
    const cz = (PLATFORM.minZ + PLATFORM.maxZ) / 2;
    const w = PLATFORM.maxX - PLATFORM.minX;
    const d = PLATFORM.maxZ - PLATFORM.minZ;

    addBox(root, unitBox, tile, cx, y - 0.04, cz, w, 0.08, d);
    addBox(root, unitBox, tileDark, cx, y + 2.35, cz, w, 0.12, d);
    addBox(root, unitBox, white, cx, y + 1.15, PLATFORM.minZ + 0.08, w, 2.2, 0.08);
    addBox(root, unitBox, white, cx, y + 1.15, PLATFORM.maxZ - 0.08, w, 2.2, 0.08);
    addBox(root, unitBox, tileDark, PLATFORM.minX + 0.08, y + 1.15, cz, 0.08, 2.2, d);
    addBox(root, unitBox, tileDark, PLATFORM.maxX - 0.08, y + 1.15, cz, 0.08, 2.2, d);

    for (let i = 0; i < 12; i++) {
        const x = PLATFORM.minX + 2.2 + i * 3.2;
        addBox(root, unitBox, white, x, y + 1.6, PLATFORM.minZ + 0.12, 1.4, 0.9, 0.04);
        addBox(root, unitBox, mats.neonAmber, x, y + 2.05, cz, 0.12, 0.08, d - 0.6);
    }

    addBox(root, unitBox, track, cx, y - 0.55, 30.45, w - 1.2, 0.2, 1.35);
    addBox(root, unitBox, mats.chrome, cx, y - 0.42, 30.05, w - 1.2, 0.04, 0.08);
    addBox(root, unitBox, mats.chrome, cx, y - 0.42, 30.85, w - 1.2, 0.04, 0.08);

    const steps = 10;
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const z = SUB_STAIRS.zStreet + t * (SUB_STAIRS.zPlat - SUB_STAIRS.zStreet);
        const yy = t * y;
        addBox(root, unitBox, tileDark, -22.4, yy + 0.04, z, 2.2, 0.08, 0.32);
        addBox(root, unitBox, mats.chrome, -23.35, yy + 0.45, z, 0.05, 0.85, 0.05);
        addBox(root, unitBox, mats.chrome, -21.45, yy + 0.45, z, 0.05, 0.85, 0.05);
    }

    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x1a4a32, roughness: 0.55 }), -22.4, 1.55, 28.85, 3.15, 0.18, 2.0);
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x1a4a32, roughness: 0.55 }), -23.85, 1.2, 28.6, 0.18, 2.4, 2.15);
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x1a4a32, roughness: 0.55 }), -20.95, 1.2, 28.6, 0.18, 2.4, 2.15);
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x1a4a32, roughness: 0.55 }), -22.4, 1.2, 29.75, 3.15, 2.4, 0.18);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(3.1, 0.55),
        new THREE.MeshBasicMaterial({ map: neonCanvas("SUBWAY  ·  12:04", "#39FF14", 512, 128, "#051005") }),
    );
    sign.position.set(-22.4, 2.45, 29.86);
    root.add(sign);

    addBox(root, unitBox, mats.wood, -8.4, y + 0.55, 28.15, 2.4, 1.1, 1.1);
    addBox(root, unitBox, mats.cream, -8.4, y + 1.12, 28.15, 2.2, 0.06, 0.95);
    addBox(root, unitBox, mats.neonAmber, -8.4, y + 1.7, 28.7, 1.6, 0.35, 0.04);

    const lamp = new THREE.PointLight(0xffc078, 28, 16, 2);
    lamp.position.set(cx, y + 2.1, 28.4);
    scene.add(lamp);
    const lamp2 = new THREE.PointLight(0xffb070, 16, 12, 2);
    lamp2.position.set(-28, y + 2.1, 28.4);
    scene.add(lamp2);

    const train = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color: 0xc45c28, roughness: 0.4, metalness: 0.25 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.5 });
    for (let c = 0; c < 3; c++) {
        const car = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.4, 2.2), paint);
        car.position.set(c * 7.6 - 7.6, 0.4, 0);
        train.add(car);
        for (const wz of [-0.7, 0.7]) {
            for (let w = -2; w <= 2; w++) {
                const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.06), new THREE.MeshBasicMaterial({ color: 0xffe7a8 }));
                win.position.set(c * 7.6 - 7.6 + w * 1.15, 0.55, wz * 1.12);
                train.add(win);
            }
        }
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(7.25, 0.12, 2.22), new THREE.MeshBasicMaterial({ color: 0x1a4a32 }));
        stripe.position.set(c * 7.6 - 7.6, -0.5, 0);
        train.add(stripe);
    }
    train.position.set(-40, y + 1.15, 30.45);
    scene.add(train);

    function place(h, x, z, yaw, mode) {
        h.position.set(x, y, z);
        h.rotation.y = yaw;
        h.userData.mode = mode;
        if (mode === "sit") h.userData.sitHips = 0.5;
        scene.add(h);
        crowds.push(h);
    }
    place(randomPedestrian(0.22, { outfit: "lady", anim: "sit" }), -14.2, 27.7, 0, "sit");
    place(randomPedestrian(0.48, { outfit: "salesman", anim: "idle" }), -4.2, 27.9, 0.3, "idle");
    place(randomPedestrian(0.71, { outfit: "hood", anim: "lean" }), 1.4, 28.3, -1.2, "lean");
    place(randomPedestrian(0.11, { outfit: "clerk", anim: "idle" }), -26.5, 28.0, 0.5, "idle");

    return { train, crowds, lamp };
}

export function updateSubway(under, dt) {
    if (!under?.train) return;
    under.train.position.x += dt * 16;
    if (under.train.position.x > 48) under.train.position.x = -52;
}
