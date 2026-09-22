'use strict';

const path = require('path');
const { app } = require('electron');
const { readJsonFile, writeJsonAtomic } = require('../shared/jsonFile.cjs');
const { localToday } = require('./hooks/coreDayCycle');
const { emptyWallet, normalizeWallet, award, observeProfile, walletView } = require('./coinWalletCore');
let cache = null;

function walletPath() {
  return path.join(app.getPath('userData'), 'coins.json');
}

function loadWallet() {
  if (!cache) cache = normalizeWallet(readJsonFile(walletPath(), emptyWallet));
  return cache;
}

function saveIfEarned(result) {
  const gained = Array.isArray(result.earned) ? result.earned.length > 0 : Boolean(result.earned);
  if (gained) {
    writeJsonAtomic(walletPath(), result.wallet);
    cache = result.wallet;
  }
  return result;
}

function observeCoinProfile(profile) {
  return saveIfEarned(observeProfile(loadWallet(), profile));
}

function awardCollectionCoin(date) {
  return saveIfEarned(award(loadWallet(), date, 'collection'));
}

function getCoinWallet(profile = null) {
  const result = profile ? observeCoinProfile(profile) : { wallet: loadWallet(), earned: [] };
  const earned = Array.isArray(result.earned) ? result.earned : result.earned ? [result.earned] : [];
  return { ...walletView(result.wallet, localToday()), earned };
}

module.exports = { walletPath, observeCoinProfile, awardCollectionCoin, getCoinWallet };
