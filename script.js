/* VIBE CHECK 9000™ -- entirely unserious cyberpunk diagnostics. */

const REPO_URL = "https://github.com/Sebby1770/vibe-check-9000";
const LIVE_URL = "https://sebby1770.github.io/vibe-check-9000/";

const QUESTIONS = [
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
];

const VIBES = [
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
];

const ACHIEVEMENTS = [
    { id: "first", icon: "◎", name: "FIRST SCAN", desc: "completed your first diagnostic" },
    { id: "trio", icon: "△", name: "TRIPLE BUFFER", desc: "scanned 3 times" },
    { id: "ten", icon: "◇", name: "VIBE VETERAN", desc: "scanned 10 times" },
    { id: "konami", icon: "⌁", name: "RETRO SIGNAL", desc: "entered the old code" },
    { id: "rave", icon: "✦", name: "RAVE MODE", desc: "activated chroma overload" },
    { id: "cube", icon: "◈", name: "CUBE WITNESS", desc: "pressed the forbidden geometry" },
    { id: "static", icon: "▣", name: "STATIC ROYALTY", desc: "max static stat" },
    { id: "cosmic", icon: "✺", name: "COSMIC RECEIPT", desc: "max cosmic stat" },
];

const SIGNATURE_ITEMS = [
    "a glowing receipt", "a cracked metro card", "a password reset email",
    "a pen that writes only threats", "a tiny backup battery", "a badge marked TEMPORARY",
    "a synthwave umbrella", "a receipt for one mysterious cable", "a velvet folder of screenshots",
];

const PAIRINGS = [
    "someone who labels every cable", "a practical person with neon taste",
    "a spreadsheet wizard with good boundaries", "the friend who brings backup chargers",
    "a calm engineer", "someone who laughs before the punchline",
    "a strategist with dramatic lighting", "a person who knows your coffee order",
    "future you, but hydrated",
];

const AVOIDS = [
    "fluorescent sincerity", "automatic updates before coffee",
    "shared folders named misc", "optimistic deadlines after midnight",
    "meetings that could be a shrug", "comment sections",
    "apps that ask for notifications immediately", "keyboards with sticky spacebars",
];

const PROPHECIES = [
    "your next notification will be personal",
    "an old note will become useful at the funniest possible moment",
    "you will solve a problem by renaming it",
    "a tiny inconvenience will reveal excellent gossip",
    "the thing you keep postponing will take eight minutes",
    "do not trust the first search result tomorrow",
    "your next good idea arrives while doing something unrelated",
];

let state = {
    answers: [],
    qIndex: 0,
    totals: { chaos: 0, charm: 0, cosmic: 0, static: 0 },
    history: JSON.parse(localStorage.getItem("vibeHistory") || "[]"),
    scanCount: Number.parseInt(localStorage.getItem("vibeScanCount") || "0", 10),
    achievements: JSON.parse(localStorage.getItem("vibeAchievements") || "[]"),
    currentResult: null,
};

const $ = (id) => document.getElementById(id);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function toast(msg, color) {
    const t = $("toast");
    t.textContent = msg;
    t.style.background = color || "var(--green)";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2400);
}

function unlock(id) {
    if (!state.achievements.includes(id)) {
        state.achievements.push(id);
        localStorage.setItem("vibeAchievements", JSON.stringify(state.achievements));
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (ach) toast(`UNLOCKED: ${ach.name}`, "#fff700");
    }
}

const canvas = $("particles");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = 0.25 + Math.random() * 1.15;
        this.size = Math.random() * 2.2 + 0.4;
        this.color = rand(["#ff00ff", "#00fff7", "#39ff14", "#fff700"]);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > canvas.height + 20) this.reset();
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 14;
        ctx.shadowColor = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

function initParticles() {
    resizeCanvas();
    particles = Array.from({ length: 72 }, () => new Particle());
    animateParticles();
}

