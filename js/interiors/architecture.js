/* The architecture pass: the joinery and fittings that make a room read as a real 1954 interior — wainscot
   with a chair rail, subway tile, stepped crown mouldings, pressed-tin ceilings, door casings, framed oil
   paintings, cast-iron radiators, ceiling medallions, palms and turning ceiling fans, plus the radio work
   that fills the Meridian warehouse. Everything static is merged per room with boxBatch (a few draw calls
   a room); only the fan blades move. Nothing here is a collider or a sign (paintings use lit materials),
   and every piece sits on a wall, a ceiling or a bench, so routes, sight lines and the sign audit hold. */
import * as THREE from "three";
import { boxBatch } from "./batch.js";
import { withPbr, brickTex } from "../textures.js";

const fans = [];

function canvas(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
}

let M = null;
function mats() {
    if (M) return M;
    const m = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });
    // Pressed tin: a raised square with a rosette, in a two-foot tile. Its relief becomes a normal map.
    const tin = withPbr(canvas(256, 256, (g, s) => {
        g.fillStyle = "#8a8a86"; g.fillRect(0, 0, s, s);
        g.fillStyle = "#b8b8b2"; g.fillRect(14, 14, s - 28, s - 28);
        g.fillStyle = "#7a7a76"; g.fillRect(28, 28, s - 56, s - 56);
        g.fillStyle = "#c8c8c2"; g.beginPath(); g.arc(s / 2, s / 2, 54, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#8c8c88";
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.arc(s / 2 + Math.cos(a) * 34, s / 2 + Math.sin(a) * 34, 12, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = "#dcdcd6"; g.beginPath(); g.arc(s / 2, s / 2, 16, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#c0c0ba";
        for (const [x, y] of [[0, 0], [s, 0], [0, s], [s, s]]) { g.beginPath(); g.arc(x, y, 22, 0, Math.PI * 2); g.fill(); }
    }), { worldTile: [0.61, 0.61], strength: 3.4, rough: [0.38, 0.3], size: 256 });
    // White subway tile, 15 x 7.5 cm, in grey grout.
    const tile = withPbr(canvas(256, 256, (g, s) => {
        g.fillStyle = "#9a978f"; g.fillRect(0, 0, s, s);
        for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) {
            const x = c * 64 + (r % 2 ? 32 : 0), y = r * 32;
            const gr = g.createLinearGradient(0, y, 0, y + 30);
            gr.addColorStop(0, "#f4f1e8"); gr.addColorStop(1, "#dedad0");
            g.fillStyle = gr; g.fillRect(x + 2, y + 2, 60, 28);
        }
    }), { worldTile: [0.6, 0.6], strength: 2.4, rough: [0.18, 0.5], size: 256 });
    // Four small oils: a night skyline, a still life, a harbour, a portrait.
    const paintings = [
        (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2a3a5c"); gr.addColorStop(0.6, "#c87a4a"); gr.addColorStop(1, "#1a1a22"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#14121a"; for (let i = 0; i < 9; i++) { const bw = 14 + (i % 3) * 8, bh = 40 + ((i * 37) % 70); g.fillRect(i * 28, h - bh - 18, bw, bh); } g.fillStyle = "#e8b060"; for (let i = 0; i < 40; i++) g.fillRect((i * 53) % w, h - 30 - ((i * 29) % 80), 3, 3); },
        (g, w, h) => { g.fillStyle = "#e6dcc4"; g.fillRect(0, 0, w, h); g.fillStyle = "#6a2a2a"; g.beginPath(); g.ellipse(w / 2, h * 0.62, w * 0.22, h * 0.16, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#c89a3a"; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w * 0.38 + i * 18, h * 0.42 - (i % 2) * 12, 14, 0, Math.PI * 2); g.fill(); } g.fillStyle = "#3a5a3a"; g.fillRect(w * 0.48, h * 0.2, 4, h * 0.3); },
        (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#8aa8b8"); gr.addColorStop(0.55, "#d8d0b8"); gr.addColorStop(0.56, "#3a5a6a"); gr.addColorStop(1, "#1e3440"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2a2a"; g.beginPath(); g.moveTo(w * 0.3, h * 0.55); g.lineTo(w * 0.75, h * 0.55); g.lineTo(w * 0.7, h * 0.62); g.lineTo(w * 0.34, h * 0.62); g.fill(); g.fillRect(w * 0.5, h * 0.35, 6, h * 0.2); },
        (g, w, h) => { g.fillStyle = "#2e2a26"; g.fillRect(0, 0, w, h); g.fillStyle = "#d8c4a0"; g.beginPath(); g.ellipse(w / 2, h * 0.42, w * 0.18, h * 0.22, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#3a2a20"; g.beginPath(); g.ellipse(w / 2, h * 0.3, w * 0.2, h * 0.13, 0, Math.PI, 0); g.fill(); g.fillStyle = "#5a3a4a"; g.fillRect(w * 0.26, h * 0.66, w * 0.48, h * 0.34); },
    ].map((draw) => new THREE.MeshStandardMaterial({ map: canvas(256, 320, draw), roughness: 0.62 }));
    const blackboard = new THREE.MeshStandardMaterial({ roughness: 0.92, map: canvas(512, 256, (g, w, h) => {
        g.fillStyle = "#1e2a24"; g.fillRect(0, 0, w, h);
        g.fillStyle = "rgba(236,232,220,0.08)"; for (let i = 0; i < 30; i++) g.fillRect((i * 71) % w, (i * 37) % h, 60, 14);
        g.strokeStyle = g.fillStyle = "rgba(236,232,220,0.85)"; g.lineWidth = 2;
        g.font = "22px 'Special Elite', 'Courier New', monospace";
        ["THE SEAM", "124 BPM  x  12:04 AM  x  1/f", "f = c / 2L     L = 47th St.", "TUBE 6E5 -> ROOF -> ARRAY"].forEach((t, i) => g.fillText(t, 22, 42 + i * 46));
        g.beginPath(); for (let x = 0; x < 200; x++) g.lineTo(290 + x, 200 + Math.sin(x * 0.12) * 22 * Math.exp(-x / 160)); g.stroke();
    }) });
    M = {
        paintings, blackboard,
        tinCream: m(0xe4dcc8, { map: tin, metalness: 0.35 }),
        tinCopper: m(0xb97a52, { map: tin, metalness: 0.6 }),
        subway: m(0xffffff, { map: tile }),
        walnut: m(0x4e3428, { roughness: 0.55 }),
        oak: m(0x8a6440, { roughness: 0.6 }),
        cream: m(0xe8dcc0, { roughness: 0.8 }),
        sage: m(0x7c9484, { roughness: 0.8 }),
        brass: m(0xc09a58, { metalness: 0.75, roughness: 0.3 }),
        chrome: m(0xd4d8dc, { metalness: 1, roughness: 0.16 }),
        iron: m(0x3a3c40, { metalness: 0.6, roughness: 0.45 }),
        gilt: m(0xb08a3a, { metalness: 0.8, roughness: 0.32 }),
        palm: m(0x3e6a38, { roughness: 0.8, side: THREE.DoubleSide }),
        pot: m(0x9a5a3a, { roughness: 0.75 }),
        glass: new THREE.MeshStandardMaterial({ color: 0xc8dce4, transparent: true, opacity: 0.3, roughness: 0.04, metalness: 0.1, depthWrite: false }),
        felt: m(0x6a1e2a, { roughness: 0.95 }),
        glow: m(0xffe0b0, { emissive: 0xffc888, emissiveIntensity: 1.1 }),
        filament: m(0xff9a40, { emissive: 0xff7a20, emissiveIntensity: 1.6 }),
        scope: m(0x0c1a10, { emissive: 0x3aff7a, emissiveIntensity: 0.9 }),
        bakelite: m(0x3a2418, { roughness: 0.35 }),
        steel: m(0x6a7078, { metalness: 0.7, roughness: 0.4 }),
        card: m(0xa8885c, { roughness: 0.9 }),
    };
    return M;
}

// The warehouse's own surfaces, made only if the Meridian is built.
let W = null;
function warehouseMats() {
    if (W) return W;
    const brick = brickTex("#8f8a80", "#e2dccf", 256);
    let seed = 7;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const concrete = withPbr(canvas(256, 256, (g, s) => {
        g.fillStyle = "#74716b"; g.fillRect(0, 0, s, s);
        for (let i = 0; i < 2600; i++) { const a = 0.02 + rnd() * 0.05; g.fillStyle = rnd() < 0.5 ? `rgba(36,34,30,${a})` : `rgba(220,214,204,${a})`; g.fillRect(rnd() * s, rnd() * s, 1 + rnd() * 3, 1 + rnd() * 3); }
        g.fillStyle = "rgba(24,22,20,0.4)"; g.fillRect(0, 0, s, 2); g.fillRect(0, 0, 2, s);
    }), { worldTile: [3, 3], strength: 1.2, rough: [0.7, 0.2], size: 256 });
    const glowTex = canvas(128, 128, (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.45, "rgba(255,255,255,0.4)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, s, s); });
    const planks = withPbr(canvas(256, 256, (g, s) => {
        for (let i = 0; i < 8; i++) { g.fillStyle = ["#5a4030", "#4e3628", "#62462f", "#553a2a"][i % 4]; g.fillRect(0, i * 32, s, 32); g.fillStyle = "rgba(15,8,4,0.6)"; g.fillRect(0, i * 32, s, 2); g.fillRect(((i * 97) % s), i * 32, 2, 32); }
    }), { worldTile: [2.4, 1.2], strength: 2, rough: [0.8, 0.1], size: 256 });
    const m = (color, extra) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
    W = {
        whitewash: m(0xffffff, { map: brick }),
        dado: m(0x4f6a58, { map: brick }),
        concrete: m(0xffffff, { map: concrete }),
        deck: m(0xffffff, { map: planks }),
        pane: new THREE.MeshStandardMaterial({ color: 0x1a2430, emissive: 0x0e1a2c, emissiveIntensity: 0.7, roughness: 0.08, metalness: 0.4 }),
        pool: new THREE.MeshBasicMaterial({ color: 0xffd9a0, map: glowTex, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }),
    };
    return W;
}

// --- reusable pieces (all into a batch) -------------------------------------------------------------------
const FROND = (() => { const g = new THREE.PlaneGeometry(0.16, 0.9); g.translate(0, 0.45, 0); return g; })();
const CANVAS = new THREE.PlaneGeometry(1, 1);
const POOL = (() => { const g = new THREE.PlaneGeometry(7, 7); g.rotateX(-Math.PI / 2); return g; })();

/** Places a box along a wall. axis "x": the wall runs along x at depth `at`; "z": along z at x = `at`.
    `n` (+1/-1) points into the room; `d` is the depth off the wall face. */
function onWall(b, mat, axis, at, n, along, y, len, h, d) {
    if (axis === "x") b.box(mat, along, y, at + n * d / 2, len, h, d);
    else b.box(mat, at + n * d / 2, y, along, d, h, len);
}
/** Wainscot: boards, skirting, chair rail and (for panelled wood) stiles with top and bottom rails. */
function wainscot(b, axis, a0, a1, at, n, floor, panel, rail, { height = 1.05, stiles = true } = {}) {
    const len = a1 - a0, mid = (a0 + a1) / 2;
    onWall(b, panel, axis, at, n, mid, floor + height / 2, len, height, 0.03);
    onWall(b, rail, axis, at, n, mid, floor + 0.09, len, 0.18, 0.05);
    onWall(b, rail, axis, at, n, mid, floor + height + 0.02, len, 0.06, 0.065);
    if (!stiles) return;
    const count = Math.max(1, Math.round(len / 0.95));
    for (let i = 0; i <= count; i++) onWall(b, rail, axis, at, n, a0 + (len * i) / count, floor + height / 2 + 0.06, 0.06, height - 0.3, 0.045);
    onWall(b, rail, axis, at, n, mid, floor + 0.24, len, 0.05, 0.045);
    onWall(b, rail, axis, at, n, mid, floor + height - 0.1, len, 0.05, 0.045);
}
/** Stepped crown moulding where a wall meets a ceiling whose underside is at `ceil`. */
function crown(b, mat, axis, a0, a1, at, n, ceil) {
    const len = a1 - a0, mid = (a0 + a1) / 2;
    for (const [dy, h, d] of [[-0.03, 0.06, 0.05], [-0.09, 0.07, 0.1], [-0.17, 0.09, 0.065], [-0.24, 0.05, 0.035]]) onWall(b, mat, axis, at, n, mid, ceil + dy, len, h, d);
}
/** A gilt-framed oil on a wall face at (x, z); `ry` turns the canvas to face the room. */
function picture(b, m, idx, x, y, z, w, h, ry) {
    const sin = Math.sin(ry), cos = Math.cos(ry), sideways = Math.abs(sin) > 0.5;
    b.box(m.gilt, x, y, z, ...(sideways ? [0.05, h + 0.12, w + 0.12] : [w + 0.12, h + 0.12, 0.05]));
    b.box(m.walnut, x, y, z, ...(sideways ? [0.06, h + 0.02, w + 0.02] : [w + 0.02, h + 0.02, 0.06]));
    b.geo(m.paintings[idx % m.paintings.length], CANVAS, x + sin * 0.031, y, z + cos * 0.031, w, h, 1, ry);
}
/** Cast-iron column radiator; ry = 0 runs it along x, PI/2 along z. */
function radiator(b, m, x, z, floor, ry = 0, sections = 10) {
    const along = Math.abs(Math.sin(ry)) > 0.5 ? "z" : "x", len = sections * 0.075;
    for (let i = 0; i < sections; i++) {
        const o = (i - (sections - 1) / 2) * 0.075;
        b.cyl(m.iron, x + (along === "x" ? o : 0), floor + 0.4, z + (along === "z" ? o : 0), 0.03, 0.03, 0.62, 8);
    }
    for (const y of [0.1, 0.7]) b.box(m.iron, x, floor + y, z, along === "x" ? len : 0.07, 0.035, along === "z" ? len : 0.07);
    for (const s of [-1, 1]) b.cyl(m.iron, x + (along === "x" ? s * len / 2 : 0), floor + 0.05, z + (along === "z" ? s * len / 2 : 0), 0.025, 0.03, 0.1, 6);
}
function palm(b, m, x, z, floor, s = 1) {
    b.cyl(m.pot, x, floor + 0.22 * s, z, 0.2 * s, 0.15 * s, 0.44 * s, 14);
    b.cyl(m.walnut, x, floor + 0.43 * s, z, 0.19 * s, 0.19 * s, 0.03, 14);
    b.cyl(m.oak, x, floor + 0.75 * s, z, 0.025, 0.035, 0.7 * s, 6);
    for (let i = 0; i < 9; i++) b.geo(m.palm, FROND, x, floor + 1.02 * s, z, s, s, s, (i / 9) * Math.PI * 2, 0.9 + (i % 3) * 0.15, 0);
}
function coatRack(b, m, x, z, floor) {
    b.cyl(m.walnut, x, floor + 0.9, z, 0.025, 0.035, 1.8, 8);
    b.cyl(m.walnut, x, floor + 0.04, z, 0.25, 0.28, 0.06, 12);
    for (let i = 0; i < 4; i++) b.cyl(m.brass, x + Math.cos(i * 1.57) * 0.08, floor + 1.68, z + Math.sin(i * 1.57) * 0.08, 0.012, 0.012, 0.22, 6, -i * 1.57, 0, 0.7);
}
function medallion(b, m, x, ceil, z, r = 0.42) {
    b.cyl(m.cream, x, ceil - 0.015, z, r, r, 0.03, 28);
    b.cyl(m.cream, x, ceil - 0.04, z, r * 0.7, r * 0.8, 0.03, 24);
    b.cyl(m.gilt, x, ceil - 0.065, z, r * 0.25, r * 0.32, 0.04, 16);
}
/** A four-blade ceiling fan hung from `ceil`; its blades turn in updateArchitecture. */
function addFan(root, m, x, ceil, z, drop = 0.55) {
    const g = new THREE.Group();
    g.position.set(x, ceil - drop, z);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, drop, 8), m.brass);
    rod.position.y = drop / 2;
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.06, 14), m.brass);
    canopy.position.y = drop - 0.03;
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.2, 18), m.brass);
    const blades = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.62, 0.012, 0.15);
    bladeGeo.translate(0.44, 0, 0);
    for (let i = 0; i < 4; i++) { const bl = new THREE.Mesh(bladeGeo, m.walnut); bl.rotation.set(0.1, (i * Math.PI) / 2, 0, "YXZ"); blades.add(bl); }
    const arm = new THREE.BoxGeometry(0.26, 0.02, 0.05);
    for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(arm, m.brass); a.position.set(Math.cos(i * Math.PI / 2) * 0.13, 0, -Math.sin(i * Math.PI / 2) * 0.13); a.rotation.y = (i * Math.PI) / 2; blades.add(a); }
    blades.position.y = -0.08;
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m.glow);
    lamp.position.y = -0.1;
    g.add(rod, canopy, motor, blades, lamp);
    g.traverse((o) => { o.userData.noShadow = true; });
    root.add(g);
    fans.push({ blades, speed: 2.2 + (fans.length % 3) * 0.35 });
    return g;
}

