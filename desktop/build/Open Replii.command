#!/bin/bash
# Double-click to open Replii (clears quarantine + avoids silent no-op launches).
set -e

APP="/Applications/Replii.app"
DEV_APP="$(cd "$(dirname "$0")/../.replii-dev" 2>/dev/null && pwd)/Replii.app"

if [ ! -d "$APP" ]; then
  if [ -d "$DEV_APP" ]; then
    open "$DEV_APP"
    exit 0
  fi
  osascript -e 'display alert "Install Replii first — open the DMG and run Install Replii.command, or download from replii.ai/download." as warning'
  exit 1
fi

# Dev Electron uses the same app name and can block the installed build.
pkill -f "desktop/.replii-dev/Replii" 2>/dev/null || pkill -f "desktop/.replii-dev/Electron" 2>/dev/null || true
sleep 0.3

xattr -cr "$APP" 2>/dev/null || true
codesign --force --deep --sign - "$APP" 2>/dev/null || true

open -a "$APP"
