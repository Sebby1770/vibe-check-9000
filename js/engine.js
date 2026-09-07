/* VIBE CHECK 9000™ — scoring, share, achievements. No DOM. */

export const REPO_URL = "https://github.com/Sebby1770/vibe-check-9000";
export const PROFILE_URL = "https://github.com/Sebby1770";
export const LIVE_URL = "https://sebby1770.github.io/vibe-check-9000/";

export const STORAGE_KEYS = {
    history: "vibeHistory",
    scanCount: "vibeScanCount",
    achievements: "vibeAchievements",
    seen: "vibeSeen",
};

export const QUESTIONS = [
    {
        prompt: "It is 3:47 AM. Your screen is glowing. What are you doing?",
        opts: [
            { text: "renaming files until my identity returns", chaos: 52, charm: 38, cosmic: 44, static: 76 },
            { text: "watching a tutorial for software I do not own", chaos: 42, charm: 56, cosmic: 51, static: 46 },
            { text: "having a full emotional subplot with a progress bar", chaos: 86, charm: 66, cosmic: 78, static: 58 },
            { text: "optimizing my calendar for a version of me that never arrives", chaos: 36, charm: 70, cosmic: 45, static: 34 },
            { text: "refusing the concept of tomorrow on technical grounds", chaos: 95, charm: 62, cosmic: 88, static: 80 },
        ],
    },
    {
        prompt: "Choose your illegal accessory:",
        opts: [
            { text: "mirror sunglasses with prescription anxiety", chaos: 63, charm: 84, cosmic: 42, static: 49 },
            { text: "a USB drive labeled DEFINITELY TAXES", chaos: 82, charm: 48, cosmic: 39, static: 91 },
            { text: "a jacket with too many mysterious zippers", chaos: 69, charm: 76, cosmic: 58, static: 55 },
            { text: "a notebook full of passwords and dramatic arrows", chaos: 50, charm: 52, cosmic: 72, static: 64 },
            { text: "one perfect pen that only works when judged", chaos: 34, charm: 67, cosmic: 83, static: 32 },
        ],
    },
    {
        prompt: "The elevator voice asks for your destination. You say:",
        opts: [
            { text: "the roof, but emotionally", chaos: 62, charm: 58, cosmic: 91, static: 44 },
            { text: "wherever the side quest starts", chaos: 75, charm: 88, cosmic: 64, static: 50 },
            { text: "floor 404, obviously", chaos: 84, charm: 41, cosmic: 70, static: 92 },
            { text: "home, but with better lighting", chaos: 36, charm: 74, cosmic: 46, static: 29 },
            { text: "surprise me, corporate architecture", chaos: 92, charm: 65, cosmic: 73, static: 81 },
        ],
    },
    {
        prompt: "A vending machine grants you one cursed snack. Pick fast.",
        opts: [
            { text: "glow-in-the-dark trail mix of uncertain origin", chaos: 66, charm: 38, cosmic: 82, static: 74 },
            { text: "a protein bar that tastes like ambition", chaos: 31, charm: 79, cosmic: 35, static: 39 },
            { text: "sparkling water with a terms-of-service aftertaste", chaos: 47, charm: 61, cosmic: 55, static: 69 },
            { text: "hot chips called EXECUTIVE FIREWALL", chaos: 88, charm: 71, cosmic: 44, static: 67 },
            { text: "plain crackers, but ominous", chaos: 58, charm: 43, cosmic: 76, static: 84 },
        ],
    },
    {
        prompt: "Your ideal notification sound is:",
        opts: [
            { text: "a tiny cash register with unresolved feelings", chaos: 46, charm: 81, cosmic: 41, static: 54 },
            { text: "the Windows error noise, slowed down 800%", chaos: 90, charm: 37, cosmic: 63, static: 96 },
            { text: "a calm voice saying 'not again'", chaos: 69, charm: 58, cosmic: 48, static: 82 },
            { text: "one tasteful synth stab from the future", chaos: 40, charm: 87, cosmic: 71, static: 36 },
            { text: "no sound. only pressure.", chaos: 73, charm: 45, cosmic: 86, static: 62 },
        ],
    },
    {
        prompt: "When the simulation glitches, your first instinct is to:",
        opts: [
            { text: "document everything in a spreadsheet with tabs", chaos: 24, charm: 52, cosmic: 62, static: 33 },
            { text: "act natural, which makes it worse", chaos: 72, charm: 65, cosmic: 54, static: 68 },
            { text: "try to monetize it immediately", chaos: 88, charm: 92, cosmic: 37, static: 76 },
            { text: "ask whether this counts as personal growth", chaos: 51, charm: 49, cosmic: 94, static: 47 },
            { text: "turn it off and on again, including myself", chaos: 79, charm: 58, cosmic: 79, static: 90 },
        ],
    },
    {
        prompt: "A rogue AI offers you one superpower. Choose responsibly:",
        opts: [
            { text: "instantly finding the end of any sticky tape", chaos: 33, charm: 72, cosmic: 49, static: 41 },
            { text: "hearing what printers say about you", chaos: 77, charm: 44, cosmic: 68, static: 93 },
            { text: "perfect wifi in exactly one haunted location", chaos: 64, charm: 51, cosmic: 87, static: 72 },
            { text: "making any meeting end four minutes early", chaos: 45, charm: 89, cosmic: 38, static: 47 },
            { text: "summoning a fully charged battery, but only during arguments", chaos: 91, charm: 63, cosmic: 57, static: 79 },
        ],
    },
    {
        prompt: "Your browser history is about to be read aloud at a gala. You:",
        opts: [
            { text: "take the podium first and provide commentary", chaos: 74, charm: 93, cosmic: 46, static: 58 },
            { text: "claim it belongs to a very curious raccoon", chaos: 89, charm: 66, cosmic: 61, static: 71 },
            { text: "request it be performed as interpretive dance", chaos: 68, charm: 71, cosmic: 90, static: 52 },
            { text: "accept your fate with excellent posture", chaos: 37, charm: 61, cosmic: 74, static: 44 },
            { text: "trigger the fire alarm with practiced calm", chaos: 96, charm: 40, cosmic: 42, static: 88 },
        ],
    },
    {
        prompt: "Final calibration. Pick the frequency your soul hums at:",
        opts: [
            { text: "the gentle whir of a laptop fan doing its best", chaos: 39, charm: 57, cosmic: 53, static: 81 },
            { text: "elevator music, but remixed by someone dangerous", chaos: 81, charm: 74, cosmic: 59, static: 63 },
            { text: "the silence right after sending a risky message", chaos: 70, charm: 62, cosmic: 85, static: 55 },
            { text: "keyboard sounds at 2 AM, extremely confident ones", chaos: 58, charm: 68, cosmic: 47, static: 74 },
            { text: "a dial tone from a phone that was never plugged in", chaos: 85, charm: 43, cosmic: 92, static: 90 },
        ],
    },
];

