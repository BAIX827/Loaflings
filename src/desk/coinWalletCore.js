'use strict';

const REWARDS = Object.freeze({ collection: 20, active: 5, focus: 5 });
const DAILY_LIMIT = 30;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function emptyWallet() {
  return { version: 1, entries: [] };
}

function normalizeWallet(raw) {
  const entries = [];
  const seen = new Set();
  for (const entry of Array.isArray(raw?.entries) ? raw.entries : []) {
    if (!DATE_PATTERN.test(entry?.date || '') || !Object.hasOwn(REWARDS, entry?.kind)) continue;
    const id = `${entry.date}:${entry.kind}`;
    if (seen.has(id)) continue;
    seen.add(id);
    entries.push({
      id,
      date: entry.date,
      kind: entry.kind,
      amount: REWARDS[entry.kind],
      earnedAt: typeof entry.earnedAt === 'string' ? entry.earnedAt : '',
    });
  }
  return { version: 1, entries };
}

function award(raw, date, kind, earnedAt = new Date().toISOString()) {
  const wallet = normalizeWallet(raw);
  if (!DATE_PATTERN.test(date || '') || !Object.hasOwn(REWARDS, kind)) {
    return { wallet, earned: null };
  }
  const id = `${date}:${kind}`;
  const todayTotal = wallet.entries
    .filter((entry) => entry.date === date)
    .reduce((sum, entry) => sum + entry.amount, 0);
  if (wallet.entries.some((entry) => entry.id === id) || todayTotal + REWARDS[kind] > DAILY_LIMIT) {
    return { wallet, earned: null };
  }
  const earned = { id, date, kind, amount: REWARDS[kind], earnedAt };
  wallet.entries.push(earned);
  return { wallet, earned };
}

function observeProfile(raw, profile, earnedAt = new Date().toISOString()) {
  let wallet = normalizeWallet(raw);
  const earned = [];
  if (!DATE_PATTERN.test(profile?.date || '')) return { wallet, earned };
  const active = Number(profile.activeSec) || 0;
  const focused = Array.isArray(profile.focusSessions) && profile.focusSessions
    .some((session) => (Number(session?.durationSec) || 0) >= 1500);
  for (const [kind, ready] of [['active', active >= 1800], ['focus', focused]]) {
    if (!ready) continue;
    const result = award(wallet, profile.date, kind, earnedAt);
    wallet = result.wallet;
    if (result.earned) earned.push(result.earned);
  }
  return { wallet, earned };
}

function walletView(raw, today) {
  const wallet = normalizeWallet(raw);
  const todayEntries = wallet.entries.filter((entry) => entry.date === today);
  return {
    balance: wallet.entries.reduce((sum, entry) => sum + entry.amount, 0),
    todayEarned: todayEntries.reduce((sum, entry) => sum + entry.amount, 0),
    dailyLimit: DAILY_LIMIT,
    todayRewards: Object.fromEntries(Object.keys(REWARDS)
      .map((kind) => [kind, todayEntries.some((entry) => entry.kind === kind)])),
    entries: [...wallet.entries].reverse(),
  };
}

function collectionRewardEligible(source) {
  return source === 'live';
}

module.exports = {
  REWARDS, DAILY_LIMIT, emptyWallet, normalizeWallet, award, observeProfile, walletView,
  collectionRewardEligible,
};
