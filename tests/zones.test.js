import assert from "node:assert/strict";
import {
    SECOND_Y,
    getFloorY,
    getZone,
    zoneLabel,
    onDanceFloor,
    inClubStairs,
    inFireEscape,
    inAtrium,
    isOutside,
    buildColliders,
} from "../js/zones.js";

assert.equal(getFloorY(0, 0, 0), 0);
assert.equal(getZone(0, 0, 0), "club");
assert.equal(getZone(0, 8, SECOND_Y), "lounge");
assert.equal(getZone(0, 16, 0), "street");
assert.equal(getZone(0, -22, 0), "alley");
assert.equal(getZone(-30, 3, 0), "diner");
assert.equal(getZone(24, 8, 0), "hotel");

assert.ok(inClubStairs(14.7, 6));
assert.ok(getFloorY(14.7, 10.15, 0) < 0.2);
assert.ok(Math.abs(getFloorY(14.7, 2.15, 0) - SECOND_Y) < 0.05);
assert.ok(getFloorY(14.7, 6.15, 0) > 1 && getFloorY(14.7, 6.15, 0) < SECOND_Y);

assert.ok(inFireEscape(14.5, -20));
assert.ok(getFloorY(14.5, -24.05, 0) < 0.2);
assert.ok(Math.abs(getFloorY(14.5, -16.32, 4) - SECOND_Y) < 0.08);

assert.equal(getFloorY(-10, 8, SECOND_Y), SECOND_Y);
assert.equal(getFloorY(0, 0, SECOND_Y), 0, "atrium is a hole");
assert.ok(inAtrium(0, 0));
assert.equal(isOutside(0, 16), true);
assert.equal(isOutside(0, 0), false);

assert.equal(onDanceFloor(0, 0, 0), true);
assert.equal(onDanceFloor(0, 0, SECOND_Y), false);
assert.equal(zoneLabel("street"), "47TH STREET");
assert.equal(zoneLabel("alley"), "THE ALLEY");

const col = buildColliders();
assert.ok(col.boxes.length > 20);
assert.equal(typeof col.getFloorY, "function");
assert.ok(col.bounds.minX < -30 && col.bounds.maxZ > 30);

const doorOpen = col.boxes.every((b) => {
    const py = 1.7;
    if (py < (b.minY ?? -99) || py > (b.maxY ?? 99)) return true;
    return !(0 > b.minX && 0 < b.maxX && 12.5 > b.minZ && 12.5 < b.maxZ);
});
assert.ok(doorOpen, "front door is walkable at eye height");

console.log("ok  floors, zones, stairs, fire escape, colliders");
console.log("zones tests passed");
