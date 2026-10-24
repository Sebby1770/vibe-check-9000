import assert from "node:assert/strict";
import { createTrafficSound, stepTrafficSound, engineNote, VOICES } from "../js/vehicles/traffic-sound.js";
import { stepTraffic } from "../js/traffic.js";

// The engine note climbs with speed and drops at each gear change.
assert.equal(engineNote(0), 36);
assert.ok(engineNote(6.9) > engineNote(3));
assert.ok(engineNote(7.2) < engineNote(6.9), "a shift into second drops the note");
assert.ok(engineNote(26) > engineNote(16));
for (let v = 0; v < 30; v += 0.5) assert.ok(engineNote(v) >= 36 && engineNote(v) < 110);

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const L = { x: 0, z: 0 };
const car = (id, x, z, v = 8, extra = {}) => ({ id, x, z, v, kind: "sedan", ...extra });

// Nearest few get voices; a car keeps its slot while it stays near, and far cars are silent.
let s = createTrafficSound();
let cars = [car("a", 5, 0), car("b", 10, 0), car("c", 20, 0), car("d", 30, 0), car("e", 40, 0), car("far", 200, 0)];
let out = stepTrafficSound(s, cars, L, 1 / 60, { rand });
assert.equal(out.voices.length, VOICES);
assert.deepEqual(out.voices.map((v) => v.id).sort(), ["a", "b", "c", "d"]);
const slotOfB = out.voices.findIndex((v) => v.id === "b");
cars = [car("b", 9, 0), car("a", 60, 0), car("c", 19, 0), car("d", 29, 0), car("e", 39, 0)];
out = stepTrafficSound(s, cars, L, 1 / 60, { rand });
assert.equal(out.voices[slotOfB].id, "b", "b keeps its voice");
assert.ok(out.voices.some((v) => v?.id === "e"), "e takes the slot a left");
assert.ok(out.voices.find((v) => v.id === "b").approach > 30 - 1e-9, "closing at 60 m/s reads as approaching (clamped)");

// The car you drive always has a voice, however many cars are closer.
s = createTrafficSound();
out = stepTrafficSound(s, [car("x1", 1, 0), car("x2", 2, 0), car("x3", 3, 0), car("x4", 4, 0), car("you", 0, 0, 12, { own: true })], L, 1 / 60, { rand });
assert.equal(out.voices[0].id, "you");
assert.equal(out.voices[0].own, true);

// A car held up behind you honks after a moment, then cools off before honking again.
s = createTrafficSound();
s.ambient = 1e9;
let honks = [];
for (let i = 0; i < 60 * 4; i++) honks.push(...stepTrafficSound(s, [car("h", 6, 0, 0, { held: true })], L, 1 / 60, { rand }).honks);
assert.equal(honks.length, 1, `${honks.length} honks in 4 s`);
assert.equal(honks[0].at, "you");
for (let i = 0; i < 60 * 12; i++) honks.push(...stepTrafficSound(s, [car("h", 6, 0, 0, { held: true })], L, 1 / 60, { rand }).honks);
assert.ok(honks.length >= 2 && honks.length <= 3, `${honks.length} honks in 16 s`);
// Not held: no horn.
s = createTrafficSound();
s.ambient = 1e9;
honks = [];
for (let i = 0; i < 600; i++) honks.push(...stepTrafficSound(s, [car("h", 6, 0, 0)], L, 1 / 60, { rand }).honks);
assert.equal(honks.length, 0);

// The city honks now and then, only outdoors, from a car out of arm's reach.
s = createTrafficSound();
honks = [];
for (let i = 0; i < 60 * 180; i++) honks.push(...stepTrafficSound(s, [car("q", 30, 0), car("r", 5, 0)], L, 1 / 60, { rand }).honks);
assert.ok(honks.length >= 3 && honks.length <= 14, `${honks.length} city honks in 3 minutes`);
assert.ok(honks.every((h) => h.at === "city" && h.x === 30));
s = createTrafficSound();
honks = [];
for (let i = 0; i < 60 * 180; i++) honks.push(...stepTrafficSound(s, [car("q", 30, 0)], L, 1 / 60, { rand, outside: false }).honks);
assert.equal(honks.length, 0, "no city honks indoors");

// The traffic sim flags a car stopped behind a hard obstacle, and only that car.
const sims = [{ x: 0, dir: 1, v: 8 }, { x: -60, dir: 1, v: 8 }];
for (let i = 0; i < 600; i++) stepTraffic(sims, 1 / 60, { stops: [{ x: 14, dir: 1, hard: true }], span: [-200, 200] });
assert.equal(sims[0].held, true);
assert.ok(sims[0].v < 0.6);
const free = [{ x: 0, dir: 1, v: 8 }];
for (let i = 0; i < 600; i++) stepTraffic(free, 1 / 60, { stops: [{ x: 14, dir: 1 }], span: [-200, 200] });
assert.equal(free[0].held, false, "a red light is not a reason to honk");

console.log("traffic sound: engine gears, voice slots, your car first, held-up honks, city honks");
