/* Subway and El stops for fast travel. Pure data, shared by the map, the kiosk models, the colliders and the
   tests. A kiosk is a railed stair head on the pavement (len along x, wid along z; `open` is the end the stairs
   face, -1 = west, +1 = east). 47th Street uses the original stairs and boards from the platform's route map;
   the El stop boards from the foot of its stair tower. `arrive` is where you step out, clear of everything. */
export const SUBWAY_STATIONS = [
  {
    id: "47th", name: "47 St – Rivoli", line: "IRT", x: -22.4, z: 26.2,
    board: { x: -16.7, z: 27.6, y: -5.2 },
    arrive: { x: -16.7, z: 28.6, y: -5.2, lookX: -22.4, lookZ: 28.6 },
  },
  {
    id: "times", name: "Times Sq – 42 St", line: "IRT · BMT", x: -239.5, z: 33,
    kiosk: { len: 3.6, wid: 2.6, open: -1 },
    arrive: { x: -242.9, z: 33, y: 0, lookX: -245, lookZ: 52 },
  },
  {
    id: "plaza", name: "59 St – Belmont Plaza", line: "IRT", x: 24, z: 157,
    kiosk: { len: 3.6, wid: 2.6, open: 1 },
    arrive: { x: 27.4, z: 157, y: 0, lookX: 65, lookZ: 175 },
  },
  {
    id: "pier", name: "12 Av – Pier 47", line: "IRT", x: 282, z: 29.5,
    kiosk: { len: 3.6, wid: 2.6, open: 1 },
    arrive: { x: 285.4, z: 29.5, y: 0, lookX: 296, lookZ: 22.8 },
  },
  {
    id: "garment", name: "3 Av El – 44½ St", line: "3RD AV EL", x: 51, z: -138.6, el: true,
    arrive: { x: 51, z: -136.4, y: 0, lookX: 60, lookZ: -128 },
  },
];

/** Where you press E to ride from a stop: the kiosk's open end, the platform route map, or the El stair foot. */
export function boardingPoint(s) {
  if (s.board) return s.board;
  if (s.kiosk) return { x: s.x + s.kiosk.open * (s.kiosk.len / 2 + 0.5), z: s.z, y: 0 };
  return { x: s.x, z: s.z, y: 0 };
}

/** Solid footprints for the new kiosks (the railings are low, so the whole stair head blocks you). */
export function stationColliders() {
  return SUBWAY_STATIONS.filter((s) => s.kiosk).map((s) => ({
    minX: s.x - s.kiosk.len / 2, maxX: s.x + s.kiosk.len / 2, minZ: s.z - s.kiosk.wid / 2, maxZ: s.z + s.kiosk.wid / 2,
    minY: -1, maxY: 2, sightMaxY: 1.1,
  }));
}
