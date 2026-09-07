# VIBE CHECK 9000™

> Put on the headset. Walk into a warehouse rave. Let illegal LEDs diagnose your vibe.

[![status](https://img.shields.io/badge/status-visor%20online-ff00ff?style=for-the-badge)](#)
[![stack](https://img.shields.io/badge/stack-Three.js%20Web%20Audio-00fff7?style=for-the-badge)](#)
[![accuracy](https://img.shields.io/badge/accuracy-emotionally%20suspicious-39ff14?style=for-the-badge)](#)

## Live Site

Once GitHub Pages is enabled for this repo:

<https://sebby1770.github.io/vibe-check-9000/>

## ENTER THE CLUB

This is a first-person visor experience, not a 2D terminal. The club uses bloom, glowsticks, visor hands, and a kick-synced FOV pulse.

1. Serve the folder over HTTP (ES modules will not load from `file://`).
2. Click **ENTER THE CLUB** — pointer lock + mouse look, procedural techno, warehouse rave.
3. Walk to the cyan **scanner arch** (chevron on your visor). Press **E** or walk through.
4. Answer 9 questions with **1–5** or clicks. The floor flashes. The crowd cheers.
5. After question 9 the lights drop, then the club recolors to your vibe.
6. Share, copy the link, or save a PNG report.

**SKIP TO QUIZ** starts the scan immediately (keyboard / screen-reader friendly).

## Controls

| Input | Action |
| --- | --- |
| Mouse / drag | Look |
| WASD / arrows | Move |
| Shift | Sprint |
| 1–5 | Answer the visible question |
| E | Start scan (near kiosk) or touch the hidden cube |
| Escape | Release pointer lock and open the pause menu |
| Gear | Sensitivity, FOV, mute, reduced FX, crowd toggle |

Mobile: on-screen stick on the left, drag-to-look on the right. Pointer lock is optional.

## WebXR

If `navigator.xr` reports immersive-vr, an **ENTER VR** button appears on the boot visor (Three.js `VRButton`). Desktop pointer-lock is the main path. HTTPS is required for WebXR.

## Run locally

ES modules + an import map, so you need a static server:

```bash
python3 -m http.server
```

Then open <http://localhost:8000/>.

No build step. No runtime npm dependencies. Three.js r160 loads from jsDelivr.

## Tests

```bash
npm test
```

Runs `node tests/engine.test.js` (scoring, `pickVibe` branches, share encode/decode).

## Accessibility

- Focusable **ENTER THE CLUB** / **SKIP TO QUIZ** before pointer lock
- Escape closes overlays and exits lock
- `prefers-reduced-motion`: no head bob, no strobe, slower lasers, audio muted until you unmute
- 2D fallback quiz if WebGL is missing

## Stack

- HTML / CSS visor HUD
- Three.js r160 (ES modules, PointerLockControls, optional VRButton)
- Web Audio API (procedural 128 BPM four-on-the-floor, spatialized at the DJ booth)
- `js/engine.js` — questions, vibes, scoring, share tokens, achievements (no DOM)

## Disclaimer

Results are not valid in court, therapy, hiring, dating, banking, or interdimensional arbitration. Do not base life choices on this visor. It is wearing sunglasses indoors.

Source: [github.com/Sebby1770/vibe-check-9000](https://github.com/Sebby1770/vibe-check-9000)
