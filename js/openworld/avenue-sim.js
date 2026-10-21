/* Traffic on every street of the open city except 47th Street (which has its own fleet in city.js). Pure: no
   three, no DOM. Collinear pieces of a street are merged into one road; each road runs a car-following sim
   (traffic.js stepTraffic) in both directions; every junction has a signal that gives crosstown streets
   and avenues their turn, and 47th Street's own traffic obeys the same signals (junctionStops47th).
   Cars stop for you on foot and for the car you're driving, and hitAvenueCar knocks you over if you
   step in front of one. */
import { OW_ROADS } from "./layout.js";
import { BLOCK_ROADS } from "../district-layout.js";
import { stepTraffic, SPEED } from "../traffic.js";

export const CYCLE = 22;          // seconds for a full signal cycle
export const KINDS = ["sedan", "checker", "sedan", "checker", "sedan", "van", "sedan", "checker", "bus", "sedan"];
const SPACING = 75;               // metres of road per car, per direction
const END_FADE = 6;               // cars hide this close to the end of a road (they "turn off" there)

// 47th Street has its own fleet; Pier 47 Road is its dead-end tail to the river (no junctions to cycle through).
const key47 = (r) => /47th Street|Pier 47 Road/.test(r.name);

/** Which streets have green: "x" (crosstown, running along x), "z" (avenues and Broadway) or "red" (all red). */
export function signalPhase(t) {
  const u = ((t % CYCLE) + CYCLE) % CYCLE;
  return u < 9.5 ? "x" : u < 11 ? "red" : u < 20.5 ? "z" : "red";
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
  return { t, sin: Math.abs(den) / (lenR * lenS) };
}

let ROADS = null;
/** Every simulated road with its direction, lanes and junctions (computed once). */
export function avenueRoads() {
  if (ROADS) return ROADS;
  const all = mergeRoads([...OW_ROADS, ...BLOCK_ROADS]);
  ROADS = all.filter((r) => !key47(r) && Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]) > 60).map((r) => {
    const len = Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]), ux = (r.b[0] - r.a[0]) / len, uz = (r.b[1] - r.a[1]) / len;
    const junctions = [];
    for (const s of all) {
      if (s === r) continue;
      const hit = intersect(r, s);
      if (!hit) continue;
      junctions.push({ along: hit.t * len, half: s.width / 2 / Math.max(0.35, hit.sin) + 1.2, cross: s.name });
    }
    junctions.sort((a, b) => a.along - b.along);
    return { name: r.name, axis: r.axis, width: r.width, a: r.a, b: r.b, len, ux, uz, lateral: r.width / 4 - 0.1, junctions, signal: r.axis === "x" ? "x" : "z" };
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
      const car = { road, dir, x: ((i + (dir > 0 ? 0.25 : 0.7)) / per) * road.len, v: SPEED * 0.8, braking: false, kind: KINDS[n % KINDS.length], id: n++ };
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

/** Advances every road one step. `obstacles` are {x, z, r}: you on foot, or the car you're driving. */
export function stepAvenues(fleet, dt, t, { obstacles = [] } = {}) {
  const phase = signalPhase(t);
  for (const road of fleet.roads) {
    const stops = [];
    if (phase !== road.signal) for (const j of road.junctions) stops.push({ x: j.along - j.half, dir: 1 }, { x: j.along + j.half, dir: -1 });
    for (const o of obstacles) {
      const { s, l } = along(road, o.x, o.z);
      if (s < -3 || s > road.len + 3 || Math.abs(l) > road.width / 2 + 0.3) continue;
      // Only the lane the obstacle stands in (or both, if it's straddling the middle).
      if (l < 0.6) stops.push({ x: s - o.r, dir: 1 });
      if (l > -0.6) stops.push({ x: s + o.r, dir: -1 });
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
export function hitAvenueCar(player, fleet, sizeOf = () => ({ length: 4.9, width: 1.85 })) {
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
export function avenueBlocks(fleet, x, z, r, sizeOf = () => ({ length: 4.9, width: 1.85 })) {
  for (const car of fleet.cars) {
    if (!carShown(car)) continue;
    const p = carPose(car.road, car), dx = x - p.x, dz = z - p.z;
    if (Math.abs(dx) > 8 || Math.abs(dz) > 8) continue;
    const size = sizeOf(car), a = dx * p.fx + dz * p.fz, l = dx * -p.fz + dz * p.fx;
    if (Math.abs(a) < size.length / 2 + r && Math.abs(l) < size.width / 2 + r) return true;
  }
  return false;
}

/** Stop lines for 47th Street's fleet (it runs along x at z 22.8) at the junctions it shares with avenues. */
let J47 = null;
export function junctionStops47th(t) {
  if (!J47) {
    const st = { name: "47th", a: [-430, 22.8], b: [380, 22.8], width: 8.2 };
    J47 = [];
    for (const r of avenueRoads()) {
      if (r.axis === "x") continue;
      const hit = intersect(st, r);
      if (hit) J47.push({ x: st.a[0] + hit.t * (st.b[0] - st.a[0]), half: r.width / 2 / Math.max(0.35, hit.sin) + 1.2 });
    }
  }
  if (signalPhase(t) === "x") return [];
  return J47.flatMap((j) => [{ x: j.x - j.half, dir: 1 }, { x: j.x + j.half, dir: -1 }]);
}
