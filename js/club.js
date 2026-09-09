import * as THREE from "three";
import { NPCS } from "./people.js";
import { SECOND_Y, ATRIUM, STAIRS, FIRE_ESC } from "./zones.js";
import { addBox, unitBox, neonCanvas } from "./kit.js";
import { woodTex, plasterTex } from "./textures.js";
import { createHuman, createCat } from "./human.js";

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
    const loungeCarpet = new THREE.MeshStandardMaterial({ color: 0x4a1c28, roughness: 0.9 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.35, metalness: 0.85 });
    const emissiveCyan = new THREE.MeshBasicMaterial({ color: 0x00fff7 });
    const emissiveMag = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    const emissiveLime = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
    const emissiveAmber = new THREE.MeshBasicMaterial({ color: 0xffb703 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x88aacc, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.22 });

    // Ground slab + ceiling of ground / floor of 2F pieces
    addBox(world, unitBox, concreteDark, 0, -0.05, -2, 33.2, 0.1, 29.2);
    addBox(world, unitBox, concrete, 0, 8.25, -2, 33.2, 0.14, 29.2);

    // Second-floor plates around atrium
    const fy = SECOND_Y;
    addBox(world, unitBox, loungeCarpet, -1.65, fy - 0.04, 8.95, 29.7, 0.08, 7.1); // street side, not over stairs
    addBox(world, unitBox, loungeCarpet, 14.85, fy - 0.04, 11.32, 3.3, 0.08, 2.35); // east of stair bottom
    addBox(world, unitBox, loungeCarpet, 0, fy - 0.04, -12.05, 33, 0.08, 9.1); // booth side
    addBox(world, unitBox, loungeCarpet, -11.9, fy - 0.04, -1.1, 9.4, 0.08, 13.2); // west
    addBox(world, unitBox, loungeCarpet, 10.25, fy - 0.04, -4.85, 12.2, 0.08, 5.5); // east south of stairs
    addBox(world, unitBox, loungeCarpet, 10.25, fy - 0.04, 1.05, 5.9, 0.08, 2.3); // east landing
    addBox(world, unitBox, loungeCarpet, 14.75, fy - 0.04, 1.35, 3.1, 0.08, 1.6); // stair top landing

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
    addBox(world, unitBox, concrete, 14.55, 1.55, -16.55, 2.9, 3.1, 0.28);
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

    function drawLed(t, bass) {
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
        g.fillText("47TH STREET  ·  DOORS OPEN", 256, 150);
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
    const bottles = new THREE.InstancedMesh(bottleGeo, bottleMat, 28);
    for (let i = 0; i < 28; i++) {
        _dummy.position.set(-15.55, 1.35, -7 + i * 0.52);
        _dummy.scale.set(1, 0.8 + (i % 3) * 0.25, 1);
        _dummy.rotation.set(0, 0, 0);
        _dummy.updateMatrix();
        bottles.setMatrixAt(i, _dummy.matrix);
    }
    scene.add(bottles);
    const stoolGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.08, 8);
    for (let i = 0; i < 6; i++) {
        const s = new THREE.Mesh(stoolGeo, metal);
        s.position.set(-14.15, 0.55, -6 + i * 2.2);
        scene.add(s);
        addBox(world, unitBox, metalDark, -14.15, 0.25, -6 + i * 2.2, 0.08, 0.5, 0.08);
    }

    // Signs
    const signVc = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.15), new THREE.MeshBasicMaterial({ map: neonCanvas("VIBE CHECK 9000", "#00FFF7") }));
    signVc.position.set(0, 3.55, 12.38);
    signVc.rotation.y = Math.PI;
    scene.add(signVc);

    // Stairs
    const steps = 14;
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const z = STAIRS.zBottom - t * (STAIRS.zBottom - STAIRS.zTop);
        const y = t * SECOND_Y;
        addBox(world, unitBox, metalDark, 14.75, y + 0.04, z, 2.9, 0.08, 0.62);
        addBox(world, unitBox, brass, 13.18, y + 0.55, z, 0.05, 1.05, 0.08);
    }
    addBox(world, unitBox, brass, 13.18, 2.4, 6.15, 0.05, 0.05, 8.1);

    // Atrium rail
    const rail = (x, y, z, sx, sy, sz) => addBox(world, unitBox, brass, x, y, z, sx, sy, sz);
    rail(0, fy + 0.55, ATRIUM.maxZ + 0.08, 14.8, 0.05, 0.05);
    rail(0, fy + 0.55, ATRIUM.minZ - 0.08, 14.8, 0.05, 0.05);
    rail(ATRIUM.minX - 0.08, fy + 0.55, -1.1, 0.05, 0.05, 13);
    rail(ATRIUM.maxX + 0.08, fy + 0.55, -2.7, 0.05, 0.05, 9.4);
    for (let i = -6; i <= 6; i++) {
        rail(i * 1.1, fy + 0.28, ATRIUM.maxZ + 0.08, 0.04, 0.55, 0.04);
        rail(i * 1.1, fy + 0.28, ATRIUM.minZ - 0.08, 0.04, 0.55, 0.04);
    }

    // Lounge stage + chairs + jukebox
    addBox(world, unitBox, wood, 0, fy + 0.2, -13.2, 6.4, 0.4, 2.4);
    addBox(world, unitBox, brass, 0, fy + 1.1, -14.4, 5.2, 0.06, 0.08);
    const curtain = addBox(world, unitBox, new THREE.MeshStandardMaterial({ color: 0x5a1020, roughness: 0.8 }), 0, fy + 1.6, -14.55, 6.6, 2.2, 0.08);
    curtain.material.emissive = new THREE.Color(0x200008);
    curtain.material.emissiveIntensity = 0.2;

    for (const [x, z] of [[-12.4, 6.2], [-10.2, 6.8], [-12.6, 4.1], [9.4, 7.2]]) {
        addBox(world, unitBox, wood, x, fy + 0.22, z, 1.5, 0.12, 0.7);
        addBox(world, unitBox, metalDark, x, fy + 0.42, z - 0.28, 1.5, 0.42, 0.12);
        addBox(world, unitBox, emissiveAmber, x, fy + 0.72, z, 0.1, 0.04, 0.1);
    }

    addBox(world, unitBox, metalDark, 11.15, fy + 0.7, -9.35, 0.7, 1.4, 0.45);
    addBox(world, unitBox, emissiveMag, 11.15, fy + 0.9, -9.12, 0.55, 0.7, 0.04);
    addBox(world, unitBox, emissiveCyan, 11.15, fy + 0.5, -9.12, 0.4, 0.12, 0.04);

    // Windows to street on 2F
    for (const x of [-10, -4, 4, 10]) {
        const pane = addBox(world, unitBox, glass, x, fy + 1.6, 12.42, 3.2, 1.8, 0.06);
        pane.material = glass;
        addBox(world, unitBox, brass, x, fy + 1.6, 12.48, 3.4, 2.0, 0.04);
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
        scene.add(obj);
        return { id: npc.id, obj, npc, x: npc.x, z: npc.z, y: npc.y || 0 };
    });

    // Dancers on the floor (full humans)
    const dancers = [];
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + 0.2;
        const rad = 2.5 + (i % 3) * 1.1;
        const x = Math.cos(ang) * rad;
        const z = Math.sin(ang) * rad * 0.9;
        if (NPCS.some((n) => Math.hypot(x - n.x, z - n.z) < 1.4 && !n.y)) continue;
        const h = createHuman({
            outfit: "raver",
            skin: [0x8d5524, 0xc68642, 0xe0ac69, 0xf1c27d][i % 4],
            hair: 0x1a0a08,
            color: ["#ff00aa", "#00fff7", "#39ff14", "#ffb703"][i % 4],
            anim: "dance",
            scale: 0.95 + (i % 4) * 0.03,
        });
        h.position.set(x, 0, z);
        h.rotation.y = ang + Math.PI;
        scene.add(h);
        dancers.push(h);
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
    const loungeLight = new THREE.PointLight(0xe0b25a, 40, 16, 2);
    loungeLight.position.set(0, fy + 2.2, -12);
    scene.add(loungeLight);
    lights.spot = spot;
    lights.booth = boothFill;
    lights.bar = barLight;
    lights.lounge = loungeLight;
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
