'use strict';

const path = require('path');
const { app } = require('electron');
const { readJsonFile, writeJsonAtomic } = require('../shared/jsonFile.cjs');
const { emptyStats, normalizeStats, observeProfile, statsView } = require('./activityStatsCore');

const FILE_NAME = 'activity-stats.json';
let cache = null;

function statsPath() {
  return path.join(app.getPath('userData'), FILE_NAME);
}

function loadStats() {
  if (!cache) cache = normalizeStats(readJsonFile(statsPath(), emptyStats));
  return cache;
}

function observeActivityProfile(profile) {
  const observed = observeProfile(loadStats(), profile);
  cache = observed.stats;
  if (observed.changed) writeJsonAtomic(statsPath(), cache);
  return statsView(cache);
}

function getActivityStats() {
  return { ...statsView(loadStats()), path: statsPath() };
}

module.exports = {
  FILE_NAME,
  statsPath,
  observeActivityProfile,
  getActivityStats,
};
