import assert from "node:assert/strict";
import {
  HOUSE_CREATIVES,
  RATE_CARD,
  SLOTS,
  mergeAdConfig,
  filledSlots,
  availableSlots,
  sponsorMailto,
  checkoutUrl,
  payKind,
  tillUrl,
  stripeLive,
  isStripeUrl,
  classifieds,
  tonightSponsor,
  recordView,
  boardsRead,
  pitchCopy,
  posterCollider,
  POSTER_KIOSK,
  boardProps,
  pricedRates,
  boardsOnRay,
  FRAME,
  PANEL,
  TOWERS,
  towerTier,
  CORNICE,
  CORNICE_ESCAPES,
  HOTEL_ROOF,
  ASTORIA_NEON,
  ALLEY_ESCAPES,
  ALLEY_WINDOWS,
  NEWSSTAND,
} from "../js/ads.js";
import { buildColliders } from "../js/zones.js";
import { blockedSegment } from "../js/interactions.js";

assert.ok(HOUSE_CREATIVES.length >= 10);
assert.ok(SLOTS.length >= 12);
assert.equal(new Set(SLOTS.map((s) => s.id)).size, SLOTS.length);
// The rate card sells every board plus the visor inserts, and nothing else.
assert.deepEqual(RATE_CARD.map((r) => r.id).sort(), [...SLOTS.map((s) => s.id), "boot-pause"].sort());
for (const id of ["tower-spire", "tower-center", "spectacular-center", "spectacular-west", "tower-west", "tower-east", "tower-far-west",
  "tower-far-east", "shop-fascia", "lily-fascia", "hotel-south", "alley-wall", "newsstand"]) assert.ok(SLOTS.some((s) => s.id === id), `sold slot ${id} kept`);

/* Physical placement: every face is mounted on real structure, fits it, and never overlaps another board. */
const EPS = 1e-6;
const rim = (s) => (s.mount.type === "stand" ? 0.04 : FRAME); // the newsstand tin has a 4 cm lip, not a moulding
const edges = (s) => ({ minX: s.x - s.w / 2 - rim(s), maxX: s.x + s.w / 2 + rim(s), minY: s.y - s.h / 2 - rim(s), maxY: s.y + s.h / 2 + rim(s) });
for (const s of SLOTS) {
  const m = s.mount, e = edges(s);
  assert.ok(m && ["wall", "roof", "stand"].includes(m.type), `${s.id} has mount info`);
  assert.ok(Math.abs(s.yaw) < EPS || Math.abs(s.yaw - Math.PI) < EPS, `${s.id} faces the street or the alley`);
  const margin = m.type === "stand" ? 0.05 : 0.3;
  assert.ok(e.minX >= m.support.minX + margin - EPS && e.maxX <= m.support.maxX - margin + EPS, `${s.id} fits the width of its ${m.what}`);
  const out = Math.abs(s.yaw) < EPS ? 1 : -1;
  if (m.type === "wall" || m.type === "stand") {
    assert.ok(e.minY >= m.support.minY - EPS && e.maxY <= m.support.maxY + EPS, `${s.id} stays on its ${m.what}`);
    assert.ok(Math.abs(s.z - (m.wallZ + out * m.off)) < EPS, `${s.id} face sits off proud of its wall`);
    // Panel (face gap 0.05 + PANEL) leaves room for stand-off brackets but stays within 0.45 m; the tin card is 5 cm proud.
    assert.ok(m.type === "stand" ? m.off <= 0.06 : m.off <= 0.45 && m.off - PANEL - 0.05 >= 0.05, `${s.id} panel is bolted close to the wall`);
  } else {
    assert.ok(e.minY >= m.roofY - EPS, `${s.id} stands on its roof, not in it`);
    assert.ok(e.minY - m.roofY <= 5, `${s.id} legs are not stilts`);
    assert.ok(s.z >= m.support.minZ - EPS && s.z <= m.support.maxZ + EPS, `${s.id} face is over its roof`);
    assert.ok(m.rearZ >= m.support.minZ - EPS && m.rearZ <= m.support.maxZ + EPS, `${s.id} rakers land on the roof`);
    assert.ok(m.tieZ === null || (m.tieZ - s.z) * out < 0, `${s.id} ties back into the wall behind it`);
  }
}
// Tower faces sit on the tier that is actually there (tier setbacks), not in front of it or inside it.
for (const s of SLOTS.filter((s) => s.id.startsWith("tower-"))) {
  const spec = Object.values(TOWERS).find((t) => Math.abs(t.x - s.x) < t.w / 2);
  const t1 = towerTier(spec, 1), t2 = towerTier(spec, 2);
  if (s.mount.type === "wall") {
    assert.equal(s.mount.wallZ, t2.faceZ, `${s.id} hangs on the tier-2 face`);
    assert.ok(edges(s).minY >= t1.roofY && edges(s).maxY <= t2.bandY, `${s.id} is between the setback roof and the tier-2 band`);
  } else {
    assert.equal(s.mount.roofY, t1.roofY, `${s.id} stands on the tier-1 setback`);
    assert.ok(s.z > t1.faceZ && s.z < t2.faceZ, `${s.id} face is on the setback strip`);
  }
}
// Shop-row fascia: the billboard band (y >= 6.9) on the cornice face, under the cap, clear of the fire escapes.
const fascia = SLOTS.filter((s) => s.mount.what === CORNICE.what);
assert.deepEqual(fascia.map((s) => s.id).sort(), ["lily-fascia", "shop-fascia", "tony-fascia"]);
for (const s of fascia) {
  const e = edges(s);
  assert.ok(e.minY >= 6.9 && e.maxY <= 12.325, `${s.id} keeps to the fascia band`);
  for (const esc of CORNICE_ESCAPES) assert.ok(e.maxX <= esc.minX || e.minX >= esc.maxX || e.minY >= esc.maxY, `${s.id} clears the fire escape at ${esc.minX + 1.3}`);
}
const over = (id, minX, maxX, creative) => {
  const s = SLOTS.find((q) => q.id === id), e = edges(s);
  assert.ok(e.minX >= minX && e.maxX <= maxX, `${id} is over its shop`);
  assert.equal(s.defaultCreative, creative);
};
over("shop-fascia", -8, 18.2, "rivoli");
over("lily-fascia", -15.4, -9.0, "lily");
over("tony-fascia", 31.2, 40.6, "tony");
for (let i = 0; i < SLOTS.length; i++) for (let j = i + 1; j < SLOTS.length; j++) {
  const a = SLOTS[i], b = SLOTS[j];
  if (Math.abs(a.yaw - b.yaw) > EPS || Math.abs(a.z - b.z) > 0.6) continue;
  const A = edges(a), B = edges(b);
  assert.ok(A.maxX <= B.minX || B.maxX <= A.minX || A.maxY <= B.minY || B.maxY <= A.minY, `${a.id} and ${b.id} do not overlap`);
}
// Astoria: on the roof, above the ASTORIA neon; alley: between the fire escapes, no windows covered; newsstand: on Lou's stand.
const hotel = SLOTS.find((s) => s.id === "hotel-south");
assert.equal(hotel.mount.what, HOTEL_ROOF.what);
assert.ok(edges(hotel).minY > ASTORIA_NEON.maxY && edges(hotel).minY >= HOTEL_ROOF.y);
const alley = SLOTS.find((s) => s.id === "alley-wall"), ae = edges(alley);
for (const esc of ALLEY_ESCAPES) assert.ok(ae.maxX <= esc.minX || ae.minX >= esc.maxX, "alley board clears the fire escapes");
for (const w of ALLEY_WINDOWS) {
  const clearX = ae.maxX <= w.x - w.w / 2 || ae.minX >= w.x + w.w / 2, clearY = ae.maxY <= w.y - w.h / 2 || ae.minY >= w.y + w.h / 2;
  assert.ok(clearX || clearY, `alley board clears the window at ${w.x},${w.y}`);
}
const news = SLOTS.find((s) => s.id === "newsstand");
assert.equal(news.mount.what, NEWSSTAND.what);
assert.ok(edges(news).maxX <= -11.55, "newsstand card leaves the Gazette rack alone");

