/* Pure scoring helpers for VIBE CHECK 9000. Safe in browsers and Node. */

(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    root.VibeEngine = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    function normalizeStats(totals, questionCount) {
        const max = Math.max(1, questionCount) * 100;
        return {
            chaos: Math.round((totals.chaos / max) * 100),
            charm: Math.round((totals.charm / max) * 100),
            cosmic: Math.round((totals.cosmic / max) * 100),
            static: Math.round((totals.static / max) * 100),
        };
    }

    function scoreAnswers(questions, choices) {
        if (!Array.isArray(questions) || !Array.isArray(choices)) {
            throw new Error("questions and choices are required");
        }
        if (choices.length !== questions.length) {
            throw new Error("answer every question");
        }
        const totals = { chaos: 0, charm: 0, cosmic: 0, static: 0 };
        choices.forEach((index, qi) => {
            const opt = questions[qi] && questions[qi].opts[index];
            if (!opt) throw new Error("invalid choice at question " + (qi + 1));
            totals.chaos += opt.chaos;
            totals.charm += opt.charm;
            totals.cosmic += opt.cosmic;
            totals.static += opt.static;
        });
        return normalizeStats(totals, questions.length);
    }

    function pickVibe(stats, vibes) {
        const list = vibes || [];
        const byId = (id) => list.find((v) => v.id === id);
        const { chaos, charm, cosmic, static: staticStat } = stats;

        if (staticStat >= 76 && chaos >= 72) return byId("premium-static");
        if (cosmic >= 76 && charm < 58) return byId("neon-oracle");
        if (chaos >= 80 && charm >= 68) return byId("executive-chaos");
        if (charm >= 78 && chaos < 58) return byId("soft-launch");
        if (cosmic >= 76 && staticStat < 56) return byId("dialup-mystic");
        if (chaos >= 72 && charm >= 62) return byId("glitch-couture");
        if (cosmic >= 68 && chaos < 60) return byId("productivity-haunting");
        if (staticStat >= 82) return byId("doomscroll-samurai");
        if (cosmic >= 78 && staticStat >= 70) return byId("haunted-hotspot");
        if (chaos >= 64 && staticStat >= 72 && charm < 62) return byId("midnight-committee");
        if (charm >= 72 && staticStat >= 58 && chaos < 70) return byId("gilded-buffer");
        if (charm >= 74 && cosmic < 56) return byId("lofi-tycoon");
        if (staticStat >= 64 && cosmic >= 62) return byId("chrome-tab-romantic");
        if (chaos >= 68 && cosmic >= 72) return byId("ritual-reboot");
        return byId("feral-spreadsheet") || list[0] || null;
    }

    function encodeResult(result) {
        const payload = {
            id: result.id,
            stats: result.stats,
            reportId: result.reportId,
        };
        return Buffer && Buffer.from
            ? Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
            : btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }

    function decodeResult(token) {
        if (!token) return null;
        try {
            const padded = String(token).replace(/-/g, "+").replace(/_/g, "/");
            const json = typeof atob === "function"
                ? atob(padded)
                : Buffer.from(padded, "base64").toString("utf8");
            const data = JSON.parse(json);
            if (!data || !data.stats) return null;
            return data;
        } catch {
            return null;
        }
    }

    function compareResults(left, right) {
        const keys = ["chaos", "charm", "cosmic", "static"];
        const delta = {};
        let distance = 0;
        keys.forEach((key) => {
            const d = (right.stats[key] || 0) - (left.stats[key] || 0);
            delta[key] = d;
            distance += Math.abs(d);
        });
        const same = left.id && right.id && left.id === right.id;
        return {
            sameArchetype: Boolean(same),
            distance,
            delta,
            summary: same
                ? "same diagnosis, different firmware revision"
                : `stat drift ${distance} — the city remixed you`,
        };
    }

    function dailySeed(date = new Date()) {
        const stamp = date.toISOString().slice(0, 10);
        let hash = 2166136261;
        for (let i = 0; i < stamp.length; i += 1) {
            hash ^= stamp.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return {
            date: stamp,
            seed: hash >>> 0,
            flavor: ["low-battery moon", "overcaffeinated comet", "bureaucratic nebula", "sticky-note pulsar"][hash % 4],
        };
    }

    return {
        normalizeStats,
        scoreAnswers,
        pickVibe,
        encodeResult,
        decodeResult,
        compareResults,
        dailySeed,
    };
}));
