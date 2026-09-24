'use strict';

const { randomUUID } = require('node:crypto');
const EGG_STATE_VERSION = 2;

function count(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function profileCounts(profile) {
  return {
    clicks: count(profile?.clicks),
    keystrokes: count(profile?.keystrokes),
  };
}

function emptyEgg(date, profile = null) {
  const baseline = profileCounts(profile);
  return {
    eggId: randomUUID(),
    startedDate: date,
    carryClicks: 0,
    carryKeystrokes: 0,
    baselineDate: date,
    baselineClicks: baseline.clicks,
    baselineKeystrokes: baseline.keystrokes,
    clicks: 0,
    keystrokes: 0,
  };
}

function normalizeEgg(raw, fallbackDate) {
  const egg = raw && typeof raw === 'object' ? raw : {};
  return {
    eggId: typeof egg.eggId === 'string' && egg.eggId ? egg.eggId : `legacy:${egg.startedDate || fallbackDate}`,
    startedDate: typeof egg.startedDate === 'string' ? egg.startedDate : fallbackDate,
    carryClicks: count(egg.carryClicks),
    carryKeystrokes: count(egg.carryKeystrokes),
    baselineDate: typeof egg.baselineDate === 'string' ? egg.baselineDate : fallbackDate,
    baselineClicks: count(egg.baselineClicks),
    baselineKeystrokes: count(egg.baselineKeystrokes),
    clicks: count(egg.clicks),
    keystrokes: count(egg.keystrokes),
  };
}

function effectiveEggCounts(egg, profile) {
  const normalized = normalizeEgg(egg, profile?.date || egg?.startedDate || '');
  if (!profile || profile.date !== normalized.baselineDate) {
    return { clicks: normalized.clicks, keystrokes: normalized.keystrokes };
  }
  const current = profileCounts(profile);
  return {
    clicks: normalized.carryClicks + Math.max(0, current.clicks - normalized.baselineClicks),
    keystrokes:
      normalized.carryKeystrokes +
      Math.max(0, current.keystrokes - normalized.baselineKeystrokes),
  };
}

function freezeEgg(egg, profile) {
  const normalized = normalizeEgg(egg, profile?.date || egg?.startedDate || '');
  const effective = effectiveEggCounts(normalized, profile);
  return { ...normalized, ...effective };
}

function pendingFromEgg(egg, fromDate) {
  const normalized = normalizeEgg(egg, fromDate);
  return {
    eggId: normalized.eggId,
    fromDate,
    startedDate: normalized.startedDate || fromDate,
    clicks: normalized.clicks,
    keystrokes: normalized.keystrokes,
  };
}

function continueEgg(pending, today) {
  const previous = pending && typeof pending === 'object' ? pending : {};
  return {
    eggId: previous.eggId || `legacy:${previous.startedDate || previous.fromDate || today}`,
    startedDate: previous.startedDate || previous.fromDate || today,
    carryClicks: count(previous.clicks),
    carryKeystrokes: count(previous.keystrokes),
    baselineDate: today,
    baselineClicks: 0,
    baselineKeystrokes: 0,
    clicks: count(previous.clicks),
    keystrokes: count(previous.keystrokes),
  };
}

function replaceEgg(today, profile) {
  return emptyEgg(today, profile);
}

module.exports = {
  EGG_STATE_VERSION,
  profileCounts,
  emptyEgg,
  normalizeEgg,
  effectiveEggCounts,
  freezeEgg,
  pendingFromEgg,
  continueEgg,
  replaceEgg,
};
