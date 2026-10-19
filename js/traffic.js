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

/* Car-following traffic along one street. Pure: cars are {x, dir, v, braking}; stops are {x, dir} lines a
   car must not pass (a red light, a pedestrian on the crossing). Speeds ease toward SPEED and fall away
   smoothly as the gap to whatever is ahead closes. Cars wrap at the ends of the street. */
export const SPEED = 8.2;
const MIN_GAP = 7.5;
const BRAKE_DIST = 16;

export function stepTraffic(cars, dt, { stops = [], span = [-96, 184] } = {}) {
  if (!(dt > 0)) return cars;
  for (const car of cars) {
    let ahead = Infinity;
    for (const other of cars) {
      if (other === car || other.dir !== car.dir) continue;
      let d = (other.x - car.x) * car.dir;
      if (d < 0) d += span[1] - span[0];
      if (d > 0 && d < ahead) ahead = d;
    }
    for (const stop of stops) {
      if (stop.dir !== car.dir) continue;
      const d = (stop.x - car.x) * car.dir;
      if (d > 0.5 && d - 2.6 < ahead) ahead = d - 2.6 + MIN_GAP;
    }
    const want = SPEED * Math.max(0, Math.min(1, (ahead - MIN_GAP) / BRAKE_DIST));
    const v0 = car.v ?? SPEED;
    const v = v0 + Math.max(-14 * dt, Math.min(4.5 * dt, want - v0));
    car.braking = v < v0 - 0.02 || (v < 0.3 && want < 0.3);
    car.v = Math.max(0, v);
    car.x += car.v * car.dir * dt;
    if (car.dir > 0 && car.x > span[1]) car.x -= span[1] - span[0];
    if (car.dir < 0 && car.x < span[0]) car.x += span[1] - span[0];
  }
  return cars;
}
