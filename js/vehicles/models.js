/* Period vehicles built from extruded side profiles: Checker cab, '54 sedan, finned limousine, police cruiser,
   panel delivery van and a crosstown bus. Each car is a handful of merged meshes (paint, glass, chrome, trim,
   lights) plus four spinning wheels, with metadata for the driving system. +X is forward, +Z is right. */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createHuman, animateHuman } from "../human.js";

const PAINT = new Map();
let SHARED = null;

function shared() {
    if (SHARED) return SHARED;
    const chrome = new THREE.MeshStandardMaterial({ color: 0xd4d8dc, metalness: 1, roughness: 0.14 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x1a2630, metalness: 0.1, roughness: 0.04, transparent: true, opacity: 0.58, clearcoat: 1, clearcoatRoughness: 0.03 });
    const trim = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.05 });
    const head = new THREE.MeshBasicMaterial({ color: 0xfff1cc });
    const taxiLamp = new THREE.MeshBasicMaterial({ color: 0xffe2a0 });
    const gumball = new THREE.MeshBasicMaterial({ color: 0xff3a3a });
    const sign = signMaterial("47 CROSSTOWN");
    // One wheel shared by every car: a tyre with a whitewall band, and a chrome hubcap.
    const tyre = new THREE.LatheGeometry([[0.205, -0.105], [0.3, -0.108], [0.34, -0.085], [0.356, -0.03], [0.356, 0.03], [0.34, 0.085], [0.3, 0.108], [0.205, 0.105]].map(([r, y]) => new THREE.Vector2(r, y)), 28);
    tyre.rotateX(Math.PI / 2);
    paintVerts(tyre, (v) => (v.z > 0.09 && Math.hypot(v.x, v.y) > 0.235 && Math.hypot(v.x, v.y) < 0.31 ? 0xeeeae2 : 0x141416));
    const hub = new THREE.LatheGeometry([[0, 0.135], [0.08, 0.13], [0.16, 0.115], [0.205, 0.1], [0.21, 0.09]].map(([r, y]) => new THREE.Vector2(r, y)), 24);
    hub.rotateX(Math.PI / 2);
    SHARED = { chrome, glass, trim, head, taxiLamp, gumball, sign, tyre, hub };
    return SHARED;
}

function paintMaterial(color) {
    let m = PAINT.get(color);
    if (!m) {
        m = new THREE.MeshPhysicalMaterial({ color, metalness: 0.45, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 });
        PAINT.set(color, m);
    }
    return m;
}

function signMaterial(text) {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 64;
    const g = c.getContext("2d");
    g.fillStyle = "#101010"; g.fillRect(0, 0, 512, 64);
    g.fillStyle = "#ffcf70"; g.font = "700 40px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, 256, 34);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({ map: t });
}

let CHECKER = null;
function checkerMaterial() {
    if (CHECKER) return CHECKER;
    const c = document.createElement("canvas");
    c.width = 256; c.height = 16;
    const g = c.getContext("2d");
    for (let i = 0; i < 32; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? "#111" : "#f2e8c8"; g.fillRect(i * 8, j * 8, 8, 8); }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    CHECKER = new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0.2 });
    return CHECKER;
}

const _c = new THREE.Color(), _v = new THREE.Vector3();
function paintVerts(geo, fn) {
    const p = geo.attributes.position, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i); _c.setHex(fn(_v)); col.set([_c.r, _c.g, _c.b], i * 3); }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return geo;
}
function coloured(geo, hex) { return paintVerts(geo, () => hex); }

