'use strict';

// Isolated Electron smoke for the real preload, renderer, V2 panels and moment cue.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow, ipcMain } = require('electron');

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'loaflings-v2-smoke-'));
const outputPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.setPath('userData', userData);

const date = new Date();
const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const event = {
  id: 'smoke-event', date: localDate, occurredAt: new Date().toISOString(),
  kind: 'focus_end', eggId: 'smoke-egg', personality: 'builder',
  evidence: { seconds: 1500 },
};
const memory = {
  version: 1, zh: '工作能量最明显。它记得一段专注时光。',
  en: 'Work energy was strongest. It remembers a focus stretch.',
  eventIds: [event.id],
};
const historicalMemory = {
  version: 1, zh: '旧日收藏的固定记忆。',
  en: 'A saved memory from an earlier day.', eventIds: [event.id],
};
const manifest = require('../character/modular/manifest.json');
const result = {
  date: localDate, kind: 'loafling', personality: 'builder', rarity: 'common',
  style: 'style_common', energy: { work: 50, explore: 10, dream: 5 },
  genes: { body: 'body_base', cloud: 'cloud_base', face: 'face_base', tail: 'tail_base' },
  appearance: manifest.defaultRecipe, traits: ['builder', 'focused'], events: [],
};
const settings = {
  locale: 'zh', opacity: 1, scale: 1, lockPosition: false,
  showChrome: true, showHud: true, hatchTarget: 20000,
  wardrobe: { headwear: 'none', facewear: 'none', outfit: 'none' },
};
let adult = false;
function reply(name, handler) { ipcMain.handle(`loaflings:${name}`, handler); }
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.whenReady().then(async () => {
  ipcMain.on('loaflings:set-ignore-mouse', () => {});
  reply('get-settings', () => ({ ok: true, settings }));
  reply('set-settings', (_e, partial) => ({ ok: true, settings: Object.assign(settings, partial) }));
  reply('get-sense-status', () => ({ ok: true, backend: 'uiohook-napi' }));
  reply('get-day-state', () => ({
    ok: true, date: localDate, phase: adult ? 'hatched' : 'egg', alreadyHatched: adult,
    newEgg: false, choiceRequired: false,
  }));
  reply('get-hatch-progress', () => ({
    ok: true, source: 'idle', alreadySaved: adult, canCollect: adult,
    targetInputs: 20000, remainingInputs: adult ? 0 : 20000,
    stageThresholds: [0, 2069, 5517, 9655, 14483, 20000],
    choiceRequired: false, day: { date: localDate, egg: { eggId: 'smoke-egg' } },
    progress: { phase: adult ? 'adult' : 'egg', inputs: adult ? 20000 : 0 },
    clicks: adult ? 20000 : 0, keystrokes: 0,
    dailyClicks: adult ? 20000 : 0, dailyKeystrokes: 0,
  }));
  reply('get-day-settle', () => ({ ok: true, source: 'live', result, memory }));
  reply('get-collection', () => ({
    ok: true,
    items: adult ? [{
      ...result, id: `${localDate}:smoke`, name: 'builder · common',
      source: 'live', memory: historicalMemory,
    }] : [],
    count: adult ? 1 : 0,
  }));
  reply('get-catalog', () => ({ ok: true, slots: [], total: 9, collectedCount: 0 }));
  reply('get-activity-stats', () => ({ ok: true, totals: {}, trackedDays: 0 }));
  reply('get-coin-wallet', () => ({
    ok: true, balance: 0, todayEarned: 0, dailyLimit: 30,
    todayRewards: {}, entries: [],
  }));
  reply('get-adventures', () => ({
    ok: true, date: localDate, todayEvents: [event], eggEvents: [event], history: [event],
  }));

  const win = new BrowserWindow({
    width: 260, height: 300, show: false, frame: false, transparent: true,
    webPreferences: {
      preload: path.join(__dirname, '../src/desk/preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: false,
    },
  });
  win.setPosition(-10000, -10000);
  await win.loadFile(path.join(__dirname, '../src/desk/index.html'));
  win.showInactive();
  await pause(850);
  const guide = await win.webContents.executeJavaScript(`({
    open: !document.getElementById('guide').hidden,
    steps: document.querySelectorAll('#guide-steps li').length,
    text: document.getElementById('guide-steps').textContent,
  })`);
  if (!guide.open || guide.steps !== 6 || !guide.text.includes('奇遇')) {
    throw new Error(`first-run guide failed: ${JSON.stringify(guide)}`);
  }
  await win.webContents.executeJavaScript(`document.getElementById('btn-guide-ok')?.click()`);
  const progress = await win.webContents.executeJavaScript(`(async () => {
    document.getElementById('btn-reveal').click();
    await new Promise((resolve) => setTimeout(resolve, 250));
    return {
      open: !document.getElementById('progress-panel').hidden,
      moments: document.querySelectorAll('#progress-moments .moment-row').length,
      text: document.getElementById('progress-moments').textContent,
    };
  })()`);
  if (!progress.open || progress.moments !== 1 || !progress.text.includes('专注')) {
    throw new Error(`today timeline failed: ${JSON.stringify(progress)}`);
  }
  const history = await win.webContents.executeJavaScript(`(async () => {
    document.getElementById('btn-pack').click();
    await new Promise((resolve) => setTimeout(resolve, 200));
    document.getElementById('bag-tab-moments').click();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      open: !document.getElementById('bag-moments').hidden,
      rows: document.querySelectorAll('#moments-history .moment-row').length,
    };
  })()`);
  if (!history.open || history.rows !== 1) throw new Error(`history failed: ${JSON.stringify(history)}`);
  await win.webContents.executeJavaScript(`document.getElementById('btn-close-bag').click()`);
  win.webContents.send('loaflings:adventure-events', [event]);
  await pause(150);
  const cue = await win.webContents.executeJavaScript(`({
    visible: !document.getElementById('moment-bubble').hidden,
    pointerEvents: getComputedStyle(document.getElementById('moment-bubble')).pointerEvents,
    overlays: ['panel', 'progress-panel', 'bag', 'wardrobe', 'guide', 'settings']
      .filter((id) => !document.getElementById(id).hidden),
  })`);
  if (!cue.visible || cue.pointerEvents !== 'none') throw new Error(`moment cue failed: ${JSON.stringify(cue)}`);

  adult = true;
  await win.reload();
  await pause(900);
  const adultPanel = await win.webContents.executeJavaScript(`(async () => {
    document.getElementById('btn-reveal').click();
    await new Promise((resolve) => setTimeout(resolve, 250));
    return {
      open: !document.getElementById('panel').hidden,
      memory: document.getElementById('memory-copy').textContent,
      moments: document.querySelectorAll('#panel-moments .moment-row').length,
      width: innerWidth,
    };
  })()`);
  if (!adultPanel.open || !adultPanel.memory.includes('工作能量') || adultPanel.width !== 260) {
    throw new Error(`hatch memory failed: ${JSON.stringify(adultPanel)}`);
  }
  const english = await win.webContents.executeJavaScript(`(async () => {
    document.getElementById('btn-close-panel').click();
    document.getElementById('btn-settings').click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    const locale = document.getElementById('set-locale');
    locale.value = 'en';
    locale.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 150));
    document.getElementById('btn-show-guide').click();
    const guideText = document.getElementById('guide-steps').textContent;
    document.getElementById('btn-guide-ok').click();
    document.getElementById('btn-reveal').click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { guideText, memory: document.getElementById('memory-copy').textContent };
  })()`);
  if (!english.guideText.includes('moments') || !english.memory.includes('Work energy')) {
    throw new Error(`English guide or memory failed: ${JSON.stringify(english)}`);
  }
  const historical = await win.webContents.executeJavaScript(`(async () => {
    document.getElementById('btn-close-panel').click();
    document.getElementById('btn-pack').click();
    await new Promise((resolve) => setTimeout(resolve, 200));
    document.getElementById('bag-tab-list').click();
    document.querySelector('#bag-list .bag-item').click();
    await new Promise((resolve) => setTimeout(resolve, 250));
    document.getElementById('btn-reveal').click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    return document.getElementById('memory-copy').textContent;
  })()`);
  if (historical !== historicalMemory.en) {
    throw new Error(`historical memory failed: ${historical}`);
  }
  if (outputPath) {
    const capture = await win.webContents.capturePage();
    fs.writeFileSync(outputPath, capture.toPNG());
  }
  process.stdout.write(`${JSON.stringify({ guide, progress, history, cue, adultPanel, english, historical })}\n`);
  win.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
