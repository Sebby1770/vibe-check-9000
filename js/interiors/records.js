/* REX'S RECORDS — rect x -38.2..-28.2, z 32.05..40.0 (storefront z 32.05), ceiling underside y 3.84; door gap x -34.45..-31.95.
   Targets: NPC sid (-33.2, 37.15); prop vinyl-bin (-36.5, 33.8); seat listen-booth (-30.15, 33.85, looks at -33.2, 35.2);
   street prop signal-sleeve (-29.2, 35.9) = the Silver Sleeve vitrine; enter-records drops you at (-33.2, 33.5) facing z 37.2;
   street-life.js hides a "47TH REGULAR" seal at (-33.2, 1.25, 37.51) on the counter. Collider: counter x -37.4..-29.0, z 37.55..39.35.
   A jazz-cellar record shop: aubergine + walnut + brass, violet neon cove. Signatures: the glass LISTENING ROOM in the east
   window (spinning deck, VU needles, the Silver Sleeve), a ceiling mobile of hanging LPs, and a painted giant 45 behind Sid.
   The listening room is walk-in through a doorway in its west glass (z 34.3..35.4); the seat and the Silver Sleeve sit inside. */
import * as THREE from "three";
import { randomPedestrian } from "../human.js";
import { sharedMats, sleeveMats } from "./common.js";
import { boxBatch } from "./batch.js";

const PI = Math.PI;

export function colliders() {
  return [
    { minX: -37.4, maxX: -29.0, minZ: 37.55, maxZ: 39.35, minY: -1, maxY: 1.5 },
    // Listening-room glass: west wall either side of its doorway, then the north wall behind the console.
    { minX: -31.62, maxX: -31.48, minZ: 32.1, maxZ: 34.3, minY: -1, maxY: 2.8 },
    { minX: -31.62, maxX: -31.48, minZ: 35.4, maxZ: 36.36, minY: -1, maxY: 2.8 },
    { minX: -31.62, maxX: -28.2, minZ: 36.24, maxZ: 36.36, minY: -1, maxY: 2.8 },
    // Low furniture (the island bin holds the vinyl-bin target, so it is exempt from sight blocking).
    { minX: -38.2, maxX: -34.7, minZ: 32.05, maxZ: 32.95, minY: -1, maxY: 1.3 },
    { minX: -38.2, maxX: -37.28, minZ: 32.95, maxZ: 37.32, minY: -1, maxY: 1.0 },
    { minX: -37.25, maxX: -35.75, minZ: 33.4, maxZ: 34.3, minY: -1, maxY: 1.0 },
    { minX: -35.42, maxX: -34.48, minZ: 35.48, maxZ: 36.42, minY: -1, maxY: 0.9 },
  ];
}

/* ---------- canvas art (6 textures: floor, wallpaper, sleeve sheet, sign sheet, pegboard, giant 45) ---------- */

function canvasTex(w, h, name, paint, repeat = false) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  paint(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.name = name;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function fit(g, text, maxW, size, weight = "800", family = "Georgia, serif") {
  let s = size;
  do g.font = `${weight} ${s}px ${family}`;
  while (g.measureText(text).width > maxW && --s > 6);
  return s;
}

const SANS = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";

function paintFloor(g, W) {
  // Walnut finger-block parquet: 4-plank squares alternating direction.
  g.fillStyle = "#1e1009";
  g.fillRect(0, 0, W, W);
  const cell = W / 8, pw = cell / 4;
  const tones = ["#5b3620", "#4b2b18", "#664027", "#432615", "#553220", "#5f3a22"];
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++)
      for (let k = 0; k < 4; k++) {
        const horiz = (i + j) % 2 === 0;
        const x = i * cell + (horiz ? 0 : k * pw), y = j * cell + (horiz ? k * pw : 0);
        const w = horiz ? cell : pw, h = horiz ? pw : cell;
        g.fillStyle = tones[(i * 7 + j * 3 + k * 5) % tones.length];
        g.fillRect(x + 1, y + 1, w - 2, h - 2);
        g.strokeStyle = "rgba(18,8,3,0.28)";
        g.lineWidth = 1;
        for (let s = 0; s < 3; s++) {
          g.beginPath();
          if (horiz) { const yy = y + 3 + s * 4.5; g.moveTo(x + 2, yy); g.lineTo(x + w - 2, yy + ((s + k) % 2 ? 1.5 : -1.5)); }
          else { const xx = x + 3 + s * 4.5; g.moveTo(xx, y + 2); g.lineTo(xx + ((s + k) % 2 ? 1.5 : -1.5), y + h - 2); }
          g.stroke();
        }
      }
}

function paintWallpaper(g, W, H) {
  // Aubergine flock with paired gold pinstripes and a small atomic star between them.
  g.fillStyle = "#3a1a3c";
  g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 64) {
    g.fillStyle = "rgba(205,168,96,0.55)";
    g.fillRect(x + 4, 0, 2, H);
    g.fillRect(x + 10, 0, 1, H);
    g.fillStyle = "rgba(160,110,210,0.25)";
    g.fillRect(x + 40, 0, 1, H);
  }
  g.fillStyle = "rgba(214,178,104,0.6)";
  for (let x = 0; x < W; x += 64)
    for (let y = 0; y < H; y += 128) {
      const cx = x + 38, cy = y + ((x / 64) % 2 ? 96 : 32);
      g.beginPath();
      for (let a = 0; a < 8; a++) {
        const r = a % 2 ? 3 : 11, ang = (a * PI) / 4;
        g.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
      }
      g.closePath();
      g.fill();
    }
}

// Fifteen original sleeves plus the Silver Sleeve (cell 15): [title, artist, paper, ink, accent].
const SLEEVES = [
  ["AFTER HOURS", "REX MOREAU TRIO", "#2b1236", "#e9c46a", "#b06ad8"],
  ["CELLAR SESSIONS", "THE KESSLER FIVE", "#161616", "#f08a24", "#f3e6c8"],
  ["OPAL AT MIDNIGHT", "MISS OPAL DUPREE", "#16475b", "#f7d6e0", "#f2a2b8"],
  ["BOP GOES THE CITY", "LENNY HART SEXTET", "#c8372d", "#f6ead0", "#1d1d1d"],
  ["RAIN ON 47TH", "SAL VITALE STRINGS", "#1f3a68", "#e8eef5", "#8fb3de"],
  ["CALYPSO DELUXE", "LORD PARAMOUNT", "#f0c419", "#1d4d2b", "#e2572c"],
  ["THE BLUE CELLAR", "NAT ELLERY QUARTET", "#0f1c3a", "#7fd6e8", "#3a6fb0"],
  ["SLOW BURN", "IDA MAE CROWLEY", "#1a0d08", "#ff9a3c", "#d9431e"],
  ["NOCHE LATINA", "TITO BARRERA ORQ.", "#b0226e", "#ffe066", "#ff8fb1"],
  ["SMOKE RINGS", "THE LOW TIDE SEXTET", "#3b3942", "#d7c8f0", "#8d7bb5"],
  ["VELVET HOUR", "CARLA VENN", "#5a1030", "#f3d9b1", "#c9486e"],
  ["PIANO IN THE DARK", "WALT PRYOR", "#0d0d0f", "#f4f1e8", "#9a9aa2"],
  ["THE NIGHT TRAIN", "BUDDY LOMAX", "#264d3b", "#f1e3c2", "#c0602f"],
  ["ROOFTOP SERENADE", "THE PARAPETS", "#e8dcc2", "#2c2440", "#d0663a"],
  ["SIDEWALK SAMBA", "OS TRES AMIGOS", "#ef7d32", "#fff4dc", "#2b6f6a"],
  ["", "", "#b9bec6", "#3a3f48", "#8e62c9"],
];

