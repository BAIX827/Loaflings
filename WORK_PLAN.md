# WORK_PLAN

## Current
- [ ] Soft polish / optional next
  - [ ] Reference-aligned optional idle PNG expression / pose pool (3 expression review masters generated; poses remain)
  - [ ] Review the 3 basic and 2 mutation SVG templates in the live desktop runtime, then approve or revise the art direction
  - [ ] Optional: Developer ID sign + notarize
  - [ ] Optional short interactions (feed / dig / evolution choice)
  - Acceptance: `docs/MVP_DEMO_ACCEPTANCE.md`

## Next
- [ ] TASK-005 hatch reveal polish (copy / rarity feel) if 老大要
- [ ] Optional wardrobe UI for unlocked headwear / facewear / outfits

## Done
- [x] 2026-09-21 modular adult runtime integration: CharacterAppearance, layered SVG renderer, collection v2 migration and PNG fallback
- [x] 2026-09-21 starter templates: Classic / Chubby / Long plus reference-inspired Patchy / Twin Cloud mutations
- [x] 2026-09-21 modular character v2 starter library: 3 bodies, 8 faces, 9 clouds, 4 hats, 2 glasses, 3 outfits, manifest and composer
- [x] 2026-09-21 modular character v1: split body/paws/tail, 4 faces, 4 clouds, hat, vest, manifest and previewer
- [x] 2026-09-21 modular character expansion plan + 3 expression / 2 approved accessory review masters
- [x] 2026-09-21 reference-aligned six-stage and rarity art redraw
- [x] 2026-09-21 hatch/reveal flow, asset catalog, storage, install and test hardening
- [x] 2026-09-21 Electron 44 / electron-builder 26 dependency refresh (0 audit findings)
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

2026-09-21 (MODULAR RUNTIME)
- Added deterministic `CharacterAppearance` to CORE without changing the four locked gene fields: personality selects Classic / Chubby / Long, Rare selects Patchy and Epic selects Twin Cloud.
- Replaced only the adult desktop look with ordered SVG layers from `character/modular/manifest.json`; egg through growing remain PNG, and missing modular assets fall back to the existing rarity/adult PNG.
- Upgraded collection rows to v2 appearance recipes with read-time migration for old saves. Modular adults keep breathing, use expression/cloud layer swaps for idle moods, and test click-through against all visible layers.
- Added a hidden Electron capture smoke helper that exercises the real preload, renderer, CSS and SVG files for common, rare and epic recipes.
- Verified 18 automated tests, the settlement smoke with an emitted appearance recipe, and three real Electron captures whose DOM reached `phase=adult` with the expected ordered SVG layers.

2026-09-21 (ART EXPANSION)
- Added five focused recipe templates: three basic bodies plus two reference-inspired mutations. Patchy is a reusable marking layer; Twin Cloud is a reusable special cloud layer, so neither duplicates the full character.
- Rendered and visually checked all five template recipes; removed a Patchy lower mark that read like an oversized mouth. Verified 40 editable SVG modules and passed all 13 automated tests.
- Expanded the editable modular library to v2: added Chubby and Long bodies, completed the eight core expressions, added five cloud states, three hats, two facewear options and two outfits. All wearables are declared compatible with all three bodies.
- Upgraded `character/modular/preview.html` with body and glasses controls plus focus, rainy and sleepy presets; the recipe remains independent per slot and no scarf asset was added.
- Verified all 38 module SVGs as valid XML on the shared transparent viewBox, rendered four browser review snapshots, and passed all 12 automated tests.
- Built `character/modular/` v1: split Classic body/tail/paws/shadow, four face-only expressions, four cloud-only moods, a headwear-only blue knit hat and an outfit-only sage vest.
- Added a versioned manifest with anchors/layer order plus `preview.html` for independent expression, cloud, hat and outfit selection. Existing DESK runtime remains unchanged pending visual approval.
- Reworked `character/CHARACTER_EXPANSION_PLAN.md` around reusable body, face, cloud, headwear, outfit and prop layers on the canonical `1200 × 900` coordinate system.
- Kept transparent full-character review masters for happy, sleepy and curious expressions plus the approved blue knit hat and sage knit vest.
- Removed the rejected coral scarf. Full-character images are now explicitly concept previews; production expressions/accessories must become anchored face-only or accessory-only layers.

2026-09-21 (CODE / DESK / SENSE)
- Fixed hatch progress to use combined clicks + keystrokes, kept reveal state separate from visual growth, and preserved rarity `style` across the renderer bridge.
- Centralized hatch/quality asset catalogs, removed dead SVG display helpers, and made missing optional idle PNGs fall back once without repeated load failures.
- Centralized JSON persistence behind atomic same-directory writes for day state, settings, collection and live profile.
- Added a macOS Accessibility preflight: without permission Loaflings remains usable in idle-only mode instead of starting the native global hook.
- Refreshed Electron/electron-builder, made postinstall cross-platform, and added reproducible runtime compile/test/verify commands.
- Verified clean install, 8 automated tests, demo settlement, JavaScript syntax, transparent RGBA assets, and npm audit with 0 findings. macOS packaging remains a target-Mac task.

