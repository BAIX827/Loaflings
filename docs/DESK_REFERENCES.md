# Desk — open-source references

We studied (not copied) desktop companion shells for structure:

| Project | Notes for Loaflings |
|---------|-------------------|
| [BongoCat-mac](https://github.com/Gamma-Software/BongoCat-mac) | Thin always-on-top overlay window; keep input monitoring out of the window module. |
| Desktop pet / idle companions generally | Non-intrusive chrome, optional click-through later; prefs persisted locally. |

## Module layout (DAY-DESK)

| File | Role |
|------|------|
| `main.js` | App lifecycle only |
| `window.js` | BrowserWindow create + opacity/size/lock |
| `ipc.js` | All `ipcMain` handlers |
| `settleBridge.js` | SENSE → CORE settle/hatch wiring |
| `renderer.js` | Companion UI (hatch stages, HUD, guide, settings) |
| `settings.js` / `collection.js` / `dayState.js` | Local persistence |

Privacy: desk never reads typed text; SENSE only supplies counts.
