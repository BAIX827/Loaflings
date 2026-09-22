'use strict';

const STATS_VERSION = 1;
const TOTAL_KEYS = [
  'clicks',
  'keystrokes',
  'mouseTravel',
  'activeSec',
  'idleSec',
  'focusSec',
  'focusSessions',
  'windowSwitches',
];

function safeNumber(value) {
  return Math.max(0, Number(value) || 0);
}

function profileSnapshot(profile) {
  const sessions = Array.isArray(profile?.focusSessions) ? profile.focusSessions : [];
  return {
    clicks: Math.floor(safeNumber(profile?.clicks)),
    keystrokes: Math.floor(safeNumber(profile?.keystrokes)),
    mouseTravel: safeNumber(profile?.mouseTravel),
    activeSec: Math.floor(safeNumber(profile?.activeSec)),
    idleSec: Math.floor(safeNumber(profile?.idleSec)),
    focusSec: sessions.reduce((sum, item) => sum + Math.floor(safeNumber(item?.durationSec)), 0),
    focusSessions: sessions.length,
    windowSwitches: Math.floor(safeNumber(profile?.windowSwitches)),
  };
}

function emptyStats() {
  return {
    version: STATS_VERSION,
    totals: Object.fromEntries(TOTAL_KEYS.map((key) => [key, 0])),
    days: {},
  };
}

function normalizeStats(raw) {
  const out = emptyStats();
  if (!raw || typeof raw !== 'object') return out;
  for (const key of TOTAL_KEYS) out.totals[key] = safeNumber(raw.totals?.[key]);
  if (raw.days && typeof raw.days === 'object') {
    for (const [date, snapshot] of Object.entries(raw.days)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      out.days[date] = Object.fromEntries(
        TOTAL_KEYS.map((key) => [key, safeNumber(snapshot?.[key])]),
      );
    }
  }
  return out;
}

function observeProfile(raw, profile) {
  const stats = normalizeStats(raw);
  if (!profile || !/^\d{4}-\d{2}-\d{2}$/.test(profile.date || '')) {
    return { stats, changed: false };
  }
  const next = profileSnapshot(profile);
  const previous = stats.days[profile.date] || {};
  let changed = false;
  for (const key of TOTAL_KEYS) {
    const delta = Math.max(0, next[key] - safeNumber(previous[key]));
    if (delta > 0) {
      stats.totals[key] += delta;
      changed = true;
    }
  }
  if (!stats.days[profile.date] || TOTAL_KEYS.some((key) => next[key] !== previous[key])) {
    stats.days[profile.date] = next;
    changed = true;
  }
  return { stats, changed };
}

function statsView(raw) {
  const stats = normalizeStats(raw);
  return {
    version: stats.version,
    totals: {
      ...stats.totals,
      activityHits: stats.totals.clicks + stats.totals.keystrokes,
    },
    trackedDays: Object.keys(stats.days).length,
  };
}

module.exports = {
  STATS_VERSION,
  TOTAL_KEYS,
  profileSnapshot,
  emptyStats,
  normalizeStats,
  observeProfile,
  statsView,
};
