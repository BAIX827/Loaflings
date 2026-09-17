/**
 * Loaflings / 摸鱼灵 — Electron companion shell (DAY-DESK)
 * Always-on-top, frameless, transparent window. Shows base pet + end-of-day reveal.
 */
const { app, BrowserWindow, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const { runDemoSettle } = require('./pipeline');
const {
  startLiveSense,
  stopLiveSense,
  getLiveProfile,
  getLiveSettle,
  excludeWindowIds,
} = require('./hooks/senseLive');
const { loadCollection, saveToCollection } = require('./collection');

const ROOT = path.join(__dirname, '../..');
const ICON_PATH = path.join(ROOT, 'src/art/AppIcon.png');

/** @type {BrowserWindow | null} */
let companion = null;

/** Cached demo settle (fixture → sense assert → core settleDay). */
let demoBundle = null;

function getDemoBundle() {
  if (!demoBundle) {
    demoBundle = runDemoSettle();
  }
  return demoBundle;
}

/**
 * Prefer live settle when sense is running; else fixture demo.
 * Does not invent genes — always settleDay() from CORE.
 * @returns {{ ok: boolean, source?: string, profile?: object, result?: object, fixturePath?: string, persistPath?: string, error?: string }}
 */
function resolveSettleBundle() {
  try {
    const live = getLiveSettle();
    if (live?.result) {
      return {
        ok: true,
        source: 'live',
        profile: live.profile,
        result: live.result,
        persistPath: live.persistPath,
      };
    }
  } catch (err) {
    console.warn(
      '[loaflings] live settle unavailable, falling back to demo',
      err instanceof Error ? err.message : err,
    );
  }
  try {
    const { profile, result, fixturePath } = getDemoBundle();
    return { ok: true, source: 'demo', profile, result, fixturePath };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function slimResult(result) {
  return {
    date: result.date,
    energy: result.energy,
    genes: result.genes,
    personality: result.personality,
    rarity: result.rarity,
    traits: result.traits,
    events: result.events,
  };
}

function createCompanionWindow() {
  const icon = nativeImage.createFromPath(ICON_PATH);
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon);
  }

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const winW = 340;
  const winH = 380;

  companion = new BrowserWindow({
    width: winW,
    height: winH,
    x: Math.max(0, Math.round(sw - winW - 28)),
    y: Math.max(0, Math.round(sh - winH - 28)),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: false,
    title: 'Loaflings',
    backgroundColor: '#00000000',
    icon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // allow preload to require local desk modules
    },
  });

  companion.setAlwaysOnTop(true, 'floating');
  if (process.platform === 'darwin') {
    companion.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  // Sense own-window exclusion stub: desk knows its window id for later SENSE wire-up
  companion.webContents.once('did-finish-load', () => {
    const id = companion?.id;
    companion?.webContents.send('loaflings:window-id', { windowId: id });
  });

  companion.loadFile(path.join(__dirname, 'index.html'));

  companion.on('closed', () => {
    companion = null;
  });

  return companion;
}

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
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
});

/** Prefer live, fall back to fixture demo. */
ipcMain.handle('loaflings:get-day-settle', () => {
  const bundle = resolveSettleBundle();
  if (!bundle.ok) return bundle;
  return {
    ok: true,
    source: bundle.source,
    fixturePath: bundle.fixturePath,
    persistPath: bundle.persistPath,
    profile: bundle.profile,
    result: slimResult(bundle.result),
  };
});

ipcMain.handle('loaflings:get-collection', () => {
  try {
    const col = loadCollection();
    return { ok: true, path: col.path, version: col.version, items: col.items, count: col.items.length };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
});

/**
 * Settle (live→demo) and upsert into local collection.
 * Optional forceSource: 'demo' | 'live'
 */
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

    const saved = saveToCollection(bundle.result, {
      source: bundle.source,
      seedKey: bundle.profile?.seedKey,
    });
    return {
      ok: true,
      source: bundle.source,
      fixturePath: bundle.fixturePath,
      persistPath: bundle.persistPath,
      result: slimResult(bundle.result),
      entry: saved.entry,
      count: saved.count,
      collectionPath: saved.path,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
});

app.whenReady().then(() => {
  // Warm settle once at launch so failures surface early in main logs
  try {
    const bundle = getDemoBundle();
    console.log(
      '[loaflings] demo settle',
      bundle.result.genes,
      bundle.result.personality,
      bundle.result.rarity,
    );
  } catch (err) {
    console.error('[loaflings] demo settle failed', err);
  }

  try {
    const col = loadCollection();
    console.log('[loaflings] collection', col.path, 'items=', col.items.length);
  } catch (err) {
    console.warn('[loaflings] collection load', err);
  }

  createCompanionWindow();

  startLiveSense(() => Boolean(companion && companion.isFocused()))
    .then((info) => {
      console.log('[loaflings] live sense', info);
      if (companion) {
        excludeWindowIds([String(companion.id)]);
      }
    })
    .catch((err) => console.error('[loaflings] live sense failed', err));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createCompanionWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopLiveSense();
});
