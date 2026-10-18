/* Device profile for the night. Pure numbers — no renderer. Pick a tier automatically, or force one with
   ?quality=low|medium|high|ultra or the Graphics setting (saved as vc9k-quality). */

export const QUALITY_KEY = "vc9k-quality";
export const TIERS = ["low", "medium", "high", "ultra"];

const PROFILES = {
  low:    { shadows: false, shadowMapSize: 1024, gtao: false, samples: 0, smaa: true, prCap: 1.0, bloomScale: 0.4, rain: 200, peds: 10, envSize: 64, grain: false, drawDistance: 200, crowdScale: 0.4 },
  medium: { shadows: true, shadowMapSize: 1024, gtao: false, samples: 0, smaa: true, prCap: 1.25, bloomScale: 0.5, rain: 320, peds: 14, envSize: 96, grain: true, drawDistance: 280, crowdScale: 0.7 },
  high:   { shadows: true, shadowMapSize: 2048, gtao: false, samples: 4, smaa: false, prCap: 1.5, bloomScale: 0.55, rain: 420, peds: 16, envSize: 128, grain: true, drawDistance: 360, crowdScale: 1 },
  ultra:  { shadows: true, shadowMapSize: 4096, gtao: true, samples: 4, smaa: false, prCap: 2, bloomScale: 0.6, rain: 520, peds: 20, envSize: 256, grain: true, drawDistance: 420, crowdScale: 1.25 },
};

export function chooseTier({ cores = 4, mem = 8, width = 1280, coarse = false } = {}) {
  if (coarse || width < 900 || cores <= 2 || mem <= 2) return "low";
  if (cores <= 4 || mem <= 4) return "medium";
  if (cores >= 10 && mem >= 8) return "high";
  return "high";
}

function savedTier() {
  try {
    const url = typeof location !== "undefined" ? new URLSearchParams(location.search).get("quality") : null;
    if (TIERS.includes(url)) return url;
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(QUALITY_KEY) : null;
    return TIERS.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function detectQuality() {
  const hasWindow = typeof window !== "undefined";
  const cores = (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || 4;
  const mem = (typeof navigator !== "undefined" && navigator.deviceMemory) || 8;
  const width = hasWindow ? window.innerWidth : 1280;
  const coarse = hasWindow && window.matchMedia("(pointer: coarse)").matches;
  const forced = savedTier();
  const tier = forced || chooseTier({ cores, mem, width, coarse });
  const p = PROFILES[tier];
  const dpr = hasWindow ? window.devicePixelRatio || 1 : 1;
  return {
    tier,
    auto: !forced,
    low: tier === "low",
    pixelRatio: Math.min(dpr, p.prCap),
    bloom: true,
    antialias: false,
    ...p,
  };
}

export function saveTier(tier) {
  try {
    if (tier === "auto" || !TIERS.includes(tier)) localStorage.removeItem(QUALITY_KEY);
    else localStorage.setItem(QUALITY_KEY, tier);
  } catch { /* private mode: the choice lasts until reload */ }
}
