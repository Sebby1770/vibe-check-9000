/* ===========================================
   VIBE CHECK 9000™ — JAVASCRIPT
   absolutely scientific. trust me.
   =========================================== */

// ====== DATA: VIBE QUESTIONS ======
const QUESTIONS = [
    {
        prompt: "It's 3:47 AM. You are awake. WHY?",
        opts: [
            { text: "thinking about a conversation from 2014", chaos: 30, charisma: 20, cosmic: 70, raccoon: 40 },
            { text: "watching a documentary about ducks", chaos: 10, charisma: 50, cosmic: 30, raccoon: 90 },
            { text: "spiraling, but make it fashion", chaos: 80, charisma: 60, cosmic: 80, raccoon: 50 },
            { text: "the cat needed me", chaos: 5, charisma: 90, cosmic: 40, raccoon: 30 },
            { text: "i refuse to acknowledge time", chaos: 95, charisma: 70, cosmic: 99, raccoon: 60 },
        ],
    },
    {
        prompt: "Pick your weapon of mass distraction:",
        opts: [
            { text: "an unread group chat with 47 messages", chaos: 90, charisma: 30, cosmic: 20, raccoon: 60 },
            { text: "a podcast at 1.75x speed", chaos: 50, charisma: 80, cosmic: 60, raccoon: 20 },
            { text: "reorganizing the sock drawer", chaos: 10, charisma: 40, cosmic: 50, raccoon: 70 },
            { text: "wikipedia → 'list of unusual deaths'", chaos: 70, charisma: 50, cosmic: 90, raccoon: 80 },
            { text: "staring at a wall (high effort)", chaos: 95, charisma: 99, cosmic: 99, raccoon: 95 },
        ],
    },
    {
        prompt: "A wizard offers you free knowledge of ONE thing. Choose:",
        opts: [
            { text: "what your dog actually thinks of you", chaos: 40, charisma: 70, cosmic: 30, raccoon: 80 },
            { text: "the exact moment you'll die", chaos: 99, charisma: 20, cosmic: 95, raccoon: 50 },
            { text: "every wifi password in a 5-mile radius", chaos: 60, charisma: 50, cosmic: 10, raccoon: 95 },
            { text: "the name of every bird", chaos: 20, charisma: 60, cosmic: 80, raccoon: 30 },
            { text: "i would punch the wizard", chaos: 95, charisma: 85, cosmic: 50, raccoon: 70 },
        ],
    },
    {
        prompt: "You find $20 on the ground. What now?",
        opts: [
            { text: "leave it. probably cursed", chaos: 50, charisma: 30, cosmic: 90, raccoon: 60 },
            { text: "buy 4 bags of dried mango", chaos: 30, charisma: 60, cosmic: 40, raccoon: 70 },
            { text: "donate it to a confused-looking bird", chaos: 70, charisma: 80, cosmic: 60, raccoon: 90 },
            { text: "frame it. memorialize the moment", chaos: 60, charisma: 50, cosmic: 70, raccoon: 30 },
            { text: "deeply suspicious. commence investigation", chaos: 80, charisma: 70, cosmic: 50, raccoon: 85 },
        ],
    },
    {
        prompt: "Honestly, what's your relationship with WATER?",
        opts: [
            { text: "drink it sometimes. usually under duress", chaos: 60, charisma: 40, cosmic: 30, raccoon: 70 },
            { text: "i am water. water is me. we are one", chaos: 90, charisma: 70, cosmic: 99, raccoon: 80 },
            { text: "exclusively flavored, never plain", chaos: 40, charisma: 80, cosmic: 50, raccoon: 30 },
            { text: "i have a designated water bottle. her name is gretchen", chaos: 50, charisma: 90, cosmic: 60, raccoon: 50 },
            { text: "it's fine. i am fine. everything is fine", chaos: 99, charisma: 20, cosmic: 70, raccoon: 60 },
        ],
    },
];

