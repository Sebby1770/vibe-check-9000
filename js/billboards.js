import * as THREE from "three";
import { addBox, unitBox } from "./kit.js";
import { boxBatch } from "./interiors/batch.js";
import { filledSlots, POSTER_KIOSK, FRAME, PANEL, boardsOnRay } from "./ads.js";

const _dir = new THREE.Vector3();
const _eye = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const UP = new THREE.Vector3(0, 1, 0);
// Gap between the printed face and the panel behind it: enough depth precision at 100 m, tight on the newsstand tin.
const FACE_GAP = 0.05;

function texFromCanvas(c) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function paintPoster(creative, art, w = 2048, h = 1024) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  const paper = creative.colors?.paper || "#100c08";
  const ink = creative.colors?.ink || "#ffe7a8";
  const accent = creative.colors?.accent || "#ff6b6b";
  g.fillStyle = paper;
  g.fillRect(0, 0, w, h);
  if (art) {
    const zoom = 1.12;
    const dw = w * zoom;
    const dh = h * zoom;
    g.drawImage(art, (w - dw) / 2 - 18, (h - dh) / 2 - 10, dw, dh);
    const veil = g.createLinearGradient(0, h * 0.35, 0, h);
    veil.addColorStop(0, "rgba(8,6,10,0.08)");
    veil.addColorStop(0.45, "rgba(8,6,10,0.35)");
    veil.addColorStop(1, "rgba(8,6,10,0.78)");
    g.fillStyle = veil;
    g.fillRect(0, 0, w, h);
  } else {
    g.fillStyle = "rgba(255,231,168,0.04)";
    for (let i = 0; i < 40; i++) g.fillRect(40 + i * 48, 0, 2, h);
  }
  g.strokeStyle = accent;
  g.lineWidth = 18;
  g.strokeRect(28, 28, w - 56, h - 56);
  g.strokeStyle = ink;
  g.lineWidth = 4;
  g.strokeRect(48, 48, w - 96, h - 96);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = accent;
  g.shadowBlur = 28;
  g.fillStyle = accent;
  g.font = "700 54px Georgia, serif";
  g.fillText(String(creative.kicker || "").slice(0, 42), w / 2, h * 0.62);
  g.fillStyle = ink;
  g.font = "800 128px Georgia, serif";
  g.fillText(String(creative.brand || "").slice(0, 22), w / 2, h * 0.74);
  g.shadowBlur = 12;
  g.fillStyle = accent;
  g.font = "700 64px Georgia, serif";
  g.fillText(String(creative.line || "").slice(0, 34), w / 2, h * 0.86);
  g.shadowBlur = 0;
  g.fillStyle = ink;
  g.globalAlpha = 0.7;
  g.font = "700 28px Georgia, serif";
  const badge = creative.kind === "sponsor" ? "PAID PLACEMENT" : creative.kind === "available" ? "TO LET · MIDTOWN POSTER CO." : "47TH STREET";
  g.fillText(badge, w / 2, h * 0.945);
  g.globalAlpha = 1;
  const tex = texFromCanvas(c);
  tex.name = `board:${creative.brand || ""}`;
  return tex;
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function kiosk(root) {
  const g = new THREE.Group();
  g.position.set(POSTER_KIOSK.x, 0, POSTER_KIOSK.z);
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3224, roughness: 0.7 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc3a36c, roughness: 0.35, metalness: 0.55 });
  const black = new THREE.MeshStandardMaterial({ color: 0x16141c, roughness: 0.5 });
  addBox(g, unitBox, wood, 0, 0.7, 0, 1.05, 1.4, 0.48);
  addBox(g, unitBox, brass, 0, 1.42, 0, 1.12, 0.06, 0.55);
  addBox(g, unitBox, black, 0, 1.72, -0.22, 1.0, 0.52, 0.06);
  for (const x of [-0.46, 0.46]) addBox(g, unitBox, brass, x, 1.62, -0.21, 0.04, 0.4, 0.04);
  root.add(g);
  // The card is parented to the city root, not the kiosk group, so it reads as mounted on the kiosk's header board.
  const card = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.48),
    new THREE.MeshBasicMaterial({
      map: paintPoster({
        brand: "POSTER CO.",
        line: "BOARDS TO LET",
        kicker: "MIDTOWN",
        kind: "available",
        colors: { paper: "#120c08", ink: "#ffe7a8", accent: "#7b8cff" },
      }, null, 1024, 512),
      toneMapped: false,
    }),
  );
  card.position.set(POSTER_KIOSK.x, 1.72, POSTER_KIOSK.z - 0.26);
  card.rotation.y = Math.PI;
  root.add(card);
  return g;
}