// --- rooms --------------------------------------------------------------------------------------------------
/* 47th Street shops (records builds its own shell). Shell: walls at minX/maxX ± 0.04 (inner faces ± 0.10), back wall
   inner face z 39.89, finishInterior's ceiling underside 3.8025 with brass cornice ledges on the side walls. */
const SHOP_LOOK = {
    pharmacy: { tin: "tinCream", panel: "subway", rail: "walnut", stiles: false, pictures: [1, 2] },
    florist: { tin: "tinCream", panel: "sage", rail: "oak", pictures: [1, 0] },
    rivoli: { tin: "tinCopper", panel: "walnut", rail: "gilt", pictures: [] },
    liquor: { tin: "tinCopper", panel: "walnut", rail: "walnut", pictures: [3, 0] },
    barber: { tin: "tinCream", panel: "subway", rail: "chrome", stiles: false, pictures: [2, 3] },
};

function shopRoom(root, id, r) {
    const look = SHOP_LOOK[id];
    if (!look) return;
    const m = mats(), b = boxBatch();
    const x0 = r.minX + 0.1, x1 = r.maxX - 0.1, z0 = 32.2, z1 = 39.89, ceil = 3.79, cx = (r.minX + r.maxX) / 2;
    const panel = m[look.panel], rail = m[look.rail], opts = { stiles: look.stiles !== false };
    b.box(m[look.tin], cx, ceil + 0.01, 36.05, r.maxX - r.minX - 0.25, 0.02, 7.7);
    for (const [x, n] of [[x0, 1], [x1, -1]]) wainscot(b, "z", z0 + 0.4, z1, x, n, 0, panel, rail, opts);
    wainscot(b, "x", x0, x1, z1, -1, 0, panel, rail, opts);
    crown(b, rail === m.chrome ? m.cream : rail, "x", x0 + 0.3, x1 - 0.3, z1, -1, ceil);
    // Casing round the inside of the shop door.
    for (const s of [-1, 1]) b.box(rail, r.doorX + s * 1.33, 1.55, 32.22, 0.12, 3.1, 0.08);
    b.box(rail, r.doorX, 3.14, 32.22, 2.8, 0.14, 0.08);
    // A painting over a radiator by the front windows, clear of the shelving further in.
    look.pictures.forEach((idx, i) => picture(b, m, idx, i ? x1 - 0.025 : x0 + 0.025, 2.4, 32.95, 0.56, 0.7, i ? -Math.PI / 2 : Math.PI / 2));
    radiator(b, m, x0 + 0.16, 32.95, 0, Math.PI / 2, 8);
    if (id === "rivoli") {
        // Velvet ropes on brass stanchions mark the queue to the box office, and a palm in the far corner.
        for (const x of [2.2, 3.6, 8.4, 9.8]) { b.cyl(m.brass, x, 0.5, 34.9, 0.03, 0.045, 0.96, 10); b.cyl(m.brass, x, 1.0, 34.9, 0.055, 0.055, 0.06, 10); b.cyl(m.brass, x, 0.02, 34.9, 0.16, 0.18, 0.04, 14); }
        for (const x of [2.9, 9.1]) for (let k = 0; k < 8; k++) {
            const t = (k + 0.5) / 8, sag = Math.sin(t * Math.PI) * 0.12;
            b.cyl(m.felt, x - 0.7 + t * 1.4, 0.94 - sag, 34.9, 0.022, 0.022, 0.19, 6, 0, 0, Math.PI / 2 + (t - 0.5) * 0.5);
        }
        palm(b, m, x0 + 0.55, 39.25, 0, 1.15);
    }
    if (id === "florist") palm(b, m, x1 - 0.45, 33.05, 0, 0.9);
    if (id === "barber") coatRack(b, m, x1 - 0.4, 33.05, 0);
    b.flush(root);
    if (id === "barber") addFan(root, m, cx, ceil, 36.6);
}