function paintSleeve(g, k, S) {
  const [title, artist, bg, ink, acc] = SLEEVES[k];
  g.fillStyle = bg;
  g.fillRect(0, 0, S, S);
  g.fillStyle = acc;
  g.strokeStyle = acc;
  const circle = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill(); };
  switch (k) {
    case 0: for (let i = 0; i < 3; i++) { g.globalAlpha = 0.9 - i * 0.22; circle(168 - i * 42, 100 + i * 16, 64 - i * 12); } break;
    case 1: for (let i = 0; i < 7; i++) g.fillRect(24 + i * 30, 36 + (i % 3) * 20, 16, 140 - (i % 3) * 30); break;
    case 2: circle(160, 92, 60); g.fillStyle = bg; circle(186, 78, 54); break;
    case 3: for (let i = 0; i < 10; i++) { const h = 40 + ((i * 37) % 100); g.fillRect(i * 26, 180 - h, 22, h); } break;
    case 4: g.lineWidth = 3; for (let i = 0; i < 26; i++) { const x = (i * 47) % 270, y = (i * 71) % 160; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 12, y + 38); g.stroke(); } break;
    case 5: g.lineWidth = 16; for (const [off, col] of [[70, acc], [120, ink]]) { g.strokeStyle = col; g.beginPath(); for (let i = 0; i <= 8; i++) g.lineTo(i * 32, off + (i % 2 ? -34 : 34)); g.stroke(); } break;
    case 6: for (let i = 0; i < 6; i++) g.fillRect(18 + i * 34, 54 + i * 22, 256, 13); break;
    case 7: for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(26 + i * 44, 184); g.lineTo(48 + i * 44, 40 + (i % 2) * 44); g.lineTo(70 + i * 44, 184); g.fill(); } break;
    case 8: for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) { g.fillStyle = (i + j) % 2 ? acc : ink; circle(28 + i * 40, 30 + j * 30, 10); } break;
    case 9: g.lineWidth = 7; for (let i = 0; i < 5; i++) { g.globalAlpha = 1 - i * 0.16; g.beginPath(); g.arc(120 + i * 8, 96, 22 + i * 17, 0, PI * 2); g.stroke(); } break;
    case 10: g.beginPath(); g.moveTo(128, 20); g.lineTo(212, 100); g.lineTo(128, 180); g.lineTo(44, 100); g.fill(); g.fillStyle = ink; circle(128, 100, 22); break;
    case 11: g.fillStyle = ink; g.fillRect(0, 70, S, 100); g.fillStyle = bg; for (let i = 0; i < 12; i++) { g.fillRect(i * 22 + 20, 70, 2, 100); if (i % 7 !== 2 && i % 7 !== 6) g.fillRect(i * 22 + 12, 70, 13, 58); } break;
    case 12: g.lineWidth = 4; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(128, 50); g.lineTo(i * 32, 190); g.stroke(); } for (let y = 70; y < 190; y += 18) g.fillRect(128 - (y - 50) * 0.9, y, (y - 50) * 1.8, 3); break;
    case 13: circle(186, 150, 64); g.fillStyle = ink; for (let i = 0; i < 9; i++) { const h = 30 + ((i * 29) % 70); g.fillRect(i * 30, 190 - h, 26, h); } break;
    case 14: for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? acc : ink; g.beginPath(); g.arc(128, 190, 150 - i * 28, PI, 0); g.fill(); } break;
    case 15: {
      const grd = g.createLinearGradient(0, 0, S, S);
      grd.addColorStop(0, "#e6e9ee"); grd.addColorStop(0.45, "#9ba2ad"); grd.addColorStop(0.7, "#d9dde3"); grd.addColorStop(1, "#8d949f");
      g.fillStyle = grd; g.fillRect(0, 0, S, S);
      g.fillStyle = "rgba(255,255,255,0.09)";
      for (let y = 0; y < S; y += 3) g.fillRect(0, y, S, 1);
      g.lineWidth = 3; g.strokeStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.arc(127, 115, 78, 0, PI * 2); g.stroke();
      g.strokeStyle = "rgba(70,76,88,0.55)"; g.beginPath(); g.arc(130, 118, 78, 0, PI * 2); g.stroke();
      g.fillStyle = acc; circle(212, 40, 20); g.fillStyle = "#f4eaff"; g.textAlign = "center"; g.font = "800 26px Georgia, serif"; g.fillText("?", 212, 49);
      g.fillStyle = ink; g.font = "600 13px Georgia, serif"; g.fillText("NO ARTIST · NO YEAR", 128, 236);
      break;
    }
  }
  g.globalAlpha = 1;
  if (!title) return;
  g.textAlign = "left";
  g.fillStyle = ink;
  fit(g, title, S - 26, 30, "800", SANS);
  g.fillText(title, 13, 222);
  fit(g, artist, S - 26, 15, "600", "Georgia, serif");
  g.fillText(artist, 13, 244);
}

// Sign sheet regions (1024 x 1024): one texture for every small card, tab, meter face and spine strip.
const SIGN = {
  neon: [0, 0, 1024, 128],
  tab: (i) => [i * 170 + 2, 130, i * 170 + 168, 254],
  vuA: [0, 256, 220, 416],
  vuB: [220, 256, 440, 416],
  newWeek: [440, 256, 1024, 416],
  spines: (k) => { const x = (k * 173) % 724; return [x, 416, x + 300, 596]; },
  hear: [0, 596, 512, 724],
  silver: [512, 596, 1024, 724],
  hifi: [0, 724, 384, 852],
  picks: [384, 724, 704, 852],
  edge: [704, 724, 1024, 852],
};

function paintCard(g, [x0, y0, x1, y1], lines, ink, paper) {
  const w = x1 - x0, h = y1 - y0;
  g.fillStyle = paper;
  g.fillRect(x0, y0, w, h);
  g.strokeStyle = ink;
  g.lineWidth = 3;
  g.strokeRect(x0 + 7, y0 + 7, w - 14, h - 14);
  g.fillStyle = ink;
  g.textAlign = "center";
  fit(g, lines[0], w - 34, h * 0.4, "800", "Georgia, serif");
  g.fillText(lines[0], x0 + w / 2, y0 + h * (lines[1] ? 0.5 : 0.64));
  if (lines[1]) {
    fit(g, lines[1], w - 40, h * 0.2, "600", "Georgia, serif");
    g.fillText(lines[1], x0 + w / 2, y0 + h * 0.8);
  }
}

function paintNeon(g, [x0, y0, x1, y1], text, color) {
  const w = x1 - x0, h = y1 - y0;
  g.fillStyle = "#12071a";
  g.fillRect(x0, y0, w, h);
  g.strokeStyle = color;
  g.lineWidth = 4;
  g.shadowColor = color;
  g.shadowBlur = 14;
  g.strokeRect(x0 + 8, y0 + 8, w - 16, h - 16);
  g.textAlign = "center";
  fit(g, text, w - 60, h * 0.62, "italic 700", "Georgia, serif");
  g.fillStyle = color;
  g.fillText(text, x0 + w / 2, y0 + h * 0.7);
  g.shadowBlur = 4;
  g.fillStyle = "#fbefff";
  fit(g, text, w - 64, h * 0.6, "italic 700", "Georgia, serif");
  g.fillText(text, x0 + w / 2, y0 + h * 0.7);
  g.shadowBlur = 0;
}

function paintVU(g, [x0, y0]) {
  g.fillStyle = "#f1e4c0";
  g.fillRect(x0, y0, 220, 160);
  g.strokeStyle = "#3a2a1a";
  g.lineWidth = 2;
  g.strokeRect(x0 + 5, y0 + 5, 210, 150);
  const cx = x0 + 110, cy = y0 + 150, deg = PI / 180;
  g.lineWidth = 4;
  g.strokeStyle = "#1c1612";
  g.beginPath(); g.arc(cx, cy, 104, -150 * deg, -55 * deg); g.stroke();
  g.strokeStyle = "#c2261c";
  g.beginPath(); g.arc(cx, cy, 104, -55 * deg, -30 * deg); g.stroke();
  g.lineWidth = 2;
  for (let i = 0; i <= 10; i++) {
    const a = (-150 + i * 12) * deg;
    g.strokeStyle = i > 7 ? "#c2261c" : "#1c1612";
    g.beginPath(); g.moveTo(cx + Math.cos(a) * 94, cy + Math.sin(a) * 94); g.lineTo(cx + Math.cos(a) * 112, cy + Math.sin(a) * 112); g.stroke();
  }
  g.fillStyle = "#1c1612";
  g.textAlign = "center";
  g.font = "600 13px Georgia, serif";
  g.fillText("-20", x0 + 24, y0 + 78);
  g.fillText("0", x0 + 172, y0 + 44);
  g.fillStyle = "#c2261c";
  g.fillText("+3", x0 + 200, y0 + 78);
  g.fillStyle = "#1c1612";
  g.font = "800 28px Georgia, serif";
  g.fillText("VU", cx, y0 + 122);
}

