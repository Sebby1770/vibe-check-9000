/* THE 12:04 — the main story. Pure rules and data: no DOM, no three. State lives at progress.story and
   survives new calendar days. Every reducer returns {state, ok, changed, message, effects} and never mutates
   its input. Saved strings are ids only (backups reject "<" and ">"). */

export const STORY_VERSION = 1;

// World positions (metres, +X east, +Z north, y = floor). New districts per V31_PLAN.md §2.
export const STORY_PLACES = {
    photo: { x: 1.4, z: -11.7, y: 4.4, name: "Velma's photograph" },
    contact: { x: 44.4, z: 29.6, y: 0, name: "The Camera Club contact sheet" },
    boothNote: { x: -35.7, z: -8.0, y: 0, name: "Dottie's back booth" },
    payphone: { x: 7.15, z: 14.85, y: 0, name: "The payphone on 47th" },
    alleyEcho: { x: 0.5, z: -25, y: 0, name: "An echo in the alley" },
    loftEcho: { x: 30, z: -142, y: 0, name: "An echo at the Garment District lofts" },
    notebook: { x: 30.6, z: -6.6, y: 4.4, name: "Ada's room, Astoria 4B" },
    timesSquare: { x: -250, z: 52, y: 0, name: "Times Square" },
    pierGate: { x: 296, z: 22.8, y: 0, name: "Pier 47 gate" },
    warehouse: { x: 338, z: 12, y: 0, name: "The Meridian warehouse" },
    pierEnd: { x: 500, z: 22, y: 0, name: "The end of Pier 47" },
    limo: { x: 62, z: 131, y: 0, name: "Kessler's limousine, outside the Belmont Plaza" },
    hatch: { x: 36.9, z: -0.6, y: 4.4, name: "The Astoria roof hatch" },
    platform: { x: -14, z: 29, y: -5.2, name: "The 47th Street platform" },
};

