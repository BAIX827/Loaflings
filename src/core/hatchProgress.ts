/**
 * Daytime visual growth (LEAD lock 2026-09-18).
 * activityHits = keystrokes + clicks. Cumulative thresholds — not equal stage widths.
 * Pure helpers — no I/O. DESK switches art; ART owns assets.
 *
 * @see character/HATCH_PHASES.md
 */

import type { DailyActivityProfile } from './profile';

/**
 * Original cumulative stage proportions. The default goal is 20,000.
 */
const REFERENCE_THRESHOLDS = Object.freeze([
  0, 3000, 8000, 14000, 21000, 29000,
] as const);
export const DEFAULT_HATCH_TARGET = 20000;
export const MIN_HATCH_TARGET = 1000;

export function normalizeHatchTarget(value: unknown): number {
  const n = Number(value);
  return value !== null && value !== undefined && value !== '' && Number.isFinite(n)
    ? Math.max(MIN_HATCH_TARGET, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n)))
    : DEFAULT_HATCH_TARGET;
}

export function hatchStageThresholds(target = DEFAULT_HATCH_TARGET): number[] {
  const goal = normalizeHatchTarget(target);
  const referenceGoal = REFERENCE_THRESHOLDS[REFERENCE_THRESHOLDS.length - 1];
  return REFERENCE_THRESHOLDS.map((floor) => Math.round((floor / referenceGoal) * goal));
}

export const HATCH_STAGE_THRESHOLDS = Object.freeze(hatchStageThresholds());

export const HATCH_STAGE_COUNT = 6;

/** @deprecated equal-width stages removed — kept for old callers; default first band width */
export const INPUTS_PER_HATCH_STAGE = HATCH_STAGE_THRESHOLDS[1];
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

function stageFromInputs(inputs: number, thresholds: readonly number[]): 0 | 1 | 2 | 3 | 4 | 5 {
  const c = Math.max(0, Math.floor(inputs || 0));
  let stage = 0;
  for (let i = thresholds.length - 1; i >= 0; i -= 1) {
    if (c >= thresholds[i]) {
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
  target: number,
): HatchProgress {
  const c = Math.max(0, Math.floor(inputs || 0));
  const thresholds = hatchStageThresholds(target);
  const stage = stageFromInputs(c, thresholds);
  const maxStage = (HATCH_STAGE_COUNT - 1) as 5;
  const floor = thresholds[stage];
  const nextStageAt = stage >= maxStage ? null : thresholds[stage + 1];
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
export function hatchProgressFromClicks(clicks: number, target = DEFAULT_HATCH_TARGET): HatchProgress {
  return progressFromInputs(clicks, clicks, 0, target);
}

export function hatchProgressFromClicksAndKeys(
  clicks: number,
  keystrokes: number,
  target = DEFAULT_HATCH_TARGET,
): HatchProgress {
  return progressFromInputs(
    hatchInputScore(clicks, keystrokes),
    clicks,
    keystrokes,
    target,
  );
}

export function hatchProgressFromProfile(
  profile: DailyActivityProfile,
  _alreadySaved: boolean,
  target = DEFAULT_HATCH_TARGET,
): HatchProgress {
  return hatchProgressFromClicksAndKeys(
    profile.clicks,
    profile.keystrokes,
    target,
  );
}
