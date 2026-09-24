/* Device profile for the night. Pure numbers — no renderer. */

export function detectQuality() {
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 8;
  const width = typeof window !== "undefined" ? window.innerWidth : 1280;
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const mobile = coarse || width < 900;
  const low = mobile || cores <= 4 || mem <= 4;
  return {
    low,
    pixelRatio: Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, low ? 1.15 : 1.45),
    rain: low ? 220 : 420,
    peds: low ? 10 : 16,
    bloom: true,
    bloomScale: low ? 0.4 : 0.55,
    antialias: false,
    samples: low ? 0 : 4,
  };
}
