'use strict';

// Capture a composer recipe with the same Electron image renderer as the desktop app.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

const template = process.argv[2];
const output = process.argv[3];
const stageOnly = process.argv.includes('--stage-only');
const small = process.argv.includes('--small');
const manifest = require('../character/modular/manifest.json');
const wearableGroups = { headwear: 'headwear', facewear: 'facewear', outfit: 'outfits' };
const wearables = {};
for (const arg of process.argv.slice(4)) {
  const match = /^--(headwear|facewear|outfit)=([a-z0-9_]+)$/.exec(arg);
  if (!match) continue;
  const [, slot, id] = match;
  if (!Object.hasOwn(manifest[wearableGroups[slot]], id)) throw new Error(`Unknown ${slot}: ${id}`);
  wearables[slot] = id;
}
const templateNames = [...manifest.templates.basic, ...manifest.templates.mutations, ...manifest.templates.roles]
  .map((source) => path.basename(source, '.json'));

if (!templateNames.includes(template) || !output) {
  throw new Error(`Usage: electron scripts/capture-modular-preview.cjs <${templateNames.join('|')}> <output.png>`);
}

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.setPath('userData', path.join(os.tmpdir(), `loaflings-preview-${process.pid}`));

app.whenReady().then(async () => {
  const window = new BrowserWindow({ width: 1440, height: 1050, show: false, webPreferences: { sandbox: true } });
  await window.loadFile(path.join(__dirname, '..', 'character', 'modular', 'preview.html'), {
    query: { template },
  });
  await window.webContents.executeJavaScript(`new Promise((resolve) => {
    const ready = () => document.getElementById('recipe').textContent
      ? resolve() : requestAnimationFrame(ready);
    ready();
  })`);
  if (Object.keys(wearables).length) {
    await window.webContents.executeJavaScript(`(() => {
      for (const [slot, id] of Object.entries(${JSON.stringify(wearables)})) {
        const control = document.getElementById(slot);
        control.value = id;
        control.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    const selected = await window.webContents.executeJavaScript(`Object.fromEntries(['headwear', 'facewear', 'outfit'].map((slot) => [slot, document.getElementById(slot).value]))`);
    for (const [slot, id] of Object.entries(wearables)) {
      if (selected[slot] !== id) throw new Error(`Preview did not select ${slot}: ${id}`);
    }
  }
  if (small) await window.webContents.executeJavaScript(`document.getElementById('stage').style.width = '260px'`);
  await window.webContents.executeJavaScript(`Promise.all([...document.querySelectorAll('.stage img:not([hidden])')].map((img) => img.decode()))`);
  await window.webContents.executeJavaScript(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
  const bounds = stageOnly
    ? await window.webContents.executeJavaScript(`(() => {
        const { x, y, width, height } = document.getElementById('stage').getBoundingClientRect();
        return { x: Math.floor(x), y: Math.floor(y), width: Math.floor(width), height: Math.floor(height) };
      })()`)
    : undefined;
  const image = await window.webContents.capturePage(bounds);
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  fs.writeFileSync(output, image.toPNG());
  window.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
