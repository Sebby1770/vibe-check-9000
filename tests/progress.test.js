import assert from "node:assert/strict";
import {
    LOOKS,
    loadProgress,
    saveProgress,
    evaluateUnlocks,
    setLook,
    stampNight,
    getLook,
    touchVisit,
    buildRecap,
} from "../js/progress.js";

const mem = {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = v; },
};

const empty = loadProgress(mem);
assert.deepEqual(empty.unlocked, ["stock"]);
assert.equal(empty.look, "stock");
assert.equal(LOOKS.length, 18);

let p = empty;
p = evaluateUnlocks(p, { talkId: "rexa" }).progress;
assert.ok(p.unlocked.includes("magenta"));
p = evaluateUnlocks(p, { flags: { sat: true } }).progress;
assert.ok(p.unlocked.includes("gold"));
p = evaluateUnlocks(p, { flags: { cat: true } }).progress;
assert.ok(p.unlocked.includes("lime"));
p = evaluateUnlocks(p, { zone: "street" }).progress;
assert.ok(p.unlocked.includes("dusk"));
p = evaluateUnlocks(p, { flags: { cube: true } }).progress;
assert.ok(p.unlocked.includes("chrome"));
p = evaluateUnlocks(p, { energyPeak: 80 }).progress;
assert.ok(p.unlocked.includes("rave"));
p = evaluateUnlocks(p, { phase: "lastcall" }).progress;
assert.ok(p.unlocked.includes("lastcall"));
p = evaluateUnlocks(p, { flags: { jazz: true } }).progress;
assert.ok(p.unlocked.includes("jazz"));
p = evaluateUnlocks(p, { flags: { pie: true } }).progress;
assert.ok(p.unlocked.includes("pie"));
p = evaluateUnlocks(p, { flags: { cab: true } }).progress;
assert.ok(p.unlocked.includes("cab"));
p = evaluateUnlocks(p, { phase: "close" }).progress;
assert.ok(p.unlocked.includes("afterhours"));
p = evaluateUnlocks(p, { flags: { vinyl: true } }).progress;
assert.ok(p.unlocked.includes("vinyl"));
p = evaluateUnlocks(p, { flags: { tonic: true } }).progress;
assert.ok(p.unlocked.includes("tonic"));
p = evaluateUnlocks(p, { flags: { haircut: true } }).progress;
assert.ok(p.unlocked.includes("clipper"));
p = evaluateUnlocks(p, { flags: { token: true } }).progress;
assert.ok(p.unlocked.includes("token"));
p = evaluateUnlocks(p, { flags: { ice: true } }).progress;
assert.ok(p.unlocked.includes("ice"));
p = evaluateUnlocks(p, { flags: { ticket: true } }).progress;
assert.ok(p.unlocked.includes("stub"));

const day1 = touchVisit(empty, "2026-09-09");
assert.equal(day1.streak, 1);
const day2 = touchVisit(day1, "2026-09-10");
assert.equal(day2.streak, 2);
const gap = touchVisit(day2, "2026-09-12");
assert.equal(gap.streak, 1);
assert.equal(touchVisit(day2, "2026-09-10").streak, 2);

const recap = buildRecap(p, { clock: "2:00 AM", set: "FRIDAY DROP", dare: "pie", dareDone: true });
assert.ok(recap.bits.length >= 3);
assert.equal(recap.dareDone, true);

const worn = setLook(p, "gold");
assert.equal(worn.look, "gold");
assert.equal(setLook(empty, "gold").look, "stock");
assert.equal(getLook("rave").visor, "#ff00ff");

const stamped = stampNight(p, { clock: "12:00 AM", phase: "peak", energy: 70, set: "FRIDAY DROP" });
assert.equal(stamped.stamps.length, 1);
assert.equal(stamped.stamps[0].set, "FRIDAY DROP");

saveProgress(stamped, mem);
const round = loadProgress(mem);
assert.ok(round.unlocked.includes("magenta"));
assert.equal(round.stamps[0].clock, "12:00 AM");

console.log("ok  cosmetic unlocks, look lock, night stamps");
console.log("progress tests passed");
