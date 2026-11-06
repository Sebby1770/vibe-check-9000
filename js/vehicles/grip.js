/* Tyre grip: how hard the road holds the car. Pure: drive.js steers with it, skids.js marks the slide and audio.js
   hears it. A wet street holds about 40% less, so the same corner taken at the same speed runs wide in the rain. */

/** Cornering the tyres hold, in m/s² of sideways acceleration. */
export function gripLimit(wet = 0) {
  return 9 - 3.6 * Math.max(0, Math.min(1, wet));
}

/** How much braking the tyres hold (1 dry; a wet street gives about a third of it up). */
export function brakeGrip(wet = 0) {
  return 1 - 0.35 * Math.max(0, Math.min(1, wet));
}

/** speed in m/s, yawRate in rad/s as the steering asks for. Returns {skid 0–1, yawScale}: past the limit the
    car turns only as tightly as the tyres allow (yawScale < 1) and the tyres start to slide. */
export function slide({ speed = 0, yawRate = 0, handbrake = false, braking = false, wet = 0 } = {}) {
  const v = Math.abs(speed), lateral = Math.abs(speed * yawRate), grip = gripLimit(wet);
  const yawScale = lateral > grip ? grip / lateral : 1;
  let skid = Math.max(0, Math.min(1, (lateral - grip * 0.8) / (grip * 0.45)));
  if (handbrake && v > 4) skid = Math.max(skid, Math.min(1, v / 14));
  if (braking && v > 9) skid = Math.max(skid, Math.min(0.7, ((v - 9) / 10) * (1 + wet)));
  return { skid, yawScale };
}
