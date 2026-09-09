import * as THREE from "three";
import { addBox, unitBox, neonCanvas, marqueeCanvas } from "./kit.js";
import { brickTex, darkBrickTex, asphaltTex, sidewalkTex, plasterTex, woodTex, checkerTex, gazetteTex } from "./textures.js";
import { randomPedestrian } from "./human.js";
import { buildShops } from "./shops.js";
import { buildSubway, updateSubway } from "./under.js";
import { SECOND_Y, HOTEL_STAIRS } from "./zones.js";

const RAIN_N = 900;
const STEAM_N = 80;
const _dummy = new THREE.Object3D();

function sedan(scene, { x, z, yaw = 0, taxi = false, color = 0x2a2a32, moving = 0 }) {
    const g = new THREE.Group();
    const bodyC = taxi ? 0xf5c518 : color;
    const paint = new THREE.MeshStandardMaterial({ color: bodyC, roughness: 0.35, metalness: 0.45 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xc9cdd2, roughness: 0.25, metalness: 0.95 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.4, metalness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.72, 1.55), paint);
    body.position.y = 0.55;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.62, 1.42), dark);
    cabin.position.set(-0.15, 1.12, 0);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 1.5), paint);
    hood.position.set(1.15, 0.82, 0);
    const bumperF = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 1.62), chrome);
    bumperF.position.set(1.9, 0.38, 0);
    const bumperB = bumperF.clone();
    bumperB.position.x = -1.9;
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 10);
    const wheels = [];
    for (const [wx, wz] of [[1.15, 0.72], [1.15, -0.72], [-1.2, 0.72], [-1.2, -0.72]]) {
        const hub = new THREE.Group();
        hub.position.set(wx, 0.28, wz);
        const tire = new THREE.Mesh(wheelGeo, dark);
        tire.rotation.x = Math.PI / 2;
        hub.add(tire);
        g.add(hub);
        wheels.push(hub);
    }
    g.add(body, cabin, hood, bumperF, bumperB);
    if (taxi) {
        const check = new THREE.Mesh(new THREE.BoxGeometry(3.72, 0.18, 1.56), new THREE.MeshBasicMaterial({ map: checkerTex() }));
        check.position.y = 0.72;
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.3), new THREE.MeshBasicMaterial({ color: 0xffe7a8 }));
        lamp.position.set(0, 1.5, 0);
        g.add(check, lamp);
    }
    const lightL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.18), new THREE.MeshBasicMaterial({ color: 0xfff3c4 }));
    lightL.position.set(1.88, 0.58, 0.5);
    const lightR = lightL.clone();
    lightR.position.z = -0.5;
    g.add(lightL, lightR);
    g.position.set(x, 0, z);
    g.rotation.y = yaw;
    g.userData.wheels = wheels;
    g.userData.moving = moving;
    scene.add(g);
    return g;
}

