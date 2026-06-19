#!/bin/bash
# Double-click to open Ghost (clears quarantine + avoids silent no-op launches).
set -e

APP="/Applications/Ghost.app"
DEV_APP="$(cd "$(dirname "$0")/../.ghost-dev" 2>/dev/null && pwd)/Ghost.app"

if [ ! -d "$APP" ]; then
  if [ -d "$DEV_APP" ]; then
    open "$DEV_APP"
    exit 0
  fi
  osascript -e 'display alert "Install Ghost first — open the DMG and run Install Ghost.command, or download from ghost.ai/download." as warning'
  exit 1
fi

# Dev Electron uses the same app name and can block the installed build.
pkill -f "desktop/.ghost-dev/Ghost" 2>/dev/null || pkill -f "desktop/.ghost-dev/Electron" 2>/dev/null || true
sleep 0.3

xattr -cr "$APP" 2>/dev/null || true
codesign --force --deep --sign - "$APP" 2>/dev/null || true

open -a "$APP"
