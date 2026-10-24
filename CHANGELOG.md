# Changelog

All notable changes to VIBE CHECK 9000™ are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [35.0.0] - 2026-10-25

### Night streets, taxi fares and the sound of traffic

- **Street lighting** (`js/render/street-lights.js`): every lamp post in the city (47th Street, the east district and the open city) registers itself. Each gets a soft pool of warm light on the pavement after dark, all in one instanced additive draw, and a fixed pool of six point lights (two on Low) follows you from lamp to lamp, fading in where it lands, so the pavement and passers-by near you are lit by the lamps above them. The light count never changes, so no shader recompiles. 47th Street's four fixed lamp lights are gone.
- **Headlights** (`js/vehicles/night-lights.js`): every moving car (47th Street and the avenues) throws a warm beam on the road ahead, a bright spill at the bumper and a faint red glow behind, one merged mesh per car on one shared material that fades in with the lamps. The car you drive wears the same lights instead of the old cone beams.
- **Taxi fares** (`js/taxi/taxi.js`). In any Checker press **T** for the roof light, and a fare hails from the kerb with an arm up (349 kerbs, every 30 m on both sides of every street, clear of junctions). Stop beside them and they get in and name one of 21 destinations (landmarks, subway stops, the club, Dottie's, the Astoria, the shops); the route marker and map lead there and the HUD shows the distance and the meter. Stop at the kerb there to be paid: a $3 flag-drop and about 40 cents a block, plus up to half again for a quick ride, into your wallet. The next fare hails at once. Leave one waiting two minutes and they give up; switch the light off or get out mid-ride and your passenger leaves unpaid.
- **Traffic sound** (`js/vehicles/traffic-sound.js`, `js/audio.js`): the nearest four cars, yours always first, each get an engine voice placed where the car is (detuned oscillators through a resonant low-pass, with tyre noise), whose note climbs through a three-speed column shift with a touch of Doppler as cars pass. A car stopped dead behind you in the road leans on the horn after a moment; somebody down the block honks every half minute or so. Horns are two notes a third apart, voiced per kind (the bus is low, the police car high). Traffic is muffled through the walls indoors and follows Mute. Your own horn (**H**) uses the same two-tone horn.
- **Fix: walking past the shops stalled the game.** The shop and hotel lamps were hidden beyond 24 m, so the number of lights changed as you walked along 47th Street, and three.js recompiled every lit material in view each time (19 shaders and up to two seconds the first time you looked east from the club). They now share a fixed pool of five lights (`js/render/light-pool.js`, the same pool the street lamps use), and the scene holds 24 point lights wherever you are. The game also compiles about a third fewer shaders.
- Every one of 47th Street's 13 lamps throws a streak of light across the wet road (the four lamps that used to have real lights were the only ones that did).
- Tests: `tests/light-pool.test.js` (a fixed light count, the nearest lamps, fading, steady assignment); the district walk now waits for smooth frames before walking.
- Tests: `tests/taxi.test.js` (kerbs on the pavement, destinations, pay, a whole fare, patience, light off), `tests/taxi-browser.test.js` (`npm run test:taxi`: board, ride, paid into the wallet, light off when you get out) and `tests/traffic-sound.test.js` (gears, voice slots, your car first, held-up honks, city honks, the sim's held flag).

## [34.0.0] - 2026-10-22

### A living city

- **Avenue traffic** (`js/openworld/avenue-sim.js`, `avenues.js`): every street except 47th Street (which keeps its own fleet) runs a car-following simulation in both directions: 16 roads (collinear pieces merged), 184 cars. Signals at every junction alternate between crosstown streets and the avenues with an all-red between, and 47th Street's fleet obeys the same signals where it crosses them. Cars stop for you on foot and for the car you're driving, knock you over if you walk into one, and block your car. All cars are simulated; a pool of 26 period models is lent to the nearest. Kessler's limousine moves to the 50th Street kerb, clear of the lanes.
- **Fix: traffic could drive into the car in front.** In `stepTraffic`, a stop line nearer than the car ahead replaced the distance to that car instead of taking the closer of the two.
- **Safer junctions (from review).** Broadway has its own signal phase (it crosses Seventh Avenue, which shared its green). Junction boxes account for skewed crossings, and boxes closer than a car length plus its gap merge into one. A car facing red goes through on amber only if it can clear the junction before cross traffic moves; otherwise it brakes hard. On green it enters a junction only with room past it and time to clear ("don't block the box"). Vehicles queue and stop by their real length (the 10.6 m buses no longer poke into cross streets), and the render pool only lends a model of the matching kind. You, your car and the car you leave in a lane are solid: traffic stops dead rather than drive through. A six-minute whole-system test with every vehicle at real size checks that nothing ever overlaps.
- **Fix:** the bookend and infill windows on 47th Street sat 2 cm behind their walls, so they never showed; they now sit proud of the wall like the rest.
- **Facade kit** (`js/facade-kit.js`): stone surrounds with recessed panes, sills and keystone lintels on all 10,973 windows of the original 47th Street towers, and corbels under every cornice, in two instanced draws. Anything behind a sign is skipped; the Low tier goes without it.
- **Pedestrians**: about one walker per 28 m of open-city street (over two hundred), drawn out to 110 m, and nine groups of people talking at the landmarks.
- **From the v33 review**: Midtown Gin's left door opens less so it clears the display inside; no bar stool where Ion stands; the club queue is solid, so you walk round it.
- Tests: `tests/avenues.test.js` (merging, junctions, signals, two minutes of traffic with no collisions, red lights, stopping for you, knockback, 47th Street junction stops).

## [33.0.0] - 2026-10-21

### Velvet Tuesday, doors everywhere, and people who look like people

- **Club ground floor** (`js/club-deco.js`): an Art Deco ballroom round the LED floor — lacquer wainscot and fluted plum walls with a gilt frieze and warm cove, gilded pilasters with shell sconces (replacing the bare steel columns), a coffered plum-and-gilt ceiling, black terrazzo with a brass-framed dance floor, a fluted bar with a marble top and brass rail, a mirrored onyx backbar with 160 bottles and a clock, chrome-and-leather stools, tufted crescent booths with lamp tables, a lacquer bandstand with uplights, a stepped gilt proscenium with velvet curtains and radio-cabinet speakers round the screen, a gilded halo rig carrying the lasers and eight pendant lamps, a three-tier crystal chandelier through the atrium, a carpet runner, palms and a host stand. The wall washes became uplight fans; the bar light is warm.
- **Lounge**: crystal chandeliers, round tables in white cloths with shaded lamps and champagne buckets, velvet tub chairs (same seats and sitters), folded velvet curtains and a gilt sunburst behind the stage.
- **Outside the club** (`js/club-queue.js`): a red carpet to the kerb, canopy poles, lanterns, a topiary, a velvet rope on brass stanchions (solid), nine regulars queuing in evening clothes, and Bruno on the door (new cast member and outfit) with his own dialogue. One warm lamp under the canopy.
- **Doors** (`js/doors.js`): double doors that swing open as you approach and close behind you at the club (porthole doors), the shops and east-side venues (glazed, per-shop wood), Dottie's (chrome and glass), Mercer Row (painted, glazed), the club's back fire door (opens outward), a brass revolving door at the Astoria and rolling steel doors at the Meridian. Every open-city building gets a street entrance: a stone portal with glazed double doors and a lit transom, with canopies in Belmont and roll-up doors on waterfront warehouses.
- **Subway** (`js/subway-deco.js`): white tile, a mosaic band, "47" tablets, "47 STREET · RIVOLI" across the tracks, six period ad cards, green riveted columns, a warning strip, rails and ties, steel ceiling beams with lamps, and benches where people sit.
- **People** (`js/human.js`): heads at real proportions (about 16 cm wide), a sculpted brow ridge, eye sockets, cheekbones and a squarer male jaw, ears with a rolled helix, a finer nose with alar wings, pupils, upper and lower lids; contact shadows baked per vertex from the body's own parts and the floor; warm subsurface-style skin with flushed cheeks, nose and ears; fabric sheen (MeshPhysicalMaterial, standard material on Low) and tone variation; hair strands; natural skin tones; smoother shoulders, elbows, hips and knees; and a range of builds.
- Club colliders for the host stand, entrance palms and the queue rope.
- **A real website.** `site/` is a landing page in the game's own language (split-flap title, letterboxed stills, the night as a departures board, controls and release notes); the game moves to `/play/`. `tools/build-site.mjs` builds both into one folder with versioned module URLs, used by GitHub Pages and by Vercel (`vercel.json`).

## [32.0.0] - 2026-10-20

### The map, the subway, and rooms that feel lived in

- **City map (M).** A 1954 pocket street map drawn from the game's own layout data: 31 named streets, 279 building footprints, walk-in buildings in warm orange with their names, parks, the North River, the El, the Pier 47 fence and five subway stops. Drag, wheel or +/− to zoom, arrow keys to pan, Find me. Labels are placed in priority order and never overlap. Click a pin, a stop or any spot to mark a route; the wayfinder follows it. Uptown is up and the map is unmirrored, so left in the street is left on the map. Touch screens get a Map button and a stacked layout.
- **Minimap.** A round map in the corner, sampled each frame from a pre-drawn copy of the city (one draw call), with your heading, your route and the story's next stop, and rim arrows for anything off the edge. Click it to open the full map.
- **Subway fast travel.** Five stops (47 St – Rivoli, Times Sq – 42 St, 59 St – Belmont Plaza, 12 Av – Pier 47, Third Avenue El at 44½ St). New IRT stair heads with railings and green globe lamps, an enamel plate at the El stair, and a route map on the 47th Street platform. Press E, choose a stop, and a departures card carries you there. The stair heads are solid.
- **Interiors.** A new architecture pass (`js/interiors/architecture.js`, a few draw calls per room): normal-mapped pressed-tin ceilings, subway-tile or panelled wainscot with chair rails, crown mouldings, door casings, framed oils over cast-iron radiators, plaster medallions, palms, a coat rack, queue ropes at the Rivoli, and turning ceiling fans in the barber, diner and bakery. The Astoria corridor lamps, which hung in mid-air, sit on bracketed wall shelves; homes get a radiator and a ceiling medallion.
- **The Meridian warehouse** was lined with the street facade (inside it looked like a courtyard of apartment windows). It now has whitewashed brick over a green dado, roof trusses, high windows, a plank deck, a concrete floor, shop lamps with light pools, radio benches with glowing valves and an oscilloscope, cable drums, a parts rack and the Seam blackboard.
- **Fix: Pier 47 Road ran through the Meridian warehouse** (two street lamps stood inside and the road dead-ended at its wall). The warehouse moves 19.5 m south so the road runs clear from the gate to the pier; its door still faces the yard, and the watchmen, Ada, Kessler and the story marker move with it.
- **Fix: returning visitors could still see an old version.** v10 had registered a service worker that v12 removed but never unregistered. `sw.js` is back as a kill switch and the page retires any leftover worker. The Pages build now stamps `?v=<commit>` onto every module URL, the entry script and the stylesheets (`tools/stamp-build.mjs`), and the title shows `v32.0.0 · build <commit> · <date>`.
- Tests: `tests/map.test.js` (orientation, picking, every arrival and boarding spot clear, kiosks off the road and solid), `tests/stamp.test.js`, and a new browser journey `npm run test:map` (minimap, map, marking a route, Escape, riding from the platform and from a stair head, phone layout).

## [31.0.0] - 2026-10-19

### The 12:04 — an open city, a story, real cars and saves that keep up

- **Title and HUD.** A split-flap departures board flaps in over a letterboxed crane shot of rainy 47th Street. In play the visor frame, scanlines, brackets, telemetry and button row are gone; a top-left readout keeps the time, energy and a wallet button (L). Pause, dialogue, settings and recap panels share the new paper-and-tungsten look.
- **Rendering.** Physical sky with stars and a moon, player-following sun shadows, time-of-day reflection probes (outdoor, room and club, all one size so walking between them never recompiles shaders), a film grade, SMAA or MSAA, GTAO on ultra, and Low/Medium/High/Ultra tiers (`?quality=`; software GL drops to Low). Crowds that can't be seen are culled for the draw only.
- **Materials.** Brick, stone, pavement, asphalt and plaster carry normal and roughness maps at real-world scale; wet asphalt with puddles; a double yellow centre line and lane edges; light from lamps and signs on the road at night; windows dim to glass by day.
- **People.** Every person is one skinned mesh with a sculpted body, face, period hair, hat and tailoring, coloured by a shared palette shader (one draw call each instead of 34–48). Better walk, idle and talking animation. First-person hands wear a suit sleeve, a shirt cuff and the visor's wristband.
- **Cars and traffic.** Checker cab, '54 sedan, finned limousine, police cruiser, panel van and crosstown bus with clearcoat paint, chrome, glass, whitewalls, brake lights and seated drivers. Traffic keeps its distance, queues at the light and for pedestrians, and drives from Broadway to Pier 47. Hailing a Checker gives you a real ride. Parked cars are solid.
- **Open world.** Four new districts — Broadway & Times Square, Belmont Park & the Belmont Plaza, the Pier 47 waterfront with the Meridian warehouse, and the Garment District under the El — with 242 buildings, lit-window facades, signs, a lake and bandshell, a river, freighter and cranes, an elevated railway with a running train, and pedestrians. The city now spans roughly 970 m by 700 m.
- **Driving.** Press F (or Use) at any parked car: arcade handling, collisions, chase and driver's-seat cameras (Q), horn (H), headlights after dark.
- **Story — The 12:04.** A prologue and five chapters, 27 objectives and two endings: a photograph that refuses the decade, a payphone, a silver test pressing that tunes the visor to echoes (hold V), a tail through Times Square, a break-in at Pier 47, and the last train home at 12:04 AM. Objective tracker, chapter cards, subtitles, cutscene letterbox, story waypoints, wallet rewards and labelled restore points. The pause menu can wait until midnight.
- **Saves — SQLite.** Every save is mirrored, off the main thread, into SQLite (WebAssembly) on OPFS: instant autosaves with 20 rolling restore points (shown in the save sheet), tables for items, world objects (indexed by 64 m chunk for region queries), characters, story and events, and an outbox filled by triggers for future multiplayer sync. `server/schema.sql` and `js/db/sync.js` describe the shared Postgres side; nothing connects to a server yet.
- Tests: `tests/db.test.js` (real SQL on the in-memory build: 6,000 world objects, region queries, restore points, outbox) and `tests/story.test.js` (full play-through, time windows, endings, backups); car-following traffic added to `tests/traffic.test.js`. The block, interiors, district, park-homes, neighborhood, life, expansion and first-evening browser suites were run against this release.

## [28.0.0] - 2026-09-24

### Neighbors and homes opposite the park

- Fill the empty 47th Street frontage opposite Mercer Garden with two adjoining apartment buildings, balconies, lit windows, planted window boxes and entrance halls.
- Buy the $260 Mercer Garden Flat or $420 Parkview Residence from the street listings board or Life panel. Both are furnished ground-floor homes with kitchens and living areas; purchases unlock real doors and preserve the existing Astoria keys and savings.
- Move purchased furnishings between all five homes, keep ownership across reloads, and guide players through the correct street entrance. Correct Astoria apartment guidance to use the hotel stairs.
- Give people oval faces, narrower jaws, shaped hairlines, visible eyes behind wire glasses, blinking, tailored jackets, long sleeves, better skirt proportions and fingers. Bake hand detail into shared geometry to avoid extra draw calls per finger.
- Verify affordability, physical entry, locked doors, both purchases, furniture transfer, old-save compatibility, reloads, mobile listings and character poses in browser tests.

## [27.0.0] - 2026-09-24

### Walk the whole block

- Connect West Avenue, Riverside Avenue, 46th Street and 49th Street into a continuous perimeter. Extend East Avenue and the existing cross streets to meet it, and open a covered passage from the rear alley onto 46th Street.
- Frame the larger neighborhood with apartment facades, sidewalks, crossings, lamps and planted seating. Add north and south loop destinations to the notebook.
- Integrate Claude's completed title card, modular interiors, mounted billboards and street signs, and violet listening-room redesign at Rex's Records.
- Finish the other stores with distinct ceilings, sconces, apothecary globes, hanging flowers, cinema chandeliers, a copper tasting still and barber vanity lights. Add diner pendants, hotel brasswork, east-side wall panels, a bookshop reading alcove and a bakery display case.
- Fix remaining cinema sign overlaps and mount the 4B plaque on its cabinet. Audit signs for physical backing, visibility and overlap, including signs on posts.
- Improve facade materials and window surrounds, round clothing and hands, reduce oversized eyes and skin shine, and vary east-side pedestrians. Add multisample anti-aliasing on capable desktops and soften the scanline overlay.
- Batch repeated architecture and interior decorations. Verify the road network with collision sweeps, scene raycasts and actual browser movement, alongside shop, neighborhood and Life journeys.

## [26.0.0] - 2026-09-23

### The east side opens its doors

- Enter Blue Note Books, Sunrise Bakery and Eastern Arcade through actual storefront doors. Each has a distinct stocked interior, shopkeeper, counter, signage and collision layout.
- Browse six permanent keepsakes in illustrated, mobile-friendly catalogs. Purchases appear in Pockets and survive new nights alongside wallet and home ownership.
- Meet all three shopkeepers for a one-time $20 welcome gift. Take repeatable $30 bakery courier rounds through the bookshop and arcade; unfinished deliveries survive reloads and new nights, with no timer or duplicate payouts.
- Play three rounds of free Signal Match at the arcade and save a personal best. Study the sequence again whenever needed; mistakes cost nothing.
- Restore active delivery guidance on reload and direct walkers around the solid block via East Avenue. Add all three shops to the walking map and notebook.
- Prevent slow frames from carrying the player through thin locked doors or counters, while preserving wall sliding and purchased apartment access.
- Verify physical entry, counters, ownership, welcome pay, deliveries, arcade completion, mobile layout and save recovery in the neighborhood browser suite.

## [25.0.0] - 2026-09-23

### East side, proper instruments and a new soundtrack

- Extend 47th Street into East Avenue and 48th Street, with twelve additional buildings, signed storefronts, crossings, streetlamps and pedestrians. Add Mercer Pocket Garden and Hawthorne Park, with fountains, trees, pergolas and four usable benches. Mark all four new destinations on the walking map.
- Replace the Corner Set's detached horn shapes with a connected saxophone, bell, mouthpiece, keys and a fitted playing pose; remove the red scarf from the musician's face.
- Anchor umbrellas at the hand, lift canopies above the head and compensate for arm movement to keep the shaft upright.
- Replace the sparse noise-heavy score with an original electric-piano jazz-house arrangement: four changing harmonies, bass, melodic fills and swung drums. Give the street and parks a separate 96 BPM jazz quartet; remove looping shop hiss and soften rain and subway rumble.


### Shops, work and a place of your own

- Complete the Life on 47th progression: priced shop catalogs, a permanent wallet, eight repeatable jobs with raises, three purchasable Astoria apartments, seven shop furnishings, and four nightclub lighting scenes.
- Give every homeware its own illustrated product card. Keep the current order slip above the illustration during paid shifts, with compact layouts for short screens.
- Finish apartment interiors with ceilings, trim, curtains and framed skyline views. Purchased doors and installed furnishings reflect saved ownership.
- Make workplace jobs available from Life while at the shop or club. Opening Life before entering the night returns safely to the welcome screen.
- Keep the wallet and notebook controls accessible on narrow screens, and document prices, pay, ownership and daily save behavior.

## [24.2.0] - 2026-09-16

The windows have rooms in them. The Checkers have opinions.

### Added

- Car hits: step onto 47th's asphalt and a moving cab throws you up and down the lane.
- Window panes with rooms, curtains, blinds, and lamp glow. Stone bases, cornices, sills, window units, and fire escapes on the block.
- Overcoats, lapels, scarves, glasses, and umbrellas held in hand. Checkers with roofs, grilles, whitewalls, and running boards.

## [24.1.0] - 2026-09-16

The street keeps its lights. The GPU keeps its job.

### Changed

- Dropped billboard and headlight point lights, cut rain and pedestrians, ran bloom at half-res, and skipped club floor/crowd work while you are outside.
- Filled the gaps between shops, put rooms on the second storey, and closed the void behind the row with a mid-rise of windows and water towers.
- Diner kitchen, hotel lobby chairs, Rivoli extra seats, and windows on the east/west bookend lots.

## [24.0.0] - 2026-09-16

The skyline sits lower. Stripe is a field in a JSON file.

### Added

- Street-height spectaculars on the west and center towers, plus Lily's fascia, so the boards read without craning.
- Painted stills for Tony, Lily, Astoria, the Gazette, and Luckies.
- Per-board Stripe Payment Links in `ads.config.json` (`stripePaymentLink` and `stripeLinks`).
- PAY / ASK / TIP buttons on the in-game rate card and on `sponsor.html`.
- Looking at a board names it. Available faces prompt TO LET.

### Changed

- More shop-side lamps, additive neon wash on Dottie's and the Astoria, pulsing TO LET boards, brighter cab lamps, living window glow.
- ION's till follows `githubSponsors` or `koFi` from config.

## [23.0.0] - 2026-09-16

The street sells light. The visor looks up.

### Added

- Ten painted 47th Street billboards with period stills, floodlights, and a walk-up Midtown Poster Co. kiosk.
- House ads for Dottie's, Rex's, the Rivoli, Midtown Gin, Tony's, Checkers, the Gazette, and Astoria; unsold faces read YOUR NAME IN LIGHTS.
- Boot, pause, and Gazette placements plus a public rate card at `sponsor.html`.
- `ads.config.json` insertion orders so a paid creative can claim a slot without touching the renderer.
- BOARDWALK GOLD visor look for reading five different boards.

### Changed

- Wetter asphalt, streak rain, traffic headlamps, stronger night bloom, sharper brick and sidewalk textures.
- GitHub Pages now deploys through GitHub Actions (`github-actions[bot]`).

## [21.0.0] - 2026-09-14

A block worth getting lost in.

### Added

- Seven counter activities with 27 daily orders each, illustrated work surfaces, ingredient/component choices, feedback, and a seven-shop passport.
- The Corner Set street stage and a three-phrase call-and-response activity with touch, keyboard, and visual note cues.
- Mabel’s Night Cart with three snacks and once-per-night energy benefits.
- 47th Camera Club: borrow a camera, photograph the game, keep six frames, and export captioned postcards.
- A neighborhood noticeboard and new destinations on the notebook map.
- An ordered five-clue payphone mystery with physical props at Rex’s and Astoria, a new house set, and a saved next lead.
- Four permanent visor looks for counter work, the mystery, the duet, and photography.
- New street fixtures, a vendor and musician, corner planters, festoon lighting, and shop completion seals.
- Expansion state migration and dedicated logic/browser regression suites.

## [20.0.0] - 2026-09-13

The shops have shelves worth browsing and things worth carrying home.

### Added

- Seven illustrated catalogs with 21 selections, record previews, receipts, and once-per-night rewards.
- Pocket notebook with inventory, delivery leads, a block map, and destination guidance.
- REXA record sets, Velma's flowers, Marco's gin, and Frank's ice deliveries with visible payoffs.
- Tony's haircut previews, brief service animation, saved portrait, and personalized night stamp.
- Rivoli auditorium with three original animated shorts and Dottie's midnight story.
- Distinct shop fittings, printed signage, stocked displays, localized audio, and purchase feedback.
- Commerce and targeting tests plus a browser journey covering all seven businesses.

### Fixed

- Interaction prompts and actions now use the same aim, reach, floor, and visibility checks.
- Duplicate dialogue rewards, night-only challenge tracking, save migration, and night reload continuity.
- Nellie gives directions; the actual machine supplies the ice.
- Reduced effects no longer mute audio, and overlays clear movement input.
- Storefront sign orientation, shop entrance visibility, and excessive bloom.
- Three.js now loads from pinned local files, avoiding a runtime CDN dependency.

## [19.0.0] - 2026-09-09

The 12:04 is a train. 4B has ice. The Rivoli is showing something.

### Added

- Walkable subway under 47th: stairs, tiles, a token booth, a train that keeps its hours.
- Hotel Astoria 2F: east stairs, corridor, 4B ice machine, a vacant room with a window on the street.
- Rivoli silver screen (a picture that refuses the decade). Glowing shop doorways you can enter.
- Crosswalk traffic. MILES downstairs, NELLIE upstairs. Frank's ice is a real errand.
- Looks: token green, 4B ice, silver screen.

## [18.0.0] - 2026-09-09

47th Street grew a far sidewalk that isn't a wall.

### Added

- Walkable shops across the street: Rex's Records, 47th Pharmacy, Lily's, the Rivoli lobby, Midtown Gin, Tony's Barber.
- Workers and customers: SID, IRIS, LILY, WALTER, ROSIE, TONY, plus LOU at the grill and OTIS the bellhop.
- Crosswalks, a traffic signal, a spinning barber pole, more neon, towers pushed back so the block can breathe.
- Looks: B-side violet, pharmacy mint, Tony's clip. Dares that send you across 47th.

## [17.0.0] - 2026-09-09

The visor remembers. Come back tomorrow.

### Added

- Tonight's dare, seeded by the date. Finish it and the visor keeps score.
- Return streak and a night recap (ESC → RECAP, or automatically at 2am).
- Guest list (tell Nova), photo booth stamp, coat-check rumor.
- Four more visor looks: Velma gold, cherry pie, Checker yellow, 2am indigo.
- NPCs remember what you did tonight.
- Sit the end stool, Dottie's counter, a diner booth, the Astoria lobby.
- Seven dance styles. Hands go up when you do. Named people face you when you talk.
- More street life: extra Checkers, puddles, a marquee that shows tonight's set.

### Changed

- House mix hits harder at midnight and thins after last call.
- Idle crowd has weight. The floor has more bounce.

## [16.0.0] - 2026-09-09

The night now has a clock. Looks are earned. You can take a stamp home.

### Added

- In-game clock from 10:00 PM to after hours (doors → heat → midnight drop → last call → 2am street).
- Tonight's house set rotates with the weekday; Gazette headline rotates with the date (seven editions).
- The sky, fog, lamps, lasers, floor, and crowd follow the clock — dusk at doors, night at midnight, thin and wet after last call.
- Eight visor looks, unlocked by playing (REXA, lounge sit, Socks, 47th, cube, energy 80, last call). The visor chrome tints to match.
- Night stamp PNG (ESC → STAMP) with clock, phase, headline, energy.
- Tip jar on the pause screen (GitHub Sponsors + star).
- Phase-aware lines for NOVA, REXA, ION, VELMA, DOTTIE, PIXEL, MARCO, CABBY, SCOTTY, MULDOON.
- Dottie's coffee sobers the visor.

### Fixed

- Pause screen no longer crashes looking for a mute button that was never there.

## [15.2.0] - 2026-09-09

### Added

- Five dance styles on the floor: hands up, one arm to the lights, air punches, wide sway, clap.
- Player can sit upstairs: banquette, chaise, club chairs. E or WASD to stand.
- Chaise, club chairs, floor lamp, champagne bucket in the lounge.
- Drunk visor: weave, horizon roll, FOV breathe, bloom pulse, chromatic fringe.

### Fixed

- Hole in the back wall on the ground floor (fire-escape opening now starts at the second floor).

## [15.1.0] - 2026-09-09

### Fixed

- Cars face down 47th instead of sliding sideways. Parked Checkers sit on the curb; traffic stays in its lanes.
- Dance is a smooth weight-shift on the beat instead of a twitch.
- Bar and lounge sitting: thighs forward, shins down, hips on the seat, facing the bar or table.
- Lounge floor is a complete ring around the atrium (no missing panels). Stair well is trimmed in marble.

### Added

- Gold-and-marble atrium balustrade with newel posts, a sloped stair handrail, coffered ceiling, sconces, velvet banquettes, marble tables.

## [15.0.0] - 2026-09-09

Dusk on 47th. The club fills up. The lounge becomes a supper club. The other side of the street is a wall of towers.

### Added

- Packed dance floor (rings of ravers), a full bar crowd on stools and leaning the rail, VIP couches.
- Second-floor supper club: damask, chandeliers, candlelit tables, piano, curtains, dusk in the windows, a seated audience.
- Dusk sky (rose/gold horizon, sun between the towers) instead of a black night.
- A Midtown wall of setback skyscrapers across the street — 16 to 38 stories, water towers, a spire, lit windows, a gin billboard.

### Changed

- Fog, hemisphere, and exposure follow dusk outside and stay neon-dark on the floor.
- Version badge bumped to v15.0.0.

## [14.0.0] - 2026-09-09

Midtown, November 12, 1954. The club grew a second story, a back alley, and a city.

### Added

- **Walkable 1954 block.** Brick, rain, steam, Checkers, street lamps, a phone booth, a newsstand, Dottie's Diner, Hotel Astoria, and the Rivoli marquee across 47th Street.
- **Second-floor lounge.** Stairs on the east wall, atrium looking down on the LEDs, brass rail, Velma's trio, jukebox, windows on the rain.
- **Back alley.** Dumpsters, hanging bulb, fire escape back up to the lounge, Vinnie, Officer Muldoon, Socks the cat.
- **Articulated people.** Head, torso, arms, legs, faces, hats, dresses, glowsticks — idle, walk, and dance. Named cast of 19 plus sidewalk pedestrians and floor dancers.
- **Zone audio.** Techno on the floor, jazz in the lounge, rain on the street, the kick leaking through the alley wall.
- **Toys.** Hail a Checker, read the Midtown Gazette, pick up the phone booth, pet the cat, coffee and cherry pie at Dottie's.

### Changed

- Front and back doors are real exits, not walls.
- Collision is 3D (floor-aware) so the bar does not block the lounge.
- Version badge bumped to v14.0.0.

## [13.0.0] - 2026-09-07

The quiz is gone. The club is the product: named people to talk to, SPACE to
dance on the floor, and a DECK that plays your own audio files.

## [12.0.0] - 2026-09-07

GitHub already shipped a separate 11.0 atlas/streak release. This is the
first-person nightclub visor line.

## [11.0.0] - 2026-09-07

### Added

- Unreal Bloom post-process, kick FOV pulse, first-person visor hands.
- Crowd is now torso + head + glowstick instances instead of single capsules.
- Wall EQ screen, VIP couches, claps on beats 2 and 4, result radar chart.

## [10.0.0] - 2026-09-07

### Added

- **First-person VR nightclub.** Warehouse rave in Three.js r160.
- **Pointer-lock visor.** WASD + mouse look, head bob, AABB collision.
- **Procedural techno** (Web Audio, no files).
- Optional WebXR via `VRButton`.

## [9.1.0] - 2026-07-02

AnimatedContent port, radar chart, extra questions and vibes, keyboard play.
