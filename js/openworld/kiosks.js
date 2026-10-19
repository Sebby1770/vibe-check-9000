/* Subway entrances for fast travel: railed IRT stair heads with the green globe lamps, an enamel plate at the
   foot of the El stair, and a route map on the 47th Street platform. Static parts are batched; the plates are
   lit canvas materials (not signs), and every footprint matches stationColliders(). */
import * as THREE from "three";
import { boxBatch } from "../interiors/batch.js";
import { SUBWAY_STATIONS } from "./stations.js";

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const FONT = '"Big Shoulders Text", "Oswald", "Arial Narrow", sans-serif';

function enamel(lines, { w = 1024, h = 192, bg = "#1f4a32", ink = "#f1ead6" } = {}) {
  const map = canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = ink; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `800 ${Math.round(h * 0.42)}px ${FONT}`; g.fillText(lines[0], w / 2, h * (lines[1] ? 0.38 : 0.52));
    if (lines[1]) { g.font = `700 ${Math.round(h * 0.22)}px ${FONT}`; g.fillText(lines[1], w / 2, h * 0.74); }
  });
  // A little self-light, as if the globes catch the enamel, so the plates read after dark.
  return new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.1, map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.28 });
}

/** Steps falling away into the dark, for the floor of a stair head. `open` = which end is the top. */
function stairWell() {
  return new THREE.MeshStandardMaterial({ roughness: 0.9, map: canvasTex(256, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, "#020202"); gr.addColorStop(0.75, "#2a2724"); gr.addColorStop(1, "#5a554c");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) { const x = w - (i + 1) * (w / 15); g.fillStyle = `rgba(200,190,170,${0.22 * (1 - i / 14)})`; g.fillRect(x, 0, 2, h); }
  }) });
}

