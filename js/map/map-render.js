/* Draws the street map onto a 2D canvas: a cream 1950s pocket map with white streets, tan blocks, warm
   walk-in buildings, green parks, the North River, the El, subway globes, and labels that stay upright and
   crisp at any zoom. drawCity paints the static city; drawMarkers adds you, your route and the story. */
import { cityMap, toMap, visiblePlace, mapHeading, MAP_SIDEWALK, MAP_BOUNDS } from "./map-data.js";

export const MAP_INK = "#2b2118";
const C = {
  paper: "#e9dec3", water: "#a7bcbd", waterInk: "#6f8a8c", park: "#b9c99a", parkInk: "#7f9465",
  square: "#e4cf9f", yard: "#d3c6a3", pier: "#b49770", ship: "#59606a", street: "#fbf7ec", lane: "#ece3cc",
  streetEdge: "#8c7a5b", block: "#d2bd98", blockTall: "#bfa682", blockInk: "#7d6450",
  venue: "#dd9e68", shop: "#e3b37c", home: "#c9b07c", venueInk: "#6e4325", el: "#3a3530",
  station: "#1f6b3a", stationRing: "#f4efe0", signal: "#e65a3e", tungsten: "#f2a541", you: "#b7282b",
};
const FONT = '"Big Shoulders Text", "Oswald", "Arial Narrow", sans-serif';

