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
  { id: "tower-spire", name: "Spire tower", kind: "rooftop", usd: 99, line: "The tallest face. Hard to miss." },
  { id: "tower-center", name: "Center tower", kind: "rooftop", usd: 89, line: "Dead ahead when you leave the club." },
  { id: "spectacular-center", name: "Center spectacular", kind: "spectacular", usd: 85, line: "Eye-level on the skyline. You do not have to look up." },
  { id: "spectacular-west", name: "West spectacular", kind: "spectacular", usd: 75, line: "The gin-side skyline, low enough to read from the doors." },
  { id: "tower-west", name: "West tower", kind: "rooftop", usd: 79, line: "Looks down 47th from the gin side." },
  { id: "tower-east", name: "East tower", kind: "rooftop", usd: 79, line: "Hotel approach. Checker traffic." },
  { id: "tower-far-west", name: "Far west tower", kind: "rooftop", usd: 59, line: "The diner end of the skyline." },
  { id: "tower-far-east", name: "Far east tower", kind: "rooftop", usd: 59, line: "The last board before the block runs out." },
  { id: "shop-fascia", name: "Rivoli fascia", kind: "street", usd: 49, line: "Eye-level on the shop row." },
  { id: "lily-fascia", name: "Lily's fascia", kind: "street", usd: 45, line: "Over the flowers. Soft light." },
  { id: "hotel-south", name: "Astoria south", kind: "street", usd: 45, line: "Over the hotel canopy." },
  { id: "alley-wall", name: "Alley wall", kind: "street", usd: 29, line: "For people who use the back door." },
  { id: "newsstand", name: "Newsstand card", kind: "walk-up", usd: 19, line: "A painted card on Lou's stand." },
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

export const SLOTS = [
  { id: "tower-west", x: -16, y: 36, z: 47.35, w: 14, h: 6, yaw: Math.PI, defaultCreative: "gin" },
  { id: "tower-center", x: 2, y: 41, z: 46.7, w: 16, h: 7, yaw: Math.PI, defaultCreative: "dottie" },
  { id: "tower-spire", x: 22, y: 52, z: 50.7, w: 15, h: 7.2, yaw: Math.PI, defaultCreative: "rex" },
  { id: "tower-east", x: 48, y: 34, z: 49.15, w: 12, h: 5.2, yaw: Math.PI, defaultCreative: "luckies" },
  { id: "tower-far-west", x: -56, y: 38, z: 46.9, w: 13, h: 5.6, yaw: Math.PI, defaultCreative: "rivoli" },
  { id: "tower-far-east", x: 64, y: 36.5, z: 48.7, w: 13, h: 5.8, yaw: Math.PI, defaultCreative: "available" },
  { id: "spectacular-west", x: -16, y: 18.4, z: 47.2, w: 13, h: 5.2, yaw: Math.PI, defaultCreative: "taxi" },
  { id: "spectacular-center", x: 2.2, y: 19.2, z: 46.55, w: 15, h: 5.6, yaw: Math.PI, defaultCreative: "available" },
  { id: "shop-fascia", x: -8.2, y: 8.55, z: 31.86, w: 8.4, h: 2.4, yaw: Math.PI, defaultCreative: "tony" },
  { id: "lily-fascia", x: -12.2, y: 8.35, z: 31.86, w: 5.4, h: 1.85, yaw: Math.PI, defaultCreative: "lily" },
  { id: "hotel-south", x: 32.4, y: 8.7, z: 12.86, w: 7.4, h: 2.2, yaw: 0, defaultCreative: "astoria" },
  { id: "alley-wall", x: 16.4, y: 5.4, z: -30.05, w: 7.2, h: 3.1, yaw: 0, defaultCreative: "available" },
  { id: "newsstand", x: -11.85, y: 2.22, z: 16.82, w: 1.15, h: 1.45, yaw: 0, defaultCreative: "gazette" },
];

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
  return filledSlots(config)
    .filter((s) => s.y <= 10 && s.id !== "newsstand")
    .map((s) => {
      const facesSouth = Math.abs((s.yaw || 0) - Math.PI) < 0.2;
      return {
        id: `board-${s.id}`,
        type: "prop",
        x: s.x,
        z: s.z + (facesSouth ? -1.55 : 1.45),
        y: 0,
        aimY: Math.min(2.35, Math.max(1.15, s.y * 0.22 + 0.85)),
        reach: Math.max(3.1, s.w * 0.42),
        prompt: s.creative.kind === "available" ? `[E] RENT · ${s.creative.brand}` : `[E] ${s.creative.brand}`,
        action: s.creative.kind === "available" || !s.creative.url ? "rent-board" : `ad-open:${s.creative.url}`,
      };
    });
}

export function pricedRates(config) {
  return RATE_CARD.map((r) => ({
    ...r,
    checkout: checkoutUrl(config, r),
    payKind: payKind(config, r),
  }));
}
