# DAY-SENSE — activity profile module

Privacy-first, count-only metrics for Loaflings.

## Contract with DAY-CORE

`DailyActivityProfile` field names match `src/core/profile.ts` exactly:

`date`, `seedKey`, `keystrokes`, `clicks`, `mouseTravel`, `idleSec`, `activeSec`, `focusSessions[]`, `windowSwitches`, `activeHours[24]`.

Demo fixture: `fixtures/demo-day.json` — pass into CORE `settleDay()`.

## Not collected

Typed text, documents, screenshots, window titles, message contents.

## Own-window exclusion

Desk should call `excludeWindowIds([...])` with the companion window id(s). Stubbed in MVP builder.

## Next

Wire real macOS Input Monitoring / Accessibility sensors; keep this JSON shape stable.
