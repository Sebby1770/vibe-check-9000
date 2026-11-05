/* Taxi fares. Drive any Checker, press T for the roof light, and fares start hailing from the kerb: pull up
   beside them and stop, take them where they ask, stop at the kerb there, and the fare goes in your wallet
   (more for a quick ride). Pure: no three, no DOM; main.js shows the passenger, the route and the money. */
import { OW_ROADS, OPEN_PLACES, WORLD_BOUNDS } from "../openworld/layout.js";
import { BLOCK_ROADS, DISTRICT_PLACES } from "../district-layout.js";
import { SHOPS } from "../zones.js";
import { SUBWAY_STATIONS } from "../openworld/stations.js";

const ROADS = [...OW_ROADS, ...BLOCK_ROADS].filter((r) => Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]) > 40);
const BOARD_DIST = 7, DROP_DIST = 9, STOPPED = 1.6, PATIENCE = 120;
const SHOP_NAMES = { rivoli: "the Rivoli", records: "Rex's Records", barber: "Tony's barbershop" };

function segDist(px, pz, [ax, az], [bx, bz]) {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - ax - t * dx, pz - az - t * dz);
}

let KERBS = null;
/** Kerbside spots along every street, every 30 m on both sides, clear of junctions. */
export function kerbs() {
  if (KERBS) return KERBS;
  KERBS = [];
  for (const r of ROADS) {
    const len = Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]), ux = (r.b[0] - r.a[0]) / len, uz = (r.b[1] - r.a[1]) / len;
    for (let s = 15; s < len - 15; s += 30) for (const side of [-1, 1]) {
      const off = r.width / 2 + 1.1;
      const x = r.a[0] + ux * s - uz * off * side, z = r.a[1] + uz * s + ux * off * side;
      if (x < WORLD_BOUNDS.minX + 10 || x > WORLD_BOUNDS.maxX - 10 || z < WORLD_BOUNDS.minZ + 10 || z > WORLD_BOUNDS.maxZ - 10) continue;
      // Not at a junction: every other street at least 10 m beyond its kerb.
      if (ROADS.some((o) => o !== r && segDist(x, z, o.a, o.b) < o.width / 2 + 10)) continue;
      // The road point beside the kerb, where the cab stops.
      KERBS.push({ x, z, road: r.name, cabX: r.a[0] + ux * s - uz * (r.width / 4) * side, cabZ: r.a[1] + uz * s + ux * (r.width / 4) * side });
    }
  }
  return KERBS;
}

const near = (list, x, z) => list.reduce((best, k) => { const d = Math.hypot(k.x - x, k.z - z); return d < best.d ? { k, d } : best; }, { k: null, d: Infinity }).k;

let DESTS = null;
/** Where fares ask to go: the city's landmarks, the stops, the club, the shops. Each has a kerb to stop at. */
export function destinations() {
  if (DESTS) return DESTS;
  const named = [
    ...OPEN_PLACES.map((p) => ({ name: p.name, x: p.x, z: p.z })),
    ...DISTRICT_PLACES.map((p) => ({ name: p.name, x: p.x, z: p.z })),
    ...SUBWAY_STATIONS.filter((s) => !s.board).map((s) => ({ name: s.name + " station", x: s.x, z: s.z })),
    { name: "Velvet Tuesday", x: 0, z: 13 }, { name: "Dottie's Diner", x: -27, z: 13 }, { name: "the Astoria", x: 25, z: 13 },
    ...SHOPS.filter((s) => SHOP_NAMES[s.id]).map((s) => ({ name: SHOP_NAMES[s.id], x: s.doorX, z: 31 })),
  ];
  DESTS = named.map((d) => ({ ...d, kerb: near(kerbs(), d.x, d.z) })).filter((d) => d.kerb && Math.hypot(d.kerb.x - d.x, d.kerb.z - d.z) < 60);
  return DESTS;
}

const LINES = [
  (d) => `${d}, please. And don't spare the horses.`,
  (d) => `Take me to ${d}. I'm late, and she won't be.`,
  (d) => `${d}. The long way's fine, the meter isn't.`,
  (d) => `${d}, mac. You know the one.`,
  (d) => `Could you run me to ${d}? There's a dollar in it if we beat the rain.`,
  (d) => `${d}, and if a grey hat follows us, lose him.`,
];

// What the fare says on the way: small talk now and then, a word as you pass somewhere they know, and directions
// as you get close.
const TALK = [
  "Quite a night for it.",
  "Is it always this wet on 47th, or is it just me?",
  "Don't mind me. I talk when I'm nervous.",
  "The radio says rain till Thursday. The radio says a lot of things.",
  "You ever get the feeling the night's running a little long?",
  "Twelve-oh-four. Funny how that time keeps coming up tonight.",
  "My sister says nobody walks in this town anymore. She's right.",
  "You hear the one about the Dodgers? Neither did I. Just drive.",
  "Nice cab. Smells like cigars and pennies. I like it.",
];
const PASSING = [
  (d) => `There's ${d}. Never been inside.`,
  (d) => `${d}! I had my first dance near there.`,
  (d) => `Slow down a second... no, keep going. I thought I saw somebody at ${d}.`,
];
const NEAR = ["This'll do fine, just up here.", "Right up here on the left. Or the right. You'll see me get out.", "Almost there. Keep the meter honest."];

