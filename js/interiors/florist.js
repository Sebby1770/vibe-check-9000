/* LILY'S (florist) — rect x -15.4..-9.0, z 32.05..40.0 (storefront z 32.05), ceiling underside y 3.84; door gap x -13.45..-10.95.
   Targets: NPC lily (-12.2, 37.15); prop florist-counter (-12.2, 36.7); enter-florist drops you at (-12.2, 33.5) facing z 37.1;
   street-life.js hides a "47TH REGULAR" seal at (-12.2, 1.25, 37.5) on the work table.
   Collider: work table x -14.7..-9.7, z 37.6..39.15. */
import * as THREE from "three";
import { addBox, unitBox } from "../kit.js";
import { randomLounge } from "../human.js";
import { card, sharedMats, shopRoom } from "./common.js";

export function colliders() {
  return [{ minX: -14.7, maxX: -9.7, minZ: 37.6, maxZ: 39.15, minY: -1, maxY: 1.35 }];
}

export function build({ root, mats, shop, lamp, place, crowds }) {
  const { wood, cream } = mats;
  const { brass, paper } = sharedMats();
  addBox(root, unitBox, cream, -12.2, 0.02, 36.0, 6.0, 0.04, 7.6);
  addBox(root, unitBox, wood, -12.2, 0.48, 38.3, 4.8, 0.7, 1.2);
  for (const [x, z, c] of [[-13.8, 33.8, 0xc45c6a], [-11.0, 34.2, 0xe0b25a], [-13.1, 35.6, 0x39a868], [-10.6, 36.1, 0xff6b9a]]) {
    addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: c, roughness: 0.55 }), x, 0.55, z, 0.55, 0.7, 0.55);
    addBox(root, unitBox, new THREE.MeshBasicMaterial({ color: c }), x, 0.95, z, 0.18, 0.35, 0.18);
  }
  lamp(-12.2, 35.4, 0xff88aa, 20);
  crowds.push(place(randomLounge(0.18, { anim: "idle" }), -10.8, 34.6, -0.5, "idle"));

  shopRoom(root, mats, shop, 0xc2b29b);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x385f49, roughness: 0.75 });
  const petalGeo = new THREE.SphereGeometry(0.12, 6, 5),
    stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.7, 5);
  for (const [k, color] of [0xd07792, 0xe5c075, 0xcbd3b4].entries()) {
    const blooms = new THREE.InstancedMesh(petalGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }), 35);
    const stems = new THREE.InstancedMesh(stemGeo, stemMat, 35),
      d = new THREE.Object3D();
    for (let j = 0; j < 35; j++) {
      const cluster = Math.floor(j / 7),
        a = j * 2.4;
      const x = -14.1 + (cluster % 2) * 3.5 + Math.cos(a) * 0.24,
        z = 33.6 + Math.floor(cluster / 2) * 1.4 + Math.sin(a) * 0.24 + k * 0.07;
      d.position.set(x, 1.08 + (j % 3) * 0.06 + k * 0.09, z);
      d.scale.set(1, 1, 1);
      d.updateMatrix();
      blooms.setMatrixAt(j, d.matrix);
      d.position.y -= 0.36;
      d.updateMatrix();
      stems.setMatrixAt(j, d.matrix);
    }
    root.add(blooms, stems);
  }
  card(root, ["LILY'S FLOWER STUDIO", "A LITTLE COLOR FOR THE PIANO"], -12.2, 2.6, 39.8, 4.8, 0.85, { ink: "#75404b" });
  addBox(root, unitBox, paper, -12.2, 0.9, 38.3, 2.5, 0.02, 0.6);
  addBox(root, unitBox, brass, -11.1, 0.95, 38.0, 0.28, 0.055, 0.12);
  return {};
}
