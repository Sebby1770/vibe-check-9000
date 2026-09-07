import assert from "node:assert/strict";
import {
    NPCS,
    nearestNpc,
    onDanceFloor,
    getNode,
    applyChoice,
} from "../js/people.js";

assert.equal(NPCS.length, 6);
assert.ok(NPCS.every((n) => n.id && n.nodes && n.nodes.start));

const hit = nearestNpc(0.3, -11.1, 2.2);
assert.equal(hit.npc.id, "rexa");
assert.equal(nearestNpc(0, 0, 0.4), null);

assert.equal(onDanceFloor(0, 0), true);
assert.equal(onDanceFloor(20, 0), false);

const start = getNode(hit.npc, "start");
assert.ok(start.choices.length >= 2);
const next = applyChoice(hit.npc, "start", 0);
assert.equal(next.nodeId, "heavy");
assert.equal(next.closed, false);
const done = applyChoice(hit.npc, "heavy", 0);
assert.equal(done.closed, true);

const ion = NPCS.find((n) => n.id === "ion");
const sip = applyChoice(ion, "start", 1);
assert.equal(sip.action, "tipsy");

console.log("ok  named people, nearest, dance floor, dialogue graph");
console.log("6 people tests passed");
