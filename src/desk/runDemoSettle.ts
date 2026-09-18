/**
 * CLI smoke: npm run settle:demo
 * Loads src/sense/fixtures/demo-day.json → CORE hatchDay() (wraps settleDay)
 * @see docs/DAY_CYCLE_MVP.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { hatchDay } from '../core/dayCycle';
import { assertProfileShape, type DailyActivityProfile } from '../sense/profile';

const fp = path.join(__dirname, '../sense/fixtures/demo-day.json');
const profile = JSON.parse(fs.readFileSync(fp, 'utf8')) as DailyActivityProfile;
assertProfileShape(profile);
const hatch = hatchDay(profile);
const result = hatch.result;
console.log(
  JSON.stringify(
    {
      fixture: fp,
      phase: hatch.phase,
      kind: result.kind,
      genes: result.genes,
      energy: result.energy,
      personality: result.personality,
      rarity: result.rarity,
      events: result.events,
    },
    null,
    2,
  ),
);
