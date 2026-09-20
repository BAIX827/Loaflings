# Loaflings desk shell (Mac companion)

Minimal Electron companion for **Loaflings / 摸鱼灵**: always-on-top, frameless, transparent window.

**Day loop:** each local calendar day starts as an **egg**; **Day** (reveal) or **Save** hatches today’s settled Loafling from CORE; next day → new egg (`ensureToday` + desk day-state).

CORE contract (`docs/DAY_CYCLE_MVP.md`): `phaseFromProfile` / `hatchDay` / `shouldStartNewEgg` via `hooks/coreDayCycle.js` (falls back to `settleDay` stub if dayCycle missing). `DaylingResult.kind = 'loafling'`.

- Morning → adult: six transparent runtime PNG stages under `character/png/`
- After settle: rarity chooses `style_common.png`, `style_rare.png`, or `style_epic.png`
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

Compile + tests + settle smoke:

```bash
npm run verify
```

Requires Node 18+.

### Try egg → hatch → Save

1. Launch with `npm start` — companion shows **Today’s egg** (not the pet).
2. Click **Day** — settles (live if available, else demo), hatches pet, opens reveal panel (name/type/rarity/genes…).
3. Click **Save** — hatches if still egg, upserts into `userData/collection.json` (badge updates).
4. After local midnight / day roll — egg returns (SENSE `ensureToday` + desk day-state).
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
| `pipeline.js` | Loads SENSE fixture → CORE `settleDay()` |
| `collection.js` | Persist/load local collection under `userData` |
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

Main may push `loaflings:day-state` when the calendar day rolls (new egg).

## Wiring notes

- SENSE sensors not required for MVP — fixture is enough; live is optional
- Day boundary: desk `ensureDayState()` + SENSE `ensureToday()` (when live is up)
- No gene/sense formulas in DESK — those stay in `src/core` / `src/sense`
- CORE has no separate `name` field; desk display name is `personality · rarity`
- Runtime creature art is PNG-only. SVG files stay editable references and are not used as shell fallback.
- If a future `character/png/idle/` pool is absent, the base pet keeps a subtle CSS breathing motion without repeated missing-asset work.
