/**
 * Daytime visual growth (LEAD lock 2026-09-18).
 * activityHits = keystrokes + clicks. Cumulative thresholds — not equal stage widths.
 * Pure helpers — no I/O. DESK switches art; ART owns assets.
 *
 * @see character/HATCH_PHASES.md
 */

import type { DailyActivityProfile } from './profile';

/**
 * Cumulative activityHits floors for each stage (egg=0 … adult=29000).
 * Widths: 3k / 5k / 6k / 7k / 8k / ∞
 */
export const HATCH_STAGE_THRESHOLDS = Object.freeze([
  0, 3000, 8000, 14000, 21000, 29000,
] as const);

export const HATCH_STAGE_COUNT = 6;

/** @deprecated equal-width stages removed — kept for old callers; equals first band width */
export const INPUTS_PER_HATCH_STAGE = 3000;
/** @deprecated alias */
export const CLICKS_PER_HATCH_STAGE = INPUTS_PER_HATCH_STAGE;

export type HatchVisualPhase =
  | 'egg'
  | 'cracking'
  | 'hatching'
  | 'newborn'
  | 'growing'
  | 'adult';

export interface HatchProgress {
  /** 0..5 ↔ egg..adult */
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  phase: HatchVisualPhase;
  /** activityHits = clicks + keystrokes */
  inputs: number;
  clicks: number;
  keystrokes: number;
  nextStageAt: number | null;
  /** width of current band (adult = null-ish large); for HUD */
  inputsPerStage: number;
  /** @deprecated alias of inputsPerStage */
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

export function hatchInputScore(clicks: number, keystrokes: number): number {
  return Math.max(0, Math.floor(clicks || 0)) + Math.max(0, Math.floor(keystrokes || 0));
}

function stageFromInputs(inputs: number): 0 | 1 | 2 | 3 | 4 | 5 {
  const c = Math.max(0, Math.floor(inputs || 0));
  let stage = 0;
  for (let i = HATCH_STAGE_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (c >= HATCH_STAGE_THRESHOLDS[i]) {
      stage = i;
      break;
    }
  }
  return stage as 0 | 1 | 2 | 3 | 4 | 5;
}

function progressFromInputs(
  inputs: number,
  clicks: number,
  keystrokes: number,
): HatchProgress {
  const c = Math.max(0, Math.floor(inputs || 0));
  const stage = stageFromInputs(c);
  const maxStage = (HATCH_STAGE_COUNT - 1) as 5;
  const floor = HATCH_STAGE_THRESHOLDS[stage];
  const nextStageAt = stage >= maxStage ? null : HATCH_STAGE_THRESHOLDS[stage + 1];
  const band =
    nextStageAt == null ? Math.max(1, c - floor || 1) : nextStageAt - floor;
  const stageProgress =
    stage >= maxStage ? 1 : Math.min(1, Math.max(0, (c - floor) / band));
  return {
    stage,
    phase: STAGE_PHASE[stage],
    inputs: c,
    clicks: Math.max(0, Math.floor(clicks || 0)),
    keystrokes: Math.max(0, Math.floor(keystrokes || 0)),
    nextStageAt,
    inputsPerStage: band,
    clicksPerStage: band,
    stageCount: HATCH_STAGE_COUNT,
    stageProgress,
  };
}

/** Prefer hatchProgressFromClicksAndKeys when both signals exist. */
export function hatchProgressFromClicks(clicks: number): HatchProgress {
  return progressFromInputs(clicks, clicks, 0);
}

export function hatchProgressFromClicksAndKeys(
  clicks: number,
  keystrokes: number,
): HatchProgress {
  return progressFromInputs(
    hatchInputScore(clicks, keystrokes),
    clicks,
    keystrokes,
  );
}

export function hatchProgressFromProfile(
  profile: DailyActivityProfile,
  _alreadySaved: boolean,
): HatchProgress {
  return hatchProgressFromClicksAndKeys(
    profile.clicks,
    profile.keystrokes,
  );
}
