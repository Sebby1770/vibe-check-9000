# VIBE CHECK 9000: improvement and launch plan

Updated 25 September 2026 against v28.0.0. This is a proposed roadmap; multiplayer, accounts, analytics and new paid products below are not implemented.

**The pitch:** Make a life on a rainy 1954 city block. Work a shift, discover your favourite shop, furnish an apartment, and finish the night at a jazz club. Play straight in your browser.

## Where the game stands

- A connected neighbourhood with shops, parks, jobs, fictional money, seven furnishings, five purchasable apartments, photography, music and a nightclub.
- **One human per world.** Other characters are NPCs. Visitors can play separate sessions, but cannot currently meet each other.
- Progress lives in browser storage. It does not automatically follow a player to another device or website origin; clearing site data can remove it.
- No multiplayer server, account system or analytics integration was found in the current game. We have no measured player count, retention rate or maximum concurrent audience.
- Billboard sponsorship plumbing exists, but `ads.config.json` has no sponsors, contact email or Stripe checkout links. It contains a GitHub Sponsors URL; payout eligibility and the live account status need checking before promotion.
- `vibecheck9000.com` is a configured name, not evidence of domain ownership or working DNS. Verify those before using it in publicity.

## Improvement order

Build a compelling repeatable evening before expanding the map again. Sizes below are relative engineering scope, not delivery promises.

| Priority | Proposed improvement | Scope | Release evidence |
| --- | --- | --- | --- |
| 1 | A clear first evening: meet a shopkeeper, complete a paid shift, choose a savings goal and buy a first furnishing | Small–medium | At least 8 of 10 observed new testers finish their first job without verbal help |
| 2 | More believable people: a consistent character rig, better faces/hair, varied clothing, grounded walking and hand-to-prop contact | Medium–large | Close-up and street views look coherent; feet and held props stay attached during movement |
| 3 | Distinct shop activities: prepare coffee, sort records, arrange flowers and make deliveries using different interactions | Medium per activity | Jobs feel different, work on touch screens and survive leaving/reloading mid-shift |
| 4 | Personal homes: place/rotate furnishings, wall colours, wardrobe, lights and record collections | Medium–large | Furniture cannot block exits or escape rooms; all five homes save correctly |
| 5 | A changing neighbourhood: NPC friendships, small storylines, a park market and scheduled club performances | Medium per storyline | Returning players find a new choice or scene; events have clear times and do not punish missed days |
| 6 | Invite friends into the same city | Large | Eight real players can join, reconnect and complete an evening without lost purchases or conflicting ownership |

Apply performance and usability work throughout: shared geometry/materials, distance-based character detail, fewer expensive lights, graphics presets, consistent signage and readable interiors. Target 60 FPS on a named reference laptop and 30 FPS on a named midrange phone, then record measurements; these are targets, not universal performance claims.

Before the public launch, add save export/import with version checks and backup recovery. Keep old saves compatible. Test movement, purchases, apartment doors, sound, keyboard and touch controls after gameplay releases. Add reduced camera motion and readable dialogue sizes alongside existing effects/audio controls.

**Recommended next development slice:** the first-evening guide, a more physical diner job, and save backup. Test that slice with ten new players before committing to the larger multiplayer build.

## How many people can join?

| Stage | Humans in the same world | Status |
| --- | --- | --- |
| Current game | You only; zero other human players | Implemented |
| Friends beta | 8 total: you plus 7 friends | Proposed first target |
| Expanded rooms | 16 total: you plus 15 friends | Only after load and device testing |
| Larger audience | Multiple separate rooms | Requires measured server capacity and an operating budget |

People loading independent copies is a separate question from multiplayer room size. GitHub Pages gives this project no guaranteed concurrent-player count; bandwidth and rate limits apply. Its documented soft bandwidth limit is 100 GB/month. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

### First multiplayer release

- Invite-code rooms, player names, avatar choices, emotes and synchronized dance/music events.
- Walk together, complete a cooperative delivery and visit an apartment with its owner's permission.
- Keep wallets and possessions personal. Each player owns their own version of an apartment; visiting loads that owner's interior, avoiding competition for only five permanent homes.
- Start with private rooms and emotes. Add public text chat only alongside mute, block, report and an actual moderation process. Voice chat is outside the first release.
- Retain solo play for players who do not want to connect.

### Technical path and release gates

