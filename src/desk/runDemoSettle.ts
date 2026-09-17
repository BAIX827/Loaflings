/**
 * CLI smoke: npm run settle:demo
 * Loads src/sense/fixtures/demo-day.json → settleDay()
 */
import fs from 'node:fs';
import path from 'node:path';
import { settleDay } from '../core/settle';
import { assertProfileShape, type DailyActivityProfile } from '../sense/profile';

const fp = path.join(__dirname, '../sense/fixtures/demo-day.json');
const profile = JSON.parse(fs.readFileSync(fp, 'utf8')) as DailyActivityProfile;
assertProfileShape(profile);
const result = settleDay(profile);
console.log(JSON.stringify({ fixture: fp, genes: result.genes, energy: result.energy, personality: result.personality, rarity: result.rarity, events: result.events }, null, 2));
