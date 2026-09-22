'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  CATALOG_PERSONALITIES,
  CATALOG_RARITIES,
  buildCatalog,
} = require('../src/desk/catalog');

test('catalog covers every reachable personality and rarity combination', () => {
  const catalog = buildCatalog([]);
  assert.equal(catalog.total, CATALOG_PERSONALITIES.length * CATALOG_RARITIES.length);
  assert.equal(catalog.total, 9);
  assert.equal(catalog.collectedCount, 0);
  assert.equal(catalog.slots.every((slot) => !slot.collected && slot.count === 0), true);
  assert.equal(catalog.slots.find((slot) => slot.id === 'explorer:rare').appearance.marking, 'marking_patchy');
  assert.equal(catalog.slots.find((slot) => slot.id === 'dreamer:epic').appearance.cloudMood, 'cloud_twin');
});

test('catalog derives collected state, duplicates and dates from real collection rows', () => {
  const catalog = buildCatalog([
    { id: 'new', date: '2026-09-22', personality: 'builder', rarity: 'rare' },
    { id: 'old', date: '2026-09-20', personality: 'builder', rarity: 'rare' },
    { id: 'epic', date: '2026-09-21', personality: 'dreamer', rarity: 'epic' },
    { id: 'legacy-balanced', date: '2026-09-19', personality: 'balanced', rarity: 'common' },
    { id: 'invalid', date: '2026-09-19', personality: 'unknown', rarity: 'common' },
  ]);

  assert.equal(catalog.collectedCount, 2);
  const builderRare = catalog.slots.find((slot) => slot.id === 'builder:rare');
  assert.equal(builderRare.collected, true);
  assert.equal(builderRare.count, 2);
  assert.equal(builderRare.firstCollectedDate, '2026-09-20');
  assert.equal(builderRare.latestCollectedDate, '2026-09-22');
  assert.equal(builderRare.latestEntryId, 'new');
  assert.equal(builderRare.appearance.marking, 'marking_patchy');
});

test('pack UI exposes a dedicated catalog tab, progress and grid', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'desk', 'index.html'), 'utf8');
  for (const id of [
    'bag-tab-catalog',
    'bag-catalog',
    'catalog-progress-label',
    'catalog-progress-fill',
    'catalog-grid',
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});
