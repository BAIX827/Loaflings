'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');

test('adventure ledger persists evidence and restart does not backfill or duplicate it', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'loaflings-adventure-'));
  const originalLoad = Module._load;
  Module._load = function mockedElectron(request, parent, isMain) {
    if (request === 'electron') return { app: { getPath: () => directory } };
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    const file = require.resolve('../src/desk/adventureStore');
    let store = require(file);
    const baseline = {
      date: '2026-09-24', clicks: 0, keystrokes: 0, mouseTravel: 0,
      idleSec: 0, windowSwitches: 0, focusSessions: [],
      typedText: 'private content must never be stored',
    };
    const opts = { force: true, now: new Date('2026-09-24T09:00:00+10:00') };
    assert.deepEqual(store.observeAdventureProfile(baseline, 'egg-a', 'builder', opts), []);
    const completed = {
      ...baseline, focusSessions: [{ durationSec: 1600 }],
    };
    const awarded = store.observeAdventureProfile(completed, 'egg-a', 'builder', {
      force: true, now: new Date('2026-09-24T09:30:00+10:00'),
    });
    assert.equal(awarded.length, 1);
    assert.equal(awarded[0].kind, 'focus_end');
    const disk = fs.readFileSync(store.adventurePath(), 'utf8');
    assert.equal(disk.includes('private content'), false);
    assert.equal(store.getEggAdventures('egg-a').length, 1);

    delete require.cache[file];
    store = require(file);
    assert.deepEqual(store.observeAdventureProfile(completed, 'egg-a', 'builder', {
      force: true, now: new Date('2026-09-24T09:31:00+10:00'),
    }), []);
    assert.equal(store.getAdventureTimeline('2026-09-24', 'egg-a').todayEvents.length, 1);
  } finally {
    Module._load = originalLoad;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
