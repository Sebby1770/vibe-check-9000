import assert from "node:assert/strict";
import { avenueRoads, createAvenueTraffic, stepAvenues, carPose, carShown, signalPhase, hitAvenueCar, avenueBlocks, junctionStops47th, mergeRoads, CYCLE, LEN } from "../js/openworld/avenue-sim.js";
import { stepTraffic } from "../js/traffic.js";
import { buildColliders } from "../js/zones.js";

// Roads: 47th Street is left to city.js; collinear pieces are merged into one road.
const roads = avenueRoads();
assert.ok(roads.length >= 14, `${roads.length} roads`);
assert.ok(!roads.some((r) => /47th/.test(r.name)), "47th Street keeps its own traffic");
const w = roads.find((r) => r.name === "West Avenue");
assert.ok(w && w.len > 490, "West Avenue is one road from -300 to 200");
assert.equal(mergeRoads([{ name: "A", a: [0, 0], b: [10, 0], width: 8 }, { name: "A", a: [10, 0], b: [30, 0], width: 8 }]).length, 1);
assert.equal(mergeRoads([{ name: "A", a: [0, 0], b: [10, 0], width: 8 }, { name: "A", a: [20, 0], b: [30, 0], width: 8 }]).length, 2);
for (const r of roads) assert.ok(r.junctions.length > 0, `${r.name} meets another street`);

// Signals take turns: crosstown, the avenues, then Broadway (which crosses both), with all-red between.
assert.deepEqual([1, 10, 15, 20, 24, 28].map(signalPhase), ["x", "red", "z", "red", "d", "red"]);
assert.equal(signalPhase(1 + CYCLE * 3), "x");
assert.equal(roads.find((r) => r.name === "Broadway").signal, "d");

// Cars stay in their lanes on the asphalt, off the kerbside parked cars and clear of buildings.
const fleet = createAvenueTraffic();
assert.ok(fleet.cars.length > 120, `${fleet.cars.length} cars`);
const { boxes } = buildColliders([]);
const tall = boxes.filter((b) => b.maxY > 3 && b.minY < 1);
for (const car of fleet.cars) {
  const p = carPose(car.road, car);
  assert.ok(Number.isFinite(p.x) && Number.isFinite(p.z));
  if (!carShown(car)) continue;
  const inside = tall.find((b) => p.x > b.minX + 0.3 && p.x < b.maxX - 0.3 && p.z > b.minZ + 0.3 && p.z < b.maxZ - 0.3);
  assert.ok(!inside, `${car.road.name} car at ${p.x.toFixed(1)},${p.z.toFixed(1)} is inside a building`);
}

// Two minutes of traffic: nobody rear-ends anybody, everyone moves, and red lights hold cars at junctions.
let t = 0, minGap = Infinity, moved = 0;
const start = fleet.cars.map((c) => c.x);
for (let i = 0; i < 1200; i++) {
  t += 0.1;
  stepAvenues(fleet, 0.1, t);
  for (const r of fleet.roads) for (const a of r.cars) for (const b of r.cars) {
    if (a === b || a.dir !== b.dir) continue;
    let d = (b.x - a.x) * a.dir;
    if (d < 0) d += r.len;
    if (d < r.len / 2) minGap = Math.min(minGap, d);
  }
}
fleet.cars.forEach((c, i) => { if (Math.abs(c.x - start[i]) > 1) moved++; });
assert.ok(minGap > 4.9, `closest bumper-to-centre gap ${minGap.toFixed(2)} m`);
assert.ok(moved > fleet.cars.length * 0.9, `${moved}/${fleet.cars.length} cars moved`);

// A red light: freeze time inside the "z is red" window; avenue cars near a junction come to rest before it.
const f2 = createAvenueTraffic();
for (let i = 0; i < 300; i++) stepAvenues(f2, 0.05, 2 + (i % 100) * 0.05);  // always inside the "x" phase
const av = f2.roads.find((r) => r.signal === "z" && r.junctions.length);
for (const car of av.cars) for (const j of av.junctions) {
  const before = car.dir > 0 ? j.lo - car.x : car.x - j.hi;
  if (before > 0.6 && before < 20) assert.ok(car.v < 4, `${av.name} car ${before.toFixed(1)} m from a red light still doing ${car.v.toFixed(1)} m/s`);
}

