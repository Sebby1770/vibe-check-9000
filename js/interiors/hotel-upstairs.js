/* HOTEL ASTORIA 2F public areas — floor y 4.4 (plates, stairs, roof at y 14.4 stay in city.js); zone "suite". Stairs arrive at
   x 35.65..38.3, z 1.35 (rails in zones.js). Apartments 2A studio (x 17.1..24.5, z -7.2..0.4, door 24.5,-3.3), 2B loft
   (z -15.8..-7.8, door 24.5,-11.7) and 2C suite (x 27.1..34.3, z -15.8..-10.4, door 34.3,-13) are life-world.js/life.js; keep
   (36.9,0) (35.2,-5) (32,-6.5) (25.6,-3.3) (25.6,-9.8) walkable (life.test). Two x 22.4 side tables below sit inside 2A/2B.
   Targets: NPC nellie (27.2, 0.8); prop ice (32.0, -8.5) = the ice machine; seat suite-bed (21.2, 7.15, looks at the window 21.2, 12.2).
   Light: city.js hotelUp PointLight (27, 6.6, -2). Colliders: ice machine x 30.55..33.45, z -9.45..-7.55; bench x 18.15..24.15, z 6.35..8.25. */
import * as THREE from "three";
import { addBox, unitBox, neonCanvas } from "../kit.js";
import { SECOND_Y } from "../zones.js";

export function colliders() {
  return [
    { minX: 30.55, maxX: 33.45, minZ: -9.45, maxZ: -7.55, minY: 4.2, maxY: 5.55 },
    { minX: 18.15, maxX: 24.15, minZ: 6.35, maxZ: 8.25, minY: 4.2, maxY: 5.45 },
  ];
}

export function build({ root, mats }) {
  const { wood, cream, chrome } = mats;
  const fy = SECOND_Y;
  addBox(root, unitBox, wood, 32.0, fy + 0.22, -8.4, 2.6, 0.12, 1.8);
  addBox(root, unitBox, cream, 32.0, fy + 0.48, -9.1, 2.6, 0.4, 0.18);
  addBox(root, unitBox, chrome, 32.0, fy + 0.7, -8.5, 1.1, 0.9, 0.7);
  addBox(root, unitBox, cream, 32.0, fy + 1.05, -8.5, 0.9, 0.08, 0.55);
  addBox(root, unitBox, new THREE.MeshBasicMaterial({ color: 0x88ccee }), 32.0, fy + 1.18, -8.5, 0.7, 0.16, 0.5);
  addBox(root, unitBox, wood, 21.2, fy + 0.22, 7.3, 2.8, 0.14, 1.6);
  addBox(root, unitBox, cream, 21.2, fy + 0.48, 7.9, 2.8, 0.38, 0.22);
  addBox(root, unitBox, new THREE.MeshBasicMaterial({ color: 0xffc078, transparent: true, opacity: 0.35 }), 21.2, fy + 1.55, 12.35, 2.4, 1.5, 0.04);
  const fourb = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), new THREE.MeshBasicMaterial({ map: neonCanvas("4B", "#E0B25A", 256, 128, "#120c08") }));
  fourb.position.set(30.2, fy + 1.55, -2.2);
  fourb.rotation.y = Math.PI / 2;
  root.add(fourb);
  addBox(root, unitBox, cream, 29.4, fy + 0.02, -2, 8.4, 0.02, 18);
  addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x5a2030, roughness: 0.85 }), 29.4, fy + 0.03, -2, 1.4, 0.02, 16);
  for (const z of [-10.4, -4.2, 2.8, 8.4]) {
    addBox(root, unitBox, wood, 22.4, fy + 0.55, z, 0.7, 0.9, 0.7);
    addBox(root, unitBox, cream, 22.4, fy + 1.15, z, 0.18, 0.35, 0.18);
  }
  return {};
}
