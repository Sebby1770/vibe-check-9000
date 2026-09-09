/* In-game clock, daily bill, rotating gazette. No DOM. */

export const NIGHT_START = 22 * 3600;
export const GAME_PER_REAL = 16;

export const PHASES = ["doors", "heat", "peak", "lastcall", "close"];

export const HOUSE_SETS = [
    { id: "sunday-ghost", name: "SUNDAY GHOST", bpm: 116, tag: "empty room, full speakers" },
    { id: "monday-acid", name: "MONDAY ACID", bpm: 126, tag: "illegal citrus" },
    { id: "velvet-tuesday", name: "VELVET TUESDAY", bpm: 118, tag: "soft kick, hard feelings" },
    { id: "midtown-hump", name: "MIDTOWN HUMP", bpm: 130, tag: "the floor files a complaint" },
    { id: "thursday-static", name: "THURSDAY STATIC", bpm: 128, tag: "rexa's working notes" },
    { id: "friday-drop", name: "FRIDAY DROP", bpm: 132, tag: "do not talk over this" },
    { id: "saturday-gold", name: "SATURDAY GOLD", bpm: 124, tag: "lounge leaking downstairs" },
];

export const GAZETTES = [
    {
        headline: "ILLEGAL LEDS REPORTED IN 47TH ST. BASEMENT",
        lede: "Patrons describe a nightclub that refuses the decade it is standing in. Police say the alley already knew.",
        columns: [
            "Officer Muldoon, off duty and on a cigarette, declined to comment except to say the rain was 'doing its job.'",
            "Dottie's Diner reports cherry pie sales up among persons wearing unexplained visors.",
            "Hotel Astoria: NO VACANCY for trouble. Vacancies for everyone else, if they wipe their feet.",
            "Weather: rain until the city gets tired of looking beautiful. Chance of jazz, 100 percent.",
        ],
    },
    {
        headline: "CHECKER CABS REFUSE TO ENTER THE ALLEY",
        lede: "Drivers cite 'geometry' and 'a cat with union hours.' The basement kick is audible from Broadway.",
        columns: [
            "Cabby on 47th: 'I stop for visors. I do not stop for dumpsters that have opinions.'",
            "Velma's trio added a chorus. The Gazette's typesetter has not recovered.",
            "A yellow cube was seen near the bar. The cube declined an interview.",
            "Forecast: dusk all night. The sun is still in the street and refuses to leave.",
        ],
    },
    {
        headline: "MAYOR CALLS NEON 'UN-AMERICAN,' NEON UNAVAILABLE FOR COMMENT",
        lede: "City Hall asked the club to remember 1954. The club remembered, then turned the filter up.",
        columns: [
            "A guest list described as 'a vibe, not a spreadsheet' has confused three accountants.",
            "Pharmacy across 47th reports unexplained late-night lipstick purchases.",
            "Socks the alley cat endorsed no candidate. She did endorse chin scratches.",
            "Tonight's house system is not a metaphor. Please stop treating it like one.",
        ],
    },
    {
        headline: "LAST CALL COMES EARLY FOR PEOPLE WHO CANNOT DANCE",
        lede: "The floor remains offended by stillness. Energy, the visor claims, is a civic duty.",
        columns: [
            "ION poured something dishonest. Several patrons saw a second 47th Street.",
            "The Rivoli marquee misspelled itself. Critics called it 'honest.'",
            "A fire escape was used as a door. The fire escape has asked for royalties.",
            "Subway rumble at 12:04. Nobody went downstairs. Everybody felt it.",
        ],
    },
    {
        headline: "JAZZ UPSTAIRS, ILLEGAL MATH DOWNSTAIRS, PIE STABLE",
        lede: "Two rooms, one building, zero agreement on the decade. Dottie's prices did not flinch.",
        columns: [
            "Frank from 4B still has not found ice. The ice is not lost. Frank is.",
            "Scotty the newsboy wrote today's headline by shouting it first.",
            "A visor the color of gold was spotted in the lounge. Marco approved the jacket.",
            "Advice column: do not hail a Checker until the street stops moving.",
        ],
    },
    {
        headline: "SUBWAY RUMBLE MISTAKEN FOR A DROP, DANCERS UNCONCERNED",
        lede: "Transit Authority insists the 12:04 was a train. The floor insists it was percussion.",
        columns: [
            "A visor the color of rain was seen hailing a Checker that did not stop. The visor walked.",
            "Hotel Astoria elevator stuck between decades. Eleanor says that is the design.",
            "Muldoon finished his cigarette and started another. The alley filed no report.",
            "Lost and found: one coat, no owner, a note that says 'I evolved.'",
        ],
    },
    {
        headline: "VELMA'S LAST BALLAD STOPS TRAFFIC ON 47TH. BRIEFLY.",
        lede: "A Checker paused. The driver later claimed mechanical sympathy. The trio claimed nothing.",
        columns: [
            "Marco seated a couple who had never been upstairs. He will never recover.",
            "ION's last call arrived on time, which offended several regulars.",
            "The yellow cube remains at large. Geometry, as ever, declines to comment.",
            "Tomorrow's weather: dusk again. The sun is on a union schedule.",
        ],
    },
];

