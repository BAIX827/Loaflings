/**
 * One egg per local day → behaviour grows it → settle hatches one Loafling.
 * Next calendar day always starts a new egg (never merges days).
 */

import type { DailyActivityProfile } from './profile';
import { settleDay, type DaylingResult } from './settle';

export type DayPhase = 'egg' | 'growing' | 'hatched';

export interface DayEgg {
  date: string;
  seedKey: string;
  phase: 'egg' | 'growing';
}

export interface HatchRecord {
  date: string;
  phase: 'hatched';
  /** Settled creature for this date only. */
  result: DaylingResult;
}

/** Start today's egg (embryo). Call when local date rolls or on first launch. */
export function startEgg(date: string, seedKey: string): DayEgg {
  return { date, seedKey, phase: 'egg' };
}

/** Any non-zero activity moves egg → growing (UI can still show egg art). */
export function markGrowing(egg: DayEgg): DayEgg {
  if (egg.phase === 'growing') return egg;
  return { ...egg, phase: 'growing' };
}

export function phaseFromProfile(
  profile: DailyActivityProfile,
  alreadyHatched: boolean,
): DayPhase {
  if (alreadyHatched) return 'hatched';
  const active =
    profile.keystrokes +
      profile.clicks +
      profile.mouseTravel +
      profile.activeSec >
    0;
  return active ? 'growing' : 'egg';
}

/**
 * End-of-day hatch: one DaylingResult per profile.date.
 * DESK should persist into collection and refuse a second hatch for the same date.
 */
export function hatchDay(profile: DailyActivityProfile): HatchRecord {
  const result = settleDay(profile);
  return {
    date: profile.date,
    phase: 'hatched',
    result,
  };
}

/** True when local today differs from last egg/hatch date → start a new egg. */
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