export const CHAPTERS = [
    {
        id: "doors", number: 0, title: "Doors", kicker: "Prologue",
        blurb: "The floor dropped out from under the beat. The visor says the year is wrong.",
        objectives: [
            { id: "ask-rexa", kind: "talk", npc: "rexa", text: "Ask REXA how you got here",
                say: "You came through the booth. Nobody comes through the booth — it's a wall with a turntable bolted to it. Your glasses are humming in a key I don't own. Go outside. Look at the date. Then go upstairs; Velma's seen this before.",
                reply: "What year is it?" },
            { id: "ask-scotty", kind: "talk", npc: "scotty", text: "Ask Scotty the newsboy for the date",
                say: "November twelfth, nineteen fifty-four, same as it's been all day, mister. Paper's a nickel. You look like you've seen a ghost — or been one.",
                reply: "Nineteen fifty-four." },
            { id: "find-velma", kind: "talk", npc: "velma", text: "Find Velma in the upstairs lounge",
                say: "Sit down before you fall down, honey. Those glasses. I've seen them once before — in a picture somebody slipped under my dressing-room door last week. Take a look. It's on the table.",
                reply: "Show me." },
        ],
    },
    {
        id: "picture", number: 1, title: "A Picture That Refuses the Decade", kicker: "Chapter one",
        blurb: "A photograph of you, taken before you arrived.",
        objectives: [
            { id: "see-photo", kind: "interact", prop: "photo", text: "Look at the photograph on Velma's table",
                lines: ["A crowd under the Rivoli marquee, opening night. Rain. Hats.", "And there you are — the visor on — stamped NOV 12 1954.", "Taken before you ever walked through that booth."] },
            { id: "ask-walter", kind: "talk", npc: "walter", text: "Ask Walter at the Rivoli about opening night",
                say: "That's opening night for Neon in the Rain, sure. Girl with a Leica stood right where you're standing, shooting the line. Said she was waiting on somebody. Ran her prints through the Camera Club down the block.",
                reply: "Who was she?" },
            { id: "contact-sheet", kind: "interact", prop: "contact", text: "Check the contact sheet at the 47th Camera Club",
                lines: ["Thirty-six frames of 47th Street. Every one signed in grease pencil: A.L.", "The last frame is the club's back door. Tonight's date. You, stepping out."] },
            { id: "ask-dottie", kind: "talk", npc: "dottie", text: "Ask Dottie about the woman with the camera",
                say: "Ada. Tall, quick, ink on her fingers like a schoolteacher. Sat in my back booth every night this week, two coffees, one for nobody. Said if a kid in strange glasses came asking, they should sit there after midnight. So — after midnight.",
                reply: "I'll come back after midnight." },
            { id: "booth-note", kind: "interact", prop: "boothNote", window: [0, 5], text: "Sit in Dottie's back booth after midnight",
                hint: "The booth keeps better hours than you. Pause and wait, or come back after 12:00 AM.",
                lines: ["Under the sugar shaker, a folded napkin in neat engineer's capitals:", "IF YOU'RE READING THIS, THE 12:04 IS THE ONLY WAY HOME.", "DON'T LET THE GREY HAT HAVE THE VISOR. — A."],
                reward: { cash: 25 } },
        ],
    },
    {
        id: "signal", number: 2, title: "Signal Silver", kicker: "Chapter two",
        blurb: "A recorded voice, a silver sleeve, and a visor that starts to see.",
        objectives: [
            { id: "answer-phone", kind: "interact", prop: "payphone", text: "Answer the payphone on 47th Street",
                lines: ["Static, then a woman's voice, recorded and a little too fast:", "“If this is working, you found my note. The silver sleeve at Rex's — it isn't a record.", "Have the DJ play it. Then look again. Look properly.”"] },
            { id: "get-sleeve", kind: "talk", npc: "sid", text: "Collect the silver sleeve from Sid at Rex's Records",
                say: "No label, no catalogue number, came in a Meridian Radio envelope with your description on it. Lady paid for the shelf space in advance. Here. Don't play it on anything you love.",
                reply: "Thanks, Sid." },
            { id: "play-it", kind: "talk", npc: "rexa", text: "Have REXA play the test pressing",
                say: "That's not music. That's a map. Something just — went through your glasses. Hold still. Can you see them? People who aren't here. Hold V and look around.",
                reply: "I can see them.", effect: { echoes: true, flash: true } },
            { id: "alley-echo", kind: "reach", place: "alleyEcho", r: 3, text: "Follow the echo into the alley (hold V)",
                lines: ["The echo replays: Ada at the back door, arguing with a man in a grey hat.", "“It isn't yours to sell, Kessler.” He laughs. He doesn't take his hat off."] },
            { id: "loft-echo", kind: "reach", place: "loftEcho", r: 5, text: "Follow the echoes south to the Garment District",
                lines: ["Under the El, the echo again: Ada wheeling a crate onto a truck marked MERIDIAN RADIO.", "Inside the crate, a glass tube the length of your arm, glowing faintly blue."] },
            { id: "ask-nellie", kind: "talk", npc: "nellie", text: "Ask Nellie on the Astoria's second floor about room 4B",
                say: "4B? Miss Lune. Paid a month ahead, came and went at all hours with a toolbox. Hasn't been back since Tuesday. I'm not supposed to — oh, take the key. Frank's ice machine's next door if anyone asks what you're doing up here.",
                reply: "I'll be quick." },
            { id: "notebook", kind: "interact", prop: "notebook", text: "Search Ada's room in the Astoria",
                lines: ["Ada Lune's notebook. Diagrams, sums, a coffee ring.", "THE SEAM: the club at 124 BPM — a transmitter on the Astoria roof — the uptown local under 47th at 12:04 AM.", "Last page: MERIDIAN RADIO, PIER 47. KESSLER KNOWS."],
                reward: { cash: 30 } },
        ],
    },
    {
        id: "greyhat", number: 3, title: "The Grey Hat", kicker: "Chapter three",
        blurb: "August Kessler collects things that fall through time. He'd like your glasses.",
        objectives: [
            { id: "warning", kind: "talk", npc: "muldoon", text: "Muldoon on the alley beat has a warning",
                say: "Man in a grey hat's been up and down this block asking about a kid in funny glasses. Kessler. Meridian Radio money. Paid my sergeant to forget his face. He's leaving the Astoria now — if you're going to follow him, don't let him see you.",
                reply: "I'll keep my distance." },
            { id: "tail", kind: "follow", actor: "kessler", place: "timesSquare", near: 5, far: 42, text: "Tail the Grey Hat west to Times Square — close, but unseen",
                lines: ["Kessler stops under the biggest sign on Broadway and checks his watch.", "A black limousine slides to the kerb. He gets in. Pier 47, he tells the driver."] },
            { id: "to-pier", kind: "reach", place: "pierGate", r: 8, text: "Get to the Pier 47 gate (drive — press F at any car)",
                lines: ["The limousine is parked inside the gate. Light under the warehouse door.", "Two watchmen with flashlights walk the yard."] },
        ],
    },
    {
        id: "pier", number: 4, title: "Pier 47", kicker: "Chapter four",
        blurb: "Meridian Radio builds televisions by day. At night, it builds a door.",
        objectives: [
            { id: "sneak", kind: "stealth", place: "warehouse", r: 6, text: "Slip into the Meridian warehouse without the watchmen seeing you",
                hint: "Stay out of the flashlight beams. If they spot you, they'll walk you back to the gate." },
            { id: "find-ada", kind: "talk", npc: "ada", place: "warehouse", text: "Find Ada",
                say: "You came. You actually — sit. No time. Listen: the Seam opens at 12:04 every night, when the uptown local runs under 47th while the club plays at a hundred and twenty-four beats a minute and my transmitter on the Astoria roof is singing along. Your club is the same room seventy-two years apart. That's why you're here. Kessler wants the tube — the heart of the transmitter — and your visor, to sell the future to whoever pays.",
                reply: "How do I get home?" },
            { id: "ambush", kind: "cutscene", scene: "kessler-tube", place: "warehouse", text: "Kessler arrives",
                lines: ["“Miss Lune. And our visitor.” Kessler lifts the glowing tube from its cradle like a bottle of wine.", "“The Plaza has a lovely safe. Do come by.” The limousine doors close. The engine fades north."] },
            { id: "escape", kind: "reach", place: "pierGate", r: 8, text: "Get back out through the Pier 47 gate", reward: { cash: 40 } },
        ],
    },
    {
        id: "twelve-oh-four", number: 5, title: "The 12:04", kicker: "Chapter five",
        blurb: "A tube, a roof, a record, a train. Home, or the set.",
        objectives: [
            { id: "take-tube", kind: "interact", prop: "limo", text: "Take the tube back from Kessler's limousine outside the Belmont Plaza",
                lines: ["The chauffeur is asleep with his cap over his eyes. The tube is on the back seat, humming.", "Somewhere above, Kessler is opening an empty safe."] },
            { id: "refit", kind: "interact", prop: "hatch", text: "Refit the transmitter through the Astoria roof hatch (2F)",
                lines: ["Wind, rain, the whole of Midtown lit up below.", "The tube clicks home. The aerial starts to sing — 124 beats to the minute."] },
            { id: "signal-set", kind: "talk", npc: "rexa", text: "Ask REXA to drop the signal set before midnight",
                say: "A hundred and twenty-four, on the dot, all the way down. I'll play it like the building depends on it. Go. The 12:04 doesn't wait for anybody — not even you.",
                reply: "Play it.", effect: { flash: true, signalSet: true } },
            { id: "platform", kind: "reach", place: "platform", r: 12, window: [23.75, 0.6], text: "Be on the 47th Street platform at 12:04 AM",
                hint: "Midnight is close. If you're early, wait on the platform; if you're late, wait for tomorrow's 12:04." },
            { id: "choose", kind: "choice", place: "platform", text: "The 12:04 is here",
                lines: ["The uptown local comes in white instead of yellow. The doors open on a car full of light.", "Through the visor, the platform signs read 2026. Behind you, faintly, the club is playing your song."],
                options: [{ id: "home", text: "Ride home" }, { id: "stay", text: "Stay for the set" }] },
        ],
    },
];

