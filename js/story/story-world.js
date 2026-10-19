/* THE 12:04 in the world: glinting story props, a light beacon over the next place to go, echo-vision
   ghosts, and the story's people — August Kessler (the grey hat), Ada Lune, Pier 47's watchmen — plus the
   limousines that carry the plot around the city. */
import * as THREE from "three";
import { createHuman, animateHuman } from "../human.js";
import { buildVehicle, animateVehicle } from "../vehicles/models.js";
import { STORY_PLACES, currentObjective, normalizeStory } from "./story.js";

const ghostMat = new THREE.MeshBasicMaterial({ color: 0x8be9ff, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false });
const glintTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,236,190,1)"); r.addColorStop(0.25, "rgba(255,200,120,0.55)"); r.addColorStop(1, "rgba(255,180,90,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
})();

const PROP_VERB = {
    photo: "[E] LOOK AT THE PHOTOGRAPH", contact: "[E] READ THE CONTACT SHEET", boothNote: "[E] LIFT THE SUGAR SHAKER",
    payphone: "[E] ANSWER THE PAYPHONE", notebook: "[E] SEARCH ADA'S ROOM", limo: "[E] TAKE THE TUBE FROM THE BACK SEAT", hatch: "[E] CLIMB TO THE ROOF HATCH",
};

// Kessler's walk from the Astoria to Times Square, along 47th Street's club-side pavement.
const TAIL_PATH = [[26, 14.8], [16, 15.6], [-20, 15.6], [-60, 15.8], [-97, 16.2], [-140, 16.4], [-190, 16.6], [-226, 26], [-246, 44], [-250, 50]];
const PATROLS = [
    [[300, 2], [318, 2], [318, 10], [300, 10]],
    [[318, 30], [300, 30], [300, 18], [318, 18]],
];

function human(spec) {
    const h = createHuman(spec);
    h.userData.mode = spec.anim || "idle";
    return h;
}
function ghost(spec, x, z, yaw, mode = "idle", y = 0) {
    const h = createHuman({ ...spec, scarf: false });
    h.userData.body.material = ghostMat;
    h.userData.body.castShadow = false;
    h.userData.body.userData.noShadow = true;
    h.position.set(x, y, z);
    h.rotation.y = yaw;
    h.userData.mode = mode;
    h.visible = false;
    return h;
}
function beam() {
    const geo = new THREE.CylinderGeometry(0.6, 0.6, 60, 18, 1, true);
    geo.translate(0, 30, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.userData.noShadow = true;
    m.visible = false;
    return m;
}
function along(path, d) {
    let rest = d;
    for (let i = 0; i < path.length - 1; i++) {
        const [ax, az] = path[i], [bx, bz] = path[i + 1], len = Math.hypot(bx - ax, bz - az);
        if (rest <= len) { const k = rest / len; return { x: ax + (bx - ax) * k, z: az + (bz - az) * k, yaw: Math.atan2(bx - ax, bz - az), end: false }; }
        rest -= len;
    }
    const [lx, lz] = path[path.length - 1], [px, pz] = path[path.length - 2];
    return { x: lx, z: lz, yaw: Math.atan2(lx - px, lz - pz), end: true };
}
const pathLength = (path) => path.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0);

