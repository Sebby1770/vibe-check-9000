/* The Night Ledger: sixteen things to do in the city, from your first fare to seeing the dawn. Each is ticked
   once and pays $10 the first time; the pause screen lists them all. Pure: games.js keeps the ticks with the save,
   main.js notices when you've done one. */

export const GOAL_PAY = 10;

export const GOALS = [
  { id: "first-fare", name: "Hail Mary", hint: "Drop off a taxi fare (T in a Checker)." },
  { id: "night-shift", name: "Night Shift", hint: "Ten taxi fares, all told." },
  { id: "podium", name: "On the Podium", hint: "Win a medal on a Midnight Run." },
  { id: "gold-standard", name: "Gold Standard", hint: "Gold on all three Midnight Runs." },
  { id: "floor-fever", name: "Floor Fever", hint: "Finish a round on the dance floor (G)." },
  { id: "sensational", name: "S for Sensational", hint: "Grade S at Floor Fever." },
  { id: "crate-digger", name: "Crate Digger", hint: "Find one of the Lost 45s." },
  { id: "whole-set", name: "The Whole Set", hint: "Find all ten Lost 45s." },
  { id: "shake-a-tail", name: "Shake a Tail", hint: "Lose Muldoon in a chase." },
  { id: "red-handed", name: "Red-Handed", hint: "Get pulled over." },
  { id: "storm-chaser", name: "Storm Chaser", hint: "Drive half a minute through a downpour." },
  { id: "dial-twister", name: "Dial Twister", hint: "Try every station on a car radio (R)." },
  { id: "burn-rubber", name: "Burn Rubber", hint: "Slide for five seconds, all told." },
  { id: "night-owl", name: "Night Owl", hint: "Stay out until dawn." },
  { id: "high-roller", name: "High Roller", hint: "Have $500 in your wallet." },
  { id: "underground", name: "Underground", hint: "Ride the subway or the El." },
];

const KNOWN = new Set(GOALS.map((g) => g.id));
export const goalById = (id) => GOALS.find((g) => g.id === id) || null;

export function normalizeLedger(list) {
  return Array.isArray(list) ? GOALS.map((g) => g.id).filter((id) => list.includes(id)) : [];
}

/** Ticks a goal. Returns {ledger, fresh, reward, goal, complete} (fresh false if it was already ticked). */
export function tick(ledger, id) {
  const done = normalizeLedger(ledger);
  if (!KNOWN.has(id) || done.includes(id)) return { ledger: done, fresh: false, reward: 0, goal: goalById(id), complete: done.length === GOALS.length };
  const next = normalizeLedger([...done, id]);
  return { ledger: next, fresh: true, reward: GOAL_PAY, goal: goalById(id), complete: next.length === GOALS.length };
}
