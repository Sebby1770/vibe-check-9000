/* Loopback-only scene audit: finds every flat sign/board and checks it against real geometry.
   Usage (in a page opened with ?inspect=1 after ENTER THE NIGHT):
     const {auditSigns} = await import('./tests/tools/sign-audit.js'); auditSigns(window.__vibeInspect.world)
   A "sign" is a Mesh with PlaneGeometry and a textured MeshBasicMaterial (neon, printed card, poster). */
import * as THREE from "three";

const _n = new THREE.Vector3(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();

function isSign(o) {
  return o.isMesh && !o.isInstancedMesh && o.geometry?.type === "PlaneGeometry" && o.material?.map && o.visible !== false
    && o.material.type === "MeshBasicMaterial" && !o.material.side === false;
}

function label(o) {
  const img = o.material.map?.image;
  return o.name || o.userData?.label || o.material.map?.name || (img?.width ? `${img.width}x${img.height}` : "tex");
}

export function auditSigns(world, { maxGap = 0.35 } = {}) {
  const scene = world.scene;
  scene.updateMatrixWorld(true);
  const solids = [];
  const signs = [];
  scene.traverse((o) => {
    if (!o.visible) return;
    let v = o; while (v) { if (v.visible === false) return; v = v.parent; }
    if (o.isInstancedMesh) { if (o.geometry?.type === "BoxGeometry") solids.push(o); return; }
    if (o.isMesh && o.geometry?.type === "PlaneGeometry" && o.material?.map && o.material.type === "MeshBasicMaterial" && !o.material.transparent) signs.push(o);
    else if (o.isMesh && (o.geometry?.type === "BoxGeometry" || o.userData.batch) && !(o.material?.transparent && o.material.opacity < 0.5)) solids.push(o);
  });
  const ray = new THREE.Raycaster();
  const boxes = solids.filter((o) => !o.isInstancedMesh && !o.userData.batch).map((o) => ({ o, box: new THREE.Box3().setFromObject(o) }));
  const out = [];
  for (const m of signs) {
    // A board's own frame is not the wall it hangs on: ignore solids in a small dedicated group.
    const own = m.parent && m.parent.children.length < 40 && m.parent.type === "Group" ? new Set(m.parent.children) : new Set();
    const others = solids.filter((o) => !own.has(o));
    const g = m.geometry.parameters;
    m.matrixWorld.decompose(_p, _q, _s);
    const w = g.width * Math.abs(_s.x), h = g.height * Math.abs(_s.y);
    if (w * h < 0.25) continue; // skip product cards and tiny labels
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(_q).normalize();
    const center = _p.clone();
    // Probe behind the sign at centre and four inset corners: distance to the first solid.
    const probes = [[0, 0], [-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]];
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(_q), up = new THREE.Vector3(0, 1, 0).applyQuaternion(_q);
    const behind = [], front = [];
    for (const [px, py] of probes) {
      const origin = center.clone().addScaledVector(right, px * w).addScaledVector(up, py * h).addScaledVector(normal, 0.02);
      ray.set(origin, normal.clone().negate()); ray.far = 6;
      const hitB = ray.intersectObjects(others, false)[0];
      behind.push(hitB ? +(hitB.distance - 0.02).toFixed(3) : null);
      ray.set(center.clone().addScaledVector(right, px * w).addScaledVector(up, py * h).addScaledVector(normal, -0.005), normal); ray.far = 1.2;
      const hitF = ray.intersectObjects(others, false)[0];
      front.push(hitF ? +hitF.distance.toFixed(3) : null);
    }
    // Any of the five face points sitting inside another solid means part of the sign is hidden in a wall.
    const insideSet = new Set();
    let insidePts = 0;
    for (const [px, py] of probes) {
      const face = center.clone().addScaledVector(right, px * w).addScaledVector(up, py * h).addScaledVector(normal, 0.012);
      const hits = boxes.filter(({ o, box }) => !own.has(o) && box.containsPoint(face));
      if (hits.length) insidePts++;
      for (const { box } of hits) insideSet.add(box.getSize(new THREE.Vector3()).toArray().map((v) => +v.toFixed(2)).join("×"));
    }
    const inside = insidePts ? [`${insidePts}/5 points`, ...insideSet] : [];
    out.push({ inside, label: label(m), pos: center.toArray().map((v) => +v.toFixed(2)), normal: normal.toArray().map((v) => +v.toFixed(2)), w: +w.toFixed(2), h: +h.toFixed(2), behind, front, mesh: m });
  }
  // Overlap: two signs roughly coplanar whose rects intersect.
  const issues = [];
  for (const s of out) {
    const gaps = s.behind.filter((d) => d !== null);
    if (gaps.length < s.behind.length) issues.push({ kind: "unbacked", sign: s.label, pos: s.pos, detail: `probes with no wall within 6m: ${s.behind.filter((d) => d === null).length}/5` });
    else if (Math.max(...gaps) > maxGap) issues.push({ kind: "floating", sign: s.label, pos: s.pos, detail: `gap to wall ${Math.min(...gaps)}–${Math.max(...gaps)}m` });
    if (s.inside.length) issues.push({ kind: "embedded", sign: s.label, pos: s.pos, detail: `sign face is inside solid(s) ${s.inside.join(", ")}` });
    const blocked = s.front.filter((d) => d !== null && d < 0.9).length;
    if (blocked) issues.push({ kind: "buried", sign: s.label, pos: s.pos, detail: `${blocked}/5 probes hit geometry directly in front (<0.9m)` });
  }
  for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) {
    const a = out[i], b = out[j];
    if (Math.abs(a.normal[0] - b.normal[0]) + Math.abs(a.normal[2] - b.normal[2]) > 0.2) continue;
    const planeDist = Math.abs((b.pos[0] - a.pos[0]) * a.normal[0] + (b.pos[2] - a.pos[2]) * a.normal[2]);
    if (planeDist > 0.6) continue;
    const along = Math.abs((b.pos[0] - a.pos[0]) * a.normal[2] - (b.pos[2] - a.pos[2]) * a.normal[0]);
    const ov = (a.w + b.w) / 2 - along, ovY = (a.h + b.h) / 2 - Math.abs(a.pos[1] - b.pos[1]);
    if (ov > 0.05 && ovY > 0.05) issues.push({ kind: "overlap", sign: `${a.label} @${a.pos}`, pos: b.pos, detail: `overlaps ${b.label} @${b.pos} by ${ov.toFixed(2)}×${ovY.toFixed(2)}m` });
  }
  return { count: out.length, signs: out.map(({ mesh, ...rest }) => rest), issues };
}
