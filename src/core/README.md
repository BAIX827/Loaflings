# src/core — Loaflings growth rules (DAY-CORE)

Pure rules engine (no Electron, no hooks): profile → energy → genes → settle / hatch stages / idle mood hints.

## Layout (kept thin on purpose)

| Module | Role |
|---|---|
| `profile.ts` | Count-only input from SENSE |
| `energy.ts` | Work / Explore / Dream |
| `genes.ts` | body / cloud / face / tail |
| `rng.ts` | Seeded PRNG |
| `settle.ts` | `settleDay()` → one DaylingResult |
| `hatchProgress.ts` | 6 visual stages from clicks + keystrokes; configurable goal |
| `appearance.ts` | Deterministic adult modular appearance recipe |
| `dayCycle.ts` | egg lifecycle + `hatchDay` / new-day |
| `idleMood.ts` | Optional idle expr/pose weights (presentation only) |
| `index.ts` | Public barrel |

## Docs

- `docs/GENE_CONTRACT_MVP.md`
- `docs/DAY_CYCLE_MVP.md`
- `docs/CORE_REFERENCES.md`