export const VIBES = [
    {
        id: "feral-spreadsheet",
        title: "FERAL SPREADSHEET PROPHET",
        badge: "XL",
        desc: "Your cells are formatted, but your soul has conditional logic. You can turn panic into a pivot table and somehow make it inspirational.",
        item: "a highlighter with main-character privileges",
        color: "#39FF14",
        pair: "someone who appreciates named ranges",
        avoid: "meetings described as 'quick syncs'",
        prophecy: "a tiny admin task will become your villain origin story.",
    },
    {
        id: "neon-oracle",
        title: "NEON ORACLE ON LOW BATTERY",
        badge: "NO",
        desc: "You give excellent advice while personally ignoring all of it. The future keeps DMing you and you keep leaving it on read.",
        item: "a cracked phone showing 1%",
        color: "#00FFF7",
        pair: "a practical person with excellent snacks",
        avoid: "questions that begin with 'be honest'",
        prophecy: "your next gut feeling is correct, but dramatically inconvenient.",
    },
    {
        id: "executive-chaos",
        title: "EXECUTIVE CHAOS INTERN",
        badge: "EC",
        desc: "You have CEO energy and intern permissions. Every plan you touch becomes a thrilling three-act structure with invoice implications.",
        item: "a laminated badge that says PROBABLY ALLOWED",
        color: "#FF00FF",
        pair: "someone who reads the fine print for sport",
        avoid: "shared documents with no owner",
        prophecy: "you will accidentally become responsible for a system.",
    },
    {
        id: "premium-static",
        title: "PREMIUM STATIC SUBSCRIBER",
        badge: "PS",
        desc: "Your vibe arrives in 4K, buffers twice, then says something devastatingly accurate. You are mysterious mostly because your tabs are out of control.",
        item: "noise-canceling headphones playing nothing",
        color: "#B8F000",
        pair: "a person who can find the right charger instantly",
        avoid: "automatic updates before coffee",
        prophecy: "a device will ask for trust. Make it earn trust.",
    },
    {
        id: "soft-launch",
        title: "SOFT-LAUNCHED SUPERSTAR",
        badge: "SS",
        desc: "You are not seeking attention, but the lighting keeps choosing you. Your errands have cinematography. Your receipts have lore.",
        item: "sunglasses indoors for legal reasons",
        color: "#FFB703",
        pair: "someone who knows your good side and your backup good side",
        avoid: "group photos taken from below",
        prophecy: "a minor outfit choice will change the room temperature.",
    },
    {
        id: "dialup-mystic",
        title: "DIAL-UP MYSTIC WITH FIBER OPTIC DREAMS",
        badge: "DM",
        desc: "Spiritually ancient, technologically impatient. You want transcendence, but only if the loading spinner respects your time.",
        item: "a notebook titled PASSWORDS? MAYBE",
        color: "#7209B7",
        pair: "a calm scheduler with dramatic taste",
        avoid: "apps that request your birthday for no reason",
        prophecy: "something old will become useful right after you stop mocking it.",
    },
    {
        id: "glitch-couture",
        title: "GLITCH COUTURE MENACE",
        badge: "GC",
        desc: "You dress like the system log developed taste. Rules become suggestions near you, and suggestions become performance art.",
        item: "a jacket that looks expensive to troubleshoot",
        color: "#F72585",
        pair: "someone immune to secondhand drama",
        avoid: "minimalist interiors with maximum judgment",
        prophecy: "you will win an argument using a sentence nobody expected.",
    },
    {
        id: "productivity-haunting",
        title: "PRODUCTIVITY HAUNTING IN PROGRESS",
        badge: "PH",
        desc: "Your task list has developed weather. You are not behind; you are creating suspense for future you.",
        item: "a calendar invite with no agenda",
        color: "#4361EE",
        pair: "a gentle deadline and a realistic snack",
        avoid: "optimistic estimates made after midnight",
        prophecy: "one postponed errand will reveal a secret shortcut.",
    },
    {
        id: "doomscroll-samurai",
        title: "DOOMSCROLL SAMURAI WITH GREAT HAIR",
        badge: "DS",
        desc: "You slice through bad news with impeccable posture and questionable screen time. The algorithm fears your cheekbones.",
        item: "a blade-sharp side part",
        color: "#E63946",
        pair: "someone who says 'put the phone down' kindly",
        avoid: "comment sections and cold leftovers",
        prophecy: "you will regain focus exactly seven minutes too late.",
    },
    {
        id: "lofi-tycoon",
        title: "LO-FI TYCOON OF THE AFTERPARTY",
        badge: "LT",
        desc: "You want wealth, peace, and a playlist that sounds like rain on a keyboard. Somehow this is a business plan.",
        item: "a mug that says Q4 FEELINGS",
        color: "#06D6A0",
        pair: "a strategist with comfortable shoes",
        avoid: "networking events with fluorescent sincerity",
        prophecy: "a casual idea will become suspiciously profitable.",
    },
    {
        id: "chrome-tab-romantic",
        title: "CHROME TAB ROMANTIC",
        badge: "CR",
        desc: "You keep every possibility open, including 37 articles you will absolutely read someday. Your curiosity is beautiful and computationally expensive.",
        item: "a bookmark folder named FINAL_final",
        color: "#4CC9F0",
        pair: "someone who can close a loop without making it weird",
        avoid: "research that has no ending",
        prophecy: "one saved link will finally justify itself.",
    },
    {
        id: "ritual-reboot",
        title: "RITUAL REBOOT SPECIALIST",
        badge: "RR",
        desc: "You do not spiral; you perform structured restarts with lighting. Even your breakdowns have a changelog.",
        item: "a sticky note reading PATCH NOTES: ME",
        color: "#FB5607",
        pair: "someone who respects the reset routine",
        avoid: "people who say 'just relax' with no implementation plan",
        prophecy: "a small reset will fix more than the thing you reset.",
    },
    {
        id: "haunted-hotspot",
        title: "HAUNTED HOTSPOT WITH FULL BARS",
        badge: "HH",
        desc: "Devices connect to you emotionally. You radiate signal in places that should not have any, and nobody knows your data plan.",
        item: "a router with a candle on top",
        color: "#9D4EDD",
        pair: "someone grounded, electrically and otherwise",
        avoid: "airplane mode used as a personality",
        prophecy: "a dead device will turn on for you exactly once. Be gracious.",
    },
    {
        id: "midnight-committee",
        title: "CHAIR OF THE MIDNIGHT COMMITTEE",
        badge: "MC",
        desc: "Every night at 1 AM your brain convenes a full board meeting with no agenda and unlimited motions. Attendance is mandatory. Minutes are never kept.",
        item: "a gavel made of unread notifications",
        color: "#FF477E",
        pair: "someone who adjourns gently",
        avoid: "chamomile tea marketed with too much confidence",
        prophecy: "tonight's agenda item will resolve itself by lunch.",
    },
    {
        id: "gilded-buffer",
        title: "GILDED BUFFERING ICON",
        badge: "GB",
        desc: "You are always at 99%, glowing, iconic, almost there. The suspense is your brand and honestly the loading screen has never looked better.",
        item: "a progress bar wearing jewelry",
        color: "#FFD60A",
        pair: "someone patient with cinematic timing",
        avoid: "anyone who force-quits without asking",
        prophecy: "the thing loading finally finishes when you stop watching.",
    },
];

