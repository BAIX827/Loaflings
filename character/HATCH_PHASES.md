# Hatch visual phases (DAY-ART)

Aligned with DAY-CORE `hatchProgressFromProfile` / clicks per 1000:

| Phase | Clicks | Asset |
|---|---|---|
| `egg` | 0–999 | `character/Pet_Egg_Master.svg` |
| `cracking` | 1000–1999 | `character/Pet_Egg_Cracking.svg` |
| `hatched` | 2000+ (appearance) | `character/Pet_Base_Master.svg` |

Notes:
- Day-end Save still uses `hatchDay()` for collection — these are daytime look stages.
- Same palette / cloud signature as cozy style (`STYLE_NOTES.md`).
- Companion should load these three paths only; do not invent extra stages without LEAD/CORE.
