/* A fixed set of point lights shared among many lamps. Every quarter second the nearest lamps in range each get
   one, which fades in where it lands and out where it leaves. three.js builds every lit material for an exact
   number of lights, so hiding or adding a light recompiles every shader in view (a stall of a second or more);
   a pool keeps the count fixed for good. Sources are {x, y, z, color, intensity, distance, decay}; the array is
   read live, so lamps registered after the pool is built still count. */
import * as THREE from "three";

export function createLightPool(scene, sources, { size, range = 70, every = 0.25, fadeIn = 2.5, fadeOut = 4 } = {}) {
  const lights = [];
  for (let i = 0; i < size; i++) {
    const light = new THREE.PointLight(0xffffff, 0, 10, 2);
    light.userData = { src: null, last: null, fade: 0 };
    scene.add(light);
    lights.push(light);
  }
  let pick = 0;

  function assign(pos) {
    const near = [];
    for (const s of sources) {
      const dx = s.x - pos.x, dz = s.z - pos.z, d = dx * dx + dz * dz;
      if (d < range * range) near.push({ s, d });
    }
    near.sort((a, b) => a.d - b.d);
    const want = new Set(near.slice(0, size).map((n) => n.s));
    for (const l of lights) {
      if (want.has(l.userData.src)) want.delete(l.userData.src);
      else l.userData.src = null;
    }
    // Prefer lights that have already faded out, so nothing visibly jumps.
    const free = lights.filter((l) => !l.userData.src).sort((a, b) => a.userData.fade - b.userData.fade);
    for (const s of want) {
      const light = free.shift();
      if (!light) break;
      light.position.set(s.x, s.y, s.z);
      light.color.setHex(s.color);
      light.distance = s.distance;
      light.decay = s.decay ?? 2;
      Object.assign(light.userData, { src: s, last: s, fade: 0 });
    }
  }

  return {
    lights,
    /** level(source, light) is the intensity at full fade; it defaults to the source's own. */
    update(dt, position, level = (s) => s.intensity) {
      pick -= dt;
      if (pick <= 0) { assign(position); pick = every; }
      for (const l of lights) {
        const u = l.userData;
        u.fade = u.src ? Math.min(1, u.fade + dt * fadeIn) : Math.max(0, u.fade - dt * fadeOut);
        l.intensity = u.last && u.fade > 0 ? level(u.last, l) * u.fade : 0;
      }
    },
  };
}
