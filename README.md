# Loaflings / 摸鱼灵

Passive desktop companion for macOS and Windows: **each day starts as an egg**, your computer habits grow it, and 29,000 clicks + keystrokes hatch one Loafling into your local collection.

> You work. It grows. Every day leaves behind a creature.

## Quick start (dev)

```bash
cd Loaflings   # or your clone of this repo
npm install
npm start
```

- Companion starts as an **egg**; **Day** reveals today’s settled Loafling; **Save** → `userData/collection.json` (see `src/desk/`)
- Live counters need macOS **Accessibility** (and Input Monitoring if prompted) for Electron / Loaflings
- Fixture-only settle check: `npm run settle:demo`
- Full non-UI verification: `npm run verify`

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


Repo: https://github.com/BAIX827/Loaflings

## Core loop

```text
computer behaviour (DAY-SENSE)
        → DailyActivityProfile (count-only JSON)
        → energy + genes + settle (DAY-CORE)
        → runtime PNG style (modular gene-part visuals are the next art milestone)
        → companion + collection (DAY-DESK)
```

One local calendar day → one profile → one hatch. Next day → new egg.

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
│   ├── png/                  ← runtime hatch + quality artwork
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
| Mac shell / package / collection UI | DAY-DESK |
| Scope / acceptance | DAY-LEAD |

## MVP gene parts

`body` / `cloud` / `face` / `tail` (not `sprout`). See `docs/GENE_CONTRACT_MVP.md` and `character/PARTS_MVP.md`.

The current MVP emits stable base IDs for those four fields. Behaviour already drives energy, personality, traits and rarity; visual part swapping begins when the modular art pool lands.

## Docs priority

1. Latest instruction from 老大  
2. `PROJECT.md`  
3. `WORK_PLAN.md`  
4. `docs/*` contracts  
5. `reference/` (inspiration only)
