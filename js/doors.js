/* Real doors in every doorway you can walk through. They swing (or turn, or slide) open as you come up to
   them and close behind you: lacquer-and-brass porthole doors at the club, glazed walnut doors at the
   shops and east-side venues, chrome-and-glass at Dottie's, a brass revolving door at the Astoria,
   painted glazed doors at Mercer Row, a steel fire door out the club's back, and rolling steel doors on the
   Meridian warehouse. Doors are visual only (the door gaps in the colliders are unchanged) and each leaf is
   a merged mesh, so road and sign audits see them like any other fitted furniture. */
import * as THREE from "three";
import { boxBatch } from "./interiors/batch.js";
import { SHOPS, DINER, HOTEL } from "./zones.js";
import { HOMES } from "./life.js";
import { DISTRICT_BUILDINGS } from "./district-layout.js";
import { SITES } from "./openworld/layout.js";

/* Every doorway: centre (x, z), clear width w and height h, `out` = the outward normal as a yaw (0 = +z),
   and a style. `swing` is "in" (away from the street) unless a fire door has to open outward. */
export function doorways() {
  const list = [
    { id: "club", x: 0, z: 12.55, w: 3.0, h: 3.1, out: 0, style: "club" },
    { id: "club-back", x: 0, z: -16.55, w: 2.8, h: 3.1, out: Math.PI, style: "steel", swing: "out" },
    { id: "diner", x: -27, z: DINER.maxZ + 0.05, w: 2.8, h: 3.0, out: 0, style: "diner" },
    { id: "hotel", x: 25, z: HOTEL.maxZ + 0.05, w: 2.8, h: 3.0, out: 0, style: "revolving" },
    // Midtown Gin's left leaf would sweep over the display just inside, so it opens a little less.
    ...SHOPS.map((s) => ({ id: s.id, x: s.doorX, z: s.minZ, w: 2.5, h: 2.55, out: Math.PI, style: "shop", tone: s.id, ...(s.id === "liquor" ? { maxOpen: 1.05 } : {}) })),
    ...DISTRICT_BUILDINGS.filter((b) => b.id).map((b) => ({ id: b.id, x: b.x, z: b.z - b.d / 2 + 0.09, w: 2.6, h: 3.2, out: Math.PI, style: "shop", tone: b.id })),
    ...HOMES.filter((h) => h.floorY === 0).map((h) => ({ id: `entry-${h.id}`, x: h.entryX, z: 31.8, w: 2.2, h: 3.0, out: Math.PI, style: "home", color: h.color })),
    { id: "meridian", x: SITES.meridian.x - SITES.meridian.w / 2 + 0.2, z: (SITES.meridian.door.z0 + SITES.meridian.door.z1) / 2, w: SITES.meridian.door.z1 - SITES.meridian.door.z0, h: SITES.meridian.door.h, out: -Math.PI / 2, style: "sliding" },
  ];
  return list;
}

let M = null;
function mats() {
  if (M) return M;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...o });
  M = {
    lacquer: std(0x0d0a0c, { roughness: 0.2, metalness: 0.2 }),
    brass: std(0xd2a64c, { roughness: 0.26, metalness: 0.92 }),
    chrome: std(0xe2e6ea, { roughness: 0.1, metalness: 1 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xbcd2dc, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.28, depthWrite: false }),
    glassAmber: new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb860, emissiveIntensity: 0.6, roughness: 0.1, transparent: true, opacity: 0.75 }),
    walnut: std(0x4a2c1c, { roughness: 0.4 }),
    oak: std(0x7a5232, { roughness: 0.45 }),
    green: std(0x2e4a3a, { roughness: 0.4 }),
    red: std(0x6a1c1c, { roughness: 0.4 }),
    steel: std(0x5c6268, { roughness: 0.45, metalness: 0.6 }),
    corrugated: std(0x6e5a48, { roughness: 0.6, metalness: 0.45 }),
  };
  return M;
}
const WOOD = { records: "red", pharmacy: "green", florist: "oak", rivoli: "red", liquor: "walnut", barber: "walnut", books: "green", bakery: "oak", arcade: "red" };