function clean(g) {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (!["position", "normal", "color"].includes(k)) n.deleteAttribute(k);
    return n;
}
function merge(list, withColor = false) {
    const parts = list.map((g) => {
        const n = clean(g);
        if (withColor && !n.attributes.color) coloured(n, 0x222222);
        if (!withColor && n.attributes.color) n.deleteAttribute("color");
        return n;
    });
    const out = mergeGeometries(parts, false);
    parts.forEach((p) => p.dispose());
    return out;
}
function at(geo, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
    return geo.applyMatrix4(m);
}
function extrudeSide(points, depth, bevel = 0.05, seg = 3) {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: seg, curveSegments: 10 });
    g.translate(0, 0, -depth / 2);
    return g;
}
/** A bar from (x0,y0) to (x1,y1) in the side plane, at depth z. */
function strut(x0, y0, x1, y1, z, w = 0.07, d = 0.06) {
    const len = Math.hypot(x1 - x0, y1 - y0);
    return at(new THREE.BoxGeometry(len, w, d), (x0 + x1) / 2, (y0 + y1) / 2, z, 0, 0, Math.atan2(y1 - y0, x1 - x0));
}

function lowerProfile(s) {
    const { rear, front, deck, belt, hood, wheels, wheelR } = s;
    const arch = (cx) => {
        const r = wheelR + 0.07, out = [];
        for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; out.push([cx + Math.cos(a) * r, 0.36 + Math.sin(a) * r]); }
        return out;
    };
    const fins = s.fins || 0;
    return [
        [rear, 0.34], [rear, deck - 0.12 + fins * 0.5], [rear + 0.06, deck + fins], [rear + 0.5, deck + fins * 0.35],
        [s.cab[0] - 0.1, belt], [s.cab[3] + 0.05, belt], [front - 0.55, hood], [front - 0.08, hood - 0.04], [front, hood - 0.24], [front, 0.34],
        [wheels[0] + wheelR + 0.07, 0.3], ...arch(wheels[0]).slice(1, -1), [wheels[0] - wheelR - 0.07, 0.3],
        [wheels[1] + wheelR + 0.07, 0.3], ...arch(wheels[1]).slice(1, -1), [wheels[1] - wheelR - 0.07, 0.3],
    ];
}

const SPECS = {
    sedan: { len: 4.95, wid: 1.82, rear: -2.47, front: 2.47, deck: 0.92, belt: 0.98, hood: 0.92, roof: 1.5, cab: [-1.32, -0.8, 0.3, 0.95], wheels: [1.45, -1.48], wheelR: 0.36, cabW: 1.58 },
    checker: { len: 5.0, wid: 1.86, rear: -2.5, front: 2.5, deck: 0.98, belt: 1.02, hood: 0.98, roof: 1.64, cab: [-1.5, -1.25, 0.62, 0.9], wheels: [1.52, -1.45], wheelR: 0.37, cabW: 1.64 },
    limo: { len: 5.7, wid: 1.96, rear: -2.85, front: 2.85, deck: 0.9, belt: 0.95, hood: 0.9, roof: 1.44, cab: [-1.6, -1.05, 0.25, 0.92], wheels: [1.72, -1.78], wheelR: 0.38, cabW: 1.62, fins: 0.2 },
    police: { len: 4.95, wid: 1.82, rear: -2.47, front: 2.47, deck: 0.92, belt: 0.98, hood: 0.92, roof: 1.5, cab: [-1.32, -0.8, 0.3, 0.95], wheels: [1.45, -1.48], wheelR: 0.36, cabW: 1.58 },
    van: { len: 4.7, wid: 1.9, rear: -2.35, front: 2.35, wheels: [1.45, -1.42], wheelR: 0.37 },
    bus: { len: 10.6, wid: 2.5, rear: -5.3, front: 5.3, wheels: [3.6, -3.1], wheelR: 0.5 },
};

