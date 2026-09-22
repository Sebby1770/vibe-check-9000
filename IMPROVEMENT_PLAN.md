# Vibe Check 9000 — shops and the living block

Planning baseline: v19.0.0, commit `3a1f5f7`. The core shop upgrade below is now implemented in the v20 working tree. The original review and priorities remain as a record of the design.

Implemented: all seven catalogs (21 selections), record previews and REXA sets, four connected deliveries, pocket notebook/map, pharmacy and diner services, barber portraits, three cinema shorts, the midnight booth story, distinct shop interiors, local sounds, shared targeting, nightly saves, and reward fixes.

Follow-up scope: full customer queue/pay/leave schedules, shop closing routines, and performance targets measured on physical mobile devices. Current customers have small browsing movements and existing clock-driven visibility. The automated phone checks verify layout, not physical-device performance.

The biggest opportunity is to give the existing places more depth. Keep the rainy 1954 Midtown setting, dry character dialogue, procedural art, and impossible nightclub. Make every shop offer something worth doing, something worth keeping, and a reason to return.

## What the review found

- All six shops already have interiors, workers, props, and individual colors. Several share a shallow room with a rear counter and similar shelves (`js/shops.js`). Distinct layouts and recognizable merchandise would help them feel like separate businesses.
- Purchases mostly show a toast, set a flag, and sometimes add energy (`js/main.js:344`). The record bin grants a record immediately (`js/people.js:1037`); it does not offer browsing or playback. Roses and gin have no further use beyond dialogue memory.
- Interaction checks all nearby NPCs before checking objects or seats (`js/main.js:423`). It does not consider the player's aim or walls. Tony can take priority over his chair even when the player stands at its center.
- Some dialogue rewards run twice: Sid's purchase choice has the vinyl action, and leaving the following node executes it again (`js/people.js:767`, `773`, `1141`). Repeated record and tonic interactions can also repeatedly grant energy.
- A new day resets `night`, but daily challenges and the recap mostly read lifetime flags, visits, and energy. Per-night-only changes can be skipped by the save/update check (`js/progress.js:92`, `195`; `js/night.js:215`; `js/main.js:108`). This needs correction before adding more daily objectives.
- The Rivoli has an animated title card, seating, and a ticket interaction. A ticket currently does not unlock a screening. Its canvas redraws on every update, including when the player is elsewhere (`js/shops.js:139`; `js/city.js:653`).
- Shops mix the same club, jazz, and rain audio sources at different levels (`js/audio.js:470`). Local sounds would add character without needing a larger map.

## Priority 1 — make interaction and progress dependable

Use one target selection function for both the prompt and the action. Select people, merchandise, counters, and seats by aim, reach, and line of sight. Keep generous target areas for touch controls and provide explicit action buttons.

Move rewards into a small, testable action handler. A completed action should grant its reward once; browsing and dialogue exits should not grant purchases. Define intentionally repeatable activities separately.

Separate permanent discoveries and cosmetics from the active night's items, completed errands, conversations, and energy. Save changes to either. Preserve existing unlocked looks when migrating saves. Daily challenges and the recap must describe the appropriate night.

Completion checks: aiming at Tony's chair lets the player sit; walls block interactions; one purchase gives one reward; reload preserves owned items; a fresh day does not complete a dare using yesterday's purchase.

## Priority 2 — build Rex's Records as the first complete shop

This should establish the quality standard for the remaining shops.

1. Enter a recognizable record store with illustrated sleeves, labeled bins, a counter, and a listening booth.
2. Browse three records with short descriptions and distinct previews using the existing procedural audio system.
3. Choose a record and keep it in a small pocket inventory. Show a sleeve or brief handoff animation as feedback.
4. Return to REXA and offer the record. She reacts and plays a corresponding arrangement; the room responds.
5. Record the purchase and the club moment in the recap. On return, Sid remembers the actual selection.

Start with generous access to the records. A currency system can be considered later if it makes the choices more interesting. Item ownership, useful consequences, and satisfying feedback are the initial requirements.

Completion checks: a player can discover this sequence through signs and dialogue; previews stop correctly; the selected record changes the club arrangement; revisiting and reloading cannot duplicate the reward; guest audio playback still works.

## Priority 3 — give every business a signature experience

