/* Helpers shared by the interior modules and the storefront glazing (shop-details.js).
   sharedMats()/sleeveMats() hand out ONE cached set of materials used by several rooms and by the
   storefronts: treat them as read-only; create your own material to recolour anything. */
import * as THREE from "three";
import { addBox, unitBox } from "../kit.js";
import { printedCard, recordSleeve } from "../shop-art.js";

let SHARED;
export function sharedMats() {
  SHARED ??= {
    brass: new THREE.MeshStandardMaterial({ color: 0xb79a61, metalness: 0.55, roughness: 0.4 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xdfd1b4, roughness: 0.9 }),
    slate: new THREE.MeshStandardMaterial({ color: 0x263d3e, roughness: 0.85 }),
    velvet: new THREE.MeshStandardMaterial({ color: 0x5a1020, roughness: 0.85 }),
    marble: new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.32, metalness: 0.18 }),
  };
  return SHARED;
}

let SLEEVES;
// Record-sleeve art: Rex's back wall + bins and the Rivoli lobby posters share these three.
export function sleeveMats() {
  SLEEVES ??= [0, 1, 2].map((i) => new THREE.MeshBasicMaterial({ map: recordSleeve(i) }));
  return SLEEVES;
}

// Printed card facing the street side (-Z), i.e. readable from inside a 47th St shop looking north.
export function card(root, lines, x, y, z, w, h, options = {}) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: printedCard(lines, options) }),
  );
  mesh.position.set(x, y, z);
  mesh.rotation.y = Math.PI;
  root.add(mesh);
  return mesh;
}

// Instanced bottles on `rows` wooden shelves along a back wall (bottles from y 1.55, 0.43 m apart).
export function bottleRows(root, wood, x, z, width, rows, cols, color) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.15 });
  const bottles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.075, 0.065, 0.28, 7), mat, rows * cols);
  const dummy = new THREE.Object3D();
  let k = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      dummy.position.set(x - width / 2 + (c * width) / (cols - 1), 1.55 + r * 0.43, z);
      dummy.updateMatrix();
      bottles.setMatrixAt(k++, dummy.matrix);
    }
  root.add(bottles);
  for (let r = 0; r < rows; r++) addBox(root, unitBox, wood, x, 1.37 + r * 0.43, z, width + 0.3, 0.065, 0.25);
}

/* The standard 47th St room: side + back walls, slate ceiling (underside y 3.84), back skirting,
   doormat and a pendant globe. Rooms may skip it and build their own. */
export function shopRoom(root, mats, s, wallColor) {
  const { brass, slate } = sharedMats();
  const cx = (s.minX + s.maxX) / 2, w = s.maxX - s.minX;
  const wall = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.88 });
  addBox(root, unitBox, wall, s.minX + 0.04, 1.95, 36.05, 0.12, 3.9, 7.95);
  addBox(root, unitBox, wall, s.maxX - 0.04, 1.95, 36.05, 0.12, 3.9, 7.95);
  addBox(root, unitBox, wall, cx, 1.95, 39.95, w, 3.9, 0.12);
  addBox(root, unitBox, slate, cx, 3.9, 36.05, w, 0.12, 7.95);
  sealedUpperFloor(root, mats, s, wall);
  addBox(root, unitBox, mats.wood, cx, 0.16, 39.8, w, 0.3, 0.12);
  addBox(root, unitBox, mats.wood, s.doorX, 0.012, 32.85, 2.25, 0.035, 1.2);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xf1d7a1 }));
  globe.position.set(cx, 3.5, 35.0);
  root.add(globe);
  addBox(root, unitBox, brass, cx, 3.75, 35, 0.035, 0.35, 0.035);
  return { wall };
}

/* Floor above each shop (y 4.2..8.1). It is sealed by the shop ceiling, the facade brick and the
   cornice, so nothing here is ever visible: dropping it frees ~8 draw calls per shop. */
export function sealedUpperFloor(root, mats, s, wall) {
  const { paper, slate } = sharedMats();
  const cx = (s.minX + s.maxX) / 2, w = s.maxX - s.minX;
  addBox(root, unitBox, mats.wood, cx, 4.22, 36.05, w - 0.2, 0.1, 7.9);
  addBox(root, unitBox, wall, s.minX + 0.04, 6.15, 36.05, 0.12, 3.8, 7.95);
  addBox(root, unitBox, wall, s.maxX - 0.04, 6.15, 36.05, 0.12, 3.8, 7.95);
  addBox(root, unitBox, wall, cx, 6.15, 39.95, w, 3.8, 0.12);
  addBox(root, unitBox, slate, cx, 8.1, 36.05, w, 0.12, 7.95);
  addBox(root, unitBox, mats.wood, cx, 4.58, 38.5, Math.min(4.8, w * 0.55), 0.72, 1.3);
  addBox(root, unitBox, paper, cx, 4.95, 38.5, Math.min(4.4, w * 0.5), 0.06, 1.1);
}
