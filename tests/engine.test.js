const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../engine.js");

const QUESTIONS = [
    {
        opts: [
            { chaos: 10, charm: 20, cosmic: 30, static: 40 },
            { chaos: 90, charm: 80, cosmic: 10, static: 10 },
        ],
    },
    {
        opts: [
            { chaos: 10, charm: 20, cosmic: 30, static: 40 },
            { chaos: 90, charm: 80, cosmic: 10, static: 10 },
        ],
    },
];

const VIBES = [
    { id: "executive-chaos", title: "EXECUTIVE CHAOS INTERN" },
    { id: "feral-spreadsheet", title: "FERAL SPREADSHEET PROPHET" },
    { id: "premium-static", title: "PREMIUM STATIC SUBSCRIBER" },
];

test("scoreAnswers averages option stats onto a 0-100 profile", () => {
    const stats = engine.scoreAnswers(QUESTIONS, [1, 1]);
    assert.equal(stats.chaos, 90);
    assert.equal(stats.charm, 80);
    assert.equal(stats.cosmic, 10);
    assert.equal(stats.static, 10);
});

test("pickVibe uses the same executive-chaos rule as the site", () => {
    const vibe = engine.pickVibe({ chaos: 88, charm: 80, cosmic: 20, static: 20 }, VIBES);
    assert.equal(vibe.id, "executive-chaos");
});

test("encode and decode survive a round trip", () => {
    const token = engine.encodeResult({
        id: "executive-chaos",
        stats: { chaos: 88, charm: 80, cosmic: 20, static: 20 },
        reportId: "123456",
    });
    const decoded = engine.decodeResult(token);
    assert.equal(decoded.id, "executive-chaos");
    assert.equal(decoded.reportId, "123456");
    assert.equal(decoded.stats.chaos, 88);
});

test("compareResults reports archetype drift", () => {
    const left = { id: "a", stats: { chaos: 10, charm: 10, cosmic: 10, static: 10 } };
    const right = { id: "b", stats: { chaos: 20, charm: 10, cosmic: 10, static: 10 } };
    const cmp = engine.compareResults(left, right);
    assert.equal(cmp.sameArchetype, false);
    assert.equal(cmp.distance, 10);
    assert.equal(cmp.delta.chaos, 10);
});

test("shuffleQuestions is deterministic for a seed", () => {
    const qs = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const a = engine.shuffleQuestions(qs, 9000);
    const b = engine.shuffleQuestions(qs, 9000);
    assert.deepEqual(a.map((q) => q.id), b.map((q) => q.id));
    const c = engine.shuffleQuestions(qs, 9001);
    assert.notDeepEqual(a.map((q) => q.id), c.map((q) => q.id));
});

test("compatibility is 100 for identical stats", () => {
    const stats = { chaos: 40, charm: 50, cosmic: 60, static: 70 };
    assert.equal(engine.compatibility(stats, stats), 100);
    assert.ok(engine.compatibility(stats, { chaos: 0, charm: 0, cosmic: 0, static: 0 }) < 80);
});

test("new archetypes resolve from the engine", () => {
    const fax = engine.pickVibe({ chaos: 80, charm: 85, cosmic: 80, static: 40 }, [
        { id: "fax-from-the-future" },
        { id: "executive-chaos" },
    ]);
    assert.equal(fax.id, "fax-from-the-future");
});

test("atlasProgress and streakOnScan", () => {
    const prog = engine.atlasProgress(["a"], ["a", "b", "c"]);
    assert.equal(prog.found, 1);
    assert.equal(prog.total, 3);
    const first = engine.streakOnScan({}, "2026-08-24");
    assert.equal(first.count, 1);
    const next = engine.streakOnScan(first, "2026-08-25");
    assert.equal(next.count, 2);
    const same = engine.streakOnScan(next, "2026-08-25");
    assert.equal(same.already, true);
});

test("compatibilityLabel and skinFromStats", () => {
    assert.equal(engine.compatibilityLabel(100), "same firmware, different case");
    assert.equal(engine.skinFromStats({ chaos: 90, charm: 10, cosmic: 10, static: 10 }), "magenta");
    const lines = engine.dossier({ title: "X", reportId: "42", stats: { chaos: 1, charm: 2, cosmic: 3, static: 4 } });
    assert.ok(lines[0].includes("42"));
});

test("dailySeed is stable for a given UTC date", () => {
    const a = engine.dailySeed(new Date("2026-08-18T12:00:00.000Z"));
    const b = engine.dailySeed(new Date("2026-08-18T23:00:00.000Z"));
    assert.equal(a.date, "2026-08-18");
    assert.equal(a.seed, b.seed);
    assert.ok(a.flavor);
});
