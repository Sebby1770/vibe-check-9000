import assert from "node:assert/strict";
import { onRoad, hitByCar, ROAD } from "../js/traffic.js";

assert.equal(onRoad(0, 16, 1.7), false, "sidewalk is not the road");
assert.equal(onRoad(0, 22.8, 1.7), true, "asphalt is the road");
assert.equal(onRoad(0, 22.8, -5), false, "subway is not the road");
assert.equal(onRoad(0, ROAD.minZ - 0.1, 1.7), false);
assert.equal(onRoad(0, ROAD.maxZ + 0.1, 1.7), false);

const eastbound = { position: { x: 4, z: 21.35 }, userData: { moving: 1 } };
const westbound = { position: { x: 4, z: 24.55 }, userData: { moving: -1 } };
const parked = { position: { x: 4, z: 21.35 }, userData: { moving: 0 } };

assert.equal(hitByCar({ x: 0, z: 16.2, y: 1.7 }, [eastbound]), null);
assert.equal(hitByCar({ x: 4.2, z: 21.35, y: 1.7 }, [parked]), null);

const hit = hitByCar({ x: 4.4, z: 21.4, y: 1.7 }, [eastbound]);
assert.ok(hit, "standing in front of an eastbound car is a hit");
assert.equal(hit.dir, 1);
assert.ok(hit.vy > 6);
assert.ok(hit.vx > 0);

const rear = hitByCar({ x: 3.6, z: 24.55, y: 1.7 }, [westbound]);
assert.ok(rear);
assert.equal(rear.dir, -1);
assert.ok(rear.vx < 0);

assert.equal(hitByCar({ x: 4.2, z: 21.35, y: 1.7 }, [eastbound, westbound]).dir, 1);
assert.equal(hitByCar({ x: 20, z: 21.35, y: 1.7 }, [eastbound]), null);

console.log("traffic.test.js ok");
