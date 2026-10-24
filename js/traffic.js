/* Road bounds and car-hit rules. No renderer. */

export const ROAD = { minZ: 18.95, maxZ: 26.65 };

export function onRoad(x, z, y = 1.7) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  if (y < -0.4 || y > 3.6) return false;
  return z > ROAD.minZ && z < ROAD.maxZ;
}

export function hitByCar(player, cars = []) {
  if (!player || !onRoad(player.x, player.z, player.y)) return null;
  for (const car of cars) {
    const dir = car.userData?.moving || 0;
    if (!dir) continue;
    const dx = player.x - car.position.x;
    const dz = player.z - car.position.z;
    if (Math.abs(dz) > 0.98) continue;
    const along = dir > 0 ? dx : -dx;
    const half = car.userData?.spec?.length ? car.userData.spec.length / 2 : 2.15;
    if (along > -half + 0.03 && along < half + 0.03) {
      return {
        dir,
        vx: dir * 8.2,
        vz: player.z < 22.8 ? -3.1 : 3.1,
        vy: 7.6,
      };
    }
  }
  return null;
}

/* Car-following traffic along one street. Pure: cars are {x, dir, v, braking, len?} (len defaults to a 4.9 m
   sedan); stops are {x, dir} lines a car must not pass:
     - a signal (the default): a car too close to stop comfortably carries on through (amber) if it can clear
       the junction ({box: length}) before cross traffic moves ({clearBy: seconds}); otherwise it brakes hard;
     - {hard: true}: an obstacle (you, or a parked car): never driven through, even if it appears under a bumper;
     - {gate: exit}: a green junction: enter only if there is room for the whole car past `exit` and it can be
       through ({box}) before cross traffic moves ({clearBy}), so nobody is left inside the box.
   Speeds ease toward SPEED and fall away as the clearance ahead closes. Cars wrap at the ends of the street. */
export const SPEED = 8.2;
const GAP = 2.6;          // bumper-to-bumper gap when queued
const BRAKE_DIST = 16;
const lenOf = (c) => c.len || 4.9;

export function stepTraffic(cars, dt, { stops = [], span = [-96, 184] } = {}) {
  if (!(dt > 0)) return cars;
  for (const car of cars) {
    let aheadD = Infinity, aheadCar = null;
    for (const other of cars) {
      if (other === car || other.dir !== car.dir) continue;
      let d = (other.x - car.x) * car.dir;
      if (d < 0) d += span[1] - span[0];
      if (d > 0 && d < aheadD) { aheadD = d; aheadCar = other; }
    }
    const half = lenOf(car) / 2, v0 = car.v ?? SPEED;
    let clear = aheadCar ? aheadD - half - lenOf(aheadCar) / 2 - GAP : Infinity, emergency = false, hard = false, held = false;
    for (const stop of stops) {
      if (stop.dir !== car.dir) continue;
      const d = (stop.x - car.x) * car.dir, toLine = d - half - 0.15;
      if (stop.hard) {
        if (d > -half) { clear = Math.min(clear, toLine); if (toLine < 0.3) emergency = true; if (toLine < 4) held = true; }
        continue;
      }
      if (d < 0.5) continue;
      if (stop.gate != null) {
        if (toLine < -0.2) continue; // already in the junction
        // Enter only with room past the exit, and only if the whole car can be through before cross traffic moves.
        const room = aheadCar ? aheadD - lenOf(aheadCar) / 2 - (stop.gate - car.x) * car.dir : Infinity;
        const late = stop.clearBy != null && (toLine + (stop.box ?? 0) + lenOf(car) + 0.3) / Math.max(v0, 2.5) > stop.clearBy;
        if (room < lenOf(car) + 1 || late) {
          clear = Math.min(clear, toLine);
          if (late && v0 > 3 && (v0 * v0) / 28 > toLine) hard = true;
        }
        continue;
      }
      if (v0 > 3 && (v0 * v0) / 28 > toLine) {
        // Too close to stop comfortably: through on amber if it will clear the junction in time, else brake hard.
        if ((toLine + (stop.box ?? 0) + lenOf(car) + 0.3) / v0 < (stop.clearBy ?? Infinity)) continue;
        hard = true;
      }
      clear = Math.min(clear, toLine);
    }
    const want = SPEED * Math.max(0, Math.min(1, clear / BRAKE_DIST));
    // About to touch something solid (you, a parked car): stop dead rather than drive into it.
    const v = emergency ? 0 : v0 + Math.max((hard ? -32 : -14) * dt, Math.min(4.5 * dt, want - v0));
    car.braking = v < v0 - 0.02 || (v < 0.3 && want < 0.3);
    car.v = Math.max(0, v);
    // Stopped right behind you (or a car left in the road): the driver may lean on the horn.
    car.held = held && car.v < 0.6;
    car.x += car.v * car.dir * dt;
    if (car.dir > 0 && car.x > span[1]) car.x -= span[1] - span[0];
    if (car.dir < 0 && car.x < span[0]) car.x += span[1] - span[0];
  }
  return cars;
}
