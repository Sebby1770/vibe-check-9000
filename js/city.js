import * as THREE from "three";
import { addBox, unitBox, neonCanvas, marqueeCanvas, verticalNeonCanvas, zipperCanvas } from "./kit.js";
import { brickTex, darkBrickTex, asphaltTex, sidewalkTex, plasterTex, woodTex, checkerTex, gazetteTex, windowPaneTex, stoneTex } from "./textures.js";
import { buildBillboards } from "./billboards.js";
import { mergeAdConfig } from "./ads.js";
import { randomPedestrian } from "./human.js";
import { buildShops, RIVOLI_ZIPPER } from "./shops.js";
import { boxBatch } from "./interiors/batch.js";
import { updateInteriors } from "./interiors/index.js";
import { buildSubway, updateSubway } from "./under.js";
import { SECOND_Y, HOTEL_STAIRS } from "./zones.js";

const RAIN_N = 420;
const STEAM_N = 48;
const _dummy = new THREE.Object3D();

let SEDAN_GEO;
const SEDAN_PAINT = new Map();
let SEDAN_MAT;
let SEDAN_CHECK;

function sedanKit() {
    if (SEDAN_GEO) return;
    SEDAN_GEO = {
        body: new THREE.BoxGeometry(3.7, 0.72, 1.55),
        cabin: new THREE.BoxGeometry(1.85, 0.62, 1.42),
        hood: new THREE.BoxGeometry(1.15, 0.16, 1.48),
        trunk: new THREE.BoxGeometry(0.95, 0.16, 1.48),
        roof: new THREE.BoxGeometry(1.72, 0.08, 1.36),
        windshield: new THREE.PlaneGeometry(1.42, 0.5),
        rearWin: new THREE.PlaneGeometry(1.28, 0.4),
        sideWin: new THREE.PlaneGeometry(1.12, 0.38),
        bumper: new THREE.BoxGeometry(0.2, 0.16, 1.64),
        wheel: new THREE.CylinderGeometry(0.28, 0.28, 0.22, 10),
        cap: new THREE.CylinderGeometry(0.14, 0.14, 0.05, 10),
        wall: new THREE.TorusGeometry(0.22, 0.032, 6, 12),
        grille: new THREE.BoxGeometry(0.08, 0.34, 1.18),
        fender: new THREE.BoxGeometry(0.78, 0.22, 0.22),
        running: new THREE.BoxGeometry(2.15, 0.05, 0.16),
        handle: new THREE.BoxGeometry(0.14, 0.035, 0.04),
        trim: new THREE.BoxGeometry(3.35, 0.035, 0.035),
        light: new THREE.BoxGeometry(0.1, 0.1, 0.2),
        beam: new THREE.BoxGeometry(0.16, 0.1, 0.24),
        tail: new THREE.BoxGeometry(0.08, 0.1, 1.22),
        lamp: new THREE.BoxGeometry(0.52, 0.14, 0.32),
        check: new THREE.BoxGeometry(3.72, 0.16, 1.56),
    };
    SEDAN_MAT = {
        chrome: new THREE.MeshStandardMaterial({ color: 0xc9cdd2, roughness: 0.22, metalness: 0.95 }),
        dark: new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.4, metalness: 0.3 }),
        glass: new THREE.MeshStandardMaterial({ color: 0x9ec4d8, roughness: 0.08, metalness: 0.35, transparent: true, opacity: 0.45 }),
        hub: new THREE.MeshStandardMaterial({ color: 0xd8dce0, roughness: 0.25, metalness: 0.9 }),
        wall: new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.65 }),
        head: new THREE.MeshBasicMaterial({ color: 0xfff3c4 }),
        beam: new THREE.MeshBasicMaterial({ color: 0xfff6d0 }),
        tail: new THREE.MeshBasicMaterial({ color: 0xff3355 }),
        taxiLamp: new THREE.MeshBasicMaterial({ color: 0xffe7a8 }),
    };
}

function paintFor(color) {
    sedanKit();
    let m = SEDAN_PAINT.get(color);
    if (!m) {
        m = new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.48 });
        SEDAN_PAINT.set(color, m);
    }
    return m;
}

