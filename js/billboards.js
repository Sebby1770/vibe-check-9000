import * as THREE from "three";
import { addBox, unitBox } from "./kit.js";
import { filledSlots, POSTER_KIOSK } from "./ads.js";

const _dir = new THREE.Vector3();
const _wp = new THREE.Vector3();
const _to = new THREE.Vector3();

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
  return texFromCanvas(c);
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
      side: THREE.DoubleSide,
    }),
  );
  card.position.set(0, 1.72, -0.26);
  card.rotation.y = Math.PI;
  g.add(card);
  root.add(g);
  return g;
}

export function buildBillboards(root, scene, config) {
  const black = new THREE.MeshStandardMaterial({ color: 0x121018, roughness: 0.55, metalness: 0.2 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x8a9098, roughness: 0.35, metalness: 0.7 });
  const boards = [];
  kiosk(root);

  for (const slot of filledSlots(config)) {
    const group = new THREE.Group();
    group.position.set(slot.x, slot.y, slot.z);
    group.rotation.y = slot.yaw || 0;
    addBox(group, unitBox, black, 0, 0, 0.1, slot.w + 0.4, slot.h + 0.4, 0.22);
    if (slot.w > 6) {
      addBox(group, unitBox, steel, -slot.w * 0.46, -slot.h * 0.7, 0.02, 0.12, slot.h * 0.9, 0.12);
      addBox(group, unitBox, steel, slot.w * 0.46, -slot.h * 0.7, 0.02, 0.12, slot.h * 0.9, 0.12);
    }
    const tex = paintPoster(slot.creative);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(slot.w, slot.h),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, toneMapped: false }),
    );
    mesh.position.z = 0.24;
    group.add(mesh);
    const floods = [];
    if (slot.w > 5) {
      for (const side of [-1, 1]) {
        const lamp = addBox(group, unitBox, new THREE.MeshBasicMaterial({ color: 0xffe7a8 }), side * slot.w * 0.28, slot.h * 0.58, 0.55, 0.22, 0.08, 0.28);
        floods.push(lamp.material);
      }
    }
    root.add(group);
    const rec = { slot, creative: slot.creative, mesh, group, floods };
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

  let lastSeen = [];
  function update(dt, t, { camera, reduced } = {}) {
    if (!reduced) {
      for (const b of boards) {
        for (let i = 0; i < b.floods.length; i++) {
          const on = Math.sin(t * 7 + i) > -0.55;
          b.floods[i].color.setHex(on ? 0xffe7a8 : 0x3a2a12);
        }
        if (b.creative.kind === "available") {
          const pulse = 0.82 + Math.sin(t * 2.2) * 0.18;
          b.mesh.material.color.setRGB(pulse, pulse * 0.95, 1);
        }
      }
    }
    lastSeen = [];
    if (!camera) return lastSeen;
    camera.getWorldDirection(_dir);
    for (const b of boards) {
      b.group.getWorldPosition(_wp);
      _to.copy(_wp).sub(camera.position);
      const dist = _to.length();
      if (dist < 4 || dist > 90) continue;
      _to.multiplyScalar(1 / dist);
      if (_dir.dot(_to) > 0.78) lastSeen.push(b.slot.id);
    }
    return lastSeen;
  }

  return { boards, update, get lastSeen() { return lastSeen; } };
}
