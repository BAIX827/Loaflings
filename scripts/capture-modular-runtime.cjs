'use strict';

/**
 * Visual smoke helper for the real Electron preload + renderer + CSS pipeline.
 * Usage: electron scripts/capture-modular-runtime.cjs <common|rare|epic> <png>
 */
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

const variant = ['common', 'rare', 'epic'].includes(process.argv[2])
  ? process.argv[2]
  : 'common';
const outputPath = path.resolve(process.argv[3] || `modular-runtime-${variant}.png`);
const root = path.join(__dirname, '..');

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
  reply('loaflings:get-day-state', {
    ok: true, date: result.date, phase: 'hatched', alreadyHatched: true, newEgg: false,
  });
  reply('loaflings:get-day-settle', { ok: true, source: 'smoke', result });
  reply('loaflings:get-demo-settle', { ok: true, source: 'smoke', result });
  reply('loaflings:get-live-settle', { ok: true, source: 'smoke', result });
  reply('loaflings:get-collection', { ok: true, version: 2, items: [], count: 0 });
  reply('loaflings:get-hatch-progress', {
    ok: true,
    alreadySaved: true,
    progress: { phase: 'adult', inputs: 30000, nextStageAt: null },
    inputs: 30000,
    clicks: 12000,
    keystrokes: 18000,
    idleMood: { allowIdle: false },
  });
  reply('loaflings:get-settings', {
    ok: true,
    settings: {
      locale: 'zh', opacity: 1, scale: 1, lockPosition: false,
      showChrome: false, showHud: false,
    },
  });
  reply('loaflings:set-settings', { ok: true });
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
    };
  })()`);
  if (!state.mounted || state.layers.length < 6) {
    throw new Error(`modular renderer did not mount: ${JSON.stringify(state)}`);
  }
  const image = await win.webContents.capturePage();
  require('fs').writeFileSync(outputPath, image.toPNG());
  process.stdout.write(`${JSON.stringify({ variant, outputPath, ...state })}\n`);
  win.destroy();
  app.quit();
}).catch((err) => {
  console.error(err);
  app.exit(1);
});