/** One leaf in hinge-local coordinates: it runs from x = 0 to x = dir·lw, y 0..h, centred on z = 0. */
function leaf(style, lw, h, dir, opts) {
  const m = mats(), b = boxBatch(), X = (x) => x * dir, t = 0.055;
  const frame = (mat, inset = 0.09, rail = 0.12, kick = 0.3) => {
    b.box(mat, X(inset / 2), h / 2, 0, inset, h, t);
    b.box(mat, X(lw - inset / 2), h / 2, 0, inset, h, t);
    b.box(mat, X(lw / 2), h - rail / 2, 0, lw, rail, t);
    b.box(mat, X(lw / 2), kick / 2, 0, lw, kick, t);
  };
  if (style === "club") {
    b.box(m.lacquer, X(lw / 2), h / 2, 0, lw - 0.02, h - 0.02, t);
    for (const y of [0.04, h - 0.04]) b.box(m.brass, X(lw / 2), y, 0, lw, 0.05, t + 0.01);
    b.box(m.brass, X(lw - 0.03), h / 2, 0, 0.04, h, t + 0.012);
    b.box(m.brass, X(lw / 2), 0.16, 0, lw - 0.1, 0.28, t + 0.006);
    // Porthole: a brass ring round an amber pane, at eye height.
    b.geo(m.brass, new THREE.TorusGeometry(0.2, 0.035, 10, 32), X(lw / 2), 1.72, 0, 1, 1, 1);
    b.geo(m.glassAmber, new THREE.CircleGeometry(0.19, 28), X(lw / 2), 1.72, t / 2 + 0.002);
    b.geo(m.glassAmber, new THREE.CircleGeometry(0.19, 28), X(lw / 2), 1.72, -t / 2 - 0.002, 1, 1, 1, Math.PI);
    // Vertical pull bars on both faces near the meeting edge.
    for (const s of [-1, 1]) {
      b.cyl(m.brass, X(lw - 0.16), 1.2, s * 0.07, 0.02, 0.02, 0.9, 10);
      for (const y of [0.78, 1.62]) b.box(m.brass, X(lw - 0.16), y, s * 0.045, 0.03, 0.03, 0.05);
    }
    // Stepped deco inlay.
    for (const [y, w2] of [[2.55, 0.9], [2.65, 0.6], [2.75, 0.3]]) b.box(m.brass, X(lw / 2), y, 0, Math.min(w2, lw - 0.2), 0.02, t + 0.008);
  } else if (style === "shop" || style === "home") {
    const wood = style === "home" ? (opts.color ? new THREE.MeshStandardMaterial({ color: new THREE.Color(opts.color).multiplyScalar(0.7), roughness: 0.4 }) : m.green) : m[WOOD[opts.tone] || "walnut"];
    frame(wood);
    b.box(m.glass, X(lw / 2), (0.3 + h - 0.12) / 2, 0, lw - 0.18, h - 0.42, 0.012);
    if (style === "home") for (const y of [1.2, 1.9]) b.box(wood, X(lw / 2), y, 0, lw - 0.18, 0.04, 0.04);
    if (style === "home") b.box(wood, X(lw / 2), 1.55, 0, 0.04, h - 0.42, 0.04);
    b.box(m.brass, X(lw / 2), 0.16, 0, lw - 0.06, 0.24, t + 0.006);
    for (const s of [-1, 1]) b.cyl(m.brass, X(lw / 2), 1.05, s * 0.06, 0.018, 0.018, lw - 0.3, 10, 0, 0, Math.PI / 2);
    for (const s of [-1, 1]) for (const x of [0.2, lw - 0.2]) b.box(m.brass, X(x), 1.05, s * 0.04, 0.03, 0.03, 0.04);
  } else if (style === "diner") {
    frame(m.chrome, 0.06, 0.08, 0.26);
    b.box(m.glass, X(lw / 2), 1.5, 0, lw - 0.12, h - 0.34, 0.012);
    b.box(m.chrome, X(lw / 2), 1.1, 0, lw - 0.1, 0.06, t + 0.02);
    b.box(m.red, X(lw - 0.3), 1.28, 0, 0.28, 0.12, t + 0.016);
  } else if (style === "steel") {
    b.box(m.steel, X(lw / 2), h / 2, 0, lw - 0.02, h - 0.02, t);
    b.box(m.glass, X(lw / 2), 1.75, 0, 0.3, 0.5, t + 0.01);
    for (const s of [-1, 1]) b.box(m.steel, X(lw / 2), 1.05, s * 0.07, lw - 0.25, 0.06, 0.06);
  }
  return b;
}

