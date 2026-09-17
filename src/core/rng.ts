/**
 * Seeded PRNG — same (date + seedKey + salt) ⇒ same rolls.
 * Mulberry32; good enough for MVP offline / mutation events.
 */

export function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) || 1;
}

export type Rng = () => number;

export function createRng(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFromKeys(date: string, seedKey: string, salt: string): Rng {
  return createRng(hashSeed(`${date}|${seedKey}|${salt}`));
}

export function pickWeighted<T extends string>(
  rng: Rng,
  options: ReadonlyArray<{ id: T; weight: number }>,
): T {
  const total = options.reduce((s, o) => s + Math.max(0, o.weight), 0);
  if (total <= 0) return options[0].id;
  let roll = rng() * total;
  for (const o of options) {
    roll -= Math.max(0, o.weight);
    if (roll <= 0) return o.id;
  }
  return options[options.length - 1].id;
}
