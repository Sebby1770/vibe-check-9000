# v22 — Make a life on 47th Street

## Scope

1. Organize every shop into Tonight’s selection and Home & keepsakes. Show prices, wallet balance, owned items, receipts, staff picks and a clear paid-work entry. Preserve the seven unique shops and existing activities.
2. Introduce persistent fictional dollars. Start with $120, pay $20 for each first nightly counter favor, and offer repeatable three-order shifts at seven stores and the club. Pay $45–$65 per completed shift with experience-based raises. Never pay incomplete or duplicated submissions. Keep a bounded transaction ledger. No real payments, debt or daily work limits.
3. Turn Astoria’s unused second-floor space into three furnished, walkable apartments with distinct palettes, prices and visible ownership doors. Browse at the lobby property desk, save toward a chosen home, buy once, open its door and move in. Add seven permanent shop furnishings visible in the active home. Keep cash, properties, furnishings and job progress across nights.
4. Give the nightclub a physical lighting/soundcheck console, four selectable room looks, a three-order soundcheck job, and an optional patron pass unlocking the fourth look. Let color palettes change the actual floor, washes and lasers. Add lounge and entrance signage without obstructing circulation.
5. Add a Life on 47th panel for wallet, jobs, homes and club control; make it reachable from the notebook and physical destinations. Preserve keyboard focus, movement suspension and mobile usability. Explain exactly where to go for work and housing.

## Verification

Pure tests for prices, insufficient funds, replay-safe purchases, job resumption/raises, daily reset, apartment gates, furniture ownership and save migration. Browser journeys for shop purchase → job → paycheck → apartment → furnishings → club scenes → reload, plus previous shop/expansion journeys. Visually inspect the new shop departments, jobs, home listings, physical apartments and nightclub; check mobile layout and keyboard focus. Local implementation only.

## Delivered — 22 September 2026

The complete feature set is implemented on top of the current v24.2 checkout, preserving the newer street, advertising, traffic and performance work. The plan began as v22; later project commits incorporated its core systems before this final polish pass.

All seven stores have priced catalogs, collection filters, homewares and paid-work entries. Eight careers pay for completed three-order shifts, with experience raises. Three physical Astoria apartments can be bought and entered, and all seven shop furnishings can be installed or stored. Wallet balances, keys, furniture, job progress and club palettes persist across nights. The four nightclub palettes affect actual floor, wash and laser colors.

Final polish adds seven illustrated homeware cards, compact order-first job layouts, framed skyline windows, curtains, ceilings and trim in the apartments, safe Life-panel closing before entering the night, contextual workplace access, and wrapped mobile HUD controls. Bed collision volumes block walking while allowing sight over them.

Verification completed:

- All 11 files in `npm test` pass, including economy, jobs, save migration/day rollover, apartment approaches, advertising and traffic checks.
- 17 Life browser journeys pass, exercising real purchases, every job, wrong orders, pay, mid-shift reload, locked/purchased front doors, all furnishings, club palettes, mobile layouts and saved ownership.
- All 15 existing shop/delivery browser journeys and 16 expansion journeys pass: 48 automated browser journeys in total, with no unhandled browser errors.
- Additional browser checks confirm Life closes back to the welcome screen before entry and every HUD control fits a 390px viewport. The welcome-screen regression is also added to the Life suite for subsequent runs.
- Reviewed screenshots of the shop departments, product illustrations, paid orders, homes, physical apartment, club controls, nightclub floor and mobile panels. Syntax checks and `git diff --check` pass.

Artifacts: `/tmp/vibe-check-life`, `/tmp/vibe-check-browser`, `/tmp/vibe-check-expansion`. Current local preview: `http://127.0.0.1:8128/`.

Browser positioning uses the loopback-only inspection API. Ownership and gameplay actions run through the actual UI; physical door checks use player movement. Mobile checks use emulated viewports, not a physical phone. No VR testing was performed. This polish is included in the v25.0.0 release alongside the east-side neighborhood and soundtrack update.
