#!/bin/bash
# Double-click after dragging Ghost to Applications if macOS says the app is "damaged".
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
APP="$DIR/Ghost.app"
DEST="/Applications/Ghost.app"

echo "Installing Ghost..."
if [ ! -d "$APP" ]; then
  APP="$DIR/../Ghost.app"
fi

if [ ! -d "$APP" ]; then
  osascript -e 'display alert "Ghost.app not found next to this installer." as warning'
  exit 1
fi

xattr -cr "$APP" 2>/dev/null || true
ditto "$APP" "$DEST"
xattr -cr "$DEST" 2>/dev/null || true
codesign --force --deep --sign - "$DEST" 2>/dev/null || true

echo "Opening Ghost..."
open "$DEST"
