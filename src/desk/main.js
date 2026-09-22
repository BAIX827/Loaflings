/**
 * Loaflings / 摸鱼灵 — Electron companion entry (DAY-DESK).
 * Window → window.js · IPC → ipc.js · settle wire → settleBridge.js
 */
const { app, BrowserWindow } = require('electron');
const {
  startLiveSense,
  stopLiveSense,
  excludeWindowIds,
  onSenseCounts,
} = require('./hooks/senseLive');
const { getApiSource } = require('./hooks/coreDayCycle');
const { getDemoBundle, syncDayBoundary } = require('./settleBridge');
const { createCompanionWindow, getCompanion } = require('./window');
const { registerIpc } = require('./ipc');

registerIpc();

app.whenReady().then(() => {
  try {
    const bundle = getDemoBundle();
    console.log(
      '[loaflings] demo hatch',
      getApiSource(),
      bundle.result.kind || 'loafling',
      bundle.result.genes,
      bundle.result.personality,
      bundle.result.rarity,
    );
  } catch (err) {
    console.error('[loaflings] demo settle failed', err);
  }

  createCompanionWindow();

  const win = getCompanion();

  onSenseCounts((payload) => {
    const companion = getCompanion();
    if (companion && !companion.isDestroyed()) {
      companion.webContents.send('loaflings:sense-counts', payload);
    }
  });

  startLiveSense(() => false)
    .then((info) => {
      console.log('[loaflings] live sense', info);
      if (win && !win.isDestroyed() && win.id != null) {
        excludeWindowIds?.([win.id]);
      }
    })
    .catch((err) => console.error('[loaflings] live sense failed', err));

  setInterval(() => {
    try {
      const day = syncDayBoundary();
      const companion = getCompanion();
      if (day.dayChanged && companion && !companion.isDestroyed()) {
        console.log('[loaflings] day boundary', day.date, day.choiceRequired ? 'choice' : 'new-egg');
        companion.webContents.send('loaflings:day-state', day);
      }
    } catch (err) {
      console.warn('[loaflings] day poll', err);
    }
  }, 60_000);

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
