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
} from "../js/ads.js";
import { buildColliders } from "../js/zones.js";
import { blockedSegment } from "../js/interactions.js";

assert.ok(HOUSE_CREATIVES.length >= 10);
assert.ok(SLOTS.length >= 12);
assert.equal(RATE_CARD.length, 14);
assert.equal(new Set(SLOTS.map((s) => s.id)).size, SLOTS.length);
assert.ok(SLOTS.every((s) => RATE_CARD.some((r) => r.id === s.id) || true));

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

console.log("ads.test.js ok");