| Place | Activity and visual identity | Consequence elsewhere |
| --- | --- | --- |
| Lily's | Choose and wrap a bouquet; dense stems, buckets, handwritten cards, wrapping bench | Deliver it to a character with a distinct response and a visible display of the flowers |
| Dottie's | Read a menu, order, sit, and receive visible coffee or pie; grill sounds and booth lighting | Hear a useful rumor or meet someone after the club closes |
| 47th Pharmacy | Use the soda fountain and choose a drink with clear effects; labeled bottles, tiled counter, stools | Receive a short comfort or energy effect and a lead about another location |
| Midtown Gin | Inspect labeled bottles and collect a requested order; amber shelves, crates, counter bell | Supply the lounge through an optional errand and see the bottle placed at its destination |
| Tony's | Sit, select a look, and watch a brief service animation; striped pole, tools, patterned floor | See the result in a portrait/photo stamp and get a character reaction; provide a clear preview in first person |
| Rivoli | Inspect posters, choose a screening, present a stub, and sit in a small auditorium | Watch a short original procedural film with a clue or event that connects to the block |

Keep these services brief and optional. Each needs its own interaction, feedback, and payoff, even where they share inventory or dialogue code. Cinema and portrait work come later because they introduce more rendering and presentation work.

## Priority 4 — connect the block through short stories

Add a few authored errands with a beginning, a physical action, and a visible ending. Use the existing cast and locations:

- Sid's record reaches REXA and changes the set.
- Lily's bouquet reaches Velma before a performance and appears near the piano.
- Frank asks for ice, the player collects it from the actual machine, and returns it to him. Nellie's directions should reveal the machine rather than complete the errand.

Show active leads and carried items in a compact pocket notebook. Add an optional illustrated block map with entrances, the subway, the hotel stairs, and a chosen destination. Gazette snippets and dialogue should provide directions in the world's voice.

Later, add a few clock-driven changes: a last screening, staff closing up, customers moving to Dottie's, or a performer taking a break. Offer alternate outcomes when an event is missed and keep essential routes usable. Daily variation should change an activity or encounter as well as its headline.

## Priority 5 — improve atmosphere, clarity, and performance

- Rework storefronts with display windows, inset entrances, readable signs, awnings, and warm interior light. Give each room a different layout and a clear landmark visible from its entrance.
- Add small customer routines: browse, queue, pay, sit, leave. Shopkeepers can acknowledge arrivals and perform their service. Move characters only after interaction targets can follow their live positions.
- Add localized turntable crackle, a fountain hiss, clipping sounds, a projector, shop bells, and quieter street audio indoors. Give audio its own controls.
- Improve text contrast and reduce bloom on signs and surfaces that need to be read. The browser review showed strong glare at the entrance and crosswalk. Keep adjustable visor effects and separate motion preferences from audio preferences.
- Measure frame time before increasing detail. Reuse meshes/materials, instance repeated stock, reduce distant animation work, and update the film texture only when visible and at its intended frame rate. Establish desktop and mobile performance targets on actual test devices.

## Delivery order and verification

| Milestone | Scope | Size |
| --- | --- | --- |
| A | Targeting, single rewards, night-state correction, save migration | Medium |
| B | Rex's interior, browsing, previews, inventory, REXA payoff, recap | Large |
| C | Lily's and Frank's connected errands, notebook and optional map | Medium–large |
| D | Dottie's, pharmacy, gin, and barber services with local sound and routines | Large; release shop by shop |
| E | Rivoli auditorium and film, scheduled encounters, broader visual polish | Large |

Sizes express relative scope, not delivery promises. Profile rendering and check accessibility throughout these milestones.

For each milestone, run the existing tests plus focused checks for its new state transitions. Add browser journeys covering the first shop visit, completion, return visit, reload, daily rollover, touch interaction, and reduced effects. Test full routes through doors, counters, chairs, and stairs. Confirm new content appears in the recap and preserves existing cosmetics.

Original planning review: `npm test` passed all five existing test files. The local browser rendered the entry screen and allowed movement from the club onto 47th Street; the browser error check at startup reported no errors. All six shop interiors were reviewed in source, not individually playtested. No performance benchmark or mobile playtest was performed during this planning review.


## v20 verification — 13 September 2026

`npm test` passes all seven test files. The commerce cases exercise every catalog selection, repeat rewards, delivery consumption, selected versus playing records, migration, reload, and new-day reset. Interaction cases cover aim, walls, floors, chair priority, all six street shop entrances, the DJ booth, and the upstairs ice machine.

`VIBE_TEST_URL=http://127.0.0.1:8127 npm run test:browser` passes 15 journeys with no browser errors: all seven businesses, record previews, four deliveries, barber seating/portrait, animated cinema, the midnight story, notebook/map, stamp export, reload, phone-sized layout, and independent reduced-effects/audio controls. The browser uses scene positioning to reach fixtures; these checks do not represent a full walking-route or physical-phone playtest. Screenshot artifacts are written to `/tmp/vibe-check-browser`.

Visual review corrected a patron overlapping the cinema seat and made catalog actions visible on short desktop screens. Syntax checks and `git diff --check` pass. Changes are in the local working tree; no release has been published.
