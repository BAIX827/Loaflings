# Loaflings modular character assets

This folder is the editable, composable character source. Every SVG uses the
same transparent `1200 × 900` canvas and must remain aligned to
`manifest.json`.

## Preview

Open `preview.html` in a browser. Change body, expression, cloud, headwear,
facewear and outfit independently. Replacing an SVG with the same filename
updates the preview on refresh.

The modular library contains:

- 5 basic bodies: Classic, Chubby, Long, Bun and Pudgy. Bun and Pudgy reuse
  aligned paw, tail and shadow modules instead of duplicating them.
- 3 mutation-specific colour and shape bodies: Pointy Strawberry, Melted
  Matcha and Round Mocha. Each has matching editable paws and tail.
- 8 core face-only expressions
- 13 cloud-only moods and colour variants, including Twin Cloud, Sprout Cloud,
  Strawberry Cloud and Mocha Cloud
- 12 hats and small head accessories
- 8 face accessories: 6 pairs of glasses and 2 subtle cheek details
- 11 low-coverage outfits
- 3 optional body-marking layers: Patchy, Sesame and Dapple
- 5 basic recipes, 5 mutation recipes and 8 role outfit recipes

Every wearable declares all eight bodies as compatible.
The rejected scarf concept is not part of the library.

`review/` contains browser-rendered PNG snapshots of the default, focus, rainy
and sleepy recipes, plus real desktop-runtime captures for rarity, wardrobe
and catalogue integration. They are visual QA outputs only; the editable SVG
modules remain the production source.

Patchy and Twin Cloud show single-layer mutations. Sesame, Dapple and Sprout
Cloud combine a distinct pastel body shape with a matching marking or cloud.
These three colour and shape pairs are authored mutation designs, not a general
body-by-colour palette system. The role recipes are visual combinations, not
new behaviour or rarity rules. Expressions and wearables remain reusable.

Run `node_modules/.bin/electron scripts/capture-modular-preview.cjs <template>
<output.png>` to capture a recipe in Electron. Add `--stage-only` for an art-only
image, or `--headwear=<id>`, `--facewear=<id>` and `--outfit=<id>` to check
wearable combinations. Add `--small` to inspect the stage at 260 px desktop
width. The new role art and 260 px captures in `review/` were checked for
clear faces, clothing below the paws, and cloud gaps.

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
- Build each visible cloud from one outlined silhouette path. Construction
  circles may guide the shape, but must not leave overlapping internal strokes.
- Add parts to `manifest.json` and the preview before wiring them into DESK.
