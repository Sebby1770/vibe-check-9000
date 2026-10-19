/* The open city beyond the old block loop: roads, building lots, landmarks, zones and colliders for
   Broadway & Times Square (west), Belmont Park & the Plaza (north), the Pier 47 waterfront (east) and the
   Garment District under the El (south). Pure data and geometry maths — no three, no DOM — shared by the
   renderer (openworld.js), movement (zones.js) and the tests. Deterministic: the same city every time. */

import { DISTRICT_BOUNDS } from "../district-layout.js";

export const WORLD_BOUNDS = { minX: -430, maxX: 540, minZ: -300, maxZ: 400 };
export const OLD = DISTRICT_BOUNDS; // the original loop, untouched
export const WATER_X = 380;         // the river's edge; Pier 47 runs out past it
export const SIDEWALK = 5.2;

export const OW_ROADS = [
  { name: "47th Street", a: [-430, 22.8], b: [-99, 22.8], width: 8.2 },
  { name: "47th Street", a: [187, 22.8], b: [296, 22.8], width: 8.2 },
  { name: "Pier 47 Road", a: [296, 22.8], b: [WATER_X, 22.8], width: 8.2 },
  { name: "46th Street", a: [-430, -48], b: [-99, -48], width: 8 },
  { name: "46th Street", a: [187, -48], b: [300, -48], width: 8 },
  { name: "49th Street", a: [-430, 96], b: [-99, 96], width: 8 },
  { name: "49th Street", a: [187, 96], b: [300, 96], width: 8 },
  { name: "50th Street", a: [-430, 150], b: [300, 150], width: 9 },
  { name: "Park Drive", a: [-110, 200], b: [300, 200], width: 8 },
  { name: "Seventh Avenue", a: [-250, -300], b: [-250, 220], width: 12 },
  { name: "Eighth Avenue", a: [-380, -60], b: [-380, 220], width: 12 },
  { name: "Broadway", a: [-190, -60], b: [-310, 220], width: 12 },
  { name: "West Avenue", a: [-99, 96], b: [-99, 200], width: 10 },
  { name: "West Avenue", a: [-99, -300], b: [-99, -48], width: 10 },
  { name: "East Avenue", a: [109, 96], b: [109, 200], width: 10 },
  { name: "Riverside Avenue", a: [187, 96], b: [187, 200], width: 10 },
  { name: "Riverside Avenue", a: [187, -300], b: [187, -48], width: 10 },
  { name: "Third Avenue", a: [60, -300], b: [60, -48], width: 12 },
  { name: "45th Street", a: [-300, -110], b: [300, -110], width: 8 },
  { name: "44th Street", a: [-300, -170], b: [300, -170], width: 8 },
  { name: "43rd Street", a: [-300, -230], b: [300, -230], width: 8 },
  { name: "Twelfth Avenue", a: [260, -120], b: [260, 220], width: 12 },
];

// Open spaces and landmark sites that procedural buildings must leave alone.
export const SITES = {
  timesSquare: { x: -245, z: 52, w: 44, d: 56, zone: "timessquare" },
  park: { x: 100, z: 302, w: 320, d: 196, zone: "belmont" },
  lake: { x: 120, z: 300, w: 84, d: 52 },
  bandshell: { x: 40, z: 360, w: 20, d: 14 },
  plaza: { x: 65, z: 175, w: 70, d: 34, zone: "plaza", h: 46 },
  yard: { x: 309, z: 15, w: 26, d: 60, zone: "pier" },
  // South of Pier 47 Road, so the road runs clear from the gate to the pier; the door faces the yard.
  meridian: { x: 347, z: -7.5, w: 50, d: 40, zone: "meridian", h: 12, door: { z0: -10.9, z1: -4.1, h: 4 } },
  pier: { x: 450, z: 23, w: 140, d: 30, zone: "pier" },
  freighter: { x: 455, z: 54, w: 120, d: 16 },
  elStation: { x: 60, z: -140, w: 14, d: 22 },
};

export const FENCE = { x: 296, z0: -40, z1: 80, gate: [17, 29] };

function rand(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function distToSegment(px, pz, [ax, az], [bx, bz]) {
  const dx = bx - ax, dz = bz - az, len2 = dx * dx + dz * dz;
  const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2)) : 0;
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}
const inRect = (x, z, r, pad = 0) => Math.abs(x - r.x) <= r.w / 2 + pad && Math.abs(z - r.z) <= r.d / 2 + pad;

