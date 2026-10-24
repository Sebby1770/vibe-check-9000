# v31 — The 12:04

The biggest upgrade so far: realistic rendering, people, cars, buildings and interiors; a five-chapter story; an open
world you can walk and drive; and a SQLite save layer that autosaves instantly, scales to thousands of objects and is
shaped for future multiplayer sync.

Codebase maps used to plan this live outside the repo (session scratch). Every agent must still read the code it
changes. Hard contracts are summarised in §7 — break one and a test goes red.

---

## 1. Graphics

### 1.1 Render pipeline (`js/render/*`, `world.js`, `quality.js`)
- **Quality tiers** in `detectQuality()` (stays renderer-free): `low | medium | high | ultra`, auto-detected, overridable with
  `?quality=` and a Settings control, persisted in `localStorage['vc9k-quality']`. Keys: `tier, shadows, shadowMapSize,
  gtao, smaa, msaa, envSize, reflections, maxPointLights, crowdScale, drawDistance, pixelRatio, rain, peds`.
- **Sun and moon shadows:** one `DirectionalLight` with a texel-snapped shadow camera that follows the player, PCF soft,
  updated every other frame outdoors only. The flags pass marks casters and receivers once after the world is built
  (skip glass, signs, neon, rain, sky). People and cars near the camera cast.
- **Physical sky:** `Sky.js` on a **sphere** (never a box — sign audit and road-ray tests), cross-faded with the existing
  gradient sky at dusk/night, plus a star field and moon. Fog colour follows the horizon.
- **Time-of-day reflections:** PMREM of a sky-only scene, rebuilt when the hour moves more than 0.25 h; feeds
  `scene.environment` and the club's disco ball.
- **Post:** RenderPass → GTAO (high+, depth-texture mode, hidden transparent/glow meshes) → UnrealBloom → colour grade
  (lift/gamma/gain, gentle split-tone: cool shadows, tungsten highlights; vignette; fine film grain) → SMAA (when MSAA off)
  → OutputPass.
- **Render-time zone culling:** wrap `composer.render` inside `world.js` so groups that cannot be seen (club interior from
  the street, shop interiors > 24 m away, the subway above ground, the far city from inside rooms) are hidden only for
  the render and restored immediately (tests see the full scene). Interiors get one Group per room.
- **Fixed light pool:** a constant number of point lights reassigned to the nearest sources each frame — no visibility
  toggling (recompile hitches).

### 1.2 Materials (`js/textures.js`, `js/render/materials.js`, `js/interiors/batch.js`)
- PBR canvas maps (albedo + normal + roughness) for brick (several bonds/colours), limestone, granite, asphalt (wet, with
  tar seams, cracks, manholes), concrete sidewalk slabs with expansion joints and wear, cobbles, terrazzo, marble, oak and
  parquet floors, carpet, wallpaper, tin ceiling, chrome, painted metal, glass.
- **World-scale UVs:** bricks, slabs and asphalt must keep real-world size on every box (`boxBatch.flush` bakes face-size
  UVs; `addBox` meshes get a planar-by-normal world UV patch via `onBeforeCompile`, shared program cache key).
- Fix physically wrong values (asphalt metalness 0.55 → 0 with roughness carrying wetness, etc.) and the transverse
  "centre line" on 47th.
- **Wet streets:** puddle roughness maps + time-matched environment + clearcoat on the road; additive streak decals
  under neon, lamps and headlights (transparent → invisible to the sign audit and ray tests).

### 1.3 People (`js/human.js`, `js/crowd.js`)
- Realistic 8-heads proportions, sculpted torso/limbs (lathe and capsule shapes, no boxes), faces (jaw, nose, ears,
  eyes, brows, lips), period hair (pompadour, crew cut, victory rolls, bob, finger waves), hats (fedora with pinch and
  band, trilby, cloche, pillbox, cap), clothing (suits with lapels and ties, overcoats, dresses with lathe skirts,
  waitress, doorman, police, cabbie, dock worker), diverse skin tones. Feet on the ground.
- **Draw calls:** one skinned mesh per person (bones named like today's joints, `userData.joints` points at the bones so
  every caller and test keeps working), shared geometry per body/outfit, a small material set.
- **Animation:** speed-matched walk with hip sway, counter-swing, knee bend and heel–toe roll; idle weight shift and
  breathing; talking gestures; head look-at the player.
- **Crowds at scale:** `createCrowd()` — far pedestrians as instanced low-poly figures animated in the vertex shader
  (hundreds to thousands in 1–3 draw calls), promoted to full people near the camera.

