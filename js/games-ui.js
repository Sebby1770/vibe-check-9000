/* On-screen parts of the night's games: the race clock, its countdown and the cards that tell you how you did
   (a run finished, a round of Floor Fever, a record found). Plain DOM over the canvas, styled by games.css. */
import { clock } from "./runs.js";

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

export function createGamesUI() {
  const root = el("div", "games-hud");
  root.id = "gamesHud";
  const bar = el("div", "run-bar"), name = el("span", "run-name"), time = el("strong", "run-time", "0:00.00"), gate = el("span", "run-gate"), delta = el("span", "run-delta gone");
  bar.append(name, time, gate, delta);
  bar.hidden = true;
  const count = el("div", "run-count");
  count.hidden = true;
  count.setAttribute("aria-live", "assertive");
  const card = el("div", "game-card");
  card.hidden = true;
  card.setAttribute("role", "status");
  root.append(bar, count, card);
  document.body.append(root);
  let countTimer = 0, deltaTimer = 0, cardTimer = 0, shownTime = "", shownGate = "";

  return {
    root,
    get cardOpen() { return !card.hidden; },
    runStart(course) {
      name.textContent = course.name.toUpperCase();
      time.textContent = shownTime = "0:00.00";
      gate.textContent = shownGate = `GATE 1/${course.gates.length}`;
      delta.className = "run-delta gone";
      bar.hidden = false;
    },
    /** Each frame of a run. */
    runClock(t, next, total) {
      const text = clock(t), g = `GATE ${Math.min(next + 1, total)}/${total}`;
      if (text !== shownTime) time.textContent = shownTime = text;
      if (g !== shownGate) gate.textContent = shownGate = g;
    },
    /** The count before the off: 3, 2, 1, then "GO". */
    count(text) {
      count.textContent = String(text);
      count.className = `run-count pop${text === "GO" ? " go" : ""}`;
      count.hidden = false;
      // Restart the pop.
      count.style.animation = "none"; void count.offsetWidth; count.style.animation = "";
      clearTimeout(countTimer);
      countTimer = setTimeout(() => { count.hidden = true; }, 900);
    },
    /** Seconds ahead of (negative) or behind your best at a gate; null on a first run. */
    gateDelta(d) {
      if (d == null) return;
      delta.textContent = `${d <= 0 ? "−" : "+"}${Math.abs(d).toFixed(2)}`;
      delta.className = `run-delta ${d <= 0 ? "ahead" : "behind"}`;
      clearTimeout(deltaTimer);
      deltaTimer = setTimeout(() => { delta.className += " gone"; }, 2400);
    },
    runEnd() {
      bar.hidden = true;
      count.hidden = true;
      clearTimeout(countTimer);
    },
    /** A card in the middle of the screen: {kicker, title, lines: [text | {text, cls}], color, ms}. */
    card({ kicker = "", title = "", lines = [], color = "", ms = 7000 }) {
      card.replaceChildren(el("div", "kicker", kicker), el("h3", "", title), ...lines.filter(Boolean).map((l) => (typeof l === "string" ? el("p", "", l) : el("p", l.cls, l.text))));
      card.style.setProperty("--card", color || "");
      card.hidden = false;
      card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
      clearTimeout(cardTimer);
      cardTimer = setTimeout(() => { card.hidden = true; }, ms);
    },
    closeCard() {
      clearTimeout(cardTimer);
      card.hidden = true;
    },
  };
}