/** True if (x, z) lies on a road or its pavement anywhere in the open city (including the old loop's roads). */
export function onStreet(x, z, extra = 0, roads = OW_ROADS) {
  return roads.some((r) => distToSegment(x, z, r.a, r.b) <= r.width / 2 + SIDEWALK + extra);
}

export function inOld(x, z, pad = 0) {
  return x > OLD.minX - pad && x < OLD.maxX + pad && z > OLD.minZ - pad && z < OLD.maxZ + pad;
}

/** Which new district (x, z) is in, or null inside the original loop. */
export function districtOf(x, z) {
  if (inOld(x, z)) return null;
  if (x >= WATER_X - 0.01 && !inRect(x, z, SITES.pier)) return "river";
  if (x > 202) return "waterfront";
  if (x < -110) return "broadway";
  if (z > 106) return "belmont";
  return "garment";
}

/** The outer facades that framed the old loop, minus any that a new road now runs through. */
let OUTER = null;
export function outerBuildings() {
  if (OUTER) return OUTER;
  const list = [];
  for (let x = -90; x < 190; x += 22) list.push([x, 117, 18, 17, 22 + (Math.abs(x) % 4) * 5]);
  for (let z = -35; z < 95; z += 24) list.push([-120, z, 16, 20, 28], [208, z, 14, 20, 24]);
  return (OUTER = list.filter(([x, z, w, d]) => !rectHitsRoad(x, z, w, d, 0)));
}

function rectHitsRoad(x, z, w, d, pad = SIDEWALK) {
  for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) {
    const px = x - w / 2 + (w * i) / 4, pz = z - d / 2 + (d * j) / 4;
    if (OW_ROADS.some((r) => distToSegment(px, pz, r.a, r.b) <= r.width / 2 + pad)) return true;
  }
  return false;
}

const STYLES = {
  broadway: { h: [18, 64], w: [14, 26], d: [16, 24], facades: ["dark", "brick", "limestone"], signs: 0.55 },
  belmont: { h: [26, 72], w: [18, 30], d: [18, 26], facades: ["limestone", "limestone", "brick"], signs: 0.05 },
  waterfront: { h: [8, 15], w: [24, 44], d: [18, 30], facades: ["warehouse", "warehouse", "brick"], signs: 0.15 },
  garment: { h: [22, 48], w: [16, 28], d: [18, 26], facades: ["loft", "loft", "brick", "dark"], signs: 0.2 },
};

