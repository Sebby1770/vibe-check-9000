/* The story's screen furniture: an objective tracker (top right), chapter cards, subtitles, a cutscene
   letterbox and the echo-vision tint. Display only — the rules live in story.js. */
import { CHAPTERS, trackerText } from "./story.js";

export function createStoryUI() {
    const root = document.createElement("div");
    root.className = "story-layer";
    root.innerHTML = `
        <aside class="story-tracker" hidden aria-live="polite">
            <p class="story-kicker"></p>
            <p class="story-objective"></p>
            <p class="story-hint"></p>
        </aside>
        <div class="story-bars" aria-hidden="true"><i></i><i></i></div>
        <section class="story-card" hidden aria-live="polite">
            <p class="story-card-kicker"></p>
            <h2 class="story-card-title"></h2>
            <p class="story-card-blurb"></p>
        </section>
        <p class="story-subtitle" hidden aria-live="polite"><b></b><span></span></p>
        <div class="story-echo" aria-hidden="true"></div>`;
    document.getElementById("visor").append(root);
    const $ = (sel) => root.querySelector(sel);
    const tracker = $(".story-tracker"), card = $(".story-card"), sub = $(".story-subtitle");
    let queue = [], subTimer = 0, cardTimer = 0, lastTracker = "";

    function showNext() {
        clearTimeout(subTimer);
        const next = queue.shift();
        if (!next) { sub.hidden = true; return; }
        sub.querySelector("b").textContent = next.speaker ? `${next.speaker} ` : "";
        sub.querySelector("span").textContent = next.text;
        sub.hidden = false;
        subTimer = setTimeout(showNext, Math.max(2600, 900 + next.text.length * 42));
    }

    return {
        /** Updates the tracker; `extra` adds live status (distance, warnings) under the objective. */
        setTracker(state, hour, extra = "") {
            const t = trackerText(state, hour);
            const key = JSON.stringify([t, extra]);
            if (key === lastTracker) return;
            lastTracker = key;
            tracker.hidden = !t;
            if (!t) return;
            $(".story-kicker").textContent = t.kicker;
            $(".story-objective").textContent = t.text;
            $(".story-hint").textContent = extra || t.hint || "";
            tracker.classList.toggle("done", !!t.done);
        },
        hideTracker() { tracker.hidden = true; lastTracker = ""; },
        card(chapterIndex) {
            const c = CHAPTERS[chapterIndex];
            if (!c) return;
            $(".story-card-kicker").textContent = c.kicker;
            $(".story-card-title").textContent = c.title;
            $(".story-card-blurb").textContent = c.blurb;
            card.hidden = false;
            card.classList.remove("out");
            clearTimeout(cardTimer);
            cardTimer = setTimeout(() => { card.classList.add("out"); cardTimer = setTimeout(() => { card.hidden = true; }, 900); }, 4600);
        },
        ending(title, lines) {
            $(".story-card-kicker").textContent = "The 12:04";
            $(".story-card-title").textContent = title;
            $(".story-card-blurb").textContent = "";
            card.hidden = false;
            card.classList.remove("out");
            clearTimeout(cardTimer);
            cardTimer = setTimeout(() => { card.classList.add("out"); cardTimer = setTimeout(() => { card.hidden = true; }, 900); }, 5200);
            this.say(lines);
        },
        say(lines, speaker = "") { queue.push(...lines.map((text) => ({ text, speaker }))); if (sub.hidden) showNext(); },
        get speaking() { return !sub.hidden || queue.length > 0; },
        letterbox(on) { document.body.classList.toggle("story-cutscene", !!on); },
        echo(on) { document.body.classList.toggle("story-echoes", !!on); },
    };
}