function paintSigns(g) {
  g.fillStyle = "#1a0f14";
  g.fillRect(0, 0, 1024, 1024);
  paintNeon(g, SIGN.neon, "The Listening Room", "#c98cff");
  ["JAZZ", "VOCALS", "BLUES", "BOP", "LATIN", "78s"].forEach((t, i) => {
    const [x0, y0, x1, y1] = SIGN.tab(i);
    g.fillStyle = "#efe1bd";
    g.beginPath();
    g.moveTo(x0, y1); g.lineTo(x0, y0 + 18); g.quadraticCurveTo(x0, y0, x0 + 18, y0);
    g.lineTo(x1 - 18, y0); g.quadraticCurveTo(x1, y0, x1, y0 + 18); g.lineTo(x1, y1);
    g.fill();
    g.fillStyle = "#4a1f5e";
    g.textAlign = "center";
    fit(g, t, x1 - x0 - 24, 58, "800", SANS);
    g.fillText(t, (x0 + x1) / 2, y0 + 84);
  });
  paintVU(g, SIGN.vuA);
  paintVU(g, SIGN.vuB);
  paintCard(g, SIGN.newWeek, ["NEW THIS WEEK", "LONG PLAY 33⅓ · $3.98"], "#4a1f5e", "#f1e2bc");
  // Spine strip: LPs filed spine-out in the back-bar cubbies.
  const cols = ["#e9dcc0", "#1d1d22", "#8a2c2c", "#23456e", "#d2a23a", "#4a2a5c", "#2f5a48", "#c86b3c", "#f0ede4", "#5c1e36"];
  let x = 0, k = 0;
  while (x < 1024) {
    const w = 6 + ((k * 13) % 9);
    g.fillStyle = cols[(k * 7) % cols.length];
    g.fillRect(x, 416, w - 1, 180);
    g.fillStyle = (k * 7) % cols.length === 1 ? "#d8c9a0" : "rgba(20,12,10,0.55)";
    g.fillRect(x + 2, 440 + ((k * 17) % 40), Math.max(1, w - 5), 40 + ((k * 11) % 60));
    x += w;
    k++;
  }
  const shade = g.createLinearGradient(0, 416, 0, 450);
  shade.addColorStop(0, "rgba(0,0,0,0.6)");
  shade.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = shade;
  g.fillRect(0, 416, 1024, 34);
  paintCard(g, SIGN.hear, ["HEAR IT FIRST", "THE LISTENING ROOM IS FREE"], "#f3e3c3", "#3a1650");
  paintCard(g, SIGN.silver, ["THE SILVER SLEEVE", "NOT FOR SALE · ASK SID"], "#2c3a44", "#cfd6da");
  paintNeon(g, SIGN.hifi, "Hi-Fi", "#d59cff");
  paintCard(g, SIGN.picks, ["SID'S PICKS", "THIS WEEK"], "#f1d58a", "#2a1236");
  paintCard(g, SIGN.edge, ["BY THE EDGES", "PLEASE — SID"], "#3a1d10", "#efe3c6");
}

// Original gig posters for fictional acts, tacked to a brown pegboard.
const POSTERS = [
  ["THE LOW TIDE", "SEXTET", "FRI · SAT · 11 PM", "THE BLUE CELLAR", "#efe0b4", "#1c1c1c", "#e0662d"],
  ["MISS OPAL", "DUPREE", "SINGS THE BLUES", "NOV 19 · ONE NIGHT", "#1d2a4a", "#f4cf6a", "#c95c86"],
  ["BOP AT", "MIDNIGHT", "THE KESSLER FIVE", "52ND ST · $1 DOOR", "#c63b2b", "#f7e9ca", "#1b1b1b"],
  ["CALYPSO", "DELUXE", "LORD PARAMOUNT", "& HIS STEEL BAND", "#f2c330", "#1f4a2c", "#d9502b"],
  ["RECORD", "SWAP", "BRING THREE · TAKE ONE", "SUNDAYS AT REX'S", "#2b1535", "#dcaaff", "#e9c46a"],
  ["WVBE 1340", "AFTER DARK", "SID SPINS THE B-SIDES", "MON–FRI · 1 AM", "#ece4d2", "#5a1e5e", "#2d6f73"],
];

function paintPegboard(g, W, H) {
  g.fillStyle = "#7c5a3a";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#3a2717";
  for (let y = 12; y < H; y += 24) for (let x = 12; x < W; x += 24) { g.beginPath(); g.arc(x, y, 3, 0, PI * 2); g.fill(); }
  POSTERS.forEach(([a, b, c, d, paper, ink, acc], i) => {
    const pw = 290, ph = 272, px = 38 + (i % 3) * 330, py = 26 + Math.floor(i / 3) * 314;
    g.save();
    g.translate(px + pw / 2, py + ph / 2);
    g.rotate(((i * 37) % 7 - 3) * 0.01);
    g.translate(-pw / 2, -ph / 2);
    g.fillStyle = "rgba(0,0,0,0.45)";
    g.fillRect(6, 8, pw, ph);
    g.fillStyle = paper;
    g.fillRect(0, 0, pw, ph);
    g.fillStyle = acc;
    g.fillRect(0, 0, pw, 34);
    g.fillRect(0, ph - 42, pw, 42);
    g.textAlign = "center";
    g.fillStyle = paper;
    g.font = "700 16px Georgia, serif";
    g.fillText(i % 2 ? "★ APPEARING ★" : "★ TONIGHT ★", pw / 2, 23);
    g.fillStyle = ink;
    fit(g, a, pw - 30, 58, "900", SANS);
    g.fillText(a, pw / 2, 96);
    g.fillStyle = i === 2 || i === 4 ? ink : acc;
    fit(g, b, pw - 30, 58, "900", SANS);
    g.fillText(b, pw / 2, 156);
    g.fillStyle = ink;
    fit(g, c, pw - 36, 24, "700", "Georgia, serif");
    g.fillText(c, pw / 2, 196);
    g.fillStyle = paper;
    fit(g, d, pw - 36, 22, "700", "Georgia, serif");
    g.fillText(d, pw / 2, ph - 14);
    g.restore();
    g.fillStyle = "#d8b25e";
    for (const hx of [px + 14, px + pw - 14]) { g.beginPath(); g.arc(hx, py + 6, 6, 0, PI * 2); g.fill(); }
  });
}

function paintGiant45(g, W) {
  const c = W / 2;
  g.clearRect(0, 0, W, W);
  g.fillStyle = "#b98f48";
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * PI * 2, r2 = i % 2 ? 222 : 252;
    g.beginPath();
    g.moveTo(c + Math.cos(a - 0.05) * 176, c + Math.sin(a - 0.05) * 176);
    g.lineTo(c + Math.cos(a) * r2, c + Math.sin(a) * r2);
    g.lineTo(c + Math.cos(a + 0.05) * 176, c + Math.sin(a + 0.05) * 176);
    g.fill();
  }
  const disc = g.createRadialGradient(c, c, 40, c, c, 186);
  disc.addColorStop(0, "#221c28");
  disc.addColorStop(1, "#08070a");
  g.fillStyle = disc;
  g.beginPath(); g.arc(c, c, 186, 0, PI * 2); g.fill();
  g.lineWidth = 1;
  for (let r = 96; r < 183; r += 3) {
    g.strokeStyle = `rgba(210,195,240,${(r / 3) % 4 === 0 ? 0.1 : 0.04})`;
    g.beginPath(); g.arc(c, c, r, 0, PI * 2); g.stroke();
  }
  g.fillStyle = "rgba(235,215,255,0.13)";
  for (const a of [-1.05, -1.05 + PI]) { g.beginPath(); g.moveTo(c, c); g.arc(c, c, 184, a, a + 0.32); g.fill(); }
  g.fillStyle = "#7a3bb8";
  g.beginPath(); g.arc(c, c, 92, 0, PI * 2); g.fill();
  g.strokeStyle = "#e3c27a";
  g.lineWidth = 3;
  g.beginPath(); g.arc(c, c, 86, 0, PI * 2); g.stroke();
  g.fillStyle = "#f5e6c4";
  g.textAlign = "center";
  g.font = "800 26px Georgia, serif";
  g.fillText("REX'S", c, c - 58);
  g.font = "600 11px Georgia, serif";
  g.fillText("RECORDS · 47TH ST", c, c - 45);
  g.font = "italic 600 12px Georgia, serif";
  g.fillText("side A · After Hours", c, c + 56);
  g.font = "800 18px Georgia, serif";
  g.fillText("45 RPM", c, c + 76);
  // Yellow "spider" adapter in the big centre hole.
  g.fillStyle = "#f0bf2e";
  g.beginPath(); g.arc(c, c, 40, 0, PI * 2); g.fill();
  g.globalCompositeOperation = "destination-out";
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * PI) / 3 - PI / 2 + 0.28;
    g.beginPath(); g.arc(c, c, 33, a, a + 1.55); g.arc(c, c, 13, a + 1.55, a, true); g.fill();
  }
  g.beginPath(); g.arc(c, c, 5, 0, PI * 2); g.fill();
  g.globalCompositeOperation = "source-over";
}