// ====== DATA: VIBE RESULTS ======
const VIBES = [
    {
        title: "FERAL BUT POLITE",
        emoji: "🦝",
        desc: "you contain multitudes. one of those multitudes is a raccoon in a tiny vest. you say 'sorry' to inanimate objects but would also fight a goose with no hesitation. people trust you, which is honestly their mistake.",
        animal: "a raccoon who reads philosophy",
        color: "#9D4EDD",
        pair: "someone with strong opinions about cheese",
        avoid: "open windows after 11 PM",
        prophecy: "you will accidentally adopt something within 3 weeks.",
    },
    {
        title: "COSMIC HORROR (THE CUTE KIND)",
        emoji: "👁️",
        desc: "you radiate the energy of an ancient deity who got reincarnated by mistake and is now just vibing in a tracksuit. you've been told you have 'a lot going on behind your eyes' and yes, you do, it's a small parade.",
        animal: "a moth that knows things",
        color: "#7209B7",
        pair: "anyone who has ever cried at a museum",
        avoid: "mirrors past midnight",
        prophecy: "the next stranger you talk to will ask you for life advice. give it.",
    },
    {
        title: "SOFT CHAOS GREMLIN",
        emoji: "🌪️",
        desc: "you're sweet. you're kind. you also have 14 unfinished projects, 3 untranslated tabs open, and you once tried to befriend a bee. people love you because they have to. (they don't have to.)",
        animal: "a hummingbird with five jobs",
        color: "#FF006E",
        pair: "a calm person who owns a label maker",
        avoid: "anything described as 'a quick errand'",
        prophecy: "you will lose, then find, then re-lose your keys this week.",
    },
    {
        title: "MAIN CHARACTER (DIRECT-TO-DVD)",
        emoji: "✨",
        desc: "you walk into a room and the music DOES change, just nobody else hears it. you've made eye contact with a pigeon and felt understood. you treat your daily routine like a montage and frankly we admire that.",
        animal: "a swan that thinks it's a cowboy",
        color: "#FFB703",
        pair: "the person filming you secretly",
        avoid: "casts who don't pull their weight",
        prophecy: "a small, perfect coincidence will occur thursday at 4 PM.",
    },
    {
        title: "CERTIFIED OLD SOUL™ (AGED 14)",
        emoji: "🕯️",
        desc: "you've been described as 'an 80-year-old in a young person's body' since you were 6. you own at least one ceramic thing. you make tea even when it's hot out. you say 'in my day' unironically. your day was last tuesday.",
        animal: "a tortoise with a podcast",
        color: "#588157",
        pair: "someone who knows what a doily is",
        avoid: "loud restaurants & fluorescent lighting",
        prophecy: "you will receive an email that ruins your monday.",
    },
    {
        title: "GLITCH IN THE SIMULATION",
        emoji: "👾",
        desc: "the universe coded you and immediately said 'wait that's not what i—'. you have weird specific knowledge about 3 things and zero general knowledge. you say things that sound like passwords. someone has definitely tried to put a hex on you (it failed).",
        animal: "a fox that owes someone money",
        color: "#00F5D4",
        pair: "another glitch (you'll know on sight)",
        avoid: "anywhere with 'good vibes only' signage",
        prophecy: "an electronic device will betray you. retaliate.",
    },
    {
        title: "EMOTIONALLY UNAVAILABLE STARSEED",
        emoji: "🌌",
        desc: "you said 'i'm fine' and meant it as a complete philosophical position. you stargaze but don't know any constellations. your love language is forwarding articles. you've ghosted approximately 7 people and 1 plant.",
        animal: "a cat in a cardboard spaceship",
        color: "#3A0CA3",
        pair: "someone equally damaged but in a different way",
        avoid: "anyone who asks 'how do you feel about that?'",
        prophecy: "you will reread an old text and feel something. survive it.",
    },
    {
        title: "CRACKED-OUT GOLDEN RETRIEVER",
        emoji: "🐕",
        desc: "you have the energy of seven puppies who saw a squirrel. you say 'WAIT WHAT' approximately 40 times a day. you can be friends with literally anyone but only remember 12% of them. you are objectively delightful and a public hazard.",
        animal: "a labrador on espresso",
        color: "#F77F00",
        pair: "someone with calmer brain chemistry",
        avoid: "decisions, naps, schedules",
        prophecy: "you will say yes to plans you cannot afford. go anyway.",
    },
    {
        title: "VAGUELY HAUNTED",
        emoji: "🕸️",
        desc: "your aura test came back as a question mark. plants either thrive in your presence or immediately die, no in-between. you have a recurring dream about a hallway. ghosts find you slightly intimidating. you should probably look into that.",
        animal: "a black cat with a grudge",
        color: "#240046",
        pair: "another haunted person (less haunted than you)",
        avoid: "antique stores you 'just want to look at'",
        prophecy: "an object you forgot you owned will reappear meaningfully.",
    },
    {
        title: "DIET COWBOY",
        emoji: "🤠",
        desc: "you walk like you've got somewhere to be (you don't). you say 'partner' platonically. you've never ridden a horse but you think about it. your main personality trait is squinting. honestly, we respect the commitment.",
        animal: "a tumbleweed with ambitions",
        color: "#BC6C25",
        pair: "another diet cowboy or a barista",
        avoid: "humid weather, sincere conversations",
        prophecy: "you will misplace your hat metaphorically. find it literally.",
    },
    {
        title: "OVERCAFFEINATED ORACLE",
        emoji: "🔮",
        desc: "you've predicted approximately 3 things correctly and you will not let anyone forget. you give advice like prophecy. you talk too fast when excited. you've seen something in a dream that you refuse to elaborate on. that's fine. we trust you.",
        animal: "an owl with espresso and trauma",
        color: "#E63946",
        pair: "a skeptic you can convert",
        avoid: "decaf, doubters, your ex",
        prophecy: "trust the next gut feeling. it's right. (the one after that is wrong.)",
    },
    {
        title: "RETIRED HIMBO",
        emoji: "💪",
        desc: "you used to be chaotic. now you're zen. but the chaos is in there, dormant, waiting. you're emotionally intelligent in a surprising way. you cry at car commercials. people tell you their secrets unprompted. you have a favorite mug.",
        animal: "a golden retriever doing yoga",
        color: "#06A77D",
        pair: "literally anyone, you're a catch",
        avoid: "anyone who mentions 'crypto'",
        prophecy: "you will give someone advice that genuinely changes their life.",
    },
];

