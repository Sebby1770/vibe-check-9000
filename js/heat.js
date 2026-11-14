/* Heat: Officer Muldoon and his cruiser. Speed past a parked police car (over 40 mph within 45 m) or crash near
   one, and a cruiser comes after you from a street behind, siren going. He drives the real streets (a graph of
   every road and junction, re-planned twice a second) and brakes for corners. Stop near him and he writes you a
   ticket; get 140 m clear of him and stay clear for eight seconds and you've lost him. No heat during a Midnight
   Run: the runs are off the books. Pure: heat-world.js draws the cruiser, main.js runs the rest. */
import { OW_ROADS } from "./openworld/layout.js";
import { BLOCK_ROADS } from "./district-layout.js";

export const TRAPS = [
  { id: "club", x: -6.4, z: 18.85, where: "outside the club" },
  { id: "garment", x: -120, z: -114.2, where: "on 45th Street" },
];
export const TRAP_RANGE = 45, TRAP_SPEED = 17.9, CRASH_RANGE = 60, CRASH_SPEED = 8;
export const CATCH_RANGE = 7, LOSE_RANGE = 140, LOSE_TIME = 8, GIVE_UP = 150, FINE = 15;
const TOP = 21, CORNER = 9, ACCEL = 6, BRAKE = 12, TURN = 2.4;

// --- The road graph: a node at every road end and every crossing or T, edges along the roads between them.
function cross(a, b) {
  const [ax, az] = a.a, [bx, bz] = a.b, [cx, cz] = b.a, [dx, dz] = b.b;
  const r = [bx - ax, bz - az], s = [dx - cx, dz - cz], den = r[0] * s[1] - r[1] * s[0];
  const la = Math.hypot(...r), lb = Math.hypot(...s);
  if (Math.abs(den) < 1e-9) return null;
  const t = ((cx - ax) * s[1] - (cz - az) * s[0]) / den, u = ((cx - ax) * r[1] - (cz - az) * r[0]) / den;
  // Ends that stop at (or just short of) another road still meet it: allow a road's half-width of slack.
  const ta = (a.width / 2 + 1) / la, tb = (b.width / 2 + 1) / lb;
  if (t < -tb || t > 1 + tb || u < -ta || u > 1 + ta) return null;
  return [ax + r[0] * t, az + r[1] * t, Math.max(0, Math.min(1, t))];
}

let GRAPH = null;
export function roadGraph() {
  if (GRAPH) return GRAPH;
  const roads = [...OW_ROADS, ...BLOCK_ROADS];
  const nodes = [], edges = new Map();
  const node = (x, z) => {
    for (let i = 0; i < nodes.length; i++) if (Math.hypot(nodes[i][0] - x, nodes[i][1] - z) < 4) return i;
    nodes.push([x, z]);
    return nodes.length - 1;
  };
  const link = (i, j) => {
    if (i === j) return;
    const d = Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]);
    for (const [p, q] of [[i, j], [j, i]]) { if (!edges.has(p)) edges.set(p, new Map()); edges.get(p).set(q, d); }
  };
  for (const r of roads) {
    const stops = [[r.a[0], r.a[1], 0], [r.b[0], r.b[1], 1]];
    for (const o of roads) if (o !== r) { const c = cross(r, o); if (c) stops.push(c); }
    stops.sort((p, q) => p[2] - q[2]);
    let prev = null;
    for (const [x, z] of stops) { const n = node(x, z); if (prev !== null) link(prev, n); prev = n; }
  }
  GRAPH = { nodes, edges, roads };
  return GRAPH;
}

function segDist(px, pz, [ax, az], [bx, bz]) {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(px - ax - t * dx, pz - az - t * dz);
}
/** On a road (within its asphalt). */
export function onRoad(x, z, slack = 0) {
  return roadGraph().roads.some((r) => segDist(x, z, r.a, r.b) < r.width / 2 + slack);
}

/** The stretch of street (an edge between two junctions) nearest a point. */
function nearestEdge(x, z) {
  const { nodes, edges } = roadGraph();
  let best = null, bd = Infinity;
  for (const [i, out] of edges) for (const j of out.keys()) {
    if (j < i) continue;
    const d = segDist(x, z, nodes[i], nodes[j]);
    if (d < bd) { bd = d; best = [i, j]; }
  }
  return best;
}

/** Shortest route along the streets from (ax, az) to (bx, bz): the junctions in between, then the goal itself.
    It sets off towards whichever end of your stretch of street is quicker, and arrives the same way. */
export function route(ax, az, bx, bz) {
  const { nodes, edges } = roadGraph();
  const from = nearestEdge(ax, az), to = nearestEdge(bx, bz);
  if (!from || !to || (from[0] === to[0] && from[1] === to[1])) return [[bx, bz]];
  const dist = new Map(), prev = new Map(), open = new Set();
  for (const n of from) { dist.set(n, Math.hypot(nodes[n][0] - ax, nodes[n][1] - az)); open.add(n); }
  const done = new Set();
  while (open.size) {
    let u = null, du = Infinity;
    for (const n of open) if (dist.get(n) < du) { du = dist.get(n); u = n; }
    open.delete(u);
    done.add(u);
    if (done.has(to[0]) && done.has(to[1])) break;
    for (const [v, w] of edges.get(u) || []) {
      const alt = du + w;
      if (alt < (dist.get(v) ?? Infinity)) { dist.set(v, alt); prev.set(v, u); open.add(v); }
    }
  }
  const cost = (n) => (dist.get(n) ?? Infinity) + Math.hypot(nodes[n][0] - bx, nodes[n][1] - bz);
  const end = cost(to[0]) <= cost(to[1]) ? to[0] : to[1];
  const path = [];
  for (let n = end; n !== undefined; n = prev.get(n)) path.unshift(nodes[n]);
  return [...path, [bx, bz]];
}

