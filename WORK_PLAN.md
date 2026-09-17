# WORK_PLAN

## Current
- [ ] TASK-006 Mac demo app
  - DESK: companion window + fixture→sense→core settle wired (UI MVP)
  - SENSE: real macOS sensors still open; demo fixture shipped
  - CORE: settleDay consumed by desk demo pipeline
  - ART: freeze current pet SVG + AppIcon (done)
  - Acceptance: `docs/MVP_DEMO_ACCEPTANCE.md`

## Next
- [ ] TASK-004 Idle / focus / window-switch completeness (SENSE)
- [ ] TASK-005 Daily hatch reveal polish (DESK + CORE)
- [ ] DESK: call SENSE `excludeWindowIds` with companion window id
- [ ] Optional short interactions (feed / dig / evolution choice)

## Done
- [x] TASK-001 Project setup (Loaflings folder + GitHub)
- [x] ART: MVP parts contract (`body` / `cloud` / `face` / `tail`) + AppIcon
- [x] CORE: gene contract MVP + `src/core` framework
- [x] LEAD: MVP demo acceptance doc
- [x] SENSE: profile schema aligned to CORE + `fixtures/demo-day.json`
- [x] TASK-002 Basic desktop window (Electron companion under `src/desk/`)

## Log

2026-09-18 (DAY-DESK)
- Scaffolded Mac companion: Electron always-on-top / frameless / transparent
- Shows `character/Pet_Base_Master.svg`; icon `src/art/AppIcon.png`
- Wired `src/sense/fixtures/demo-day.json` → `assertProfileShape` → `settleDay()` via `src/desk/pipeline.js`
- Reuses MVP part IDs (`src/desk/mvpParts.js` ↔ `src/art/parts.ts`)
- Root scripts: `npm start` / `npm run desk` / `npm run demo` / `npm run settle:demo`
- Docs: `src/desk/README.md`

2026-09-18 (DAY-ART)
- Replaced AppIcon with 老大's cozy style image (1024×1024).
- Added reference/loafling-style-cozy-desk.png + character/STYLE_NOTES.md.

2026-09-18 (DAY-SENSE)
- Profile schema aligned to CORE (`src/sense/`)
- Pushed sense module + docs/SENSE_PROFILE_SCHEMA.md + demo-day fixture
- [ ] Real macOS sensors + permissions
- [ ] Own-window exclusion wired from DESK

2026-09-18 (DAY-LEAD)
- Locked Mac demo acceptance: docs/MVP_DEMO_ACCEPTANCE.md
- Cleared placeholder fake progress; WORK_PLAN tracks real demo tasks

2026-09-18 (DAY-CORE)
- Added docs/GENE_CONTRACT_MVP.md; scaffolded src/core (settleDay ready)

2026-09-18 (DAY-ART)
- Locked MVP part IDs; AppIcon.png; character/PARTS_MVP.md + src/art/parts.ts
