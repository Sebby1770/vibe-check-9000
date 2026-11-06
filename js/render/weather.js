/* Draws the night's weather (weather.js decides it): rain that falls round you wherever you are, rings spreading
   on the pavement, lightning in a downpour, and streets that shine when wet and dull when dry (every material
   tagged userData.wet, and the puddles, follow the wetness). Umbrellas open when it rains and close when it stops.
   Lightning is skipped under reduced effects; thunder still rolls. */
import * as THREE from "three";
import { weatherAt, strikeChance } from "../weather.js";
import { isOutside } from "../zones.js";

const BOX = 28;          // half-width of the box of rain kept round you
const TOP = 22;          // how high above your feet the rain starts

function ringTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  g.strokeStyle = "rgba(255,255,255,0.9)";
  g.lineWidth = 3;
  g.beginPath();
  g.arc(32, 32, 26, 0, Math.PI * 2);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Textured asphalt keeps its wetness in the roughness map (the puddles and the damp crown of the road); this
    scales the map by a uniform, so a dry street is evenly dull and a wet one is exactly as the map paints it.
    Chains any earlier hook (world-space UVs) and gets its own program key. */
function hookAsphalt(m) {
  const wet = { value: 1 }, prev = m.onBeforeCompile, key = m.customProgramCacheKey.call(m);
  m.onBeforeCompile = (shader, renderer) => {
    prev?.call(m, shader, renderer);
    shader.uniforms.uWet = wet;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uWet;")
      .replace("#include <roughnessmap_fragment>", `float roughnessFactor = roughness;
        #ifdef USE_ROUGHNESSMAP
          vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
          roughnessFactor *= mix( 0.92, texelRoughness.g, uWet );
        #endif`);
  };
  m.customProgramCacheKey = () => `${key}|wet-asphalt`;
  m.needsUpdate = true;
  return wet;
}

// Wet and dry ends for each kind of surface. Asphalt goes from dull grey to a dark, puddled mirror; pavement
// darkens and takes a sheen. Wetness is roughness and colour, never metalness (materials.js keeps them dielectric).
const SURFACES = {
  asphalt: (m) => m.roughnessMap
    ? { wet: { r: m.roughness, c: m.color.clone() }, dry: { r: m.roughness, c: m.color.clone().multiplyScalar(1.9) }, u: hookAsphalt(m) }
    : { wet: { r: 0.35, c: m.color.clone() }, dry: { r: 0.92, c: m.color.clone().multiplyScalar(1.5) } },
  pavement: (m) => ({ wet: { r: m.roughness * 0.5, c: m.color.clone().multiplyScalar(0.7) }, dry: { r: m.roughness, c: m.color.clone() } }),
};

