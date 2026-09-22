/**
 * IPC bridge: renderer ↔ main. Window chrome lives in window.js.
 */
const { app, ipcMain } = require('electron');
const {
  getLiveProfile,
  getSenseStatus,
  openAccessibilitySettings,
} = require('./hooks/senseLive');
const { loadCollection, saveToCollection } = require('./collection');
const { buildCatalog } = require('./catalog');
const { loadSettings, saveSettings } = require('./settings');
const { ensureDayState, recordEggProgress, resolveRollover, markHatched } = require('./dayState');
const { observeActivityProfile, getActivityStats } = require('./activityStats');
const {
  hatchProgressFromProfile,
  clicksPerHatchStage,
  hatchStageThresholds,
  idleMoodFromProfile,
} = require('./hooks/coreDayCycle');
const {
  getDemoBundle,
  getLiveEggSettle,
  effectiveProfileForDay,
  resolveSettleBundle,
  slimResult,
  syncDayBoundary,
} = require('./settleBridge');
const { getCompanion, applyWindowSettings } = require('./window');

function progressProfile(day, profile) {
  if (profile) return effectiveProfileForDay(profile, day);
  return {
    date: day.date,
    seedKey: 'local',
    clicks: day.egg?.clicks || 0,
    keystrokes: day.egg?.keystrokes || 0,
    mouseTravel: 0,
    idleSec: 0,
    activeSec: 0,
    focusSessions: [],
    windowSwitches: 0,
    activeHours: Array(24).fill(0),
  };
}

function currentHatchSnapshot() {
  const synced = syncDayBoundary();
  const day = synced.day || ensureDayState();
  const profile = synced.profile || null;
  const eggProfile = progressProfile(day, profile);
  const progress = hatchProgressFromProfile(eggProfile, false);
  const stageThresholds = hatchStageThresholds();
  const targetInputs = stageThresholds[stageThresholds.length - 1];
  return {
    synced,
    day,
    profile,
    eggProfile,
    progress,
    stageThresholds,
    targetInputs,
    remainingInputs: Math.max(0, targetInputs - progress.inputs),
    canCollect: progress.inputs >= targetInputs,
  };
}