/** Mid-ride: returns a line for the fare to say this frame, or null. */
export function rideChatter(state, { pos, dt = 0, rand = Math.random }) {
  if (state.stage !== "ride" || !state.fare?.dest) return null;
  // `chat` lives on the fare object, which stepTaxi carries from frame to frame.
  const f = state.fare, chat = (f.chat ||= { wait: 6 + rand() * 6, quiet: 0, said: [], passed: [], forms: [], near: false });
  chat.wait -= dt;
  chat.quiet -= dt;
  const toDest = Math.hypot(pos.x - f.dest.kerb.x, pos.z - f.dest.kerb.z);
  const spoke = (line) => { chat.quiet = 5; chat.wait = Math.max(chat.wait, 8); return line; };
  if (!chat.near && toDest < 120 && f.distance > 200) {
    chat.near = true;
    return spoke(NEAR[Math.floor(rand() * NEAR.length)]);
  }
  if (chat.quiet > 0) return null;
  // A place they know, as you pass it (not every one: they run out of stories).
  const forms = PASSING.map((_, i) => i).filter((i) => !chat.forms.includes(i));
  const landmark = forms.length && destinations().find((d) => d !== f.dest && !chat.passed.includes(d.name) && Math.hypot(pos.x - d.x, pos.z - d.z) < 45);
  if (landmark) {
    chat.passed.push(landmark.name);
    const form = forms[Math.floor(rand() * forms.length)];
    chat.forms.push(form);
    return spoke(PASSING[form](landmark.name));
  }
  if (chat.wait > 0) return null;
  chat.wait = 18 + rand() * 12;
  const fresh = TALK.filter((l) => !chat.said.includes(l));
  if (!fresh.length) return null;
  const line = fresh[Math.floor(rand() * fresh.length)];
  chat.said.push(line);
  return spoke(line);
}

export function createTaxi() {
  return { on: false, stage: "off", fare: null, waited: 0, fares: 0, earned: 0 };
}

function pickKerb(pos, min, max, rand) {
  const options = kerbs().filter((k) => { const d = Math.hypot(k.x - pos.x, k.z - pos.z); return d > min && d < max; });
  return options.length ? options[Math.floor(rand() * options.length)] : near(kerbs(), pos.x, pos.z);
}

/** Roof light on or off. Turning it on finds the first fare nearby. */
export function toggleTaxi(state, pos, rand = Math.random) {
  if (state.on) return { state: { ...state, on: false, stage: "off", fare: null }, events: [{ type: "off", hadPassenger: state.stage === "ride" }] };
  const s = { ...state, on: true };
  return seek(s, pos, rand);
}

function seek(state, pos, rand) {
  const pickup = pickKerb(pos, 70, 260, rand);
  return { state: { ...state, stage: "pickup", fare: { pickup, seed: rand() }, waited: 0 }, events: [{ type: "hail", pickup }] };
}

/** Rough street distance (avenues and crosstown streets run on a grid). */
export function streetDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
}

/** Pay for a ride: $3 flag-drop plus about 40 cents a block, up to half again as a tip for a quick ride. */
export function farePay(distance, seconds) {
  const meter = 3 + distance * 0.016, par = distance / 7 + 25;
  const tip = Math.max(0, Math.min(0.5, (par - seconds) / par)) * meter;
  return Math.max(3, Math.round(meter + tip));
}

/** One frame: pos is the cab, speed in m/s. */
export function stepTaxi(state, { pos, speed = 0, dt = 0, rand = Math.random }) {
  if (!state.on || !state.fare) return { state, events: [] };
  const f = state.fare;
  if (state.stage === "pickup") {
    const waited = state.waited + dt;
    if (Math.hypot(pos.x - f.pickup.x, pos.z - f.pickup.z) < BOARD_DIST && speed < STOPPED) {
      const options = destinations().filter((d) => { const dist = streetDistance(d.kerb, f.pickup); return dist > 180 && dist < 900; });
      const dest = options.length ? options[Math.floor(rand() * options.length)] : destinations()[0];
      const distance = streetDistance(f.pickup, dest.kerb);
      const line = LINES[Math.floor(f.seed * LINES.length)](dest.name);
      return { state: { ...state, stage: "ride", fare: { ...f, dest, distance, ride: 0 }, waited: 0 }, events: [{ type: "board", dest, line, distance }] };
    }
    if (waited > PATIENCE) {
      const next = seek(state, pos, rand);
      return { state: next.state, events: [{ type: "gave-up" }, ...next.events] };
    }
    return { state: { ...state, waited }, events: [] };
  }
  if (state.stage === "ride") {
    const ride = f.ride + dt;
    if (Math.hypot(pos.x - f.dest.kerb.x, pos.z - f.dest.kerb.z) < DROP_DIST && speed < STOPPED) {
      const pay = farePay(f.distance, ride);
      const next = seek({ ...state, fares: state.fares + 1, earned: state.earned + pay }, pos, rand);
      return { state: next.state, events: [{ type: "drop", pay, dest: f.dest, seconds: ride }, ...next.events] };
    }
    return { state: { ...state, fare: { ...f, ride } }, events: [] };
  }
  return { state, events: [] };
}

/** Where the route marker should point, and a line for the HUD. */
export function taxiTarget(state, pos) {
  if (!state.on || !state.fare) return null;
  if (state.stage === "pickup") {
    const k = state.fare.pickup;
    return { id: "taxi-pickup", name: "Fare hailing", x: k.x, z: k.z, y: 0, hud: `FARE HAILING · ${Math.round(Math.hypot(k.x - pos.x, k.z - pos.z))} M · STOP BESIDE THEM` };
  }
  const d = state.fare.dest, meter = farePay(state.fare.distance, state.fare.ride);
  return { id: "taxi-dropoff", name: d.name, x: d.kerb.x, z: d.kerb.z, y: 0, hud: `TO ${d.name.toUpperCase()} · ${Math.round(Math.hypot(d.kerb.x - pos.x, d.kerb.z - pos.z))} M · METER $${meter}` };
}
