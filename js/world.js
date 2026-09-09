import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { buildClub } from "./club.js";
import { buildCity, updateCity } from "./city.js";
import { animateHuman } from "./human.js";
import { buildColliders, getFloorY, getZone, isOutside } from "./zones.js";
import { makeCubeEnv, makeDuskSky } from "./kit.js";

const _color = new THREE.Color();
const _vibe = new THREE.Color("#ff00ff");

export function createWorld(canvas) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = false;
    renderer.setClearColor(0xc47858, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xc47862, 0.012);
    scene.background = new THREE.Color(0xc47858);
    const env = makeCubeEnv();
    scene.environment = env;

    const dusk = makeDuskSky(280);
    scene.add(dusk.sky, dusk.sun, dusk.glow, dusk.sunLight);

    const camera = new THREE.PerspectiveCamera(82, window.innerWidth / window.innerHeight, 0.08, 420);
    camera.position.set(0, 1.7, 8);
    scene.add(camera);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.48, 0.42, 0.22);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    let bloomKick = 0;
    let baseFov = 82;

    const hemi = new THREE.HemisphereLight(0xffc090, 0x4a3048, 1.15);
    scene.add(hemi);

    const club = buildClub(scene, env);
    const city = buildCity(scene);
    const colliders = buildColliders();

    function makeHand(side) {
        const g = new THREE.Group();
        const palm = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.04, 0.12),
            new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.55 }),
        );
        const cuff = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.04, 0.16, 6),
            new THREE.MeshStandardMaterial({
                color: 0x1a1410,
                emissive: side < 0 ? 0xff00aa : 0x00fff7,
                emissiveIntensity: 0.35,
            }),
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

    let floorFlash = 0;
    let crowdOn = true;
    let vibeHex = "#ff00ff";
    let ledTick = 0;

    function setVibeColor(hex) {
        vibeHex = hex || "#ff00ff";
        _vibe.set(vibeHex);
        club.vibe.copy(_vibe);
        club.lights.spot.color.copy(_vibe);
    }

    function resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
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
        cube: club.secretCube,
        npcs: club.namedPeople,
        city,
        club,

        setCrowdVisible(v) {
            crowdOn = !!v;
            for (const d of club.dancers) d.visible = crowdOn;
            for (const p of club.barCrowd || []) p.visible = crowdOn;
            for (const p of club.loungeCrowd || []) p.visible = crowdOn;
            for (const p of city.peds) p.visible = crowdOn;
        },
        setFov(fov) {
            baseFov = fov;
            camera.fov = fov;
            camera.updateProjectionMatrix();
        },
        setBloomReduced(v) { bloom.strength = v ? 0.1 : 0.48; },
        setTipsy(v) {
            scene.fog.density = v ? 0.01 : 0.012;
            renderer.toneMappingExposure = v ? 1.18 : 1.08;
        },
        flashFloor() { floorFlash = 0.22; bloomKick = 0.18; },
        pulseKick() { bloomKick = 0.12; },
        shiftLasers() {
            for (const l of club.lasers) l.mat.color.setHSL(Math.random(), 1, 0.55);
        },
        setVibeColor,
        setLedMessage(title, sub) { club.setLed(title, sub); },
        enableXR() { renderer.xr.enabled = true; },

        update(dt, t, ctx) {
            const bass = ctx.bass || 0;
            const mid = ctx.mid || 0;
            const bpm = ctx.bpm || 128;
            const reduced = !!ctx.reduced;
            const energy = ctx.energy || 0;
            const p = camera.position;
            const zone = getZone(p.x, p.z, p.y - 1.7);
            const outside = isOutside(p.x, p.z);

            dusk.sky.visible = true;
            dusk.sun.visible = outside;
            dusk.glow.visible = outside;
            if (outside) {
                scene.fog.color.set(0xc47862);
                scene.fog.density = reduced ? 0.006 : 0.0085;
                hemi.color.set(0xffc090);
                hemi.groundColor.set(0x4a3048);
                hemi.intensity = 1.35;
                dusk.sunLight.intensity = 1.2;
                renderer.setClearColor(0xc47858, 1);
                renderer.toneMappingExposure = reduced ? 1.0 : 1.12;
            } else if (zone === "lounge") {
                scene.fog.color.set(0x3a2018);
                scene.fog.density = 0.016;
                hemi.color.set(0xffd0a0);
                hemi.groundColor.set(0x2a1018);
                hemi.intensity = 1.15;
                dusk.sunLight.intensity = 0.25;
                renderer.toneMappingExposure = 1.05;
            } else if (zone === "diner" || zone === "hotel") {
                scene.fog.color.set(0x2a1810);
                scene.fog.density = 0.018;
                hemi.intensity = 1.1;
                dusk.sunLight.intensity = 0.15;
            } else {
                scene.fog.color.copy(_vibe).multiplyScalar(0.12);
                scene.fog.density = 0.026;
                hemi.color.set(0x8877cc);
                hemi.groundColor.set(0x180010);
                hemi.intensity = 1.15;
                dusk.sunLight.intensity = 0.05;
            }

            const dim = 1;
            club.lights.spot.intensity = (380 + bass * 160) * dim;
            club.lights.booth.intensity = 55 * (0.6 + bass);
            club.lights.bar.intensity = 70;
            club.lights.lounge.intensity = 48 + Math.sin(t * 1.5) * 8;
            if (club.lights.loungeWarm) club.lights.loungeWarm.intensity = 32 + Math.sin(t * 1.1) * 5;
            if (club.lights.windowDusk) club.lights.windowDusk.intensity = 18 + Math.sin(t * 0.4) * 4;
            const sweep = t * 0.25;
            club.lights.spotTarget.position.set(Math.sin(sweep) * 5.5, 0, Math.cos(sweep * 0.7) * 4);

            club.ball.rotation.y += dt * (reduced ? 0.15 : 0.45);
            club.ball.rotation.x += dt * (reduced ? 0.04 : 0.12);
            club.secretCube.rotation.y += dt * 0.8;
            club.secretCube.rotation.x += dt * 0.4;
            club.secretCube.position.y = 0.42 + Math.sin(t * 2.2) * 0.06;

            for (const person of club.namedPeople) {
                animateHuman(person.obj, t, {
                    mode: person.npc.anim || "idle",
                    bpm,
                    talking: ctx.talkId === person.id,
                });
            }
            if (crowdOn) {
                for (const d of club.dancers) animateHuman(d, t, { mode: d.userData.mode || "dance", bpm });
                for (const p of club.barCrowd || []) animateHuman(p, t, { mode: p.userData.mode || "idle", bpm });
                for (const p of club.loungeCrowd || []) animateHuman(p, t, { mode: p.userData.mode || "idle", bpm: 96 });
                for (const ped of city.peds) animateHuman(ped, t, { mode: "walk", bpm: 96 });
            }

            const handBob = Math.sin(t * 7) * 0.025;
            leftHand.position.y = -0.22 + handBob;
            rightHand.position.y = -0.22 - handBob;

            const laserSpeed = reduced ? 0.25 : 1;
            for (let i = 0; i < club.lasers.length; i++) {
                const L = club.lasers[i];
                L.pivot.rotation.z = Math.sin(t * 0.7 * laserSpeed + L.phase) * 0.85;
                L.pivot.rotation.x = Math.cos(t * 0.55 * laserSpeed + L.phase * 1.3) * 0.7;
                L.mat.opacity = outside ? 0.08 : 0.22 + bass * 0.28;
            }
            for (let i = 0; i < club.washes.length; i++) {
                club.washes[i].opacity = outside ? 0.08 : 0.28 + bass * 0.45 + Math.sin(t * 6 + i) * 0.12;
                club.washes[i].color.copy(i % 2 ? _vibe : _color.set(0x00fff7));
            }
            for (let i = 0; i < club.hangLeds.length; i++) {
                const pulse = 0.45 + bass * 0.55 + Math.sin(t * 5 + i * 0.9) * 0.25;
                club.hangLeds[i].color.setHSL(((i / club.hangLeds.length) + t * 0.05) % 1, 0.9, 0.45 + pulse * 0.2);
            }

            if (floorFlash > 0) floorFlash -= dt;
            const FLOOR_N = 16;
            const FLOOR_COUNT = 256;
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
                _color.copy(_vibe);
                _color.multiplyScalar(0.35 + pulse * 0.9);
                _color.r += snake * 0.25;
                _color.b += (1 - snake) * 0.15;
                club.floor.setColorAt(i, _color);
            }
            club.floor.instanceColor.needsUpdate = true;

            if (bloomKick > 0) bloomKick -= dt;
            bloom.strength = reduced ? 0.1 : 0.42 + bass * 0.28 + bloomKick * 1.4;
            const targetFov = baseFov + (reduced ? 0 : bass * 2.4 + bloomKick * 8);
            if (Math.abs(camera.fov - targetFov) > 0.05) {
                camera.fov += (targetFov - camera.fov) * 0.18;
                camera.updateProjectionMatrix();
            }

            const pos = club.pGeo.attributes.position.array;
            for (let i = 0; i < pos.length / 3; i++) {
                pos[i * 3 + 1] += club.pVel[i] * dt * (reduced ? 0.4 : 1);
                pos[i * 3] += Math.sin(t * 0.4 + i) * dt * 0.08;
                if (pos[i * 3 + 1] > 4.0) {
                    pos[i * 3 + 1] = 0.1;
                    pos[i * 3] = (Math.random() - 0.5) * 30;
                    pos[i * 3 + 2] = (Math.random() - 0.5) * 24;
                }
            }
            club.pGeo.attributes.position.needsUpdate = true;

            ledTick += dt;
            if (ledTick > 0.1) {
                club.drawLed(t, bass);
                ledTick = 0;
            }

            updateCity(city, dt, t, { outside, reduced });

            club.particles.visible = zone === "club" || zone === "lounge";
        },

        resize,
        dispose() { renderer.dispose(); },
        getFloorY,
        getZone,
    };
}