### 1.4 Cars and traffic (`js/vehicles/*`, `js/traffic.js`)
- Six period models built from extruded side profiles with bevels and lathe parts, merged to 3–5 draw calls each:
  Checker A8 cab, '54 four-door sedan, finned Cadillac-style limousine, panel delivery truck, GM-style city bus, police
  cruiser. Clearcoat paint, chrome bumpers/grilles, whitewall tyres, glass, emissive head/tail lights, a seated driver.
- Traffic follows the car ahead, stops at the signal and for pedestrians on crossings, wheels turn, no popping at the
  road ends; instanced far LOD. Parked-car colliders reach eye height.

### 1.5 Buildings, streets, interiors
- Facade kit: rusticated bases, storefront bays, window frames with recessed glass, sills and lintels, string courses,
  pilasters, cornices with brackets, fire escapes, water towers, setback Art Deco towers with lit crowns, interior-mapped
  window rooms. Instanced repeats; facades stay sign-backed (`userData.batch = true` where they back signs).
- Street furniture: period lamp posts with light pools, hydrants, mailboxes, news boxes, benches, trees with canopies,
  traffic signals, steam, subway entrances.
- Interiors: wainscoting, crown and base mouldings, coffered and tin ceilings, door and window casings, real furniture
  shapes, fixtures with warm emissive shades, clutter, PBR floors.

---

## 2. Open world

Today's walkable bounds are x −110..202, z −60..106 (+X east, +Z north, 47th Street along z 22.8). v31 grows the city
to roughly **x −430..540, z −300..400** in four new districts joined to the perimeter loop:

| District | Bounds (x, z) | Character | Story use |
|---|---|---|---|
| **Broadway & Times Square** (west) | −430..−110, −60..220 | Diagonal Broadway, a wall of animated signs, theatres, an automat, a wide plaza | Ch. 3 tail ends under the big sign |
| **Belmont Park & the Plaza** (north) | −110..300, 106..400 | A park strip with a lake, bridle path and bandshell, the Belmont Plaza Hotel | Ch. 5 Kessler's car outside the Plaza |
| **The Waterfront, Pier 47** (east) | 202..540, −120..220 | Piers, warehouses, cranes, a freighter, the Meridian Radio warehouse (enterable) | Ch. 4 infiltration |
| **Garment District & the El** (south) | −300..300, −300..−60 | Loft factories, rolling racks, an elevated railway on 3rd Avenue | Ch. 2 echo trail, Ch. 5 rooftop |

- **Procedural blocks + landmarks:** a seeded block generator (lots, building heights by district, facade kit) fills
  each district; hand-built landmarks sit on top.
- **Streaming:** the new area is divided into 64 m chunks built when within the draw distance and disposed beyond it;
  static geometry per chunk merged by material; instanced props.
- **Road graph:** a pure module (`js/openworld/roads.js`, three-free) with every road centre-line, lanes, intersections
  and signals, used by traffic, driving, the minimap and the waypoint.
- **Driving:** press **F** near any stopped car to get in. Arcade physics (throttle, brake, handbrake, steering with
  speed-sensitive lock), collisions against colliders, chase camera with a first-person dash option (**C**), horn
  (**H**), headlights at night, exit anywhere. Cabs can still be hailed for a ride.
- **Map:** a top-right minimap while exploring and a full city map (**M**) with districts, landmarks, the story marker
  and any marked destination. Subway stations allow fast travel.
- **Contracts:** every existing route, zone id and road-ray line in §7 stays as it is. New colliders and zones live in
  three-free layout modules.

---

## 3. Story — *The 12:04*

**Premise.** The club on 47th Street is out of time: its LED floor and house music bleed through from 2026, the same
address seventy-two years later. You were dancing there in 2026, wearing a VIBE CHECK 9000 AR visor, when the floor
dropped out from under the beat. Now it's November 12, 1954.

**Cast.** Existing: REXA (DJ), VELMA (lounge singer), MARCO, RUBY, FRANK, VINNIE, MULDOON (the beat cop), SOCKS,
DOTTIE, LOU, CABBY, OTIS (Astoria concierge), NELLIE (Astoria 2F), MILES (subway), shopkeepers. New:
- **Ada Lune** — a Meridian Radio engineer who found the *Seam*: at 12:04 AM, when the uptown local passes under 47th
  Street while the club's system plays at 124 BPM, her rooftop transmitter on the Astoria opens a door in time. She
  left the photograph and the payphone message. She has seen the visor before.
- **August Kessler, "the Grey Hat"** — a fixer for Meridian's owners who has been collecting objects that fall through
  the Seam. He wants the visor and the transmitter's tube to sell the future.

