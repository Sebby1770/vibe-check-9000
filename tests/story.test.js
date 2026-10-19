// THE 12:04: the whole story can be played through by events, in order, without mutating input; time
// windows hold; state normalizes idempotently, survives JSON and backups, and never stores markup.
import assert from "node:assert/strict";
import { CHAPTERS, STORY_PLACES, normalizeStory, currentObjective, onStoryEvent, storyLine, objectiveTarget, trackerText, ALL_OBJECTIVES } from "../js/story/story.js";
import { NPCS } from "../js/people.js";
import { writeBackup, readBackup } from "../js/save-backup.js";
import { loadProgress } from "../js/progress.js";

const empty = normalizeStory();
assert.deepEqual(normalizeStory(normalizeStory(empty)), empty);
assert.deepEqual(normalizeStory(JSON.parse(JSON.stringify(empty))), empty);
assert.equal(empty.started, false);
assert.equal(currentObjective(empty).id, "ask-rexa");

// Every talk objective names a real character, or a story character the world spawns (Ada).
for (const c of CHAPTERS) for (const o of c.objectives) {
  if (o.kind === "talk") assert.ok(NPCS.some((n) => n.id === o.npc) || o.npc === "ada", `${o.id} talks to a known character`);
  if (o.place || o.prop) assert.ok(STORY_PLACES[o.place || o.prop], `${o.id} has a place`);
}

const startedState = onStoryEvent(empty, { type: "start" });
assert.equal(startedState.effects[0].type, "card");
assert.deepEqual(empty, normalizeStory(), "reducers never mutate their input");

function eventFor(o) {
  const p = STORY_PLACES[o.place || o.prop];
  switch (o.kind) {
    case "talk": return { type: "talk", npc: o.npc };
    case "interact": return { type: "interact", prop: o.prop };
    case "reach": return { type: "reach", x: p.x + 0.5, z: p.z, y: p.y };
    case "follow": return { type: "follow", actor: o.actor, result: "done" };
    case "stealth": return { type: "stealth", result: "in" };
    case "cutscene": return { type: "cutscene", scene: o.scene };
    case "choice": return { type: "choice", value: "home" };
  }
}

let s = startedState.state;
const seen = [];
let cash = 0;
while (currentObjective(s)) {
  const o = currentObjective(s);
  seen.push(o.id);
  if (o.kind === "talk") assert.equal(storyLine(s, o.npc).say, o.say);
  assert.ok(objectiveTarget(s, NPCS), `${o.id} gives the waypoint somewhere to point`);
  if (o.window) {
    const wrong = onStoryEvent(s, eventFor(o), { hour: 14 });
    assert.equal(wrong.changed, false, `${o.id} waits for its hour`);
    assert.ok(trackerText(s, 14).hint, "the tracker explains the wait");
  }
  const hour = o.window ? o.window[0] + 0.05 : 22;
  const wrongNpc = onStoryEvent(s, { type: "talk", npc: "socks" }, { hour });
  assert.equal(wrongNpc.changed, false);
  const r = onStoryEvent(s, eventFor(o), { hour });
  assert.equal(r.changed, true, `${o.id} completes`);
  cash += r.effects.filter((e) => e.type === "cash").reduce((a, e) => a + e.amount, 0);
  s = r.state;
}
assert.deepEqual(seen, ALL_OBJECTIVES, "every objective is played, in order");
assert.equal(s.ending, "home");
assert.equal(trackerText(s).done, true);
assert.ok(cash >= 90, "story beats pay into the wallet");
assert.equal(s.echoes, true);
assert.ok(Object.values(s.quests).every((q) => q.state === "done"));

// The far side of the platform: staying works too.
let stay = normalizeStory({ chapter: 5, step: 4, started: true });
stay = onStoryEvent(stay, { type: "choice", value: "stay" }).state;
assert.equal(stay.ending, "stay");

// A spotted tail or stealth attempt doesn't advance.
const tail = normalizeStory({ chapter: 3, step: 1, started: true });
assert.equal(onStoryEvent(tail, { type: "follow", actor: "kessler", result: "spotted" }).changed, false);

// Saved inside progress, the story survives a backup round trip with no markup in it.
const progress = { ...loadProgress({ getItem: () => null }), lastDay: "2026-10-19", story: s };
const text = writeBackup(progress, new Date("2026-10-19T12:00:00Z"));
assert.ok(!/[<>]/.test(JSON.stringify(s)));
assert.deepEqual(normalizeStory(readBackup(text).progress.story), s);
console.log(`story: ${CHAPTERS.length} chapters, ${ALL_OBJECTIVES.length} objectives played through, windows, endings, backups`);
