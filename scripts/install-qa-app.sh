#!/usr/bin/env bash
# Rebuild Loaflings.app and install for click-to-open QA (Applications + Desktop).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run pack
APP_SRC="$ROOT/dist/mac-arm64/Loaflings.app"
if [[ ! -d "$APP_SRC" ]]; then
  echo "Pack failed: $APP_SRC missing" >&2
  exit 1
fi
xattr -cr "$APP_SRC" 2>/dev/null || true
rm -rf "/Applications/Loaflings.app"
cp -R "$APP_SRC" "/Applications/Loaflings.app"
xattr -cr "/Applications/Loaflings.app" 2>/dev/null || true
rm -rf "$HOME/Desktop/Loaflings.app"
cp -R "$APP_SRC" "$HOME/Desktop/Loaflings.app"
xattr -cr "$HOME/Desktop/Loaflings.app" 2>/dev/null || true
echo "Installed: /Applications/Loaflings.app and ~/Desktop/Loaflings.app"
echo "Open once, then right-click Dock icon → Options → Keep in Dock."
echo "Accessibility: enable Loaflings (not Electron) after each replace."
