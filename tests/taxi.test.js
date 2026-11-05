import assert from "node:assert/strict";
import { kerbs, destinations, createTaxi, toggleTaxi, stepTaxi, taxiTarget, farePay, streetDistance } from "../js/taxi/taxi.js";
import { buildColliders } from "../js/zones.js";
import { OW_ROADS } from "../js/openworld/layout.js";
import { BLOCK_ROADS } from "../js/district-layout.js";

// Kerbs: plenty, on the pavement (off the asphalt, out of buildings), with the cab's stopping point on the road.
const K = kerbs();
assert.ok(K.length > 150, `${K.length} kerbs`);
const { boxes } = buildColliders([]);
const solid = boxes.filter((b) => b.minY < 1.7 && b.maxY > 0.3);
const seg = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(px - ax - t * dx, pz - az - t * dz); };
const roads = [...OW_ROADS, ...BLOCK_ROADS];
let blocked = 0;
for (const k of K) {
  assert.ok(roads.every((r) => seg(k.x, k.z, r.a, r.b) > r.width / 2 - 0.01), `kerb ${k.x.toFixed(1)},${k.z.toFixed(1)} is on the asphalt`);
  assert.ok(roads.some((r) => seg(k.cabX, k.cabZ, r.a, r.b) < r.width / 2), "the cab stops on the road");
  if (solid.some((b) => k.x > b.minX - 0.3 && k.x < b.maxX + 0.3 && k.z > b.minZ - 0.3 && k.z < b.maxZ + 0.3)) blocked++;
}
assert.ok(blocked / K.length < 0.08, `${blocked} of ${K.length} kerbs stand in something solid`);

const D = destinations();
assert.ok(D.length >= 12, `${D.length} destinations`);
assert.ok(D.some((d) => d.name === "Times Square") && D.some((d) => d.name === "Velvet Tuesday"));

// Pay: a flag-drop, more for longer rides, a tip for quick ones, always whole dollars.
assert.equal(farePay(0, 999), 3);
assert.ok(farePay(600, 200) > farePay(300, 100));
assert.ok(farePay(500, 40) > farePay(500, 400), "a quick ride earns a tip");
for (const [d, s] of [[200, 30], [450, 80], [900, 300]]) assert.ok(Number.isSafeInteger(farePay(d, s)));

// A whole fare: light on, drive to the hail, stop, drive to the destination, stop, get paid, next fare appears.
let seed = 3;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
let s = createTaxi(), pos = { x: 0, z: 22.8 }, events;
({ state: s, events } = toggleTaxi(s, pos, rand));
assert.equal(s.stage, "pickup");
assert.equal(events[0].type, "hail");
const pickup = s.fare.pickup;
assert.ok(streetDistance(pickup, pos) > 50);
assert.equal(taxiTarget(s, pos).id, "taxi-pickup");
// Rolling past doesn't board them; stopping beside them does.
({ state: s, events } = stepTaxi(s, { pos: { x: pickup.cabX, z: pickup.cabZ }, speed: 6, dt: 0.1, rand }));
assert.equal(s.stage, "pickup");
({ state: s, events } = stepTaxi(s, { pos: { x: pickup.cabX, z: pickup.cabZ }, speed: 0.4, dt: 0.1, rand }));
assert.equal(s.stage, "ride");
assert.equal(events[0].type, "board");
assert.ok(events[0].line.includes(s.fare.dest.name));
assert.ok(s.fare.distance > 150);
const dest = s.fare.dest;
assert.match(taxiTarget(s, pos).hud, /METER \$\d+/);
({ state: s, events } = stepTaxi(s, { pos: { x: dest.kerb.cabX, z: dest.kerb.cabZ }, speed: 0.2, dt: 60, rand }));
assert.equal(events[0].type, "drop");
assert.ok(events[0].pay >= 3);
assert.equal(s.fares, 1);
assert.equal(s.earned, events[0].pay);
assert.equal(events[1].type, "hail", "the next fare is already waiting");

// Leave a fare waiting too long and they give up, but another hails.
const before = s.fare.pickup;
({ state: s, events } = stepTaxi(s, { pos: { x: 9999, z: 9999 }, speed: 0, dt: 130, rand }));
assert.equal(events[0].type, "gave-up");
assert.equal(s.stage, "pickup");
assert.notDeepEqual(s.fare.pickup, before);

