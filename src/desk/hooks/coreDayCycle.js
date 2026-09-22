/**
 * DESK bridge to DAY-CORE dayCycle APIs.
 * Loads precompiled CJS from src/desk/runtime (no tsx at runtime).
 * @see docs/DAY_CYCLE_MVP.md
 */
let hatchDayFn = null;
let phaseFromProfileFn = null;
let shouldStartNewEggFn = null;
let localTodayFn = null;
let settleDayFn = null;
let apiSource = 'none';

function loadCore() {
  try {
    const core = require('../runtime/core.cjs');
    settleDayFn = core.settleDay;
    // visual progress helpers kept on module via core ref below
    if (typeof core.hatchDay === 'function') {
      hatchDayFn = core.hatchDay;
      phaseFromProfileFn = core.phaseFromProfile;
      shouldStartNewEggFn = core.shouldStartNewEgg;
      localTodayFn = core.localToday;
      apiSource = 'dayCycle';
      return;
    }
    if (settleDayFn) {
      hatchDayFn = (profile) => {
        const result = settleDayFn(profile);
        return { date: profile.date, phase: 'hatched', result };
      };
      phaseFromProfileFn = (profile, alreadyHatched) => {
        if (alreadyHatched) return 'hatched';
        const active =
          (profile.keystrokes || 0) +
            (profile.clicks || 0) +
            (profile.mouseTravel || 0) +
            (profile.activeSec || 0) >
          0;
        return active ? 'growing' : 'egg';
      };
      shouldStartNewEggFn = (lastDate, today) => !lastDate || lastDate !== today;
      localTodayFn = (now = new Date()) => {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      apiSource = 'settleDay';
    }
  } catch (err) {
    console.error(
      '[desk] runtime/core.cjs missing — run: npm run compile:runtime',
      err && err.message ? err.message : err,
    );
    apiSource = 'none';
  }
}

loadCore();

function hatchDay(profile) {
  if (!hatchDayFn) throw new Error('CORE hatch/settle unavailable — npm run compile:runtime');
  return hatchDayFn(profile);
}

function phaseFromProfile(profile, alreadyHatched) {
  return phaseFromProfileFn(profile, alreadyHatched);
}

function shouldStartNewEgg(lastDate, today) {
  return shouldStartNewEggFn(lastDate, today);
}

function localToday(now) {
  return localTodayFn(now);
}

function settleOrHatch(profile) {
  return hatchDay(profile).result;
}

function getApiSource() {
  return apiSource;
}

function hatchProgressFromProfile(profile, alreadySaved) {
  const core = require('../runtime/core.cjs');
  return core.hatchProgressFromProfile(profile, alreadySaved);
}

function hatchProgressFromClicks(clicks) {
  const core = require('../runtime/core.cjs');
  return core.hatchProgressFromClicks(clicks);
}

function clicksPerHatchStage() {
  const core = require('../runtime/core.cjs');
  return core.CLICKS_PER_HATCH_STAGE;
}

function hatchTargetInputs() {
  const core = require('../runtime/core.cjs');
  const thresholds = core.HATCH_STAGE_THRESHOLDS;
  return Array.isArray(thresholds) && thresholds.length
    ? thresholds[thresholds.length - 1]
    : 29000;
}

function idleMoodFromProfile(profile) {
  const core = require('../runtime/core.cjs');
  return core.idleMoodFromProfile(profile);
}

function pickWeightedKey(weights, rng) {
  const core = require('../runtime/core.cjs');
  return core.pickWeightedKey(weights, rng);
}

module.exports = {
  hatchDay,
  phaseFromProfile,
  shouldStartNewEgg,
  localToday,
  settleOrHatch,
  getApiSource,
  hatchProgressFromProfile,
  hatchProgressFromClicks,
  clicksPerHatchStage,
  hatchTargetInputs,
  idleMoodFromProfile,
  pickWeightedKey,
};