function updatePing() {
    const symbols = ["∞", "404", "0", "NaN", "12", "vibes", "yes", "NO", "0.04"];
    $("pingValue").textContent = rand(symbols);
}

async function startScan() {
    resetRun();
    $("hero").classList.add("hidden");
    $("result").classList.add("hidden");
    $("scanner").classList.remove("hidden");
    await runScanIntro();
    $("scanner").classList.add("hidden");
    $("questions").classList.remove("hidden");
    showQuestion();
}

async function runScanIntro() {
    const messages = [
        "> opening neon aperture...",
        "> calibrating forehead telemetry...",
        "> decrypting tiny bad decisions...",
        "> sampling pocket static...",
        "> asking spreadsheet for permission...",
        "> converting vibes to legally distinct numbers...",
        "> scan ready.",
    ];
    await runLog(messages, 390);
}

async function runLog(messages, delay) {
    const log = $("scanLog");
    const bar = $("scanBar");
    const prog = $("scanProgress");
    log.innerHTML = "";
    bar.style.width = "0%";
    prog.textContent = "0%";

    for (let i = 0; i < messages.length; i++) {
        const line = document.createElement("div");
        line.textContent = messages[i];
        log.appendChild(line);
        const pct = Math.round(((i + 1) / messages.length) * 100);
        bar.style.width = `${pct}%`;
        prog.textContent = `${pct}%`;
        await sleep(delay);
    }
}

function showQuestion() {
    const q = QUESTIONS[state.qIndex];
    $("qNum").textContent = state.qIndex + 1;
    $("qTotal").textContent = QUESTIONS.length;
    $("qBar").style.width = `${(state.qIndex / QUESTIONS.length) * 100}%`;
    $("qPrompt").textContent = q.prompt;

    const opts = $("qOptions");
    opts.innerHTML = "";
    [...q.opts].sort(() => Math.random() - 0.5).forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "q-option";
        btn.type = "button";
        btn.textContent = opt.text;
        btn.style.animationDelay = `${i * 70}ms`;
        btn.addEventListener("click", () => answer(opt));
        opts.appendChild(btn);
    });
}

function answer(opt) {
    state.answers.push(opt);
    state.totals.chaos += opt.chaos;
    state.totals.charm += opt.charm;
    state.totals.cosmic += opt.cosmic;
    state.totals.static += opt.static;
    state.qIndex++;

    if (state.qIndex < QUESTIONS.length) {
        showQuestion();
    } else {
        finishScan();
    }
}

async function finishScan() {
    $("qBar").style.width = "100%";
    $("questions").classList.add("hidden");
    $("scanner").classList.remove("hidden");

    await runLog([
        "> compiling your chaos signature...",
        "> adding unnecessary confidence intervals...",
        "> formatting result as emotional firmware...",
        "> finalizing diagnosis...",
    ], 480);

    await sleep(280);
    $("scanner").classList.add("hidden");
    const result = computeResult();
    showResult(result, { save: true });
}

function computeResult() {
    const max = QUESTIONS.length * 100;
    const stats = {
        chaos: Math.round((state.totals.chaos / max) * 100),
        charm: Math.round((state.totals.charm / max) * 100),
        cosmic: Math.round((state.totals.cosmic / max) * 100),
        static: Math.round((state.totals.static / max) * 100),
    };
    const vibe = pickVibe(stats);
    const reportId = String(Math.floor(Math.random() * 999999)).padStart(6, "0");

    return {
        ...vibe,
        stats,
        reportId,
        generatedAt: new Date().toISOString(),
    };
}

