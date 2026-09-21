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
  CLICKS_PER_HATCH_STAGE: () => CLICKS_PER_HATCH_STAGE,
  DEFAULT_APPEARANCE: () => DEFAULT_APPEARANCE,
  ENERGY_WEIGHTS: () => ENERGY_WEIGHTS,
  GENE_FIELDS: () => GENE_FIELDS,
  HATCH_STAGE_COUNT: () => HATCH_STAGE_COUNT,
  HATCH_STAGE_THRESHOLDS: () => HATCH_STAGE_THRESHOLDS,
  INPUTS_PER_HATCH_STAGE: () => INPUTS_PER_HATCH_STAGE,
  MVP_BASE_GENES: () => MVP_BASE_GENES,
  RARITY_IDS: () => RARITY_IDS,
  RARITY_WEIGHTS: () => RARITY_WEIGHTS,
  STYLE_BY_RARITY: () => STYLE_BY_RARITY,
  computeEnergy: () => computeEnergy,
  createRng: () => createRng,
  dominantEnergy: () => dominantEnergy,
  emptyProfile: () => emptyProfile,
  hashSeed: () => hashSeed,
  hatchDay: () => hatchDay,
  hatchInputScore: () => hatchInputScore,
  hatchProgressFromClicks: () => hatchProgressFromClicks,
  hatchProgressFromClicksAndKeys: () => hatchProgressFromClicksAndKeys,
  hatchProgressFromProfile: () => hatchProgressFromProfile,
  idleMoodFromEnergy: () => idleMoodFromEnergy,
  idleMoodFromProfile: () => idleMoodFromProfile,
  localToday: () => localToday,
  longestFocusSec: () => longestFocusSec,
  markGrowing: () => markGrowing,
  phaseFromProfile: () => phaseFromProfile,
  pickWeighted: () => pickWeighted,
  pickWeightedKey: () => pickWeightedKey,
  resolveAppearance: () => resolveAppearance,
  resolveGenes: () => resolveGenes,
  resolvePersonality: () => resolvePersonality,
  resolveRarity: () => resolveRarity,
  rngFromKeys: () => rngFromKeys,
  settleDay: () => settleDay,
  shouldStartNewEgg: () => shouldStartNewEgg,
  startEgg: () => startEgg,
  styleForRarity: () => styleForRarity
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
var RARITY_IDS = ["common", "rare", "epic"];
var RARITY_WEIGHTS = {
  common: 70,
  rare: 25,
  epic: 5
};
var STYLE_BY_RARITY = {
  common: "style_common",
  rare: "style_rare",
  epic: "style_epic"
};
function resolveGenes(profile, energy, rng = rngFromKeys(profile.date, profile.seedKey, "genes")) {
  void pickWeighted(rng, [{ id: "body_base", weight: 1 }]);
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
  let wCommon = RARITY_WEIGHTS.common;
  let wRare = RARITY_WEIGHTS.rare;
  let wEpic = RARITY_WEIGHTS.epic;
  if (total > 60) {
    wCommon -= 8;
    wRare += 5;
    wEpic += 3;
  }
  if (total > 100 && imbalance > 2) {
    wCommon -= 7;
    wRare += 3;
    wEpic += 4;
  }
  wCommon = Math.max(40, wCommon);
  return pickWeighted(rng, [
    { id: "common", weight: wCommon },
    { id: "rare", weight: wRare },
    { id: "epic", weight: wEpic }
  ]);
}
function styleForRarity(rarity) {
  return STYLE_BY_RARITY[rarity];
}