const ACHIEVEMENTS = [
    { id: "first", icon: "🎯", name: "FIRST SCAN", desc: "completed your first vibe check" },
    { id: "trio", icon: "🔥", name: "TRIPLE THREAT", desc: "scanned 3 times" },
    { id: "ten", icon: "💯", name: "VIBE VETERAN", desc: "scanned 10 times" },
    { id: "konami", icon: "👾", name: "RETRO GAMER", desc: "↑↑↓↓←→←→BA" },
    { id: "rave", icon: "🪩", name: "RAVE MODE", desc: "found the secret rave" },
    { id: "duck", icon: "🦆", name: "DUCK DUCK GO", desc: "befriended the duck" },
    { id: "raccoon", icon: "🦝", name: "TRASH PANDA", desc: "max raccoon stat" },
    { id: "cosmic", icon: "🌌", name: "STAR CHILD", desc: "max cosmic stat" },
];

const SPIRIT_ANIMALS = [
    "a tired pigeon", "a cat with a job", "a swan with anxiety",
    "a goose who knows your sins", "a hamster CEO", "a moth attorney",
    "a ferret in a tuxedo", "a possum reading marx", "an otter with secrets",
    "a parakeet philosopher", "a llama who remembers",
];

const PAIRINGS = [
    "someone who texts back within reason", "an enthusiastic baker",
    "a person who owns a wok", "anyone who has cried at a sunset",
    "a calm engineer", "the third friend in the group chat",
    "someone who unironically gardens", "your past self, but rested",
    "another vaguely-haunted soul", "a person who knows your coffee order",
];

const AVOIDS = [
    "tuesdays", "mercury retrograde (it's always retrograde now)",
    "open windows during a full moon", "small talk in elevators",
    "any restaurant with menus longer than 3 pages",
    "people who clap when the plane lands", "your ex's new playlist",
    "fluorescent lighting", "decisions made before noon",
];

const PROPHECIES = [
    "you will receive a text that changes the day's trajectory",
    "an old hobby will resurface. pursue it",
    "the next thing you misplace was never yours",
    "a small mammal will judge you. accept it",
    "you'll laugh at something that isn't a joke",
    "a stranger will compliment something you forgot you were wearing",
    "the universe owes you something tiny. it's coming",
    "do not respond to the first email tomorrow until 11am",
];

// ====== STATE ======
let state = {
    answers: [],
    qIndex: 0,
    totals: { chaos: 0, charisma: 0, cosmic: 0, raccoon: 0 },
    history: JSON.parse(localStorage.getItem("vibeHistory") || "[]"),
    scanCount: parseInt(localStorage.getItem("vibeScanCount") || "0"),
    achievements: JSON.parse(localStorage.getItem("vibeAchievements") || "[]"),
};

