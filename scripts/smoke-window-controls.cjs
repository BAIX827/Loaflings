'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'loaflings-window-smoke-'));
app.setPath('userData', userData);

app.whenReady().then(async () => {
  const { loadSettings, saveSettings } = require('../src/desk/settings');
  const { applyWindowSettings, lowerWindow } = require('../src/desk/window');
  try {
    assert.equal(saveSettings({ lockPosition: true }).movementMode, 'fixed');
    assert.equal(loadSettings().lockPosition, true);
    const saved = saveSettings({ movementMode: 'wander', layerMode: 'desktop' });
    assert.equal(saved.lockPosition, false);
    assert.equal(loadSettings().layerMode, 'desktop');

    const win = new BrowserWindow({ width: 260, height: 300, show: false });
    applyWindowSettings(win, { ...saved, movementMode: 'fixed', layerMode: 'top' });
    assert.equal(win.isMovable(), false);
    assert.equal(win.isAlwaysOnTop(), true);

    applyWindowSettings(win, { ...saved, movementMode: 'manual', layerMode: 'desktop' });
    assert.equal(win.isMovable(), true);
    assert.equal(win.isAlwaysOnTop(), false);
    if (process.platform === 'win32') assert.equal(await lowerWindow(win), true);
    win.destroy();
    console.log('window controls smoke passed');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    process.exit(process.exitCode || 0);
  }
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
