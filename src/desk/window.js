/**
 * Companion BrowserWindow — frameless, transparent, with configurable layer.
 * Inspired by desktop-pet shells (e.g. BongoCat-mac overlay window): keep
 * window chrome thin; game logic stays out of this file.
 */
const { BrowserWindow, nativeImage, screen, app } = require('electron');
const path = require('path');
const { execFile } = require('node:child_process');
const { loadSettings, saveSettings } = require('./settings');
const { createWanderController } = require('./windowMotion');

const ROOT = path.join(__dirname, '../..');
const ICON_PATH = path.join(ROOT, 'src/art/AppIcon.png');
const BASE_W = 260;
const BASE_H = 300;

/** @type {BrowserWindow | null} */
let companion = null;
const restoredPosition = new WeakSet();
const movementControllers = new WeakMap();
const movementModes = new WeakMap();
const layerModes = new WeakMap();
const positionTimers = new WeakMap();

function getCompanion() {
  return companion;
}

function savePositionNow(win) {
  if (!win || win.isDestroyed()) return;
  const [x, y] = win.getPosition();
  saveSettings({ position: { x, y } });
}

function clearPositionTimer(win) {
  const timer = positionTimers.get(win);
  if (timer) clearTimeout(timer);
  positionTimers.delete(win);
}

function nativeHandle(win) {
  const buffer = win.getNativeWindowHandle();
  return buffer.length >= 8 ? buffer.readBigInt64LE(0).toString()
    : String(buffer.readUInt32LE(0));
}

function lowerWindow(win) {
  if (process.platform !== 'win32' || !win || win.isDestroyed()) return Promise.resolve(false);
  // Electron exposes topmost but not HWND_BOTTOM. Keep the desktop mode behind
  // ordinary windows without parenting into Explorer's private shell windows.
  const code = `Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class LoaflingsLayer { [DllImport("user32.dll", SetLastError=true)] public static extern bool SetWindowPos(IntPtr hwnd, IntPtr after, int x, int y, int width, int height, uint flags); }'; if (-not [LoaflingsLayer]::SetWindowPos([IntPtr]([long]${nativeHandle(win)}), [IntPtr]1, 0, 0, 0, 0, 0x13)) { exit 1 }`;
  const encoded = Buffer.from(code, 'utf16le').toString('base64');
  return new Promise((resolve) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-EncodedCommand', encoded],
      { windowsHide: true, timeout: 8000 }, (error) => {
        if (error) console.warn('[loaflings] desktop layer', error.message);
        resolve(!error);
      });
  });
}

function applyLayerMode(win, mode) {
  if (layerModes.get(win) === mode) return;
  layerModes.set(win, mode);
  if (mode === 'top') win.setAlwaysOnTop(true, 'floating');
  else {
    win.setAlwaysOnTop(false);
    if (!win.isFocused()) void lowerWindow(win);
  }
}

function applyMovementMode(win, mode) {
  if (movementModes.get(win) === mode) return;
  movementControllers.get(win)?.stop();
  clearPositionTimer(win);
  savePositionNow(win);
  movementModes.set(win, mode);
  win.setMovable(mode === 'manual');
  if (mode !== 'wander') return;
  const controller = createWanderController(
    win,
    (bounds) => screen.getDisplayMatching(bounds).workArea,
    () => savePositionNow(win),
  );
  movementControllers.set(win, controller);
  controller.start();
}

function applyWindowSettings(win, settings) {
  if (!win || win.isDestroyed()) return;
  const s = settings || loadSettings();
  win.setOpacity(s.opacity);
  // Keep enough room for the controls when the character is scaled down.
  const windowScale = Math.max(1, s.scale);
  const width = Math.round(BASE_W * windowScale);
  const height = Math.round(BASE_H * windowScale);
  const [currentWidth, currentHeight] = win.getContentSize();
  if (currentWidth !== width || currentHeight !== height) win.setContentSize(width, height);
  if (!restoredPosition.has(win) && s.position && typeof s.position.x === 'number') {
    win.setPosition(Math.round(s.position.x), Math.round(s.position.y));
  }
  restoredPosition.add(win);
  applyLayerMode(win, s.layerMode);
  applyMovementMode(win, s.movementMode);
}

function rememberPosition(win) {
  if (!win || win.isDestroyed()) return;
  if (movementModes.get(win) !== 'manual') return;
  clearPositionTimer(win);
  positionTimers.set(win, setTimeout(() => {
    positionTimers.delete(win);
    savePositionNow(win);
  }, 350));
}

function createCompanionWindow() {
  const initialSettings = loadSettings();
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
    alwaysOnTop: initialSettings.layerMode === 'top',
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

  if (initialSettings.layerMode === 'top') companion.setAlwaysOnTop(true, 'floating');
  // Pass clicks through empty/transparent areas (renderer toggles per pixel).
  companion.setIgnoreMouseEvents(true, { forward: true });
  if (process.platform === 'darwin') {
    companion.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  companion.webContents.once('did-finish-load', () => {
    companion?.webContents.send('loaflings:window-id', { windowId: companion?.id });
  });

  applyWindowSettings(companion, initialSettings);
  companion.on('moved', () => rememberPosition(companion));
  companion.on('focus', () => movementControllers.get(companion)?.pause());
  companion.on('blur', () => {
    movementControllers.get(companion)?.resume();
    if (layerModes.get(companion) === 'desktop') void lowerWindow(companion);
  });
  companion.on('close', () => {
    if (positionTimers.has(companion)) {
      clearPositionTimer(companion);
      savePositionNow(companion);
    }
    movementControllers.get(companion)?.stop();
  });
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
  lowerWindow,
  ICON_PATH,
  ROOT,
};