// [LOOK]: only the board the view ray lands on, nearest first.
const aim = (from, to) => {
  const d = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z }, l = Math.hypot(d.x, d.y, d.z);
  return boardsOnRay(SLOTS, from, { x: d.x / l, y: d.y / l, z: d.z / l }).map((h) => h.id);
};
const byId = (id) => SLOTS.find((s) => s.id === id);
for (const s of SLOTS.filter((q) => q.id !== "newsstand" && q.id !== "alley-wall")) {
  const eye = { x: s.x * 0.5 + 1, y: 1.7, z: s.yaw === 0 ? s.z + 12 : 20 };
  assert.equal(aim(eye, s)[0], s.id, `looking straight at ${s.id} names it`);
}
assert.equal(aim({ x: 15, y: 1.7, z: -22 }, byId("alley-wall"))[0], "alley-wall");
assert.equal(aim({ x: -11.8, y: 1.7, z: 21 }, byId("newsstand"))[0], "newsstand");
assert.deepEqual(aim({ x: 0, y: 1.7, z: 20 }, { x: 0, y: 1.7, z: 60 }), [], "a level look across the street names nothing");
assert.deepEqual(aim({ x: 0, y: 1.7, z: 20 }, { x: 0, y: 1.7, z: -20 }), [], "a board behind you is not read");
assert.deepEqual(aim({ x: -1.6, y: 1.7, z: 20 }, { x: -1.6, y: 5.2, z: 31.3 }), [], "looking under the Rivoli fascia names nothing");
assert.ok(new Set(SLOTS.map((s) => s.id)).size >= 5, "five different boards can be read for BOARDWALK GOLD");

