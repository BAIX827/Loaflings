/**
 * IPC bridge: renderer ↔ main. Window chrome lives in window.js.
 */
const { app, ipcMain } = require('electron');
const {
  getLiveProfile,
  getLiveSettle,
  getSenseStatus,
  openAccessibilitySettings,
} = require('./hooks/senseLive');
const { loadCollection, saveToCollection } = require('./collection');
const { loadSettings, saveSettings } = require('./settings');
const { ensureDayState, markHatched } = require('./dayState');
const {
  hatchProgressFromProfile,
  hatchProgressFromClicks,
  clicksPerHatchStage,
  idleMoodFromProfile,
} = require('./hooks/coreDayCycle');
const {
  getDemoBundle,
  resolveSettleBundle,
  slimResult,
  syncDayBoundary,
} = require('./settleBridge');
const { getCompanion, applyWindowSettings } = require('./window');

function registerIpc() {
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
      syncDayBoundary();
      const day = ensureDayState();
      const alreadySaved = Boolean(day.hatchedAt);
      let profile = null;
      try {
        profile = getLiveProfile();
      } catch {
        profile = null;
      }
      if (!profile) {
        const progress = hatchProgressFromClicks(0);
        return {
          ok: true,
          source: 'idle',
          alreadySaved,
          day,
          progress,
          clicks: 0,
          clicksPerStage: clicksPerHatchStage(),
          keystrokes: 0,
          idleMood: null,
        };
      }
      const progress = hatchProgressFromProfile(profile, alreadySaved);
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
        day,
        progress,
        clicks: profile.clicks || 0,
        clicksPerStage: clicksPerHatchStage(),
        keystrokes: profile.keystrokes || 0,
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
      const bundle = getLiveSettle();
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

  ipcMain.handle('loaflings:collect-day', (_e, opts = {}) => {
    try {
      const force = opts?.forceSource;
      let bundle;
      if (force === 'demo') {
        const { profile, result, fixturePath } = getDemoBundle();
        bundle = { ok: true, source: 'demo', profile, result, fixturePath };
      } else if (force === 'live') {
        const live = getLiveSettle();
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
      syncDayBoundary();
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
