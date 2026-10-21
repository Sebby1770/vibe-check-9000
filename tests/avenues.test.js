import assert from "node:assert/strict";
import { avenueRoads, createAvenueTraffic, stepAvenues, carPose, carShown, signalPhase, hitAvenueCar, avenueBlocks, junctionStops47th, mergeRoads, CYCLE } from "../js/openworld/avenue-sim.js";
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

// Signals alternate, with all-red between.
assert.equal(signalPhase(1), "x");
assert.equal(signalPhase(10), "red");
assert.equal(signalPhase(15), "z");
assert.equal(signalPhase(21), "red");
assert.equal(signalPhase(1 + CYCLE * 3), "x");

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
  const before = car.dir > 0 ? j.along - j.half - car.x : car.x - (j.along + j.half);
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

// 47th Street's own traffic stops at the shared junctions when the avenues have green.
assert.equal(junctionStops47th(1).length, 0);
const j47 = junctionStops47th(15);
assert.ok(j47.length >= 10 && j47.every((s) => Number.isFinite(s.x)), `${j47.length / 2} junctions on 47th`);

console.log(`avenues: ${roads.length} roads, ${fleet.cars.length} cars, signals, following, stopping for you, knockback`);
