/* Walkable 47th Street shops. Visuals only — zones.js owns the rects.
   This file is the street side (facades, name signs, awnings, door frames, barber pole, fills, cornice);
   every walk-in room (the six shops, Dottie's, the Astoria) is built by js/interiors/. */

import * as THREE from "three";
import { addBox, unitBox } from "./kit.js";
import { SHOPS } from "./zones.js";
import { barberStripes, printedCard } from "./shop-art.js";
import { decorateShops } from "./shop-details.js";
import { buildInteriors } from "./interiors/index.js";

function shopOf(id) {
    return SHOPS.find((s) => s.id === id);
}

function facade(root, mats, s, color) {
    const z = s.minZ + 0.02;
    addBox(root, unitBox, mats.brick, (s.minX + s.maxX) / 2, 6.4, z - 0.08, s.maxX - s.minX, 8.4, 0.28);
    addBox(root, unitBox, mats.black, (s.minX + s.maxX) / 2, 2.55, z + 0.02, s.maxX - s.minX - 0.4, 0.08, 0.18);
    addBox(root, unitBox, color, (s.minX + s.maxX) / 2, 3.55, z + 0.16, Math.min(8.4, s.maxX - s.minX - 1.2), 0.12, 1.8);
    // A recessed, genuinely open threshold; the windows sit on either side.
    const canvas = new THREE.MeshStandardMaterial({color:0xd9c8a7,roughness:1});
    const stripe = new THREE.MeshStandardMaterial({color:0x354f48,roughness:1});
    const width=s.maxX-s.minX-.25;
    for(let i=0;i<12;i++)addBox(root,unitBox,i%2?canvas:stripe,s.minX+.13+width*(i+.5)/12,3.2,z-.6,width/12,.14,1.2);
    addBox(root,unitBox,mats.wood,s.doorX-1.3,1.3,z+.06,.12,2.6,.28);
    addBox(root,unitBox,mats.wood,s.doorX+1.3,1.3,z+.06,.12,2.6,.28);
    addBox(root, unitBox, color, s.doorX - 1.32, 1.25, z - 0.12, 0.08, 2.5, 0.1);
    addBox(root, unitBox, color, s.doorX + 1.32, 1.25, z - 0.12, 0.08, 2.5, 0.1);
    addBox(root, unitBox, color, s.doorX, 2.52, z - 0.12, 2.72, 0.08, 0.1);
}

function sign(root, text, color, x, y, z, w = 6.4, h = 1.15) {
    const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: printedCard([text], {ink:color,paper:"#17262b",width:1024,height:256}) }),
    );
    m.position.set(x, y, z);
    m.rotation.y = Math.PI;
    root.add(m);
    return m;
}

// mats needs wood, cream, black, chrome, brick, neon{Red,Amber,Cyan} and glass (Dottie's pie cover).
export function buildShops(root, scene, mats) {
    const black = mats.black;
    const chrome = mats.chrome;
    const brick = mats.brick;

    // Upper commercial cornice tying the row together
    addBox(root, unitBox, brick, 1.2, 8.6, 32.22, 80, 7.6, 1.15);
    addBox(root, unitBox, black, 1.2, 12.5, 32.22, 80.6, 0.35, 1.5);

    /* —— REX'S RECORDS —— */
    const rec = shopOf("records");
    facade(root, mats, rec, mats.neonCyan);
    sign(root, "REX'S RECORDS", "#C77DFF", -33.2, 4.55, rec.minZ - 0.22, 8.2, 1.2);

    /* —— 47TH PHARMACY —— */
    const ph = shopOf("pharmacy");
    facade(root, mats, ph, mats.neonCyan);
    sign(root, "PHARMACY", "#66FFE0", -21.8, 4.6, ph.minZ - 0.22, 7.6, 1.15);
    sign(root, "SODA  ·  TONIC  ·  ADVICE", "#FFE7A8", -21.8, 3.7, ph.minZ - 0.18, 7.2, 0.55);

    /* —— LILY'S —— */
    const fl = shopOf("florist");
    facade(root, mats, fl, new THREE.MeshBasicMaterial({ color: 0xff6b9a }));
    sign(root, "LILY'S", "#FF6B9A", -12.2, 4.5, fl.minZ - 0.22, 5.4, 1.05);

    /* —— RIVOLI LOBBY —— */
    const rv = shopOf("rivoli");
    facade(root, mats, rv, mats.neonAmber);
    sign(root, "RIVOLI", "#FFE7A8", 6.0, 5.15, rv.minZ - 0.24, 11.5, 1.5);
    sign(root, "NOW SHOWING", "#FF6B6B", 6.0, 3.85, rv.minZ - 0.2, 9.2, 0.7);

    /* —— MIDTOWN GIN —— */
    const gq = shopOf("liquor");
    facade(root, mats, gq, mats.neonAmber);
    sign(root, "MIDTOWN GIN", "#E0B25A", 24.6, 4.55, gq.minZ - 0.22, 8.0, 1.15);
    sign(root, "THE SMOOTH CENTURY", "#FFE7A8", 24.6, 3.7, gq.minZ - 0.18, 7.4, 0.5);

    /* —— TONY'S BARBER —— */
    const br = shopOf("barber");
    facade(root, mats, br, mats.neonRed);
    const pole = new THREE.Group();
    const spiral=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,1.4,18),new THREE.MeshBasicMaterial({map:barberStripes()}));spiral.position.y=1.55;pole.add(spiral);
    addBox(pole, unitBox, chrome, 0, 0.45, 0, 0.06, 0.9, 0.06);
    pole.position.set(31.05, 0, 31.55);
    root.add(pole);
    sign(root, "TONY'S", "#FF3355", 35.9, 4.5, br.minZ - 0.22, 6.6, 1.1);
    sign(root, "BARBER  ·  OPEN LATE", "#FFE7A8", 35.9, 3.7, br.minZ - 0.18, 6.4, 0.5);

    decorateShops(root, mats);
    for (let i = 0; i < SHOPS.length - 1; i++) {
        const a = SHOPS[i];
        const b = SHOPS[i + 1];
        const gap = b.minX - a.maxX;
        if (gap < 0.15) continue;
        const cx = (a.maxX + b.minX) / 2;
        addBox(root, unitBox, brick, cx, 6.4, 36.05, gap + 0.18, 12.8, 8.1);
        addBox(root, unitBox, black, cx, 12.85, 36.05, gap + 0.3, 0.28, 8.3);
    }

    const interiors = buildInteriors({ root, scene, mats });
    const { crowds, lights, rooms } = interiors;
    return { crowds, pole, lights, film: rooms.rivoli.film, details: rooms.records, interiors };
}