2026-09-21 (ART)
- Redrew the complete runtime hatch family from canonical references: egg → cracking → hatching → newborn → growing → adult now share one coherent watercolor style on transparent backgrounds.
- Redrew common / rare / epic adults around the same soft dough silhouette, minimal face, tiny paws and clearly floating cloud. `Pet_Adult.png` and `Pet_Base_Master.png` use the new common/base anchor.

2026-09-19 (DAY-DESK)
- PNG-only pet display (six hatch stages + style_*); SVG archive unused by shell.



2026-09-19 (DAY-CORE)
- Locked 3 qualities: common 70% / rare 25% / epic 5% (+ energy nudge); DaylingResult.style; retired uncommon.

2026-09-19 (DAY-DESK)
- Kill reveal/status strip; ZH/EN locale; Pack calendar to view past hatches; single /Applications QA install; HUD hits.



2026-09-18 (DAY-DESK)
- Follow LEAD hatch thresholds (cumulative activityHits); rebuild QA app. Docs/guide synced.



2026-09-18 (DAY-DESK)
- PNG-primary art paths (svg archived under character/svg/); hide egg caption; Settings toggles for buttons/HUD; unify art frame size; QA rebuild.



2026-09-18 (DAY-CORE)
- Hatch stages advance on clicks + keystrokes (1000 units/stage); HUD keys already live.

2026-09-18 (DAY-DESK)
- QA click-to-open: pack Loaflings.app → /Applications + Desktop; `npm run install:qa` / docs/QA_OPEN.md.



2026-09-18 (DAY-DESK)
- Idle 3-layer compose: body (pose|expr) + ART cloud_*; strip baked cloud so mood layer shows.



2026-09-18 (DAY-DESK)
- Wire CORE idleMoodFromProfile into idle FX (weighted expr/pose + intervalMs); still no gene change.



2026-09-18 (DAY-CORE)
- Cleaner split: hatchProgress.ts + idleMood.ts; docs/CORE_REFERENCES.md (BongoCat-style thin modules).
- Idle mood weights optional for DESK; settle/genes unchanged.

2026-09-18 (DAY-DESK)
- Idle random expr/pose from character/idle (ART IDLE_MVP): quiet ~2.5s on newborn/growing/adult; less when typing/clicking.



2026-09-18 (DAY-DESK)
- Clean split: window.js / ipc.js / settleBridge.js; docs/DESK_REFERENCES.md (BongoCat-mac notes). Settings can reopen guide.


2026-09-18 (DAY-DESK)
- Live clicks HUD (500ms), ART 03–05 paths, cute first-run guide; Quit/Settings unchanged.


2026-09-18 (DAY-CORE)
- Relocked visual growth to 6 stages per reference/process.png (1000 clicks each): egg/cracking/hatching/newborn/growing/adult.
- hatchProgressFromProfile updated; DESK/ART must follow new phase ids.

2026-09-18 (DAY-DESK)
- Companion Settings: opacity / size / lock position; Quit button. Hatch stages (3) + process.png reference for 6-stage next lock.


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

2026-09-18 (DAY-ART)
- Hatch visuals: egg / cracking / hatched → Pet_Egg_Master, Pet_Egg_Cracking, Pet_Base_Master (+ HATCH_PHASES.md).

2026-09-18 (DAY-ART)
- Six-stage hatch art: hatching / newborn / growing (+ Pet_Adult alias); HATCH_PHASES.md updated for CORE 1c8a1ff.

2026-09-18 (DAY-SENSE)
- Always count keystrokes/clicks even when companion is focused (per 老大).

2026-09-18 (DAY-ART)
- Idle MVP: reference/actions-expressions.png + character/idle/* + IDLE_MVP.md (random expr/pose pool for DESK).

2026-09-18 (DAY-ART)
- Added idle cloud_* mood layer (normal/happy/excited/sleepy/angry/sad) for three-layer assemble.

2026-09-18 (DAY-SENSE)
- Real-time click HUD: emit counts on each input; desk forwards loaflings:sense-counts (instant, not only 500ms poll).

2026-09-18 (DAY-SENSE)
- HUD shows live keystrokes alongside clicks (keys were already in live-profile).

2026-09-19 (DAY-SENSE)
- HUD shows single activityHits (keys+clicks); profile still stores both separately for CORE genes.

2026-09-19 (DAY-ART)
- Three quality adult PNGs: character/png/style_{common,rare,epic}.png + QUALITY_STYLES.md.
