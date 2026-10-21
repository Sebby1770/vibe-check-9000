/* Renders the open city from openworld/layout.js: streets, chunked instanced buildings with window-grid
   facades (lit at night), Times Square's signs, Belmont Park and the Plaza, the Pier 47 waterfront with the
   Meridian warehouse, and the El over Third Avenue with a running train. */
import * as THREE from "three";
import { asphaltTex, sidewalkTex, stoneTex, woodTex, withPbr } from "../textures.js";
import { randomPedestrian, animateHuman } from "../human.js";
import { OW_ROADS, SITES, FENCE, WATER_X, WORLD_BOUNDS, SIDEWALK, buildings, streetFace } from "./layout.js";
import { meridianInterior } from "../interiors/architecture.js";

const CHUNK = 128;
const unit = new THREE.BoxGeometry(1, 1, 1);
const _d = new THREE.Object3D();

function canvas(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    return c;
}
function tex(c, srgb = true) {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
}

// --- facades: 4 bays x 4 floors per tile (12 m x 12.8 m), windows lit at random for the night map.
const FACADES = {
    brick: { wall: "#7a3a2c", mortar: "#4a2a22", frame: "#2a1e18", sill: "#cbbca0", win: [0.62, 0.62] },
    dark: { wall: "#3c2c28", mortar: "#241a18", frame: "#141012", sill: "#a89a80", win: [0.6, 0.6] },
    limestone: { wall: "#c9b994", mortar: "#a8987a", frame: "#3a3228", sill: "#e6dcc4", win: [0.5, 0.62], stone: true },
    loft: { wall: "#8a4a34", mortar: "#5a3022", frame: "#1c2428", sill: "#bfb29a", win: [0.78, 0.66], grid: true },
    warehouse: { wall: "#6e4a36", mortar: "#4a3426", frame: "#1c1c1e", sill: "#9a8e78", win: [0.42, 0.3], high: true },
};
function facadeMaterial(style, variant) {
    const f = FACADES[style];
    const S = 512, bw = S / 4, fh = S / 4;
    const wx = bw * f.win[0], wy = fh * f.win[1];
    let seed = (style.length * 97 + variant * 31) | 0;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const lit = [];
    const map = canvas(S, S, (g) => {
        g.fillStyle = f.mortar; g.fillRect(0, 0, S, S);
        // brick courses or stone blocks
        if (f.stone) { g.fillStyle = f.wall; for (let y = 0; y < S; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < S; x += 64) g.fillRect(x + 1, y + 1, 62, 30); }
        else for (let y = 0; y < S; y += 8) for (let x = (y / 8) % 2 ? -12 : 0; x < S; x += 24) { g.fillStyle = f.wall; g.globalAlpha = 0.82 + rnd() * 0.18; g.fillRect(x + 1, y + 1, 22, 6); }
        g.globalAlpha = 1;
        for (let fy = 0; fy < 4; fy++) for (let bx = 0; bx < 4; bx++) {
            const x0 = bx * bw + (bw - wx) / 2, y0 = fy * fh + (f.high ? fh * 0.08 : (fh - wy) * 0.42);
            g.fillStyle = f.frame; g.fillRect(x0 - 4, y0 - 4, wx + 8, wy + 8);
            const gr = g.createLinearGradient(x0, y0, x0 + wx, y0 + wy);
            gr.addColorStop(0, "#3a4a58"); gr.addColorStop(0.5, "#1c2630"); gr.addColorStop(1, "#2e3a46");
            g.fillStyle = gr; g.fillRect(x0, y0, wx, wy);
            g.fillStyle = f.frame;
            if (f.grid) { for (let i = 1; i < 4; i++) g.fillRect(x0 + (wx * i) / 4 - 1, y0, 2, wy); for (let i = 1; i < 3; i++) g.fillRect(x0, y0 + (wy * i) / 3 - 1, wx, 2); }
            else { g.fillRect(x0 + wx / 2 - 2, y0, 4, wy); g.fillRect(x0, y0 + wy * 0.45, wx, 3); }
            g.fillStyle = f.sill; g.fillRect(x0 - 6, y0 + wy + 4, wx + 12, 6);
            if (!f.stone) { g.fillStyle = f.sill; g.globalAlpha = 0.55; g.fillRect(x0 - 4, y0 - 10, wx + 8, 5); g.globalAlpha = 1; }
            lit.push([x0, y0, rnd() < 0.42, rnd()]);
        }
        if (f.stone) { g.fillStyle = f.sill; for (let fy = 0; fy < 4; fy++) g.fillRect(0, fy * fh + fh - 6, S, 4); }
    });
    const emissive = canvas(S, S, (g) => {
        g.fillStyle = "#000"; g.fillRect(0, 0, S, S);
        for (const [x0, y0, on, k] of lit) {
            if (!on) continue;
            const warm = k < 0.7;
            const gr = g.createLinearGradient(x0, y0, x0, y0 + wy);
            gr.addColorStop(0, warm ? "#ffc878" : "#dfe8ff"); gr.addColorStop(1, warm ? "#a8682c" : "#7c8aa8");
            g.fillStyle = gr; g.fillRect(x0, y0, wx, wy);
            if (k > 0.35) { g.fillStyle = "rgba(40,20,10,0.55)"; g.fillRect(x0, y0, wx * (0.2 + k * 0.3), wy); } // curtains
        }
    });
    const mapT = withPbr(tex(map), { worldTile: [12, 12.8], strength: 1.8, roughFn: (u, v, lum) => (lum < 0.22 ? 0.14 : 0.86), size: 256 });
    const m = new THREE.MeshStandardMaterial({ map: mapT, emissiveMap: tex(emissive), emissive: 0xffffff, emissiveIntensity: 0.8, roughness: 1, metalness: 0 });
    m.userData.facade = true;
    return m;
}
function storefrontMaterial() {
    const map = canvas(512, 192, (g, w, h) => {
        g.fillStyle = "#3a302a"; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 4; i++) {
            const x0 = i * 128;
            g.fillStyle = "#1a1612"; g.fillRect(x0 + 6, 18, 116, 30);           // sign band
            g.fillStyle = "#c9a95a"; g.fillRect(x0 + 6, 46, 116, 3);
            const gr = g.createLinearGradient(0, 52, 0, 180);
            gr.addColorStop(0, "#41505c"); gr.addColorStop(1, "#1a2228");
            g.fillStyle = gr; g.fillRect(x0 + 10, 54, i % 2 ? 108 : 70, 122);  // shop glass
            if (!(i % 2)) { g.fillStyle = "#2a1c14"; g.fillRect(x0 + 86, 60, 30, 116); g.fillStyle = "#3e5260"; g.fillRect(x0 + 90, 66, 22, 50); } // door
            g.fillStyle = "#6b5a44"; g.fillRect(x0 + 6, 176, 116, 16);
        }
    });
    const emissive = canvas(512, 192, (g, w, h) => {
        g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 4; i++) { const x0 = i * 128; g.fillStyle = i === 2 ? "#3a2a18" : "#e8b070"; g.fillRect(x0 + 10, 54, i % 2 ? 108 : 70, 122); }
    });
    const mapT = withPbr(tex(map), { worldTile: [12, 4.5], strength: 1.6, roughFn: (u, v, lum) => (lum < 0.2 ? 0.12 : 0.8), size: 256 });
    return new THREE.MeshStandardMaterial({ map: mapT, emissiveMap: tex(emissive), emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 1, metalness: 0 });
}