function registerIpc() {
  ipcMain.on('loaflings:set-ignore-mouse', (_e, ignore) => {
    const win = getCompanion();
    if (!win || win.isDestroyed()) return;
    if (ignore) win.setIgnoreMouseEvents(true, { forward: true });
    else win.setIgnoreMouseEvents(false);
  });

  ipcMain.handle('loaflings:get-sense-status', () => {
    try {
      return getSenseStatus();
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:open-accessibility', async () => openAccessibilitySettings());

  ipcMain.handle('loaflings:quit', () => {
    app.quit();
    return { ok: true };
  });

  ipcMain.handle('loaflings:get-settings', () => {
    try {
      return { ok: true, settings: loadSettings() };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:set-settings', (_e, partial) => {
    try {
      const settings = saveSettings(partial || {});
      const win = getCompanion();
      if (win && !win.isDestroyed()) applyWindowSettings(win, settings);
      return { ok: true, settings };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:get-hatch-progress', () => {
    try {
      const snapshot = currentHatchSnapshot();
      const { synced, day, profile, eggProfile, progress, stageThresholds, targetInputs, remainingInputs, canCollect } = snapshot;
      const alreadySaved = Boolean(day.hatchedAt);
      if (!profile) {
        const clicks = day.egg?.clicks || 0;
        const keystrokes = day.egg?.keystrokes || 0;
        return {
          ok: true,
          source: 'idle',
          alreadySaved,
          canCollect,
          targetInputs,
          stageThresholds,
          remainingInputs,
          choiceRequired: day.choiceRequired,
          day,
          progress,
          clicks,
          clicksPerStage: clicksPerHatchStage(),
          keystrokes,
          dailyClicks: 0,
          dailyKeystrokes: 0,
          idleMood: null,
        };
      }
      let idleMood = null;
      try {
        idleMood = idleMoodFromProfile(profile);
      } catch (err) {
        console.warn('[desk] idleMood', err && err.message ? err.message : err);
      }
      return {
        ok: true,
        source: 'live',
        alreadySaved,
        canCollect,
        targetInputs,
        stageThresholds,
        remainingInputs,
        choiceRequired: day.choiceRequired,
        day,
        progress,
        clicks: eggProfile.clicks || 0,
        clicksPerStage: clicksPerHatchStage(),
        keystrokes: eggProfile.keystrokes || 0,
        dailyClicks: profile.clicks || 0,
        dailyKeystrokes: profile.keystrokes || 0,
        idleMood,
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:get-live-profile', () => {
    try {
      const profile = getLiveProfile();
      if (!profile) return { ok: false, error: 'live-sense-not-started' };
      return { ok: true, profile };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:get-live-settle', () => {
    try {
      const bundle = getLiveEggSettle();
      if (bundle?.ok === false) return bundle;
      if (!bundle) return { ok: false, error: 'live-sense-not-started' };
      const { profile, result, persistPath } = bundle;
      return {
        ok: true,
        source: 'live',
        persistPath,
        profile,
        result: slimResult(result),
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:get-demo-settle', () => {
    try {
      const { profile, result, fixturePath } = getDemoBundle();
      return {
        ok: true,
        source: 'demo',
        fixturePath,
        profile,
        result: slimResult(result),
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:get-day-settle', () => {
    syncDayBoundary();
    const bundle = resolveSettleBundle();
    if (!bundle.ok) return bundle;
    return {
      ok: true,
      source: bundle.source,
      fixturePath: bundle.fixturePath,
      persistPath: bundle.persistPath,
      profile: bundle.profile,
      result: slimResult(bundle.result),
      day: ensureDayState(),
    };
  });

  ipcMain.handle('loaflings:get-collection', () => {
    try {
      const col = loadCollection();
      return {
        ok: true,
        path: col.path,
        version: col.version,
        items: col.items,
        count: col.items.length,
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:get-catalog', () => {
    try {
      const col = loadCollection();
      return { ok: true, ...buildCatalog(col.items) };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:get-activity-stats', () => {
    try {
      const profile = getLiveProfile();
      if (profile) observeActivityProfile(profile);
      return { ok: true, ...getActivityStats() };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:resolve-egg-rollover', (_e, action) => {
    try {
      let profile = null;
      try { profile = getLiveProfile(); } catch { profile = null; }
      const day = resolveRollover(action, profile);
      const updated = profile ? recordEggProgress(profile) : day;
      return { ok: true, action, day: updated };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:collect-day', (_e, opts = {}) => {
    try {
      const gate = currentHatchSnapshot();
      if (gate.day.choiceRequired) {
        return { ok: false, error: 'egg-rollover-choice-required' };
      }
      if (!gate.canCollect) {
        return {
          ok: false,
          error: 'hatch-not-ready',
          remainingInputs: gate.remainingInputs,
          targetInputs: gate.targetInputs,
          progress: gate.progress,
        };
      }
      const force = opts?.forceSource;
      let bundle;
      if (force === 'demo') {
        const { profile, result, fixturePath } = getDemoBundle();
        bundle = { ok: true, source: 'demo', profile, result, fixturePath };
      } else if (force === 'live') {
        const live = getLiveEggSettle();
        if (live?.ok === false) return live;
        if (!live?.result) {
          return { ok: false, error: 'live-sense-not-started' };
        }
        bundle = {
          ok: true,
          source: 'live',
          profile: live.profile,
          result: live.result,
          persistPath: live.persistPath,
        };
      } else {
        bundle = resolveSettleBundle();
      }
      if (!bundle.ok) return bundle;

      syncDayBoundary();
      const saved = saveToCollection(bundle.result, {
        source: bundle.source,
        seedKey: bundle.profile?.seedKey,
      });
      const hatched = markHatched();
      return {
        ok: true,
        source: bundle.source,
        fixturePath: bundle.fixturePath,
        persistPath: bundle.persistPath,
        result: slimResult(bundle.result),
        entry: saved.entry,
        count: saved.count,
        collectionPath: saved.path,
        day: { date: hatched.date, phase: hatched.phase, hatchedAt: hatched.hatchedAt },
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });


  ipcMain.handle('loaflings:get-day-state', () => {
    try {
      return syncDayBoundary();
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });

  ipcMain.handle('loaflings:hatch-day', () => {
    try {
      const gate = currentHatchSnapshot();
      if (!gate.canCollect) {
        return {
          ok: false,
          error: 'hatch-not-ready',
          remainingInputs: gate.remainingInputs,
          targetInputs: gate.targetInputs,
        };
      }
      const state = markHatched();
      return {
        ok: true,
        date: state.date,
        phase: state.phase,
        hatchedAt: state.hatchedAt,
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });
}


module.exports = { registerIpc };
