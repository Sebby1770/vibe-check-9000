/* Traffic on every street of the open city except 47th Street (which has its own fleet in city.js). Pure: no
   three, no DOM. Collinear pieces of a street are merged into one road; each road runs a car-following sim
   (traffic.js stepTraffic) in both directions; every junction has a signal that gives crosstown streets
   and avenues their turn, and 47th Street's own traffic obeys the same signals (junctionStops47th).
   Cars stop for you on foot and for the car you're driving, and hitAvenueCar knocks you over if you
   step in front of one. */
import { OW_ROADS } from "./layout.js";
import { BLOCK_ROADS } from "../district-layout.js";
import { stepTraffic, SPEED } from "../traffic.js";

export const CYCLE = 28.5;        // seconds for a full signal cycle
export const KINDS = ["sedan", "checker", "sedan", "checker", "sedan", "van", "sedan", "checker", "bus", "sedan"];
// Lengths and widths from vehicles/models.js SPECS (kept here so this module stays three-free).
export const LEN = { sedan: 4.95, checker: 5.0, van: 4.7, bus: 10.6, limo: 5.7, police: 4.95 };
const WID = { sedan: 1.82, checker: 1.86, van: 1.9, bus: 2.5, limo: 1.96, police: 1.82 };
const MERGE = 12.5;               // junction boxes closer than this share one pair of stop lines
const SPACING = 75;               // metres of road per car, per direction
const END_FADE = 6;               // cars hide this close to the end of a road (they "turn off" there)

// 47th Street has its own fleet; Pier 47 Road is its dead-end tail to the river (no junctions to cycle through).
const key47 = (r) => /47th Street|Pier 47 Road/.test(r.name);

/** Which streets have green: "x" (crosstown, along x), "z" (the avenues), "d" (Broadway, which cuts across both)
    or "red" (all red, so the junctions clear between phases). */
export function signalPhase(t) {
  const u = ((t % CYCLE) + CYCLE) % CYCLE;
  return u < 9 ? "x" : u < 10.5 ? "red" : u < 19.5 ? "z" : u < 21 ? "red" : u < 27 ? "d" : "red";
}

function axisOf(r) {
  return r.a[1] === r.b[1] ? "x" : r.a[0] === r.b[0] ? "z" : "d";
}