export const ACHIEVEMENTS = [
    { id: "first", icon: "◎", name: "FIRST SCAN", desc: "completed your first diagnostic" },
    { id: "trio", icon: "△", name: "TRIPLE BUFFER", desc: "scanned 3 times" },
    { id: "ten", icon: "◇", name: "VIBE VETERAN", desc: "scanned 10 times" },
    { id: "konami", icon: "⌁", name: "RETRO SIGNAL", desc: "entered the old code" },
    { id: "rave", icon: "✦", name: "RAVE MODE", desc: "activated chroma overload" },
    { id: "cube", icon: "◈", name: "CUBE WITNESS", desc: "pressed the forbidden geometry" },
    { id: "static", icon: "▣", name: "STATIC ROYALTY", desc: "max static stat" },
    { id: "cosmic", icon: "✺", name: "COSMIC RECEIPT", desc: "max cosmic stat" },
    { id: "explorer", icon: "✪", name: "VIBE CARTOGRAPHER", desc: "discovered 5 different vibes" },
    { id: "speedrun", icon: "⚡", name: "ANY% VIBER", desc: "answered every question in under 15 seconds" },
];

export const SIGNATURE_ITEMS = [
    "a glowing receipt", "a cracked metro card", "a password reset email",
    "a pen that writes only threats", "a tiny backup battery", "a badge marked TEMPORARY",
    "a synthwave umbrella", "a receipt for one mysterious cable", "a velvet folder of screenshots",
];

