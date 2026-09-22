# Loaflings desk shell (Mac companion)

Minimal Electron companion for **Loaflings / 摸鱼灵**: always-on-top, frameless, transparent window.

**Day loop:** a local day starts with an **egg**. The default adult goal is 20,000 activity hits; Settings can change it to any whole number of at least 1,000. All five intermediate thresholds scale proportionally. Before the goal, **Day** shows read-only growth progress and **Save** stays disabled with the exact remaining count. At the goal the Loafling becomes an adult and may be saved. A completed egg keeps its goal if Settings change later. At the next day, a completed egg is replaced automatically; an unfinished egg asks the player to continue with inherited clicks + keystrokes or replace it and restart that egg's count.

CORE contract (`docs/DAY_CYCLE_MVP.md`): `phaseFromProfile` / `hatchDay` / `shouldStartNewEgg` via `hooks/coreDayCycle.js` (falls back to `settleDay` stub if dayCycle missing). `DaylingResult.kind = 'loafling'`.

- Egg → growing: five transparent runtime PNG stages under `character/png/`
- Adult: layered SVG recipe from `character/modular/`; rarity PNGs remain a safe fallback
- Icon: `src/art/AppIcon.png`
- MVP parts: `body` / `cloud` / `face` / `tail` (mirrors `src/art/parts.ts`)
- Demo day: `src/sense/fixtures/demo-day.json` → `assertProfileShape` → `settleDay()` (`src/core`)
- Live day (optional): `senseLive` / `getLiveSettle()` when Accessibility + uiohook are available; `ensureToday()` rolls profile date
- Local collection: Electron `userData/collection.json` v2 (one upsert per `date:seedKey`, including `appearance`)
- Read-only catalogue: 9 reachable personality × rarity slots derived from the local collection; missing slots never write placeholder rows
- Day phase: Electron `userData/day-state.json` (`egg` | `growing` | `hatched`, plus a pending rollover choice)
- All-time count-only statistics: Electron `userData/activity-stats.json`; replacing an egg does not clear totals
- Local coin wallet: Electron `userData/coins.json`; three daily rewards are idempotent and capped at 30 coins. See `docs/COIN_ECONOMY.md`; existing wearables remain free.

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

Compile + tests + settle smoke:

```bash
npm run verify
```

Requires Node 18+.

### Try egg → hatch → Save

1. Launch with `npm start` — companion shows **Today’s egg** (not the pet).
2. Click **Day** below the current goal (20,000 by default) — opens the current stage, total progress and remaining-count panel without hatching.
3. At the goal, the adult appears and **Save** becomes available; Save upserts into `userData/collection.json` (badge updates).
4. After local midnight / day roll — a finished egg is replaced; an unfinished egg shows **Keep hatching / Choose a new egg**.
5. `settle:demo` CLI path unchanged.

## Package Mac `.app` (Dock / double-click)

Produces an **unsigned** local `.app` (MVP). Code signing / notarization is TODO when a Developer ID cert is available — Gatekeeper may warn on first open (see below).

From the **repo root** on a Mac:

```bash
git pull origin main
npm install
npm run pack          # .app only (faster)
# or
npm run dist          # .app + .dmg
```

### Where the `.app` lands

| Command | Output |
|---------|--------|
| `npm run pack` / `npm run dist:dir` | `dist/mac-arm64/Loaflings.app` (Apple Silicon) and/or `dist/mac/Loaflings.app` (Intel) |
| `npm run dist` | same `.app` folders **plus** `dist/Loaflings-0.1.0-*.dmg` |

`dist/` is gitignored — do not commit build artifacts.

### How to open

1. Finder → open `dist/mac-arm64/Loaflings.app` (or `dist/mac/Loaflings.app` on Intel).
2. Or: `open dist/mac-arm64/Loaflings.app`
3. Drag to **Applications** / Dock if you want a permanent Dock icon.
4. **First launch (unsigned):** right-click → **Open**, or System Settings → Privacy & Security → allow. Live sense still needs **Accessibility** (and Input Monitoring if prompted).

### Icon

Dock / `.app` icon comes from `src/art/AppIcon.png`. `electron-builder` generates `.icns` at pack time (no need to commit `build/icon.icns`).

### Notes

- Packaged entry is `src/desk/boot.js`; CORE/SENSE TypeScript is precompiled into `src/desk/runtime/*.cjs` before launch.
- Egg / hatch / reveal / collection / live sense behavior is unchanged vs `npm start`.
- **Must pack on macOS** so `uiohook-napi` gets the correct Darwin native binary. `esbuild` is build-time only. Config: `electron-builder.yml`.
- Linux can assemble an `.app` shell for config smoke tests, but that build is **not** Dock-ready (wrong natives).

## Layout

| Path | Role |
|------|------|
| `main.js` | Transparent always-on-top window + IPC + day boundary poll |
| `dayState.js` | Persist egg/hatched phase per local date under `userData` |
| `eggProgress.js` | Calculate carried egg counts and new-egg baselines |
| `activityStats.js` / `activityStatsCore.js` | Persist and deduplicate all-time count statistics |
| `pipeline.js` | Loads SENSE fixture → CORE `settleDay()` |
| `collection.js` | Persist/load local collection under `userData` |
| `catalog.js` | Project collection rows onto the 9-slot collected/missing catalogue |
| `characterRecipe.js` | Validate recipes, migrate old collection rows and resolve ordered SVG layers |
| `resultView.js` | Pure renderer-safe projection of CORE settle results |
| `../shared/jsonFile.cjs` | Shared atomic JSON persistence helper |
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
| `loaflings:get-catalog` | Read derived catalogue progress and slots |
| `loaflings:get-activity-stats` | Read all-time count totals |
| `loaflings:resolve-egg-rollover` | Continue the unfinished egg or replace it |

Main may push `loaflings:day-state` when the calendar day rolls (new egg).

## Wiring notes

- SENSE sensors not required for MVP — fixture is enough; live is optional
- Day boundary: desk `ensureDayState()` + SENSE `ensureToday()` (when live is up); unfinished progress pauses until the rollover choice is resolved
- No gene/sense formulas in DESK — those stay in `src/core` / `src/sense`
- CORE has no separate `name` field; desk display name is `personality · rarity`
- Runtime growth art remains PNG. Adult Loaflings compose body, mutation, expression, paws and cloud from `character/modular/manifest.json`.
- Browsing a historical collection entry keeps its adult art but changes the HUD to `Current egg: N`, so the live egg count cannot be mistaken for the historical Loafling's hatch count.
- If a modular adult asset is missing or invalid, the renderer falls back to the existing rarity/adult PNG instead of showing a broken pet.
- Modular adults use expression/cloud layer swaps for idle moods; newborn/growing phases retain the optional legacy idle PNG pool.
