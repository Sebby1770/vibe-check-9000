import assert from "node:assert/strict";
import { blockedSegment, selectInteraction } from "../js/interactions.js";
import { buildColliders, SHOPS } from "../js/zones.js";
const p = { x: 0, y: 1.7, z: 0 },
  f = { x: 0, y: 0, z: 1 };
const candidates = [
  { id: "front", x: 0, y: 0, z: 2, aimY: 1.7 },
  { id: "back", x: 0, y: 0, z: -1, aimY: 1.7 },
];
assert.equal(
  selectInteraction({ position: p, forward: f, candidates }).id,
  "front",
  "aim wins over closer target behind player",
);
const wall = { minX: -1, maxX: 1, minZ: 0.8, maxZ: 1, minY: 0, maxY: 3 };
assert.equal(
  selectInteraction({ position: p, forward: f, candidates, boxes: [wall] }),
  null,
  "wall occludes interaction",
);
assert.equal(blockedSegment(p, { x: 0, y: 1.7, z: 2 }, [wall]), true);
assert.equal(
  selectInteraction({
    position: p,
    forward: f,
    candidates: [{ id: "upper", x: 0, y: 4.4, z: 1 }],
  }),
  null,
  "different floor cannot interact",
);
const chair = { id: "chair", x: 0, z: 1, y: 0, aimY: 0.6 };
const person = { id: "tony", x: 0.2, z: 1.8, y: 0, aimY: 1.5 };
const down = { x: 0, y: -0.74, z: 0.67 };
assert.equal(
  selectInteraction({
    position: p,
    forward: down,
    candidates: [person, chair],
  }).id,
  "chair",
  "looking at seat selects it instead of nearby worker",
);
const boxes = buildColliders().boxes;
assert.equal(
  blockedSegment(
    { x: 0.35, y: 1.7, z: -9 },
    { x: 0.35, y: 1.5, z: -11.15 },
    boxes,
  ),
  false,
  "movement boundary at DJ booth does not obstruct a visible person",
);
for (const shop of SHOPS) {
  assert.equal(
    blockedSegment(
      { x: shop.doorX, y: 1.7, z: 31.5 },
      { x: shop.doorX, y: 1.7, z: 33.5 },
      boxes,
    ),
    false,
    `${shop.id} has a clear threshold`,
  );
  assert.equal(
    blockedSegment(
      { x: shop.minX + 0.5, y: 1.7, z: 31.5 },
      { x: shop.minX + 0.5, y: 1.7, z: 33.5 },
      boxes,
    ),
    true,
    `${shop.id} window is not an entrance`,
  );
}
console.log(
  "ok  aim, occlusion, floor separation, chair priority and all shop thresholds",
);

assert.equal(
  blockedSegment(
    { x: 32, y: 6.1, z: -7.1 },
    { x: 32, y: 5.45, z: -8.5 },
    boxes,
  ),
  false,
  "upstairs ice machine can be used without its own body occluding the controls",
);

// The same check against every collider the game builds (world.js feeds the interiors into buildColliders):
// the 2F cabinet box holds the machine's own target, so it must stay furniture-height (< 2 m) to be exempt.
{
  const { register } = await import("node:module");
  const three = new URL("../vendor/three/build/three.module.js", import.meta.url).href;
  const hook = `export async function resolve(s, c, n) { return s === "three" ? { url: ${JSON.stringify(three)}, shortCircuit: true } : n(s, c); }`;
  register("data:text/javascript," + encodeURIComponent(hook));
  const { interiorColliders } = await import("../js/interiors/index.js");
  const { PROPS } = await import("../js/people.js");
  const { resolveMovement } = await import("../js/collision.js");
  const world = buildColliders(interiorColliders());
  const ice = PROPS.find((t) => t.id === "ice");
  const eye = { x: 32, y: 4.4 + 1.7, z: -7.1 };
  const target = selectInteraction({
    position: eye,
    forward: { x: 0, y: 0, z: -1 },
    floorY: 4.4,
    candidates: [{ ...ice, type: "prop", aimY: 1.05, reach: ice.r }],
    boxes: world.boxes,
  });
  assert.equal(target?.id, "ice", "E at the 4B ice machine finds it with every interior collider in place");
  const walked = resolveMovement({ x: 32, y: eye.y, z: -8.5 }, { x: 32, y: eye.y, z: -7.1 }, world);
  assert.ok(walked.z >= -7.56, `walking into the ice cabinet stops at its front (z ${walked.z.toFixed(2)})`);
  console.log("ok  the 4B ice machine answers E with every interior collider, and stays solid");
}
