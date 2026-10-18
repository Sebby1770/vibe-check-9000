/* Title card: a split-flap departures board over a slow crane shot of 47th Street. */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
// The title shot always plays at 10:36 PM, whatever hour the saved night is at.
export const TITLE_SECONDS = 22.6 * 3600;

function tile(ch) {
    const el = document.createElement("span");
    el.className = ch === " " ? "flap flap-gap" : ch === ":" ? "flap flap-colon" : "flap";
    el.dataset.final = ch;
    el.innerHTML = `<b>${ch === " " ? "" : ch}</b>`;
    return el;
}

function setGlyph(el, ch) {
    const b = el.firstChild;
    if (b.textContent === ch) return;
    b.textContent = ch;
    el.classList.remove("flip");
    void el.offsetWidth; // restart the fold animation
    el.classList.add("flip");
}

function spin(el, delay, turns, done) {
    const final = el.dataset.final;
    if (final === " " || final === ":") { done?.(); return; }
    let n = 0;
    window.setTimeout(function step() {
        if (n++ >= turns) { setGlyph(el, final); done?.(); return; }
        setGlyph(el, GLYPHS[(GLYPHS.indexOf(final) + n * 7 + turns) % GLYPHS.length]);
        window.setTimeout(step, 46);
    }, delay);
}

/* Builds every [data-flaps] row into tiles and runs the one opening sequence. */
export function mountTitle(root = document) {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        || document.documentElement.classList.contains("reduced-fx");
    const rows = [...root.querySelectorAll("[data-flaps]")];
    let order = 0;
    for (const row of rows) {
        const text = row.dataset.flaps;
        row.textContent = "";
        for (const ch of text) row.append(tile(ch));
    }
    if (still) return;
    for (const row of rows) {
        for (const el of row.children) {
            if (el.dataset.final === " " || el.dataset.final === ":") continue;
            el.firstChild.textContent = "";
            spin(el, 220 + order * 55, 5 + (order % 4) * 2);
            order++;
        }
    }
    // Once the board settles, the year slips forward to when the visor was made, then back.
    const year = root.querySelector(".flap-year");
    if (!year) return;
    const settle = 220 + order * 55 + 900;
    window.setTimeout(() => {
        year.classList.add("drift");
        [..."2026"].forEach((ch, i) => window.setTimeout(() => setGlyph(year.children[i], ch), i * 70));
        window.setTimeout(() => {
            [..."1954"].forEach((ch, i) => window.setTimeout(() => setGlyph(year.children[i], ch), i * 70));
            window.setTimeout(() => year.classList.remove("drift"), 400);
        }, 1500);
    }, settle);
}

/* A slow crane down 47th Street above the traffic. Hard cut back to the start every lap. */
export function attractShot(camera, t) {
    const lap = 64;
    const u = (t % lap) / lap;
    const x = -30 + u * 58;
    const y = 3.1 + Math.sin(t * 0.21) * 0.25;
    const z = 22.4 + Math.sin(t * 0.13) * 0.6;
    camera.position.set(x, y, z);
    camera.lookAt(x + 14, 2.5 + Math.sin(t * 0.17) * 0.3, 27.5 + Math.sin(t * 0.09) * 2.2);
}
