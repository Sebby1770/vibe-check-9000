/* Velvet Tuesday's ground floor as a 1954 Art Deco ballroom around the visor-era dance floor: black lacquer
   wainscot under fluted plum walls, gilded pilasters with shell sconces, a coffered plum-and-gilt ceiling with
   a warm cove, a polished terrazzo floor with a brass-framed dance floor, a mirrored onyx backbar behind a
   fluted bar, tufted velvet booths, a stepped gilt proscenium with swagged velvet curtains round REXA's stage,
   a halo rig carrying the lasers and pendants, a crystal chandelier hanging through the atrium, and an
   entrance with a carpet runner, palms and a host stand.

   Everything static is merged per material (boxBatch). Footprints match the club colliders in zones.js, the
   named NPC spots and the seats, and nothing stands in front of the club's signs. */
import * as THREE from "three";
import { boxBatch } from "./interiors/batch.js";
import { withPbr } from "./textures.js";
import { SECOND_Y, ATRIUM, STAIRS } from "./zones.js";

function canvas(w, h, draw, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
let seed = 11;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function makeMats(env) {
  // Vertical flutes, 7.5 cm apart: the relief becomes the normal map.
  const flutes = withPbr(canvas(128, 128, (g, w, h) => {
    for (let x = 0; x < w; x++) { const v = 0.5 + 0.5 * Math.cos((x / w) * Math.PI * 2 * 4); g.fillStyle = `rgb(${90 + v * 120},${90 + v * 120},${90 + v * 120})`; g.fillRect(x, 0, 1, h); }
  }), { worldTile: [0.6, 0.6], strength: 1.6, rough: [0.36, 0.12], size: 128 });
  // Black terrazzo: fine marble and brass chips in a near-black cement, polished, with brass strips every 1.6 m.
  const terrazzo = withPbr(canvas(512, 512, (g, w, h) => {
    g.fillStyle = "#1d1a19"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3200; i++) {
      const r = 0.6 + rnd() * 2.2, c = ["#3a3532", "#5a524b", "#8c8378", "#2a2624", "#b89a5a", "#d8cbb4"][Math.floor(rnd() * 6)];
      g.globalAlpha = 0.5 + rnd() * 0.5;
      g.fillStyle = c; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, r, r * (0.6 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    g.fillStyle = "#b08f4a"; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
  }), { worldTile: [1.6, 1.6], strength: 0.5, rough: [0.12, 0.1], size: 256 });
  // Backlit onyx: amber veins.
  const onyx = canvas(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#f6c27a"); gr.addColorStop(0.5, "#e59a4a"); gr.addColorStop(1, "#f8d39a");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(120,60,20,0.35)";
    for (let i = 0; i < 26; i++) { g.lineWidth = 1 + rnd() * 3; g.beginPath(); let x = rnd() * w, y = 0; g.moveTo(x, y); while (y < h) { x += (rnd() - 0.5) * 30; y += 10 + rnd() * 20; g.lineTo(x, y); } g.stroke(); }
  });
  const carpet = canvas(256, 256, (g, w, h) => {
    g.fillStyle = "#6e1420"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#c8a04a"; g.lineWidth = 6; g.strokeRect(14, -10, w - 28, h + 20);
    g.lineWidth = 2; g.strokeRect(26, -10, w - 52, h + 20);
    g.fillStyle = "rgba(200,160,74,0.35)";
    for (let y = 40; y < h; y += 64) { g.beginPath(); g.moveTo(w / 2, y - 18); g.lineTo(w / 2 + 18, y); g.lineTo(w / 2, y + 18); g.lineTo(w / 2 - 18, y); g.fill(); }
  });
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
  return {
    lacquer: std(0x0e0b0e, { roughness: 0.22, metalness: 0.15, envMap: env, envMapIntensity: 0.8 }),
    plum: std(0x4a1a34, { map: flutes, roughness: 0.4, metalness: 0.08 }),
    plumFlat: std(0x3a1428, { roughness: 0.7 }),
    gilt: std(0xd8ac52, { roughness: 0.24, metalness: 0.92, envMap: env, envMapIntensity: 1.1 }),
    brass: std(0xc9a227, { roughness: 0.3, metalness: 0.88, envMap: env }),
    chrome: std(0xdfe4e8, { roughness: 0.1, metalness: 1, envMap: env }),
    mirror: std(0xc8d0d6, { roughness: 0.04, metalness: 1, envMap: env, envMapIntensity: 1.25 }),
    marbleBlack: std(0x1a1716, { roughness: 0.14, metalness: 0.1, envMap: env }),
    marble: std(0xece4d6, { roughness: 0.16, metalness: 0.05, envMap: env }),
    terrazzo: std(0xffffff, { map: terrazzo, roughness: 0.2, envMap: env, envMapIntensity: 0.7 }),
    onyx: new THREE.MeshStandardMaterial({ map: onyx, emissive: 0xffffff, emissiveMap: onyx, emissiveIntensity: 0.85, roughness: 0.3 }),
    cove: new THREE.MeshBasicMaterial({ color: 0xffc27a }),
    glowWarm: std(0xffe6c0, { emissive: 0xffc47a, emissiveIntensity: 1.3 }),
    crystal: std(0xfff4dc, { emissive: 0xffe2a8, emissiveIntensity: 1.6, roughness: 0.1 }),
    velvet: new THREE.MeshPhysicalMaterial({ color: 0x5e0f24, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(0xff6a88), sheenRoughness: 0.35 }),
    velvetDeep: new THREE.MeshPhysicalMaterial({ color: 0x420a1a, roughness: 0.92, sheen: 1, sheenColor: new THREE.Color(0xd04a6a), sheenRoughness: 0.4, side: THREE.DoubleSide }),
    leather: std(0x7a1418, { roughness: 0.38 }),
    walnut: std(0x3e2418, { roughness: 0.32, metalness: 0.05, envMap: env, envMapIntensity: 0.5 }),
    carpet: std(0xffffff, { map: carpet, roughness: 0.95 }),
    palm: std(0x2f5a30, { roughness: 0.75, side: THREE.DoubleSide }),
    pot: std(0x14110f, { roughness: 0.3, metalness: 0.3 }),
    bottle: [0x2a5a3a, 0x7a3a1a, 0xc9a24a, 0x3a1a4a, 0xd8d0c0, 0x1a3a5a].map((c) => std(c, { roughness: 0.12, metalness: 0.2, transparent: true, opacity: 0.88 })),
    grille: std(0x2a1a10, { roughness: 0.8 }),
  };
}

const FROND = (() => { const g = new THREE.PlaneGeometry(0.2, 1.1); g.translate(0, 0.55, 0); return g; })();
const W = 16.44, FRONT = 12.41, BACK = -16.41, CEIL = 4.31;

/** Folded curtain geometry: `w` wide, `h` tall, `folds` vertical folds of depth `d`, gathered toward one side. */
function curtainGeo(w, h, folds, d, gather = 0) {
  const g = new THREE.PlaneGeometry(w, h, folds * 8, 6), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), u = (x / w + 0.5);
    const tie = gather ? Math.max(0, 1 - Math.abs(y + h * 0.1) / (h * 0.6)) * gather : 0;
    p.setZ(i, Math.sin(u * folds * Math.PI * 2) * d * (1 + tie));
    p.setX(i, x * (1 - tie * 0.45));
  }
  g.computeVertexNormals();
  return g;
}