export function createStoryWorld(scene) {
    const root = new THREE.Group();
    root.name = "The 12:04";
    scene.add(root);

    // --- props and their glints
    const props = {};
    for (const key of Object.keys(PROP_VERB)) {
        const p = STORY_PLACES[key];
        const g = new THREE.Group();
        g.position.set(p.x, p.y || 0, p.z);
        const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: glintTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        glint.scale.setScalar(0.7);
        glint.position.y = key === "limo" ? 1.3 : key === "payphone" ? 1.5 : 1.0;
        g.add(glint);
        g.userData.glint = glint;
        g.visible = false;
        root.add(g);
        props[key] = g;
    }
    const paperM = new THREE.MeshStandardMaterial({ color: 0xeee6d2, roughness: 0.85 });
    const frameM = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.5 });
    const photo = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.012, 0.15), paperM);
    photo.position.y = 0.76;
    props.photo.add(photo);
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.01, 0.36), paperM);
    sheet.position.y = 0.98;
    props.contact.add(sheet);
    const napkin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 0.12), paperM);
    napkin.position.y = 0.76;
    props.boothNote.add(napkin);
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.27), frameM);
    book.position.y = 0.8;
    props.notebook.add(book);
    const ladder = new THREE.Group();
    for (const sx of [-0.22, 0.22]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.2, 0.05), frameM); rail.position.set(sx, 1.6, 0); ladder.add(rail); }
    for (let i = 0; i < 9; i++) { const rung = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.04), frameM); rung.position.set(0, 0.3 + i * 0.34, 0); ladder.add(rung); }
    props.hatch.add(ladder);
    const limoParked = buildVehicle("limo", { driver: true, seed: 3 });
    limoParked.rotation.y = Math.PI;
    props.limo.add(limoParked);

    // --- characters
    const kessler = human({ outfit: "hood", skin: 0xe0ac69, hair: 0x4a4a4a, hatColor: 0x8a8e92, name: "KESSLER", color: "#aab2ba", scale: 1.04, anim: "walk" });
    kessler.visible = false;
    root.add(kessler);
    const ada = human({ outfit: "florist", body: "f", hairStyle: "victory", skin: 0xf1c27d, hair: 0x6b2a18, name: "ADA", color: "#9fd0c0" });
    ada.position.set(348, 0, 14);
    ada.rotation.y = -Math.PI / 2;
    ada.visible = false;
    root.add(ada);
    const torchMat = new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const watchmen = PATROLS.map((path, i) => {
        const w = human({ outfit: "cabbie", skin: [0x8d5524, 0xc68642][i], hair: 0x1a1208, anim: "walk" });
        const cone = new THREE.Mesh(new THREE.ConeGeometry(4.6, 13, 20, 1, true), torchMat);
        cone.rotation.x = -Math.PI / 2;
        cone.position.set(0, 1.2, 6.6);
        cone.userData.noShadow = true;
        w.add(cone);
        w.userData.path = [...path, path[0]];
        w.userData.d = i * 9;
        w.visible = false;
        root.add(w);
        return w;
    });

    // --- the travelling limousine (Times Square → Pier 47) and the objective beacon
    const limo = buildVehicle("limo", { driver: true, seed: 5 });
    limo.visible = false;
    root.add(limo);
    const beacon = beam();
    root.add(beacon);

    // --- echoes the visor can tune into
    const echoes = [
        ghost({ outfit: "florist", body: "f", hairStyle: "victory" }, 0.4, -24.2, Math.PI * 0.85, "idle"),
        ghost({ outfit: "hood" }, -0.6, -25.6, Math.PI * 0.15 - Math.PI, "idle"),
        ghost({ outfit: "florist", body: "f", hairStyle: "victory" }, 50, -128, Math.PI, "walk"),
        ghost({ outfit: "lady" }, 4, 30.4, Math.PI, "idle"), ghost({ outfit: "salesman" }, 6.4, 30.6, Math.PI, "idle"),
        ghost({ outfit: "florist", body: "f", hairStyle: "victory" }, 8.2, 29.8, Math.PI * 0.9, "idle"),
        ghost({ outfit: "pedestrian" }, -26.4, -6.6, -Math.PI / 2, "sit"),
    ];
    echoes.forEach((e) => root.add(e));

    const tail = { d: 0, lost: 0, look: 0, active: false };
    const sneak = { spottedAt: -99 };
    let ridingLimo = 0;

    function resetTail() { tail.d = 0; tail.lost = 0; tail.look = 0; }

    return {
        root, kessler, ada,
        /** Interactable story props for the current objective (same shape as main.js candidates). */
        candidates(story) {
            const o = currentObjective(story);
            if (!o || o.kind !== "interact" || !props[o.prop]) return [];
            const p = STORY_PLACES[o.prop];
            return [{ id: `plot:${o.prop}`, type: "story", prop: o.prop, x: p.x, z: p.z, y: p.y || 0, aimY: o.prop === "limo" ? 1.0 : 0.9, reach: o.prop === "limo" ? 3.2 : 2.4, prompt: PROP_VERB[o.prop] }];
        },
        /** Story characters who can be talked to right now. */
        people(story) {
            const s = normalizeStory(story);
            return s.chapter >= 4 && !s.ending ? [{ id: "ada", name: "ADA", role: "MERIDIAN RADIO", x: ada.position.x, z: ada.position.z, y: 0 }] : [];
        },
        /** Per-frame: animate, run tail / stealth checks. Returns {events, status, teleport?}. */
        update(dt, t, { story, player, echo, reduced, cutscene }) {
            const s = normalizeStory(story);
            const o = currentObjective(s);
            const out = { events: [], status: "" };
            for (const [key, g] of Object.entries(props)) {
                const live = !!o && o.kind === "interact" && o.prop === key;
                g.visible = live || (key === "limo" && s.chapter === 5 && s.step === 0);
                if (g.visible) g.userData.glint.material.opacity = live ? 0.55 + Math.sin(t * 3) * 0.3 : 0;
            }
            // Beacon over outdoor destinations.
            const place = o && (o.place || o.prop) && STORY_PLACES[o.place || o.prop];
            beacon.visible = !!place && !reduced && (place.y || 0) === 0 && o.kind !== "follow" && Math.hypot(player.x - place.x, player.z - place.z) > 12;
            if (beacon.visible) { beacon.position.set(place.x, 0, place.z); beacon.material.opacity = 0.08 + Math.sin(t * 1.6) * 0.03; }

            // Echoes: only with the tuned visor, only while V is held.
            const showEcho = s.echoes && echo;
            for (const e of echoes) {
                e.visible = showEcho && Math.hypot(player.x - e.position.x, player.z - e.position.z) < 60;
                if (e.visible) animateHuman(e, t, { mode: e.userData.mode, talking: e.userData.mode === "idle" });
            }

            // Kessler's tail.
            tail.active = o?.kind === "follow";
            kessler.visible = tail.active || (o?.id === "ambush" && cutscene);
            if (tail.active) {
                tail.look += dt;
                const looking = tail.look % 22 > 19.5;
                if (!looking) tail.d += dt * 1.55;
                const at = along(TAIL_PATH, tail.d);
                kessler.position.set(at.x, 0, at.z);
                kessler.rotation.y = looking ? at.yaw + Math.PI : at.yaw;
                animateHuman(kessler, t, { mode: looking ? "idle" : "walk" });
                const dx = player.x - at.x, dz = player.z - at.z, dist = Math.hypot(dx, dz);
                const facing = Math.cos(Math.atan2(dx, dz) - kessler.rotation.y) > 0.4;
                if (dist < o.near || (looking && dist < 16 && facing)) {
                    out.events.push({ type: "follow", actor: "kessler", result: "spotted" });
                    resetTail();
                } else if (dist > o.far) {
                    tail.lost += dt;
                    if (tail.lost > 6) { out.events.push({ type: "follow", actor: "kessler", result: "lost" }); resetTail(); }
                } else tail.lost = 0;
                if (at.end) out.events.push({ type: "follow", actor: "kessler", result: "done" });
                out.status = `${Math.round(dist)} m behind him${looking ? " · he's looking back" : dist < 9 ? " · too close" : dist > 32 ? " · losing him" : ""}`;
            } else if (o?.id === "ambush" && cutscene) {
                kessler.position.set(326, 0, 12);
                kessler.rotation.y = Math.PI / 2;
                animateHuman(kessler, t, { mode: "idle", talking: true });
            }

            // The limousine: drives Kessler from Times Square to the pier while you make your way there.
            if (o?.id === "to-pier") {
                ridingLimo = Math.min(1, ridingLimo + dt / 46);
                const x = -244 + (292 - -244) * ridingLimo;
                const moved = limo.visible ? Math.abs(x - limo.position.x) : 0;
                limo.visible = true;
                limo.position.set(x, 0, 21.35);
                limo.rotation.y = 0;
                animateVehicle(limo, moved, { braking: ridingLimo > 0.97 });
            } else if (s.chapter === 4 && !(o?.id === "escape")) {
                limo.visible = true;
                limo.position.set(306, 0, 16);
                limo.rotation.y = Math.PI / 2;
            } else limo.visible = false;

            // Pier 47's watchmen and their torches.
            const guarding = o?.kind === "stealth";
            for (const w of watchmen) {
                w.visible = s.chapter === 4 && !s.ending;
                if (!w.visible) continue;
                w.userData.d += dt * 1.25;
                const at = along(w.userData.path, w.userData.d % pathLength(w.userData.path));
                w.position.set(at.x, 0, at.z);
                w.rotation.y = at.yaw;
                animateHuman(w, t, { mode: "walk" });
                if (!guarding) continue;
                const dx = player.x - at.x, dz = player.z - at.z, dist = Math.hypot(dx, dz);
                const inCone = dist < 13 && Math.cos(Math.atan2(dx, dz) - at.yaw) > Math.cos(0.38);
                if (inCone && t - sneak.spottedAt > 2) {
                    sneak.spottedAt = t;
                    out.events.push({ type: "stealth", result: "spotted" });
                    out.teleport = { x: STORY_PLACES.pierGate.x - 6, z: STORY_PLACES.pierGate.z, lookX: 320, lookZ: 14 };
                }
            }
            if (guarding && Math.hypot(player.x - STORY_PLACES.warehouse.x, player.z - STORY_PLACES.warehouse.z) < (o.r || 6)) out.events.push({ type: "stealth", result: "in" });

            ada.visible = s.chapter >= 4 && !s.ending;
            if (ada.visible) animateHuman(ada, t, { mode: "idle", talking: o?.id === "find-ada" });
            return out;
        },
    };
}
