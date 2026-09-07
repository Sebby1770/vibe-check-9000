import { VRButton } from "three/addons/webxr/VRButton.js";
import { Vector3 } from "three";
import { createClub } from "./club.js";
import { createAudio } from "./audio.js";
import { createControls } from "./controls.js";
import { createHud } from "./hud.js";

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

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
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
    let walkedIn = false;

    const hud = createHud({
        onEnter: async ({ skipLock } = {}) => {
            await audio.unlock();
            if (!hud.reducedFx) audio.start();
            else audio.setMuted(true);
            if (!audio.muted) audio.start();
            if (!skipLock && !isTouch() && controls) controls.lock();
            document.getElementById("mobile-controls").classList.toggle("hidden", !isTouch());
            club?.setChevronVisible(true);
        },
        onOverlay: (open) => {
            if (open) controls?.unlock();
            controls?.setEnabled(!open);
        },
        onResume: () => {
            if (!isTouch()) controls?.lock();
        },
        onUnlockLook: () => controls?.unlock(),
        onQuizStart: () => {
            controls?.unlock();
            club?.setChevronVisible(false);
            walkedIn = true;
        },
        onAnswer: () => {
            club?.flashFloor();
            club?.shiftLasers();
            audio.cheer();
        },
        onDrop: async (result) => {
            club?.setDrop("blackout");
            audio.dropBlackout();
            await sleep(400);
            club?.setDrop("explode");
            club?.setVibeColor(result.color);
            club?.setLedMessage(result.title, `${result.badge} DIAGNOSIS`, result.stats);
            audio.applyVibe(result.stats);
            audio.dropExplode();
            await sleep(2600);
            club?.setDrop("idle");
        },
        onResult: (result) => {
            club?.setVibeColor(result.color);
            club?.setLedMessage(result.title, "VIBE LOCKED", result.stats);
            audio.applyVibe(result.stats);
        },
        onRescan: () => {
            walkedIn = false;
            club?.setVibeColor("#ff00ff");
            club?.setLedMessage("VIBE CHECK 9000", "RESCAN ARMED", null);
            club?.setChevronVisible(true);
            controls?.resetSpawn();
            if (!isTouch()) controls?.lock();
        },
        onMute: (forced) => {
            if (typeof forced === "boolean") {
                audio.setMuted(forced);
                if (!forced) audio.start();
                return audio.muted;
            }
            const m = audio.toggleMute();
            if (!m) audio.start();
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
            document.documentElement.classList.toggle("reduced-fx", s.reduced);
        },
        onInteract: () => tryInteract(),
    });

    hud.wire();
    audio.setReduced(hud.reducedFx);
    if (hud.reducedFx) audio.setMuted(true);

    if (!hasWebGL()) {
        hud.showFallback();
        hud.loadShared();
        return;
    }

    club = createClub(canvas);
    controls = createControls(club.camera, canvas, club.colliders);
    controls.setReduced(hud.reducedFx);
    controls.setEnabled(hud.phase === "explore");

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
    hud.loadShared();

    function distTo(x, z) {
        const p = club.camera.position;
        return Math.hypot(p.x - x, p.z - z);
    }

    function tryInteract() {
        if (hud.phase !== "explore") return;
        if (distTo(club.kiosk.x, club.kiosk.z) < 3) {
            hud.beginQuiz();
            return;
        }
        if (!cubeFound.done && distTo(club.cube.position.x, club.cube.position.z) < 1.8) {
            cubeFound.done = true;
            hud.unlockFlags({ cube: true });
            hud.toast("FORBIDDEN GEOMETRY ACKNOWLEDGED", "#fff700");
            club.flashFloor();
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
        controls.update(dt, audio.bpm, xr);
        club.camera.getWorldDirection(_dir);
        audio.setListener(
            club.camera.position.x,
            club.camera.position.y,
            club.camera.position.z,
            _dir.x, _dir.y, _dir.z,
        );
        club.update(dt, t, { bass, mid, bpm: audio.bpm, reduced: hud.reducedFx });
        hud.setTelemetry({
            bpm: audio.bpm,
            heading: Math.round(((Math.atan2(_dir.x, -_dir.z) * 180) / Math.PI + 360) % 360),
            x: club.camera.position.x,
            z: club.camera.position.z,
            bass,
        });

        if (hud.phase === "explore") {
            const dK = distTo(club.kiosk.x, club.kiosk.z);
            const dC = distTo(club.cube.position.x, club.cube.position.z);
            if (dK < 3) hud.setInteract("[E] START SCAN", true);
            else if (dC < 1.8 && !cubeFound.done) hud.setInteract("[E] TOUCH THE CUBE", true);
            else hud.setInteract("", false);
            if (dK < 1.15 && !walkedIn) {
                walkedIn = true;
                hud.beginQuiz();
            }
        }

        if (xr) club.renderer.render(club.scene, club.camera);
        else club.composer.render();
    });

    console.log("%c VIBE CHECK 9000™ ", "background: linear-gradient(90deg, #ff00ff, #00fff7); color: #000; font-size: 22px; font-weight: 900; padding: 8px 16px;");
    console.log("%cHeadset visor online. Walk to the scanner.", "color: #39ff14;");
}

boot();
