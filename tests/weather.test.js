import assert from "node:assert/strict";
import { rainAt, wetAt, weatherAt, weatherLabel, strikeChance, SPELL } from "../js/weather.js";
import { NIGHT_START, GAME_PER_REAL, dayHash } from "../js/night.js";

const seeds = Array.from({ length: 40 }, (_, i) => dayHash(`2026-11-${String(i + 1).padStart(2, "0")}`));

// It's raining when the night begins, every night (the title promises it).
for (const s of seeds) {
  assert.ok(rainAt(NIGHT_START, s) >= 0.6, "raining at 10 PM");
  assert.ok(rainAt(NIGHT_START + 0.6 * 3600, s) >= 0.6, "and through the title shot at 10:36");
}

// Over many nights: every kind of weather turns up, and none of it all the time.
const counts = { CLEAR: 0, "WET STREETS": 0, DRIZZLE: 0, RAIN: 0, DOWNPOUR: 0 };
for (const s of seeds) for (let t = NIGHT_START; t < NIGHT_START + 24 * 3600; t += 600) counts[weatherAt(t, s).label]++;
const total = Object.values(counts).reduce((a, b) => a + b, 0);
for (const [label, n] of Object.entries(counts)) assert.ok(n / total > 0.03 && n / total < 0.6, `${label}: ${(100 * n / total).toFixed(1)}%`);

// Nights differ.
const profile = (s) => Array.from({ length: 12 }, (_, i) => rainAt(NIGHT_START + 3 * 3600 + i * SPELL, s).toFixed(2)).join(",");
assert.ok(new Set(seeds.map(profile)).size > 30, "each night has its own sky");

// Smooth: no jumps between frames, even at the hottest point of a transition.
for (const s of seeds.slice(0, 8)) {
  for (let t = NIGHT_START; t < NIGHT_START + 12 * 3600; t += GAME_PER_REAL / 60) {
    const step = Math.abs(rainAt(t + GAME_PER_REAL / 60, s) - rainAt(t, s));
    assert.ok(step < 0.002, `jump of ${step} at ${t}`);
  }
}

// Each spell holds for real minutes, not seconds.
for (const s of seeds.slice(0, 5)) {
  const a = rainAt(NIGHT_START + 5 * SPELL, s), b = rainAt(NIGHT_START + 5 * SPELL + 0.6 * SPELL, s);
  assert.equal(a, b, "steady for most of a spell");
}
assert.ok(SPELL / GAME_PER_REAL > 180, "a spell lasts over three real minutes");

// The streets: soaked while it rains, still wet just after, dry again long after.
let found = false;
for (const s of seeds) {
  for (let t = NIGHT_START + SPELL; t < NIGHT_START + 30 * SPELL && !found; t += 300) {
    // A spell drifts to the next over about 1,080 game seconds, so look back past the drift.
    if (rainAt(t - 1200, s) >= 0.6 && rainAt(t, s) === 0) {
      found = true;
      assert.ok(wetAt(t, s) > 0.6, "still wet just after the rain stops");
      const later = t + 2 * SPELL;
      if (rainAt(later, s) === 0 && Math.max(...Array.from({ length: 30 }, (_, i) => rainAt(later - i * 300, s))) === 0) assert.ok(wetAt(later, s) < 0.05, "dry after a long dry spell");
    }
  }
}
assert.ok(found, "a rain-to-dry change happens");
for (const s of seeds) for (let t = NIGHT_START; t < NIGHT_START + 6 * 3600; t += 900) {
  const w = weatherAt(t, s);
  assert.ok(w.wet >= Math.min(1, w.rain * 2.2) - 1e-9, "the streets are at least as wet as the rain makes them");
  assert.ok(w.wet >= 0 && w.wet <= 1 && w.rain >= 0 && w.rain <= 1 && w.storm >= 0 && w.storm <= 1);
}

// Labels and lightning.
assert.equal(weatherLabel(0, 0), "CLEAR");
assert.equal(weatherLabel(0, 0.8), "WET STREETS");
assert.equal(weatherLabel(0.25, 1), "DRIZZLE");
assert.equal(weatherLabel(0.6, 1), "RAIN");
assert.equal(weatherLabel(1, 1), "DOWNPOUR");
assert.equal(strikeChance(0, 1), 0);
let seed = 9, strikes = 0;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let i = 0; i < 60 * 600; i++) if (rand() < strikeChance(1, 1 / 60)) strikes++;
assert.ok(strikes >= 12 && strikes <= 40, `${strikes} strikes in 10 minutes of full storm`);

console.log(`weather: rain at nightfall, every kind of night (${Object.entries(counts).map(([k, v]) => `${k.toLowerCase()} ${Math.round(100 * v / total)}%`).join(", ")}), smooth, wet streets dry slowly, lightning`);
