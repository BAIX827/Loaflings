#!/usr/bin/env bash
# Rebuild Loaflings.app and install ONE copy to /Applications (QA).
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
# Remove Desktop duplicate — only Applications
rm -rf "$HOME/Desktop/Loaflings.app"
rm -rf "/Applications/Loaflings.app"
cp -R "$APP_SRC" "/Applications/Loaflings.app"
xattr -cr "/Applications/Loaflings.app" 2>/dev/null || true
echo "Installed: /Applications/Loaflings.app (only)"
echo "Dock: open once → Options → Keep in Dock."
echo "Accessibility: enable Loaflings after each replace."
