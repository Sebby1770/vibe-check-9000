# Changelog

All notable changes to VIBE CHECK 9000™ are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
