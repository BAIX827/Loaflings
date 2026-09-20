# DAY-SENSE — Live counters (Mac demo)

## What counts

| Signal | Source |
|---|---|
| keystrokes | `uiohook-napi` keydown (count only, no characters) |
| clicks | `uiohook-napi` click (counted always (including companion window)) |
| mouseTravel | mousemove distance → metres |
| windowSwitches | Cmd/Ctrl+Tab proxy (MVP) |
| idleSec / activeSec / focusSessions / activeHours | gaps + Electron `powerMonitor` |

## Privacy

No typed text, no window titles, no screenshots.

## Permissions

macOS: grant Accessibility (System Settings → Privacy & Security) to Electron / Terminal / Loaflings as prompted.
Until permission is granted, Loaflings starts in `idle-only` mode: the companion remains usable and idle time can still update, but global key/click/mouse counters stay disabled.

## IPC

- `loaflings:get-live-profile`
- `loaflings:get-live-settle` → same shape as demo settle, using live profile

Persist file: Electron `userData/live-profile.json`.

## TASK-004 polish

- Own-window skip removed per 老大: keystrokes + clicks always count
- `getSenseStatus()` / IPC `loaflings:get-sense-status`
- `openAccessibilitySettings()` opens macOS Accessibility pane (renderer shows tap hint if backend ≠ uiohook)
- Day egg rollover still via `ensureToday()`
