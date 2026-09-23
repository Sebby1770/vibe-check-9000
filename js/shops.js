/* Walkable 47th Street shops. Visuals only — zones.js owns the rects.
   This file is the street side (facades, name signs, awnings, door frames, barber pole, fills, cornice, Rivoli marquee);
   every walk-in room (the six shops, Dottie's, the Astoria) is built by js/interiors/.
   Signage keeps below y 6.4 (the billboard fascia boards in ads.js start at 6.9). */

import * as THREE from "three";
import { addBox, unitBox, neonCanvas, verticalNeonCanvas, zipperCanvas } from "./kit.js";
import { SHOPS } from "./zones.js";
import { barberStripes } from "./shop-art.js";
import { decorateShops } from "./shop-details.js";
import { buildInteriors } from "./interiors/index.js";
import { boxBatch } from "./interiors/batch.js";

const CORNICE_Z = 31.645; // street face of the upper cornice (y 4.8..12.4)
const FACE_Z = 31.85; // street face of the brick above each shopfront (y 2.72..4.8)
const BAND_Y = 5.6; // centre of the name-sign band on the cornice
// The Gazette ticker (city.js setRivoli) runs as the marquee's zipper.
export const RIVOLI_ZIPPER = { x: 6, y: 3.98, z: 29.388, w: 11.2, h: 0.62 };

function shopOf(id) {
    return SHOPS.find((s) => s.id === id);
}

function plane(root, tex, w, h, x, y, z, rotY = Math.PI) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    root.add(m);
    return m;
}

function facade(b, mats, s, trim) {
    const cx = (s.minX + s.maxX) / 2;
    const w = s.maxX - s.minX;
    b.box(mats.brick, cx, 6.66, FACE_Z + 0.14, w, 7.88, 0.28);
    for (const x of [s.minX + 0.15, s.maxX - 0.15]) b.box(mats.brick, x, 1.36, FACE_Z + 0.14, 0.3, 2.72, 0.28);
    b.box(mats.black, cx, 2.8, FACE_Z - 0.02, w, 0.1, 0.06);
    // Open threshold: wood jambs and head, a neon reveal around the opening.
    b.box(mats.wood, s.doorX - 1.3, 1.33, 32.05, 0.12, 2.66, 0.28);
    b.box(mats.wood, s.doorX + 1.3, 1.33, 32.05, 0.12, 2.66, 0.28);
    b.box(mats.wood, s.doorX, 2.66, 32.05, 2.72, 0.12, 0.28);
    b.box(trim, s.doorX - 1.32, 1.28, 31.9, 0.05, 2.56, 0.04);
    b.box(trim, s.doorX + 1.32, 1.28, 31.9, 0.05, 2.56, 0.04);
    b.box(trim, s.doorX, 2.57, 31.9, 2.69, 0.05, 0.04);
}

// Sloped canvas awning with a lettered valance hanging from its front edge.
function awning(root, b, mats, s, stripe, canvas, text, ink) {
    const cx = (s.minX + s.maxX) / 2;
    const aw = s.maxX - s.minX - 0.5;
    const n = Math.max(8, Math.round(aw / 0.75));
    const tilt = -Math.atan2(0.6, 1.12);
    for (let i = 0; i < n; i++) b.box(i % 2 ? canvas : stripe, cx - aw / 2 + aw * (i + 0.5) / n, 3.32, 31.28, aw / n, 0.04, 1.27, 0, tilt);
    b.box(stripe, cx, 2.84, 30.72, aw, 0.44, 0.02);
    for (const x of [cx - aw / 2, cx + aw / 2]) {
        b.box(mats.chrome, x, 3.02, 31.28, 0.03, 0.03, 1.13);
        b.box(mats.chrome, x, 3.3, 31.28, 0.025, 0.025, 1.27, 0, tilt);
    }
    if (text) {
        const vw = Math.min(aw - 0.8, 6.2);
        plane(root, zipperCanvas(text, ink, 1024, Math.round(1024 * 0.4 / vw), "#20160f", false), vw, 0.4, cx, 2.84, 30.698);
    }
}