// Cars stop for you on foot in their lane.
const f3 = createAvenueTraffic();
const road = f3.roads.find((r) => r.name === "Seventh Avenue"), car = road.cars.find((c) => c.dir > 0);
car.x = 100; car.v = 8;
for (const c of road.cars) if (c !== car && c.dir > 0 && Math.abs(c.x - 100) < 60) c.x = (c.x + 200) % road.len;
const ahead = carPose(road, { ...car, x: 120 });
for (let i = 0; i < 200; i++) stepAvenues(f3, 0.05, 2, { obstacles: [{ x: ahead.x, z: ahead.z, r: 0.6 }] });
assert.ok(car.x < 120 - 2.5, `stopped short of you (front at ${(car.x + 2.45).toFixed(1)})`);
assert.ok(car.v < 0.5);

// Knockback and blocking use the car's own orientation.
const f4 = createAvenueTraffic(), r4 = f4.roads.find((r) => r.name === "Seventh Avenue"), c4 = r4.cars[0];
c4.x = 200; c4.v = 8;
const p4 = carPose(r4, c4);
const hit = hitAvenueCar({ x: p4.x + p4.fx * 1.5, z: p4.z + p4.fz * 1.5, y: 1.7 }, f4);
assert.ok(hit && Math.sign(hit.vz) === Math.sign(p4.fz), "knocked the way the car is going");
assert.equal(hitAvenueCar({ x: p4.x + p4.fz * 3, z: p4.z - p4.fx * 3, y: 1.7 }, f4), null, "the next lane over is safe");
assert.ok(avenueBlocks(f4, p4.x, p4.z + 0.5, 1.2));
assert.ok(!avenueBlocks(f4, p4.x + 30, p4.z + 30, 1.2));

// 47th Street's own traffic: "don't block the box" gates on green, red stops otherwise.
assert.ok(junctionStops47th(1).every((s) => s.gate != null));
const j47 = junctionStops47th(15);
assert.ok(j47.length >= 10 && j47.every((s) => Number.isFinite(s.x) && s.gate == null), `${j47.length / 2} junctions on 47th`);

// Amber: a car too close to stop when the light turns red carries on; one further back stops at the line.
{
  const near = [{ x: 0, dir: 1, v: 8.2 }], far = [{ x: 0, dir: 1, v: 8.2 }];
  for (let i = 0; i < 60; i++) { stepTraffic(near, 0.05, { stops: [{ x: 4.2, dir: 1 }], span: [-500, 500] }); stepTraffic(far, 0.05, { stops: [{ x: 30, dir: 1 }], span: [-500, 500] }); }
  assert.ok(near[0].x > 10, `the close car went through (${near[0].x.toFixed(1)})`);
  assert.ok(far[0].x < 30 - 2.45 && far[0].x > 20, `the far car stopped at the line (${far[0].x.toFixed(1)})`);
}
// A hard obstacle (you, or a parked car) is never driven through, even when it appears close in front.
{
  const cars = [{ x: 100, dir: 1, v: 8.2 }];
  for (let i = 0; i < 200; i++) stepTraffic(cars, 0.05, { stops: [{ x: 102.6, dir: 1, hard: true }], span: [0, 1000] });
  assert.ok(cars[0].x + 2.45 < 103.5 && cars[0].v < 0.3, `stopped against it (front at ${(cars[0].x + 2.45).toFixed(2)})`);
}
// A bus queues with its own length.
{
  const cars = [{ x: 20, dir: 1, v: 0, len: 4.95 }, { x: 0, dir: 1, v: 8.2, len: 10.6 }];
  for (let i = 0; i < 400; i++) stepTraffic(cars, 0.05, { stops: [{ x: 22.6, dir: 1, hard: true }], span: [-500, 500] });
  assert.ok(cars[0].x - cars[1].x > (4.95 + 10.6) / 2 + 2, `bus stops behind the car (${(cars[0].x - cars[1].x).toFixed(2)} m centre to centre)`);
}
// Don't block the box: on green, a car waits at the line if there's no room past the junction.
{
  const cars = [{ x: 0, dir: 1, v: 8.2 }, { x: 30, dir: 1, v: 0 }];
  for (let i = 0; i < 200; i++) stepTraffic(cars, 0.05, { stops: [{ x: 15, dir: 1, gate: 27 }, { x: 32.5, dir: 1, hard: true }], span: [-500, 500] });
  assert.ok(cars[0].x + 2.45 < 15.2, `held before the box (front at ${(cars[0].x + 2.45).toFixed(2)})`);
}

