/**
 * Modular genetics — MVP fields locked with DAY-ART / DAY-LEAD:
 * body / cloud / face / tail (sprout deprecated).
 *
 * Three qualities (老大): common / rare / epic — probability + look differ.
 * @see docs/GENE_CONTRACT_MVP.md
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

/** Three qualities — ids match desk i18n (普通 / 稀有 / 史诗). */
export type Rarity = 'common' | 'rare' | 'epic';

export const RARITY_IDS = ['common', 'rare', 'epic'] as const;

/**
 * Base drop weights (sum 100). Seeded roll at settle.
 * LEAD/老大 may retune; ART maps each id to a distinct look.
 */
export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 70,
  rare: 25,
  epic: 5,
};

/** Art style bucket per rarity — PNG folders / suffixes ART fills later. */
export type StyleId = 'style_common' | 'style_rare' | 'style_epic';

export const STYLE_BY_RARITY: Record<Rarity, StyleId> = {
  common: 'style_common',
  rare: 'style_rare',
  epic: 'style_epic',
};

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
  void pickWeighted(rng, [{ id: 'body_base', weight: 1 }]);
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

/**
 * Seeded rarity from weights; high / imbalanced energy slightly boosts rare+epic.
 */
export function resolveRarity(energy: EnergyPool, rng: Rng): Rarity {
  const total = energy.work + energy.explore + energy.dream;
  const imbalance =
    Math.max(energy.work, energy.explore, energy.dream) /
    Math.max(1, total / 3);

  let wCommon = RARITY_WEIGHTS.common;
  let wRare = RARITY_WEIGHTS.rare;
  let wEpic = RARITY_WEIGHTS.epic;

  if (total > 60) {
    wCommon -= 8;
    wRare += 5;
    wEpic += 3;
  }
  if (total > 100 && imbalance > 2) {
    wCommon -= 7;
    wRare += 3;
    wEpic += 4;
  }
  wCommon = Math.max(40, wCommon);

  return pickWeighted(rng, [
    { id: 'common', weight: wCommon },
    { id: 'rare', weight: wRare },
    { id: 'epic', weight: wEpic },
  ]);
}

export function styleForRarity(rarity: Rarity): StyleId {
  return STYLE_BY_RARITY[rarity];
}
