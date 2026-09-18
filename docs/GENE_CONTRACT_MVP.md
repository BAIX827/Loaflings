# Loaflings MVP — Gene Contract (DAY-CORE)

Status: draft v1 · locked part IDs with DAY-ART / DAY-LEAD  
Canonical art: `character/Pet_Base_Master.svg` + `character/PARTS_MVP.md`

## Daily form

One egg per local day → `hatchDay` / `settleDay` → one Loafling. See `docs/DAY_CYCLE_MVP.md`.

## Pipeline

```text
DAY-SENSE DailyActivityProfile (count-only JSON)
        → DAY-CORE energy + genes + settle
        → CreatureGenes { body, cloud, face, tail }
        → DAY-ART / figma bro SVG parts (same ids)
        → DAY-DESK companion compose
```

## Gene fields (MVP)

| Field | MVP value | Driven mainly by | Notes |
|---|---|---|---|
| `body` | `body_base` | focus / Work energy | Soft dough silhouette |
| `cloud` | `cloud_base` | idle / Dream (+ focus flavour later) | Floating thought cloud — **not** sprout |
| `face` | `face_base` | typing / Work bursts | Eyes + blush + `w` mouth |
| `tail` | `tail_base` | mouse / Explore | Soft peach puff |

Deprecated: `sprout`.

Post-MVP (do not implement yet): `palette`, `accessory`, `ears`, mutations.

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
- `personality`, `rarity` (`common`/`rare`/`epic`), `style`, `traits[]`, `events[]`

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
`DaylingResult.rarity` + `DaylingResult.style` — presentation genes stay `body/cloud/face/tail` until ART ships variant PNGs.
`uncommon` retired (do not emit).

## Owners

- Schema in: DAY-SENSE  
- This contract + `src/core`: DAY-CORE  
- Part naming / SVG ids: DAY-ART (+ figma bro)  
- Compose / Mac shell: DAY-DESK  
- Thresholds / acceptance: DAY-LEAD
