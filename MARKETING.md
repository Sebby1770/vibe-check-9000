# Selling the night

VIBE CHECK 9000 is a free first-person 1954 Midtown walk. Money comes from attention on 47th Street, not from a paywall.

## Buy the domain

`vibecheck9000.com` was unregistered when this was written. So were `vibe-check-9000.com`, `midtown47.com`, and `nightofnovember.com`. Buy the first one.

1. Register at [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) or Porkbun. Budget about $12/year for `.com`.
2. In the GitHub repo: Settings → Pages → Custom domain → `vibecheck9000.com`.
3. At the registrar, add:

   | Type  | Name | Target                         |
   | ----- | ---- | ------------------------------ |
   | CNAME | `@`  | `sebby1770.github.io`          |
   | CNAME | `www`| `sebby1770.github.io`          |

   If the registrar blocks CNAME on `@`, use the A records GitHub lists under Pages → Custom domain.
4. Check **Enforce HTTPS** after the certificate appears (often 15–60 minutes).
5. Put the same hostname in `ads.config.json` → `domain`. Do not add a `CNAME` file until DNS actually answers, or the github.io URL can 404.

Optional: `sponsor.vibecheck9000.com` as a CNAME to the same site if you want a cleaner media-kit URL. `sponsor.html` already ships next to the game.

## What is already in the game

- Ten painted boards on the block, including rooftop faces, the Rivoli fascia, the Astoria canopy, the alley, and Lou's newsstand.
- Unsold faces read **YOUR NAME IN LIGHTS / RENT THIS BOARD**.
- Boot screen, pause card, and Gazette classifieds carry tonight's placement.
- A walk-up kiosk, **Midtown Poster Co.**, between the phone booth and the neighborhood board. Press E for the rate card.
- `ads.config.json` is the insertion order. Drop a sponsor in `sponsors` with `slotIds` and a 16:9 still.

Example paid row:

```json
{
  "email": "you@vibecheck9000.com",
  "sponsors": [
    {
      "id": "acme",
      "brand": "ACME RADIO",
      "line": "TONIGHT ON 880",
      "kicker": "PAID PLACEMENT",
      "url": "https://example.com",
      "art": "assets/ads/jazz.jpg",
      "slotIds": ["tower-far-east"]
    }
  ]
}
```

## How to charge

| Product | Price | How they pay |
| --- | --- | --- |
| Rooftop board, 30 nights | $59–$99 | Stripe Payment Link, then you paste the creative into `ads.config.json` |
| Street / alley / newsstand | $19–$49 | Same |
| Visor inserts (boot + pause + Gazette) | $99 | Same, plus a URL |
| GitHub Sponsors / Ko-fi | $3–$20/mo | Already on the pause screen as ION's till |
| Night-stamp prints | $12–$24 | Printful or a local printer; the STAMP button already exports a card |

## GitHub Sponsors

You do not have a public Sponsors listing yet (`github.com/sponsors/Sebby1770` redirects to your profile). Join here:

1. Open [github.com/sponsors](https://github.com/open-source/sponsors) while logged in as **Sebby1770**.
2. Or go to [github.com/settings/profile](https://github.com/settings/profile) → **GitHub Sponsors** → **Join the waitlist / Get started**.
3. Direct setup: [github.com/account/settings/profile/sponsors](https://github.com/sponsors/accounts).
4. Pick tiers ($3 / $5 / $12 is enough). GitHub pays out to a supported country bank or Stripe-connected account.
5. When the listing is live, `https://github.com/sponsors/Sebby1770` stops redirecting. The pause-screen till already points there.

## Stripe Payment Links

No server and no secret key in this repo. Payment Links are public checkout URLs.

1. Create an account at [stripe.com](https://stripe.com).
2. Dashboard → **Payment Links** → **New**.
3. Make one link per price: $19, $29, $45, $49, $59, $75, $79, $85, $89, $99. Product name e.g. `47th Street · Spire tower · 30 nights`.
4. Copy the URL. It looks like `https://buy.stripe.com/00g9ABxxxx`.
5. Paste into `ads.config.json`:

```json
{
  "email": "you@vibecheck9000.com",
  "githubSponsors": "https://github.com/sponsors/Sebby1770",
  "stripePaymentLink": "https://buy.stripe.com/YOUR_DEFAULT",
  "stripeLinks": {
    "tower-spire": "https://buy.stripe.com/YOUR_SPIRE_99",
    "alley-wall": "https://buy.stripe.com/YOUR_ALLEY_29",
    "boot-pause": "https://buy.stripe.com/YOUR_VISOR_99"
  }
}
```

Empty strings are ignored. `http://` and non-Stripe hosts are ignored. A named `stripeLinks` entry beats the default `stripePaymentLink`. If neither is set, PAY becomes TIP and opens GitHub Sponsors (or ASK if `email` is set).

After a buyer pays, they still email you the 16:9 still. Put it in `assets/ads/` and add a `sponsors` row with `slotIds`. Push. The board updates on the next Pages deploy.

Do not put a Stripe secret key in this repo. Payment Links are enough.

Do not run ordinary display-ad iframes over the visor. They break pointer lock and look like 2026. The boards are the ad unit.

## First thirty days

1. Buy the domain and turn on HTTPS.
2. Ship the live night. Record 20 seconds of walking out of the club into the rain, looking up at the boards.
3. Post that clip: TikTok, Reels, X, itch.io, [r/WebGames](https://www.reddit.com/r/WebGames/), [r/InternetIsBeautiful](https://www.reddit.com/r/InternetIsBeautiful/), Product Hunt, Show HN.
4. itch.io page, tag `3d`, `first-person`, `atmospheric`, `web`. Price: free, with a tip jar.
5. Email three local-feeling brands (coffee, records, film, independent radio) with `sponsor.html` and one screenshot of their mockup on a tower.
6. Keep house ads on unsold boards so the street never looks empty.

The audience is small at first. A handful of $79 rooftops plus Sponsors is the honest early number. The domain is so the media kit does not say github.io when someone with a budget asks.