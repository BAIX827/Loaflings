# WORK_PLAN

## Current
- [ ] 2026-09-23 Figma 2D 素材库：文件已创建；待 Figma Starter MCP 调用额度恢复后建立页面、变量并导入现有 40 个 SVG 组件，完成组合 QA。仓库侧索引见 `character/ASSET_LIBRARY_INDEX.md`。
- [ ] Soft polish / optional next
  - [ ] Consider splitting the large desktop renderer into focused modules in a separate, regression-tested change; avoid incidental restructuring during feature work
  - [ ] Reference-aligned optional idle PNG expression / pose pool (3 expression review masters generated; poses remain)
  - [ ] Review the 3 basic and 2 mutation SVG templates in the live desktop runtime, then approve or revise the art direction
  - [ ] Optional: Developer ID sign + notarize
  - [ ] Optional short interactions (feed / dig / evolution choice)
  - Acceptance: `docs/MVP_DEMO_ACCEPTANCE.md`

## Next
- [ ] TASK-005 hatch reveal polish (copy / rarity feel) if 老大要

## Done
- [x] 2026-09-23 configurable hatch goal: 20,000 default, 1,000 minimum and proportional growth stages
- [x] 2026-09-23 scoped desktop code cleanup and unused-stub removal
- [x] 2026-09-23 six-stage growth timeline with milestone thresholds and next-stage distance
- [x] 2026-09-23 character-only scaling with stable functional panel layout
- [x] 2026-09-23 wardrobe icon cards with individual SVG previews, selected state and persisted wearables
- [x] 2026-09-22 Figma-aligned 2D asset production, export and acceptance documentation
- [x] 2026-09-22 Windows x64 installer / portable release packaging and packaged-app smoke verification
- [x] 2026-09-22 strict 29,000-activity adult / collection gate and unambiguous historical HUD
- [x] 2026-09-22 unfinished-egg rollover choice with inherited/reset progress and all-time count statistics
- [x] 2026-09-22 collection catalogue with collected / missing progress across 9 reachable slots
- [x] 2026-09-22 clean single-silhouette outlines for all modular cloud moods
- [x] 2026-09-22 adult wardrobe UI with persisted headwear / facewear / outfit loadout
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

2026-09-23 (CONFIGURABLE HATCH GOAL)
- Lowered the default adult/collection goal from 29,000 to 20,000 activity hits. Settings now persists a whole-number hatch goal, clamps values below 1,000, and refreshes the current unfinished egg immediately. The five preceding milestone floors scale from the original 0 / 3 / 8 / 14 / 21 / 29 proportions; click and keystroke counts remain cumulative as before.
- Used the same configured goal in CORE growth, desktop phase/progress, cross-day legacy recovery, and main-process collection gates. A completed egg records its finishing goal so later settings changes cannot revoke completion; valid old 29,000-hit completions retain their original goal.
- Updated bilingual settings copy, growth and desk documentation, plus the smoke fixture. The already-published 0.1.0 Windows release still uses 29,000; only a future package will include this change.
- Verified runtime compilation, all 31 Node tests, demo settlement, and Electron smokes for the default gate, proportional midway timeline, 1,000 minimum, setting persistence after reload and completed-egg stability; `git diff --check` passed.

2026-09-23 (DESKTOP CODE CLEANUP)
- Audited current desktop growth, collection and integration paths. Shared the progress number normalization between the timeline and collection gate, reused one CORE threshold read within each IPC progress snapshot, and aligned phase normalization with the timeline's phase list. Kept the cross-day settlement helper because it is still used.
- Removed two unreferenced legacy CORE/SENSE stub modules. Left the larger renderer decomposition for a separate task with dedicated regression coverage; no game rules or appearance assets changed.
- Verified the runtime build, all 30 Node tests, demo settlement, Electron smokes for the zero-activity collection gate and midway growth timeline, and `git diff --check`.
- Local tooling note: the global npm shim points to a missing npm CLI; the runtime build succeeds under normal permissions, while this sandbox's parent-directory read restriction can make the same build fail. This is not a repository build-script defect.

