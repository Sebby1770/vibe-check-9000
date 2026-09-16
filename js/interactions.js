/* One aim/reach/occlusion decision shared by the prompt and action. No renderer needed. */
export function blockedSegment(start, end, boxes = []) {
  for (const b of boxes) {
    // A seat or counter may contain its own target. Walls must never get this exemption.
    if (
      (b.maxY ?? 99) - Math.max(0, b.minY ?? 0) < 2 &&
      end.x >= b.minX &&
      end.x <= b.maxX &&
      end.z >= b.minZ &&
      end.z <= b.maxZ
    )
      continue;
    let near = 0,
      far = 1;
    for (const axis of ["x", "y", "z"]) {
      const low = b[`min${axis.toUpperCase()}`] ?? -99,
        high =
          (axis === "y" ? b.sightMaxY : undefined) ??
          b[`max${axis.toUpperCase()}`] ??
          99;
      const delta = end[axis] - start[axis];
      if (Math.abs(delta) < 1e-7) {
        if (start[axis] < low || start[axis] > high) {
          near = 2;
          break;
        }
      } else {
        const a = (low - start[axis]) / delta,
          c = (high - start[axis]) / delta;
        near = Math.max(near, Math.min(a, c));
        far = Math.min(far, Math.max(a, c));
      }
    }
    if (near < far && far > 0.035 && near < 0.94) return true;
  }
  return false;
}
export function selectInteraction({
  position,
  forward,
  floorY = 0,
  candidates = [],
  boxes = [],
  touch = false,
}) {
  let best = null,
    bestScore = -Infinity;
  for (const target of candidates) {
    if (Math.abs((target.y || 0) - floorY) > 1.8) continue;
    const point = {
      x: target.x,
      y: (target.y || 0) + (target.aimY ?? 1.15),
      z: target.z,
    };
    const dx = point.x - position.x,
      dy = point.y - position.y,
      dz = point.z - position.z;
    const flat = Math.hypot(dx, dz),
      dist = Math.hypot(dx, dy, dz);
    if (flat > (target.reach ?? 2.5) || dist < 0.01) continue;
    const dot = (dx * forward.x + dy * forward.y + dz * forward.z) / dist;
    if (dot < (touch ? 0.25 : 0.42) || blockedSegment(position, point, boxes))
      continue;
    const score = dot - flat * 0.055;
    if (score > bestScore) {
      bestScore = score;
      best = target;
    }
  }
  return best;
}
