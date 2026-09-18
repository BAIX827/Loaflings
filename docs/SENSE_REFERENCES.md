# Sense — open-source references

We studied (not copied) desktop-input overlays for structure and UX:

| Project | Notes for Loaflings |
|---|---|
| [Gamma-Software/BongoCat-mac](https://github.com/Gamma-Software/BongoCat-mac) (MIT) | Separate `InputMonitor` with start/stop + callbacks; Accessibility permission; overlay vs monitor split. They read key *characters* for animation — **we never do** (count-only). |
| [luinbytes/bongocat](https://github.com/luinbytes/bongocat) | Global hooks + clear Accessibility/admin docs. |
| [111116/mac-typing-bongo-cat](https://github.com/111116/mac-typing-bongo-cat) | Event-tap / Accessibility troubleshooting patterns. |

## Applied here

- `src/sense/inputHook.cjs` — thin hook (BongoCat-style monitor module)
- `src/sense/liveSensor.js` — aggregation / day profile only
- Permission hint + idle fallback when hooks unavailable
- Privacy: no characters, titles, or screenshots
