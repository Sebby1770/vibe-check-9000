/* Billboard inventory, rate card, Stripe checkout, sponsor overlay. No renderer. */

export const POSTER_KIOSK = {
  id: "posters",
  name: "Midtown Poster Co.",
  x: 11.35,
  z: 16.18,
  y: 0,
  aimY: 1.2,
  reach: 2.45,
  prompt: "[E] MIDTOWN POSTER CO.",
  action: "rent-board",
  type: "prop",
};

export function posterCollider() {
  return {
    minX: 10.72,
    maxX: 11.98,
    minZ: 15.78,
    maxZ: 16.58,
    minY: -1,
    maxY: 1.35,
  };
}

export const RATE_CARD = [
  { id: "tower-spire", name: "Spire tower", kind: "tower wall", usd: 99, line: "Bolted high on the spire tower, catwalk and all. Hard to miss." },
  { id: "tower-center", name: "Center tower", kind: "tower wall", usd: 89, line: "On the center tower, dead ahead when you leave the club." },
  { id: "spectacular-center", name: "Center spectacular", kind: "spectacular", usd: 85, line: "Steel legs on the roofs over the Rivoli. The lowest face on the skyline." },
  { id: "spectacular-west", name: "West spectacular", kind: "spectacular", usd: 75, line: "Over the record shop and the pharmacy, straight across from Dottie's." },
  { id: "tower-west", name: "West tower", kind: "rooftop", usd: 79, line: "On the setback above Lily's end of the row. Looks down 47th." },
  { id: "tower-east", name: "East tower", kind: "rooftop", usd: 79, line: "On the setback past the gin shop. Hotel approach." },
  { id: "tower-far-west", name: "Far west tower", kind: "rooftop", usd: 59, line: "The diner end of the skyline." },
  { id: "tower-far-east", name: "Far east tower", kind: "tower wall", usd: 59, line: "The last board before the block runs out." },
  { id: "shop-fascia", name: "Rivoli fascia", kind: "street", usd: 49, line: "On the Rivoli cornice, straight across from the club doors." },
  { id: "lily-fascia", name: "Lily's fascia", kind: "street", usd: 45, line: "Over the flowers, under the cornice cap. Pink neon trim." },
  { id: "tony-fascia", name: "Tony's fascia", kind: "street", usd: 39, line: "Over the barber pole, red neon trim. The chair's warm." },
  { id: "hotel-south", name: "Astoria roof", kind: "rooftop", usd: 45, line: "On the Astoria roof over the neon. The whole shop row looks at it." },
  { id: "alley-wall", name: "Alley wall", kind: "street", usd: 29, line: "For people who use the back door." },
  { id: "newsstand", name: "Newsstand card", kind: "walk-up", usd: 19, line: "A painted tin card riveted to the newsstand." },
  { id: "boot-pause", name: "Visor inserts", kind: "visor", usd: 99, line: "Boot screen, pause card, Gazette classified." },
];

const INK = {
  gin: { paper: "#140c08", ink: "#ffe7a8", accent: "#ff6b6b" },
  soda: { paper: "#1a080c", ink: "#ffe7e0", accent: "#ff3355" },
  jazz: { paper: "#140814", ink: "#ffd0f0", accent: "#ff2ea6" },
  taxi: { paper: "#120e06", ink: "#fff4c4", accent: "#f5c518" },
  film: { paper: "#100c08", ink: "#ffe7a8", accent: "#c45c28" },
  gold: { paper: "#120c08", ink: "#ffe7a8", accent: "#e0b25a" },
  mint: { paper: "#081410", ink: "#e8fff6", accent: "#66ffe0" },
  rose: { paper: "#180810", ink: "#ffe0ea", accent: "#ff6b9a" },
  open: { paper: "#0c1014", ink: "#f2eee0", accent: "#7b8cff" },
};

