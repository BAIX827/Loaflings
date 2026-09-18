/**
 * Wire SENSE profile + CORE hatch/settle for the companion (no UI).
 */
const { runDemoSettle } = require('./pipeline');
const {
  getLiveProfile,
  getLiveSettle,
  ensureToday: ensureSenseToday,
} = require('./hooks/senseLive');
const { ensureDayState, markGrowing } = require('./dayState');
const { phaseFromProfile, getApiSource } = require('./hooks/coreDayCycle');

let demoBundle = null;

function getDemoBundle() {
  if (!demoBundle) {
    demoBundle = runDemoSettle();
  }
  return demoBundle;
}

/**
 * Prefer live settle when sense is running; else fixture demo.
 * Does not invent genes — always settleDay() from CORE.
 * @returns {{ ok: boolean, source?: string, profile?: object, result?: object, fixturePath?: string, persistPath?: string, error?: string }}
 */
function resolveSettleBundle() {
  try {
    const live = getLiveSettle();
    if (live?.result) {
      return {
        ok: true,
        source: 'live',
        profile: live.profile,
        result: live.result,
        persistPath: live.persistPath,
      };
    }
  } catch (err) {
    console.warn(
      '[loaflings] live settle unavailable, falling back to demo',
      err instanceof Error ? err.message : err,
    );
  }
  try {
    const { profile, result, fixturePath } = getDemoBundle();
    return { ok: true, source: 'demo', profile, result, fixturePath };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function slimResult(result) {
  return {
    date: result.date,
    kind: result.kind || 'loafling',
    energy: result.energy,
    genes: result.genes,
    personality: result.personality,
    rarity: result.rarity,
    traits: result.traits,
    events: result.events,
  };
}


/**
 * Align desk day-state + SENSE profile to the local calendar day.
 * UI phase from CORE phaseFromProfile(profile, alreadyHatched).
 * @returns {{ ok: boolean, date: string, phase: string, hatchedAt: string | null, newEgg: boolean, alreadyHatched: boolean, sense: object, coreApi: string, profile?: object }}
 */
function syncDayBoundary() {
  const sense = ensureSenseToday();
  const day = ensureDayState();
  let profile = null;
  try {
    profile = getLiveProfile();
  } catch {
    profile = null;
  }
  let phase = day.phase;
  if (day.alreadyHatched) {
    phase = 'hatched';
  } else if (profile) {
    phase = phaseFromProfile(profile, false);
    if (phase === 'growing' && day.phase === 'egg') {
      try {
        markGrowing();
      } catch {
        // ignore persist
      }
    }
  }
  return {
    ok: true,
    date: day.date,
    phase,
    hatchedAt: day.hatchedAt,
    newEgg: day.newEgg,
    alreadyHatched: day.alreadyHatched,
    sense,
    coreApi: getApiSource(),
    profile: profile || undefined,
  };
}

module.exports = {
  getDemoBundle,
  resolveSettleBundle,
  slimResult,
  syncDayBoundary,
};
