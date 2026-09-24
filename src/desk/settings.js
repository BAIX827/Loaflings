/**
 * Companion window prefs.
 * Persisted under Electron userData/desk-settings.json.
 */
const path = require('path');
const { app } = require('electron');
const { readJsonFile, writeJsonAtomic } = require('../shared/jsonFile.cjs');
const { DEFAULT_WARDROBE, normalizeWardrobe } = require('./characterRecipe');
const { DEFAULT_HATCH_TARGET, normalizeHatchTarget } = require('./runtime/core.cjs');

const DEFAULTS = Object.freeze({
  version: 5,
  opacity: 1,
  scale: 1,
  hatchTarget: DEFAULT_HATCH_TARGET,
  lockPosition: false,
  movementMode: 'manual',
  layerMode: 'top',
  showChrome: true,
  showHud: true,
  /** @type {'zh'|'en'} */
  locale: 'zh',
  wardrobe: DEFAULT_WARDROBE,
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
  s.version = 5;
  s.opacity = clamp(Number(s.opacity) || 1, 0.25, 1);
  s.scale = clamp(Number(s.scale) || 1, 0.6, 1.6);
  s.hatchTarget = normalizeHatchTarget(s.hatchTarget);
  s.movementMode = ['manual', 'wander', 'fixed'].includes(raw?.movementMode)
    ? raw.movementMode : raw?.lockPosition ? 'fixed' : 'manual';
  s.lockPosition = s.movementMode === 'fixed';
  s.layerMode = s.layerMode === 'desktop' ? 'desktop' : 'top';
  s.showChrome = s.showChrome !== false;
  s.showHud = s.showHud !== false;
  s.locale = s.locale === 'en' ? 'en' : 'zh';
  s.wardrobe = normalizeWardrobe(s.wardrobe);
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
  return normalize(readJsonFile(settingsPath(), {}));
}

function saveSettings(partial) {
  const current = loadSettings();
  const movementMode = partial?.movementMode || (Object.hasOwn(partial || {}, 'lockPosition')
    ? partial.lockPosition ? 'fixed' : 'manual' : current.movementMode);
  const next = normalize({
    ...current,
    ...partial,
    movementMode,
    wardrobe: {
      ...current.wardrobe,
      ...(partial?.wardrobe && typeof partial.wardrobe === 'object' ? partial.wardrobe : {}),
    },
  });
  writeJsonAtomic(settingsPath(), next);
  return next;
}

module.exports = { DEFAULTS, loadSettings, saveSettings, settingsPath };