export const ENDINGS = {
    home: ["You step through. The doors close on 1954.", "47th Street, 2026: same bricks, new glass. The club is still there.", "In your pocket, a photograph of you outside the Rivoli. Stamped NOV 12 1954."],
    stay: ["The doors close without you. The train pulls away into the dark.", "Upstairs, Velma is singing something slow. Ada saves you a seat.", "Dawn comes up over 47th Street. You have time now. All of it."],
};

const OBJ = new Map(CHAPTERS.flatMap((c, ci) => c.objectives.map((o, oi) => [o.id, { ...o, chapter: ci, index: oi }])));
export const ALL_OBJECTIVES = [...OBJ.keys()];

export function normalizeStory(data) {
    const d = data && typeof data === "object" ? data : {};
    const chapter = Math.max(0, Math.min(CHAPTERS.length, Math.floor(Number(d.chapter) || 0)));
    const maxStep = chapter < CHAPTERS.length ? CHAPTERS[chapter].objectives.length - 1 : 0;
    const step = Math.max(0, Math.min(maxStep, Math.floor(Number(d.step) || 0)));
    const done = [...new Set((Array.isArray(d.done) ? d.done : []).filter((id) => OBJ.has(id)))];
    const ending = d.ending === "home" || d.ending === "stay" ? d.ending : null;
    const cards = [...new Set((Array.isArray(d.cards) ? d.cards : []).filter((n) => Number.isInteger(n) && n >= 0 && n <= CHAPTERS.length))].sort((a, b) => a - b);
    return {
        version: STORY_VERSION,
        started: !!d.started || chapter > 0 || step > 0 || done.length > 0,
        chapter, step, done, cards, ending,
        echoes: !!d.echoes || done.includes("play-it"),
        signalSet: !!d.signalSet || done.includes("signal-set"),
        quests: Object.fromEntries(CHAPTERS.map((c, i) => [c.id, { state: i < chapter || (i === chapter && ending) ? "done" : i === chapter ? "active" : "locked", step: i === chapter ? step : i < chapter ? c.objectives.length : 0 }])),
    };
}

