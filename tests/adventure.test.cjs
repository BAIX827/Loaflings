'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { emptyBook, observe, eventsForEgg, eventsForDate, normalizeBook } = require('../src/desk/adventureCore');
const { emptyEgg, pendingFromEgg, continueEgg, replaceEgg } = require('../src/desk/eggProgress');
const { buildMemory } = require('../src/desk/memoryCore');

function profile(date, changes = {}) {
  return {
    date, clicks: 0, keystrokes: 0, mouseTravel: 0, idleSec: 0,
    windowSwitches: 0, focusSessions: [], ...changes,
  };
}

function step(book, current, eggId, time, extra = {}) {
  return observe(book, current, {
    eggId, personality: 'builder', now: new Date(time), ...extra,
  });
}

test('four observed numeric changes produce traceable events once', () => {
  const date = '2026-09-24';
  let state = step(emptyBook(), profile(date), 'egg-a', '2026-09-24T09:00:00+10:00');
  assert.equal(state.newEvents.length, 0);
  state = step(state.book, profile(date, { idleSec: 80 }), 'egg-a', '2026-09-24T09:05:00+10:00');
  assert.equal(state.newEvents.length, 0);
  state = step(state.book, profile(date, {
    idleSec: 80, mouseTravel: 0.6, windowSwitches: 3, clicks: 1,
    focusSessions: [{ durationSec: 1550 }],
  }), 'egg-a', '2026-09-24T09:10:00+10:00');
  assert.deepEqual(state.newEvents.map((event) => event.kind), [
    'focus_end', 'idle_return', 'explore', 'window_hop',
  ]);
  assert.equal(state.newEvents[1].evidence.seconds, 80);
  const repeated = step(state.book, profile(date, {
    idleSec: 80, mouseTravel: 0.6, windowSwitches: 3, clicks: 1,
    focusSessions: [{ durationSec: 1550 }],
  }), 'egg-a', '2026-09-24T09:12:00+10:00');
  assert.equal(repeated.newEvents.length, 0);
  assert.equal(eventsForDate(repeated.book, date).length, 4);
  assert.equal(JSON.stringify(repeated.book).includes('secret typed text'), false);
  assert.ok(repeated.book.events.every((event) => event.id && event.date && event.occurredAt));
});

test('focus requires a completed single session, and cooldown limits repeats', () => {
  const date = '2026-09-24';
  let state = step(emptyBook(), profile(date), 'egg-a', '2026-09-24T09:00:00+10:00');
  state = step(state.book, profile(date, {
    focusSessions: [{ durationSec: 900 }, { durationSec: 800 }],
  }), 'egg-a', '2026-09-24T09:05:00+10:00');
  assert.equal(state.newEvents.length, 0);
  state = step(state.book, profile(date, {
    focusSessions: [{ durationSec: 900 }, { durationSec: 800 }, { durationSec: 1500 }],
  }), 'egg-a', '2026-09-24T09:10:00+10:00');
  assert.equal(state.newEvents.length, 1);
  state = step(state.book, profile(date, {
    focusSessions: [{ durationSec: 900 }, { durationSec: 800 }, { durationSec: 1500 }, { durationSec: 1700 }],
  }), 'egg-a', '2026-09-24T09:15:00+10:00');
  assert.equal(state.newEvents.length, 0);
  state = step(state.book, profile(date, {
    focusSessions: [{ durationSec: 900 }, { durationSec: 800 }, { durationSec: 1500 }, { durationSec: 1700 }, { durationSec: 1600 }],
  }), 'egg-a', '2026-09-24T10:00:00+10:00');
  assert.equal(state.newEvents.length, 1);
  state = step(state.book, profile(date, {
    focusSessions: [{ durationSec: 900 }, { durationSec: 800 }, { durationSec: 1500 }, { durationSec: 1700 }, { durationSec: 1600 }, { durationSec: 1600 }],
  }), 'egg-a', '2026-09-24T11:00:00+10:00');
  assert.equal(state.newEvents.length, 0);
});

test('continuing an egg retains old events; replacement has a distinct identity', () => {
  const oldEgg = emptyEgg('2026-09-23');
  let state = step(emptyBook(), profile('2026-09-23'), oldEgg.eggId, '2026-09-23T09:00:00+10:00');
  state = step(state.book, profile('2026-09-23', { mouseTravel: 0.7 }), oldEgg.eggId,
    '2026-09-23T10:00:00+10:00');
  const continued = continueEgg(pendingFromEgg(oldEgg, '2026-09-23'), '2026-09-24');
  assert.equal(continued.eggId, oldEgg.eggId);
  state = step(state.book, profile('2026-09-24'), continued.eggId, '2026-09-24T09:00:00+10:00');
  state = step(state.book, profile('2026-09-24', { windowSwitches: 3 }), continued.eggId,
    '2026-09-24T10:00:00+10:00');
  assert.equal(eventsForEgg(state.book, oldEgg.eggId).length, 2);
  const fresh = replaceEgg('2026-09-24', profile('2026-09-24'));
  assert.notEqual(fresh.eggId, oldEgg.eggId);
  state = step(state.book, profile('2026-09-24', { windowSwitches: 3 }), fresh.eggId,
    '2026-09-24T10:10:00+10:00');
  assert.equal(state.newEvents.length, 0);
  assert.equal(eventsForEgg(state.book, fresh.eggId).length, 0);
  assert.equal(eventsForDate(state.book, '2026-09-24').length, 1);
});

test('startup baseline does not backfill from a persisted profile', () => {
  const date = '2026-09-24';
  const book = step(emptyBook(), profile(date), 'egg-a', '2026-09-24T09:00:00+10:00').book;
  const restarted = step(normalizeBook(JSON.parse(JSON.stringify(book))), profile(date, {
    mouseTravel: 10, windowSwitches: 20, focusSessions: [{ durationSec: 2000 }],
  }), 'egg-a', '2026-09-24T10:00:00+10:00', { baselineOnly: true });
  assert.equal(restarted.newEvents.length, 0);
  assert.equal(eventsForEgg(restarted.book, 'egg-a').length, 0);
});

test('memory is bilingual, evidence based and references only its egg events', () => {
  const result = {
    personality: 'builder', energy: { work: 70, explore: 20, dream: 10 },
    traits: ['builder', 'focused'],
  };
  const memory = buildMemory(result, [{ id: 'one', kind: 'focus_end' }]);
  assert.match(memory.zh, /建造者/);
  assert.match(memory.en, /Builder/);
  assert.deepEqual(memory.eventIds, ['one']);
  assert.equal(buildMemory({ ...result, energy: null }, []), null);
});
