<!-- PNG is primary runtime format; SVG archived under character/svg/ (do not delete) -->
# Hatch visual phases

LEAD lock 2026-09-18 (Game Art Director table). Old “1000 per stage” retired.

**Display:** use `character/png/*.png` only for the pet. SVG under `character/svg/` stays in repo for archive / future edit — DESK must not fall back to SVG for the companion window.

**activityHits** = keystrokes + clicks (either counts).

| Phase | Cumulative activityHits | Asset (PNG only) |
|---|---|---|
| `egg` | 0–2999 | `character/png/Pet_Egg_Master.png` |
| `cracking` | 3000–7999 | `character/png/Pet_Egg_Cracking.png` |
| `hatching` | 8000–13999 | `character/png/Pet_Hatching.png` |
| `newborn` | 14000–20999 | `character/png/Pet_Newborn.png` |
| `growing` | 21000–28999 | `character/png/Pet_Growing.png` |
| `adult` | 29000+ | `character/png/Pet_Adult.png` (alias `Pet_Base_Master.png`) |

Band widths: 3k → 5k → 6k → 7k → 8k → ∞. Daytime look only; day-end Save still `hatchDay()` (one egg/day). Gene stack from `newborn` up; egg/cracking/hatching stay shell-forward.

CORE: `src/core/hatchProgress.ts` (`HATCH_STAGE_THRESHOLDS`).