/** The objective in play, or null when the story is complete. */
export function currentObjective(state) {
    const s = normalizeStory(state);
    if (s.ending || s.chapter >= CHAPTERS.length) return null;
    const chapter = CHAPTERS[s.chapter];
    const o = chapter.objectives[s.step];
    return o ? { ...o, chapter: s.chapter, chapterTitle: chapter.title, kicker: chapter.kicker, place: o.place || o.prop || null } : null;
}

/** Where the waypoint should point for the current objective: {id, name, x, z, y} or null. */
export function objectiveTarget(state, npcs = []) {
    const o = currentObjective(state);
    if (!o) return null;
    if (o.kind === "talk") {
        const npc = npcs.find((n) => n.id === o.npc);
        if (npc) return { id: `story-${o.id}`, name: npc.name || o.npc.toUpperCase(), x: npc.x, z: npc.z, y: npc.y || 0 };
    }
    const key = o.place || o.prop;
    const p = key && STORY_PLACES[key];
    if (o.kind === "follow" && p) return { id: `story-${o.id}`, name: `Follow the grey hat · ${p.name}`, x: p.x, z: p.z, y: 0 };
    return p ? { id: `story-${o.id}`, name: p.name, x: p.x, z: p.z, y: p.y || 0 } : null;
}

function inWindow(hour, win) {
    if (!win) return true;
    const [a, b] = win;
    return a <= b ? hour >= a && hour < b : hour >= a || hour < b;
}

function advance(s, o, extra = {}) {
    const next = { ...s, done: [...new Set([...s.done, o.id])], started: true, ...extra };
    const effects = [];
    if (o.lines) effects.push({ type: "lines", lines: o.lines, speaker: o.kind === "talk" ? o.npc : null });
    if (o.reward?.cash) effects.push({ type: "cash", amount: o.reward.cash, label: `Story · ${o.text}` });
    if (o.effect?.echoes) { next.echoes = true; effects.push({ type: "echoes" }); }
    if (o.effect?.flash) effects.push({ type: "flash" });
    if (o.effect?.signalSet) { next.signalSet = true; effects.push({ type: "signalSet" }); }
    const chapter = CHAPTERS[s.chapter];
    if (s.step + 1 < chapter.objectives.length) next.step = s.step + 1;
    else {
        next.chapter = s.chapter + 1;
        next.step = 0;
        if (next.chapter < CHAPTERS.length) effects.push({ type: "card", chapter: next.chapter });
    }
    effects.push({ type: "save", label: `Story · ${o.id}` });
    return { state: normalizeStory(next), ok: true, changed: true, message: o.text, effects };
}

