/* 47TH PHARMACY — rect x -26.8..-16.8, z 32.05..40.0 (storefront z 32.05), ceiling underside y 3.84; door gap x -23.05..-20.55.
   Targets: NPC iris (-21.8, 37.2); prop tonic-tap (-24.2, 33.6) = the chrome soda fountain; enter-pharmacy drops you at
   (-21.8, 33.5) facing z 37.2; street-life.js hides a "47TH REGULAR" seal at (-21.8, 1.25, 37.4) on the counter.
   Collider: counter x -26.0..-17.6, z 37.45..39.2. */
import * as THREE from "three";
import { addBox, unitBox } from "../kit.js";
import { randomPedestrian } from "../human.js";
import { checkerFloor } from "../shop-art.js";
import { bottleRows, card, sharedMats, shopRoom } from "./common.js";

export function colliders() {
  return [{ minX: -26.0, maxX: -17.6, minZ: 37.45, maxZ: 39.2, minY: -1, maxY: 1.5 }];
}

export function build({ root, mats, shop, lamp, place, crowds }) {
  const { cream, chrome } = mats;
  const { brass, paper, marble } = sharedMats();
  const green = new THREE.MeshStandardMaterial({ color: 0x1a4a32, roughness: 0.55, metalness: 0.2 });
  addBox(root, unitBox, cream, -21.8, 0.02, 36.0, 9.6, 0.04, 7.6);
  addBox(root, unitBox, green, -21.8, 0.55, 38.3, 8.4, 1.1, 1.5);
  addBox(root, unitBox, marble, -21.8, 1.14, 38.3, 8.2, 0.08, 1.35);
  for (const x of [-25.4, -18.2]) {
    addBox(root, unitBox, cream, x, 1.35, 35.8, 0.22, 2.4, 4.8);
    for (let i = 0; i < 5; i++) addBox(root, unitBox, green, x, 0.55 + i * 0.42, 35.8, 0.18, 0.05, 4.6);
  }
  addBox(root, unitBox, chrome, -24.2, 0.55, 33.6, 1.6, 1.1, 0.7);
  lamp(-21.8, 35.2, 0x88ffe0, 24);
  crowds.push(place(randomPedestrian(0.31, { outfit: "lady", anim: "idle" }), -24.6, 34.0, 0.2, "idle"));
  crowds.push(place(randomPedestrian(0.73, { outfit: "salesman", anim: "lean" }), -18.9, 35.6, -1.6, "lean"));

  shopRoom(root, mats, shop, 0xb7cbbb);
  bottleRows(root, mats.wood, -21.8, 39.73, 7, 4, 16, 0x649781);
  card(root, ["IRIS'S SODA FOUNTAIN", "MINT • CHERRY • VANILLA"], -21.8, 3.36, 39.76, 6.1, 0.56, { ink: "#254d42" });
  const tile = new THREE.MeshStandardMaterial({ map: checkerFloor("#87a397", "#dedcc8", 16), roughness: 0.75 });
  addBox(root, unitBox, tile, -21.8, 0.045, 36, 9.6, 0.06, 7.6);
  for (let i = 0; i < 3; i++) {
    addBox(root, unitBox, chrome, -24.6 + i * 0.37, 1.27, 33.62, 0.055, 0.35, 0.055);
    addBox(root, unitBox, brass, -24.6 + i * 0.37, 1.47, 33.5, 0.06, 0.055, 0.22);
    const soda = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.2, 9), paper);
    soda.position.set(-24.55 + i * 0.37, 1.2, 33.25);
    root.add(soda);
  }
  return {};
}
