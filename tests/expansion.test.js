import assert from "node:assert/strict";
import {
  WORKSHOPS,
  STREET_PLACES,
  MYSTERY,
  SIGNAL_SET,
  counterBrief,
  normalizeExpansion,
  finishCounter,
  followSignal,
  takeSnack,
  finishDuet,
  rhythmPhrase,
  addPhoto,
  removePhoto,
} from "../js/expansion.js";
import { normalizeCommerce, transact, deliver } from "../js/commerce.js";
import {
  loadProgress,
  touchVisit,
  evaluateUnlocks,
  buildRecap,
} from "../js/progress.js";
import { buildColliders } from "../js/zones.js";
import { blockedSegment } from "../js/interactions.js";
const empty = normalizeExpansion();
for (const w of WORKSHOPS) {
  const variations = new Set();
  for (let seed = 0; seed < 27; seed++) {
    const brief = counterBrief(w.id, seed);
    variations.add(brief.request);
    const wrong = [...brief.recipe];
    wrong[0] = (wrong[0] + 1) % 3;
    assert.equal(finishCounter(empty, w.id, wrong, seed).ok, false);
    const result = finishCounter(empty, w.id, brief.recipe, seed);
    assert.equal(result.ok, true);
    assert.equal(result.reward, true);
    assert.equal(
      finishCounter(result.state, w.id, brief.recipe, seed).reward,
      false,
    );
  }
  assert.equal(variations.size, 27, `${w.id} has 27 daily orders`);
}
assert.deepEqual(
  empty,
  normalizeExpansion(),
  "counter work never mutates the original state",
);
assert.equal(finishCounter(empty, "records", [], 12).ok, false);
assert.equal(counterBrief("missing"), null);
let state = empty;
for (const w of WORKSHOPS)
  state = finishCounter(state, w.id, counterBrief(w.id, 4).recipe, 4).state;
let progress = touchVisit(
  loadProgress({
    getItem() {
      return null;
    },
  }),
  "2026-09-13",
);
progress = evaluateUnlocks(
  {
    ...progress,
    night: {
      ...progress.night,
      commerce: { ...normalizeCommerce(), expansion: state },
    },
  },
  { flags: { counterRegular: true } },
).progress;
assert.ok(progress.unlocked.includes("block-regular"));
assert.ok(buildRecap(progress).bits.includes("helped at 7 shop counters"));
const nextDay = touchVisit(progress, "2026-09-14");
assert.ok(nextDay.unlocked.includes("block-regular"));
assert.deepEqual(nextDay.night.commerce.expansion, empty);
assert.equal(followSignal(empty, "lostproperty").ok, false);
let mystery = empty;
for (const clue of MYSTERY) {
  const next = followSignal(mystery, clue.target);
  assert.equal(next.ok, true);
  assert.equal(mystery.mystery, next.state.mystery - 1);
  mystery = next.state;
}
assert.equal(mystery.mystery, 5);
assert.equal(mystery.signalOn, true);
assert.equal(followSignal(mystery, "payphone").ok, false);
assert.equal(SIGNAL_SET.id, "signal-47");
let commerce = { ...normalizeCommerce(), expansion: mystery };
commerce = transact(commerce, "records", "blue-hour").state;
assert.ok(
  commerce.expansion.signalOn,
  "collecting another record cannot replace the signal set",
);
commerce = deliver(commerce, "rexa").state;
assert.equal(
  commerce.expansion.signalOn,
  false,
  "delivering a record switches back to that set",
);
assert.equal(takeSnack(empty, "missing").ok, false);
const snack = takeSnack(empty, "cocoa");
assert.equal(snack.energy, 8);
assert.equal(snack.steady, true);
assert.equal(takeSnack(snack.state, "cocoa").energy, 0);
assert.equal(finishDuet(empty, 3).reward, true);
assert.equal(finishDuet(finishDuet(empty, 3).state, 1).state.rhythmBest, 3);
assert.equal(finishDuet(finishDuet(empty, 3).state, 3).reward, false);
for (let round = 0; round < 3; round++) {
  assert.equal(rhythmPhrase(round).length, round + 3);
  assert.ok(rhythmPhrase(round).every((n) => n >= 0 && n < 3));
}
const photo = {
  id: "frame",
  image: "data:image/jpeg;base64,AA==",
  clock: "11:45 PM",
  title: "THE FLOOR",
};
assert.equal(addPhoto(empty, photo, "club").ok, false);
let photos = { ...empty, camera: true };
for (let i = 0; i < 8; i++)
  photos = addPhoto(photos, { ...photo, id: String(i) }, String(i % 4)).state;
assert.equal(photos.photos.length, 6);
assert.equal(photos.discoveries.length, 4);
assert.equal(photos.photos[0].id, "2");
const removed = removePhoto(photos, "7");
assert.equal(removed.photos.length, 5);
assert.equal(removed.discoveries.length, 4);
assert.equal(
  addPhoto(photos, { ...photo, image: "https://example.com/photo.jpg" }, "club")
    .ok,
  false,
);
assert.equal(
  normalizeExpansion({
    photos: [
      { ...photo, image: "data:image/jpeg;base64," + "A".repeat(180000) },
    ],
  }).photos.length,
  0,
);
assert.deepEqual(normalizeCommerce({ expansion: photos }).expansion, photos);
assert.deepEqual(
  normalizeCommerce().expansion,
  empty,
  "v20 saves migrate without needing a reset",
);
const boxes = buildColliders().boxes;
for (const p of STREET_PLACES.filter((p) => p.id !== "payphone")) {
  const from = { x: p.x, y: 1.7, z: p.z + (p.id === "busker" ? 2 : -1.8) };
  assert.equal(
    blockedSegment(from, { x: p.x, y: 1.25, z: p.z }, boxes),
    false,
    `${p.id} interaction is reachable`,
  );
  assert.equal(
    boxes.some(
      (b) =>
        from.x > b.minX &&
        from.x < b.maxX &&
        from.z > b.minZ &&
        from.z < b.maxZ &&
        from.y > (b.minY ?? -99) &&
        from.y < (b.maxY ?? 99),
    ),
    false,
    `${p.id} approach stands outside collision`,
  );
}
console.log(
  "ok  189 daily briefs, passport, ordered mystery, rhythm, snacks, bounded album, migration and fixture access",
);
