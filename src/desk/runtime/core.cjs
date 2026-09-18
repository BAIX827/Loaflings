var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/core/index.ts
var index_exports = {};
__export(index_exports, {
  ENERGY_WEIGHTS: () => ENERGY_WEIGHTS,
  GENE_FIELDS: () => GENE_FIELDS,
  MVP_BASE_GENES: () => MVP_BASE_GENES,
  computeEnergy: () => computeEnergy,
  createRng: () => createRng,
  dominantEnergy: () => dominantEnergy,
  emptyProfile: () => emptyProfile,
  hashSeed: () => hashSeed,
  hatchDay: () => hatchDay,
  localToday: () => localToday,
  longestFocusSec: () => longestFocusSec,
  markGrowing: () => markGrowing,
  phaseFromProfile: () => phaseFromProfile,
  pickWeighted: () => pickWeighted,
  resolveGenes: () => resolveGenes,
  resolvePersonality: () => resolvePersonality,
  resolveRarity: () => resolveRarity,
  rngFromKeys: () => rngFromKeys,
  settleDay: () => settleDay,
  shouldStartNewEgg: () => shouldStartNewEgg,
  startEgg: () => startEgg
});
module.exports = __toCommonJS(index_exports);

// src/core/profile.ts
function longestFocusSec(profile) {
  if (!profile.focusSessions.length) return 0;
  return Math.max(...profile.focusSessions.map((s) => s.durationSec));
}
function emptyProfile(date, seedKey = "local") {
  return {
    date,
    seedKey,
    keystrokes: 0,
    clicks: 0,
    mouseTravel: 0,
    idleSec: 0,
    activeSec: 0,
    focusSessions: [],
    windowSwitches: 0,
    activeHours: Array.from({ length: 24 }, () => 0)
  };
}

// src/core/energy.ts
var ENERGY_WEIGHTS = {
  work: { keystroke: 0.01, click: 0.05, focusSec: 0.02 },
  explore: { mouseTravel: 0.5, windowSwitch: 0.3 },
  dream: { idleSec: 0.015 }
};
function computeEnergy(profile) {
  const w = ENERGY_WEIGHTS;
  const work = profile.keystrokes * w.work.keystroke + profile.clicks * w.work.click + longestFocusSec(profile) * w.work.focusSec;
  const explore = profile.mouseTravel * w.explore.mouseTravel + profile.windowSwitches * w.explore.windowSwitch;
  const dream = profile.idleSec * w.dream.idleSec;
  return {
    work: round2(work),
    explore: round2(explore),
    dream: round2(dream)
  };
}
function round2(n) {
  return Math.round(n * 100) / 100;
}
function dominantEnergy(pool) {
  if (pool.explore >= pool.work && pool.explore >= pool.dream) return "explore";
  if (pool.dream >= pool.work && pool.dream >= pool.explore) return "dream";
  return "work";
}

// src/core/rng.ts
function hashSeed(input) {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return h >>> 0 || 1;
}
function createRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 1831565813;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}
function rngFromKeys(date, seedKey, salt) {
  return createRng(hashSeed(`${date}|${seedKey}|${salt}`));
}
function pickWeighted(rng, options) {
  const total = options.reduce((s, o) => s + Math.max(0, o.weight), 0);
  if (total <= 0) return options[0].id;
  let roll = rng() * total;
  for (const o of options) {
    roll -= Math.max(0, o.weight);
    if (roll <= 0) return o.id;
  }
  return options[options.length - 1].id;
}

// src/core/genes.ts
var GENE_FIELDS = ["body", "cloud", "face", "tail"];
var MVP_BASE_GENES = {
  body: "body_base",
  cloud: "cloud_base",
  face: "face_base",
  tail: "tail_base"
};
function resolveGenes(profile, energy, rng = rngFromKeys(profile.date, profile.seedKey, "genes")) {
  void pickWeighted(rng, [
    { id: "body_base", weight: 1 }
  ]);
  void energy;
  void longestFocusSec;
  return { ...MVP_BASE_GENES };
}
function resolvePersonality(energy) {
  const d = dominantEnergy(energy);
  if (d === "work") return "builder";
  if (d === "explore") return "explorer";
  if (d === "dream") return "dreamer";
  return "balanced";
}
function resolveRarity(energy, rng) {
  const total = energy.work + energy.explore + energy.dream;
  const imbalance = Math.max(energy.work, energy.explore, energy.dream) / Math.max(1, total / 3);
  let roll = rng();
  if (total > 80 && imbalance > 2.2 && roll > 0.85) return "rare";
  if (total > 40 && roll > 0.6) return "uncommon";
  return "common";
}

// src/core/settle.ts
function settleDay(profile) {
  const energy = computeEnergy(profile);
  const geneRng = rngFromKeys(profile.date, profile.seedKey, "genes");
  const rarityRng = rngFromKeys(profile.date, profile.seedKey, "rarity");
  const eventRng = rngFromKeys(profile.date, profile.seedKey, "idle");
  const genes = resolveGenes(profile, energy, geneRng);
  const personality = resolvePersonality(energy);
  const rarity = resolveRarity(energy, rarityRng);
  const traits = buildTraits(energy, personality);
  const events = rollIdleEvents(profile, energy, eventRng);
  return {
    date: profile.date,
    kind: "loafling",
    energy,
    genes,
    personality,
    rarity,
    traits,
    events
  };
}
function buildTraits(energy, personality) {
  const traits = [personality];
  if (energy.dream >= energy.work && energy.dream >= energy.explore) {
    traits.push("soft_idle");
  }
  if (energy.work > 30) traits.push("focused");
  if (energy.explore > 30) traits.push("window_hopper");
  return [...new Set(traits)];
}
function rollIdleEvents(profile, energy, rng) {
  if (profile.idleSec < 600) {
    return [{ kind: "none", note: "Stayed nearby." }];
  }
  const roll = rng();
  if (energy.dream >= energy.work && roll < 0.45) {
    return [{ kind: "slept", note: "Napped while you were away." }];
  }
  if (roll < 0.7) {
    return [{ kind: "explored", note: "Wandered off and came back." }];
  }
  if (roll < 0.9) {
    return [{ kind: "fished", note: "Went fishing. Catch unclear." }];
  }
  return [{ kind: "brought_item", note: "Brought back a mysterious crumb." }];
}

// src/core/dayCycle.ts
function startEgg(date, seedKey) {
  return { date, seedKey, phase: "egg" };
}
function markGrowing(egg) {
  if (egg.phase === "growing") return egg;
  return { ...egg, phase: "growing" };
}
function phaseFromProfile(profile, alreadyHatched) {
  if (alreadyHatched) return "hatched";
  const active = profile.keystrokes + profile.clicks + profile.mouseTravel + profile.activeSec > 0;
  return active ? "growing" : "egg";
}
function hatchDay(profile) {
  const result = settleDay(profile);
  return {
    date: profile.date,
    phase: "hatched",
    result
  };
}
function shouldStartNewEgg(lastDate, today) {
  if (!lastDate) return true;
  return lastDate !== today;
}
function localToday(now = /* @__PURE__ */ new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ENERGY_WEIGHTS,
  GENE_FIELDS,
  MVP_BASE_GENES,
  computeEnergy,
  createRng,
  dominantEnergy,
  emptyProfile,
  hashSeed,
  hatchDay,
  localToday,
  longestFocusSec,
  markGrowing,
  phaseFromProfile,
  pickWeighted,
  resolveGenes,
  resolvePersonality,
  resolveRarity,
  rngFromKeys,
  settleDay,
  shouldStartNewEgg,
  startEgg
});