/* Dottie's: a tin ceiling under the drop ceiling (underside 4.0), chrome crown on three walls, fans between
   the pendant rows, and a radiator and coat rack by the door. */
function diner(root) {
    const m = mats(), b = boxBatch();
    const xw = -38.47, xe = -16.85, zs = -16.4, ceil = 3.99;
    b.box(m.tinCream, -27.6, ceil + 0.005, -2, 21.4, 0.012, 28.2);
    crown(b, m.chrome, "z", -16.3, 12.3, xw, 1, ceil);
    crown(b, m.chrome, "z", -16.3, 12.3, xe, -1, ceil);
    crown(b, m.chrome, "x", xw, xe, zs, 1, ceil);
    radiator(b, m, xe - 0.16, 10.2, 0, Math.PI / 2, 12);
    coatRack(b, m, -18.0, 11.3, 0);
    b.flush(root);
    addFan(root, m, -27.5, ceil, -8);
    addFan(root, m, -27.5, ceil, -2);
}

/* Astoria second floor: wall shelves under the corridor's table lamps (which used to hang in the air),
   crown mouldings, plaster medallions and a run of paintings down the east corridor. */
function hotelUpstairs(root) {
    const m = mats(), b = boxBatch();
    const fy = 4.4, ceil = 7.77, xe = 38.375;
    for (const z of [-11, -5, 1]) {
        b.box(m.walnut, 38.1, fy + 1.48, z, 0.56, 0.04, 0.6);
        b.box(m.walnut, 38.1, fy + 1.445, z, 0.5, 0.03, 0.54);
        for (const dz of [-0.2, 0.2]) {
            b.box(m.brass, 38.17, fy + 1.3, z + dz, 0.38, 0.03, 0.03, 0, 0, -0.62);
            b.box(m.brass, xe - 0.012, fy + 1.32, z + dz, 0.024, 0.36, 0.05);
        }
    }
    crown(b, m.cream, "z", -16.3, 12.3, xe, -1, ceil);
    crown(b, m.cream, "z", 0.5, 12.3, 16.815, 1, ceil);
    crown(b, m.cream, "x", 16.82, xe, 12.41, -1, ceil);
    for (const [x, z] of [[29.4, -5], [29.4, 1], [27.65, 7]]) medallion(b, m, x, ceil, z);
    [-14, -8, -2].forEach((z, i) => picture(b, m, i, xe - 0.025, fy + 1.78, z, 0.62, 0.8, -Math.PI / 2));
    palm(b, m, 37.6, -15.6, fy, 1.1);
    b.flush(root);
}