function profileCar(s, paintHex, kind) {
    const S = shared();
    const paintParts = [];
    const body = extrudeSide(lowerProfile(s), s.wid - 0.12, 0.06, 4);
    // Plan-view taper toward the bumpers and a gentle tumblehome above the belt.
    const p = body.attributes.position;
    for (let i = 0; i < p.count; i++) {
        let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const t = (x - s.rear) / (s.front - s.rear);
        const taper = t > 0.86 ? 1 - (t - 0.86) * 0.55 : t < 0.1 ? 1 - (0.1 - t) * 0.5 : 1;
        const swell = 1 + 0.02 * Math.sin(Math.min(1, Math.max(0, (y - 0.3) / 0.7)) * Math.PI);
        p.setZ(i, z * taper * swell);
    }
    body.computeVertexNormals();
    paintParts.push(body);
    const [c0, c1, c2, c3] = s.cab;
    const hw = s.cabW / 2;
    paintParts.push(extrudeSide([[c1 - 0.05, s.roof - 0.05], [c1 + 0.03, s.roof + 0.02], [c2 - 0.03, s.roof + 0.02], [c2 + 0.06, s.roof - 0.05]], s.cabW + 0.03, 0.025, 2));
    const pz = hw + 0.012;
    for (const z of [-pz, pz]) {
        paintParts.push(strut(c3, s.belt, c2, s.roof, z, 0.06, 0.05));             // A pillar
        paintParts.push(strut(c0, s.belt, c1, s.roof, z, 0.12, 0.05));             // C pillar
        const bx = c1 + (c2 - c1) * (kind === "checker" ? 0.52 : 0.45);
        paintParts.push(strut(bx, s.belt, bx, s.roof, z, 0.07, 0.05));             // B pillar
    }
    const glass = extrudeSide([[c0, s.belt], [c1, s.roof], [c2, s.roof], [c3, s.belt]], s.cabW, 0.02, 2);

    const chrome = [];
    const bw = s.wid - 0.08;
    chrome.push(at(new THREE.CapsuleGeometry(0.075, bw - 0.15, 4, 10), s.front + 0.04, 0.42, 0, Math.PI / 2));
    chrome.push(at(new THREE.CapsuleGeometry(0.07, bw - 0.15, 4, 10), s.rear - 0.04, 0.42, 0, Math.PI / 2));
    chrome.push(at(new THREE.BoxGeometry(0.05, 0.26, s.wid * 0.62), s.front + 0.005, 0.64, 0));
    for (const z of [-1, 1]) {
        chrome.push(at(new THREE.TorusGeometry(0.1, 0.018, 8, 20), s.front - 0.02, s.hood - 0.32, z * (s.wid / 2 - 0.26), 0, Math.PI / 2));
        chrome.push(at(new THREE.BoxGeometry(s.len * 0.82, 0.022, 0.02), 0, s.belt - 0.2, z * (s.wid / 2 + 0.005)));
        chrome.push(at(new THREE.BoxGeometry(0.14, 0.025, 0.03), (c1 + c2) / 2 + 0.25, s.belt - 0.08, z * (s.wid / 2 + 0.01)));
        chrome.push(at(new THREE.TorusGeometry(0.07, 0.014, 6, 16), s.rear + 0.02, s.deck - 0.18 + (s.fins || 0) * 0.6, z * (s.wid / 2 - 0.2), 0, Math.PI / 2));
    }
    chrome.push(at(new THREE.ConeGeometry(0.03, 0.16, 6), s.front - 0.45, s.hood + 0.05, 0, 0, 0, -Math.PI / 2));

    const trim = [];
    // Grille slots, licence plates, interior (bench seats, dash, wheel) seen through the glass.
    for (let i = 0; i < 7; i++) trim.push(coloured(at(new THREE.BoxGeometry(0.02, 0.2, 0.025), s.front + 0.035, 0.64, (i - 3) * s.wid * 0.085), 0x0c0c0e));
    trim.push(coloured(at(new THREE.BoxGeometry(0.02, 0.15, 0.32), s.front + 0.09, 0.42, 0), 0xe0a63a));
    trim.push(coloured(at(new THREE.BoxGeometry(0.02, 0.15, 0.32), s.rear - 0.08, 0.6, 0), 0xe0a63a));
    trim.push(coloured(at(new THREE.BoxGeometry(0.5, 0.45, s.cabW - 0.12), c3 - 0.45, s.belt - 0.12, 0), 0x2a2420));
    trim.push(coloured(at(new THREE.BoxGeometry(0.12, 0.55, s.cabW - 0.14), (c1 + c2) / 2 + 0.15, s.belt + 0.02, 0, 0, 0, -0.18), 0x4a3a2c));
    trim.push(coloured(at(new THREE.BoxGeometry(0.12, 0.55, s.cabW - 0.14), c1 + 0.15, s.belt + 0.02, 0, 0, 0, -0.18), 0x4a3a2c));
    trim.push(coloured(at(new THREE.TorusGeometry(0.17, 0.016, 6, 20), c3 - 0.52, s.belt + 0.14, -0.38, 0, Math.PI / 2 - 0.45), 0x1a1612));
    trim.push(coloured(at(new THREE.BoxGeometry(s.len * 0.86, 0.14, s.wid - 0.3), 0, 0.28, 0), 0x0c0c0d));

    const g = new THREE.Group();
    const paintMesh = new THREE.Mesh(merge(paintParts), paintMaterial(paintHex));
    paintMesh.userData.batch = true;
    const glassMesh = new THREE.Mesh(clean(glass), S.glass);
    const chromeMesh = new THREE.Mesh(merge(chrome), S.chrome);
    const trimMesh = new THREE.Mesh(merge(trim, true), S.trim);
    g.add(paintMesh, glassMesh, chromeMesh, trimMesh);

    if (kind === "checker") {
        const band = new THREE.Mesh(merge([-1, 1].map((z) => at(new THREE.BoxGeometry(s.len * 0.86, 0.1, 0.012), 0, s.belt - 0.11, z * (s.wid / 2 + 0.012)))), checkerMaterial());
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.28), S.taxiLamp);
        lamp.position.set((c1 + c2) / 2, s.roof + 0.1, 0);
        g.add(band, lamp);
    }
    if (kind === "police") {
        const doors = new THREE.Mesh(merge([-1, 1].map((z) => at(new THREE.BoxGeometry(1.75, 0.5, 0.012), (c1 + c2) / 2 + 0.2, s.belt - 0.32, z * (s.wid / 2 + 0.008)))), paintMaterial(0xf0ece2));
        const light = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), S.gumball);
        light.position.set((c1 + c2) / 2, s.roof + 0.02, 0);
        g.add(doors, light);
        g.userData.gumball = light;
    }
    return { g, s };
}

