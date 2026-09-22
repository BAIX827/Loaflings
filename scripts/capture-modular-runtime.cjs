'use strict';

/**
 * Visual smoke helper for the real Electron preload + renderer + CSS pipeline.
 * Usage: electron scripts/capture-modular-runtime.cjs <common|rare|epic> <png> [--wardrobe] [--catalog] [--stats] [--rollover]
 */
const path = require('path');
const os = require('os');
const { app, BrowserWindow, ipcMain } = require('electron');

const variant = ['common', 'rare', 'epic'].includes(process.argv[2])
  ? process.argv[2]
  : 'common';
const outputPath = path.resolve(process.argv[3] || `modular-runtime-${variant}.png`);
const exerciseWardrobe = process.argv.includes('--wardrobe');
const exerciseCatalog = process.argv.includes('--catalog');
const exerciseStats = process.argv.includes('--stats');
const exerciseRollover = process.argv.includes('--rollover');
const root = path.join(__dirname, '..');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('no-sandbox');
app.setPath('userData', path.join(os.tmpdir(), `loaflings-render-smoke-${process.pid}`));

const appearances = {
  common: {
    body: 'body_classic', marking: 'none', expression: 'expr_focused',
    cloudMood: 'cloud_focused', headwear: 'none', facewear: 'none', outfit: 'none',
  },
  rare: {
    body: 'body_chubby', marking: 'marking_patchy', expression: 'expr_curious',
    cloudMood: 'cloud_curious', headwear: 'none', facewear: 'none', outfit: 'none',
  },
  epic: {
    body: 'body_long', marking: 'none', expression: 'expr_happy',
    cloudMood: 'cloud_twin', headwear: 'none', facewear: 'none', outfit: 'none',
  },
};

const result = {
  date: '2026-09-21',
  kind: 'loafling',
  energy: { work: 45, explore: 28, dream: 52 },
  genes: { body: 'body_base', cloud: 'cloud_base', face: 'face_base', tail: 'tail_base' },
  personality: variant === 'common' ? 'builder' : variant === 'rare' ? 'explorer' : 'dreamer',
  rarity: variant,
  style: `style_${variant}`,
  appearance: appearances[variant],
  traits: [variant],
  events: [{ kind: 'none', note: 'Renderer smoke.' }],
};

function reply(channel, value) {
  ipcMain.handle(channel, () => value);
}

