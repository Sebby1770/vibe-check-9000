/* Draws the avenue traffic. All 184 cars are simulated (avenue-sim.js, cheap 1D maths); only a pool of
   period cars is drawn, each lent to one of the cars nearest you. A pool car keeps its sim car until that
   car goes out of range, so nothing changes shape in front of you. */
import { buildVehicle, animateVehicle } from "../vehicles/models.js";
import { createAvenueTraffic, stepAvenues, carPose, carShown, hitAvenueCar, avenueBlocks } from "./avenue-sim.js";

const POOL = 26;
const RANGE = 170;
const COLORS = [0x2a3a5a, 0x6a5030, 0x7a1c1c, 0x1e3c34, 0xc8b890, 0x3a3a44, 0x5a2a4a, 0x8a7a5a, 0x24303c, 0x6a6a72];

export function buildAvenues(scene) {
  const fleet = createAvenueTraffic();
  // The pool mirrors the fleet's mix of kinds, so most cars keep a matching model.
  const pool = [];
  for (let i = 0; i < POOL; i++) {
    const kind = ["sedan", "checker", "sedan", "checker", "sedan", "van", "sedan", "checker", "bus", "sedan"][i % 10];
    const car = buildVehicle(kind, { color: COLORS[i % COLORS.length], driver: true, seed: 100 + i });
    car.visible = false;
    car.userData.sim = null;
    scene.add(car);
    pool.push(car);
  }
  const sizeOf = (sim) => sim.mesh?.userData.spec || (sim.kind === "bus" ? { length: 10.5, width: 2.5 } : { length: 4.9, width: 1.85 });
  let assignT = 0;

  function assign(pos) {
    const near = [];
    for (const sim of fleet.cars) {
      if (!carShown(sim)) continue;
      const p = carPose(sim.road, sim), d = Math.hypot(p.x - pos.x, p.z - pos.z);
      if (d < RANGE) near.push({ sim, d });
    }
    near.sort((a, b) => a.d - b.d);
    const want = new Set(near.slice(0, POOL).map((n) => n.sim));
    // Release pool cars whose sim fell out of the wanted set.
    for (const car of pool) if (car.userData.sim && !want.has(car.userData.sim)) { car.userData.sim.mesh = null; car.userData.sim = null; car.visible = false; }
    // Lend free cars to wanted sims, preferring a pool car of the same kind.
    for (const sim of want) {
      if (sim.mesh) continue;
      const free = pool.filter((c) => !c.userData.sim);
      if (!free.length) break;
      const car = free.find((c) => c.userData.kind === sim.kind) || free[0];
      car.userData.sim = sim;
      sim.mesh = car;
    }
  }

  return {
    fleet,
    /** obstacles: [{x, z, r}] — you on foot, or your car. */
    update(dt, t, { position, outside = true, obstacles = [] }) {
      stepAvenues(fleet, dt, t, { obstacles });
      assignT -= dt;
      if (assignT <= 0) { assign(position); assignT = 0.4; }
      for (const car of pool) {
        const sim = car.userData.sim;
        if (!sim) continue;
        if (!carShown(sim)) { sim.mesh = null; car.userData.sim = null; car.visible = false; continue; }
        const p = carPose(sim.road, sim);
        car.position.set(p.x, 0, p.z);
        car.rotation.y = p.yaw;
        car.visible = outside;
        animateVehicle(car, sim.v * dt, { braking: sim.braking });
      }
    },
    hit(player) { return hitAvenueCar(player, fleet, sizeOf); },
    blocks(x, z, r) { return avenueBlocks(fleet, x, z, r, sizeOf); },
  };
}