function pickVibe(stats) {
    const { chaos, charm, cosmic, static: staticStat } = stats;

    if (staticStat >= 76 && chaos >= 72) return VIBES.find((v) => v.id === "premium-static");
    if (cosmic >= 76 && charm < 58) return VIBES.find((v) => v.id === "neon-oracle");
    if (chaos >= 80 && charm >= 68) return VIBES.find((v) => v.id === "executive-chaos");
    if (charm >= 78 && chaos < 58) return VIBES.find((v) => v.id === "soft-launch");
    if (cosmic >= 76 && staticStat < 56) return VIBES.find((v) => v.id === "dialup-mystic");
    if (chaos >= 72 && charm >= 62) return VIBES.find((v) => v.id === "glitch-couture");
    if (cosmic >= 68 && chaos < 60) return VIBES.find((v) => v.id === "productivity-haunting");
    if (staticStat >= 82) return VIBES.find((v) => v.id === "doomscroll-samurai");
    if (charm >= 74 && cosmic < 56) return VIBES.find((v) => v.id === "lofi-tycoon");
    if (staticStat >= 64 && cosmic >= 62) return VIBES.find((v) => v.id === "chrome-tab-romantic");
    if (chaos >= 68 && cosmic >= 72) return VIBES.find((v) => v.id === "ritual-reboot");
    return rand(VIBES);
}

