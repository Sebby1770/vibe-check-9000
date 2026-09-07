# Changelog

All notable changes to VIBE CHECK 9000™ are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
- **First-person VR nightclub.** Warehouse rave in Three.js r160: LED dance floor,
  truss, moving-head lasers, mirror ball, DJ booth + LED wall, fog, 400 particles,
  instanced crowd, bar, neon signs, scanner kiosk, hidden cube.
- **Pointer-lock visor.** WASD + mouse look, head bob on beat, AABB collision,
  on-screen stick + drag-to-look on mobile.
- **Procedural techno** (Web Audio, no files): 128 BPM four-on-the-floor kick,
  hats, A-minor bass, 4-bar stabs, compressor, delay, analyser, HRTF panner at
  the booth. After a result: BPM / filter / stereo width follow chaos / charm /
  cosmic.
- **Optional WebXR** via `VRButton` only when `immersive-vr` is actually supported.
- **Visor HUD** overlays: boot calibration, walk-to-scanner prompt, holographic
  questions, 3-second drop, result card, pause, settings.
- Headset telemetry strip (BPM, heading, position, bass, clock) and visor reticle.
- `js/engine.js` extracted as a Node-testable scoring module (no DOM).
- `tests/engine.test.js` + `npm test`.

### Changed
- The 2D cyberpunk terminal is no longer the main experience. Same 9 questions,
  15 vibes, pickVibe rules, share encoding, achievements, and localStorage keys.
- RAVE MODE achievement now unlocks when you enter the club (Konami still works).
- Version badge bumped to v10.0.0.

### Accessibility
- SKIP TO QUIZ bypasses pointer lock.
- Escape exits lock and shows a menu.
- `prefers-reduced-motion`: no bob, no strobe, slower lasers, audio optional.
- WebGL failure falls back to the visor quiz without the 3D club.

## [9.1.0] - 2026-07-02

### Added
- **AnimatedContent entrance animations** — a dependency-free vanilla JS port of
  [ReactBits AnimatedContent](https://reactbits.dev/animations/animated-content)
  (`animated-content.js`). Mirrors the ReactBits prop API via `data-animate-*`
  attributes (direction, distance, duration, ease, delay, threshold, initial
  opacity, scale, reverse) and drives the hero, result card, and side panels
  with IntersectionObserver + the Web Animations API.
- **Animated radar chart** on the result card plotting CHAOS / CHARM / COSMIC /
  STATIC on a glowing four-axis radar, drawn with canvas at device pixel ratio.
- **3 new questions** (9 total): the rogue AI superpower, the browser-history
  gala, and the soul-frequency calibration.
- **3 new vibes**: HAUNTED HOTSPOT WITH FULL BARS, CHAIR OF THE MIDNIGHT
  COMMITTEE, and GILDED BUFFERING ICON — each with dedicated stat rules.
- **2 new achievements**: VIBE CARTOGRAPHER (discover 5 different vibes,
  tracked across sessions) and ANY% VIBER (answer every question in under
  15 seconds).
- **Keyboard support**: number keys 1–5 answer the visible question, Escape
  closes modals, and interactive elements have visible focus outlines.
- SVG favicon.

### Changed
- Version badge bumped to v9.1.0.
- ABOUT and SCIENCE modals updated for the new question count, radar chart,
  and ReactBits credit.

### Accessibility
- `prefers-reduced-motion` is now respected everywhere: entrance animations,
  confetti, the radar draw-in, and all ambient CSS animations reduce to
  near-instant states.

## [9.0.0] - 2026-05-03

### Added
- Initial release: six-question cyberpunk vibe scanner with twelve vibes,
  four neon stats, shareable result links, PNG report export, achievements,
  local history, rave mode, and a suspicious amount of static.
