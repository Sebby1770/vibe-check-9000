# VIBE CHECK 9000™

> A cyberpunk-themed website that scans your vibe and returns a deeply official, deeply unserious diagnosis.

[![status](https://img.shields.io/badge/status-neon%20online-ff00ff?style=for-the-badge)](#)
[![stack](https://img.shields.io/badge/stack-HTML%20CSS%20JS-00fff7?style=for-the-badge)](#)
[![accuracy](https://img.shields.io/badge/accuracy-emotionally%20suspicious-39ff14?style=for-the-badge)](#)

## Live Site

Once GitHub Pages is enabled for this repo:

<https://sebby1770.github.io/vibe-check-9000/>

## Features

- Animated cyberpunk UI with neon grid, scanlines, glitch text, scanner rings, and canvas particles
- Entrance animations powered by a vanilla JS port of [ReactBits AnimatedContent](https://reactbits.dev/animations/animated-content) — same prop API (direction, distance, duration, ease, delay, threshold, scale, reverse), zero dependencies
- Multi-stage fake terminal scan with absurd loading messages
- Nine interactive questions scored across Chaos, Charm, Cosmic, and Static
- Animated four-axis radar chart of your stat profile on the result card
- Fifteen ridiculous result archetypes
- Testable scoring engine (`engine.js`) with share encode/decode and compare
- Encoded result URLs that can be copied or shared
- PNG result-card export
- Local scan history and ten achievements, including cross-session vibe discovery tracking
- Keyboard play: answer questions with keys 1–5, close modals with Escape
- Full `prefers-reduced-motion` support
- Hidden keyboard easter eggs
- GitHub profile/repo links wired into the interface

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Run Locally

```bash
open index.html
npm test
```

No build step, no framework. `engine.js` is the scoring core; `npm test` runs it under Node.

## Deploy

Set GitHub Pages to deploy from the `main` branch and the repository root. The site is plain static HTML/CSS/JS, so no build step is needed.

## Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API

## Disclaimer

Results are not valid in court, therapy, hiring, dating, banking, or interdimensional arbitration.
