/**
 * CJS runtime mirror of profile.ts for Electron main / packaged .app.
 * Keep field names in sync with profile.ts and src/core/profile.ts.
 */
'use strict';

const PROFILE_SCHEMA_VERSION = 1;

function emptyProfile(date, seedKey = 'local') {
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
    activeHours: Array.from({ length: 24 }, () => 0),
  };
}

function assertProfileShape(p) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
    throw new Error(`Invalid date: ${p.date}`);
  }
  if (!Array.isArray(p.activeHours) || p.activeHours.length !== 24) {
    throw new Error('activeHours must be length 24');
  }
  for (const key of [
    'keystrokes',
    'clicks',
    'mouseTravel',
    'idleSec',
    'activeSec',
    'windowSwitches',
  ]) {
    if (typeof p[key] !== 'number' || p[key] < 0 || Number.isNaN(p[key])) {
      throw new Error(`Invalid ${key}`);
    }
  }
  if (!Array.isArray(p.focusSessions)) {
    throw new Error('focusSessions must be an array');
  }
}

module.exports = {
  PROFILE_SCHEMA_VERSION,
  emptyProfile,
  assertProfileShape,
};