2026-09-23 (GROWTH TIMELINE)
- Replaced the plain growth bar with six labeled milestone nodes for Egg, Cracking, Hatching, Newborn, Growing and Adult. Nodes show their actual cumulative activity thresholds, completed/current/upcoming states and progress through the current stage.
- Added the exact activity remaining until the next stage while keeping the existing total-to-adult count and strict 29,000 collection gate. Threshold values flow from CORE through the main-process progress response instead of a second renderer-side rules list.
- Verified all 30 Node tests, Electron visual smokes for zero-hit Egg and a 17,000-hit Newborn midway state, milestone positions and next-stage count, plus `git diff --check`.

2026-09-23 (STABLE SCALE LAYOUT)
- The size slider now changes the character art directly. The companion window keeps its base 260 × 300 space below 1× and grows only above 1×, so shrinking no longer compresses the settings, wardrobe or collection UI.
- Function panels use fixed baseline dimensions and stay centered rather than stretching with the window; character art gets a short size transition. The saved scale is restored on launch.
- Verified 30 Node tests, Electron resize smoke at 0.6× and 1.6× (stable settings panel, correctly sized art), persisted scale after reload, wardrobe click/save/reload and collection catalogue smokes, plus `git diff --check`.

2026-09-23 (WARDROBE ICON CARDS)
- Replaced the three wearable dropdowns with image cards for every existing hat, pair of glasses and outfit, plus a `none` card in each category. Used the original modular SVGs for previews and kept adult-only access, slot IDs and saved wardrobe settings unchanged.
- Added visible selected states and accessible button labels; the selection update retains keyboard focus. Updated the Electron wardrobe smoke for card clicks, preview loading and saved-state reload.
- Verified all 30 Node tests, real Electron wardrobe click/save/reload smoke at the companion window size, visual screenshot of the icon panel, and `git diff --check`.
- Local tooling issue observed then: the global npm shim points to a missing npm CLI. A later normal-permission runtime build passed; the earlier direct build failure was caused by this sandbox's parent-directory read restriction, not the repository script.

2026-09-23 (ASSET LIBRARY START)
- Created the Figma working file `Loaflings — Modular 2D Asset Library` and verified it is blank with no existing Loafling components or variables.
- Indexed the 40 existing modular SVGs by production page, stable ID and repository slot in `character/ASSET_LIBRARY_INDEX.md`; kept the manifest as runtime authority.
- Figma Starter MCP call limit blocked the first variable write, so no Figma pages, tokens or components were claimed as complete. Next step is to resume those writes when access is available.

2026-09-22 (2D ASSET PRODUCTION RULES)
- Added `character/ASSET_PRODUCTION_GUIDE.md` as the production workflow for Figma, AI concept batches and repository delivery while preserving the character spec and canonical SVG as higher visual authorities.
- Locked the shared `1200 × 900` authoring space, manifest-owned anchors and layer order, stable slot/ID naming, modular-over-combinatorial production rule, batch review flow, suggested first expansion scale, SVG/PNG export requirements and visual/runtime acceptance checklist.
- Linked the guide from the character specification, expansion plan and README; corrected the stale PNG-only style note to reflect PNG hatch stages plus the current modular SVG adult runtime and PNG fallback.
- Verified every referenced local authority and preview file exists, documented canvas/layer values match `character/modular/manifest.json`, all expected cross-links resolve and `git diff --check` passes.

2026-09-22 (WINDOWS RELEASE)
- Added repeatable Windows x64 `dir`, NSIS installer and portable build commands with distinct artifact names, the existing Loaflings icon, Start menu / desktop shortcuts and no unnecessary native rebuild of the bundled `uiohook-napi` Windows N-API binary.
- Added friend-facing Windows download, SmartScreen, privacy and testing guidance; clarified the project overview for both macOS and Windows.
- Built `Loaflings-0.1.0-Windows-x64-Setup.exe` and `Loaflings-0.1.0-Windows-x64-Portable.exe`, generated SHA-256 checksums, and confirmed the final portable executable extracted, launched, created isolated user data and loaded the packaged Windows native binding.
- Verified all 30 automated tests, the demo settlement check, the unpacked Windows app smoke and the final portable-executable smoke. This preview remains unsigned and x64-only.