export const HOUSE_CREATIVES = [
  { id: "gin", brand: "MIDTOWN GIN", line: "THE SMOOTH CENTURY", kicker: "SEALED FOR THE LOUNGE", art: "assets/ads/perfume.jpg", colors: INK.gin, kind: "house" },
  { id: "luckies", brand: "LUCKIES", line: "SO ROUND · SO FIRM", kicker: "A FICTION OF 1954", art: "assets/ads/smoke.jpg", colors: INK.gold, kind: "house" },
  { id: "dottie", brand: "DOTTIE'S", line: "OPEN ALL NIGHT", kicker: "FOUNTAIN · PIE · COFFEE", art: "assets/ads/soda.jpg", colors: INK.soda, kind: "house" },
  { id: "rex", brand: "REX'S RECORDS", line: "HEAR IT FIRST", kicker: "BINS ON 47TH", art: "assets/ads/jazz.jpg", colors: INK.jazz, kind: "house" },
  { id: "rivoli", brand: "RIVOLI", line: "NEON IN THE RAIN", kicker: "THREE SHORTS · ONE CLUE", art: "assets/ads/camera.jpg", colors: INK.film, kind: "house" },
  { id: "tony", brand: "TONY'S", line: "A PORTRAIT WITH THE CUT", kicker: "CHAIR'S WARM", art: "assets/ads/barber.jpg", colors: INK.gold, kind: "house" },
  { id: "taxi", brand: "CHECKER CAB", line: "THE METER KEEPS TIME", kicker: "HAIL ON 47TH", art: "assets/ads/taxi.jpg", colors: INK.taxi, kind: "house" },
  { id: "astoria", brand: "HOTEL ASTORIA", line: "ROOMS THAT FACE THE KICK", kicker: "2F · 4B ICE", art: "assets/ads/hotel.jpg", colors: INK.gold, kind: "house" },
  { id: "gazette", brand: "MIDTOWN GAZETTE", line: "PRINT WHILE IT'S WET", kicker: "LOU STILL HAS COPIES", art: "assets/ads/gazette.jpg", colors: INK.mint, kind: "house" },
  { id: "lily", brand: "LILY'S", line: "A SENTENCE WITHOUT A PERIOD", kicker: "STEMS · RIBBON · TONIGHT", art: "assets/ads/flowers.jpg", colors: INK.rose, kind: "house" },
  {
    id: "available",
    brand: "YOUR NAME IN LIGHTS",
    line: "RENT THIS BOARD",
    kicker: "MIDTOWN POSTER CO. · 47TH",
    art: "assets/ads/empty.jpg",
    colors: INK.open,
    kind: "available",
    url: "",
  },
];

/* Where every board physically hangs. No renderer here, so the supporting geometry is copied from
   city.js / shops.js and every face is derived from it; billboards.js builds the steel from `mount`
   and tests/ads.test.js checks the fit. A slot's x/y/z is the centre of its painted face, w×h the face,
   FRAME the enamel border round it. yaw PI faces the street (-Z); yaw 0 faces +Z.
   mount.type "wall": panel bolted to wallZ, face `off` proud (the panel back sits off - PANEL from the wall);
   "roof": steel lattice standing on roofY, raked back to rearZ (and tied to a wall at tieZ when there is one);
   "stand": tin card riveted flat to the newsstand front. */
export const FRAME = 0.2;
export const PANEL = 0.14;
const STORY = 3.35;
// city.js addTower specs of the front-row towers that carry boards.
export const TOWERS = {
  farWest: { x: -56, z: 60, w: 18, d: 26, floors: 26 },
  west: { x: -16, z: 62, w: 16, d: 28, floors: 32 },
  center: { x: 2, z: 59, w: 20, d: 24, floors: 24 },
  spire: { x: 22, z: 64, w: 18, d: 26, floors: 38 },
  east: { x: 42, z: 58, w: 22, d: 22, floors: 22 },
  farEast: { x: 64, z: 61, w: 20, d: 24, floors: 28 },
};

// addTower: tier 1 = first min(8, floors) floors at w×d, tier 2 = next ≤14 at ×0.86, tier 3 = the rest ×0.78 more.
export function towerTier(spec, tier) {
  const caps = [8, 14, 99];
  const shrink = [1, 0.86, 0.78];
  let cw = spec.w, cd = spec.d, y0 = 0, left = spec.floors;
  for (let t = 0; t < 3 && left > 0; t++) {
    const n = Math.min(caps[t], left);
    cw *= shrink[t];
    cd *= shrink[t];
    const y1 = y0 + n * STORY;
    if (t === tier - 1) {
      // Black cap + cream band make the roof 0.5 m thick and 0.36 m proud; the mid-height band is 0.14 tall.
      return { minX: spec.x - cw / 2, maxX: spec.x + cw / 2, faceZ: spec.z - cd / 2, minY: y0, maxY: y1, roofY: y1 + 0.5, bandY: y0 + (y1 - y0) / 2 };
    }
    left -= n;
    y0 = y1;
  }
  return null;
}

