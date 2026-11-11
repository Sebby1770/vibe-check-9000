/* Midnight Runs: street races through the city. Drive to a chequered flag, stop and press E, and after a
   three-count you race through a string of gates on real streets against the clock (and the ghost of your best).
   Medals come from each course's length; your best time, the splits at each gate and a ghost of the run are kept.
   Pure: runs-world.js draws the gates and the ghost, main.js runs the HUD and the money. */

const GATE_R = 9;         // metres: how close you must pass to a gate
const GHOST_STEP = 0.2;   // seconds between ghost samples
export const GHOST_MAX = 3 * 900;

// Cars face +x at yaw 0 and drive along (cos yaw, -sin yaw): yaw -π/2 heads uptown (+z), π heads west.
// start.half is half the roadway's width there (for the banner's poles).
export const COURSES = [
  {
    id: "block", name: "The Block", blurb: "Round the club: 47th, East Avenue, 49th, West Avenue and home.",
    start: { x: -44, z: 22.8, yaw: 0, half: 4.1 }, loop: true,
    gates: [[35, 22.8], [109, 22.8], [109, 70], [109, 96], [30, 96], [-50, 96], [-99, 96], [-99, 50], [-99, 22.8], [-44, 22.8]],
  },
  {
    id: "broadway", name: "Broadway Dash", blurb: "Up Broadway past Times Square, across 50th and back down West Avenue.",
    start: { x: -120, z: 22.8, yaw: Math.PI, half: 4.1 }, loop: true,
    gates: [[-180, 22.8], [-225.5, 22.8], [-244, 66], [-262, 108], [-280, 150], [-200, 150], [-120, 150], [-99, 150], [-99, 110], [-99, 50], [-99, 22.8], [-120, 22.8]],
  },
  {
    id: "river", name: "River Run", blurb: "From the Garment District to the end of Pier 47 Road.",
    start: { x: 60, z: -246, yaw: -Math.PI / 2, half: 6 }, loop: false,
    gates: [[60, -170], [60, -110], [60, -48], [120, -48], [187, -48], [187, -10], [187, 22.8], [240, 22.8], [296, 22.8], [362, 22.8]],
  },
];

export const courseById = (id) => COURSES.find((c) => c.id === id) || null;

/** Metres from the start through every gate. */
export function courseLength(course) {
  let len = 0, [px, pz] = [course.start.x, course.start.z];
  for (const [x, z] of course.gates) { len += Math.hypot(x - px, z - pz); px = x; pz = z; }
  return len;
}

const half = (s) => Math.round(s * 2) / 2;
/** Gold, silver and bronze times in seconds. Par is an average of 12 m/s (27 mph) with corners and traffic; a
    clean run on an empty dry road averages about 16. */
export function medalTimes(course) {
  const par = courseLength(course) / 12;
  return { gold: half(par * 0.85), silver: half(par), bronze: half(par * 1.3) };
}

export const MEDALS = ["", "bronze", "silver", "gold"];
/** 3 gold, 2 silver, 1 bronze, 0 none. */
export function medalFor(course, time) {
  const m = medalTimes(course);
  return time <= m.gold ? 3 : time <= m.silver ? 2 : time <= m.bronze ? 1 : 0;
}

/** Close enough to the flag to start (in a car, stopped or nearly). */
export function nearStart(course, pos, speed = 0) {
  return Math.hypot(pos.x - course.start.x, pos.z - course.start.z) < 9 && Math.abs(speed) < 3;
}

export function createRun(course, best = null) {
  return { course: course.id, countdown: 3, t: 0, next: 0, splits: [], ghost: [], sampleT: 0, done: false, best };
}

/** One frame. pos {x, z, yaw}. Returns {state, events}: tick (3, 2, 1), go, gate {index, delta}, finish {time, medal}. */
export function stepRun(state, { pos, dt = 0 }) {
  if (state.done || !(dt > 0)) return { state, events: [] };
  const course = courseById(state.course), events = [];
  if (state.countdown > 0) {
    const before = Math.ceil(state.countdown);
    const countdown = state.countdown - dt;
    if (countdown <= 0) {
      events.push({ type: "go" });
      const s = { ...state, countdown: 0, ghost: [round(pos.x), round(pos.z), round(pos.yaw ?? 0, 100)] };
      return { state: s, events };
    }
    if (Math.ceil(countdown) < before) events.push({ type: "tick", n: Math.ceil(countdown) });
    return { state: { ...state, countdown }, events };
  }
  const t = state.t + dt;
  let { next, splits, ghost, sampleT } = state;
  // The ghost: a pose every fifth of a second (three minutes of it at most).
  sampleT += dt;
  if (sampleT >= GHOST_STEP) {
    sampleT -= GHOST_STEP;
    if (ghost.length < GHOST_MAX) ghost = [...ghost, round(pos.x), round(pos.z), round(pos.yaw ?? 0, 100)];
  }
  const [gx, gz] = course.gates[next];
  if (Math.hypot(pos.x - gx, pos.z - gz) < GATE_R) {
    splits = [...splits, t];
    const bestSplit = state.best?.splits?.[next];
    events.push({ type: "gate", index: next, delta: Number.isFinite(bestSplit) ? t - bestSplit : null });
    next += 1;
    if (next >= course.gates.length) {
      const time = Math.round(t * 100) / 100;
      events.push({ type: "finish", time, medal: medalFor(course, time) });
      return { state: { ...state, t, next, splits, ghost, sampleT, done: true }, events };
    }
  }
  return { state: { ...state, t, next, splits, ghost, sampleT }, events };
}

function round(v, k = 10) { return Math.round(v * k) / k; }

/** Where the ghost was t seconds into its run: {x, z, yaw}, or null past its end. */
export function ghostAt(ghost, t) {
  const n = Math.floor((ghost?.length || 0) / 3);
  if (n < 2 || t < 0) return n ? { x: ghost[0], z: ghost[1], yaw: ghost[2] } : null;
  const f = t / GHOST_STEP, i = Math.floor(f);
  if (i >= n - 1) return null;
  const u = f - i, a = i * 3, b = a + 3;
  let dy = ghost[b + 2] - ghost[a + 2];
  if (dy > Math.PI) dy -= Math.PI * 2;
  if (dy < -Math.PI) dy += Math.PI * 2;
  return { x: ghost[a] + (ghost[b] - ghost[a]) * u, z: ghost[a + 1] + (ghost[b + 1] - ghost[a + 1]) * u, yaw: ghost[a + 2] + dy * u };
}

/** Clock text: 41.27 → "0:41.27". */
export function clock(t) {
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${m}:${s < 10 ? "0" : ""}${s.toFixed(2)}`;
}
