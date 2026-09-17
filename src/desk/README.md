# Loaflings desk shell (Mac companion)

Minimal Electron companion for **Loaflings / 摸鱼灵**: always-on-top, frameless, transparent window.

- Pet: `character/Pet_Base_Master.svg`
- Icon: `src/art/AppIcon.png`
- MVP parts: `body` / `cloud` / `face` / `tail` (mirrors `src/art/parts.ts`)
- Demo day: `src/sense/fixtures/demo-day.json` → `assertProfileShape` → `settleDay()` (`src/core`)
- Live day (optional): `senseLive` / `getLiveSettle()` when Accessibility + uiohook are available
- Local collection: Electron `userData/collection.json` (one upsert per `date:seedKey`)

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

### Try end-of-day reveal + collection

1. Launch with `npm start`.
2. Click **Day** — overlay shows name/type/rarity/personality/genes/traits (from CORE settle).
3. Click **Save** — upserts today’s Loafling into `userData/collection.json` (badge updates).
4. Settle source prefers **live** when sense is running; otherwise **demo** fixture. `settle:demo` CLI path unchanged.

## Layout

| Path | Role |
|------|------|
| `main.js` | Transparent always-on-top window + IPC |
| `pipeline.js` | Loads SENSE fixture → CORE `settleDay()` |
| `collection.js` | Persist/load local collection under `userData` |
| `preload.js` | Exposes parts + settle/collection APIs |
| `index.html` / `companion.css` | Companion chrome + reveal panel styles |
| `renderer.js` | SVG pet + reveal panel + Save |
| `mvpParts.js` | Mirrors `src/art/parts.ts` |
| `hooks/senseLive.js` | Live counters → profile → settle |
| `runDemoSettle.ts` | CLI smoke for the fixture pipeline |

## IPC (renderer → main)

| Channel | Purpose |
|---------|---------|
| `loaflings:get-demo-settle` | Fixture → settle |
| `loaflings:get-live-settle` | Live sense → settle |
| `loaflings:get-day-settle` | Live if available, else demo |
| `loaflings:collect-day` | Settle + upsert collection |
| `loaflings:get-collection` | Read collection JSON |

## Wiring notes

- SENSE sensors not required for MVP — fixture is enough; live is optional
- Own-window exclusion: main sends `loaflings:window-id` / `excludeWindowIds`
- No gene/sense formulas in DESK — those stay in `src/core` / `src/sense`
- CORE has no separate `name` field; desk display name is `personality · rarity`
