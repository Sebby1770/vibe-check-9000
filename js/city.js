import * as THREE from "three";
import { addBox, unitBox, neonCanvas, marqueeCanvas } from "./kit.js";
import { brickTex, darkBrickTex, asphaltTex, sidewalkTex, plasterTex, woodTex, checkerTex, gazetteTex } from "./textures.js";
import { randomPedestrian } from "./human.js";

const RAIN_N = 900;
const STEAM_N = 80;
const _dummy = new THREE.Object3D();

function sedan(scene, { x, z, yaw = 0, taxi = false, color = 0x2a2a32 }) {
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
    const wheelG = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 10);
    const wheels = [];
    for (const [wx, wz] of [[1.15, 0.72], [1.15, -0.72], [-1.2, 0.72], [-1.2, -0.72]]) {
        const w = new THREE.Mesh(wheelG, dark);
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, 0.28, wz);
        g.add(w);
        wheels.push(w);
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

    // Street + sidewalks
    addBox(root, unitBox, walk, 0, -0.04, 15.6, 80, 0.08, 6.4);
    addBox(root, unitBox, asphalt, 0, -0.06, 22.8, 80, 0.08, 8.2);
    addBox(root, unitBox, walk, 0, -0.04, 29.4, 80, 0.08, 5.2);
    addBox(root, unitBox, walk, 0, -0.04, -23.2, 78, 0.08, 13.6);

    // Curb paint
    addBox(root, unitBox, neonAmber, 0, 0.01, 18.75, 80, 0.02, 0.12);
    addBox(root, unitBox, neonAmber, 0, 0.01, 26.85, 80, 0.02, 0.12);

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

    // Hotel shell — lobby is walkable
    addBox(root, unitBox, brickBrown, 20.05, 7.2, 12.62, 7.1, 14.5, 0.28);
    addBox(root, unitBox, brickBrown, 32.6, 7.2, 12.62, 12.4, 14.5, 0.28);
    addBox(root, unitBox, brickBrown, 25.0, 10.4, 12.62, 5.2, 8.2, 0.28);
    addBox(root, unitBox, brickBrown, 38.72, 7.2, -2, 0.28, 14.5, 29);
    addBox(root, unitBox, brickBrown, 27.65, 7.2, -16.58, 22.2, 14.5, 0.28);
    addBox(root, unitBox, brickBrown, 27.65, 14.4, -2, 22.2, 0.4, 29);
    addBox(root, unitBox, cream, 27.65, 4.35, -2, 21.6, 0.2, 28.6);
    addBox(root, unitBox, black, 27.65, 0.02, -2, 21.8, 0.04, 28.4);
    addBox(root, unitBox, wood, 25.2, 0.55, 5.9, 7.4, 1.1, 2.6);
    addBox(root, unitBox, cream, 25.2, 1.2, 5.9, 7.2, 0.08, 2.4);
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

    // Far buildings / skyline
    const skyline = [
        [-32, 36, 14, 18, 10, brickDark],
        [-16, 38, 18, 22, 12, brick],
        [0, 35, 16, 16, 11, brickBrown],
        [18, 40, 22, 14, 13, brickDark],
        [34, 37, 16, 16, 10, brick],
        [-8, 42, 12, 10, 8, brickBrown],
        [8, 44, 10, 8, 7, brick],
    ];
    const windowMats = [];
    const winGeo = new THREE.PlaneGeometry(0.7, 1.0);
    const winOn = new THREE.MeshBasicMaterial({ color: 0xffe7a8 });
    const winOff = new THREE.MeshBasicMaterial({ color: 0x1a2030 });
    let winCount = 0;
    const winDummy = [];
    for (const [x, z, w, d, floors, mat] of skyline) {
        addBox(root, unitBox, mat, x, (floors * 3.2) / 2, z, w, floors * 3.2, d);
        addBox(root, unitBox, black, x, floors * 3.2 + 0.2, z, w + 0.4, 0.4, d + 0.4);
        for (let f = 1; f < floors; f++) {
            for (let i = 0; i < Math.floor(w / 1.6); i++) {
                winCount += 1;
                winDummy.push({
                    x: x - w / 2 + 1.2 + i * 1.6,
                    y: f * 3.2 + 1.2,
                    z: z - d / 2 - 0.03,
                    on: Math.random() > 0.38,
                });
            }
        }
    }
    const windowsOn = new THREE.InstancedMesh(winGeo, winOn, winDummy.filter((w) => w.on).length);
    const windowsOff = new THREE.InstancedMesh(winGeo, winOff, winDummy.filter((w) => !w.on).length);
    let oi = 0; let fi = 0;
    for (const w of winDummy) {
        _dummy.position.set(w.x, w.y, w.z);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.set(1, 1, 1);
        _dummy.updateMatrix();
        if (w.on) windowsOn.setMatrixAt(oi++, _dummy.matrix);
        else windowsOff.setMatrixAt(fi++, _dummy.matrix);
    }
    root.add(windowsOn, windowsOff);

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
    for (const x of [-30, -14, 0, 16, 32]) {
        addBox(root, unitBox, black, x, 2.2, 17.85, 0.12, 4.4, 0.12);
        addBox(root, unitBox, black, x, 4.45, 17.4, 0.08, 0.08, 0.9);
        addBox(root, unitBox, neonAmber, x, 4.35, 16.95, 0.35, 0.22, 0.35);
        const pl = new THREE.PointLight(0xffc078, 22, 12, 2);
        pl.position.set(x, 4.2, 16.9);
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

    // Subway entrance kiosk
    addBox(root, unitBox, greenMat(), -22.4, 1.3, 28.6, 3.4, 2.6, 2.2);
    const subway = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.6), new THREE.MeshBasicMaterial({ map: neonCanvas("SUBWAY", "#39FF14", 512, 128, "#051005") }));
    subway.position.set(-22.4, 2.4, 29.75);
    root.add(subway);
    addBox(root, unitBox, black, -22.4, 0.02, 27.4, 1.6, 0.05, 1.8);

    function greenMat() {
        return new THREE.MeshStandardMaterial({ color: 0x1a4a32, roughness: 0.6, metalness: 0.2 });
    }

    // Theater across the street
    addBox(root, unitBox, brickDark, 8, 9, 36.5, 22, 18, 8);
    const rivoli = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.2), new THREE.MeshBasicMaterial({ map: marqueeCanvas("RIVOLI", "NOW SHOWING") }));
    rivoli.position.set(8, 8.4, 32.35);
    root.add(rivoli);
    const titles = ["NEON IN THE RAIN", "THE MIDNIGHT VISOR", "ALLEY CATS OF 47TH", "A PIE TO REMEMBER"];
    const titlePlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.1), new THREE.MeshBasicMaterial({ map: neonCanvas(titles[0], "#FFE7A8", 1024, 160, "#100808") }));
    titlePlane.position.set(8, 6.6, 32.35);
    root.add(titlePlane);

    // Pharmacy / cigar
    addBox(root, unitBox, brick, -18, 7, 36, 16, 14, 8);
    const pharm = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.3), new THREE.MeshBasicMaterial({ map: neonCanvas("PHARMACY", "#66FFE0", 1024, 256, "#081210") }));
    pharm.position.set(-18, 6.8, 32.05);
    root.add(pharm);

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
        color: 0x9ab0c4, size: 0.045, transparent: true, opacity: 0.55, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(rain);

    // Moon
    const moon = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12), new THREE.MeshBasicMaterial({ color: 0xe8e0c8 }));
    moon.position.set(-28, 28, -8);
    scene.add(moon);
    const moonLight = new THREE.DirectionalLight(0x8899cc, 0.35);
    moonLight.position.set(-20, 30, -10);
    scene.add(moonLight);

    // Cars
    const parked = [
        sedan(scene, { x: -20.1, z: 19.7, yaw: Math.PI / 2, color: 0x3a1a1a }),
        sedan(scene, { x: -6.4, z: 19.7, yaw: Math.PI / 2, color: 0x1a2a3a }),
        sedan(scene, { x: 14.4, z: 19.7, yaw: Math.PI / 2, taxi: true }),
        sedan(scene, { x: 29.4, z: 19.7, yaw: Math.PI / 2, color: 0x2a3a28 }),
    ];
    const traffic = [
        sedan(scene, { x: -40, z: 21.4, yaw: Math.PI / 2, taxi: true }),
        sedan(scene, { x: 20, z: 24.6, yaw: -Math.PI / 2, color: 0x2a2030 }),
        sedan(scene, { x: -10, z: 21.4, yaw: Math.PI / 2, color: 0x3a2a18 }),
    ];

    // Pedestrians on sidewalk loops
    const peds = [];
    const paths = [
        { z: 15.5, x0: -34, x1: 34, speed: 1.15 },
        { z: 15.9, x0: 32, x1: -32, speed: 0.95 },
        { z: 29.2, x0: -30, x1: 30, speed: 1.05 },
    ];
    for (let i = 0; i < 10; i++) {
        const path = paths[i % paths.length];
        const h = randomPedestrian(0.13 * i + 0.07);
        const t0 = i / 10;
        h.userData.path = path;
        h.userData.t = t0;
        const x = path.x0 + (path.x1 - path.x0) * t0;
        h.position.set(x, 0, path.z);
        h.rotation.y = path.x1 > path.x0 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(h);
        peds.push(h);
    }

    const dinerLight = new THREE.PointLight(0xff6655, 35, 12, 2);
    dinerLight.position.set(-27.6, 3.2, 10);
    scene.add(dinerLight);
    const hotelLight = new THREE.PointLight(0xe0b25a, 28, 12, 2);
    hotelLight.position.set(25, 3.2, 10);
    scene.add(hotelLight);

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
    };
}

