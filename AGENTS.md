# Agent Rules

Before work:
1. Read PROJECT.md.
2. Read WORK_PLAN.md.
3. Inspect existing implementation before changing it.

During work:
- Do not rewrite working systems without reason.
- Keep changes scoped to the requested task.
- Do not invent requirements.
- Record discovered unrelated issues instead of fixing them automatically.

After work:
1. Verify the change.
2. Update WORK_PLAN.md.
3. Record what changed.
4. Never mark Done without verification.

## References

Reference materials are stored in `/reference`.

Use them when relevant to the current task.

References contain inspiration and exploratory ideas, not confirmed requirements.
Do not implement an idea only because it appears in a reference file.

Priority:
1. User's latest instruction
2. PROJECT.md
3. WORK_PLAN.md
4. Relevant reference materials
5. Agent assumptions

If a reference conflicts with PROJECT.md, follow PROJECT.md unless the user explicitly requests a change.



## Loafling Character Design

For any task involving Loafling character art, sprites, animation or visual
variants, read:

`character/LOAFLING_CHARACTER_SPEC_UPDATED.md`

Also inspect the canonical reference images listed in that document.

Do not redesign the core Loafling visual identity unless explicitly requested.

## Figma asset library and game sync

When the Loaflings Figma asset library changes, inspect the changed components
against `character/ASSET_LIBRARY_INDEX.md`, `character/ASSET_PRODUCTION_GUIDE.md`
and the runtime manifest. For each approved asset intended for the game, update
the matching repository SVG/PNG and runtime wiring in the same task. This
includes the relevant wardrobe, hatch appearance, catalog and Chinese/English
names where applicable. A Figma component alone is not a completed game asset.

Verify that the changed asset actually appears in the running desktop game,
then update the index and `WORK_PLAN.md`. If a Figma item is only a draft, lacks
a confirmed game role, or cannot be synced, record it explicitly as unsynced;
do not mark the Figma-to-game work Done. Do not change hatch rules or the core
character identity solely because a component was added to Figma.
