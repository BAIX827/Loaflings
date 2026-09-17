# Loaflings MVP — Daily Egg Cycle (DAY-CORE)

Confirmed with 老大: **one egg per day → hatch one pet → next day new egg**.

## Loop

```text
start of local day     → egg (embryo / undefined)
computer behaviour     → growing (SENSE profile accumulates)
end of day / Save      → hatchDay(profile) → one Loafling in collection
next local date        → shouldStartNewEgg → startEgg(today)
```

Never fold multiple days into one creature.

## API

| Function | Owner use |
|---|---|
| `startEgg(date, seedKey)` | DESK / SENSE on day roll |
| `phaseFromProfile(profile, alreadyHatched)` | DESK UI: egg vs growing vs hatched |
| `hatchDay(profile)` | DESK Day/Save reveal — wraps `settleDay()` |
| `shouldStartNewEgg(lastDate, today)` | Align with SENSE `ensureToday()` |
| `localToday()` | Helper for local `YYYY-MM-DD` |

## Persistence rules (DESK)

- Collection entries keyed by `date` (one hatch per date)
- Refusing a second hatch for the same `date` is correct
- Live profile date must match egg date before hatch

## Related

- Genes / energy: `docs/GENE_CONTRACT_MVP.md`
- Sense day boundary: `ensureToday()` in live sensor
