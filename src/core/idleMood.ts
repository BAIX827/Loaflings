/**
 * Idle presentation hints for DESK/ART — does NOT change genes or settle.
 * Weights align with character/IDLE_MVP.md expression / pose ids.
 */

import { computeEnergy, dominantEnergy, type EnergyPool } from './energy';
import type { DailyActivityProfile } from './profile';

/** MVP idle expression ids from DAY-ART. */
export type IdleExprId =
  | 'normal'
  | 'happy'
  | 'sleepy'
  | 'surprised'
  | 'content';

/** MVP idle pose ids from DAY-ART. */
export type IdlePoseId = 'sit' | 'stretch' | 'lie';

export type IdleWeights<T extends string> = Record<T, number>;

export interface IdleMood {
  /** Prefer idle clips only when true (newborn+ and not mid-burst). */
  allowIdle: boolean;
  /** Suggested ms between random idle picks (DESK may clamp). */
  intervalMs: number;
  expr: IdleWeights<IdleExprId>;
  pose: IdleWeights<IdlePoseId>;
  dominant: 'work' | 'explore' | 'dream';
}

const EXPR_BASE: IdleWeights<IdleExprId> = {
  normal: 3,
  happy: 2,
  sleepy: 1,
  surprised: 1,
  content: 2,
};

const POSE_BASE: IdleWeights<IdlePoseId> = {
  sit: 3,
  stretch: 2,
  lie: 2,
};

/**
 * Map energy to idle weights.
 * Dream-heavy → sleepier; Work-heavy → more stretch/surprised; Explore → happy/sit.
 */
export function idleMoodFromEnergy(pool: EnergyPool): IdleMood {
  const dominant = dominantEnergy(pool);
  const expr = { ...EXPR_BASE };
  const pose = { ...POSE_BASE };
  let intervalMs = 12_000;

  if (dominant === 'dream') {
    expr.sleepy += 4;
    expr.content += 2;
    expr.happy = Math.max(1, expr.happy - 1);
    pose.lie += 3;
    pose.sit += 1;
    intervalMs = 16_000;
  } else if (dominant === 'work') {
    expr.surprised += 2;
    expr.normal += 1;
    pose.stretch += 3;
    pose.lie = Math.max(1, pose.lie - 1);
    intervalMs = 10_000;
  } else {
    expr.happy += 3;
    expr.content += 1;
    pose.sit += 2;
    pose.stretch += 1;
    intervalMs = 12_000;
  }

  return { allowIdle: true, intervalMs, expr, pose, dominant };
}

export function idleMoodFromProfile(profile: DailyActivityProfile): IdleMood {
  return idleMoodFromEnergy(computeEnergy(profile));
}

/** Weighted pick — pure; DESK passes its own rng if needed. */
export function pickWeightedKey<T extends string>(
  weights: IdleWeights<T>,
  rng: () => number = Math.random,
): T {
  const keys = Object.keys(weights) as T[];
  let total = 0;
  for (const k of keys) total += Math.max(0, weights[k]);
  if (total <= 0) return keys[0];
  let roll = rng() * total;
  for (const k of keys) {
    roll -= Math.max(0, weights[k]);
    if (roll <= 0) return k;
  }
  return keys[keys.length - 1];
}