/**
 * Feeds a game event to the story. Events: {type:"talk", npc} · {type:"zone", zone} · {type:"reach", x, z, y}
 * · {type:"interact", prop} · {type:"follow", actor, result:"done"|"lost"|"spotted"} · {type:"stealth",
 * result:"in"|"spotted"} · {type:"cutscene", scene} · {type:"choice", value} · {type:"start"}. `hour` is the
 * game hour (0–24) for time-windowed objectives.
 */
export function onStoryEvent(state, event = {}, { hour = 22 } = {}) {
    const s = normalizeStory(state);
    const none = { state: s, ok: false, changed: false, message: "", effects: [] };
    if (event.type === "start") {
        if (s.started) return none;
        return { state: normalizeStory({ ...s, started: true, cards: [...s.cards, 0] }), ok: true, changed: true, message: "The story begins", effects: [{ type: "card", chapter: 0 }] };
    }
    if (event.type === "card") {
        if (s.cards.includes(event.chapter)) return none;
        return { ...none, state: normalizeStory({ ...s, cards: [...s.cards, event.chapter] }), changed: true };
    }
    const o = currentObjective(s);
    if (!o) return none;
    const timely = inWindow(hour, o.window);
    switch (o.kind) {
        case "talk": return event.type === "talk" && event.npc === o.npc ? advance(s, o) : none;
        case "interact":
            if (event.type !== "interact" || event.prop !== o.prop) return none;
            return timely ? advance(s, o) : { ...none, message: o.hint || "Not yet." };
        case "reach": {
            if (event.type !== "reach") return none;
            const p = STORY_PLACES[o.place];
            const close = Math.hypot(event.x - p.x, event.z - p.z) <= (o.r || 3) && Math.abs((event.y || 0) - (p.y || 0)) < 2.5;
            if (!close) return none;
            return timely ? advance(s, o) : { ...none, message: o.hint || "Not yet." };
        }
        case "follow":
            if (event.type !== "follow" || event.actor !== o.actor) return none;
            if (event.result === "done") return advance(s, o);
            return { ...none, message: event.result === "spotted" ? "He saw you. Back off and try again." : "You lost him. He'll leave the Astoria again." };
        case "stealth":
            if (event.type !== "stealth") return none;
            if (event.result === "in") return advance(s, o);
            return { ...none, message: o.hint || "Spotted." };
        case "cutscene": return event.type === "cutscene" && event.scene === o.scene ? advance(s, o) : none;
        case "choice": {
            if (event.type !== "choice" || !o.options.some((opt) => opt.id === event.value)) return none;
            const r = advance(s, o, { ending: event.value });
            r.effects.push({ type: "ending", ending: event.value, lines: ENDINGS[event.value] });
            return r;
        }
        default: return none;
    }
}

/** What an NPC says when the story needs them: {say, reply} or null (fall back to their usual talk). */
export function storyLine(state, npcId) {
    const o = currentObjective(state);
    return o && o.kind === "talk" && o.npc === npcId ? { say: o.say, reply: o.reply || "…", objective: o.id } : null;
}

/** One line for the tracker: chapter, objective text, and a hint when the clock is the blocker. */
export function trackerText(state, hour = 22) {
    const s = normalizeStory(state);
    if (s.ending) return { kicker: "The 12:04", text: s.ending === "home" ? "You rode home. The city is still here to explore." : "You stayed for the set. The city is yours.", done: true };
    const o = currentObjective(s);
    if (!o) return null;
    return { kicker: `${o.kicker} · ${o.chapterTitle}`, text: o.text, hint: o.window && !inWindow(hour, o.window) ? o.hint : "", done: false };
}
