# WORK_PLAN

## Current
- [ ] TASK-003 Creature generation / growth rules
  - CORE: MVP gene contract + `src/core` scaffold done
  - Need: wire DESK settle call + SENSE real profile
- [ ] TASK-006 Mac demo app (DESK)
  - Icon: `src/art/AppIcon.png`
  - Pet: current `Pet_Base_Master.svg`

## Next
- [ ] TASK-004 Idle detection (SENSE)
- [ ] TASK-005 Daily hatch result (CORE settle + DESK reveal)
- [ ] Align SENSE profile schema ↔ `src/core/profile.ts`

## Done
- [x] TASK-001 Project setup
- [ ] TASK-002 Basic desktop window (DESK in progress)
- [x] ART: MVP parts contract + AppIcon
- [x] CORE: gene contract MVP + `src/core` framework

## Log

2026-09-18
- Added base creature renderer.
- Fixed transparent window click-through.
- TASK-003 still in progress.

2026-09-18 (DAY-ART)
- Locked MVP part IDs: body / cloud / face / tail (sprout deprecated).
- Added character/PARTS_MVP.md and src/art/parts.ts (+ README).
- Fixed AGENTS.md path → character/LOAFLING_CHARACTER_SPEC_UPDATED.md.
- Using current Pet_Base_Master.svg until art is updated.

2026-09-18 (DAY-ART)
- Added Mac app icon: src/art/AppIcon.png (1024×1024), based on current Loafling master/refs.

2026-09-18 (DAY-CORE)
- Added docs/GENE_CONTRACT_MVP.md (body/cloud/face/tail; energy; seeded RNG).
- Scaffolded src/core: profile, energy, genes, rng, settle, index.
- MVP genes always resolve to *_base; settleDay() ready for DESK demo.
