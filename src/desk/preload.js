/**
 * Preload bridge: MVP parts + day egg/hatch + settle + collection IPC.
 */
const { contextBridge, ipcRenderer } = require('electron');
const {
  MVP_PART_FIELDS,
  MVP_BASE_PARTS,
  MVP_ASSEMBLY_ORDER,
  CHARACTER_ASSETS,
} = require('./mvpParts');

contextBridge.exposeInMainWorld('loaflings', {
  product: {
    name: 'Loaflings',
    nameZh: '摸鱼灵',
  },
  parts: {
    fields: MVP_PART_FIELDS,
    base: MVP_BASE_PARTS,
    order: MVP_ASSEMBLY_ORDER,
    assets: CHARACTER_ASSETS,
  },
  /**
   * Loads src/sense/fixtures/demo-day.json → assertProfileShape → settleDay().
   * @returns {Promise<object>}
   */
  getDemoSettle() {
    return ipcRenderer.invoke('loaflings:get-demo-settle');
  },
  getLiveProfile() {
    return ipcRenderer.invoke('loaflings:get-live-profile');
  },
  getLiveSettle() {
    return ipcRenderer.invoke('loaflings:get-live-settle');
  },
  /** Prefer live settle when available; else fixture demo. */
  getDaySettle() {
    return ipcRenderer.invoke('loaflings:get-day-settle');
  },
  getCollection() {
    return ipcRenderer.invoke('loaflings:get-collection');
  },
  /**
   * Settle (live→demo by default) and upsert into userData/collection.json.
   * @param {{ forceSource?: 'demo'|'live' }} [opts]
   */
  collectDay(opts) {
    return ipcRenderer.invoke('loaflings:collect-day', opts || {});
  },
  /** Egg / hatched phase for the local calendar day (rolls with ensureToday). */
  getDayState() {
    return ipcRenderer.invoke('loaflings:get-day-state');
  },
  /** Persist UI hatched phase after Day reveal (CORE hatchDay runs in main via collect/settle). */
  markDayHatched() {
    return ipcRenderer.invoke('loaflings:hatch-day');
  },
  onCompanionWindowId(cb) {
    ipcRenderer.on('loaflings:window-id', (_e, payload) => cb(payload));
  },
  onDayState(cb) {
    ipcRenderer.on('loaflings:day-state', (_e, payload) => cb(payload));
  },
  getSenseStatus() {
    return ipcRenderer.invoke('loaflings:get-sense-status');
  },
  openAccessibilitySettings() {
    return ipcRenderer.invoke('loaflings:open-accessibility');
  },
});
