/* The night's weather. Each night has its own sky, seeded by the date: spells of dry, drizzle, rain and the odd
   downpour, each holding for about a game hour (under four real minutes) and drifting into the next. It's always
   raining when the night begins (the title says so), and the streets stay wet for a good while after the rain
   stops. Pure: render/weather.js draws it, audio.js hears it, drive.js feels it. */
import { NIGHT_START } from "./night.js";

export const SPELL = 3600;          // game seconds per spell
const HOLD = 0.7;                   // share of a spell spent at its own level before drifting to the next
const LEVELS = [0, 0.25, 0.6, 1];   // dry, drizzle, rain, downpour
const DRY_TIME = 5400;              // game seconds for soaked streets to dry (about six real minutes)

function hash(n, seed) {
  let h = (Math.imul(n | 0, 0x27d4eb2d) ^ Math.imul(seed | 0, 0x165667b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The level a spell settles at. The spells around the start of the night always rain. */
function spellLevel(k, seed) {
  const r = hash(k, seed);
  const level = r < 0.28 ? LEVELS[0] : r < 0.58 ? LEVELS[1] : r < 0.88 ? LEVELS[2] : LEVELS[3];
  const start = Math.floor(NIGHT_START / SPELL);
  return k >= start - 1 && k <= start ? Math.max(level, LEVELS[2]) : level;
}

const ease = (x) => x * x * (3 - 2 * x);

/** How hard it's raining (0–1) at a game time. */
export function rainAt(seconds, seed = 0) {
  const k = Math.floor(seconds / SPELL), f = seconds / SPELL - k;
  const a = spellLevel(k, seed);
  if (f < HOLD) return a;
  return a + (spellLevel(k + 1, seed) - a) * ease((f - HOLD) / (1 - HOLD));
}

/** How wet the streets are (0–1): soaked by recent rain, drying slowly once it stops. */
export function wetAt(seconds, seed = 0) {
  let wet = 0;
  for (let back = 0; back <= DRY_TIME * 1.5; back += 300) {
    const soak = Math.min(1, rainAt(seconds - back, seed) * 2.2) * Math.max(0, 1 - back / DRY_TIME);
    if (soak > wet) wet = soak;
  }
  return wet;
}

export function weatherLabel(rain, wet) {
  if (rain < 0.08) return wet > 0.3 ? "WET STREETS" : "CLEAR";
  if (rain < 0.4) return "DRIZZLE";
  return rain < 0.8 ? "RAIN" : "DOWNPOUR";
}

/** Everything the city needs to know about the weather at a game time. storm (0–1) drives lightning. */
export function weatherAt(seconds, seed = 0) {
  const rain = rainAt(seconds, seed), wet = wetAt(seconds, seed);
  return { rain, wet, storm: Math.max(0, (rain - 0.8) / 0.2), label: weatherLabel(rain, wet) };
}

/** Lightning: the chance of a strike in a short step, given how stormy it is (about one every 25 s in a full storm). */
export function strikeChance(storm, dt) {
  return storm > 0 ? 1 - Math.exp(-dt * storm / 25) : 0;
}
