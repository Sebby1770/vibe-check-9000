import { VRButton } from "three/addons/webxr/VRButton.js";
import { Vector3 } from "three";
import { createClub } from "./club.js";
import { createAudio } from "./audio.js";
import { createControls } from "./controls.js";
import { createHud } from "./hud.js";
import { nearestNpc, onDanceFloor, applyChoice } from "./people.js";

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
        if (m > 1) {
            x /= m;
            y /= m;
        }
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
    let club = null;
    let controls = null;
    const cubeFound = { done: false };
    let energy = 0;

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
            club?.setFov(s.fov);
            club?.setBloomReduced(s.reduced);
            club?.setCrowdVisible(s.crowd);
            controls?.setTipsy(s.tipsy);
            club?.setTipsy?.(s.tipsy);
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
            club?.setLedMessage(audio.trackName, "GUEST AUX", null);
        },
        onDeckPrev: () => {
            audio.prev();
            hud.renderTracks(audio.playlist, audio.trackIndex, audio.usingDeck);
            club?.setLedMessage(audio.trackName, "GUEST AUX", null);
        },
        onDeckNext: () => {
            audio.next();
            hud.renderTracks(audio.playlist, audio.trackIndex, audio.usingDeck);
            club?.setLedMessage(audio.trackName, "GUEST AUX", null);
        },
        onHouse: () => {
            audio.houseSystem();
            hud.renderTracks(audio.playlist, audio.trackIndex, false);
            club?.setLedMessage("VIBE CHECK 9000", "HOUSE SYSTEM", null);
            hud.toast("HOUSE SYSTEM BACK ONLINE", "#39ff14");
        },
    });

    hud.wire();
    audio.setReduced(hud.reducedFx);
    if (hud.reducedFx) audio.setMuted(true);

    if (!hasWebGL()) {
        hud.showFallback();
        return;
    }

    club = createClub(canvas);
    controls = createControls(club.camera, canvas, club.colliders);
    controls.setReduced(hud.reducedFx);
    controls.setEnabled(hud.phase === "explore");
    club.setLedMessage("VIBE CHECK 9000", "DOORS OPEN", null);

    if (navigator.xr && navigator.xr.isSessionSupported) {
        navigator.xr.isSessionSupported("immersive-vr").then((ok) => {
            if (!ok) return;
            club.enableXR();
            const vr = VRButton.createButton(club.renderer);
            vr.classList.add("vr-native");
            document.getElementById("vr-slot").appendChild(vr);
        }).catch(() => {});
    }

    bindMobile(controls, hud);

    function handleAction(action) {
        if (!action) return;
        if (action === "drop") {
            club.flashFloor();
            club.shiftLasers();
            audio.cheer();
            energy = Math.min(100, energy + 18);
        } else if (action === "drink-cyan") {
            club.setVibeColor("#00fff7");
            hud.toast("NEON SOUR — visor goes cyan", "#00fff7");
        } else if (action === "drink-mag") {
            club.setVibeColor("#ff00ff");
            hud.toast("MAGENTA STATIC", "#ff00ff");
        } else if (action === "tipsy") {
            hud.setTipsy(true);
            hud.toast("TIPSY — free, not gone", "#ffb703");
        } else if (action === "drink-lime") {
            club.setVibeColor("#39ff14");
            hud.toast("MYSTERIOUS WATER", "#39ff14");
        } else if (action === "dance") {
            hud.toast("HOLD SPACE ON THE TILES", "#39ff14");
        } else if (action === "open-deck") {
            hud.openDeck();
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
        const p = club.camera.position;
        const hit = nearestNpc(p.x, p.z, 2.2);
        if (hit) {
            hud.openTalk(hit.npc);
            return;
        }
        if (!cubeFound.done && Math.hypot(p.x - club.cube.position.x, p.z - club.cube.position.z) < 1.8) {
            cubeFound.done = true;
            hud.toast("FORBIDDEN GEOMETRY — the floor likes you more now", "#fff700");
            club.flashFloor();
            energy = Math.min(100, energy + 25);
        }
    }

    canvas.addEventListener("click", () => {
        if (hud.phase === "explore" && !controls.isLocked && !isTouch()) controls.lock();
        if (hud.phase === "explore") tryInteract();
    });

    let last = performance.now();
    club.renderer.setAnimationLoop((now) => {
        const t = now * 0.001;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const xr = club.renderer.xr.isPresenting;
        const bass = audio.getBass();
        const mid = audio.getMid();
        if (audio.consumeKick()) {
            hud.flashStrobe();
            club.pulseKick();
        }
        const move = controls.update(dt, audio.bpm, xr);
        const p = club.camera.position;
        const onFloor = onDanceFloor(p.x, p.z);
        if (move.dancing && onFloor) energy = Math.min(100, energy + dt * 22);
        else energy = Math.max(0, energy - dt * 7);

        club.camera.getWorldDirection(_dir);
        audio.setListener(p.x, p.y, p.z, _dir.x, _dir.y, _dir.z);
        club.update(dt, t, { bass, mid, bpm: audio.bpm, reduced: hud.reducedFx, energy });
        hud.setTelemetry({
            bpm: audio.bpm,
            track: audio.trackName,
            energy,
            bass,
            x: p.x,
            z: p.z,
        });

        if (hud.phase === "explore") {
            const hit = nearestNpc(p.x, p.z, 2.2);
            const nearCube = !cubeFound.done && Math.hypot(p.x - club.cube.position.x, p.z - club.cube.position.z) < 1.8;
            if (hit) hud.setInteract(`[E] TALK TO ${hit.npc.name}`, true);
            else if (nearCube) hud.setInteract("[E] TOUCH THE CUBE", true);
            else if (onFloor) hud.setInteract("SPACE TO DANCE", true);
            else hud.setInteract("", false);
        }

        if (xr) club.renderer.render(club.scene, club.camera);
        else club.composer.render();
    });
}

boot();
