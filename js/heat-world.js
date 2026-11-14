/* Muldoon's cruiser in the world: a '54 police car with a red-and-blue light bar that flashes while he's after
   you, headlights, and a box in the colliders so you can't drive (or walk) through it. Out of sight when there's
   no chase. No real lights: the bar glows by its own colour. */
import * as THREE from "three";
import { buildVehicle, animateVehicle } from "./vehicles/models.js";
import { addNightLights } from "./vehicles/night-lights.js";

export function buildCruiser(scene, colliders) {
  const car = buildVehicle("police", { color: 0x121216, driver: true, seed: 3 });
  car.name = "Muldoon's cruiser";
  const spec = car.userData.spec;
  const red = new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false });
  const blue = new THREE.MeshBasicMaterial({ color: 0x2a6bff, toneMapped: false });
  const dim = new THREE.MeshBasicMaterial({ color: 0x241b1b });
  const bar = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 1.1), new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.5, metalness: 0.4 }));
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.13, 0.4), red), right = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.13, 0.4), blue);
  left.position.set(0, 0.09, -0.3);
  right.position.set(0, 0.09, 0.3);
  bar.add(base, left, right);
  // On the roof, a little behind the windscreen.
  const roof = car.userData.gumball?.position || new THREE.Vector3(-0.2, 1.52, 0);
  bar.position.set(roof.x, roof.y + 0.04, 0);
  car.add(bar);
  if (car.userData.gumball) car.userData.gumball.visible = false;
  car.userData.nightLights = addNightLights(car);
  car.visible = false;
  scene.add(car);
  // Solid while it's out; parked under the street when it isn't.
  const box = { minX: 0, maxX: 0, minZ: 0, maxZ: 0, minY: -5, maxY: -4 };
  colliders.boxes.push(box);
  function placeBox(on) {
    if (!on) { box.minY = -5; box.maxY = -4; return; }
    const cos = Math.abs(Math.cos(car.rotation.y)), sin = Math.abs(Math.sin(car.rotation.y));
    const hx = (spec.length / 2) * cos + (spec.width / 2) * sin, hz = (spec.length / 2) * sin + (spec.width / 2) * cos;
    Object.assign(box, { minX: car.position.x - hx, maxX: car.position.x + hx, minZ: car.position.z - hz, maxZ: car.position.z + hz, minY: -1, maxY: 1.95 });
  }
  let lastX = 0, lastZ = 0;

  return {
    car,
    /** chase: heat.js state (or null). reduced: a slow, steady flash rather than a strobe. */
    update(dt, t, chase, { reduced = false } = {}) {
      const on = !!chase && chase.phase === "chase";
      car.visible = on;
      placeBox(on);
      if (!on) return;
      const c = chase.cop, moved = Math.hypot(c.x - lastX, c.z - lastZ);
      car.position.set(c.x, 0, c.z);
      car.rotation.y = c.yaw;
      animateVehicle(car, moved < 5 ? moved : 0, { braking: c.v < 6 });
      lastX = c.x; lastZ = c.z;
      const phase = Math.floor(t * (reduced ? 1.5 : 5)) % 2;
      left.material = phase ? red : dim;
      right.material = phase ? dim : blue;
    },
  };
}
