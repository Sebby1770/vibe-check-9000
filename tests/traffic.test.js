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

// Car-following: a queue forms behind a stop line, nobody passes it, and traffic moves on when it clears.
{
  const { stepTraffic, SPEED } = await import("../js/traffic.js");
  const cars = [{ x: -40, dir: 1 }, { x: -60, dir: 1 }, { x: 30, dir: -1 }];
  for (let i = 0; i < 400; i++) stepTraffic(cars, 0.05, { stops: [{ x: -3.5, dir: 1 }] });
  assert.ok(cars[0].x < -3.5 && cars[0].x > -12, "the lead car waits at the line");
  assert.ok(cars[1].x < cars[0].x - 6, "the follower keeps a gap");
  assert.ok(cars[0].v < 0.2 && cars[0].braking, "stopped cars show brake lights");
  for (let i = 0; i < 200; i++) stepTraffic(cars, 0.05, {});
  assert.ok(cars[0].x > 20 && Math.abs(cars[0].v - SPEED) < 0.05, "traffic moves off when the line clears");
  const wrap = [{ x: 183, dir: 1 }];
  stepTraffic(wrap, 0.5, { span: [-96, 184] });
  assert.ok(wrap[0].x < -90, "cars wrap at the end of the street");
  console.log("traffic following ok");
}
