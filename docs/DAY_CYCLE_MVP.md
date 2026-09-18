# Loaflings MVP — Daily Egg Cycle (DAY-CORE)

Confirmed with 老大:

1. **One egg per day** → grow from behaviour → hatch one Loafling → next day new egg.
2. **Visual hatch progress**: egg → cracking → fully hatched, **one stage per 1000 clicks**.

## Visual stages (companion art)

| Stage | Phase id | Clicks | Art |
|------:|----------|-------:|-----|
| 0 | `egg` | 0–999 | whole egg |
| 1 | `cracking` | 1000–1999 | slightly hatched / cracked |
| 2 | `hatched` | 2000+ | fully hatched look |

Constant: `CLICKS_PER_HATCH_STAGE = 1000` in `src/core/dayCycle.ts`.

```ts
hatchProgressFromProfile(profile, alreadySaved)
// → { stage, phase, clicks, nextStageAt, stageProgress, clicksPerStage }
```

- @DAY-DESK: poll live profile clicks, switch @DAY-ART assets by `phase`.
- @DAY-ART: provide SVG/PNG for `egg` / `cracking` / `hatched`.
- Threshold change: 老大 says the number; CORE updates the constant.

`alreadySaved === true` forces visual `hatched` after Day/Save into collection.

## Day / Save (genes + collection)

```text
hatchDay(profile) → one DaylingResult for profile.date
```

Visual stage 2 ≠ necessarily saved. Save still calls `hatchDay()` once per date.

## Cross-day

```text
shouldStartNewEgg(lastDate, today) + SENSE ensureToday()
```

Never merge multiple days into one creature.

## Related

- Genes / energy: `docs/GENE_CONTRACT_MVP.md`
- Sense clicks field: live profile `clicks`