export function buildWeather(scene, { low = false } = {}) {
  // Rain: streaks in a box that follows you; how many fall depends on how hard it's raining.
  const N = low ? 700 : 1800;
  const pos = new Float32Array(N * 6), len = new Float32Array(N);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setDrawRange(0, 0);
  const rainMat = new THREE.LineBasicMaterial({ color: 0xc5d4de, transparent: true, opacity: 0.3, depthWrite: false });
  const rain = new THREE.LineSegments(geo, rainMat);
  rain.frustumCulled = false;
  rain.userData.noShadow = true;
  rain.name = "rain";
  scene.add(rain);
  function drop(i, x, y, z) {
    pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z;
    len[i] = 0.45 + Math.random() * 0.4;
  }
  for (let i = 0; i < N; i++) drop(i, 0, -999, 0);

  // Rings on the ground round your feet.
  const M = low ? 40 : 110;
  const ripples = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    map: ringTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), M);
  ripples.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  ripples.setColorAt(0, new THREE.Color());
  ripples.count = 0;
  ripples.frustumCulled = false;
  ripples.userData.noShadow = true;
  ripples.renderOrder = 2;
  ripples.name = "rain rings";
  scene.add(ripples);
  const rings = Array.from({ length: M }, () => ({ x: 0, z: 0, age: 1, life: 1 }));
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();

  // Surfaces and puddles, found once the city is built.
  let surfaces = null, puddles = null, appliedWet = -1;
  function collect() {
    surfaces = [];
    puddles = [];
    const seen = new Set();
    scene.traverse((o) => {
      if (o.userData.puddle) puddles.push({ mesh: o, sx: o.scale.x, sy: o.scale.y });
      for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) {
        const kind = m.userData?.wet;
        if (!kind || seen.has(m) || !SURFACES[kind]) continue;
        seen.add(m);
        surfaces.push({ m, ...SURFACES[kind](m) });
      }
    });
  }
  function applyWet(w) {
    for (const s of surfaces) {
      s.m.roughness = s.dry.r + (s.wet.r - s.dry.r) * w;
      s.m.color.copy(s.dry.c).lerp(s.wet.c, w);
      if (s.u) s.u.value = w;
    }
    const k = Math.max(0, Math.min(1, (w - 0.15) / 0.65));
    for (const p of puddles) {
      p.mesh.visible = k > 0.02;
      p.mesh.scale.set(p.sx * Math.max(0.05, k), p.sy * Math.max(0.05, k), p.mesh.scale.z);
    }
  }

  // Umbrellas: open in the rain, folded away when it stops. Anyone sitting (a fare in your cab) keeps theirs down.
  let umbrellasOpen = true;
  function setUmbrellas(open) {
    umbrellasOpen = open;
    scene.traverse((o) => { if (o.userData.umbrella && !o.userData.seated) o.userData.umbrella.visible = open; });
  }

  const shown = { rain: -1, wet: -1, storm: 0 };
  let flashAge = 9, strikes = [];
  const state = { rain: 0, wet: 0, storm: 0, label: "", flash: 0, strikes, get umbrellasOpen() { return umbrellasOpen; } };

  return {
    rain,
    ripples,
    state,
    setUmbrellas,
    /** Call once the city is built and its materials upgraded, before shaders compile (world.js does). */
    prepare() { if (!surfaces) collect(); },
    /** seconds/seed: the game clock and the night's seed. Returns state: rain, wet, storm, label, flash and any
        lightning strikes this frame ({strength, delay} for the thunder). */
    update(dt, t, { position, outside = true, floorY = 0, seconds = 22 * 3600, seed = 0, reduced = false }) {
      if (!surfaces) collect();
      const target = weatherAt(seconds, seed);
      // Ease toward the weather, so jumping the clock (or leaving the title) never snaps the sky.
      const k = shown.rain < 0 ? 1 : Math.min(1, dt * 0.6);
      shown.rain += (target.rain - shown.rain) * k;
      shown.wet += (target.wet - shown.wet) * k;
      shown.storm += (target.storm - shown.storm) * k;
      const r = shown.rain;
      Object.assign(state, { rain: r, wet: shown.wet, storm: shown.storm, label: target.label });

      if (Math.abs(shown.wet - appliedWet) > 0.003) { applyWet(shown.wet); appliedWet = shown.wet; }
      if (umbrellasOpen ? r < 0.12 : r > 0.2) setUmbrellas(!umbrellasOpen);

      // Rain round you.
      const count = outside && !reduced ? Math.round(N * Math.min(1, r * 1.1)) : 0;
      rain.visible = count > 0;
      geo.setDrawRange(0, count * 2);
      if (count) {
        const fall = 13 + r * 9, wind = 1.2 + r * 2.4, stretch = 0.8 + r * 0.9;
        rainMat.opacity = 0.16 + r * 0.24;
        for (let i = 0; i < count; i++) {
          let x = pos[i * 6] + wind * dt, y = pos[i * 6 + 1] - fall * dt, z = pos[i * 6 + 2];
          if (y - len[i] * stretch < floorY || Math.abs(x - position.x) > BOX || Math.abs(z - position.z) > BOX) {
            // Back to the top, or scattered through the height if you've moved on (so it never falls in sheets).
            const fresh = y - len[i] * stretch < floorY && y > -900;
            x = position.x + (Math.random() - 0.5) * 2 * BOX;
            z = position.z + (Math.random() - 0.5) * 2 * BOX;
            y = floorY + (fresh ? TOP * (0.7 + Math.random() * 0.3) : Math.random() * TOP);
            drop(i, x, y, z);
          }
          const l = len[i] * stretch;
          pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z;
          pos[i * 6 + 3] = x + wind * l / fall; pos[i * 6 + 4] = y - l; pos[i * 6 + 5] = z;
        }
        geo.attributes.position.needsUpdate = true;
      }

      // Rings on the ground (only out in the street, at street level).
      const ringCount = outside && !reduced && floorY < 0.5 ? Math.round(M * Math.min(1, r * 1.2)) : 0;
      ripples.count = ringCount;
      for (let i = 0; i < ringCount; i++) {
        const g = rings[i];
        g.age += dt;
        if (g.age >= g.life) {
          g.age = Math.random() * 0.1;
          g.life = 0.5 + Math.random() * 0.35;
          for (let tries = 0; tries < 4; tries++) {
            const a = Math.random() * Math.PI * 2, d = 1.2 + Math.sqrt(Math.random()) * 11;
            g.x = position.x + Math.cos(a) * d;
            g.z = position.z + Math.sin(a) * d;
            if (isOutside(g.x, g.z, 1.7)) break;
          }
        }
        const u = g.age / g.life, size = 0.06 + (1 - (1 - u) * (1 - u)) * 0.36;
        _m.compose(_p.set(g.x, 0.03, g.z), _q, _s.set(size, 1, size));
        ripples.setMatrixAt(i, _m);
        ripples.setColorAt(i, _c.setRGB(0.55, 0.66, 0.75).multiplyScalar((1 - u) * (0.35 + 0.4 * r)));
      }
      if (ringCount) {
        ripples.instanceMatrix.needsUpdate = true;
        ripples.instanceColor.needsUpdate = true;
      }

      // Lightning and the thunder it owes.
      strikes.length = 0;
      if (Math.random() < strikeChance(shown.storm, dt)) {
        const near = Math.random();
        strikes.push({ strength: 0.5 + near * 0.5, delay: 0.6 + (1 - near) * 4.5 });
        if (!reduced) flashAge = 0;
      }
      flashAge += dt;
      // Two flickers and a fade: bright, dim, bright, gone.
      const f = flashAge;
      state.flash = f < 0.07 ? 1 : f < 0.14 ? 0.25 : f < 0.22 ? 0.8 : f < 0.6 ? 0.8 * (1 - (f - 0.22) / 0.38) : 0;
      return state;
    },
  };
}