/** Every procedural building: {id, x, z, w, d, h, district, facade, base, cornice, tower, setback, sign}. */
let BUILT = null;
export function buildings() {
  if (BUILT) return BUILT;
  const r = rand(1954);
  const out = [];
  const taken = [];
  const clear = (x, z, w, d) => {
    const { minX, maxX, minZ, maxZ } = WORLD_BOUNDS;
    if (x - w / 2 < minX + 4 || x + w / 2 > maxX - 4 || z - d / 2 < minZ + 4 || z + d / 2 > maxZ - 4) return false;
    if (x + w / 2 > WATER_X - 4) return false;
    for (const px of [x - w / 2, x, x + w / 2]) for (const pz of [z - d / 2, z, z + d / 2]) if (inOld(px, pz, 6)) return false;
    for (const s of Object.values(SITES)) if (Math.abs(x - s.x) < (w + s.w) / 2 + 3 && Math.abs(z - s.z) < (d + s.d) / 2 + 3) return false;
    if (Math.abs(x - FENCE.x) < w / 2 + 4 && z > FENCE.z0 - 4 && z < FENCE.z1 + 4) return false;
    for (const [ox, oz, ow, od] of outerBuildings()) if (Math.abs(x - ox) < (w + ow) / 2 + 1 && Math.abs(z - oz) < (d + od) / 2 + 1) return false;
    if (rectHitsRoad(x, z, w, d)) return false;
    return !taken.some((b) => Math.abs(x - b.x) < (w + b.w) / 2 + 0.8 && Math.abs(z - b.z) < (d + b.d) / 2 + 0.8);
  };
  const place = (x, z, w, d, district) => {
    const st = STYLES[district];
    const near = (roadName) => OW_ROADS.some((rd) => rd.name === roadName && distToSegment(x, z, rd.a, rd.b) < 60);
    let h = st.h[0] + r() * r() * (st.h[1] - st.h[0]);
    if (district === "broadway" && Math.hypot(x - SITES.timesSquare.x, z - SITES.timesSquare.z) < 90) h += 18;
    if (district === "belmont" && z > 140 && z < 200) h += 12;
    const b = {
      id: `ow-${out.length}`, x: +x.toFixed(2), z: +z.toFixed(2), w: +w.toFixed(2), d: +d.toFixed(2), h: +h.toFixed(1), district,
      facade: st.facades[Math.floor(r() * st.facades.length)],
      base: district === "waterfront" ? "dock" : r() < 0.7 ? "shops" : "stone",
      cornice: district !== "waterfront",
      tower: district !== "waterfront" && h < 40 && r() < 0.35,
      setback: h > 44,
      sign: r() < st.signs || (district === "broadway" && near("Broadway")),
      seed: Math.floor(r() * 1e6),
    };
    taken.push(b);
    out.push(b);
  };
  // Street walls: march along both sides of every straight street, faces at the pavement edge.
  for (const road of OW_ROADS) {
    const [ax, az] = road.a, [bx, bz] = road.b;
    const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
    const axisX = Math.abs(uz) < 1e-6, axisZ = Math.abs(ux) < 1e-6;
    for (const side of [-1, 1]) {
      const nx = -uz * side, nz = ux * side;
      for (let t = 6; t < len - 6;) {
        const px = ax + ux * t, pz = az + uz * t;
        const district = districtOf(px + nx * 20, pz + nz * 20);
        if (!district || district === "river") { t += 8; continue; }
        const st = STYLES[district];
        const along = st.w[0] + r() * (st.w[1] - st.w[0]);
        const deep0 = st.d[0] + r() * (st.d[1] - st.d[0]);
        let placed = false;
        // Shallower lots where a block is tight (between the old loop's facades and 50th, say).
        for (const deep of [deep0, deep0 * 0.7, 11]) {
          const w = axisX ? along : axisZ ? deep : (along + deep) / 2;
          const d = axisX ? deep : axisZ ? along : (along + deep) / 2;
          const off = road.width / 2 + SIDEWALK + 0.6 + (axisX ? d : w) / 2;
          const cx = px + ux * (along / 2) + nx * off, cz = pz + uz * (along / 2) + nz * off;
          if (clear(cx, cz, w, d)) { place(cx, cz, w, d, district); placed = true; break; }
        }
        t += placed ? along + 0.9 : 3;
      }
    }
  }
  return (BUILT = out);
}

/** The face of a building that looks onto the nearest street: {nx, nz} unit normal. */
export function streetFace(b) {
  const faces = [[0, 1, b.z + b.d / 2], [0, -1, b.z - b.d / 2], [1, 0, b.x + b.w / 2], [-1, 0, b.x - b.w / 2]];
  let best = null, bestD = Infinity;
  for (const [nx, nz] of faces) {
    const px = b.x + nx * (b.w / 2 + 3), pz = b.z + nz * (b.d / 2 + 3);
    const dist = Math.min(...OW_ROADS.map((r) => distToSegment(px, pz, r.a, r.b) - r.width / 2));
    if (dist < bestD) { bestD = dist; best = { nx, nz }; }
  }
  return best;
}

/** New-district zone for getZone (null inside the old loop, so its zones are unchanged). */
export function openWorldZone(x, z) {
  if (inOld(x, z)) return null;
  const m = SITES.meridian;
  if (inRect(x, z, m)) return "meridian";
  if (inRect(x, z, SITES.timesSquare)) return "timessquare";
  if (inRect(x, z, SITES.plaza, 6)) return "plaza";
  if (inRect(x, z, SITES.pier) || inRect(x, z, SITES.yard)) return "pier";
  if (inRect(x, z, SITES.park)) return "belmont";
  if (Math.abs(x - 60) < 12 && z < -48) return "el";
  const d = districtOf(x, z);
  return d === "river" ? "pier" : d;
}

/** Indoors in the open city (lighting, rain): the Meridian warehouse. */
export function openWorldIndoor(x, z) {
  return inRect(x, z, SITES.meridian, -0.3);
}