function boxyVehicle(s, kind, paintHex) {
    const S = shared();
    const g = new THREE.Group();
    const R = s.wheelR;
    const arch = (cx) => { const out = []; for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; out.push([cx + Math.cos(a) * (R + 0.07), 0.42 + Math.sin(a) * (R + 0.07)]); } return out; };
    const bottom = [[s.wheels[0] + R + 0.07, 0.36], ...arch(s.wheels[0]).slice(1, -1), [s.wheels[0] - R - 0.07, 0.36], [s.wheels[1] + R + 0.07, 0.36], ...arch(s.wheels[1]).slice(1, -1), [s.wheels[1] - R - 0.07, 0.36]];
    let top, glassPanels = [], chrome = [], trim = [];
    if (kind === "van") {
        top = [[s.rear, 0.36], [s.rear, 2.02], [s.rear + 0.1, 2.1], [-0.2, 2.12], [0.55, 2.06], [1.05, 1.28], [2.05, 1.16], [2.3, 1.0], [s.front, 0.42]];
        for (const z of [-1, 1]) glassPanels.push(extrudeSide([[0.18, 1.32], [0.18, 1.94], [0.5, 1.96], [0.98, 1.32]], 0.02, 0).translate(0, 0, z * (s.wid / 2 + 0.01)));
        glassPanels.push(extrudeSide([[0, 0], [0, 0.04], [0.04, 0.04], [0.04, 0]], 0.02, 0)); // keeps merge non-empty
        glassPanels.push(at(new THREE.BoxGeometry(0.03, 0.62, s.wid - 0.3), 0.8, 1.67, 0, 0, 0, 0.98));
    } else {
        top = [[s.rear, 0.36], [s.rear, 2.85], [s.rear + 0.25, 3.02], [s.front - 0.45, 3.05], [s.front - 0.05, 2.75], [s.front, 1.9], [s.front, 0.42]];
        for (const z of [-1, 1]) for (let i = 0; i < 8; i++) {
            const x = -4.4 + i * 1.08;
            glassPanels.push(at(new THREE.BoxGeometry(0.92, 0.82, 0.02), x, 2.15, z * (s.wid / 2 + 0.01)));
        }
        glassPanels.push(at(new THREE.BoxGeometry(0.03, 0.95, s.wid - 0.2), s.front + 0.005, 2.25, 0));
        const cream = new THREE.Mesh(merge([-1, 1].map((z) => at(new THREE.BoxGeometry(s.len - 0.3, 1.18, 0.012), 0, 2.2, z * (s.wid / 2 + 0.006)))), paintMaterial(0xe6dcc0));
        const dest = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.22), S.sign);
        dest.position.set(s.front + 0.068, 2.82, 0);
        dest.rotation.y = Math.PI / 2;
        g.add(cream);
        g.userData.destBoard = dest;
    }
    const body = extrudeSide([...top, ...bottom.reverse()].reverse(), s.wid - 0.1, 0.05, 3);
    const paintMesh = new THREE.Mesh(merge([body]), paintMaterial(paintHex));
    paintMesh.userData.batch = true; // a solid body: the destination board is mounted on it
    if (g.userData.destBoard) paintMesh.add(g.userData.destBoard); // the body itself is the board's wall
    chrome.push(at(new THREE.CapsuleGeometry(0.08, s.wid - 0.25, 4, 10), s.front + 0.05, 0.48, 0, Math.PI / 2));
    chrome.push(at(new THREE.CapsuleGeometry(0.08, s.wid - 0.25, 4, 10), s.rear - 0.05, 0.48, 0, Math.PI / 2));
    for (const z of [-1, 1]) chrome.push(at(new THREE.TorusGeometry(0.11, 0.018, 8, 20), s.front + 0.01, kind === "bus" ? 0.95 : 0.85, z * (s.wid / 2 - 0.3), 0, Math.PI / 2));
    trim.push(coloured(at(new THREE.BoxGeometry(s.len * 0.86, 0.16, s.wid - 0.3), 0, 0.3, 0), 0x0c0c0d));
    trim.push(coloured(at(new THREE.BoxGeometry(0.02, 0.3, s.wid * 0.5), s.front + 0.03, 0.75, 0), 0x18181a));
    g.add(paintMesh, new THREE.Mesh(merge(glassPanels), S.glass), new THREE.Mesh(merge(chrome), S.chrome), new THREE.Mesh(merge(trim, true), S.trim));
    return { g, s: { ...s, hood: kind === "bus" ? 1.27 : 1.17, deck: 1.0, belt: 1.3, roof: kind === "bus" ? 3.05 : 2.12, cab: [0, 0.2, 0.6, 1.0], cabW: s.wid - 0.2 } };
}

