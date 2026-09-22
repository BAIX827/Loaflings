'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { emptyWallet, award, observeProfile, walletView, collectionRewardEligible } = require('../src/desk/coinWalletCore');

const DATE = '2026-09-23';

test('activity and one continuous focus session each pay once at their thresholds', () => {
  let wallet = emptyWallet();
  let result = observeProfile(wallet, {
    date: DATE, activeSec: 1799,
    focusSessions: [{ durationSec: 900 }, { durationSec: 600 }],
  });
  assert.equal(result.earned.length, 0);

  result = observeProfile(result.wallet, {
    date: DATE, activeSec: 1800,
    focusSessions: [{ durationSec: 1499 }],
  });
  assert.deepEqual(result.earned.map((entry) => entry.kind), ['active']);
  wallet = result.wallet;

  result = observeProfile(wallet, {
    date: DATE, activeSec: 3600,
    focusSessions: [{ durationSec: 1500 }],
  });
  assert.deepEqual(result.earned.map((entry) => entry.kind), ['focus']);
  assert.equal(walletView(result.wallet, DATE).balance, 10);
  assert.equal(observeProfile(result.wallet, {
    date: DATE, activeSec: 3600, focusSessions: [{ durationSec: 1500 }],
  }).earned.length, 0);
});

test('first collection pays 20; duplicate rewards cannot exceed 30 per day', () => {
  const first = award(emptyWallet(), DATE, 'collection');
  assert.equal(first.earned?.amount, 20);
  assert.equal(award(first.wallet, DATE, 'collection').earned, null);
  const activity = observeProfile(first.wallet, {
    date: DATE, activeSec: 1800, focusSessions: [{ durationSec: 1500 }],
  });
  const view = walletView(activity.wallet, DATE);
  assert.equal(view.balance, 30);
  assert.equal(view.todayEarned, 30);
  assert.equal(view.dailyLimit, 30);
  assert.deepEqual(view.todayRewards, { collection: true, active: true, focus: true });
});

test('a new local date can earn again while wallet balance remains cumulative', () => {
  const first = award(emptyWallet(), DATE, 'collection').wallet;
  const next = award(first, '2026-09-24', 'collection').wallet;
  assert.equal(walletView(next, '2026-09-24').balance, 40);
  assert.equal(walletView(next, '2026-09-24').todayEarned, 20);
  assert.equal(walletView(next, DATE).todayEarned, 20);
});

test('malformed records and duplicate ids do not mint extra coins', () => {
  const bad = {
    entries: [
      { date: DATE, kind: 'collection', amount: 9999 },
      { date: DATE, kind: 'collection', amount: 20 },
      { date: DATE, kind: 'unknown', amount: 100 },
    ],
  };
  assert.equal(walletView(bad, DATE).balance, 20);
  assert.equal(award(bad, DATE, 'collection').earned, null);
  assert.equal(award(bad, 'invalid', 'active').earned, null);
});

test('only a real live collection is eligible for the collection reward', () => {
  assert.equal(collectionRewardEligible('live'), true);
  assert.equal(collectionRewardEligible('demo'), false);
  assert.equal(collectionRewardEligible('smoke'), false);
  assert.equal(collectionRewardEligible(undefined), false);
});
