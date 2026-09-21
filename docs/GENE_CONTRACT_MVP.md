# Loaflings MVP — Gene Contract (DAY-CORE)

Status: draft v1 · locked part IDs with DAY-ART / DAY-LEAD  
Canonical geometry: `character/svg/Pet_Base_Master.svg`; runtime art: `character/png/`; contract: `character/PARTS_MVP.md`

## Daily form

One egg per local day → `hatchDay` / `settleDay` → one Loafling. See `docs/DAY_CYCLE_MVP.md`.

## Pipeline

```text
DAY-SENSE DailyActivityProfile (count-only JSON)
        → DAY-CORE energy + genes + settle
        → CreatureGenes { body, cloud, face, tail }
        → CharacterAppearance recipe
        → DAY-ART modular SVG pool
        → DAY-DESK layered adult compose
```

## Gene fields (MVP)

| Field | MVP value | Driven mainly by | Notes |
|---|---|---|---|
| `body` | `body_base` | focus / Work energy | Soft dough silhouette |
| `cloud` | `cloud_base` | idle / Dream (+ focus flavour later) | Floating thought cloud — **not** sprout |
| `face` | `face_base` | typing / Work bursts | Eyes + blush + `w` mouth |
| `tail` | `tail_base` | mouse / Explore | Soft peach puff |

Deprecated: `sprout`.

The four genes remain locked. `appearance` is a separate visual projection and
does not add cosmetics or mutations to `CreatureGenes`.

## Adult appearance recipe

`DaylingResult.appearance` contains:

```json
{
  "body": "body_chubby",
  "marking": "marking_patchy",
  "expression": "expr_curious",
  "cloudMood": "cloud_curious",
  "headwear": "none",
  "facewear": "none",
  "outfit": "none"
}
```

First mapping:

- Builder → Classic + Focused
- Explorer → Chubby + Curious
- Dreamer → Long + Sleepy/Dreamy
- Rare → Patchy marking
- Epic → Twin Cloud

Wearables remain `none` at settlement so later user customization does not
become a behavioural gene.

## Deterministic vs seeded

| Step | Mode |
|---|---|
| Energy (Work / Explore / Dream) | Deterministic from profile + fixed weights |
| Personality | Deterministic from dominant energy |
| Gene variant pick | Seeded (`date \| seedKey \| genes`) — MVP always picks `*_base` |
| Rarity | Seeded (`… \| rarity`) + energy thresholds |
| Idle / offline events | Seeded (`… \| idle`) |

Same profile + seedKey ⇒ same `DaylingResult`.

## Output shape (`DaylingResult`)

See `src/core/settle.ts`:

- `kind`: `loafling`
- `energy`: `{ work, explore, dream }`
- `genes`: `{ body, cloud, face, tail }`
- `personality`, `rarity` (`common`/`rare`/`epic`), `style`, `appearance`, `traits[]`, `events[]`

## Sense input expectations

Profile must provide at least: `date`, `seedKey`, `keystrokes`, `clicks`, `mouseTravel`, `idleSec`, `activeSec`, `focusSessions[]`, `windowSwitches`, `activeHours[24]`.  
No content text. Align field names with DAY-SENSE schema when that lands.


## Qualities (3 tiers — 老大)

| id | 中文 (desk) | Base weight | Look (ART) |
|---|---|---:|---|
| `common` | 普通 | 70 | `style_common` — soft / plain |
| `rare` | 稀有 | 25 | `style_rare` — richer palette / cloud |
| `epic` | 史诗 | 5 | `style_epic` — distinct silhouette accents |

Seeded at settle (`date|seedKey|rarity`). High energy slightly shifts weight toward rare/epic.
`DaylingResult.rarity` + `DaylingResult.style` remain compatible with the old
PNG fallback. `appearance` drives the modular adult renderer while presentation
genes stay `body/cloud/face/tail`.
`uncommon` retired (do not emit).

## Owners

- Schema in: DAY-SENSE  
- This contract + `src/core`: DAY-CORE  
- Part naming / SVG ids: DAY-ART (+ figma bro)  
- Compose / Mac shell: DAY-DESK  
- Thresholds / acceptance: DAY-LEAD
