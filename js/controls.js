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
    let fov = 82;
    let sprint = false;
    let enabled = true;
    let dance = false;
    let tipsy = false;
    let swayT = 0;
    let baseLook = 1;
    let floorY = 0;
    let riding = false;

    camera.position.set(0, EYE, 8);
    camera.lookAt(0, 1.6, -12);

    function onKey(e, down) {
        const k = e.key.toLowerCase();
        if (k === "w" || k === "arrowup") keys.w = down;
        if (k === "s" || k === "arrowdown") keys.s = down;
        if (k === "a" || k === "arrowleft") keys.a = down;
        if (k === "d" || k === "arrowright") keys.d = down;
        if (k === "shift") sprint = down;
        if (k === " " || e.code === "Space") {
            dance = down;
            e.preventDefault();
        }
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
    function onPointerUp() { lookDrag = false; }
    domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    function resolve(pos) {
        const b = colliders.bounds;
        pos.x = Math.max(b.minX, Math.min(b.maxX, pos.x));
        pos.z = Math.max(b.minZ, Math.min(b.maxZ, pos.z));
        const py = pos.y;
        for (const box of colliders.boxes) {
            const minY = box.minY ?? -99;
            const maxY = box.maxY ?? 99;
            if (py < minY || py > maxY) continue;
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
        get floorY() { return floorY; },
        get riding() { return riding; },
        setRiding(v) { riding = !!v; },

        lock() { try { plc.lock(); } catch { /* optional */ } },
        unlock() { try { plc.unlock(); } catch { /* already free */ } },
        setEnabled(v) { enabled = !!v; },
        setReduced(v) { reduced = !!v; },
        setSensitivity(v) {
            baseLook = v;
            plc.pointerSpeed = tipsy ? v * 0.84 : v;
        },
        setTipsy(v) {
            tipsy = !!v;
            plc.pointerSpeed = tipsy ? baseLook * 0.84 : baseLook;
            if (!tipsy) {
                _euler.setFromQuaternion(camera.quaternion);
                _euler.z = 0;
                camera.quaternion.setFromEuler(_euler);
            }
        },
        get tipsy() { return tipsy; },
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
            camera.position.set(0, EYE, 8);
            camera.lookAt(0, 1.6, -12);
            floorY = 0;
            bobPhase = 0;
        },
        place(x, z, lookX, lookZ) {
            floorY = colliders.getFloorY(x, z, floorY);
            camera.position.set(x, floorY + EYE, z);
            if (lookX != null) camera.lookAt(lookX, floorY + 1.5, lookZ);
        },

        update(dt, bpm, xrPresenting) {
            if (riding) {
                camera.position.y = EYE + 0.55;
                return { moving: true, dancing: false, tipsy, forward: _fwd, floorY };
            }
            if (!enabled || xrPresenting) {
                camera.position.y = floorY + EYE;
                return { moving: false, dancing: false, tipsy, forward: _fwd, floorY };
            }

            swayT += dt;
            const speed = (sprint ? 5.8 : 3.6) * (tipsy ? 0.9 : 1);
            let f = 0;
            let r = 0;
            if (keys.w) f += 1;
            if (keys.s) f -= 1;
            if (keys.d) r += 1;
            if (keys.a) r -= 1;
            f += -stick.y;
            r += stick.x;
            const mag = Math.hypot(f, r);
            if (mag > 1) { f /= mag; r /= mag; }

            if (f !== 0) plc.moveForward(f * speed * dt);
            if (r !== 0) plc.moveRight(r * speed * dt);
            if (tipsy && !reduced && mag > 0.04) plc.moveRight(Math.sin(swayT * 0.85) * 0.18 * dt);

            resolve(camera.position);
            floorY = colliders.getFloorY(camera.position.x, camera.position.z, floorY);

            const moving = mag > 0.04 || keys.w || keys.a || keys.s || keys.d;
            let bob = 0;
            if ((moving || dance) && !reduced) {
                bobPhase += dt * (bpm / 60) * Math.PI * 2 * (dance ? 1.35 : 1);
                bob = Math.sin(bobPhase) * (dance ? 0.07 : 0.035);
            } else if (tipsy && !reduced) {
                bob = Math.sin(swayT * 1.05) * 0.02;
            } else if (!moving && !dance) bobPhase = 0;

            camera.position.y = floorY + EYE + bob;

            if (tipsy && !reduced) {
                _euler.setFromQuaternion(camera.quaternion);
                _euler.z = Math.sin(swayT * 0.62) * 0.048 + Math.sin(swayT * 1.28) * 0.016;
                camera.quaternion.setFromEuler(_euler);
            }

            camera.getWorldDirection(_fwd);
            return { moving, dancing: dance, tipsy, forward: _fwd, floorY };
        },
    };
}
