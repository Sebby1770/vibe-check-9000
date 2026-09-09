# VIBE CHECK 9000™

A first-person night in Midtown. November 12, 1954. The visor is from later.

Walk the club, take the stairs to the lounge, step out the front door onto 47th Street, or slip out the back into the alley.

Live: <https://sebby1770.github.io/vibe-check-9000/>

## The night

1. Click **ENTER THE NIGHT** (pointer lock + house system).
2. **WASD** to move, mouse to look, **SPACE** on the LED floor to dance.
3. Walk up to a named person and press **E** to talk.
4. **Front doors** open onto 47th Street — rain, Checkers, Dottie's, Hotel Astoria.
5. **Back doors** dump you in the alley — Vinnie, Muldoon, Socks the cat, fire escape.
6. **Stairs** on the east wall (and the wet fire escape) go up to Velma's lounge.
7. **ESC** opens the deck. Drop MP3 / WAV / FLAC / OGG. Hail a Checker. Read the Gazette.

## People

**The floor** — REXA, ION, PIXEL, GHOST, KAI, NOVA  
**The lounge** — VELMA, MARCO, RUBY, FRANK  
**The alley** — VINNIE, MULDOON, SOCKS  
**47th Street** — DOTTIE, CABBY, SCOTTY, CLARA, HAROLD, ELEANOR

## Run locally

```bash
python3 -m http.server 8000
npm test
```

Needs HTTP because of ES modules. No build step.

## Stack

Three.js r160, Web Audio, vanilla HTML/CSS/JS. Procedural people, brick, rain, jazz, and techno — no asset pack.