/** Merges collinear, touching pieces of the same street into single roads. */
export function mergeRoads(list) {
  const groups = new Map();
  for (const r of list) {
    const axis = axisOf(r);
    const k = axis === "d" ? `${r.name}|${r.a}|${r.b}` : `${r.name}|${axis}|${axis === "x" ? r.a[1] : r.a[0]}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push({ ...r, axis });
  }
  const out = [];
  for (const pieces of groups.values()) {
    const axis = pieces[0].axis;
    if (axis === "d") { out.push(...pieces); continue; }
    const i = axis === "x" ? 0 : 1;
    const spans = pieces.map((p) => ({ lo: Math.min(p.a[i], p.b[i]), hi: Math.max(p.a[i], p.b[i]), p })).sort((a, b) => a.lo - b.lo);
    let cur = null;
    for (const s of spans) {
      if (cur && s.lo <= cur.hi + 1) { cur.hi = Math.max(cur.hi, s.hi); cur.width = Math.max(cur.width, s.p.width); continue; }
      if (cur) out.push(cur.road());
      cur = { lo: s.lo, hi: s.hi, width: s.p.width, road() { const c = s.p.a[1 - i]; return { name: s.p.name, axis, width: this.width, a: i === 0 ? [this.lo, c] : [c, this.lo], b: i === 0 ? [this.hi, c] : [c, this.hi] }; } };
    }
    if (cur) out.push(cur.road());
  }
  return out;
}

function intersect(r, s) {
  const [ax, az] = r.a, [bx, bz] = r.b, [cx, cz] = s.a, [dx, dz] = s.b;
  const rx = bx - ax, rz = bz - az, sx = dx - cx, sz = dz - cz, den = rx * sz - rz * sx;
  if (Math.abs(den) < 1e-6) return null;
  const t = ((cx - ax) * sz - (cz - az) * sx) / den, u = ((cx - ax) * rz - (cz - az) * rx) / den;
  const lenR = Math.hypot(rx, rz), lenS = Math.hypot(sx, sz);
  if (t < -1 / lenR || t > 1 + 1 / lenR || u < -1 / lenS || u > 1 + 1 / lenS) return null;
  return { t, sin: Math.abs(den) / (lenR * lenS), cos: Math.abs(rx * sx + rz * sz) / (lenR * lenS) };
}

/** Where road r crosses others, as stop-line boxes [lo, hi] along r. A skewed crossing's box is longer, and
    boxes closer together than a car plus its gap merge, so nobody queues between two junctions. */
function junctionBoxes(r, len, others) {
  const boxes = [];
  for (const s of others) {
    if (s === r) continue;
    const hit = intersect(r, s);
    if (!hit) continue;
    const sin = Math.max(0.35, hit.sin), half = s.width / 2 / sin + (r.width / 2) * (hit.cos / sin) + 1.2, at = hit.t * len;
    boxes.push({ lo: at - half, hi: at + half, cross: [s.name] });
  }
  boxes.sort((a, b) => a.lo - b.lo);
  const merged = [];
  for (const b of boxes) {
    const last = merged[merged.length - 1];
    if (last && b.lo - last.hi < MERGE) { last.hi = Math.max(last.hi, b.hi); last.cross.push(...b.cross); }
    else merged.push({ ...b, cross: [...b.cross] });
  }
  return merged;
}

/** Seconds until cross traffic may move: the rest of an all-red, or 0 once another road has green. */
export function clearTime(t) {
  const u = ((t % CYCLE) + CYCLE) % CYCLE;
  for (const end of [10.5, 21, 28.5]) if (u >= end - 1.5 && u < end) return end - u;
  return 0;
}

/** Seconds of green left for a road whose turn it is (its phase ends at 9, 19.5 or 27 in the cycle). */
function greenLeft(t, signal) {
  const u = ((t % CYCLE) + CYCLE) % CYCLE;
  return ({ x: 9, z: 19.5, d: 27 })[signal] - u;
}

/** Stop lines for one road. Red: stop unless already committed and able to clear in time. Green: enter a box
    only with room past it and time to be through before the cross traffic's turn ("don't block the box"). */
function boxStops(boxes, signal, t) {
  const green = signalPhase(t) === signal, clearBy = green ? greenLeft(t, signal) + 1.5 : clearTime(t);
  const stops = [];
  for (const b of boxes) {
    const box = b.hi - b.lo;
    if (green) stops.push({ x: b.lo, dir: 1, gate: b.hi, box, clearBy }, { x: b.hi, dir: -1, gate: b.lo, box, clearBy });
    else stops.push({ x: b.lo, dir: 1, box, clearBy }, { x: b.hi, dir: -1, box, clearBy });
  }
  return stops;
}

let ROADS = null;
/** Every simulated road with its direction, lanes and junctions (computed once). */
export function avenueRoads() {
  if (ROADS) return ROADS;
  const all = mergeRoads([...OW_ROADS, ...BLOCK_ROADS]);
  ROADS = all.filter((r) => !key47(r) && Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]) > 60).map((r) => {
    const len = Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]), ux = (r.b[0] - r.a[0]) / len, uz = (r.b[1] - r.a[1]) / len;
    const junctions = junctionBoxes(r, len, all);
    return { name: r.name, axis: r.axis, width: r.width, a: r.a, b: r.b, len, ux, uz, lateral: r.width / 4 - 0.1, junctions, signal: r.axis === "x" ? "x" : r.axis === "z" ? "z" : "d" };
  });
  return ROADS;
}

/** A car's place on its road: world x/z, travel direction and model yaw (vehicle models face +x). */
export function carPose(road, car) {
  const fx = road.ux * car.dir, fz = road.uz * car.dir;
  // Same side of the road as 47th Street's traffic: eastbound (+x) keeps to the lower-z lane.
  const x = road.a[0] + road.ux * car.x + fz * road.lateral;
  const z = road.a[1] + road.uz * car.x - fx * road.lateral;
  return { x, z, fx, fz, yaw: Math.atan2(-fz, fx) };
}

/** Builds the fleet: about one car every 75 m in each direction, deterministic. */
export function createAvenueTraffic() {
  const roads = avenueRoads();
  const cars = [];
  let n = 0;
  for (const road of roads) {
    road.cars = [];
    const per = Math.max(1, Math.floor(road.len / SPACING));
    for (const dir of [1, -1]) for (let i = 0; i < per; i++) {
      const kind = KINDS[n % KINDS.length];
      let x = ((i + (dir > 0 ? 0.25 : 0.7)) / per) * road.len;
      // Nobody starts inside a junction: back up to the stop line.
      for (const b of road.junctions) if (x > b.lo - LEN[kind] / 2 - 1 && x < b.hi + LEN[kind] / 2 + 1) x = dir > 0 ? b.lo - LEN[kind] / 2 - 1.5 : b.hi + LEN[kind] / 2 + 1.5;
      x = Math.max(1, Math.min(road.len - 1, x));
      const car = { road, dir, x, v: SPEED * 0.8, braking: false, kind, len: LEN[kind], wid: WID[kind], id: n++ };
      road.cars.push(car);
      cars.push(car);
    }
  }
  return { roads, cars };
}

function along(road, x, z) {
  const dx = x - road.a[0], dz = z - road.a[1];
  return { s: dx * road.ux + dz * road.uz, l: dx * -road.uz + dz * road.ux };
}

/** Advances every road one step. `obstacles` are {x, z, r, w}: you on foot, the car you're driving or the one
    you left; r is the half-length along the road, w the half-width across it. */
export function stepAvenues(fleet, dt, t, { obstacles = [] } = {}) {
  for (const road of fleet.roads) {
    const stops = boxStops(road.junctions, road.signal, t);
    for (const o of obstacles) {
      const { s, l } = along(road, o.x, o.z);
      if (s < -o.r - 3 || s > road.len + o.r + 3) continue;
      // Eastbound-style (+1) traffic keeps to l = -lateral, the other way to +lateral; only overlapped lanes stop.
      const w = (o.w ?? 0.5) + 0.95;
      if (Math.abs(l + road.lateral) < w) stops.push({ x: s - o.r, dir: 1, hard: true });
      if (Math.abs(l - road.lateral) < w) stops.push({ x: s + o.r, dir: -1, hard: true });
    }
    stepTraffic(road.cars, dt, { stops, span: [0, road.len] });
  }
  return fleet;
}

/** Hidden near the very ends of a road, where cars wrap round. */
export function carShown(car) {
  return car.x > END_FADE && car.x < car.road.len - END_FADE;
}

/** Knockback if a moving avenue car is on top of you (same shape as traffic.js hitByCar's result). */
const ownSize = (car) => ({ length: car.len || 4.9, width: car.wid || 1.85 });
export function hitAvenueCar(player, fleet, sizeOf = ownSize) {
  if (!player || player.y < -0.4 || player.y > 3.6) return null;
  for (const car of fleet.cars) {
    if (car.v < 1.2 || !carShown(car)) continue;
    const p = carPose(car.road, car), dx = player.x - p.x, dz = player.z - p.z;
    if (Math.abs(dx) > 4 || Math.abs(dz) > 4) continue;
    const size = sizeOf(car), a = dx * p.fx + dz * p.fz, l = dx * -p.fz + dz * p.fx;
    if (Math.abs(a) < size.length / 2 + 0.05 && Math.abs(l) < size.width / 2 + 0.25) {
      const side = l >= 0 ? 1 : -1;
      return { dir: car.dir, vx: p.fx * 8.2 - p.fz * side * 3.1, vz: p.fz * 8.2 + p.fx * side * 3.1, vy: 7.6 };
    }
  }
  return null;
}

/** True if a circle of radius r at (x, z) overlaps any shown avenue car (for the car you drive). */
export function avenueBlocks(fleet, x, z, r, sizeOf = ownSize) {
  for (const car of fleet.cars) {
    if (!carShown(car)) continue;
    const p = carPose(car.road, car), dx = x - p.x, dz = z - p.z;
    if (Math.abs(dx) > 8 || Math.abs(dz) > 8) continue;
    const size = sizeOf(car), a = dx * p.fx + dz * p.fz, l = dx * -p.fz + dz * p.fx;
    if (Math.abs(a) < size.length / 2 + r && Math.abs(l) < size.width / 2 + r) return true;
  }
  return false;
}

/** Stop lines for 47th Street's fleet (it runs along x at z 22.8) at the junctions it shares with the avenues:
    red when it isn't the crosstown phase, otherwise "don't block the box". */
let J47 = null;
export function junctionStops47th(t) {
  if (!J47) {
    const st = { name: "47th Street", a: [-430, 22.8], b: [380, 22.8], width: 8.2 };
    // Along-coordinates are measured from st.a, so shift the boxes back to world x.
    J47 = junctionBoxes(st, 810, avenueRoads().filter((r) => r.axis !== "x")).map((b) => ({ lo: b.lo - 430, hi: b.hi - 430, cross: b.cross }));
  }
  return boxStops(J47, "x", t);
}
