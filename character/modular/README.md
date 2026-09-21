# Loaflings modular character assets

This folder is the editable, composable character source. Every SVG uses the
same transparent `1200 × 900` canvas and must remain aligned to
`manifest.json`.

## Preview

Open `preview.html` in a browser. Change body, expression, cloud, headwear,
facewear and outfit independently. Replacing an SVG with the same filename
updates the preview on refresh.

The v3 starter library contains:

- 3 reusable bodies: Classic, Chubby and Long
- 8 core face-only expressions
- 10 cloud-only moods, including the Twin Cloud mutation
- 4 hats, including the original blue knit hat
- 2 pairs of glasses
- 3 low-coverage outfits
- 1 optional body-marking layer: Patchy
- 3 basic recipe templates and 2 reference-inspired mutation recipe templates

Every hat, pair of glasses and outfit in this starter library declares all
three bodies as compatible. The rejected scarf concept is not part of the
library.

`review/` contains browser-rendered PNG snapshots of the default, focus, rainy
and sleepy recipes. They are visual QA outputs only; the editable SVG modules
remain the production source.

The mutation templates deliberately change one identity feature at a time:
Patchy changes only the marking layer, while Twin Cloud changes only the cloud
layer. This keeps expressions and wearables reusable.

## Edit in Figma

1. Create or select a `1200 × 900` frame.
2. Drag the SVG files into the frame.
3. Keep each imported layer at `x = 0`, `y = 0`, width `1200`, height `900`.
4. Enter vector-edit mode to change paths, fills, strokes or gradients.
5. Preserve the top-level layer name / SVG `id`.
6. Export each module separately as SVG at 1× with transparent background.
7. If available, enable `Include id attribute`; do not add a background rectangle.
8. Replace the matching file here and check `preview.html` plus `npm test`.

Figma may convert strokes to fills when exporting. Keep a clean editable Figma
source, but treat the checked-in SVG and the preview as the runtime contract.

## Other editors

- Inkscape: recommended free native SVG editor; strongest option for exact SVG round trips.
- Adobe Illustrator / Affinity Designer: good for polished vector illustration.
- Penpot / Boxy SVG: browser-oriented alternatives.
- VS Code: best for exact coordinates, IDs, viewBox and manifest edits.

## Rules

- Never bake body + face + cloud + accessory into a production module.
- Never tight-crop one module; all layers keep the full shared canvas.
- Keep expressions face-only and clouds cloud-only.
- Keep mutations in the narrowest possible slot; do not duplicate an entire
  body merely to add a marking or special cloud.
- Clothes sit below `pawsForeground`; glasses sit above the expression; hats
  sit below `cloudMood`.
- Add parts to `manifest.json` and the preview before wiring them into DESK.
