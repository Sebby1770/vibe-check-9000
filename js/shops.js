/* Walkable 47th Street shops. Visuals only — zones.js owns the rects. */

import * as THREE from "three";
import { addBox, unitBox, neonCanvas } from "./kit.js";
import { SHOPS } from "./zones.js";
import { randomPedestrian, randomLounge } from "./human.js";

const _dummy = new THREE.Object3D();

function shopOf(id) {
    return SHOPS.find((s) => s.id === id);
}

function facade(root, mats, s, color) {
    const z = s.minZ + 0.02;
    addBox(root, unitBox, mats.brick, (s.minX + s.maxX) / 2, 6.4, z - 0.08, s.maxX - s.minX, 8.4, 0.28);
    addBox(root, unitBox, mats.black, (s.minX + s.maxX) / 2, 2.55, z + 0.02, s.maxX - s.minX - 0.4, 0.08, 0.18);
    addBox(root, unitBox, color, (s.minX + s.maxX) / 2, 3.55, z + 0.16, Math.min(8.4, s.maxX - s.minX - 1.2), 0.12, 1.8);
    addBox(root, unitBox, mats.black, s.doorX, 1.25, z + 0.06, 2.55, 2.5, 0.08);
    addBox(root, unitBox, color, s.doorX - 1.32, 1.25, z - 0.12, 0.08, 2.5, 0.1);
    addBox(root, unitBox, color, s.doorX + 1.32, 1.25, z - 0.12, 0.08, 2.5, 0.1);
    addBox(root, unitBox, color, s.doorX, 2.52, z - 0.12, 2.72, 0.08, 0.1);
}

function sign(root, text, color, x, y, z, w = 6.4, h = 1.15) {
    const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: neonCanvas(text, color, 1024, 256, "#08060a") }),
    );
    m.position.set(x, y, z);
    root.add(m);
    return m;
}

function place(h, x, z, yaw, mode, extra = {}) {
    h.position.set(x, 0, z);
    h.rotation.y = yaw;
    h.userData.mode = mode;
    if (extra.sitHips != null) h.userData.sitHips = extra.sitHips;
    if (extra.danceStyle != null) h.userData.danceStyle = extra.danceStyle;
    return h;
}

