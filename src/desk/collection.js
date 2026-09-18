/**
 * Local daily Loafling collection — JSON under Electron userData.
 * Desk only stores settleDay() output; no gene/sense formulas here.
 */
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const FILE_NAME = 'collection.json';

function collectionPath() {
  return path.join(app.getPath('userData'), FILE_NAME);
}

/**
 * @returns {{ version: number, items: object[] }}
 */
function emptyCollection() {
  return { version: 1, items: [] };
}

/**
 * @returns {{ version: number, items: object[], path: string }}
 */
function loadCollection() {
  const fp = collectionPath();
  try {
    if (!fs.existsSync(fp)) {
      return { ...emptyCollection(), path: fp };
    }
    const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const items = Array.isArray(raw?.items) ? raw.items : [];
    return {
      version: typeof raw?.version === 'number' ? raw.version : 1,
      items,
      path: fp,
    };
  } catch {
    return { ...emptyCollection(), path: fp };
  }
}

/**
 * Build a collection row from a DaylingResult (+ source meta).
 * Name/type are display aliases of CORE personality (CORE has no separate name field).
 * @param {object} result settleDay() result
 * @param {{ source?: string, seedKey?: string }} [meta]
 */
function entryFromSettle(result, meta = {}) {
  const date = result?.date || 'unknown';
  const personality = result?.personality || 'balanced';
  const rarity = result?.rarity || 'common';
  const seedKey = meta.seedKey || 'local';
  return {
    id: `${date}:${seedKey}`,
    savedAt: new Date().toISOString(),
    source: meta.source || 'demo',
    date,
    kind: result?.kind || 'loafling',
    /** Display name — CORE has no name; use personality + rarity label. */
    name: `${personality} · ${rarity}`,
    /** Type alias for personality (builder / explorer / dreamer / balanced). */
    type: personality,
    personality,
    rarity,
    style: result?.style || null,
    genes: result?.genes || {},
    traits: Array.isArray(result?.traits) ? result.traits : [],
    events: Array.isArray(result?.events) ? result.events : [],
    energy: result?.energy || null,
  };
}

/**
 * Upsert by id (one entry per date+seedKey). Returns saved entry + list size.
 * @param {object} result
 * @param {{ source?: string, seedKey?: string }} [meta]
 */
function saveToCollection(result, meta = {}) {
  const fp = collectionPath();
  const col = loadCollection();
  const entry = entryFromSettle(result, meta);
  const idx = col.items.findIndex((it) => it.id === entry.id);
  if (idx >= 0) {
    col.items[idx] = entry;
  } else {
    col.items.push(entry);
  }
  // Newest first for UI
  col.items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(
    fp,
    JSON.stringify({ version: col.version, items: col.items }, null, 2),
    'utf8',
  );
  return { entry, count: col.items.length, path: fp };
}

module.exports = {
  collectionPath,
  loadCollection,
  saveToCollection,
  entryFromSettle,
  FILE_NAME,
};