1. Separate local presentation from authoritative world state. Prototype two clients moving in one room before networking the full city.
2. Add a separate Node.js game server. [Colyseus](https://docs.colyseus.io/) is a candidate because it supplies authoritative rooms, state synchronization and matchmaking; it still needs integration and hosting.
3. Add identity and persistent storage. Validate wages, inventory, purchases and apartment permissions on the server. Do not trust balances uploaded from editable browser saves. Offer an explicit migration or separate online profile while keeping solo saves intact.
4. Synchronize positions, animations, interactions and the clock; smooth movement and handle reconnects. Avoid sending scene geometry over the network.
5. Test two clients, eight simulated clients, then eight real players on mixed devices. Check duplicate purchase requests, room capacity, joins/leaves, network delay and a 30-minute session without lost progress. Record client frame times, server CPU/memory, bandwidth and response latency.
6. Measure server/database costs at the tested workload, set spending limits, then choose a public room count. Repeat the checks before raising a room to sixteen players.

Eight and sixteen are design targets, not measured limits. Many rooms need capacity planning; an MMO-sized shared city is a separate project.

## A practical first month of marketing

This is a proposed campaign after the demo is ready, not a promise to complete the development roadmap in thirty days.

| Week | Work | Useful evidence |
| --- | --- | --- |
| 1 | Test the first evening with 10 people. Capture six screenshots and a 20–30 second gameplay trailer. Prepare a short description and one play link. | Where people get stuck; whether they understand the job → home → nightlife loop |
| 2 | Prepare an itch.io browser page and publish three short clips across TikTok, Reels and Shorts. Offer an optional way to follow updates. | Visits, game starts and which clip brings interested players |
| 3 | Invite 10–20 more testers. Prepare personal pitches for about ten small cozy-game/browser-game creators. Share a devlog where community rules permit promotion. | Completed first jobs, useful feedback and voluntary return visits |
| 4 | Release an update addressing the common friction. Show a before/after clip and apartment tour. Test an optional supporter offer. | Returning players, supporter interest and revenue after fees |

Suggested clip hooks:

- “I worked in a record shop until I could buy this apartment.”
- “Turning an empty street into a neighbourhood you can live in.”
- “A rainy jazz-club city you can play in your browser.”
- “Which apartment would you choose?”

Show gameplay in the opening seconds and end with the playable link. Reuse photo postcards and night stamps as player-made shareable moments. Describe the game as single-player until multiplayer ships. Do not market its characters as photorealistic.

Aim initially for 100 real testers and 30 useful feedback responses; these are campaign goals, not traffic forecasts. Hold paid advertising until there is evidence people enjoy and revisit the demo.

Before analytics, define a small measurement set: game start, first job completion, first furnishing, first apartment, return visit and support-link click. Use an appropriate privacy notice and avoid unnecessary personal information. Measure conversion against game starts; distinguish clip views from actual players. No analytics service is configured yet.

Test the itch upload inside its actual embed: pointer lock, fullscreen, audio activation, mobile controls and saves. Existing github.io saves will not automatically transfer. itch hosts HTML games from a ZIP containing `index.html`; its embedded HTML5 payments currently work as donations. [itch.io HTML5 guide](https://itch.io/docs/creators/html5)

## How to earn money

Start with a free playable game and an optional way to support it. Keep fictional wages and basic apartment progression separate from real-money purchases.

| Stage | Offer to test | Requirements |
| --- | --- | --- |
| First public release | Optional donations on itch | Working payout account, honest description, a demo people enjoy |
| Early supporters | Downloadable art/postcard/wallpaper pack; original music if distribution rights are clear; test roughly A$5–10 equivalent | Finished pack, previews, rights review, support/refund information and separate downloadable product |
| After accounts exist | Optional avatar outfits and home decoration packs | Server-verified payment entitlements and restore-purchase support; no reliance on localStorage for paid ownership |
| After an audience is measured | Clearly labelled, period-styled billboard sponsorships | Actual reach figures, agreed placement/duration, approved creative and a contact/payment process |
| After retention is established | Larger paid downloadable edition or expansion | Enough additional content to justify a price and a supported delivery/update process |

Do not start with a subscription or game-money packs. Build a reason to return, followed by an optional product worth buying. Base sponsorship prices on measured audience and placement, not promised income from empty boards.

Embedded itch HTML5 games take donations; fixed-price access uses a downloadable product. itch lets creators choose the platform revenue share, with payment-processing fees additional. Check the account's supported settlement currency before setting local price equivalents. [HTML5 payment rules](https://itch.io/docs/creators/html5) · [itch payment documentation](https://itch.io/docs/creators/payments)

Illustration only: 1,000 players × 2% buying a pack × A$8 = **A$160 gross**. At 10,000 players with the same assumed conversion, that becomes **A$1,600 gross**. Neither traffic nor conversion is a forecast. Fees, refunds, hosting, asset costs and applicable taxes reduce that amount. Compare actual net receipts with operating costs before scaling.

Keep the source on GitHub. Put the commercial storefront on itch or suitable commercial hosting; GitHub Pages restricts use as an online-business/e-commerce host or a site primarily facilitating commercial transactions. Reassess game hosting before sponsorship sales or paid services become its main purpose. [GitHub Pages policy](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

## Existing sponsorship configuration

The billboard code can be reused once there is an advertiser. `sponsor.html` and the in-game rate card are existing sales surfaces, not proof of active sponsors or verified audience figures; review their wording and rates before outreach.

Configuration lives in `ads.config.json`:

- `email`: monitored business contact, currently blank.
- `githubSponsors` / `koFi`: verify that destinations accept support for this account before promotion.
- `stripeLinks`: per-placement public checkout URLs; `stripePaymentLink` is the fallback. All are currently blank. Never store payment secrets here.
- `sponsors`: approved creative and placement IDs. Keep paid placements visibly labelled.

Example sponsor entry, to add only after an actual agreement:

```json
{
  "id": "example-radio",
  "brand": "EXAMPLE RADIO",
  "line": "TONIGHT ON 880",
  "kicker": "PAID PLACEMENT",
  "url": "https://example.com",
  "art": "assets/ads/example-radio.jpg",
  "slotIds": ["tower-far-east"]
}
```

Agree placement, duration and creative with the buyer; update the config, preview the sign in-world, then deploy. Track its removal date because this example does not automatically expire. Public payment links alone do not provide automatic in-game purchase verification.

No accounts, paid services, outreach messages, advertisements or checkout links were activated as part of writing this plan.
