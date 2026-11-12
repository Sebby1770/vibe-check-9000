/* The Lost 45s: ten records from labels that never made it, left about the city. Each sits on a crate, turning
   slowly in a faint glow, and plays a few notes of itself when you're near. Walk (or drive) over one to pick it
   up; Rex pays for every one and a bonus for the set. Pure: lost45s-world.js draws them, main.js pays. */

export const RECORDS = [
  { id: "lenox", title: "Rain on Lenox", artist: "The Bel-Aires", x: -241.3, z: 41.9, where: "Times Square" },
  { id: "rivoli", title: "Midnight at the Rivoli", artist: "Dottie & the Dimes", x: 5, z: -21.5, where: "the alley behind the club" },
  { id: "checker", title: "Checker Cab Shuffle", artist: "Lou Mercer Trio", x: 69, z: 2, where: "Mercer Garden" },
  { id: "halo", title: "Neon Halo", artist: "The Visors", x: 132, z: 2, where: "Hawthorne Park" },
  { id: "twelve", title: "Twelve-Oh-Four", artist: "Velma Starr", x: 60, z: 212, where: "Belmont Park" },
  { id: "pier", title: "Pier 47 Blues", artist: "The Harbor Kings", x: 332, z: 28.6, where: "Pier 47 Road" },
  { id: "el", title: "Under the El", artist: "The Third Avenue Five", x: 69, z: -206, where: "under the El" },
  { id: "garment", title: "Garment District Stomp", artist: "Needle & Thread", x: 68.5, z: -140, where: "the Garment District" },
  { id: "riverside", title: "Riverside Drive-In", artist: "The Hi-Fis", x: 195.1, z: 155.8, where: "Riverside Avenue" },
  { id: "eighth", title: "Eighth Avenue Express", artist: "The Local Stops", x: -387.1, z: 156.5, where: "Eighth and 50th" },
];

export const recordById = (id) => RECORDS.find((r) => r.id === id) || null;

/** The record you're close enough to pick up, if any (a little further in a car). */
export function pickUp(found, pos, { driving = false } = {}) {
  const reach = driving ? 3.2 : 1.7;
  for (const r of RECORDS) if (!found.includes(r.id) && Math.hypot(pos.x - r.x, pos.z - r.z) < reach) return r;
  return null;
}

/** The nearest record you haven't found within earshot (for its few notes), or null. */
export function within(found, pos, range = 28) {
  let best = null, bd = range;
  for (const r of RECORDS) {
    if (found.includes(r.id)) continue;
    const d = Math.hypot(pos.x - r.x, pos.z - r.z);
    if (d < bd) { best = r; bd = d; }
  }
  return best;
}

/** Where the map says to look for a record you haven't found: a circle that holds it, off-centre so the middle
    isn't the answer. The same every time for each record. */
export function searchZone(record) {
  let h = 2166136261;
  for (const ch of record.id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const a = (h % 360) * (Math.PI / 180), d = 8 + ((h >>> 9) % 15);
  return { x: record.x + Math.cos(a) * d, z: record.z + Math.sin(a) * d, r: 36 };
}
