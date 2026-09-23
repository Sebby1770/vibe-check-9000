/* REX'S RECORDS — rect x -38.2..-28.2, z 32.05..40.0 (storefront z 32.05), ceiling underside y 3.84; door gap x -34.45..-31.95.
   Targets: NPC sid (-33.2, 37.15); prop vinyl-bin (-36.5, 33.8); seat listen-booth (-30.15, 33.85, looks at -33.2, 35.2);
   street prop signal-sleeve (-29.2, 35.9) = the Silver Sleeve display below; enter-records drops you at (-33.2, 33.5) facing z 37.2;
   street-life.js hides a "47TH REGULAR" seal at (-33.2, 1.25, 37.51) on the counter. Collider: counter x -37.4..-29.0, z 37.55..39.35. */
import * as THREE from "three";
import { addBox, unitBox } from "../kit.js";
import { randomPedestrian } from "../human.js";
import { printedCard } from "../shop-art.js";
import { card, sharedMats, sleeveMats, shopRoom } from "./common.js";

export function colliders() {
  return [{ minX: -37.4, maxX: -29.0, minZ: 37.55, maxZ: 39.35, minY: -1, maxY: 1.5 }];
}

export function build({ root, mats, shop, lamp, place, crowds }) {
  const { wood, cream, black } = mats;
  const { brass, slate } = sharedMats();
  addBox(root, unitBox, wood, -33.2, 0.02, 36.0, 9.6, 0.04, 7.6);
  addBox(root, unitBox, black, -33.2, 3.85, 36.0, 9.6, 0.08, 7.6);
  for (const x of [-36.6, -30.0]) {
    for (let i = 0; i < 4; i++) {
      addBox(root, unitBox, wood, x, 0.42, 33.6 + i * 0.85, 1.15, 0.55, 0.7);
      addBox(root, unitBox, cream, x, 0.62, 33.6 + i * 0.85, 1.05, 0.08, 0.6);
    }
  }
  addBox(root, unitBox, wood, -33.2, 0.55, 38.35, 8.2, 1.1, 1.5);
  addBox(root, unitBox, cream, -33.2, 1.12, 38.35, 8.0, 0.06, 1.35);
  lamp(-33.2, 35.4, 0xaa66ff, 26);
  crowds.push(place(randomPedestrian(0.21, { outfit: "raver", anim: "idle" }), -36.4, 34.1, 0.4, "idle"));
  crowds.push(place(randomPedestrian(0.44, { outfit: "host", anim: "lean" }), -30.2, 35.0, -1.2, "lean"));
  crowds.push(place(randomPedestrian(0.62, { outfit: "dj", anim: "sit" }), -36.55, 36.4, Math.PI / 2, "sit", { sitHips: 0.52 }));

  shopRoom(root, mats, shop, 0x687163);
  const sleeves = sleeveMats();
  for (let i = 0; i < 3; i++) {
    const album = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), sleeves[i]);
    album.position.set(-35.1 + i * 1.9, 2.58, 39.82);
    album.rotation.y = Math.PI;
    root.add(album);
    const copies = new THREE.InstancedMesh(new THREE.BoxGeometry(0.48, 0.48, 0.045), sleeves[i], 12);
    const d = new THREE.Object3D();
    for (let j = 0; j < 12; j++) {
      d.position.set(j < 6 ? -36.6 : -30, 0.88, 33.4 + (j % 6) * 0.4 + i * 0.065);
      d.rotation.set(-0.18, 0, 0);
      d.updateMatrix();
      copies.setMatrixAt(j, d.matrix);
    }
    root.add(copies);
  }
  card(root, ["FLIP THROUGH THE BINS", "33⅓ • LONG PLAY • GOOD TROUBLE"], -33.2, 3.39, 39.79, 6.3, 0.45);
  card(root, ["JAZZ"], -36.6, 0.91, 33.2, 0.85, 0.3);
  card(root, ["TOMORROW"], -30, 0.91, 33.2, 0.95, 0.3);
  addBox(root, unitBox, slate, -30.1, 0.92, 36.7, 1.25, 0.16, 0.8);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.012, 32), black);
  disc.position.set(-30.1, 1.02, 36.7);
  root.add(disc);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.016, 24), brass);
  label.position.copy(disc.position);
  label.position.y += 0.008;
  root.add(label);
  addBox(root, unitBox, brass, -29.65, 1.05, 36.6, 0.025, 0.025, 0.45);
  card(root, ["LISTEN HERE", "SID DOESN'T MIND"], -29.9, 1.6, 37.0, 1.6, 0.55);

  // The Silver Sleeve (expansion mystery fixture; interaction target signal-sleeve sits at its front).
  addBox(root, unitBox, new THREE.MeshStandardMaterial({ color: 0x604538, roughness: 0.75 }), -29.2, 0.49, 36, 1.1, 0.98, 0.7);
  const silver = new THREE.Mesh(
    new THREE.PlaneGeometry(0.63, 0.68),
    new THREE.MeshBasicMaterial({
      map: printedCard(["THE SILVER SLEEVE", "NO ARTIST · NO YEAR"], { ink: "#283c42", paper: "#c3d0cf", width: 768, height: 384 }),
      side: THREE.DoubleSide,
    }),
  );
  silver.position.set(-29.2, 1.44, 36);
  silver.rotation.y = Math.PI;
  root.add(silver);

  return {
    disc,
    label,
    update(dt, t, { zone }) {
      if (zone !== "records") return;
      disc.rotation.y += dt * 2;
      label.rotation.y += dt * 2;
    },
  };
}
