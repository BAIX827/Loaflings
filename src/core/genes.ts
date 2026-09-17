/**
 * Modular genetics — MVP fields locked with DAY-ART / DAY-LEAD:
 * body / cloud / face / tail (sprout deprecated).
 */

import type { EnergyPool } from './energy';
import { dominantEnergy } from './energy';
import type { DailyActivityProfile } from './profile';
import { longestFocusSec } from './profile';
import { pickWeighted, rngFromKeys, type Rng } from './rng';

export const GENE_FIELDS = ['body', 'cloud', 'face', 'tail'] as const;
export type GeneField = (typeof GENE_FIELDS)[number];

/** Must stay in sync with character/PARTS_MVP.md and src/art/parts.ts */
export const MVP_BASE_GENES: Record<GeneField, string> = {
  body: 'body_base',
  cloud: 'cloud_base',
  face: 'face_base',
  tail: 'tail_base',
};

export type Rarity = 'common' | 'uncommon' | 'rare';

export interface CreatureGenes {
  body: string;
  cloud: string;
  face: string;
  tail: string;
}

export type Personality =
  | 'builder'
  | 'explorer'
  | 'dreamer'
  | 'balanced';

/**
 * MVP: always emit base part ids so DESK/ART can compose today.
 * Weighted hooks reserved for future variants (same field names).
 */
export function resolveGenes(
  profile: DailyActivityProfile,
  energy: EnergyPool,
  rng: Rng = rngFromKeys(profile.date, profile.seedKey, 'genes'),
): CreatureGenes {
  // Keep rng consumed so future variant tables stay seed-stable when added.
  void pickWeighted(rng, [
    { id: 'body_base', weight: 1 },
  ]);
  void energy;
  void longestFocusSec;

  return { ...MVP_BASE_GENES };
}

export function resolvePersonality(energy: EnergyPool): Personality {
  const d = dominantEnergy(energy);
  if (d === 'work') return 'builder';
  if (d === 'explore') return 'explorer';
  if (d === 'dream') return 'dreamer';
  return 'balanced';
}

/** MVP rarity thresholds — tune with DAY-LEAD. */
export function resolveRarity(energy: EnergyPool, rng: Rng): Rarity {
  const total = energy.work + energy.explore + energy.dream;
  const imbalance =
    Math.max(energy.work, energy.explore, energy.dream) /
    Math.max(1, total / 3);
  let roll = rng();
  if (total > 80 && imbalance > 2.2 && roll > 0.85) return 'rare';
  if (total > 40 && roll > 0.6) return 'uncommon';
  return 'common';
}
