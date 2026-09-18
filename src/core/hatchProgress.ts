/**
 * Daytime visual growth from clicks (reference/process.png).
 * Pure helpers — no I/O. DESK switches art; ART owns assets.
 */

import type { DailyActivityProfile } from './profile';

/** Clicks per visual stage advance. */
export const CLICKS_PER_HATCH_STAGE = 1000;

/** Stages 01–06 on process.png. */
export const HATCH_STAGE_COUNT = 6;

export type HatchVisualPhase =
  | 'egg'
  | 'cracking'
  | 'hatching'
  | 'newborn'
  | 'growing'
  | 'adult';

export interface HatchProgress {
  /** 0..5 ↔ process.png 01..06 */
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  phase: HatchVisualPhase;
  clicks: number;
  nextStageAt: number | null;
  clicksPerStage: number;
  stageCount: number;
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

/**
 * - 0–999 egg · 1000–1999 cracking · 2000–2999 hatching
 * - 3000–3999 newborn · 4000–4999 growing · 5000+ adult
 */
export function hatchProgressFromClicks(clicks: number): HatchProgress {
  const c = Math.max(0, Math.floor(clicks || 0));
  const raw = Math.floor(c / CLICKS_PER_HATCH_STAGE);
  const maxStage = (HATCH_STAGE_COUNT - 1) as 5;
  const stage = Math.min(maxStage, raw) as 0 | 1 | 2 | 3 | 4 | 5;
  const nextStageAt =
    stage >= maxStage ? null : (stage + 1) * CLICKS_PER_HATCH_STAGE;
  const stageFloor = stage * CLICKS_PER_HATCH_STAGE;
  const stageProgress =
    stage >= maxStage
      ? 1
      : Math.min(1, (c - stageFloor) / CLICKS_PER_HATCH_STAGE);
  return {
    stage,
    phase: STAGE_PHASE[stage],
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
  if (!alreadySaved) return progress;
  return {
    ...progress,
    stage: 5,
    phase: 'adult',
    nextStageAt: null,
    stageProgress: 1,
  };
}
