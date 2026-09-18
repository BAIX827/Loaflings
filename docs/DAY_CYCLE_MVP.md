# Loaflings MVP — Daily Growth Cycle (DAY-CORE)

Confirmed with 老大 + `reference/process.png`:

1. **One egg per day** → grow from behaviour → Save hatches one Loafling into collection → next day new egg.
2. **Visual growth**: **6 stages**, **cumulative activityHits** (LEAD 2026-09-18).
   activityHits = **clicks + keystrokes**. Thresholds: 0 / 3k / 8k / 14k / 21k / 29k → adult.
   See `character/HATCH_PHASES.md` (old equal 1000/stage retired).

## Visual stages (companion art)

| Stage | Phase id | Inputs (clicks+keys) | process.png |
|------:|----------|---------------------:|-------------|
| 0 | `egg` | 0–999 | 01 蛋 |
| 1 | `cracking` | 1000–1999 | 02 开始裂开 |
| 2 | `hatching` | 2000–2999 | 03 破壳而出 |
| 3 | `newborn` | 3000–3999 | 04 初生幼体 |
| 4 | `growing` | 4000–4999 | 05 慢慢长大 |
| 5 | `adult` | 5000+ | 06 成体 |

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

## Cross-day

```text
shouldStartNewEgg(lastDate, today) + SENSE ensureToday()
```

Never merge multiple days into one creature.

## Related

- Genes / energy: `docs/GENE_CONTRACT_MVP.md`
- Sense clicks field: live profile `clicks`
- Art board: `reference/process.png`

## Idle presentation (optional)

`idleMoodFromProfile(profile)` → expression/pose weights for DESK random idle.
Presentation only — does not change genes, rarity, or collection.
Aligns with `character/IDLE_MVP.md` ids (`normal`/`happy`/`sleepy`/`surprised`/`content`, `sit`/`stretch`/`lie`).

