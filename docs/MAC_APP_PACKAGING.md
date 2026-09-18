# Mac `.app` packaging (DAY-DESK)

Unsigned MVP Dock / double-click build for **Loaflings / 摸鱼灵**.

## Build (on macOS)

```bash
cd "/Users/baricy/Library/Mobile Documents/com~apple~CloudDocs/Loaflings"  # or your clone
git pull origin main
# ensure packaging commit/files are present (electron-builder.yml, pack scripts, boot.js)
npm install
npm run pack          # → dist/mac-arm64/Loaflings.app (Apple Silicon) or dist/mac/ (Intel)
# npm run dist        # also builds .dmg
```

## Open

```bash
open dist/mac-arm64/Loaflings.app   # or dist/mac/Loaflings.app
```

First launch (unsigned): right-click → **Open**, or allow in Privacy & Security. Live sense still needs **Accessibility**.

## Config

| Item | Value |
|------|--------|
| Config | `electron-builder.yml` |
| Scripts | `npm run pack` / `npm run dist` / `npm run dist:dir` |
| Icon | `src/art/AppIcon.png` → `.icns` at pack time |
| Packaged entry | `src/desk/boot.js` (tsx then `main.js`) |
| Output | `dist/` (gitignored) |
| Sign/notarize | TODO — `identity: null` for local MVP |

Egg / hatch / reveal / collection / live sense unchanged vs `npm start`.
