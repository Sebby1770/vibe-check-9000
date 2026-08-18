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

test("dailySeed is stable for a given UTC date", () => {
    const a = engine.dailySeed(new Date("2026-08-18T12:00:00.000Z"));
    const b = engine.dailySeed(new Date("2026-08-18T23:00:00.000Z"));
    assert.equal(a.date, "2026-08-18");
    assert.equal(a.seed, b.seed);
    assert.ok(a.flavor);
});