export const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export const PHASE_COPY = {
    doors: { led: "DOORS OPEN", toast: "DOORS OPEN — the night has not started lying yet", status: "DOORS OPEN" },
    heat: { led: "FLOOR WARMING", toast: "THE FLOOR IS FILLING", status: "WARMING UP" },
    peak: { led: "THE DROP", toast: "MIDNIGHT — don't talk over this", status: "PEAK" },
    lastcall: { led: "LAST CALL", toast: "LAST CALL — ION is not asking twice", status: "LAST CALL" },
    close: { led: "2AM STREET", toast: "2AM — the street is the room now", status: "AFTER HOURS" },
};

/* Visual + mix knobs for each beat of the night. Numbers only — world.js paints. */
export const PHASE_LOOK = {
    doors: {
        stops: [[0, "#1a2458"], [0.28, "#3a3878"], [0.48, "#8a4a78"], [0.62, "#d45a58"], [0.76, "#f07840"], [0.88, "#ffc070"], [1, "#ffe8b8"]],
        fogOut: 0xc47862, fogOutD: 0.0085, clear: 0xc47858,
        hemi: 0xffc090, hemiGround: 0x4a3048, hemiOut: 1.35,
        sunY: 16, sunOp: 1, glowOp: 0.28, sunInt: 1.2, sunColor: 0xffc090,
        exposeOut: 1.12, lamp: 1, laser: 1, floor: 1, clubMul: 1, rain: 1,
    },
    heat: {
        stops: [[0, "#121838"], [0.3, "#2a2868"], [0.5, "#6a3870"], [0.64, "#b04858"], [0.78, "#d06040"], [0.9, "#e09060"], [1, "#f0c090"]],
        fogOut: 0xa06068, fogOutD: 0.01, clear: 0xa05858,
        hemi: 0xffa070, hemiGround: 0x3a2040, hemiOut: 1.15,
        sunY: 6, sunOp: 0.62, glowOp: 0.16, sunInt: 0.62, sunColor: 0xffa070,
        exposeOut: 1.0, lamp: 1.1, laser: 1.08, floor: 1.05, clubMul: 1.05, rain: 1.05,
    },
    peak: {
        stops: [[0, "#050818"], [0.32, "#14143a"], [0.52, "#3a1858"], [0.7, "#5a2060"], [0.86, "#2a2048"], [1, "#1a1428"]],
        fogOut: 0x3a2048, fogOutD: 0.014, clear: 0x1a1028,
        hemi: 0x8890cc, hemiGround: 0x180820, hemiOut: 0.85,
        sunY: -28, sunOp: 0, glowOp: 0, sunInt: 0.08, sunColor: 0xaa88ff,
        exposeOut: 0.92, lamp: 1.25, laser: 1.4, floor: 1.22, clubMul: 1.18, rain: 0.95,
    },
    lastcall: {
        stops: [[0, "#040610"], [0.35, "#101428"], [0.58, "#241830"], [0.78, "#2a1828"], [1, "#140e18"]],
        fogOut: 0x241828, fogOutD: 0.016, clear: 0x120c18,
        hemi: 0x7788aa, hemiGround: 0x101018, hemiOut: 0.7,
        sunY: -40, sunOp: 0, glowOp: 0, sunInt: 0.04, sunColor: 0x6688aa,
        exposeOut: 0.86, lamp: 1.4, laser: 0.7, floor: 0.82, clubMul: 0.78, rain: 1.2,
    },
    close: {
        stops: [[0, "#02040c"], [0.4, "#0a1020"], [0.7, "#121428"], [1, "#0c0c16"]],
        fogOut: 0x10141c, fogOutD: 0.018, clear: 0x080a12,
        hemi: 0x556688, hemiGround: 0x080810, hemiOut: 0.55,
        sunY: -50, sunOp: 0, glowOp: 0, sunInt: 0.02, sunColor: 0x445577,
        exposeOut: 0.78, lamp: 1.6, laser: 0.28, floor: 0.45, clubMul: 0.42, rain: 1.45,
    },
};

