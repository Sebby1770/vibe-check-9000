/* Walk-in interiors: one module per room, each exporting build(ctx) and colliders().
   build(ctx) gets { root, scene, mats, shop, lamp, place, crowds } and may return { update(dt, t, env), ...handles };
   env = { zone, reduced, outside, position, camera }. colliders() returns {minX,maxX,minZ,maxZ,minY,maxY} boxes.
   mats = city.js { wood, cream, black, chrome, brick, brickDark, neonRed, neonAmber, neonCyan, glass } (shared: don't mutate).
   shop = the SHOPS entry, or { id, minX, maxX, minZ, maxZ, doorX, floorY } for the diner / hotel rooms.
   place(human, x, z, yaw, mode, { sitHips }) + crowds.push(...) adds an NPC (animated only near its room).
   zones.js stays three-free for the node tests, so world.js feeds interiorColliders() into buildColliders(). */
import * as THREE from "three";
import { SHOPS, DINER, HOTEL, SECOND_Y } from "../zones.js";
import * as records from "./records.js";
import * as pharmacy from "./pharmacy.js";
import * as florist from "./florist.js";
import * as rivoli from "./rivoli.js";
import * as liquor from "./liquor.js";
import * as barber from "./barber.js";
import * as diner from "./diner.js";
import * as hotelLobby from "./hotel-lobby.js";
import * as hotelUpstairs from "./hotel-upstairs.js";

const shopRect = (id) => SHOPS.find((s) => s.id === id);

// Order matters: shop NPCs keep their crowd index (animation phase, closing-time thinning).
export const ROOMS = [
  { id: "records", zone: "records", mod: records, rect: shopRect("records") },
  { id: "pharmacy", zone: "pharmacy", mod: pharmacy, rect: shopRect("pharmacy") },
  { id: "florist", zone: "florist", mod: florist, rect: shopRect("florist") },
  { id: "rivoli", zone: "rivoli", mod: rivoli, rect: shopRect("rivoli") },
  { id: "liquor", zone: "liquor", mod: liquor, rect: shopRect("liquor") },
  { id: "barber", zone: "barber", mod: barber, rect: shopRect("barber") },
  { id: "diner", zone: "diner", mod: diner, rect: { id: "diner", ...DINER, doorX: -27.0, floorY: 0 } },
  { id: "hotel-lobby", zone: "hotel", mod: hotelLobby, rect: { id: "hotel-lobby", ...HOTEL, doorX: 25.0, floorY: 0 } },
  { id: "hotel-upstairs", zone: "suite", mod: hotelUpstairs, rect: { id: "hotel-upstairs", ...HOTEL, floorY: SECOND_Y } },
];

function place(h, x, z, yaw, mode, extra = {}) {
  h.position.set(x, 0, z);
  h.rotation.y = yaw;
  h.userData.mode = mode;
  if (extra.sitHips != null) h.userData.sitHips = extra.sitHips;
  if (extra.danceStyle != null) h.userData.danceStyle = extra.danceStyle;
  return h;
}

let live = [];

// Builds every room; returns { rooms: {id: build result}, crowds, lights }.
export function buildInteriors({ root, scene, mats }) {
  const crowds = [];
  const lights = [];
  // Tracked lamp: city.js updateCity culls it beyond 24 m and dims it in the Rivoli. Budget: no new lights.
  function lamp(x, z, color, intens = 22) {
    const l = new THREE.PointLight(color, intens, 11, 2);
    l.position.set(x, 2.6, z);
    scene.add(l);
    lights.push(l);
    return l;
  }
  const rooms = {};
  live = [];
  for (const room of ROOMS) {
    const start = crowds.length;
    const res = room.mod.build({ root, scene, mats, shop: room.rect, lamp, place, crowds }) || {};
    for (let i = start; i < crowds.length; i++) crowds[i].userData.room = room.zone;
    rooms[room.id] = res;
    if (res.update) live.push(res);
  }
  crowds.forEach((h, i) => {
    h.userData.home = { x: h.position.x, z: h.position.z, yaw: h.rotation.y };
    h.userData.shopIndex = i;
    scene.add(h);
  });
  return { rooms, crowds, lights };
}

export function interiorColliders() {
  return ROOMS.flatMap((room) => room.mod.colliders?.() || []);
}

export function updateInteriors(dt, t, env = {}) {
  for (const room of live) room.update(dt, t, env);
}