/* ---------- geometry helpers ---------- */

const geoCache = new Map();
// PlaneGeometry showing one pixel rect [x0,y0,x1,y1] of a W x H sheet.
function sheetGeo(W, H, [x0, y0, x1, y1], w, h) {
  const key = `${W}:${H}:${x0}:${y0}:${x1}:${y1}:${w}:${h}`;
  if (!geoCache.has(key)) {
    const geo = new THREE.PlaneGeometry(w, h);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, (x0 + uv.getX(i) * (x1 - x0)) / W, 1 - (y1 - uv.getY(i) * (y1 - y0)) / H);
    geoCache.set(key, geo);
  }
  return geoCache.get(key);
}
const cellRect = (k) => { const x = (k % 4) * 256, y = Math.floor(k / 4) * 256; return [x + 2, y + 2, x + 254, y + 254]; };
// Wall-covering plane with world-scaled UVs so one repeating texture batches across walls.
function tiledPlane(w, h, tile) {
  const geo = new THREE.PlaneGeometry(w, h);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / tile, (uv.getY(i) * h) / tile);
  return geo;
}

export function build({ root, mats, lamp, place, crowds }) {
  const { brass } = sharedMats();
  const lore = sleeveMats();
  const std = (color, roughness, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const basic = (color) => new THREE.MeshBasicMaterial({ color });
  const M = {
    walnut: std(0x5a351f, 0.5),
    walnutDark: std(0x2e190f, 0.6),
    paint: std(0x3d1b3f, 0.85),
    plaster: std(0x241127, 0.95),
    velvet: std(0x4a2262, 0.92),
    boothVelvet: std(0x4f2670, 0.9, { emissive: 0x3a1466 }),
    carpet: std(0x2d1240, 1),
    grille: std(0x806540, 0.95),
    rugGold: std(0x8e6d2e, 1),
    rugPlum: std(0x47173e, 1),
    crate: std(0x9a7448, 0.9),
    lino: std(0x141016, 0.35),
    vinyl: std(0x121014, 0.22, { metalness: 0.55 }),
    glass: std(0xc9a6ff, 0.08, { metalness: 0.2, transparent: true, opacity: 0.16, depthWrite: false }),
    clear: std(0xe8f0ff, 0.05, { metalness: 0.2, transparent: true, opacity: 0.12, depthWrite: false }),
    neon: basic(0xd9a8ff),
    boothGlow: basic(0x7f49cc),
    cove: basic(0x5b2d8a),
    warm: basic(0xffdca8),
    silverGlow: basic(0xe8eeff),
    label: basic(0x9b59d9),
  };
  const cream = mats.cream, black = mats.black;

  const floorTex = canvasTex(512, 512, "rex parquet", paintFloor, true);
  floorTex.repeat.set(3.1, 2.5);
  const paperTex = canvasTex(256, 256, "rex wallpaper", paintWallpaper, true);
  const sleeveTex = canvasTex(1024, 1024, "REX'S SLEEVE SHEET", (g) => {
    for (let k = 0; k < 16; k++) {
      g.save();
      g.translate((k % 4) * 256, Math.floor(k / 4) * 256);
      g.beginPath(); g.rect(0, 0, 256, 256); g.clip();
      paintSleeve(g, k, 256);
      g.restore();
    }
  });
  const signTex = canvasTex(1024, 1024, "REX'S SIGN SHEET", paintSigns);
  const pegTex = canvasTex(1024, 640, "GIG POSTERS: LOW TIDE SEXTET / OPAL DUPREE / BOP AT MIDNIGHT / CALYPSO DELUXE / RECORD SWAP / WVBE", paintPegboard);
  const discTex = canvasTex(512, 512, "REX'S 45 RPM · AFTER HOURS", paintGiant45);
  const wallpaper = std(0xffffff, 0.85, { map: paperTex });
  const sleeveMat = new THREE.MeshBasicMaterial({ map: sleeveTex });
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });

  const b = boxBatch();
  const sign = (region, w, h, x, y, z, rotY, lean = 0) => b.geo(signMat, sheetGeo(1024, 1024, region, w, h), x, y, z, 1, 1, 1, rotY, lean);
  const sleeveArt = (k, x, y, z, rotY, lean = 0, size = 0.31) => b.geo(sleeveMat, sheetGeo(1024, 1024, cellRect(k), size, size), x, y, z, 1, 1, 1, rotY, lean);
  const sleeveBodies = [];
  const SLEEVE_COLS = [0xe8dcc0, 0x22222a, 0x9b3a2e, 0x2a4f7a, 0xd4a640, 0x5a3070, 0x3a6a52, 0xcf7a45, 0xf2efe6, 0x6a2340, 0x1e5f66, 0xb8b0a0];
  const body = (x, y, z, rotY, lean) => sleeveBodies.push([x, y, z, rotY, lean]);

  /* ---- shell: walls, dado, wallpaper, cove, ceiling, floor ---- */
  b.box(M.paint, -38.16, 1.92, 36.02, 0.12, 3.84, 7.95);
  b.box(M.paint, -28.24, 1.92, 36.02, 0.12, 3.84, 7.95);
  b.box(M.paint, -33.2, 1.92, 39.96, 10, 3.84, 0.12);
  b.box(M.paint, -33.2, 3.02, 32.17, 9.84, 1.64, 0.06);
  b.box(M.plaster, -33.2, 3.9, 36.02, 10, 0.12, 7.95);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(9.9, 0.02, 7.9), std(0xffffff, 0.42, { map: floorTex }));
  floor.position.set(-33.2, 0.01, 36.0);
  root.add(floor);
  b.geo(wallpaper, tiledPlane(7.8, 2.3, 0.62), -38.095, 2.35, 36.0, 1, 1, 1, PI / 2);
  b.geo(wallpaper, tiledPlane(7.8, 2.3, 0.62), -28.305, 2.35, 36.0, 1, 1, 1, -PI / 2);
  b.geo(wallpaper, tiledPlane(9.8, 2.3, 0.62), -33.2, 2.35, 39.895, 1, 1, 1, PI);
  b.geo(wallpaper, tiledPlane(9.8, 1.28, 0.62), -33.2, 2.86, 32.205, 1, 1, 1, 0);
  // Skirting + dado rail with a brass bead (where walls show), and the violet neon cove under a cornice ledge all round.
  const run = (mat, x, z, nx, nz, len, d, y, depth, h) =>
    b.box(mat, x + nx * d, y, z + nz * d, nz ? len : depth, h, nz ? depth : len);
  for (const [x, z, nx, nz, len] of [[-38.1, 36.0, 1, 0, 7.8], [-33.2, 39.9, 0, -1, 9.8], [-28.3, 38.13, -1, 0, 3.54]]) {
    run(M.walnutDark, x, z, nx, nz, len, 0.02, 0.09, 0.04, 0.18);
    run(M.walnut, x, z, nx, nz, len, 0.02, 1.2, 0.04, 0.06);
    run(brass, x, z, nx, nz, len, 0.042, 1.165, 0.012, 0.012);
  }
  for (const [x, z, nx, nz, len] of [[-38.1, 36.0, 1, 0, 7.8], [-28.3, 36.0, -1, 0, 7.8], [-33.2, 39.9, 0, -1, 9.8], [-33.2, 32.2, 0, 1, 9.8]]) {
    run(M.walnut, x, z, nx, nz, len, 0.11, 3.48, 0.22, 0.07);
    run(brass, x, z, nx, nz, len, 0.215, 3.445, 0.015, 0.015);
    run(M.neon, x, z, nx, nz, len - 0.2, 0.08, 3.535, 0.03, 0.03);
    run(M.cove, x, z, nx, nz, len, 0.012, 3.68, 0.01, 0.3);
  }
  // Walnut beams across the dark plaster ceiling.
  for (const z of [33.9, 35.9, 37.9]) b.box(M.walnut, -33.2, 3.74, z, 9.8, 0.2, 0.2);
  b.box(M.walnut, -33.2, 3.76, 36.0, 0.18, 0.16, 7.8);
  // Runner from the door to Sid, and a coir mat.
  b.box(M.rugGold, -33.2, 0.026, 35.25, 1.7, 0.012, 3.9);
  b.box(M.rugPlum, -33.2, 0.03, 35.25, 1.5, 0.012, 3.7);
  b.box(M.crate, -33.2, 0.028, 32.6, 2.0, 0.016, 0.8);

  /* ---- west display window ---- */
  b.box(M.walnut, -36.35, 0.45, 32.35, 3.2, 0.9, 0.4);
  b.box(M.walnut, -36.35, 0.6, 32.73, 3.2, 1.2, 0.36);
  b.box(M.velvet, -36.35, 0.906, 32.35, 3.22, 0.012, 0.42);
  b.box(M.velvet, -36.35, 1.206, 32.73, 3.22, 0.012, 0.38);
  b.box(brass, -36.35, 0.895, 32.145, 3.22, 0.02, 0.012);
  b.box(brass, -36.35, 1.195, 32.545, 3.22, 0.02, 0.012);
  [[3, -37.62], [8, -36.98], [10, -35.72], [5, -35.08]].forEach(([k, x]) => {
    sleeveArt(k, x, 1.07, 32.39, PI, -0.18);
    b.box(M.walnutDark, x, 1.07, 32.405, 0.3, 0.3, 0.012, PI, -0.18);
    b.box(brass, x, 1.02, 32.47, 0.012, 0.26, 0.012, 0, 0.5);
  });
  sign(SIGN.newWeek, 0.5, 0.137, -36.35, 0.99, 32.3, PI, -0.2);
  b.box(brass, -36.35, 0.95, 32.35, 0.012, 0.12, 0.012, 0, 0.5);
  [[0, -37.55], [13, -35.62], [6, -35.02]].forEach(([k, x]) => {
    sleeveArt(k, x, 1.37, 32.76, PI, -0.14);
    b.box(M.walnutDark, x, 1.37, 32.775, 0.3, 0.3, 0.012, PI, -0.14);
  });
  // Portable phonograph with its lid up.
  b.box(M.velvet, -36.75, 1.29, 32.72, 0.44, 0.16, 0.32);
  b.box(M.velvet, -36.75, 1.52, 32.89, 0.44, 0.34, 0.03, 0, -0.18);
  b.box(brass, -36.75, 1.29, 32.557, 0.44, 0.02, 0.01);
  b.cyl(M.vinyl, -36.8, 1.375, 32.7, 0.13, 0.13, 0.008, 28);
  b.cyl(M.label, -36.8, 1.381, 32.7, 0.045, 0.045, 0.006, 16);
  b.box(brass, -36.62, 1.39, 32.66, 0.012, 0.012, 0.2, 0.5);
  // The three house LPs hang on fishing line in the window glass.
  [-37.35, -36.35, -35.35].forEach((x, i) => {
    b.box(lore[i], x, 1.9, 32.27, 0.31, 0.31, 0.006);
    b.box(black, x, 2.2, 32.27, 0.004, 0.3, 0.004);
  });

  /* ---- bins ---- */
  // West wall bin over drawer cabinets, 7 compartments facing the room.
  b.box(M.walnut, -37.7, 0.31, 36.0, 0.8, 0.62, 2.6);
  for (const y of [0.18, 0.46])
    for (const z of [35.13, 36.0, 36.87]) {
      b.box(M.walnutDark, -37.29, y, z, 0.02, 0.22, 0.8);
      b.box(brass, -37.275, y, z, 0.015, 0.025, 0.16);
    }
  b.box(M.walnut, -37.32, 0.72, 36.0, 0.04, 0.2, 2.6);
  b.box(brass, -37.32, 0.826, 36.0, 0.05, 0.012, 2.62);
  b.box(M.walnut, -38.06, 0.85, 36.0, 0.04, 0.46, 2.6);
  for (const z of [34.72, 37.28]) b.box(M.walnut, -37.7, 0.78, z, 0.8, 0.32, 0.04);
  for (let c = 0; c < 7; c++) {
    const zc = 34.7 + 0.371 * (c + 0.5);
    if (c) b.box(M.walnutDark, -37.7, 0.74, 34.7 + 0.371 * c, 0.72, 0.22, 0.015);
    for (let s = 0; s < 9; s++) body(-37.95 + s * 0.07, 0.79, zc, PI / 2, -0.24);
    sleeveArt((c * 5 + 1) % 15, -37.36, 0.795, zc, PI / 2, -0.24);
    if (c % 2 === 0) sign(SIGN.tab([0, 1, 2, 3][c / 2]), 0.16, 0.12, -37.62, 1.0, zc - 0.06, PI / 2);
  }
  // Island bin on tapered legs: the vinyl-bin target (-36.5, 33.85), double-sided.
  b.box(M.walnut, -36.5, 0.42, 33.85, 1.4, 0.3, 0.8);
  for (const dx of [-0.6, 0.6])
    for (const dz of [-0.32, 0.32]) {
      b.cyl(M.walnut, -36.5 + dx, 0.14, 33.85 + dz, 0.03, 0.018, 0.27, 8);
      b.cyl(brass, -36.5 + dx, 0.02, 33.85 + dz, 0.019, 0.019, 0.04, 8);
    }
  for (const z of [33.465, 34.235]) {
    b.box(M.walnut, -36.5, 0.69, z, 1.4, 0.24, 0.03);
    b.box(brass, -36.5, 0.815, z, 1.42, 0.012, 0.04);
  }
  for (const x of [-37.185, -35.815]) b.box(M.walnut, x, 0.69, 33.85, 0.03, 0.24, 0.8);
  b.box(M.walnutDark, -36.5, 0.76, 33.85, 1.36, 0.38, 0.02);
  for (const x of [-36.85, -36.5, -36.15]) b.box(M.walnutDark, x, 0.7, 33.85, 0.012, 0.22, 0.76);
  [-37.025, -36.675, -36.325, -35.975].forEach((x, c) => {
    for (let s = 0; s < 6; s++) {
      body(x, 0.735, 33.8 - s * 0.055, PI, -0.22);
      body(x, 0.735, 33.9 + s * 0.055, 0, -0.22);
    }
    sleeveArt((c * 4 + 2) % 15, x, 0.74, 33.495, PI, -0.22);
    sleeveArt((c * 4 + 9) % 15, x, 0.74, 34.205, 0, -0.22);
  });
  sign(SIGN.tab(3), 0.16, 0.12, -36.85, 0.98, 34.0, 0);
  sign(SIGN.tab(4), 0.16, 0.12, -36.15, 0.98, 34.0, 0);
  sign(SIGN.tab(0), 0.16, 0.12, -36.5, 0.98, 33.7, PI);
  // Crates of 78s in the corner by the window.
  b.box(M.crate, -37.78, 0.2, 33.28, 0.6, 0.4, 0.52);
  b.box(M.crate, -37.76, 0.6, 33.3, 0.56, 0.38, 0.48, 0.08);
  b.box(black, -37.76, 0.79, 33.3, 0.5, 0.01, 0.42, 0.08);
  for (let s = 0; s < 7; s++) body(-37.97 + s * 0.06, 0.86, 33.3, PI / 2, -0.12);
  sign(SIGN.tab(5), 0.16, 0.12, -37.47, 0.6, 33.3, PI / 2);

  /* ---- pegboard of gig posters, sconces ---- */
  const peg = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.75), new THREE.MeshBasicMaterial({ map: pegTex }));
  peg.position.set(-38.085, 2.2, 36.0);
  peg.rotation.y = PI / 2;
  root.add(peg);
  for (const y of [1.3, 3.1]) b.box(M.walnut, -38.07, y, 36.0, 0.04, 0.06, 2.92);
  for (const z of [34.57, 37.43]) b.box(M.walnut, -38.07, 2.2, z, 0.04, 1.86, 0.06);
  for (const z of [34.05, 37.95]) {
    b.box(brass, -38.09, 2.35, z, 0.02, 0.26, 0.12);
    b.box(brass, -38.03, 2.3, z, 0.1, 0.02, 0.02);
    b.cyl(M.warm, -37.97, 2.4, z, 0.1, 0.055, 0.18, 12);
    b.cyl(brass, -37.97, 2.305, z, 0.056, 0.056, 0.015, 12);
  }

  /* ---- Sid's picks table ---- */
  b.cyl(M.walnut, -34.95, 0.76, 35.95, 0.45, 0.45, 0.04, 28);
  b.cyl(brass, -34.95, 0.735, 35.95, 0.455, 0.455, 0.015, 28);
  b.cyl(M.walnut, -34.95, 0.38, 35.95, 0.06, 0.09, 0.72, 12);
  b.cyl(M.walnut, -34.95, 0.03, 35.95, 0.28, 0.3, 0.06, 20);
  [[4, -0.5], [11, -0.1], [2, 0.35], [14, 0.75], [9, 1.3]].forEach(([k, a], i) => {
    const r = 0.2;
    sleeveArt(k, -34.95 + Math.sin(a + 2.6) * r, 0.783 + i * 0.002, 35.95 + Math.cos(a + 2.6) * r, a + 2.6, -PI / 2);
  });
  sign(SIGN.picks, 0.35, 0.14, -34.95, 0.97, 35.95, 2.52, -0.1);
  b.box(brass, -34.95, 0.86, 35.97, 0.012, 0.16, 0.012, 2.52, 0.3);

  /* ---- counter, back-bar, register ---- */
  b.box(M.walnut, -32.325, 0.56, 38.0, 6.55, 0.96, 0.9);
  b.box(black, -33.2, 0.04, 38.03, 8.3, 0.08, 0.84);
  for (let x = -35.3; x <= -29.2; x += 0.5) b.box(M.walnutDark, x, 0.56, 37.535, 0.06, 0.9, 0.03);
  for (let x = -35.05; x < -29.2; x += 0.5) b.box(M.paint, x, 0.58, 37.545, 0.36, 0.56, 0.02);
  // West end: glass-fronted case of 45s on violet velvet.
  b.box(M.walnut, -36.5, 0.24, 38.0, 1.8, 0.4, 0.9);
  b.box(M.walnut, -36.5, 1.0, 38.0, 1.8, 0.08, 0.9);
  b.box(M.walnut, -37.37, 0.62, 38.0, 0.06, 0.76, 0.9);
  b.box(M.velvet, -36.5, 0.64, 38.4, 1.7, 0.72, 0.04);
  b.box(M.velvet, -36.5, 0.45, 38.0, 1.7, 0.02, 0.8);
  b.box(M.clear, -36.5, 0.7, 37.57, 1.72, 0.52, 0.01);
  for (let i = 0; i < 7; i++) {
    b.cyl(black, -37.2 + i * 0.23, 0.6, 38.1, 0.088, 0.088, 0.004, 20, 0, PI / 2 - 0.25);
    b.cyl(M.label, -37.2 + i * 0.23, 0.6, 38.098, 0.03, 0.03, 0.006, 12, 0, PI / 2 - 0.25);
  }
  b.box(M.lino, -33.2, 1.09, 38.0, 8.4, 0.05, 0.9);
  b.box(brass, -33.2, 1.09, 37.54, 8.42, 0.06, 0.02);
  b.cyl(brass, -33.2, 0.16, 37.4, 0.022, 0.022, 7.6, 10, 0, 0, PI / 2);
  for (const x of [-36.8, -34.6, -31.8, -29.6]) b.box(brass, x, 0.16, 37.47, 0.03, 0.03, 0.14);
  // Brass register, keys to the customer.
  b.box(brass, -31.2, 1.25, 38.05, 0.46, 0.27, 0.4);
  b.box(black, -31.2, 1.35, 37.9, 0.42, 0.14, 0.2, 0, -0.5);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 5; c++) b.cyl(cream, -31.36 + c * 0.08, 1.38 + r * 0.035, 37.84 + r * 0.05, 0.016, 0.016, 0.02, 8, 0, -0.5);
  b.box(brass, -31.2, 1.47, 38.15, 0.36, 0.16, 0.16);
  b.box(black, -31.2, 1.49, 38.068, 0.3, 0.07, 0.01);
  for (let i = 0; i < 3; i++) b.box(cream, -31.28 + i * 0.08, 1.58, 38.15, 0.06, 0.05, 0.01);
  b.cyl(brass, -30.95, 1.26, 38.05, 0.015, 0.015, 0.2, 8, 0, 0, PI / 2);
  b.box(black, -30.84, 1.26, 38.05, 0.03, 0.12, 0.03);
  // Counter clutter: a rack of 45s, service bell, a stack of LPs and the "by the edges" card.
  b.box(brass, -34.4, 1.13, 38.0, 0.34, 0.02, 0.2);
  for (let i = 0; i < 6; i++) b.box(i % 2 ? cream : M.label, -34.53 + i * 0.05, 1.23, 38.0, 0.008, 0.18, 0.18, 0, 0, 0.12);
  b.cyl(brass, -32.35, 1.15, 37.82, 0.05, 0.05, 0.03, 12);
  b.cyl(brass, -32.35, 1.19, 37.82, 0.045, 0.02, 0.05, 12);
  for (let i = 0; i < 5; i++) b.box(i % 2 ? M.walnutDark : cream, -35.4, 1.125 + i * 0.012, 38.2, 0.32, 0.011, 0.32, 0.1 * i);
  sign(SIGN.edge, 0.3, 0.12, -34.0, 1.2, 37.72, PI, -0.12);
  b.box(brass, -34.0, 1.17, 37.75, 0.012, 0.1, 0.012, 0, 0.3);
  // Customer stool at the west end of the counter.
  b.cyl(brass, -36.3, 0.27, 37.0, 0.028, 0.028, 0.5, 8);
  b.cyl(brass, -36.3, 0.015, 37.0, 0.2, 0.22, 0.03, 16);
  b.cyl(M.velvet, -36.3, 0.52, 37.0, 0.19, 0.19, 0.08, 16);
  // Back-bar: cubbies of LPs filed spine-out.
  b.box(M.walnut, -33.2, 1.28, 39.64, 9.6, 0.05, 0.56);
  b.box(black, -33.2, 0.05, 39.66, 9.5, 0.1, 0.46);
  b.box(M.walnut, -33.2, 0.66, 39.66, 9.5, 0.03, 0.5);
  for (let k = 0; k <= 17; k++) b.box(M.walnut, -37.95 + k * 0.5588, 0.68, 39.66, 0.03, 1.2, 0.5);
  for (let k = 0; k < 17; k++) {
    const x = -37.95 + (k + 0.5) * 0.5588;
    sign(SIGN.spines(k), 0.52, 0.31, x, 0.27, 39.6, PI);
    sign(SIGN.spines(k + 5), 0.52, 0.31, x, 0.84, 39.6, PI);
  }

  /* ---- back wall: giant 45 between two walls of featured sleeves ---- */
  // Raised so Sid's head (he stands at z 37.15) doesn't eclipse the label from the door.
  const giant = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 1.95), new THREE.MeshBasicMaterial({ map: discTex, alphaTest: 0.5 }));
  giant.position.set(-33.2, 2.45, 39.885);
  giant.rotation.y = PI;
  root.add(giant);
  let n = 0;
  for (const cx of [-36.58, -29.74]) {
    for (const y of [1.66, 2.2, 2.74]) {
      b.box(brass, cx, y - 0.17, 39.84, 2.6, 0.02, 0.06);
      b.box(brass, cx, y - 0.15, 39.81, 2.6, 0.03, 0.006);
      for (let c = -2; c <= 2; c++) {
        const x = cx + c * 0.52;
        if ((n * 7) % 5 === 1) b.box(lore[n % 3], x, y, 39.855, 0.31, 0.31, 0.006, 0, 0.05);
        else sleeveArt((n * 11 + 3) % 15, x, y, 39.845, PI, -0.05);
        n++;
      }
    }
    b.box(brass, cx, 3.2, 39.78, 2.4, 0.05, 0.08);
    b.box(M.warm, cx, 3.172, 39.76, 2.3, 0.012, 0.03);
    for (const dx of [-1, 1]) b.box(brass, cx + dx, 3.24, 39.85, 0.02, 0.02, 0.1);
  }

  /* ---- neon ring clock on the east wall by the counter ---- */
  b.cyl(cream, -28.275, 2.75, 38.0, 0.3, 0.3, 0.03, 32, 0, 0, PI / 2);
  b.geo(M.neon, new THREE.TorusGeometry(0.33, 0.018, 8, 40), -28.27, 2.75, 38.0, 1, 1, 1, PI / 2);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * PI * 2;
    b.box(i % 3 ? M.walnutDark : M.label, -28.255, 2.75 + Math.cos(a) * 0.25, 38.0 + Math.sin(a) * 0.25, 0.01, i % 3 ? 0.03 : 0.05, 0.015, PI / 2, 0, a);
  }
  for (const [a, len] of [[(11.67 / 12) * PI * 2, 0.15], [(40 / 60) * PI * 2, 0.23]])
    b.box(black, -28.25, 2.75 + (Math.cos(a) * len) / 2, 38.0 + (Math.sin(a) * len) / 2, 0.012, len, 0.016, PI / 2, 0, a);
  b.box(M.walnut, -28.33, 0.6, 38.15, 0.04, 0.9, 3.4);

  /* ---- pendants, the central opal globe (the lamp) ---- */
  for (const x of [-35.9, -30.5]) {
    b.box(brass, x, 3.36, 38.0, 0.02, 0.96, 0.02);
    b.cyl(brass, x, 2.77, 38.0, 0.07, 0.27, 0.22, 20);
    b.cyl(M.warm, x, 2.655, 38.0, 0.25, 0.25, 0.01, 20);
  }
  b.box(brass, -34.6, 3.5, 35.6, 0.02, 0.68, 0.02);
  b.geo(M.warm, new THREE.SphereGeometry(0.2, 16, 12), -34.6, 3.02, 35.6);
  b.geo(brass, new THREE.TorusGeometry(0.205, 0.01, 6, 24), -34.6, 3.02, 35.6, 1, 1, 1, 0, PI / 2);
  b.cyl(brass, -34.6, 3.2, 35.6, 0.03, 0.08, 0.06, 12);

  /* ---- THE LISTENING ROOM (east window, x -31.55..-28.3, z 32.2..36.3) ---- */
  b.box(M.carpet, -29.925, 0.02, 34.25, 3.15, 0.016, 4.1);
  for (const z of [32.22, 34.3, 35.4, 36.3]) b.box(M.walnut, -31.55, 1.37, z, 0.08, 2.74, 0.08);
  b.box(M.walnut, -28.36, 1.37, 36.3, 0.08, 2.74, 0.08);
  for (const [z0, z1] of [[32.22, 34.3], [35.4, 36.3]]) {
    const zc = (z0 + z1) / 2, len = z1 - z0;
    b.box(M.walnut, -31.55, 0.45, zc, 0.06, 0.9, len);
    b.box(brass, -31.55, 0.05, zc, 0.07, 0.1, len);
    b.box(M.walnut, -31.55, 0.92, zc, 0.1, 0.04, len);
    b.box(M.glass, -31.55, 1.67, zc, 0.02, 1.5, len - 0.06);
    if (len > 1.5) b.box(brass, -31.55, 1.67, zc, 0.03, 1.5, 0.02);
  }
  b.box(M.walnut, -29.925, 0.45, 36.3, 3.2, 0.9, 0.06);
  b.box(M.walnut, -29.925, 0.92, 36.3, 3.2, 0.04, 0.1);
  b.box(M.glass, -29.925, 1.67, 36.3, 3.1, 1.5, 0.02);
  for (const x of [-30.95, -29.9]) b.box(brass, x, 1.67, 36.3, 0.02, 1.5, 0.03);
  b.box(M.walnut, -31.55, 2.58, 34.26, 0.12, 0.3, 4.2);
  b.box(M.walnut, -29.925, 2.58, 36.3, 3.3, 0.3, 0.12);
  b.box(M.walnut, -29.925, 2.75, 34.27, 3.3, 0.04, 4.14);
  b.box(brass, -31.615, 2.44, 34.26, 0.02, 0.02, 4.2);
  b.box(M.neon, -31.62, 2.745, 34.26, 0.03, 0.03, 4.1);
  b.box(M.neon, -29.925, 2.745, 36.37, 3.2, 0.03, 0.03);
  // Violet lightbox ceiling behind an egg-crate of walnut louvres.
  b.box(M.boothGlow, -29.925, 2.724, 34.27, 3.1, 0.006, 4.0);
  for (let x = -31.3; x < -28.4; x += 0.42) b.box(M.walnutDark, x, 2.68, 34.27, 0.025, 0.08, 4.0);
  for (let z = 32.6; z < 36.2; z += 0.45) b.box(M.walnutDark, -29.925, 2.68, z, 3.1, 0.08, 0.025);
  const listening = new THREE.Mesh(sheetGeo(1024, 1024, SIGN.neon, 2.0, 0.25), signMat);
  listening.position.set(-31.618, 2.58, 34.26);
  listening.rotation.y = -PI / 2;
  root.add(listening);
  // Quilted velvet on the shop's east wall inside the booth.
  b.box(M.walnut, -28.33, 0.46, 34.25, 0.04, 0.92, 4.0);
  b.box(M.walnutDark, -28.33, 1.68, 34.25, 0.04, 1.5, 4.0);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 8; c++) {
      const y = 1.18 + r * 0.5, z = 32.5 + c * 0.5;
      b.box(M.boothVelvet, -28.35, y, z, 0.03, 0.44, 0.44);
      b.cyl(brass, -28.37, y + 0.25, z + 0.25, 0.012, 0.012, 0.012, 6, 0, 0, PI / 2);
    }
  b.box(M.neon, -28.34, 2.46, 34.25, 0.025, 0.025, 3.9);
  // Window plinth (street side), laid out around the storefront mullion at x -30.16: a neon record ring with
  // the Hi-Fi script in the east pane, the HEAR IT FIRST card and two sleeves below.
  b.box(M.walnut, -29.925, 0.47, 32.36, 2.95, 0.94, 0.3);
  b.box(M.boothVelvet, -29.925, 0.946, 32.36, 2.97, 0.012, 0.32);
  b.box(M.neon, -29.925, 0.9, 32.2, 2.9, 0.02, 0.02);
  sign(SIGN.hear, 0.6, 0.15, -31.0, 1.08, 32.33, PI, -0.2);
  b.box(brass, -31.0, 1.02, 32.4, 0.012, 0.16, 0.012, 0, 0.5);
  [[7, -29.75], [12, -28.85]].forEach(([k, x]) => {
    sleeveArt(k, x, 1.11, 32.36, PI, -0.16);
    b.box(M.walnutDark, x, 1.11, 32.375, 0.3, 0.3, 0.012, PI, -0.16);
  });
  b.box(black, -29.3, 1.86, 32.3, 0.62, 0.62, 0.02);
  b.geo(M.neon, new THREE.TorusGeometry(0.29, 0.014, 6, 36), -29.3, 1.86, 32.285);
  b.geo(M.label, new THREE.TorusGeometry(0.11, 0.01, 6, 24), -29.3, 1.86, 32.285);
  sign(SIGN.hifi, 0.42, 0.14, -29.3, 1.86, 32.283, PI);
  for (const dx of [-0.26, 0.26]) b.box(brass, -29.3 + dx, 2.36, 32.3, 0.008, 0.38, 0.008);
  // Booth header across the window so the violet room reads from the pavement under the transom.
  b.box(M.walnut, -29.925, 2.58, 32.3, 3.3, 0.3, 0.12);
  b.box(M.neon, -29.925, 2.415, 32.33, 3.2, 0.03, 0.03);
  // Listening chair on the seat (-30.15, 33.85), facing the doorway (yaw 0.417, local forward -x).
  const cx = -30.15, cz = 33.85, th = 0.417, co = Math.cos(th), si = Math.sin(th);
  const chair = (mat, lx, ly, lz, sx, sy, sz, rz = 0) => b.box(mat, cx + lx * co + lz * si, ly, cz - lx * si + lz * co, sx, sy, sz, th, 0, rz);
  chair(M.walnut, 0.05, 0.33, 0, 0.64, 0.08, 0.68);
  chair(M.boothVelvet, 0.02, 0.42, 0, 0.6, 0.12, 0.6);
  chair(M.walnut, 0.36, 0.72, 0, 0.1, 0.68, 0.68, -0.2);
  chair(M.boothVelvet, 0.3, 0.76, 0, 0.06, 0.56, 0.56, -0.2);
  for (const lz of [-0.35, 0.35]) {
    chair(M.walnut, 0.03, 0.56, lz, 0.62, 0.05, 0.08);
    chair(M.walnut, -0.2, 0.46, lz, 0.05, 0.2, 0.05);
  }
  for (const [lx, lz] of [[-0.24, -0.26], [-0.24, 0.26], [0.3, -0.26], [0.3, 0.26]])
    b.cyl(brass, cx + lx * co + lz * si, 0.15, cz - lx * si + lz * co, 0.02, 0.012, 0.3, 6);
  b.cyl(M.walnut, -30.95, 0.5, 33.0, 0.2, 0.2, 0.03, 16);
  b.cyl(brass, -30.95, 0.25, 33.0, 0.015, 0.015, 0.5, 6);
  b.cyl(brass, -30.95, 0.015, 33.0, 0.14, 0.14, 0.02, 12);
  sleeveArt(1, -30.95, 0.518, 33.0, 0.5, -PI / 2);
  // Speaker cabinet in the corner.
  b.box(M.walnut, -31.2, 0.68, 35.95, 0.52, 1.22, 0.46);
  b.box(M.grille, -31.2, 0.74, 35.716, 0.44, 0.92, 0.01);
  b.cyl(brass, -31.2, 0.86, 35.708, 0.17, 0.17, 0.008, 24, 0, PI / 2);
  b.cyl(M.grille, -31.2, 0.86, 35.703, 0.155, 0.155, 0.008, 24, 0, PI / 2);
  b.cyl(black, -31.2, 0.86, 35.698, 0.045, 0.045, 0.008, 12, 0, PI / 2);
  // Console: grille front, turntable, VU bridge, and the Silver Sleeve vitrine (target -29.2, 35.9).
  b.box(M.walnut, -29.45, 0.46, 35.98, 2.0, 0.8, 0.52);
  b.box(M.walnutDark, -29.45, 0.87, 35.98, 2.04, 0.03, 0.56);
  for (const x of [-30.0, -28.9]) {
    b.box(M.grille, x, 0.46, 35.715, 0.9, 0.56, 0.01);
    b.box(brass, x, 0.75, 35.712, 0.92, 0.015, 0.012);
  }
  b.box(M.walnut, -30.0, 1.3, 36.19, 0.9, 0.84, 0.1);
  b.box(brass, -30.0, 1.73, 36.19, 0.92, 0.02, 0.12);
  for (const x of [-30.2, -29.8]) {
    b.box(brass, x, 1.5, 36.138, 0.3, 0.23, 0.01);
    sign(x < -30 ? SIGN.vuA : SIGN.vuB, 0.26, 0.19, x, 1.5, 36.131, PI);
  }
  for (let i = 0; i < 4; i++) b.cyl(i === 3 ? M.warm : brass, -30.3 + i * 0.2, 1.12, 36.13, 0.025, 0.025, 0.03, 10, 0, PI / 2);
  b.box(M.walnutDark, -30.0, 0.92, 35.9, 0.52, 0.07, 0.4);
  b.cyl(brass, -29.78, 0.98, 36.04, 0.025, 0.03, 0.05, 10);
  b.box(brass, -29.86, 1.0, 35.94, 0.012, 0.012, 0.24, 0.62);
  b.box(black, -29.95, 0.995, 35.85, 0.03, 0.012, 0.05, 0.62);
  b.box(M.walnut, -29.2, 0.9, 35.95, 0.52, 0.05, 0.36);
  b.box(M.clear, -29.2, 1.2, 35.95, 0.5, 0.55, 0.34);
  for (const dx of [-0.25, 0.25]) for (const dz of [-0.17, 0.17]) b.box(brass, -29.2 + dx, 1.2, 35.95 + dz, 0.012, 0.55, 0.012);
  b.box(brass, -29.2, 1.48, 35.95, 0.52, 0.015, 0.36);
  b.box(M.silverGlow, -29.2, 1.466, 35.95, 0.44, 0.008, 0.28);
  b.box(M.silverGlow, -29.2, 1.2, 36.1, 0.44, 0.5, 0.005);
  sleeveArt(15, -29.2, 1.13, 35.93, PI, -0.1);
  b.cyl(M.vinyl, -29.2, 1.2, 35.955, 0.15, 0.15, 0.004, 28, 0, PI / 2 - 0.1);
  b.box(brass, -29.2, 1.05, 35.98, 0.012, 0.26, 0.012, 0, 0.35);
  sign(SIGN.silver, 0.24, 0.06, -29.2, 0.955, 35.84, PI, -0.3);
  for (let i = 0; i < 4; i++) b.box(i % 2 ? cream : M.walnutDark, -28.78, 0.895 + i * 0.012, 35.97, 0.32, 0.011, 0.32, 0.15 * i);

  // Ceiling mobile: LPs on fishing line, slowly turning to catch the light.
  const HANG = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++) {
      const x = -36.9 + c * 1.1 + ((r * 3 + c) % 3) * 0.14, z = 33.4 + r * 1.1 + ((c * 5 + r) % 4) * 0.1;
      if (Math.hypot(x + 34.6, z - 35.6) < 0.55) continue;
      HANG.push({ x, z, y: 2.82 + ((r * 7 + c * 3) % 5) * 0.11, phase: r * 1.7 + c * 2.3, speed: 0.18 + ((r + c) % 4) * 0.07 });
    }
  for (const h of HANG) b.box(black, h.x, (h.y + 0.152 + 3.84) / 2, h.z, 0.004, 3.84 - h.y - 0.152, 0.004);

  b.flush(root);

  // Sleeve bodies: one instanced mesh, one colour each.
  const sleeveInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.31, 0.31, 0.006), std(0xffffff, 0.85), sleeveBodies.length);
  const d = new THREE.Object3D();
  const col = new THREE.Color();
  sleeveBodies.forEach(([x, y, z, ry, lean], i) => {
    d.position.set(x, y, z);
    d.rotation.set(lean, ry, 0, "YXZ");
    d.updateMatrix();
    sleeveInst.setMatrixAt(i, d.matrix);
    sleeveInst.setColorAt(i, col.setHex(SLEEVE_COLS[(i * 7 + (i >> 3)) % SLEEVE_COLS.length]));
  });
  root.add(sleeveInst);

  const discGeo = new THREE.CylinderGeometry(0.152, 0.152, 0.004, 32).rotateX(PI / 2);
  const capGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.006, 16).rotateX(PI / 2);
  const mobile = new THREE.InstancedMesh(discGeo, M.vinyl, HANG.length);
  const caps = new THREE.InstancedMesh(capGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), HANG.length);
  const CAP_COLS = [0x9b59d9, 0xe3b04b, 0xd9543a, 0x3fa7a0, 0xf1e6c8];
  HANG.forEach((h, i) => caps.setColorAt(i, col.setHex(CAP_COLS[i % CAP_COLS.length])));
  function hang(t) {
    HANG.forEach((h, i) => {
      d.position.set(h.x, h.y, h.z);
      d.rotation.set(0, h.phase + t * h.speed, Math.sin(t * 0.7 + h.phase) * 0.04, "YXZ");
      d.updateMatrix();
      mobile.setMatrixAt(i, d.matrix);
      caps.setMatrixAt(i, d.matrix);
    });
    mobile.instanceMatrix.needsUpdate = true;
    caps.instanceMatrix.needsUpdate = true;
  }
  hang(0);
  root.add(mobile, caps);

  // Turntable platter (spins) and VU needles (bounce) — the only per-frame objects.
  const platter = new THREE.Group();
  platter.position.set(-30.05, 0.958, 35.9);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.152, 0.006, 32), M.vinyl);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 16), M.label);
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.01, 0.008), cream);
  mark.position.set(0.025, 0, 0);
  platter.add(disc, label, mark);
  root.add(platter);
  const needleGeo = new THREE.BoxGeometry(0.005, 0.13, 0.003).translate(0, 0.065, 0);
  const needles = [-30.2, -29.8].map((x) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.417, 36.126);
    pivot.add(new THREE.Mesh(needleGeo, black));
    root.add(pivot);
    return pivot;
  });

  const light = lamp(-34.6, 35.6, 0xffc488, 34);
  light.position.y = 3.0;

  crowds.push(place(randomPedestrian(0.21, { outfit: "raver", anim: "idle" }), -36.85, 36.1, -PI / 2, "idle"));
  crowds.push(place(randomPedestrian(0.44, { outfit: "host", anim: "lean" }), -28.62, 35.0, -PI / 2, "lean"));
  crowds.push(place(randomPedestrian(0.62, { outfit: "dj", anim: "sit" }), -36.3, 37.02, 0, "sit", { sitHips: 0.54 }));

  let level = [0.4, 0.5];
  return {
    disc,
    label,
    update(dt, t, { zone, position, reduced }) {
      const near = zone === "records" || (position && Math.abs(position.x + 33.2) < 18 && position.z > 12 && position.z < 46);
      if (!near) return;
      platter.rotation.y -= dt * 3.49;
      needles.forEach((pivot, i) => {
        const beat = Math.max(0, Math.sin(t * 7.3 + i * 0.6)) ** 3;
        const target = 0.42 + 0.22 * Math.sin(t * 2.1 + i) * Math.sin(t * 0.37) + 0.3 * beat + 0.06 * Math.sin(t * 23 + i * 3);
        level[i] += (Math.min(1, Math.max(0, target)) - level[i]) * Math.min(1, dt * 10);
        pivot.rotation.z = -1.05 + 2.1 * level[i];
      });
      if (!reduced) hang(t);
    },
  };
}