export function updateCity(city, dt, t, { outside, reduced }) {
    const rainArr = city.rainGeo.attributes.position.array;
    city.rain.visible = !reduced;
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

    for (let i = 0; i < city.traffic.length; i++) {
        const car = city.traffic[i];
        const lane = i % 2 === 0 ? 1 : -1;
        car.position.x += dt * 7.5 * lane;
        if (lane > 0 && car.position.x > 48) car.position.x = -48;
        if (lane < 0 && car.position.x < -48) car.position.x = 48;
        car.rotation.y = lane > 0 ? Math.PI / 2 : -Math.PI / 2;
        for (const w of car.userData.wheels || []) w.rotation.x += dt * 8 * lane;
    }

    for (const ped of city.peds) {
        const path = ped.userData.path;
        const span = path.x1 - path.x0;
        ped.userData.t = (ped.userData.t + (dt * path.speed) / Math.abs(span)) % 1;
        const x = path.x0 + span * ped.userData.t;
        ped.position.x = x;
        ped.position.z = path.z;
        ped.rotation.y = span > 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    if (city.bulbs.length) {
        const on = Math.sin(t * 8) > -0.2;
        for (let i = 0; i < city.bulbs.length; i++) {
            city.bulbs[i].color.set(on || i % 3 === Math.floor(t * 6) % 3 ? 0xffe7a8 : 0x3a2a10);
        }
    }
}
