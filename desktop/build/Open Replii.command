#!/bin/bash
# Double-click to open Replii (clears quarantine + avoids Gatekeeper blocks).
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALLED="/Applications/Replii.app"
LOCAL="$DIR/Replii.app"
DEV_APP="$(cd "$DIR/../.replii-dev" 2>/dev/null && pwd)/Replii.app"

if [ -d "$INSTALLED" ]; then
  APP="$INSTALLED"
elif [ -d "$LOCAL" ]; then
  APP="$LOCAL"
elif [ -d "$DEV_APP" ]; then
  open "$DEV_APP"
  exit 0
else
  osascript -e 'display alert "Replii.app not found. Run Install Replii.command in this folder, or drag Replii to Applications." as warning'
  exit 1
fi

# Dev Electron uses the same app name and can block the installed build.
pkill -f "desktop/.replii-dev/Replii" 2>/dev/null || pkill -f "desktop/.replii-dev/Electron" 2>/dev/null || true
sleep 0.3

xattr -cr "$APP" 2>/dev/null || true
codesign --force --deep --sign - "$APP" 2>/dev/null || true

open -a "$APP"
