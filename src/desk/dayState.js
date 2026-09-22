/**
 * Persistent egg lifecycle. An unfinished egg pauses at a local-day boundary
 * until the player chooses to continue it or replace it.
 */
'use strict';

const path = require('path');
const { app } = require('electron');
const { readJsonFile, writeJsonAtomic } = require('../shared/jsonFile.cjs');
const { localToday } = require('./hooks/coreDayCycle');
const {
  EGG_STATE_VERSION,
  emptyEgg,
  normalizeEgg,
  freezeEgg,
  pendingFromEgg,
  continueEgg,
  replaceEgg,
} = require('./eggProgress');

const FILE_NAME = 'day-state.json';

function dayStatePath() {
  return path.join(app.getPath('userData'), FILE_NAME);
}

function emptyDayState(date = localToday(), profile = null) {
  return {
    version: EGG_STATE_VERSION,
    date,
    phase: 'egg',
    hatchedAt: null,
    egg: emptyEgg(date, profile),
    pendingRollover: null,
    path: dayStatePath(),
  };
}

function normalizeState(raw, date) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const phase = source.phase === 'hatched' ? 'hatched' : source.phase === 'growing' ? 'growing' : 'egg';
  return {
    version: EGG_STATE_VERSION,
    date: typeof source.date === 'string' ? source.date : date,
    phase,
    hatchedAt: phase === 'hatched' ? source.hatchedAt || null : null,
    egg: normalizeEgg(source.egg, source.date || date),
    pendingRollover:
      source.pendingRollover && typeof source.pendingRollover === 'object'
        ? {
            fromDate: source.pendingRollover.fromDate || source.date || date,
            startedDate:
              source.pendingRollover.startedDate || source.pendingRollover.fromDate || source.date || date,
            clicks: Math.max(0, Math.floor(Number(source.pendingRollover.clicks) || 0)),
            keystrokes: Math.max(0, Math.floor(Number(source.pendingRollover.keystrokes) || 0)),
          }
        : null,
    path: dayStatePath(),
  };
}

function writeDayState(state) {
  writeJsonAtomic(dayStatePath(), {
    version: EGG_STATE_VERSION,
    date: state.date,
    phase: state.phase,
    hatchedAt: state.hatchedAt || null,
    egg: normalizeEgg(state.egg, state.date),
    pendingRollover: state.pendingRollover || null,
  });
}

function present(state, extras = {}) {
  const normalized = normalizeState(state, state.date);
  return {
    ...normalized,
    newEgg: Boolean(extras.newEgg),
    dayChanged: Boolean(extras.dayChanged),
    choiceRequired: Boolean(normalized.pendingRollover),
    alreadyHatched: normalized.phase === 'hatched',
  };
}

/** @param {{ previousProfile?: object|null, currentProfile?: object|null }} [context] */
function ensureDayState(context = {}) {
  const today = localToday();
  const raw = readJsonFile(dayStatePath(), null);
  if (!raw) {
    const fresh = emptyDayState(today, context.currentProfile || null);
    writeDayState(fresh);
    return present(fresh);
  }

  const previous = normalizeState(raw, today);
  if (previous.date === today) {
    const rolloverProfile = context.previousProfile;
    if (
      previous.pendingRollover &&
      rolloverProfile?.date === previous.pendingRollover.fromDate
    ) {
      const frozen = freezeEgg(previous.egg, rolloverProfile);
      const pending = pendingFromEgg(frozen, previous.pendingRollover.fromDate);
      if (
        pending.clicks !== previous.pendingRollover.clicks ||
        pending.keystrokes !== previous.pendingRollover.keystrokes
      ) {
        const repaired = { ...previous, egg: frozen, pendingRollover: pending };
        writeDayState(repaired);
        return present(repaired);
      }
    }
    return present(previous);
  }

  if (previous.phase === 'hatched') {
    const fresh = emptyDayState(today, context.currentProfile || null);
    writeDayState(fresh);
    return present(fresh, { newEgg: true, dayChanged: true });
  }

  const priorProfile =
    context.previousProfile?.date === previous.date ? context.previousProfile : null;
  const frozenEgg = freezeEgg(previous.egg, priorProfile);
  const pending = pendingFromEgg(frozenEgg, previous.date);
  const waiting = {
    version: EGG_STATE_VERSION,
    date: today,
    phase: 'egg',
    hatchedAt: null,
    egg: frozenEgg,
    pendingRollover: pending,
    path: dayStatePath(),
  };
  writeDayState(waiting);
  return present(waiting, { dayChanged: true });
}

function recordEggProgress(profile) {
  const current = ensureDayState({ currentProfile: profile });
  if (current.alreadyHatched || current.choiceRequired || !profile) return current;
  const egg = freezeEgg(current.egg, profile);
  const phase = egg.clicks + egg.keystrokes > 0 ? 'growing' : 'egg';
  if (
    egg.clicks !== current.egg.clicks ||
    egg.keystrokes !== current.egg.keystrokes ||
    phase !== current.phase
  ) {
    const next = { ...current, egg, phase };
    writeDayState(next);
    return present(next);
  }
  return current;
}

function reopenUnreadyEgg(profile, targetInputs) {
  const current = ensureDayState({ currentProfile: profile });
  if (!current.alreadyHatched) return current;
  const egg = freezeEgg(current.egg, profile);
  if (egg.clicks + egg.keystrokes >= targetInputs) return current;
  const state = {
    ...current,
    phase: egg.clicks + egg.keystrokes > 0 ? 'growing' : 'egg',
    hatchedAt: null,
    egg,
  };
  writeDayState(state);
  return present(state);
}

function resolveRollover(action, profile) {
  const current = ensureDayState({ currentProfile: profile });
  if (!current.choiceRequired) return current;
  if (action !== 'continue' && action !== 'new') throw new Error('invalid-rollover-action');
  const egg =
    action === 'continue'
      ? continueEgg(current.pendingRollover, current.date)
      : replaceEgg(current.date, profile);
  const next = {
    ...current,
    phase: egg.clicks + egg.keystrokes > 0 ? 'growing' : 'egg',
    hatchedAt: null,
    egg,
    pendingRollover: null,
  };
  writeDayState(next);
  return present(next);
}

function markHatched() {
  const current = ensureDayState();
  if (current.choiceRequired) throw new Error('egg-rollover-choice-required');
  const state = {
    ...current,
    phase: 'hatched',
    hatchedAt: new Date().toISOString(),
    pendingRollover: null,
  };
  writeDayState(state);
  return present(state);
}

function markGrowing() {
  const current = ensureDayState();
  if (current.phase === 'hatched' || current.choiceRequired) return current;
  const state = { ...current, phase: 'growing', hatchedAt: null };
  writeDayState(state);
  return present(state);
}

function resetToEgg(profile = null) {
  const state = emptyDayState(localToday(), profile);
  writeDayState(state);
  return present(state);
}

module.exports = {
  FILE_NAME,
  dayStatePath,
  loadDayState: ensureDayState,
  ensureDayState,
  recordEggProgress,
  reopenUnreadyEgg,
  resolveRollover,
  markHatched,
  markGrowing,
  resetToEgg,
  localToday,
};
