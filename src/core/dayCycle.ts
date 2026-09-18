/**
 * One egg per local day → behaviour grows it → settle locks one Loafling.
 * Next calendar day always starts a new egg (never merges days).
 *
 * Visual growth (老大 + reference/process.png): 6 stages, one per 1000 clicks.
 *   egg → cracking → hatching → newborn → growing → adult
 * End-of-day Save still uses hatchDay() for genes / collection.
 */

import type { DailyActivityProfile } from './profile';
import { settleDay, type DaylingResult } from './settle';

/** Clicks needed to advance one visual growth stage. */
export const CLICKS_PER_HATCH_STAGE = 1000;

/** Number of visual stages in reference/process.png (01–06). */
export const HATCH_STAGE_COUNT = 6;

export type DayPhase = 'egg' | 'growing' | 'hatched';

/**
 * Visual companion stages — ids match reference/process.png labels.
 * ART assets should use the same filenames / keys.
 */
export type HatchVisualPhase =
  | 'egg'
  | 'cracking'
  | 'hatching'
  | 'newborn'
  | 'growing'
  | 'adult';

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
  /** 0..5 — aligns with process.png 01..06 */
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  phase: HatchVisualPhase;
  clicks: number;
  /** Clicks needed to reach the next stage; null if already adult. */
  nextStageAt: number | null;
  clicksPerStage: number;
  stageCount: number;
  /** 0..1 progress within the current stage toward the next. */
  stageProgress: number;
}

const STAGE_PHASE: HatchVisualPhase[] = [
  'egg',
  'cracking',
  'hatching',
  'newborn',
  'growing',
  'adult',
];

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
 * Visual stage from click count (reference/process.png):
 * - 0–999     egg
 * - 1000–1999 cracking
 * - 2000–2999 hatching (peek)
 * - 3000–3999 newborn
 * - 4000–4999 growing
 * - 5000+     adult
 */
export function hatchProgressFromClicks(clicks: number): HatchProgress {
  const c = Math.max(0, Math.floor(clicks || 0));
  const raw = Math.floor(c / CLICKS_PER_HATCH_STAGE);
  const maxStage = (HATCH_STAGE_COUNT - 1) as 5;
  const stage = Math.min(maxStage, raw) as 0 | 1 | 2 | 3 | 4 | 5;
  const phase = STAGE_PHASE[stage];
  const nextStageAt =
    stage >= maxStage ? null : (stage + 1) * CLICKS_PER_HATCH_STAGE;
  const stageFloor = stage * CLICKS_PER_HATCH_STAGE;
  const stageProgress =
    stage >= maxStage
      ? 1
      : Math.min(1, (c - stageFloor) / CLICKS_PER_HATCH_STAGE);
  return {
    stage,
    phase,
    clicks: c,
    nextStageAt,
    clicksPerStage: CLICKS_PER_HATCH_STAGE,
    stageCount: HATCH_STAGE_COUNT,
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
      stage: 5,
      phase: 'adult',
      nextStageAt: null,
      stageProgress: 1,
    };
  }
  return progress;
}

/**
 * Coarse lifecycle for older callers.
 * Prefer hatchProgressFromProfile for art switching.
 */
export function phaseFromProfile(
  profile: DailyActivityProfile,
  alreadyHatched: boolean,
): DayPhase {
  if (alreadyHatched) return 'hatched';
  const progress = hatchProgressFromClicks(profile.clicks);
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