// Enamel lightbox bolted to the cornice face, neon lettering on the front, chrome trim, neon underline.
function signBand(root, b, can, chrome, trim, text, color, x, w, h) {
    const y = BAND_Y;
    b.box(can, x, y, CORNICE_Z - 0.05, w + 0.36, h + 0.34, 0.1);
    b.box(chrome, x, y + h / 2 + 0.15, CORNICE_Z - 0.12, w + 0.4, 0.05, 0.06);
    b.box(chrome, x, y - h / 2 - 0.15, CORNICE_Z - 0.12, w + 0.4, 0.05, 0.06);
    b.box(trim, x, y - h / 2 - 0.08, CORNICE_Z - 0.13, w, 0.035, 0.035);
    return plane(root, neonCanvas(text, color, 1024, Math.round(1024 * h / w), "#0b0d10"), w, h, x, y, CORNICE_Z - 0.112);
}

// Rivoli: projecting marquee over the door (NOW SHOWING + the news zipper, chaser bulbs, lit soffit) and a vertical blade.
function rivoliFront(root, b, mats, can, rv) {
    const chase = [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: 0xfff0c8 }));
    const warm = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
    const soffit = new THREE.MeshBasicMaterial({ color: 0xf2d6a2 });
    const x0 = 0, x1 = 12, zF = 29.4, zB = 31.6, y0 = 3.45, y1 = 5.3;
    const cx = (x0 + x1) / 2, zc = (zF + zB) / 2;
    b.box(can, cx, (y0 + y1) / 2, zc, x1 - x0, y1 - y0, zB - zF);
    b.box(mats.black, cx, 4.125, 31.725, x1 - x0, 1.35, 0.25);
    b.box(mats.chrome, cx, y1 + 0.03, zF - 0.02, x1 - x0 + 0.08, 0.06, 0.06);
    b.box(mats.chrome, cx, y0 - 0.03, zF - 0.02, x1 - x0 + 0.08, 0.06, 0.06);
    b.box(mats.neonRed, cx, 4.385, zF - 0.02, x1 - x0 - 0.4, 0.03, 0.03);
    b.box(soffit, cx, y0 - 0.01, zc, x1 - x0 - 0.3, 0.02, zB - zF - 0.3);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 20; i++) b.box(warm, x0 + 0.5 + i * 0.58, y0 - 0.04, zF + 0.45 + r * 0.6, 0.06, 0.05, 0.06);
    let k = 0;
    for (let x = x0 + 0.15; x < x1; x += 0.3, k++) {
        b.box(chase[k % 3], x, y1 + 0.1, zF + 0.03, 0.08, 0.08, 0.08);
        b.box(chase[(k + 1) % 3], x, y0 - 0.1, zF + 0.03, 0.08, 0.08, 0.08);
    }
    for (const x of [x0 - 0.02, x1 + 0.02]) for (let z = zF + 0.3, j = 0; z < zB; z += 0.3, j++) b.box(chase[j % 3], x, y1 + 0.1, z, 0.08, 0.08, 0.08);
    plane(root, zipperCanvas("NOW SHOWING", "#FF6B6B", 1024, 93, "#120a0a"), 6.6, 0.6, cx, 4.78, zF - 0.012);
    const endTex = zipperCanvas("RIVOLI", "#FFE7A8", 512, 324, "#120a0a", false);
    plane(root, endTex, 1.9, 1.2, x0 - 0.012, 4.38, zc, -Math.PI / 2);
    plane(root, endTex, 1.9, 1.2, x1 + 0.012, 4.38, zc, Math.PI / 2);
    // Tie rods from the marquee's front corners back up to the cornice.
    const tilt = -Math.atan2(1.05, 2.09);
    for (const x of [x0 + 0.4, x1 - 0.4]) {
        b.box(mats.black, x, 5.825, 30.595, 0.05, 0.05, 2.34, 0, tilt);
        b.box(mats.black, x, 6.35, CORNICE_Z - 0.03, 0.22, 0.22, 0.06);
    }
    // Vertical blade at the east end of the lobby front, on two steel arms.
    const bx = rv.maxX - 1.6, by = 4.65, bz = 30.75;
    b.box(can, bx, by, bz, 0.16, 3.4, 1.4);
    b.box(mats.chrome, bx, by + 1.73, bz, 0.2, 0.06, 1.44);
    b.box(mats.chrome, bx, by - 1.73, bz, 0.2, 0.06, 1.44);
    for (let y = by - 1.6, j = 0; y <= by + 1.6; y += 0.26, j++) b.box(chase[j % 3], bx, y, bz - 0.74, 0.1, 0.08, 0.08);
    b.box(mats.black, bx, 6.1, 31.55, 0.08, 0.08, 0.2);
    b.box(mats.black, bx, 3.2, 31.65, 0.08, 0.08, 0.4);
    b.box(mats.black, bx, 6.1, CORNICE_Z - 0.02, 0.2, 0.2, 0.04);
    b.box(mats.black, bx, 3.2, FACE_Z - 0.02, 0.2, 0.2, 0.04);
    const bladeTex = verticalNeonCanvas("RIVOLI", "#FFE7A8", 256, 672, "#120a0a");
    plane(root, bladeTex, 1.2, 3.15, bx + 0.092, by, bz, Math.PI / 2);
    plane(root, bladeTex, 1.2, 3.15, bx - 0.092, by, bz, -Math.PI / 2);
    return chase;
}

