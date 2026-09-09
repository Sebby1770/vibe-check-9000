import { VRButton } from "three/addons/webxr/VRButton.js";
import { Vector3 } from "three";
import { createWorld } from "./world.js";
import { createAudio } from "./audio.js";
import { createControls } from "./controls.js";
import { createHud } from "./hud.js";
import { nearestNpc, nearestProp, nearestSit, onDanceFloor, applyChoice, NPCS } from "./people.js";
import { getZone, zoneLabel } from "./zones.js";
import { createClock, dayKey, dayHash, tonightBill, PHASE_COPY } from "./night.js";
import { loadProgress, saveProgress, evaluateUnlocks, stampNight, setLook, getLook } from "./progress.js";

const _dir = new Vector3();

function hasWebGL() {
    try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
        return false;
    }
}

function isTouch() {
    return window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
}

function bindMobile(controls, hud) {
    const root = document.getElementById("mobile-controls");
    const stick = document.getElementById("stick");
    const knob = document.getElementById("stick-knob");
    if (!isTouch()) return;
    root.classList.remove("hidden");
    hud.toast("TAP LOOK + ON-SCREEN STICK", "#00fff7");

    let sid = null;
    stick.addEventListener("pointerdown", (e) => {
        sid = e.pointerId;
        stick.setPointerCapture(sid);
        moveStick(e);
    });
    stick.addEventListener("pointermove", (e) => {
        if (e.pointerId === sid) moveStick(e);
    });
    const end = (e) => {
        if (e.pointerId !== sid) return;
        sid = null;
        knob.style.transform = "translate(-50%, -50%)";
        controls.setStick(0, 0);
    };
    stick.addEventListener("pointerup", end);
    stick.addEventListener("pointercancel", end);

    function moveStick(e) {
        const r = stick.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let x = (e.clientX - cx) / (r.width / 2);
        let y = (e.clientY - cy) / (r.height / 2);
        const m = Math.hypot(x, y);
        if (m > 1) { x /= m; y /= m; }
        knob.style.transform = `translate(calc(-50% + ${x * 28}px), calc(-50% + ${y * 28}px))`;
        controls.setStick(x, y);
    }

    let lookId = null;
    let last = null;
    const lookPad = document.getElementById("look-pad");
    lookPad.addEventListener("pointerdown", (e) => {
        lookId = e.pointerId;
        last = { x: e.clientX, y: e.clientY };
        lookPad.setPointerCapture(lookId);
    });
    lookPad.addEventListener("pointermove", (e) => {
        if (e.pointerId !== lookId || !last) return;
        controls.lookDelta(e.clientX - last.x, e.clientY - last.y);
        last = { x: e.clientX, y: e.clientY };
    });
    lookPad.addEventListener("pointerup", () => { lookId = null; });
}

