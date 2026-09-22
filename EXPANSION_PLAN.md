# v21 — A block worth getting lost in

The v20 catalogs made purchases useful. This expansion adds participation, street destinations, and longer reasons to explore. Preserve all existing shops, deliveries, saves, and the free, unhurried character of the game.

## 1. Work the counters

Add a second page inside every shop: a short, replayable counter activity. Rex needs a three-part set; Iris has a fountain recipe; Lily needs a bouquet and wrapping; Rosie has a packing order; Tony has a portrait appointment; Walter needs the reels in order; Dottie needs a supper tray. Each has a clear brief, tangible component choices, a live illustrated work surface, helpful feedback, and a named finished result. Briefs vary by calendar day. No timer or punishment for experimenting.

Completing each counter stamps a seven-shop passport. Completing the whole passport earns a permanent visor look. Completed work appears in the notebook, and shop counters display their completion seal in the world. Catalogs and previews remain available.

## 2. Add street destinations

- **The Corner Set:** a small street stage, musician, lamps, and playable three-pad call-and-response. Listen to a phrase and repeat it; longer phrases increase the score. Mouse, touch, and keyboard work. Keep a best score and earn a street souvenir.
- **Mabel's Night Cart:** striped canopy, hot chestnuts, pretzels, and cocoa. Choose a snack, receive a once-per-night energy benefit, and keep a receipt.
- **47th Camera Club:** a camera kiosk that lends a camera. Photograph the actual game world with C or an on-screen control. Store a bounded six-photo album and export individual captioned postcards. Photo discoveries persist independently of deleting a picture.
- **The neighborhood board:** a physical noticeboard that introduces the new destinations, the passport, and the mystery, with map guidance.

Place new fixtures on sidewalk edges, keeping shop entrances, pedestrian paths, and the traffic lanes usable. Add collision boxes and verify approaches. Use shared geometry and modest decorative detail.

## 3. Follow the midnight frequency

Turn the existing payphone into an optional authored mystery. A wrong-number caller sends the player to a marked sleeve at Rex's, the camera kiosk contact sheet, and Astoria's lost-property case, then back to the phone. Physical clues must be visited in order. The notebook always records the next lead, and every clue has a visible in-world prop. Finish with a new procedural club set and a permanent visor look. Keep the story available at any hour so it cannot strand the player.

## 4. Connect and polish

Expand the pocket notebook with a passport and photo album. Add the new destinations to the map and noticeboard. Save new progress without discarding v20 inventory, selected sets, portraits, or unlocks. Include meaningful new achievements in the recap. Ensure overlays clear movement, trap focus, stop activity sounds, and work on phones and short laptop screens. Restore the correct music after reload.

## Verification

- Pure tests: every daily counter brief, incorrect and correct work, idempotent rewards, passport completion, ordered clues, street scores/snacks, bounded photos, save migration, and new-day reset.
- Geometry checks: all new fixtures have reachable interaction points and preserve existing thresholds.
- Browser journeys: each counter activity, full mystery, rhythm controls, food cart, actual photo capture/export, album deletion, reload, and small-screen layouts; rerun v20 regression journeys.
- Visual review: new street destinations, workshop pages, album, noticeboard, and phone. Record actual limitations; do not claim physical-device performance from an emulated viewport.

## Delivered — 14 September 2026

All four implementation sections above are complete in the v21 local working tree. The previous v20 shop upgrade remains intact.

Verification passed:

- `npm test`: all eight test files, including 189 counter-order combinations and expansion state/migration checks.
- `npm run test:expansion`: 16 browser journeys covering seven counters, all street activities, the complete mystery, actual game photographs and postcard rendering, deletion, keyboard focus, reload, and phone-sized layouts.
- `npm run test:browser`: all 15 existing shop/delivery journeys pass against v21.
- Both browser suites report no unhandled browser errors. Syntax checks and `git diff --check` pass.
- Visually reviewed the workshops, noticeboard, passport, album, postcard, musician, cart, camera kiosk, and small-screen layouts. Refined short-screen layouts, focus restoration, camera resolution, unobstructed photo framing, and the stage instrument/pads.

Browser fixtures use local-only scene positioning to reach interactions. Mobile verification covers emulated screen layouts and control sizes; physical-phone performance and immersive VR were not tested. This is a local implementation, with no deployment or git push performed.

Screenshot/report artifacts: `/tmp/vibe-check-expansion` and `/tmp/vibe-check-browser`.