export function buildStationFixtures(scene) {
  const root = new THREE.Group();
  root.name = "Subway entrances";
  scene.add(root);
  const green = new THREE.MeshStandardMaterial({ color: 0x2f5a3c, roughness: 0.45, metalness: 0.5 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x23262a, roughness: 0.5, metalness: 0.6 });
  const globe = new THREE.MeshStandardMaterial({ color: 0x9dffb0, emissive: 0x3cff6a, emissiveIntensity: 1.25, roughness: 0.3 });
  const well = stairWell();
  const b = boxBatch();
  const plates = [];
  for (const s of SUBWAY_STATIONS) {
    if (s.kiosk) {
      const { len, wid, open } = s.kiosk, x0 = s.x - len / 2, x1 = s.x + len / 2, z0 = s.z - wid / 2, z1 = s.z + wid / 2;
      // Floor of the well, and the kerb round it.
      b.geo(well, new THREE.PlaneGeometry(len - 0.2, wid - 0.2), s.x, 0.012, s.z, 1, 1, 1, open > 0 ? 0 : Math.PI, -Math.PI / 2, 0);
      for (const z of [z0 + 0.05, z1 - 0.05]) b.box(iron, s.x, 0.06, z, len, 0.12, 0.1);
      b.box(iron, open > 0 ? x0 + 0.05 : x1 - 0.05, 0.06, s.z, 0.1, 0.12, wid);
      // Railings on the two long sides and the closed end: rails, posts and balusters.
      const runs = [["x", z0 + 0.05], ["x", z1 - 0.05], ["z", open > 0 ? x0 + 0.05 : x1 - 0.05]];
      for (const [axis, at] of runs) {
        const a0 = axis === "x" ? x0 : z0, a1 = axis === "x" ? x1 : z1, mid = (a0 + a1) / 2, L = a1 - a0;
        for (const y of [1.02, 0.3]) axis === "x" ? b.box(green, mid, y, at, L, 0.05, 0.05) : b.box(green, at, y, mid, 0.05, 0.05, L);
        for (let a = a0 + 0.12; a <= a1 - 0.1; a += 0.2) axis === "x" ? b.box(green, a, 0.66, at, 0.025, 0.72, 0.025) : b.box(green, at, 0.66, a, 0.025, 0.72, 0.025);
        for (const a of [a0 + 0.04, a1 - 0.04]) axis === "x" ? b.box(green, a, 0.55, at, 0.07, 1.1, 0.07) : b.box(green, at, 0.55, a, 0.07, 1.1, 0.07);
      }
      // The globe lamps either side of the stair mouth.
      const ox = open > 0 ? x1 - 0.04 : x0 + 0.04;
      for (const z of [z0 + 0.05, z1 - 0.05]) {
        b.cyl(green, ox, 1.25, z, 0.045, 0.06, 2.5, 10);
        b.cyl(green, ox, 2.52, z, 0.09, 0.07, 0.08, 12);
        b.geo(globe, new THREE.SphereGeometry(0.17, 16, 12), ox, 2.72, z);
      }
      // An enamel plate over the closed end, readable from both sides.
      const cx = open > 0 ? x0 + 0.05 : x1 - 0.05, mat = enamel(["SUBWAY", s.name.toUpperCase()]);
      for (const side of [-1, 1]) {
        const plate = new THREE.Mesh(new THREE.PlaneGeometry(wid - 0.3, 0.42), mat);
        plate.position.set(cx + side * 0.016, 1.42, s.z);
        plate.rotation.y = side * Math.PI / 2;
        plates.push(plate);
      }
      b.box(iron, cx, 1.42, s.z, 0.026, 0.48, wid - 0.22);
      for (const z of [z0 + 0.2, z1 - 0.2]) b.box(green, cx, 1.24, z, 0.05, 0.36, 0.05);
    } else if (s.el) {
      // The El's stair tower stands at (x, z - 1.4); its plate faces the pavement.
      const mat = enamel(["3RD AV EL", "44½ ST · UPTOWN & DOWNTOWN"], { bg: "#2a2622" });
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.3), mat);
      plate.position.set(s.x, 2.4, s.z - 0.33);
      plates.push(plate);
      b.box(iron, s.x, 2.4, s.z - 0.36, 1.58, 0.36, 0.04);
      b.geo(globe, new THREE.SphereGeometry(0.15, 16, 12), s.x - 1.0, 2.75, s.z - 0.25);
      b.cyl(iron, s.x - 1.0, 2.58, s.z - 0.3, 0.03, 0.03, 0.22, 8);
    } else if (s.board) {
      // 47th Street: a framed route map on the platform's back wall (inner face z 27.27).
      const z = 27.27, y = s.board.y + 1.55;
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.5, map: canvasTex(640, 440, (g, w, h) => {
        g.fillStyle = "#efe6cf"; g.fillRect(0, 0, w, h);
        g.fillStyle = "#1f4a32"; g.fillRect(0, 0, w, 74);
        g.fillStyle = "#f1ead6"; g.textAlign = "left"; g.textBaseline = "middle";
        g.font = `800 40px ${FONT}`; g.fillText("ROUTE MAP", 26, 40);
        g.font = `700 20px ${FONT}`; g.textAlign = "right"; g.fillText("IRT · BMT · 3RD AV EL", w - 24, 40);
        const stops = SUBWAY_STATIONS.map((t) => t.name.toUpperCase());
        g.strokeStyle = "#1f6b3a"; g.lineWidth = 10; g.beginPath(); g.moveTo(70, 110); g.lineTo(70, 110 + (stops.length - 1) * 62); g.stroke();
        stops.forEach((name, i) => {
          const y0 = 110 + i * 62;
          g.beginPath(); g.arc(70, y0, 15, 0, Math.PI * 2); g.fillStyle = i === 0 ? "#e65a3e" : "#1f6b3a"; g.fill();
          g.lineWidth = 4; g.strokeStyle = "#f1ead6"; g.stroke();
          g.fillStyle = "#2b2118"; g.textAlign = "left"; g.font = `${i === 0 ? 800 : 700} 28px ${FONT}`; g.fillText(name, 104, y0 + 1);
        });
        g.fillStyle = "#7a5a20"; g.font = `700 22px ${FONT}`; g.textAlign = "right"; g.fillText("YOU ARE HERE ●  ·  PRESS E TO RIDE", w - 24, h - 28);
      }) });
      b.box(iron, s.board.x, y, z + 0.025, 1.42, 1.02, 0.05);
      const board = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.9), mat);
      board.position.set(s.board.x, y, z + 0.053);
      plates.push(board);
      b.geo(globe, new THREE.SphereGeometry(0.09, 12, 10), s.board.x, y + 0.66, z + 0.12);
    }
  }
  b.flush(root);
  for (const p of plates) root.add(p);
  root.traverse((o) => { if (o.isMesh) o.userData.noShadow = o.material === globe; });
  return root;
}