export function buildDoors(scene) {
  const root = new THREE.Group();
  root.name = "Doors";
  scene.add(root);
  const m = mats();
  const doors = [];
  for (const d of doorways()) {
    const g = new THREE.Group();
    g.position.set(d.x, 0, d.z);
    g.rotation.y = d.out;
    root.add(g);
    const door = { ...d, group: g, open: 0, leaves: [] };
    if (d.style === "revolving") {
      // A brass drum with a canopy, curved glass sides and four glazed wings that turn as you pass.
      const b = boxBatch(), r = d.w / 2 - 0.08;
      b.geo(m.brass, new THREE.CylinderGeometry(r + 0.06, r + 0.06, 0.22, 40), 0, d.h - 0.11, 0);
      b.geo(m.brass, new THREE.CylinderGeometry(r + 0.1, r + 0.1, 0.06, 40), 0, d.h, 0);
      b.geo(m.lacquer, new THREE.CylinderGeometry(r + 0.04, r + 0.04, 0.03, 40), 0, 0.015, 0);
      for (const side of [-1, 1]) {
        const arc = new THREE.CylinderGeometry(r, r, d.h - 0.24, 24, 1, true, side > 0 ? Math.PI * 0.18 : Math.PI * 1.18, Math.PI * 0.64);
        b.geo(m.glass, arc, 0, (d.h - 0.24) / 2, 0);
        for (const a of [0.18, 0.5, 0.82]) { const ang = (side > 0 ? 0 : Math.PI) + a * Math.PI * 0.64 + Math.PI * 0.18; b.box(m.brass, Math.sin(ang) * r, (d.h - 0.24) / 2, Math.cos(ang) * r, 0.05, d.h - 0.24, 0.05); }
      }
      b.flush(g);
      const wings = new THREE.Group();
      g.add(wings);
      const wb = boxBatch();
      wb.cyl(m.brass, 0, (d.h - 0.22) / 2, 0, 0.06, 0.06, d.h - 0.22, 12);
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2, cx = Math.sin(a) * r / 2, cz = Math.cos(a) * r / 2;
        wb.box(m.glass, cx, 1.35, cz, 0.012, 2.3, r - 0.12, a);
        wb.box(m.brass, cx, 0.12, cz, 0.05, 0.24, r - 0.1, a);
        wb.box(m.brass, cx, 2.55, cz, 0.05, 0.08, r - 0.1, a);
        wb.box(m.brass, Math.sin(a) * (r - 0.06), 1.3, Math.cos(a) * (r - 0.06), 0.05, 2.5, 0.05, a);
        wb.box(m.brass, cx, 1.05, cz, 0.08, 0.04, r - 0.4, a);
      }
      wb.flush(wings);
      door.wings = wings;
    } else if (d.style === "sliding") {
      // Two rolling steel leaves on an overhead track; they part along the wall.
      const b = boxBatch();
      b.box(m.steel, 0, d.h + 0.12, 0.36, d.w * 2 + 0.4, 0.14, 0.1);
      for (const x of [-d.w - 0.1, 0, d.w + 0.1]) b.box(m.steel, x, d.h + 0.02, 0.3, 0.08, 0.12, 0.14);
      b.flush(g);
      for (const s of [-1, 1]) {
        const p = new THREE.Group();
        p.position.set(s * d.w / 4, 0, 0.26);
        g.add(p);
        const lb = boxBatch();
        for (let k = 0; k < 9; k++) lb.box(m.corrugated, -d.w / 4 + (k + 0.5) * (d.w / 2) / 9, d.h / 2, (k % 2) * 0.03, (d.w / 2) / 9 + 0.01, d.h - 0.04, 0.04);
        lb.box(m.steel, 0, d.h - 0.06, 0.02, d.w / 2, 0.12, 0.08);
        lb.box(m.steel, 0, 0.06, 0.02, d.w / 2, 0.12, 0.08);
        lb.box(m.steel, s * -(d.w / 4 - 0.12), 1.1, 0.06, 0.06, 0.6, 0.06);
        lb.flush(p);
        door.leaves.push({ pivot: p, slide: s, base: s * d.w / 4 });
      }
    } else {
      // Double doors: hinges at each jamb, opening away from the street (or outward for a fire door).
      const lw = d.w / 2 - 0.01, inward = d.swing === "out" ? 1 : -1;
      for (const s of [-1, 1]) {
        const p = new THREE.Group();
        p.position.set(s * d.w / 2, 0, 0);
        g.add(p);
        leaf(d.style, lw, d.h - 0.02, -s, d).flush(p);
        door.leaves.push({ pivot: p, sign: s, inward });
      }
    }
    for (const o of g.children) o.traverse((c) => { if (c.isMesh) c.userData.batch = true; });
    doors.push(door);
  }

  const openAngle = { shop: 1.3, home: 1.35 };
  return {
    doors,
    /** Opens what you're walking up to; `pos` is the camera, `floorY` your floor. */
    update(dt, pos, floorY = 0, reduced = false) {
      const k = Math.min(1, dt * (reduced ? 4 : 6));
      for (const d of doors) {
        const dist = Math.hypot(pos.x - d.x, pos.z - d.z);
        const near = Math.abs(floorY) < 1 && dist < d.w / 2 + (d.style === "sliding" ? 4 : 2.2);
        d.open += ((near ? 1 : 0) - d.open) * k;
        if (d.wings) d.wings.rotation.y += dt * (0.25 + d.open * 1.8);
        for (const L of d.leaves) {
          if (L.slide) L.pivot.position.x = L.base + L.slide * d.open * (d.w / 2 - 0.2);
          else L.pivot.rotation.y = L.sign * L.inward * d.open * (d.maxOpen || openAngle[d.style] || 1.45);
        }
      }
    },
  };
}
