/* Your footsteps and the city around you. How far you've walked decides when a foot lands, where you are decides
   what it lands on; the El and the river decide what you hear in the distance. Pure: audio.js voices it all. */
const CARPET = new Set(["lounge", "hotel", "suite", "rivoli"]);
const TILE = new Set(["diner", "subway"]);
const GRAVEL = new Set(["mercer", "hawthorne"]);
const STRIDE = 1.25, SPRINT_STRIDE = 1.7; // metres a foot covers at the game's brisk walk (3.6 m/s) and hurry (5.8 m/s)

/** What a foot lands on: wet pavement, park gravel, the club's terrazzo or glass floor, carpet, tile or boards. */
export function surfaceFor(zone, outside, { danceFloor = false } = {}) {
  if (outside) return GRAVEL.has(zone) ? "gravel" : "pavement";
  if (zone === "club") return danceFloor ? "glass" : "terrazzo";
  if (CARPET.has(zone)) return "carpet";
  if (TILE.has(zone)) return "tile";
  return "wood";
}

export function createStepper() {
  return { dist: STRIDE * 0.6, side: 1 };
}

/** moved: metres covered on the ground this frame. Returns {side} when a foot lands, else null. Standing still
    primes the next step to land soon after you set off; a jump of more than 3 m (a teleport, a ride) is ignored. */
export function stepFoot(state, moved, { sprint = false } = {}) {
  if (!(moved > 0.0005) || moved > 3) {
    state.dist = Math.max(state.dist, STRIDE * 0.6);
    return null;
  }
  state.dist += moved;
  const stride = sprint ? SPRINT_STRIDE : STRIDE;
  if (state.dist < stride) return null;
  state.dist = Math.min(state.dist - stride, stride * 0.5);
  state.side = -state.side;
  return { side: state.side };
}

/** The El train's rumble: where it is (its middle car) and how loud, for a train at `trainZ` (its lead car). */
export function elRumble(trainZ, listener, { x = 60, y = 8.45, length = 44 } = {}) {
  const z = trainZ - length / 2, d = Math.hypot(listener.x - x, listener.z - z);
  return { x, y, z, d, level: d > 220 ? 0 : 1 };
}

/** Ships on the North River sound their horns now and then; returns a horn {x, z} when one does. */
export function riverHorn(state, dt, listener, { outside = true, rand = Math.random, riverX = 380 } = {}) {
  state.wait = (state.wait ?? 40 + rand() * 60) - dt;
  if (state.wait > 0) return null;
  state.wait = 80 + rand() * 90;
  if (!outside) return null;
  return { x: riverX + 70, z: listener.z + (rand() - 0.5) * 240, long: rand() < 0.5 };
}