/** Every collider the open city adds (same box shape as zones.js buildColliders). */
export function openWorldColliders() {
  const boxes = [];
  const wall = (minX, maxX, minZ, maxZ, minY = -1, maxY = 30, extra = {}) => boxes.push({ minX, maxX, minZ, maxZ, minY, maxY, ...extra });
  for (const b of buildings()) wall(b.x - b.w / 2, b.x + b.w / 2, b.z - b.d / 2, b.z + b.d / 2, -1, b.h);
  for (const [x, z, w, d, h] of outerBuildings()) wall(x - w / 2, x + w / 2, z - d / 2, z + d / 2, -1, h);
  const p = SITES.plaza;
  wall(p.x - p.w / 2, p.x + p.w / 2, p.z - p.d / 2, p.z + p.d / 2, -1, p.h);
  // The Meridian warehouse: four walls with a door on the yard side, and a roof.
  const m = SITES.meridian, x0 = m.x - m.w / 2, x1 = m.x + m.w / 2, z0 = m.z - m.d / 2, z1 = m.z + m.d / 2;
  wall(x1 - 0.4, x1, z0, z1, -1, m.h);
  wall(x0, x1, z0, z0 + 0.4, -1, m.h);
  wall(x0, x1, z1 - 0.4, z1, -1, m.h);
  wall(x0, x0 + 0.4, z0, m.door.z0, -1, m.h);
  wall(x0, x0 + 0.4, m.door.z1, z1, -1, m.h);
  wall(x0, x0 + 0.4, m.door.z0, m.door.z1, m.door.h, m.h);
  wall(m.x + 6, m.x + 14, z0 + 6, z0 + 9, -1, 1.1, { sightMaxY: 1.1 }); // workbench
  wall(m.x + 2, m.x + 8, z1 - 9, z1 - 6, -1, 1.1, { sightMaxY: 1.1 });
  // The river: a bulkhead along the water, open only onto the pier.
  const pier = SITES.pier;
  wall(WATER_X, WATER_X + 0.6, WORLD_BOUNDS.minZ, pier.z - pier.d / 2, -1, 2.4);
  wall(WATER_X, WATER_X + 0.6, pier.z + pier.d / 2, WORLD_BOUNDS.maxZ, -1, 2.4);
  wall(WATER_X, pier.x + pier.w / 2, pier.z - pier.d / 2 - 0.6, pier.z - pier.d / 2, -1, 1.4);
  wall(WATER_X, pier.x + pier.w / 2, pier.z + pier.d / 2, pier.z + pier.d / 2 + 0.6, -1, 1.4);
  wall(pier.x + pier.w / 2, pier.x + pier.w / 2 + 0.6, pier.z - pier.d / 2, pier.z + pier.d / 2, -1, 1.4);
  // Chain-link fence with a gate onto Pier 47.
  wall(FENCE.x - 0.1, FENCE.x + 0.1, FENCE.z0, FENCE.gate[0], -1, 2.6, { sightMaxY: 0.2 });
  wall(FENCE.x - 0.1, FENCE.x + 0.1, FENCE.gate[1], FENCE.z1, -1, 2.6, { sightMaxY: 0.2 });
  // The lake and the bandshell in Belmont Park.
  const l = SITES.lake;
  wall(l.x - l.w / 2, l.x + l.w / 2, l.z - l.d / 2, l.z + l.d / 2, -1, 0.9, { sightMaxY: 0.5 });
  const bs = SITES.bandshell;
  wall(bs.x - bs.w / 2, bs.x + bs.w / 2, bs.z - bs.d / 2 + 4, bs.z + bs.d / 2, -1, 8);
  // El columns along Third Avenue.
  for (let z = -60; z > -300; z -= 12) for (const x of [53.6, 66.4]) wall(x - 0.3, x + 0.3, z - 0.3, z + 0.3, -1, 8, { sightMaxY: 8 });
  return boxes;
}

/** Story and map destinations in the new districts. */
export const OPEN_PLACES = [
  { id: "timessquare", name: "Times Square", x: -245, z: 52, y: 0 },
  { id: "belmontpark", name: "Belmont Park", x: 60, z: 214, y: 0 },
  { id: "belmontplaza", name: "The Belmont Plaza", x: 65, z: 154, y: 0 },
  { id: "pier47", name: "Pier 47", x: 300, z: 22.8, y: 0 },
  { id: "garment", name: "The Garment District", x: 52, z: -140, y: 0 },
];