// Tier-2 street face between the tier-1 roof and the tier-2 mid-height band.
export function towerWall(spec) {
  const t1 = towerTier(spec, 1), t2 = towerTier(spec, 2);
  return { minX: t2.minX, maxX: t2.maxX, minY: t1.roofY, maxY: t2.bandY - 0.1, z: t2.faceZ, facing: -1, what: "tier-2 face" };
}

// Tier-1 roof: the strip between the tier-1 parapet and the tier-2 face behind it.
export function towerSetback(spec) {
  const t1 = towerTier(spec, 1), t2 = towerTier(spec, 2);
  return { minX: t1.minX, maxX: t1.maxX, y: t1.roofY, frontZ: t1.faceZ, backZ: t2.faceZ, facing: -1, what: "tier-1 setback roof" };
}

// Mid-rise infill behind the shop row (city.js): roof cap top y 16.7; its brick bulkhead starts 1.4 m back (z 41.6).
export const INFILL_ROOF = { minX: -39.8, maxX: 42.2, y: 16.7, frontZ: 40.2, backZ: 41.6, facing: -1, what: "infill roof" };
// shops.js cornice: street face z 31.645, black cap from y 12.325. Boards keep to the fascia band (y >= 6.9).
export const CORNICE = { minX: -38.8, maxX: 41.2, minY: 6.9, maxY: 12.3, z: 31.645, facing: -1, what: "shop-row cornice" };
// city.js fireEscape(doorX, 31.32, 2): 2.55 m platforms, rails up to y 10.05, 0.9 m proud of the cornice.
export const CORNICE_ESCAPES = [-33.2, -21.8, -12.2, 6, 24.6, 35.8].map((x) => ({ minX: x - 1.3, maxX: x + 1.3, maxY: 10.05 }));
// city.js shop-name signs and the Rivoli title strip stay below the band.
export const SHOP_SIGN_TOP = 6.4;
// Hotel Astoria (city.js): roof slab 14.2..14.6 back from z 12.5; ASTORIA neon, canopy and window grid on the front.
export const HOTEL_ROOF = { minX: 16.55, maxX: 38.75, y: 14.6, frontZ: 12.5, backZ: -16.5, facing: 1, what: "Astoria roof" };
export const ASTORIA_NEON = { minX: 22.6, maxX: 32.6, minY: 9.75, maxY: 11.05 };
// Alley back wall (city.js): face z -30.2; fire escapes at x ±8 / ±22 (±1.3); windows at x -28 + 3.2i, y 2 + (i % 5)·2.4.
export const ALLEY_WALL = { minX: -40, maxX: 40, minY: 0.4, maxY: 15.5, z: -30.2, facing: 1, what: "alley back wall" };
export const ALLEY_ESCAPES = [-22, -8, 8, 22].map((x) => ({ minX: x - 1.3, maxX: x + 1.3 }));
export const ALLEY_WINDOWS = Array.from({ length: 18 }, (_, i) => ({ x: -28 + i * 3.2, y: 2 + (i % 5) * 2.4, w: 0.9, h: 1.2 }));
// Newsstand (city.js): 2.6×1.4×1.3 stand at (-11.85, 16.1); street face z 16.75; the Gazette rack hangs at x -11.55..-10.85.
export const NEWSSTAND = { minX: -13.15, maxX: -10.55, minY: 0.05, maxY: 1.4, z: 16.75, facing: 1, what: "newsstand front" };

function onWall(support, { x, bottom, w, h, off = 0.42, catwalk = false, lamps = 0, neon = false }) {
  return {
    x, y: +(bottom + h / 2).toFixed(3), z: +(support.z + support.facing * off).toFixed(3), w, h,
    yaw: support.facing < 0 ? Math.PI : 0,
    mount: { type: "wall", what: support.what, wallZ: support.z, off, catwalk, lamps, neon,
      support: { minX: support.minX, maxX: support.maxX, minY: support.minY, maxY: support.maxY } },
  };
}

