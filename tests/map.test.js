import assert from "node:assert/strict";
import { cityMap, toMap, fromMap, mapHeading, clampView, pickAt, bearingText, visiblePlace, MAP_BOUNDS } from "../js/map/map-data.js";
import { SUBWAY_STATIONS, boardingPoint, stationColliders } from "../js/openworld/stations.js";
import { OW_ROADS, OPEN_PLACES } from "../js/openworld/layout.js";
import { buildColliders, getFloorY } from "../js/zones.js";

const map = cityMap();
assert.ok(map.roads.length >= 25, "streets of the open city and the old block");
assert.ok(map.blocks.length >= 200, `building footprints (${map.blocks.length})`);
assert.equal(map.stations.length, 5);
for (const p of OPEN_PLACES) assert.ok(map.places.some((q) => q.id === p.id), `${p.name} is on the map`);
assert.ok(map.roadLabels.some((l) => l.text === "BROADWAY") && map.roadLabels.some((l) => l.text === "47TH STREET"));

// Orientation: uptown (+z) is up and the view is not mirrored, so +x runs left.
const v = { cx: 10, cz: -20, s: 2, w: 400, h: 300 };
const a = toMap(v, 10, -20), east = toMap(v, 0, -20), north = toMap(v, 10, -10);
assert.deepEqual(a, { x: 200, y: 150 });
assert.ok(east.x > a.x && north.y < a.y, "lower x is to the right, higher z is up");
for (const [x, z] of [[0, 0], [-245, 52], [347, -7.5]]) { const p = toMap(v, x, z), w = fromMap(v, p.x, p.y); assert.ok(Math.abs(w.x - x) < 1e-9 && Math.abs(w.z - z) < 1e-9); }
assert.ok(Math.abs(mapHeading(0, 1) + Math.PI / 2) < 1e-9, "facing uptown points straight up the screen");
// Not mirrored: turning right in the world (forward × up) turns clockwise on the map.
const fwd = mapHeading(0, 1), right = mapHeading(-1, 0);
assert.ok(Math.abs(right - fwd - Math.PI / 2) < 1e-9, "a right turn is a clockwise quarter turn on the map");

// Views stay over the city.
const far = clampView({ cx: 5000, cz: -5000, s: 1, w: 800, h: 600 });
assert.ok(far.cx <= MAP_BOUNDS.maxX + 40 && far.cz >= MAP_BOUNDS.minZ - 40);

// Picking: a station under the cursor wins; empty paper picks nothing.
const times = SUBWAY_STATIONS.find((s) => s.id === "times"), tv = { cx: times.x, cz: times.z, s: 1.5, w: 600, h: 400 };
assert.deepEqual(pickAt(tv, 302, 199)?.item.id, "times");
assert.equal(pickAt({ ...tv, cx: 500, cz: 380 }, 300, 200), null);
assert.ok(visiblePlace({ kind: "landmark" }, 0.3) && !visiblePlace({ kind: "shop" }, 1) && visiblePlace({ kind: "shop" }, 3));
assert.equal(bearingText({ x: 0, z: 0 }, { x: 0, z: 100 }), "100 m uptown");
assert.equal(bearingText({ x: 0, z: 0 }, { x: 3, z: 2 }), "you're here");

// Stations: every arrival and boarding spot is open floor, kiosks stand on the pavement, and they are solid.
const { boxes } = buildColliders([]);
const solidAt = (x, z, y, r) => boxes.some((b) => b.minY < y + 1.7 && b.maxY > y + 0.3 && x + r > b.minX && x - r < b.maxX && z + r > b.minZ && z - r < b.maxZ);
const seg = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(px - ax - t * dx, pz - az - t * dz); };
for (const s of SUBWAY_STATIONS) {
  const { x, z, y = 0 } = s.arrive;
  assert.ok(x > MAP_BOUNDS.minX && x < MAP_BOUNDS.maxX && z > MAP_BOUNDS.minZ && z < MAP_BOUNDS.maxZ, `${s.id} arrival is in the city`);
  assert.equal(solidAt(x, z, y, 0.35), false, `${s.id} arrival is clear`);
  assert.ok(Math.abs(getFloorY(x, z, y) - y) < 0.05, `${s.id} arrival stands on its floor`);
  const b = boardingPoint(s);
  assert.equal(solidAt(b.x, b.z, b.y || 0, 0.2), false, `${s.id} boarding spot is reachable`);
  if (s.kiosk) {
    const hw = s.kiosk.len / 2, hd = s.kiosk.wid / 2;
    for (const [cx, cz] of [[s.x - hw, s.z - hd], [s.x + hw, s.z - hd], [s.x - hw, s.z + hd], [s.x + hw, s.z + hd]])
      assert.ok(OW_ROADS.every((r) => seg(cx, cz, r.a, r.b) > r.width / 2), `${s.id} kiosk stays off the road`);
    assert.ok(boxes.some((c) => c.minX === s.x - hw && c.maxZ === s.z + hd && c.maxY === 2), `${s.id} kiosk is solid`);
    assert.ok(Math.abs(b.x - s.x) > hw, `${s.id} boards from outside the stair head`);
  }
}
assert.equal(stationColliders().length, SUBWAY_STATIONS.filter((s) => s.kiosk).length);

console.log(`map: ${map.roads.length} streets, ${map.blocks.length} blocks, ${map.places.length} places, ${SUBWAY_STATIONS.length} stops; orientation, picking and every arrival are clear`);
