import assert from "node:assert/strict";
import { COURSES, courseLength, medalTimes, medalFor, nearStart, createRun, stepRun, ghostAt, clock } from "../js/runs.js";
import { makeChart, schedule, createRound, hit, sweep, maxScore, grade, multiplier, finished, WINDOWS, LANES } from "../js/fever.js";
import { RECORDS, pickUp, within } from "../js/lost45s.js";
import { normalizeGames, recordRun, recordFever, collectRecord, MEDAL_PAY, COLLECTION_PAY, RECORD_PAY } from "../js/games.js";
import { normalizeCommerce } from "../js/commerce.js";
import { buildColliders, isOutside } from "../js/zones.js";
import { OW_ROADS } from "../js/openworld/layout.js";
import { BLOCK_ROADS } from "../js/district-layout.js";

const roads = [...OW_ROADS, ...BLOCK_ROADS];
const seg = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(px - ax - t * dx, pz - az - t * dz); };
const onRoad = (x, z) => roads.some((r) => seg(x, z, r.a, r.b) < r.width / 2 + 0.01);

const courseSolid = buildColliders([]).boxes.filter((b) => b.minY < 1.2 && b.maxY > 0.3);

// --- Midnight Runs: every course runs on real streets.
for (const c of COURSES) {
  const pts = [[c.start.x, c.start.z], ...c.gates];
  for (const [x, z] of pts) assert.ok(onRoad(x, z), `${c.id}: ${x},${z} is on a road`);
  for (let i = 1; i < pts.length; i++) for (const u of [0.25, 0.5, 0.75]) {
    const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, z = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u;
    assert.ok(onRoad(x, z), `${c.id}: the road runs from gate ${i - 1} to ${i} (at ${x.toFixed(1)},${z.toFixed(1)})`);
  }
  // Nothing solid stands in the way: a car's width of clear road all along the line from gate to gate.
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i], d = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / d, nz = (bx - ax) / d;
    for (let s = 0; s <= d; s += 1.5) for (const off of [-1, 0, 1]) {
      const x = ax + ((bx - ax) * s) / d + nx * off, z = az + ((bz - az) * s) / d + nz * off;
      const hit = courseSolid.find((b) => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ);
      assert.ok(!hit, `${c.id}: something solid at ${x.toFixed(1)},${z.toFixed(1)} between gates ${i - 1} and ${i}: ${JSON.stringify(hit)}`);
    }
  }
  const len = courseLength(c), m = medalTimes(c);
  assert.ok(len > 450 && len < 700, `${c.id}: ${len.toFixed(0)} m`);
  assert.ok(m.gold < m.silver && m.silver < m.bronze);
  assert.equal(medalFor(c, m.gold), 3);
  assert.equal(medalFor(c, m.silver), 2);
  assert.equal(medalFor(c, m.bronze), 1);
  assert.equal(medalFor(c, m.bronze + 1), 0);
  if (c.loop) assert.deepEqual(c.gates.at(-1), [c.start.x, c.start.z], "a loop finishes where it starts");
  // The car on the flag faces the first gate.
  const [gx, gz] = c.gates[0], fwd = [Math.cos(c.start.yaw), -Math.sin(c.start.yaw)];
  assert.ok(((gx - c.start.x) * fwd[0] + (gz - c.start.z) * fwd[1]) / Math.hypot(gx - c.start.x, gz - c.start.z) > 0.95, `${c.id}: the flag faces the first gate`);
}
assert.ok(nearStart(COURSES[0], { x: -38, z: 23 }, 0.5));
assert.ok(!nearStart(COURSES[0], { x: -38, z: 23 }, 12), "not while still moving fast");
assert.ok(!nearStart(COURSES[0], { x: 0, z: 23 }, 0));

