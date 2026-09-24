'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { VARIANTS, buildCatalog, variantIdFromAppearance } = require('../src/desk/catalog');
const { labelId } = require('../src/desk/i18n');

test('catalog has five basic and five hatchable mutation recipes', () => {
  const catalog = buildCatalog([]);
  assert.equal(catalog.total, 10);
  assert.equal(VARIANTS.filter((item) => item.rarity === 'common').length, 5);
  assert.equal(VARIANTS.filter((item) => item.rarity === 'rare').length, 4);
  assert.equal(VARIANTS.filter((item) => item.rarity === 'epic').length, 1);
  assert.equal(catalog.collectedCount, 0);
  assert.equal(catalog.slots.every((slot) => !slot.collected && slot.count === 0), true);
  for (const slot of catalog.slots) {
    assert.equal(variantIdFromAppearance(slot.appearance), slot.id);
    assert.notEqual(labelId('zh', 'catalog', slot.id), slot.id);
    assert.notEqual(labelId('en', 'catalog', slot.id), slot.id);
  }
});

test('catalog classifies old and new collected appearances without changing snapshots', () => {
  const catalog = buildCatalog([
    { id: 'new', date: '2026-09-22', personality: 'builder', rarity: 'rare', appearance: {
      body: 'body_pointy_strawberry', marking: 'marking_dapple', expression: 'expr_curious',
      cloudMood: 'cloud_strawberry', headwear: 'none', facewear: 'none', outfit: 'none',
    } },
    { id: 'old', date: '2026-09-20', personality: 'builder', rarity: 'rare' },
    { id: 'epic', date: '2026-09-21', personality: 'dreamer', rarity: 'epic' },
  ]);
  assert.equal(catalog.collectedCount, 3);
  assert.equal(catalog.slots.find((slot) => slot.id === 'mutation_dapple').latestEntryId, 'new');
  assert.equal(catalog.slots.find((slot) => slot.id === 'mutation_patchy').latestEntryId, 'old');
  assert.equal(catalog.slots.find((slot) => slot.id === 'mutation_twin_cloud').latestEntryId, 'epic');
});

test('pack UI exposes a dedicated catalog and wardrobe category tabs', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'desk', 'index.html'), 'utf8');
  for (const id of [
    'bag-tab-catalog', 'bag-catalog', 'catalog-progress-label', 'catalog-grid',
    'wardrobe-tab-headwear', 'wardrobe-tab-facewear', 'wardrobe-tab-outfit',
  ]) assert.match(html, new RegExp(`id="${id}"`));
});
