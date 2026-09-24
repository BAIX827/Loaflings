'use strict';

const path = require('node:path');
const { app } = require('electron');
const { readJsonFile, writeJsonAtomic } = require('../shared/jsonFile.cjs');
const { emptyBook, normalizeBook, observe, eventsForEgg, eventsForDate } = require('./adventureCore');

let cache = null;
const lastObserved = new Map();
const seenThisRun = new Set();

function adventurePath() {
  return path.join(app.getPath('userData'), 'adventures.json');
}

function loadBook() {
  if (!cache) cache = normalizeBook(readJsonFile(adventurePath(), emptyBook));
  return cache;
}

function observeAdventureProfile(profile, eggId, personality, options = {}) {
  const now = options.now || new Date();
  const key = `${profile?.date || ''}:${eggId || ''}`;
  const timestamp = new Date(now).getTime();
  if (!options.force && timestamp - (lastObserved.get(key) || 0) < 2000) return [];
  lastObserved.set(key, timestamp);
  const baselineOnly = !seenThisRun.has(key);
  seenThisRun.add(key);
  const result = observe(loadBook(), profile, { eggId, personality, now, baselineOnly });
  if (result.changed) {
    writeJsonAtomic(adventurePath(), result.book);
    cache = result.book;
  }
  return result.newEvents;
}

function getEggAdventures(eggId) {
  return eggId ? eventsForEgg(loadBook(), eggId) : [];
}

function getAdventureTimeline(date, eggId) {
  const book = loadBook();
  return {
    date,
    todayEvents: eventsForDate(book, date),
    eggEvents: eggId ? eventsForEgg(book, eggId) : [],
    history: [...book.events].reverse(),
  };
}

function previousEggId(date) {
  return loadBook().checkpoints[date]?.eggId || null;
}

module.exports = {
  adventurePath, observeAdventureProfile, getEggAdventures, getAdventureTimeline, previousEggId,
};
