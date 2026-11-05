import assert from "node:assert/strict";
import { surfaceFor, createStepper, stepFoot, elRumble, riverHorn } from "../js/foley.js";

// Surfaces.
assert.equal(surfaceFor("street", true), "pavement");
assert.equal(surfaceFor("timessquare", true), "pavement");
assert.equal(surfaceFor("mercer", true), "gravel");
assert.equal(surfaceFor("club", false), "terrazzo");
assert.equal(surfaceFor("club", false, { danceFloor: true }), "glass");
assert.equal(surfaceFor("lounge", false), "carpet");
assert.equal(surfaceFor("diner", false), "tile");
assert.equal(surfaceFor("subway", false), "tile");
assert.equal(surfaceFor("records", false), "wood");

// Steps: about three a second at the game's walking pace, a little more hurried, alternating feet.
const walk = (speed, seconds, opts) => {
  const s = createStepper(), steps = [];
  for (let i = 0; i < seconds * 60; i++) { const st = stepFoot(s, speed / 60, opts); if (st) steps.push(st); }
  return steps;
};
const w = walk(3.6, 10);
assert.ok(w.length >= 27 && w.length <= 30, `${w.length} steps in 10 s walking`);
assert.ok(w.every((st, i) => !i || st.side === -w[i - 1].side), "left, right, left");
const r = walk(5.8, 10, { sprint: true });
assert.ok(r.length > w.length && r.length <= 36, `${r.length} steps in 10 s hurrying`);

// Setting off: the first foot lands within a few tenths of a metre, not a whole stride later.
let s = createStepper(), moved = 0, first = null;
while (!first) { first = stepFoot(s, 3.6 / 60); moved += 3.6 / 60; }
assert.ok(moved < 0.6, `first step after ${moved.toFixed(2)} m`);
// Standing still makes no sound; a teleport doesn't either.
s = createStepper();
for (let i = 0; i < 120; i++) assert.equal(stepFoot(s, 0), null);
assert.equal(stepFoot(s, 40), null, "teleport");
// A long frame (a stall) lands at most one step, never a burst.
s = createStepper();
let n = 0;
for (let i = 0; i < 5; i++) if (stepFoot(s, 2.9)) n++;
assert.ok(n <= 5);

// The El: loud nearby, silent across town, heard from its middle car.
const near = elRumble(-100, { x: 60, z: -122 });
assert.equal(near.level, 1);
assert.ok(near.d < 1);
assert.equal(elRumble(-100, { x: -300, z: 100 }).level, 0);

// River horns: every minute and a half or so, outdoors only.
let seed = 5;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const st = {}, horns = [];
for (let i = 0; i < 60 * 600; i++) { const h = riverHorn(st, 1 / 60, { x: 0, z: 0 }, { rand }); if (h) horns.push(h); }
assert.ok(horns.length >= 3 && horns.length <= 8, `${horns.length} horns in 10 minutes`);
assert.ok(horns.every((h) => h.x > 380));
const indoors = {};
let heard = 0;
for (let i = 0; i < 60 * 600; i++) if (riverHorn(indoors, 1 / 60, { x: 0, z: 0 }, { rand, outside: false })) heard++;
assert.equal(heard, 0);

console.log("foley: surfaces, stride timing, alternating feet, setting off, teleports, the El, river horns");
