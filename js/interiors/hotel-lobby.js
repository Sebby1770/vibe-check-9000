/* HOTEL ASTORIA lobby (ground floor) — rect x 16.5..38.8, z -16.5..12.5, y 0..4.29 (2F plates above); front door gap x 23.6..26.4
   at z 12.62; stairwell x 35.65..38.3, z 1.35..9.55 (shell + rails stay in city.js/zones.js). This module owns the only floor surface.
   Targets: NPCs eleanor (24.8, 8.6) and otis (22.6, 10.6); seat hotel-lobby (25.2, 3.85, looks at the desk 25.2, 5.9);
   life-world.js property desk (28.9, 8.8, collider x 28.15..29.65, z 8.5..9.1 in zones.js); street-life.js lost-property case
   (30, 10.05; target lostproperty 30, 9.7). Light: city.js hotelLight PointLight (25, 3.2, 10). Collider: desk x 21.4..28.6, z 4.6..7.4. */
import * as THREE from "three";
import { addBox, unitBox } from "../kit.js";

export function colliders() {
  return [{ minX: 21.4, maxX: 28.6, minZ: 4.6, maxZ: 7.4, minY: -1, maxY: 1.6 }];
}

export function build({ root, mats }) {
  const { wood, cream, black, chrome } = mats;
  addBox(root, unitBox, black, 27.65, 0.02, -2, 21.8, 0.04, 28.4);
  addBox(root, unitBox, wood, 25.2, 0.55, 5.9, 7.4, 1.1, 2.6);
  addBox(root, unitBox, cream, 25.2, 1.2, 5.9, 7.2, 0.08, 2.4);
  for (const [x, z] of [[21.8, -6.2], [21.8, 0.4], [21.8, 6.8], [33.4, -12.2], [33.4, -6.4], [33.4, 2.2], [29.2, -10.4], [29.2, 8.6]]) {
    addBox(root, unitBox, wood, x, 0.42, z, 1.6, 0.12, 1.4);
    addBox(root, unitBox, cream, x - 0.7, 0.85, z, 0.12, 0.9, 1.4);
  }
  addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x4a2030, roughness: 0.85 }), 27.6, 0.03, -2, 10, 0.03, 14);
  addBox(root, unitBox, wood, 27.6, 0.38, -2, 1.4, 0.08, 1.4);
  for (const z of [-12, -4, 4, 10]) {
    addBox(root, unitBox, cream, 17.0, 2.4, z, 0.08, 1.1, 1.4);
    addBox(root, unitBox, new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), 17.05, 2.4, z, 0.04, 0.35, 0.35);
  }
  addBox(root, unitBox, chrome, 21.4, 0.45, 9.4, 1.1, 0.7, 0.7);
  addBox(root, unitBox, cream, 21.4, 0.85, 9.4, 0.9, 0.12, 0.55);
  addBox(root, unitBox, black, 21.4, 0.22, 9.85, 0.18, 0.18, 0.18);
  return {};
}