function showResult(result, options = {}) {
    state.currentResult = result;
    $("result").classList.remove("hidden");

    $("resultBadge").textContent = result.badge;
    $("resultTitle").textContent = result.title;
    $("resultDesc").textContent = result.desc;
    $("signatureItem").textContent = result.item || rand(SIGNATURE_ITEMS);
    $("vibeColor").textContent = result.color;
    $("vibeColor").style.color = result.color;
    $("vibeColor").style.borderColor = result.color;
    $("vibePair").textContent = result.pair || rand(PAIRINGS);
    $("vibeAvoid").textContent = result.avoid || rand(AVOIDS);
    $("vibeProphecy").textContent = result.prophecy || rand(PROPHECIES);
    $("reportId").textContent = result.reportId || "000000";
    $("reportDate").textContent = new Date(result.generatedAt || Date.now()).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

    setTimeout(() => updateStatBars(result.stats), 150);
    $("compatPercent").textContent = `${60 + Math.floor(Math.random() * 40)}%`;
    $("compatName").textContent = rand(PAIRINGS);
    $("shareUrl").textContent = getShareUrl(result);

    if (options.save) {
        state.scanCount++;
        state.history.unshift({
            title: result.title,
            badge: result.badge,
            date: new Date(result.generatedAt).toLocaleDateString(),
        });
        state.history = state.history.slice(0, 5);
        localStorage.setItem("vibeHistory", JSON.stringify(state.history));
        localStorage.setItem("vibeScanCount", String(state.scanCount));

        unlock("first");
        if (state.scanCount >= 3) unlock("trio");
        if (state.scanCount >= 10) unlock("ten");
        if (result.stats.static >= 70) unlock("static");
        if (result.stats.cosmic >= 70) unlock("cosmic");
        confettiBurst();
    }

    renderHistory();
    renderAchievements();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStatBars(stats) {
    [
        ["Chaos", stats.chaos],
        ["Charm", stats.charm],
        ["Cosmic", stats.cosmic],
        ["Static", stats.static],
    ].forEach(([name, value]) => {
        $(`stat${name}`).style.width = `${value}%`;
        $(`stat${name}Val`).textContent = `${value}%`;
    });
}

function resetRun() {
    state.answers = [];
    state.qIndex = 0;
    state.totals = { chaos: 0, charm: 0, cosmic: 0, static: 0 };
    state.currentResult = null;
    updateStatBars({ chaos: 0, charm: 0, cosmic: 0, static: 0 });
    $("shareUrl").textContent = "complete scan to generate link";
}

function getShareUrl(result) {
    const payload = {
        id: result.id,
        stats: result.stats,
        reportId: result.reportId,
        generatedAt: result.generatedAt,
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    const base = location.protocol === "file:" ? LIVE_URL : location.origin + location.pathname;
    return `${base}#vibe=${encoded}`;
}

function readSharedResult() {
    if (!location.hash.startsWith("#vibe=")) return null;
    try {
        const encoded = location.hash.replace("#vibe=", "").replace(/-/g, "+").replace(/_/g, "/");
        const padded = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);
        const payload = JSON.parse(decodeURIComponent(escape(atob(padded))));
        const vibe = VIBES.find((v) => v.id === payload.id);
        if (!vibe || !payload.stats) return null;
        return {
            ...vibe,
            stats: payload.stats,
            reportId: payload.reportId || "000000",
            generatedAt: payload.generatedAt || new Date().toISOString(),
        };
    } catch (error) {
        console.warn("Could not parse shared vibe", error);
        return null;
    }
}

function renderHistory() {
    const list = $("historyList");
    if (!state.history.length) {
        list.innerHTML = '<li class="empty">no prior vibes detected</li>';
        return;
    }
    list.innerHTML = state.history.map((h) =>
        `<li><span class="vibe-name">${h.badge || "VX"} ${h.title}</span><span>${h.date}</span></li>`
    ).join("");
}

function renderAchievements() {
    $("achList").innerHTML = ACHIEVEMENTS.map((a) => {
        const unlocked = state.achievements.includes(a.id);
        return `<div class="ach ${unlocked ? "unlocked" : ""}" title="${a.name}: ${a.desc}">${unlocked ? a.icon : "?"}</div>`;
    }).join("");
}

async function shareCurrentResult() {
    if (!state.currentResult) {
        toast("RUN A SCAN FIRST");
        return;
    }

    const url = getShareUrl(state.currentResult);
    const text = `VIBE CHECK 9000™ diagnosed me as: ${state.currentResult.title}. ${state.currentResult.desc}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `My vibe: ${state.currentResult.title}`,
                text,
                url,
            });
            return;
        } catch (error) {
            if (error.name === "AbortError") return;
        }
    }

    await copyText(`${text}\n${url}`, "RESULT COPIED TO CLIPBOARD");
}

async function copyText(text, message) {
    try {
        await navigator.clipboard.writeText(text);
        toast(message || "COPIED");
    } catch (error) {
        toast("COPY FAILED. THE TERMINAL IS BEING DRAMATIC", "#ff2e63");
    }
}

function saveResultPng() {
    if (!state.currentResult) {
        toast("RUN A SCAN FIRST");
        return;
    }

    const result = state.currentResult;
    const card = document.createElement("canvas");
    const width = 1200;
    const height = 675;
    card.width = width;
    card.height = height;
    const c = card.getContext("2d");

    const gradient = c.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#07020d");
    gradient.addColorStop(0.48, "#18052e");
    gradient.addColorStop(1, "#001f2f");
    c.fillStyle = gradient;
    c.fillRect(0, 0, width, height);

    c.strokeStyle = "rgba(0, 255, 247, 0.22)";
    c.lineWidth = 1;
    for (let x = 0; x < width; x += 42) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, height);
        c.stroke();
    }
    for (let y = 0; y < height; y += 42) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(width, y);
        c.stroke();
    }

    c.strokeStyle = result.color;
    c.lineWidth = 6;
    c.strokeRect(50, 45, width - 100, height - 90);
    c.strokeStyle = "#00fff7";
    c.lineWidth = 2;
    c.strokeRect(70, 65, width - 140, height - 130);

    c.fillStyle = result.color;
    c.font = "900 84px Orbitron, monospace";
    c.textAlign = "center";
    c.fillText(result.badge, width / 2, 155);

    c.fillStyle = "#e0e0ff";
    c.font = "700 30px Orbitron, monospace";
    c.fillText("VIBE CHECK 9000™ DIAGNOSIS", width / 2, 210);

    c.fillStyle = "#39ff14";
    c.font = "900 52px Orbitron, monospace";
    wrapCanvasText(c, result.title, width / 2, 285, 940, 58, "center");

    c.fillStyle = "#e0e0ff";
    c.font = "24px Space Mono, monospace";
    wrapCanvasText(c, result.desc, width / 2, 390, 880, 34, "center");

    const stats = [
        ["CHAOS", result.stats.chaos],
        ["CHARM", result.stats.charm],
        ["COSMIC", result.stats.cosmic],
        ["STATIC", result.stats.static],
    ];
    stats.forEach(([label, value], index) => {
        const x = 170 + index * 225;
        c.fillStyle = "#00fff7";
        c.font = "700 20px Space Mono, monospace";
        c.fillText(label, x, 545);
        c.strokeStyle = "rgba(0, 255, 247, 0.55)";
        c.strokeRect(x - 75, 565, 150, 16);
        c.fillStyle = result.color;
        c.fillRect(x - 75, 565, 1.5 * value, 16);
        c.fillStyle = "#fff700";
        c.font = "700 22px Space Mono, monospace";
        c.fillText(`${value}%`, x, 617);
    });

    c.fillStyle = "#6e6c8b";
    c.font = "18px Space Mono, monospace";
    c.fillText(REPO_URL, width / 2, 648);

    const a = document.createElement("a");
    a.href = card.toDataURL("image/png");
    a.download = `vibe-check-${result.id}-${Date.now()}.png`;
    a.click();
    toast("PNG REPORT DOWNLOADED");
}

function wrapCanvasText(ctx2d, text, x, y, maxWidth, lineHeight, align = "left") {
    const words = text.split(" ");
    let line = "";
    ctx2d.textAlign = align;

    for (let n = 0; n < words.length; n++) {
        const testLine = `${line}${words[n]} `;
        if (ctx2d.measureText(testLine).width > maxWidth && n > 0) {
            ctx2d.fillText(line.trim(), x, y);
            line = `${words[n]} `;
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx2d.fillText(line.trim(), x, y);
}

function confettiBurst() {
    const colors = ["#ff00ff", "#00fff7", "#39ff14", "#fff700", "#ff2e63"];
    for (let i = 0; i < 54; i++) {
        const conf = document.createElement("div");
        conf.className = "confetti";
        conf.style.background = rand(colors);
        document.body.appendChild(conf);
        const angle = Math.random() * Math.PI * 2;
        const vel = 180 + Math.random() * 410;
        const dx = Math.cos(angle) * vel;
        const dy = Math.sin(angle) * vel;
        conf.animate([
            { transform: "translate(-50%, -50%) rotate(0deg)", opacity: 1 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(720deg)`, opacity: 0 },
        ], {
            duration: 1200 + Math.random() * 900,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        });
        setTimeout(() => conf.remove(), 2200);
    }
}