/** Paints the static city for `view` = { cx, cz, s, w, h } (CSS px; the caller sets the device-pixel transform). */
export function drawCity(ctx, view, { labels = true, mini = false } = {}) {
  const map = cityMap(), s = view.s;
  ctx.save();
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, view.w, view.h);
  // World-space drawing: screen = (w/2 - (x - cx) s, h/2 - (z - cz) s).
  ctx.save();
  ctx.transform(-s, 0, 0, -s, view.w / 2 + view.cx * s, view.h / 2 + view.cz * s);
  const px = 1 / s; // one screen pixel in metres
  const fillRect = (r, fill, stroke = null, lw = 1) => {
    ctx.fillStyle = fill;
    ctx.fillRect(r.minX, r.minZ, r.maxX - r.minX, r.maxZ - r.minZ);
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw * px; ctx.strokeRect(r.minX, r.minZ, r.maxX - r.minX, r.maxZ - r.minZ); }
  };
  for (const a of map.areas) {
    if (a.kind === "water") fillRect(a, C.water);
    else if (a.kind === "park") fillRect(a, C.park, C.parkInk, 0.8);
    else if (a.kind === "square") fillRect(a, C.square, C.streetEdge, 0.6);
    else if (a.kind === "yard") fillRect(a, C.yard);
    else if (a.kind === "pier") fillRect(a, C.pier, C.blockInk, 0.8);
    else if (a.kind === "ship") fillRect(a, C.ship);
    else if (a.kind === "bandshell") fillRect(a, C.block, C.blockInk, 0.8);
  }
  // The river's wave hatching (full map only).
  if (!mini && s > 0.5) {
    ctx.strokeStyle = C.waterInk; ctx.lineWidth = 0.8 * px; ctx.globalAlpha = 0.35;
    ctx.beginPath();
    const step = Math.max(14, 22 / s);
    for (let z = MAP_BOUNDS.minZ; z < MAP_BOUNDS.maxZ + 60; z += step) for (let x = 392 + ((z / step) % 2) * step * 0.5; x < MAP_BOUNDS.maxX + 60; x += step * 1.6) {
      ctx.moveTo(x, z); ctx.quadraticCurveTo(x + step * 0.25, z + step * 0.18, x + step * 0.5, z);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Streets: every edge first, then every fill, so crossings join cleanly.
  ctx.lineCap = "butt";
  for (const pass of [0, 1]) for (const r of map.roads) {
    const width = (r.lane ? r.width : r.width + MAP_SIDEWALK * 2) + (pass === 0 ? 1.6 * px : 0);
    ctx.strokeStyle = pass === 0 ? C.streetEdge : r.lane ? C.lane : C.street;
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(r.a[0], r.a[1]); ctx.lineTo(r.b[0], r.b[1]); ctx.stroke();
  }
  if (!mini && s >= 1.4) {
    ctx.strokeStyle = "rgba(140,122,91,0.45)"; ctx.lineWidth = 0.7 * px; ctx.setLineDash([4 * px, 4 * px]);
    ctx.beginPath();
    for (const r of map.roads) if (!r.lane) { ctx.moveTo(r.a[0], r.a[1]); ctx.lineTo(r.b[0], r.b[1]); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  // Blocks, darker as they rise, then the buildings you can walk into.
  for (const b of map.blocks) fillRect(b, b.h > 30 ? C.blockTall : C.block, C.blockInk, 0.6);
  for (const v of map.venues) fillRect(v, v.kind === "shop" ? C.shop : v.kind === "home" ? C.home : C.venue, C.venueInk, 0.9);
  // The pier fence and the El.
  ctx.strokeStyle = C.el; ctx.lineWidth = 1 * px; ctx.setLineDash([3 * px, 2 * px]);
  ctx.beginPath();
  ctx.moveTo(map.fence.x, map.fence.z0); ctx.lineTo(map.fence.x, map.fence.gate[0]);
  ctx.moveTo(map.fence.x, map.fence.gate[1]); ctx.lineTo(map.fence.x, map.fence.z1);
  ctx.stroke(); ctx.setLineDash([]);
  ctx.lineWidth = Math.max(1.2 * px, 0.9);
  ctx.beginPath();
  for (const dx of [-3.4, 3.4]) { ctx.moveTo(map.el.x + dx, map.el.z0); ctx.lineTo(map.el.x + dx, map.el.z1); }
  ctx.stroke();
  ctx.setLineDash([1.2 * px, 5 * px]); ctx.lineWidth = 6.8;
  ctx.beginPath(); ctx.moveTo(map.el.x, map.el.z0); ctx.lineTo(map.el.x, map.el.z1); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  if (labels) drawLabels(ctx, view, mini);
  // Subway globes on top of everything static.
  for (const st of map.stations) {
    const p = toMap(view, st.x, st.z);
    if (p.x < -20 || p.y < -20 || p.x > view.w + 20 || p.y > view.h + 20) continue;
    const r = stationRadius(s, mini);
    ctx.beginPath(); ctx.arc(p.x, p.y, r + 1.6, 0, Math.PI * 2); ctx.fillStyle = C.stationRing; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = st.el ? C.el : C.station; ctx.fill();
    if (r >= 6) { ctx.fillStyle = C.stationRing; ctx.font = `700 ${Math.round(r * 1.25)}px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(st.el ? "E" : "S", p.x, p.y + 0.5); }
  }
  ctx.restore();
}

const stationRadius = (s, mini) => (mini ? 4.5 : Math.max(5, Math.min(8, 3 + s * 2)));

function halo(ctx, text, x, y, { size = 11, weight = 600, color = MAP_INK, align = "center", angle = 0, spacing = 0, alpha = 1 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px ${FONT}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${spacing}px`;
  ctx.textAlign = align; ctx.textBaseline = "middle";
  ctx.lineJoin = "round"; ctx.lineWidth = Math.max(2.5, size * 0.28); ctx.strokeStyle = "rgba(233,222,195,0.92)";
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = color; ctx.fillText(text, 0, 0);
  ctx.restore();
}

/* Labels are placed greedily in priority order — stops, landmarks, districts, streets, buildings, then local
   places — and any label that would overlap one already placed is left out, so the map never smudges. */
function drawLabels(ctx, view, mini) {
  const map = cityMap(), s = view.s, placed = [];
  const onScreen = (p, m = 60) => p.x > -m && p.y > -m && p.x < view.w + m && p.y < view.h + m;
  const tryLabel = (text, x, y, opts) => {
    const size = opts.size || 11;
    ctx.font = `${opts.weight || 600} ${size}px ${FONT}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${opts.spacing || 0}px`;
    const w = ctx.measureText(text).width + 4, h = size * 1.15, a = opts.angle || 0;
    const ax = opts.align === "left" ? 0 : -w / 2, c = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a));
    const cx = x + (ax + w / 2) * Math.cos(a), cy = y + (ax + w / 2) * Math.sin(a);
    const bw = w * c + h * sn, bh = w * sn + h * c, r = { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
    if (placed.some((o) => r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y)) return false;
    placed.push(r);
    halo(ctx, text, x, y, opts);
    return true;
  };
  const pin = (p, solid) => {
    ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2); ctx.fillStyle = MAP_INK; ctx.fill();
    if (!solid) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); }
  };
  // Every subway globe reserves its own spot first.
  for (const st of map.stations) {
    const p = toMap(view, st.x, st.z), r = stationRadius(s, mini) + 2;
    placed.push({ x: p.x - r, y: p.y - r, w: r * 2, h: r * 2 });
  }
  if (!mini && s >= 0.45) for (const st of map.stations) {
    const p = toMap(view, st.x, st.z);
    if (onScreen(p)) tryLabel(st.name.toUpperCase(), p.x + stationRadius(s, mini) + 5, p.y, { size: 12, weight: 700, color: st.el ? C.el : C.station, align: "left" });
  }
  if (!mini) for (const pl of map.places) {
    if (pl.kind !== "landmark") continue;
    const p = toMap(view, pl.x, pl.z);
    if (!onScreen(p)) continue;
    pin(p, true);
    tryLabel(pl.name, p.x + 7, p.y, { size: 12, weight: 700, align: "left" });
  }
  // District names: big, spaced and faint; the river's runs down its bank.
  if (!mini || s < 2.5) for (const d of map.districts) {
    const p = toMap(view, d.x, d.z);
    if (!onScreen(p, 200)) continue;
    const size = Math.round(Math.max(11, Math.min(30, 13 * d.size * Math.sqrt(s * 1.6))));
    tryLabel(d.text, p.x, p.y, { size, weight: 800, spacing: size * 0.22, color: d.water ? "#4d6668" : MAP_INK, alpha: d.water ? 0.75 : 0.42, angle: d.vertical ? -Math.PI / 2 : 0 });
  }
  // Street names along their streets, kept upright.
  if (s >= 0.55) for (const l of map.roadLabels) {
    if (l.lane && s < 1.6) continue;
    const p = toMap(view, l.x, l.z);
    if (!onScreen(p)) continue;
    let a = Math.atan2(-l.dz, -l.dx);
    if (a > Math.PI / 2) a -= Math.PI; else if (a < -Math.PI / 2) a += Math.PI;
    tryLabel(l.text, p.x, p.y, { size: mini ? 9 : Math.round(Math.min(13, 8 + s * 2)), weight: 700, angle: a, spacing: 1, color: "#5a4a33" });
  }
  // Walk-in buildings by name once there's room.
  if (s >= (mini ? 1.4 : 1.1)) for (const v of map.venues) {
    const c = toMap(view, (v.minX + v.maxX) / 2, (v.minZ + v.maxZ) / 2), wpx = (v.maxX - v.minX) * s;
    if (!onScreen(c) || wpx < v.name.length * 4.2) continue;
    tryLabel(v.name, c.x, c.y, { size: mini ? 8 : Math.round(Math.min(12, 7 + s * 1.5)), weight: 700, color: C.venueInk });
  }
  if (mini) return;
  // Local places and shop doors, when they fit.
  for (const pl of map.places) {
    if (pl.kind === "landmark" || !visiblePlace(pl, s)) continue;
    const p = toMap(view, pl.x, pl.z);
    if (!onScreen(p)) continue;
    if (tryLabel(pl.name, p.x + 7, p.y, { size: 11, weight: 600, align: "left" })) pin(p, false);
  }
}

/** You, your marked route and the story's next stop. Off-screen targets get an arrow on the frame edge. */
export function drawMarkers(ctx, view, { player = null, destination = null, objective = null, t = 0, mini = false } = {}) {
  const edge = (p) => {
    const m = mini ? 10 : 18, cx = view.w / 2, cy = view.h / 2;
    if (p.x >= m && p.y >= m && p.x <= view.w - m && p.y <= view.h - m) return null;
    const ang = Math.atan2(p.y - cy, p.x - cx);
    const rx = cx - m, ry = cy - m, k = Math.min(Math.abs(rx / Math.cos(ang)), Math.abs(ry / Math.sin(ang)));
    const r = mini ? Math.min(rx, ry) : k;
    return { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r, ang };
  };
  const chevron = (e, color) => {
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.ang);
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-5, -6); ctx.lineTo(-2, 0); ctx.lineTo(-5, 6); ctx.closePath();
    ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#fff8e6"; ctx.stroke();
    ctx.restore();
  };
  if (objective) {
    const p = toMap(view, objective.x, objective.z), e = edge(p);
    if (e) chevron(e, C.signal);
    else {
      const pulse = (t * 1.4) % 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 5 + pulse * (mini ? 9 : 16), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(230,90,62,${(1 - pulse) * 0.9})`; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = C.signal; ctx.fillRect(-4.5, -4.5, 9, 9); ctx.strokeStyle = "#fff8e6"; ctx.lineWidth = 1.5; ctx.strokeRect(-4.5, -4.5, 9, 9);
      ctx.restore();
      if (!mini && objective.name) halo(ctx, objective.name, p.x + 10, p.y - 12, { size: 12, weight: 700, color: "#9a3420", align: "left" });
    }
  }
  if (destination && !(objective && Math.hypot(destination.x - objective.x, destination.z - objective.z) < 1)) {
    const p = toMap(view, destination.x, destination.z), e = edge(p);
    if (e) chevron(e, C.tungsten);
    else {
      ctx.save(); ctx.translate(p.x, p.y);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-7, -9, -7, -17, 0, -18); ctx.bezierCurveTo(7, -17, 7, -9, 0, 0);
      ctx.fillStyle = C.tungsten; ctx.fill(); ctx.strokeStyle = MAP_INK; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -12, 2.4, 0, Math.PI * 2); ctx.fillStyle = MAP_INK; ctx.fill();
      ctx.restore();
      if (!mini && destination.name) halo(ctx, destination.name, p.x + 9, p.y - 12, { size: 12, weight: 700, color: "#7a4a10", align: "left" });
    }
  }
  if (player) {
    const p = toMap(view, player.x, player.z);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(mapHeading(player.dx, player.dz));
    const k = mini ? 1 : 1.25;
    ctx.beginPath(); ctx.moveTo(9 * k, 0); ctx.lineTo(-6 * k, -6.5 * k); ctx.lineTo(-3 * k, 0); ctx.lineTo(-6 * k, 6.5 * k); ctx.closePath();
    ctx.fillStyle = C.you; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#fff8e6"; ctx.stroke();
    ctx.restore();
  }
}
