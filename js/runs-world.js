/* Midnight Runs in the world: a banner and a chequered line at each start, the gate you're heading for (and the
   one after it, fainter) while you race, and the ghost of your best run. Nothing here is a light or a collider:
   it all glows by its own colour, and you drive straight through it. */
import * as THREE from "three";
import { buildVehicle, animateVehicle } from "./vehicles/models.js";
import { COURSES, courseById, ghostAt } from "./runs.js";

const AMBER = 0xffb347;

function chequer(cols, rows, cell = 16) {
  const c = document.createElement("canvas");
  c.width = cols * cell; c.height = rows * cell;
  const g = c.getContext("2d");
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { g.fillStyle = (x + y) % 2 ? "#111014" : "#f4efe0"; g.fillRect(x * cell, y * cell, cell, cell); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  return t;
}

function bannerTexture(name) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 96;
  const g = c.getContext("2d");
  g.fillStyle = "#16130f"; g.fillRect(0, 0, 1024, 96);
  for (const x0 of [0, 880]) for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) { g.fillStyle = (x + y) % 2 ? "#16130f" : "#f4efe0"; g.fillRect(x0 + x * 24, y * 24, 24, 24); }
  g.fillStyle = "#f2a541";
  g.font = '700 22px "Big Shoulders Text", "Oswald", "Arial Narrow", sans-serif';
  g.textAlign = "center"; g.textBaseline = "middle";
  if ("letterSpacing" in g) g.letterSpacing = "6px";
  g.fillText("MIDNIGHT RUN", 512, 24);
  g.fillStyle = "#f4efe0";
  g.font = '900 46px "Big Shoulders Display", "Oswald", "Arial Narrow", sans-serif';
  if ("letterSpacing" in g) g.letterSpacing = "4px";
  g.fillText(name.toUpperCase(), 512, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.name = `Midnight Run · ${name}`;
  return t;
}

const glow = (opacity) => new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

export function buildRunsWorld(scene) {
  const root = new THREE.Group();
  root.name = "Midnight Runs";
  scene.add(root);
  const iron = new THREE.MeshStandardMaterial({ color: 0x24302e, roughness: 0.55, metalness: 0.5 });
  const pole = new THREE.CylinderGeometry(0.07, 0.09, 6.2, 8);
  const shaftGeo = new THREE.CylinderGeometry(0.55, 0.55, 14, 12, 1, true);
  const lineTex = chequer(2, 12);

  // A banner across the road and a chequered line at every start. (Banners and the line are see-through
  // materials on purpose: they're street furniture, not wall signs, and the sign audit leaves them alone.)
  const flags = COURSES.map((course, i) => {
    const s = course.start, g = new THREE.Group(), reach = s.half + 0.9;
    g.position.set(s.x, 0, s.z);
    g.rotation.y = s.yaw;
    for (const side of [-1, 1]) {
      const p = new THREE.Mesh(pole, iron);
      p.position.set(0, 3.1, side * reach);
      g.add(p);
    }
    const tex = bannerTexture(course.name);
    const bannerMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.97 });
    for (const face of [-1, 1]) {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(reach * 2, 0.95), bannerMat);
      b.position.set(face * 0.015, 5.55, 0);
      b.rotation.y = face * (Math.PI / 2);
      g.add(b);
    }
    const line = new THREE.Mesh(new THREE.PlaneGeometry(1.3, s.half * 2), new THREE.MeshBasicMaterial({ map: lineTex, transparent: true, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.045;
    line.renderOrder = 1;
    g.add(line);
    // A column of light you can see from down the street.
    const shaft = new THREE.Mesh(shaftGeo, glow(0.08));
    shaft.material.side = THREE.DoubleSide;
    shaft.position.set(0, 7, reach);
    g.add(shaft);
    g.traverse((o) => { o.userData.noShadow = true; });
    root.add(g);
    return { course, group: g, shaft, phase: i * 2.1 };
  });

  // The gate ahead, and the one after it.
  const pylon = new THREE.CylinderGeometry(0.16, 0.16, 5, 10);
  const strip = new THREE.PlaneGeometry(0.5, 10.8).rotateX(-Math.PI / 2);
  const gem = new THREE.OctahedronGeometry(0.62);
  function makeGate(strength) {
    const g = new THREE.Group(), mat = glow(0.75 * strength), soft = glow(0.3 * strength);
    for (const side of [-1, 1]) {
      const p = new THREE.Mesh(pylon, mat);
      p.position.set(0, 2.5, side * 5.4);
      g.add(p);
    }
    const s = new THREE.Mesh(strip, soft);
    s.position.y = 0.05;
    g.add(s);
    const jewel = new THREE.Mesh(gem, mat);
    jewel.position.y = 3.4;
    g.add(jewel);
    g.userData.jewel = jewel;
    g.traverse((o) => { o.userData.noShadow = true; o.frustumCulled = false; });
    g.visible = false;
    root.add(g);
    return g;
  }
  const gates = [makeGate(1), makeGate(0.4)];

  // The ghost of your best run: the shape of a car, nothing more.
  const ghost = buildVehicle("sedan", { color: 0x9fe8ff, driver: false, seed: 7 });
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.24, depthWrite: false });
  ghost.traverse((o) => { if (o.isMesh) { o.material = ghostMat; o.userData.noShadow = true; } });
  ghost.userData.tail = null; // animateVehicle would recolour the real tail-lamp material
  ghost.name = "ghost of your best run";
  ghost.visible = false;
  root.add(ghost);
  let ghostX = 0, ghostZ = 0;

  return {
    root,
    flags,
    gates,
    ghost,
    /** run: the state from runs.js (or null when you're not racing). */
    update(dt, t, run) {
      for (const f of flags) f.shaft.material.opacity = 0.07 + 0.035 * Math.sin(t * 1.6 + f.phase);
      const course = run && !run.done ? courseById(run.course) : null;
      for (let k = 0; k < gates.length; k++) {
        const g = gates[k], i = course ? run.next + k : -1;
        if (!course || i >= course.gates.length) { g.visible = false; continue; }
        const [x, z] = course.gates[i], [px, pz] = i ? course.gates[i - 1] : [course.start.x, course.start.z];
        g.position.set(x, 0, z);
        g.rotation.y = Math.atan2(-(z - pz), x - px);
        g.visible = true;
        g.userData.jewel.rotation.y = t * 2.2;
        g.userData.jewel.position.y = 3.4 + Math.sin(t * 3) * 0.18;
      }
      const pose = course && run.countdown <= 0 && run.best?.ghost?.length ? ghostAt(run.best.ghost, run.t) : null;
      ghost.visible = !!pose;
      if (pose) {
        const moved = Math.hypot(pose.x - ghostX, pose.z - ghostZ);
        ghost.position.set(pose.x, 0, pose.z);
        ghost.rotation.y = pose.yaw;
        animateVehicle(ghost, moved < 5 ? moved : 0, {});
        ghostX = pose.x; ghostZ = pose.z;
      }
    },
  };
}
