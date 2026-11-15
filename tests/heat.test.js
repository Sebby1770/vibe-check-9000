import assert from "node:assert/strict";
import { roadGraph, route, routeLength, onRoad, kerb, clearLine, drawsHeat, spawnPoint, createChase, stepChase, TRAPS, TRAP_RANGE, LOSE_RANGE, GAP } from "../js/heat.js";

// The street graph: one connected network, every stretch of it on a road.
const g = roadGraph();
const seen = new Set([0]), queue = [0];
while (queue.length) { const u = queue.pop(); for (const v of g.edges.get(u)?.keys() || []) if (!seen.has(v)) { seen.add(v); queue.push(v); } }
assert.equal(seen.size, g.nodes.length, "every junction reaches every other");
assert.ok(g.nodes.length > 60, `${g.nodes.length} junctions`);
for (const [i, out] of g.edges) for (const j of out.keys()) for (const u of [0.25, 0.5, 0.75]) {
  const x = g.nodes[i][0] + (g.nodes[j][0] - g.nodes[i][0]) * u, z = g.nodes[i][1] + (g.nodes[j][1] - g.nodes[i][1]) * u;
  assert.ok(onRoad(x, z, 0.5), `edge ${i}-${j} runs along a road at ${x.toFixed(1)},${z.toFixed(1)}`);
}

// Routes follow the streets, and take the short way round.
const length = (pts, from) => pts.reduce((s, p, i) => s + Math.hypot(p[0] - (i ? pts[i - 1][0] : from[0]), p[1] - (i ? pts[i - 1][1] : from[1])), 0);
for (const [a, b] of [[[-40, 22.8], [109, 96]], [[-247, 60], [60, -200]], [[332, 22.8], [-380, 150]], [[0, 150], [187, -100]]]) {
  const r = route(...a, ...b);
  assert.deepEqual(r.at(-1), b);
  const pts = [a, ...r];
  for (let i = 1; i < pts.length; i++) for (const u of [0.2, 0.5, 0.8]) {
    const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, z = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u;
    assert.ok(onRoad(x, z, 1), `route ${a}→${b} stays on the streets at ${x.toFixed(1)},${z.toFixed(1)}`);
  }
}
assert.ok(length(route(-40, 22.8, 109, 96), [-40, 22.8]) < 240, "east along 47th, not the long way round");
assert.deepEqual(route(-40, 22.8, -10, 22.8), [[-10, 22.8]], "same street: straight there");

// What draws heat.
const trap = TRAPS[0];
assert.equal(drawsHeat({ x: trap.x + 20, z: 22.8, speed: 20 })?.why, "speeding");
assert.equal(drawsHeat({ x: trap.x + 20, z: 22.8, speed: 15 }), null, "under 40 mph is fine");
assert.equal(drawsHeat({ x: trap.x + TRAP_RANGE + 5, z: trap.z, speed: 25 }), null, "out of sight of the trap");
assert.equal(drawsHeat({ x: trap.x + 40, z: 22.8, crash: 10 })?.why, "crash");
assert.equal(drawsHeat({ x: trap.x + 40, z: 22.8, crash: 5 }), null, "a scrape isn't a crash");
assert.equal(drawsHeat({ x: trap.x + 20, z: 22.8, speed: 25, racing: true }), null, "the runs are off the books");
// The traps are wherever the patrol cars are parked now: drive one off and its trap goes with it.
assert.equal(drawsHeat({ x: trap.x + 20, z: 22.8, speed: 25, traps: [] }), null, "no patrol car, no trap");
assert.equal(drawsHeat({ x: 200, z: 150, speed: 25, traps: [{ x: 210, z: 154 }] })?.why, "speeding", "a patrol car parked somewhere new");

// The kerb: a point on a road is itself; off the street it's a step in from the nearest kerb.
assert.deepEqual(kerb(30, 96), [30, 96]);
const k = kerb(0, 0);
assert.ok(onRoad(k[0], k[1]) && Math.hypot(k[0], k[1]) < 30, `the kerb nearest the dance floor is ${k.map((v) => v.toFixed(1))}`);
assert.ok(clearLine(-40, 22.8, 40, 22.8), "along 47th Street");
assert.ok(!clearLine(0, 22.8, 0, 96), "not through the block");

// Where he turns up: a junction 70–130 m off, behind you when one is.
for (const [p, h] of [[{ x: 0, z: 22.8 }, { x: 1, z: 0 }], [{ x: -120, z: -110 }, { x: -1, z: 0 }], [{ x: -250, z: 60 }, { x: 0, z: 1 }], [{ x: 30, z: 96 }, { x: 1, z: 0 }]]) {
  const s = spawnPoint(p, h), d = Math.hypot(s.x - p.x, s.z - p.z);
  assert.ok(d > 60 && d < 130, `${d.toFixed(0)} m away`);
  assert.ok(routeLength(s.x, s.z, p.x, p.z) < 170, "and close by the streets too");
  assert.ok(onRoad(s.x, s.z, 1));
  assert.ok((s.x - p.x) * h.x + (s.z - p.z) * h.z < 0, "behind you");
}

