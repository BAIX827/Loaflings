# src/core — Loaflings growth rules (DAY-CORE)

Art-agnostic rules engine: daily activity profile → Work / Explore / Dream energy → genes / traits / end-of-day hatch.

## Daily form (locked with 老大)

```text
morning: egg (or undefined embryo)
during day: growing from behaviour (SENSE profile)
end of day: hatch → one Loafling into collection
next day: brand-new egg (never merge days)
```

## MVP surface

| Module | Role |
|---|---|
| `profile.ts` | Input shape from DAY-SENSE (count-only) |
| `energy.ts` | Work / Explore / Dream |
| `genes.ts` | `body` / `cloud` / `face` / `tail` |
| `rng.ts` | Seeded PRNG |
| `settle.ts` | `settleDay()` → one `DaylingResult` |
| `dayCycle.ts` | egg → growing → `hatchDay()` / `shouldStartNewEgg()` |
| `index.ts` | Public exports |

## Docs

- `docs/GENE_CONTRACT_MVP.md`
- `docs/DAY_CYCLE_MVP.md`