export function decorateClub(world, scene, env, { hangLeds = [] } = {}) {
  const m = makeMats(env), b = boxBatch();
  const fy = SECOND_Y;

  // --- floor: terrazzo everywhere, a gilt frame and a black marble step round the dance floor
  b.box(m.terrazzo, 0, 0.004, -2, W * 2 - 0.02, 0.008, FRONT - BACK - 0.02);
  for (const [x, z, sx, sz] of [[0, -8.25, 16.9, 0.5], [0, 8.25, 16.9, 0.5], [-8.25, 0, 0.5, 16], [8.25, 0, 0.5, 16]]) b.box(m.marbleBlack, x, 0.03, z, sx, 0.05, sz);
  for (const [x, z, sx, sz] of [[0, -8.02, 16.1, 0.06], [0, 8.02, 16.1, 0.06], [-8.02, 0, 0.06, 16.1], [8.02, 0, 0.06, 16.1]]) b.box(m.gilt, x, 0.056, z, sx, 0.012, sz);

  // --- walls: lacquer wainscot, fluted plum, a gilt frieze with a warm cove under the ceiling
  const wall = (axis, a0, a1, at, n, top = CEIL, frieze = true) => {
    const len = a1 - a0, mid = (a0 + a1) / 2;
    const put = (y, h, d, mat) => axis === "x" ? b.box(mat, mid, y, at + n * d / 2, len, h, d) : b.box(mat, at + n * d / 2, y, mid, d, h, len);
    put(0.55, 1.1, 0.05, m.lacquer);
    put(0.08, 0.16, 0.07, m.marbleBlack);
    put(1.12, 0.05, 0.08, m.gilt);
    put(0.62, 0.025, 0.06, m.gilt);
    const upper = Math.min(top, 3.72) - 1.15;
    if (upper > 0) put(1.15 + upper / 2, upper, 0.035, m.plum);
    if (frieze && top >= CEIL - 0.01) {
      put(3.8, 0.16, 0.12, m.gilt);
      put(3.98, 0.2, 0.05, m.plumFlat);
      put(4.12, 0.05, 0.18, m.gilt);
      put(4.16, 0.025, 0.14, m.cove);
      put(4.25, 0.12, 0.08, m.gilt);
    }
  };
  wall("z", BACK + 0.2, FRONT - 0.2, -W, 1);
  wall("z", BACK + 0.2, FRONT - 0.2, W, -1);
  wall("x", -W + 0.05, -3.0, FRONT, -1);
  wall("x", 3.0, W - 0.05, FRONT, -1);
  wall("x", -3.0, -1.75, FRONT, -1, 3.1, false);
  wall("x", 1.75, 3.0, FRONT, -1, 3.1, false);
  wall("x", -W + 0.05, -6.0, BACK, 1);
  wall("x", 6.0, W - 0.05, BACK, 1);

  // --- pilasters (replacing the bare steel columns): black marble base, fluted gilt shaft, stepped capital, shell sconce
  b.box(m.walnut, -16.1, fy + 1.9, 0, 0.5, 3.8, 0.5);
  for (const [x, z] of [[-16.1, -13], [16.1, -13], [-16.1, 12], [16.1, 12], [16.1, 0]]) {
    const s = Math.sign(x);
    b.box(m.marbleBlack, x, 0.4, z, 0.7, 0.8, 0.7);
    b.box(m.gilt, x, 0.82, z, 0.62, 0.05, 0.62);
    for (let k = -2; k <= 2; k++) b.box(m.gilt, x, 2.35, z + k * 0.11, 0.5, 3.0, 0.07);
    b.box(m.walnut, x, 2.35, z, 0.44, 3.0, 0.5);
    for (const [y, w2] of [[3.9, 0.66], [4.04, 0.74], [4.18, 0.84]]) b.box(m.gilt, x, y, z, w2, 0.12, w2);
    b.box(m.walnut, x, fy + 1.9, z, 0.5, 3.8, 0.5);
    // Shell sconce on the room face.
    const fx = x - s * 0.36;
    b.box(m.gilt, fx, 2.45, z, 0.06, 0.34, 0.18);
    b.geo(m.glowWarm, new THREE.SphereGeometry(0.2, 14, 8, 0, Math.PI, 0, Math.PI / 2), fx - s * 0.02, 2.62, z, 1, 1.4, 1, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0);
  }

  // --- coffered ceiling outside the atrium: plum panels, gilt beams, rosettes where they cross
  const strips = [
    [-W, 13.2, 5.6, FRONT], [13.2, W, 10.15, FRONT],
    [-W, W, BACK, ATRIUM.minZ - 0.2], [-W, ATRIUM.minX - 0.2, ATRIUM.minZ - 0.2, ATRIUM.maxZ + 0.2],
    [ATRIUM.maxX + 0.2, 13.2, ATRIUM.minZ - 0.2, ATRIUM.maxZ + 0.2], [13.2, W, ATRIUM.minZ - 0.2, STAIRS.minZ],
  ];
  for (const [x0, x1, z0, z1] of strips) {
    b.box(m.plumFlat, (x0 + x1) / 2, CEIL - 0.006, (z0 + z1) / 2, x1 - x0, 0.012, z1 - z0);
    for (let x = Math.ceil(x0 / 3.2) * 3.2; x <= x1; x += 3.2) b.box(m.gilt, x, CEIL - 0.08, (z0 + z1) / 2, 0.14, 0.16, z1 - z0);
    for (let z = Math.ceil(z0 / 3.2) * 3.2; z <= z1; z += 3.2) {
      b.box(m.gilt, (x0 + x1) / 2, CEIL - 0.08, z, x1 - x0, 0.16, 0.14);
      for (let x = Math.ceil(x0 / 3.2) * 3.2; x <= x1; x += 3.2) b.cyl(m.gilt, x, CEIL - 0.19, z, 0.16, 0.12, 0.08, 16);
    }
  }
  // A gilt fascia and cove round the atrium opening.
  const ax0 = ATRIUM.minX - 0.12, ax1 = ATRIUM.maxX + 0.12, az0 = ATRIUM.minZ - 0.12, az1 = ATRIUM.maxZ + 0.12;
  for (const [x, z, sx, sz] of [[0, az0, ax1 - ax0, 0.1], [0, az1, ax1 - ax0, 0.1], [ax0, -1.1, 0.1, az1 - az0], [ax1, -1.1, 0.1, az1 - az0]]) {
    b.box(m.gilt, x, CEIL - 0.12, z, sx + 0.1, 0.3, sz);
    b.box(m.cove, x, CEIL - 0.29, z, sx, 0.03, sz + 0.03);
  }

  // --- the halo rig: a gilt ring that carries the lasers and eight pendants (their coloured bands are hangLeds)
  b.geo(m.gilt, new THREE.TorusGeometry(6.2, 0.07, 10, 96), 0, 4.08, 0, 1, 1, 1, 0, Math.PI / 2, 0);
  b.geo(m.gilt, new THREE.TorusGeometry(6.2, 0.035, 8, 96), 0, 3.96, 0, 1, 1, 1, 0, Math.PI / 2, 0);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.box(m.gilt, Math.cos(a) * 6.2, 4.2, Math.sin(a) * 6.2, 0.05, 0.24, 0.05); }
  const pendants = [];
  hangLeds.forEach((mat, i) => {
    const a = (i / hangLeds.length) * Math.PI * 2 + Math.PI / 8, x = Math.cos(a) * 6.2, z = Math.sin(a) * 6.2;
    b.cyl(m.chrome, x, 3.82, z, 0.012, 0.012, 0.48, 6);
    b.geo(m.chrome, new THREE.CylinderGeometry(0.1, 0.16, 0.08, 18), x, 3.56, z);
    b.geo(m.glowWarm, new THREE.CylinderGeometry(0.38, 0.12, 0.14, 24), x, 3.46, z);
    b.geo(m.gilt, new THREE.CylinderGeometry(0.4, 0.4, 0.02, 24), x, 3.4, z);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.03, 6, 28), mat);
    band.rotation.x = Math.PI / 2; band.position.set(x, 3.36, z);
    pendants.push(band);
  });

  // --- the crystal chandelier hanging through the atrium, above the mirror ball
  const cz = -1.1;
  b.cyl(m.gilt, 0, 7.6, cz, 0.03, 0.03, 1.1, 8);
  b.geo(m.gilt, new THREE.CylinderGeometry(0.5, 0.3, 0.12, 24), 0, 8.1, cz);
  for (const [ry, r, n, drop] of [[6.95, 1.55, 28, 0.55], [6.45, 1.1, 22, 0.45], [6.0, 0.62, 14, 0.35]]) {
    b.geo(m.gilt, new THREE.TorusGeometry(r, 0.035, 8, 48), 0, ry, cz, 1, 1, 1, 0, Math.PI / 2, 0);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const x = Math.cos(a) * r, z = cz + Math.sin(a) * r;
      b.cyl(m.crystal, x, ry - drop / 2, z, 0.012, 0.012, drop, 4);
      b.geo(m.crystal, new THREE.OctahedronGeometry(0.06, 0), x, ry - drop - 0.05, z, 1, 1.8, 1);
    }
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3; b.box(m.gilt, Math.cos(a) * r / 2, ry + 0.25, cz + Math.sin(a) * r / 2, 0.03, 0.5, 0.03, a, 0, 0.5); }
  }
  b.geo(m.crystal, new THREE.SphereGeometry(0.22, 16, 12), 0, 5.75, cz);

  // --- the bar (west): fluted lacquer front, marble top with a glow, brass rail, mirrored onyx backbar
  const bz0 = -8, bz1 = 8;
  for (let z = bz0 + 0.12; z < bz1; z += 0.16) b.box(m.lacquer, -14.47, 0.55, z, 0.06, 0.9, 0.11);
  b.box(m.walnut, -15.0, 0.55, 0, 1.0, 1.0, bz1 - bz0);
  b.box(m.gilt, -14.45, 0.08, 0, 0.08, 0.16, bz1 - bz0);
  b.box(m.gilt, -14.44, 1.0, 0, 0.04, 0.06, bz1 - bz0);
  b.box(m.marble, -14.98, 1.08, 0, 1.28, 0.06, bz1 - bz0 + 0.2);
  b.cyl(m.marble, -14.34, 1.08, 0, 0.03, 0.03, bz1 - bz0 + 0.2, 10, 0, Math.PI / 2, 0);
  b.box(m.cove, -14.42, 0.98, 0, 0.02, 0.025, bz1 - bz0 - 0.2);
  b.cyl(m.brass, -14.2, 0.22, 0, 0.03, 0.03, bz1 - bz0, 10, 0, Math.PI / 2, 0);
  for (let z = bz0 + 0.5; z < bz1; z += 1.5) b.box(m.brass, -14.32, 0.12, z, 0.24, 0.025, 0.03);
  for (const z of [bz0, bz1]) b.cyl(m.walnut, -15.0, 0.55, z, 0.5, 0.5, 1.0, 20, 0, 0, 0);
  // Backbar: cabinet, onyx panels, mirror bays with gilt mullions, glass shelves of bottles, a deco clock.
  b.box(m.lacquer, -16.12, 0.45, 0, 0.56, 0.9, 15.4);
  b.box(m.marbleBlack, -16.1, 0.93, 0, 0.62, 0.05, 15.6);
  for (let k = 0; k < 6; k++) {
    const z0 = -7.5 + k * 2.5, zc = z0 + 1.25;
    b.box(m.onyx, -16.395, 1.95, zc, 0.012, 1.6, 2.2);
    b.box(m.mirror, -16.39, 3.25, zc, 0.012, 0.9, 2.2);
    for (const y of [1.3, 1.82, 2.34]) {
      b.box(m.chrome, -16.2, y, zc, 0.34, 0.015, 2.2);
      for (let j = 0; j < 9; j++) {
        const z = z0 + 0.25 + j * 0.25, tall = 0.22 + ((j + k + y * 10) % 4) * 0.05;
        const bm = m.bottle[(j * 7 + k * 3 + Math.round(y * 10)) % m.bottle.length];
        b.cyl(bm, -16.2 + ((j % 2) - 0.5) * 0.12, y + 0.008 + tall / 2, z, 0.035, 0.045, tall, 8);
        b.cyl(bm, -16.2 + ((j % 2) - 0.5) * 0.12, y + 0.008 + tall + 0.04, z, 0.012, 0.018, 0.08, 6);
      }
    }
    b.box(m.gilt, -16.37, 2.45, z0, 0.06, 3.1, 0.08);
  }
  b.box(m.gilt, -16.37, 2.45, 7.5, 0.06, 3.1, 0.08);
  b.box(m.gilt, -16.36, 3.75, 0, 0.08, 0.1, 15.2);
  b.geo(m.gilt, new THREE.CylinderGeometry(0.42, 0.42, 0.06, 32), -16.33, 3.25, 0, 1, 1, 1, 0, 0, Math.PI / 2);
  b.geo(m.marble, new THREE.CylinderGeometry(0.36, 0.36, 0.07, 32), -16.31, 3.25, 0, 1, 1, 1, 0, 0, Math.PI / 2);
  b.box(m.lacquer, -16.27, 3.33, 0.03, 0.02, 0.2, 0.03, 0, 0.6);
  b.box(m.lacquer, -16.27, 3.25, 0.07, 0.02, 0.03, 0.18, 0, 0.9);
  // Stools: chrome pedestals, red leather seats, foot rings (seated drinkers keep their spots).
  // No stool at z 0.6: that's where Ion stands.
  for (const z of [-6, -3.8, -1.6, 2.8, 5.0, 7.2, -8.35]) {
    b.cyl(m.chrome, -14.15, 0.02, z, 0.24, 0.26, 0.04, 20);
    b.cyl(m.chrome, -14.15, 0.36, z, 0.04, 0.05, 0.66, 10);
    b.geo(m.chrome, new THREE.TorusGeometry(0.2, 0.015, 6, 20), -14.15, 0.32, z, 1, 1, 1, 0, Math.PI / 2, 0);
    b.cyl(m.leather, -14.15, 0.72, z, 0.21, 0.19, 0.09, 20);
    b.cyl(m.chrome, -14.15, 0.672, z, 0.2, 0.2, 0.012, 20);
  }

  // --- VIP booths (east): tufted crescent banquettes facing the floor, round tables with shaded lamps
  for (const [x, z] of [[13.6, -4.2], [13.6, 1.8], [13.2, 6.6]]) {
    const bx = x + 0.55;
    b.box(m.walnut, bx, 0.12, z, 1.0, 0.24, 1.55);
    b.box(m.velvet, bx - 0.05, 0.36, z, 0.95, 0.2, 1.5);
    b.box(m.velvet, bx + 0.42, 0.78, z, 0.2, 0.75, 1.5);
    for (const s of [-1, 1]) { b.box(m.velvet, bx - 0.05, 0.56, z + s * 0.72, 0.9, 0.3, 0.16); b.box(m.gilt, bx - 0.05, 0.42, z + s * 0.8, 0.95, 0.02, 0.02); }
    for (let k = 0; k < 5; k++) for (let r = 0; r < 2; r++) b.geo(m.gilt, new THREE.SphereGeometry(0.018, 6, 4), bx + 0.31, 0.68 + r * 0.26, z - 0.56 + k * 0.28 + r * 0.14);
    b.box(m.gilt, bx + 0.42, 1.17, z, 0.24, 0.04, 1.54);
    const tx = x - 0.75;
    b.cyl(m.marbleBlack, tx, 0.62, z, 0.42, 0.42, 0.04, 28);
    b.cyl(m.gilt, tx, 0.6, z, 0.43, 0.43, 0.02, 28);
    b.cyl(m.chrome, tx, 0.31, z, 0.04, 0.05, 0.58, 10);
    b.cyl(m.chrome, tx, 0.02, z, 0.24, 0.26, 0.04, 18);
    b.cyl(m.gilt, tx, 0.72, z, 0.03, 0.05, 0.16, 8);
    b.geo(m.glowWarm, new THREE.CylinderGeometry(0.07, 0.13, 0.13, 16, 1, true), tx, 0.86, z);
    for (const s of [-1, 1]) { b.geo(m.marble, new THREE.CylinderGeometry(0.035, 0.03, 0.12, 8), tx + 0.12, 0.7, z + s * 0.14); }
  }

  // --- REXA's stage: lacquer and chrome bandstand, stepped gilt proscenium, velvet curtains, radio-cabinet speakers
  b.box(m.lacquer, 0, 0.3, -12.1, 10.2, 0.6, 4.3);
  for (const y of [0.18, 0.42]) b.box(m.chrome, 0, y, -9.94, 10.2, 0.04, 0.02);
  b.box(m.gilt, 0, 0.61, -9.97, 10.24, 0.03, 0.08);
  for (let x = -4.6; x <= 4.6; x += 0.92) b.geo(m.glowWarm, new THREE.SphereGeometry(0.05, 10, 6), x, 0.3, -9.94);
  b.box(m.marbleBlack, 0, 0.642, -12.1, 9.8, 0.02, 4.0);
  // The booth itself: a curved walnut console with a gilt fascia (REXA stands behind it).
  b.box(m.walnut, 0, 0.98, -12.2, 3.4, 0.68, 0.9);
  b.box(m.gilt, 0, 1.0, -11.74, 3.44, 0.06, 0.02);
  for (let x = -1.5; x <= 1.5; x += 0.25) b.box(m.gilt, x, 0.86, -11.74, 0.03, 0.36, 0.015);
  b.box(m.marbleBlack, 0, 1.33, -12.25, 3.5, 0.04, 1.0);
  // Proscenium: three stepped gilt frames round the screen, then the curtains.
  for (let k = 0; k < 3; k++) {
    const x = 4.45 + k * 0.28, y0 = 0.6, top = CEIL - 0.05 - k * 0.12, z = BACK + 0.12 + k * 0.1;
    for (const s of [-1, 1]) b.box(m.gilt, s * x, (y0 + top) / 2, z, 0.22, top - y0, 0.14);
  }
  b.box(m.gilt, 0, 4.2, BACK + 0.16, 10.6, 0.2, 0.22);
  b.box(m.gilt, 0, 4.06, BACK + 0.28, 9.9, 0.08, 0.12);
  const swag = curtainGeo(1.3, 3.6, 5, 0.06, 0.6);
  for (const s of [-1, 1]) b.geo(m.velvetDeep, swag, s * 5.6, 0.6 + 1.8, BACK + 0.55, 1, 1, 1, 0, 0, 0);
  for (const s of [-1, 1]) { b.cyl(m.gilt, s * 5.25, 2.1, BACK + 0.62, 0.05, 0.05, 0.14, 10, 0, Math.PI / 2, 0); }
  // Radio-cabinet speakers on the stage wings.
  for (const x of [-5.4, 5.4]) {
    b.box(m.walnut, x, 1.35, -12.35, 1.2, 1.4, 1.0);
    b.box(m.grille, x, 1.4, -11.84, 0.95, 1.05, 0.02);
    for (let k = -3; k <= 3; k++) b.box(m.gilt, x + k * 0.13, 1.4, -11.83, 0.025, 1.05, 0.015);
    b.box(m.gilt, x, 2.08, -12.35, 1.24, 0.06, 1.04);
    b.box(m.walnut, x, 0.75, -12.35, 1.1, 0.25, 0.9);
  }

  // --- entrance: carpet runner, palms in lacquer urns, a host stand, and a gilt rope to the coat check
  b.box(m.carpet, 0, 0.012, 10.3, 2.4, 0.012, 4.0);
  for (const s of [-1, 1]) {
    const x = s * 2.4, z = 11.75;
    b.cyl(m.pot, x, 0.32, z, 0.32, 0.22, 0.64, 18);
    b.cyl(m.gilt, x, 0.62, z, 0.33, 0.33, 0.04, 18);
    b.cyl(m.walnut, x, 1.05, z, 0.03, 0.045, 0.85, 6);
    for (let i = 0; i < 11; i++) b.geo(m.palm, FROND, x, 1.4, z, 1, 1, 1, (i / 11) * Math.PI * 2, 0.85 + (i % 3) * 0.18, 0);
  }
  b.box(m.walnut, 2.9, 0.55, 10.7, 0.7, 1.1, 0.5);
  b.box(m.gilt, 2.9, 1.11, 10.7, 0.78, 0.04, 0.58);
  for (let k = -2; k <= 2; k++) b.box(m.gilt, 2.9 + k * 0.12, 0.55, 10.44, 0.025, 0.9, 0.015);
  b.geo(m.glowWarm, new THREE.CylinderGeometry(0.06, 0.1, 0.1, 12, 1, true), 3.1, 1.26, 10.7);
  b.cyl(m.gilt, 3.1, 1.17, 10.7, 0.015, 0.015, 0.12, 6);
  // Photo booth and coat check get deco skins (their footprints are unchanged).
  b.box(m.lacquer, -8.2, 1.15, 10.6, 1.4, 2.3, 1.05);
  b.box(m.gilt, -8.2, 2.33, 10.6, 1.46, 0.06, 1.1);
  b.geo(m.velvetDeep, curtainGeo(0.8, 1.7, 4, 0.03), -8.42, 1.0, 10.03, 1, 1, 1, 0, 0, 0);
  b.box(m.onyx, -7.72, 1.75, 10.06, 0.32, 0.5, 0.02);
  b.box(m.gilt, -7.72, 1.75, 10.07, 0.36, 0.54, 0.01);
  b.box(m.glowWarm, -8.2, 2.12, 10.06, 1.0, 0.16, 0.02);
  b.box(m.walnut, 8.15, 0.55, 10.45, 1.4, 1.1, 0.4);
  b.box(m.marble, 8.15, 1.12, 10.4, 1.5, 0.05, 0.55);
  b.box(m.gilt, 8.15, 2.15, 11.0, 1.6, 0.04, 0.04);
  for (let k = 0; k < 6; k++) { b.box(m.chrome, 7.55 + k * 0.24, 2.05, 11.0, 0.015, 0.16, 0.015); b.box([m.velvet, m.walnut, m.plumFlat][k % 3], 7.55 + k * 0.24, 1.55, 11.05, 0.36, 0.9, 0.12); }

  const meshes = b.flush(world);
  for (const p of pendants) world.add(p);
  return { meshes, pendants };
}

