import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { Euler, Vector3 } from "three";

const EYE = 1.7;
const _fwd = new Vector3();
const _euler = new Euler(0, 0, 0, "YXZ");
const PI_2 = Math.PI / 2;

export function createControls(camera, domElement, colliders) {
    const plc = new PointerLockControls(camera, domElement);
    plc.pointerSpeed = 1;
    plc.minPolarAngle = 0.12;
    plc.maxPolarAngle = Math.PI - 0.12;

    const keys = { w: false, a: false, s: false, d: false };
    const stick = { x: 0, y: 0 };
    let lookDrag = false;
    let lastLook = null;
    let bobPhase = 0;
    let reduced = false;
    let fov = 88;
    let sprint = false;
    let enabled = true;

    camera.position.set(0, EYE, 14);
    camera.lookAt(0, 1.6, -12);

    function onKey(e, down) {
        const k = e.key.toLowerCase();
        if (k === "w" || k === "arrowup") keys.w = down;
        if (k === "s" || k === "arrowdown") keys.s = down;
        if (k === "a" || k === "arrowleft") keys.a = down;
        if (k === "d" || k === "arrowright") keys.d = down;
        if (k === "shift") sprint = down;
        if (down && (k === "w" || k === "a" || k === "s" || k === "d" || k.startsWith("arrow"))) {
            if (["INPUT", "TEXTAREA"].includes(e.target && e.target.tagName)) return;
            e.preventDefault();
        }
    }

    window.addEventListener("keydown", (e) => onKey(e, true));
    window.addEventListener("keyup", (e) => onKey(e, false));

    function applyLook(dx, dy) {
        _euler.setFromQuaternion(camera.quaternion);
        _euler.y -= dx * 0.0022 * plc.pointerSpeed;
        _euler.x -= dy * 0.0022 * plc.pointerSpeed;
        _euler.x = Math.max(PI_2 - plc.maxPolarAngle, Math.min(PI_2 - plc.minPolarAngle, _euler.x));
        camera.quaternion.setFromEuler(_euler);
    }

    function onPointerDown(e) {
        if (plc.isLocked) return;
        if (e.target !== domElement && !domElement.contains(e.target)) return;
        lookDrag = true;
        lastLook = { x: e.clientX, y: e.clientY };
    }

    function onPointerMove(e) {
        if (!lookDrag || plc.isLocked) return;
        const dx = e.clientX - lastLook.x;
        const dy = e.clientY - lastLook.y;
        lastLook = { x: e.clientX, y: e.clientY };
        applyLook(dx, dy);
    }

    function onPointerUp() {
        lookDrag = false;
    }

    domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    function resolve(pos) {
        const b = colliders.bounds;
        pos.x = Math.max(b.minX, Math.min(b.maxX, pos.x));
        pos.z = Math.max(b.minZ, Math.min(b.maxZ, pos.z));
        for (const box of colliders.boxes) {
            if (pos.x > box.minX && pos.x < box.maxX && pos.z > box.minZ && pos.z < box.maxZ) {
                const left = pos.x - box.minX;
                const right = box.maxX - pos.x;
                const near = pos.z - box.minZ;
                const far = box.maxZ - pos.z;
                const m = Math.min(left, right, near, far);
                if (m === left) pos.x = box.minX;
                else if (m === right) pos.x = box.maxX;
                else if (m === near) pos.z = box.minZ;
                else pos.z = box.maxZ;
            }
        }
    }

    return {
        plc,
        get isLocked() { return plc.isLocked; },
        get object() { return camera; },

        lock() {
            try { plc.lock(); } catch { /* pointer lock optional */ }
        },
        unlock() {
            try { plc.unlock(); } catch { /* already free */ }
        },

        setEnabled(v) { enabled = !!v; },
        setReduced(v) { reduced = !!v; },
        setSensitivity(v) { plc.pointerSpeed = v; },
        setFov(v) {
            fov = v;
            camera.fov = v;
            camera.updateProjectionMatrix();
        },
        get fov() { return fov; },

        setStick(x, y) {
            stick.x = Math.max(-1, Math.min(1, x));
            stick.y = Math.max(-1, Math.min(1, y));
        },

        lookDelta(dx, dy) {
            if (!plc.isLocked) applyLook(dx, dy);
        },

        resetSpawn() {
            camera.position.set(0, EYE, 14);
            camera.lookAt(0, 1.6, -12);
            bobPhase = 0;
        },

        update(dt, bpm, xrPresenting) {
            if (!enabled || xrPresenting) {
                camera.position.y = EYE;
                return { moving: false };
            }

            const speed = (sprint ? 5.6 : 3.5);
            let f = 0;
            let r = 0;
            if (keys.w) f += 1;
            if (keys.s) f -= 1;
            if (keys.d) r += 1;
            if (keys.a) r -= 1;
            f += -stick.y;
            r += stick.x;

            const mag = Math.hypot(f, r);
            if (mag > 1) {
                f /= mag;
                r /= mag;
            }

            if (f !== 0) plc.moveForward(f * speed * dt);
            if (r !== 0) plc.moveRight(r * speed * dt);

            resolve(camera.position);

            const moving = mag > 0.04 || keys.w || keys.a || keys.s || keys.d;
            if (moving && !reduced) {
                bobPhase += dt * (bpm / 60) * Math.PI * 2;
                camera.position.y = EYE + Math.sin(bobPhase) * 0.035;
            } else {
                camera.position.y = EYE;
                if (!moving) bobPhase = 0;
            }

            camera.getWorldDirection(_fwd);
            return { moving, forward: _fwd };
        },
    };
}
