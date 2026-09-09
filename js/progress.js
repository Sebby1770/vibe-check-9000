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
];

function empty() {
    return {
        unlocked: ["stock"],
        look: "stock",
        flags: {},
        talked: [],
        zones: [],
        stamps: [],
        energyPeak: 0,
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
            look: LOOKS.some((l) => l.id === data.look) ? data.look : "stock",
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
    if (events.talkId) talked.add(events.talkId);
    if (events.zone) zones.add(events.zone);
    if (events.energyPeak != null && events.energyPeak > (progress.energyPeak || 0)) {
        progress.energyPeak = events.energyPeak;
    }
    if (talked.has("rexa")) unlock("magenta");
    if (flags.sat) unlock("gold");
    if (flags.cat) unlock("lime");
    if (zones.has("street")) unlock("dusk");
    if (flags.cube) unlock("chrome");
    if ((progress.energyPeak || 0) >= 80 || (events.energyPeak || 0) >= 80) unlock("rave");
    if (events.phase === "lastcall" || events.phase === "close" || flags.lastcall) unlock("lastcall");

    const next = {
        ...progress,
        unlocked: [...have],
        talked: [...talked],
        zones: [...zones],
        flags,
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
    };
    const stamps = [...(progress.stamps || []), row].slice(-12);
    return { ...progress, stamps };
}

export function setLook(progress, id) {
    if (!(progress.unlocked || []).includes(id)) return progress;
    if (!LOOKS.some((l) => l.id === id)) return progress;
    return { ...progress, look: id };
}
