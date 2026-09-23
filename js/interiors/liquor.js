/* MIDTOWN GIN — rect x 19.6..29.6, z 32.05..40.0 (storefront z 32.05), ceiling underside y 3.84; door gap x 23.35..25.85.
   Targets: NPC rosie (24.6, 37.15); prop gin-counter (24.6, 36.5); enter-liquor drops you at (24.6, 33.5) facing z 37.1;
   street-life.js hides a "47TH REGULAR" seal at (24.6, 1.25, 37.4) on the counter.
   Collider: counter x 20.4..28.8, z 37.5..39.25. */
import * as THREE from "three";
import { addBox, unitBox } from "../kit.js";
import { randomPedestrian, randomLounge } from "../human.js";
import { bottleRows, card, sharedMats, shopRoom } from "./common.js";

export function colliders() {
  return [{ minX: 20.4, maxX: 28.8, minZ: 37.5, maxZ: 39.25, minY: -1, maxY: 1.5 }];
}

export function build({ root, mats, shop, lamp, place, crowds }) {
  const { wood } = mats;
  const { marble } = sharedMats();
  const bottleG = new THREE.CylinderGeometry(0.05, 0.045, 0.22, 8);
  const bottleColors = [0xc9a227, 0x2a6a48, 0x8b1e1e, 0x1a3a6a, 0xe8dcc8];
  addBox(root, unitBox, wood, 24.6, 0.02, 36.0, 9.6, 0.04, 7.6);
  addBox(root, unitBox, wood, 24.6, 0.55, 38.3, 8.4, 1.1, 1.5);
  addBox(root, unitBox, marble, 24.6, 1.14, 38.3, 8.2, 0.08, 1.35);
  for (const x of [21.2, 28.0]) {
    addBox(root, unitBox, wood, x, 1.4, 35.8, 0.22, 2.5, 4.8);
    for (let i = 0; i < 12; i++) {
      const b = new THREE.Mesh(bottleG, new THREE.MeshStandardMaterial({
        color: bottleColors[i % bottleColors.length], roughness: 0.25, metalness: 0.4,
      }));
      b.position.set(x, 0.45 + (i % 6) * 0.38, 33.8 + Math.floor(i / 6) * 2.2);
      root.add(b);
    }
  }
  lamp(24.6, 35.3, 0xffb25a, 24);
  crowds.push(place(randomPedestrian(0.47, { outfit: "hood", anim: "lean" }), 21.8, 34.2, 0.8, "lean"));
  crowds.push(place(randomLounge(0.66, { anim: "idle" }), 27.4, 35.5, -2.2, "idle"));

  shopRoom(root, mats, shop, 0x887553);
  bottleRows(root, wood, 24.6, 39.75, 7.3, 4, 16, 0x827b38);
  card(root, ["THE SMOOTH CENTURY", "SEALED BOTTLES • HONEST COMPANY"], 24.6, 3.36, 39.8, 6.3, 0.5, { ink: "#4f4933" });
  for (let i = 0; i < 3; i++) {
    addBox(root, unitBox, wood, 21 + i * 1.1, 0.35, 33.5, 0.85, 0.7, 0.65);
    card(root, ["MIDTOWN", "RESERVE"], 21 + i * 1.1, 0.39, 33.15, 0.63, 0.42, { ink: "#5d4933", paper: "#bc9c68" });
  }
  return {};
}
