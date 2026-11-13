/* The Lost 45s in the world: each record turns slowly above a crate, in a pool of warm glow with a thin beam of
   light over it so you can spot it down a street. Five instanced draws for all ten; found ones are gone. Nothing
   here is a light or a collider. */
import * as THREE from "three";
import { RECORDS } from "./lost45s.js";

const LABELS = [0xd9482b, 0xe9b44c, 0x4f9d8f, 0xc85a8e, 0x5b7fc7, 0xe07b39, 0x8fb04a, 0xb0563c, 0x7a5fc0, 0xd8c26a];

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 96;
  const g = c.getContext("2d"), r = g.createRadialGradient(48, 48, 0, 48, 48, 48);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.45, "rgba(255,255,255,0.35)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 96, 96);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildLost45s(scene) {
  const n = RECORDS.length;
  const inst = (geo, mat, name) => {
    const m = new THREE.InstancedMesh(geo, mat, n);
    m.name = name;
    m.frustumCulled = false;
    m.userData.noShadow = true;
    scene.add(m);
    return m;
  };
  // A four-sided "cylinder" is a square crate (and, not being a box, is left alone by the scene audits).
  const crates = inst(new THREE.CylinderGeometry(0.33, 0.29, 0.34, 4).rotateY(Math.PI / 4), new THREE.MeshStandardMaterial({ color: 0x6a4a32, roughness: 0.82 }), "record crates");
  const vinyl = inst(new THREE.CylinderGeometry(0.26, 0.26, 0.014, 28).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x17171c, roughness: 0.25, metalness: 0.2 }), "lost 45s");
  // The label keeps its own colour in the dark (unlit), so a record reads as a record down a night street.
  const labels = inst(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 20).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ toneMapped: false }), "lost 45 labels");
  const additive = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false };
  const pools = inst(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffc27e, map: glowTexture(), opacity: 0.5, ...additive }), "record glow");
  pools.renderOrder = 2;
  const beams = inst(new THREE.CylinderGeometry(0.05, 0.09, 7, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffc27e, opacity: 0.05, ...additive }), "record beams");

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _one = new THREE.Vector3(1, 1, 1), _zero = new THREE.Vector3(0, 0, 0), _c = new THREE.Color();
  const UP = new THREE.Vector3(0, 1, 0);
  let found = new Set();
  function place() {
    RECORDS.forEach((r, i) => {
      const s = found.has(r.id) ? _zero : _one;
      crates.setMatrixAt(i, _m.compose(_p.set(r.x, 0.17, r.z), _q.identity(), s));
      pools.setMatrixAt(i, _m.compose(_p.set(r.x, 0.04, r.z), _q.identity(), s));
      beams.setMatrixAt(i, _m.compose(_p.set(r.x, 3.9, r.z), _q.identity(), s));
      labels.setColorAt(i, _c.setHex(LABELS[i % LABELS.length]));
    });
    for (const m of [crates, pools, beams]) m.instanceMatrix.needsUpdate = true;
    labels.instanceColor.needsUpdate = true;
  }
  place();

  return {
    meshes: [crates, vinyl, labels, pools, beams],
    /** ids of the records already found (they vanish). */
    setFound(ids) { found = new Set(ids); place(); },
    update(dt, t) {
      RECORDS.forEach((r, i) => {
        const gone = found.has(r.id);
        _q.setFromAxisAngle(UP, t * 1.1 + i * 0.9);
        _p.set(r.x, 0.78 + Math.sin(t * 1.7 + i) * 0.05, r.z);
        _m.compose(_p, _q, gone ? _zero : _one);
        vinyl.setMatrixAt(i, _m);
        labels.setMatrixAt(i, _m);
      });
      vinyl.instanceMatrix.needsUpdate = true;
      labels.instanceMatrix.needsUpdate = true;
      beams.material.opacity = 0.05 + 0.02 * Math.sin(t * 2.1);
    },
  };
}
