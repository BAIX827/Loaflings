'use strict';

/**
 * Visual smoke helper for the real Electron preload + renderer + CSS pipeline.
 * Usage: electron scripts/capture-modular-runtime.cjs <common|rare|epic> <png> [--wardrobe] [--catalog] [--stats] [--rollover] [--progress-gate] [--growth-timeline] [--history-hud] [--scale-layout]
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
const exerciseProgressGate = process.argv.includes('--progress-gate');
const exerciseGrowthTimeline = process.argv.includes('--growth-timeline');
const exerciseHistoryHud = process.argv.includes('--history-hud');
const exerciseScaleLayout = process.argv.includes('--scale-layout');
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
  const { applyWindowSettings } = require(path.join(root, 'src', 'desk', 'window'));
  const { buildCatalog } = require(path.join(root, 'src', 'desk', 'catalog'));
  const stageThresholds = [...require(path.join(root, 'src', 'desk', 'runtime', 'core.cjs')).HATCH_STAGE_THRESHOLDS];
  const collectionItems = exerciseCatalog || exerciseHistoryHud
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
    : exerciseProgressGate || exerciseHistoryHud || exerciseGrowthTimeline
      ? { ok: true, date: result.date, phase: 'egg', alreadyHatched: false, newEgg: false }
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
        stageThresholds,
        clicks: 1200,
        keystrokes: 3400,
        dailyClicks: 0,
        dailyKeystrokes: 0,
        idleMood: null,
      }
    : exerciseGrowthTimeline
      ? {
          ok: true,
          alreadySaved: false,
          canCollect: false,
          targetInputs: 29000,
          stageThresholds,
          remainingInputs: 12000,
          progress: { phase: 'newborn', stage: 3, inputs: 17000, nextStageAt: 21000 },
          clicks: 7000,
          keystrokes: 10000,
          dailyClicks: 7000,
          dailyKeystrokes: 10000,
          idleMood: null,
        }
      : exerciseProgressGate || exerciseHistoryHud
      ? {
          ok: true,
          alreadySaved: false,
          canCollect: false,
          targetInputs: 29000,
          stageThresholds,
          remainingInputs: 29000,
          progress: { phase: 'egg', inputs: 0, nextStageAt: 3000 },
          inputs: 0,
          clicks: 0,
          keystrokes: 0,
          dailyClicks: 0,
          dailyKeystrokes: 0,
          idleMood: null,
        }
      : {
        ok: true,
        alreadySaved: true,
        canCollect: true,
        targetInputs: 29000,
        stageThresholds,
        remainingInputs: 0,
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
  let win;
  ipcMain.handle('loaflings:set-settings', (_event, partial = {}) => {
    const settings = saveSettings(partial);
    if (exerciseScaleLayout) applyWindowSettings(win, settings);
    return { ok: true, settings };
  });
  reply('loaflings:get-sense-status', { ok: true, backend: 'smoke' });
  reply('loaflings:hatch-day', { ok: true });
  reply('loaflings:collect-day', { ok: true, source: 'smoke', result, count: 1 });
  reply('loaflings:quit', { ok: true });
  ipcMain.on('loaflings:set-ignore-mouse', () => {});

  win = new BrowserWindow({
    show: false,
    frame: !exerciseScaleLayout,
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
  if (
    exerciseRollover
      ? (!state.rolloverOpen || state.rolloverHits !== '4600')
      : exerciseProgressGate || exerciseHistoryHud
        ? (state.mounted || state.phase !== 'egg')
        : exerciseGrowthTimeline
          ? state.phase !== 'newborn'
        : (!state.mounted || state.layers.length < 6)
  ) {
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
  let progressGateState = null;
  if (exerciseProgressGate) {
    progressGateState = await win.webContents.executeJavaScript(`(async () => {
      const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const collect = document.getElementById('btn-collect');
      document.getElementById('btn-reveal')?.click();
      await pause(300);
      return {
        collectDisabled: collect?.disabled === true,
        progressOpen: document.getElementById('progress-panel')?.hidden === false,
        remaining: document.getElementById('progress-remaining')?.textContent || '',
        milestones: [...document.querySelectorAll('.progress-milestone')]
          .map((node) => node.dataset.state),
        gate: document.getElementById('collect-gate')?.textContent || '',
        phase: document.getElementById('stage')?.dataset.phase || '',
      };
    })()`);
    if (
      !progressGateState.collectDisabled ||
      !progressGateState.progressOpen ||
      progressGateState.milestones.join(',') !== 'current,upcoming,upcoming,upcoming,upcoming,upcoming' ||
      !progressGateState.remaining.includes('29,000') ||
      progressGateState.phase !== 'egg'
    ) {
      throw new Error(`progress gate failed: ${JSON.stringify(progressGateState)}`);
    }
  }
  let growthTimelineState = null;
  if (exerciseGrowthTimeline) {
    growthTimelineState = await win.webContents.executeJavaScript(`(async () => {
      document.getElementById('btn-reveal')?.click();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const nodes = [...document.querySelectorAll('.progress-milestone')];
      return {
        open: document.getElementById('progress-panel')?.hidden === false,
        labels: nodes.map((node) => node.querySelector('.progress-milestone-name')?.textContent),
        thresholds: nodes.map((node) => node.querySelector('.progress-milestone-count')?.textContent),
        states: nodes.map((node) => node.dataset.state),
        next: document.getElementById('progress-next')?.textContent,
        remaining: document.getElementById('progress-remaining')?.textContent,
        fill: parseFloat(document.getElementById('progress-fill')?.style.width || '0'),
      };
    })()`);
    if (
      !growthTimelineState.open ||
      growthTimelineState.labels.length !== 6 ||
      growthTimelineState.thresholds.join(',') !== '0,3,000,8,000,14,000,21,000,29,000' ||
      growthTimelineState.states.join(',') !== 'complete,complete,complete,current,upcoming,upcoming' ||
      !growthTimelineState.next.includes('4,000') ||
      growthTimelineState.fill < 68 || growthTimelineState.fill > 69
    ) {
      throw new Error(`growth timeline failed: ${JSON.stringify(growthTimelineState)}`);
    }
    win.setContentSize(260, 300);
    win.setPosition(-10000, -10000);
    win.showInactive();
  }
  let historyHudState = null;
  if (exerciseHistoryHud) {
    historyHudState = await win.webContents.executeJavaScript(`(async () => {
      const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      document.getElementById('btn-pack')?.click();
      await pause(250);
      document.getElementById('bag-tab-list')?.click();
      await pause(100);
      document.querySelector('.bag-item')?.click();
      await pause(700);
      return {
        hud: document.getElementById('hud-hits')?.textContent || '',
        hudLabelHidden: document.querySelector('.hud-label')?.hidden === true,
        hudPhaseHidden: document.getElementById('hud-phase')?.hidden === true,
        banner: document.getElementById('view-banner')?.textContent || '',
        mounted: Boolean(document.querySelector('.modular-character')),
      };
    })()`);
    if (
      historyHudState.hud !== '当前蛋：0' ||
      !historyHudState.hudLabelHidden ||
      !historyHudState.hudPhaseHidden ||
      !historyHudState.mounted
    ) {
      throw new Error(`history HUD failed: ${JSON.stringify(historyHudState)}`);
    }
  }
  let wardrobeState = null;
  if (exerciseWardrobe) {
    wardrobeState = await win.webContents.executeJavaScript(`(async () => {
      const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      document.getElementById('btn-wardrobe')?.click();
      const hat = document.getElementById('wardrobe-headwear');
      const glasses = document.getElementById('wardrobe-facewear');
      const outfit = document.getElementById('wardrobe-outfit');
      hat.querySelector('[data-id="hat_knit_blue"]')?.click();
      await pause(180);
      glasses.querySelector('[data-id="glasses_round_cocoa"]')?.click();
      await pause(180);
      outfit.querySelector('[data-id="outfit_vest_sage"]')?.click();
      await pause(350);
      const root = document.querySelector('.modular-character');
      return {
        panelOpen: document.getElementById('wardrobe')?.hidden === false,
        optionCounts: [hat, glasses, outfit].map((grid) => grid.querySelectorAll('.wardrobe-card').length),
        previewCounts: [hat, glasses, outfit].map((grid) => grid.querySelectorAll('.wardrobe-preview img').length),
        previewsLoaded: [...document.querySelectorAll('.wardrobe-preview img')]
          .every((img) => img.complete && img.naturalWidth > 0),
        selected: [hat, glasses, outfit].map((grid) => grid.querySelector('[aria-pressed="true"]')?.dataset.id),
        recipe: root?.dataset.recipe || '',
        layers: [...document.querySelectorAll('.modular-character .character-layer')]
          .map((node) => node.dataset.layer),
      };
    })()`);
    const expected = ['hat_knit_blue', 'glasses_round_cocoa', 'outfit_vest_sage'];
    if (
      !wardrobeState.panelOpen ||
      wardrobeState.optionCounts.join(',') !== '5,3,4' ||
      wardrobeState.previewCounts.join(',') !== '4,2,3' ||
      !wardrobeState.previewsLoaded ||
      wardrobeState.selected.join(',') !== expected.join(',') ||
      expected.some((id) => !wardrobeState.recipe.includes(id))
    ) {
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
  if (exerciseWardrobe) {
    win.setContentSize(260, 300);
    win.setPosition(-10000, -10000);
    win.showInactive();
    await win.webContents.executeJavaScript(`document.getElementById('btn-wardrobe')?.click()`);
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  let scaleLayoutState = null;
  if (exerciseScaleLayout) {
    win.setPosition(-10000, -10000);
    win.showInactive();
    await win.webContents.executeJavaScript(`document.getElementById('btn-settings')?.click()`);
    await new Promise((resolve) => setTimeout(resolve, 150));
    const setScale = async (value) => {
      await win.webContents.executeJavaScript(`(() => {
        const slider = document.getElementById('set-scale');
        slider.value = '${value}';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      })()`);
      await new Promise((resolve) => setTimeout(resolve, 400));
      return win.webContents.executeJavaScript(`(() => {
        const panel = document.getElementById('settings').getBoundingClientRect();
        const art = document.getElementById('pet').getBoundingClientRect();
        return { windowWidth: innerWidth, windowHeight: innerHeight,
          panelWidth: panel.width, panelHeight: panel.height, artWidth: art.width };
      })()`);
    };
    const smallLayout = { ...await setScale(0.6), contentSize: win.getContentSize() };
    const largeLayout = { ...await setScale(1.6), contentSize: win.getContentSize() };
    scaleLayoutState = { small: smallLayout, large: largeLayout };
    const { small, large } = scaleLayoutState;
    if (
      small.contentSize[0] < 260 || small.contentSize[1] < 300 ||
      large.contentSize[0] - small.contentSize[0] !== 156 ||
      large.contentSize[1] - small.contentSize[1] !== 180 ||
      Math.abs(small.panelWidth - large.panelWidth) > 1 ||
      Math.abs(small.panelHeight - large.panelHeight) > 1 ||
      Math.abs(small.artWidth - 120) > 1 ||
      Math.abs(large.artWidth - 320) > 1
    ) {
      throw new Error(`scale changed the controls layout: ${JSON.stringify(scaleLayoutState)}`);
    }
    await win.loadFile(indexPath);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    scaleLayoutState.persistedArtWidth = await win.webContents.executeJavaScript(
      `document.getElementById('pet').getBoundingClientRect().width`,
    );
    if (Math.abs(scaleLayoutState.persistedArtWidth - 320) > 1) {
      throw new Error(`saved scale did not restore: ${JSON.stringify(scaleLayoutState)}`);
    }
    await win.webContents.executeJavaScript(`document.getElementById('btn-settings')?.click()`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  win.webContents.invalidate();
  await new Promise((resolve) => setTimeout(resolve, 500));
  const image = await win.webContents.capturePage();
  if (exerciseCatalog) win.hide();
  require('fs').writeFileSync(outputPath, image.toPNG());
  process.stdout.write(`${JSON.stringify({ variant, outputPath, ...state, wardrobeState, catalogState, statsState, rolloverState, progressGateState, growthTimelineState, historyHudState, scaleLayoutState })}\n`);
  win.destroy();
  app.quit();
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
