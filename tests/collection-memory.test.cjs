'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');

test('collection keeps the first memory snapshot on repeated Save and reads legacy rows', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'loaflings-memory-'));
  const originalLoad = Module._load;
  Module._load = function mockedElectron(request, parent, isMain) {
    if (request === 'electron') return { app: { getPath: () => directory } };
    return originalLoad.call(this, request, parent, isMain);
  };
  let collection;
  try {
    collection = require('../src/desk/collection');
  } finally {
    Module._load = originalLoad;
  }
  const result = {
    date: '2026-09-24', personality: 'builder', rarity: 'common',
    kind: 'loafling', traits: ['builder'], energy: { work: 10, explore: 2, dream: 1 },
  };
  const firstMemory = { version: 1, zh: '首次记忆', en: 'First memory', eventIds: ['event-1'] };
  const laterMemory = { version: 1, zh: '后来改写', en: 'Rewritten', eventIds: ['event-2'] };
  try {
    collection.saveToCollection(result, { source: 'live', seedKey: 'install-a', memory: firstMemory });
    collection.saveToCollection(result, { source: 'live', seedKey: 'install-a', memory: laterMemory });
    const saved = collection.loadCollection();
    assert.equal(saved.items.length, 1);
    assert.deepEqual(saved.items[0].memory, firstMemory);
    assert.equal(saved.items[0].nameZh, '建造者 · 普通');
    assert.equal(saved.items[0].nameEn, 'Builder · Common');
    assert.equal(saved.version, 3);

    const legacy = { version: 2, items: [{ ...saved.items[0], id: 'older', memory: undefined }] };
    fs.writeFileSync(collection.collectionPath(), JSON.stringify(legacy), 'utf8');
    const loaded = collection.loadCollection();
    assert.equal(loaded.items[0].memory, undefined);
    assert.equal(loaded.version, 3);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
