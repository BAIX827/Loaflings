/**
 * Behaviour grows the active egg → settle locks one Loafling.
 * Daily SENSE profiles still roll at midnight; DESK may carry an unfinished
 * egg's click + keystroke progress after an explicit player choice.
 *
 * Visual stages: see hatchProgress.ts (cumulative clicks + keystrokes).
 * Idle presentation: see idleMood.ts (does not affect settle).
 */

import type { DailyActivityProfile } from './profile';
import { settleDay, type DaylingResult } from './settle';
import {
  hatchProgressFromClicks,
  hatchProgressFromProfile,
  type HatchProgress,
  type HatchVisualPhase,
} from './hatchProgress';

export {
  CLICKS_PER_HATCH_STAGE,
  HATCH_STAGE_COUNT,
  hatchProgressFromClicks,
  hatchProgressFromProfile,
} from './hatchProgress';
export type { HatchProgress, HatchVisualPhase } from './hatchProgress';

export type DayPhase = 'egg' | 'growing' | 'hatched';

export interface DayEgg {
  date: string;
  seedKey: string;
  phase: 'egg' | 'growing';
}

export interface HatchRecord {
  date: string;
  phase: 'hatched';
  result: DaylingResult;
}

export function startEgg(date: string, seedKey: string): DayEgg {
  return { date, seedKey, phase: 'egg' };
}

export function markGrowing(egg: DayEgg): DayEgg {
  if (egg.phase === 'growing') return egg;
  return { ...egg, phase: 'growing' };
}

/** Coarse lifecycle — prefer hatchProgressFromProfile for art. */
export function phaseFromProfile(
  profile: DailyActivityProfile,
  alreadyHatched: boolean,
): DayPhase {
  if (alreadyHatched) return 'hatched';
  const progress = hatchProgressFromProfile(profile, false);
  if (progress.stage >= 5) return 'hatched';
  if (progress.stage >= 1) return 'growing';
  const active =
    profile.keystrokes +
      profile.clicks +
      profile.mouseTravel +
      profile.activeSec >
    0;
  return active ? 'growing' : 'egg';
}

export function hatchDay(profile: DailyActivityProfile): HatchRecord {
  const result = settleDay(profile);
  return { date: profile.date, phase: 'hatched', result };
}

export function shouldStartNewEgg(
  lastDate: string | null | undefined,
  today: string,
): boolean {
  if (!lastDate) return true;
  return lastDate !== today;
}

export function localToday(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
