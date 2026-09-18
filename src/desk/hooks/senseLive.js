/**
 * DAY-SENSE live bridge for DESK main process.
 */
const path = require('path');
const { app, screen } = require('electron');
const { LiveSensor } = require('../../sense/liveSensor.js');
const { assertProfileShape } = require('../../sense/profile.ts');
const { hatchDay, getApiSource } = require('./coreDayCycle');

/** @type {import('../../sense/liveSensor.js').LiveSensor | null} */
let sensor = null;

function persistPath() {
  return path.join(app.getPath('userData'), 'live-profile.json');
}

/**
 * @param {() => boolean} shouldIgnoreClick
 */
async function startLiveSense(shouldIgnoreClick) {
  if (sensor) return { ok: true, already: true, path: persistPath() };
  const display = screen.getPrimaryDisplay();
  sensor = new LiveSensor({
    persistPath: persistPath(),
    shouldIgnoreClick,
    seedKey: 'mac-demo',
    powerMonitor: require('electron').powerMonitor,
    scaleFactor: display.scaleFactor || 2,
  });
  const started = await sensor.start();
  return { ...started, path: persistPath(), coreApi: getApiSource() };
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

module.exports = {
  startLiveSense,
  stopLiveSense,
  getLiveProfile,
  getLiveSettle,
  ensureToday,
  excludeWindowIds,
  persistPath,
};
