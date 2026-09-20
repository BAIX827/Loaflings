'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readJsonFile, writeJsonAtomic } = require('../src/shared/jsonFile.cjs');

test('JSON storage overwrites safely and falls back on malformed data', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'loaflings-json-'));
  const filePath = path.join(directory, 'state.json');
  try {
    writeJsonAtomic(filePath, { version: 1, value: 'first' });
    writeJsonAtomic(filePath, { version: 1, value: 'second' });
    assert.deepEqual(readJsonFile(filePath, null), { version: 1, value: 'second' });
    assert.deepEqual(fs.readdirSync(directory), ['state.json']);

    fs.writeFileSync(filePath, '{broken', 'utf8');
    assert.deepEqual(readJsonFile(filePath, () => ({ safe: true })), { safe: true });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    fs.rmdirSync(directory);
  }
});
