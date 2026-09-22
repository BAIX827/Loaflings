# Loaflings Windows preview

## Which file should a tester download?

- `Loaflings-0.1.0-Windows-x64-Setup.exe` — recommended. Runs a normal installer and creates Start menu / desktop shortcuts.
- `Loaflings-0.1.0-Windows-x64-Portable.exe` — no installation. Put it in any folder and run it directly.
- `SHA256SUMS.txt` — optional integrity check for either download.

Only 64-bit Windows is included in this preview.

## First launch

This preview is not code-signed yet. Windows SmartScreen may show **Windows protected your PC** even when the checksum matches. To continue:

1. Select **More info**.
2. Confirm the publisher is shown as **Unknown publisher**.
3. Select **Run anyway**.

Download only from the official GitHub Release page. Do not use a copy re-uploaded by somebody else.

## Privacy

Loaflings counts clicks, keystrokes, mouse travel, active/idle time and focus changes so the egg can grow. It does **not** store the keys you type, typed text, screenshots, documents or window titles. Data remains in the tester's local Electron user-data folder.

## What to test

1. Start Loaflings and confirm an egg appears.
2. Click and type in normal applications; confirm the current-egg number increases.
3. Open **今日 / Today** before 29,000 activity hits; it should show progress and remain an egg.
4. Open **图鉴 / Pack** and check Collection, Catalogue and Statistics.
5. Close and reopen Loaflings; today's progress should still be present.
6. If testing across midnight, choose either Continue (keeps egg progress) or New Egg (resets egg progress); lifetime statistics should remain.

## Build the release locally

From PowerShell in the repository:

```powershell
npm install
npm run verify
npm run dist:win
```

The generated installer and portable executable are written to `dist/`. Release artifacts are intentionally excluded from Git.
