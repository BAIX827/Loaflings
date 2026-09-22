/**
 * Wire SENSE profile + CORE hatch/settle for the companion (no UI).
 */
const { runDemoSettle } = require('./pipeline');
const {
  getLiveProfile,
  ensureToday: ensureSenseToday,
} = require('./hooks/senseLive');
const { ensureDayState, recordEggProgress, reopenUnreadyEgg, markGrowing } = require('./dayState');
const { observeActivityProfile } = require('./activityStats');
const { phaseFromProfile, hatchDay, hatchTargetInputs, getApiSource } = require('./hooks/coreDayCycle');
const { slimResult } = require('./resultView');

let demoBundle = null;

function getDemoBundle() {
  if (!demoBundle) {
    demoBundle = runDemoSettle();
  }
  return demoBundle;
}

function effectiveProfileForDay(profile, day) {
  if (!profile || !day?.egg) return profile;
  return {
    ...profile,
    clicks: day.egg.clicks || 0,
    keystrokes: day.egg.keystrokes || 0,
  };
}

function getLiveEggSettle() {
  const synced = syncDayBoundary();
  if (synced.choiceRequired) return { ok: false, error: 'egg-rollover-choice-required' };
  if (!synced.profile) return null;
  const profile = effectiveProfileForDay(synced.profile, synced.day);
  const hatch = hatchDay(profile);
  return {
    ok: true,
    profile,
    result: hatch.result,
    hatch,
    apiSource: getApiSource(),
  };
}

/**
 * Prefer live settle when sense is running; else fixture demo.
 * Does not invent genes — always settleDay() from CORE.
 * @returns {{ ok: boolean, source?: string, profile?: object, result?: object, fixturePath?: string, persistPath?: string, error?: string }}
 */
function resolveSettleBundle() {
  try {
    const live = getLiveEggSettle();
    if (live?.ok === false) return live;
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

/**
 * Align desk day-state + SENSE profile to the local calendar day.
 * UI phase from CORE phaseFromProfile(profile, alreadyHatched).
 * @returns {{ ok: boolean, date: string, phase: string, hatchedAt: string | null, newEgg: boolean, alreadyHatched: boolean, sense: object, coreApi: string, profile?: object }}
 */
function syncDayBoundary() {
  const sense = ensureSenseToday();
  let profile = null;
  try {
    profile = getLiveProfile();
  } catch {
    profile = null;
  }
  if (sense?.previousProfile) observeActivityProfile(sense.previousProfile);
  if (profile) observeActivityProfile(profile);
  let day = ensureDayState({
    previousProfile: sense?.previousProfile || null,
    currentProfile: profile,
  });
  if (day.alreadyHatched) {
    day = reopenUnreadyEgg(profile, hatchTargetInputs());
  }
  if (profile && !day.choiceRequired && !day.alreadyHatched) {
    day = recordEggProgress(profile);
  }
  let phase = day.phase;
  if (day.alreadyHatched) {
    phase = 'hatched';
  } else if (day.choiceRequired) {
    phase = day.egg?.clicks + day.egg?.keystrokes > 0 ? 'growing' : 'egg';
  } else if (profile) {
    phase = phaseFromProfile(effectiveProfileForDay(profile, day), false);
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
    choiceRequired: day.choiceRequired,
    pendingRollover: day.pendingRollover,
    egg: day.egg,
    day,
    sense,
    coreApi: getApiSource(),
    profile: profile || undefined,
  };
}

module.exports = {
  getDemoBundle,
  getLiveEggSettle,
  effectiveProfileForDay,
  resolveSettleBundle,
  slimResult,
  syncDayBoundary,
};