// ====== HELPERS ======
const $ = (id) => document.getElementById(id);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toast(msg, color) {
    const t = $("toast");
    t.textContent = msg;
    if (color) t.style.background = color;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2400);
}

function unlock(id) {
    if (!state.achievements.includes(id)) {
        state.achievements.push(id);
        localStorage.setItem("vibeAchievements", JSON.stringify(state.achievements));
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (ach) toast(`🏆 UNLOCKED: ${ach.name}`, "#fff700");
    }
}

// ====== PARTICLES ======
const canvas = $("particles");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = 0.3 + Math.random() * 1.2;
        this.size = Math.random() * 2 + 0.5;
        this.color = rand(["#ff00ff", "#00fff7", "#39ff14", "#fff700"]);
        this.life = 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > canvas.height) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 60; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ====== PING UPDATER ======
setInterval(() => {
    const symbols = ["∞", "404", "?", "0", "NaN", "🌚", "12", "vibes", "yes"];
    $("pingValue").textContent = rand(symbols);
}, 1500);

// ====== START SCAN ======
$("startBtn").addEventListener("click", async () => {
    $("hero").classList.add("hidden");
    $("scanner").classList.remove("hidden");
    await runScanIntro();
    $("scanner").classList.add("hidden");
    $("questions").classList.remove("hidden");
    showQuestion();
});

async function runScanIntro() {
    const log = $("scanLog");
    const bar = $("scanBar");
    const prog = $("scanProgress");
    const messages = [
        "> initializing quantum chakras...",
        "> calibrating raccoon sensors...",
        "> aligning mercury (it's microwave)...",
        "> consulting 3 disappointed astrologers...",
        "> defrosting cosmic energies...",
        "> please remain very still...",
        "> just kidding, move around a bit...",
        "> scan ready.",
    ];
    log.innerHTML = "";
    for (let i = 0; i < messages.length; i++) {
        const line = document.createElement("div");
        line.textContent = messages[i];
        log.appendChild(line);
        const pct = Math.round(((i + 1) / messages.length) * 100);
        bar.style.width = pct + "%";
        prog.textContent = pct + "%";
        await sleep(420);
    }
    await sleep(500);
}

// ====== QUESTIONS ======
function showQuestion() {
    const q = QUESTIONS[state.qIndex];
    $("qNum").textContent = state.qIndex + 1;
    $("qTotal").textContent = QUESTIONS.length;
    $("qBar").style.width = ((state.qIndex / QUESTIONS.length) * 100) + "%";
    $("qPrompt").textContent = q.prompt;

    const opts = $("qOptions");
    opts.innerHTML = "";

    // shuffle for variety
    const shuffled = [...q.opts].sort(() => Math.random() - 0.5);
    shuffled.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "q-option";
        btn.textContent = opt.text;
        btn.style.animationDelay = (i * 80) + "ms";
        btn.style.animation = "fadein 0.5s both";
        btn.addEventListener("click", () => answer(opt));
        opts.appendChild(btn);
    });
}

function answer(opt) {
    state.answers.push(opt);
    state.totals.chaos += opt.chaos;
    state.totals.charisma += opt.charisma;
    state.totals.cosmic += opt.cosmic;
    state.totals.raccoon += opt.raccoon;
    state.qIndex++;

    if (state.qIndex < QUESTIONS.length) {
        showQuestion();
    } else {
        finishScan();
    }
}

// ====== FINISH SCAN ======
async function finishScan() {
    $("qBar").style.width = "100%";
    $("questions").classList.add("hidden");
    $("scanner").classList.remove("hidden");

    const log = $("scanLog");
    log.innerHTML = "";
    const bar = $("scanBar");
    const prog = $("scanProgress");

    const messages = [
        "> processing your chaos signature...",
        "> running data through a goose...",
        "> consulting the great spreadsheet...",
        "> finalizing diagnosis...",
    ];
    bar.style.width = "0%";
    for (let i = 0; i < messages.length; i++) {
        const line = document.createElement("div");
        line.textContent = messages[i];
        log.appendChild(line);
        bar.style.width = (((i + 1) / messages.length) * 100) + "%";
        prog.textContent = Math.round(((i + 1) / messages.length) * 100) + "%";
        await sleep(500);
    }
    await sleep(300);
    $("scanner").classList.add("hidden");
    showResult();
}

