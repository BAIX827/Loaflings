/**
 * Daytime visual growth from behaviour (reference/process.png).
 * Pure helpers — no I/O. DESK switches art; ART owns assets.
 *
 * Progress units = clicks + keystrokes (老大: both count toward hatch stages).
 * Still 1000 units per stage unless LEAD retunes.
 */

import type { DailyActivityProfile } from './profile';

/** Behaviour units (clicks + keys) per visual stage. */
export const INPUTS_PER_HATCH_STAGE = 1000;

/** @deprecated alias — same as INPUTS_PER_HATCH_STAGE */
export const CLICKS_PER_HATCH_STAGE = INPUTS_PER_HATCH_STAGE;

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
  /** clicks + keystrokes driving the stage bar */
  inputs: number;
  clicks: number;
  keystrokes: number;
  nextStageAt: number | null;
  /** units per stage (clicks+keys) */
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

function progressFromInputs(
  inputs: number,
  clicks: number,
  keystrokes: number,
): HatchProgress {
  const c = Math.max(0, Math.floor(inputs || 0));
  const raw = Math.floor(c / INPUTS_PER_HATCH_STAGE);
  const maxStage = (HATCH_STAGE_COUNT - 1) as 5;
  const stage = Math.min(maxStage, raw) as 0 | 1 | 2 | 3 | 4 | 5;
  const nextStageAt =
    stage >= maxStage ? null : (stage + 1) * INPUTS_PER_HATCH_STAGE;
  const stageFloor = stage * INPUTS_PER_HATCH_STAGE;
  const stageProgress =
    stage >= maxStage
      ? 1
      : Math.min(1, (c - stageFloor) / INPUTS_PER_HATCH_STAGE);
  return {
    stage,
    phase: STAGE_PHASE[stage],
    inputs: c,
    clicks: Math.max(0, Math.floor(clicks || 0)),
    keystrokes: Math.max(0, Math.floor(keystrokes || 0)),
    nextStageAt,
    inputsPerStage: INPUTS_PER_HATCH_STAGE,
    clicksPerStage: INPUTS_PER_HATCH_STAGE,
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
  alreadySaved: boolean,
): HatchProgress {
  const progress = hatchProgressFromClicksAndKeys(
    profile.clicks,
    profile.keystrokes,
  );
  if (!alreadySaved) return progress;
  return {
    ...progress,
    stage: 5,
    phase: 'adult',
    nextStageAt: null,
    stageProgress: 1,
  };
}