/** Apartment additions, built inside life-world's room group (which uses 4.4-high coordinates): a radiator
    under the window and a plaster medallion round the pendant. */
export function homeArchitecture(room, bounds) {
    const m = mats(), b = boxBatch();
    const cx = (bounds.minX + bounds.maxX) / 2, cz = (bounds.minZ + bounds.maxZ) / 2;
    radiator(b, m, cx, bounds.minZ + 0.27, 4.51, 0, 12);
    medallion(b, m, cx, 7.7, cz, 0.46);
    b.flush(room);
}

/** East-side venues (Blue Note Books, Sunrise Bakery, the arcade): pictures above the shelving, a palm by the
    door, and a fan in the bakery. Their shells already carry wainscot, coffers and a cornice. */
export function eastVenueArchitecture(group, v) {
    const m = mats(), b = boxBatch();
    const x0 = v.x - v.w / 2 + 0.18, x1 = v.x + v.w / 2 - 0.18, z0 = v.z - v.d / 2;
    if (v.id !== "arcade") {
        picture(b, m, v.id === "books" ? 3 : 1, x0 + 0.025, 2.9, v.z, 0.55, 0.6, Math.PI / 2);
        picture(b, m, v.id === "books" ? 0 : 2, x1 - 0.025, 2.9, v.z, 0.55, 0.6, -Math.PI / 2);
    }
    palm(b, m, x0 + 0.6, z0 + 0.65, 0, 0.95);
    b.flush(group);
    if (v.id === "bakery") addFan(group, m, v.x, 3.94, v.z, 0.5);
}