async function boot() {
    const canvas = document.getElementById("gl");
    const audio = createAudio();
    let world = null;
    let controls = null;
    const cubeFound = { done: false };
    let energy = 0;
    let ride = null;
    const clock = createClock();
    const bill = tonightBill(dayHash(dayKey()));
    let progress = loadProgress();
    let lastPhase = "doors";
    let peaked = false;
    let lastZone = "club";

    function wear(look) {
        if (!look) look = getLook(progress.look);
        world?.setCuffs(look.left, look.right);
        world?.setVibeColor(look.visor);
        document.documentElement.style.setProperty("--visor", look.visor);
    }

    function note(events = {}) {
        const { progress: next, freshly } = evaluateUnlocks(progress, events);
        const changed = freshly.length
            || next.talked.length !== progress.talked.length
            || next.zones.length !== progress.zones.length
            || next.energyPeak !== progress.energyPeak
            || JSON.stringify(next.flags) !== JSON.stringify(progress.flags);
        progress = next;
        if (!changed) return;
        saveProgress(progress);
        if (freshly.length) {
            hud.setProgress({ unlocked: progress.unlocked, look: progress.look });
            freshly.forEach((id) => hud.unlockToast(id));
        }
    }

    const hud = createHud({
        onEnter: async () => {
            await audio.unlock();
            if (!hud.reducedFx) audio.start();
            else audio.setMuted(true);
            if (!audio.muted) audio.start();
            if (!isTouch() && controls) controls.lock();
            document.getElementById("mobile-controls").classList.toggle("hidden", !isTouch());
        },
        onOverlay: (open) => {
            if (open) controls?.unlock();
            controls?.setEnabled(!open);
        },
        onResume: () => {
            if (!isTouch()) controls?.lock();
        },
        onUnlockLook: () => controls?.unlock(),
        onMute: (forced) => {
            if (typeof forced === "boolean") {
                audio.setMuted(forced);
                if (!forced && !audio.usingDeck) audio.start();
                return audio.muted;
            }
            const m = audio.toggleMute();
            if (!m && !audio.usingDeck) audio.start();
            return m;
        },
        onSettings: (s) => {
            audio.setReduced(s.reduced);
            audio.setMuted(s.muted);
            controls?.setReduced(s.reduced);
            controls?.setSensitivity(s.sensitivity);
            controls?.setFov(s.fov);
            world?.setFov(s.fov);
            world?.setBloomReduced(s.reduced);
            world?.setCrowdVisible(s.crowd);
            controls?.setTipsy(s.tipsy);
            world?.setTipsy?.(s.tipsy);
            document.documentElement.classList.toggle("reduced-fx", s.reduced);
        },
        onInteract: () => tryInteract(),
        onTalkChoice: (i) => handleChoice(i),
        onFiles: (files) => {
            const n = audio.addFiles(files);
            if (n) {
                hud.toast(`${n} TRACK${n > 1 ? "S" : ""} ON THE DECK`, "#00fff7");
                hud.renderTracks(audio.playlist, audio.trackIndex, audio.usingDeck);
                hud.openDeck();
            }
        },
        onDeckPlay: (i) => {
            audio.playTrack(i == null ? Math.max(0, audio.trackIndex) : i);
            hud.renderTracks(audio.playlist, audio.trackIndex, true);
            world?.setLedMessage(audio.trackName, "GUEST AUX");
        },
        onDeckPrev: () => {
            audio.prev();
            hud.renderTracks(audio.playlist, audio.trackIndex, audio.usingDeck);
            world?.setLedMessage(audio.trackName, "GUEST AUX");
        },
        onDeckNext: () => {
            audio.next();
            hud.renderTracks(audio.playlist, audio.trackIndex, audio.usingDeck);
            world?.setLedMessage(audio.trackName, "GUEST AUX");
        },
        onHouse: () => {
            audio.houseSystem();
            audio.setHouseSet(bill.set);
            hud.renderTracks(audio.playlist, audio.trackIndex, false);
            world?.setLedMessage(bill.set.name, "HOUSE SYSTEM");
            hud.toast(`${bill.set.name} BACK ONLINE`, "#39ff14");
        },
        onLook: (look) => {
            progress = setLook(progress, look.id);
            saveProgress(progress);
            wear(look);
        },
        onStamp: () => {
            progress = stampNight(progress, {
                clock: clock.clock,
                phase: clock.phase,
                zone: hud.run.zone,
                energy,
                look: progress.look,
                set: bill.set.name,
            });
            saveProgress(progress);
        },
    });

    hud.wire();
    hud.setBill(bill);
    hud.setProgress({ unlocked: progress.unlocked, look: progress.look });
    const scotty = NPCS.find((n) => n.id === "scotty");
    if (scotty && bill.gazette) {
        scotty.nodes.start.say = `MIDTOWN GAZETTE. ${bill.gazette.headline} Five cents, or Harold's copy if you're cheap.`;
        scotty.nodes.head.say = `${bill.gazette.headline} I shouted it first.`;
    }
    audio.setReduced(hud.reducedFx);
    if (hud.reducedFx) audio.setMuted(true);
    audio.setHouseSet(bill.set);

    if (!hasWebGL()) {
        hud.showFallback();
        return;
    }

    world = createWorld(canvas);
    controls = createControls(world.camera, canvas, world.colliders);
    controls.setReduced(hud.reducedFx);
    controls.setEnabled(hud.phase === "explore");
    world.setLedMessage(bill.set.name, "DOORS OPEN");
    world.setNightPhase(clock.phase);
    wear(getLook(progress.look));

    if (navigator.xr && navigator.xr.isSessionSupported) {
        navigator.xr.isSessionSupported("immersive-vr").then((ok) => {
            if (!ok) return;
            world.enableXR();
            const vr = VRButton.createButton(world.renderer);
            vr.classList.add("vr-native");
            document.getElementById("vr-slot").appendChild(vr);
        }).catch(() => {});
    }

    bindMobile(controls, hud);

    function startRide() {
        if (ride) return;
        const startX = world.camera.position.x;
        ride = { t: 0, startX, endX: startX > 0 ? -28 : 8 };
        controls.setRiding(true);
        controls.unlock();
        hud.setRide(true);
        audio.horn();
        hud.toast("CHECKER CAB — hold on to your visor", "#f5c518");
    }

    function handleAction(action) {
        if (!action) return;
        if (action === "drop") {
            world.flashFloor();
            world.shiftLasers();
            audio.cheer();
            energy = Math.min(100, energy + 18);
        } else if (action === "drink-cyan") {
            world.setVibeColor("#00fff7");
            hud.toast("NEON SOUR — visor goes cyan", "#00fff7");
        } else if (action === "drink-mag") {
            world.setVibeColor("#ff00ff");
            hud.toast("MAGENTA STATIC", "#ff00ff");
        } else if (action === "tipsy") {
            hud.setTipsy(true);
            hud.toast("DRUNK — the room has a second opinion", "#ffb703");
        } else if (action === "drink-lime") {
            world.setVibeColor("#39ff14");
            hud.toast("MYSTERIOUS WATER", "#39ff14");
        } else if (action === "dance") {
            hud.toast("HOLD SPACE ON THE TILES", "#39ff14");
        } else if (action === "open-deck") {
            hud.openDeck();
        } else if (action === "jazz") {
            audio.boostJazz();
            hud.toast("VELMA TAKES THE BRIDGE", "#e0b25a");
        } else if (action === "juke") {
            audio.boostJazz();
            hud.toast("JUKEBOX — a nickel well spent", "#e0b25a");
        } else if (action === "paper") {
            hud.openPaper();
        } else if (action === "phone") {
            hud.pickPhone();
        } else if (action === "hail-cab") {
            startRide();
        } else if (action === "pet-cat") {
            hud.toast("SOCKS APPROVES — alley reputation +1", "#d8d0c4");
            energy = Math.min(100, energy + 8);
            note({ flags: { cat: true } });
        } else if (action === "coffee") {
            hud.setTipsy(false);
            hud.toast("DOTTIE'S COFFEE — the visor focuses", "#c45c28");
            energy = Math.min(100, energy + 12);
        } else if (action === "pie") {
            hud.toast("CHERRY PIE — 1954 tastes like a win", "#ff6b6b");
            energy = Math.min(100, energy + 16);
        }
    }

    function handleChoice(i) {
        const npc = hud.talkNpc;
        const result = applyChoice(npc, hud.talkNode, i);
        if (result.action === "open-deck") {
            handleAction(result.action);
            return;
        }
        handleAction(result.action);
        if (result.closed) hud.closeTalk();
        else hud.setTalkNode(result.nodeId);
    }

    function tryInteract() {
        if (hud.phase !== "explore") return;
        if (controls.sitting) {
            controls.stand();
            hud.toast("BACK ON YOUR FEET", "#e0b25a");
            return;
        }
        const p = world.camera.position;
        const fy = controls.floorY;
        const hit = nearestNpc(p.x, p.z, fy, 2.3);
        if (hit) {
            hud.openTalk(hit.npc);
            note({ talkId: hit.npc.id });
            return;
        }
        const prop = nearestProp(p.x, p.z, fy, 2.4);
        if (prop) {
            handleAction(prop.prop.action);
            return;
        }
        const seat = nearestSit(p.x, p.z, fy, 1.85);
        if (seat) {
            controls.sit(seat.spot);
            hud.toast("THE LOUNGE HAS YOU NOW", "#e0b25a");
            note({ flags: { sat: true } });
            return;
        }
        if (!cubeFound.done && Math.hypot(p.x - world.cube.position.x, p.z - world.cube.position.z) < 1.8 && fy < 2) {
            cubeFound.done = true;
            hud.toast("FORBIDDEN GEOMETRY — the floor likes you more now", "#fff700");
            world.flashFloor();
            energy = Math.min(100, energy + 25);
            note({ flags: { cube: true }, energyPeak: energy });
        }
    }

    canvas.addEventListener("click", () => {
        if (hud.phase === "explore" && !controls.isLocked && !isTouch() && !controls.riding) controls.lock();
        if (hud.phase === "explore") tryInteract();
    });

    let last = performance.now();
    world.renderer.setAnimationLoop((now) => {
        const t = now * 0.001;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const xr = world.renderer.xr.isPresenting;
        const bass = audio.getBass();
        const mid = audio.getMid();
        if (audio.consumeKick()) {
            hud.flashStrobe();
            world.pulseKick();
        }

        if (ride) {
            ride.t += dt;
            const u = Math.min(1, ride.t / 4.2);
            const ease = u < 0.5 ? 2 * u * u : -1 + (4 - 2 * u) * u;
            const x = ride.startX + (ride.endX - ride.startX) * ease;
            world.camera.position.set(x, 1.35, 21.5);
            world.camera.lookAt(x + (ride.endX - ride.startX) * 0.15, 1.2, 21.5);
            if (u >= 1) {
                const z = 16.2;
                controls.setRiding(false);
                controls.place(ride.endX, z, ride.endX, 10);
                hud.setRide(false);
                hud.toast("END OF THE LINE — 47TH STREET", "#f5c518");
                ride = null;
                if (!isTouch()) controls.lock();
            }
        }

        const move = controls.update(dt, audio.bpm, xr);
        const p = world.camera.position;
        const fy = controls.floorY;
        const onFloor = onDanceFloor(p.x, p.z, fy);
        if (move.dancing && onFloor) energy = Math.min(100, energy + dt * 22);
        else energy = Math.max(0, energy - dt * 7);

        clock.tick(hud.phase === "explore" ? dt : dt * 0.25);
        const phase = clock.phase;
        if (phase !== lastPhase) {
            lastPhase = phase;
            const copy = PHASE_COPY[phase];
            audio.setNightPhase(phase);
            world.setNightPhase(phase);
            world.setLedMessage(bill.set.name, copy.led);
            hud.toast(copy.toast, phase === "peak" ? "#ff00ff" : "#ffb703");
            if (phase === "peak" && !peaked) {
                peaked = true;
                world.flashFloor();
                world.shiftLasers();
                audio.cheer();
                audio.boostJazz();
            }
            if (phase === "lastcall" || phase === "close") note({ phase, flags: { lastcall: true }, energyPeak: energy });
        }

        const zone = getZone(p.x, p.z, fy);
        audio.setZone(zone);
        hud.setZone(zone, zoneLabel(zone));
        hud.setNight({ clock: clock.clock, phase, copy: PHASE_COPY[phase] });
        if (zone !== lastZone) {
            lastZone = zone;
            note({ zone, energyPeak: energy });
        } else if (energy > (progress.energyPeak || 0) + 4) {
            note({ energyPeak: energy });
        }

        world.camera.getWorldDirection(_dir);
        audio.setListener(p.x, p.y, p.z, _dir.x, _dir.y, _dir.z);
        world.update(dt, t, {
            bass, mid, bpm: audio.bpm, reduced: hud.reducedFx, energy,
            talkId: hud.talkNpc && hud.talkNpc.id,
            clock: clock.clock,
            phase,
        });
        hud.setTelemetry({
            bpm: audio.bpm,
            track: audio.trackName,
            energy,
            bass,
            clock: clock.clock,
        });

        if (hud.phase === "explore" && !ride) {
            if (controls.sitting) hud.setInteract("[E] STAND UP  ·  WASD TO GET UP", true);
            else {
                const hit = nearestNpc(p.x, p.z, fy, 2.3);
                const prop = nearestProp(p.x, p.z, fy, 2.4);
                const seat = nearestSit(p.x, p.z, fy, 1.85);
                const nearCube = !cubeFound.done && Math.hypot(p.x - world.cube.position.x, p.z - world.cube.position.z) < 1.8 && fy < 2;
                if (hit) hud.setInteract(`[E] TALK TO ${hit.npc.name}`, true);
                else if (prop) hud.setInteract(prop.prop.prompt, true);
                else if (seat) hud.setInteract(seat.spot.prompt, true);
                else if (nearCube) hud.setInteract("[E] TOUCH THE CUBE", true);
                else if (onFloor) hud.setInteract("SPACE TO DANCE", true);
                else hud.setInteract("", false);
            }
        }

        if (xr) world.renderer.render(world.scene, world.camera);
        else world.composer.render();
    });
}

boot();
