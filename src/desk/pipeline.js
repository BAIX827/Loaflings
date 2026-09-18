/**
 * DESK pipeline: load SENSE demo fixture → assert shape → CORE hatchDay().
 * Formulas live in src/core / src/sense — desk only wires them.
 * @see docs/DAY_CYCLE_MVP.md
 */
const fs = require('fs');
const path = require('path');

const { assertProfileShape } = require('./runtime/sense-profile.cjs');
const { hatchDay, getApiSource } = require('./hooks/coreDayCycle');

const FIXTURE_REL = path.join('src', 'sense', 'fixtures', 'demo-day.json');

function repoRoot() {
  return path.join(__dirname, '../..');
}

function fixturePath() {
  return path.join(repoRoot(), FIXTURE_REL);
}

/**
 * @returns {{ profile: object, result: object, hatch: object, fixturePath: string, apiSource: string }}
 */
function runDemoSettle() {
  const fp = fixturePath();
  const raw = fs.readFileSync(fp, 'utf8');
  const profile = JSON.parse(raw);
  assertProfileShape(profile);
  const hatch = hatchDay(profile);
  return {
    profile,
    result: hatch.result,
    hatch,
    fixturePath: fp,
    apiSource: getApiSource(),
  };
}

module.exports = { runDemoSettle, fixturePath, FIXTURE_REL };
