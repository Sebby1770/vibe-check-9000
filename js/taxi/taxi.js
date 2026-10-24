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
