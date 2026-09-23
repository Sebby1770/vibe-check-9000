/* Storefront glazing for the 47th St row: bulkheads, display glass, brass mullions and the hanging OPEN LATE cards.
   Glass sits in the colliders' storefront line (z 32.05); the door gap stays open. Everything behind it (z >= 32.2)
   lives in js/interiors/<shop>.js. */
import * as THREE from "three";
import { SHOPS } from "./zones.js";
import { card, sharedMats } from "./interiors/common.js";

export function decorateShops(root, mats, b) {
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
    for (const [left, right, door] of [
      [s.minX + 0.3, s.doorX - 1.38, false],
      [s.doorX + 1.38, s.maxX - 0.3, true],
    ]) {
      if (right - left < 0.2) continue;
      const mid = (left + right) / 2,
        span = right - left;
      b.box(slate, mid, 0.28, 32.02, span, 0.56, 0.16);
      b.box(brass, mid, 0.58, 31.96, span, 0.05, 0.1);
      b.box(glass, mid, 1.58, 32.01, span, 2.04, 0.018);
      b.box(brass, mid, 2.66, 31.96, span, 0.12, 0.1);
      b.box(brass, mid, 2.2, 31.975, span, 0.04, 0.06);
      b.box(brass, mid, 1.39, 31.975, 0.045, 1.62, 0.06);
      if (!door || span < 1.3) continue;
      // Card on a backing board, hung on two short chains from the transom bar just inside the glass.
      const x = left + 0.38;
      b.box(mats.wood, x, 1.8, 32.066, 0.58, 0.63, 0.012);
      for (const dx of [-0.2, 0.2]) b.box(brass, x + dx, 2.15, 32.066, 0.012, 0.09, 0.012);
      card(root, ["OPEN LATE", "COME ON IN"], x, 1.8, 32.05, 0.5, 0.55, {
        ink: "#304f45",
        paper: "#e9d7b0",
      });
    }
  }
  return {};
}
