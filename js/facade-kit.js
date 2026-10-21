/* Facade kit for the original 47th Street block: every window gets a carved stone surround with a recessed
   pane, a deep sill and a lintel with a keystone, and each tower tier gets corbel brackets under its cornice.
   One instanced draw per part for the whole block. Windows and brackets behind a sign are left out so no
   frame ever pokes through an advertisement; the parts are merged geometry rather than boxes, so the sign
   and road audits treat them as wall detail. */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

function box(w, h, d, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

/* One window's stonework, for a 0.85 × 1.25 pane at z 0 facing +z (the facade face is at z = -0.05).
   The pane sits 0.05 m in front of the wall, so a 0.12 m deep surround leaves it recessed. */
function surroundGeometry() {
  const W = 0.85, H = 1.25, t = 0.075, d = 0.11, z = -0.05 + d / 2;
  return mergeGeometries([
    box(W + 2 * t, t, d, 0, H / 2 + t / 2, z),            // head
    box(t, H, d, -(W + t) / 2, 0, z),                     // jambs
    box(t, H, d, (W + t) / 2, 0, z),
    box(W + 2 * t + 0.12, 0.07, 0.2, 0, -H / 2 - 0.035, -0.05 + 0.1),   // sill
    box(W + 2 * t + 0.1, 0.1, 0.15, 0, H / 2 + t + 0.05, -0.05 + 0.075), // lintel
    box(0.16, 0.16, 0.17, 0, H / 2 + t + 0.06, -0.05 + 0.085),           // keystone
  ]);
}
/* A corbel: a stepped bracket under a cornice, facing +z from a wall at z 0. */
function bracketGeometry() {
  return mergeGeometries([
    box(0.22, 0.12, 0.3, 0, 0.06, 0.15),
    box(0.18, 0.12, 0.22, 0, -0.06, 0.11),
    box(0.14, 0.1, 0.12, 0, -0.17, 0.06),
  ]);
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler(), _inv = new THREE.Matrix4(), _v = new THREE.Vector3();

/** windows: [{x, y, z, ry, sx?, sy?}] (the city's pane instances); brackets: [{x, y, z, ry}]. */
export function dressFacades(root, { windows = [], brackets = [] } = {}) {
  root.updateMatrixWorld(true);
  const signs = [];
  root.traverse((o) => {
    if (o.isMesh && !o.isInstancedMesh && o.geometry?.type === "PlaneGeometry" && o.material?.map && o.material.type === "MeshBasicMaterial") {
      const g = o.geometry.parameters;
      signs.push({ inv: _inv.copy(o.matrixWorld).invert().clone(), hw: (g.width * Math.abs(o.scale.x)) / 2 + 0.7, hh: (g.height * Math.abs(o.scale.y)) / 2 + 0.7 });
    }
  });
  const hidden = (x, y, z) => signs.some((s) => { _v.set(x, y, z).applyMatrix4(s.inv); return Math.abs(_v.z) < 1.2 && Math.abs(_v.x) < s.hw && Math.abs(_v.y) < s.hh; });

  const stone = new THREE.MeshStandardMaterial({ color: 0x9c907a, roughness: 0.85 });
  const keep = windows.filter((w) => !hidden(w.x, w.y, w.z));
  const frames = new THREE.InstancedMesh(surroundGeometry(), stone, Math.max(1, keep.length));
  keep.forEach((w, i) => {
    _m.compose(_p.set(w.x, w.y, w.z), _q.setFromEuler(_e.set(0, w.ry, 0)), _s.set(w.sx || 1, w.sy || 1, 1));
    frames.setMatrixAt(i, _m);
  });
  frames.count = keep.length;
  // Too small to be worth a place in the shadow map (markShadows respects noShadow).
  frames.receiveShadow = true;
  frames.userData.noShadow = true;
  frames.name = "window surrounds";
  root.add(frames);

  const keepB = brackets.filter((b) => !hidden(b.x, b.y, b.z));
  const corbels = new THREE.InstancedMesh(bracketGeometry(), stone, Math.max(1, keepB.length));
  keepB.forEach((b, i) => {
    _m.compose(_p.set(b.x, b.y, b.z), _q.setFromEuler(_e.set(0, b.ry, 0)), _s.set(1, 1, 1));
    corbels.setMatrixAt(i, _m);
  });
  corbels.count = keepB.length;
  corbels.receiveShadow = true;
  corbels.userData.noShadow = true;
  corbels.name = "cornice brackets";
  root.add(corbels);
  return { frames: keep.length, brackets: keepB.length, skipped: windows.length - keep.length + brackets.length - keepB.length, meshes: [frames, corbels] };
}
