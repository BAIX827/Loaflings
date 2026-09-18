# DAY-SENSE

Count-only activity for Loaflings.

## Layout

| File | Role |
|---|---|
| `profile.ts` / `profile.cjs` | `DailyActivityProfile` contract (TS + Electron CJS) |
| `inputHook.cjs` | Global key/click/move hook (no characters) |
| `liveSensor.js` | Day profile aggregation + persist |
| `builder.ts` | Fixture / offline builder |
| `fixtures/` | Demo day JSON |

## Privacy

Never reads typed text, documents, screenshots, or window titles.

## Refs

See `docs/SENSE_REFERENCES.md` (Bongo Cat–class projects).