/* Steel for one board, in the board's own frame: u along the face (viewer's right when yaw is 0),
   v up from the face centre, n out of the face toward the street. Everything goes into shared batches. */
function mountBoard(b, s, M) {
  const yaw = s.yaw || 0, c = Math.cos(yaw), sn = Math.sin(yaw);
  const P = (u, v, n) => [s.x + u * c + n * sn, s.y + v, s.z - u * sn + n * c];
  const box = (mat, u, v, n, su, sv, sd, rotX = 0) => b.box(mat, ...P(u, v, n), su, sv, sd, yaw, rotX);
  const strut = (mat, p, q, t = 0.1) => {
    const A = P(...p), B = P(...q);
    _a.set(...A); _b.set(...B);
    const len = _a.distanceTo(_b);
    _q.setFromUnitVectors(UP, _b.sub(_a).normalize());
    _e.setFromQuaternion(_q, "YXZ");
    b.box(mat, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2, t, len, t, _e.y, _e.x, _e.z);
  };
  const m = s.mount || { type: "wall", off: 0.3 };
  const stand = m.type === "stand";
  const hw = s.w / 2, hh = s.h / 2, F = stand ? 0.04 : FRAME;
  const gap = stand ? 0.012 : FACE_GAP;
  const depth = stand ? 0.03 : PANEL;
  const back = -(gap + depth);

  // Panel, enamel moulding, cream bead.
  box(stand ? M.enamel : M.panel, 0, 0, -gap - depth / 2, s.w + 2 * F, s.h + 2 * F, depth);
  if (stand) {
    for (const u of [-hw - 0.02, hw + 0.02]) for (const v of [-hh - 0.02, hh + 0.02]) box(M.iron, u, v, -0.004, 0.035, 0.035, 0.02);
    return;
  }
  const fd = 0.16, fn = -gap - depth / 2 + fd / 2 - 0.02;
  box(M.enamel, 0, hh + F / 2, fn, s.w + 2 * F, F, fd);
  box(M.enamel, 0, -hh - F / 2, fn, s.w + 2 * F, F, fd);
  box(M.enamel, -hw - F / 2, 0, fn, F, s.h, fd);
  box(M.enamel, hw + F / 2, 0, fn, F, s.h, fd);
  box(M.cream, 0, hh + 0.012, 0.012, s.w, 0.024, 0.05);
  box(M.cream, 0, -hh - 0.012, 0.012, s.w, 0.024, 0.05);
  box(M.cream, -hw - 0.012, 0, 0.012, 0.024, s.h, 0.05);
  box(M.cream, hw + 0.012, 0, 0.012, 0.024, s.h, 0.05);

  const cols = Math.max(2, Math.round(s.w / 2.8) + 1);
  const colU = Array.from({ length: cols }, (_, i) => -hw + 0.35 + (s.w - 0.7) * (i / (cols - 1)));
  const top = hh + F, bottom = -hh - F;
  let deckBase = null; // n,v the catwalk knee braces run back to

  if (m.type === "wall") {
    const wallN = -m.off;
    const len = m.off + back;
    const rows = s.h > 4 ? [hh - 0.35, 0, -hh + 0.35] : [hh - 0.25, -hh + 0.25];
    for (const u of colU) {
      box(M.iron, u, 0, back - 0.05, 0.14, s.h + 2 * F - 0.1, 0.1);
      for (const v of rows) {
        box(M.iron, u, v, back - len / 2, 0.1, 0.1, len);
        box(M.iron, u, v, wallN + 0.015, 0.32, 0.32, 0.03);
      }
    }
    deckBase = (u) => [u, bottom - 1.2, wallN + 0.03];
  } else {
    const vRoof = m.roofY - s.y;
    const postN = back - 0.1;
    const rake = Math.abs((m.rearZ ?? s.z) - s.z);
    const legTop = top - 0.15;
    for (const u of colU) {
      box(M.iron, u, (vRoof + legTop) / 2, postN, 0.18, legTop - vRoof, 0.18);
      box(M.iron, u, vRoof + 0.04, postN, 0.46, 0.08, 0.46);
      if (rake > 0.7) {
        const footN = -rake;
        strut(M.iron, [u, vRoof + 0.08, footN], [u, vRoof + (legTop - vRoof) * 0.72, postN], 0.14);
        strut(M.iron, [u, vRoof + 0.07, footN], [u, vRoof + 0.07, postN], 0.12);
        box(M.iron, u, vRoof + 0.03, footN, 0.36, 0.06, 0.36);
      }
      if (m.tieZ != null) {
        const wallN = -Math.abs(m.tieZ - s.z);
        strut(M.iron, [u, legTop - 0.5, postN], [u, legTop - 0.5, wallN + 0.03], 0.1);
        box(M.iron, u, legTop - 0.5, wallN + 0.015, 0.3, 0.3, 0.03);
      }
    }
    // Girts across the posts and X-bracing in the open bay under the board.
    for (const v of [top - 0.3, 0, bottom + 0.05]) box(M.iron, 0, v, postN - 0.13, s.w - 0.5, 0.12, 0.08);
    const open = bottom - vRoof;
    if (open > 0.8) {
      box(M.iron, 0, vRoof + 0.25, postN, s.w - 0.5, 0.1, 0.1);
      for (let i = 0; i < cols - 1; i++) {
        strut(M.iron, [colU[i], vRoof + 0.3, postN + 0.02], [colU[i + 1], bottom - 0.1, postN + 0.02], 0.07);
        strut(M.iron, [colU[i + 1], vRoof + 0.3, postN + 0.02], [colU[i], bottom - 0.1, postN + 0.02], 0.07);
      }
    }
    deckBase = (u) => [u, Math.max(vRoof + 0.2, bottom - 1.0), postN];
    // Service ladder from the roof to the catwalk at the right-hand end.
    if (m.catwalk || open > 1.2) {
      const lu = hw + F + 0.35, lTop = m.catwalk ? bottom - 0.15 + 1.0 : bottom;
      for (const du of [-0.22, 0.22]) box(M.iron, lu + du, (vRoof + lTop) / 2, 0.45, 0.05, lTop - vRoof, 0.05);
      for (let v = vRoof + 0.3; v < lTop - 0.1; v += 0.32) box(M.iron, lu, v, 0.45, 0.44, 0.035, 0.035);
    }
  }

  if (m.catwalk) {
    const dv = bottom - 0.15, span = s.w + 2 * F + 0.6, railN = 1.12;
    box(M.iron, 0, dv - 0.03, (back + 1.18) / 2, span, 0.06, 1.18 - back);
    box(M.iron, 0, dv + 0.06, railN + 0.03, span, 0.12, 0.025);
    box(M.iron, 0, dv + 1.05, railN, span, 0.05, 0.05);
    box(M.iron, 0, dv + 0.55, railN, span, 0.04, 0.04);
    const posts = Math.max(3, Math.round(span / 2) + 1);
    for (let i = 0; i < posts; i++) box(M.iron, -span / 2 + 0.05 + (span - 0.1) * (i / (posts - 1)), dv + 0.52, railN, 0.05, 1.05, 0.05);
    for (const u of colU) {
      box(M.iron, u, dv - 0.1, (back + railN) / 2, 0.08, 0.1, railN - back);
      strut(M.iron, [u, dv - 0.12, railN - 0.05], deckBase(u), 0.08);
    }
  }

  // Gooseneck floods on the top rail, hooded, aimed back down at the paper.
  for (let i = 0; i < (m.lamps || 0); i++) {
    const u = -hw + s.w * (i + 0.5) / m.lamps;
    const reach = Math.min(1.25, 0.55 + s.h * 0.12);
    box(M.iron, u, top + 0.22, fn, 0.07, 0.44, 0.07);
    strut(M.iron, [u, top + 0.42, fn], [u, top + 0.62, reach - 0.12], 0.06);
    box(M.iron, u, top + 0.64, reach, 0.44, 0.18, 0.36, 0.55);
    box(M.lens, u, top + 0.53, reach - 0.05, 0.36, 0.03, 0.28, 0.55);
  }

  // Neon trim round the moulding on the small fascia boards, on little stand-off clips.
  if (m.neon) {
    const mat = M.neon(m.neon), o = F + 0.07, nn = 0.09;
    box(mat, 0, hh + o, nn, s.w + 2 * o, 0.045, 0.045);
    box(mat, 0, -hh - o, nn, s.w + 2 * o, 0.045, 0.045);
    box(mat, -hw - o, 0, nn, 0.045, s.h + 2 * o, 0.045);
    box(mat, hw + o, 0, nn, 0.045, s.h + 2 * o, 0.045);
    for (const u of [-hw - o, hw + o]) for (const v of [-hh - o, hh + o]) box(M.iron, u, v, nn / 2, 0.03, 0.03, nn);
  }
}

