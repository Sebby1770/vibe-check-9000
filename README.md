# VIBE CHECK 9000™

A first-person nightclub in the browser. No quiz. Walk in, talk to people, dance, drop your own music.

Live: <https://sebby1770.github.io/vibe-check-9000/>

## The night

1. Click **ENTER THE CLUB** (pointer lock + house system).
2. WASD to move, mouse to look, **SPACE** on the LED floor to dance.
3. Walk up to a named person and press **E** to talk.
   - **REXA** runs the booth
   - **ION** pours colors at the bar
   - **PIXEL / GHOST / KAI** hang on the floor
   - **NOVA** greets at the arch
4. **ESC** opens the deck. Drop MP3 / WAV / FLAC / OGG. Play, skip, or return to the house oscillators.
5. Yellow cube by the bar is still illegal geometry.

## Run locally

```bash
python3 -m http.server 8000
npm test
```

Needs HTTP because of ES modules. No build step.
