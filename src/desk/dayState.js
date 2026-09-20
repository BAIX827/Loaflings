/**
 * Per-calendar-day egg → growing → hatch phase for the companion.
 * Persists alreadyHatched; live phase comes from CORE phaseFromProfile.
 * @see docs/DAY_CYCLE_MVP.md
 */
const path = require('path');
const { app } = require('electron');
const { readJsonFile, writeJsonAtomic } = require('../shared/jsonFile.cjs');
const {
  shouldStartNewEgg,
  localToday,
} = require('./hooks/coreDayCycle');

const FILE_NAME = 'day-state.json';

/** @typedef {'egg' | 'growing' | 'hatched'} DayPhase */

function dayStatePath() {
  return path.join(app.getPath('userData'), FILE_NAME);
}

/**
 * @param {string} [date]
 * @returns {{ date: string, phase: DayPhase, hatchedAt: string | null, path: string }}
 */
function emptyDayState(date = localToday()) {
  return {
    date,
    phase: 'egg',
    hatchedAt: null,
    path: dayStatePath(),
  };
}

/**
 * @param {{ date: string, phase: DayPhase, hatchedAt: string | null }} state
 */
function writeDayState(state) {
  const fp = dayStatePath();
  writeJsonAtomic(fp, {
    date: state.date,
    phase: state.phase,
    hatchedAt: state.hatchedAt,
  });
}

/**
 * Ensure calendar day matches today (CORE shouldStartNewEgg). Stale → new egg.
 * @returns {{ date: string, phase: DayPhase, hatchedAt: string | null, path: string, newEgg: boolean, alreadyHatched: boolean }}
 */
function ensureDayState() {
  const today = localToday();
  const fp = dayStatePath();
  let prevDate = null;
  const raw = readJsonFile(fp, null);
  prevDate = raw?.date || null;
  if (raw && !shouldStartNewEgg(raw.date, today)) {
    const phase =
      raw.phase === 'hatched'
        ? 'hatched'
        : raw.phase === 'growing'
          ? 'growing'
          : 'egg';
    return {
      date: today,
      phase,
      hatchedAt: raw.hatchedAt || null,
      path: fp,
      newEgg: false,
      alreadyHatched: phase === 'hatched',
    };
  }
  const fresh = emptyDayState(today);
  writeDayState(fresh);
  return {
    ...fresh,
    newEgg: prevDate != null && shouldStartNewEgg(prevDate, today),
    alreadyHatched: false,
  };
}

function loadDayState() {
  return ensureDayState();
}

/**
 * Mark today’s egg hatched after Day reveal / Save (DESK persistence only).
 */
function markHatched() {
  const today = localToday();
  const state = {
    date: today,
    phase: /** @type {DayPhase} */ ('hatched'),
    hatchedAt: new Date().toISOString(),
    path: dayStatePath(),
  };
  writeDayState(state);
  return state;
}

/**
 * Persist growing hint (optional; UI may derive from phaseFromProfile).
 */
function markGrowing() {
  const cur = ensureDayState();
  if (cur.phase === 'hatched') return cur;
  const state = {
    date: cur.date,
    phase: /** @type {DayPhase} */ ('growing'),
    hatchedAt: null,
    path: dayStatePath(),
  };
  writeDayState(state);
  return state;
}

function resetToEgg() {
  const state = emptyDayState(localToday());
  writeDayState(state);
  return state;
}

module.exports = {
  FILE_NAME,
  dayStatePath,
  loadDayState,
  ensureDayState,
  markHatched,
  markGrowing,
  resetToEgg,
  localToday,
};
