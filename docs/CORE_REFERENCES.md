# Core — open-source references

We studied desktop companions for **structure**, not game design copy:

| Project | What we took | What we deliberately skip |
|---|---|---|
| [Gamma-Software/BongoCat-mac](https://github.com/Gamma-Software/BongoCat-mac) (MIT) | Thin modules; UI ≠ rules; start/stop boundaries | Reading key *characters*; animation-as-core-loop |
| Idle pet / desktop buddy patterns generally | Pure state helpers DESK can call without importing Electron | Coin shops, paywalled cosmetics |

## Applied in `src/core`

- **No I/O** — no `fs`, no Electron, no hooks (BongoCat splits monitor vs overlay; we split rules vs desk/sense).
- **`hatchProgress.ts`** — visual stages only (clicks → phase).
- **`dayCycle.ts`** — calendar egg / `hatchDay` / new-day.
- **`idleMood.ts`** — optional weights for ART idle MVP; **never** mutates genes or settle.
- **`settle.ts` + `energy.ts` + `genes.ts`** — deterministic / seeded interpretation of the day.

Privacy: CORE never sees typed text — only SENSE count fields on the profile.