// Light off mid-ride drops everything.
({ state: s } = stepTaxi(s, { pos: { x: s.fare.pickup.cabX, z: s.fare.pickup.cabZ }, speed: 0, dt: 0.1, rand }));
({ state: s, events } = toggleTaxi(s, pos, rand));
assert.equal(s.on, false);
assert.equal(events[0].hadPassenger, true);
assert.equal(taxiTarget(s, pos), null);

console.log(`taxi: ${K.length} kerbs, ${D.length} destinations, pick-up, ride, pay, tips, patience`);

// Ride chatter: small talk every 20 s or so (never the same line twice in a ride), a word when passing a landmark,
// and directions near the end.
{
  const { rideChatter } = await import("../js/taxi/taxi.js");
  let st = createTaxi();
  ({ state: st } = toggleTaxi(st, { x: 0, z: 22.8 }, rand));
  const pk = st.fare.pickup;
  ({ state: st } = stepTaxi(st, { pos: { x: pk.cabX, z: pk.cabZ }, speed: 0, dt: 0.1, rand }));
  assert.equal(st.stage, "ride");
  const far = { x: 99999, z: 99999 }, lines = [];
  for (let i = 0; i < 60 * 120; i++) { const l = rideChatter(st, { pos: far, dt: 1 / 60, rand }); if (l) lines.push(l); }
  assert.ok(lines.length >= 3 && lines.length <= 7, `${lines.length} lines in two minutes`);
  assert.equal(new Set(lines).size, lines.length, "no repeats");
  // Passing a landmark that isn't where they're going.
  const other = destinations().find((d) => d !== st.fare.dest && Math.hypot(d.x - st.fare.dest.kerb.x, d.z - st.fare.dest.kerb.z) > 200);
  const passing = rideChatter(st, { pos: { x: other.x, z: other.z }, dt: 6, rand });
  assert.ok(passing.includes(other.name), passing);
  // Driving straight past a landmark at 15 m/s draws a remark whatever the small-talk timer says, and no
  // remark is made the same way twice in a ride.
  const lm = destinations().filter((d) => d !== st.fare.dest);
  for (let trial = 0; trial < 20; trial++) {
    let ride = createTaxi();
    ({ state: ride } = toggleTaxi(ride, { x: 0, z: 22.8 }, rand));
    const p0 = ride.fare.pickup;
    ({ state: ride } = stepTaxi(ride, { pos: { x: p0.cabX, z: p0.cabZ }, speed: 0, dt: 0.1, rand }));
    const gap = (d) => Math.min(...destinations().filter((o) => o !== d).map((o) => Math.hypot(o.x - d.x, o.z - d.z)));
    const target = lm.filter((d) => d !== ride.fare.dest && Math.hypot(d.x - ride.fare.dest.kerb.x, d.z - ride.fare.dest.kerb.z) > 200).sort((a, b) => gap(b) - gap(a))[0];
    for (let i = 0; i < 60 * (2 + trial); i++) rideChatter(ride, { pos: far, dt: 1 / 60, rand }); // a random timer phase
    const heard = [];
    for (let s = -60; s <= 60; s += 15 / 60) { const l = rideChatter(ride, { pos: { x: target.x + s, z: target.z + 15 }, dt: 1 / 60, rand }); if (l) heard.push(l); }
    assert.ok(heard.some((l) => l.includes(target.name)), `trial ${trial}: ${JSON.stringify(heard)}`);
  }
  const forms = [];
  let tour = createTaxi();
  ({ state: tour } = toggleTaxi(tour, { x: 0, z: 22.8 }, rand));
  ({ state: tour } = stepTaxi(tour, { pos: { x: tour.fare.pickup.cabX, z: tour.fare.pickup.cabZ }, speed: 0, dt: 0.1, rand }));
  for (const d of destinations()) {
    if (d === tour.fare.dest) continue;
    const l = rideChatter(tour, { pos: { x: d.x, z: d.z }, dt: 6, rand });
    if (l && l.includes(d.name)) forms.push(l.replace(d.name, "@"));
  }
  assert.ok(forms.length >= 2 && forms.length <= 3, `${forms.length} landmark remarks`);
  assert.equal(new Set(forms).size, forms.length, "each remark made a different way");
  // Getting close.
  const nearLine = rideChatter(st, { pos: { x: st.fare.dest.kerb.x + 60, z: st.fare.dest.kerb.z }, dt: 0.1, rand });
  assert.ok(nearLine && !nearLine.includes(other.name), nearLine);
  assert.equal(rideChatter(createTaxi(), { pos: far, dt: 60, rand }), null, "no talk without a passenger");
  console.log("taxi: ride chatter, landmarks, directions near the end");
}
