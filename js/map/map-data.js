/* The city as a 1954 street map: roads, building footprints, parks, water, places and subway stops, read
   from the same layout data the game is built from. Pure (no three, no DOM) so the tests can check it.

   Orientation: uptown (+z, toward Belmont Park) is up, and the map is a true overhead view rather than a
   mirror image, so +x runs to the LEFT. The river at x 380 therefore sits on the west, as the North River
   does, and what is on your left in the street is on your left on the map. */
import { OW_ROADS, SITES, WATER_X, WORLD_BOUNDS, SIDEWALK, OPEN_PLACES, FENCE } from "../openworld/layout.js";
import { BLOCK_ROADS, DISTRICT_BUILDINGS, DISTRICT_PARKS, DISTRICT_PLACES } from "../district-layout.js";
import { CLUB, DINER, HOTEL, SHOPS, buildColliders } from "../zones.js";
import { HOMES } from "../life.js";
import { SUBWAY_STATIONS } from "../openworld/stations.js";

export { SUBWAY_STATIONS };
export const MAP_BOUNDS = WORLD_BOUNDS;
export const MAP_SIDEWALK = SIDEWALK;

/** view = { cx, cz, s (px per metre), w, h } — the world point (cx, cz) sits at the centre of a w × h canvas. */
export function toMap(view, x, z) {
  return { x: view.w / 2 - (x - view.cx) * view.s, y: view.h / 2 - (z - view.cz) * view.s };
}
export function fromMap(view, px, py) {
  return { x: view.cx - (px - view.w / 2) / view.s, z: view.cz - (py - view.h / 2) / view.s };
}
/** Screen angle (radians, 0 = right, clockwise positive like canvas) of a world direction (dx, dz). */
export function mapHeading(dx, dz) {
  return Math.atan2(-dz, -dx);
}
/** Keeps a view's centre inside the city at its zoom. */
export function clampView(view) {
  const halfW = view.w / 2 / view.s, halfH = view.h / 2 / view.s, B = MAP_BOUNDS, pad = 40;
  const clamp = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)));
  return { ...view, cx: clamp(view.cx, B.minX - pad + halfW, B.maxX + pad - halfW), cz: clamp(view.cz, B.minZ - pad + halfH, B.maxZ + pad - halfH) };
}

