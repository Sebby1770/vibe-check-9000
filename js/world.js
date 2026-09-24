import { buildBlockLoop } from './block-loop.js';
import { buildDistrict } from './district.js';
import { buildLifeWorld } from './life-world.js';
import { CLUB_SCENES } from './life.js';
import { buildStreetLife } from "./street-life.js";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { buildClub } from "./club.js";
import { buildCity, updateCity } from "./city.js";
import { animateHuman } from "./human.js";
import { buildColliders, getFloorY, getZone, isOutside } from "./zones.js";
import { interiorColliders } from "./interiors/index.js";
import { makeCubeEnv, makeDuskSky, paintSky } from "./kit.js";
import { phaseLook } from "./night.js";
import { createShopActivities } from "./shop-activities.js";
import { detectQuality } from "./quality.js";

const _color = new THREE.Color();
const _vibe = new THREE.Color("#ff00ff");

export function createWorld(canvas, adConfig) {
    const quality = detectQuality();
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        powerPreference: "high-performance",
        alpha: false,
    });
    renderer.info.autoReset = false;
    renderer.setPixelRatio(quality.pixelRatio);
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

    // Multisample the scene itself: canvas AA does not reach composer targets.
    const target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: THREE.HalfFloatType });
    target.samples = renderer.capabilities.isWebGL2 ? Math.min(quality.samples, renderer.capabilities.maxSamples) : 0;
    const composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth * quality.bloomScale, window.innerHeight * quality.bloomScale),
        0.22,
        0.4,
        0.78,
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composer.setPixelRatio(quality.pixelRatio);
    let bloomKick = 0;
    let baseFov = 82;

    const hemi = new THREE.HemisphereLight(0xffc090, 0x4a3048, 1.15);
    scene.add(hemi);

    const club = buildClub(scene, env);
    const city = buildCity(scene, adConfig);
    const district = buildDistrict(scene);
    buildBlockLoop(scene);
    const colliders = buildColliders(interiorColliders());
    const streetLife = buildStreetLife(scene);
    const lifeWorld = buildLifeWorld(scene,colliders);
    let clubScene=CLUB_SCENES[0];
    const sceneColor=new THREE.Color(clubScene.color),sceneAccent=new THREE.Color(clubScene.accent);
    const activities = createShopActivities(scene,camera);

    function makeHand(side) {
        const g = new THREE.Group();
        const palm = new THREE.Mesh(
            new THREE.SphereGeometry(1, 14, 10),
            new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.55 }),
        );
        const cuff = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.04, 0.16, 16),
            new THREE.MeshStandardMaterial({
                color: 0x1a1410,
                emissive: side < 0 ? 0xff00aa : 0x00fff7,
                emissiveIntensity: 0.055,
            }),
        );
        g.add(palm, cuff); // Keep the cuff in slot 1 for visor-colour updates.
        palm.scale.set(.04,.022,.065);
        for(let i=0;i<4;i++){
            const finger=new THREE.Mesh(new THREE.CapsuleGeometry(.008,.038,3,8),palm.material);
            finger.rotation.x=Math.PI/2;finger.position.set(-.025+i*.017,-.001,-.057);g.add(finger);
        }
        const thumb=new THREE.Mesh(new THREE.CapsuleGeometry(.012,.026,3,8),palm.material);
        thumb.rotation.set(Math.PI/2,0,side*.5);thumb.position.set(-side*.035,-.003,-.015);g.add(thumb);
        cuff.rotation.x = Math.PI / 2;
        cuff.position.z = 0.12;
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
    let drunk = false;
    let nightPhase = "doors";

    function applyCrowd() {
        const close = nightPhase === "close";
        const thin = nightPhase === "lastcall" || close;
        club.dancers.forEach((d, i) => { d.visible = crowdOn && !close && (!thin || i % 2 === 1); });
        (club.barCrowd || []).forEach((p, i) => { p.visible = crowdOn && (!close || i % 2 === 0); });
        (club.loungeCrowd || []).forEach((p, i) => { p.visible = crowdOn && (!close || i % 3 !== 0); });
        district.peds.forEach((p,i)=>{p.visible=crowdOn&&(!close||i%2===0);});
        (city.peds || []).forEach((p, i) => { p.visible = crowdOn && (!close || i % 2 === 0); });
        (city.shopCrowd || []).forEach((p, i) => { p.visible = crowdOn && (!close || i % 2 === 0); });
        (city.subwayCrowd || []).forEach((p, i) => { p.visible = crowdOn && (!close || i % 2 === 0); });
    }

    function applySky() {
        const look = phaseLook(nightPhase);
        paintSky(dusk, look.stops);
        dusk.sun.position.set(18, look.sunY, 210);
        dusk.glow.position.copy(dusk.sun.position);
        dusk.sun.material.opacity = look.sunOp;
        dusk.glow.material.opacity = look.glowOp;
        dusk.sun.visible = look.sunOp > 0.05;
        dusk.glow.visible = look.glowOp > 0.04;
        dusk.sunLight.color.setHex(look.sunColor);
        dusk.sunLight.intensity = look.sunInt;
        renderer.setClearColor(look.clear, 1);
    }

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
        renderer.setPixelRatio(quality.pixelRatio);
        renderer.setSize(w, h);
        composer.setPixelRatio(quality.pixelRatio);
        composer.setSize(w, h);
        bloom.setSize(w * quality.bloomScale, h * quality.bloomScale);
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
        streetLife,
        district,
        lifeWorld,

        setShopState(state) { activities.setState(state); city.setShopState?.(state); streetLife.setState(state.expansion); lifeWorld.setState(state.life); clubScene=CLUB_SCENES.find(s=>s.id===state.life.scene)||CLUB_SCENES[0];sceneColor.set(clubScene.color);sceneAccent.set(clubScene.accent); },
        showPurchase(result) { activities.show(result); },
        captureFrame(readCanvas) {
            const visibility=camera.children.map(child=>[child,child.visible]);
            try {visibility.forEach(([child])=>child.visible=false);composer.render();return readCanvas(renderer.domElement);}
            finally {visibility.forEach(([child,visible])=>child.visible=visible);}
        },
        setCrowdVisible(v) {
            crowdOn = !!v;
            applyCrowd();
        },
        setFov(fov) {
            baseFov = fov;
            camera.fov = fov;
            camera.updateProjectionMatrix();
        },
        setBloomReduced(v) { bloom.strength = v ? 0.08 : 0.52; },
        setTipsy(v) {
            drunk = !!v;
            scene.fog.density = v ? 0.02 : 0.012;
            renderer.toneMappingExposure = v ? 1.28 : 1.08;
        },
        setCuffs(left, right) {
            const lc = leftHand.children[1]?.material;
            const rc = rightHand.children[1]?.material;
            if (lc && left) { lc.emissive.set(left); lc.emissiveIntensity = 0.55; }
            if (rc && right) { rc.emissive.set(right); rc.emissiveIntensity = 0.55; }
        },
        setNightPhase(phase) {
            nightPhase = phase || "doors";
            applyCrowd();
            applySky();
        },
        flashFloor() { floorFlash = 0.22; bloomKick = 0.18; },
        pulseKick() { bloomKick = 0.12; },
        shiftLasers() {
            for (const l of club.lasers) l.mat.color.setHSL(Math.random(), 1, 0.55);
        },
        setVibeColor,
        setLedMessage(title, sub) {
            club.setLed(title, sub);
            city.setMarquee?.(title, sub);
        },
        enableXR() { renderer.xr.enabled = true; },

        update(dt, t, ctx) {
            const bass = ctx.bass || 0;
            const mid = ctx.mid || 0;
            const bpm = ctx.bpm || 128;
            const reduced = !!ctx.reduced;
            const energy = ctx.energy || 0;
            const p = camera.position;
            const zone = getZone(p.x, p.z, p.y - 1.7);
            const outside = isOutside(p.x, p.z, p.y);

            streetLife.update(t, reduced, p);
            district.update(t,reduced,p);
            const look = phaseLook(nightPhase);
            dusk.sky.visible = true;
            dusk.sun.visible = outside && look.sunOp > 0.05;
            dusk.glow.visible = outside && look.glowOp > 0.04;
            if (outside) {
                scene.fog.color.setHex(look.fogOut);
                scene.fog.density = reduced ? 0.006 : look.fogOutD;
                hemi.color.setHex(look.hemi);
                hemi.groundColor.setHex(look.hemiGround);
                hemi.intensity = look.hemiOut;
                dusk.sunLight.intensity = look.sunInt;
                renderer.setClearColor(look.clear, 1);
                renderer.toneMappingExposure = reduced ? 1.0 : look.exposeOut;
            } else if (zone === "lounge") {
                scene.fog.color.set(0x3a2018);
                scene.fog.density = 0.016;
                hemi.color.set(0xffd0a0);
                hemi.groundColor.set(0x2a1018);
                hemi.intensity = 1.15 * (nightPhase === "close" ? 0.75 : 1);
                dusk.sunLight.intensity = 0.25 * look.sunInt;
                renderer.toneMappingExposure = 1.05;
            } else if (zone === "subway") {
                scene.fog.color.set(0x14120c);
                scene.fog.density = 0.045;
                hemi.color.set(0xffc090);
                hemi.groundColor.set(0x1a140c);
                hemi.intensity = 0.7;
                dusk.sunLight.intensity = 0;
                dusk.sun.visible = false;
                dusk.glow.visible = false;
                renderer.toneMappingExposure = 0.82;
                renderer.setClearColor(0x0c0a08, 1);
            } else if (zone === "suite") {
                scene.fog.color.set(0x2a2018);
                scene.fog.density = 0.02;
                hemi.color.set(0xffd0a0);
                hemi.intensity = 1.05;
                dusk.sunLight.intensity = 0.2 * look.sunInt;
                renderer.toneMappingExposure = 1.0;
            } else if (zone === "diner" || zone === "hotel") {
                scene.fog.color.set(0x2a1810);
                scene.fog.density = 0.018;
                hemi.intensity = 1.1;
                dusk.sunLight.intensity = 0.15 * look.sunInt;
                renderer.toneMappingExposure = 1.0;
            } else if (["records","pharmacy","florist","rivoli","liquor","barber","books","bakery","arcade"].includes(zone)) {
                const shopFog = {
                    books:0x1b3037,bakery:0x39271c,arcade:0x201d35,
                    records: 0x241028, pharmacy: 0x102820, florist: 0x281018,
                    rivoli: 0x2a1810, liquor: 0x24180c, barber: 0x201818,
                }[zone];
                scene.fog.color.setHex(shopFog);
                scene.fog.density = 0.02;
                hemi.color.set(0xffd0a0);
                hemi.groundColor.set(0x201018);
                hemi.intensity = 1.25;
                dusk.sunLight.intensity = 0.12 * look.sunInt;
                renderer.toneMappingExposure = 1.02;
            } else {
                scene.fog.color.copy(_vibe).multiplyScalar(0.12);
                scene.fog.density = 0.026 * (nightPhase === "close" ? 1.35 : 1);
                hemi.color.set(0x8877cc);
                hemi.groundColor.set(0x180010);
                hemi.intensity = 1.15;
                dusk.sunLight.intensity = 0.05;
                renderer.toneMappingExposure = nightPhase === "peak" ? 1.12 : 1.0;
            }
            if (drunk && !reduced) {
                scene.fog.density *= 1.45;
                renderer.toneMappingExposure += 0.16;
            }

            const nightMul = look.clubMul;
            club.lights.spot.intensity = (380 + bass * 160) * nightMul;
            club.lights.booth.intensity = 55 * (0.6 + bass) * nightMul;
            club.lights.bar.intensity = 70 * (nightPhase === "close" ? 0.55 : 1);
            club.lights.lounge.intensity = (48 + Math.sin(t * 1.5) * 8) * (nightPhase === "close" ? 0.62 : 1);
            if (club.lights.loungeWarm) club.lights.loungeWarm.intensity = (32 + Math.sin(t * 1.1) * 5) * (nightPhase === "close" ? 0.7 : 1);
            if (club.lights.windowDusk) club.lights.windowDusk.intensity = 18 + Math.sin(t * 0.4) * 4;
            const sweep = t * 0.25;
            club.lights.spotTarget.position.set(Math.sin(sweep) * 5.5, 0, Math.cos(sweep * 0.7) * 4);

            club.ball.rotation.y += dt * (reduced ? 0.15 : 0.45);
            club.ball.rotation.x += dt * (reduced ? 0.04 : 0.12);
            club.secretCube.rotation.y += dt * 0.8;
            club.secretCube.rotation.x += dt * 0.4;
            club.secretCube.position.y = 0.42 + Math.sin(t * 2.2) * 0.06;

            for (const person of club.namedPeople) {
                const talking = ctx.talkId === person.id;
                if (talking && person.npc.kind !== "cat") {
                    const dx = p.x - person.obj.position.x;
                    const dz = p.z - person.obj.position.z;
                    person.obj.rotation.y = Math.atan2(dx, dz);
                }
                animateHuman(person.obj, t, {
                    mode: person.npc.anim || "idle",
                    bpm,
                    talking,
                });
            }
            if (crowdOn) {
                if (!outside) {
                    for (const d of club.dancers) if (d.visible) animateHuman(d, t, { mode: d.userData.mode || "dance", bpm });
                    for (const person of club.barCrowd || []) if (person.visible) animateHuman(person, t, { mode: person.userData.mode || "idle", bpm });
                    for (const person of club.loungeCrowd || []) if (person.visible) animateHuman(person, t, { mode: person.userData.mode || "idle", bpm: 96 });
                }
                for (const ped of city.peds) {
                    if (!ped.visible) continue;
                    if (Math.hypot(p.x - ped.position.x, p.z - ped.position.z) > 36) continue;
                    animateHuman(ped, t, { mode: "walk", bpm: 96 });
                }
                const shopSide = zone === "records" || zone === "pharmacy" || zone === "florist" || zone === "rivoli" || zone === "liquor" || zone === "barber" || (outside && p.z > 28);
                for (const person of city.shopCrowd || []) {
                    // Interior NPCs carry userData.room (their zone); diner/hotel ones only animate while you're in that room.
                    const room = person.userData.room;
                    const near = room === "diner" || room === "hotel" || room === "suite" ? room === zone : shopSide;
                    if (near && person.visible) animateHuman(person, t, { mode: person.userData.mode || "idle", bpm: 96 });
                }
                if (zone === "subway") {
                    for (const person of city.subwayCrowd || []) {
                        if (person.visible) animateHuman(person, t, { mode: person.userData.mode || "idle", bpm: 88 });
                    }
                }
            }

            const dancing = !!ctx.dancing;
            const beat = t * ((bpm || 128) / 60) * Math.PI * 2;
            if (dancing && !reduced) {
                const pump = Math.sin(beat);
                leftHand.position.set(-0.32, -0.12 + Math.abs(pump) * 0.08, -0.38);
                rightHand.position.set(0.32, -0.14 + Math.abs(-pump) * 0.08, -0.38);
                leftHand.rotation.set(-1.05 + pump * 0.35, 0.12, 0.35);
                rightHand.rotation.set(-1.0 - pump * 0.35, -0.12, -0.35);
            } else {
                const handBob = Math.sin(t * 7) * 0.025;
                leftHand.position.set(-0.28, -0.22 + handBob, -0.42);
                rightHand.position.set(0.28, -0.22 - handBob, -0.42);
                leftHand.rotation.set(-0.35, -0.18, -0.12);
                rightHand.rotation.set(-0.35, 0.18, 0.12);
            }

            const laserSpeed = reduced ? 0.25 : 1;
            for (let i = 0; i < club.lasers.length; i++) {
                const L = club.lasers[i];
                L.mat.color.copy(i%2?sceneAccent:sceneColor);
                L.pivot.rotation.z = Math.sin(t * 0.7 * laserSpeed + L.phase) * 0.85;
                L.pivot.rotation.x = Math.cos(t * 0.55 * laserSpeed + L.phase * 1.3) * 0.7;
                L.mat.opacity = outside ? 0.08 : (0.22 + bass * 0.28) * look.laser;
            }
            for (let i = 0; i < club.washes.length; i++) {
                club.washes[i].opacity = outside ? 0.08 : (0.28 + bass * 0.45 + Math.sin(t * 6 + i) * 0.12) * look.laser;
                club.washes[i].color.copy(i % 2 ? sceneColor : sceneAccent);
            }
            for (let i = 0; i < club.hangLeds.length; i++) {
                const pulse = 0.45 + bass * 0.55 + Math.sin(t * 5 + i * 0.9) * 0.25;
                club.hangLeds[i].color.setHSL(((i / club.hangLeds.length) + t * 0.05) % 1, 0.9, 0.45 + pulse * 0.2);
            }

            if (floorFlash > 0) floorFlash -= dt;
            if (zone === "club") {
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
                    let pulse = (0.1 + bass * 0.55 + snake * 0.85 + checker * 0.04 + mid * 0.12) * look.floor;
                    if (floorFlash > 0) pulse = 1.2;
                    _color.copy(sceneColor);
                    _color.multiplyScalar(0.35 + pulse * 0.9);
                    _color.r += snake * 0.25;
                    _color.b += (1 - snake) * 0.15;
                    club.floor.setColorAt(i, _color);
                }
                club.floor.instanceColor.needsUpdate = true;
            }

            if (bloomKick > 0) bloomKick -= dt;
            const drunkPulse = drunk && !reduced ? 0.22 + Math.sin(t * 1.3) * 0.08 : 0;
            bloom.strength = reduced ? 0.05 : (outside ? 0.2 : zone === "club" ? 0.28 : 0.12) + (zone === "club" ? bass * 0.14 + bloomKick : 0) + drunkPulse;
            const drunkFov = drunk && !reduced ? Math.sin(t * 0.7) * 4 + Math.sin(t * 1.9) * 1.6 : 0;
            const targetFov = baseFov + (reduced ? 0 : bass * 2.4 + bloomKick * 8) + drunkFov;
            if (Math.abs(camera.fov - targetFov) > 0.05) {
                camera.fov += (targetFov - camera.fov) * 0.18;
                camera.updateProjectionMatrix();
            }

            if (zone === "club" || zone === "lounge") {
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
            }

            ledTick += dt;
            if (ledTick > 0.1) {
                club.drawLed(t, bass, ctx.clock);
                ledTick = 0;
            }

            updateCity(city, dt, t, { outside, reduced, lampMul: look.lamp, zone, position:p, camera });
            activities.update(dt,t,reduced,club.namedPeople);

            club.particles.visible = zone === "club" || zone === "lounge";
        },

        resize,
        dispose() { renderer.dispose(); },
        getFloorY,
        getZone,
    };
}
