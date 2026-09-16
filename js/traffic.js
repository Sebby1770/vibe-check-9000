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
    if (along > -2.12 && along < 2.18) {
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
