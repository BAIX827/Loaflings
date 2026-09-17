# Loaflings desk shell (Mac companion)

Minimal Electron companion for **Loaflings / 摸鱼灵**: always-on-top, frameless, transparent window.

- Pet: `character/Pet_Base_Master.svg`
- Icon: `src/art/AppIcon.png`
- MVP parts: `body` / `cloud` / `face` / `tail` (mirrors `src/art/parts.ts`)
- Demo day: `src/sense/fixtures/demo-day.json` → `assertProfileShape` → `settleDay()` (`src/core`)

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

## Layout

| Path | Role |
|------|------|
| `main.js` | Transparent always-on-top window + IPC |
| `pipeline.js` | Loads SENSE fixture → CORE `settleDay()` |
| `preload.js` | Exposes parts + `getDemoSettle()` |
| `renderer.js` | SVG pet + minimal end-of-day reveal line |
| `mvpParts.js` | Mirrors `src/art/parts.ts` |
| `runDemoSettle.ts` | CLI smoke for the same pipeline |

## Wiring notes

- SENSE sensors not required for this MVP — fixture is enough
- Own-window exclusion: main sends `loaflings:window-id` for later `excludeWindowIds`
- No gene/sense formulas in DESK — those stay in `src/core` / `src/sense`