export function buildShops(root, scene, mats) {
    const crowds = [];
    const lights = [];

    const wood = mats.wood;
    const cream = mats.cream;
    const black = mats.black;
    const chrome = mats.chrome;
    const brick = mats.brick;
    const velvet = new THREE.MeshStandardMaterial({ color: 0x5a1020, roughness: 0.85 });
    const marble = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.32, metalness: 0.18 });
    const green = new THREE.MeshStandardMaterial({ color: 0x1a4a32, roughness: 0.55, metalness: 0.2 });
    const check = new THREE.MeshStandardMaterial({ color: 0xf2eee0, roughness: 0.7 });
    const bottleG = new THREE.CylinderGeometry(0.05, 0.045, 0.22, 8);
    const bottleColors = [0xc9a227, 0x2a6a48, 0x8b1e1e, 0x1a3a6a, 0xe8dcc8];

    function lamp(x, z, color, intens = 22) {
        const l = new THREE.PointLight(color, intens, 11, 2);
        l.position.set(x, 2.6, z);
        scene.add(l);
        lights.push(l);
        return l;
    }

    // Upper commercial cornice tying the row together
    addBox(root, unitBox, brick, 1.2, 8.6, 32.22, 80, 7.6, 1.15);
    addBox(root, unitBox, black, 1.2, 12.5, 32.22, 80.6, 0.35, 1.5);

    /* —— REX'S RECORDS —— */
    const rec = shopOf("records");
    facade(root, mats, rec, mats.neonCyan);
    addBox(root, unitBox, wood, -33.2, 0.02, 36.0, 9.6, 0.04, 7.6);
    addBox(root, unitBox, black, -33.2, 3.85, 36.0, 9.6, 0.08, 7.6);
    for (const x of [-36.6, -30.0]) {
        for (let i = 0; i < 4; i++) {
            addBox(root, unitBox, wood, x, 0.42, 33.6 + i * 0.85, 1.15, 0.55, 0.7);
            addBox(root, unitBox, cream, x, 0.62, 33.6 + i * 0.85, 1.05, 0.08, 0.6);
        }
    }
    addBox(root, unitBox, wood, -33.2, 0.55, 38.35, 8.2, 1.1, 1.5);
    addBox(root, unitBox, cream, -33.2, 1.12, 38.35, 8.0, 0.06, 1.35);
    addBox(root, unitBox, mats.neonCyan, -33.2, 2.15, 39.55, 4.4, 0.7, 0.04);
    sign(root, "REX'S RECORDS", "#C77DFF", -33.2, 4.55, rec.minZ - 0.22, 8.2, 1.2);
    lamp(-33.2, 35.4, 0xaa66ff, 26);
    crowds.push(place(randomPedestrian(0.21, { outfit: "raver", anim: "idle" }), -36.4, 34.1, 0.4, "idle"));
    crowds.push(place(randomPedestrian(0.44, { outfit: "host", anim: "lean" }), -30.2, 35.0, -1.2, "lean"));
    const listen = place(randomPedestrian(0.62, { outfit: "dj", anim: "sit" }), -36.55, 36.4, Math.PI / 2, "sit", { sitHips: 0.52 });
    crowds.push(listen);

    /* —— 47TH PHARMACY —— */
    const ph = shopOf("pharmacy");
    facade(root, mats, ph, mats.neonCyan);
    addBox(root, unitBox, cream, -21.8, 0.02, 36.0, 9.6, 0.04, 7.6);
    addBox(root, unitBox, green, -21.8, 0.55, 38.3, 8.4, 1.1, 1.5);
    addBox(root, unitBox, marble, -21.8, 1.14, 38.3, 8.2, 0.08, 1.35);
    for (const x of [-25.4, -18.2]) {
        addBox(root, unitBox, cream, x, 1.35, 35.8, 0.22, 2.4, 4.8);
        for (let i = 0; i < 5; i++) addBox(root, unitBox, green, x, 0.55 + i * 0.42, 35.8, 0.18, 0.05, 4.6);
    }
    addBox(root, unitBox, chrome, -24.2, 0.55, 33.6, 1.6, 1.1, 0.7);
    addBox(root, unitBox, mats.neonCyan, -21.8, 2.4, 39.55, 3.2, 0.55, 0.04);
    sign(root, "PHARMACY", "#66FFE0", -21.8, 4.6, ph.minZ - 0.22, 7.6, 1.15);
    sign(root, "SODA  ·  TONIC  ·  ADVICE", "#FFE7A8", -21.8, 3.7, ph.minZ - 0.18, 7.2, 0.55);
    lamp(-21.8, 35.2, 0x88ffe0, 24);
    crowds.push(place(randomPedestrian(0.31, { outfit: "lady", anim: "idle" }), -24.6, 34.0, 0.2, "idle"));
    crowds.push(place(randomPedestrian(0.73, { outfit: "salesman", anim: "lean" }), -18.9, 35.6, -1.6, "lean"));

    /* —— LILY'S —— */
    const fl = shopOf("florist");
    facade(root, mats, fl, new THREE.MeshBasicMaterial({ color: 0xff6b9a }));
    addBox(root, unitBox, cream, -12.2, 0.02, 36.0, 6.0, 0.04, 7.6);
    addBox(root, unitBox, wood, -12.2, 0.48, 38.3, 4.8, 0.7, 1.2);
    for (const [x, z, c] of [[-13.8, 33.8, 0xc45c6a], [-11.0, 34.2, 0xe0b25a], [-13.1, 35.6, 0x39a868], [-10.6, 36.1, 0xff6b9a]]) {
        addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: c, roughness: 0.55 }), x, 0.55, z, 0.55, 0.7, 0.55);
        addBox(root, unitBox, new THREE.MeshBasicMaterial({ color: c }), x, 0.95, z, 0.18, 0.35, 0.18);
    }
    sign(root, "LILY'S", "#FF6B9A", -12.2, 4.5, fl.minZ - 0.22, 5.4, 1.05);
    lamp(-12.2, 35.4, 0xff88aa, 20);
    crowds.push(place(randomLounge(0.18, { anim: "idle" }), -10.8, 34.6, -0.5, "idle"));

    /* —— RIVOLI LOBBY —— */
    const rv = shopOf("rivoli");
    facade(root, mats, rv, mats.neonAmber);
    addBox(root, unitBox, velvet, 5.1, 0.03, 36.0, 25.6, 0.05, 7.6);
    addBox(root, unitBox, wood, 6.0, 0.7, 37.85, 4.8, 1.4, 2.0);
    addBox(root, unitBox, marble, 6.0, 1.42, 37.85, 4.6, 0.08, 1.85);
    addBox(root, unitBox, mats.neonAmber, 6.0, 2.35, 38.8, 3.6, 0.5, 0.04);
    for (const x of [-5.2, 1.2, 11.2, 15.6]) {
        addBox(root, unitBox, velvet, x, 0.42, 34.4, 1.8, 0.18, 0.7);
        addBox(root, unitBox, velvet, x, 0.72, 34.7, 1.8, 0.48, 0.16);
    }
    for (const x of [-4, 16]) {
        addBox(root, unitBox, black, x, 1.7, 39.55, 1.6, 2.2, 0.06);
        addBox(root, unitBox, mats.neonAmber, x, 1.7, 39.5, 1.4, 2.0, 0.04);
    }
    const filmCanvas = document.createElement("canvas");
    filmCanvas.width = 512;
    filmCanvas.height = 256;
    const filmTex = new THREE.CanvasTexture(filmCanvas);
    filmTex.colorSpace = THREE.SRGBColorSpace;
    const film = new THREE.Mesh(
        new THREE.PlaneGeometry(9.2, 3.6),
        new THREE.MeshBasicMaterial({ map: filmTex }),
    );
    film.position.set(6.0, 2.15, 39.62);
    root.add(film);
    const titles = ["NEON IN THE RAIN", "THE MIDNIGHT VISOR", "ALLEY CATS OF 47TH"];
    film.userData.draw = (t) => {
        const g = filmCanvas.getContext("2d");
        g.fillStyle = "#120810";
        g.fillRect(0, 0, 512, 256);
        const flick = 0.55 + Math.sin(t * 17) * 0.12 + Math.random() * 0.08;
        g.fillStyle = `rgba(255, 200, 140, ${flick * 0.35})`;
        g.fillRect(24, 18, 464, 220);
        for (let i = 0; i < 40; i++) {
            g.fillStyle = `rgba(255,255,255,${Math.random() * 0.2})`;
            g.fillRect(Math.random() * 512, Math.random() * 256, 2, 2);
        }
        g.fillStyle = "#ffe7a8";
        g.font = "700 28px Georgia, serif";
        g.textAlign = "center";
        g.fillText(titles[Math.floor(t / 8) % titles.length], 256, 130);
        g.font = "16px Georgia, serif";
        g.fillStyle = "rgba(255,231,168,0.7)";
        g.fillText("A PICTURE THAT REFUSES THE DECADE", 256, 168);
        filmTex.needsUpdate = true;
    };
    addBox(root, unitBox, chrome, 6.0, 3.6, 36.0, 0.08, 0.5, 0.08);
    addBox(root, unitBox, mats.neonAmber, 6.0, 3.25, 36.0, 1.4, 0.12, 1.4);
    sign(root, "RIVOLI", "#FFE7A8", 6.0, 5.15, rv.minZ - 0.24, 11.5, 1.5);
    sign(root, "NOW SHOWING", "#FF6B6B", 6.0, 3.85, rv.minZ - 0.2, 9.2, 0.7);
    lamp(6.0, 35.0, 0xffc078, 32);
    lamp(14.0, 35.5, 0xffb070, 18);
    crowds.push(place(randomLounge(0.27, { anim: "sit" }), -5.2, 34.35, 0, "sit", { sitHips: 0.48 }));
    crowds.push(place(randomLounge(0.51, { anim: "sit" }), 11.2, 34.35, 0, "sit", { sitHips: 0.48 }));
    crowds.push(place(randomPedestrian(0.39, { outfit: "lady", anim: "idle" }), 15.4, 35.2, -0.4, "idle"));
    crowds.push(place(randomPedestrian(0.81, { outfit: "salesman", anim: "lean" }), 1.4, 33.6, 0.3, "lean"));

    /* —— MIDTOWN GIN —— */
    const gq = shopOf("liquor");
    facade(root, mats, gq, mats.neonAmber);
    addBox(root, unitBox, wood, 24.6, 0.02, 36.0, 9.6, 0.04, 7.6);
    addBox(root, unitBox, wood, 24.6, 0.55, 38.3, 8.4, 1.1, 1.5);
    addBox(root, unitBox, marble, 24.6, 1.14, 38.3, 8.2, 0.08, 1.35);
    for (const x of [21.2, 28.0]) {
        addBox(root, unitBox, wood, x, 1.4, 35.8, 0.22, 2.5, 4.8);
        for (let i = 0; i < 12; i++) {
            const b = new THREE.Mesh(bottleG, new THREE.MeshStandardMaterial({
                color: bottleColors[i % bottleColors.length], roughness: 0.25, metalness: 0.4,
            }));
            b.position.set(x, 0.45 + (i % 6) * 0.38, 33.8 + Math.floor(i / 6) * 2.2);
            root.add(b);
        }
    }
    sign(root, "MIDTOWN GIN", "#E0B25A", 24.6, 4.55, gq.minZ - 0.22, 8.0, 1.15);
    sign(root, "THE SMOOTH CENTURY", "#FFE7A8", 24.6, 3.7, gq.minZ - 0.18, 7.4, 0.5);
    lamp(24.6, 35.3, 0xffb25a, 24);
    crowds.push(place(randomPedestrian(0.47, { outfit: "hood", anim: "lean" }), 21.8, 34.2, 0.8, "lean"));
    crowds.push(place(randomLounge(0.66, { anim: "idle" }), 27.4, 35.5, -2.2, "idle"));

    /* —— TONY'S BARBER —— */
    const br = shopOf("barber");
    facade(root, mats, br, mats.neonRed);
    addBox(root, unitBox, check, 35.9, 0.02, 36.0, 9.0, 0.04, 7.6);
    addBox(root, unitBox, black, 35.9, 0.025, 36.0, 9.0, 0.041, 7.6 * 0.08);
    addBox(root, unitBox, wood, 35.9, 0.7, 37.85, 7.6, 1.15, 0.7);
    addBox(root, unitBox, chrome, 35.9, 1.6, 39.45, 6.4, 1.6, 0.06);
    for (const x of [34.15, 37.0]) {
        addBox(root, unitBox, chrome, x, 0.28, 35.55, 0.7, 0.12, 0.7);
        addBox(root, unitBox, velvet, x, 0.55, 35.55, 0.62, 0.42, 0.62);
        addBox(root, unitBox, velvet, x, 0.95, 35.85, 0.62, 0.55, 0.16);
    }
    const pole = new THREE.Group();
    for (let i = 0; i < 8; i++) {
        const ring = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.09, 0.16, 10),
            new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff3355 : 0xf2eee0 }),
        );
        ring.position.y = 0.9 + i * 0.16;
        pole.add(ring);
    }
    addBox(pole, unitBox, chrome, 0, 0.45, 0, 0.06, 0.9, 0.06);
    pole.position.set(31.05, 0, 31.55);
    root.add(pole);
    sign(root, "TONY'S", "#FF3355", 35.9, 4.5, br.minZ - 0.22, 6.6, 1.1);
    sign(root, "BARBER  ·  OPEN LATE", "#FFE7A8", 35.9, 3.7, br.minZ - 0.18, 6.4, 0.5);
    lamp(35.9, 35.2, 0xffe7a8, 22);
    crowds.push(place(randomPedestrian(0.58, { outfit: "salesman", anim: "sit" }), 37.0, 35.55, Math.PI, "sit", { sitHips: 0.55 }));
    crowds.push(place(randomPedestrian(0.14, { outfit: "clerk", anim: "idle" }), 33.4, 33.8, 0.5, "idle"));

    crowds.forEach((h) => scene.add(h));

    return { crowds, pole, lights, film };
}