const MODAL_CONTENT = {
    about: `
        <p><strong>VIBE CHECK 9000™</strong> is a cyberpunk personality scanner with more confidence than evidence.</p>
        <p>It asks six absurd questions, turns your answers into four neon stats, then prints a diagnosis with the dignity of a hacked vending machine.</p>
        <p>Built by <a href="${REPO_URL}" target="_blank" rel="noreferrer">Sebby1770 on GitHub</a>.</p>
    `,
    science: `
        <p><strong>THE METHODOLOGY:</strong></p>
        <p>1. Ask questions with suspiciously specific answers.</p>
        <p>2. Score four stats: <strong>CHAOS, CHARM, COSMIC, STATIC</strong>.</p>
        <p>3. Run a proprietary algorithm, also known as JavaScript with feelings.</p>
        <p>4. Generate a share link and PNG report so the result can follow you online.</p>
    `,
    legal: `
        <p><strong>TERMS OF VIBING:</strong></p>
        <p>Results are not valid in court, therapy, hiring, dating, banking, or interdimensional arbitration.</p>
        <p>Side effects may include: self-reflection, dramatic posture, mild giggling, and the urge to rename a project folder.</p>
        <p>Do not base life choices on this terminal. It is wearing sunglasses indoors.</p>
    `,
};