export const PAIRINGS = [
    "someone who labels every cable", "a practical person with neon taste",
    "a spreadsheet wizard with good boundaries", "the friend who brings backup chargers",
    "a calm engineer", "someone who laughs before the punchline",
    "a strategist with dramatic lighting", "a person who knows your coffee order",
    "future you, but hydrated",
];

export const AVOIDS = [
    "fluorescent sincerity", "automatic updates before coffee",
    "shared folders named misc", "optimistic deadlines after midnight",
    "meetings that could be a shrug", "comment sections",
    "apps that ask for notifications immediately", "keyboards with sticky spacebars",
];

export const PROPHECIES = [
    "your next notification will be personal",
    "an old note will become useful at the funniest possible moment",
    "you will solve a problem by renaming it",
    "a tiny inconvenience will reveal excellent gossip",
    "the thing you keep postponing will take eight minutes",
    "do not trust the first search result tomorrow",
    "your next good idea arrives while doing something unrelated",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function clamp100(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(100, Math.round(v)));
}

function resolveOption(answer, questionIndex) {
    if (typeof answer === "number") {
        const q = QUESTIONS[questionIndex];
        return q ? q.opts[answer] : null;
    }
    if (answer && typeof answer === "object") return answer;
    return null;
}

export function pickVibe(stats) {
    const chaos = stats.chaos;
    const charm = stats.charm;
    const cosmic = stats.cosmic;
    const staticStat = stats.static;

    if (staticStat >= 76 && chaos >= 72) return VIBES.find((v) => v.id === "premium-static");
    if (cosmic >= 76 && charm < 58) return VIBES.find((v) => v.id === "neon-oracle");
    if (chaos >= 80 && charm >= 68) return VIBES.find((v) => v.id === "executive-chaos");
    if (charm >= 78 && chaos < 58) return VIBES.find((v) => v.id === "soft-launch");
    if (cosmic >= 76 && staticStat < 56) return VIBES.find((v) => v.id === "dialup-mystic");
    if (chaos >= 72 && charm >= 62) return VIBES.find((v) => v.id === "glitch-couture");
    if (cosmic >= 68 && chaos < 60) return VIBES.find((v) => v.id === "productivity-haunting");
    if (staticStat >= 82) return VIBES.find((v) => v.id === "doomscroll-samurai");
    if (cosmic >= 78 && staticStat >= 70) return VIBES.find((v) => v.id === "haunted-hotspot");
    if (chaos >= 64 && staticStat >= 72 && charm < 62) return VIBES.find((v) => v.id === "midnight-committee");
    if (charm >= 72 && staticStat >= 58 && chaos < 70) return VIBES.find((v) => v.id === "gilded-buffer");
    if (charm >= 74 && cosmic < 56) return VIBES.find((v) => v.id === "lofi-tycoon");
    if (staticStat >= 64 && cosmic >= 62) return VIBES.find((v) => v.id === "chrome-tab-romantic");
    if (chaos >= 68 && cosmic >= 72) return VIBES.find((v) => v.id === "ritual-reboot");
    return rand(VIBES);
}

