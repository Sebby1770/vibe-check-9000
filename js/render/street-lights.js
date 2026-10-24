/* Street lighting after dark. Every lamp post in the city registers here (47th Street, the east district and the
   open city). Each lamp gets a soft pool of light on the pavement (one instanced, additive draw for all of them),
   and a small pool of real point lights (render/light-pool.js) follows you from lamp to lamp, so the pavement and
   passers-by near you are lit by the lamps above them. */
import * as THREE from "three";
import { createLightPool } from "./light-pool.js";

const LAMPS = [];
/** Called by the builders for each lamp head: (x, y, z) of the bulb. */
export function registerLamp(x, y, z) { LAMPS.push({ x, y: y - 0.15, z, bulbY: y, color: 0xffc27e, intensity: 22, distance: 16, decay: 2 }); }
export function lampCount() { return LAMPS.length; }
/** Every registered lamp head, {x, y, z} of the bulb. */
export function lamps() { return LAMPS.map((l) => ({ x: l.x, y: l.bulbY, z: l.z })); }

function poolTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.35, "rgba(255,255,255,0.55)");
  r.addColorStop(0.7, "rgba(255,255,255,0.14)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);

export function buildStreetLights(scene, { low = false } = {}) {
  // Light pools on the ground under every lamp.
  const geo = new THREE.PlaneGeometry(7.5, 7.5);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffb862, map: poolTexture(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const pools = new THREE.InstancedMesh(geo, mat, Math.max(1, LAMPS.length));
  LAMPS.forEach((l, i) => { _m.compose(_p.set(l.x, 0.05, l.z), _q, _s); pools.setMatrixAt(i, _m); });
  pools.count = LAMPS.length;
  pools.userData.noShadow = true;
  pools.renderOrder = 2;
  pools.name = "lamp light pools";
  scene.add(pools);

  // The real lights that follow you.
  const pool = createLightPool(scene, LAMPS, { size: low ? 2 : 6, range: 70 });

  return {
    pools,
    lights: pool.lights,
    update(dt, t, { position, lampMul = 1, outside = true, reduced = false }) {
      const night = Math.max(0, Math.min(1, (lampMul - 0.3) / 0.9));
      mat.opacity = outside ? night * 0.42 : night * 0.25;
      pool.update(dt, position, (s, l) => s.intensity * night * (reduced ? 1 : 0.95 + Math.sin(t * 1.7 + l.position.x * 0.7) * 0.05));
    },
  };
}
