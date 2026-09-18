/**
 * End-of-day settlement — profile → energies → genes / traits / event log.
 */

import { computeEnergy, type EnergyPool } from './energy';
import {
  resolveGenes,
  resolvePersonality,
  resolveRarity,
  styleForRarity,
  type CreatureGenes,
  type Personality,
  type Rarity,
  type StyleId,
} from './genes';
import type { DailyActivityProfile } from './profile';
import { rngFromKeys } from './rng';

export type IdleEventKind =
  | 'slept'
  | 'fished'
  | 'explored'
  | 'brought_item'
  | 'none';

export interface IdleEvent {
  kind: IdleEventKind;
  note: string;
}

export interface DaylingResult {
  /** Always one creature for this calendar date. */
  date: string;
  /** Settled form — egg/growing live in dayCycle.ts until hatch. */
  kind: 'loafling';
  energy: EnergyPool;
  genes: CreatureGenes;
  personality: Personality;
  rarity: Rarity;
  style: StyleId;
  traits: string[];
  events: IdleEvent[];
}

export function settleDay(profile: DailyActivityProfile): DaylingResult {
  const energy = computeEnergy(profile);
  const geneRng = rngFromKeys(profile.date, profile.seedKey, 'genes');
  const rarityRng = rngFromKeys(profile.date, profile.seedKey, 'rarity');
  const eventRng = rngFromKeys(profile.date, profile.seedKey, 'idle');

  const genes = resolveGenes(profile, energy, geneRng);
  const personality = resolvePersonality(energy);
  const rarity = resolveRarity(energy, rarityRng);
  const style = styleForRarity(rarity);
  const traits = buildTraits(energy, personality);
  const events = rollIdleEvents(profile, energy, eventRng);

  return {
    date: profile.date,
    kind: 'loafling',
    energy,
    genes,
    personality,
    rarity,
    style,
    traits,
    events,
  };
}

function buildTraits(energy: EnergyPool, personality: Personality): string[] {
  const traits: string[] = [personality];
  if (energy.dream >= energy.work && energy.dream >= energy.explore) {
    traits.push('soft_idle');
  }
  if (energy.work > 30) traits.push('focused');
  if (energy.explore > 30) traits.push('window_hopper');
  return [...new Set(traits)];
}

function rollIdleEvents(
  profile: DailyActivityProfile,
  energy: EnergyPool,
  rng: () => number,
): IdleEvent[] {
  if (profile.idleSec < 600) {
    return [{ kind: 'none', note: 'Stayed nearby.' }];
  }
  const roll = rng();
  if (energy.dream >= energy.work && roll < 0.45) {
    return [{ kind: 'slept', note: 'Napped while you were away.' }];
  }
  if (roll < 0.7) {
    return [{ kind: 'explored', note: 'Wandered off and came back.' }];
  }
  if (roll < 0.9) {
    return [{ kind: 'fished', note: 'Went fishing. Catch unclear.' }];
  }
  return [{ kind: 'brought_item', note: 'Brought back a mysterious crumb.' }];
}
