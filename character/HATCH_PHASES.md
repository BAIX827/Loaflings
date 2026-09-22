<!-- PNG is primary runtime format; SVG archived under character/svg/ (do not delete) -->
# Hatch visual phases

LEAD lock 2026-09-18 (Game Art Director table). Old “1000 per stage” retired.

**Display:** use `character/png/*.png` only for the pet. SVG under `character/svg/` stays in repo for archive / future edit — DESK must not fall back to SVG for the companion window.

The runtime PNG sequence uses one reference-aligned watercolor family and transparent backgrounds so every phase can sit directly on the desktop without a rectangular art panel.

**activityHits** = keystrokes + clicks (either counts).

| Phase | Default cumulative activityHits (goal 20,000) | Asset (PNG only) |
|---|---|---|
| `egg` | 0–2068 | `character/png/Pet_Egg_Master.png` |
| `cracking` | 2069–5516 | `character/png/Pet_Egg_Cracking.png` |
| `hatching` | 5517–9654 | `character/png/Pet_Hatching.png` |
| `newborn` | 9655–14482 | `character/png/Pet_Newborn.png` |
| `growing` | 14483–19999 | `character/png/Pet_Growing.png` |
| `adult` | 20000+ | `character/png/Pet_Adult.png` (alias `Pet_Base_Master.png`) |

The player can set any whole-number goal of at least 1,000 in Settings. Stage floors scale from the original 0 / 3 / 8 / 14 / 21 / 29 proportions and round to whole hits. Daytime look only; Save still uses `hatchDay()` (one egg/day). Gene stack from `newborn` up; egg/cracking/hatching stay shell-forward.

CORE: `src/core/hatchProgress.ts` (`HATCH_STAGE_THRESHOLDS`).