/** The supper-club lounge upstairs (floor 4.4, ceiling 8.18): crystal chandeliers, round tables in white
    cloths with shaded lamps and silver buckets, velvet tub chairs where the regulars sit, and a gilt
    sunburst over folded velvet curtains behind Velma's stage. */
export function decorateLounge(world, env, { tables = [] } = {}) {
  const m = makeMats(env), b = boxBatch(), fy = SECOND_Y, top = 8.18;
  const cloth = new THREE.MeshStandardMaterial({ color: 0xf4eee2, roughness: 0.85 });
  for (const [x, z] of [[-11.2, 6.4], [10.6, 6.2], [-10.8, -4.5], [10.4, -5.2], [-11.0, 1.0], [10.5, 1.2]]) {
    b.cyl(m.gilt, x, top - 0.35, z, 0.02, 0.02, 0.7, 6);
    b.geo(m.gilt, new THREE.CylinderGeometry(0.22, 0.12, 0.08, 16), x, top - 0.04, z);
    for (const [y, r, n, drop] of [[top - 0.72, 0.62, 16, 0.32], [top - 1.0, 0.38, 10, 0.26]]) {
      b.geo(m.gilt, new THREE.TorusGeometry(r, 0.022, 6, 32), x, y, z, 1, 1, 1, 0, Math.PI / 2, 0);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
        b.cyl(m.crystal, px, y - drop / 2, pz, 0.008, 0.008, drop, 4);
        b.geo(m.crystal, new THREE.OctahedronGeometry(0.04, 0), px, y - drop - 0.03, pz, 1, 1.7, 1);
      }
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; b.geo(m.glowWarm, new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), x + Math.cos(a) * r, y + 0.07, z + Math.sin(a) * r); }
    }
    b.geo(m.crystal, new THREE.SphereGeometry(0.1, 12, 8), x, top - 1.42, z);
  }
  for (const [x, z] of tables) {
    b.cyl(cloth, x, fy + 0.4, z, 0.52, 0.56, 0.78, 28);
    b.cyl(cloth, x, fy + 0.795, z, 0.53, 0.53, 0.02, 28);
    b.cyl(m.gilt, x, fy + 0.84, z, 0.025, 0.04, 0.08, 8);
    b.geo(m.glowWarm, new THREE.CylinderGeometry(0.06, 0.11, 0.11, 14, 1, true), x, fy + 0.93, z);
    b.cyl(m.chrome, x + 0.22, fy + 0.9, z + 0.18, 0.07, 0.06, 0.18, 14);
    b.cyl(m.bottle[0], x + 0.22, fy + 1.02, z + 0.18, 0.03, 0.035, 0.22, 8);
    for (const s of [-1, 1]) {
      // Velvet tub chair facing the table (the sitters at x ± 0.72 keep their seats).
      const cx = x + s * 0.72;
      b.cyl(m.velvet, cx, fy + 0.22, z, 0.3, 0.27, 0.44, 20);
      b.geo(m.velvet, new THREE.CylinderGeometry(0.32, 0.32, 0.38, 20, 1, true, s > 0 ? Math.PI * 0.25 : Math.PI * 1.25, Math.PI * 1.5), cx, fy + 0.6, z, 1, 1, 1, Math.PI / 2, 0, 0);
      b.geo(m.gilt, new THREE.TorusGeometry(0.31, 0.015, 6, 24), cx, fy + 0.03, z, 1, 1, 1, 0, Math.PI / 2, 0);
    }
  }
  // Velma's stage: folded curtains under a gilt sunburst fan.
  b.geo(m.velvetDeep, curtainGeo(7.2, 2.4, 14, 0.07), 0, fy + 1.7, -14.56);
  // A flattened fan (it has to fit under the 8.18 ceiling): rays from an inner to an outer ellipse.
  const fanY = fy + 2.92, kY = 0.22;
  for (let k = 0; k <= 12; k++) {
    const a = Math.PI * (k / 12), r0 = 0.75, r1 = 3.4;
    const x0 = Math.cos(a) * r0, y0 = Math.sin(a) * r0 * kY, x1 = Math.cos(a) * r1, y1 = Math.sin(a) * r1 * kY;
    b.box(m.gilt, (x0 + x1) / 2, fanY + (y0 + y1) / 2, -14.6, Math.hypot(x1 - x0, y1 - y0), 0.05, 0.04, 0, 0, Math.atan2(y1 - y0, x1 - x0));
  }
  b.geo(m.gilt, new THREE.CircleGeometry(0.75, 24, 0, Math.PI), 0, fanY, -14.57, 1, kY * 2, 1);
  b.box(m.gilt, 0, fy + 2.93, -14.58, 7.6, 0.08, 0.1);
  b.flush(world);
}