// A driver who follows the gates at 15 m/s.
function drive(course, best = null, speed = 15) {
  let s = createRun(course, best), x = course.start.x, z = course.start.z, events = [], gate = 0;
  for (let i = 0; i < 60 * 600 && !s.done; i++) {
    const dt = 1 / 60;
    let target = course.gates[Math.min(gate, course.gates.length - 1)];
    if (s.countdown <= 0) {
      const dx = target[0] - x, dz = target[1] - z, d = Math.hypot(dx, dz) || 1;
      x += (dx / d) * speed * dt; z += (dz / d) * speed * dt;
    }
    const r = stepRun(s, { pos: { x, z, yaw: Math.atan2(-(target[1] - z), target[0] - x) }, dt });
    s = r.state;
    for (const e of r.events) { events.push(e); if (e.type === "gate") gate++; }
  }
  return { s, events };
}
const c0 = COURSES[0];
const first = drive(c0);
assert.deepEqual(first.events.filter((e) => e.type === "tick").map((e) => e.n), [2, 1], "the three-count ticks");
assert.equal(first.events.filter((e) => e.type === "go").length, 1);
assert.equal(first.events.filter((e) => e.type === "gate").length, c0.gates.length);
const fin = first.events.find((e) => e.type === "finish");
// (It turns for the next gate as soon as it's inside a gate's radius, so it cuts each corner a little.)
assert.ok(fin && fin.time < courseLength(c0) / 15 + 0.5 && fin.time > (courseLength(c0) / 15) * 0.85, `finish ${fin?.time} vs ${(courseLength(c0) / 15).toFixed(1)}`);
assert.equal(first.s.splits.length, c0.gates.length);
assert.ok(Math.abs(first.s.ghost.length / 3 - fin.time * 5) < 3, "a ghost pose every fifth of a second");
// The ghost replays the run.
const mid = ghostAt(first.s.ghost, fin.time / 2);
assert.ok(mid && onRoad(mid.x, mid.z), "the ghost is on the road halfway through");
assert.equal(ghostAt(first.s.ghost, fin.time + 5), null, "and gone after the finish");
// Racing your best: deltas at each gate (a faster run is ahead, negative).
const faster = drive(c0, { splits: first.s.splits }, 18);
const deltas = faster.events.filter((e) => e.type === "gate").map((e) => e.delta);
assert.ok(deltas.every((d) => Number.isFinite(d)) && deltas.at(-1) < -2, `last delta ${deltas.at(-1)}`);
assert.equal(clock(41.27), "0:41.27");
assert.equal(clock(65.5), "1:05.50");

// --- Records of the runs: medals pay once per tier per course; the best run (and its ghost) is kept.
const m0 = medalTimes(c0);
let g = normalizeGames({});
let r = recordRun(g, "block", { time: m0.gold - 1, splits: [1, 2], ghost: [0, 0, 0, 1, 1, 0] });
assert.equal(r.reward, MEDAL_PAY[1] + MEDAL_PAY[2] + MEDAL_PAY[3], "a first gold pays bronze, silver and gold");
assert.equal(r.medal, 3); assert.ok(r.best);
g = r.games;
r = recordRun(g, "block", { time: m0.silver });
assert.equal(r.reward, 0); assert.ok(!r.best, "slower runs don't replace the best");
assert.equal(r.games.runs.block.best, m0.gold - 1);
assert.deepEqual(r.games.runs.block.ghost, [0, 0, 0, 1, 1, 0]);
r = recordRun(normalizeGames({}), "river", { time: medalTimes(COURSES[2]).bronze });
assert.equal(r.reward, MEDAL_PAY[1]);
r = recordRun(r.games, "river", { time: medalTimes(COURSES[2]).silver });
assert.equal(r.reward, MEDAL_PAY[2], "then silver pays silver only");

