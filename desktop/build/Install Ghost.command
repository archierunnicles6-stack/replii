#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
APP="$DIR/Ghost.app"
DEST="/Applications/Ghost.app"

if [ ! -d "$APP" ]; then
  osascript -e 'display alert "Ghost.app not found in this folder." as warning'
  exit 1
fi

echo "Installing Ghost..."
xattr -cr "$APP" 2>/dev/null || true
rm -rf "$DEST"
ditto "$APP" "$DEST"
xattr -cr "$DEST" 2>/dev/null || true
codesign --force --deep --sign - "$DEST" 2>/dev/null || true

LAUNCHER="$HOME/Desktop/Open Ghost.command"
cp "$DIR/Open Ghost.command" "$LAUNCHER" 2>/dev/null || cp "$DIR/Install Ghost.command" "$LAUNCHER"
chmod +x "$LAUNCHER" 2>/dev/null || true

echo "Opening Ghost..."
"$DEST/Contents/MacOS/Ghost" &
osascript -e 'display notification "If macOS still blocks Ghost, use Open Ghost on your Desktop." with title "Ghost installed"'
