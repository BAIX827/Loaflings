<!-- PNG is primary runtime format; SVG archived under character/svg/ -->
# Hatch visual phases

LEAD lock 2026-09-18 (Game Art Director table). Old “1000 per stage” retired.

**activityHits** = keystrokes + clicks (either counts).

| Phase | Cumulative activityHits | Asset (PNG primary) |
|---|---|---|
| `egg` | 0–2999 | `character/png/Pet_Egg_Master.png` (fallback `character/svg/…`) |
| `cracking` | 3000–7999 | `Pet_Egg_Cracking` |
| `hatching` | 8000–13999 | `Pet_Hatching` |
| `newborn` | 14000–20999 | `Pet_Newborn` |
| `growing` | 21000–28999 | `Pet_Growing` |
| `adult` | 29000+ | `Pet_Base_Master` / `Pet_Adult` |

Band widths: 3k → 5k → 6k → 7k → 8k → ∞. Daytime look only; day-end Save still `hatchDay()` (one egg/day). Gene stack from `newborn` up; egg/cracking/hatching stay shell-forward.

CORE: `src/core/hatchProgress.ts` (`HATCH_STAGE_THRESHOLDS`).