// --- Floor Fever.
const chart = makeChart(7);
assert.deepEqual(makeChart(7), chart, "the same seed, the same chart");
assert.notDeepEqual(makeChart(8), chart);
assert.ok(chart.length > 90 && chart.length < 160, `${chart.length} notes`);
assert.ok(chart.every((n) => n.lane >= 0 && n.lane < LANES));
const lastBeat = Math.max(...chart.map((n) => n.beat));
assert.equal(chart.filter((n) => n.beat === lastBeat).length, LANES, "the big finish is a four-lane chord");
for (let b = 0; b < lastBeat; b++) { const lanes = chart.filter((n) => n.beat === b && !n.off).map((n) => n.lane); assert.equal(new Set(lanes).size, lanes.length, `no two notes in one lane at beat ${b}`); }
const notes = schedule(chart, { t0: 10, beatLen: 0.5 });
for (let i = 1; i < notes.length; i++) assert.ok(notes[i].time >= notes[i - 1].time - 1e-9, "in time order");
let round = createRound(notes);
const n0 = notes[0];
let h = hit(round, n0.lane, n0.time + 0.02);
assert.equal(h.result, "perfect");
round = h.state;
assert.equal(round.combo, 1);
h = hit(round, n0.lane, n0.time + 0.02);
assert.equal(h.result, null, "a note can't be hit twice");
h = hit(round, (notes[1].lane + 1) % LANES, notes[1].time);
assert.equal(h.result, null, "the wrong lane hits nothing");
h = hit(round, notes[1].lane, notes[1].time - 0.09);
assert.equal(h.result, "great");
round = h.state;
h = hit(round, notes[2].lane, notes[2].time + 0.15);
assert.equal(h.result, "good");
round = h.state;
const sw = sweep(round, notes[3].time + WINDOWS.good + 0.01);
assert.equal(sw.missed, 1);
assert.equal(sw.state.combo, 0, "a miss breaks the combo");
assert.equal(multiplier(0), 1); assert.equal(multiplier(10), 1.5); assert.equal(multiplier(200), 4);
// A perfect round is an S; a sloppy one isn't.
let perfect = createRound(schedule(chart, { t0: 0, beatLen: 0.5 }));
for (const n of perfect.notes) perfect = hit(perfect, n.lane, n.time).state;
assert.ok(finished(perfect));
assert.equal(perfect.score, maxScore(perfect.notes.length));
assert.equal(grade(perfect), "S");
let sloppy = createRound(schedule(chart, { t0: 0, beatLen: 0.5 }));
sloppy.notes.forEach((n, i) => { if (i % 3) sloppy = hit(sloppy, n.lane, n.time + 0.13).state; });
sloppy = sweep(sloppy, 999).state;
assert.ok(finished(sloppy) && ["C", "D"].includes(grade(sloppy)), grade(sloppy));
// Grades pay once per tier.
g = normalizeGames({});
let f = recordFever(g, { score: 1000, grade: "A" });
assert.equal(f.reward, 5 + 15 + 25, "a first A pays C, B and A");
f = recordFever(f.games, { score: 500, grade: "B" });
assert.equal(f.reward, 0);
assert.equal(f.games.fever.best, 1000);
f = recordFever(f.games, { score: 2000, grade: "S" });
assert.equal(f.reward, 50);
assert.equal(f.games.fever.grade, "S");
assert.equal(f.games.fever.rounds, 3);

// --- The Lost 45s: ten, outdoors, none inside anything solid.
assert.equal(RECORDS.length, 10);
assert.equal(new Set(RECORDS.map((r) => r.id)).size, 10);
const { boxes } = buildColliders([]);
const solid = boxes.filter((b) => b.minY < 1.7 && b.maxY > 0.3);
for (const rec of RECORDS) {
  assert.ok(!solid.some((b) => rec.x > b.minX - 0.4 && rec.x < b.maxX + 0.4 && rec.z > b.minZ - 0.4 && rec.z < b.maxZ + 0.4), `${rec.id} at ${rec.x},${rec.z} is clear of walls`);
  assert.ok(isOutside(rec.x, rec.z, 1.7), `${rec.id} is out in the open`);
  assert.ok(roads.every((r) => seg(rec.x, rec.z, r.a, r.b) > r.width / 2 + 0.6), `${rec.id} at ${rec.x},${rec.z} is off the asphalt`);
}
assert.equal(pickUp([], { x: RECORDS[0].x + 1, z: RECORDS[0].z })?.id, RECORDS[0].id);
assert.equal(pickUp([RECORDS[0].id], { x: RECORDS[0].x + 1, z: RECORDS[0].z }), null, "found records stay found");
assert.equal(pickUp([], { x: RECORDS[0].x + 2.5, z: RECORDS[0].z }), null);
assert.equal(pickUp([], { x: RECORDS[0].x + 2.5, z: RECORDS[0].z }, { driving: true })?.id, RECORDS[0].id, "a little further from a car");
assert.equal(within([], { x: RECORDS[1].x + 20, z: RECORDS[1].z })?.id, RECORDS[1].id);
assert.equal(within([], { x: RECORDS[1].x + 40, z: RECORDS[1].z }), null);
let col = normalizeGames({}), paid = 0;
for (const rec of RECORDS) { const c = collectRecord(col, rec.id); paid += c.reward; col = c.games; if (rec !== RECORDS.at(-1)) assert.ok(!c.complete); else assert.ok(c.complete); }
assert.equal(paid, RECORDS.length * RECORD_PAY + COLLECTION_PAY);
assert.equal(collectRecord(col, RECORDS[0].id).reward, 0, "no paying twice");