app.whenReady().then(async () => {
  const { loadSettings, saveSettings } = require(path.join(root, 'src', 'desk', 'settings'));
  const { buildCatalog } = require(path.join(root, 'src', 'desk', 'catalog'));
  const collectionItems = exerciseCatalog
    ? [
      {
        id: 'builder-common', date: '2026-09-18', personality: 'builder', rarity: 'common',
        name: 'builder · common', appearance: appearances.common,
      },
      {
        id: 'explorer-rare', date: '2026-09-20', personality: 'explorer', rarity: 'rare',
        name: 'explorer · rare', appearance: appearances.rare,
      },
      {
        id: 'dreamer-epic', date: '2026-09-21', personality: 'dreamer', rarity: 'epic',
        name: 'dreamer · epic', appearance: appearances.epic,
      },
    ]
    : [];
  saveSettings({
    locale: 'zh', opacity: 1, scale: 1, lockPosition: false,
    showChrome: false, showHud: false,
    wardrobe: { headwear: 'none', facewear: 'none', outfit: 'none' },
  });
  let rolloverPending = exerciseRollover;
  ipcMain.handle('loaflings:get-day-state', () => rolloverPending
    ? {
        ok: true,
        date: '2026-09-22',
        phase: 'growing',
        alreadyHatched: false,
        choiceRequired: true,
        pendingRollover: { fromDate: '2026-09-21', clicks: 1200, keystrokes: 3400 },
      }
    : {
        ok: true, date: result.date, phase: 'hatched', alreadyHatched: true, newEgg: false,
      });
  reply('loaflings:get-day-settle', { ok: true, source: 'smoke', result });
  reply('loaflings:get-demo-settle', { ok: true, source: 'smoke', result });
  reply('loaflings:get-live-settle', { ok: true, source: 'smoke', result });
  reply('loaflings:get-collection', {
    ok: true, version: 2, items: collectionItems, count: collectionItems.length,
  });
  reply('loaflings:get-catalog', { ok: true, ...buildCatalog(collectionItems) });
  reply('loaflings:get-activity-stats', {
    ok: true,
    totals: {
      activityHits: 54321, clicks: 12345, keystrokes: 41976, mouseTravel: 2345.6,
      activeSec: 10800, focusSec: 7200, focusSessions: 8, idleSec: 3600, windowSwitches: 42,
    },
    trackedDays: 3,
  });
  ipcMain.handle('loaflings:get-hatch-progress', () => rolloverPending
    ? {
        ok: true,
        alreadySaved: false,
        choiceRequired: true,
        day: { pendingRollover: { clicks: 1200, keystrokes: 3400 } },
        progress: { phase: 'cracking', inputs: 4600, nextStageAt: 8000 },
        clicks: 1200,
        keystrokes: 3400,
        dailyClicks: 0,
        dailyKeystrokes: 0,
        idleMood: null,
      }
    : {
        ok: true,
        alreadySaved: true,
        progress: { phase: 'adult', inputs: 30000, nextStageAt: null },
        inputs: 30000,
        clicks: 12000,
        keystrokes: 18000,
        dailyClicks: 12000,
        dailyKeystrokes: 18000,
        idleMood: { allowIdle: false },
      });
  ipcMain.handle('loaflings:resolve-egg-rollover', (_event, action) => {
    rolloverPending = false;
    return {
      ok: true,
      action,
      day: {
        date: '2026-09-22', phase: action === 'continue' ? 'growing' : 'egg',
        egg: action === 'continue' ? { clicks: 1200, keystrokes: 3400 } : { clicks: 0, keystrokes: 0 },
      },
    };
  });
  ipcMain.handle('loaflings:get-settings', () => ({ ok: true, settings: loadSettings() }));
  ipcMain.handle('loaflings:set-settings', (_event, partial = {}) => {
    return { ok: true, settings: saveSettings(partial) };
  });
  reply('loaflings:get-sense-status', { ok: true, backend: 'smoke' });
  reply('loaflings:hatch-day', { ok: true });
  reply('loaflings:collect-day', { ok: true, source: 'smoke', result, count: 1 });
  reply('loaflings:quit', { ok: true });
  ipcMain.on('loaflings:set-ignore-mouse', () => {});

  const win = new BrowserWindow({
    show: false,
    width: 480,
    height: 360,
    backgroundColor: '#f7f2ec',
    webPreferences: {
      preload: path.join(root, 'src', 'desk', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  win.webContents.on('console-message', (_event, _level, message) => {
    process.stderr.write(`[renderer] ${message}\n`);
  });
  const indexPath = path.join(root, 'src', 'desk', 'index.html');
  await win.loadFile(indexPath);
  await win.webContents.executeJavaScript(
    `localStorage.setItem('loaflings.guide.v2.done', '1')`,
  );
  await win.loadFile(indexPath);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const state = await win.webContents.executeJavaScript(`(() => {
    for (const id of ['guide', 'panel', 'bag', 'settings']) {
      const node = document.getElementById(id);
      if (node) node.hidden = true;
    }
    for (const selector of ['.hud', '.chrome', '.chrome-peek', '.view-banner']) {
      const node = document.querySelector(selector);
      if (node) node.style.display = 'none';
    }
    const root = document.querySelector('.modular-character');
    return {
      mounted: Boolean(root),
      recipe: root?.dataset.recipe || '',
      hasBridge: Boolean(window.loaflings?.parts?.modular?.manifest),
      phase: document.getElementById('stage')?.dataset.phase || '',
      petHtml: document.getElementById('pet')?.innerHTML.slice(0, 500) || '',
      layers: [...document.querySelectorAll('.modular-character .character-layer')]
        .map((node) => node.dataset.layer),
      rolloverOpen: document.getElementById('egg-rollover')?.hidden === false,
      rolloverHits: document.getElementById('rollover-hits')?.textContent || '',
    };
  })()`);
  if (exerciseRollover ? (!state.rolloverOpen || state.rolloverHits !== '4600') : (!state.mounted || state.layers.length < 6)) {
    throw new Error(`modular renderer did not mount: ${JSON.stringify(state)}`);
  }
  let rolloverState = null;
  if (exerciseRollover) {
    rolloverState = await win.webContents.executeJavaScript(`(async () => {
      const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      document.getElementById('btn-continue-egg')?.click();
      await pause(800);
      return {
        closed: document.getElementById('egg-rollover')?.hidden === true,
        hits: document.getElementById('hud-hits')?.textContent || '',
      };
    })()`);
    if (!rolloverState.closed) throw new Error(`rollover choice did not close: ${JSON.stringify(rolloverState)}`);
  }
  let wardrobeState = null;
  if (exerciseWardrobe) {
    wardrobeState = await win.webContents.executeJavaScript(`(async () => {
      const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      document.getElementById('btn-wardrobe')?.click();
      const hat = document.getElementById('wardrobe-headwear');
      const glasses = document.getElementById('wardrobe-facewear');
      const outfit = document.getElementById('wardrobe-outfit');
      hat.value = 'hat_knit_blue';
      hat.dispatchEvent(new Event('change', { bubbles: true }));
      await pause(180);
      glasses.value = 'glasses_round_cocoa';
      glasses.dispatchEvent(new Event('change', { bubbles: true }));
      await pause(180);
      outfit.value = 'outfit_vest_sage';
      outfit.dispatchEvent(new Event('change', { bubbles: true }));
      await pause(350);
      const root = document.querySelector('.modular-character');
      return {
        panelOpen: document.getElementById('wardrobe')?.hidden === false,
        optionCounts: [hat.options.length, glasses.options.length, outfit.options.length],
        recipe: root?.dataset.recipe || '',
        layers: [...document.querySelectorAll('.modular-character .character-layer')]
          .map((node) => node.dataset.layer),
      };
    })()`);
    const expected = ['hat_knit_blue', 'glasses_round_cocoa', 'outfit_vest_sage'];
    if (!wardrobeState.panelOpen || expected.some((id) => !wardrobeState.recipe.includes(id))) {
      throw new Error(`wardrobe renderer did not update: ${JSON.stringify(wardrobeState)}`);
    }
    await win.loadFile(indexPath);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const persistedState = await win.webContents.executeJavaScript(`(() => {
      const root = document.querySelector('.modular-character');
      return {
        recipe: root?.dataset.recipe || '',
        layers: [...document.querySelectorAll('.modular-character .character-layer')]
          .map((node) => node.dataset.layer),
      };
    })()`);
    wardrobeState.persistedRecipe = persistedState.recipe;
    wardrobeState.persistedLayers = persistedState.layers;
    if (expected.some((id) => !persistedState.recipe.includes(id))) {
      throw new Error(`wardrobe settings did not survive reload: ${JSON.stringify(persistedState)}`);
    }
  }
  let catalogState = null;
  if (exerciseCatalog) {
    // Hidden Chromium windows may not composite dynamic scroll panels on
    // Windows. Paint this smoke window well off-screen while exercising it.
    win.setPosition(-10000, -10000);
    win.showInactive();
    await new Promise((resolve) => setTimeout(resolve, 200));
    catalogState = await win.webContents.executeJavaScript(`(async () => {
      const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      document.getElementById('btn-pack')?.click();
      await pause(250);
      document.getElementById('bag-tab-catalog')?.click();
      await pause(900);
      return {
        panelOpen: document.getElementById('bag')?.hidden === false,
        catalogOpen: document.getElementById('bag-catalog')?.hidden === false,
        progress: document.getElementById('catalog-progress-label')?.textContent || '',
        cards: document.querySelectorAll('.catalog-card').length,
        collected: document.querySelectorAll('.catalog-card.is-collected').length,
        missing: document.querySelectorAll('.catalog-card.is-missing').length,
        characterLayers: document.querySelectorAll('.catalog-card .character-layer').length,
      };
    })()`);
    if (
      !catalogState.panelOpen ||
      !catalogState.catalogOpen ||
      catalogState.cards !== 9 ||
      catalogState.collected !== 3 ||
      catalogState.missing !== 6 ||
      catalogState.characterLayers < 54
    ) {
      throw new Error(`catalog renderer did not mount: ${JSON.stringify(catalogState)}`);
    }
  }
  let statsState = null;
  if (exerciseStats) {
    win.setPosition(-10000, -10000);
    win.showInactive();
    statsState = await win.webContents.executeJavaScript(`(async () => {
      const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      document.getElementById('btn-pack')?.click();
      await pause(250);
      document.getElementById('bag-tab-stats')?.click();
      await pause(300);
      return {
        panelOpen: document.getElementById('bag')?.hidden === false,
        statsOpen: document.getElementById('bag-stats')?.hidden === false,
        activityHits: document.getElementById('stats-activity-hits')?.textContent || '',
        windowSwitches: document.getElementById('stats-window-switches')?.textContent || '',
      };
    })()`);
    if (!statsState.panelOpen || !statsState.statsOpen || !statsState.activityHits.includes('54')) {
      throw new Error(`statistics renderer did not mount: ${JSON.stringify(statsState)}`);
    }
  }
  win.webContents.invalidate();
  await new Promise((resolve) => setTimeout(resolve, 500));
  const image = await win.webContents.capturePage();
  if (exerciseCatalog) win.hide();
  require('fs').writeFileSync(outputPath, image.toPNG());
  process.stdout.write(`${JSON.stringify({ variant, outputPath, ...state, wardrobeState, catalogState, statsState, rolloverState })}\n`);
  win.destroy();
  app.quit();
}).catch((err) => {
  console.error(err);
  app.exit(1);
});
