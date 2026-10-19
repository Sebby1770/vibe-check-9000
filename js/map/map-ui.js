/* The minimap in the corner and the full city map (M). The minimap samples a pre-drawn copy of the whole
   city each frame (one drawImage), so it costs next to nothing; the full map redraws vectors while open so
   streets and labels stay sharp at every zoom. Drag to pan, wheel or +/− to zoom, click a pin to mark a
   route. Opened from a subway entrance it becomes the route map: pick a stop and ride. */
import { cityMap, toMap, fromMap, clampView, pickAt, bearingText, MAP_BOUNDS } from "./map-data.js";
import { drawCity, drawMarkers } from "./map-render.js";

const MINI_S = 1.5;        // px per metre on the minimap (about 110 m across)
const PAD = 40;            // metres of paper round the city in the minimap's base image
const ZOOMS = [0.35, 0.5, 0.7, 1, 1.4, 2, 2.8, 4];

export function createMapUI({ onWaypoint, onTravel, onClose } = {}) {
  const $ = (id) => document.getElementById(id);
  const panel = $("cityMap"), canvas = $("cityMapCanvas"), ctx = canvas.getContext("2d");
  const mini = $("minimapCanvas"), mctx = mini.getContext("2d");
  const card = $("mapCard"), list = $("mapStations");
  let base = null, isOpen = false, mode = "map", from = null, raf = 0, t0 = performance.now();
  let view = { cx: 0, cz: 0, s: 1, w: 1, h: 1 }, state = {}, selected = null, drag = null, lastSize = "";

  // --- minimap: the city drawn once, sampled every frame -----------------------------------------------
  function buildBase() {
    const B = MAP_BOUNDS, w = Math.ceil((B.maxX - B.minX + PAD * 2) * MINI_S), h = Math.ceil((B.maxZ - B.minZ + PAD * 2) * MINI_S);
    base = document.createElement("canvas");
    base.width = w; base.height = h;
    const bctx = base.getContext("2d");
    drawCity(bctx, { cx: (B.minX + B.maxX) / 2, cz: (B.minZ + B.maxZ) / 2, s: MINI_S, w, h }, { mini: true });
  }
  function updateMini(next) {
    state = next;
    if (mini.offsetParent === null) return; // hidden (panel open, title, touch layout)
    if (!base) buildBase();
    const dpr = Math.min(2, window.devicePixelRatio || 1), size = mini.clientWidth || 168;
    if (mini.width !== Math.round(size * dpr)) { mini.width = mini.height = Math.round(size * dpr); }
    const p = next.player;
    if (!p) return;
    const B = MAP_BOUNDS, k = dpr;
    // Base image pixel for world (x, z): ((maxX + PAD - x) s, (maxZ + PAD - z) s).
    const bx = (B.maxX + PAD - p.x) * MINI_S, by = (B.maxZ + PAD - p.z) * MINI_S;
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.fillStyle = "#e9dec3"; mctx.fillRect(0, 0, mini.width, mini.height);
    mctx.drawImage(base, bx - size / 2, by - size / 2, size, size, 0, 0, size * k, size * k);
    mctx.setTransform(k, 0, 0, k, 0, 0);
    drawMarkers(mctx, { cx: p.x, cz: p.z, s: MINI_S, w: size, h: size }, { ...next, t: (performance.now() - t0) / 1000, mini: true });
  }

  // --- full map ---------------------------------------------------------------------------------------
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), r = canvas.getBoundingClientRect();
    const key = `${r.width}x${r.height}x${dpr}`;
    if (key === lastSize) return;
    lastSize = key;
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    view = clampView({ ...view, w: r.width, h: r.height });
  }
  function frame() {
    if (!isOpen) return;
    resize();
    const dpr = canvas.width / Math.max(1, view.w);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCity(ctx, view);
    if (selected) {
      const p = toMap(view, selected.item.x, selected.item.z);
      ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.strokeStyle = "#2b2118"; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
    }
    if (mode === "travel" && from) {
      const st = cityMap().stations.find((s) => s.id === from);
      if (st) { const p = toMap(view, st.x, st.z); ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.strokeStyle = "#1f6b3a"; ctx.lineWidth = 3; ctx.stroke(); }
    }
    drawMarkers(ctx, view, { ...state, t: (performance.now() - t0) / 1000 });
    raf = requestAnimationFrame(frame);
  }
  function setZoom(s, ax = view.w / 2, ay = view.h / 2) {
    const before = fromMap(view, ax, ay);
    view = { ...view, s };
    const after = fromMap(view, ax, ay);
    view = clampView({ ...view, cx: view.cx + before.x - after.x, cz: view.cz + before.z - after.z });
  }
  const zoomStep = (dir, ax, ay) => {
    const i = ZOOMS.findIndex((z) => z >= view.s - 1e-6);
    setZoom(ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, (i < 0 ? ZOOMS.length - 1 : i) + dir))], ax, ay);
  };
  function centre() {
    const p = state.player || { x: 0, z: 0 };
    view = clampView({ ...view, cx: p.x, cz: p.z });
  }

  function renderStations() {
    const here = from;
    list.innerHTML = "";
    for (const st of cityMap().stations) {
      const li = document.createElement("li");
      li.className = "map-station" + (st.id === here ? " here" : "");
      const name = document.createElement("button");
      name.type = "button"; name.className = "map-station-name";
      name.innerHTML = `<span class="map-bullet${st.el ? " el" : ""}">${st.el ? "E" : "S"}</span><span><strong>${st.name}</strong><em>${st.line}</em></span>`;
      name.addEventListener("click", () => select({ type: "station", item: st }, true));
      li.append(name);
      if (mode === "travel") {
        const ride = document.createElement("button");
        ride.type = "button"; ride.className = "map-ride";
        ride.textContent = st.id === here ? "YOU ARE HERE" : "RIDE";
        ride.disabled = st.id === here;
        ride.dataset.station = st.id;
        ride.addEventListener("click", () => onTravel?.(st.id));
        li.append(ride);
      }
      list.append(li);
    }
  }
  function select(hit, focus = false) {
    selected = hit;
    if (!hit) { card.hidden = true; return; }
    const it = hit.item, p = state.player;
    if (focus) view = clampView({ ...view, cx: it.x, cz: it.z, s: Math.max(view.s, 1) });
    card.hidden = false;
    $("mapCardKind").textContent = hit.type === "station" ? (it.el ? "THIRD AVENUE EL" : "SUBWAY · " + it.line) : hit.type === "pin" ? "YOUR PIN" : "PLACE";
    $("mapCardName").textContent = it.name;
    $("mapCardDist").textContent = p ? bearingText(p, it) : "";
    const ride = $("mapCardRide");
    ride.hidden = !(mode === "travel" && hit.type === "station" && it.id !== from);
    ride.onclick = () => onTravel?.(it.id);
    $("mapCardHint").textContent = hit.type === "station" && mode !== "travel" ? "Ride from any subway entrance — press E at the stairs." : "";
    $("mapCardMark").onclick = () => onWaypoint?.({ id: hit.type === "station" ? `station-${it.id}` : it.id || "pin", name: it.name, x: hit.type === "station" && it.arrive && !it.board ? it.arrive.x : it.x, z: hit.type === "station" && it.arrive && !it.board ? it.arrive.z : it.z, y: it.y || 0 });
  }

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, cx: view.cx, cz: view.cz, moved: 0 };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
    view = clampView({ ...view, cx: drag.cx + dx / view.s, cz: drag.cz + dy / view.s });
  });
  canvas.addEventListener("pointerup", (e) => {
    const d = drag; drag = null;
    if (!d || d.moved > 5) return;
    const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = pickAt(view, x, y);
    if (hit) select(hit);
    else { const w = fromMap(view, x, y); select({ type: "pin", item: { id: "pin", name: "Your pin", x: w.x, z: w.z, y: 0 } }); }
  });
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    setZoom(Math.max(ZOOMS[0], Math.min(ZOOMS.at(-1), view.s * Math.exp(-e.deltaY * 0.0015))), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  $("mapZoomIn").addEventListener("click", () => zoomStep(1));
  $("mapZoomOut").addEventListener("click", () => zoomStep(-1));
  $("mapCentre").addEventListener("click", centre);
  $("mapClose").addEventListener("click", () => close(true));
  $("minimap").addEventListener("click", () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "m" })));
  window.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    const k = e.key.toLowerCase();
    if (k === "escape" || (k === "m" && !e.repeat)) { e.preventDefault(); e.stopImmediatePropagation(); close(true); }
    else if (k === "+" || k === "=") zoomStep(1);
    else if (k === "-" || k === "_") zoomStep(-1);
    else if (k.startsWith("arrow")) {
      const step = 80 / view.s;
      view = clampView({ ...view, cx: view.cx + (k === "arrowleft" ? step : k === "arrowright" ? -step : 0), cz: view.cz + (k === "arrowup" ? step : k === "arrowdown" ? -step : 0) });
      e.preventDefault();
    }
  }, true);

  function open(nextMode = "map", fromStation = null, nextState = state) {
    mode = nextMode; from = fromStation; state = nextState || {};
    isOpen = true;
    panel.classList.remove("hidden");
    panel.dataset.mode = mode;
    $("cityMapKicker").textContent = mode === "travel" ? "IRT · BMT · THIRD AVENUE EL" : "MIDTOWN · NOVEMBER 1954";
    $("cityMapTitle").textContent = mode === "travel" ? "Choose your stop" : "The city";
    $("mapSideTitle").textContent = mode === "travel" ? "Stops" : "Subway";
    lastSize = "";
    resize();
    view = { ...view, s: mode === "travel" ? 0.7 : 1.4 };
    if (mode === "travel") view = clampView({ ...view, cx: 20, cz: 40 });
    else centre();
    select(null);
    renderStations();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
    requestAnimationFrame(() => (mode === "travel" ? list.querySelector(".map-ride:not([disabled])") : $("mapClose"))?.focus({ preventScroll: true }));
  }
  function close(fromUser = false) {
    if (!isOpen) return;
    isOpen = false;
    cancelAnimationFrame(raf);
    panel.classList.add("hidden");
    if (fromUser) onClose?.();
  }

  return {
    open, close, updateMini,
    get isOpen() { return isOpen; },
    get mode() { return mode; },
    /** For tests: the current view and selection. */
    debug: () => ({ open: isOpen, mode, from, view: { ...view }, selected: selected ? { type: selected.type, name: selected.item.name } : null }),
    /** For tests: what a click at canvas (x, y) would pick. */
    pick: (x, y) => pickAt(view, x, y),
  };
}