const empty = mergeAdConfig({});
assert.equal(empty.domain, "vibecheck9000.com");
assert.equal(filledSlots(empty).length, SLOTS.length);
assert.ok(availableSlots(empty).length >= 2);
assert.ok(pitchCopy(empty).includes("Stripe is off"));
assert.equal(stripeLive(empty), false);
assert.match(checkoutUrl(empty, RATE_CARD[0]), /^https:\/\/github.com\/sponsors\//);
assert.equal(payKind(empty, RATE_CARD[0]), "sponsors");
assert.equal(tillUrl(empty), "https://github.com/sponsors/Sebby1770");
assert.equal(sponsorMailto(empty, RATE_CARD[0]), "");

const mail = mergeAdConfig({ email: "boards@vibecheck9000.com" });
assert.match(sponsorMailto(mail, RATE_CARD[2]), /^mailto:boards@vibecheck9000.com/);
assert.equal(payKind(mail, RATE_CARD[2]), "email");

const stripe = mergeAdConfig({
  email: "boards@vibecheck9000.com",
  stripePaymentLink: "https://buy.stripe.com/test_spire",
  stripeLinks: {
    "tower-spire": "https://buy.stripe.com/test_named",
    "alley-wall": "http://evil.example/not-https",
    "newsstand": "javascript:alert(1)",
  },
});
assert.equal(stripeLive(stripe), true);
assert.equal(isStripeUrl("https://buy.stripe.com/test_named"), true);
assert.equal(isStripeUrl("https://example.com"), false);
assert.equal(checkoutUrl(stripe, { id: "tower-spire", usd: 99 }), "https://buy.stripe.com/test_named");
assert.equal(checkoutUrl(stripe, { id: "alley-wall", usd: 29 }), "https://buy.stripe.com/test_spire");
assert.equal(payKind(stripe, { id: "tower-spire" }), "stripe");
assert.ok(!stripe.stripeLinks["alley-wall"]);
assert.ok(pitchCopy(stripe).includes("Stripe is live"));
assert.ok(pricedRates(stripe).some((r) => r.payKind === "stripe" && r.checkout.includes("stripe.com")));

const paid = mergeAdConfig({
  sponsors: [
    {
      id: "acme",
      brand: "ACME RADIO",
      line: "TONIGHT ON 880",
      url: "https://example.com",
      slotIds: ["tower-far-east"],
    },
  ],
});
const east = filledSlots(paid).find((s) => s.id === "tower-far-east");
assert.equal(east.creative.id, "acme");
assert.equal(east.creative.kind, "sponsor");
assert.ok(classifieds(paid).some((line) => line.includes("ACME RADIO")));

const bad = mergeAdConfig({ slots: { "tower-west": { creativeId: "not-real" } }, sponsors: [{ id: "", brand: "" }] });
assert.equal(filledSlots(bad).find((s) => s.id === "tower-west").creative.id, "gin");

const sponsor = tonightSponsor(paid, 0);
assert.ok(sponsor.brand);
assert.notEqual(sponsor.kind, "available");

let views = recordView({ viewed: [], counts: {} }, "tower-west");
views = recordView(views, "tower-center");
views = recordView(views, "tower-west");
assert.equal(boardsRead(views), 2);
assert.equal(views.counts["tower-west"], 2);

for (let i = 0; i < 5; i++) views = recordView(views, `slot-${i}`);
assert.ok(boardsRead(views) >= 5);

const box = posterCollider();
assert.ok(POSTER_KIOSK.x > box.minX && POSTER_KIOSK.x < box.maxX);
assert.ok(POSTER_KIOSK.z > box.minZ && POSTER_KIOSK.z < box.maxZ);
const from = { x: POSTER_KIOSK.x, y: 1.7, z: POSTER_KIOSK.z - 1.8 };
assert.equal(
  blockedSegment(from, { x: POSTER_KIOSK.x, y: 1.2, z: POSTER_KIOSK.z }, buildColliders().boxes),
  false,
  "poster kiosk is reachable from the sidewalk",
);

const props = boardProps(empty);
assert.ok(props.some((p) => p.id === "board-shop-fascia"));
assert.ok(props.every((p) => p.id !== "board-newsstand"));
assert.ok(props.every((p) => p.action === "rent-board" || p.action.startsWith("ad-open:")));
const colliders = buildColliders().boxes;
for (const p of props) {
  const s = SLOTS.find((q) => `board-${q.id}` === p.id);
  const toward = Math.abs(s.yaw) < EPS ? 1 : -1;
  assert.ok(Math.abs(p.x - s.x) <= s.w / 2 + 5, `${p.id} stands near its board`);
  const target = { x: p.x, y: p.aimY, z: p.z };
  assert.ok(!colliders.some((b) => p.x > b.minX && p.x < b.maxX && p.z > b.minZ && p.z < b.maxZ && p.aimY > b.minY && p.aimY < b.maxY), `${p.id} is not inside a collider`);
  assert.equal(blockedSegment({ x: p.x, y: 1.7, z: p.z + toward * 1.8 }, target, colliders), false, `${p.id} is reachable from the pavement`);
}

console.log("ads.test.js ok");
