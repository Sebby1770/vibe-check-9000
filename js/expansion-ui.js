import {
  WORKSHOPS,
  STREET_PLACES,
  SNACKS,
  MYSTERY,
  counterBrief,
  rhythmPhrase,
  normalizeExpansion,
} from "./expansion.js";
export const escapeHTML = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const e = escapeHTML;
export function passportHTML(input) {
  const s = normalizeExpansion(input);
  return `<div class="passport-intro"><span class="passport-total">${Object.keys(s.workshops).length}<small>/ 7</small></span><div><h2>A regular on every corner.</h2><p>Help at all seven counters to earn the BLOCK REGULAR visor. Open a shop and choose “Behind the counter”. Every day brings a new order.</p></div></div><div class="passport-grid">${WORKSHOPS.map((w) => `<article class="passport-stamp ${s.workshops[w.id] ? "earned" : ""}"><span>${s.workshops[w.id] ? "✓" : w.icon}</span><h3>${e(w.owner)}’S COUNTER</h3><p>${e(s.workshops[w.id] || w.title)}</p>${s.workshops[w.id] ? "<small>STAMPED TONIGHT</small>" : `<button data-destination="${w.id}">FIND THE SHOP ↗</button>`}</article>`).join("")}</div><div class="street-souvenirs"><p class="shop-eyebrow">MORE OF YOUR EVENING</p><p>${s.rhythmBest === 3 ? "✓ A duet on the corner" : `○ Corner Set · ${s.rhythmBest}/3 phrases`}</p><p>${s.discoveries.length >= 4 ? "✓ The street photographer" : `○ Photograph ${s.discoveries.length}/4 different areas`}</p><p>${s.mystery === 5 ? "✓ The midnight frequency found" : `○ The midnight frequency · ${s.mystery}/5 clues`}</p>${s.snacks.map((id) => `<p>✓ Mabel’s receipt · ${e(SNACKS.find((n) => n.id === id)?.name)}</p>`).join("")}</div>`;
}
export function albumHTML(input) {
  const s = normalizeExpansion(input);
  return `<div class="album-intro"><h2>Six frames of an impossible night.</h2><p>${s.camera ? "Press C, or the CAMERA button, while exploring to photograph the game. Your latest six pictures stay here. Four different areas earn a visor look." : "Borrow a camera at the 47th Camera Club on the far east sidewalk."}</p>${!s.camera ? '<button data-destination="camera">FIND THE CAMERA CLUB ↗</button>' : ""}</div><div class="photo-grid">${s.photos.map((p) => `<article class="album-print"><img src="${p.image}" alt="${e(p.title)} at ${e(p.clock)}"/><div><h3>${e(p.title)}</h3><small>${e(p.clock)} · NOVEMBER 12, 1954</small><nav><button data-export-photo="${e(p.id)}">SAVE POSTCARD ↗</button><button data-delete-photo="${e(p.id)}" aria-label="Remove ${e(p.title)} from album">REMOVE</button></nav></div></article>`).join("") || '<p class="album-empty">The light is good. You just have to be there.</p>'}</div>`;
}
export function workArt(w, picks) {
  const colors = ["#6d9392", "#cf9e70", "#a57785"],
    chosen = picks.filter((n) => n !== null).length;
  let art = "";
  if (w.id === "club")
    art = `<rect x="24" y="36" width="312" height="218" rx="15" fill="#263e42"/>${picks.map((n,i)=>`<rect x="${65+i*108}" y="69" width="6" height="128" fill="#142c32"/><rect x="${45+i*108}" y="${n===null?130:170-n*42}" width="46" height="16" rx="3" fill="${colors[i]}"/><circle cx="${68+i*108}" cy="221" r="11" fill="${n===null?'#657769':colors[n]}"/>`).join('')}`;
  else if (w.id === "records")
    art = picks
      .map(
        (n, i) =>
          `<g transform="translate(${62 + i * 85} 145)"><circle r="60" fill="#233735"/><circle r="48" fill="none" stroke="#617771"/><circle r="${n === null ? 10 : 22}" fill="${colors[n ?? i]}"/><circle r="4" fill="#e9d9b8"/></g>`,
      )
      .join("");
  else if (w.id === "pharmacy")
    art = `<path d="M116 64H246L226 234H137Z" fill="#f4ead6" stroke="#58776c" stroke-width="4"/>${picks.map((n, i) => `<path d="M${132 + i * 2} ${211 - i * 44}H${231 - i * 2}V${234 - i * 44}H${134 + i * 2}Z" fill="${n === null ? "#e4d9c0" : colors[n]}"/>`).join("")}<path d="M181 65L235 25" stroke="#97747d" stroke-width="8"/>`;
  else if (w.id === "florist")
    art = `<path d="M105 143L256 143L202 250H168Z" fill="${["#b18f65", "#f2e8d4", "#384d69"][picks[2] ?? 0]}"/>${Array.from(
      { length: 7 },
      (_, i) => {
        const x = 105 + i * 25,
          y = 100 + Math.sin(i * 2) * 28;
        return `<path d="M184 227L${x} ${y}" stroke="${["#6e927a", "#365f46", "#8b9859"][picks[1] ?? 0]}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="24" fill="${picks[0] === null ? "#c5cbb7" : ["#b35e77", "#d3b15f", "#e7e4cf"][picks[0]]}"/><circle cx="${x}" cy="${y}" r="8" fill="#e8c982"/>`;
      },
    ).join("")}<path d="M158 213H213" stroke="#f0dfb9" stroke-width="10"/>`;
  else if (w.id === "barber")
    art = `<path d="M55 260Q85 172 180 188Q276 176 311 260" fill="${colors[picks[1] ?? 0]}"/><ellipse cx="182" cy="120" rx="48" ry="61" fill="#c69570"/><path d="M132 114Q115 ${picks[0] === 0 ? "19" : "49"} 182 48Q247 43 229 116L215 74L143 93Z" fill="#3e302b"/><path d="M143 117H220V136H143Z" fill="#244d49"/><path d="M148 122H215" stroke="#a9d5c0" stroke-width="5"/><path d="M174 192L192 192L204 252H162Z" fill="${colors[picks[2] ?? 2]}"/>`;
  else if (w.id === "rivoli")
    art = picks
      .map(
        (n, i) =>
          `<g transform="translate(${18 + i * 111} 77)"><rect width="105" height="133" rx="4" fill="#253c3c"/><path d="M12 95L39 ${n === null ? 85 : 35 + n * 15}L66 73L90 37V120H12Z" fill="${colors[n ?? i]}"/><text x="52" y="30" text-anchor="middle" fill="#eddab8" font-size="17">ACT ${i + 1}</text>${Array.from({ length: 5 }, (_, k) => `<rect x="3" y="${8 + k * 25}" width="5" height="10" fill="#ead6b1"/>`).join("")}</g>`,
      )
      .join("");
  else if (w.id === "liquor")
    art = `<rect x="73" y="125" width="215" height="130" fill="${colors[picks[1] ?? 1]}"/><path d="M148 38H183V100L201 122V229H131V122L148 100Z" fill="#496756"/><rect x="142" y="141" width="48" height="49" fill="#ebdabb"/><rect x="211" y="164" width="59" height="62" transform="rotate(8 211 164)" fill="#f4e8ca"/><text x="239" y="202" text-anchor="middle" font-size="15" fill="#3b594b">${picks[2] === null ? "?" : ["V", "M", "F"][picks[2]]}</text>`;
  else
    art = `<rect x="24" y="85" width="310" height="165" rx="35" fill="#8aada4"/><ellipse cx="139" cy="175" rx="78" ry="53" fill="#f2e2c1"/><path d="M86 191L151 127L190 190Z" fill="${colors[picks[0] ?? 1]}"/><rect x="237" y="107" width="55" height="91" rx="10" fill="${colors[picks[1] ?? 0]}"/><path d="M256 91Q239 63 264 41" stroke="#f4e7cd" stroke-width="5" fill="none"/><ellipse cx="274" cy="222" rx="30" ry="11" fill="${colors[picks[2] ?? 1]}"/>`;
  return `<svg viewBox="0 0 360 280" role="img" aria-label="${e(w.noun)} · ${chosen} of 3 parts selected"><rect width="360" height="280" fill="#e6d8bc"/>${art}</svg>`;
}
export function createExpansionUI(hooks = {}) {
  const root = document.createElement("section");
  root.className = "shop-overlay activity-overlay";
  root.hidden = true;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  document.body.append(root);
  let page = "",
    state = {},
    brief = null,
    picks = [null, null, null],
    notice = "",
    story = null,
    prior = null,
    seed = 0,
    round = 0,
    pressed = [],
    mode = "idle",
    timers = [],
    generation = 0;
  function stop() {
    generation++;
    timers.forEach(clearTimeout);
    timers = [];
    hooks.onStopNotes?.();
  }
  function close() {
    stop();
    root.hidden = true;
    document.getElementById("visor").inert = false;
    prior?.focus?.();
  }
  function exit() {
    close();
    hooks.onClose?.(brief?.id);
  }
  const button = (label, attr, cls = "activity-button") =>
    `<button class="${cls}" ${attr}>${label}</button>`;
  function render() {
    const focus = root.querySelector(":focus")?.dataset.focus,
      scroll = root.querySelector(".shop-scroll")?.scrollTop || 0;
    const title =
      brief?.title ||
      {
        noticeboard: "Tonight belongs to the block.",
        nightcart: "Something warm for the walk.",
        busker: "A little call. A little response.",
        camera: "The night looks good on paper.",
        signal: story?.title || "The midnight frequency.",
      }[page];
    root.setAttribute("aria-label", title);
    root.style.setProperty("--activity-color", brief?.color || "#476d62");
    root.innerHTML = `<div class="shop-sheet activity-sheet"><header class="shop-mast"><span>${brief ? e(brief.owner) + " · BEHIND THE COUNTER" : "47TH STREET · AFTER DARK"}</span><button class="shop-close" data-close data-focus="close">${brief ? "BACK TO SHOP" : "CLOSE"} <b>×</b></button></header><div class="shop-scroll"><div class="activity-heading"><p class="shop-eyebrow">${brief ? "A SMALL JOB. A GOOD EVENING." : "MORE THAN A WAY TO GET HOME"}</p><h1>${e(title)}</h1><p>${e(brief?.subtitle || { noticeboard: "Follow your curiosity. The city keeps the receipts.", nightcart: "Mabel has been feeding this block since before it had opinions.", busker: "Listen to the phrase. Answer with the same notes. No rush.", camera: "Borrow a camera. Walk somewhere worth remembering.", signal: "A wrong number from the right decade." }[page])}</p></div>${content()}<p class="activity-feedback" role="status" aria-live="polite">${e(notice)}</p></div><footer class="shop-foot"><span>${brief ? "Your work earns a stamp in the seven-shop passport." : "All night. On the house. Yours to discover."}</span><span>47TH / LATE EDITION</span></footer></div>`;
    root.querySelector("[data-close]").onclick = exit;
    root.querySelectorAll("[data-pick]").forEach(
      (b) =>
        (b.onclick = () => {
          picks[Number(b.dataset.step)] = Number(b.dataset.pick);
          notice = "";
          render();
          if (brief.id === "records") hooks.onNote?.(Number(b.dataset.pick));
        }),
    );
    root.querySelector("[data-submit]")?.addEventListener("click", () => {
      const r = hooks.onCounter?.(brief.id, picks);
      state = r.state;
      notice = r.message;
      render();
      root
        .querySelector(".activity-feedback")
        .scrollIntoView({ block: "nearest" });
    });
    root.querySelectorAll("[data-go]").forEach(
      (b) =>
        (b.onclick = () => {
          close();
          hooks.onNavigate?.(b.dataset.go);
        }),
    );
    root.querySelectorAll("[data-notebook]").forEach(
      (b) =>
        (b.onclick = () => {
          close();
          hooks.onNotebook?.(b.dataset.notebook);
        }),
    );
    root.querySelectorAll("[data-snack]").forEach(
      (b) =>
        (b.onclick = () => {
          const r = hooks.onSnack?.(b.dataset.snack);
          state = r.state;
          notice = r.message;
          render();
          root
            .querySelector(".activity-feedback")
            .scrollIntoView({ block: "nearest" });
        }),
    );
    root.querySelector("[data-camera]")?.addEventListener("click", () => {
      state = hooks.onCamera?.();
      notice =
        "Camera borrowed. Close this page and press C, or CAMERA, to take your first photo.";
      render();
    });
    root.querySelector("[data-contact]")?.addEventListener("click", () => {
      const r = hooks.onClue?.("camera");
      state = r.state;
      story = r;
      page = "signal";
      notice = "";
      render();
    });
    root.querySelector("[data-listen]")?.addEventListener("click", listen);
    root.querySelector("[data-signal-play]")?.addEventListener("click", () => {
      hooks.onSignalPlay?.();
      notice = "The midnight frequency is back on REXA’s system.";
      render();
    });
    root
      .querySelectorAll("[data-pad]")
      .forEach((b) => (b.onclick = () => pad(Number(b.dataset.pad))));
    root.querySelector("[data-again]")?.addEventListener("click", () => {
      round = 0;
      mode = "idle";
      notice = "A fresh phrase. Same friendly corner.";
      render();
    });
    root.querySelector(".shop-scroll").scrollTop = scroll;
    if (focus)
      root
        .querySelector(`[data-focus="${focus}"]:not(:disabled)`)
        ?.focus({ preventScroll: true });
    if (!root.contains(document.activeElement))
      root
        .querySelector("button:not(:disabled)")
        ?.focus({ preventScroll: true });
  }
  function content() {
    if (brief)
      return `<div class="counter-work"><aside class="counter-order"><div class="order-slip"><small>ORDER No. ${String((seed % 900) + 100)} · ${e(brief.owner)}</small><h2>The order on the counter</h2><ol>${brief.recipe.map((n, i) => `<li><span>${e(brief.steps[i][0])}</span>${e(brief.steps[i][1][n])}</li>`).join("")}</ol></div><div class="counter-art">${workArt(brief, picks)}</div><p class="counter-status">${state.workshops[brief.id] ? "✓ PASSPORT STAMPED" : "○ YOUR STAMP IS WAITING"}</p></aside><div class="counter-choices">${brief.steps.map(([label, options], i) => `<fieldset><legend><b>0${i + 1}</b> ${e(label)}</legend><div>${options.map((v, n) => button(e(v), `data-step="${i}" data-pick="${n}" data-focus="pick-${i}-${n}" aria-pressed="${picks[i] === n}"`, "counter-choice")).join("")}</div></fieldset>`).join("")}${button(e(brief.verb) + " ↗", `data-submit data-focus="submit" ${picks.includes(null) ? "disabled" : ""}`)}<p class="counter-help">Match the order slip. Change anything before you finish. There’s no timer.</p></div></div>`;
    if (page === "noticeboard")
      return `<div class="notice-grid">${STREET_PLACES.filter((p) =>
        ["busker", "nightcart", "camera", "payphone"].includes(p.id),
      )
        .map(
          (p, i) =>
            `<article class="street-notice"><small>0${i + 1} · A REASON TO WANDER</small><h2>${e(p.name)}</h2><p>${e(p.description)}</p>${button("MARK THE WAY ↗", `data-go="${p.id}"`)}</article>`,
        )
        .join(
          "",
        )}<article class="street-notice passport-notice"><small>HELP WANTED · ALL SEVEN COUNTERS</small><h2>Become a regular.</h2><p>Make a bouquet. Cut a set. Save the late show. A different little job in every shop. Paid shifts, a wallet and your own apartment are waiting too.</p>${button("OPEN MY PASSPORT ↗", 'data-notebook="passport"')}${button("WALLET, JOBS & HOMES ↗", 'data-notebook="life"')}</article></div>`;
    if (page === "nightcart")
      return `<div class="snack-grid">${SNACKS.map((s) => `<article><div class="snack-illustration">${s.icon}</div><p class="shop-eyebrow">MABEL’S SPECIAL</p><h2>${e(s.name)}</h2><p>${e(s.detail)}</p>${button(state.snacks.includes(s.id) ? "ANOTHER, PLEASE ↗" : "ONE FOR THE ROAD ↗", `data-snack="${s.id}" data-focus="snack-${s.id}"`)}${state.snacks.includes(s.id) ? "<small>RECEIPT IN YOUR PASSPORT</small>" : ""}</article>`).join("")}</div>`;
    if (page === "camera")
      return `<div class="camera-loan"><div class="camera-drawing" aria-hidden="true"><span>47</span><i></i><b>F/1954</b></div><div><p class="shop-eyebrow">NO DEPOSIT. BRING BACK A GOOD STORY.</p><h2>${state.camera ? "Your camera is ready." : "A camera for the curious."}</h2><p>Photograph the actual game world. Keep six frames in your notebook; download any one as a postcard. Explore four different areas for the STREET PHOTOGRAPHER visor.</p>${button(state.camera ? "OPEN MY ALBUM ↗" : "BORROW THE CAMERA ↗", state.camera ? 'data-notebook="photos"' : 'data-camera data-focus="camera"')}${state.mystery === 2 ? button("ASK ABOUT FRAME THIRTEEN ↗", "data-contact") : ""}</div></div>`;
    if (page === "signal")
      return `<div class="signal-letter"><span class="signal-number">${String(Math.min(5, state.mystery)).padStart(2, "0")} / 05</span><p>${e(story?.message)}</p>${state.mystery < 5 ? button("MARK THE NEXT LEAD ↗", `data-go="${MYSTERY[state.mystery].target}"`) : '<div class="signal-complete">✓ THE MIDNIGHT FREQUENCY<br><small>New house set · SIGNAL SILVER visor</small></div>'}${state.mystery === 5 ? button("PLAY THE MIDNIGHT FREQUENCY ▷", 'data-signal-play data-focus="signal-play"') : ""}${button("OPEN MY NOTEBOOK", 'data-notebook="leads"', "activity-secondary")}</div>`;
    if (page === "busker")
      return `<div class="duet"><div class="duet-score"><span>PHRASE <b>${Math.min(3, round + 1)} / 3</b></span><span>TONIGHT’S BEST <b>${state.rhythmBest} / 3</b></span></div><div class="duet-bars" aria-hidden="true">${Array.from({ length: 13 }, (_, i) => `<i style="height:${20 + ((i * 31) % 70)}px"></i>`).join("")}</div><p class="duet-instructions" aria-live="polite">${
        mode === "listening"
          ? "Listen and watch the pads…"
          : mode === "input"
            ? `Your turn: ${rhythmPhrase(round, seed)
                .map((n) => ["A", "S", "D"][n])
                .join(" · ")}. ${pressed.length} played.`
            : mode === "complete"
              ? "The corner has a new musician. Your duet is in the passport."
              : "Three notes. Match the order, at your own pace."
      }</p><div class="duet-pads">${["A", "S", "D"].map((n, i) => button(`<span>${["LOW", "MIDDLE", "HIGH"][i]}</span><b>${n}</b>`, `data-pad="${i}" data-focus="pad-${i}" ${mode !== "input" ? "disabled" : ""}`, "duet-pad")).join("")}</div>${mode === "complete" ? button("PLAY ANOTHER SET ↗", "data-again") : button(mode === "input" ? "HEAR IT AGAIN" : "LISTEN TO THE PHRASE ▷", `data-listen data-focus="listen" ${mode === "listening" ? "disabled" : ""}`)}<p class="counter-help">Use A, S, D, or tap the pads. The letters also show the phrase. Timing doesn’t affect your score.</p></div>`;
    return "";
  }
  function listen() {
    stop();
    mode = "listening";
    pressed = [];
    notice = "";
    render();
    const token = generation;
    rhythmPhrase(round, seed).forEach((n, i) =>
      timers.push(
        setTimeout(() => {
          if (token !== generation) return;
          hooks.onNote?.(n);
          root
            .querySelectorAll("[data-pad]")
            .forEach((b) =>
              b.classList.toggle("sounding", Number(b.dataset.pad) === n),
            );
        }, i * 550),
      ),
    );
    timers.push(
      setTimeout(
        () => {
          if (token !== generation) return;
          mode = "input";
          render();
        },
        rhythmPhrase(round, seed).length * 550 + 150,
      ),
    );
  }
  function pad(n) {
    if (mode !== "input") return;
    hooks.onNote?.(n);
    const phrase = rhythmPhrase(round, seed);
    if (n !== phrase[pressed.length]) {
      mode = "idle";
      pressed = [];
      notice = "Close. Listen again; the musician saved your place.";
      render();
      return;
    }
    pressed.push(n);
    if (pressed.length === phrase.length) {
      state = hooks.onDuet?.(round + 1).state;
      round++;
      mode = round === 3 ? "complete" : "idle";
      notice =
        round === 3
          ? "A proper duet. CORNER GOLD is unlocked."
          : "That’s the phrase. Ready for the next one.";
    }
    render();
  }
  root.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      ev.preventDefault();
      exit();
    } else if (
      page === "busker" &&
      !ev.repeat &&
      ["a", "s", "d"].includes(ev.key.toLowerCase())
    ) {
      ev.preventDefault();
      pad(["a", "s", "d"].indexOf(ev.key.toLowerCase()));
    } else if (ev.key === "Tab") {
      const all = [...root.querySelectorAll("button:not(:disabled)")];
      if (ev.shiftKey && document.activeElement === all[0]) {
        ev.preventDefault();
        all.at(-1)?.focus();
      } else if (!ev.shiftKey && document.activeElement === all.at(-1)) {
        ev.preventDefault();
        all[0]?.focus();
      }
    }
    ev.stopPropagation();
  });
  root.addEventListener("keyup", (ev) => ev.stopPropagation());
  return {
    close,
    get isOpen() {
      return !root.hidden;
    },
    open(type, data, ctx = {}) {
      stop();
      prior = document.activeElement;
      page = type;
      state = normalizeExpansion(data);
      seed = ctx.seed || 0;
      brief = type === "counter" ? counterBrief(ctx.shop, seed) : null;
      picks = [null, null, null];
      notice = "";
      story = ctx.story;
      round = 0;
      mode = "idle";
      root.hidden = false;
      document.getElementById("visor").inert = true;
      render();
      root.querySelector("button")?.focus();
    },
  };
}
