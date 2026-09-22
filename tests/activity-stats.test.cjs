'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { emptyStats, observeProfile, statsView } = require('../src/desk/activityStatsCore');

function profile(date, overrides = {}) {
  return {
    date,
    clicks: 0,
    keystrokes: 0,
    mouseTravel: 0,
    activeSec: 0,
    idleSec: 0,
    focusSessions: [],
    windowSwitches: 0,
    ...overrides,
  };
}

test('all-time statistics add only positive per-day deltas', () => {
  let state = emptyStats();
  state = observeProfile(state, profile('2026-09-21', {
    clicks: 10,
    keystrokes: 20,
    mouseTravel: 12.5,
    activeSec: 90,
    focusSessions: [{ durationSec: 60 }],
    windowSwitches: 2,
  })).stats;
  state = observeProfile(state, profile('2026-09-21', {
    clicks: 15,
    keystrokes: 28,
    mouseTravel: 14,
    activeSec: 120,
    focusSessions: [{ durationSec: 60 }, { durationSec: 30 }],
    windowSwitches: 3,
  })).stats;
  state = observeProfile(state, profile('2026-09-22', {
    clicks: 4,
    keystrokes: 6,
  })).stats;

  const view = statsView(state);
  assert.equal(view.totals.clicks, 19);
  assert.equal(view.totals.keystrokes, 34);
  assert.equal(view.totals.activityHits, 53);
  assert.equal(view.totals.focusSec, 90);
  assert.equal(view.totals.focusSessions, 2);
  assert.equal(view.trackedDays, 2);
});

test('observing the same snapshot twice does not double count', () => {
  const sample = profile('2026-09-22', { clicks: 12, keystrokes: 18 });
  const first = observeProfile(emptyStats(), sample);
  const second = observeProfile(first.stats, sample);
  assert.equal(first.changed, true);
  assert.equal(second.changed, false);
  assert.equal(statsView(second.stats).totals.activityHits, 30);
});

test('desktop UI exposes rollover choices and cumulative statistics', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const html = fs.readFileSync(path.join(__dirname, '../src/desk/index.html'), 'utf8');
  for (const id of [
    'egg-rollover',
    'btn-continue-egg',
    'btn-new-egg',
    'bag-tab-stats',
    'stats-activity-hits',
    'stats-window-switches',
    'progress-panel',
    'progress-remaining',
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /id=["']btn-collect["'][^>]*disabled/);
});