export function buildCity(scene) {
    const root = new THREE.Group();
    scene.add(root);

    const brick = new THREE.MeshStandardMaterial({ map: brickTex(), roughness: 0.88, metalness: 0.04, color: 0x8a5a4a });
    const brickDark = new THREE.MeshStandardMaterial({ map: darkBrickTex(), roughness: 0.9, color: 0x5a3a32 });
    const brickBrown = new THREE.MeshStandardMaterial({ map: brickTex("#241814", "#5a3a28"), roughness: 0.9, color: 0x6a4a38 });
    const asphalt = new THREE.MeshStandardMaterial({ map: asphaltTex(), roughness: 0.55, metalness: 0.25, color: 0x2a2a30 });
    const walk = new THREE.MeshStandardMaterial({ map: sidewalkTex(), roughness: 0.8, metalness: 0.05, color: 0x4a4a50 });
    const plaster = new THREE.MeshStandardMaterial({ map: plasterTex(), roughness: 0.85 });
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
    const dottie = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 1.5), new THREE.MeshBasicMaterial({ map: neonCanvas("DOTTIE'S", "#FF3355", 1024, 256, "#100808") }));
    dottie.position.set(-27.6, 4.7, 12.85);
    root.add(dottie);
    const dinerSub = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 0.7), new THREE.MeshBasicMaterial({ map: neonCanvas("OPEN ALL NIGHT", "#66FFE0", 1024, 160, "#081010") }));
    dinerSub.position.set(-27.6, 3.7, 12.85);
    root.add(dinerSub);

    // Diner interior
    addBox(root, unitBox, wood, -27.65, 0.02, -2, 21.8, 0.04, 28.4);
    addBox(root, unitBox, chrome, -25.5, 0.55, 3.7, 16.4, 1.1, 2.4);
    addBox(root, unitBox, cream, -25.5, 1.15, 3.7, 16.2, 0.08, 2.2);
    addBox(root, unitBox, neonRed, -25.5, 0.08, 3.7, 16, 0.04, 2.2);
    for (let i = 0; i < 7; i++) {
        const z = -8 + i * 2.4;
        addBox(root, unitBox, wood, -34.6, 0.45, z, 1.6, 0.12, 1.4);
        addBox(root, unitBox, cream, -35.4, 0.85, z, 0.12, 0.9, 1.4);
        addBox(root, unitBox, chrome, -33.6, 0.42, z, 0.28, 0.08, 0.28);
    }
    const pie = addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0xc45c28, roughness: 0.5 }), -22.4, 1.35, 3.7, 0.7, 0.18, 0.7);
    pie.material.emissive = new THREE.Color(0x401000);
    pie.material.emissiveIntensity = 0.2;
    addBox(root, unitBox, glass, -22.4, 1.7, 3.7, 1.1, 0.7, 1.1);
    addBox(root, unitBox, chrome, -22.8, 0.7, 6.4, 8.4, 1.4, 1.6);
    addBox(root, unitBox, neonRed, -22.8, 1.15, 6.4, 7.6, 0.06, 1.2);
    addBox(root, unitBox, black, -19.4, 1.35, 6.4, 1.4, 0.35, 1.1);

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
    addBox(root, unitBox, wood, 32.0, fy + 0.22, -8.4, 2.6, 0.12, 1.8);
    addBox(root, unitBox, cream, 32.0, fy + 0.48, -9.1, 2.6, 0.4, 0.18);
    addBox(root, unitBox, chrome, 32.0, fy + 0.7, -8.5, 1.1, 0.9, 0.7);
    addBox(root, unitBox, cream, 32.0, fy + 1.05, -8.5, 0.9, 0.08, 0.55);
    addBox(root, unitBox, new THREE.MeshBasicMaterial({ color: 0x88ccee }), 32.0, fy + 1.18, -8.5, 0.7, 0.16, 0.5);
    addBox(root, unitBox, wood, 21.2, fy + 0.22, 7.3, 2.8, 0.14, 1.6);
    addBox(root, unitBox, cream, 21.2, fy + 0.48, 7.9, 2.8, 0.38, 0.22);
    addBox(root, unitBox, new THREE.MeshBasicMaterial({ color: 0xffc078, transparent: true, opacity: 0.35 }), 21.2, fy + 1.55, 12.35, 2.4, 1.5, 0.04);
    const fourb = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), new THREE.MeshBasicMaterial({ map: neonCanvas("4B", "#E0B25A", 256, 128, "#120c08") }));
    fourb.position.set(30.2, fy + 1.55, -2.2);
    fourb.rotation.y = Math.PI / 2;
    root.add(fourb);
    addBox(root, unitBox, black, 27.65, 0.02, -2, 21.8, 0.04, 28.4);
    addBox(root, unitBox, wood, 25.2, 0.55, 5.9, 7.4, 1.1, 2.6);
    addBox(root, unitBox, cream, 25.2, 1.2, 5.9, 7.2, 0.08, 2.4);
    addBox(root, unitBox, chrome, 21.4, 0.45, 9.4, 1.1, 0.7, 0.7);
    addBox(root, unitBox, cream, 21.4, 0.85, 9.4, 0.9, 0.12, 0.55);
    addBox(root, unitBox, black, 21.4, 0.22, 9.85, 0.18, 0.18, 0.18);
    const hotelSign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 10), new THREE.MeshBasicMaterial({ map: neonCanvas("HOTEL", "#E0B25A", 256, 1024, "#120c08") }));
    hotelSign.position.set(38.95, 8.2, 4);
    hotelSign.rotation.y = -Math.PI / 2;
    root.add(hotelSign);
    const astoria = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.3), new THREE.MeshBasicMaterial({ map: neonCanvas("ASTORIA", "#FFB25A", 1024, 256, "#120c08") }));
    astoria.position.set(27.6, 10.4, 12.85);
    root.add(astoria);
    addBox(root, unitBox, black, 25, 3.4, 12.78, 6.4, 0.2, 1.8);
    addBox(root, unitBox, neonAmber, 25, 3.35, 13.6, 6.6, 0.06, 0.08);
    for (const x of [20, 25, 30, 35]) {
        for (const y of [5.2, 8.2, 11.2]) {
            if (Math.random() < 0.2) continue;
            addBox(root, unitBox, new THREE.MeshBasicMaterial({ color: Math.random() > 0.35 ? 0xffe7a8 : 0x1a2430 }), x, y, 12.82, 1.4, 1.6, 0.06);
        }
    }

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
    const winOn = new THREE.MeshBasicMaterial({ color: 0xffe2a8 });
    const winWarm = new THREE.MeshBasicMaterial({ color: 0xffc078 });
    const winOff = new THREE.MeshBasicMaterial({ color: 0x1a2030 });
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
            addBox(root, unitBox, black, x, cy + h + 0.18, z, cw + 0.55, 0.36, cd + 0.55);
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

    const onList = winDummy.filter((w) => w.kind === "on");
    const warmList = winDummy.filter((w) => w.kind === "warm");
    const offList = winDummy.filter((w) => w.kind === "off");
    function fillWins(list, material) {
        const mesh = new THREE.InstancedMesh(winGeo, material, Math.max(1, list.length));
        list.forEach((w, i) => {
            _dummy.position.set(w.x, w.y, w.z);
            _dummy.rotation.set(0, w.ry, 0);
            _dummy.scale.set(1, 1, 1);
            _dummy.updateMatrix();
            mesh.setMatrixAt(i, _dummy.matrix);
        });
        root.add(mesh);
        return mesh;
    }
    fillWins(onList, winOn);
    fillWins(warmList, winWarm);
    fillWins(offList, winOff);

    const billboard = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), new THREE.MeshBasicMaterial({ map: marqueeCanvas("MIDTOWN GIN", "THE SMOOTH CENTURY") }));
    billboard.position.set(-16, 36, 47.4);
    root.add(billboard);
    addBox(root, unitBox, black, -16, 36, 47.8, 14.4, 6.4, 0.4);
    const bill2 = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), new THREE.MeshBasicMaterial({ map: marqueeCanvas("LUCKIES", "SO ROUND  ·  SO FIRM") }));
    bill2.position.set(48, 34, 49.2);
    root.add(bill2);

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

    // Street lamps
    const lampLights = [];
    for (const x of [-48, -32, -16, 0, 16, 32, 48]) {
        addBox(root, unitBox, black, x, 2.2, 17.85, 0.12, 4.4, 0.12);
        addBox(root, unitBox, black, x, 4.45, 17.4, 0.08, 0.08, 0.9);
        addBox(root, unitBox, neonAmber, x, 4.35, 16.95, 0.35, 0.22, 0.35);
        const pl = new THREE.PointLight(0xffc078, 18, 11, 2);
        pl.position.set(x, 4.2, 16.9);
        pl.userData.base = 18;
        scene.add(pl);
        lampLights.push(pl);
    }
    for (const x of [-24, 8, 40]) {
        addBox(root, unitBox, black, x, 2.2, 27.9, 0.12, 4.4, 0.12);
        addBox(root, unitBox, neonAmber, x, 4.35, 28.4, 0.35, 0.22, 0.35);
        const pl = new THREE.PointLight(0xffb070, 16, 10, 2);
        pl.position.set(x, 4.2, 28.2);
        pl.userData.base = 16;
        scene.add(pl);
        lampLights.push(pl);
    }

    // Hydrants, mailbox, newsstand, phone booth
    const hydrant = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xb82828, roughness: 0.45, metalness: 0.4 }));
    hydrant.position.set(-4.2, 0.35, 14.9);
    root.add(hydrant);
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x1a3a6a, metalness: 0.3 }), -16.4, 0.7, 15.2, 0.45, 1.3, 0.28);

    addBox(root, unitBox, wood, -11.85, 0.7, 16.1, 2.6, 1.4, 1.3);
    addBox(root, unitBox, black, -11.85, 1.5, 16.1, 2.7, 0.08, 1.4);
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), new THREE.MeshBasicMaterial({ map: gazetteTex() }));
    paper.position.set(-11.2, 1.15, 16.78);
    root.add(paper);

    // Phone booth
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x8b1e1e, metalness: 0.3, roughness: 0.45 }), 7.15, 1.2, 16.25, 0.9, 2.4, 0.9);
    addBox(root, unitBox, glass, 7.15, 1.35, 16.72, 0.7, 1.4, 0.05);
    addBox(root, unitBox, neonRed, 7.15, 2.5, 16.25, 0.95, 0.12, 0.95);

    const under = buildSubway(root, scene, { wood, cream, black, chrome, neonAmber });

    const titles = ["NEON IN THE RAIN", "THE MIDNIGHT VISOR", "ALLEY CATS OF 47TH", "A PIE TO REMEMBER"];
    const titlePlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.1), new THREE.MeshBasicMaterial({ map: neonCanvas(titles[0], "#FFE7A8", 1024, 160, "#100808") }));
    titlePlane.position.set(6.0, 6.55, 31.78);
    root.add(titlePlane);

    const shops = buildShops(root, scene, {
        wood, cream, black, chrome, brick, brickDark, neonRed, neonAmber, neonCyan,
    });

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

    // Rain
    const rainPos = new Float32Array(RAIN_N * 3);
    for (let i = 0; i < RAIN_N; i++) {
        rainPos[i * 3] = (Math.random() - 0.5) * 90;
        rainPos[i * 3 + 1] = Math.random() * 16;
        rainPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({
        color: 0xc8d0d8, size: 0.04, transparent: true, opacity: 0.28, depthWrite: false, sizeAttenuation: true,
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
    for (let i = 0; i < 26; i++) {
        const path = paths[i % 4];
        const h = randomPedestrian(0.13 * i + 0.07);
        const t0 = i / 26;
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
        rain,
        rainGeo,
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
        barberPole: shops.pole,
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
            const tex = neonCanvas(String(line || "NOW SHOWING").slice(0, 28), "#FFE7A8", 1024, 160, "#100808");
            const old = titlePlane.material.map;
            titlePlane.material.map = tex;
            if (old && old !== tex) old.dispose();
        },
    };
}

export function updateCity(city, dt, t, { outside, reduced, lampMul = 1 }) {
    const rainArr = city.rainGeo.attributes.position.array;
    city.rain.visible = !!outside && !reduced;
    if (!reduced) {
        for (let i = 0; i < RAIN_N; i++) {
            rainArr[i * 3 + 1] -= dt * 14;
            rainArr[i * 3] += dt * 1.2;
            if (rainArr[i * 3 + 1] < 0) {
                rainArr[i * 3 + 1] = 12 + Math.random() * 6;
                rainArr[i * 3] = (Math.random() - 0.5) * 90;
                rainArr[i * 3 + 2] = (Math.random() - 0.5) * 80;
            }
        }
        city.rainGeo.attributes.position.needsUpdate = true;
    }

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
        l.intensity = (l.userData.base || 16) * mul;
    }
    if (city.alleyLight) city.alleyLight.intensity = 28 * Math.max(1, mul * 0.85);
    if (city.barberPole) city.barberPole.rotation.y += dt * 2.4;
    updateSubway(city.under, dt);
    if (city.film?.userData.draw) city.film.userData.draw(t);
    if (city.signal?.userData.lamps) {
        const phase = Math.floor(t / 3.2) % 3;
        const L = city.signal.userData.lamps;
        L.red.color.set(phase === 0 ? 0xff3355 : 0x3a1010);
        L.amber.color.set(phase === 1 ? 0xffb25a : 0x3a2810);
        L.green.color.set(phase === 2 ? 0x39ff14 : 0x1a4a32);
    }
}