export const VEHICLE_KINDS = Object.keys(SPECS);

/**
 * Builds a vehicle. Returns a Group with userData: wheels (spinning hubs), steer (front hubs), tail (brake-light
 * material), spec (dimensions and seat/camera anchors for driving), kind.
 */
export function buildVehicle(kind = "sedan", { color = 0x2a2a32, driver = true, seed = 0 } = {}) {
    const S = shared();
    const spec = SPECS[kind] || SPECS.sedan;
    const built = kind === "van" || kind === "bus" ? boxyVehicle(spec, kind, color) : profileCar(spec, kind === "checker" ? 0xf2b80f : kind === "police" ? 0x121216 : kind === "limo" ? 0x0b0b0d : color, kind);
    const { g, s } = built;

    const wheels = [], steer = [];
    for (const wx of s.wheels) for (const z of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(wx, s.wheelR, z * (s.wid / 2 - 0.16));
        const spin = new THREE.Group();
        const tyre = new THREE.Mesh(S.tyre, S.trim);
        const hub = new THREE.Mesh(S.hub, S.chrome);
        const scale = s.wheelR / 0.356;
        tyre.scale.setScalar(scale);
        hub.scale.setScalar(scale);
        if (z < 0) { tyre.rotation.y = Math.PI; hub.rotation.y = Math.PI; }
        spin.add(tyre, hub);
        pivot.add(spin);
        g.add(pivot);
        wheels.push(spin);
        if (wx > 0) steer.push(pivot);
    }

    const headM = S.head;
    const tail = new THREE.MeshBasicMaterial({ color: 0x5a0a12 });
    const lights = [];
    for (const z of [-1, 1]) {
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), headM);
        lens.position.set(s.front + (kind === "bus" || kind === "van" ? 0.03 : 0.0), (kind === "bus" ? 0.95 : kind === "van" ? 0.85 : s.hood - 0.32), z * (s.wid / 2 - (kind === "bus" || kind === "van" ? 0.3 : 0.26)));
        lens.rotation.y = Math.PI / 2;
        const tl = new THREE.Mesh(new THREE.CircleGeometry(0.065, 12), tail);
        tl.position.set(s.rear - 0.03, kind === "bus" ? 1.0 : (s.deck - 0.18 + (s.fins || 0) * 0.6), z * (s.wid / 2 - 0.2));
        tl.rotation.y = -Math.PI / 2;
        lights.push(lens, tl);
    }
    g.add(...lights);

    if (driver) {
        const seatY = kind === "bus" ? 1.15 : 0.62;
        const person = createHuman({ outfit: kind === "checker" ? "cabbie" : kind === "police" ? "cop" : kind === "bus" ? "clerk" : "pedestrian", anim: "sit", skin: [0x8d5524, 0xc68642, 0xe0ac69, 0x5c3317][seed % 4], hair: 0x1a1208, scarf: false });
        person.userData.sitHips = 0.5;
        animateHuman(person, seed, { mode: "sit" });
        person.position.set(kind === "bus" ? s.front - 1.2 : s.cab[3] - 0.95, seatY - 0.5, kind === "bus" ? -0.6 : -0.38);
        person.rotation.y = Math.PI / 2;
        g.add(person);
        g.userData.driver = person;
    }

    g.userData.wheels = wheels;
    g.userData.steer = steer;
    g.userData.tail = tail;
    g.userData.kind = kind;
    g.userData.spec = {
        length: s.len, width: s.wid, wheelbase: s.wheels[0] - s.wheels[1], wheelRadius: s.wheelR,
        driverSeat: new THREE.Vector3(s.cab[3] - 1.0, (kind === "bus" ? 1.15 : 0.62) + 0.8, -0.38),
        passengerSeat: new THREE.Vector3(s.cab[1] + 0.25, 1.22, 0.4),
        chase: new THREE.Vector3(-s.len * 1.25, s.roof + 1.4, 0),
        doorSide: -1,
        headlights: [new THREE.Vector3(s.front, s.hood - 0.32, -(s.wid / 2 - 0.26)), new THREE.Vector3(s.front, s.hood - 0.32, s.wid / 2 - 0.26)],
    };
    return g;
}

/** Spin wheels for distance travelled; steer the front pair; brake lights glow when slowing. */
export function animateVehicle(car, distance, { steer = 0, braking = false } = {}) {
    const r = car.userData.spec?.wheelRadius || 0.36;
    for (const w of car.userData.wheels || []) w.rotation.z -= distance / r;
    for (const p of car.userData.steer || []) p.rotation.y = -steer;
    car.userData.tail?.color.setHex(braking ? 0xff2a3a : 0x5a0a12);
}
