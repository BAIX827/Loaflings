/**
 * DESK pipeline: load SENSE demo fixture → assert shape → CORE settleDay().
 * Formulas live in src/core / src/sense — desk only wires them.
 */
const fs = require('fs');
const path = require('path');

// Register TS loader when not already registered via `electron -r tsx/cjs`
try {
  require('tsx/cjs');
} catch {
  // already registered or unavailable
}

const { settleDay } = require('../core/settle.ts');
const { assertProfileShape } = require('../sense/profile.ts');

const FIXTURE_REL = path.join('src', 'sense', 'fixtures', 'demo-day.json');

function repoRoot() {
  return path.join(__dirname, '../..');
}

function fixturePath() {
  return path.join(repoRoot(), FIXTURE_REL);
}

/**
 * @returns {{ profile: object, result: object, fixturePath: string }}
 */
function runDemoSettle() {
  const fp = fixturePath();
  const raw = fs.readFileSync(fp, 'utf8');
  const profile = JSON.parse(raw);
  assertProfileShape(profile);
  const result = settleDay(profile);
  return { profile, result, fixturePath: fp };
}

module.exports = { runDemoSettle, fixturePath, FIXTURE_REL };
