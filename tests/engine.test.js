import assert from "node:assert/strict";
import {
    QUESTIONS,
    VIBES,
    ACHIEVEMENTS,
    scoreAnswers,
    pickVibe,
    encodeResult,
    decodeResult,
    encodeQuery,
    decodeQuery,
    parseShareLocation,
    evaluateUnlocks,
    createScanResult,
} from "../js/engine.js";

let passed = 0;
function test(name, fn) {
    fn();
    passed += 1;
    console.log(`ok  ${name}`);
}

test("nine questions and fifteen vibes", () => {
    assert.equal(QUESTIONS.length, 9);
    assert.equal(VIBES.length, 15);
    assert.equal(ACHIEVEMENTS.length, 10);
    for (const q of QUESTIONS) {
        assert.equal(q.opts.length, 5);
        for (const opt of q.opts) {
            assert.equal(typeof opt.text, "string");
            assert.ok(opt.text.length > 0);
            for (const key of ["chaos", "charm", "cosmic", "static"]) {
                assert.equal(typeof opt[key], "number");
            }
        }
    }
});

test("scoreAnswers averages option stats over 9 and stays in 0-100", () => {
    const zeros = Array.from({ length: 9 }, () => ({ chaos: 0, charm: 0, cosmic: 0, static: 0 }));
    const z = scoreAnswers(zeros);
    assert.deepEqual(z.stats, { chaos: 0, charm: 0, cosmic: 0, static: 0 });

    const maxed = Array.from({ length: 9 }, () => ({ chaos: 100, charm: 100, cosmic: 100, static: 100 }));
    const m = scoreAnswers(maxed);
    assert.deepEqual(m.stats, { chaos: 100, charm: 100, cosmic: 100, static: 100 });

    const over = Array.from({ length: 9 }, () => ({ chaos: 140, charm: -20, cosmic: 55.4, static: 200 }));
    const o = scoreAnswers(over);
    assert.equal(o.stats.chaos, 100);
    assert.equal(o.stats.charm, 0);
    assert.equal(o.stats.static, 100);
    assert.ok(o.stats.cosmic >= 0 && o.stats.cosmic <= 100);

    const firsts = scoreAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert.equal(firsts.stats.chaos, 51);
    assert.equal(firsts.stats.charm, 64);
    assert.equal(firsts.stats.cosmic, 57);
    assert.equal(firsts.stats.static, 57);

    const missing = scoreAnswers([]);
    assert.deepEqual(missing.stats, { chaos: 0, charm: 0, cosmic: 0, static: 0 });
    assert.ok(VIBES.includes(missing.vibe) || VIBES.some((v) => v.id === missing.vibe.id));
});

test("pickVibe follows the original branch order", () => {
    assert.equal(pickVibe({ chaos: 72, charm: 50, cosmic: 50, static: 76 }).id, "premium-static");
    assert.equal(pickVibe({ chaos: 50, charm: 50, cosmic: 76, static: 50 }).id, "neon-oracle");
    assert.equal(pickVibe({ chaos: 80, charm: 68, cosmic: 50, static: 50 }).id, "executive-chaos");
    assert.equal(pickVibe({ chaos: 50, charm: 78, cosmic: 50, static: 50 }).id, "soft-launch");
    assert.equal(pickVibe({ chaos: 50, charm: 60, cosmic: 76, static: 50 }).id, "dialup-mystic");
    assert.equal(pickVibe({ chaos: 72, charm: 62, cosmic: 50, static: 50 }).id, "glitch-couture");
    assert.equal(pickVibe({ chaos: 50, charm: 60, cosmic: 68, static: 60 }).id, "productivity-haunting");
    assert.equal(pickVibe({ chaos: 50, charm: 50, cosmic: 50, static: 82 }).id, "doomscroll-samurai");
    assert.equal(pickVibe({ chaos: 70, charm: 60, cosmic: 78, static: 70 }).id, "haunted-hotspot");
    assert.equal(pickVibe({ chaos: 64, charm: 50, cosmic: 50, static: 72 }).id, "midnight-committee");
    assert.equal(pickVibe({ chaos: 50, charm: 72, cosmic: 50, static: 58 }).id, "gilded-buffer");
    assert.equal(pickVibe({ chaos: 50, charm: 74, cosmic: 50, static: 50 }).id, "lofi-tycoon");
    assert.equal(pickVibe({ chaos: 50, charm: 50, cosmic: 62, static: 64 }).id, "chrome-tab-romantic");
    assert.equal(pickVibe({ chaos: 68, charm: 50, cosmic: 72, static: 50 }).id, "ritual-reboot");

    const ids = new Set();
    const orig = Math.random;
    for (let i = 0; i < VIBES.length; i++) {
        Math.random = () => (i + 0.1) / VIBES.length;
        ids.add(pickVibe({ chaos: 50, charm: 50, cosmic: 50, static: 50 }).id);
    }
    Math.random = orig;
    assert.equal(ids.size, VIBES.length);
});

test("encodeResult / decodeResult roundtrip", () => {
    const result = {
        id: "neon-oracle",
        stats: { chaos: 41, charm: 55, cosmic: 81, static: 33 },
        reportId: "042001",
        generatedAt: "2026-09-07T12:00:00.000Z",
    };
    const token = encodeResult(result);
    assert.equal(typeof token, "string");
    assert.equal(token.includes("+"), false);
    assert.equal(token.includes("/"), false);
    assert.equal(token.includes("="), false);

    const back = decodeResult(token);
    assert.ok(back);
    assert.equal(back.id, "neon-oracle");
    assert.equal(back.title, "NEON ORACLE ON LOW BATTERY");
    assert.deepEqual(back.stats, result.stats);
    assert.equal(back.reportId, "042001");
    assert.equal(back.generatedAt, "2026-09-07T12:00:00.000Z");

    assert.equal(decodeResult(null), null);
    assert.equal(decodeResult(""), null);
    assert.equal(decodeResult("not-valid-@@@"), null);
    assert.ok(decodeResult(`prefix#vibe=${token}`));
});

test("query share encode/decode and parseShareLocation", () => {
    const result = createScanResult([0, 1, 2, 3, 4, 0, 1, 2, 3], new Date("2026-01-02T00:00:00.000Z"));
    assert.ok(result.id);
    assert.ok(result.stats);

    const q = encodeQuery(result);
    const fromQ = decodeQuery(`?${q}`);
    assert.equal(fromQ.id, result.id);
    assert.deepEqual(fromQ.stats, result.stats);
    assert.equal(fromQ.reportId, result.reportId);

    const token = encodeResult(result);
    const fromHash = parseShareLocation("", `#vibe=${token}`);
    assert.equal(fromHash.id, result.id);
    assert.deepEqual(fromHash.stats, result.stats);

    const fromSearch = parseShareLocation(`?${q}`, "");
    assert.equal(fromSearch.id, result.id);

    assert.equal(parseShareLocation("", ""), null);
});

test("evaluateUnlocks awards first / static / speedrun / rave", () => {
    const a = evaluateUnlocks({ scanCount: 1, stats: { static: 71, cosmic: 10 }, elapsedMs: 12000, flags: { rave: true } });
    assert.ok(a.freshly.includes("first"));
    assert.ok(a.freshly.includes("static"));
    assert.ok(a.freshly.includes("speedrun"));
    assert.ok(a.freshly.includes("rave"));
    assert.equal(a.freshly.includes("cosmic"), false);

    const b = evaluateUnlocks({ achievements: a.achievements, scanCount: 1, flags: { rave: true } });
    assert.deepEqual(b.freshly, []);
});

console.log(`\n${passed} tests passed`);
