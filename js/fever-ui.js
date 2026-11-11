/* Floor Fever on screen: four lanes of arrows falling to a line, drawn on a canvas at the foot of the screen.
   fever.js keeps the score; this only draws it, and passes on a tap in a lane (for touch and mouse). */
import { LANES, multiplier } from "./fever.js";

const COLORS = ["#ff6fb5", "#5fd6e8", "#93e06c", "#f2c14a"]; // ← ↓ ↑ →, the floor's own neon
const TURN = [Math.PI, Math.PI / 2, -Math.PI / 2, 0];        // an arrow drawn pointing right, turned per lane
const LEAD = 1.55;                                           // seconds a note is on screen before its beat
const TONE = { perfect: "#f4efe0", great: "#a6d99c", good: "#f2c14a", miss: "#ee8a72" };

function arrow(g, x, y, s, lane) {
  g.save();
  g.translate(x, y);
  g.rotate(TURN[lane]);
  g.beginPath();
  g.moveTo(s, 0); g.lineTo(0.05 * s, -0.95 * s); g.lineTo(0.05 * s, -0.42 * s); g.lineTo(-s, -0.42 * s);
  g.lineTo(-s, 0.42 * s); g.lineTo(0.05 * s, 0.42 * s); g.lineTo(0.05 * s, 0.95 * s);
  g.closePath();
  g.restore();
}

export function createFeverUI({ onLane }) {
  const wrap = document.createElement("div");
  wrap.className = "fever";
  wrap.id = "fever";
  wrap.hidden = true;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-label", "Floor Fever: four lanes, left, down, up, right");
  const hint = document.createElement("p");
  hint.textContent = "← ↓ ↑ →  OR  A S W D  ·  ESC TO STOP";
  wrap.append(canvas, hint);
  document.body.append(wrap);
  const g = canvas.getContext("2d");
  let W = 0, H = 0;
  function size() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!r.width) return;
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", () => { if (!wrap.hidden) size(); });
  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    onLane(Math.max(0, Math.min(LANES - 1, Math.floor(((e.clientX - r.left) / r.width) * LANES))));
    e.preventDefault();
  });
  const flashAt = [-9, -9, -9, -9], flashHit = [false, false, false, false];
  let judge = "", judgeAt = -9;

  return {
    canvas,
    get open() { return !wrap.hidden; },
    show() { wrap.hidden = false; size(); flashAt.fill(-9); judge = ""; },
    hide() { wrap.hidden = true; },
    /** A key or tap in a lane at game time `now`: result is perfect/great/good, or null if nothing was there. */
    tap(lane, result, now) {
      flashAt[lane] = now; flashHit[lane] = !!result;
      if (result) { judge = result; judgeAt = now; }
    },
    miss(now) { judge = "miss"; judgeAt = now; },
    /** now: the game clock. round: fever.js state. t0: the first beat of the count-in; beatLen: seconds a beat;
        first/last: the first and last notes' times. reduced: no pulsing. */
    draw({ now, round, t0, beatLen, first, last, reduced = false }) {
      if (!W) size();
      if (!W) return;
      const lane = W / LANES, lineY = H - 62, top = 44, travel = lineY - top, s = Math.min(22, lane * 0.3);
      g.clearRect(0, 0, W, H);
      g.fillStyle = "rgba(8, 7, 10, 0.62)";
      g.fillRect(0, 0, W, H);
      // Lanes, pulsing softly on the beat.
      const beat = (now - t0) / beatLen, pulse = reduced ? 0 : Math.max(0, 1 - (beat - Math.floor(beat)) * 2.2);
      for (let l = 0; l < LANES; l++) {
        g.fillStyle = COLORS[l];
        g.globalAlpha = 0.05 + pulse * 0.035;
        g.fillRect(l * lane + 2, top - 8, lane - 4, H - top + 8);
      }
      g.globalAlpha = 1;
      // Progress along the top.
      g.fillStyle = "rgba(239, 227, 196, 0.18)";
      g.fillRect(0, 0, W, 3);
      g.fillStyle = "#f2a541";
      g.fillRect(0, 0, W * Math.max(0, Math.min(1, (now - first) / Math.max(0.001, last - first))), 3);
      // Score and combo.
      g.textBaseline = "middle";
      g.fillStyle = "#efe3c4";
      g.font = '900 24px "Big Shoulders Display", "Oswald", sans-serif';
      g.textAlign = "left";
      g.fillText(String(Math.round(round.score)).padStart(6, "0"), 12, 24);
      g.textAlign = "right";
      g.font = '700 15px "Big Shoulders Text", "Oswald", sans-serif';
      g.fillStyle = round.combo >= 10 ? "#f2a541" : "rgba(239, 227, 196, 0.75)";
      g.fillText(round.combo > 1 ? `${round.combo} COMBO  ×${multiplier(round.combo)}` : "FLOOR FEVER", W - 12, 24);
      // The line, and the arrows you aim for.
      g.fillStyle = "rgba(239, 227, 196, 0.2)";
      g.fillRect(0, lineY - 1, W, 2);
      for (let l = 0; l < LANES; l++) {
        const cx = (l + 0.5) * lane, age = now - flashAt[l], lit = age >= 0 && age < 0.16;
        arrow(g, cx, lineY, s * (lit ? 1.14 : 1), l);
        g.lineWidth = 2.5;
        g.strokeStyle = COLORS[l];
        g.globalAlpha = lit ? 1 : 0.6;
        g.stroke();
        if (lit) { g.globalAlpha = (flashHit[l] ? 0.7 : 0.22) * (1 - age / 0.16); g.fillStyle = COLORS[l]; g.fill(); }
        g.globalAlpha = 1;
      }
      // Notes on their way down.
      for (const n of round.notes) {
        const dt = n.time - now;
        if (dt > LEAD) break;
        if (n.result && n.result !== "miss") continue;
        if (dt < -0.35) continue;
        const y = lineY - (dt / LEAD) * travel;
        arrow(g, (n.lane + 0.5) * lane, y, s, n.lane);
        g.globalAlpha = n.result === "miss" ? 0.22 : Math.min(1, (LEAD - dt) / 0.25);
        g.fillStyle = COLORS[n.lane];
        g.fill();
        g.lineWidth = 1.5;
        g.strokeStyle = "rgba(8, 7, 10, 0.75)";
        g.stroke();
        g.globalAlpha = 1;
      }
      // How that last one went.
      const ja = now - judgeAt;
      if (judge && ja < 0.55) {
        g.globalAlpha = Math.max(0, 1 - ja / 0.55);
        g.fillStyle = TONE[judge];
        g.textAlign = "center";
        g.font = '900 30px "Big Shoulders Display", "Oswald", sans-serif';
        g.fillText(judge.toUpperCase(), W / 2, lineY - 58 - ja * 22);
        g.globalAlpha = 1;
      }
      // The count-in: one bar, on the club's own beat.
      if (now < first) {
        const left = Math.ceil((first - now) / beatLen);
        if (left >= 1 && left <= 4) {
          g.fillStyle = "#efe3c4";
          g.textAlign = "center";
          g.font = '900 96px "Big Shoulders Display", "Oswald", sans-serif';
          g.globalAlpha = reduced ? 1 : 0.35 + 0.65 * pulse;
          g.fillText(String(left), W / 2, top + travel * 0.42);
          g.globalAlpha = 1;
        }
      }
    },
  };
}
