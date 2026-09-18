# Loaflings desk shell (Mac companion)

Minimal Electron companion for **Loaflings / 摸鱼灵**: always-on-top, frameless, transparent window.

**Day loop:** each local calendar day starts as an **egg**; **Day** (reveal) or **Save** hatches today’s settled Loafling from CORE; next day → new egg (`ensureToday` + desk day-state).

CORE contract (`docs/DAY_CYCLE_MVP.md`): `phaseFromProfile` / `hatchDay` / `shouldStartNewEgg` via `hooks/coreDayCycle.js` (falls back to `settleDay` stub if dayCycle missing). `DaylingResult.kind = 'loafling'`.

- Morning / unsettled: simple egg (SVG/CSS) — not full pet art
- After hatch: `character/Pet_Base_Master.svg`
- Icon: `src/art/AppIcon.png`
- MVP parts: `body` / `cloud` / `face` / `tail` (mirrors `src/art/parts.ts`)
- Demo day: `src/sense/fixtures/demo-day.json` → `assertProfileShape` → `settleDay()` (`src/core`)
- Live day (optional): `senseLive` / `getLiveSettle()` when Accessibility + uiohook are available; `ensureToday()` rolls profile date
- Local collection: Electron `userData/collection.json` (one upsert per `date:seedKey`)
- Day phase: Electron `userData/day-state.json` (`egg` | `hatched` per local date)

## Run (macOS)

From the **repo root**:

```bash
npm install
npm start
```

Aliases: `npm run desk` · `npm run demo`

Smoke settle without UI:

```bash
npm run settle:demo
```

Requires Node 18+.

### Try egg → hatch → Save

1. Launch with `npm start` — companion shows **Today’s egg** (not the pet).
2. Click **Day** — settles (live if available, else demo), hatches pet, opens reveal panel (name/type/rarity/genes…).
3. Click **Save** — hatches if still egg, upserts into `userData/collection.json` (badge updates).
4. After local midnight / day roll — egg returns (SENSE `ensureToday` + desk day-state).
5. `settle:demo` CLI path unchanged.

## Layout

| Path | Role |
|------|------|
| `main.js` | Transparent always-on-top window + IPC + day boundary poll |
| `dayState.js` | Persist egg/hatched phase per local date under `userData` |
| `pipeline.js` | Loads SENSE fixture → CORE `settleDay()` |
| `collection.js` | Persist/load local collection under `userData` |
| `preload.js` | Exposes parts + day/settle/collection APIs |
| `index.html` / `companion.css` | Egg + pet chrome + reveal panel |
| `renderer.js` | Egg↔hatch UI + Day/Save |
| `mvpParts.js` | Mirrors `src/art/parts.ts` |
| `hooks/senseLive.js` | Live counters → profile → settle; `ensureToday()` |
| `runDemoSettle.ts` | CLI smoke for the fixture pipeline |

## IPC (renderer → main)

| Channel | Purpose |
|---------|---------|
| `loaflings:get-day-state` | Sync day boundary; return egg/hatched phase |
| `loaflings:hatch-day` | Persist hatched phase (after CORE `hatchDay`) |
| `loaflings:get-demo-settle` | Fixture → settle |
| `loaflings:get-live-settle` | Live sense → settle |
| `loaflings:get-day-settle` | Live if available, else demo |
| `loaflings:collect-day` | Settle + upsert collection + hatch |
| `loaflings:get-collection` | Read collection JSON |

Main may push `loaflings:day-state` when the calendar day rolls (new egg).

## Wiring notes

- SENSE sensors not required for MVP — fixture is enough; live is optional
- Day boundary: desk `ensureDayState()` + SENSE `ensureToday()` (when live is up)
- Own-window exclusion: main sends `loaflings:window-id` / `excludeWindowIds`
- No gene/sense formulas in DESK — those stay in `src/core` / `src/sense`
- CORE has no separate `name` field; desk display name is `personality · rarity`
- No new creature art — egg is a simple SVG/CSS placeholder until hatch
