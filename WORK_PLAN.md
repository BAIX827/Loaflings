# WORK_PLAN

## Current
- [ ] Soft polish / optional next
  - [ ] figma bro: modular part SVG split from Pet_Base_Master
  - [ ] Optional: Developer ID sign + notarize
  - [ ] Optional short interactions (feed / dig / evolution choice)
  - Acceptance: `docs/MVP_DEMO_ACCEPTANCE.md`

## Next
- [ ] TASK-005 hatch reveal polish (copy / rarity feel) if 老大要
- [ ] Gene-driven part swap when modular SVG pool lands

## Done
- [x] TASK-001 Project setup
- [x] TASK-002 Basic desktop window
- [x] TASK-004 Permissions status + tighter own-window skip (`bcb3cc6`)
- [x] TASK-006 Mac demo (dev + unsigned `.app`)
- [x] DESK: egg→hatch UI (`119fb2f`) + load Pet_Egg_Master (`7dfd3f4`)
- [x] DESK: unsigned Mac `.app` (`8972239`) → `dist/mac-arm64/Loaflings.app`
- [x] ART: cozy AppIcon + egg art (`2388af6`)
- [x] CORE: gene + dayCycle
- [x] SENSE: profile + live + ensureToday
- [x] LEAD: acceptance docs

## Log

2026-09-18 (DAY-CORE)
- Hatch visual progress: egg → cracking → hatched every 1000 clicks (hatchProgressFromProfile).
- Docs: docs/DAY_CYCLE_MVP.md updated; DESK/ART consume phase ids.

2026-09-18 (DAY-LEAD)
- Packaged-app crash triage: accepted DESK `0db6a39` (no tsx/esbuild in .app) + SENSE `cc9181f` (profile.cjs)
- Smoke: liveSensor + runtime/core.cjs load OK; no remaining require(*.ts) in desk/sense JS
- 老大用法：git pull → npm start；或完全退出旧进程后开新打的 dist/mac-arm64/Loaflings.app

2026-09-18 (DAY-DESK)
- Fix packaged .app spawn ENOTDIR: compile CORE/SENSE to CJS at pack time; drop tsx from runtime.


2026-09-18 (DAY-LEAD)
- Accepted: SENSE `bcb3cc6`, DESK pack `8972239`, ART egg `2388af6`, DESK egg wire `7dfd3f4`
- 老大可开：`dist/mac-arm64/Loaflings.app`（或 `npm run pack` 重打）；辅助功能勾 **Loaflings.app**
- MVP playable loop + clickable .app 齐；公证/部件拆分不挡主循环

2026-09-18 (DAY-DESK)
- Packaged unsigned Loaflings.app; wired Pet_Egg_Master.svg for pre-hatch

2026-09-18 (DAY-ART)
- Pet_Egg_Master.svg + Egg.png cozy pre-hatch art

2026-09-18 (DAY-SENSE)
- TASK-004: focus skips key+click; getSenseStatus + open Accessibility

2026-09-18 (DAY-SENSE)
- Fix packaged app crash: liveSensor requires profile.cjs (not .ts). Unexpected token export.
