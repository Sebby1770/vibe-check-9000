import assert from "node:assert/strict";
import {
    NPCS,
    PROPS,
    nearestNpc,
    nearestProp,
    onDanceFloor,
    getNode,
    applyChoice,
    GAZETTE,
    PHONE_LINES,
} from "../js/people.js";

assert.ok(NPCS.length >= 18, "cast of the night");
assert.ok(NPCS.every((n) => n.id && n.nodes && n.nodes.start && n.nodes.start.choices));
assert.ok(NPCS.every((n) => typeof n.x === "number" && typeof n.z === "number"));

const rexa = nearestNpc(0.3, -11.1, 0, 2.2);
assert.equal(rexa.npc.id, "rexa");
assert.equal(nearestNpc(0, 0, 0, 0.4), null);

const velma = nearestNpc(0.1, -13.0, 4.4, 2.2);
assert.equal(velma.npc.id, "velma");
const fromGround = nearestNpc(0.1, -13.0, 0, 2.2);
assert.ok(!fromGround || fromGround.npc.id !== "velma", "ground floor cannot talk to lounge");

assert.equal(onDanceFloor(0, 0, 0), true);
assert.equal(onDanceFloor(0, 0, 4.4), false);
assert.equal(onDanceFloor(20, 0, 0), false);

const start = getNode(rexa.npc, "start");
assert.ok(start.choices.length >= 2);
const next = applyChoice(rexa.npc, "start", 0);
assert.equal(next.nodeId, "heavy");
assert.equal(next.closed, false);
const done = applyChoice(rexa.npc, "heavy", 0);
assert.equal(done.closed, true);

const ion = NPCS.find((n) => n.id === "ion");
const sip = applyChoice(ion, "start", 1);
assert.equal(sip.action, "tipsy");

const socks = NPCS.find((n) => n.id === "socks");
const pet = applyChoice(socks, "start", 0);
assert.equal(pet.action, "pet-cat");

const dottie = NPCS.find((n) => n.id === "dottie");
assert.ok(dottie.z < 2.4, "dottie stands on the customer side of the counter");

assert.ok(PROPS.length >= 4);
assert.ok(nearestProp(7.15, 14.85, 0, 1.8).prop.id === "phone");
assert.ok(GAZETTE.headline.includes("LED"));
assert.ok(PHONE_LINES.length >= 4);

const ids = new Set(NPCS.map((n) => n.id));
assert.equal(ids.size, NPCS.length, "unique ids");

console.log("ok  named people, floors, props, dialogue graph");
console.log(`${NPCS.length} people tests passed`);