function onRoof(roof, { x, bottom, w, h, setback, rear = 1.2, tie = false, catwalk = false, lamps = 4 }) {
  const z = roof.frontZ - roof.facing * setback;
  return {
    x, y: +(bottom + h / 2).toFixed(3), z: +z.toFixed(3), w, h,
    yaw: roof.facing < 0 ? Math.PI : 0,
    mount: { type: "roof", what: roof.what, roofY: roof.y, rearZ: +(z - roof.facing * rear).toFixed(3),
      tieZ: tie ? roof.backZ : null, catwalk, lamps,
      support: { minX: roof.minX, maxX: roof.maxX, minZ: Math.min(roof.frontZ, roof.backZ), maxZ: Math.max(roof.frontZ, roof.backZ) } },
  };
}

function onSetback(spec, { x, bottom, w, h, setback = 0.55, lamps = 4 }) {
  const roof = towerSetback(spec);
  return onRoof(roof, { x, bottom, w, h, setback, rear: roof.backZ - roof.frontZ - setback - 0.14, tie: true, lamps });
}

function onStand(stand, { x, bottom, w, h }) {
  const placed = onWall(stand, { x, bottom, w, h, off: 0.05 });
  return { ...placed, mount: { ...placed.mount, type: "stand" } };
}

const slot = (id, defaultCreative, placed, prop) => ({ id, ...placed, defaultCreative, ...(prop ? { prop } : {}) });

export const SLOTS = [
  /* Skyline. From the pavement (eye 1.7 m, z 14..20) the shop cornice cap (y 12.675, near edge z 31.47) hides
     everything below y ≈ 21.1 at z 40.3 and ≈ 29 at z 48.5, so faces start just above those lines. The two
     spectaculars stand on the infill roof in front of the towers; the tower faces above/behind them are placed
     so none is covered by a spectacular when seen from the club door. */
  slot("tower-west", "gin", onSetback(TOWERS.west, { x: -16, bottom: 29.3, w: 13, h: 5.6 })),
  slot("tower-center", "dottie", onWall(towerWall(TOWERS.center), { x: 2, bottom: 29.6, w: 13, h: 6.2, lamps: 4 })),
  slot("tower-spire", "rex", onWall(towerWall(TOWERS.spire), { x: 22, bottom: 42.8, w: 13.2, h: 6.4, catwalk: true, lamps: 4 })),
  slot("tower-east", "luckies", onSetback(TOWERS.east, { x: 42.5, bottom: 29.3, w: 13, h: 5.6, setback: 0.45 })),
  slot("tower-far-west", "rivoli", onSetback(TOWERS.farWest, { x: -56, bottom: 29.3, w: 13, h: 5.6 })),
  slot("tower-far-east", "available", onWall(towerWall(TOWERS.farEast), { x: 64, bottom: 30.4, w: 13, h: 5.8, catwalk: true, lamps: 4 })),
  slot("spectacular-west", "taxi", onRoof(INFILL_ROOF, { x: -29.5, bottom: 21.4, w: 13, h: 5.2, setback: 0.1, catwalk: true, lamps: 5 })),
  slot("spectacular-center", "available", onRoof(INFILL_ROOF, { x: 14, bottom: 21.4, w: 14, h: 5.4, setback: 0.1, catwalk: true, lamps: 5 })),
  // Fascia band on the shop-row cornice, clear of the fire escapes (Lily's and Tony's sit above theirs).
  slot("shop-fascia", "rivoli", onWall(CORNICE, { x: -1.6, bottom: 7.3, w: 10, h: 3.0, off: 0.3, lamps: 3 }), { x: -1.6, z: 30.1 }),
  slot("lily-fascia", "lily", onWall(CORNICE, { x: -12.2, bottom: 10.36, w: 5.2, h: 1.7, off: 0.3, neon: "#ff6b9a" }), { x: -12.2, z: 30.0 }),
  slot("tony-fascia", "tony", onWall(CORNICE, { x: 35.9, bottom: 10.36, w: 7.2, h: 1.7, off: 0.3, neon: "#ff3355" }), { x: 35.9, z: 30.0 }),
  // Astoria: the facade is windows, canopy and the ASTORIA neon, so its board stands on the roof above the neon.
  slot("hotel-south", "astoria", onRoof(HOTEL_ROOF, { x: 27.6, bottom: 16.2, w: 10, h: 3.2, setback: 0.35, lamps: 3 }), { x: 32.4, z: 14.3 }),
  slot("alley-wall", "available", onWall(ALLEY_WALL, { x: 15, bottom: 2.9, w: 8, h: 2.9, off: 0.3, lamps: 3 }), { x: 15, z: -28.6 }),
  slot("newsstand", "gazette", onStand(NEWSSTAND, { x: -12.36, bottom: 0.3, w: 1.3, h: 0.95 })),
];

