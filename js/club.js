import * as THREE from "three";
import { NPCS } from "./people.js";
import { SECOND_Y, ATRIUM, STAIRS, FIRE_ESC } from "./zones.js";
import { addBox, unitBox, neonCanvas } from "./kit.js";
import { woodTex, plasterTex, carpetTex, damaskTex } from "./textures.js";
import { createHuman, createCat, randomRaver, randomLounge } from "./human.js";

const FLOOR_N = 16;
const FLOOR_COUNT = FLOOR_N * FLOOR_N;
const LASER_N = 8;
const PARTICLE_N = 280;

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _vibe = new THREE.Color("#ff00ff");

export function buildClub(scene, env) {
    const world = new THREE.Group();
    scene.add(world);

    const woodMap = woodTex();
    const plasterMap = plasterTex();

    const concrete = new THREE.MeshStandardMaterial({ color: 0x17171f, roughness: 0.9, metalness: 0.05, emissive: 0x08060e, emissiveIntensity: 0.22 });
    const concreteDark = new THREE.MeshStandardMaterial({ color: 0x101018, roughness: 0.92, metalness: 0.04 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x2a2a33, roughness: 0.35, metalness: 0.85 });
    const metalDark = new THREE.MeshStandardMaterial({ color: 0x15151c, roughness: 0.4, metalness: 0.7 });
    const wood = new THREE.MeshStandardMaterial({ map: woodMap, roughness: 0.8, metalness: 0.05, color: 0x6a4a38 });
    const plaster = new THREE.MeshStandardMaterial({ map: plasterMap, roughness: 0.85, color: 0xb8a078 });
    const loungeCarpet = new THREE.MeshStandardMaterial({ map: carpetTex(), roughness: 0.88, color: 0x8a3a48 });
    const damask = new THREE.MeshStandardMaterial({ map: damaskTex(), roughness: 0.8, color: 0x7a3040 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.32, metalness: 0.88, emissive: 0x3a2808, emissiveIntensity: 0.18 });
    const marble = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.28, metalness: 0.22 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xe0b25a, roughness: 0.22, metalness: 0.9, emissive: 0x5a3a10, emissiveIntensity: 0.22 });
    const velvet = new THREE.MeshStandardMaterial({ color: 0x5a1020, roughness: 0.85 });
    const emissiveCyan = new THREE.MeshBasicMaterial({ color: 0x00fff7 });
    const emissiveMag = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    const emissiveLime = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
    const emissiveAmber = new THREE.MeshBasicMaterial({ color: 0xffb703 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x88aacc, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.22 });

    // Ground slab + ceiling of ground / floor of 2F pieces
    addBox(world, unitBox, concreteDark, 0, -0.05, -2, 33.2, 0.1, 29.2);
    addBox(world, unitBox, concrete, 0, 8.25, -2, 33.2, 0.14, 29.2);

    // Second-floor plates — full coverage except atrium hole + stair well
    const fy = SECOND_Y;
    addBox(world, unitBox, loungeCarpet, -1.65, fy - 0.04, 8.95, 29.7, 0.1, 7.1); // north, west of stairs
    addBox(world, unitBox, loungeCarpet, 14.85, fy - 0.04, 11.325, 3.3, 0.1, 2.35); // north-east of stair bottom
    addBox(world, unitBox, loungeCarpet, 0, fy - 0.04, -12.05, 33, 0.1, 8.9); // south / stage
    addBox(world, unitBox, loungeCarpet, -11.9, fy - 0.04, -1.1, 9.4, 0.1, 13.0); // west of atrium
    addBox(world, unitBox, loungeCarpet, 10.25, fy - 0.04, -1.1, 5.9, 0.1, 13.0); // east of atrium, west of stairs
    addBox(world, unitBox, loungeCarpet, 14.85, fy - 0.04, -2.725, 3.3, 0.1, 9.75); // east of stairs, south of well
    addBox(world, unitBox, marble, 0, fy + 0.01, ATRIUM.maxZ + 0.22, 15.2, 0.05, 0.44);
    addBox(world, unitBox, marble, 0, fy + 0.01, ATRIUM.minZ - 0.22, 15.2, 0.05, 0.44);
    addBox(world, unitBox, marble, ATRIUM.minX - 0.22, fy + 0.01, -1.1, 0.44, 0.05, 13.4);
    addBox(world, unitBox, marble, ATRIUM.maxX + 0.22, fy + 0.01, -1.1, 0.44, 0.05, 13.4);
    addBox(world, unitBox, gold, 0, fy + 0.03, ATRIUM.maxZ, 14.7, 0.03, 0.08);
    addBox(world, unitBox, gold, 0, fy + 0.03, ATRIUM.minZ, 14.7, 0.03, 0.08);
    addBox(world, unitBox, gold, ATRIUM.minX, fy + 0.03, -1.1, 0.08, 0.03, 13.0);
    addBox(world, unitBox, gold, ATRIUM.maxX, fy + 0.03, -1.1, 0.08, 0.03, 13.0);
    addBox(world, unitBox, marble, 13.2, fy + 0.02, 6.15, 0.22, 0.06, 8.0);
    addBox(world, unitBox, gold, 13.28, fy + 0.05, 6.15, 0.06, 0.03, 8.0);

    // Outer walls (visual; doors cut as gaps)
    addBox(world, unitBox, concrete, -16.58, 4.1, -2, 0.28, 8.3, 29.2);
    addBox(world, unitBox, concrete, 16.58, 4.1, -2, 0.28, 8.3, 29.2);
    // front wall split around door
    addBox(world, unitBox, concrete, -9.05, 4.1, 12.55, 15, 8.3, 0.28);
    addBox(world, unitBox, concrete, 9.05, 4.1, 12.55, 15, 8.3, 0.28);
    addBox(world, unitBox, concrete, 0, 6.35, 12.55, 3.2, 3.8, 0.28);
    // back wall split
    addBox(world, unitBox, concrete, -9, 4.1, -16.55, 15.1, 8.3, 0.28);
    addBox(world, unitBox, concrete, 7.3, 4.1, -16.55, 11.8, 8.3, 0.28);
    addBox(world, unitBox, concrete, 14.9, 2.2, -16.55, 3.6, 4.4, 0.28);
    addBox(world, unitBox, concrete, 16.2, 6.35, -16.55, 0.9, 4.0, 0.28);
    addBox(world, unitBox, concrete, 14.7, 8.05, -16.55, 4.0, 0.6, 0.28);
    addBox(world, unitBox, metal, 13.25, 5.9, -16.5, 0.1, 2.8, 0.18);
    addBox(world, unitBox, metal, 15.8, 5.9, -16.5, 0.1, 2.8, 0.18);
    addBox(world, unitBox, metal, 14.52, 7.35, -16.5, 2.7, 0.1, 0.18);
    addBox(world, unitBox, concrete, 0, 6.35, -16.55, 3.0, 3.8, 0.28);

    // Door frames
    addBox(world, unitBox, metal, -1.55, 1.55, 12.52, 0.12, 3.1, 0.22);
    addBox(world, unitBox, metal, 1.55, 1.55, 12.52, 0.12, 3.1, 0.22);
    addBox(world, unitBox, emissiveMag, 0, 3.18, 12.48, 3.2, 0.08, 0.08);
    addBox(world, unitBox, metal, -1.45, 1.55, -16.52, 0.12, 3.1, 0.22);
    addBox(world, unitBox, metal, 1.45, 1.55, -16.52, 0.12, 3.1, 0.22);
    addBox(world, unitBox, emissiveLime, 0, 3.18, -16.48, 3.0, 0.08, 0.08);

    const exitSign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshBasicMaterial({ map: neonCanvas("EXIT", "#39FF14", 512, 128, "#051005") }));
    exitSign.position.set(0, 3.55, -16.38);
    scene.add(exitSign);

    // Columns
    for (const [x, z] of [[-16.1, -13], [16.1, -13], [-16.1, 12], [16.1, 12], [-16.1, 0], [16.1, 0]]) {
        addBox(world, unitBox, metalDark, x, 4.1, z, 0.5, 8.3, 0.5);
    }

    // Truss + ceiling LEDs
    for (let i = -3; i <= 3; i++) addBox(world, unitBox, metal, 0, 4.05, i * 3.2, 32, 0.1, 0.16);
    for (let i = -2; i <= 3; i++) {
        addBox(world, unitBox, i % 2 ? emissiveMag : emissiveCyan, 0, 4.12, i * 3.4, 16, 0.04, 0.08);
    }

    const hangLeds = [];
    const hangColors = [0xff00aa, 0x00fff7, 0x39ff14, 0xffb703, 0xff2ea6, 0x66ffff, 0xccff00, 0xff66cc];
    for (let i = 0; i < 8; i++) {
        const x = (i - 3.5) * 1.85;
        const z = i % 2 === 0 ? -3.1 : 2.6;
        addBox(world, unitBox, metalDark, x, 3.95, z, 0.05, 0.28, 0.05);
        const mat = new THREE.MeshBasicMaterial({ color: hangColors[i] });
        addBox(world, unitBox, mat, x, 3.78, z, 1.35, 0.07, 0.16);
        hangLeds.push(mat);
    }

    // LED dance floor
    const tileGeo = new THREE.BoxGeometry(0.92, 0.05, 0.92);
    const tileMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const floor = new THREE.InstancedMesh(tileGeo, tileMat, FLOOR_COUNT);
    floor.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    floor.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(FLOOR_COUNT * 3), 3);
    for (let i = 0; i < FLOOR_COUNT; i++) {
        const col = i % FLOOR_N;
        const row = Math.floor(i / FLOOR_N);
        _dummy.position.set(-7.5 + col, 0.02, -7.5 + row);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.set(1, 1, 1);
        _dummy.updateMatrix();
        floor.setMatrixAt(i, _dummy.matrix);
        floor.setColorAt(i, _color.setRGB(0.2, 0.02, 0.3));
    }
    scene.add(floor);
    addBox(world, unitBox, metal, 0, 0.01, 0, 16.4, 0.04, 16.4);

    // DJ stage
    addBox(world, unitBox, metalDark, 0, 0.3, -12, 10, 0.6, 4.2);
    addBox(world, unitBox, metal, 0, 0.64, -12.1, 9.6, 0.08, 3.8);
    addBox(world, unitBox, wood, 0, 1.08, -12.35, 3.4, 0.1, 1.35);
    addBox(world, unitBox, metal, -0.85, 1.2, -12.2, 0.7, 0.12, 0.55);
    addBox(world, unitBox, metal, 0.85, 1.2, -12.2, 0.7, 0.12, 0.55);
    addBox(world, unitBox, emissiveCyan, 0, 1.24, -12.55, 0.42, 0.01, 0.28);
    function speakerStack(x) {
        addBox(world, unitBox, metalDark, x, 0.7, -12.35, 1.1, 1.4, 1.1);
        addBox(world, unitBox, metal, x, 1.7, -12.35, 1.25, 0.7, 1.2);
        addBox(world, unitBox, emissiveMag, x, 1.7, -11.72, 0.7, 0.08, 0.04);
    }
    speakerStack(-5.4);
    speakerStack(5.4);
    addBox(world, unitBox, metal, 0, 1.15, -10.05, 10.1, 0.06, 0.08);

    const ledCanvas = document.createElement("canvas");
    ledCanvas.width = 512;
    ledCanvas.height = 256;
    const ledCtx = ledCanvas.getContext("2d");
    const ledTex = new THREE.CanvasTexture(ledCanvas);
    ledTex.colorSpace = THREE.SRGBColorSpace;
    const ledWall = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 3.2), new THREE.MeshBasicMaterial({ map: ledTex }));
    ledWall.position.set(0, 3.15, -16.32);
    scene.add(ledWall);

    let ledTitle = "VIBE CHECK 9000";
    let ledSub = "NOV 12 1954";
    let ledDirty = true;

    let ledFooter = "47TH STREET  ·  10:00 PM";

    function drawLed(t, bass, clock) {
        const g = ledCtx;
        g.fillStyle = "#050014";
        g.fillRect(0, 0, 512, 256);
        const hex = "#" + _vibe.getHexString();
        g.strokeStyle = hex;
        g.lineWidth = 4;
        g.strokeRect(8, 8, 496, 240);
        for (let i = 0; i < 24; i++) {
            const hgt = 10 + Math.abs(Math.sin(t * 4 + i * 0.4)) * 70 * (0.35 + bass);
            g.fillStyle = i % 3 === 0 ? hex : i % 3 === 1 ? "#00fff7" : "#39ff14";
            g.fillRect(18 + i * 20, 210 - hgt, 14, hgt);
        }
        g.font = "800 34px Georgia, serif";
        g.fillStyle = hex;
        g.textAlign = "center";
        g.shadowColor = hex;
        g.shadowBlur = 16;
        g.fillText(ledTitle.slice(0, 28), 256, 70);
        g.shadowBlur = 0;
        g.font = "700 18px Georgia, serif";
        g.fillStyle = "#00fff7";
        g.fillText(ledSub, 256, 108);
        g.fillStyle = "#817e9f";
        const foot = clock ? `47TH STREET  ·  ${clock}` : ledFooter;
        g.fillText(foot, 256, 150);
        ledTex.needsUpdate = true;
    }

    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.08, envMap: env, envMapIntensity: 1.6 });
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 2), ballMat);
    ball.position.set(0, 3.55, 0);
    scene.add(ball);
    addBox(world, unitBox, metal, 0, 3.9, 0, 0.06, 0.7, 0.06);

    const laserGeo = new THREE.CylinderGeometry(0.025, 0.045, 14, 5, 1, true);
    const laserColors = [0xff00ff, 0x00fff7, 0x39ff14, 0xff2ea6, 0x66ffff, 0xccff00, 0xff66cc, 0x00ffc8];
    const lasers = [];
    for (let i = 0; i < LASER_N; i++) {
        const mat = new THREE.MeshBasicMaterial({
            color: laserColors[i], transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        });
        const beam = new THREE.Mesh(laserGeo, mat);
        beam.position.y = -7;
        const pivot = new THREE.Group();
        const ang = (i / LASER_N) * Math.PI * 2;
        pivot.position.set(Math.cos(ang) * 6.2, 4.05, Math.sin(ang) * 6.2);
        pivot.add(beam);
        scene.add(pivot);
        lasers.push({ pivot, mat, phase: i * 0.9 });
    }

    const washGeo = new THREE.PlaneGeometry(4.8, 0.18);
    const washes = [];
    for (let i = 0; i < 8; i++) {
        const mat = new THREE.MeshBasicMaterial({
            color: i % 2 ? 0xff00aa : 0x00fff7, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        const w = new THREE.Mesh(washGeo, mat);
        w.position.set(i < 4 ? -16.35 : 16.35, 1.8 + (i % 4) * 0.7, -6 + (i % 4) * 4);
        w.rotation.y = i < 4 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(w);
        washes.push(mat);
    }

    const pPos = new Float32Array(PARTICLE_N * 3);
    const pCol = new Float32Array(PARTICLE_N * 3);
    const pVel = new Float32Array(PARTICLE_N);
    const pPalette = [[1, 0, 1], [0, 1, 0.97], [0.22, 1, 0.08], [1, 0.3, 0.7], [0.6, 0.2, 1]];
    for (let i = 0; i < PARTICLE_N; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 30;
        pPos[i * 3 + 1] = Math.random() * 3.8;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 24;
        pVel[i] = 0.12 + Math.random() * 0.35;
        const c = pPalette[i % pPalette.length];
        pCol[i * 3] = c[0]; pCol[i * 3 + 1] = c[1]; pCol[i * 3 + 2] = c[2];
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        size: 0.07, vertexColors: true, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(particles);

    // Bar
    addBox(world, unitBox, wood, -15, 0.55, 0, 1.1, 1.1, 16);
    addBox(world, unitBox, metalDark, -15.7, 1.6, 0, 0.2, 2.2, 16);
    addBox(world, unitBox, emissiveMag, -15, 0.06, 0, 1.0, 0.04, 15.6);
    addBox(world, unitBox, emissiveCyan, -15.55, 1.15, 0, 0.06, 0.05, 15.4);
    const bottleGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.32, 6);
    const bottleMat = new THREE.MeshStandardMaterial({ color: 0x1a3322, roughness: 0.3, metalness: 0.4, transparent: true, opacity: 0.85 });
    const bottles = new THREE.InstancedMesh(bottleGeo, bottleMat, 40);
    for (let i = 0; i < 40; i++) {
        _dummy.position.set(-15.55 - (i % 2) * 0.12, 1.35 + (i % 5) * 0.22, -7.4 + i * 0.38);
        _dummy.scale.set(1, 0.75 + (i % 4) * 0.22, 1);
        _dummy.rotation.set(0, 0, 0);
        _dummy.updateMatrix();
        bottles.setMatrixAt(i, _dummy.matrix);
    }
    scene.add(bottles);
    addBox(world, unitBox, metal, -15.55, 1.85, 0, 0.08, 0.04, 15.2);
    addBox(world, unitBox, metal, -15.55, 2.25, 0, 0.08, 0.04, 15.2);
    const glassGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.12, 8);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccee, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.45 });
    const glasses = new THREE.InstancedMesh(glassGeo, glassMat, 10);
    for (let i = 0; i < 10; i++) {
        _dummy.position.set(-14.55, 1.16, -6.5 + i * 1.4);
        _dummy.scale.set(1, 1, 1);
        _dummy.rotation.set(0, 0, 0);
        _dummy.updateMatrix();
        glasses.setMatrixAt(i, _dummy.matrix);
    }
    scene.add(glasses);
    const stoolGeo = new THREE.CylinderGeometry(0.2, 0.17, 0.07, 10);
    for (let i = 0; i < 7; i++) {
        const z = i === 6 ? -8.35 : -6 + i * 2.2;
        addBox(world, unitBox, metalDark, -14.15, 0.34, z, 0.08, 0.68, 0.08);
        const s = new THREE.Mesh(stoolGeo, metal);
        s.position.set(-14.15, 0.7, z);
        scene.add(s);
        addBox(world, unitBox, metalDark, -14.15, 0.92, z + 0.14, 0.22, 0.32, 0.06);
    }

    // Photo booth + coat rumor
    addBox(world, unitBox, metalDark, -8.2, 1.15, 10.55, 1.35, 2.3, 1.1);
    addBox(world, unitBox, emissiveMag, -8.2, 1.35, 10.02, 1.05, 1.4, 0.04);
    addBox(world, unitBox, emissiveCyan, -8.2, 2.15, 10.02, 0.7, 0.12, 0.04);
    addBox(world, unitBox, wood, 8.15, 0.95, 10.45, 1.2, 1.9, 0.35);
    addBox(world, unitBox, metal, 8.15, 1.85, 10.45, 1.15, 0.06, 0.08);
    addBox(world, unitBox, metalDark, 7.7, 1.35, 10.55, 0.08, 0.7, 0.08);
    addBox(world, unitBox, metalDark, 8.6, 1.35, 10.55, 0.08, 0.7, 0.08);

    // Ground-floor VIP couches
    for (const [x, z, rot] of [[13.6, -4.2, -0.4], [13.6, 1.8, 0.25], [13.2, 6.6, 0.15]]) {
        addBox(world, unitBox, wood, x, 0.32, z, 2.0, 0.28, 0.78);
        addBox(world, unitBox, metalDark, x, 0.58, z - 0.28, 2.0, 0.48, 0.18);
        addBox(world, unitBox, emissiveAmber, x, 0.78, z + 0.1, 0.12, 0.04, 0.12);
    }

    // Signs
    const signVc = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.15), new THREE.MeshBasicMaterial({ map: neonCanvas("VIBE CHECK 9000", "#00FFF7") }));
    signVc.position.set(0, 3.55, 12.38);
    signVc.rotation.y = Math.PI;
    scene.add(signVc);

    // Stairs with a continuous gold handrail
    const steps = 14;
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const z = STAIRS.zBottom - t * (STAIRS.zBottom - STAIRS.zTop);
        const y = t * SECOND_Y;
        addBox(world, unitBox, marble, 14.75, y + 0.04, z, 2.9, 0.08, 0.62);
        addBox(world, unitBox, gold, 14.75, y + 0.085, z, 2.9, 0.02, 0.08);
    }
    const dzStair = STAIRS.zBottom - STAIRS.zTop;
    const stairLen = Math.hypot(dzStair, SECOND_Y);
    const stairAng = Math.atan2(SECOND_Y, dzStair);
    const hand = addBox(world, unitBox, brass, 13.22, SECOND_Y / 2 + 0.92, (STAIRS.zBottom + STAIRS.zTop) / 2, 0.08, 0.07, stairLen);
    hand.rotation.x = -stairAng;
    const hand2 = addBox(world, unitBox, brass, 16.28, SECOND_Y / 2 + 0.92, (STAIRS.zBottom + STAIRS.zTop) / 2, 0.08, 0.07, stairLen);
    hand2.rotation.x = -stairAng;
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const z = STAIRS.zBottom - t * dzStair;
        const y = t * SECOND_Y;
        addBox(world, unitBox, brass, 13.22, y + 0.5, z, 0.045, 0.85, 0.045);
        addBox(world, unitBox, brass, 16.28, y + 0.5, z, 0.045, 0.85, 0.045);
    }

    function luxRailX(z, x0, x1) {
        const cx = (x0 + x1) / 2;
        const len = Math.abs(x1 - x0);
        addBox(world, unitBox, marble, cx, fy + 0.08, z, len, 0.16, 0.3);
        addBox(world, unitBox, brass, cx, fy + 0.44, z, len, 0.045, 0.07);
        addBox(world, unitBox, brass, cx, fy + 0.98, z, len + 0.08, 0.08, 0.12);
        const n = Math.max(2, Math.round(len / 0.3));
        for (let i = 0; i <= n; i++) {
            const x = x0 + (i / n) * (x1 - x0);
            addBox(world, unitBox, brass, x, fy + 0.52, z, 0.04, 0.78, 0.04);
        }
    }
    function luxRailZ(x, z0, z1) {
        const cz = (z0 + z1) / 2;
        const len = Math.abs(z1 - z0);
        addBox(world, unitBox, marble, x, fy + 0.08, cz, 0.3, 0.16, len);
        addBox(world, unitBox, brass, x, fy + 0.44, cz, 0.07, 0.045, len);
        addBox(world, unitBox, brass, x, fy + 0.98, cz, 0.12, 0.08, len + 0.08);
        const n = Math.max(2, Math.round(len / 0.3));
        for (let i = 0; i <= n; i++) {
            const z = z0 + (i / n) * (z1 - z0);
            addBox(world, unitBox, brass, x, fy + 0.52, z, 0.04, 0.78, 0.04);
        }
    }
    function newel(x, z) {
        addBox(world, unitBox, gold, x, fy + 0.55, z, 0.16, 1.1, 0.16);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), gold);
        orb.position.set(x, fy + 1.18, z);
        world.add(orb);
    }
    luxRailX(ATRIUM.maxZ + 0.12, ATRIUM.minX, ATRIUM.maxX);
    luxRailX(ATRIUM.minZ - 0.12, ATRIUM.minX, ATRIUM.maxX);
    luxRailZ(ATRIUM.minX - 0.12, ATRIUM.minZ, ATRIUM.maxZ);
    luxRailZ(ATRIUM.maxX + 0.12, ATRIUM.minZ, ATRIUM.maxZ);
    newel(ATRIUM.minX - 0.12, ATRIUM.maxZ + 0.12);
    newel(ATRIUM.maxX + 0.12, ATRIUM.maxZ + 0.12);
    newel(ATRIUM.minX - 0.12, ATRIUM.minZ - 0.12);
    newel(ATRIUM.maxX + 0.12, ATRIUM.minZ - 0.12);

    // Lounge — supper-club walls, stage, tables, chandelier
    addBox(world, unitBox, wood, -16.38, fy + 0.7, -2, 0.08, 1.4, 28.4);
    addBox(world, unitBox, damask, -16.38, fy + 2.4, -2, 0.08, 2.0, 28.4);
    addBox(world, unitBox, wood, 16.38, fy + 0.7, -2, 0.08, 1.4, 28.4);
    addBox(world, unitBox, damask, 16.38, fy + 2.4, -2, 0.08, 2.0, 28.4);
    addBox(world, unitBox, brass, -16.36, fy + 1.42, -2, 0.04, 0.05, 28.4);
    addBox(world, unitBox, brass, 16.36, fy + 1.42, -2, 0.04, 0.05, 28.4);

    addBox(world, unitBox, wood, 0, fy + 0.22, -13.2, 7.2, 0.44, 2.6);
    addBox(world, unitBox, brass, 0, fy + 1.15, -14.45, 6.2, 0.06, 0.08);
    const curtain = addBox(world, unitBox, new THREE.MeshStandardMaterial({ color: 0x5a1020, roughness: 0.8 }), 0, fy + 1.7, -14.58, 7.4, 2.4, 0.08);
    curtain.material.emissive = new THREE.Color(0x300010);
    curtain.material.emissiveIntensity = 0.28;
    addBox(world, unitBox, wood, -1.7, fy + 0.55, -13.4, 1.7, 0.55, 0.85);
    addBox(world, unitBox, brass, -1.7, fy + 0.86, -13.4, 1.5, 0.04, 0.7);
    addBox(world, unitBox, new THREE.MeshBasicMaterial({ color: 0xf2eee0 }), -1.7, fy + 0.84, -13.15, 1.35, 0.02, 0.18);
    addBox(world, unitBox, metalDark, 1.8, fy + 0.7, -13.15, 0.35, 0.9, 0.35);
    addBox(world, unitBox, wood, 1.8, fy + 1.15, -13.15, 0.55, 0.12, 0.18);
    addBox(world, unitBox, metal, 0.15, fy + 1.35, -12.55, 0.04, 1.1, 0.04);
    addBox(world, unitBox, metal, 0.15, fy + 1.95, -12.4, 0.08, 0.06, 0.12);

    function chandelier(x, z) {
        addBox(world, unitBox, brass, x, fy + 3.55, z, 0.06, 0.55, 0.06);
        addBox(world, unitBox, gold, x, fy + 3.22, z, 0.95, 0.07, 0.95);
        addBox(world, unitBox, brass, x, fy + 3.05, z, 0.55, 0.05, 0.55);
        for (const [dx, dz] of [[0.34, 0.34], [-0.34, 0.34], [0.34, -0.34], [-0.34, -0.34], [0.46, 0], [-0.46, 0], [0, 0.46], [0, -0.46]]) {
            addBox(world, unitBox, emissiveAmber, x + dx, fy + 2.95, z + dz, 0.1, 0.16, 0.1);
        }
    }
    chandelier(-11.2, 6.4);
    chandelier(10.6, 6.2);
    chandelier(-10.8, -4.5);
    chandelier(10.4, -5.2);
    chandelier(-11.0, 1.0);
    chandelier(10.5, 1.2);

    for (let i = -3; i <= 3; i++) {
        addBox(world, unitBox, gold, 0, 8.05, i * 3.4, 32, 0.08, 0.16);
    }
    for (let i = -4; i <= 4; i++) {
        addBox(world, unitBox, gold, i * 3.6, 8.05, -2, 0.16, 0.08, 28);
    }

    for (const [x, z] of [[-16.2, 8], [-16.2, 2], [-16.2, -4], [-16.2, -10], [16.2, 8], [16.2, 2], [16.2, -4], [16.2, -10]]) {
        addBox(world, unitBox, brass, x, fy + 2.15, z, 0.08, 0.22, 0.22);
        addBox(world, unitBox, emissiveAmber, x + Math.sign(x) * -0.08, fy + 2.05, z, 0.1, 0.16, 0.16);
    }

    addBox(world, unitBox, velvet, -14.8, fy + 0.42, 0.6, 1.6, 0.55, 9.0);
    addBox(world, unitBox, velvet, -14.8, fy + 0.72, 0.6, 0.35, 0.7, 9.0);
    addBox(world, unitBox, gold, -14.8, fy + 0.16, 0.6, 1.7, 0.05, 9.1);

    const loungeTables = [
        [-12.2, 7.0], [-9.4, 6.5], [-12.4, 4.2],
        [9.2, 7.1], [11.4, 5.4],
        [-11.6, -3.4], [-9.2, -5.6],
        [9.6, -4.2], [11.5, -6.4],
        [-12.0, 1.2],
    ];
    for (const [x, z] of loungeTables) {
        addBox(world, unitBox, marble, x, fy + 0.4, z, 1.05, 0.07, 1.05);
        addBox(world, unitBox, brass, x, fy + 0.2, z, 0.09, 0.38, 0.09);
        addBox(world, unitBox, new THREE.MeshStandardMaterial({ color: 0xf4eee0, roughness: 0.85 }), x, fy + 0.445, z, 1.0, 0.02, 1.0);
        addBox(world, unitBox, emissiveAmber, x, fy + 0.56, z, 0.07, 0.18, 0.07);
        addBox(world, unitBox, gold, x, fy + 0.66, z, 0.04, 0.04, 0.04);
        for (const sx of [-0.72, 0.72]) {
            addBox(world, unitBox, velvet, x + sx, fy + 0.24, z, 0.5, 0.12, 0.48);
            addBox(world, unitBox, velvet, x + sx, fy + 0.5, z + (sx > 0 ? 0.16 : -0.16), 0.5, 0.4, 0.12);
        }
    }

    addBox(world, unitBox, velvet, 10.6, fy + 0.28, 8.55, 3.6, 0.28, 1.15);
    addBox(world, unitBox, velvet, 10.6, fy + 0.48, 9.0, 3.6, 0.42, 0.28);
    addBox(world, unitBox, gold, 10.6, fy + 0.12, 8.55, 3.7, 0.05, 1.25);
    addBox(world, unitBox, velvet, 9.2, fy + 0.42, 8.55, 0.45, 0.22, 0.7);
    addBox(world, unitBox, velvet, 12.0, fy + 0.42, 8.55, 0.45, 0.22, 0.7);

    addBox(world, unitBox, velvet, 12.7, fy + 0.32, 2.6, 1.15, 0.38, 1.15);
    addBox(world, unitBox, velvet, 13.15, fy + 0.62, 2.6, 0.28, 0.55, 1.15);
    addBox(world, unitBox, gold, 12.7, fy + 0.12, 2.6, 1.25, 0.05, 1.25);
    addBox(world, unitBox, velvet, 11.15, fy + 0.32, 1.1, 1.15, 0.38, 1.15);
    addBox(world, unitBox, velvet, 10.7, fy + 0.62, 1.1, 0.28, 0.55, 1.15);
    addBox(world, unitBox, marble, 11.9, fy + 0.28, 1.85, 0.7, 0.08, 0.7);
    addBox(world, unitBox, brass, 11.9, fy + 0.16, 1.85, 0.08, 0.22, 0.08);
    addBox(world, unitBox, emissiveAmber, 11.9, fy + 0.42, 1.85, 0.08, 0.14, 0.08);

    addBox(world, unitBox, gold, 13.4, fy + 1.15, 8.4, 0.08, 2.2, 0.08);
    addBox(world, unitBox, emissiveAmber, 13.4, fy + 2.35, 8.4, 0.35, 0.12, 0.35);
    addBox(world, unitBox, brass, 13.4, fy + 2.22, 8.4, 0.5, 0.05, 0.5);

    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.32, 10), brass);
    bucket.position.set(12.4, fy + 0.55, 7.7);
    world.add(bucket);
    addBox(world, unitBox, new THREE.MeshStandardMaterial({ color: 0xc9e8c4, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.45 }), 12.4, fy + 0.78, 7.7, 0.08, 0.28, 0.08);

    addBox(world, unitBox, marble, -14.6, fy + 0.58, -8.2, 1.5, 0.12, 4.8);
    addBox(world, unitBox, wood, -14.6, fy + 0.28, -8.2, 1.4, 0.55, 4.6);
    addBox(world, unitBox, gold, -14.6, fy + 0.66, -8.2, 1.45, 0.04, 4.7);
    addBox(world, unitBox, emissiveAmber, -14.6, fy + 0.08, -8.2, 1.2, 0.04, 4.4);

    addBox(world, unitBox, metalDark, 11.15, fy + 0.7, -9.35, 0.7, 1.4, 0.45);
    addBox(world, unitBox, emissiveMag, 11.15, fy + 0.9, -9.12, 0.55, 0.7, 0.04);
    addBox(world, unitBox, emissiveCyan, 11.15, fy + 0.5, -9.12, 0.4, 0.12, 0.04);

    for (const x of [-12, -7.5, -3, 3, 7.5, 12]) {
        addBox(world, unitBox, glass, x, fy + 1.65, 12.42, 3.4, 1.9, 0.06);
        addBox(world, unitBox, brass, x, fy + 1.65, 12.5, 3.6, 2.1, 0.04);
        addBox(world, unitBox, new THREE.MeshBasicMaterial({
            color: 0xffb070, transparent: true, opacity: 0.22, depthWrite: false,
        }), x, fy + 1.65, 12.55, 3.2, 1.7, 0.02);
    }

    for (const [x, z] of [[-15.6, 8], [-15.6, -8], [15.6, 8], [15.6, -9]]) {
        addBox(world, unitBox, wood, x, fy + 1.5, z, 0.08, 1.4, 1.1);
        addBox(world, unitBox, brass, x, fy + 1.5, z, 0.1, 1.5, 1.2);
    }

    // Fire escape
    const feSteps = 12;
    for (let i = 0; i < feSteps; i++) {
        const t = i / (feSteps - 1);
        const z = FIRE_ESC.zTop - t * (FIRE_ESC.zTop - FIRE_ESC.zBottom);
        const y = SECOND_Y * (1 - t);
        addBox(world, unitBox, metal, 14.5, y + 0.04, z, 2.4, 0.05, 0.55);
        addBox(world, unitBox, metal, 13.28, y + 0.5, z, 0.04, 0.95, 0.04);
        addBox(world, unitBox, metal, 15.72, y + 0.5, z, 0.04, 0.95, 0.04);
    }
    addBox(world, unitBox, metal, 14.5, SECOND_Y + 0.05, -16.7, 2.5, 0.06, 1.1);

    // Cube
    const secretCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.28, 0.28),
        new THREE.MeshStandardMaterial({ color: 0xfff700, emissive: 0xfff700, emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.25 }),
    );
    secretCube.position.set(-14.2, 0.42, 8.95);
    scene.add(secretCube);

    // Named people
    const namedPeople = NPCS.map((npc) => {
        let obj;
        if (npc.kind === "cat") obj = createCat(npc.skin || 0xcfc8bc);
        else {
            obj = createHuman({
                outfit: npc.outfit,
                skin: npc.skin,
                hair: npc.hair,
                hairStyle: npc.hairStyle,
                name: npc.name,
                color: npc.color,
                accent: npc.color,
                anim: npc.anim,
                scale: npc.id === "rexa" ? 1.06 : 1,
            });
        }
        obj.position.set(npc.x, npc.y || 0, npc.z);
        obj.rotation.y = npc.facing || 0;
        if (npc.anim === "dance") obj.userData.danceStyle = npc.id === "rexa" ? 1 : npc.id === "pixel" ? 0 : 3;
        scene.add(obj);
        return { id: npc.id, obj, npc, x: npc.x, z: npc.z, y: npc.y || 0 };
    });

    function taken(x, z, y, pad = 1.25) {
        if (NPCS.some((n) => Math.abs((n.y || 0) - y) < 1.5 && Math.hypot(x - n.x, z - n.z) < pad)) return true;
        return false;
    }

    function placePerson(h, x, z, y, yaw, mode, extra = {}) {
        h.position.set(x, y, z);
        h.rotation.y = yaw;
        h.userData.mode = mode;
        if (extra.danceStyle != null) h.userData.danceStyle = extra.danceStyle;
        scene.add(h);
        return h;
    }

    const dancers = [];
    const rings = [[2.15, 8], [3.35, 12], [4.55, 14], [5.85, 10]];
    let di = 0;
    for (const [rad, n] of rings) {
        for (let i = 0; i < n; i++) {
            const ang = (i / n) * Math.PI * 2 + rad;
            const x = Math.cos(ang) * rad;
            const z = Math.sin(ang) * rad * 0.92;
            if (taken(x, z, 0, 1.35)) continue;
            dancers.push(placePerson(randomRaver(0.17 * di + 0.11), x, z, 0, ang + Math.PI, "dance", { danceStyle: di % 7 }));
            di += 1;
        }
    }
    for (const [x, z, yaw] of [[8.6, 2.2, -1.2], [8.2, -2.8, 2.1], [-8.4, 4.1, 0.6], [-7.8, -6.2, 2.8], [9.4, 5.5, -0.4], [-9.1, 1.2, 1.4]]) {
        if (taken(x, z, 0)) continue;
        dancers.push(placePerson(randomRaver(0.4 + Math.abs(x) * 0.07), x, z, 0, yaw, "dance", { danceStyle: (di++) % 7 }));
    }

    const barCrowd = [];
    const stoolZ = [-6, -3.8, -1.6, 2.8, 5.0, 7.2];
    for (let i = 0; i < stoolZ.length; i++) {
        const z = stoolZ[i];
        if (taken(-14.15, z, 0, 1.1)) continue;
        const h = placePerson(randomRaver(0.55 + i * 0.13, { outfit: i % 2 ? "raver" : "host", anim: "sit" }), -14.15, z, 0, -Math.PI / 2, "sit");
        h.userData.sitHips = 0.7;
        barCrowd.push(h);
    }
    for (const [x, z] of [[-13.05, -5.1], [-13.1, -2.4], [-13.0, 1.7], [-13.12, 4.15], [-12.85, 6.4], [-12.6, -7.2]]) {
        if (taken(x, z, 0, 1.0)) continue;
        barCrowd.push(placePerson(randomRaver(0.8 + Math.abs(z) * 0.05, { anim: "lean" }), x, z, 0, -Math.PI / 2, "lean"));
    }
    for (const [x, z] of [[13.5, -4.0], [13.55, 1.95], [13.15, 6.45]]) {
        const h = placePerson(randomRaver(1.1 + x * 0.02, { outfit: "host", anim: "sit" }), x, z, 0, -Math.PI / 2, "sit");
        h.userData.sitHips = 0.48;
        barCrowd.push(h);
    }

    const loungeCrowd = [];
    const seatPairs = [
        [-12.2, 7.0], [-9.4, 6.5], [-12.4, 4.2],
        [9.2, 7.1], [11.4, 5.4],
        [-11.6, -3.4], [-9.2, -5.6],
        [9.6, -4.2], [11.5, -6.4],
        [-12.0, 1.2],
    ];
    for (let i = 0; i < seatPairs.length; i++) {
        const [x, z] = seatPairs[i];
        const a = [x + 0.72, z];
        const b = [x - 0.72, z];
        if (!taken(a[0], a[1], fy, 1.15)) {
            const h = placePerson(randomLounge(0.21 * i + 0.04, { anim: "sit" }), a[0], a[1], fy, -Math.PI / 2, "sit");
            h.userData.sitHips = 0.46;
            loungeCrowd.push(h);
        }
        if (!taken(b[0], b[1], fy, 1.15)) {
            const h = placePerson(randomLounge(0.33 * i + 0.18, { anim: "sit" }), b[0], b[1], fy, Math.PI / 2, "sit");
            h.userData.sitHips = 0.46;
            loungeCrowd.push(h);
        }
    }
    for (const [x, z, yaw] of [[-7.95, 4.9, 0], [7.95, 4.6, Math.PI], [-7.95, -6.4, 0], [7.95, -6.1, Math.PI], [-7.95, 0.8, 0], [8.0, -1.2, Math.PI]]) {
        loungeCrowd.push(placePerson(randomLounge(1.4 + x * 0.03, { anim: "lean" }), x, z, fy, yaw, "lean"));
    }
    for (const [x, z, yaw] of [[-4.4, -11.2, 0.2], [4.2, -11.0, -0.15], [-14.2, -6.5, Math.PI / 2], [8.4, 8.6, Math.PI]]) {
        loungeCrowd.push(placePerson(randomLounge(2.1 + Math.abs(z) * 0.02, { anim: "idle", outfit: "clerk" }), x, z, fy, yaw, "idle"));
    }

    const lights = {
        hemi: null,
        spot: null,
        booth: null,
        bar: null,
        lounge: null,
    };

    const spot = new THREE.SpotLight(0xff66cc, 380, 36, Math.PI / 5.5, 0.45, 1.1);
    spot.position.set(0, 3.9, -11.2);
    scene.add(spot);
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 0);
    scene.add(spotTarget);
    spot.target = spotTarget;
    const boothFill = new THREE.PointLight(0x66ffff, 55, 14, 2);
    boothFill.position.set(0, 2.8, -12);
    scene.add(boothFill);
    const barLight = new THREE.PointLight(0xff2299, 70, 14, 2);
    barLight.position.set(-14.5, 1.4, 0);
    scene.add(barLight);
    const loungeLight = new THREE.PointLight(0xe0b25a, 55, 18, 2);
    loungeLight.position.set(0, fy + 2.2, -12);
    scene.add(loungeLight);
    const loungeWarm = new THREE.PointLight(0xffc090, 36, 14, 2);
    loungeWarm.position.set(-11, fy + 2.4, 6);
    scene.add(loungeWarm);
    const loungeWarm2 = new THREE.PointLight(0xffb070, 28, 12, 2);
    loungeWarm2.position.set(10.5, fy + 2.3, 6);
    scene.add(loungeWarm2);
    const windowDusk = new THREE.PointLight(0xff8a50, 22, 10, 2);
    windowDusk.position.set(0, fy + 2.0, 11.2);
    scene.add(windowDusk);
    lights.spot = spot;
    lights.booth = boothFill;
    lights.bar = barLight;
    lights.lounge = loungeLight;
    lights.loungeWarm = loungeWarm;
    lights.loungeWarm2 = loungeWarm2;
    lights.windowDusk = windowDusk;
    lights.spotTarget = spotTarget;

    return {
        world,
        floor,
        ball,
        lasers,
        washes,
        hangLeds,
        particles,
        pGeo,
        pVel,
        namedPeople,
        dancers,
        barCrowd,
        loungeCrowd,
        secretCube,
        lights,
        drawLed,
        setLed(title, sub) {
            ledTitle = title || ledTitle;
            ledSub = sub || ledSub;
            ledDirty = true;
        },
        ledDirtyRef: () => ledDirty,
        markLedClean() { ledDirty = false; },
        vibe: _vibe,
    };
}