export function phaseLook(phase) {
    return PHASE_LOOK[phase] || PHASE_LOOK.doors;
}

const PHASE_AT = [
    { t: 0, id: "doors" },
    { t: 45 * 60, id: "heat" },
    { t: 120 * 60, id: "peak" },
    { t: 180 * 60, id: "lastcall" },
    { t: 225 * 60, id: "close" },
];

export function dayKey(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dayHash(key) {
    let h = 2166136261;
    for (let i = 0; i < String(key).length; i++) {
        h ^= String(key).charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

export function pickDaily(arr, hash) {
    if (!arr || !arr.length) return null;
    return arr[hash % arr.length];
}

export function wrapSeconds(sec) {
    return ((Math.floor(sec) % 86400) + 86400) % 86400;
}

export function formatClock(sec) {
    const s = wrapSeconds(sec);
    const h24 = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const h12 = h24 % 12 || 12;
    const ap = h24 >= 12 ? "PM" : "AM";
    return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

export function phaseFromElapsed(elapsedGame) {
    let id = "doors";
    for (const p of PHASE_AT) {
        if (elapsedGame >= p.t) id = p.id;
    }
    return id;
}

export const DARES = [
    { id: "talk3", text: "Talk to three people before the night forgets you." },
    { id: "lounge", text: "Sit upstairs like you pay rent." },
    { id: "socks", text: "The alley cat is union. Pay her in scratches." },
    { id: "street", text: "Walk 47th until the visor learns dusk." },
    { id: "cube", text: "Touch the yellow cube. Geometry is a guest." },
    { id: "energy", text: "Hit ENERGY 80 on the tiles." },
    { id: "paper", text: "Read tonight's Gazette. Scotty wrote it with his mouth." },
    { id: "cab", text: "Hail a Checker. Hold onto the visor." },
    { id: "pie", text: "Cherry pie at Dottie's. Civic duty." },
    { id: "jazz", text: "Ask Velma for something slow." },
    { id: "guest", text: "Tell Nova you're on the list." },
    { id: "drop", text: "Be on the floor when midnight hits." },
    { id: "shop", text: "Cross 47th and go inside a shop with a cash register." },
    { id: "vinyl", text: "Buy a record at Rex's. The visor needs a B-side." },
    { id: "haircut", text: "Sit in Tony's chair. Midnight is not a hairstyle." },
    { id: "subway", text: "Take the stairs under 47th. The 12:04 keeps its own hours." },
    { id: "ice", text: "Find Frank's ice. The plot twist is plumbing." },
];

export function dareFor(hash) {
    return pickDaily(DARES, hash);
}

export function dareComplete(progress, dare) {
    if (!dare) return false;
    const flags = progress.flags || {};
    const night = progress.night || {};
    const zones = progress.zones || [];
    switch (dare.id) {
        case "talk3": return (night.talks || 0) >= 3;
        case "lounge": return !!flags.sat;
        case "socks": return !!flags.cat;
        case "street": return zones.includes("street");
        case "cube": return !!flags.cube;
        case "energy": return (progress.energyPeak || 0) >= 80 || (night.energy || 0) >= 80;
        case "paper": return !!flags.paper;
        case "cab": return !!flags.cab;
        case "pie": return !!flags.pie;
        case "jazz": return !!flags.jazz;
        case "guest": return !!flags.guest;
        case "drop": return !!flags.peakFloor;
        case "shop": return ["records", "pharmacy", "florist", "rivoli", "liquor", "barber"].some((z) => zones.includes(z));
        case "vinyl": return !!flags.vinyl;
        case "haircut": return !!flags.haircut;
        case "subway": return !!flags.subway || !!flags.token || (progress.zones || []).includes("subway");
        case "ice": return !!flags.ice;
        default: return false;
    }
}

export function tonightBill(hash, weekday = new Date().getDay()) {
    const set = HOUSE_SETS[weekday % HOUSE_SETS.length];
    const paper = pickDaily(GAZETTES, hash);
    const day = WEEKDAYS[weekday % 7];
    const dare = dareFor(hash);
    return {
        set,
        gazette: {
            title: "MIDTOWN GAZETTE",
            date: `${day} EDITION  ·  NOVEMBER 12, 1954  ·  FIVE CENTS`,
            headline: paper.headline,
            lede: paper.lede,
            columns: paper.columns,
        },
        tag: set.tag,
        weekday: day,
        dare,
    };
}

export function createClock(nowMs = Date.now()) {
    let elapsedReal = 0;
    const startMs = nowMs;
    return {
        tick(dt) { elapsedReal += dt; },
        get elapsedReal() { return elapsedReal; },
        get elapsedGame() { return elapsedReal * GAME_PER_REAL; },
        get seconds() { return NIGHT_START + elapsedReal * GAME_PER_REAL; },
        get phase() { return phaseFromElapsed(elapsedReal * GAME_PER_REAL); },
        get clock() { return formatClock(NIGHT_START + elapsedReal * GAME_PER_REAL); },
        get startedAt() { return startMs; },
    };
}

export const NPC_PHASE_LINES = {
    nova: {
        doors: "You're early. That's either class or a problem. Floor's ahead.",
        heat: "It's filling. Don't stand in the door like a rumor.",
        peak: "Midnight. If you're still at the threshold you're decoration.",
        lastcall: "ION's last call is not a suggestion. The street is about to be the room.",
        close: "We remember you. The visor remembers you harder. Go home pretty.",
    },
    rexa: {
        doors: "Soundcheck's a lie I tell myself. Give it twenty minutes.",
        heat: "Filter's opening. If you came to talk, you came to the wrong altitude.",
        peak: "This is the drop. Don't. Talk.",
        lastcall: "I'm not stopping. The night is. Different jobs.",
        close: "House system goes to bed. You can still plug the deck. I respect chaos.",
    },
    ion: {
        doors: "Too early for the dishonest pour. Too late to be sober. Pick.",
        heat: "Menu's the same. The floor is not.",
        peak: "If you can still read the bottles you're not dancing enough.",
        lastcall: "Last call. That's the sermon. Don't hail a Checker for twenty minutes.",
        close: "I poured the lights out. Water's still a lie.",
    },
    velma: {
        doors: "They're still arriving. I'll wait until the room has a pulse.",
        heat: "First number's a greeting. Don't clap on one.",
        peak: "Downstairs is a fist. Up here is a hand. Both are the night.",
        lastcall: "Last ballad. If you sit, sit like you mean it.",
        close: "The trio packed. The windows didn't. 47th still looks expensive.",
    },
    dottie: {
        doors: "You're early for pie and late for breakfast. That's the visor crowd.",
        heat: "Coffee's honest. The club is not. Sit down.",
        peak: "I can hear midnight from here. Pie does not care.",
        lastcall: "They'll spill in after last call. I already put the cups out.",
        close: "2am pie is a public service. Don't make it weird.",
    },
    pixel: {
        doors: "Floor's empty enough to hear your shoes. Give it a minute.",
        heat: "Now we're a room. Don't waste it standing.",
        peak: "This is the part where talking is a crime. Move.",
        lastcall: "Last call and I'm still here. That's a personality.",
        close: "They dimmed the LEDs. I did not dim. Different policies.",
    },
    marco: {
        doors: "You're early, which I file as taste. Sit wherever the candle likes you.",
        heat: "The room is filling with people who dress like a decision.",
        peak: "Downstairs is a riot. Up here we riot quieter. Champagne?",
        lastcall: "Last sitting. If you're going to linger, linger like you pay rent.",
        close: "I stacked the chairs in my head. The chairs don't know yet.",
    },
    cabby: {
        doors: "Too early for the drunks. I could almost like this hour.",
        heat: "The visors are coming out. Meter's honest. I'm not.",
        peak: "I don't go in there at midnight. Geometry's on the clock.",
        lastcall: "Twenty minutes after last call I start the engine. Not before.",
        close: "2am. Get in or walk. The alley doesn't tip.",
    },
    scotty: {
        doors: "First edition's still warm. Headline's louder than the kick. For now.",
        heat: "Second stack's moving. People buy papers when the floor gets ideas.",
        peak: "I can't yell over midnight. That's a professional courtesy.",
        lastcall: "Final extra. Tomorrow's problem is today's leftover pie.",
        close: "I sold the night. I'm going home before the night sells me.",
    },
    muldoon: {
        doors: "Quiet alley. I like it that way. Don't test the theory.",
        heat: "I can hear the floor from here. Still not a crime. Yet.",
        peak: "Midnight. If you're in the alley you're either wise or lost.",
        lastcall: "Last call means the sidewalk inherits the club. I inherited the sidewalk.",
        close: "2am. Go home pretty. I already wrote the report in my head and threw it out.",
    },
    sid: {
        doors: "Early crate-diggers are my people. The illegal stuff isn't out yet. That's a joke. It's always out.",
        heat: "Floor's filling. Bins are filling. Different religions, same night.",
        peak: "I can feel midnight through the vinyl. Don't talk. Flip.",
        lastcall: "Last call across the street. Last copies in here. Coincidence? No.",
        close: "2am browsers. That's when the honest records come out.",
    },
    iris: {
        doors: "Too early for tonic, too late for virtue. Pick.",
        heat: "Lipstick's moving. That's how I know the club opened.",
        peak: "If your pupils look like that at midnight, the tonic is a suggestion, not a cure.",
        lastcall: "They'll spill in asking for something that isn't gin. I have something that isn't gin.",
        close: "2am soda is a public service. Don't make it a personality.",
    },
    tony: {
        doors: "You're early. The pole isn't even awake.",
        heat: "Chair's warm. The decade on your head is not.",
        peak: "I don't cut during the drop. That's respect. Sit after.",
        lastcall: "Last call haircuts are my specialty. Nobody argues with a clipper at 1am.",
        close: "2am. You look like the street. I can fix one of those.",
    },
    walter: {
        doors: "Doors of the picture house. Different doors than yours. Same rain.",
        heat: "Lobby's filling with people who prefer plots that sit still.",
        peak: "You can hear midnight through the newsreel. Don't clap.",
        lastcall: "Feature's over in the sense that it never started. Sit anyway.",
        close: "I lock up when the visors go home. That's a rumor I tell the broom.",
    },
};

export function nightSay(npc, node, phase) {
    if (!npc || !node) return node;
    const table = NPC_PHASE_LINES[npc.id];
    if (!table || !table[phase]) return node;
    if (node.say && npc.nodes.start && node === npc.nodes.start) {
        return { ...node, say: table[phase] };
    }
    return node;
}

export function memoryLine(npcId, flags = {}) {
    if (!npcId) return null;
    if (npcId === "nova" && flags.guest) return "You're on the list. Don't make me regret the handwriting.";
    if (npcId === "ion" && flags.drunk) return "You already took the sermon. Water's still a lie. Sit if you have to.";
    if (npcId === "rexa" && flags.peakFloor) return "You were there for the drop. I noticed. Don't make it a personality.";
    if (npcId === "velma" && flags.jazz) return "You already got the slow one. The trio remembers. I remember louder.";
    if (npcId === "dottie" && flags.pie) return "You already had pie. Seconds is a character flaw I respect.";
    if (npcId === "socks" && flags.cat) return "mrrrow. (that's a union yes.)";
    if (npcId === "cabby" && flags.cab) return "You already rode. Meter's still honest. I'm still not.";
    if (npcId === "marco" && flags.sat) return "You sat. The chair filed a report. Complimentary.";
    if (npcId === "scotty" && flags.paper) return "You bought the extra. Don't fold it on the crossword.";
    if (npcId === "muldoon" && flags.cat) return "You pet the cat. That's the only good decision I've seen all shift.";
    if (npcId === "sid" && flags.vinyl) return "You already bought the B-side. If you scratch it I will know. I always know.";
    if (npcId === "iris" && flags.tonic) return "You had the tonic. If the street doubled, that's on you and ION, in that order.";
    if (npcId === "tony" && flags.haircut) return "I already fixed the decade. Don't make me do it twice. The pole gets jealous.";
    if (npcId === "walter" && flags.ticket) return "You have a stub. That's the whole relationship. Enjoy the dark.";
    if (npcId === "lily" && flags.rose) return "The rose is still not a visor accessory. I said what I said.";
    if (npcId === "rosie" && flags.gin) return "You took the century. Don't open it where Muldoon can smell ambition.";
    if (npcId === "frank" && flags.ice) return "You found the ice. I have been a fool in a good jacket. That's also the American century.";
    if (npcId === "eleanor" && flags.ice) return "Nellie told you about the machine. I will have a word with Nellie. A quiet word.";
    if (npcId === "miles" && flags.token) return "You're already in. The tunnel doesn't do refunds. Neither do I.";
    return null;
}
