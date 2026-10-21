/* The 47th Street platform as a real 1950s IRT station: white glazed tile with a terracotta-and-green mosaic
   band, mosaic "47" tablets, the station name repeated across the tracks, framed advertising cards, green
   riveted columns along the platform edge, a warning strip, a dark trackbed with rails, steel ceiling beams
   with frosted lamps, and slatted wooden benches. Everything is lit-material and batched (no new lights, no
   signs), and nothing here is a collider, so every route to the train is unchanged. */
import * as THREE from "three";
import { boxBatch } from "./interiors/batch.js";
import { withPbr } from "./textures.js";
import { SUBWAY_Y, PLATFORM, SUB_STAIRS } from "./zones.js";

function canvas(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
const FONT = '"Big Shoulders Text", "Oswald", "Arial Narrow", sans-serif';
const SERIF = "Georgia, 'Times New Roman', serif";

function mosaic(text, w, h, { bg = "#efe6d2", ink = "#1f4a32", border = "#a8452a" } = {}) {
  return canvas(w, h, (g) => {
    g.fillStyle = border; g.fillRect(0, 0, w, h);
    const t = Math.round(h * 0.09);
    // Little tesserae: the border in two colours, the field in cream.
    for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) {
      const edge = x < t || y < t || x > w - t || y > h - t;
      g.fillStyle = edge ? ((x + y) / 8) % 2 ? border : "#2f6a4a" : bg;
      g.fillRect(x + 1, y + 1, 6, 6);
    }
    g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 ${Math.round(h * 0.52)}px ${SERIF}`;
    g.fillText(text, w / 2, h / 2 + h * 0.03);
  });
}

const ADS = [
  { bg: "#c9302c", ink: "#f6ecd6", lines: ["RHEINGOLD", "EXTRA DRY LAGER", "MY BEER IS RHEINGOLD — THE DRY BEER"] },
  { bg: "#f2e2b6", ink: "#2a2a2a", lines: ["MISS SUBWAYS", "NOVEMBER 1954", "VOTE AT ANY BOOTH"] },
  { bg: "#1f3a5a", ink: "#f2e2b6", lines: ["MERIDIAN", "TELEVISION", "SEE TOMORROW TODAY"] },
  { bg: "#2f6a4a", ink: "#f6ecd6", lines: ["CHECKER CAB", "WHEREVER YOU'RE GOING", "CIRCLE 7-7000"] },
  { bg: "#e8c25a", ink: "#3a1a10", lines: ["THE RIVOLI", "NEON IN THE RAIN", "NOW SHOWING · 47TH ST"] },
  { bg: "#6a1e2a", ink: "#f2e2b6", lines: ["VELVET TUESDAY", "DANCING NIGHTLY", "UPSTAIRS: THE LOUNGE"] },
];
function adCard(a) {
  return new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvas(512, 330, (g, w, h) => {
    g.fillStyle = a.bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = a.ink; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = a.ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `800 76px ${FONT}`; g.fillText(a.lines[0], w / 2, h * 0.36);
    g.font = `700 40px ${FONT}`; g.fillText(a.lines[1], w / 2, h * 0.6);
    g.font = `600 24px ${FONT}`; g.fillText(a.lines[2], w / 2, h * 0.8);
  }) });
}

export function decorateSubway(root) {
  const y = SUBWAY_Y, P = PLATFORM;
  const tileTex = withPbr(canvas(256, 256, (g, s) => {
    g.fillStyle = "#9d998f"; g.fillRect(0, 0, s, s);
    for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) {
      const x = c * 64 + (r % 2 ? 32 : 0), yy = r * 32, gr = g.createLinearGradient(0, yy, 0, yy + 30);
      gr.addColorStop(0, "#f6f2e8"); gr.addColorStop(1, "#e2ddd0");
      g.fillStyle = gr; g.fillRect(x + 2, yy + 2, 60, 28);
    }
  }), { worldTile: [0.6, 0.6], strength: 2.2, rough: [0.16, 0.5], size: 256 });
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
  const m = {
    tile: std(0xffffff, { map: tileTex, roughness: 0.25 }),
    cream: std(0xe8d9b6, { roughness: 0.4 }),
    band: std(0xffffff, { map: canvas(256, 32, (g, w, h) => { for (let x = 0; x < w; x += 8) for (let yy = 0; yy < h; yy += 8) { g.fillStyle = ((x + yy) / 8) % 3 === 0 ? "#2f6a4a" : ((x + yy) / 8) % 3 === 1 ? "#a8452a" : "#d8b26a"; g.fillRect(x + 1, yy + 1, 6, 6); } }), roughness: 0.4 }),
    green: std(0x2f5a3c, { roughness: 0.45, metalness: 0.5 }),
    rivet: std(0x3c6a48, { roughness: 0.4, metalness: 0.6 }),
    edge: std(0xe8d79a, { roughness: 0.5 }),
    bed: std(0x161412, { roughness: 0.95 }),
    rail: std(0x8a8a86, { roughness: 0.25, metalness: 0.9 }),
    wood: std(0x7a5232, { roughness: 0.55 }),
    lamp: std(0xfff1d6, { emissive: 0xffe2b0, emissiveIntensity: 1.2 }),
    frame: std(0x2a2620, { roughness: 0.4, metalness: 0.3 }),
  };
  const b = boxBatch();
  const back = P.minZ + 0.12, far = P.maxZ - 0.12, x0 = P.minX + 0.12, x1 = P.maxX - 0.12, len = x1 - x0, cx = (x0 + x1) / 2;
  // Back wall: tile to 1.75 m, mosaic band, cream to the ceiling (2.29). The old poster frames get ad cards.
  for (const [z, n] of [[back, 1], [far, -1]]) {
    b.box(m.tile, cx, y + 0.875, z + n * 0.012, len, 1.75, 0.02);
    b.box(m.band, cx, y + 1.85, z + n * 0.014, len, 0.2, 0.024);
    b.box(m.cream, cx, y + 2.1, z + n * 0.012, len, 0.3, 0.02);
    b.box(m.cream, cx, y + 0.06, z + n * 0.03, len, 0.12, 0.04);
  }
  // Mosaic "47" tablets on the back wall between the ad frames, and the station name across the tracks.
  const tablet = new THREE.MeshStandardMaterial({ map: mosaic("47", 256, 256), roughness: 0.35 });
  const nameMat = new THREE.MeshStandardMaterial({ map: mosaic("47 STREET · RIVOLI", 1024, 160, { ink: "#1f3a5a" }), roughness: 0.35 });
  for (let i = 0; i < 11; i++) {
    const x = P.minX + 3.8 + i * 3.2;
    if (Math.abs(x - SUB_STAIRS.minX - 1.15) < 1.4 || Math.abs(x + 16.7) < 0.9) continue; // stair foot, route map
    b.geo(tablet, new THREE.PlaneGeometry(0.62, 0.62), x, y + 1.3, back + 0.03);
  }
  for (let x = P.minX + 5; x < P.maxX - 4; x += 9) b.geo(nameMat, new THREE.PlaneGeometry(4.2, 0.62), x, y + 1.35, far - 0.03, 1, 1, 1, Math.PI);
  // Ad cards in the existing frames (12 frames, 1.4 × 0.9, every 3.2 m from minX + 2.2).
  const ads = ADS.map(adCard);
  for (let i = 0; i < 12; i++) {
    const x = P.minX + 2.2 + i * 3.2;
    b.box(m.frame, x, y + 1.6, back + 0.025, 1.46, 0.96, 0.03);
    b.geo(ads[i % ads.length], new THREE.PlaneGeometry(1.34, 0.86), x, y + 1.6, back + 0.042);
  }
  // Platform edge, trackbed and rails (the train runs at z 30.45).
  b.box(m.edge, cx, y + 0.003, 29.22, len, 0.006, 0.12);
  b.box(m.bed, cx, y + 0.004, 30.1, len, 0.008, 1.7);
  for (const z of [29.72, 30.48, 31.0]) b.box(m.rail, cx, y + 0.03, z, len, 0.05, 0.07);
  for (let x = x0 + 0.3; x < x1; x += 0.6) b.box(m.wood, x, y + 0.012, 30.2, 0.22, 0.012, 1.5);
  // Riveted green columns along the edge, clear of the stairs and the 12:04 boarding spot.
  for (const x of [-33, -28, -10.5, -5.5, -0.5, 4]) {
    b.box(m.green, x, y + 1.15, 29.05, 0.26, 2.3, 0.08);
    b.box(m.green, x, y + 1.15, 29.05, 0.08, 2.3, 0.26);
    for (const yy of [0.1, 2.2]) b.box(m.green, x, y + yy, 29.05, 0.36, 0.08, 0.36);
    for (let k = 0; k < 7; k++) b.geo(m.rivet, new THREE.SphereGeometry(0.018, 6, 4), x + 0.135, y + 0.35 + k * 0.28, 29.05);
  }
  // Steel ceiling beams across the platform with frosted lamps between them.
  for (let x = x0 + 1.6; x < x1; x += 3.2) {
    b.box(m.green, x, y + 2.22, (back + far) / 2, 0.12, 0.14, far - back);
    if (x + 1.6 < SUB_STAIRS.minX - 0.4 || x + 1.6 > SUB_STAIRS.maxX + 0.4) b.geo(m.lamp, new THREE.CylinderGeometry(0.22, 0.26, 0.06, 16), x + 1.6, y + 2.25, 28.3);
  }
  // Slatted benches against the back wall where people already sit and wait.
  for (const bx of [-14.2, -29.5, 4.5]) {
    for (let k = 0; k < 4; k++) b.box(m.wood, bx, y + 0.44, back + 0.25 + k * 0.1, 2.0, 0.035, 0.08);
    for (let k = 0; k < 3; k++) b.box(m.wood, bx, y + 0.62 + k * 0.12, back + 0.07, 2.0, 0.07, 0.03);
    for (const s of [-1, 1]) { b.box(m.frame, bx + s * 0.9, y + 0.22, back + 0.3, 0.06, 0.44, 0.4); b.box(m.frame, bx + s * 0.9, y + 0.6, back + 0.06, 0.05, 0.4, 0.04); }
  }
  b.flush(root);
}
