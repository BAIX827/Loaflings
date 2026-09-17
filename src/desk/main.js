/**
 * Loaflings / 摸鱼灵 — Electron companion shell (DAY-DESK)
 * Always-on-top, frameless, transparent window. Shows base pet + demo settle.
 */
const { app, BrowserWindow, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const { runDemoSettle } = require('./pipeline');

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

function createCompanionWindow() {
  const icon = nativeImage.createFromPath(ICON_PATH);
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon);
  }

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const winW = 320;
  const winH = 300;

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

ipcMain.handle('loaflings:get-demo-settle', () => {
  try {
    const { profile, result, fixturePath } = getDemoBundle();
    return {
      ok: true,
      fixturePath,
      profile,
      result: {
        date: result.date,
        energy: result.energy,
        genes: result.genes,
        personality: result.personality,
        rarity: result.rarity,
        traits: result.traits,
        events: result.events,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
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

  createCompanionWindow();

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
