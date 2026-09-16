import assert from "node:assert/strict";
import {
  SHOPS_CATALOG,
  normalizeCommerce,
  transact,
  deliver,
  collectIce,
  getErrands,
} from "../js/commerce.js";
import {
  loadProgress,
  saveProgress,
  touchVisit,
  evaluateUnlocks,
  buildRecap,
  PROGRESS_KEY,
} from "../js/progress.js";
import { dareComplete, memoryLine } from "../js/night.js";
import { NPCS, applyChoice } from "../js/people.js";

const empty = normalizeCommerce();
assert.equal(SHOPS_CATALOG.length, 7);
assert.equal(
  new Set(SHOPS_CATALOG.flatMap((s) => s.items.map((i) => i.id))).size,
  21,
);
for (const shop of SHOPS_CATALOG)
  for (const item of shop.items) {
    const result = transact(empty, shop.id, item.id);
    assert.equal(result.ok, true, `${shop.id}/${item.id}`);
    assert.equal(result.reward, true);
    assert.ok(result.state.completed.includes(item.id));
    const repeated = transact(result.state, shop.id, item.id);
    assert.ok(!repeated.reward, `${item.id} cannot farm rewards`);
    assert.equal(
      repeated.state.completed.filter((id) => id === item.id).length,
      1,
    );
    assert.deepEqual(
      normalizeCommerce(JSON.parse(JSON.stringify(result.state))),
      normalizeCommerce(result.state),
      "saved item survives normalization",
    );
  }
assert.deepEqual(
  empty,
  normalizeCommerce(),
  "transactions do not mutate their input",
);
assert.equal(
  transact(empty, "florist", "midnight-current").ok,
  false,
  "catalog cannot select another shop's stock",
);
assert.equal(
  deliver(empty, "frank").ok,
  false,
  "asking about ice cannot complete delivery",
);
let state = transact(empty, "records", "blue-hour").state;
const recordDelivery = deliver(state, "rexa");
assert.equal(recordDelivery.effect, "deliver-rexa");
assert.equal(recordDelivery.item.set.bpm, 112);
assert.ok(recordDelivery.events.flags.recordDelivered);
assert.equal(
  deliver(recordDelivery.state, "rexa").reward,
  false,
  "record can be replayed without another reward",
);
for (const [shop, id, recipient] of [
  ["florist", "velvet-roses", "velma"],
  ["liquor", "house-dry", "marco"],
]) {
  const acquired = transact(empty, shop, id).state;
  const wrong = deliver(acquired, "frank");
  assert.equal(wrong.ok, false);
  assert.equal(wrong.state.inventory.length, 1);
  const delivered = deliver(acquired, recipient);
  assert.equal(delivered.ok, true);
  assert.equal(delivered.state.inventory.length, 0);
  assert.equal(
    deliver(delivered.state, recipient).ok,
    false,
    "one delivery per evening",
  );
}
const ice = collectIce(empty);
assert.equal(ice.ok, true);
assert.equal(collectIce(ice.state).ok, false);
assert.equal(deliver(ice.state, "frank").ok, true);
assert.equal(getErrands(ice.state).find((e) => e.id === "ice").target, "frank");

const memory = {
  data: {},
  getItem(k) {
    return this.data[k] || null;
  },
  setItem(k, v) {
    this.data[k] = v;
  },
};
let progress = touchVisit(loadProgress(memory), "2026-09-10");
progress = evaluateUnlocks(progress, {
  flags: { vinyl: true },
  talkId: "sid",
  zone: "records",
  energyPeak: 86,
}).progress;
progress.night.commerce = recordDelivery.state;
progress.night.elapsed = 220;
saveProgress(progress, memory);
const resumed = touchVisit(loadProgress(memory), "2026-09-10");
assert.equal(resumed.night.commerce.record.id, "blue-hour");
assert.equal(resumed.night.elapsed, 220);
assert.equal(dareComplete(resumed, { id: "vinyl" }), true);
const tomorrow = touchVisit(resumed, "2026-09-11");
assert.ok(tomorrow.unlocked.includes("vinyl"), "permanent look survives");
assert.equal(tomorrow.flags.vinyl, true, "lifetime history survives");
assert.equal(tomorrow.night.commerce.inventory.length, 0);
assert.equal(tomorrow.night.elapsed, 0);
for (const id of ["vinyl", "shop", "energy"])
  assert.equal(
    dareComplete(tomorrow, { id }),
    false,
    `${id} uses the new night`,
  );
assert.equal(buildRecap(tomorrow).talked, 0);
assert.equal(buildRecap(tomorrow).bits.length, 0);
const repeatVisit = evaluateUnlocks(tomorrow, {
  talkId: "sid",
  zone: "records",
  flags: { vinyl: true },
}).progress;
assert.equal(repeatVisit.night.talks, 1);
assert.equal(dareComplete(repeatVisit, { id: "vinyl" }), true);
assert.deepEqual(
  tomorrow.night.flags,
  {},
  "night updates do not mutate old progress",
);
saveProgress(repeatVisit, memory);
assert.equal(loadProgress(memory).night.talks, 1);
memory.data[PROGRESS_KEY] = JSON.stringify({
  unlocked: ["stock", "vinyl"],
  look: "vinyl",
  flags: { vinyl: true },
  lastDay: "2026-09-10",
});
const migrated = loadProgress(memory);
assert.equal(migrated.look, "vinyl");
assert.deepEqual(migrated.night.commerce.inventory, []);
assert.doesNotThrow(() =>
  saveProgress(migrated, {
    setItem() {
      throw new Error("quota");
    },
  }),
);
const sid = NPCS.find((n) => n.id === "sid");
assert.equal(applyChoice(sid, "start", 0).action, "vinyl");
assert.equal(
  applyChoice(sid, "vinyl", 0).action,
  null,
  "dialogue exit cannot grant another record",
);
const nellie = NPCS.find((n) => n.id === "nellie");
assert.equal(applyChoice(nellie, "start", 0).action, "lead-ice");
console.log(
  "ok  21 catalog choices, repeat rewards, deliveries, save migration, daily rollover and dialogue rewards",
);

const secondRecord = transact(
  recordDelivery.state,
  "records",
  "midnight-current",
).state;
const resumedRecords = normalizeCommerce(
  JSON.parse(JSON.stringify(secondRecord)),
);
assert.equal(resumedRecords.record.id, "midnight-current");
assert.equal(
  resumedRecords.playingRecord.id,
  "blue-hour",
  "browsing another record cannot change the playing set on reload",
);
assert.equal(
  deliver(resumedRecords, "rexa").state.playingRecord.id,
  "midnight-current",
);

assert.match(memoryLine("sid", {}, recordDelivery.state), /Blue Hour.*REXA/);