export function scoreAnswers(answers) {
    const n = QUESTIONS.length;
    const totals = { chaos: 0, charm: 0, cosmic: 0, static: 0 };
    const list = Array.isArray(answers) ? answers : [];

    for (let i = 0; i < n; i++) {
        const opt = resolveOption(list[i], i);
        if (!opt) continue;
        totals.chaos += Number(opt.chaos) || 0;
        totals.charm += Number(opt.charm) || 0;
        totals.cosmic += Number(opt.cosmic) || 0;
        totals.static += Number(opt.static) || 0;
    }

    const stats = {
        chaos: clamp100(totals.chaos / n),
        charm: clamp100(totals.charm / n),
        cosmic: clamp100(totals.cosmic / n),
        static: clamp100(totals.static / n),
    };

    return { stats, vibe: pickVibe(stats) };
}

export function createScanResult(answers, now = new Date()) {
    const { stats, vibe } = scoreAnswers(answers);
    return {
        ...vibe,
        stats,
        reportId: String(Math.floor(Math.random() * 999999)).padStart(6, "0"),
        generatedAt: now.toISOString(),
    };
}

function utf8ToBase64Url(str) {
    let b64;
    if (typeof Buffer !== "undefined") {
        b64 = Buffer.from(str, "utf8").toString("base64");
    } else {
        b64 = btoa(unescape(encodeURIComponent(str)));
    }
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToUtf8(token) {
    const padded = String(token).replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (String(token).length % 4)) % 4);
    if (typeof Buffer !== "undefined") {
        return Buffer.from(padded, "base64").toString("utf8");
    }
    return decodeURIComponent(escape(atob(padded)));
}

