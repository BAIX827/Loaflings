<!-- PNG is primary runtime format; SVG archived under character/svg/ -->
# Idle expression & action MVP (DAY-ART)

Authoritative sheet: `reference/actions-expressions.png`

## Product intent

While the companion is idle (not busy typing bursts), randomly play a short expression or pose from a small pool. Full sheet has many faces/poses — **MVP ships a starter set only**.

## MVP pool (v1)

### Expressions (`character/svg/idle/ (archive) / character/png/idle/ (primary) expr_*.svg`)
| id | look |
|---|---|
| `expr_normal` | default face + blue cloud |
| `expr_happy` | arc eyes + blush + sparkle cloud |
| `expr_sleepy` | line eyes + zZ in cloud |
| `expr_surprised` | big round eyes |
| `expr_content` | soft smile |

### Poses (`character/svg/idle/ (archive) / character/png/idle/ (primary) pose_*.svg`)
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

## Later

Remaining expressions, cloud states, and actions from the sheet.

### Cloud moods (`character/svg/idle/ (archive) / character/png/idle/ (primary) cloud_*.svg`)
| id | look |
|---|---|
| `cloud_normal` | default blue cloud |
| `cloud_happy` | blue cloud + yellow sparkles |
| `cloud_excited` | warm cloud + stars |
| `cloud_sleepy` | cooler cloud + zZ |
| `cloud_angry` | grey cloud + lightning |
| `cloud_sad` | grey cloud + raindrops |

Assembly (LEAD lock): `pose_*` + `expr_*` + `cloud_*` — separate from gene parts.
