# Changelog

All notable changes to VIBE CHECK 9000™ are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [9.3.0] - 2026-08-18

### Added
- Daily remix: question order is shuffled from the UTC date seed.
- Deterministic compatibility score between two stat profiles.
- Engine tests for shuffle and compatibility.

## [9.2.0] - 2026-08-18

### Added
- Extracted `engine.js`: deterministic scoring, vibe picker, share encode/decode,
  result compare, and a daily frequency seed. Works in the browser and Node.
- History now stores stat profiles and shows a compare line between the last two scans.
- Daily flavor toast on load.
- `npm test` (`node:test`) and GitHub Actions CI.

### Changed
- Version badge bumped to v9.2.0. `pickVibe` delegates to the shared engine.

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
