import assert from "node:assert/strict";
import { gripLimit, brakeGrip, slide } from "../js/vehicles/grip.js";

// A wet street holds less, in corners and under braking.
assert.ok(gripLimit(1) < gripLimit(0) * 0.65);
assert.ok(brakeGrip(1) < brakeGrip(0) && brakeGrip(1) > 0.5);
assert.equal(gripLimit(-3), gripLimit(0), "wetness is clamped");

// Gentle driving: no slide, the car turns as steered.
let s = slide({ speed: 8, yawRate: 0.3 });
assert.equal(s.skid, 0);
assert.equal(s.yawScale, 1);

// The same corner, fast: past the limit the car runs wide and the tyres slide.
s = slide({ speed: 20, yawRate: 0.8 });
assert.ok(s.yawScale < 1 && s.yawScale > 0.4, `yawScale ${s.yawScale}`);
assert.ok(s.skid > 0.9);
// ...and wider still in the wet, with the slide starting sooner.
const dry = slide({ speed: 14, yawRate: 0.55 }), wet = slide({ speed: 14, yawRate: 0.55, wet: 1 });
assert.ok(wet.yawScale < dry.yawScale, "runs wider in the rain");
assert.ok(wet.skid > dry.skid, "slides sooner in the rain");

// Handbrake and hard braking slide too; crawling with the handbrake on doesn't.
assert.ok(slide({ speed: 12, handbrake: true }).skid > 0.8);
assert.equal(slide({ speed: 3, handbrake: true }).skid, 0);
assert.ok(slide({ speed: 20, braking: true }).skid > 0.5);
assert.ok(slide({ speed: 14, braking: true, wet: 1 }).skid > slide({ speed: 14, braking: true }).skid);
assert.equal(slide({ speed: 6, braking: true }).skid, 0);

// Always in range.
for (let v = -10; v <= 26; v += 2) for (let y = -2; y <= 2; y += 0.25) for (const w of [0, 0.5, 1]) {
  const r = slide({ speed: v, yawRate: y, wet: w, handbrake: v > 10, braking: y > 1 });
  assert.ok(r.skid >= 0 && r.skid <= 1 && r.yawScale > 0 && r.yawScale <= 1);
}

console.log("grip: wet streets hold less, fast corners run wide and slide, handbrake and hard braking");
