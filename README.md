# VIBE CHECK 9000™

**Play it in the browser:** [sebby1770.github.io/vibe-check-9000](https://sebby1770.github.io/vibe-check-9000/)

The night runs from doors to last call. Earn visor looks. ESC → **STAMP** saves a card of the evening. The till is on the pause screen if you want the lights to stay on.

A first-person dusk in Midtown. November 12, 1954. The visor is from later. The sun is still in the street — until it isn't.

Walk a packed floor, take the stairs to a candlelit supper-club lounge, step out onto 47th Street under a wall of towers, or slip out the back into the alley.

No install. Click **ENTER THE NIGHT**.

## The night

The clock starts at 10:00 PM and runs to after hours. Doors, heat, midnight drop, last call, 2am street. The sky, the crowd, and the house system move with it. Today's Gazette and today's set are not yesterday's.

1. Click **ENTER THE NIGHT** (pointer lock + house system).
2. **WASD** to move, mouse to look, **SPACE** on the LED floor to dance.
3. Walk up to a named person and press **E** to talk. What they say depends on the hour.
4. **Front doors** open onto 47th Street — rain, Checkers, Dottie's, Hotel Astoria.
5. **Back doors** dump you in the alley — Vinnie, Muldoon, Socks the cat, fire escape.
6. **Stairs** on the east wall (and the wet fire escape) go up to Velma's lounge.
7. **ESC** — deck, visor looks, night stamp, tip the till. Drop MP3 / WAV / FLAC / OGG.

## Visor looks

Earned, not bought. The visor keeps them.

| Look | How |
| --- | --- |
| STOCK VISOR | You walked in with it |
| BOOTH PINK | Talk to REXA |
| LOUNGE GOLD | Sit upstairs |
| ALLEY LIME | Pet SOCKS |
| 47TH DUSK | Walk 47th Street |
| CUBE CHROME | Touch the yellow cube |
| PEAK RAVE | Hit ENERGY 80 on the floor |
| LAST CALL RED | Still here at last call |

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