// Sitting still anywhere on the streets, he always gets to you (never "lost" because his route went round).
for (const [x, z, hx, hz] of [[30, 96, 1, 0], [-99, -100, 0, -1], [240, 22.8, 1, 0], [-280, 150, -1, 0], [60, -200, 0, 1], [187, 150, 0, 1]]) {
  let c = createChase({ x, z }, { x: hx, z: hz }), closest = Infinity;
  for (let i = 0; i < 60 * 90 && c.phase === "chase"; i++) { c = stepChase(c, { player: { x, z, v: 0 }, dt: 1 / 60 }).state; closest = Math.min(closest, Math.hypot(c.cop.x - x, c.cop.z - z)); }
  assert.equal(c.phase, "caught", `stopped at ${x},${z}: ${c.phase}`);
  assert.ok(closest >= GAP - 0.01, `he pulls up ${closest.toFixed(2)} m off, not into your car`);
}

// A driver who stops is caught; the cruiser keeps to the streets on the way.
let chase = createChase({ x: 109, z: 60 }, { x: 0, z: 1 }), events = [], off = 0, n = 0;
for (let i = 0; i < 60 * 60 && chase.phase === "chase"; i++) {
  const r = stepChase(chase, { player: { x: 109, z: 60, v: 0 }, dt: 1 / 60 });
  chase = r.state; events.push(...r.events); n++;
  if (!onRoad(chase.cop.x, chase.cop.z, 2.5)) off++;
}
assert.equal(chase.phase, "caught", `phase ${chase.phase} after ${(n / 60).toFixed(1)} s`);
assert.deepEqual(events.map((e) => e.type), ["caught"]);
assert.ok(n / 60 < 30, `caught in ${(n / 60).toFixed(1)} s`);
assert.ok(off / n < 0.03, `${(100 * off / n).toFixed(1)}% of the time off the streets`);
const pulledUp = Math.hypot(chase.cop.x - 109, chase.cop.z - 60);
assert.ok(pulledUp < 8 && pulledUp >= GAP - 0.01, `pulled up ${pulledUp.toFixed(1)} m off your bumper`);

// Driving along with him on your tail, he follows; he doesn't ram you.
{
  let x = -200, c = { ...createChase({ x, z: 150 }, { x: 1, z: 0 }), cop: { x: x - 30, z: 150, yaw: 0, v: 15 } }, closest = Infinity;
  for (let i = 0; i < 60 * 12 && c.phase === "chase"; i++) {
    x += 12 / 60;
    c = stepChase(c, { player: { x, z: 150, v: 12 }, dt: 1 / 60 }).state;
    closest = Math.min(closest, Math.hypot(c.cop.x - x, c.cop.z - 150));
  }
  assert.equal(c.phase, "chase", "cruising isn't stopping");
  assert.ok(closest >= GAP - 0.01, `tailed at ${closest.toFixed(2)} m, never rammed`);
}

// Out of the car and onto the dance floor: he waits at the kerb. No cruiser through the club wall.
{
  let c = createChase({ x: -6, z: 22.8 }, { x: 1, z: 0 }), offRoad = 0, steps = 0;
  for (let i = 0; i < 60 * 40 && c.phase === "chase"; i++) {
    c = stepChase(c, { player: { x: 0, z: 0, v: 0 }, dt: 1 / 60 }).state;
    steps++;
    if (!onRoad(c.cop.x, c.cop.z, 2.5)) offRoad++;
  }
  assert.equal(offRoad, 0, `${offRoad} of ${steps} frames off the streets`);
  assert.equal(c.phase, "chase", "he can't write you up through a wall");
  assert.ok(Math.hypot(c.cop.x - k[0], c.cop.z - k[1]) < 6, "parked at the kerb outside");
}

// Rolling past slowly with him close isn't a stop; he only writes you up once you've stopped.
chase = { ...createChase({ x: 0, z: 150 }, { x: 1, z: 0 }), cop: { x: -6, z: 150, yaw: 0, v: 4 } };
let r = stepChase(chase, { player: { x: 0, z: 150, v: 12 }, dt: 0.5 });
assert.equal(r.state.phase, "chase");

// A driver flat out down a long street loses him.
let px = -400;
chase = createChase({ x: px, z: 150 }, { x: 1, z: 0 });
events = [];
for (let i = 0; i < 60 * 40 && chase.phase === "chase"; i++) {
  px = Math.min(px + 26 / 60, 290);
  const rr = stepChase(chase, { player: { x: px, z: 150, v: 26 }, dt: 1 / 60 });
  chase = rr.state; events.push(...rr.events);
}
assert.equal(chase.phase, "lost", `phase ${chase.phase}`);
assert.equal(events.at(-1).gaveUp, false);
assert.ok(Math.hypot(chase.cop.x - px, chase.cop.z - 150) > LOSE_RANGE);

// He gives up after two and a half minutes of circling.
chase = createChase({ x: 0, z: 22.8 }, { x: 1, z: 0 });
let gaveUp = null;
for (let i = 0; i < 60 * 160 && chase.phase === "chase"; i++) {
  const t = i / 60, a = t * 0.4;
  const rr = stepChase(chase, { player: { x: 109 + Math.cos(a) * 30, z: 60 + Math.sin(a) * 30, v: 12 }, dt: 1 / 60 });
  chase = rr.state;
  if (rr.events.length) gaveUp = rr.events[0];
}
assert.ok(chase.phase !== "chase");

console.log(`heat: ${g.nodes.length}-junction street graph, short routes on the streets, speed traps and crashes, a spawn behind you, caught in ${(n / 60).toFixed(1)} s when you stop, lost when you run`);
