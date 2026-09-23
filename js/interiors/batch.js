/* Static-geometry batching for interiors: many boxes/cylinders → one mesh per material.
   const b = boxBatch(); b.box(mat, x, y, z, sx, sy, sz, rotY); b.cyl(mat, x, y, z, rTop, rBot, h, seg); b.flush(root);
   Everything added to a batch must be static and must not need its own material instance. */
import * as THREE from "three";

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _n = new THREE.Matrix3();
const _v = new THREE.Vector3();
const UNIT = new THREE.BoxGeometry(1, 1, 1);
const cylCache = new Map();

function cylinder(rTop, rBot, seg) {
  const key = `${rTop}:${rBot}:${seg}`;
  if (!cylCache.has(key)) cylCache.set(key, new THREE.CylinderGeometry(rTop, rBot, 1, seg));
  return cylCache.get(key);
}

export function boxBatch() {
  const parts = new Map();
  function push(mat, geo, x, y, z, sx, sy, sz, rotY = 0, rotX = 0, rotZ = 0) {
    _p.set(x, y, z);
    _q.setFromEuler(_e.set(rotX, rotY, rotZ, "YXZ"));
    _s.set(sx, sy, sz);
    _m.compose(_p, _q, _s);
    if (!parts.has(mat)) parts.set(mat, []);
    parts.get(mat).push({ geo, matrix: _m.clone() });
  }
  return {
    box(mat, x, y, z, sx = 1, sy = 1, sz = 1, rotY = 0, rotX = 0, rotZ = 0) {
      push(mat, UNIT, x, y, z, sx, sy, sz, rotY, rotX, rotZ);
    },
    cyl(mat, x, y, z, rTop, rBot, h, seg = 12, rotY = 0, rotX = 0, rotZ = 0) {
      push(mat, cylinder(rTop, rBot, seg), x, y, z, 1, h, 1, rotY, rotX, rotZ);
    },
    geo(mat, geometry, x, y, z, sx = 1, sy = 1, sz = 1, rotY = 0, rotX = 0, rotZ = 0) {
      push(mat, geometry, x, y, z, sx, sy, sz, rotY, rotX, rotZ);
    },
    get count() { let n = 0; for (const list of parts.values()) n += list.length; return n; },
    flush(parent) {
      const meshes = [];
      for (const [mat, list] of parts) {
        let verts = 0, idx = 0;
        for (const { geo } of list) { verts += geo.attributes.position.count; idx += geo.index ? geo.index.count : geo.attributes.position.count; }
        const pos = new Float32Array(verts * 3), nor = new Float32Array(verts * 3), uv = new Float32Array(verts * 2);
        const index = new (verts > 65535 ? Uint32Array : Uint16Array)(idx);
        let vo = 0, io = 0;
        for (const { geo, matrix } of list) {
          _n.getNormalMatrix(matrix);
          const P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv;
          for (let i = 0; i < P.count; i++) {
            _v.fromBufferAttribute(P, i).applyMatrix4(matrix);
            pos.set([_v.x, _v.y, _v.z], (vo + i) * 3);
            _v.fromBufferAttribute(N, i).applyMatrix3(_n).normalize();
            nor.set([_v.x, _v.y, _v.z], (vo + i) * 3);
            if (U) uv.set([U.getX(i), U.getY(i)], (vo + i) * 2);
          }
          if (geo.index) for (let i = 0; i < geo.index.count; i++) index[io++] = geo.index.getX(i) + vo;
          else for (let i = 0; i < P.count; i++) index[io++] = i + vo;
          vo += P.count;
        }
        const merged = new THREE.BufferGeometry();
        merged.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        merged.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
        merged.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        merged.setIndex(new THREE.BufferAttribute(index, 1));
        merged.computeBoundingSphere();
        merged.computeBoundingBox();
        const mesh = new THREE.Mesh(merged, mat);
        mesh.userData.batch = true;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        parent.add(mesh);
        meshes.push(mesh);
      }
      parts.clear();
      return meshes;
    },
  };
}
