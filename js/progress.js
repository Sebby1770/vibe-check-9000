/* Local night stamps + cosmetic unlocks. No DOM. */

export const PROGRESS_KEY = "vc9k-progress";

export const LOOKS = [
    { id: "stock", name: "STOCK VISOR", visor: "#00fff7", left: "#ff00aa", right: "#00fff7", how: "you walked in with it" },
    { id: "magenta", name: "BOOTH PINK", visor: "#ff2ea6", left: "#ff2ea6", right: "#c77dff", how: "talk to REXA" },
    { id: "gold", name: "LOUNGE GOLD", visor: "#e0b25a", left: "#e0b25a", right: "#ffb703", how: "sit upstairs" },
    { id: "lime", name: "ALLEY LIME", visor: "#39ff14", left: "#39ff14", right: "#b8f000", how: "pet SOCKS" },
    { id: "dusk", name: "47TH DUSK", visor: "#ffb25a", left: "#ff6b3a", right: "#ffb25a", how: "walk 47th Street" },
    { id: "chrome", name: "CUBE CHROME", visor: "#e8e7ff", left: "#fff700", right: "#00fff7", how: "touch the yellow cube" },
    { id: "rave", name: "PEAK RAVE", visor: "#ff00ff", left: "#ff00aa", right: "#00fff7", how: "hit ENERGY 80 on the floor" },
    { id: "lastcall", name: "LAST CALL RED", visor: "#ff2e63", left: "#ff2e63", right: "#ffb703", how: "still here at last call" },
    { id: "jazz", name: "VELMA GOLD", visor: "#f4d35e", left: "#e0b25a", right: "#ffe7a8", how: "ask VELMA for a number" },
    { id: "pie", name: "CHERRY PIE", visor: "#ff6b6b", left: "#ff6b6b", right: "#ffb703", how: "pie at DOTTIE'S" },
    { id: "cab", name: "CHECKER YELLOW", visor: "#f5c518", left: "#f5c518", right: "#ffe7a8", how: "hail a Checker" },
    { id: "afterhours", name: "2AM INDIGO", visor: "#7b8cff", left: "#c77dff", right: "#00fff7", how: "still here when the street is the room" },
    { id: "vinyl", name: "B-SIDE VIOLET", visor: "#c77dff", left: "#c77dff", right: "#ff00aa", how: "buy a record at REX'S" },
    { id: "tonic", name: "PHARMACY MINT", visor: "#66ffe0", left: "#66ffe0", right: "#39ff14", how: "tonic at the pharmacy" },
    { id: "clipper", name: "TONY'S CLIP", visor: "#ff3355", left: "#ff3355", right: "#ffe7a8", how: "sit in Tony's chair" },
    { id: "token", name: "TOKEN GREEN", visor: "#39ff14", left: "#39ff14", right: "#66ffe0", how: "take the 12:04" },
    { id: "ice", name: "4B ICE", visor: "#88ccee", left: "#88ccee", right: "#e8e7ff", how: "find Frank's ice" },
    { id: "stub", name: "SILVER SCREEN", visor: "#ffe7a8", left: "#ffe7a8", right: "#e0b25a", how: "a Rivoli stub" },
];

function emptyNight() {
    return { talks: 0, energy: 0, flags: {}, talked: [] };
}

function empty() {
    return {
        unlocked: ["stock"],
        look: "stock",
        flags: {},
        talked: [],
        zones: [],
        stamps: [],
        energyPeak: 0,
        lastDay: "",
        streak: 0,
        visits: 0,
        dareId: "",
        dareDone: false,
        night: emptyNight(),
    };
}

export function loadProgress(storage) {
    const store = storage || (typeof localStorage !== "undefined" ? localStorage : null);
    if (!store) return empty();
    try {
        const raw = store.getItem(PROGRESS_KEY);
        if (!raw) return empty();
        const data = JSON.parse(raw);
        const base = empty();
        return {
            ...base,
            ...data,
            unlocked: Array.from(new Set([...(data.unlocked || []), "stock"])),
            talked: Array.isArray(data.talked) ? data.talked : [],
            zones: Array.isArray(data.zones) ? data.zones : [],
            stamps: Array.isArray(data.stamps) ? data.stamps : [],
            flags: data.flags && typeof data.flags === "object" ? data.flags : {},
            night: data.night && typeof data.night === "object"
                ? {
                    ...emptyNight(),
                    ...data.night,
                    flags: data.night.flags || {},
                    talked: Array.isArray(data.night.talked) ? data.night.talked : [],
                }
                : emptyNight(),
            look: LOOKS.some((l) => l.id === data.look) ? data.look : "stock",
            streak: Number(data.streak) || 0,
            visits: Number(data.visits) || 0,
        };
    } catch {
        return empty();
    }
}

export function saveProgress(data, storage) {
    const store = storage || (typeof localStorage !== "undefined" ? localStorage : null);
    if (!store) return data;
    store.setItem(PROGRESS_KEY, JSON.stringify(data));
    return data;
}