/** Did that just draw heat? A crash near a trap (impact in m/s), or speeding past one. */
export function drawsHeat({ x, z, speed = 0, crash = 0, racing = false }) {
  if (racing) return null;
  for (const t of TRAPS) {
    const d = Math.hypot(x - t.x, z - t.z);
    if (crash >= CRASH_SPEED && d < CRASH_RANGE) return { trap: t, why: "crash" };
    if (Math.abs(speed) >= TRAP_SPEED && d < TRAP_RANGE) return { trap: t, why: "speeding" };
  }
  return null;
}

/** Metres along the streets from a to b. */
export function routeLength(ax, az, bx, bz) {
  let len = 0, px = ax, pz = az;
  for (const [x, z] of route(ax, az, bx, bz)) { len += Math.hypot(x - px, z - pz); px = x; pz = z; }
  return len;
}

/** Where the cruiser turns up: a junction 60–130 m away as the crow flies and no more than 170 m by the streets
    (not round the back of a dead end), behind you if there is one. */
export function spawnPoint(player, heading = { x: 1, z: 0 }) {
  const { nodes } = roadGraph();
  const options = nodes.map(([x, z]) => ({ x, z, d: Math.hypot(x - player.x, z - player.z), behind: (x - player.x) * heading.x + (z - player.z) * heading.z }))
    .filter((n) => n.d > 60 && n.d < 130)
    .map((n) => ({ ...n, road: routeLength(n.x, n.z, player.x, player.z) }))
    .filter((n) => n.road < 170);
  options.sort((a, b) => a.road - b.road);
  const pick = options.find((n) => n.behind < 0) || options[0] || { x: player.x - 100, z: player.z };
  return { x: pick.x, z: pick.z };
}

export function createChase(player, heading, why = "speeding") {
  const at = spawnPoint(player, heading);
  return { phase: "chase", why, t: 0, near: 0, far: 0, replan: 0, path: [], cop: { x: at.x, z: at.z, yaw: Math.atan2(-(player.z - at.z), player.x - at.x), v: 8 } };
}

/** One frame. player {x, z, v}. Returns {state, events}: caught, lost. */
export function stepChase(state, { player, dt = 0 }) {
  if (state.phase !== "chase" || !(dt > 0)) return { state, events: [] };
  const cop = { ...state.cop };
  let { path, replan, near, far } = state;
  const t = state.t + dt;
  replan -= dt;
  const d = Math.hypot(player.x - cop.x, player.z - cop.z);
  if (replan <= 0 || !path.length) {
    replan = 0.5;
    // Close and on the same stretch of road: straight at you. Otherwise along the streets.
    path = d < 35 ? [[player.x, player.z]] : route(cop.x, cop.z, player.x, player.z);
  } else path = [...path.slice(0, -1), [player.x, player.z]];
  while (path.length > 1 && Math.hypot(path[0][0] - cop.x, path[0][1] - cop.z) < 5) path = path.slice(1);
  const [tx, tz] = path[0], toTarget = Math.hypot(tx - cop.x, tz - cop.z);
  // Brake for a corner ahead (or for you, close in); otherwise flat out.
  let want = TOP;
  if (path.length > 1) {
    const [nx, nz] = path[1], a1 = Math.atan2(tz - cop.z, tx - cop.x), a2 = Math.atan2(nz - tz, nx - tx);
    let turn = Math.abs(a2 - a1);
    if (turn > Math.PI) turn = Math.PI * 2 - turn;
    if (turn > 0.6 && toTarget < (cop.v * cop.v - CORNER * CORNER) / (2 * BRAKE) + 6) want = CORNER;
  }
  if (d < 14) want = Math.min(want, Math.max(2, Math.abs(player.v) + 2));
  cop.v += Math.max(-BRAKE * dt, Math.min(ACCEL * dt, want - cop.v));
  const aim = Math.atan2(-(tz - cop.z), tx - cop.x);
  let dy = aim - cop.yaw;
  while (dy > Math.PI) dy -= Math.PI * 2;
  while (dy < -Math.PI) dy += Math.PI * 2;
  cop.yaw += Math.max(-TURN * dt, Math.min(TURN * dt, dy));
  cop.x += Math.cos(cop.yaw) * cop.v * dt;
  cop.z -= Math.sin(cop.yaw) * cop.v * dt;
  const after = Math.hypot(player.x - cop.x, player.z - cop.z);
  near = after < CATCH_RANGE && Math.abs(player.v) < 4 ? near + dt : after < 4 ? near + dt * 0.5 : 0;
  // Getting away means driving away: sitting still doesn't lose him, however he's had to come round.
  far = after > LOSE_RANGE && (Math.abs(player.v) > 3 || after > LOSE_RANGE * 1.6) ? far + dt : 0;
  const s = { ...state, t, cop, path, replan, near, far };
  if (near >= 1.5) return { state: { ...s, phase: "caught" }, events: [{ type: "caught" }] };
  if (far >= LOSE_TIME || t >= GIVE_UP) return { state: { ...s, phase: "lost" }, events: [{ type: "lost", gaveUp: t >= GIVE_UP && far < LOSE_TIME }] };
  return { state: s, events: [] };
}
