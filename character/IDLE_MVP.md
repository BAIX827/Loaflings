<!-- PNG is primary runtime format; SVG archived under character/svg/ -->
# Idle expression & action MVP (DAY-ART)

Authoritative sheet: `reference/actions-expressions.png`

## Product intent

While the companion is idle (not busy typing bursts), randomly play a short expression or pose from a small pool. Full sheet has many faces/poses — **MVP ships a starter set only**.

## MVP pool (v1)

> Migration note: the current `svg/idle/expr_*.svg` files are baked
> full-character previews, not reusable face-only layers. Future expression
> production follows `CHARACTER_EXPANSION_PLAN.md`: face and cloud assets use
> the shared `1200 × 900` canvas and compose over any compatible body.

### Expressions (editable archive: `character/svg/idle/expr_*.svg`)
| id | look |
|---|---|
| `expr_normal` | default face + blue cloud |
| `expr_happy` | arc eyes + blush + sparkle cloud |
| `expr_sleepy` | line eyes + zZ in cloud |
| `expr_surprised` | big round eyes |
| `expr_content` | soft smile |

### Poses (editable archive: `character/svg/idle/pose_*.svg`)
| id | look |
|---|---|
| `pose_sit` | sitting |
| `pose_stretch` | stretch |
| `pose_lie` | lying down |

Adult base geometry still follows `Pet_Base_Master.svg` / cozy style.

## Playback (DESK)

- Prefer when SENSE reports idle / low activity
- Random pick from MVP pool, short duration, then back to `expr_normal` / adult idle
- Do not invent gene fields for these — idle FX only
- Runtime expects optional raster counterparts under `character/png/idle/`. Until that reference-aligned PNG pool ships, DESK keeps the static adult art plus a subtle CSS breathing motion.

## Later

Remaining expressions, cloud states, and actions from the sheet.

### Cloud moods (editable archive: `character/svg/idle/cloud_*.svg`)
| id | look |
|---|---|
| `cloud_normal` | default blue cloud |
| `cloud_happy` | blue cloud + yellow sparkles |
| `cloud_excited` | warm cloud + stars |
| `cloud_sleepy` | cooler cloud + zZ |
| `cloud_angry` | grey cloud + lightning |
| `cloud_sad` | grey cloud + raindrops |

Assembly (LEAD lock): `pose_*` + `expr_*` + `cloud_*` — separate from gene parts.