function wireEvents() {
    $("startBtn").addEventListener("click", startScan);
    $("rescanBtn").addEventListener("click", () => {
        resetRun();
        history.replaceState(null, "", location.pathname);
        $("result").classList.add("hidden");
        $("questions").classList.add("hidden");
        $("scanner").classList.add("hidden");
        $("hero").classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    $("shareBtn").addEventListener("click", shareCurrentResult);
    $("saveBtn").addEventListener("click", saveResultPng);
    $("copyLinkBtn").addEventListener("click", () => {
        if (!state.currentResult) {
            toast("RUN A SCAN FIRST");
            return;
        }
        copyText(getShareUrl(state.currentResult), "RESULT LINK COPIED");
    });

    document.querySelectorAll("[data-modal]").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            $("modalTitle").textContent = link.dataset.modal;
            $("modalBody").innerHTML = MODAL_CONTENT[link.dataset.modal];
            $("modalBg").classList.add("active");
        });
    });

    $("modalClose").addEventListener("click", () => $("modalBg").classList.remove("active"));
    $("modalBg").addEventListener("click", (e) => {
        if (e.target === $("modalBg")) $("modalBg").classList.remove("active");
    });

    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let konamiIdx = 0;
    let typedBuffer = "";

    window.addEventListener("keydown", (e) => {
        if (e.key === KONAMI[konamiIdx]) {
            konamiIdx++;
            if (konamiIdx === KONAMI.length) {
                unlock("konami");
                unlock("rave");
                document.body.classList.toggle("rave");
                toast("RAVE MODE: ENGAGED", "#ff00ff");
                $("secretCube").classList.add("show");
                konamiIdx = 0;
            }
        } else {
            konamiIdx = 0;
        }

        if (e.key.length === 1) {
            typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-10);
            if (typedBuffer.endsWith("vibe")) {
                toast("VIBES DETECTED", "#39ff14");
                confettiBurst();
            }
            if (typedBuffer.endsWith("static")) {
                toast("STATIC APPROVES", "#00fff7");
                document.body.classList.add("rave");
                setTimeout(() => document.body.classList.remove("rave"), 1800);
            }
        }
    });

    $("secretCube").addEventListener("click", () => {
        unlock("cube");
        toast("FORBIDDEN GEOMETRY ACKNOWLEDGED", "#fff700");
        confettiBurst();
    });

    window.addEventListener("resize", resizeCanvas);
}

function rotateStatus() {
    const statuses = [
        "NEON VIBE SCANNER ONLINE",
        "STATIC SUBSYSTEMS NOMINAL",
        "SPREADSHEET: TOO POWERFUL",
        "AURA CACHE: WARM",
        "DRAMA FILTER: PARTIALLY ENABLED",
        "SINCERITY LEVELS: SUSPICIOUS",
    ];
    let statusIdx = 0;
    setInterval(() => {
        statusIdx = (statusIdx + 1) % statuses.length;
        $("systemStatus").textContent = statuses[statusIdx];
    }, 4000);
}

function init() {
    initParticles();
    wireEvents();
    renderHistory();
    renderAchievements();
    updatePing();
    setInterval(updatePing, 1500);
    rotateStatus();

    const shared = readSharedResult();
    if (shared) {
        $("hero").classList.add("hidden");
        showResult(shared, { save: false });
        toast("SHARED VIBE LOADED");
    }

    console.log(
        "%c VIBE CHECK 9000™ ",
        "background: linear-gradient(90deg, #ff00ff, #00fff7); color: #000; font-size: 24px; font-weight: 900; padding: 8px 16px;"
    );
    console.log("%cTerminal opened. Vibe confidence increasing.", "color: #39ff14; font-size: 14px;");
    console.log("%cTry typing 'vibe' or the classic old code.", "color: #00fff7; font-style: italic;");
}

init();