2026-09-22 (STRICT HATCH GATE)
- Removed the legacy manual-hatch bypass: Day is read-only progress below 29,000 activity hits, Save is disabled with the exact remaining count, and both renderer and main-process IPC enforce the same threshold.
- Adult appearance is now derived only from real click + keystroke progress. A same-day legacy state saved below the threshold is reopened as an unfinished egg instead of being forced to adult.
- Historical collection viewing now labels the HUD `当前蛋：N` / `Current egg: N` while preserving the historical adult artwork and viewing banner.
- Verified 30 automated tests plus real Electron smokes for the zero-hit egg/progress gate and the historical `当前蛋：0` HUD.

2026-09-22 (CROSS-DAY EGG + ALL-TIME STATS)
- Changed the day boundary so an unfinished egg pauses for an explicit Continue / New Egg choice. Continue preserves the egg's clicks and keystrokes and includes new-day activity; New Egg starts from zero at the moment of the choice.
- Kept permanent totals separate from egg progress. The Pack now has a Statistics tab for activity hits, clicks, keystrokes, mouse distance, active/focus/idle time, focus sessions, window switches and tracked days; only numeric behaviour summaries are stored.
- Added atomic v2 day-state persistence, safe migration from the prior state shape, previous-profile capture at midnight/startup, bilingual UI and IPC bridges.
- Verified 29 automated tests, demo settlement, clean diff checks, and real Electron smokes for a 4,600-hit rollover prompt/resolution and the cumulative Statistics tab.

2026-09-22 (COLLECTION CATALOGUE)
- Added a third Pack tab that derives 9 real catalogue slots from the three currently reachable personalities and three rarities, without adding placeholder rows or changing hatch rules. The legacy `balanced` label is not treated as reachable because current CORE always resolves work, explore or dream.
- Collected cards show their appearance, latest collection date and duplicate count; missing cards use a muted silhouette. A progress bar reports collected slots out of 9.
- Added a read-only catalogue projection and IPC endpoint, bilingual copy, reusable miniature modular rendering, and fixed Pack tab visibility so calendar/list/catalog panels do not overlap.
- Verified 24 automated tests, demo settlement, clean diff checks, and a real Electron catalogue smoke with 9 cards, 3 collected, 6 missing and 57 rendered character layers.

2026-09-22 (CLOUD SILHOUETTES)
- Replaced the overlapping stroked construction circles in all 10 modular cloud moods with one clean outer silhouette per visible cloud; Twin Cloud keeps two independent silhouettes.
- Preserved thought dots and mood details including focus rays, sparkles, question mark, moon/star, sleep marks, rain and lightning.
- Verified 21 automated tests plus real Electron captures of the focused standard cloud and Twin Cloud; no internal lobe boundaries remain.

2026-09-22 (WARDROBE)
- Added an adult-only wardrobe panel backed by the existing modular library: 4 hats, 2 pairs of glasses and 3 outfits, plus independent none/reset choices.
- Kept body, expression, cloud mood, marking and genes unchanged. The selected cosmetic loadout is validated against the manifest, saved in desk settings v4, applied to today's adult and collection previews, and restored after reload.
- Compacted the desktop toolbar so the new bilingual Dress up control remains inside the existing companion width.
- Verified 20 automated tests, demo settlement, clean diff checks, and a real Electron wardrobe smoke covering option counts, ordered wearable layers and reload persistence.

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

2026-09-23 (COIN WALLET)
- Documented the agreed daily coin rules in `docs/COIN_ECONOMY.md` before implementation: first real collection +20, 30 active minutes +5, one completed 25-minute focus session +5, one award per kind and local day (maximum 30). Existing wearables stay free; no spending yet.
- Added a local, idempotent coin ledger, passive profile rewards, real-collection reward, a bilingual Pack wallet view and a small gain notice. Cross-day egg progress and coin days remain independent; demo collections receive no coin reward.
- Verified 36 Node tests, demo settlement, Electron coin-wallet and existing UI smokes, persisted balance after reload, and clean diff checks.
