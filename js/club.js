import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const FLOOR_N = 16;
const FLOOR_COUNT = FLOOR_N * FLOOR_N;
const CROWD_N = 80;
const PARTICLE_N = 400;
const LASER_N = 8;

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _vibe = new THREE.Color("#ff00ff");
const _tmp = new THREE.Color();

function neonCanvas(text, color, w = 1024, h = 256) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = "#050010";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = color;
    g.lineWidth = 8;
    g.strokeRect(16, 16, w - 32, h - 32);
    g.font = `900 ${Math.floor(h * 0.42)}px Orbitron, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = color;
    g.shadowBlur = 28;
    g.fillStyle = color;
    g.fillText(text, w / 2, h / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

function makeCubeEnv() {
    const faces = ["#ff00aa", "#00fff7", "#3a0066", "#39ff14", "#ff4dd2", "#140018"];
    const images = faces.map((hex) => {
        const c = document.createElement("canvas");
        c.width = 32;
        c.height = 32;
        const g = c.getContext("2d");
        const grd = g.createLinearGradient(0, 0, 32, 32);
        grd.addColorStop(0, hex);
        grd.addColorStop(1, "#110018");
        g.fillStyle = grd;
        g.fillRect(0, 0, 32, 32);
        return c;
    });
    const tex = new THREE.CubeTexture(images);
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function addBox(parent, geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    return m;
}

export function createClub(canvas) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = false;
    renderer.setClearColor(0x09010c, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a0528, 0.032);
    scene.background = new THREE.Color(0x09010c);
    const env = makeCubeEnv();
    scene.environment = env;

    const camera = new THREE.PerspectiveCamera(88, window.innerWidth / window.innerHeight, 0.08, 80);
    camera.position.set(0, 1.7, 14);
    scene.add(camera);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.62,
        0.42,
        0.22,
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    let bloomKick = 0;
    let baseFov = 88;

    const hemi = new THREE.HemisphereLight(0x8877cc, 0x180010, 1.35);
    scene.add(hemi);

    const spot = new THREE.SpotLight(0xff66cc, 420, 36, Math.PI / 5.5, 0.45, 1.1);
    spot.position.set(0, 6.4, -11.2);
    scene.add(spot);
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 0);
    scene.add(spotTarget);
    spot.target = spotTarget;

    const boothFill = new THREE.PointLight(0x66ffff, 70, 16, 2);
    boothFill.position.set(0, 3.2, -12);
    scene.add(boothFill);

    const barLight = new THREE.PointLight(0xff2299, 80, 14, 2);
    barLight.position.set(-14.5, 1.4, 0);
    scene.add(barLight);

    const kioskLight = new THREE.PointLight(0x00fff7, 55, 10, 2);
    kioskLight.position.set(0, 2.4, 10);
    scene.add(kioskLight);

    const concrete = new THREE.MeshStandardMaterial({ color: 0x17171f, roughness: 0.9, metalness: 0.05, emissive: 0x08060e, emissiveIntensity: 0.25 });
    const concreteDark = new THREE.MeshStandardMaterial({ color: 0x101018, roughness: 0.92, metalness: 0.04, emissive: 0x050508, emissiveIntensity: 0.18 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x2a2a33, roughness: 0.35, metalness: 0.85 });
    const metalDark = new THREE.MeshStandardMaterial({ color: 0x15151c, roughness: 0.4, metalness: 0.7 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x1b1014, roughness: 0.8, metalness: 0.05 });
    const emissiveCyan = new THREE.MeshBasicMaterial({ color: 0x00fff7 });
    const emissiveMag = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    const emissiveLime = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
    const emissiveAmber = new THREE.MeshBasicMaterial({ color: 0xffb703 });

    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const world = new THREE.Group();
    scene.add(world);

    // Floor + ceiling + walls. Interior ~36 x 30 so spawn at z=14 sits 2m inside.
    addBox(world, unitBox, concreteDark, 0, -0.05, 1, 36.4, 0.1, 30.4);
    addBox(world, unitBox, concrete, 0, 8.05, 1, 36.4, 0.12, 30.4);
    addBox(world, unitBox, concrete, -18.15, 4, 1, 0.3, 8, 30.4);
    addBox(world, unitBox, concrete, 18.15, 4, 1, 0.3, 8, 30.4);
    addBox(world, unitBox, concrete, 0, 4, -14.15, 36.4, 8, 0.3);
    addBox(world, unitBox, concrete, 0, 4, 16.15, 36.4, 8, 0.3);

    for (const [x, z] of [[-17, -13], [17, -13], [-17, 15], [17, 15], [-17, 1], [17, 1]]) {
        addBox(world, unitBox, metalDark, x, 4, z, 0.55, 8, 0.55);
    }

    // Ceiling truss
    const trussMat = metal;
    for (let i = -3; i <= 4; i++) {
        const z = i * 3.4;
        addBox(world, unitBox, trussMat, 0, 7.72, z, 35.2, 0.12, 0.18);
    }
    for (let i = -4; i <= 4; i++) {
        const x = i * 4;
        addBox(world, unitBox, trussMat, x, 7.72, 1, 0.16, 0.12, 29.4);
    }
    for (let i = -3; i <= 3; i++) {
        for (let j = -2; j <= 3; j++) {
            addBox(world, unitBox, metalDark, i * 4.6, 7.35, j * 3.6, 0.22, 0.55, 0.22);
        }
    }

    // Ceiling LED strips
    for (let i = -2; i <= 3; i++) {
        const strip = addBox(world, unitBox, i % 2 ? emissiveMag : emissiveCyan, 0, 7.92, i * 3.5, 18, 0.04, 0.08);
        strip.name = "ceil-led";
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

    // DJ stage + booth
    addBox(world, unitBox, metalDark, 0, 0.3, -12, 10, 0.6, 4.2);
    addBox(world, unitBox, metal, 0, 0.64, -12.1, 9.6, 0.08, 3.8);
    addBox(world, unitBox, wood, 0, 1.08, -12.35, 3.4, 0.1, 1.35);
    addBox(world, unitBox, metal, -0.85, 1.2, -12.2, 0.7, 0.12, 0.55);
    addBox(world, unitBox, metal, 0.85, 1.2, -12.2, 0.7, 0.12, 0.55);
    addBox(world, unitBox, metalDark, 0, 1.18, -12.2, 0.55, 0.08, 0.5);
    addBox(world, unitBox, metal, 0, 1.22, -12.55, 0.55, 0.04, 0.38);
    addBox(world, unitBox, emissiveCyan, 0, 1.24, -12.55, 0.42, 0.01, 0.28);

    function speakerStack(x) {
        addBox(world, unitBox, metalDark, x, 0.7, -12.35, 1.1, 1.4, 1.1);
        addBox(world, unitBox, metal, x, 1.7, -12.35, 1.25, 0.7, 1.2);
        addBox(world, unitBox, metalDark, x, 2.55, -12.35, 1.05, 1.0, 1.05);
        addBox(world, unitBox, emissiveMag, x, 1.7, -11.72, 0.7, 0.08, 0.04);
        addBox(world, unitBox, emissiveCyan, x, 2.5, -11.8, 0.5, 0.06, 0.04);
    }
    speakerStack(-5.4);
    speakerStack(5.4);

    const rails = [
        [-5, 0.95, -10.05, 0.08, 0.7, 0.08],
        [5, 0.95, -10.05, 0.08, 0.7, 0.08],
        [0, 1.15, -10.05, 10.1, 0.06, 0.08],
    ];
    for (const r of rails) addBox(world, unitBox, metal, r[0], r[1], r[2], r[3], r[4], r[5]);

    // LED wall
    const ledCanvas = document.createElement("canvas");
    ledCanvas.width = 512;
    ledCanvas.height = 256;
    const ledCtx = ledCanvas.getContext("2d");
    const ledTex = new THREE.CanvasTexture(ledCanvas);
    ledTex.colorSpace = THREE.SRGBColorSpace;
    ledTex.minFilter = THREE.LinearFilter;
    const ledMat = new THREE.MeshBasicMaterial({ map: ledTex });
    const ledWall = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 3.2), ledMat);
    ledWall.position.set(0, 3.55, -13.82);
    scene.add(ledWall);
    addBox(world, unitBox, metalDark, 0, 3.55, -13.95, 8.8, 3.5, 0.12);

    let ledTitle = "VIBE CHECK 9000";
    let ledSub = "SCANNER ARMED";
    let ledStats = null;
    let ledTick = 0;

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
        g.font = "900 36px Orbitron, sans-serif";
        g.fillStyle = hex;
        g.textAlign = "center";
        g.shadowColor = hex;
        g.shadowBlur = 16;
        g.fillText(ledTitle.slice(0, 28), 256, 70);
        g.shadowBlur = 0;
        g.font = "700 18px Space Mono, monospace";
        g.fillStyle = "#00fff7";
        g.fillText(ledSub, 256, 108);
        if (ledStats) {
            g.font = "700 14px Space Mono, monospace";
            g.fillStyle = "#e8e7ff";
            g.fillText(`CHAOS ${ledStats.chaos}   CHARM ${ledStats.charm}`, 256, 148);
            g.fillText(`COSMIC ${ledStats.cosmic}   STATIC ${ledStats.static}`, 256, 172);
        } else {
            g.fillStyle = "#817e9f";
            g.font = "16px Space Mono, monospace";
            g.fillText("WALK TO THE SCANNER", 256, 150);
        }
        ledTex.needsUpdate = true;
    }

    // Mirror ball + sparkles
    const ballMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.08,
        envMap: env,
        envMapIntensity: 1.6,
    });
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 2), ballMat);
    ball.position.set(0, 5.6, 0);
    scene.add(ball);
    addBox(world, unitBox, metal, 0, 6.7, 0, 0.06, 1.6, 0.06);

    const sparkPos = new Float32Array(80 * 3);
    for (let i = 0; i < 80; i++) {
        const a = Math.random() * Math.PI * 2;
        const b = Math.random() * Math.PI;
        sparkPos[i * 3] = Math.sin(b) * Math.cos(a) * 0.7;
        sparkPos[i * 3 + 1] = Math.cos(b) * 0.7;
        sparkPos[i * 3 + 2] = Math.sin(b) * Math.sin(a) * 0.7;
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    const sparkles = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.045,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }));
    ball.add(sparkles);

    // Lasers
    const laserGeo = new THREE.CylinderGeometry(0.025, 0.045, 16, 5, 1, true);
    const laserColors = [0xff00ff, 0x00fff7, 0x39ff14, 0xff2ea6, 0x66ffff, 0xccff00, 0xff66cc, 0x00ffc8];
    const lasers = [];
    for (let i = 0; i < LASER_N; i++) {
        const mat = new THREE.MeshBasicMaterial({
            color: laserColors[i],
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
        const beam = new THREE.Mesh(laserGeo, mat);
        beam.position.y = -8;
        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(1.8, 14, 16, 1, true),
            new THREE.MeshBasicMaterial({
                color: laserColors[i],
                transparent: true,
                opacity: 0.07,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide,
            }),
        );
        cone.position.y = -7;
        const pivot = new THREE.Group();
        const ang = (i / LASER_N) * Math.PI * 2;
        pivot.position.set(Math.cos(ang) * 6.2, 7.85, Math.sin(ang) * 6.2);
        pivot.add(beam);
        pivot.add(cone);
        const head = new THREE.Mesh(unitBox, new THREE.MeshBasicMaterial({ color: laserColors[i] }));
        head.scale.set(0.28, 0.18, 0.38);
        pivot.add(head);
        scene.add(pivot);
        lasers.push({ pivot, mat, coneMat: cone.material, phase: i * 0.9 });
    }

    // Wall wash LEDs
    const washGeo = new THREE.PlaneGeometry(4.8, 0.18);
    const washes = [];
    for (let i = 0; i < 8; i++) {
        const mat = new THREE.MeshBasicMaterial({
            color: i % 2 ? 0xff00aa : 0x00fff7,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const w = new THREE.Mesh(washGeo, mat);
        w.position.set(i < 4 ? -17.9 : 17.9, 2.4 + (i % 4) * 1.1, -6 + (i % 4) * 4);
        w.rotation.y = i < 4 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(w);
        washes.push(mat);
    }

    // Moving-head cans on truss (visual)
    for (let i = 0; i < 6; i++) {
        const can = addBox(world, unitBox, metal, (i - 2.5) * 3.2, 7.2, -6 + (i % 2) * 10, 0.32, 0.22, 0.42);
        can.rotation.x = 0.4;
    }

    // Fog particles
    const pPos = new Float32Array(PARTICLE_N * 3);
    const pCol = new Float32Array(PARTICLE_N * 3);
    const pVel = new Float32Array(PARTICLE_N);
    const pPalette = [
        [1, 0, 1], [0, 1, 0.97], [0.22, 1, 0.08], [1, 0.3, 0.7], [0.6, 0.2, 1],
    ];
    for (let i = 0; i < PARTICLE_N; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 34;
        pPos[i * 3 + 1] = Math.random() * 7.5;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 28;
        pVel[i] = 0.12 + Math.random() * 0.35;
        const c = pPalette[i % pPalette.length];
        pCol[i * 3] = c[0];
        pCol[i * 3 + 1] = c[1];
        pCol[i * 3 + 2] = c[2];
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        size: 0.07,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    }));
    scene.add(particles);

    // Crowd: torso + head + glowstick so they read as ravers, not bowling pins
    const torsoGeo = new THREE.CapsuleGeometry(0.15, 0.42, 2, 6);
    const headGeo = new THREE.SphereGeometry(0.11, 8, 8);
    const stickGeo = new THREE.BoxGeometry(0.035, 0.38, 0.035);
    const crowdMat = new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0.12 });
    const headMat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.08 });
    const stickMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    const crowd = new THREE.InstancedMesh(torsoGeo, crowdMat, CROWD_N);
    const heads = new THREE.InstancedMesh(headGeo, headMat, CROWD_N);
    const sticks = new THREE.InstancedMesh(stickGeo, stickMat, CROWD_N);
    crowd.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    heads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sticks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    crowd.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CROWD_N * 3), 3);
    heads.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CROWD_N * 3), 3);
    sticks.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CROWD_N * 3), 3);
    const crowdX = new Float32Array(CROWD_N);
    const crowdZ = new Float32Array(CROWD_N);
    const crowdPhase = new Float32Array(CROWD_N);
    const crowdScale = new Float32Array(CROWD_N);
    const crowdYaw = new Float32Array(CROWD_N);
    let placed = 0;
    let guard = 0;
    while (placed < CROWD_N && guard < 4000) {
        guard += 1;
        const x = (Math.random() - 0.5) * 30;
        const z = (Math.random() - 0.5) * 24 + 1;
        if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
        if (z < -9.6 && Math.abs(x) < 6.4) continue;
        if (x < -13.2 && Math.abs(z) < 9) continue;
        if (Math.abs(x) < 1.6 && Math.abs(z - 10) < 1.4) continue;
        if (z > 13.2 && Math.abs(x) < 1.5) continue;
        if (z > 10.5 && Math.abs(x) < 3.2) continue;
        crowdX[placed] = x;
        crowdZ[placed] = z;
        crowdPhase[placed] = Math.random() * Math.PI * 2;
        crowdScale[placed] = 0.88 + Math.random() * 0.28;
        crowdYaw[placed] = Math.random() * Math.PI * 2;
        const neon = pPalette[placed % pPalette.length];
        const dark = Math.random() * 0.12;
        _color.setRGB(dark + neon[0] * 0.55, dark + neon[1] * 0.35, dark + neon[2] * 0.55);
        crowd.setColorAt(placed, _color);
        _color.setRGB(0.12 + neon[0] * 0.2, 0.08 + neon[1] * 0.12, 0.1 + neon[2] * 0.18);
        heads.setColorAt(placed, _color);
        sticks.setColorAt(placed, _color.setRGB(neon[0], neon[1], neon[2]));
        placed += 1;
    }
    scene.add(crowd, heads, sticks);

    const djBody = new THREE.Mesh(torsoGeo, new THREE.MeshStandardMaterial({
        color: 0x111118,
        emissive: 0xff00aa,
        emissiveIntensity: 0.35,
        roughness: 0.6,
    }));
    const djHead = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0x22111a, roughness: 0.5 }));
    const dj = new THREE.Group();
    djBody.position.y = 0.52;
    djHead.position.y = 1.02;
    dj.add(djBody, djHead);
    dj.position.set(0, 1.05, -12.45);
    dj.scale.set(1.12, 1.12, 1.12);
    scene.add(dj);

    function makeHand(side) {
        const g = new THREE.Group();
        const palm = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.04, 0.12),
            new THREE.MeshStandardMaterial({ color: 0x1a1220, emissive: 0x220033, roughness: 0.5 }),
        );
        const cuff = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.04, 0.16, 6),
            new THREE.MeshStandardMaterial({ color: 0x0a0a12, emissive: side < 0 ? 0xff00aa : 0x00fff7, emissiveIntensity: 0.4 }),
        );
        cuff.rotation.x = Math.PI / 2;
        cuff.position.z = 0.12;
        g.add(palm, cuff);
        g.position.set(side * 0.28, -0.22, -0.42);
        g.rotation.set(-0.35, side * 0.18, side * 0.12);
        camera.add(g);
        return g;
    }
    const leftHand = makeHand(-1);
    const rightHand = makeHand(1);

    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 256;
    screenCanvas.height = 128;
    const screenCtx = screenCanvas.getContext("2d");
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    const wallScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(6.4, 2.4),
        new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }),
    );
    wallScreen.position.set(0, 4.6, -13.7);
    scene.add(wallScreen);

    for (const [x, z, rot] of [[14.2, -4, -0.4], [14.2, 2, 0.35], [13.6, 7, 0.2]]) {
        addBox(world, unitBox, wood, x, 0.32, z, 1.8, 0.28, 0.7);
        addBox(world, unitBox, metalDark, x, 0.55, z - 0.28, 1.8, 0.18, 0.18);
        const lamp = addBox(world, unitBox, emissiveMag, x, 0.72, z, 0.12, 0.04, 0.12);
        lamp.rotation.y = rot;
    }

    // Bar along x = -15
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

    // Neon signs
    const signVc = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.35), new THREE.MeshBasicMaterial({ map: neonCanvas("VIBE CHECK 9000", "#00FFF7") }));
    signVc.position.set(0, 6.4, 15.7);
    signVc.rotation.y = Math.PI;
    scene.add(signVc);

    const signNt = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.15), new THREE.MeshBasicMaterial({ map: neonCanvas("NO THERAPY", "#FF2EA6") }));
    signNt.position.set(17.85, 5.4, -2);
    signNt.rotation.y = -Math.PI / 2;
    scene.add(signNt);

    const signIl = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.15), new THREE.MeshBasicMaterial({ map: neonCanvas("ILLEGAL LEDS", "#39FF14") }));
    signIl.position.set(-17.85, 5.5, 4);
    signIl.rotation.y = Math.PI / 2;
    scene.add(signIl);

    const signRave = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.9), new THREE.MeshBasicMaterial({ map: neonCanvas("OPEN LATE", "#FFB703") }));
    signRave.position.set(17.85, 4.0, 6);
    signRave.rotation.y = -Math.PI / 2;
    scene.add(signRave);

    // Crates / flight cases
    for (const [x, z, s] of [[12, 8.5, 1.1], [13.2, 9.4, 0.8], [-12.5, 6.5, 1], [10, -8, 0.9], [12.5, -9.2, 1.2], [-10, -8.5, 0.85]]) {
        addBox(world, unitBox, metalDark, x, s * 0.35, z, s, s * 0.7, s * 0.8);
    }

    // Scanner kiosk (walk-through arch) at z=10
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(0, 0, 10);
    scene.add(kioskGroup);
    const kioskMat = new THREE.MeshStandardMaterial({ color: 0x0a1a22, roughness: 0.4, metalness: 0.7, emissive: 0x003333, emissiveIntensity: 0.4 });
    addBox(kioskGroup, unitBox, kioskMat, -1.15, 1.5, 0, 0.28, 3.0, 0.28);
    addBox(kioskGroup, unitBox, kioskMat, 1.15, 1.5, 0, 0.28, 3.0, 0.28);
    addBox(kioskGroup, unitBox, kioskMat, 0, 3.12, 0, 2.6, 0.22, 0.3);
    addBox(kioskGroup, unitBox, emissiveCyan, -1.15, 1.5, 0.16, 0.06, 2.6, 0.04);
    addBox(kioskGroup, unitBox, emissiveCyan, 1.15, 1.5, 0.16, 0.06, 2.6, 0.04);
    addBox(kioskGroup, unitBox, emissiveCyan, 0, 3.12, 0.16, 2.4, 0.05, 0.04);
    const plate = addBox(kioskGroup, unitBox, emissiveCyan, 0, 0.02, 0, 2.2, 0.02, 1.1);
    plate.material = new THREE.MeshBasicMaterial({ color: 0x00fff7, transparent: true, opacity: 0.35 });

    const chevron = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.4, 4),
        new THREE.MeshBasicMaterial({ color: 0x00fff7 }),
    );
    chevron.position.set(0, 3.7, 10);
    chevron.rotation.x = Math.PI;
    scene.add(chevron);

    const kioskLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 0.35),
        new THREE.MeshBasicMaterial({ map: neonCanvas("VIBE SCAN", "#00FFF7", 512, 128), transparent: true }),
    );
    kioskLabel.position.set(0, 3.45, 10.2);
    scene.add(kioskLabel);

    // Hidden cube near the bar
    const secretCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.28, 0.28),
        new THREE.MeshStandardMaterial({
            color: 0xfff700,
            emissive: 0xfff700,
            emissiveIntensity: 0.9,
            metalness: 0.4,
            roughness: 0.25,
        }),
    );
    secretCube.position.set(-14.2, 0.42, 8.95);
    secretCube.name = "secretCube";
    scene.add(secretCube);

    // Door frame behind spawn
    addBox(world, unitBox, metal, 0, 2.2, 16, 2.4, 4.4, 0.2);
    addBox(world, unitBox, emissiveMag, 0, 4.4, 15.95, 2.6, 0.08, 0.08);

    const colliders = {
        bounds: { minX: -17.35, maxX: 17.35, minZ: -13.55, maxZ: 15.35 },
        boxes: [
            { minX: -5.2, maxX: 5.2, minZ: -14.2, maxZ: -10.05 },
            { minX: -6.2, maxX: -4.6, minZ: -13.2, maxZ: -11.4 },
            { minX: 4.6, maxX: 6.2, minZ: -13.2, maxZ: -11.4 },
            { minX: -18, maxX: -13.35, minZ: -8.4, maxZ: 8.4 },
            { minX: -1.4, maxX: -0.9, minZ: 9.7, maxZ: 10.3 },
            { minX: 0.9, maxX: 1.4, minZ: 9.7, maxZ: 10.3 },
            { minX: 11.2, maxX: 13.8, minZ: 9.4, maxZ: 11.8 },
            { minX: 9.4, maxX: 13.2, minZ: -9.8, maxZ: -7.4 },
        ],
    };

    let drop = "idle";
    let floorFlash = 0;
    let crowdOn = true;
    let ledDirty = true;
    let vibeHex = "#ff00ff";

    function setVibeColor(hex) {
        vibeHex = hex || "#ff00ff";
        _vibe.set(vibeHex);
        scene.fog.color.copy(_vibe).multiplyScalar(0.12);
        renderer.setClearColor(_tmp.copy(_vibe).multiplyScalar(0.05), 1);
        scene.background.copy(_tmp);
        spot.color.copy(_vibe);
        for (let i = 0; i < lasers.length; i++) {
            if (i % 2 === 0) lasers[i].mat.color.copy(_vibe);
        }
        ledDirty = true;
    }

    function resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.setSize(w, h);
        composer.setSize(w, h);
        bloom.setSize(w, h);
    }

    window.addEventListener("resize", resize);

    return {
        renderer,
        composer,
        scene,
        camera,
        colliders,
        kiosk: { x: 0, y: 0, z: 10 },
        cube: secretCube,
        chevron,

        setChevronVisible(v) { chevron.visible = !!v; },
        setCrowdVisible(v) {
            crowdOn = !!v;
            crowd.visible = heads.visible = sticks.visible = dj.visible = !!v;
        },
        setFov(fov) {
            baseFov = fov;
            camera.fov = fov;
            camera.updateProjectionMatrix();
        },
        setBloomReduced(v) { bloom.strength = v ? 0.12 : 0.92; },
        flashFloor() { floorFlash = 0.22; bloomKick = 0.18; },
        pulseKick() { bloomKick = 0.12; },
        shiftLasers() {
            for (const l of lasers) {
                l.mat.color.setHSL(Math.random(), 1, 0.55);
            }
        },
        setDrop(phase) { drop = phase; },
        setVibeColor,
        setLedMessage(title, sub, stats) {
            ledTitle = title || "VIBE CHECK 9000";
            ledSub = sub || "";
            ledStats = stats || null;
            ledDirty = true;
        },

        enableXR() {
            renderer.xr.enabled = true;
        },

        update(dt, t, ctx) {
            const bass = ctx.bass || 0;
            const mid = ctx.mid || 0;
            const bpm = ctx.bpm || 128;
            const reduced = !!ctx.reduced;
            const blackout = drop === "blackout";
            const explode = drop === "explode";
            const dim = blackout ? 0.02 : explode ? 1.4 : 1;

            hemi.intensity = 1.35 * dim;
            spot.intensity = (blackout ? 0 : 420 + bass * 180) * (explode ? 1.6 : 1);
            boothFill.intensity = 70 * dim * (0.6 + bass);
            barLight.intensity = 80 * dim;
            kioskLight.intensity = 40 + Math.sin(t * 3) * 12;

            const sweep = t * 0.25;
            spotTarget.position.set(Math.sin(sweep) * 5.5, 0, Math.cos(sweep * 0.7) * 4);

            ball.rotation.y += dt * (reduced ? 0.15 : 0.45);
            ball.rotation.x += dt * (reduced ? 0.04 : 0.12);
            ball.position.y = 5.6 + Math.sin(t * 1.3) * 0.08;

            secretCube.rotation.y += dt * 0.8;
            secretCube.rotation.x += dt * 0.4;
            secretCube.position.y = 0.42 + Math.sin(t * 2.2) * 0.06;

            chevron.position.y = 3.7 + Math.sin(t * 3) * 0.12;
            chevron.rotation.z = Math.sin(t * 2) * 0.15;

            dj.position.y = 1.05 + Math.sin(t * (bpm / 60) * Math.PI * 2) * 0.09 * (0.4 + bass);
            const handBob = Math.sin(t * 7) * 0.025;
            leftHand.position.y = -0.22 + handBob;
            rightHand.position.y = -0.22 - handBob;
            leftHand.visible = rightHand.visible = true;

            const laserSpeed = reduced ? 0.25 : (explode ? 2.4 : 1);
            for (let i = 0; i < lasers.length; i++) {
                const L = lasers[i];
                L.pivot.rotation.z = Math.sin(t * 0.7 * laserSpeed + L.phase) * 0.85;
                L.pivot.rotation.x = Math.cos(t * 0.55 * laserSpeed + L.phase * 1.3) * 0.7;
                L.mat.opacity = blackout ? 0.02 : 0.22 + bass * 0.28;
                if (L.coneMat) L.coneMat.opacity = blackout ? 0.01 : 0.05 + bass * 0.12;
            }
            for (let i = 0; i < washes.length; i++) {
                washes[i].opacity = blackout ? 0.05 : 0.28 + bass * 0.45 + Math.sin(t * 6 + i) * 0.12;
                washes[i].color.copy(i % 2 ? _vibe : _color.set(0x00fff7));
            }

            if (floorFlash > 0) floorFlash -= dt;
            const snakeHead = Math.floor(t * (reduced ? 6 : 14)) % FLOOR_COUNT;
            for (let i = 0; i < FLOOR_COUNT; i++) {
                const col = i % FLOOR_N;
                const row = Math.floor(i / FLOOR_N);
                const snakeIdx = row % 2 === 0 ? row * FLOOR_N + col : row * FLOOR_N + (FLOOR_N - 1 - col);
                const dist = (snakeHead - snakeIdx + FLOOR_COUNT) % FLOOR_COUNT;
                const snake = dist < 10 ? 1 - dist / 10 : 0;
                const checker = (col + row) % 2;
                let pulse = 0.1 + bass * 0.55 + snake * 0.85 + checker * 0.04 + mid * 0.12;
                if (floorFlash > 0) pulse = 1.2;
                if (blackout) pulse *= 0.05;
                if (explode) pulse = 0.6 + bass;
                _color.copy(_vibe);
                _color.multiplyScalar(0.35 + pulse * 0.9);
                _color.r += snake * 0.25;
                _color.b += (1 - snake) * 0.15;
                floor.setColorAt(i, _color);
            }
            floor.instanceColor.needsUpdate = true;

            if (crowdOn) {
                const bob = reduced ? 0.04 : 0.16;
                const beat = t * (bpm / 60) * Math.PI * 2;
                for (let i = 0; i < CROWD_N; i++) {
                    const bounce = Math.sin(beat + crowdPhase[i]) * bob * (0.45 + bass);
                    const sway = Math.sin(t * 1.3 + crowdPhase[i]) * 0.07;
                    const sc = crowdScale[i];
                    const yaw = crowdYaw[i] + sway * 0.4;
                    _dummy.position.set(crowdX[i] + sway, 0.48 + bounce, crowdZ[i]);
                    _dummy.rotation.set(0, yaw, 0);
                    _dummy.scale.set(sc, sc, sc);
                    _dummy.updateMatrix();
                    crowd.setMatrixAt(i, _dummy.matrix);

                    _dummy.position.set(crowdX[i] + sway, 0.98 + bounce, crowdZ[i]);
                    _dummy.scale.set(sc, sc, sc);
                    _dummy.updateMatrix();
                    heads.setMatrixAt(i, _dummy.matrix);

                    const raised = 1.15 + bounce + Math.max(0, Math.sin(beat * 2 + crowdPhase[i])) * 0.22;
                    _dummy.position.set(
                        crowdX[i] + sway + Math.cos(yaw) * 0.22,
                        raised,
                        crowdZ[i] + Math.sin(yaw) * 0.22,
                    );
                    _dummy.rotation.set(0.3, yaw, 0.4);
                    _dummy.scale.set(sc, sc, sc);
                    _dummy.updateMatrix();
                    sticks.setMatrixAt(i, _dummy.matrix);
                }
                crowd.instanceMatrix.needsUpdate = true;
                heads.instanceMatrix.needsUpdate = true;
                sticks.instanceMatrix.needsUpdate = true;
            }

            if (bloomKick > 0) bloomKick -= dt;
            bloom.strength = reduced ? 0.1 : (blackout ? 0.04 : 0.52 + bass * 0.35 + (explode ? 0.45 : 0) + bloomKick * 1.4);
            const targetFov = baseFov + (reduced ? 0 : bass * 3 + bloomKick * 10);
            if (Math.abs(camera.fov - targetFov) > 0.05) {
                camera.fov += (targetFov - camera.fov) * 0.18;
                camera.updateProjectionMatrix();
            }

            const sg = screenCtx;
            sg.fillStyle = "#050014";
            sg.fillRect(0, 0, 256, 128);
            for (let i = 0; i < 32; i++) {
                const hgt = 8 + Math.abs(Math.sin(t * 6 + i * 0.35)) * 70 * (0.3 + bass);
                sg.fillStyle = i % 2 ? vibeHex : "#00fff7";
                sg.fillRect(4 + i * 8, 118 - hgt, 6, hgt);
            }
            sg.fillStyle = "#ffffff";
            sg.font = "bold 14px sans-serif";
            sg.fillText(ledTitle.slice(0, 22), 10, 22);
            screenTex.needsUpdate = true;

            const pos = pGeo.attributes.position.array;
            for (let i = 0; i < PARTICLE_N; i++) {
                pos[i * 3 + 1] += pVel[i] * dt * (reduced ? 0.4 : 1);
                pos[i * 3] += Math.sin(t * 0.4 + i) * dt * 0.08;
                if (pos[i * 3 + 1] > 7.8) {
                    pos[i * 3 + 1] = 0.1;
                    pos[i * 3] = (Math.random() - 0.5) * 34;
                    pos[i * 3 + 2] = (Math.random() - 0.5) * 28;
                }
            }
            pGeo.attributes.position.needsUpdate = true;

            ledTick += dt;
            if (ledDirty || ledTick > 0.1) {
                drawLed(t, bass);
                ledTick = 0;
                ledDirty = false;
            }
        },

        resize,
        dispose() {
            renderer.dispose();
        },
    };
}
