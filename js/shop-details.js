/* Storefront glazing for the 47th St row: window bays either side of each door, door cards, fascia glow.
   Everything behind the glass (z >= 32.2) lives in js/interiors/<shop>.js. */
import * as THREE from "three";
import { addBox, unitBox } from "./kit.js";
import { SHOPS } from "./zones.js";
import { card, sharedMats } from "./interiors/common.js";

export function decorateShops(root, mats) {
  const { brass, slate } = sharedMats();
  const glass = new THREE.MeshStandardMaterial({
    color: 0xa4c8bf,
    transparent: true,
    opacity: 0.17,
    roughness: 0.22,
    metalness: 0.1,
    depthWrite: false,
  });
  for (const s of SHOPS) {
    const cx = (s.minX + s.maxX) / 2,
      w = s.maxX - s.minX;
    addBox(root, unitBox, new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), cx, 6.35, 32.18, Math.min(w * 0.42, 4.2), 1.15, 0.04);
    for (const [left, right] of [
      [s.minX + 0.2, s.doorX - 1.38],
      [s.doorX + 1.38, s.maxX - 0.2],
    ]) {
      if (right - left < 0.2) continue;
      const middle = (left + right) / 2,
        span = right - left;
      addBox(root, unitBox, slate, middle, 0.42, 32.02, span, 0.84, 0.16);
      addBox(root, unitBox, glass, middle, 1.73, 32.01, span, 1.8, 0.018);
      addBox(root, unitBox, brass, middle, 2.64, 31.96, span, 0.065, 0.08);
      addBox(root, unitBox, brass, middle, 0.86, 31.96, span, 0.065, 0.08);
      addBox(root, unitBox, brass, middle, 1.74, 31.96, 0.045, 1.8, 0.08);
    }
    card(root, ["OPEN LATE", "COME ON IN"], s.doorX + 0.95, 2.14, 31.85, 0.5, 0.55, {
      ink: "#304f45",
      paper: "#e9d7b0",
    });
  }
  return {};
}
