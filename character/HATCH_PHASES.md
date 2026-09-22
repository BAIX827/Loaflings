# Hatch visual phases

LEAD lock 2026-09-18 (Game Art Director table). Old “1000 per stage” retired.

**Display:** egg through growing use `character/png/*.png`; adults use the layered SVG recipe in `character/modular/manifest.json`, with adult PNGs as a fallback. SVG under `character/svg/` stays in the repository as archived geometry and is not a runtime fallback.

The five pre-adult PNG stages use one reference-aligned watercolor family and transparent backgrounds so they can sit directly on the desktop without a rectangular art panel.

**activityHits** = keystrokes + clicks (either counts).

| Phase | Default cumulative activityHits (goal 20,000) | Runtime art |
|---|---|---|
| `egg` | 0–2068 | `character/png/Pet_Egg_Master.png` |
| `cracking` | 2069–5516 | `character/png/Pet_Egg_Cracking.png` |
| `hatching` | 5517–9654 | `character/png/Pet_Hatching.png` |
| `newborn` | 9655–14482 | `character/png/Pet_Newborn.png` |
| `growing` | 14483–19999 | `character/png/Pet_Growing.png` |
| `adult` | 20000+ | `character/modular/` layered SVG; rarity/adult PNG fallback |

The player can set any whole-number goal of at least 1,000 in Settings. Stage floors scale from the original 0 / 3 / 8 / 14 / 21 / 29 proportions and round to whole hits. Save is available only at the adult goal. A completed egg is replaced on the next local day; an unfinished egg waits for a Continue / New Egg choice.

CORE: `src/core/hatchProgress.ts` (`HATCH_STAGE_THRESHOLDS`).
