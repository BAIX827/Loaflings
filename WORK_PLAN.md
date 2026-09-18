# WORK_PLAN

## Current
- [x] TASK-006 Mac demo app — **MVP demo DoD met (dev launch)**
  - [x] DESK: companion + AppIcon + pet + fixture/live→settle
  - [x] DESK: end-of-day reveal + local collection (`c890305`)
  - [x] DESK: daily egg → hatch loop (`119fb2f`, LEAD accepted)
  - [x] CORE: settleDay verified
  - [x] SENSE: schema + fixture + live counters (`f039926`) + ensureToday
  - Still not: signed `.app` / Dock one-click (packaging) — next when 老大按规划排期
  - Acceptance: `docs/MVP_DEMO_ACCEPTANCE.md`

## Next
- [ ] TASK-004 Real sensors + permissions + exclude own window (SENSE + DESK)
- [ ] TASK-005 Daily hatch reveal polish (DESK + CORE) — CORE dayCycle shipped; DESK egg UI polish still open
- [ ] Optional short interactions (feed / dig / evolution choice)

## Done
- [x] TASK-001 Project setup (Loaflings folder + GitHub)
- [x] TASK-002 Basic desktop window (`src/desk/` Electron)
- [x] ART: MVP parts + cozy AppIcon
- [x] CORE: gene contract MVP + `src/core`
- [x] SENSE: profile aligned to CORE + demo fixture
- [x] LEAD: MVP demo acceptance doc
- [x] TASK-006 Mac demo (dev) — reveal/collection/live sense

## Log

2026-09-18 (DAY-LEAD)
- Accepted DESK egg UI `119fb2f` (egg→hatchDay→pet; ensureToday day boundary)
- Status for 老大: MVP demo loop完整可玩（dev）；下一拍正式 `.app` 包 + TASK-004 权限打磨；蛋专图有空再补不挡进度

2026-09-18 (DAY-DESK)
- Daily egg → hatch UI: companion shows egg until Day/Save; hatchDay/phaseFromProfile via hooks/coreDayCycle; ensureToday day boundary; still Pet_Base_Master after hatch.


2026-09-18 (DAY-DESK)
- Daily egg → hatch loop: companion starts as CSS/SVG egg; Day/Save hatch to Pet_Base_Master.svg.
- Day boundary: desk `dayState.js` + SENSE `ensureToday()` via senseLive; midnight poll resets to new egg.
- Copy: Day = “Day reveal — hatch today’s egg”; panel “Day hatch”; Keep Save → collection.
- Live settle still preferred; `settle:demo` unchanged.

2026-09-18 (DAY-CORE)
- Confirmed daily form with 老大: one egg/day → hatch one Loafling → new egg next day.
- Added src/core/dayCycle.ts + docs/DAY_CYCLE_MVP.md; DaylingResult.kind = 'loafling'.
- hatchDay() wraps settleDay for DESK egg UI / Save.

2026-09-18 (DAY-LEAD)
- Accepted DESK reveal+collection `c890305` (Day panel + Save → userData/collection.json; live settle preferred)
- MVP demo DoD (dev): pass — `npm install && npm start`
- Not yet: packaged clickable `.app`; Accessibility must be on for live hooks
- Art: keep current character/; do not block on design

2026-09-18 (DAY-DESK)
- End-of-day reveal panel (name/type/rarity/personality/genes/traits from CORE settle).
- Local collection JSON under Electron `app.getPath('userData')` (`collection.json`).
- Wire: prefer `getLiveSettle` / senseLive when up; fixture `settle:demo` still works.
- UI: non-intrusive Day / Save chips on companion; pet still Pet_Base_Master.svg.

2026-09-18 (DAY-LEAD)
- Accepted SENSE live counters slice f039926 (count-only, companion-focus click skip, docs/SENSE_LIVE.md)
- Still open for demo DoD at that time: DESK end-of-day reveal + collection; 老大本机开辅助功能权限

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

2026-09-18 (DAY-SENSE)
- Added root README.md (structure + quick start + owners).
- liveSensor: ensureToday() one egg per local day.