function normalizeStats(stats) {
    return {
        chaos: clamp100(stats && stats.chaos),
        charm: clamp100(stats && stats.charm),
        cosmic: clamp100(stats && stats.cosmic),
        static: clamp100(stats && stats.static),
    };
}

export function encodeResult(result) {
    const payload = {
        id: result.id,
        stats: result.stats,
        reportId: result.reportId || "000000",
        generatedAt: result.generatedAt || new Date().toISOString(),
    };
    return utf8ToBase64Url(JSON.stringify(payload));
}

export function decodeResult(token) {
    if (!token || typeof token !== "string") return null;
    try {
        const cleaned = token.replace(/^.*vibe=/, "").split("&")[0].split("#")[0];
        const payload = JSON.parse(base64UrlToUtf8(cleaned));
        const vibe = VIBES.find((v) => v.id === payload.id);
        if (!vibe || !payload.stats) return null;
        return {
            ...vibe,
            stats: normalizeStats(payload.stats),
            reportId: payload.reportId || "000000",
            generatedAt: payload.generatedAt || new Date().toISOString(),
        };
    } catch {
        return null;
    }
}

export function encodeQuery(result) {
    const p = new URLSearchParams();
    p.set("vibe", result.id);
    p.set("c", String(result.stats.chaos));
    p.set("h", String(result.stats.charm));
    p.set("o", String(result.stats.cosmic));
    p.set("s", String(result.stats.static));
    p.set("id", result.reportId || "000000");
    return p.toString();
}

export function decodeQuery(search) {
    if (search == null || search === "") return null;
    try {
        const q = new URLSearchParams(String(search).replace(/^\?/, ""));
        const id = q.get("vibe");
        if (!id) return null;
        const known = VIBES.find((v) => v.id === id);
        if (!known) return decodeResult(id);
        if (q.get("c") == null) return null;
        return {
            ...known,
            stats: normalizeStats({
                chaos: q.get("c"),
                charm: q.get("h"),
                cosmic: q.get("o"),
                static: q.get("s"),
            }),
            reportId: q.get("id") || "000000",
            generatedAt: q.get("t") || new Date().toISOString(),
        };
    } catch {
        return null;
    }
}

export function parseShareLocation(search = "", hash = "") {
    if (hash && String(hash).includes("vibe=")) {
        const token = String(hash).split("vibe=")[1].split("&")[0];
        const fromHash = decodeResult(token);
        if (fromHash) return fromHash;
    }
    if (search) {
        const fromQuery = decodeQuery(search);
        if (fromQuery) return fromQuery;
    }
    return null;
}

export function evaluateUnlocks({
    achievements = [],
    scanCount = 0,
    seenVibes = [],
    stats = null,
    elapsedMs = null,
    flags = {},
} = {}) {
    const have = new Set(achievements);
    const freshly = [];
    const unlock = (id) => {
        if (!have.has(id)) {
            have.add(id);
            freshly.push(id);
        }
    };

    if (scanCount >= 1) unlock("first");
    if (scanCount >= 3) unlock("trio");
    if (scanCount >= 10) unlock("ten");
    if (stats && stats.static >= 70) unlock("static");
    if (stats && stats.cosmic >= 70) unlock("cosmic");
    if (seenVibes.length >= 5) unlock("explorer");
    if (elapsedMs != null && elapsedMs < 15000) unlock("speedrun");
    if (flags.konami) unlock("konami");
    if (flags.rave) unlock("rave");
    if (flags.cube) unlock("cube");

    return { achievements: [...have], freshly };
}
