import assert from "node:assert/strict";
import {
    LOOKS,
    loadProgress,
    saveProgress,
    evaluateUnlocks,
    setLook,
    stampNight,
    getLook,
} from "../js/progress.js";

const mem = {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = v; },
};

const empty = loadProgress(mem);
assert.deepEqual(empty.unlocked, ["stock"]);
assert.equal(empty.look, "stock");
assert.equal(LOOKS.length, 8);

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
