/**
 * Stable modular appearance recipe emitted with each settled Loafling.
 *
 * Genes remain the four locked behavioural fields. Appearance maps those
 * results onto the editable SVG library without turning cosmetics into genes.
 */
import type { EnergyPool } from './energy';
import type { Personality, Rarity } from './genes';

export interface CharacterAppearance {
  body: 'body_classic' | 'body_chubby' | 'body_long';
  marking: 'none' | 'marking_patchy';
  expression:
    | 'expr_normal'
    | 'expr_happy'
    | 'expr_sleepy'
    | 'expr_curious'
    | 'expr_focused';
  cloudMood:
    | 'cloud_normal'
    | 'cloud_happy'
    | 'cloud_sleepy'
    | 'cloud_curious'
    | 'cloud_focused'
    | 'cloud_dreamy'
    | 'cloud_twin';
  headwear: 'none';
  facewear: 'none';
  outfit: 'none';
}

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  body: 'body_classic',
  marking: 'none',
  expression: 'expr_normal',
  cloudMood: 'cloud_normal',
  headwear: 'none',
  facewear: 'none',
  outfit: 'none',
};

/**
 * First production mapping. It is deterministic and intentionally restrained:
 * personality selects a base template while rarity selects at most one innate
 * mutation. Wearables remain user-controlled cosmetics.
 */
export function resolveAppearance(
  energy: EnergyPool,
  personality: Personality,
  rarity: Rarity,
): CharacterAppearance {
  let body: CharacterAppearance['body'] = 'body_classic';
  let expression: CharacterAppearance['expression'] = 'expr_happy';
  let cloudMood: CharacterAppearance['cloudMood'] = 'cloud_happy';

  if (personality === 'builder') {
    body = 'body_classic';
    expression = 'expr_focused';
    cloudMood = 'cloud_focused';
  } else if (personality === 'explorer') {
    body = 'body_chubby';
    expression = 'expr_curious';
    cloudMood = 'cloud_curious';
  } else if (personality === 'dreamer') {
    body = 'body_long';
    expression = 'expr_sleepy';
    cloudMood = energy.dream > 35 ? 'cloud_dreamy' : 'cloud_sleepy';
  }

  return {
    body,
    marking: rarity === 'rare' ? 'marking_patchy' : 'none',
    expression,
    cloudMood: rarity === 'epic' ? 'cloud_twin' : cloudMood,
    headwear: 'none',
    facewear: 'none',
    outfit: 'none',
  };
}
