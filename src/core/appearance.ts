/**
 * Stable modular appearance recipe emitted with each settled Loafling.
 *
 * Genes remain the four locked behavioural fields. Appearance maps those
 * results onto the editable SVG library without turning cosmetics into genes.
 */
import type { EnergyPool } from './energy';
import type { Personality, Rarity } from './genes';

export interface CharacterAppearance {
  body: 'body_classic' | 'body_chubby' | 'body_long' | 'body_bun' | 'body_pudgy'
    | 'body_round_mocha' | 'body_pointy_strawberry' | 'body_melted_matcha';
  marking: 'none' | 'marking_patchy' | 'marking_sesame' | 'marking_dapple';
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
    | 'cloud_twin' | 'cloud_mocha' | 'cloud_strawberry' | 'cloud_sprout';
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
  variantRoll?: number,
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

  const appearance: CharacterAppearance = {
    body,
    marking: rarity === 'rare' ? 'marking_patchy' : 'none',
    expression,
    cloudMood: rarity === 'epic' ? 'cloud_twin' : cloudMood,
    headwear: 'none',
    facewear: 'none',
    outfit: 'none',
  };
  // A separate seeded roll chooses the visual recipe. Omitting it retains the
  // historical mapping for old callers and collection migration.
  if (variantRoll === undefined) return appearance;
  const roll = Number.isFinite(variantRoll) ? Math.min(0.999999, Math.max(0, variantRoll)) : 0;
  if (rarity === 'common') {
    if (personality === 'builder') appearance.body = roll < 0.5 ? 'body_classic' : 'body_bun';
    else if (personality === 'explorer') appearance.body = roll < 0.5 ? 'body_chubby' : 'body_pudgy';
    else if (personality === 'dreamer') appearance.body = 'body_long';
  } else if (rarity === 'rare') {
    const variant = Math.floor(roll * 4);
    if (variant === 1) {
      appearance.body = 'body_round_mocha';
      appearance.marking = 'marking_sesame';
      appearance.cloudMood = 'cloud_mocha';
    } else if (variant === 2) {
      appearance.body = 'body_pointy_strawberry';
      appearance.marking = 'marking_dapple';
      appearance.cloudMood = 'cloud_strawberry';
    } else if (variant === 3) {
      appearance.body = 'body_melted_matcha';
      appearance.marking = 'none';
      appearance.cloudMood = 'cloud_sprout';
    }
  }
  return appearance;
}