// The whole system for six minutes: every avenue car and 47th Street's own fleet (as city.js builds it), with
// real lengths and widths. No two vehicles may overlap anywhere.
{
  const fleet = createAvenueTraffic();
  const SPEC47 = [[-40, 1, "checker"], [20, -1, "sedan"], [-10, 1, "sedan"], [36, 1, "checker"], [-28, -1, "sedan"], [8, -1, "checker"], [-70, 1, "bus"], [70, -1, "van"], [110, 1, "sedan"], [140, -1, "checker"], [-60, -1, "sedan"], [90, 1, "checker"]];
  const f47 = SPEC47.map(([x, dir, kind]) => ({ x, dir, v: 8.2, len: LEN[kind], wid: kind === "bus" ? 2.5 : 1.85, kind }));
  const rects = () => [
    ...fleet.cars.filter(carShown).map((c) => { const p = carPose(c.road, c); return { x: p.x, z: p.z, fx: p.fx, fz: p.fz, hl: c.len / 2, hw: c.wid / 2, id: "a" + c.id, road: c.road.name, dir: c.dir }; }),
    ...f47.map((c, i) => ({ x: c.x, z: c.dir > 0 ? 21.35 : 24.55, fx: c.dir, fz: 0, hl: c.len / 2, hw: c.wid / 2, id: "s" + i, road: "47th Street", dir: c.dir })),
  ];
  const overlap = (a, b) => {
    for (const [ax, az] of [[a.fx, a.fz], [-a.fz, a.fx], [b.fx, b.fz], [-b.fz, b.fx]]) {
      const proj = (r) => Math.abs(r.fx * ax + r.fz * az) * r.hl + Math.abs(-r.fz * ax + r.fx * az) * r.hw;
      if (Math.abs((b.x - a.x) * ax + (b.z - a.z) * az) > proj(a) + proj(b) - 0.05) return false;
    }
    return true;
  };
  let t = 0, worst = null;
  for (let i = 0; i < 7200 && !worst; i++) {
    t += 0.05;
    stepAvenues(fleet, 0.05, t);
    const stops = junctionStops47th(t);
    stepTraffic(f47, 0.05, { stops, span: [-428, 294] });
    const grid = new Map();
    for (const r of rects()) {
      const k = `${Math.floor(r.x / 12)},${Math.floor(r.z / 12)}`;
      for (let gx = -1; gx <= 1; gx++) for (let gz = -1; gz <= 1; gz++) for (const o of grid.get(`${Math.floor(r.x / 12) + gx},${Math.floor(r.z / 12) + gz}`) || []) {
        // Cars wrap at the ends of their road (hidden there), so only judge pairs away from the 47th wrap points.
        if (o.id !== r.id && overlap(o, r) && Math.abs(r.x) < 420 && Math.abs(o.x) < 420) { worst = { t: +t.toFixed(2), a: o, b: r }; break; }
      }
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(r);
    }
  }
  assert.equal(worst, null, worst ? `${worst.a.road} (${worst.a.x.toFixed(1)}, ${worst.a.z.toFixed(1)}) overlaps ${worst.b.road} (${worst.b.x.toFixed(1)}, ${worst.b.z.toFixed(1)}) at t=${worst.t} (${signalPhase(worst.t)})` : "");
}

console.log(`avenues: ${roads.length} roads, ${fleet.cars.length} cars, signals, following, stopping for you, knockback`);
