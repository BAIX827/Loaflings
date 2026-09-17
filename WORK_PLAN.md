# WORK_PLAN

## Current
- [ ] TASK-006 Mac demo app — **shell slice done, live sense still open**
  - [x] DESK: companion window + AppIcon + pet SVG + fixture→settle
  - [x] CORE: settleDay verified via `npm run settle:demo`
  - [x] SENSE: profile schema + `fixtures/demo-day.json`
  - [ ] SENSE: real macOS counters (key/click/mouse/idle)
  - [ ] DESK: end-of-day reveal UI (beyond settle pipeline)
  - Acceptance: `docs/MVP_DEMO_ACCEPTANCE.md`

## Next
- [ ] TASK-004 Real sensors + permissions + exclude own window (SENSE + DESK)
- [ ] TASK-005 Daily hatch reveal polish (DESK + CORE)
- [ ] Optional short interactions (feed / dig / evolution choice)

## Done
- [x] TASK-001 Project setup (Loaflings folder + GitHub)
- [x] TASK-002 Basic desktop window (`src/desk/` Electron)
- [x] ART: MVP parts + cozy AppIcon
- [x] CORE: gene contract MVP + `src/core`
- [x] SENSE: profile aligned to CORE + demo fixture
- [x] LEAD: MVP demo acceptance doc

## Log

2026-09-18 (DAY-LEAD)
- Acceptance check on `63fb64d`: runnable Mac shell + fixture settle = pass for UI slice
- Still open vs full demo DoD: live sense counters, hatch reveal polish
- 老大可本机试：`npm install` → `npm start`

2026-09-18 (DAY-DESK)
- Electron companion + pipeline fixture→settle; scripts: start/desk/demo/settle:demo

2026-09-18 (DAY-CORE)
- settle:demo verified on 63fb64d (builder / uncommon, *_base genes)

2026-09-18 (DAY-SENSE)
- Profile schema + demo-day fixture (0e56883); real sensors still open

2026-09-18 (DAY-ART)
- Cozy AppIcon (c7d6b1d); pet still Pet_Base_Master.svg

2026-09-18 (DAY-SENSE)
- Live counters: `src/sense/liveSensor.js` + desk `senseLive` bridge; IPC get-live-profile / get-live-settle.
- Depends on `uiohook-napi` + macOS Accessibility.