// ====== RESULT ======
function showResult() {
    $("result").classList.remove("hidden");

    const total = QUESTIONS.length * 100;
    const chaos = Math.round((state.totals.chaos / total) * 100);
    const charisma = Math.round((state.totals.charisma / total) * 100);
    const cosmic = Math.round((state.totals.cosmic / total) * 100);
    const raccoon = Math.round((state.totals.raccoon / total) * 100);

    // pick vibe based on dominant stats
    const stats = [
        { name: "chaos", val: chaos },
        { name: "charisma", val: charisma },
        { name: "cosmic", val: cosmic },
        { name: "raccoon", val: raccoon },
    ];
    stats.sort((a, b) => b.val - a.val);
    const dominant = stats[0].name;

    // pick vibe randomly weighted by dominant stat
    const vibe = pickVibe(dominant, chaos, charisma, cosmic, raccoon);

    $("resultEmoji").textContent = vibe.emoji;
    $("resultTitle").textContent = vibe.title;
    $("resultDesc").textContent = vibe.desc;
    $("spiritAnimal").textContent = vibe.animal || rand(SPIRIT_ANIMALS);
    $("vibeColor").textContent = vibe.color;
    $("vibeColor").style.color = vibe.color;
    $("vibeColor").style.borderColor = vibe.color;
    $("vibePair").textContent = vibe.pair || rand(PAIRINGS);
    $("vibeAvoid").textContent = vibe.avoid || rand(AVOIDS);
    $("vibeProphecy").textContent = vibe.prophecy || rand(PROPHECIES);

    $("reportId").textContent = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
    $("reportDate").textContent = new Date().toLocaleString("en-US", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
    });

    // animate stat bars
    setTimeout(() => {
        $("statChaos").style.width = chaos + "%";
        $("statCharisma").style.width = charisma + "%";
        $("statCosmic").style.width = cosmic + "%";
        $("statRaccoon").style.width = raccoon + "%";
        $("statChaosVal").textContent = chaos + "%";
        $("statCharismaVal").textContent = charisma + "%";
        $("statCosmicVal").textContent = cosmic + "%";
        $("statRaccoonVal").textContent = raccoon + "%";
    }, 200);

    // compatibility
    $("compatPercent").textContent = (60 + Math.floor(Math.random() * 40)) + "%";
    $("compatName").textContent = rand(PAIRINGS);

    // history
    state.scanCount++;
    state.history.unshift({
        title: vibe.title,
        emoji: vibe.emoji,
        date: new Date().toLocaleDateString(),
    });
    state.history = state.history.slice(0, 5);
    localStorage.setItem("vibeHistory", JSON.stringify(state.history));
    localStorage.setItem("vibeScanCount", String(state.scanCount));
    renderHistory();

    // achievements
    unlock("first");
    if (state.scanCount >= 3) unlock("trio");
    if (state.scanCount >= 10) unlock("ten");
    if (raccoon >= 70) unlock("raccoon");
    if (cosmic >= 70) unlock("cosmic");
    renderAchievements();

    // confetti burst
    confettiBurst();
}

function pickVibe(dominant, chaos, charisma, cosmic, raccoon) {
    // simple deterministic-ish picker based on stat profile
    if (raccoon > 70 && chaos > 50) return VIBES[0]; // FERAL BUT POLITE
    if (cosmic > 70 && charisma < 50) return VIBES[1]; // COSMIC HORROR
    if (chaos > 70 && charisma > 50) return VIBES[2]; // SOFT CHAOS GREMLIN
    if (charisma > 70 && cosmic < 50) return VIBES[3]; // MAIN CHARACTER
    if (cosmic > 60 && chaos < 40) return VIBES[4]; // OLD SOUL
    if (chaos > 80 && raccoon > 60) return VIBES[5]; // GLITCH
    if (cosmic > 60 && charisma < 40) return VIBES[6]; // EMOTIONALLY UNAVAILABLE STARSEED
    if (chaos > 60 && charisma > 70) return VIBES[7]; // CRACKED-OUT GOLDEN RETRIEVER
    if (cosmic > 50 && raccoon > 50) return VIBES[8]; // VAGUELY HAUNTED
    if (charisma > 50 && chaos < 50) return VIBES[9]; // DIET COWBOY
    if (cosmic > 70 && chaos > 60) return VIBES[10]; // OVERCAFFEINATED ORACLE
    if (charisma > 60) return VIBES[11]; // RETIRED HIMBO
    return rand(VIBES);
}

