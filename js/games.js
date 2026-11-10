/* Your record at the night's games: best Midnight Run times (with their splits and ghost), your best Floor Fever,
   and which of the Lost 45s you've found. Pure; saved with the rest of commerce (commerce.js normalizeCommerce).
   Rewards are paid once per new tier: each medal on each course, each Floor Fever grade, each record. */
import { COURSES, courseById, medalFor, GHOST_MAX } from "./runs.js";
import { GRADES } from "./fever.js";
import { RECORDS } from "./lost45s.js";

export const MEDAL_PAY = [0, 10, 20, 40];             // bronze, silver, gold
export const GRADE_PAY = { D: 0, C: 5, B: 15, A: 25, S: 50 };
export const RECORD_PAY = 15, COLLECTION_PAY = 100;

const num = (v, lo, hi) => (Number.isFinite(v) && v >= lo && v <= hi ? v : null);

export function normalizeGames(data = {}) {
  if (!data || typeof data !== "object" || Array.isArray(data)) data = {};
  const runs = {};
  for (const c of COURSES) {
    const r = data.runs?.[c.id];
    if (!r || typeof r !== "object") continue;
    const best = num(r.best, 1, 3600);
    if (best == null) continue;
    const splits = Array.isArray(r.splits) ? r.splits.filter((s) => Number.isFinite(s)).slice(0, c.gates.length) : [];
    const ghost = Array.isArray(r.ghost) ? r.ghost.filter((s) => Number.isFinite(s)).slice(0, GHOST_MAX) : [];
    runs[c.id] = { best, medal: Math.max(medalFor(c, best), Math.min(3, Math.max(0, Math.floor(r.medal) || 0))), splits, ghost: ghost.slice(0, ghost.length - (ghost.length % 3)) };
  }
  const f = data.fever && typeof data.fever === "object" ? data.fever : {};
  const fever = {
    best: Math.max(0, Math.floor(num(f.best, 0, 1e9) ?? 0)),
    grade: GRADES.includes(f.grade) ? f.grade : null,
    rounds: Math.max(0, Math.floor(num(f.rounds, 0, 1e7) ?? 0)),
  };
  const known = new Set(RECORDS.map((r) => r.id));
  const records = Array.isArray(data.records) ? [...new Set(data.records.filter((id) => known.has(id)))] : [];
  return { runs, fever, records };
}

/** A finished run. Keeps it if it's your best (splits and ghost too) and pays for any medal tier won for the first
    time on this course. Returns {games, best, medal, reward, newMedal}. */
export function recordRun(games, courseId, { time, splits = [], ghost = [] }) {
  const g = normalizeGames(games), course = courseById(courseId);
  if (!course || !(time > 0)) return { games: g, best: false, medal: 0, reward: 0, newMedal: 0 };
  const prev = g.runs[courseId], medal = medalFor(course, time), had = prev?.medal || 0;
  let reward = 0;
  for (let m = had + 1; m <= medal; m++) reward += MEDAL_PAY[m];
  const best = !prev || time < prev.best;
  const runs = { ...g.runs, [courseId]: best ? { best: time, medal: Math.max(medal, had), splits, ghost } : { ...prev, medal: Math.max(medal, had) } };
  return { games: { ...g, runs }, best, medal, reward, newMedal: medal > had ? medal : 0 };
}

/** A finished round of Floor Fever. Pays for each grade reached for the first time. */
export function recordFever(games, { score = 0, grade = "D" }) {
  // GRADES runs best-first (S … D): pay every tier from this grade up to the best you had before.
  const g = normalizeGames(games), was = g.fever.grade ? GRADES.indexOf(g.fever.grade) : GRADES.length;
  const now = GRADES.indexOf(grade);
  let reward = 0;
  for (let i = Math.max(0, now); now >= 0 && i < was; i++) reward += GRADE_PAY[GRADES[i]];
  const best = Math.floor(score) > g.fever.best;
  const fever = { best: Math.max(g.fever.best, Math.floor(score)), grade: now >= 0 && now < was ? grade : g.fever.grade, rounds: g.fever.rounds + 1 };
  return { games: { ...g, fever }, best, reward, newGrade: now >= 0 && now < was };
}

/** Picking up one of the Lost 45s. */
export function collectRecord(games, id) {
  const g = normalizeGames(games);
  if (!RECORDS.some((r) => r.id === id) || g.records.includes(id)) return { games: g, reward: 0, complete: false, fresh: false };
  const records = [...g.records, id], complete = records.length === RECORDS.length;
  return { games: { ...g, records }, reward: RECORD_PAY + (complete ? COLLECTION_PAY : 0), complete, fresh: true };
}
