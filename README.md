# Loaflings / 摸鱼灵

Passive desktop companion for macOS and Windows: computer activity grows an egg through six stages. The default adult goal is 20,000 clicks + keystrokes, configurable to any whole number of at least 1,000; an adult can then be saved to the local collection.

> You work. It grows. Every day leaves behind a creature.

## Quick start (dev)

```bash
cd Loaflings   # or your clone of this repo
npm install
npm start
```

- Companion starts as an **egg**; **Day** shows growth before the adult goal and **Save** becomes available at the goal. Collection lives in Electron's local `userData/collection.json`.
- An unfinished egg can continue across local days or be replaced after the player chooses; a completed egg gives way to a new one on the next day.
- Live global input counts need macOS **Accessibility** (and Input Monitoring if prompted); without permission, the app can run in idle-only mode.
- Fixture-only settle check: `npm run settle:demo`
- Full non-UI verification: `npm run verify`
- Optional local coins reward daily activity, a completed focus session and the first real collection; see [`docs/COIN_ECONOMY.md`](docs/COIN_ECONOMY.md). Existing wearables stay free.

### First play / 第一次游玩

1. Start the app and leave it running while you use your computer. Clicks and keystrokes grow the egg through six stages; **Day / 今日** shows the current goal and the activity still needed.
2. **Day / 今日** also shows moments recorded from count-only focus, idle, mouse travel and window-switch activity. **Pack / 背包 → Moments / 奇遇** keeps local history. A brief character reaction may appear when a new moment is recorded.
3. At the adult goal, choose **Save / 收藏**. The new collection entry keeps a bilingual hatch memory based on its settled personality, traits and recorded moments. Open it again from the Pack calendar or collection. Older entries show a neutral summary.
4. At a day change, an unfinished egg asks whether to continue its progress or start a new egg. Earlier moments stay in Pack history; only moments belonging to the current egg can enter its memory.
5. **Pack / 背包** also has the 10-form catalog (five basic forms and five hatchable mutations), all-time statistics and coins. Coins cannot be spent yet; adult wardrobe items remain free and are grouped into hat, face accessory and outfit tabs. Change language, hatch goal, movement (manual drag, gentle wander or fixed position) and window layer in **Settings / 设置**, where you can reopen the first-run guide. On Windows, Desktop bottom places the companion behind regular windows; it can come forward while being used and returns to the bottom when focus leaves.

The first-run guide is available in Chinese and English. Moment history starts when this feature is enabled; it does not reconstruct events from older activity records. A recorded moment stays in local history even when its brief desktop reaction is missed.

### Packaged `.app` (Mac)

```bash
npm run pack    # → dist/mac-arm64/Loaflings.app (or dist/mac/)
# npm run dist  # also builds .dmg
```

Details + Gatekeeper note: `src/desk/README.md` (Package Mac `.app`).

### Windows release

```powershell
npm run dist:win
```

This creates an x64 installer and a no-install portable `.exe` in `dist/`. Friend-facing download and safety-check instructions are in `docs/WINDOWS_RELEASE.md`.
The previously published 0.1.0 Windows download uses the older 29,000-hit goal; build current source for the configurable goal and coin wallet.


Repo: https://github.com/BAIX827/Loaflings

## Core loop

```text
computer behaviour (DAY-SENSE)
        → DailyActivityProfile (count-only JSON)
        → energy + genes + settle (DAY-CORE)
        → PNG egg-through-growing stages / layered SVG adult appearance (DAY-ART)
        → companion + wardrobe + collection + catalogue (DAY-DESK)
```

One local calendar day → one activity profile. A finished egg is replaced on the next day; an unfinished egg waits for a Continue / New Egg choice.

The Pack also includes all-time activity statistics, a local coin wallet and a history of observed moments. [Version 2](docs/VERSION_2_PLAN.md) records four kinds of count-based moments, shows a quiet desktop reaction, and saves a bilingual memory with each new adult collection entry. Extended live-desktop checks of event frequency and animation are still pending.

## Privacy

We count keystrokes / clicks / mouse travel / idle / focus / window-switch proxies.  
We **never** read typed text, documents, screenshots, or window titles.

## File structure

```text
Loaflings/
├── README.md                 ← you are here
├── PROJECT.md                ← product one-pager
├── AGENTS.md                 ← agent working rules
├── WORK_PLAN.md              ← current tasks + log
├── package.json              ← Electron demo scripts
├── character/                ← canonical pet art (authority)
│   ├── png/                  ← runtime hatch stages + adult fallbacks
│   ├── modular/              ← layered adult SVGs, manifest and preview
│   ├── svg/                  ← editable geometry/archive
│   ├── loafling-standard-base.css
│   ├── LOAFLING_CHARACTER_SPEC_UPDATED.md
│   ├── PARTS_MVP.md          ← body / cloud / face / tail
│   ├── ASSET_PRODUCTION_GUIDE.md ← Figma / batch art / export rules
│   └── STYLE_NOTES.md
├── reference/                ← inspiration only (not requirements)
├── docs/
│   ├── MVP_DEMO_ACCEPTANCE.md
│   ├── GENE_CONTRACT_MVP.md
│   ├── DAY_CYCLE_MVP.md
│   ├── COIN_ECONOMY.md
│   ├── VERSION_2_PLAN.md    ← implemented scope and remaining live-desktop checks
│   ├── SENSE_PROFILE_SCHEMA.md
│   └── SENSE_LIVE.md
└── src/
    ├── sense/                ← DAY-SENSE
    │   ├── profile.ts        ← DailyActivityProfile (aligned with core)
    │   ├── builder.ts
    │   ├── liveSensor.js     ← uiohook + powerMonitor
    │   ├── fixtures/demo-day.json
    │   └── index.ts
    ├── core/                 ← DAY-CORE
    │   ├── profile.ts
    │   ├── energy.ts
    │   ├── genes.ts
    │   ├── settle.ts         ← settleDay()
    │   ├── dayCycle.ts       ← egg → growing → hatch (one/day)
    │   ├── rng.ts
    │   └── index.ts
    ├── art/                  ← DAY-ART
    │   ├── parts.ts
    │   └── AppIcon.png
    └── desk/                 ← DAY-DESK (Electron shell)
        ├── main.js
        ├── preload.js
        ├── renderer.js
        ├── pipeline.js
        ├── collection.js
        ├── hooks/senseLive.js
        └── …
```

## Owners

| Area | Agent |
|------|--------|
| Sense profile + live counters | DAY-SENSE |
| Energy / genes / settle | DAY-CORE |
| Parts / icon / visual specs | DAY-ART (+ figma bro for Figma SVG) |
| macOS/Windows shell / package / collection UI | DAY-DESK |
| Scope / acceptance | DAY-LEAD |

## MVP gene parts

`body` / `cloud` / `face` / `tail` (not `sprout`). See `docs/GENE_CONTRACT_MVP.md` and `character/PARTS_MVP.md`.

The four gene fields remain stable. Behaviour drives energy, personality, traits and rarity; a separate appearance recipe selects modular adult SVG layers and optional wearables. Egg through growing stages use PNGs, and adult PNGs remain fallbacks. See `character/modular/README.md`.

## Docs priority

1. Latest instruction from 老大  
2. `PROJECT.md`  
3. `WORK_PLAN.md`  
4. `docs/*` contracts  
5. `reference/` (inspiration only)
