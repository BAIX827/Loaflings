/**
 * One egg per local day → behaviour grows it → settle hatches one Loafling.
 * Next calendar day always starts a new egg (never merges days).
 *
 * Visual hatch progress (老大): egg → cracking → hatched, one step per 1000 clicks.
 * End-of-day Save still uses hatchDay() for genes / collection.
 */

import type { DailyActivityProfile } from './profile';
import { settleDay, type DaylingResult } from './settle';

/** Clicks needed to advance one visual hatch stage (egg → cracking → hatched). */
export const CLICKS_PER_HATCH_STAGE = 1000;

export type DayPhase = 'egg' | 'growing' | 'hatched';

/** Visual / companion art stage during the day (before or after Save). */
export type HatchVisualPhase = 'egg' | 'cracking' | 'hatched';

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

export interface HatchProgress {
  /** 0 = egg, 1 = cracking, 2 = fully hatched (visual). */
  stage: 0 | 1 | 2;
  phase: HatchVisualPhase;
  clicks: number;
  /** Clicks needed to reach the next stage; null if already at max. */
  nextStageAt: number | null;
  clicksPerStage: number;
  /** 0..1 progress within the current stage toward the next. */
  stageProgress: number;
}

const STAGE_PHASE: HatchVisualPhase[] = ['egg', 'cracking', 'hatched'];

/** Start today's egg (embryo). Call when local date rolls or on first launch. */
export function startEgg(date: string, seedKey: string): DayEgg {
  return { date, seedKey, phase: 'egg' };
}

/** Any non-zero activity moves egg → growing (UI can still show egg art). */
export function markGrowing(egg: DayEgg): DayEgg {
  if (egg.phase === 'growing') return egg;
  return { ...egg, phase: 'growing' };
}

/**
 * Visual hatch stage from click count.
 * - 0..999 → egg
 * - 1000..1999 → cracking
 * - 2000+ → hatched (visual; Save still writes collection via hatchDay)
 */
export function hatchProgressFromClicks(clicks: number): HatchProgress {
  const c = Math.max(0, Math.floor(clicks || 0));
  const raw = Math.floor(c / CLICKS_PER_HATCH_STAGE);
  const stage = Math.min(2, raw) as 0 | 1 | 2;
  const phase = STAGE_PHASE[stage];
  const nextStageAt = stage >= 2 ? null : (stage + 1) * CLICKS_PER_HATCH_STAGE;
  const stageFloor = stage * CLICKS_PER_HATCH_STAGE;
  const stageProgress =
    stage >= 2
      ? 1
      : Math.min(1, (c - stageFloor) / CLICKS_PER_HATCH_STAGE);
  return {
    stage,
    phase,
    clicks: c,
    nextStageAt,
    clicksPerStage: CLICKS_PER_HATCH_STAGE,
    stageProgress,
  };
}

export function hatchProgressFromProfile(
  profile: DailyActivityProfile,
  alreadySaved: boolean,
): HatchProgress {
  const progress = hatchProgressFromClicks(profile.clicks);
  if (alreadySaved) {
    return {
      ...progress,
      stage: 2,
      phase: 'hatched',
      nextStageAt: null,
      stageProgress: 1,
    };
  }
  return progress;
}

/** Coarse lifecycle for older callers — prefer hatchProgressFromProfile for art. */
export function phaseFromProfile(
  profile: DailyActivityProfile,
  alreadyHatched: boolean,
): DayPhase {
  if (alreadyHatched) return 'hatched';
  const progress = hatchProgressFromClicks(profile.clicks);
  if (progress.stage >= 2) return 'hatched';
  if (progress.stage >= 1) return 'growing';
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