function signTexture(lines, colors, w = 1024, h = 256) {
    const c = canvas(w, h, (g) => {
        g.fillStyle = colors.bg; g.fillRect(0, 0, w, h);
        g.strokeStyle = colors.edge; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
        g.textAlign = "center"; g.textBaseline = "middle";
        g.shadowColor = colors.ink; g.shadowBlur = 22; g.fillStyle = colors.ink;
        const n = lines.length;
        lines.forEach((t, i) => {
            let size = Math.floor((h * 0.62) / n);
            g.font = `900 ${size}px Georgia, serif`;
            const fit = (w - 80) / Math.max(1, g.measureText(t).width);
            if (fit < 1) { size = Math.floor(size * fit); g.font = `900 ${size}px Georgia, serif`; }
            g.fillText(t, w / 2, (h * (i + 0.5)) / n + 4);
        });
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.name = lines.join(" · ");
    return t;
}
const SIGN_COPY = [
    [["MERIDIAN", "TELEVISION · SEE TOMORROW TODAY"], { bg: "#0a0e1a", edge: "#62d8ff", ink: "#bff0ff" }],
    [["ORPHEUM"], { bg: "#1a0608", edge: "#ff4a5a", ink: "#ffd0a8" }],
    [["SILVER DOLLAR", "CAFETERIA · OPEN ALL NIGHT"], { bg: "#0c0c0c", edge: "#e8e8e8", ink: "#fff6d8" }],
    [["CHESTERTON", "COFFEE"], { bg: "#10140c", edge: "#9adf5a", ink: "#e8ffc8" }],
    [["STARLIGHT ROOF"], { bg: "#0a0614", edge: "#c77dff", ink: "#f0d8ff" }],
    [["THE GLOBE", "VAUDEVILLE"], { bg: "#14080a", edge: "#ffb030", ink: "#ffe2a0" }],
    [["HOTEL CLARIDGE"], { bg: "#0c0a08", edge: "#e0b25a", ink: "#fff0c8" }],
    [["AUTOMAT", "HOT FOOD · 5¢"], { bg: "#0a1210", edge: "#66ffe0", ink: "#dcfff6" }],
    [["PALACE", "BALLROOM"], { bg: "#18040e", edge: "#ff4fd8", ink: "#ffd8f4" }],
    [["KRAMER'S", "CUT-RATE DRUGS"], { bg: "#0a0a12", edge: "#5a8aff", ink: "#d8e4ff" }],
    [["MERIDIAN RADIO", "& TELEVISION CORP."], { bg: "#101418", edge: "#8fb8c8", ink: "#e8f4f8" }],
    [["LOFTS · TO LET"], { bg: "#1a1410", edge: "#c9a95a", ink: "#f2e2b8" }],
];
const signMats = new Map();
function signMaterial(i) {
    if (!signMats.has(i)) { const [lines, colors] = SIGN_COPY[i]; signMats.set(i, new THREE.MeshBasicMaterial({ map: signTexture(lines, colors) })); }
    return signMats.get(i);
}

export function buildOpenWorld(scene) {
    const root = new THREE.Group();
    root.name = "Open city";
    scene.add(root);
    const signs = new THREE.Group();
    signs.name = "Open city signs";
    root.add(signs);

    const M = {
        asphalt: new THREE.MeshStandardMaterial({ map: asphaltTex(), color: 0x1c222c, roughness: 0.6 }),
        walk: new THREE.MeshStandardMaterial({ map: sidewalkTex(), color: 0x8a8a8e, roughness: 0.8 }),
        ground: new THREE.MeshStandardMaterial({ color: 0x5a5650, roughness: 0.95 }),
        stone: new THREE.MeshStandardMaterial({ map: stoneTex(), color: 0xd8ccb2, roughness: 0.8 }),
        roof: new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.95 }),
        iron: new THREE.MeshStandardMaterial({ color: 0x24302e, roughness: 0.55, metalness: 0.5 }),
        green: new THREE.MeshStandardMaterial({ color: 0x3e5a36, roughness: 0.95 }),
        path: new THREE.MeshStandardMaterial({ color: 0xa8987a, roughness: 0.9 }),
        wood: new THREE.MeshStandardMaterial({ map: woodTex(), color: 0x8a7258, roughness: 0.85 }),
        hull: new THREE.MeshStandardMaterial({ color: 0x22282c, roughness: 0.6, metalness: 0.3 }),
        hullRed: new THREE.MeshStandardMaterial({ color: 0x6a1e18, roughness: 0.7 }),
        white: new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.7 }),
        crane: new THREE.MeshStandardMaterial({ color: 0x9a6a1e, roughness: 0.6, metalness: 0.3 }),
        mansard: new THREE.MeshStandardMaterial({ color: 0x3a4a44, roughness: 0.6, metalness: 0.2 }),
        glow: new THREE.MeshStandardMaterial({ color: 0xffd9a1, emissive: 0xffc477, emissiveIntensity: 1.2 }),
        storefront: storefrontMaterial(),
        trainBody: new THREE.MeshStandardMaterial({ color: 0x4a5a3a, roughness: 0.6, metalness: 0.3 }),
        trainGlow: new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffe0a0, emissiveIntensity: 1.4 }),
        seam: new THREE.MeshStandardMaterial({ color: 0x9adfff, emissive: 0x62d8ff, emissiveIntensity: 2.2 }),
        doorWood: new THREE.MeshStandardMaterial({ color: 0x3a2418, roughness: 0.45 }),
        doorGlass: new THREE.MeshStandardMaterial({ color: 0x3a3428, emissive: 0xffc27a, emissiveIntensity: 0.55, roughness: 0.15 }),
        brass: new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.3, metalness: 0.9 }),
        awning: new THREE.MeshStandardMaterial({ color: 0x23402e, roughness: 0.8 }),
        rollup: new THREE.MeshStandardMaterial({ color: 0x5e5448, roughness: 0.6, metalness: 0.45 }),
    };
    const facades = {};
    for (const style of Object.keys(FACADES)) for (const v of [0, 1]) facades[`${style}${v}`] = facadeMaterial(style, v);
    const allFacades = [...Object.values(facades), M.storefront];

    // Instancing per 128 m chunk and material, so frustum and distance culling work chunk by chunk.
    const chunks = new Map();
    const box = (mat, x, y, z, sx, sy, sz) => {
        const key = `${Math.floor(x / CHUNK)},${Math.floor(z / CHUNK)}`;
        if (!chunks.has(key)) chunks.set(key, { x: (Math.floor(x / CHUNK) + 0.5) * CHUNK, z: (Math.floor(z / CHUNK) + 0.5) * CHUNK, items: new Map() });
        const items = chunks.get(key).items;
        if (!items.has(mat)) items.set(mat, []);
        items.get(mat).push([x, y, z, sx, sy, sz]);
    };
    const global = new Map();
    const gbox = (mat, x, y, z, sx, sy, sz) => { if (!global.has(mat)) global.set(mat, []); global.get(mat).push([x, y, z, sx, sy, sz]); };

    // --- ground, streets and pavements
    const B = WORLD_BOUNDS;
    const areas = [[B.minX, -110, B.minZ, B.maxZ], [202, WATER_X, B.minZ, B.maxZ], [-110, 202, 106, B.maxZ], [-110, 202, B.minZ, -60]];
    for (const [x0, x1, z0, z1] of areas) for (let x = x0; x < x1; x += CHUNK) for (let z = z0; z < z1; z += CHUNK) {
        const w = Math.min(CHUNK, x1 - x), d = Math.min(CHUNK, z1 - z);
        box(M.ground, x + w / 2, -0.38, z + d / 2, w, 0.3, d);
    }
    for (const r of OW_ROADS) {
        const [ax, az] = r.a, [bx, bz] = r.b;
        const len = Math.hypot(bx - ax, bz - az), axisX = az === bz;
        if (!axisX && ax !== bx) {
            // Broadway runs on the diagonal: a rotated strip, built as its own meshes.
            const ang = Math.atan2(bz - az, bx - ax);
            for (const [mat, wid, y, h] of [[M.walk, r.width + SIDEWALK * 2, -0.06, 0.12], [M.asphalt, r.width, -0.02, 0.06]]) {
                const strip = new THREE.Mesh(unit, mat);
                strip.position.set((ax + bx) / 2, y, (az + bz) / 2);
                strip.scale.set(len, h, wid);
                strip.rotation.y = -ang;
                strip.receiveShadow = true;
                root.add(strip);
            }
            continue;
        }
        const step = 64;
        for (let t = 0; t < len; t += step) {
            const l = Math.min(step, len - t), cx = axisX ? Math.min(ax, bx) + t + l / 2 : ax, cz = axisX ? az : Math.min(az, bz) + t + l / 2;
            box(M.walk, cx, -0.07, cz, axisX ? l + 0.02 : r.width + SIDEWALK * 2, 0.14, axisX ? r.width + SIDEWALK * 2 : l + 0.02);
            box(M.asphalt, cx, -0.035, cz, axisX ? l + 0.02 : r.width, 0.07, axisX ? r.width : l + 0.02);
            for (let k = 2; k < l - 2; k += 6) box(M.white, axisX ? cx - l / 2 + k : cx, 0.002, axisX ? cz : cz - l / 2 + k, axisX ? 2.6 : 0.12, 0.01, axisX ? 0.12 : 2.6);
        }
        // Lamp posts along both pavements.
        for (let t = 10; t < len - 4; t += 26) for (const side of [-1, 1]) {
            const off = r.width / 2 + 0.7;
            const lx = axisX ? Math.min(ax, bx) + t : ax + side * off, lz = axisX ? az + side * off : Math.min(az, bz) + t;
            gbox(M.iron, lx, 2.1, lz, 0.14, 4.2, 0.14);
            gbox(M.iron, lx, 4.25, lz, 0.5, 0.12, 0.5);
            gbox(M.glow, lx, 3.98, lz, 0.32, 0.38, 0.32);
        }
    }

    // --- a real front door on every building, on the face that looks onto its street: a stone portal with
    // glazed double doors and a lit transom (with a canopy in Belmont), or a steel roll-up door and a side door
    // on the waterfront warehouses.
    function entrance(b, baseH) {
        const f = streetFace(b), half = f.nx ? b.w / 2 : b.d / 2, face = half + (baseH ? 0.1 : 0);
        const cx = b.x + f.nx * face, cz = b.z + f.nz * face;
        const at = (along, out) => [cx + (f.nx ? 0 : along) + f.nx * out, cz + (f.nx ? along : 0) + f.nz * out];
        const S = (a, depth, h) => (f.nx ? [depth, h, a] : [a, h, depth]);
        const put = (mat, along, out, y, a, depth, h) => { const [x, z] = at(along, out); box(mat, x, y, z, ...S(a, depth, h)); };
        if (b.district === "waterfront") {
            put(M.iron, 0, 0.06, 2.1, 4.6, 0.12, 4.3);
            put(M.rollup, 0, 0.1, 2.0, 4.2, 0.08, 4.0);
            for (let k = 0; k < 9; k++) put(M.iron, 0, 0.15, 0.3 + k * 0.42, 4.2, 0.02, 0.04);
            put(M.doorWood, 3.2, 0.05, 1.1, 1.0, 0.08, 2.2);
            put(M.iron, 3.2, 0.06, 2.3, 1.2, 0.1, 0.12);
            put(M.glow, 3.2, 0.2, 2.65, 0.25, 0.25, 0.2);
            return;
        }
        put(M.stone, 0, 0.32, 0.08, 3.1, 0.64, 0.16);
        for (const s of [-1, 1]) {
            put(M.stone, s * 1.22, 0.13, 1.72, 0.38, 0.26, 3.44);
            put(M.stone, s * 1.22, 0.16, 0.2, 0.46, 0.32, 0.4);
        }
        put(M.stone, 0, 0.15, 3.6, 3.0, 0.3, 0.34);
        put(M.stone, 0, 0.2, 3.82, 3.3, 0.4, 0.12);
        put(M.doorWood, 0, 0.02, 1.47, 2.06, 0.08, 2.94);
        for (const s of [-1, 1]) put(M.doorGlass, s * 0.5, 0.03, 1.85, 0.62, 0.08, 1.4);
        put(M.doorWood, 0, 0.04, 1.47, 0.06, 0.09, 2.94);
        put(M.doorGlass, 0, 0.03, 3.17, 2.06, 0.08, 0.24);
        for (const s of [-1, 1]) put(M.brass, s * 0.16, 0.08, 1.15, 0.04, 0.05, 0.34);
        if (b.district === "belmont") {
            put(M.awning, 0, 1.7, 3.42, 2.7, 3.1, 0.12);
            put(M.brass, 0, 3.22, 3.42, 2.74, 0.06, 0.16);
            for (const s of [-1, 1]) put(M.brass, s * 1.3, 3.15, 1.7, 0.06, 0.06, 3.42);
        } else put(M.glow, 0, 0.32, 3.3, 0.22, 0.22, 0.2);
    }

    // --- procedural buildings
    const list = buildings();
    for (const b of list) {
        const fac = facades[`${b.facade}${b.seed % 2}`];
        const baseH = b.district === "waterfront" ? 0 : 4.5;
        if (baseH) box(b.base === "shops" ? M.storefront : M.stone, b.x, baseH / 2, b.z, b.w + 0.2, baseH, b.d + 0.2);
        const top = b.setback ? b.h * 0.72 : b.h;
        box(fac, b.x, baseH + (top - baseH) / 2, b.z, b.w, top - baseH, b.d);
        if (b.setback) {
            box(fac, b.x, top + (b.h - top) / 2, b.z, b.w * 0.7, b.h - top, b.d * 0.7);
            box(M.stone, b.x, top + 0.3, b.z, b.w + 0.5, 0.6, b.d + 0.5);
        }
        entrance(b, baseH);
        if (b.cornice) box(M.stone, b.x, b.h + 0.35, b.z, (b.setback ? b.w * 0.7 : b.w) + 0.8, 0.7, (b.setback ? b.d * 0.7 : b.d) + 0.8);
        box(M.roof, b.x, b.h + (b.cornice ? 0.72 : 0.05), b.z, (b.setback ? b.w * 0.7 : b.w) - 0.2, 0.1, (b.setback ? b.d * 0.7 : b.d) - 0.2);
        if (b.tower) {
            const tx = b.x + (b.seed % 7) - 3, tz = b.z + ((b.seed >> 3) % 5) - 2;
            for (const [lx, lz] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) box(M.iron, tx + lx, b.h + 2.2, tz + lz, 0.18, 3.2, 0.18);
            box(M.wood, tx, b.h + 5.2, tz, 3, 3.2, 3);
            box(M.roof, tx, b.h + 7.1, tz, 2.4, 0.6, 2.4);
        }
        if (b.sign && b.district !== "belmont") {
            const f = streetFace(b);
            const faceW = f.nx ? b.d : b.w;
            const w = Math.min(14, faceW * 0.78), h = Math.min(5, w * 0.32);
            const y = Math.min(top - h / 2 - 1.2, 7 + (b.seed % 5) * 1.6);
            if (y - h / 2 > baseH + 0.6) {
                const idx = b.district === "garment" ? 11 : b.district === "waterfront" ? 10 : b.seed % 10;
                const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), signMaterial(idx));
                s.position.set(b.x + f.nx * (b.w / 2 + 0.06), y, b.z + f.nz * (b.d / 2 + 0.06));
                s.rotation.y = Math.atan2(f.nx, f.nz);
                signs.add(s);
            }
        }
    }

    // --- landmarks
    const ts = SITES.timesSquare;
    box(M.path, ts.x, -0.02, ts.z, ts.w, 0.06, ts.d);
    // The Meridian Television tower: a sign stack at the north end of the square.
    const towerX = ts.x, towerZ = ts.z + ts.d / 2 - 4;
    box(M.iron, towerX, 9, towerZ, 9, 18, 3);
    for (const [y, i] of [[13.5, 0], [6.5, 7]]) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 4.2), signMaterial(i));
        s.position.set(towerX, y, towerZ - 1.56);
        s.rotation.y = Math.PI;
        signs.add(s);
    }

    // Belmont Park: lawns, paths, a lake, trees, a bandshell; the Plaza hotel on 50th Street.
    const park = SITES.park;
    box(M.green, park.x, -0.06, park.z, park.w, 0.12, park.d);
    for (const z of [230, 300, 370]) box(M.path, park.x, 0.0, z, park.w - 6, 0.04, 4);
    for (const x of [-30, 60, 200, 250]) box(M.path, x, 0.0, park.z, 4, 0.04, park.d - 6);
    const lake = SITES.lake;
    box(M.stone, lake.x, 0.15, lake.z, lake.w + 1.4, 0.5, lake.d + 1.4);
    const water = new THREE.MeshStandardMaterial({ color: 0x14242a, roughness: 0.06, metalness: 0, envMapIntensity: 1.4 });
    const pond = new THREE.Mesh(new THREE.PlaneGeometry(lake.w, lake.d), water);
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(lake.x, 0.42, lake.z);
    root.add(pond);
    const bs = SITES.bandshell;
    box(M.white, bs.x, 0.6, bs.z, bs.w, 1.2, bs.d);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(bs.w / 2, 24, 12, 0, Math.PI, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 0.6, side: THREE.DoubleSide }));
    shell.position.set(bs.x, 1.2, bs.z + 2);
    shell.rotation.y = Math.PI;
    root.add(shell);
    const trunks = [], canopies = [];
    let ts2 = 7;
    const r2 = () => ((ts2 = (ts2 * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 170; i++) {
        const x = park.x - park.w / 2 + 6 + r2() * (park.w - 12), z = park.z - park.d / 2 + 6 + r2() * (park.d - 12);
        if (Math.abs(x - lake.x) < lake.w / 2 + 4 && Math.abs(z - lake.z) < lake.d / 2 + 4) continue;
        if ([230, 300, 370].some((pz) => Math.abs(z - pz) < 4) || [-30, 60, 200, 250].some((px) => Math.abs(x - px) < 4)) continue;
        const s = 0.8 + r2() * 0.7;
        trunks.push([x, 1.6 * s, z, 0.32 * s, 3.2 * s, 0.32 * s]);
        canopies.push([x, 4.4 * s, z, 3.2 * s, 2.6 * s, 3.2 * s]);
    }
    for (let x = -100; x < 300; x += 14) for (const z of [204.5]) { trunks.push([x, 1.6, z, 0.3, 3.2, 0.3]); canopies.push([x, 4.4, z, 3, 2.4, 3]); }
    const trunkMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.6, 1, 7), new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: 0.9 }), trunks.length);
    const canopyGeo = new THREE.IcosahedronGeometry(1, 1);
    { const p = canopyGeo.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); v.multiplyScalar(0.85 + 0.3 * Math.abs(Math.sin(v.x * 7 + v.y * 5 + v.z * 3))); p.setXYZ(i, v.x, v.y, v.z); } canopyGeo.computeVertexNormals(); }
    const canopyMesh = new THREE.InstancedMesh(canopyGeo, new THREE.MeshStandardMaterial({ color: 0x3f5c30, roughness: 0.9 }), canopies.length);
    [[trunkMesh, trunks], [canopyMesh, canopies]].forEach(([mesh, items]) => { items.forEach((a, i) => { _d.position.set(a[0], a[1], a[2]); _d.scale.set(a[3], a[4], a[5]); _d.rotation.set(0, a[0] * 0.37, 0); _d.updateMatrix(); mesh.setMatrixAt(i, _d.matrix); }); mesh.computeBoundingSphere(); root.add(mesh); });

    const pl = SITES.plaza;
    box(M.stone, pl.x, pl.h / 2, pl.z, pl.w, pl.h, pl.d);
    box(facades.limestone0, pl.x, pl.h / 2 + 2, pl.z, pl.w + 0.1, pl.h - 8, pl.d + 0.1);
    box(M.mansard, pl.x, pl.h + 3, pl.z, pl.w - 4, 6, pl.d - 4);
    box(M.stone, pl.x, pl.h + 0.4, pl.z, pl.w + 1, 0.8, pl.d + 1);
    box(M.hullRed, pl.x, 3.4, pl.z - pl.d / 2 - 2.6, 9, 0.25, 5.4);                 // entrance canopy
    for (const dx of [-4.2, 4.2]) box(M.iron, pl.x + dx, 1.7, pl.z - pl.d / 2 - 5, 0.12, 3.4, 0.12);
    const plazaSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.2), new THREE.MeshBasicMaterial({ map: signTexture(["THE BELMONT PLAZA"], { bg: "#0e0c08", edge: "#e0b25a", ink: "#fff0c8" }) }));
    plazaSign.position.set(pl.x, 7.5, pl.z - pl.d / 2 - 0.06);
    plazaSign.rotation.y = Math.PI;
    signs.add(plazaSign);

    // The waterfront: river, bulkhead, Pier 47, a freighter, cranes, the fence and the Meridian warehouse.
    const riverNormal = (() => {
        const c = canvas(256, 256, (g) => {
            const img = g.createImageData(256, 256);
            for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
                const a = Math.sin(x * 0.11 + Math.sin(y * 0.05) * 3) * 0.5 + Math.sin(y * 0.17 + x * 0.03) * 0.5, i = (y * 256 + x) * 4;
                img.data[i] = 128 + a * 30; img.data[i + 1] = 128 + Math.cos(y * 0.13 + x * 0.07) * 30; img.data[i + 2] = 255; img.data[i + 3] = 255;
            }
            g.putImageData(img, 0, 0);
        });
        const t = tex(c, false);
        t.repeat.set(60, 60);
        return t;
    })();
    const river = new THREE.Mesh(new THREE.PlaneGeometry(900, 1200), new THREE.MeshStandardMaterial({ color: 0x0e1a20, roughness: 0.1, metalness: 0, normalMap: riverNormal, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.5 }));
    river.rotation.x = -Math.PI / 2;
    river.position.set(WATER_X + 450, -1.4, 50);
    river.userData.noShadow = true;
    root.add(river);
    box(M.stone, WATER_X + 0.3, -0.7, 50, 0.6, 1.6, 700);
    const pier = SITES.pier;
    box(M.wood, pier.x, -0.25, pier.z, pier.w, 0.5, pier.d);
    for (let x = WATER_X + 4; x < pier.x + pier.w / 2; x += 8) for (const z of [pier.z - pier.d / 2 + 1, pier.z + pier.d / 2 - 1]) box(M.wood, x, -0.6, z, 0.45, 1.6, 0.45);
    for (let x = WATER_X + 10; x < pier.x + pier.w / 2; x += 14) box(M.iron, x, 0.3, pier.z + pier.d / 2 - 0.6, 0.4, 0.6, 0.4); // bollards
    const fr = SITES.freighter;
    box(M.hull, fr.x, 1.6, fr.z, fr.w, 6, fr.d);
    box(M.hullRed, fr.x, -1.0, fr.z, fr.w + 0.1, 1.2, fr.d + 0.1);
    box(M.white, fr.x + fr.w / 2 - 14, 7.6, fr.z, 16, 6, fr.d - 3);
    box(M.hull, fr.x + fr.w / 2 - 12, 13, fr.z, 3, 6, 3);
    for (const cx of [420, 470]) {
        for (const dz of [-5, 5]) for (const dx of [-3, 3]) box(M.crane, cx + dx, 7, pier.z + dz, 0.6, 14, 0.6);
        box(M.crane, cx, 14.5, pier.z, 8, 1.4, 12);
        box(M.crane, cx, 15.6, pier.z + 14, 1.2, 1.2, 30);
    }
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x8a9096, metalness: 0.6, roughness: 0.4, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    for (const [z0, z1] of [[FENCE.z0, FENCE.gate[0]], [FENCE.gate[1], FENCE.z1]]) {
        const f = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0, 2.6), fenceMat);
        f.position.set(FENCE.x, 1.3, (z0 + z1) / 2);
        f.rotation.y = Math.PI / 2;
        f.userData.noShadow = true;
        root.add(f);
        for (let z = z0; z <= z1; z += 3) box(M.iron, FENCE.x, 1.35, z, 0.1, 2.7, 0.1);
    }
    for (const z of FENCE.gate) box(M.iron, FENCE.x, 1.8, z, 0.3, 3.6, 0.3);
    box(M.white, FENCE.x + 4, 1.3, FENCE.gate[0] - 3, 2.4, 2.6, 2.4); // guard booth
    const m = SITES.meridian, x0 = m.x - m.w / 2, x1 = m.x + m.w / 2, z0 = m.z - m.d / 2, z1 = m.z + m.d / 2;
    const wf = facades.warehouse0;
    box(wf, x1 - 0.2, m.h / 2, m.z, 0.4, m.h, m.d);
    box(wf, m.x, m.h / 2, z0 + 0.2, m.w, m.h, 0.4);
    box(wf, m.x, m.h / 2, z1 - 0.2, m.w, m.h, 0.4);
    box(wf, x0 + 0.2, m.h / 2, (z0 + m.door.z0) / 2, 0.4, m.h, m.door.z0 - z0);
    box(wf, x0 + 0.2, m.h / 2, (m.door.z1 + z1) / 2, 0.4, m.h, z1 - m.door.z1);
    box(wf, x0 + 0.2, (m.h + m.door.h) / 2, m.z, 0.4, m.h - m.door.h, m.door.z1 - m.door.z0);
    box(M.roof, m.x, m.h + 0.15, m.z, m.w + 0.6, 0.3, m.d + 0.6);
    box(M.ground, m.x, 0.01, m.z, m.w - 0.8, 0.04, m.d - 0.8);
    box(M.wood, m.x + 10, 0.55, z0 + 7.5, 8, 1.1, 3);
    box(M.wood, m.x + 5, 0.55, z1 - 7.5, 6, 1.1, 3);
    for (let i = 0; i < 9; i++) box(M.wood, m.x - 14 + (i % 3) * 1.4, 0.6 + Math.floor(i / 3) * 1.2, z1 - 3, 1.2, 1.1, 1.2);
    // The Seam rig: a coil tower and the tube cradle.
    box(M.iron, m.x + 16, 3.5, m.z, 2.4, 7, 2.4);
    const coilMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.3 });
    for (let i = 0; i < 6; i++) { const coil = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.09, 8, 28), coilMat); coil.rotation.x = Math.PI / 2; coil.position.set(m.x + 16, 1 + i * 1.1, m.z); root.add(coil); }
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 16), M.seam);
    tube.position.set(m.x + 16, 7.9, m.z);
    root.add(tube);
    meridianInterior(root, m);
    for (let i = 0; i < 5; i++) gbox(M.glow, m.x - 16 + i * 8, m.h - 1.4, m.z, 0.8, 0.25, 0.8);
    const merSign = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.2), signMaterial(10));
    merSign.position.set(x0 - 0.06, m.h - 3, m.z);
    merSign.rotation.y = -Math.PI / 2;
    signs.add(merSign);

    // The El: columns, girders and a deck over Third Avenue, a station at 44th½, and a train.
    for (let z = -60; z > B.minZ; z -= 12) {
        for (const x of [53.6, 66.4]) box(M.iron, x, 4, z, 0.5, 8, 0.5);
        box(M.iron, 60, 7.9, z, 13.4, 0.6, 0.5);
    }
    for (const x of [53.6, 66.4]) box(M.iron, x, 8.5, (-60 + B.minZ) / 2, 0.6, 0.8, -60 - B.minZ);
    box(M.wood, 60, 8.3, (-60 + B.minZ) / 2, 9, 0.25, -60 - B.minZ);
    const st = SITES.elStation;
    box(M.white, st.x, 11, st.z, st.w, 4.8, st.d);
    box(M.roof, st.x, 13.6, st.z, st.w + 1.2, 0.3, st.d + 1.2);
    box(M.iron, st.x - 9, 4.2, st.z, 3.2, 8.4, 2);
    const train = new THREE.Group();
    for (let i = 0; i < 4; i++) {
        const car = new THREE.Group();
        const body = new THREE.Mesh(unit, M.trainBody);
        body.scale.set(3, 3.2, 14);
        body.position.y = 1.6;
        const band = new THREE.Mesh(unit, M.trainGlow);
        band.scale.set(3.05, 0.9, 12.6);
        band.position.y = 2.1;
        car.add(body, band);
        car.position.z = -i * 14.6;
        train.add(car);
    }
    train.position.set(60, 8.45, -60);
    root.add(train);

    // --- bake instanced chunks
    const chunkGroups = [];
    const byKey = new Map();
    for (const [key, c] of chunks) {
        const g = new THREE.Group();
        byKey.set(key, g);
        g.userData.center = new THREE.Vector2(c.x, c.z);
        for (const [mat, items] of c.items) {
            const mesh = new THREE.InstancedMesh(unit, mat, items.length);
            items.forEach((a, i) => { _d.position.set(a[0], a[1], a[2]); _d.scale.set(a[3], a[4], a[5]); _d.rotation.set(0, 0, 0); _d.updateMatrix(); mesh.setMatrixAt(i, _d.matrix); });
            mesh.computeBoundingSphere();
            g.add(mesh);
        }
        root.add(g);
        chunkGroups.push(g);
    }
    // Signs follow their chunk's visibility, so a sign is never shown without the wall behind it.
    const signChunks = signs.children.map((sgn) => [sgn, byKey.get(`${Math.floor(sgn.position.x / CHUNK)},${Math.floor(sgn.position.z / CHUNK)}`)]);
    for (const [mat, items] of global) {
        const mesh = new THREE.InstancedMesh(unit, mat, items.length);
        items.forEach((a, i) => { _d.position.set(a[0], a[1], a[2]); _d.scale.set(a[3], a[4], a[5]); _d.updateMatrix(); mesh.setMatrixAt(i, _d.matrix); });
        mesh.computeBoundingSphere();
        root.add(mesh);
    }

    // --- people walking the new pavements
    const walkers = [];
    let ws = 11;
    const r3 = () => ((ws = (ws * 16807) % 2147483647) / 2147483647);
    const streets = OW_ROADS.filter((r) => r.a[0] === r.b[0] || r.a[1] === r.b[1]);
    for (let i = 0; i < 44; i++) {
        const road = streets[i % streets.length];
        const side = r3() < 0.5 ? -1 : 1, axisX = road.a[1] === road.b[1];
        const off = road.width / 2 + 2.4 + r3() * 1.6;
        const h = randomPedestrian(r3(), { anim: "walk", umbrella: r3() < 0.4 });
        h.userData.walk = { road, side, axisX, off, t: r3(), speed: 1.1 + r3() * 0.5, dir: r3() < 0.5 ? 1 : -1 };
        root.add(h);
        walkers.push(h);
    }

    let trainT = 0;
    return {
        root,
        walkers,
        update(dt, t, { position, lampMul = 1, drawDistance = 360, reduced = false }) {
            const k = Math.min(1.2, lampMul);
            for (const m of allFacades) m.emissiveIntensity = 0.05 + k * 0.75;
            const far2 = drawDistance * drawDistance;
            for (const g of chunkGroups) {
                const dx = g.userData.center.x - position.x, dz = g.userData.center.y - position.z;
                g.visible = dx * dx + dz * dz < far2 + 2 * CHUNK * CHUNK;
            }
            for (const [sgn, g] of signChunks) sgn.visible = !g || g.visible;
            trainT = (trainT + dt * (reduced ? 6 : 11)) % (-B.minZ + 60);
            train.position.z = -50 - trainT;
            for (const h of walkers) {
                const w = h.userData.walk, [ax, az] = w.road.a, [bx, bz] = w.road.b;
                const len = Math.hypot(bx - ax, bz - az);
                w.t += (dt * w.speed * w.dir) / len;
                if (w.t > 1 || w.t < 0) { w.dir *= -1; w.t = Math.max(0, Math.min(1, w.t)); }
                const x = w.axisX ? ax + (bx - ax) * w.t : ax + w.side * w.off;
                const z = w.axisX ? az + w.side * w.off : az + (bz - az) * w.t;
                h.position.set(x, 0, z);
                h.rotation.y = w.axisX ? (w.dir * Math.sign(bx - ax) > 0 ? Math.PI / 2 : -Math.PI / 2) : (w.dir * Math.sign(bz - az) > 0 ? 0 : Math.PI);
                const near = Math.abs(x - position.x) + Math.abs(z - position.z) < 70;
                h.visible = near;
                if (near) animateHuman(h, t, { mode: "walk" });
            }
        },
    };
}