**Chapters.**
0. **Doors** (club, 47th). Wake on the floor; the visor reads *YEAR ERROR*. REXA: you came through the booth. Read the
   Gazette at the newsstand. Velma upstairs has seen this before.
1. **A Picture That Refuses the Decade.** Velma's photograph shows you outside the Rivoli, stamped 1954. The 47th Camera
   Club's contact sheet is signed *A.L.* Dottie remembers the woman; after midnight, the booth holds Ada's note: *the
   12:04 is the only way home — don't let the Grey Hat have the visor.*
2. **Signal Silver.** The payphone rings with Ada's recorded voice. The silver sleeve at Rex's is a test pressing; REXA
   plays it and the visor **tunes** — *echo vision* (hold **V**) shows glowing replays of past moments. Follow the echoes
   through the Garment District to Astoria lost property and Nellie's key to Ada's room: her notebook, the Seam
   blueprint, *Meridian Radio, Pier 47*.
3. **The Grey Hat.** Muldoon warns you off. Tail Kessler on foot from the Astoria to Times Square without being seen,
   then take Cabby's Checker — or any car — and follow his black limousine to the waterfront.
4. **Pier 47.** Slip into the Meridian warehouse past the night watchmen. Ada is there, building. She explains the
   Seam; Kessler arrives and takes the transmitter tube. Escape along the pier.