function renderHistory() {
    const list = $("historyList");
    if (!state.history.length) {
        list.innerHTML = '<li class="empty">no prior vibes detected</li>';
        return;
    }
    list.innerHTML = state.history.map((h) =>
        `<li><span class="vibe-name">${h.emoji} ${h.title}</span><span>${h.date}</span></li>`
    ).join("");
}

function renderAchievements() {
    const list = $("achList");
    list.innerHTML = ACHIEVEMENTS.map((a) => {
        const unlocked = state.achievements.includes(a.id);
        return `<div class="ach ${unlocked ? "unlocked" : ""}" title="${a.name}: ${a.desc}">${unlocked ? a.icon : "?"}</div>`;
    }).join("");
}

renderHistory();
renderAchievements();

// ====== ACTIONS ======
$("rescanBtn").addEventListener("click", () => {
    state.answers = [];
    state.qIndex = 0;
    state.totals = { chaos: 0, charisma: 0, cosmic: 0, raccoon: 0 };
    $("result").classList.add("hidden");
    $("hero").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

$("shareBtn").addEventListener("click", async () => {
    const title = $("resultTitle").textContent;
    const desc = $("resultDesc").textContent;
    const text = `MY VIBE: ${title}\n\n${desc}\n\nVIBE CHECK 9000™`;
    if (navigator.share) {
        try {
            await navigator.share({ title: "My Vibe", text });
        } catch (e) {}
    } else {
        try {
            await navigator.clipboard.writeText(text);
            toast("✓ COPIED TO CLIPBOARD");
        } catch (e) {
            toast("could not share. try yelling it instead");
        }
    }
});

$("saveBtn").addEventListener("click", () => {
    const card = $("resultCard");
    // simple "save" — copies a textual report
    const data = {
        title: $("resultTitle").textContent,
        desc: $("resultDesc").textContent,
        animal: $("spiritAnimal").textContent,
        prophecy: $("vibeProphecy").textContent,
        date: new Date().toLocaleString(),
    };
    const blob = new Blob(
        [`VIBE CHECK 9000™ — OFFICIAL REPORT\n\nVIBE: ${data.title}\n\n${data.desc}\n\nSPIRIT ANIMAL: ${data.animal}\nPROPHECY: ${data.prophecy}\n\nGENERATED: ${data.date}\n\nPATENT PENDING.`],
        { type: "text/plain" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vibe-report-${Date.now()}.txt`;
    a.click();
    toast("✓ REPORT DOWNLOADED");
});

// ====== CONFETTI ======
function confettiBurst() {
    const colors = ["#ff00ff", "#00fff7", "#39ff14", "#fff700", "#ff2e63"];
    for (let i = 0; i < 50; i++) {
        const conf = document.createElement("div");
        conf.style.cssText = `
            position: fixed;
            width: 8px; height: 8px;
            background: ${rand(colors)};
            top: 50%; left: 50%;
            pointer-events: none;
            z-index: 250;
            box-shadow: 0 0 8px currentColor;
        `;
        document.body.appendChild(conf);
        const angle = Math.random() * Math.PI * 2;
        const vel = 200 + Math.random() * 400;
        const dx = Math.cos(angle) * vel;
        const dy = Math.sin(angle) * vel;
        conf.animate(
            [
                { transform: "translate(-50%, -50%) rotate(0)", opacity: 1 },
                { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(720deg)`, opacity: 0 },
            ],
            { duration: 1200 + Math.random() * 800, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );
        setTimeout(() => conf.remove(), 2000);
    }
}

// ====== MODALS ======
const MODAL_CONTENT = {
    about: `
        <p><strong>VIBE CHECK 9000™</strong> is the world's most scientifically inaccurate vibe detection system.</p>
        <p>Our patented (it's not patented) algorithm cross-references your answers against a database of <strong>12,000 quantum chakras</strong>, three retired astrologers, and a single, very tired raccoon named Chad.</p>
        <p>Results are <strong>87% accurate</strong> in the same way a fortune cookie is 87% accurate.</p>
        <p style="font-size: 11px; color: var(--dim); margin-top: 20px;">// no actual chakras were harmed in development</p>
    `,
    science: `
        <p><strong>THE METHODOLOGY:</strong></p>
        <p>1. We ask you 5 questions. Some of them are nonsense.</p>
        <p>2. Each answer maps to four core stats: <strong>CHAOS, CHARISMA, COSMIC, RACCOON</strong>.</p>
        <p>3. Your dominant stat is fed through a proprietary algorithm (a switch statement).</p>
        <p>4. We pick a vibe that matches. Sometimes we're right. Sometimes the raccoon decides.</p>
        <p style="font-size: 11px; color: var(--dim); margin-top: 20px;">peer-reviewed by my mom (she said it was 'cute')</p>
    `,
    legal: `
        <p><strong>TERMS OF VIBING:</strong></p>
        <p>Results not valid in any court of law, planetarium, or DMV.</p>
        <p>Side effects may include: <strong>self-reflection, mild giggling, the urge to text an ex, sudden cravings for soup.</strong></p>
        <p>Do not operate heavy machinery while vibing. Do not vibe at high altitudes without proper training.</p>
        <p>If your vibe persists for more than 4 hours, that's just your personality, you're fine.</p>
        <p style="font-size: 11px; color: var(--dim); margin-top: 20px;">© 2026 VIBE INDUSTRIES INTERGALACTIC. all rights reserved (some wrongs reserved too).</p>
    `,
};

document.querySelectorAll("[data-modal]").forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.dataset.modal;
        $("modalTitle").textContent = id;
        $("modalBody").innerHTML = MODAL_CONTENT[id];
        $("modalBg").classList.add("active");
    });
});

