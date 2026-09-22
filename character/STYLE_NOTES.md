# Loaflings — Preferred Visual Style (from 老大)

Authoritative feeling reference: `reference/loafling-style-cozy-desk.png`

Mac app icon currently uses a square crop of this image: `src/art/AppIcon.png`

## Style locks

- Soft kawaii / cozy pastel, not hard cartoon outlines
- Body: marshmallow / dough white blob, squished loaf silhouette
- Face: tiny black dots, soft pink blush, tiny `w` mouth
- Signature: light-blue floating thought cloud above the head
- Outlines: soft colored (warm brown / soft blue), never harsh pure black
- Mood: bright airy desk / window light, calm and comfy
- Motifs: clouds, soft sparkles, plaid cushion, mug, books OK in scenes; keep runtime pet minimal

## Agent rule

When generating or revising Loafling art, match this style first.
Do not revert to earlier generated “ugly” icon style.
Canonical geometry remains `character/svg/Pet_Base_Master.svg`; this file governs *feeling* and marketing/icon look.


## Runtime format (updated 2026-09-22)

- Egg through growing phases use PNG under `character/png/`.
- Adult characters use ordered modular SVG layers from
  `character/modular/manifest.json`.
- Adult PNGs remain safe fallbacks and visual references.
- Production, Figma and export rules live in `ASSET_PRODUCTION_GUIDE.md`.