// mats needs wood, cream, black, chrome, brick, neon{Red,Amber,Cyan} and glass (Dottie's pie cover).
export function buildShops(root, scene, mats) {
    const { black, brick } = mats;
    const b = boxBatch();
    const can = new THREE.MeshStandardMaterial({ color: 0x15191c, roughness: 0.5, metalness: 0.45 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xe3d3b0, roughness: 1 });
    const pink = new THREE.MeshBasicMaterial({ color: 0xff6b9a });
    const stripe = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 1 });

    // Upper commercial cornice tying the row together
    addBox(root, unitBox, brick, 1.2, 8.6, 32.22, 80, 7.6, 1.15);
    addBox(root, unitBox, black, 1.2, 12.5, 32.22, 80.6, 0.35, 1.5);

    const rows = [
        ["records", "REX'S RECORDS", "#C77DFF", 8.2, 1.2, mats.neonCyan, 0x4a3560, null, null],
        ["pharmacy", "PHARMACY", "#66FFE0", 7.6, 1.15, mats.neonCyan, 0x2f5d57, "SODA  ·  TONIC  ·  ADVICE", "#FFE7A8"],
        ["florist", "LILY'S", "#FF6B9A", 5.2, 1.05, pink, 0x8a3d56, null, null],
        ["liquor", "MIDTOWN GIN", "#E0B25A", 8.0, 1.15, mats.neonAmber, 0x2f4a36, "THE SMOOTH CENTURY", "#FFE7A8"],
        ["barber", "TONY'S", "#FF3355", 6.6, 1.1, mats.neonRed, 0x7a2230, "BARBER  ·  OPEN LATE", "#FFE7A8"],
    ];
    for (const [id, name, color, w, h, trim, stripeColor, sub, ink] of rows) {
        const s = shopOf(id);
        facade(b, mats, s, trim);
        signBand(root, b, can, mats.chrome, trim, name, color, (s.minX + s.maxX) / 2, w, h);
        awning(root, b, mats, s, stripe(stripeColor), cream, sub, ink);
    }

    /* —— RIVOLI LOBBY —— */
    const rv = shopOf("rivoli");
    facade(b, mats, rv, mats.neonAmber);
    const chase = rivoliFront(root, b, mats, can, rv);

    /* —— TONY'S BARBER pole —— */
    const pole = new THREE.Group();
    const spiral = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.4, 18), new THREE.MeshBasicMaterial({ map: barberStripes() }));
    spiral.position.y = 1.55;
    pole.add(spiral);
    addBox(pole, unitBox, mats.chrome, 0, 0.45, 0, 0.06, 0.9, 0.06);
    pole.position.set(31.05, 0, 31.55);
    root.add(pole);

    decorateShops(root, mats, b);
    for (let i = 0; i < SHOPS.length - 1; i++) {
        const a = SHOPS[i];
        const c = SHOPS[i + 1];
        const gap = c.minX - a.maxX;
        if (gap < 0.15) continue;
        const cx = (a.maxX + c.minX) / 2;
        b.box(brick, cx, 6.4, 36.05, gap + 0.18, 12.8, 8.1);
        b.box(black, cx, 12.85, 36.05, gap + 0.3, 0.28, 8.3);
    }
    b.flush(root);

    const interiors = buildInteriors({ root, scene, mats });
    const { crowds, lights, rooms } = interiors;
    return { crowds, pole, lights, film: rooms.rivoli.film, details: rooms.records, interiors, chase };
}