/** The Meridian warehouse at Pier 47 (x 322..372, z -8..32, 12 m high): roof trusses, hanging shop lamps,
    radio chassis with glowing valves and an oscilloscope on each bench, cable drums, a valve rack and the
    blackboard where somebody has been working out the Seam. */
export function meridianInterior(root, site) {
    const m = mats(), w = warehouseMats(), b = boxBatch();
    const x0 = site.x - site.w / 2, x1 = site.x + site.w / 2, z0 = site.z - site.d / 2, z1 = site.z + site.d / 2, h = site.h;
    // Shell: whitewashed brick over a green dado (the street facade's windows stay outside), a plank roof deck,
    // a concrete floor and a row of high windows between the trusses.
    const band = 1.5, lining = (axis, a0, a1, at, n, bottom = 0) => {
        const len = a1 - a0, mid = (a0 + a1) / 2;
        if (bottom < band) onWall(b, w.dado, axis, at, n, mid, (bottom + band) / 2, len, band - bottom, 0.04);
        onWall(b, w.whitewash, axis, at, n, mid, (Math.max(bottom, band) + h) / 2, len, h - Math.max(bottom, band), 0.04);
        if (bottom < band) onWall(b, m.walnut, axis, at, n, mid, band, len, 0.05, 0.07);
    };
    // Lining sits just off the facade's inner faces (± 0.4); fx/fz are the lining's own faces, where things mount.
    const xi0 = x0 + 0.405, xi1 = x1 - 0.405, zi0 = z0 + 0.405, zi1 = z1 - 0.405;
    const fx0 = xi0 + 0.04, fz0 = zi0 + 0.04, fz1 = zi1 - 0.04;
    lining("z", z0 + 0.4, z1 - 0.4, xi1, -1);
    lining("x", x0 + 0.4, x1 - 0.4, zi0, 1);
    lining("x", x0 + 0.4, x1 - 0.4, zi1, -1);
    lining("z", z0 + 0.4, site.door.z0, xi0, 1);
    lining("z", site.door.z1, z1 - 0.4, xi0, 1);
    lining("z", site.door.z0, site.door.z1, xi0, 1, site.door.h);
    for (const s of [-1, 1]) b.box(m.steel, fx0 + 0.06, site.door.h / 2, s < 0 ? site.door.z0 - 0.06 : site.door.z1 + 0.06, 0.12, site.door.h, 0.12);
    b.box(m.steel, fx0 + 0.06, site.door.h + 0.06, site.door.z0 / 2 + site.door.z1 / 2, 0.12, 0.12, site.door.z1 - site.door.z0 + 0.24);
    b.box(w.deck, site.x, h - 0.02, site.z, site.w - 0.8, 0.03, site.d - 0.8);
    b.box(w.concrete, site.x, 0.036, site.z, site.w - 0.8, 0.012, site.d - 0.8);
    for (let x = x0 + 7; x < x1 - 3; x += 6) for (const [zf, n] of [[fz0, 1], [fz1, -1]]) {
        onWall(b, w.pane, "x", zf, n, x, 9.3, 2.6, 2.2, 0.03);
        for (const dx of [-1.3, -0.43, 0.43, 1.3]) onWall(b, m.iron, "x", zf, n, x + dx, 9.3, 0.06, 2.3, 0.06);
        for (const dy of [-1.1, 0, 1.1]) onWall(b, m.iron, "x", zf, n, x, 9.3 + dy, 2.66, 0.06, 0.06);
        onWall(b, m.cream, "x", zf, n, x, 8.12, 2.8, 0.08, 0.16);
    }
    for (let x = x0 + 4; x < x1 - 2; x += 6) {
        b.box(m.steel, x, h - 2.2, site.z, 0.22, 0.28, site.d - 0.8);
        for (const s of [-1, 1]) b.box(m.steel, x, h - 1.3, site.z + s * (site.d / 4), 0.2, 0.24, site.d / 2 + 0.5, 0, s * 0.09);
        // Kingposts from the bottom chord up to the rafters, tallest at the ridge.
        for (let k = -3; k <= 3; k++) {
            const top = h - 1.3 + 0.9 - Math.abs(k) * (site.d / 7) * 0.09, len = top - (h - 2.06);
            b.box(m.steel, x, h - 2.06 + len / 2, site.z + k * (site.d / 7), 0.09, len, 0.09);
        }
    }
    for (let x = x0 + 7; x < x1 - 4; x += 10) for (const z of [site.z - 9, site.z + 9]) {
        b.cyl(m.iron, x, h - 3.6, z, 0.012, 0.012, 2.8, 4);
        b.geo(m.iron, new THREE.ConeGeometry(0.42, 0.32, 16, 1, true), x, h - 5.1, z);
        b.geo(m.glow, new THREE.SphereGeometry(0.11, 10, 8), x, h - 5.24, z);
        b.geo(w.pool, POOL, x, 0.05, z);
    }
    // The two benches from openworld.js: [centre x, centre z, width, which way the work faces].
    for (const [bx, bz, w, face] of [[site.x + 10, z0 + 7.5, 8, 1], [site.x + 5, z1 - 7.5, 6, -1]]) {
        const sp = (w - 2.4) / 2;
        for (const dx of [-sp, 0]) {
            const cx = bx + dx;
            b.box(m.steel, cx, 1.3, bz, 1.2, 0.4, 0.7);
            b.box(m.iron, cx, 1.12, bz, 1.24, 0.04, 0.74);
            for (let v = 0; v < 4; v++) {
                const vx = cx - 0.36 + v * 0.22, vz = bz - face * 0.12;
                b.cyl(m.glass, vx, 1.64, vz, 0.042, 0.042, 0.26, 10);
                b.cyl(m.filament, vx, 1.6, vz, 0.012, 0.012, 0.12, 4);
                b.cyl(m.bakelite, vx, 1.5, vz, 0.05, 0.05, 0.04, 10);
            }
            b.cyl(m.iron, cx + 0.42, 1.62, bz + face * 0.15, 0.09, 0.09, 0.24, 12);
        }
        const sx = bx + sp;
        b.box(m.bakelite, sx, 1.36, bz, 0.55, 0.5, 0.5);
        b.box(m.scope, sx, 1.4, bz + face * 0.255, 0.34, 0.26, 0.012);
        for (const k of [-0.15, 0, 0.15]) b.cyl(m.brass, sx + k, 1.18, bz + face * 0.26, 0.022, 0.022, 0.03, 8, 0, Math.PI / 2);
        b.box(m.card, bx - sp, 1.13, bz + face * 1.1, 0.5, 0.01, 0.35, 0.2);
    }
    // Cable drums lying against the south wall.
    for (const x of [site.x - 6.5, site.x - 5.2]) {
        for (const dz of [-0.26, 0.26]) b.cyl(m.oak, x, 0.6, fz0 + 0.7 + dz, 0.56, 0.56, 0.08, 20, 0, Math.PI / 2);
        b.cyl(m.iron, x, 0.6, fz0 + 0.7, 0.34, 0.34, 0.46, 16, 0, Math.PI / 2);
    }
    // Blackboard on the north wall, behind the second bench.
    b.box(m.walnut, site.x + 4, 3.2, fz1 - 0.03, 4.4, 2.3, 0.06);
    b.box(m.walnut, site.x + 4, 2.02, fz1 - 0.12, 4.3, 0.05, 0.16);
    b.geo(m.blackboard, CANVAS, site.x + 4, 3.2, fz1 - 0.065, 4.2, 2.1, 1, Math.PI);
    // A steel rack of spare valves and parts against the east wall.
    const rx = x1 - 1.05;
    for (let s = 0; s < 4; s++) b.box(m.steel, rx, 0.3 + s * 0.6, site.z - 6, 0.6, 0.04, 4);
    for (const z of [site.z - 8, site.z - 4]) for (const dx of [-0.28, 0.28]) b.box(m.steel, rx + dx, 1.2, z, 0.04, 2.4, 0.04);
    for (let s = 0; s < 4; s++) for (let k = 0; k < 6; k++) b.box(m.card, rx, 0.45 + s * 0.6, site.z - 7.6 + k * 0.62 + (s % 2) * 0.2, 0.42, 0.24 + ((s + k) % 3) * 0.04, 0.4);
    b.flush(root);
}

/** The 47th Street rooms, the diner and the hotel's second floor, called from interiors/index.js per room. */
export function roomArchitecture(root, id, rect) {
    if (SHOP_LOOK[id]) shopRoom(root, id, rect);
    else if (id === "diner") diner(root);
    else if (id === "hotel-upstairs") hotelUpstairs(root);
}

export function updateArchitecture(dt, reduced = false) {
    for (const f of fans) f.blades.rotation.y += dt * f.speed * (reduced ? 0.25 : 1);
}