function sedan(scene, { x, z, yaw = 0, taxi = false, color = 0x2a2a32, moving = 0 }) {
    sedanKit();
    const G = SEDAN_GEO;
    const M = SEDAN_MAT;
    const g = new THREE.Group();
    const bodyC = taxi ? 0xf5c518 : color;
    const paint = paintFor(bodyC);
    const body = new THREE.Mesh(G.body, paint);
    body.position.y = 0.55;
    const cabin = new THREE.Mesh(G.cabin, M.dark);
    cabin.position.set(-0.15, 1.12, 0);
    const hood = new THREE.Mesh(G.hood, paint);
    hood.position.set(1.18, 0.84, 0);
    const trunk = new THREE.Mesh(G.trunk, paint);
    trunk.position.set(-1.22, 0.84, 0);
    const roof = new THREE.Mesh(G.roof, paint);
    roof.position.set(-0.15, 1.44, 0);
    const windshield = new THREE.Mesh(G.windshield, M.glass);
    windshield.position.set(0.74, 1.16, 0);
    windshield.rotation.y = Math.PI / 2;
    windshield.rotation.z = -0.38;
    const rearWin = new THREE.Mesh(G.rearWin, M.glass);
    rearWin.position.set(-1.05, 1.16, 0);
    rearWin.rotation.y = -Math.PI / 2;
    rearWin.rotation.z = 0.32;
    const sideWin = new THREE.Mesh(G.sideWin, M.glass);
    sideWin.position.set(-0.1, 1.14, 0.72);
    const sideWin2 = sideWin.clone();
    sideWin2.position.z = -0.72;
    sideWin2.rotation.y = Math.PI;
    const bumperF = new THREE.Mesh(G.bumper, M.chrome);
    bumperF.position.set(1.92, 0.38, 0);
    const bumperB = bumperF.clone();
    bumperB.position.x = -1.92;
    const grille = new THREE.Mesh(G.grille, M.chrome);
    grille.position.set(1.88, 0.62, 0);
    const wheels = [];
    for (const [wx, wz] of [[1.15, 0.72], [1.15, -0.72], [-1.2, 0.72], [-1.2, -0.72]]) {
        const hub = new THREE.Group();
        hub.position.set(wx, 0.28, wz);
        const tire = new THREE.Mesh(G.wheel, M.dark);
        tire.rotation.x = Math.PI / 2;
        const cap = new THREE.Mesh(G.cap, M.hub);
        cap.rotation.x = Math.PI / 2;
        const wall = new THREE.Mesh(G.wall, M.wall);
        wall.rotation.y = Math.PI / 2;
        hub.add(tire, cap, wall);
        g.add(hub);
        wheels.push(hub);
        const fender = new THREE.Mesh(G.fender, paint);
        fender.position.set(wx, 0.48, wz + (wz > 0 ? 0.12 : -0.12));
        g.add(fender);
    }
    const runL = new THREE.Mesh(G.running, M.chrome);
    runL.position.set(0, 0.32, 0.82);
    const runR = runL.clone();
    runR.position.z = -0.82;
    const trimL = new THREE.Mesh(G.trim, M.chrome);
    trimL.position.set(0, 0.7, 0.78);
    const trimR = trimL.clone();
    trimR.position.z = -0.78;
    const handleL = new THREE.Mesh(G.handle, M.chrome);
    handleL.position.set(0.35, 0.78, 0.8);
    const handleR = handleL.clone();
    handleR.position.z = -0.8;
    g.add(body, cabin, hood, trunk, roof, bumperF, bumperB, grille, windshield, rearWin, sideWin, sideWin2, runL, runR, trimL, trimR, handleL, handleR);
    if (taxi) {
        if (!SEDAN_CHECK) SEDAN_CHECK = new THREE.MeshBasicMaterial({ map: checkerTex() });
        const check = new THREE.Mesh(G.check, SEDAN_CHECK);
        check.position.y = 0.72;
        const lamp = new THREE.Mesh(G.lamp, M.taxiLamp);
        lamp.position.set(0, 1.52, 0);
        g.add(check, lamp);
    }
    const lightL = new THREE.Mesh(G.light, M.head);
    lightL.position.set(1.9, 0.58, 0.5);
    const lightR = lightL.clone();
    lightR.position.z = -0.5;
    g.add(lightL, lightR);
    if (moving) {
        const beam = new THREE.Mesh(G.beam, M.beam);
        beam.position.set(1.97, 0.6, 0.42);
        const beam2 = beam.clone();
        beam2.position.z = -0.42;
        const tail = new THREE.Mesh(G.tail, M.tail);
        tail.position.set(-1.92, 0.58, 0);
        g.add(beam, beam2, tail);
    }
    g.position.set(x, 0, z);
    g.rotation.y = yaw;
    g.userData.wheels = wheels;
    g.userData.moving = moving;
    scene.add(g);
    return g;
}

