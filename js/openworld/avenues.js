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
  let assignT = 0;
  // Only cars you can see can hit you or block your car.
  const drawn = { get cars() { return fleet.cars.filter((c) => c.mesh); } };

  function assign(pos) {
    const near = [];
    for (const sim of fleet.cars) {
      if (!carShown(sim)) continue;
      const p = carPose(sim.road, sim), d = Math.hypot(p.x - pos.x, p.z - pos.z);
      if (d < RANGE) near.push({ sim, d });
    }
    near.sort((a, b) => a.d - b.d);
    // Nearest first, as long as the pool still has a model of that kind.
    const left = {};
    for (const c of pool) left[c.userData.kind] = (left[c.userData.kind] || 0) + 1;
    const want = new Set();
    for (const { sim } of near) if (left[sim.kind] > 0) { left[sim.kind]--; want.add(sim); }
    // Release pool cars whose sim fell out of the wanted set.
    for (const car of pool) if (car.userData.sim && !want.has(car.userData.sim)) { car.userData.sim.mesh = null; car.userData.sim = null; car.visible = false; }
    // Lend free cars to wanted sims, always of the same kind, so a car's length matches its simulation.
    for (const sim of want) {
      if (sim.mesh) continue;
      const car = pool.find((c) => !c.userData.sim && c.userData.kind === sim.kind);
      if (!car) continue;
      car.userData.sim = sim;
      sim.mesh = car;
    }
  }

  return {
    fleet,
    /** obstacles: [{x, z, r, w}] — you on foot, your car, or the car you left in the road. */
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
    hit(player) { return hitAvenueCar(player, drawn); },
    blocks(x, z, r) { return avenueBlocks(drawn, x, z, r); },
  };
}
