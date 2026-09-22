# Loaflings MVP — Daily Growth Cycle (DAY-CORE)

Confirmed with 老大 + `reference/process.png`:

1. **One active egg at a time** → grow from behaviour → Save hatches one Loafling into collection.
   At the next local day, a completed egg is replaced automatically; an unfinished egg waits for the player to continue it or choose a new egg.
2. **Visual growth**: **6 stages**, **cumulative activityHits** (LEAD 2026-09-18).
   activityHits = **clicks + keystrokes**. Thresholds: 0 / 3k / 8k / 14k / 21k / 29k → adult.
   See `character/HATCH_PHASES.md` (old equal 1000/stage retired).

## Visual stages (companion art)

| Stage | Phase id | activityHits (keys+clicks) | process.png |
|------:|----------|---------------------------:|-------------|
| 0 | `egg` | 0–2999 | 01 蛋 |
| 1 | `cracking` | 3000–7999 | 02 开始裂开 |
| 2 | `hatching` | 8000–13999 | 03 破壳而出 |
| 3 | `newborn` | 14000–20999 | 04 初生幼体 |
| 4 | `growing` | 21000–28999 | 05 慢慢长大 |
| 5 | `adult` | 29000+ | 06 成体（模块化 SVG 配方） |

Thresholds: `HATCH_STAGE_THRESHOLDS` in `src/core/hatchProgress.ts` (see `character/HATCH_PHASES.md`).

```ts
hatchProgressFromProfile(profile, alreadySaved)
// → { stage, phase, inputs, clicks, keystrokes, nextStageAt, stageProgress, ... }
```

- @DAY-DESK: use live profile (clicks **and** keys); switch art by `phase`.
- @DAY-ART: six assets keyed to the phase ids above.
- Threshold change: 老大 says the number; CORE updates the constant.

`alreadySaved === true` forces visual `adult` after Day/Save into collection.

**Breaking vs prior 3-phase MVP:** old `hatched` visual id is replaced by `hatching` / `newborn` / `growing` / `adult`. DESK must not expect only three phases.

## Day / Save (genes + collection)

```text
hatchDay(profile) → one DaylingResult for profile.date
```

Visual `adult` ≠ necessarily saved. Save still calls `hatchDay()` once per date.

Adult rendering uses `DaylingResult.appearance`. Existing egg through growing
PNG assets remain unchanged. Missing modular files fall back to the existing
rarity/adult PNG.

## Cross-day

```text
shouldStartNewEgg(lastDate, today) + SENSE ensureToday()
```

- If the previous egg was saved/hatched, the new local day starts a fresh egg.
- If it was unfinished, DESK persists a required choice:
  - **Continue** keeps the egg's accumulated clicks + keystrokes and adds today's activity.
  - **New egg** sets a baseline at the moment of the choice, so earlier activity that day is not assigned to the replacement egg.
- The continued click/keystroke values are also supplied to CORE settlement for that egg. Other behaviour fields remain today's live profile.
- All-time count statistics are separate from egg progress. Replacing an egg never clears those totals.

## Related

- Genes / energy: `docs/GENE_CONTRACT_MVP.md`
- Sense clicks field: live profile `clicks`
- Art board: `reference/process.png`

## Idle presentation (optional)

`idleMoodFromProfile(profile)` → expression/pose weights for DESK random idle.
Presentation only — does not change genes, rarity, or collection.
Aligns with `character/IDLE_MVP.md` ids (`normal`/`happy`/`sleepy`/`surprised`/`content`, `sit`/`stretch`/`lie`).

