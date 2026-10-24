/* Which cars you can hear, and when somebody leans on the horn. Pure: no WebAudio; audio.js voices the result.
   The nearest few cars each get an engine voice (the car you drive always gets the first), held by the same car
   while it stays near so nothing jumps; each voice carries how fast that car is closing on you, for a touch of
   Doppler as it passes. A car stopped dead behind you in the road honks after a moment, and now and then
   somebody down the block honks at nobody in particular. */
export const VOICES = 4;
const HEAR = 55, AMBIENT_RANGE = 90, HOLD_HONK = 1.3, CAR_COOL = 6, GAP = 0.8;

export function createTrafficSound() {
  return { slots: Array(VOICES).fill(null), dist: new Map(), held: new Map(), cool: new Map(), ambient: 10, gap: 0 };
}

/** Engine firing note in Hz for a speed in m/s: a three-speed column shift, so the note climbs, drops a gear, climbs. */
export function engineNote(v) {
  v = Math.abs(v);
  const top = [7, 15, 27], base = [36, 50, 58], span = [62, 48, 40];
  let g = 0;
  while (g < 2 && v > top[g]) g++;
  const lo = g ? top[g - 1] : 0;
  return base[g] + span[g] * Math.min(1, (v - lo) / (top[g] - lo));
}

/** cars: [{id, x, z, v, kind, held?, own?}]; listener {x, z}. Returns {voices: VOICES slots (null = silent), honks}. */
export function stepTrafficSound(state, cars, listener, dt, { rand = Math.random, outside = true } = {}) {
  const near = [], around = [];
  for (const c of cars) {
    const d = Math.hypot(c.x - listener.x, c.z - listener.z);
    if (c.own || d < HEAR) near.push({ c, d });
    if (!c.own && d > 12 && d < AMBIENT_RANGE) around.push(c);
  }
  near.sort((a, b) => (b.c.own ? 1 : 0) - (a.c.own ? 1 : 0) || a.d - b.d);
  const keep = near.slice(0, VOICES), ids = new Set(keep.map((n) => n.c.id));
  const { slots } = state;
  for (let i = 0; i < slots.length; i++) if (slots[i] != null && !ids.has(slots[i])) slots[i] = null;
  for (const { c } of keep) if (!slots.includes(c.id)) slots[slots.indexOf(null)] = c.id;
  const byId = new Map(keep.map((n) => [n.c.id, n]));
  const voices = slots.map((id) => {
    if (id == null) return null;
    const { c, d } = byId.get(id), was = state.dist.get(id);
    const approach = was == null || !(dt > 0) ? 0 : Math.max(-30, Math.min(30, (was - d) / dt));
    state.dist.set(id, d);
    return { id, x: c.x, z: c.z, v: c.v, kind: c.kind, own: !!c.own, d, approach };
  });
  for (const id of state.dist.keys()) if (!ids.has(id)) state.dist.delete(id);

  const honks = [];
  state.gap = Math.max(0, state.gap - dt);
  for (const [id, left] of state.cool) left - dt <= 0 ? state.cool.delete(id) : state.cool.set(id, left - dt);
  // Held up by you: a beat, then the horn; again if you're still there once they've cooled off.
  const stillHeld = new Set();
  for (const { c, d } of near) {
    if (c.own || !c.held || d > 45) continue;
    stillHeld.add(c.id);
    const t = (state.held.get(c.id) || 0) + dt;
    state.held.set(c.id, t);
    if (t > HOLD_HONK && !state.cool.has(c.id) && state.gap <= 0) {
      honks.push({ x: c.x, z: c.z, kind: c.kind, long: rand() < 0.5, double: rand() < 0.6, at: "you" });
      state.cool.set(c.id, CAR_COOL + rand() * 4);
      state.held.set(c.id, 0);
      state.gap = GAP;
    }
  }
  for (const id of state.held.keys()) if (!stillHeld.has(id)) state.held.delete(id);
  // The city: somebody honks somewhere, every half a minute or so, only when you're out in it.
  state.ambient -= dt;
  if (state.ambient <= 0) {
    state.ambient = 14 + rand() * 30;
    if (outside && around.length && state.gap <= 0) {
      const c = around[Math.floor(rand() * around.length)];
      honks.push({ x: c.x, z: c.z, kind: c.kind, long: rand() < 0.25, double: rand() < 0.35, at: "city" });
      state.gap = GAP;
    }
  }
  return { voices, honks };
}