// Board faces a view ray actually lands on: facing the eye, inside w×h plus a small margin, minDist..maxDist
// away along the ray. Nearest first. Pure math so the [LOOK] prompt can be tested without a renderer.
export function boardsOnRay(slots, origin, dir, { minDist = 4, maxDist = 120, margin = 0.25 } = {}) {
  const hits = [];
  for (const s of slots) {
    const nx = Math.sin(s.yaw || 0), nz = Math.cos(s.yaw || 0);
    const denom = dir.x * nx + dir.z * nz;
    if (denom > -0.05) continue;
    const t = ((s.x - origin.x) * nx + (s.z - origin.z) * nz) / denom;
    if (t < minDist || t > maxDist) continue;
    const px = origin.x + dir.x * t, py = origin.y + dir.y * t, pz = origin.z + dir.z * t;
    const u = (px - s.x) * nz - (pz - s.z) * nx;
    const slack = margin + t * 0.004;
    if (Math.abs(u) > s.w / 2 + slack || Math.abs(py - s.y) > s.h / 2 + slack) continue;
    hits.push({ id: s.id, dist: t, point: { x: px, y: py, z: pz } });
  }
  return hits.sort((a, b) => a.dist - b.dist);
}

function httpsUrl(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return "";
    return u.toString();
  } catch {
    return "";
  }
}

function cleanLinks(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    const url = httpsUrl(value);
    if (url) out[key] = url;
  }
  return out;
}

export function isStripeUrl(url) {
  const s = httpsUrl(url);
  if (!s) return false;
  try {
    const host = new URL(s).hostname;
    return host === "buy.stripe.com" || host === "checkout.stripe.com" || host.endsWith(".stripe.com");
  } catch {
    return false;
  }
}

export function mergeAdConfig(raw = {}) {
  const sponsors = Array.isArray(raw.sponsors) ? raw.sponsors.filter((s) => s && s.id && s.brand) : [];
  const creatives = [
    ...HOUSE_CREATIVES.map((c) => ({ ...c })),
    ...sponsors.map((s) => ({
      id: String(s.id),
      brand: String(s.brand).slice(0, 28),
      line: String(s.line || "PAID PLACEMENT").slice(0, 36),
      kicker: String(s.kicker || "PAID PLACEMENT").slice(0, 42),
      art: s.art || "assets/ads/empty.jpg",
      colors: s.colors || INK.open,
      kind: "sponsor",
      url: httpsUrl(s.url),
    })),
  ];
  const byId = new Map(creatives.map((c) => [c.id, c]));
  const slotOverrides = raw.slots && typeof raw.slots === "object" ? raw.slots : {};
  const slots = SLOTS.map((slot) => {
    const over = slotOverrides[slot.id];
    let creativeId = (over && over.creativeId) || slot.defaultCreative;
    const claimed = sponsors.find((s) => (s.slotIds || []).includes(slot.id));
    if (claimed) creativeId = claimed.id;
    if (!byId.has(creativeId)) creativeId = slot.defaultCreative;
    return { ...slot, creativeId };
  });
  return {
    domain: String(raw.domain || "vibecheck9000.com"),
    email: String(raw.email || "").trim(),
    githubSponsors: httpsUrl(raw.githubSponsors) || "https://github.com/sponsors/Sebby1770",
    koFi: httpsUrl(raw.koFi),
    stripePaymentLink: httpsUrl(raw.stripePaymentLink),
    stripeLinks: cleanLinks(raw.stripeLinks),
    hideSponsorSlots: !!raw.hideSponsorSlots,
    creatives,
    slots,
  };
}

export function creativeById(config, id) {
  return (config.creatives || []).find((c) => c.id === id) || HOUSE_CREATIVES[HOUSE_CREATIVES.length - 1];
}

