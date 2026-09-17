# src/core — Loaflings growth rules (DAY-CORE)

Art-agnostic rules engine: daily activity profile → Work / Explore / Dream energy → genes / traits / end-of-day settlement.

## MVP surface

| Module | Role |
|---|---|
| `profile.ts` | Input shape from DAY-SENSE (count-only; no content) |
| `energy.ts` | Work / Explore / Dream accumulators |
| `genes.ts` | Gene fields `body` / `cloud` / `face` / `tail` |
| `rng.ts` | Seeded PRNG for reproducible offline / mutation rolls |
| `settle.ts` | End-of-day settlement → `DaylingResult` |
| `index.ts` | Public exports |

## Contract docs

- Gene ↔ part IDs: `character/PARTS_MVP.md` (owned with DAY-ART)
- Full gene contract (this milestone): `docs/GENE_CONTRACT_MVP.md`

Do not invent part IDs. Do not read typed text or screenshots.
