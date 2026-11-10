/* Floor Fever: a rhythm round on the dance floor. Notes fall in four lanes (← ↓ ↑ →) on the club's own beat,
   on the beat and on the swung off-beat; hit them as they cross the line. The chart builds over sixteen bars from
   single quarter notes to eighths and chords, and ends on a four-lane chord. Combos multiply the score; the
   round is graded S to D. Pure: fever-ui.js draws it and takes the keys. Times are in seconds on one clock. */

export const LANES = 4;
export const WINDOWS = { perfect: 0.06, great: 0.11, good: 0.16 };
export const POINTS = { perfect: 300, great: 200, good: 100 };
export const GRADES = ["S", "A", "B", "C", "D"];
const CUT = { S: 0.92, A: 0.8, B: 0.65, C: 0.45 };
export const BEATS = 64;      // sixteen bars after a bar of count-in
const COUNT_IN = 4;

function rng(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The chart: [{beat, off, lane}] where beat counts from the round's first beat and off marks the off-beat. */
export function makeChart(seed = 1) {
  const r = rng(seed), notes = [];
  let lane = Math.floor(r() * LANES);
  const step = () => (lane = (lane + 1 + Math.floor(r() * (LANES - 1))) % LANES);
  const add = (beat, off, l) => notes.push({ beat, off, lane: l });
  for (let b = COUNT_IN; b < COUNT_IN + BEATS; b++) {
    const bar = Math.floor((b - COUNT_IN) / 4), inBar = (b - COUNT_IN) % 4;
    if (b === COUNT_IN + BEATS - 1) { for (let l = 0; l < LANES; l++) add(b, false, l); break; } // the big finish
    if (bar < 4) { add(b, false, step()); continue; }                                          // quarters
    if (bar < 8) { add(b, false, step()); if (inBar % 2 === 1) add(b, true, step()); continue; } // and some off-beats
    if (bar < 12) {                                                                              // eighths, chords on the bar
      if (inBar === 0) { const a = step(); add(b, false, a); add(b, false, (a + 2) % LANES); } else add(b, false, step());
      add(b, true, step());
      continue;
    }
    if (inBar % 2 === 0) { const a = step(); add(b, false, a); add(b, false, (a + 1 + Math.floor(r() * 3)) % LANES); } // the drop
    else add(b, false, step());
    add(b, true, step());
  }
  return notes;
}

/** Puts the chart on a clock: t0 is the time of the first beat, beatLen seconds per beat, swing the off-beat's
    share of the beat (the club's groove swings its eighths). */
export function schedule(chart, { t0, beatLen, swing = 0.54 }) {
  return chart.map((n, i) => ({ id: i, lane: n.lane, time: t0 + (n.beat + (n.off ? swing : 0)) * beatLen, result: null }));
}

export function createRound(notes) {
  return { notes, score: 0, combo: 0, maxCombo: 0, counts: { perfect: 0, great: 0, good: 0, miss: 0 } };
}

export const multiplier = (combo) => 1 + Math.min(3, Math.floor(combo / 10) * 0.5);

/** A key in `lane` at time `now`. Returns {state, result, note} (result null if nothing to hit). */
export function hit(state, lane, now) {
  let best = null, bestD = Infinity;
  for (const n of state.notes) {
    if (n.result || n.lane !== lane) continue;
    const d = Math.abs(now - n.time);
    if (d <= WINDOWS.good && d < bestD) { best = n; bestD = d; }
    if (n.time - now > WINDOWS.good) break;
  }
  if (!best) return { state, result: null, note: null };
  const result = bestD <= WINDOWS.perfect ? "perfect" : bestD <= WINDOWS.great ? "great" : "good";
  const combo = state.combo + 1;
  const notes = state.notes.map((n) => (n === best ? { ...n, result } : n));
  return {
    state: { ...state, notes, combo, maxCombo: Math.max(state.maxCombo, combo), score: state.score + POINTS[result] * multiplier(combo), counts: { ...state.counts, [result]: state.counts[result] + 1 } },
    result,
    note: best,
  };
}

/** Notes that have slid past the window without a hit become misses (and break the combo). */
export function sweep(state, now) {
  let missed = 0;
  const notes = state.notes.map((n) => {
    if (n.result || now - n.time <= WINDOWS.good) return n;
    missed++;
    return { ...n, result: "miss" };
  });
  if (!missed) return { state, missed };
  return { state: { ...state, notes, combo: 0, counts: { ...state.counts, miss: state.counts.miss + missed } }, missed };
}

/** The best score the chart allows: every note perfect, the combo never broken. */
export function maxScore(count) {
  let s = 0;
  for (let c = 1; c <= count; c++) s += POINTS.perfect * multiplier(c);
  return s;
}

export function grade(state) {
  const share = state.score / Math.max(1, maxScore(state.notes.length));
  return share >= CUT.S ? "S" : share >= CUT.A ? "A" : share >= CUT.B ? "B" : share >= CUT.C ? "C" : "D";
}

export const finished = (state) => state.notes.every((n) => n.result);
