/**
 * Companion BrowserWindow — frameless, always-on-top, transparent.
 * Inspired by desktop-pet shells (e.g. BongoCat-mac overlay window): keep
 * window chrome thin; game logic stays out of this file.
 */
const { BrowserWindow, nativeImage, screen, app } = require('electron');
const path = require('path');
const { loadSettings, saveSettings } = require('./settings');

const ROOT = path.join(__dirname, '../..');
const ICON_PATH = path.join(ROOT, 'src/art/AppIcon.png');
const BASE_W = 260;
const BASE_H = 300;

/** @type {BrowserWindow | null} */
let companion = null;

function getCompanion() {
  return companion;
}

function applyWindowSettings(win, settings) {
  if (!win || win.isDestroyed()) return;
  const s = settings || loadSettings();
  win.setOpacity(s.opacity);
  win.setContentSize(Math.round(BASE_W * s.scale), Math.round(BASE_H * s.scale));
  win.setMovable(!s.lockPosition);
  if (s.position && typeof s.position.x === 'number') {
    win.setPosition(Math.round(s.position.x), Math.round(s.position.y));
  }
}

function rememberPosition(win) {
  if (!win || win.isDestroyed()) return;
  const s = loadSettings();
  if (s.lockPosition) return;
  const [x, y] = win.getPosition();
  saveSettings({ position: { x, y } });
}

function createCompanionWindow() {
  const icon = nativeImage.createFromPath(ICON_PATH);
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon);
  }

  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const winW = 300;
  const winH = 320;

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
      sandbox: false,
    },
  });

  companion.setAlwaysOnTop(true, 'floating');
  // Pass clicks through empty/transparent areas (renderer toggles per pixel).
  companion.setIgnoreMouseEvents(true, { forward: true });
  if (process.platform === 'darwin') {
    companion.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  companion.webContents.once('did-finish-load', () => {
    companion?.webContents.send('loaflings:window-id', { windowId: companion?.id });
  });

  applyWindowSettings(companion, loadSettings());
  companion.on('moved', () => rememberPosition(companion));
  companion.loadFile(path.join(__dirname, 'index.html'));
  companion.on('closed', () => {
    companion = null;
  });

  return companion;
}

module.exports = {
  getCompanion,
  createCompanionWindow,
  applyWindowSettings,
  rememberPosition,
  ICON_PATH,
  ROOT,
};