$("modalClose").addEventListener("click", () => $("modalBg").classList.remove("active"));
$("modalBg").addEventListener("click", (e) => {
    if (e.target === $("modalBg")) $("modalBg").classList.remove("active");
});

// ====== KONAMI CODE ======
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiIdx = 0;

window.addEventListener("keydown", (e) => {
    if (e.key === KONAMI[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === KONAMI.length) {
            unlock("konami");
            unlock("rave");
            document.body.classList.toggle("rave");
            toast("🪩 RAVE MODE: ENGAGED", "#ff00ff");
            $("secretDuck").classList.add("show");
            konamiIdx = 0;
        }
    } else {
        konamiIdx = 0;
    }
});

// ====== SECRET DUCK ======
$("secretDuck").addEventListener("click", () => {
    unlock("duck");
    toast("🦆 the duck approves", "#fff700");
    confettiBurst();
});

// ====== KONAMI HINT ======
$("konamiHint").addEventListener("click", (e) => {
    e.preventDefault();
    toast("try the konami code... ↑↑↓↓←→←→BA", "#00fff7");
});

// ====== EASTER EGG: typing 'vibe' anywhere ======
let typedBuffer = "";
window.addEventListener("keydown", (e) => {
    if (e.key.length === 1) {
        typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-10);
        if (typedBuffer.endsWith("vibe")) {
            toast("VIBES DETECTED", "#39ff14");
            confettiBurst();
        }
        if (typedBuffer.endsWith("raccoon")) {
            toast("🦝 chad says hi", "#ff00ff");
        }
    }
});

// ====== STATUS BAR ROTATION ======
const STATUSES = [
    "QUANTUM VIBE SCANNER ONLINE",
    "RACCOON SUBSYSTEMS NOMINAL",
    "MERCURY: STILL IN MICROWAVE",
    "ASTROLOGERS: DISAPPOINTED BUT WORKING",
    "CHAKRA CALIBRATION: FUNKY",
    "CHAD THE RACCOON: ON BREAK",
];

let statusIdx = 0;
setInterval(() => {
    statusIdx = (statusIdx + 1) % STATUSES.length;
    $("systemStatus").textContent = STATUSES[statusIdx];
}, 4000);

// ====== INIT ======
console.log(
    "%c VIBE CHECK 9000™ ",
    "background: linear-gradient(90deg, #ff00ff, #00fff7); color: #000; font-size: 24px; font-weight: 900; padding: 8px 16px;"
);
console.log("%cyou found the console. that's a vibe of its own.", "color: #39ff14; font-size: 14px;");
console.log("%cpsst — try typing 'vibe' anywhere on the page", "color: #00fff7; font-style: italic;");
