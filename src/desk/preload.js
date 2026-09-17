/**
 * Preload bridge: MVP parts + SENSE/CORE demo settle IPC.
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
  onCompanionWindowId(cb) {
    ipcRenderer.on('loaflings:window-id', (_e, payload) => cb(payload));
  },
});