export function getLook(id) {
    return LOOKS.find((l) => l.id === id) || LOOKS[0];
}

export function touchVisit(progress, today) {
    if (!today) return progress;
    if (progress.lastDay === today) return progress;
    let streak = 1;
    if (progress.lastDay) {
        const prev = Date.parse(`${progress.lastDay}T12:00:00`);
        const now = Date.parse(`${today}T12:00:00`);
        const days = Math.round((now - prev) / 86400000);
        streak = days === 1 ? (progress.streak || 0) + 1 : 1;
    }
    return {
        ...progress,
        lastDay: today,
        streak,
        visits: (progress.visits || 0) + 1,
        dareDone: false,
        night: emptyNight(),
    };
}

export function evaluateUnlocks(progress, events = {}) {
    const have = new Set(progress.unlocked || ["stock"]);
    const freshly = [];
    const unlock = (id) => {
        if (!have.has(id)) {
            have.add(id);
            freshly.push(id);
        }
    };
    const talked = new Set(progress.talked || []);
    const zones = new Set(progress.zones || []);
    const flags = { ...progress.flags, ...events.flags };
    const nightTalked = new Set(progress.night?.talked || []);
    const night = {
        talks: progress.night?.talks || 0,
        energy: progress.night?.energy || 0,
        flags: { ...(progress.night?.flags || {}), ...(events.nightFlags || {}) },
        talked: [...nightTalked],
    };
    if (events.talkId) {
        nightTalked.add(events.talkId);
        night.talked = [...nightTalked];
        night.talks = nightTalked.size;
        talked.add(events.talkId);
    }
    if (events.zone) zones.add(events.zone);
    if (events.energyPeak != null && events.energyPeak > (progress.energyPeak || 0)) {
        progress.energyPeak = events.energyPeak;
    }
    if (events.energyPeak != null) night.energy = Math.max(night.energy, events.energyPeak);

    if (talked.has("rexa")) unlock("magenta");
    if (flags.sat) unlock("gold");
    if (flags.cat) unlock("lime");
    if (zones.has("street")) unlock("dusk");
    if (flags.cube) unlock("chrome");
    if ((progress.energyPeak || 0) >= 80 || (events.energyPeak || 0) >= 80) unlock("rave");
    if (events.phase === "lastcall" || events.phase === "close" || flags.lastcall) unlock("lastcall");
    if (flags.jazz || talked.has("velma")) unlock("jazz");
    if (flags.pie) unlock("pie");
    if (flags.cab) unlock("cab");
    if (events.phase === "close" || flags.afterhours) unlock("afterhours");
    if (flags.vinyl) unlock("vinyl");
    if (flags.tonic) unlock("tonic");
    if (flags.haircut) unlock("clipper");
    if (flags.token || flags.subway || zones.has("subway")) unlock("token");
    if (flags.ice) unlock("ice");
    if (flags.ticket) unlock("stub");

    const next = {
        ...progress,
        unlocked: [...have],
        talked: [...talked],
        zones: [...zones],
        flags,
        night,
        energyPeak: Math.max(progress.energyPeak || 0, events.energyPeak || 0),
    };
    return { progress: next, freshly };
}

export function stampNight(progress, stamp) {
    const row = {
        at: stamp.at || new Date().toISOString(),
        clock: stamp.clock || "",
        phase: stamp.phase || "doors",
        zone: stamp.zone || "club",
        energy: Math.round(stamp.energy || 0),
        look: stamp.look || progress.look,
        set: stamp.set || "",
        dare: stamp.dare || "",
        dareDone: !!stamp.dareDone,
    };
    const stamps = [...(progress.stamps || []), row].slice(-16);
    return { ...progress, stamps };
}

export function setLook(progress, id) {
    if (!(progress.unlocked || []).includes(id)) return progress;
    if (!LOOKS.some((l) => l.id === id)) return progress;
    return { ...progress, look: id };
}

export function buildRecap(progress, extras = {}) {
    const talked = progress.talked || [];
    const flags = progress.flags || {};
    const bits = [];
    if (talked.length) bits.push(`talked to ${talked.length}`);
    if (flags.sat) bits.push("sat like rent");
    if (flags.cat) bits.push("paid the cat");
    if (flags.cab) bits.push("hailed a Checker");
    if (flags.pie) bits.push("ate the pie");
    if (flags.jazz) bits.push("asked Velma");
    if (flags.guest) bits.push("signed the list");
    if (flags.cube) bits.push("touched geometry");
    if ((progress.energyPeak || 0) >= 80) bits.push("the floor noticed");
    return {
        clock: extras.clock || "",
        phase: extras.phase || "doors",
        set: extras.set || "",
        look: extras.look || progress.look,
        energy: Math.round(extras.energy ?? progress.energyPeak ?? 0),
        talked: talked.length,
        streak: progress.streak || 0,
        visits: progress.visits || 0,
        dare: extras.dare || "",
        dareDone: !!extras.dareDone,
        bits,
        zones: progress.zones || [],
    };
}
