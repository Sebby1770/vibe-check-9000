/* The line outside Velvet Tuesday: a red carpet from the door to the kerb, brass canopy poles, wall lanterns,
   a velvet rope on brass stanchions along the facade, and a queue of dressed-up regulars behind it — couples
   talking, a few craning toward the door. Bruno (people.js) works the door; the doorway itself stays clear,
   and the rope line is solid (zones.js) so the queue keeps its shape. */
import * as THREE from "three";
import { boxBatch } from "./interiors/batch.js";
import { randomLounge, animateHuman } from "./human.js";

export const QUEUE = { z: 13.55, ropeZ: 14.45, x0: -2.3, x1: -10.3 };

export function buildClubQueue(scene) {
  const root = new THREE.Group();
  root.name = "Club queue";
  scene.add(root);
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...o });
  const m = {
    brass: std(0xd2a64c, { roughness: 0.25, metalness: 0.92 }),
    velvet: new THREE.MeshPhysicalMaterial({ color: 0x6a0f22, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(0xff6a88), sheenRoughness: 0.4 }),
    carpet: std(0x7a1220, { roughness: 0.95 }),
    lacquer: std(0x0d0a0c, { roughness: 0.2, metalness: 0.2 }),
    leaf: std(0x2e5a2c, { roughness: 0.8 }),
    lamp: std(0xffe6c0, { emissive: 0xffc47a, emissiveIntensity: 1.4 }),
    glass: std(0xfff2d8, { emissive: 0xffd9a0, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 }),
  };
  const b = boxBatch();
  // Red carpet with brass edging, door to kerb.
  b.box(m.carpet, 0, 0.012, 15.5, 2.6, 0.014, 5.7);
  for (const s of [-1, 1]) b.box(m.brass, s * 1.31, 0.016, 15.5, 0.04, 0.012, 5.7);
  // Canopy poles at the canopy's street corners, with brass caps.
  for (const s of [-1, 1]) {
    b.cyl(m.brass, s * 4.0, 1.65, 14.72, 0.045, 0.05, 3.3, 10);
    b.cyl(m.brass, s * 4.0, 0.03, 14.72, 0.14, 0.16, 0.06, 14);
  }
  // Lanterns either side of the door.
  for (const s of [-1, 1]) {
    const x = s * 2.15;
    b.box(m.brass, x, 2.25, 12.86, 0.16, 0.24, 0.04);
    b.box(m.brass, x, 2.4, 12.98, 0.04, 0.04, 0.24);
    b.geo(m.glass, new THREE.CylinderGeometry(0.11, 0.08, 0.32, 6), x, 2.22, 13.1);
    b.geo(m.brass, new THREE.ConeGeometry(0.15, 0.12, 6), x, 2.44, 13.1);
    b.geo(m.lamp, new THREE.SphereGeometry(0.05, 8, 6), x, 2.2, 13.1);
  }
  // A topiary in a lacquer planter on the far side of the door.
  b.box(m.lacquer, 2.75, 0.3, 13.15, 0.6, 0.6, 0.6);
  b.box(m.brass, 2.75, 0.61, 13.15, 0.64, 0.03, 0.64);
  b.geo(m.leaf, new THREE.SphereGeometry(0.42, 14, 10), 2.75, 1.15, 13.15);
  b.geo(m.leaf, new THREE.SphereGeometry(0.28, 12, 8), 2.75, 1.68, 13.15);
  // Velvet rope on brass stanchions along the facade, with a gate post by the door.
  const posts = [];
  for (let x = QUEUE.x0; x >= QUEUE.x1 - 0.01; x -= 1.6) posts.push(x);
  for (const x of posts) {
    b.cyl(m.brass, x, 0.02, QUEUE.ropeZ, 0.16, 0.18, 0.04, 16);
    b.cyl(m.brass, x, 0.5, QUEUE.ropeZ, 0.028, 0.04, 0.96, 10);
    b.geo(m.brass, new THREE.SphereGeometry(0.055, 10, 8), x, 1.0, QUEUE.ropeZ);
  }
  for (let i = 0; i < posts.length - 1; i++) {
    const a = posts[i], c = posts[i + 1];
    for (let k = 0; k < 8; k++) {
      const t = (k + 0.5) / 8, sag = Math.sin(t * Math.PI) * 0.14;
      b.cyl(m.velvet, a + (c - a) * t, 0.95 - sag, QUEUE.ropeZ, 0.024, 0.024, 0.215, 6, 0, 0, Math.PI / 2 + (t - 0.5) * 0.55);
    }
  }
  b.flush(root);
  // One warm lamp under the canopy so the carpet and the line read after dark.
  const glow = new THREE.PointLight(0xffc890, 18, 13, 2);
  glow.position.set(-2.6, 3.05, 13.9);
  root.add(glow);

  // The queue: couples in evening clothes, some chatting, some watching the door.
  const outfits = ["socialite", "lounge", "lady", "salesman", "singer", "lounge", "socialite", "host", "lady"];
  const people = [];
  outfits.forEach((outfit, i) => {
    const h = randomLounge(0.137 * i + 0.21, { outfit, anim: "idle" });
    const x = QUEUE.x0 - 0.55 - i * 0.86;
    const pair = i % 3 === 1 ? -1 : i % 3 === 2 ? 1 : 0;
    h.position.set(x + pair * 0.06, 0, QUEUE.z + (i % 2 ? 0.18 : -0.12));
    // Couples turn to each other; the rest face the door.
    h.rotation.y = pair ? (pair < 0 ? -Math.PI / 2 + 0.4 : Math.PI / 2 - 0.3) : Math.PI / 2 + (i % 2 ? 0.25 : -0.15);
    h.userData.mode = "idle";
    h.userData.chat = !!pair;
    h.userData.phase = i * 1.37;
    root.add(h);
    people.push(h);
  });

  return {
    root,
    people,
    update(t, pos) {
      if (Math.hypot(pos.x, pos.z - 14) > 45) return;
      for (const h of people) {
        const talking = h.userData.chat && Math.sin(t * 0.8 + h.userData.phase * 2.3) > -0.25;
        animateHuman(h, t, { mode: "idle", bpm: 96, talking });
      }
    },
  };
}