5. **The 12:04.** Take the tube back from Kessler's car outside the Belmont Plaza, refit the Astoria roof transmitter,
   get REXA to drop the signal set before midnight and be on the platform at 12:04. **Choose:** ride home (the visor
   shows 47th Street in 2026) or stay for the set (dawn on 47th, Velma's last song). Both endings unlock a visor look,
   and free roam continues.

**Engine.** `js/story/story.js` is pure (no DOM, no three): chapter and objective data, `normalizeStory`, and reducers
`onEvent(state, event, ctx) → {state, ok, message, effects}`. Objective kinds: `talk, reach, interact, item, time, flag,
follow, drive, stealth, cutscene, choice`. State is top-level `progress.story` (survives day rollover), included in
backups, and inspectable via `__vibeInspect.snapshot().story`. UI: quest tracker under the HUD readout, chapter cards,
letterboxed cutscenes with subtitles, a Story tab in the J notebook, and story lines that override NPC small talk.
Story intros never fire under `?inspect`, so browser tests keep control.

---

## 4. Saves — SQLite, instant autosave, built to sync

- **Engine:** the official SQLite WebAssembly build vendored at `vendor/sqlite/`, running in a Web Worker
  (`js/db/db-worker.js`) on the `opfs-sahpool` VFS — persistent, no COOP/COEP headers needed, so it works on GitHub
  Pages. Falls back to an in-memory database exported to IndexedDB, then to localStorage only.
- **Instant autosave:** every state change (`note()`, `persistCommerce()`, story events, world-object changes) is queued
  and committed in one transaction in the worker within a frame — the render thread never waits. A rolling history of
  the last 20 autosaves gives instant restore points. `localStorage['vc9k-progress']` is still mirrored, so existing
  saves, backups and tests keep working.
- **Schema** (migrations by `PRAGMA user_version`): `meta`, `saves`, `save_history`, `items`, `entities` (id, kind,
  x/y/z, yaw, chunk cell, JSON state, indexed by kind+cell for region queries), `npc_state`, `story`, `events`, and an
  `outbox` filled by triggers.
- **Scale:** world objects, collectibles, parked cars and NPC memories live in `entities`/`npc_state`; chunk streaming
  asks the store for a chunk's rows, so thousands of objects load only where you are.
- **Multiplayer later:** `server/schema.sql` mirrors the tables for Postgres (Supabase-compatible) with `player_id` and
  row-level security; `js/db/sync.js` defines a sync adapter that drains the outbox (default: off). No server is
  provisioned by this change.

---

## 5. Interface

- Title: split-flap board over a live crane shot (done).
- Play HUD: time, energy, wallet (done); quest tracker and minimap join it.
- Pause, dialogue, settings and recap panels restyled to match the title (paper, tungsten, Big Shoulders), no neon
  borders.

---

## 6. Delivery waves

1. Render pipeline · materials · people · cars and traffic.
2. SQLite store · buildings and streets · interiors · story engine and chapters 0–2.
3. Open-world layout, generator and streaming → landmarks · driving and map · chapters 3–5.
4. Integration, review, performance and browser verification.

---

## 7. Contracts (from the code maps)

- Node unit tests import `zones.js, district-layout.js, life.js, expansion.js, ads.js, interactions.js, collision.js,
  commerce.js, neighborhood.js, neighborhood-navigation.js, night.js, daylight.js, traffic.js, progress.js, people.js,
  music.js, engine.js, save-backup.js, interiors/hotel-layout.js`. None may import three or touch the DOM at top level.
- `daylightAt` stays smooth and wraps 0/24 identically; only add keys. `world.daylight` keeps `sunVisible`/`moonVisible`.
- Sign audit: signs are `PlaneGeometry` + map'd opaque `MeshBasicMaterial`; solids are `BoxGeometry` meshes or
  `userData.batch`. No huge boxes enclosing signs; `RoundedBoxGeometry` counts as a box.
- Road-ray lines at y 1.7 must hit no opaque box mesh: perimeter (−99,−48)→(187,−48)→(187,96)→(−99,96)→back,
  (0,−46)→(0,−24), (109,74)→(109,96). No people, cars or props on them.
- `ads.js` mirrors towers, infill, cornice, hotel roof, alley wall; move geometry → update `ads.js`.
- Colliders block only if they span floor + 1.7; routes in `district.test`/`block-loop.test` stay clear.
- Umbrella stays a child of `lHand` at the grip; saxophone hand positions match within 1e-6; the blink hits 0.08; tested
  NPCs keep their `NPCS` positions.
- `LOOKS.length === 23` is asserted — adding looks means updating `tests/progress.test.js` and the README table.
- `normalizeNeighborhood` keeps its exact shape; unknown `commerce.*` keys are dropped by `normalizeCommerce`.
- Backups: no string containing `<`/`>`, flags are booleans only, `BACKUP_VERSION` stays 1.
- Browser tests open `/?inspect=1`, click ENTER THE NIGHT and act at once; they need zero console errors.

---

## Delivered (31.0.0, 2026-10-19)

Done, with tests:

- **Interface:** split-flap title over a live crane shot, minimal play HUD, restyled panels, Graphics tier select.
- **Rendering:** physical sky, stars, shadows, time-of-day probes, grade, SMAA/MSAA, GTAO (ultra), tiers, software-GL fallback,
  render-time crowd culling, no shader stall between zones.
- **Materials:** PBR maps at world scale, wet asphalt, lane markings, light streaks on the road, daylight-aware windows.
- **People:** one skinned mesh each, sculpted bodies/faces/hair/hats/tailoring, palette shader, improved animation, new
  first-person hands.
- **Cars:** six period models, car-following traffic (`stepTraffic`, unit tested), a real Checker ride, solid parked cars.
- **Open world:** four districts (§2), 242 buildings, landmarks, zones and colliders; the old loop's routes, zones and
  browser checks unchanged.
- **Driving:** any parked car, arcade handling, collisions, chase/seat cameras, horn, headlights.
- **Story:** all six chapters with tracker, cards, subtitles, letterbox, echoes, Kessler's tail, Pier 47 stealth, endings.
- **Saves:** SQLite on OPFS in a worker, instant autosave, restore points, world-object tables, sync-ready outbox,
  Postgres schema for later.

Delivered in v32.0.0: the interior architecture pass (tin ceilings, wainscot, mouldings, fittings, fans; the Meridian
warehouse interior), the minimap and full city map (M), subway fast travel between five stops, versioned Pages builds
and the retirement of v10's service worker.

Delivered in v33.0.0: the Art Deco club and lounge, doors on every entrance (and front doors across the open
city), the queue and Bruno at Velvet Tuesday, the IRT platform, and the people realism pass.

Delivered in v34.0.0: traffic on every street with signals at every junction, the facade kit for the original 47th
Street towers, and far busier pavements in the open city.

Delivered in v35.0.0: street lighting (light pools under every lamp and a fixed point-light pool that follows you),
headlights on every moving car, taxi fares in any Checker, and positional engine and horn sound from the traffic.

Not done yet (next steps):

- Instanced far-LOD crowds (`createCrowd`).
- The first time the camera looks down a part of the city the GPU hasn't drawn yet (the east district, seen from
  the club), it can stall for a second or two while buffers upload and draw state is built; the shader side of
  that was fixed in v35 (a fixed light count), the rest predates v35. A warm-up draw of each district during the
  title card would hide it.
- Touch driving was wired through the on-screen stick but not tried on a phone; the full story was verified by unit
  test and in-browser beats, not by one continuous human play-through.
- `npm run test:browser` fails at Frank's ice on `main` too (pre-existing; the suite predates later changes).