// --- Saves: games survive normalizing (inside commerce too), and junk is dropped.
const saved = normalizeGames({ runs: { block: { best: 40, medal: 9, splits: [1, "x", 2], ghost: [1, 2, 3, 4] }, nowhere: { best: 3 } }, fever: { best: -5, grade: "Z", rounds: 2.7 }, records: ["lenox", "lenox", "nope"] });
assert.deepEqual(Object.keys(saved.runs), ["block"]);
assert.equal(saved.runs.block.medal, Math.max(medalFor(c0, 40), 3));
assert.deepEqual(saved.runs.block.splits, [1, 2]);
assert.equal(saved.runs.block.ghost.length, 3, "only whole poses");
assert.deepEqual(saved.fever, { best: 0, grade: null, rounds: 2 });
assert.deepEqual(saved.records, ["lenox"]);
const commerce = normalizeCommerce({ games: { records: ["pier"], fever: { best: 1200, grade: "B", rounds: 1 } } });
assert.deepEqual(commerce.games.records, ["pier"]);
assert.equal(commerce.games.fever.grade, "B");
assert.deepEqual(normalizeCommerce({}).games, normalizeGames({}));

// --- The Night Ledger: sixteen goals, each pays once; counts kept with the save.
const { GOALS, GOAL_PAY } = await import("../js/ledger.js");
const { tickGoal, bump } = await import("../js/games.js");
assert.equal(GOALS.length, 16);
assert.equal(new Set(GOALS.map((x) => x.id)).size, 16);
let led = normalizeGames({});
let t1 = tickGoal(led, "shake-a-tail");
assert.ok(t1.fresh); assert.equal(t1.reward, GOAL_PAY); assert.deepEqual(t1.games.ledger, ["shake-a-tail"]);
assert.equal(tickGoal(t1.games, "shake-a-tail").reward, 0, "a goal pays once");
assert.equal(tickGoal(t1.games, "nonsense").fresh, false);
let all = normalizeGames({});
for (const goal of GOALS) { const r = tickGoal(all, goal.id); all = r.games; if (goal === GOALS.at(-1)) assert.ok(r.complete); }
assert.deepEqual(all.ledger, GOALS.map((x) => x.id), "kept in the ledger's own order");
led = bump(bump(normalizeGames({}), "fares"), "fares", 2);
assert.equal(led.stats.fares, 3);
assert.deepEqual(bump(led, "nope").stats, led.stats);
assert.deepEqual(normalizeGames({ ledger: ["red-handed", "x", "red-handed"], stats: { fares: -2, tickets: 3.6 } }).ledger, ["red-handed"]);
assert.deepEqual(normalizeGames({ stats: { fares: -2, tickets: 3.6 } }).stats, { fares: 0, chasesLost: 0, tickets: 3 });

console.log(`games: ${COURSES.length} runs on real streets (${COURSES.map((c) => `${c.id} ${courseLength(c).toFixed(0)} m, gold ${medalTimes(c).gold}s`).join("; ")}), splits and ghosts, medals pay once; Floor Fever ${chart.length}-note chart, judging, combos, grades; ${RECORDS.length} Lost 45s in the open; saves`);
