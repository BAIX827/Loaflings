'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  emptyEgg,
  freezeEgg,
  pendingFromEgg,
  continueEgg,
  replaceEgg,
  effectiveEggCounts,
} = require('../src/desk/eggProgress');

test('continuing an unfinished egg inherits old clicks and keystrokes', () => {
  const old = emptyEgg('2026-09-21');
  const frozen = freezeEgg(old, {
    date: '2026-09-21',
    clicks: 1200,
    keystrokes: 3400,
  });
  const pending = pendingFromEgg(frozen, '2026-09-21');
  const continued = continueEgg(pending, '2026-09-22');

  assert.deepEqual(
    effectiveEggCounts(continued, {
      date: '2026-09-22',
      clicks: 25,
      keystrokes: 75,
    }),
    { clicks: 1225, keystrokes: 3475 },
  );
  assert.equal(continued.startedDate, '2026-09-21');
});

test('replacing an egg starts at zero without counting activity before the choice', () => {
  const replacement = replaceEgg('2026-09-22', {
    date: '2026-09-22',
    clicks: 80,
    keystrokes: 120,
  });
  assert.deepEqual(
    effectiveEggCounts(replacement, {
      date: '2026-09-22',
      clicks: 80,
      keystrokes: 120,
    }),
    { clicks: 0, keystrokes: 0 },
  );
  assert.deepEqual(
    effectiveEggCounts(replacement, {
      date: '2026-09-22',
      clicks: 83,
      keystrokes: 127,
    }),
    { clicks: 3, keystrokes: 7 },
  );
});