// src/core/appearance.ts
var DEFAULT_APPEARANCE = {
  body: "body_classic",
  marking: "none",
  expression: "expr_normal",
  cloudMood: "cloud_normal",
  headwear: "none",
  facewear: "none",
  outfit: "none"
};
function resolveAppearance(energy, personality, rarity) {
  let body = "body_classic";
  let expression = "expr_happy";
  let cloudMood = "cloud_happy";
  if (personality === "builder") {
    body = "body_classic";
    expression = "expr_focused";
    cloudMood = "cloud_focused";
  } else if (personality === "explorer") {
    body = "body_chubby";
    expression = "expr_curious";
    cloudMood = "cloud_curious";
  } else if (personality === "dreamer") {
    body = "body_long";
    expression = "expr_sleepy";
    cloudMood = energy.dream > 35 ? "cloud_dreamy" : "cloud_sleepy";
  }
  return {
    body,
    marking: rarity === "rare" ? "marking_patchy" : "none",
    expression,
    cloudMood: rarity === "epic" ? "cloud_twin" : cloudMood,
    headwear: "none",
    facewear: "none",
    outfit: "none"
  };
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
  const style = styleForRarity(rarity);
  const appearance = resolveAppearance(energy, personality, rarity);
  const traits = buildTraits(energy, personality);
  const events = rollIdleEvents(profile, energy, eventRng);
  return {
    date: profile.date,
    kind: "loafling",
    energy,
    genes,
    personality,
    rarity,
    style,
    appearance,
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

// src/core/hatchProgress.ts
var HATCH_STAGE_THRESHOLDS = Object.freeze([
  0,
  3e3,
  8e3,
  14e3,
  21e3,
  29e3
]);
var HATCH_STAGE_COUNT = 6;
var INPUTS_PER_HATCH_STAGE = 3e3;
var CLICKS_PER_HATCH_STAGE = INPUTS_PER_HATCH_STAGE;
var STAGE_PHASE = [
  "egg",
  "cracking",
  "hatching",
  "newborn",
  "growing",
  "adult"
];
function hatchInputScore(clicks, keystrokes) {
  return Math.max(0, Math.floor(clicks || 0)) + Math.max(0, Math.floor(keystrokes || 0));
}
function stageFromInputs(inputs) {
  const c = Math.max(0, Math.floor(inputs || 0));
  let stage = 0;
  for (let i = HATCH_STAGE_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (c >= HATCH_STAGE_THRESHOLDS[i]) {
      stage = i;
      break;
    }
  }
  return stage;
}
function progressFromInputs(inputs, clicks, keystrokes) {
  const c = Math.max(0, Math.floor(inputs || 0));
  const stage = stageFromInputs(c);
  const maxStage = HATCH_STAGE_COUNT - 1;
  const floor = HATCH_STAGE_THRESHOLDS[stage];
  const nextStageAt = stage >= maxStage ? null : HATCH_STAGE_THRESHOLDS[stage + 1];
  const band = nextStageAt == null ? Math.max(1, c - floor || 1) : nextStageAt - floor;
  const stageProgress = stage >= maxStage ? 1 : Math.min(1, Math.max(0, (c - floor) / band));
  return {
    stage,
    phase: STAGE_PHASE[stage],
    inputs: c,
    clicks: Math.max(0, Math.floor(clicks || 0)),
    keystrokes: Math.max(0, Math.floor(keystrokes || 0)),
    nextStageAt,
    inputsPerStage: band,
    clicksPerStage: band,
    stageCount: HATCH_STAGE_COUNT,
    stageProgress
  };
}
function hatchProgressFromClicks(clicks) {
  return progressFromInputs(clicks, clicks, 0);
}
function hatchProgressFromClicksAndKeys(clicks, keystrokes) {
  return progressFromInputs(
    hatchInputScore(clicks, keystrokes),
    clicks,
    keystrokes
  );
}
function hatchProgressFromProfile(profile, alreadySaved) {
  const progress = hatchProgressFromClicksAndKeys(
    profile.clicks,
    profile.keystrokes
  );
  if (!alreadySaved) return progress;
  return {
    ...progress,
    stage: 5,
    phase: "adult",
    nextStageAt: null,
    stageProgress: 1
  };
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
  const progress = hatchProgressFromProfile(profile, false);
  if (progress.stage >= 5) return "hatched";
  if (progress.stage >= 1) return "growing";
  const active = profile.keystrokes + profile.clicks + profile.mouseTravel + profile.activeSec > 0;
  return active ? "growing" : "egg";
}
function hatchDay(profile) {
  const result = settleDay(profile);
  return { date: profile.date, phase: "hatched", result };
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

// src/core/idleMood.ts
var EXPR_BASE = {
  normal: 3,
  happy: 2,
  sleepy: 1,
  surprised: 1,
  content: 2
};
var POSE_BASE = {
  sit: 3,
  stretch: 2,
  lie: 2
};
function idleMoodFromEnergy(pool) {
  const dominant = dominantEnergy(pool);
  const expr = { ...EXPR_BASE };
  const pose = { ...POSE_BASE };
  let intervalMs = 12e3;
  if (dominant === "dream") {
    expr.sleepy += 4;
    expr.content += 2;
    expr.happy = Math.max(1, expr.happy - 1);
    pose.lie += 3;
    pose.sit += 1;
    intervalMs = 16e3;
  } else if (dominant === "work") {
    expr.surprised += 2;
    expr.normal += 1;
    pose.stretch += 3;
    pose.lie = Math.max(1, pose.lie - 1);
    intervalMs = 1e4;
  } else {
    expr.happy += 3;
    expr.content += 1;
    pose.sit += 2;
    pose.stretch += 1;
    intervalMs = 12e3;
  }
  return { allowIdle: true, intervalMs, expr, pose, dominant };
}
function idleMoodFromProfile(profile) {
  return idleMoodFromEnergy(computeEnergy(profile));
}
function pickWeightedKey(weights, rng = Math.random) {
  const keys = Object.keys(weights);
  let total = 0;
  for (const k of keys) total += Math.max(0, weights[k]);
  if (total <= 0) return keys[0];
  let roll = rng() * total;
  for (const k of keys) {
    roll -= Math.max(0, weights[k]);
    if (roll <= 0) return k;
  }
  return keys[keys.length - 1];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CLICKS_PER_HATCH_STAGE,
  DEFAULT_APPEARANCE,
  ENERGY_WEIGHTS,
  GENE_FIELDS,
  HATCH_STAGE_COUNT,
  HATCH_STAGE_THRESHOLDS,
  INPUTS_PER_HATCH_STAGE,
  MVP_BASE_GENES,
  RARITY_IDS,
  RARITY_WEIGHTS,
  STYLE_BY_RARITY,
  computeEnergy,
  createRng,
  dominantEnergy,
  emptyProfile,
  hashSeed,
  hatchDay,
  hatchInputScore,
  hatchProgressFromClicks,
  hatchProgressFromClicksAndKeys,
  hatchProgressFromProfile,
  idleMoodFromEnergy,
  idleMoodFromProfile,
  localToday,
  longestFocusSec,
  markGrowing,
  phaseFromProfile,
  pickWeighted,
  pickWeightedKey,
  resolveAppearance,
  resolveGenes,
  resolvePersonality,
  resolveRarity,
  rngFromKeys,
  settleDay,
  shouldStartNewEgg,
  startEgg,
  styleForRarity
});