export function buildBillboards(root, scene, config) {
  const neonMats = new Map();
  const M = {
    panel: new THREE.MeshStandardMaterial({ color: 0x1a1714, roughness: 0.8, metalness: 0.1 }),
    enamel: new THREE.MeshStandardMaterial({ color: 0x23332c, roughness: 0.45, metalness: 0.3 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xcfc2a2, roughness: 0.5 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x5a5e63, roughness: 0.55, metalness: 0.6 }),
    lens: new THREE.MeshBasicMaterial({ color: 0xffe6b0, toneMapped: false }),
    neon(color) {
      if (!neonMats.has(color)) neonMats.set(color, new THREE.MeshBasicMaterial({ color, toneMapped: false }));
      return neonMats.get(color);
    },
  };
  const boards = [];
  kiosk(root);
  const batch = boxBatch();
  // Faces share one small group; their steel is batched, so the audit's "wall behind" is the board's own panel.
  const faces = new THREE.Group();
  faces.name = "billboard-faces";

  for (const slot of filledSlots(config)) {
    mountBoard(batch, slot, M);
    const tex = paintPoster(slot.creative);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(slot.w, slot.h),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
    );
    mesh.position.set(slot.x, slot.y, slot.z);
    mesh.rotation.y = slot.yaw || 0;
    faces.add(mesh);
    const rec = { slot, creative: slot.creative, mesh };
    boards.push(rec);
    if (slot.creative.art) {
      loadImage(slot.creative.art).then((img) => {
        if (!img) return;
        const next = paintPoster(slot.creative, img);
        const old = mesh.material.map;
        mesh.material.map = next;
        mesh.material.needsUpdate = true;
        if (old && old !== next) old.dispose();
      });
    }
  }
  root.add(faces);
  const steel = batch.flush(root);
  for (const m of steel || []) m.name = "billboard-steel";

  const slots = boards.map((b) => b.slot);
  const own = new Set([faces, ...(steel || [])]);
  let solids = null;
  const ray = new THREE.Raycaster();
  const clear = new Map(); // slot id -> { t, open }

  // Opaque city boxes between the eye and a board hide it; built lazily, tested at most ~4x a second per board.
  function occluded(id, point, t) {
    const hit = clear.get(id);
    if (hit && t - hit.t < 0.25 && hit.x === Math.round(point.x) && hit.y === Math.round(point.y)) return !hit.open;
    if (!solids) {
      solids = [];
      root.traverse((o) => {
        if (own.has(o) || !o.isMesh || o.isInstancedMesh || o.geometry?.type !== "BoxGeometry") return;
        if (o.material?.transparent || o.material?.visible === false) return;
        solids.push(o);
      });
    }
    _dir.set(point.x, point.y, point.z).sub(_eye);
    const far = _dir.length() - 0.6;
    ray.set(_eye, _dir.normalize());
    ray.far = Math.max(0.1, far);
    const open = !solids.some((o) => o.visible && ray.intersectObject(o, false).length);
    clear.set(id, { t, open, x: Math.round(point.x), y: Math.round(point.y) });
    return !open;
  }

  let lastSeen = [];
  function update(dt, t, { camera, reduced } = {}) {
    if (!reduced) {
      for (const b of boards) {
        if (b.creative.kind === "available") {
          const pulse = 0.82 + Math.sin(t * 2.2) * 0.18;
          b.mesh.material.color.setRGB(pulse, pulse * 0.95, 1);
        }
      }
    }
    lastSeen = [];
    if (!camera) return lastSeen;
    camera.getWorldPosition(_eye);
    camera.getWorldDirection(_dir);
    for (const h of boardsOnRay(slots, _eye, _dir)) {
      if (occluded(h.id, h.point, t)) continue;
      lastSeen = [h.id];
      break;
    }
    return lastSeen;
  }

  return { boards, update, get lastSeen() { return lastSeen; } };
}
