/**
 * Work / Explore / Dream energy — behaviour → interpretation layer.
 * Idle is productive (Dream), not failure.
 */

import type { DailyActivityProfile } from './profile';
import { longestFocusSec } from './profile';

export interface EnergyPool {
  work: number;
  explore: number;
  dream: number;
}

/** MVP weights — tune with DAY-LEAD; keep deterministic from profile. */
export const ENERGY_WEIGHTS = {
  work: { keystroke: 0.01, click: 0.05, focusSec: 0.02 },
  explore: { mouseTravel: 0.5, windowSwitch: 0.3 },
  dream: { idleSec: 0.015 },
} as const;

export function computeEnergy(profile: DailyActivityProfile): EnergyPool {
  const w = ENERGY_WEIGHTS;
  const work =
    profile.keystrokes * w.work.keystroke +
    profile.clicks * w.work.click +
    longestFocusSec(profile) * w.work.focusSec;
  const explore =
    profile.mouseTravel * w.explore.mouseTravel +
    profile.windowSwitches * w.explore.windowSwitch;
  const dream = profile.idleSec * w.dream.idleSec;
  return {
    work: round2(work),
    explore: round2(explore),
    dream: round2(dream),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Dominant energy label for personality hints (MVP). */
export function dominantEnergy(pool: EnergyPool): 'work' | 'explore' | 'dream' {
  if (pool.explore >= pool.work && pool.explore >= pool.dream) return 'explore';
  if (pool.dream >= pool.work && pool.dream >= pool.explore) return 'dream';
  return 'work';
}
