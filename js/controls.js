import { resolveMovement } from './collision.js';
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
    let sitting = false;
    let sitSpot = null;
    let drunkDrift = 0;
    let air = null;
    let cool = 0;

    camera.position.set(0, EYE, 8);
    camera.lookAt(0, 1.6, -12);

    function onKey(e, down) {
        if (!enabled) return;
        if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;
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
    window.addEventListener("blur", () => { for (const k of Object.keys(keys)) keys[k]=false; dance=false; sprint=false; stick.x=stick.y=0; });

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


    return {
        plc,
        get isLocked() { return plc.isLocked; },
        get object() { return camera; },
        get floorY() { return floorY; },
        get riding() { return riding; },
        get airborne() { return !!air; },
        setRiding(v) { riding = !!v; },
        knock(hit) {
            if (!hit || air || cool > 0 || riding || sitting) return false;
            sitting = false;
            sitSpot = null;
            air = {
                vx: hit.vx,
                vz: hit.vz,
                vy: hit.vy,
                t: 0,
            };
            return true;
        },

        lock() {
            // Browsers may reject capture after an overlay or without a fresh gesture.
            try { domElement.requestPointerLock()?.catch(() => {}); } catch { /* Drag-to-look remains available. */ }
        },
        unlock() { try { plc.unlock(); } catch { /* already free */ } },
        setEnabled(v) { enabled = !!v; if (!enabled) { for (const k of Object.keys(keys)) keys[k]=false; stick.x=stick.y=0; dance=false; sprint=false; lookDrag=false; } },
        setReduced(v) { reduced = !!v; },
        setSensitivity(v) {
            baseLook = v;
            plc.pointerSpeed = tipsy ? v * 0.62 : v;
        },
        setTipsy(v) {
            tipsy = !!v;
            plc.pointerSpeed = tipsy ? baseLook * 0.62 : baseLook;
            if (!tipsy) {
                _euler.setFromQuaternion(camera.quaternion);
                _euler.z = 0;
                camera.quaternion.setFromEuler(_euler);
            }
        },
        get sitting() { return sitting; },
        sit(spot) {
            sitting = true;
            sitSpot = spot;
            floorY = spot.y || 0;
            camera.position.set(spot.x, floorY + (spot.eye || 1.16), spot.z);
            camera.lookAt(spot.lookX, floorY + (spot.lookY ?? 1.32), spot.lookZ);
            _euler.setFromQuaternion(camera.quaternion);
            _euler.z = 0;
            camera.quaternion.setFromEuler(_euler);
        },
        stand() {
            if (!sitting) return false;
            sitting = false;
            sitSpot = null;
            camera.position.y = floorY + EYE;
            _euler.setFromQuaternion(camera.quaternion);
            _euler.z = 0;
            camera.quaternion.setFromEuler(_euler);
            return true;
        },
        get tipsy() { return tipsy; },
        setFov(v) {
            fov = v;
            camera.fov = v;
            camera.updateProjectionMatrix();
        },
        get fov() { return fov; },
        setDance(v) { dance=!!v && enabled; },
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
            const previous={x:camera.position.x,z:camera.position.z};
            if (cool > 0) cool -= dt;
            if (air) {
                air.t += dt;
                air.vy -= 16.5 * dt;
                camera.position.x += air.vx * dt;
                camera.position.z += air.vz * dt;
                camera.position.y += air.vy * dt;
                air.vx *= 0.985;
                air.vz *= 0.985;
                resolveMovement(camera.position,previous,colliders);
                floorY = colliders.getFloorY(camera.position.x, camera.position.z, floorY);
                const ground = floorY + EYE;
                _euler.setFromQuaternion(camera.quaternion);
                _euler.z = Math.sin(air.t * 9) * 0.28;
                _euler.x += air.vy * dt * 0.04;
                _euler.x = Math.max(PI_2 - plc.maxPolarAngle, Math.min(PI_2 - plc.minPolarAngle, _euler.x));
                camera.quaternion.setFromEuler(_euler);
                if (camera.position.y <= ground && air.vy <= 0) {
                    camera.position.y = ground;
                    air = null;
                    cool = 0.85;
                    _euler.z = 0;
                    camera.quaternion.setFromEuler(_euler);
                }
                camera.getWorldDirection(_fwd);
                return { moving: true, dancing: false, tipsy, airborne: true, forward: _fwd, floorY };
            }
            if (riding) {
                camera.position.y = EYE + 0.55;
                return { moving: true, dancing: false, tipsy, forward: _fwd, floorY };
            }
            if (!enabled || xrPresenting) {
                camera.position.y = floorY + (sitting ? (sitSpot?.eye || 1.16) : EYE);
                return { moving: false, dancing: false, tipsy, forward: _fwd, floorY };
            }

            swayT += dt;
            if (sitting) {
                const eye = (sitSpot && sitSpot.eye) || 1.16;
                let bob = 0;
                if (tipsy && !reduced) {
                    bob = Math.sin(swayT * 1.4) * 0.03;
                    _euler.setFromQuaternion(camera.quaternion);
                    _euler.z = Math.sin(swayT * 0.5) * 0.1 + Math.sin(swayT * 1.6) * 0.04;
                    camera.quaternion.setFromEuler(_euler);
                }
                camera.position.y = floorY + eye + bob;
                if (keys.w || keys.a || keys.s || keys.d) this.stand();
                camera.getWorldDirection(_fwd);
                return { moving: false, dancing: false, tipsy, sitting: true, forward: _fwd, floorY };
            }

            const speed = (sprint ? 5.8 : 3.6) * (tipsy ? 0.68 : 1);
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
            if (tipsy && !reduced) {
                drunkDrift += dt;
                plc.moveRight((Math.sin(swayT * 0.55) * 0.85 + Math.sin(swayT * 1.65) * 0.4) * dt);
                plc.moveForward(Math.sin(swayT * 0.38) * 0.28 * dt);
            }

            resolveMovement(camera.position,previous,colliders);
            floorY = colliders.getFloorY(camera.position.x, camera.position.z, floorY);

            const moving = mag > 0.04 || keys.w || keys.a || keys.s || keys.d;
            let bob = 0;
            if ((moving || dance) && !reduced) {
                bobPhase += dt * (bpm / 60) * Math.PI * 2 * (dance ? 1.55 : 1);
                bob = Math.sin(bobPhase) * (dance ? 0.1 : 0.035);
                if (dance) {
                    _euler.setFromQuaternion(camera.quaternion);
                    _euler.z = Math.sin(bobPhase * 0.5) * 0.045;
                    camera.quaternion.setFromEuler(_euler);
                }
            } else if (tipsy && !reduced) {
                bob = Math.sin(swayT * 1.7) * 0.045 + Math.sin(swayT * 2.8) * 0.02;
            } else if (!moving && !dance) bobPhase = 0;

            if (tipsy && !reduced) bob += Math.sin(swayT * 3.4) * 0.018;
            camera.position.y = floorY + EYE + bob;

            if (tipsy && !reduced) {
                _euler.setFromQuaternion(camera.quaternion);
                _euler.z = Math.sin(swayT * 0.48) * 0.16 + Math.sin(swayT * 1.55) * 0.07 + Math.sin(swayT * 2.4) * 0.03;
                _euler.x += Math.sin(swayT * 0.9) * 0.012;
                _euler.x = Math.max(PI_2 - plc.maxPolarAngle, Math.min(PI_2 - plc.minPolarAngle, _euler.x));
                camera.quaternion.setFromEuler(_euler);
            } else if (!dance) {
                _euler.setFromQuaternion(camera.quaternion);
                if (Math.abs(_euler.z) > 0.001) {
                    _euler.z *= 0.72;
                    camera.quaternion.setFromEuler(_euler);
                }
            }

            camera.getWorldDirection(_fwd);
            return { moving, dancing: dance, tipsy, forward: _fwd, floorY };
        },
    };
}
