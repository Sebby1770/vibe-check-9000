/* Headlights and tail lights for traffic after dark: a warm beam pooled on the road ahead and a red glow behind,
   one merged mesh per car on one shared additive material that fades in with the street lamps. The car you drive
   wears the same lights, shown only while you're behind the wheel (drive.js). */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

let MAT = null;
function material() {
  if (MAT) return MAT;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.4, "rgba(255,255,255,0.5)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  MAT = new THREE.MeshBasicMaterial({ map, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  MAT.visible = false;
  return MAT;
}

function quad(w, l, x, y, z, color) {
  const g = new THREE.PlaneGeometry(l, w);
  g.rotateX(-Math.PI / 2);
  g.translate(x, y, z);
  const n = g.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(color);
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}

/** Adds night lights to a vehicle built by models.js (cars face +x; spec.front/rear are the bumper x's). */
export function addNightLights(car) {
  const s = car.userData.spec || { front: 2.47, rear: -2.47, width: 1.85 };
  const front = s.front ?? (s.length || 4.9) / 2, rear = s.rear ?? -(s.length || 4.9) / 2, w = s.width || 1.85;
  const geo = mergeGeometries([
    quad(w + 1.6, 9, front + 4.4, 0.045, 0, 0xffe2a8),        // the beam on the road
    quad(w + 0.2, 2.2, front + 0.9, 0.05, 0, 0xfff0c8),         // the bright spill just ahead of the bumper
    quad(w * 0.75, 0.9, rear - 0.3, 0.045, 0, 0x5a0c08),        // a faint tail-light glow on the road
  ]);
  const mesh = new THREE.Mesh(geo, material());
  mesh.userData.noShadow = true;
  mesh.renderOrder = 3;
  mesh.name = "night lights";
  car.add(mesh);
  return mesh;
}

/** Fades every car's lights with the street lamps (lampMul from daylight.js). */
export function setNightLights(lampMul) {
  const m = material(), night = Math.max(0, Math.min(1, (lampMul - 0.35) / 0.9));
  m.opacity = night * 0.55;
  m.visible = night > 0.02;
}
