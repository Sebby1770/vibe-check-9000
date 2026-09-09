import { VRButton } from "three/addons/webxr/VRButton.js";
import { Vector3 } from "three";
import { createWorld } from "./world.js";
import { createAudio } from "./audio.js";
import { createControls } from "./controls.js";
import { createHud } from "./hud.js";
import { nearestNpc, nearestProp, nearestSit, onDanceFloor, applyChoice, NPCS } from "./people.js";
import { getZone, zoneLabel } from "./zones.js";
import { createClock, dayKey, dayHash, tonightBill, PHASE_COPY, dareComplete } from "./night.js";
import { loadProgress, saveProgress, evaluateUnlocks, stampNight, setLook, getLook, touchVisit, buildRecap } from "./progress.js";

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
    const today = dayKey();
    const bill = tonightBill(dayHash(today));
    let progress = touchVisit(loadProgress(), today);
    if (bill.dare) progress = { ...progress, dareId: bill.dare.id };
    saveProgress(progress);
    let lastPhase = "doors";
    let peaked = false;
    let lastZone = "club";
    let recapShown = false;
    let dareToasted = !!progress.dareDone;

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
        const done = dareComplete(progress, bill.dare);
        if (done && !progress.dareDone) {
            progress = { ...progress, dareDone: true };
        }
        saveProgress(progress);
        hud.setProgress({
            unlocked: progress.unlocked,
            look: progress.look,
            flags: progress.flags,
            streak: progress.streak,
            dareDone: progress.dareDone,
        });
        if (freshly.length) freshly.forEach((id) => hud.unlockToast(id));
        if (progress.dareDone && !dareToasted) {
            dareToasted = true;
            hud.dareDoneToast();
        }
        hud.setRecap(buildRecap(progress, {
            clock: clock.clock,
            phase: clock.phase,
            set: bill.set.name,
            look: progress.look,
            energy,
            dare: bill.dare?.text,
            dareDone: progress.dareDone,
        }));
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
                dare: bill.dare?.text,
                dareDone: progress.dareDone,
            });
            saveProgress(progress);
        },
    });

    hud.wire();
    hud.setBill(bill);
    hud.setProgress({
        unlocked: progress.unlocked,
        look: progress.look,
        flags: progress.flags,
        streak: progress.streak,
        dareDone: progress.dareDone,
    });
    hud.setRecap(buildRecap(progress, {
        clock: clock.clock, phase: clock.phase, set: bill.set.name,
        look: progress.look, energy: progress.energyPeak, dare: bill.dare?.text, dareDone: progress.dareDone,
    }));
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
    world.city?.setRivoli?.(bill.gazette.headline);
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
            note({ flags: { drunk: true } });
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
            note({ flags: { jazz: true } });
        } else if (action === "juke") {
            audio.boostJazz();
            hud.toast("JUKEBOX — a nickel well spent", "#e0b25a");
            note({ flags: { jazz: true } });
        } else if (action === "paper") {
            hud.openPaper();
            note({ flags: { paper: true } });
        } else if (action === "phone") {
            hud.pickPhone();
        } else if (action === "hail-cab") {
            startRide();
            note({ flags: { cab: true } });
        } else if (action === "guest") {
            hud.toast("NOVA WROTE YOU IN — don't make her regret the handwriting", "#c77dff");
            note({ flags: { guest: true } });
        } else if (action === "booth") {
            hud.stampCard();
            note({ flags: { booth: true } });
        } else if (action === "coat") {
            hud.toast("The coat check is a rumor. Your jacket is a theory.", "#e0b25a");
        } else if (action === "vinyl") {
            hud.toast("B-SIDE ACQUIRED — don't scratch the jazz", "#c77dff");
            energy = Math.min(100, energy + 10);
            note({ flags: { vinyl: true } });
        } else if (action === "tonic") {
            hud.toast("IRIS'S TONIC — pupils file a report", "#66ffe0");
            energy = Math.min(100, energy + 8);
            note({ flags: { tonic: true } });
        } else if (action === "gin") {
            hud.toast("MIDTOWN GIN — the smooth century", "#e0b25a");
            note({ flags: { gin: true } });
        } else if (action === "rose") {
            hud.toast("A ROSE THAT IGNORES THE YEAR", "#ff6b9a");
            note({ flags: { rose: true } });
        } else if (action === "ticket") {
            hud.toast("RIVOLI STUB — the picture is a rumor", "#ffe7a8");
            note({ flags: { ticket: true } });
        } else if (action === "haircut") {
            hud.toast("TONY FIXED THE DECADE", "#ff3355");
            note({ flags: { haircut: true } });
        } else if (action === "subway") {
            hud.toast("THE 12:04 WAS A TRAIN. THE FLOOR DISAGREES.", "#39ff14");
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
            note({ flags: { pie: true } });
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
            if ((seat.spot.y || 0) >= 4) {
                hud.toast("THE LOUNGE HAS YOU NOW", "#e0b25a");
                note({ flags: { sat: true } });
            } else if ((seat.spot.id || "").startsWith("diner")) {
                hud.toast("COUNTER'S HONEST. YOU'RE NOT.", "#ff6b6b");
            } else if (seat.spot.id === "hotel-lobby") {
                hud.toast("THE CARPETS WILL GOSSIP", "#d4c4a8");
            } else if (seat.spot.id === "barber-chair") {
                hud.toast("MIDNIGHT IS NOT A HAIRSTYLE", "#ff3355");
            } else if (seat.spot.id === "rivoli-bench") {
                hud.toast("DON'T CLAP ON ONE", "#ffe7a8");
            } else {
                hud.toast("THE STOOL HAS YOU NOW", "#00fff7");
            }
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
            if (phase === "close" && !recapShown) {
                recapShown = true;
                note({ phase, flags: { afterhours: true }, energyPeak: energy });
                hud.openRecap();
            }
        }
        if (phase === "peak" && onFloor && !progress.flags.peakFloor) {
            note({ flags: { peakFloor: true } });
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
            dancing: move.dancing && onFloor,
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