let CACHE = null;
/** Everything static, computed once: { roads, roadLabels, blocks, venues, areas, districts, places, stations, el }. */
export function cityMap() {
  if (CACHE) return CACHE;
  // Roads: the open city plus the original block loop (one segment per stretch), and the alley behind the club.
  const seen = new Set(), roads = [];
  for (const r of [...BLOCK_ROADS, ...OW_ROADS, { name: "The Alley", a: [-55, -23], b: [55, -23], width: 6, lane: true }]) {
    const key = [r.a, r.b].map((p) => p.map((v) => Math.round(v)).join(",")).sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    roads.push({ name: r.name, a: r.a, b: r.b, width: r.width, lane: !!r.lane });
  }
  // One label per long stretch of each named road, along its longest segment (and again every 260 m).
  const roadLabels = [];
  for (const r of roads) {
    const len = Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]);
    if (len < 60) continue;
    const n = Math.max(1, Math.floor(len / 260));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      roadLabels.push({ text: r.name.toUpperCase(), x: r.a[0] + (r.b[0] - r.a[0]) * t, z: r.a[1] + (r.b[1] - r.a[1]) * t, dx: r.b[0] - r.a[0], dz: r.b[1] - r.a[1], lane: r.lane });
    }
  }
  // Building masses: every tall, solid footprint the player bumps into.
  const blocks = [];
  for (const b of buildColliders([]).boxes) {
    const w = b.maxX - b.minX, d = b.maxZ - b.minZ, h = b.maxY - Math.max(b.minY, 0);
    if (h < 4 || b.minY > 1 || w * d < 25 || Math.min(w, d) < 2.5) continue;
    blocks.push({ minX: b.minX, maxX: b.maxX, minZ: b.minZ, maxZ: b.maxZ, h: Math.min(b.maxY, 80) });
  }
  // Walk-in buildings, drawn over the masses in a warmer tone with their names.
  const rect = (r, name, kind = "venue") => ({ minX: r.minX, maxX: r.maxX, minZ: r.minZ, maxZ: r.maxZ, name, kind });
  const box = (x, z, w, d, name, kind = "venue") => ({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, name, kind });
  const venues = [
    rect(CLUB, "VELVET TUESDAY"), rect(DINER, "DOTTIE'S"), rect(HOTEL, "THE ASTORIA"),
    ...SHOPS.map((s) => rect(s, s.label, "shop")),
    ...DISTRICT_BUILDINGS.filter((b) => b.id).map((b) => box(b.x, b.z, b.w, b.d, b.name)),
    ...HOMES.filter((h) => h.floorY === 0).map((h) => ({ minX: h.doorX - 14, maxX: h.doorX + 4, minZ: 31.8, maxZ: 44.5, name: h.number, kind: "home" })),
    box(SITES.meridian.x, SITES.meridian.z, SITES.meridian.w, SITES.meridian.d, "MERIDIAN RADIO"),
    box(SITES.plaza.x, SITES.plaza.z, SITES.plaza.w, SITES.plaza.d, "THE BELMONT PLAZA"),
  ];
  const site = (s, kind, name = null) => ({ ...box(s.x, s.z, s.w, s.d, name, kind) });
  const areas = [
    { kind: "water", minX: WATER_X, maxX: MAP_BOUNDS.maxX + 60, minZ: MAP_BOUNDS.minZ - 60, maxZ: MAP_BOUNDS.maxZ + 60 },
    site(SITES.park, "park"), site(SITES.lake, "water"), site(SITES.bandshell, "bandshell"),
    ...DISTRICT_PARKS.map((p) => site(p, "park")),
    site(SITES.timesSquare, "square"), site(SITES.yard, "yard"),
    site(SITES.pier, "pier"), site(SITES.freighter, "ship"),
  ];
  const fence = { x: FENCE.x, z0: FENCE.z0, z1: FENCE.z1, gate: FENCE.gate };
  const districts = [
    { text: "TIMES SQUARE", x: -245, z: 92, size: 1 },
    { text: "BROADWAY", x: -300, z: 170, size: 0.8 },
    { text: "BELMONT PARK", x: 100, z: 260, size: 1.15 },
    { text: "GARMENT DISTRICT", x: -60, z: -200, size: 1 },
    { text: "WATERFRONT", x: 320, z: -70, size: 0.85 },
    { text: "NORTH RIVER", x: 398, z: 150, size: 1.1, water: true, vertical: true },
  ];
  const places = [
    ...OPEN_PLACES.map((p) => ({ ...p, kind: "landmark" })),
    ...DISTRICT_PLACES.map((p) => ({ ...p, kind: "local" })),
    { id: "club", name: "Velvet Tuesday — the club", x: 0, z: 10, y: 0, kind: "landmark" },
    { id: "diner", name: "Dottie's Diner", x: -27, z: 11.5, y: 0, kind: "local" },
    { id: "hotel", name: "The Astoria hotel", x: 25, z: 11.8, y: 0, kind: "local" },
    { id: "meridian", name: "The Meridian warehouse", x: SITES.meridian.x - SITES.meridian.w / 2 - 2, z: (SITES.meridian.door.z0 + SITES.meridian.door.z1) / 2, y: 0, kind: "landmark" },
    ...SHOPS.map((s) => ({ id: s.id, name: s.label, x: s.doorX, z: 31, y: 0, kind: "shop" })),
    ...DISTRICT_BUILDINGS.filter((b) => b.id).map((b) => ({ id: b.id, name: b.name, x: b.x, z: b.z - b.d / 2 - 1, y: 0, kind: "shop" })),
  ];
  const el = { x: 60, z0: -60, z1: MAP_BOUNDS.minZ };
  CACHE = { roads, roadLabels, blocks, venues, areas, fence, districts, places, stations: SUBWAY_STATIONS, el };
  return CACHE;
}

/** The nearest pickable thing (station first, then place) within `radius` screen px of (px, py), or null. */
export function pickAt(view, px, py, { radius = 16, stations = true, places = true } = {}) {
  const map = cityMap();
  let best = null, bd = radius;
  const consider = (item, type) => {
    const p = toMap(view, item.x, item.z), d = Math.hypot(p.x - px, p.y - py) - (type === "station" ? 4 : 0);
    if (d < bd) { bd = d; best = { type, item }; }
  };
  if (stations) for (const s of map.stations) consider(s, "station");
  if (places) for (const p of map.places) if (visiblePlace(p, view.s)) consider(p, "place");
  return best;
}

/** Which places are worth a pin at a zoom: landmarks always, the rest once you zoom in. */
export function visiblePlace(p, s) {
  return p.kind === "landmark" || (p.kind === "local" && s >= 1.4) || (p.kind === "shop" && s >= 2.2);
}

/** Straight-line distance and a compass-style direction label from (x, z) to a target, for the map card. */
export function bearingText(from, to) {
  const dx = to.x - from.x, dz = to.z - from.z, dist = Math.hypot(dx, dz);
  if (dist < 8) return "you're here";
  // +z is uptown (north), +x is west.
  const ang = (Math.atan2(-dx, dz) * 180) / Math.PI;
  const dirs = ["uptown", "uptown & east", "east", "downtown & east", "downtown", "downtown & west", "west", "uptown & west"];
  return `${Math.round(dist)} m ${dirs[Math.round(((ang + 360) % 360) / 45) % 8]}`;
}