export function buildCity(scene, adConfig = mergeAdConfig()) {
    const root = new THREE.Group();
    scene.add(root);

    const brick = new THREE.MeshStandardMaterial({ map: brickTex(), roughness: 0.88, metalness: 0.04, color: 0x8a5a4a });
    const brickDark = new THREE.MeshStandardMaterial({ map: darkBrickTex(), roughness: 0.9, color: 0x5a3a32 });
    const brickBrown = new THREE.MeshStandardMaterial({ map: brickTex("#241814", "#5a3a28"), roughness: 0.9, color: 0x6a4a38 });
    const asphalt = new THREE.MeshStandardMaterial({ map: asphaltTex(), roughness: 0.28, metalness: 0.55, color: 0x1c222c });
    const walk = new THREE.MeshStandardMaterial({ map: sidewalkTex(), roughness: 0.8, metalness: 0.05, color: 0x4a4a50 });
    const plaster = new THREE.MeshStandardMaterial({ map: plasterTex(), roughness: 0.85 });
    const rusticated = new THREE.MeshStandardMaterial({ map: stoneTex(), roughness: 0.78, color: 0xc8b89a });
    const wood = new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.75, color: 0x6a4a32 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xc5c8cc, roughness: 0.22, metalness: 0.95 });
    const black = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.5 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xd8cbb0, roughness: 0.7 });
    const neonRed = new THREE.MeshBasicMaterial({ color: 0xff3355 });
    const neonAmber = new THREE.MeshBasicMaterial({ color: 0xffb25a });
    const neonCyan = new THREE.MeshBasicMaterial({ color: 0x66ffe0 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x88aacc, roughness: 0.08, metalness: 0.35, transparent: true, opacity: 0.28 });
    const puddleM = new THREE.MeshStandardMaterial({ color: 0x1a2430, roughness: 0.08, metalness: 0.9 });

    // Street + sidewalks — long Midtown block
    addBox(root, unitBox, walk, 0, -0.04, 15.6, 180, 0.08, 6.4);
    addBox(root, unitBox, asphalt, 0, -0.06, 22.8, 180, 0.08, 8.2);
    addBox(root, unitBox, walk, 0, -0.04, 29.4, 180, 0.08, 5.2);
    addBox(root, unitBox, walk, 0, -0.04, -23.2, 120, 0.08, 13.6);
    addBox(root, unitBox, brickDark, 48, 10, -2, 18, 20, 29);
    addBox(root, unitBox, brick, -48, 9, -2, 18, 18, 29);
    addBox(root, unitBox, rusticated, -48, 3.35, -2, 18.6, 6.7, 29.5);
    addBox(root, unitBox, rusticated, 48, 3.35, -2, 18.6, 6.7, 29.5);

    // Curb paint
    addBox(root, unitBox, neonAmber, 0, 0.01, 18.75, 180, 0.02, 0.12);
    addBox(root, unitBox, neonAmber, 0, 0.01, 26.85, 180, 0.02, 0.12);

    const stripe = new THREE.MeshBasicMaterial({ color: 0xf2eee0 });
    for (const cx of [0, -27, 25]) {
        for (let i = 0; i < 9; i++) {
            addBox(root, unitBox, stripe, cx, 0.02, 19.4 + i * 0.85, 1.8, 0.02, 0.38);
        }
    }

    const signal = new THREE.Group();
    addBox(signal, unitBox, black, 0, 1.7, 0, 0.12, 3.4, 0.12);
    const sigRed = addBox(signal, unitBox, new THREE.MeshBasicMaterial({ color: 0xff3355 }), 0, 3.35, -0.12, 0.28, 0.28, 0.12);
    const sigAmb = addBox(signal, unitBox, new THREE.MeshBasicMaterial({ color: 0x3a2810 }), 0, 2.95, -0.12, 0.28, 0.28, 0.12);
    const sigGrn = addBox(signal, unitBox, new THREE.MeshBasicMaterial({ color: 0x1a4a32 }), 0, 2.55, -0.12, 0.28, 0.28, 0.12);
    signal.position.set(-2.4, 0, 18.35);
    root.add(signal);
    signal.userData.lamps = { red: sigRed.material, amber: sigAmb.material, green: sigGrn.material };

    // Puddles
    const puddleG = new THREE.CircleGeometry(1.4, 16);
    for (const [x, z, s] of [[-6, 16.2, 1.2], [2.5, 17.4, 0.8], [12, 15.9, 1], [-18, 16.8, 0.9], [0, -20.5, 1.1], [-10, -22, 0.7]]) {
        const p = new THREE.Mesh(puddleG, puddleM);
        p.rotation.x = -Math.PI / 2;
        p.position.set(x, 0.02, z);
        p.scale.set(s, s * 0.6, 1);
        root.add(p);
    }

    // Club roof cap + upper facade (interior is club.js)
    addBox(root, unitBox, brick, 0, 8.4, -2, 33.2, 0.5, 29.4);
    addBox(root, unitBox, brick, 0, 6.2, 12.72, 33, 4.2, 0.18);

    // Diner shell — walls only, so the counter is walkable
    addBox(root, unitBox, chrome, -33.7, 2.1, 12.62, 10.2, 4.2, 0.22);
    addBox(root, unitBox, chrome, -21.05, 2.1, 12.62, 9.1, 4.2, 0.22);
    addBox(root, unitBox, chrome, -27.0, 5.3, 12.62, 5.0, 2.2, 0.22);
    addBox(root, unitBox, cream, -27.65, 6.55, -2, 22.3, 0.35, 29.1);
    addBox(root, unitBox, chrome, -38.72, 3.4, -2, 0.24, 6.8, 29);
    addBox(root, unitBox, chrome, -27.65, 3.4, -16.58, 22.2, 6.8, 0.24);
    addBox(root, unitBox, chrome, -27.65, 0.55, 12.62, 22.2, 1.1, 0.2);
    for (const x of [-34, -30, -22, -18.5]) {
        addBox(root, unitBox, glass, x, 1.7, 12.68, 2.6, 1.8, 0.08);
        addBox(root, unitBox, chrome, x, 1.7, 12.74, 2.8, 2.0, 0.04);
    }
    // Enamel sign board across the diner front, sitting on the chrome wall head: two rows of neon.
    const signCan = new THREE.MeshStandardMaterial({ color: 0x15191c, roughness: 0.5, metalness: 0.45 });
    const sb = boxBatch();
    sb.box(signCan, -27.6, 4.83, 12.78, 15.6, 2.96, 0.08);
    sb.box(chrome, -27.6, 6.34, 12.8, 15.8, 0.06, 0.12);
    sb.box(chrome, -27.6, 3.32, 12.8, 15.8, 0.06, 0.12);
    for (const x of [-35.44, -19.76]) sb.box(chrome, x, 4.83, 12.8, 0.08, 3.04, 0.12);
    sb.box(neonRed, -27.6, 4.42, 12.85, 7.8, 0.035, 0.035);
    const dottie = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 1.5), new THREE.MeshBasicMaterial({ map: neonCanvas("DOTTIE'S", "#FF3355", 1024, 183, "#100808") }));
    dottie.position.set(-27.6, 5.3, 12.832);
    root.add(dottie);
    const dinerSub = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 0.7), new THREE.MeshBasicMaterial({ map: neonCanvas("OPEN ALL NIGHT", "#66FFE0", 1024, 116, "#081010") }));
    dinerSub.position.set(-27.6, 3.93, 12.832);
    root.add(dinerSub);

    // Diner interior: js/interiors/diner.js (built with the shop row)

    // Hotel shell — lobby is walkable
    addBox(root, unitBox, brickBrown, 20.05, 7.2, 12.62, 7.1, 14.5, 0.28);
    addBox(root, unitBox, brickBrown, 32.6, 7.2, 12.62, 12.4, 14.5, 0.28);
    addBox(root, unitBox, brickBrown, 25.0, 10.4, 12.62, 5.2, 8.2, 0.28);
    addBox(root, unitBox, brickBrown, 38.72, 7.2, -2, 0.28, 14.5, 29);
    addBox(root, unitBox, brickBrown, 27.65, 7.2, -16.58, 22.2, 14.5, 0.28);
    addBox(root, unitBox, brickBrown, 27.65, 14.4, -2, 22.2, 0.4, 29);
    const fy = SECOND_Y;
    addBox(root, unitBox, cream, 26.1, fy - 0.05, -2, 18.7, 0.12, 28.6);
    addBox(root, unitBox, cream, 38.5, fy - 0.05, -2, 0.55, 0.12, 28.6);
    addBox(root, unitBox, cream, 36.95, fy - 0.05, -7.6, 2.7, 0.12, 17.9);
    addBox(root, unitBox, cream, 36.95, fy - 0.05, 11.0, 2.7, 0.12, 2.9);
    const hs = HOTEL_STAIRS;
    const hSteps = 12;
    for (let i = 0; i < hSteps; i++) {
        const t = i / (hSteps - 1);
        const z = hs.zBottom - t * (hs.zBottom - hs.zTop);
        const y = t * fy;
        addBox(root, unitBox, wood, 36.95, y + 0.04, z, 2.4, 0.08, 0.62);
        addBox(root, unitBox, cream, 36.95, y + 0.09, z, 2.4, 0.02, 0.08);
    }
    // Lobby + 2F furnishings: js/interiors/hotel-lobby.js, hotel-upstairs.js
    // Vertical HOTEL blade projecting over the 47th St sidewalk on three steel arms, both faces lettered.
    const hx = 36.6, hy = 8.6, hz = 14.0;
    sb.box(signCan, hx, hy, hz, 0.2, 7.8, 2.2);
    sb.box(chrome, hx, hy + 3.93, hz, 0.24, 0.06, 2.24);
    sb.box(chrome, hx, hy - 3.93, hz, 0.24, 0.06, 2.24);
    for (let y = hy - 3.7; y <= hy + 3.7; y += 0.3) sb.box(neonAmber, hx, y, hz + 1.13, 0.1, 0.08, 0.08);
    for (const y of [hy - 3.4, hy, hy + 3.4]) {
        sb.box(black, hx, y, 12.83, 0.1, 0.1, 0.16);
        sb.box(black, hx, y, 12.78, 0.26, 0.26, 0.04);
    }
    const hotelTex = verticalNeonCanvas("HOTEL", "#E0B25A", 256, 960, "#120c08");
    for (const side of [1, -1]) {
        const hotelSign = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 7.5), new THREE.MeshBasicMaterial({ map: hotelTex }));
        hotelSign.position.set(hx + side * 0.112, hy, hz);
        hotelSign.rotation.y = side * Math.PI / 2;
        root.add(hotelSign);
    }
    sb.box(signCan, 27.6, 10.4, 12.8, 10.3, 1.55, 0.06);
    const astoria = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.3), new THREE.MeshBasicMaterial({ map: neonCanvas("ASTORIA", "#FFB25A", 1024, 133, "#120c08") }));
    astoria.position.set(27.6, 10.4, 12.842);
    root.add(astoria);
    sb.flush(root);
    addBox(root, unitBox, black, 25, 3.4, 12.78, 6.4, 0.2, 1.8);
    addBox(root, unitBox, neonAmber, 25, 3.35, 13.6, 6.6, 0.06, 0.08);
    addBox(root, unitBox, rusticated, 20.05, 1.15, 12.78, 7.1, 2.3, 0.22);
    addBox(root, unitBox, rusticated, 32.6, 1.15, 12.78, 12.4, 2.3, 0.22);

    // Club marquee
    const marquee = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 3.2), new THREE.MeshBasicMaterial({ map: marqueeCanvas("VIBE CHECK", "9000  ·  TONIGHT") }));
    marquee.position.set(0, 6.6, 12.95);
    root.add(marquee);
    addBox(root, unitBox, black, 0, 6.6, 12.82, 11.2, 3.6, 0.2);
    const bulbs = [];
    for (let i = 0; i < 24; i++) {
        const b = addBox(root, unitBox, neonAmber, -5.2 + i * 0.45, 8.45, 13.0, 0.1, 0.1, 0.1);
        bulbs.push(b.material);
    }

    const canopy = addBox(root, unitBox, black, 0, 3.35, 13.7, 8.4, 0.12, 2.2);
    addBox(root, unitBox, neonRed, 0, 3.3, 14.7, 8.5, 0.05, 0.08);

    const winGeo = new THREE.PlaneGeometry(0.85, 1.25);
    const winOn = new THREE.MeshBasicMaterial({ map: windowPaneTex("on") });
    const winWarm = new THREE.MeshBasicMaterial({ map: windowPaneTex("warm") });
    const winOff = new THREE.MeshBasicMaterial({ map: windowPaneTex("off") });
    const winDummy = [];

    function addWindows(cx, y0, zFace, w, h, rotY, seed) {
        const cols = Math.max(3, Math.floor(w / 1.75));
        const rows = Math.max(2, Math.floor(h / 3.35));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const n = ((r * 17 + c * 11 + seed * 13) % 10) / 10;
                if (n < 0.12) continue;
                const along = -w / 2 + 1.15 + c * ((w - 2.3) / Math.max(1, cols - 1));
                winDummy.push({
                    x: cx + along,
                    y: y0 + 1.5 + r * 3.35,
                    z: zFace,
                    ry: rotY,
                    kind: n > 0.72 ? "warm" : n > 0.28 ? "on" : "off",
                });
            }
        }
    }

    function fireEscape(x, z, stories, side = -1) {
        for (let l = 0; l < stories; l++) {
            const y = 4.7 + l * 3.05;
            addBox(root, unitBox, chrome, x, y, z, 2.55, 0.05, 1.15);
            addBox(root, unitBox, chrome, x - 1.18, y + 1.15, z, 0.05, 2.3, 0.05);
            addBox(root, unitBox, chrome, x + 1.18, y + 1.15, z, 0.05, 2.3, 0.05);
            addBox(root, unitBox, chrome, x - 0.85, y + 0.55, z + side * 0.42, 0.05, 0.05, 0.9);
            addBox(root, unitBox, chrome, x + 0.85, y + 1.5, z + side * 0.2, 0.04, 1.6, 0.04);
        }
    }

    function waterTower(x, y, z) {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.2, 10), brickDark);
        tank.position.set(x, y + 1.1, z);
        root.add(tank);
        addBox(root, unitBox, black, x, y + 2.3, z, 2.4, 0.12, 2.4);
        for (const [dx, dz] of [[0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]]) {
            addBox(root, unitBox, black, x + dx, y - 1.1, z + dz, 0.12, 2.2, 0.12);
        }
    }

    function addTower({ x, z, w, d, floors, mat, spire = false, seed = 1 }) {
        const story = 3.35;
        let remaining = floors;
        let cw = w;
        let cd = d;
        let cy = 0;
        const shrinks = [0, 0.14, 0.22];
        const caps = [8, 14, 99];
        for (let t = 0; t < 3 && remaining > 0; t++) {
            const n = Math.min(caps[t], remaining);
            cw *= 1 - shrinks[t];
            cd *= 1 - shrinks[t];
            const h = n * story;
            addBox(root, unitBox, mat, x, cy + h / 2, z, cw, h, cd);
            if (t === 0) addBox(root, unitBox, rusticated, x, story, z, cw + 0.5, story * 2, cd + 0.5);
            addBox(root, unitBox, black, x, cy + h + 0.18, z, cw + 0.55, 0.36, cd + 0.55);
            addBox(root, unitBox, cream, x, cy + h + 0.42, z, cw + 0.72, 0.16, cd + 0.72);
            addBox(root, unitBox, black, x, cy + h * 0.5, z, cw + 0.22, 0.14, cd + 0.22);
            if (t === 0 && seed % 2 === 0) fireEscape(x - cw * 0.18, z - cd / 2 - 0.58, Math.min(5, n), -1);
            addWindows(x, cy, z - cd / 2 - 0.05, cw, h, Math.PI, seed + t * 9);
            addWindows(x, cy, z + cd / 2 + 0.05, cw * 0.9, h, 0, seed + t * 5);
            const sideCols = Math.max(2, Math.floor(cd / 1.9));
            const sideRows = Math.max(2, Math.floor(h / 3.35));
            for (const side of [1, -1]) {
                for (let r = 0; r < sideRows; r++) {
                    for (let c = 0; c < sideCols; c++) {
                        const n = ((r * 19 + c * 7 + seed * 3 + side) % 10) / 10;
                        if (n < 0.18) continue;
                        winDummy.push({
                            x: x + side * (cw / 2 + 0.05),
                            y: cy + 1.5 + r * 3.35,
                            z: z - cd / 2 + 1.2 + c * ((cd - 2.4) / Math.max(1, sideCols - 1)),
                            ry: side > 0 ? Math.PI / 2 : -Math.PI / 2,
                            kind: n > 0.7 ? "warm" : n > 0.3 ? "on" : "off",
                        });
                    }
                }
            }
            remaining -= n;
            cy += h;
        }
        if (floors >= 16) waterTower(x + cw * 0.18, cy + 2.2, z);
        if (spire) {
            addBox(root, unitBox, black, x, cy + 8, z, 1.2, 16, 1.2);
            addBox(root, unitBox, chrome, x, cy + 16.4, z, 0.18, 4.8, 0.18);
            addBox(root, unitBox, neonAmber, x, cy + 18.8, z, 0.5, 0.5, 0.5);
        }
        return cy;
    }

    const stone = new THREE.MeshStandardMaterial({ map: plasterTex(), roughness: 0.75, color: 0xc4b496 });
    const towers = [
        { x: -78, z: 58, w: 20, d: 24, floors: 18, mat: brickDark, seed: 2 },
        { x: -56, z: 60, w: 18, d: 26, floors: 26, mat: brick, seed: 3 },
        { x: -36, z: 56, w: 22, d: 22, floors: 20, mat: brickBrown, seed: 4 },
        { x: -16, z: 62, w: 16, d: 28, floors: 32, mat: brickDark, seed: 5 },
        { x: 2, z: 59, w: 20, d: 24, floors: 24, mat: stone, seed: 6 },
        { x: 22, z: 64, w: 18, d: 26, floors: 38, mat: brick, spire: true, seed: 7 },
        { x: 42, z: 58, w: 22, d: 22, floors: 22, mat: brickBrown, seed: 8 },
        { x: 64, z: 61, w: 20, d: 24, floors: 28, mat: brickDark, seed: 9 },
        { x: 84, z: 57, w: 18, d: 20, floors: 16, mat: brick, seed: 10 },
        { x: -68, z: 72, w: 24, d: 20, floors: 22, mat: brickBrown, seed: 11 },
        { x: -28, z: 76, w: 20, d: 18, floors: 30, mat: brickDark, seed: 12 },
        { x: 10, z: 78, w: 26, d: 20, floors: 26, mat: brick, seed: 13 },
        { x: 48, z: 74, w: 22, d: 18, floors: 34, mat: stone, spire: true, seed: 14 },
        { x: 80, z: 70, w: 20, d: 16, floors: 20, mat: brickDark, seed: 15 },
    ];
    for (const spec of towers) addTower(spec);

    // Mid-rise infill behind the shop row so the skyline is a wall of rooms, not a void
    addBox(root, unitBox, brickBrown, 1.2, 8.2, 43.15, 82, 16.4, 5.9);
    addBox(root, unitBox, black, 1.2, 16.5, 43.15, 82.6, 0.4, 6.3);
    addBox(root, unitBox, brickDark, 1.2, 17.3, 43.4, 40, 1.2, 3.6);
    addWindows(1.2, 0.4, 40.22, 78, 16, Math.PI, 21);
    addWindows(1.2, 0.4, 46.08, 78, 16, 0, 22);
    waterTower(-18, 18.2, 42.8);
    waterTower(22, 18.2, 43.6);

    // Bookend lots beside diner / hotel — windows so they read as buildings
    addWindows(-48, 0.4, 12.48, 16, 16, 0, 31);
    addWindows(-48, 0.4, -16.48, 16, 16, Math.PI, 32);
    addWindows(48, 0.4, 12.48, 16, 18, 0, 33);
    addWindows(48, 0.4, -16.48, 16, 18, Math.PI, 34);

    for (const x of [20, 25, 30, 35]) {
        for (const y of [5.2, 8.2, 11.2]) {
            if ((x + y) % 7 === 0) continue;
            winDummy.push({
                x, y, z: 12.82, ry: 0, sx: 1.55, sy: 1.28,
                kind: (x + y) % 5 > 2 ? "warm" : (x + y) % 5 ? "on" : "off",
            });
        }
    }
    for (const x of [-13, -8.5, -4, 4, 8.5, 13]) {
        winDummy.push({ x, y: 7.15, z: 12.82, ry: 0, sx: 1.2, sy: 1.05, kind: Math.abs(x) > 10 ? "off" : "warm" });
    }

    const onList = winDummy.filter((w) => w.kind === "on");
    const warmList = winDummy.filter((w) => w.kind === "warm");
    const offList = winDummy.filter((w) => w.kind === "off");
    function fillWins(list, material) {
        const mesh = new THREE.InstancedMesh(winGeo, material, Math.max(1, list.length));
        list.forEach((w, i) => {
            _dummy.position.set(w.x, w.y, w.z);
            _dummy.rotation.set(0, w.ry, 0);
            _dummy.scale.set(w.sx || 1, w.sy || 1, 1);
            _dummy.updateMatrix();
            mesh.setMatrixAt(i, _dummy.matrix);
        });
        root.add(mesh);
        return mesh;
    }
    fillWins(onList, winOn);
    fillWins(warmList, winWarm);
    fillWins(offList, winOff);

    const sillMesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.98, 0.07, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.7 }),
        Math.max(1, winDummy.length),
    );
    winDummy.forEach((w, i) => {
        _dummy.position.set(w.x, w.y - 0.68 * (w.sy || 1), w.z);
        _dummy.rotation.set(0, w.ry, 0);
        _dummy.scale.set(w.sx || 1, 1, 1);
        _dummy.updateMatrix();
        sillMesh.setMatrixAt(i, _dummy.matrix);
    });
    root.add(sillMesh);
    const acList = winDummy.filter((w, i) => i % 6 === 0 && w.kind !== "off");
    const acMesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.55, 0.28, 0.38),
        new THREE.MeshStandardMaterial({ color: 0x6a7278, roughness: 0.45, metalness: 0.35 }),
        Math.max(1, acList.length),
    );
    acList.forEach((w, i) => {
        _dummy.position.set(w.x, w.y - 0.82 * (w.sy || 1), w.z);
        _dummy.rotation.set(0, w.ry, 0);
        _dummy.scale.set(1, 1, 1);
        _dummy.updateMatrix();
        acMesh.setMatrixAt(i, _dummy.matrix);
    });
    root.add(acMesh);

    const ads = buildBillboards(root, scene, adConfig);
    const wetRoad = new THREE.Mesh(
        new THREE.PlaneGeometry(180, 8.2),
        new THREE.MeshStandardMaterial({
            color: 0x151c24, metalness: 0.92, roughness: 0.12, transparent: true, opacity: 0.42, envMapIntensity: 1.4,
        }),
    );
    wetRoad.rotation.x = -Math.PI / 2;
    wetRoad.position.set(0, 0.012, 22.8);
    root.add(wetRoad);

    // Alley back wall
    addBox(root, unitBox, brickDark, 0, 8, -32.2, 80, 16, 4);
    for (let i = 0; i < 18; i++) {
        const x = -28 + i * 3.2;
        const y = 2 + (i % 5) * 2.4;
        addBox(root, unitBox, Math.random() > 0.4 ? winOn : winOff, x, y, -30.15, 0.9, 1.2, 0.06);
    }

    // Fire escapes on alley wall
    for (const x of [-22, -8, 8, 22]) {
        for (let l = 0; l < 4; l++) {
            addBox(root, unitBox, chrome, x, 2.2 + l * 3.1, -30.4, 2.6, 0.06, 1.2);
            addBox(root, unitBox, chrome, x - 1.2, 3.4 + l * 3.1, -30.4, 0.05, 2.4, 0.05);
        }
    }

    // Dumpsters, crates, barrel
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x2a3a28, roughness: 0.6, metalness: 0.4 }), -7.8, 0.7, -22.1, 2.8, 1.4, 1.6);
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x3a4a32, metalness: 0.4, roughness: 0.5 }), 5.1, 0.6, -25.9, 2.6, 1.2, 1.5);
    addBox(root, unitBox, wood, -1, 0.45, -21.5, 1.4, 0.9, 1.1);
    addBox(root, unitBox, wood, 0.4, 0.35, -21.2, 1.0, 0.7, 0.8);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.7, 10), new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.6, metalness: 0.2 }));
    barrel.position.set(4.2, 0.35, -19.4);
    root.add(barrel);

    // Hanging alley bulb
    addBox(root, unitBox, black, 0, 4.6, -22, 0.04, 1.4, 0.04);
    const bulb = addBox(root, unitBox, neonAmber, 0, 3.85, -22, 0.16, 0.2, 0.16);
    const alleyLight = new THREE.PointLight(0xffc078, 28, 14, 2);
    alleyLight.position.set(0, 3.7, -22);
    scene.add(alleyLight);

    // Street lamps — poles everywhere, real lights only on a few so the GPU stays alive
    const lampLights = [];
    function lampPost(x, z, lit) {
        addBox(root, unitBox, black, x, 2.2, z, 0.12, 4.4, 0.12);
        addBox(root, unitBox, neonAmber, x, 4.35, z + (z < 20 ? -0.9 : 0.5), 0.35, 0.22, 0.35);
        if (!lit) return;
        const pl = new THREE.PointLight(0xffc078, 16, 12, 2);
        pl.position.set(x, 4.2, z + (z < 20 ? -0.9 : 0.5));
        pl.userData.base = 16;
        scene.add(pl);
        lampLights.push(pl);
    }
    for (const x of [-48, -32, -16, 0, 16, 32, 48]) lampPost(x, 17.85, x === -16 || x === 16);
    for (const x of [-40, -24, -8, 8, 24, 40]) lampPost(x, 27.9, x === -8 || x === 24);
    const dinerGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(8.8, 1.8),
        new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    dinerGlow.position.set(-27.6, 4.7, 12.92);
    root.add(dinerGlow);
    const hotelGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(10.4, 1.6),
        new THREE.MeshBasicMaterial({ color: 0xffb25a, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    hotelGlow.position.set(27.6, 10.4, 12.92);
    root.add(hotelGlow);

    // Hydrants, mailbox, newsstand, phone booth
    const hydrant = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xb82828, roughness: 0.45, metalness: 0.4 }));
    hydrant.position.set(-4.2, 0.35, 14.9);
    root.add(hydrant);
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x1a3a6a, metalness: 0.3 }), -16.4, 0.7, 15.2, 0.45, 1.3, 0.28);

    addBox(root, unitBox, wood, -11.85, 0.7, 16.1, 2.6, 1.4, 1.3);
    addBox(root, unitBox, black, -11.85, 1.5, 16.1, 2.7, 0.08, 1.4);
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), new THREE.MeshBasicMaterial({ map: gazetteTex() }));
    paper.position.set(-11.2, 0.95, 16.765);
    root.add(paper);
    addBox(root, unitBox, chrome, -11.2, 1.41, 16.775, 0.74, 0.02, 0.02);

    // Phone booth
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x8b1e1e, metalness: 0.3, roughness: 0.45 }), 7.15, 1.2, 16.25, 0.9, 2.4, 0.9);
    addBox(root, unitBox, glass, 7.15, 1.35, 16.72, 0.7, 1.4, 0.05);
    addBox(root, unitBox, neonRed, 7.15, 2.5, 16.25, 0.95, 0.12, 0.95);

    const under = buildSubway(root, scene, { wood, cream, black, chrome, neonAmber });

    const titles = ["NEON IN THE RAIN", "THE MIDNIGHT VISOR", "ALLEY CATS OF 47TH", "A PIE TO REMEMBER"];
    // The news zipper on the Rivoli marquee (shops.js builds the marquee around it).
    const Z = RIVOLI_ZIPPER;
    const titlePlane = new THREE.Mesh(new THREE.PlaneGeometry(Z.w, Z.h), new THREE.MeshBasicMaterial({ map: zipperCanvas(titles[0]) }));
    titlePlane.position.set(Z.x, Z.y, Z.z);
    titlePlane.rotation.y = Math.PI;
    root.add(titlePlane);

    const shops = buildShops(root, scene, {
        wood, cream, black, chrome, brick, brickDark, neonRed, neonAmber, neonCyan, glass,
    });
    // Fire escapes hang between the shop sign bands and clear of the fascia billboards.
    for (const x of [-27.5, -16.4, -8.3, 14.6, 30.5]) fireEscape(x, 31.32, 2, -1);
    addBox(root, unitBox, rusticated, 1.2, 3.92, 32.16, 80.4, 0.42, 0.4);

    // Manholes + steam
    for (const [x, z] of [[-3, 22.5], [14, 23.2], [-16, 21.8]]) {
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 12), chrome);
        lid.position.set(x, 0.0, z);
        root.add(lid);
    }

    const steamPos = new Float32Array(STEAM_N * 3);
    const steamOrigins = [[-3, 22.5], [14, 23.2], [-16, 21.8], [0, -22]];
    for (let i = 0; i < STEAM_N; i++) {
        const o = steamOrigins[i % steamOrigins.length];
        steamPos[i * 3] = o[0] + (Math.random() - 0.5) * 0.4;
        steamPos[i * 3 + 1] = Math.random() * 2.2;
        steamPos[i * 3 + 2] = o[1] + (Math.random() - 0.5) * 0.4;
    }
    const steamGeo = new THREE.BufferGeometry();
    steamGeo.setAttribute("position", new THREE.BufferAttribute(steamPos, 3));
    const steam = new THREE.Points(steamGeo, new THREE.PointsMaterial({
        color: 0xbbc4cc, size: 0.18, transparent: true, opacity: 0.28, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(steam);

    // Rain streaks
    const rainPos = new Float32Array(RAIN_N * 6);
    function seedRain(i) {
        const x = (Math.random() - 0.5) * 96;
        const y = Math.random() * 18;
        const z = (Math.random() - 0.5) * 84;
        const len = 0.55 + Math.random() * 0.5;
        rainPos[i * 6] = x;
        rainPos[i * 6 + 1] = y;
        rainPos[i * 6 + 2] = z;
        rainPos[i * 6 + 3] = x + 0.1;
        rainPos[i * 6 + 4] = y - len;
        rainPos[i * 6 + 5] = z;
    }
    for (let i = 0; i < RAIN_N; i++) seedRain(i);
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({
        color: 0xc5d4de, transparent: true, opacity: 0.32, depthWrite: false,
    }));
    scene.add(rain);

    // Cars
    const parked = [
        sedan(scene, { x: -20.1, z: 18.85, yaw: 0, color: 0x3a1a1a }),
        sedan(scene, { x: -6.4, z: 18.85, yaw: Math.PI, color: 0x1a2a3a }),
        sedan(scene, { x: 14.4, z: 18.85, yaw: 0, taxi: true }),
        sedan(scene, { x: 29.4, z: 18.85, yaw: Math.PI, color: 0x2a3a28 }),
        sedan(scene, { x: -32.2, z: 26.85, yaw: 0, color: 0x2a2430 }),
        sedan(scene, { x: 8.2, z: 26.85, yaw: Math.PI, taxi: true }),
    ];
    const traffic = [
        sedan(scene, { x: -40, z: 21.35, yaw: 0, taxi: true, moving: 1 }),
        sedan(scene, { x: 20, z: 24.55, yaw: Math.PI, color: 0x2a2030, moving: -1 }),
        sedan(scene, { x: -10, z: 21.35, yaw: 0, color: 0x3a2a18, moving: 1 }),
        sedan(scene, { x: 36, z: 21.35, yaw: 0, taxi: true, moving: 1 }),
        sedan(scene, { x: -28, z: 24.55, yaw: Math.PI, color: 0x4a1a1a, moving: -1 }),
        sedan(scene, { x: 8, z: 24.55, yaw: Math.PI, taxi: true, moving: -1 }),
        sedan(scene, { x: -22, z: 21.35, yaw: 0, color: 0x1a2438, moving: 1 }),
    ];

    const puddleMat = new THREE.MeshStandardMaterial({
        color: 0x1a2838, metalness: 0.88, roughness: 0.16, transparent: true, opacity: 0.38,
    });
    for (const [x, z, s] of [[-8, 16.4, 1.8], [6.5, 17.1, 1.3], [-22, 22.8, 2.1], [18, 16.6, 1.5], [0.4, -20.5, 1.2]]) {
        const puddle = new THREE.Mesh(new THREE.CircleGeometry(s, 14), puddleMat);
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set(x, 0.025, z);
        root.add(puddle);
    }

    const peds = [];
    const paths = [
        { z: 15.5, x0: -48, x1: 48, speed: 1.15 },
        { z: 15.95, x0: 46, x1: -46, speed: 0.95 },
        { z: 29.15, x0: -42, x1: 42, speed: 1.05 },
        { z: 29.55, x0: 40, x1: -40, speed: 0.88 },
        { z: 22.8, x0: 0.2, x1: 0.2, speed: 0.7, cross: true, z0: 16.2, z1: 30.4 },
        { z: 22.8, x0: -27, x1: -27, speed: 0.65, cross: true, z0: 30.2, z1: 16.4 },
    ];
    for (let i = 0; i < 16; i++) {
        const path = paths[i % 4];
        const h = randomPedestrian(0.13 * i + 0.07);
        const t0 = i / 16;
        h.userData.path = path;
        h.userData.t = t0;
        const x = path.x0 + (path.x1 - path.x0) * t0;
        h.position.set(x, 0, path.z);
        h.rotation.y = path.x1 > path.x0 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(h);
        peds.push(h);
    }
    for (let i = 0; i < 4; i++) {
        const path = paths[4 + (i % 2)];
        const h = randomPedestrian(0.61 * i + 0.2);
        h.userData.path = path;
        h.userData.t = i / 4;
        h.position.set(path.x0, 0, path.z0 + (path.z1 - path.z0) * (i / 4));
        scene.add(h);
        peds.push(h);
    }

    const dinerLight = new THREE.PointLight(0xff6655, 35, 12, 2);
    dinerLight.position.set(-27.6, 3.2, 10);
    scene.add(dinerLight);
    const hotelLight = new THREE.PointLight(0xe0b25a, 28, 12, 2);
    hotelLight.position.set(25, 3.2, 10);
    scene.add(hotelLight);
    const hotelUp = new THREE.PointLight(0xffd0a0, 22, 14, 2);
    hotelUp.position.set(27, fy + 2.2, -2);
    scene.add(hotelUp);

    return {
        root,
        ads,
        winOn,
        winWarm,
        rain,
        rainGeo,
        rainN: RAIN_N,
        steam,
        steamGeo,
        steamOrigins,
        traffic,
        parked,
        peds,
        bulbs,
        titlePlane,
        titles,
        alleyLight,
        lampLights,
        dinerLight,
        hotelLight,
        marquee,
        shopCrowd: shops.crowds,
        shopDetails: shops.details,
        shopLights: shops.lights,
        playFilm(id) { shops.film.userData.play(id); },
        setShopState(state) { if (state.film && this.currentFilm !== state.film.id) {this.currentFilm=state.film.id; shops.film.userData.play(state.film.id);} },
        barberPole: shops.pole,
        rivoliChase: shops.chase,
        film: shops.film,
        signal,
        under,
        subwayCrowd: under.crowds,
        setMarquee(line1, line2) {
            const tex = marqueeCanvas(String(line1 || "VIBE CHECK").slice(0, 14), String(line2 || "TONIGHT").slice(0, 22));
            const old = marquee.material.map;
            marquee.material.map = tex;
            if (old && old !== tex) old.dispose();
        },
        setRivoli(line) {
            const tex = zipperCanvas(String(line || "NOW SHOWING").slice(0, 44));
            const old = titlePlane.material.map;
            titlePlane.material.map = tex;
            if (old && old !== tex) old.dispose();
        },
    };
}

export function updateCity(city, dt, t, { outside, reduced, lampMul = 1, zone, position, camera }) {
    const rainArr = city.rainGeo.attributes.position.array;
    const n = city.rainN || RAIN_N;
    city.rain.visible = !!outside && !reduced;
    if (city.rain.visible && !reduced) {
        for (let i = 0; i < n; i++) {
            rainArr[i * 6 + 1] -= dt * 16;
            rainArr[i * 6 + 4] -= dt * 16;
            rainArr[i * 6] += dt * 1.35;
            rainArr[i * 6 + 3] += dt * 1.35;
            if (rainArr[i * 6 + 4] < 0) {
                const x = (Math.random() - 0.5) * 96;
                const y = 12 + Math.random() * 6;
                const z = (Math.random() - 0.5) * 84;
                const len = 0.55 + Math.random() * 0.5;
                rainArr[i * 6] = x;
                rainArr[i * 6 + 1] = y;
                rainArr[i * 6 + 2] = z;
                rainArr[i * 6 + 3] = x + 0.1;
                rainArr[i * 6 + 4] = y - len;
                rainArr[i * 6 + 5] = z;
            }
        }
        city.rainGeo.attributes.position.needsUpdate = true;
    }
    city.ads?.update?.(dt, t, { camera, reduced, outside });

    const st = city.steamGeo.attributes.position.array;
    for (let i = 0; i < STEAM_N; i++) {
        st[i * 3 + 1] += dt * (0.45 + (i % 3) * 0.12);
        st[i * 3] += Math.sin(t + i) * dt * 0.05;
        if (st[i * 3 + 1] > 3.2) {
            const o = city.steamOrigins[i % city.steamOrigins.length];
            st[i * 3] = o[0] + (Math.random() - 0.5) * 0.4;
            st[i * 3 + 1] = 0.1;
            st[i * 3 + 2] = o[1] + (Math.random() - 0.5) * 0.4;
        }
    }
    city.steamGeo.attributes.position.needsUpdate = true;

    for (const car of city.traffic) {
        const dir = car.userData.moving || 1;
        car.position.x += dt * 8.2 * dir;
        if (dir > 0 && car.position.x > 52) car.position.x = -52;
        if (dir < 0 && car.position.x < -52) car.position.x = 52;
        car.rotation.y = dir > 0 ? 0 : Math.PI;
        for (const w of car.userData.wheels || []) w.rotation.z -= dt * 9 * dir;
    }

    for (const ped of city.peds) {
        const path = ped.userData.path;
        if (path.cross) {
            const span = path.z1 - path.z0;
            ped.userData.t = (ped.userData.t + (dt * path.speed) / Math.abs(span)) % 1;
            ped.position.x = path.x0;
            ped.position.z = path.z0 + span * ped.userData.t;
            ped.rotation.y = span > 0 ? 0 : Math.PI;
        } else {
            const span = path.x1 - path.x0;
            ped.userData.t = (ped.userData.t + (dt * path.speed) / Math.abs(span)) % 1;
            ped.position.x = path.x0 + span * ped.userData.t;
            ped.position.z = path.z;
            ped.rotation.y = span > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
    }

    if (city.bulbs.length) {
        const on = Math.sin(t * 8) > -0.2;
        for (let i = 0; i < city.bulbs.length; i++) {
            city.bulbs[i].color.set(on || i % 3 === Math.floor(t * 6) % 3 ? 0xffe7a8 : 0x3a2a10);
        }
    }

    const mul = Number.isFinite(lampMul) ? lampMul : 1;
    for (const l of city.lampLights || []) {
        l.intensity = (l.userData.base || 16) * mul * (reduced ? 1 : 0.92 + Math.sin(t * 1.7 + l.position.x) * 0.08);
    }
    if (city.winOn && !reduced && outside) {
        const pulse = 0.86 + Math.sin(t * 0.55) * 0.08;
        city.winOn.color.setRGB(1 * pulse, 0.89 * pulse, 0.66 * pulse);
        if (city.winWarm) city.winWarm.color.setRGB(1 * pulse, 0.75 * pulse, 0.47 * pulse);
    }
    if (city.alleyLight) city.alleyLight.intensity = 28 * Math.max(1, mul * 0.85);
    if (city.barberPole) city.barberPole.rotation.y += dt * 2.4;
    if (city.rivoliChase) {
        const k = reduced ? -1 : Math.floor(t * 7) % 3;
        city.rivoliChase.forEach((m, i) => m.color.setHex(k < 0 || i === k ? 0xfff0c8 : 0x6a4a22));
    }
    updateSubway(city.under, dt);
    updateInteriors(dt, t, { zone, reduced, outside, position, camera });
    for(const person of city.shopCrowd || []) {
        const home=person.userData.home;if(!home||person.userData.mode==="sit")continue;
        const index=person.userData.shopIndex,cycle=(t+index*3)%18;
        person.rotation.y=home.yaw+(reduced?0:Math.sin(t*.5+index)*.15);
        person.position.z=home.z+(reduced?0:Math.sin(cycle/18*Math.PI*2)*.27);
        person.userData.mode=cycle<5?"lean":"idle";
    }
    for(const light of city.shopLights || []) {
        light.userData.base ??= light.intensity;
        const near=!position||Math.hypot(position.x-light.position.x,position.z-light.position.z)<24;
        light.visible=near;light.intensity=light.userData.base*(zone==="rivoli"?.7:1);
    }
    if (city.signal?.userData.lamps) {
        const phase = Math.floor(t / 3.2) % 3;
        const L = city.signal.userData.lamps;
        L.red.color.set(phase === 0 ? 0xff3355 : 0x3a1010);
        L.amber.color.set(phase === 1 ? 0xffb25a : 0x3a2810);
        L.green.color.set(phase === 2 ? 0x39ff14 : 0x1a4a32);
    }
}
