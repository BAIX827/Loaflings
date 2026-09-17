# Loaflings MVP — Part IDs

Canonical source: `Pet_Base_Master.svg` + `loafling-standard-base.css` + `LOAFLING_CHARACTER_SPEC_UPDATED.md`.

Raster in `reference/` is visual feeling only; do not override this geometry.

## Gene / SVG component IDs (locked)

| Gene field | Value (MVP base) | CSS / layer group | Notes |
|---|---|---|---|
| `body` | `body_base` | `.Body` (+ paws as body sub-parts for now) | Soft dough silhouette; paws stay with body in MVP |
| `cloud` | `cloud_base` | `.Thought_Cloud` (+ `.Cloud_*`, `.Thought_Dot`) | Floating thought cloud — **not** sprout |
| `face` | `face_base` | `.Face` (`.Eye_L` / `.Eye_R` / `.Blush_*` / `.Mouth`) | Minimal eyes + soft `w` mouth + blush |
| `tail` | `tail_base` | `.Tail` | Soft peach oval puff |

Deprecated: `sprout` — do not use.

## Assembly order (bottom → top)

1. `tail`
2. `body` (includes paws)
3. `face`
4. `cloud`

Guides (`.Guide_*`, `.Geometry_Guide`) are authoring-only; exclude from runtime compose.

## Asset paths

- Geometry master: `character/Pet_Base_Master.svg`
- Implementation values: `character/loafling-standard-base.css`
- Design rules: `character/LOAFLING_CHARACTER_SPEC_UPDATED.md`

App code that loads these lives under `src/` (see `src/art/`).

## Update policy

Pet art may be replaced later. Keep these four IDs stable unless @DAY-LEAD / @DAY-CORE explicitly change the gene contract.
