import assert from "node:assert/strict";
import {
    formatClock,
    phaseFromElapsed,
    dayHash,
    pickDaily,
    tonightBill,
    createClock,
    HOUSE_SETS,
    GAZETTES,
    NIGHT_START,
    wrapSeconds,
    phaseLook,
    PHASE_LOOK,
    PHASES,
    NPC_PHASE_LINES,
    WEEKDAYS,
} from "../js/night.js";

assert.equal(formatClock(NIGHT_START), "10:00 PM");
assert.equal(formatClock(0), "12:00 AM");
assert.equal(formatClock(12 * 3600), "12:00 PM");
assert.equal(wrapSeconds(-1), 86399);

assert.equal(phaseFromElapsed(0), "doors");
assert.equal(phaseFromElapsed(46 * 60), "heat");
assert.equal(phaseFromElapsed(121 * 60), "peak");
assert.equal(phaseFromElapsed(181 * 60), "lastcall");
assert.equal(phaseFromElapsed(230 * 60), "close");

const h = dayHash("2026-09-09");
assert.equal(typeof h, "number");
assert.equal(dayHash("2026-09-09"), h);
assert.notEqual(dayHash("2026-09-10"), h);
assert.ok(pickDaily(["a", "b", "c"], 0) === "a");
assert.ok(GAZETTES.length >= 6);
assert.equal(HOUSE_SETS.length, 7);
assert.equal(HOUSE_SETS[5].id, "friday-drop");
assert.equal(HOUSE_SETS[0].id, "sunday-ghost");

const bill = tonightBill(h, 5);
assert.equal(bill.set.id, "friday-drop");
assert.ok(bill.gazette.headline.length > 8);
assert.ok(bill.gazette.columns.length >= 3);
assert.ok(bill.gazette.date.includes("1954"));
assert.ok(bill.gazette.date.includes("FRIDAY"));
assert.equal(WEEKDAYS[5], "FRIDAY");

for (const id of PHASES) {
    assert.ok(PHASE_LOOK[id], id);
    assert.ok(phaseLook(id).stops.length >= 3);
    assert.equal(typeof phaseLook(id).clubMul, "number");
    assert.equal(typeof phaseLook(id).laser, "number");
}
assert.equal(phaseLook("nope").sunY, PHASE_LOOK.doors.sunY);
assert.ok(NPC_PHASE_LINES.nova.peak);
assert.ok(NPC_PHASE_LINES.scotty.close);
assert.ok(NPC_PHASE_LINES.ion.lastcall);

const clock = createClock(0);
clock.tick(1);
assert.ok(clock.elapsedGame > 10);
assert.equal(clock.phase, "doors");
clock.tick(200);
assert.ok(["doors", "heat", "peak"].includes(clock.phase));

console.log("ok  night clock, phases, daily bill");
console.log("night tests passed");
