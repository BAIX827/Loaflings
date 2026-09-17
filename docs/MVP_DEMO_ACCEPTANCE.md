# MVP Mac Demo — Acceptance (DAY-LEAD)

Goal: a runnable Mac companion app that grows a Loafling from local behaviour, using current art until further notice.

## In scope

- Always-on-top transparent companion window (non-intrusive)
- Sense counters (keystrokes / clicks / mouse / idle) → daily profile JSON
- Core: profile → Work/Explore/Dream energy → genes (`body` / `cloud` / `face` / `tail`) → day settle
- Art: current `character/Pet_Base_Master.svg` + `src/art/AppIcon.png` as app icon
- Local collection stub + end-of-day reveal (minimal)
- Code under `src/` (`sense` / `core` / `art` / `desk`); docs kept current
- Small stages pushed to https://github.com/BAIX827/Loaflings

## Out of scope (for this demo)

- Large part pools, ears/accessory/palette variants
- Cloud sync, shop/coins cosmetics loop
- Final production art polish (update when 老大 says)

## Definition of done

1. App launches on Mac with Loaflings icon
2. Companion window shows current base pet
3. Sense writes a daily profile the core can consume
4. Settle produces genes + event log; desk can reveal end-of-day
5. `WORK_PLAN.md` and relevant docs updated; stage pushed to GitHub

## Ownership

| Area | Owner |
|------|--------|
| Sense profile + counters | DAY-SENSE |
| Genes / energy / settle | DAY-CORE |
| Parts / icon / SVG | DAY-ART (+ figma bro for Figma SVG) |
| Mac shell / package | DAY-DESK |
| Scope / acceptance | DAY-LEAD |
