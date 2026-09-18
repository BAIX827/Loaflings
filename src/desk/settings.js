/**
 * Companion window prefs (opacity / size / lock position).
 * Persisted under Electron userData/desk-settings.json.
 */
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DEFAULTS = Object.freeze({
  version: 1,
  opacity: 1,
  scale: 1,
  lockPosition: false,
  /** @type {{ x: number, y: number } | null} */
  position: null,
});

function settingsPath() {
  return path.join(app.getPath('userData'), 'desk-settings.json');
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function normalize(raw) {
  const s = { ...DEFAULTS, ...(raw && typeof raw === 'object' ? raw : {}) };
  s.version = 1;
  s.opacity = clamp(Number(s.opacity) || 1, 0.25, 1);
  s.scale = clamp(Number(s.scale) || 1, 0.6, 1.6);
  s.lockPosition = Boolean(s.lockPosition);
  if (
    s.position &&
    typeof s.position.x === 'number' &&
    typeof s.position.y === 'number'
  ) {
    s.position = { x: s.position.x, y: s.position.y };
  } else {
    s.position = null;
  }
  return s;
}

function loadSettings() {
  try {
    const raw = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
    return normalize(raw);
  } catch {
    return normalize({});
  }
}

function saveSettings(partial) {
  const next = normalize({ ...loadSettings(), ...partial });
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(next, null, 2));
  return next;
}

module.exports = { DEFAULTS, loadSettings, saveSettings, settingsPath };
