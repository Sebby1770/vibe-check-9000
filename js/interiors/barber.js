/* TONY'S BARBER — rect x 31.2..40.6, z 32.05..40.0 (storefront z 32.05), ceiling underside y 3.84; door gap x 34.55..37.05.
   Targets: NPC tony (35.9, 36.9); prop barber-tools (35.9, 36.4); seat barber-chair (34.15, 35.55) looks at (35.9, 37.2);
   seated NPC in the other chair (37.0, 35.55); enter-barber drops you at (35.8, 33.5) facing z 36.9; street-life.js hides a
   "47TH REGULAR" seal at (35.9, 1.25, 37.05). The striped pole (31.05, 31.55) is exterior (shops.js).
   Colliders: back bar x 32.4..39.4, z 37.15..38.55; chairs x 33.35..34.95 and 36.15..37.75, z 34.85..36.35. */
import * as THREE from "three";
import { addBox, unitBox } from "../kit.js";
import { randomPedestrian } from "../human.js";
import { checkerFloor } from "../shop-art.js";
import { card, sharedMats, shopRoom } from "./common.js";

export function colliders() {
  return [
    { minX: 32.4, maxX: 39.4, minZ: 37.15, maxZ: 38.55, minY: -1, maxY: 1.45 },
    { minX: 33.35, maxX: 34.95, minZ: 34.85, maxZ: 36.35, minY: -1, maxY: 1.25 },
    { minX: 36.15, maxX: 37.75, minZ: 34.85, maxZ: 36.35, minY: -1, maxY: 1.25 },
  ];
}

export function build({ root, mats, shop, lamp, place, crowds }) {
  const { wood, black, chrome } = mats;
  const { brass, paper, velvet } = sharedMats();
  const check = new THREE.MeshStandardMaterial({ color: 0xf2eee0, roughness: 0.7 });
  addBox(root, unitBox, check, 35.9, 0.02, 36.0, 9.0, 0.04, 7.6);
  addBox(root, unitBox, black, 35.9, 0.025, 36.0, 9.0, 0.041, 7.6 * 0.08);
  addBox(root, unitBox, wood, 35.9, 0.7, 37.85, 7.6, 1.15, 0.7);
  for (const x of [34.15, 37.0]) {
    addBox(root, unitBox, chrome, x, 0.28, 35.55, 0.7, 0.12, 0.7);
    addBox(root, unitBox, velvet, x, 0.55, 35.55, 0.62, 0.42, 0.62);
    addBox(root, unitBox, velvet, x, 0.95, 35.85, 0.62, 0.55, 0.16);
  }
  lamp(35.9, 35.2, 0xffe7a8, 22);
  crowds.push(place(randomPedestrian(0.58, { outfit: "salesman", anim: "sit" }), 37.0, 35.55, Math.PI, "sit", { sitHips: 0.55 }));
  crowds.push(place(randomPedestrian(0.14, { outfit: "clerk", anim: "idle" }), 33.4, 33.8, 0.5, "idle"));

  shopRoom(root, mats, shop, 0xb5bbb0);
  const barberTile = new THREE.MeshStandardMaterial({ map: checkerFloor("#38494a", "#e2d9c1", 16), roughness: 0.7 });
  addBox(root, unitBox, barberTile, 35.9, 0.055, 36, 9, 0.06, 7.6);
  card(root, ["TONY'S", "THREE CUTS. ONE GOOD PORTRAIT."], 35.9, 2.95, 39.8, 6.5, 0.75, { ink: "#53453b" });
  for (let i = 0; i < 4; i++) {
    addBox(root, unitBox, paper, 32.8 + i * 0.4, 1.36, 37.7, 0.17, 0.18, 0.17);
    addBox(root, unitBox, black, 36 + i * 0.18, 1.32, 37.7, 0.08, 0.04, 0.3);
  }
  const mirrors = new THREE.MeshBasicMaterial({ color: 0x849e99 });
  for (const x of [34.15, 37]) {
    addBox(root, unitBox, brass, x, 2.1, 39.68, 1.7, 1.55, 0.08);
    addBox(root, unitBox, mirrors, x, 2.1, 39.61, 1.56, 1.4, 0.025);
  }
  return {};
}
