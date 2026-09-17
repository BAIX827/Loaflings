# DAY-SENSE — Live counters (Mac demo)

## What counts

| Signal | Source |
|---|---|
| keystrokes | `uiohook-napi` keydown (count only, no characters) |
| clicks | `uiohook-napi` click (skipped while companion focused) |
| mouseTravel | mousemove distance → metres |
| windowSwitches | Cmd/Ctrl+Tab proxy (MVP) |
| idleSec / activeSec / focusSessions / activeHours | gaps + Electron `powerMonitor` |

## Privacy

No typed text, no window titles, no screenshots.

## Permissions

macOS: grant Accessibility (System Settings → Privacy & Security) to Electron / Terminal / Loaflings as prompted.

## IPC

- `loaflings:get-live-profile`
- `loaflings:get-live-settle` → same shape as demo settle, using live profile

Persist file: Electron `userData/live-profile.json`.
