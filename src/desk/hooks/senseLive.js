/**
 * DAY-SENSE live bridge for DESK main process.
 */
const path = require('path');
const { app, screen, shell } = require('electron');
const { LiveSensor } = require('../../sense/liveSensor.js');
const { assertProfileShape } = require('../../sense/profile.cjs');
const { hatchDay, getApiSource } = require('./coreDayCycle');

/** @type {import('../../sense/liveSensor.js').LiveSensor | null} */
let sensor = null;
/** @type {object | null} */
let lastStartInfo = null;

function persistPath() {
  return path.join(app.getPath('userData'), 'live-profile.json');
}

/**
 * @param {() => boolean} shouldIgnoreClick
 */
async function startLiveSense(_shouldIgnoreClick) {
  if (sensor) {
    sensor.ensureToday();
    return { ok: true, already: true, path: persistPath(), ...(lastStartInfo || {}), coreApi: getApiSource() };
  }
  const display = screen.getPrimaryDisplay();
  sensor = new LiveSensor({
    persistPath: persistPath(),
    seedKey: 'mac-demo',
    powerMonitor: require('electron').powerMonitor,
    scaleFactor: display.scaleFactor || 2,
  });
  lastStartInfo = await sensor.start();
  return { ...lastStartInfo, path: persistPath(), coreApi: getApiSource() };
}

function stopLiveSense() {
  sensor?.stop();
  sensor = null;
}

/**
 * Roll live profile to today’s egg when the calendar day changes.
 * @returns {{ ok: boolean, rolled?: boolean, date?: string, reason?: string }}
 */
function ensureToday() {
  if (!sensor) return { ok: false, reason: 'live-sense-not-started' };
  const before = sensor.profile?.date;
  sensor.ensureToday();
  const after = sensor.profile?.date;
  return {
    ok: true,
    rolled: Boolean(before && after && before !== after),
    date: after,
  };
}

function getLiveProfile() {
  if (!sensor) return null;
  sensor.ensureToday();
  const profile = sensor.getProfile();
  assertProfileShape(profile);
  return profile;
}

/**
 * Live profile → CORE hatchDay (DaylingResult.kind = loafling).
 */
function getLiveSettle() {
  const profile = getLiveProfile();
  if (!profile) return null;
  const hatch = hatchDay(profile);
  return {
    profile,
    result: hatch.result,
    hatch,
    persistPath: persistPath(),
    apiSource: getApiSource(),
  };
}

function excludeWindowIds(ids) {
  return sensor?.excludeWindowIds(ids) ?? { ok: false, reason: 'not-started' };
}

function getSenseStatus() {
  if (!sensor) {
    return {
      ok: false,
      running: false,
      permissionHint:
        'System Settings → Privacy & Security → Accessibility — enable Electron / Loaflings',
      start: lastStartInfo,
    };
  }
  return { ok: true, ...sensor.getStatus(), start: lastStartInfo };
}

async function openAccessibilitySettings() {
  try {
    await shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility'
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

module.exports = {
  startLiveSense,
  stopLiveSense,
  getLiveProfile,
  getLiveSettle,
  ensureToday,
  excludeWindowIds,
  getSenseStatus,
  openAccessibilitySettings,
  persistPath,
};
