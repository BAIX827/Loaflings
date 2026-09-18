# DAY-SENSE — activity profile module

Privacy-first, count-only metrics for Loaflings.

## Contract with DAY-CORE

`DailyActivityProfile` field names match `src/core/profile.ts` exactly:

`date`, `seedKey`, `keystrokes`, `clicks`, `mouseTravel`, `idleSec`, `activeSec`, `focusSessions[]`, `windowSwitches`, `activeHours[24]`.

- Demo fixture: `fixtures/demo-day.json`
- Live profile (Electron): written under app `userData` / also mirrored for settle

## Live sensing

`liveSensor.js` (main process):

- `uiohook-napi` → keystrokes, clicks, mouse travel, Cmd/Ctrl+Tab as window-switch proxy
- Electron `powerMonitor.getSystemIdleTime()` → idle accumulation
- Keystrokes and clicks always counted (even with companion focused)
- Never stores key characters / titles / screenshots

Grant **Accessibility** (and Input Monitoring if prompted) on macOS or global hooks will not fire.

## Code

- Types: `profile.ts`
- Aggregator stub: `builder.ts`
- Live: `liveSensor.js`
