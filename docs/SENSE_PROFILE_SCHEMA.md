# DAY-SENSE — Daily Activity Profile Schema (MVP)

Status: aligned with `src/core/profile.ts`  
Owner: DAY-SENSE · Consumer: DAY-CORE

## Principles

- Count-only behavioural stats
- Local JSON
- Never typed text / documents / screenshots / window titles

## Fields

| Field | Type | Notes |
|---|---|---|
| `date` | `string` | `YYYY-MM-DD` local |
| `seedKey` | `string` | Stable install id for seeded RNG |
| `keystrokes` | `number` | Count only |
| `clicks` | `number` | Count only |
| `mouseTravel` | `number` | Metres (consistent local unit) |
| `idleSec` | `number` | Idle seconds |
| `activeSec` | `number` | Non-idle seconds |
| `focusSessions` | `{ durationSec: number }[]` | Focus slices |
| `windowSwitches` | `number` | Switch count |
| `activeHours` | `number[24]` | Active seconds per local hour 0–23 |

## Example

See `src/sense/fixtures/demo-day.json`.

## Code

- Types: `src/sense/profile.ts`
- Aggregator stub: `src/sense/builder.ts`
- Re-export: `src/sense/index.ts`
