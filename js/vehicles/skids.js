/* Rubber on the road: dark marks behind the rear wheels whenever you slide on a dry street (a wet one takes none).
   One instanced draw; the oldest marks give way to new ones. */
import * as THREE from "three";

const MAX = 1500, WIDTH = 0.2, STEP = 0.25, Y = 0.016;
const UP = new THREE.Vector3(0, 1, 0);

export function createSkids(scene) {
  const mesh = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    MAX,
  );
  mesh.count = 0;
  mesh.frustumCulled = false;
  mesh.userData.noShadow = true;
  mesh.renderOrder = 1;
  mesh.name = "skid marks";
  scene.add(mesh);
  let next = 0, used = 0;
  const last = [new THREE.Vector3(), new THREE.Vector3()], has = [false, false];
  const _w = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();

  return {
    mesh,
    get count() { return used; },
    /** Each frame for the car you drive: skid 0–1 (grip.js), wet 0–1. */
    mark(car, skid, wet) {
      if (skid < 0.3 || wet > 0.45) { has[0] = has[1] = false; return; }
      const spec = car.userData.spec || {}, x = spec.rearAxle ?? -(spec.wheelbase || 2.9) / 2, half = spec.track ?? (spec.width || 1.85) / 2 - 0.2;
      for (const i of [0, 1]) {
        const p = car.localToWorld(_w.set(x, 0, i ? half : -half));
        if (!has[i]) { last[i].copy(p); has[i] = true; continue; }
        const dx = p.x - last[i].x, dz = p.z - last[i].z, l = Math.hypot(dx, dz);
        if (l < STEP) continue;
        if (l > 3) { last[i].copy(p); continue; } // a jump (a teleport, a respawn): start a new mark
        _q.setFromAxisAngle(UP, Math.atan2(-dz, dx));
        _m.compose(_p.set((p.x + last[i].x) / 2, Y, (p.z + last[i].z) / 2), _q, _s.set(l + 0.03, 1, WIDTH));
        mesh.setMatrixAt(next, _m);
        next = (next + 1) % MAX;
        used = Math.min(MAX, used + 1);
        mesh.count = used;
        mesh.instanceMatrix.needsUpdate = true;
        last[i].copy(p);
      }
    },
  };
}
