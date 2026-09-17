/**
 * DAY-SENSE live bridge for DESK main process.
 */
const path = require('path');
const { app, screen } = require('electron');
const { LiveSensor } = require('../../sense/liveSensor.js');
const { settleDay } = require('../../core/settle.ts');
const { assertProfileShape } = require('../../sense/profile.ts');

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
  return { ...started, path: persistPath() };
}

function stopLiveSense() {
  sensor?.stop();
  sensor = null;
}

function getLiveProfile() {
  if (!sensor) return null;
  const profile = sensor.getProfile();
  assertProfileShape(profile);
  return profile;
}

function getLiveSettle() {
  const profile = getLiveProfile();
  if (!profile) return null;
  const result = settleDay(profile);
  return { profile, result, persistPath: persistPath() };
}

function excludeWindowIds(ids) {
  return sensor?.excludeWindowIds(ids) ?? { ok: false, reason: 'not-started' };
}

module.exports = {
  startLiveSense,
  stopLiveSense,
  getLiveProfile,
  getLiveSettle,
  excludeWindowIds,
  persistPath,
};
