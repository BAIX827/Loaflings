'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/desk/runtime/core.cjs');
const { slimResult } = require('../src/desk/resultView');

function profile(overrides = {}) {
  return {
    date: '2026-09-21',
    seedKey: 'test-install',
    keystrokes: 0,
    clicks: 0,
    mouseTravel: 0,
    idleSec: 0,
    activeSec: 0,
    focusSessions: [],
    windowSwitches: 0,
    activeHours: Array(24).fill(0),
    ...overrides,
  };
}

test('six hatch thresholds use combined clicks and keystrokes', () => {
  const cases = [
    [0, 'egg'],
    [2999, 'egg'],
    [3000, 'cracking'],
    [7999, 'cracking'],
    [8000, 'hatching'],
    [14000, 'newborn'],
    [21000, 'growing'],
    [29000, 'adult'],
  ];

  for (const [hits, phase] of cases) {
    const clicks = Math.floor(hits / 3);
    const keystrokes = hits - clicks;
    assert.equal(
      core.hatchProgressFromProfile(profile({ clicks, keystrokes }), false).phase,
      phase,
    );
  }
});

test('coarse day phase agrees with keyboard-only adult progress', () => {
  const keyboardDay = profile({ keystrokes: 29000, activeSec: 1 });
  assert.equal(core.hatchProgressFromProfile(keyboardDay, false).phase, 'adult');
  assert.equal(core.phaseFromProfile(keyboardDay, false), 'hatched');
});

test('saved state never promotes a zero-activity egg to adult', () => {
  const zero = profile();
  assert.equal(core.hatchProgressFromProfile(zero, true).phase, 'egg');
  assert.equal(core.phaseFromProfile(zero, true), 'egg');
});

test('settlement is deterministic and emits a supported style', () => {
  const day = profile({
    keystrokes: 8400,
    clicks: 1600,
    mouseTravel: 9.4,
    idleSec: 3600,
    activeSec: 7200,
    focusSessions: [{ durationSec: 2700 }],
    windowSwitches: 32,
  });
  const first = core.settleDay(day);
  const second = core.settleDay(day);
  assert.deepEqual(first, second);
  assert.ok(['common', 'rare', 'epic'].includes(first.rarity));
  assert.equal(first.style, `style_${first.rarity}`);
  assert.deepEqual(Object.keys(first.genes).sort(), ['body', 'cloud', 'face', 'tail']);
  assert.deepEqual(Object.keys(first.appearance).sort(), [
    'body',
    'cloudMood',
    'expression',
    'facewear',
    'headwear',
    'marking',
    'outfit',
  ]);
});

test('renderer projection keeps the style field', () => {
  const result = core.settleDay(profile());
  assert.equal(slimResult(result).style, result.style);
  assert.deepEqual(slimResult(result).appearance, result.appearance);
});

test('appearance maps personality and rarity without changing gene fields', () => {
  const energy = { work: 10, explore: 10, dream: 50 };
  const rareDreamer = core.resolveAppearance(energy, 'dreamer', 'rare');
  assert.equal(rareDreamer.body, 'body_long');
  assert.equal(rareDreamer.expression, 'expr_sleepy');
  assert.equal(rareDreamer.cloudMood, 'cloud_dreamy');
  assert.equal(rareDreamer.marking, 'marking_patchy');

  const epicExplorer = core.resolveAppearance(energy, 'explorer', 'epic');
  assert.equal(epicExplorer.body, 'body_chubby');
  assert.equal(epicExplorer.cloudMood, 'cloud_twin');
  assert.equal(epicExplorer.marking, 'none');
});
