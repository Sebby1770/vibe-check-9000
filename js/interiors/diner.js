/* DOTTIE'S DINER — rect x -38.8..-16.5, z -16.5..12.5; shell (chrome walls, ceiling slab underside y ~6.38, front glazing)
   stays in city.js; front door gap x -28.4..-25.6 at z 12.62. This module owns the only floor surface.
   Targets: NPCs dottie (-24.6, 1.35) and lou (-25.4, 5.35); prop diner-menu + seat diner-counter (-28.6, 1.55, looks at -25.5, 3.5);
   seat diner-booth (-33.05, -8.0, looks at -34.6, -8.0); street-life.js hides a "47TH REGULAR" seal at (-25.5, 1.25, 2.39) on the counter.
   Light: city.js dinerLight PointLight (-27.6, 3.2, 10). Colliders: counter x -32.6..-18.4, z 2.4..5.1; back counter x -27.1..-18.6, z 5.55..7.25. */
import * as THREE from "three";
import { addBox, unitBox } from "../kit.js";

export function colliders() {
  return [
    { minX: -32.6, maxX: -18.4, minZ: 2.4, maxZ: 5.1, minY: -1, maxY: 1.8 },
    { minX: -27.1, maxX: -18.6, minZ: 5.55, maxZ: 7.25, minY: -1, maxY: 1.85 },
  ];
}

export function build({ root, mats }) {
  const { wood, chrome, cream, black, neonRed, neonAmber, glass } = mats;
  addBox(root, unitBox, wood, -27.65, 0.02, -2, 21.8, 0.04, 28.4);
  addBox(root, unitBox, chrome, -25.5, 0.55, 3.7, 16.4, 1.1, 2.4);
  addBox(root, unitBox, cream, -25.5, 1.15, 3.7, 16.2, 0.08, 2.2);
  addBox(root, unitBox, neonRed, -25.5, 0.08, 3.7, 16, 0.04, 2.2);
  for (let i = 0; i < 7; i++) {
    const z = -8 + i * 2.4;
    addBox(root, unitBox, wood, -34.6, 0.45, z, 1.6, 0.12, 1.4);
    addBox(root, unitBox, cream, -35.4, 0.85, z, 0.12, 0.9, 1.4);
    addBox(root, unitBox, chrome, -33.6, 0.42, z, 0.28, 0.08, 0.28);
  }
  const pie = addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0xc45c28, roughness: 0.5 }), -22.4, 1.35, 3.7, 0.7, 0.18, 0.7);
  pie.material.emissive = new THREE.Color(0x401000);
  pie.material.emissiveIntensity = 0.2;
  addBox(root, unitBox, glass, -22.4, 1.7, 3.7, 1.1, 0.7, 1.1);
  addBox(root, unitBox, chrome, -22.8, 0.7, 6.4, 8.4, 1.4, 1.6);
  addBox(root, unitBox, neonRed, -22.8, 1.15, 6.4, 7.6, 0.06, 1.2);
  addBox(root, unitBox, black, -19.4, 1.35, 6.4, 1.4, 0.35, 1.1);
  addBox(root, unitBox, black, -36.4, 1.1, -8.2, 3.6, 2.2, 4.4);
  addBox(root, unitBox, chrome, -36.4, 1.35, -8.2, 3.2, 0.08, 4.0);
  addBox(root, unitBox, cream, -36.4, 2.35, -8.2, 3.5, 0.12, 4.3);
  for (const z of [-9.4, -7.2, -5.1]) {
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.6 }), -37.4, 0.85, z, 0.7, 1.4, 0.7);
    addBox(root, unitBox, neonAmber, -37.4, 1.6, z, 0.45, 0.08, 0.45);
  }
  addBox(root, unitBox, cream, -33.2, 1.4, -12.4, 2.2, 2.6, 0.18);
  addBox(root, unitBox, wood, -33.2, 0.7, -11.4, 1.8, 1.2, 1.4);
  addBox(root, unitBox, wood, -18.4, 1.6, -2, 0.12, 3.0, 12);
  for (const z of [-8, -2, 4]) addBox(root, unitBox, cream, -18.55, 2.2, z, 0.08, 0.7, 1.6);
  addBox(root, unitBox, neonRed, -27.6, 3.2, -16.35, 8.4, 0.5, 0.04);
  return {};
}
