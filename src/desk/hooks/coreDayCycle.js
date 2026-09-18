/**
 * DESK bridge to DAY-CORE dayCycle APIs.
 * Prefer hatchDay / phaseFromProfile when present; fall back to settleDay.
 * @see docs/DAY_CYCLE_MVP.md
 */
try {
  require('tsx/cjs');
} catch {
  // already registered
}

let hatchDayFn = null;
let phaseFromProfileFn = null;
let shouldStartNewEggFn = null;
let localTodayFn = null;
let settleDayFn = null;
let apiSource = 'none';

function loadCore() {
  try {
    // Prefer barrel (exports dayCycle + settle)
    const core = require('../../core/index.ts');
    settleDayFn = core.settleDay;
    if (typeof core.hatchDay === 'function') {
      hatchDayFn = core.hatchDay;
      phaseFromProfileFn = core.phaseFromProfile;
      shouldStartNewEggFn = core.shouldStartNewEgg;
      localTodayFn = core.localToday;
      apiSource = 'dayCycle';
      return;
    }
  } catch (err) {
    console.warn('[desk] core/index load failed', err && err.message ? err.message : err);
  }
  try {
    const settle = require('../../core/settle.ts');
    settleDayFn = settle.settleDay;
    apiSource = 'settleDay-stub';
  } catch (err) {
    console.error('[desk] settleDay unavailable', err);
    apiSource = 'none';
  }
  // Stubs matching docs/DAY_CYCLE_MVP.md until dayCycle ships
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
  if (settleDayFn) apiSource = 'settleDay-stub';
}

loadCore();

/**
 * Hatch today's Loafling from a SENSE profile (CORE hatchDay → DaylingResult).
 * @param {object} profile
 * @returns {{ date: string, phase: 'hatched', result: object }}
 */
function hatchDay(profile) {
  if (!hatchDayFn) throw new Error('CORE hatch/settle unavailable');
  return hatchDayFn(profile);
}

/**
 * @param {object} profile
 * @param {boolean} alreadyHatched
 * @returns {'egg'|'growing'|'hatched'}
 */
function phaseFromProfile(profile, alreadyHatched) {
  return phaseFromProfileFn(profile, alreadyHatched);
}

function shouldStartNewEgg(lastDate, today) {
  return shouldStartNewEggFn(lastDate, today);
}

function localToday(now) {
  return localTodayFn(now);
}

/** Convenience: result only (same shape as legacy settleDay). */
function settleOrHatch(profile) {
  return hatchDay(profile).result;
}

function getApiSource() {
  return apiSource;
}

module.exports = {
  hatchDay,
  phaseFromProfile,
  shouldStartNewEgg,
  localToday,
  settleOrHatch,
  getApiSource,
};
