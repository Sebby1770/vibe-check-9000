/* THE RIVOLI lobby — rect x -8.0..18.2, z 32.05..40.0 (storefront z 32.05), ceiling underside y 3.84; door gap x 4.75..7.25.
   Targets: NPC walter (6.0, 34.2); prop rivoli-program (6, 35.6); seat rivoli-bench (11.2, 34.2) looks at the film (12.9, 2.12, 39.5);
   enter-rivoli drops you at (6.0, 33.6) facing z 37.4; street-life.js hides a "47TH REGULAR" seal at (6, 1.25, 36.65) on the box office.
   Handle: `film` (plane at 13.0, 2.12, 39.66) is city.film — playFilm(), setShopState() and the snapshot's filmVersion use it.
   Collider: box office x 3.4..8.6, z 36.7..39.15, y up to 1.7. */
import * as THREE from "three";
import { addBox, unitBox } from "../kit.js";
import { randomPedestrian, randomLounge } from "../human.js";
import { createFilm } from "../shop-art.js";
import { card, sharedMats, sleeveMats, shopRoom } from "./common.js";

export function colliders() {
  return [{ minX: 3.4, maxX: 8.6, minZ: 36.7, maxZ: 39.15, minY: -1, maxY: 1.7 }];
}

export function build({ root, mats, shop, lamp, place, crowds }) {
  const { wood, chrome } = mats;
  const { velvet, marble } = sharedMats();
  addBox(root, unitBox, velvet, 5.1, 0.03, 36.0, 25.6, 0.05, 7.6);
  addBox(root, unitBox, wood, 6.0, 0.7, 37.85, 4.8, 1.4, 2.0);
  addBox(root, unitBox, marble, 6.0, 1.42, 37.85, 4.6, 0.08, 1.85);
  for (const x of [-5.2, 1.2, 11.2, 15.6]) {
    addBox(root, unitBox, velvet, x, 0.42, 34.4, 1.8, 0.18, 0.7);
    addBox(root, unitBox, velvet, x, 0.72, 34.05, 1.8, 0.48, 0.16);
  }
  const filmPlayer = createFilm();
  const film = new THREE.Mesh(new THREE.PlaneGeometry(6.7, 2.8), new THREE.MeshBasicMaterial({ map: filmPlayer.texture }));
  film.position.set(13.0, 2.0, 39.66);
  film.rotation.y = Math.PI;
  film.userData.draw = filmPlayer.draw;
  film.userData.play = filmPlayer.play;
  root.add(film);
  addBox(root, unitBox, chrome, 6.0, 3.6, 36.0, 0.08, 0.5, 0.08);
  addBox(root, unitBox, mats.neonAmber, 6.0, 3.25, 36.0, 1.4, 0.12, 1.4);
  lamp(6.0, 35.0, 0xffc078, 32);
  lamp(14.0, 35.5, 0xffb070, 18);
  crowds.push(place(randomLounge(0.27, { anim: "sit" }), -5.2, 34.35, 0, "sit", { sitHips: 0.48 }));
  crowds.push(place(randomLounge(0.51, { anim: "sit" }), 1.2, 34.35, 0, "sit", { sitHips: 0.48 }));
  crowds.push(place(randomPedestrian(0.39, { outfit: "lady", anim: "idle" }), 15.4, 35.2, -0.4, "idle"));
  crowds.push(place(randomPedestrian(0.81, { outfit: "salesman", anim: "lean" }), 1.4, 33.6, 0.3, "lean"));

  shopRoom(root, mats, shop, 0x422936);
  card(root, ["THE RIVOLI", "BOX OFFICE →"], 2.6, 3.2, 39.76, 4.1, 0.55, { ink: "#e2bd7d", paper: "#422936" });
  const sleeves = sleeveMats();
  for (let i = 0; i < 3; i++) {
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), sleeves[i]);
    poster.position.set(-5 + i * 2.1, 2, 39.76);
    poster.rotation.y = Math.PI;
    root.add(poster);
  }
  addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x5f273b, roughness: 1 }), 9.2, 2.15, 38.2, 0.2, 3.5, 3);
  const curtain = new THREE.MeshStandardMaterial({ color: 0x702b3f, roughness: 1 });
  for (const x of [9.65, 16.9])
    for (let j = 0; j < 4; j++) addBox(root, unitBox, curtain, x + j * 0.12, 2.1, 39.5, 0.13, 3.5, 0.18 + (j % 2) * 0.1);
  card(root, ["SCREEN ONE", "YOUR STUB IS YOUR INVITATION"], 13, 3.58, 39.76, 6.4, 0.2, { ink: "#d9c18c", paper: "#241e24" });

  addBox(root, unitBox, velvet, -2.2, 0.42, 35.2, 1.8, 0.18, 0.7);
  addBox(root, unitBox, velvet, -2.2, 0.72, 34.85, 1.8, 0.48, 0.16);
  addBox(root, unitBox, velvet, 8.4, 0.42, 35.2, 1.8, 0.18, 0.7);
  addBox(root, unitBox, velvet, 8.4, 0.72, 34.85, 1.8, 0.48, 0.16);
  addBox(root, unitBox, velvet, 17.0, 0.42, 36.6, 1.8, 0.18, 0.7);
  addBox(root, unitBox, wood, 6.0, 1.15, 34.2, 0.7, 2.1, 0.12);

  return {
    film,
    update(dt, t, { zone, reduced }) {
      if (zone === "rivoli" && film.userData.draw) film.userData.draw(reduced ? Math.floor(t) : t);
    },
  };
}