export function filledSlots(config) {
  return (config.slots || []).map((slot) => ({
    ...slot,
    creative: creativeById(config, slot.creativeId),
    rate: RATE_CARD.find((r) => r.id === slot.id) || null,
  }));
}

export function availableSlots(config) {
  return filledSlots(config).filter((s) => s.creative.kind === "available");
}

export function sponsorMailto(config, slot) {
  const to = config.email || "";
  const subject = encodeURIComponent(`47th Street board: ${slot?.name || slot?.id || "inventory"}`);
  const body = encodeURIComponent(
    [
      "I want a board on 47th Street.",
      slot ? `Board: ${slot.name || slot.id}` : "Board: first available",
      slot?.usd ? `Listed at $${slot.usd}/month.` : "",
      "",
      "Creative: 16:9 still, no live video. I can send copy and a URL.",
    ].join("\n"),
  );
  if (to) return `mailto:${to}?subject=${subject}&body=${body}`;
  return "";
}

export function checkoutUrl(config, slot) {
  const id = slot?.id;
  const named = id && config.stripeLinks ? config.stripeLinks[id] : "";
  if (named) return named;
  if (config.stripePaymentLink) return config.stripePaymentLink;
  const mail = sponsorMailto(config, slot);
  if (mail) return mail;
  return config.githubSponsors;
}

export function payKind(config, slot) {
  const url = checkoutUrl(config, slot);
  if (isStripeUrl(url)) return "stripe";
  if (String(url).startsWith("mailto:")) return "email";
  return "sponsors";
}

export function tillUrl(config) {
  return config.koFi || config.githubSponsors;
}

export function stripeLive(config) {
  if (isStripeUrl(config.stripePaymentLink)) return true;
  return Object.values(config.stripeLinks || {}).some((url) => isStripeUrl(url));
}

export function classifieds(config) {
  const rows = filledSlots(config);
  const paid = rows.filter((s) => s.creative.kind === "sponsor").slice(0, 2);
  const open = rows.filter((s) => s.creative.kind === "available").slice(0, 1);
  const house = rows.filter((s) => s.creative.kind === "house").slice(0, 2);
  return [...paid, ...open, ...house].map((s) => {
    const c = s.creative;
    const tag = c.kind === "available" ? "TO LET" : c.kind === "sponsor" ? "PAID" : "HOUSE";
    return `${tag} — ${c.brand}. ${c.line}. ${c.kicker}`;
  });
}

export function tonightSponsor(config, hash = 0) {
  const pool = filledSlots(config).filter((s) => s.creative.kind !== "available");
  if (!pool.length) return creativeById(config, "available");
  return pool[Math.abs(hash) % pool.length].creative;
}

export function recordView(state, slotId) {
  const viewed = new Set(state.viewed || []);
  if (slotId) viewed.add(slotId);
  return { viewed: [...viewed], counts: { ...(state.counts || {}), [slotId]: ((state.counts || {})[slotId] || 0) + 1 } };
}

export function boardsRead(state) {
  return (state.viewed || []).length;
}

export function pitchCopy(config) {
  const open = availableSlots(config).length;
  const n = (config.slots || []).length;
  const pay = stripeLive(config) ? " Stripe is live." : " Stripe is off until you paste a Payment Link.";
  return `${n} boards on the block. ${open} still to let.${pay}`;
}

export function boardProps(config) {
  // Street boards get a walk-up target on the pavement below them; skyline boards are read, not touched.
  return filledSlots(config)
    .filter((s) => s.prop)
    .map((s) => ({
      id: `board-${s.id}`,
      type: "prop",
      x: s.prop.x,
      z: s.prop.z,
      y: 0,
      aimY: s.prop.aimY ?? 2.35,
      reach: Math.max(3.1, Math.min(4.2, s.w * 0.42)),
      prompt: s.creative.kind === "available" ? `[E] RENT · ${s.creative.brand}` : `[E] ${s.creative.brand}`,
      action: s.creative.kind === "available" || !s.creative.url ? "rent-board" : `ad-open:${s.creative.url}`,
    }));
}

export function pricedRates(config) {
  return RATE_CARD.map((r) => ({
    ...r,
    checkout: checkoutUrl(config, r),
    payKind: payKind(config, r),
  }));
}
