import assert from "node:assert/strict";
import { register } from "node:module";

// The browser maps "three" with an importmap; here, a resolve hook points it at the vendored build.
const three = new URL("../vendor/three/build/three.module.js", import.meta.url).href;
register(`data:text/javascript,export async function resolve(s,c,n){return s==="three"?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c)}`);
const THREE = await import("three");
const { createLightPool } = await import("../js/render/light-pool.js");

const scene = new THREE.Scene();
const sources = Array.from({ length: 12 }, (_, i) => ({ x: i * 10, y: 4, z: 0, color: 0xff8800 + i, intensity: 20 + i, distance: 12, decay: 2 }));
const pool = createLightPool(scene, sources, { size: 3, range: 50 });
const count = () => scene.children.filter((o) => o.isPointLight && o.visible).length;
assert.equal(count(), 3);

// Standing at x = 0: the three nearest lamps get lights, fading in rather than popping on.
pool.update(0.1, { x: 0, z: 0 });
const lit = () => pool.lights.filter((l) => l.intensity > 0).map((l) => l.position.x).sort((a, b) => a - b);
assert.deepEqual(lit(), [0, 10, 20]);
assert.ok(pool.lights.every((l) => l.intensity < l.userData.src.intensity), "still fading in");
for (let i = 0; i < 10; i++) pool.update(0.1, { x: 0, z: 0 });
for (const l of pool.lights) {
  assert.equal(l.intensity, l.userData.src.intensity, "full strength once faded in");
  assert.equal(l.color.getHex(), l.userData.src.color);
  assert.equal(l.distance, 12);
}

// Walk to x = 60: the lights move to the lamps there; the count never changes.
for (let i = 0; i < 20; i++) { pool.update(0.1, { x: 60, z: 0 }); assert.equal(count(), 3); }
assert.deepEqual(lit(), [50, 60, 70]);

// A light keeps the lamp it has while that lamp stays among the nearest: no jumping between neighbours.
const before = pool.lights.map((l) => l.userData.src);
pool.update(0.3, { x: 62, z: 0 });
assert.deepEqual(pool.lights.map((l) => l.userData.src), before);

// Out of range of every lamp: all fade out, and stay in the scene.
for (let i = 0; i < 10; i++) pool.update(0.1, { x: 5000, z: 0 });
assert.equal(lit().length, 0);
assert.equal(count(), 3);

// A custom level (street lamps scale by night) multiplies through.
for (let i = 0; i < 20; i++) pool.update(0.1, { x: 0, z: 0 }, (s) => s.intensity * 0.5);
assert.ok(pool.lights.every((l) => Math.abs(l.intensity - l.userData.src.intensity * 0.5) < 1e-9));

// Sources added after the pool was built still count (lamps register as the city builds).
sources.push({ x: 0, y: 4, z: 1, color: 0xffffff, intensity: 99, distance: 9, decay: 2 });
for (let i = 0; i < 20; i++) pool.update(0.1, { x: 0, z: 1 });
assert.ok(pool.lights.some((l) => l.userData.src?.intensity === 99));

console.log("light pool: fixed light count, nearest lamps, fade in and out, steady assignment, live sources");
