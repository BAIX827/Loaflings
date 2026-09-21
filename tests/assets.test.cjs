'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  HATCH_PHASE_ASSETS,
  QUALITY_STYLE_FILES,
} = require('../src/desk/mvpParts');

const root = path.join(__dirname, '..');
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function inspectPng(repoPath) {
  const bytes = fs.readFileSync(path.join(root, repoPath));
  assert.deepEqual(bytes.subarray(0, 8), PNG_SIGNATURE, `${repoPath} is not PNG`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
  };
}

test('every hatch phase maps to an RGBA runtime PNG', () => {
  assert.deepEqual(Object.keys(HATCH_PHASE_ASSETS), [
    'egg',
    'cracking',
    'hatching',
    'newborn',
    'growing',
    'adult',
  ]);
  for (const repoPath of Object.values(HATCH_PHASE_ASSETS)) {
    const png = inspectPng(repoPath);
    assert.ok(png.width > 0 && png.height > 0);
    assert.equal(png.colorType, 6, `${repoPath} must have RGBA alpha`);
  }
});

test('every rarity has a transparent runtime PNG', () => {
  assert.deepEqual(Object.keys(QUALITY_STYLE_FILES), ['common', 'rare', 'epic']);
  for (const baseName of Object.values(QUALITY_STYLE_FILES)) {
    const png = inspectPng(`character/png/${baseName}.png`);
    assert.equal(png.colorType, 6, `${baseName}.png must have RGBA alpha`);
  }
});

test('first character expansion review masters are transparent PNGs', () => {
  const reviewMasters = [
    'character/png/expressions/expr_happy.png',
    'character/png/expressions/expr_sleepy.png',
    'character/png/expressions/expr_curious.png',
    'character/png/accessories/hat_knit_blue.png',
    'character/png/accessories/outfit_vest_sage.png',
  ];

  for (const repoPath of reviewMasters) {
    const png = inspectPng(repoPath);
    assert.equal(png.width, 1594, `${repoPath} must match the adult master width`);
    assert.ok(png.height === 986 || png.height === 987);
    assert.equal(png.colorType, 6, `${repoPath} must have RGBA alpha`);
  }
});
