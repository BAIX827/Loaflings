# Hatch visual phases

**Source of truth:** DAY-CORE `hatchProgressFromProfile` + `docs/DAY_CYCLE_MVP.md`  
**Board:** `reference/process.png` (6 stages)

| Stage | Phase | Clicks | Asset (ART fills gaps) |
|------:|-------|-------:|------------------------|
| 0 | `egg` | 0–999 | `character/Pet_Egg_Master.svg` |
| 1 | `cracking` | 1000–1999 | `character/Pet_Egg_Cracking.svg` |
| 2 | `hatching` | 2000–2999 | _(ART TBD — peek from shell)_ |
| 3 | `newborn` | 3000–3999 | _(ART TBD)_ |
| 4 | `growing` | 4000–4999 | _(ART TBD)_ |
| 5 | `adult` | 5000+ | `character/Pet_Base_Master.svg` |

Notes:
- Day-end Save still uses `hatchDay()` for collection — these are daytime look stages.
- Do not invent extra phase ids without LEAD/CORE.
