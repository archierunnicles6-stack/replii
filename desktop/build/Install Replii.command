#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
APP="$DIR/Replii.app"
DEST="/Applications/Replii.app"

if [ ! -d "$APP" ]; then
  osascript -e 'display alert "Replii.app not found in this folder." as warning'
  exit 1
fi

echo "Installing Replii..."
xattr -cr "$APP" 2>/dev/null || true
rm -rf "$DEST"
ditto "$APP" "$DEST"
xattr -cr "$DEST" 2>/dev/null || true
codesign --force --deep --sign - "$DEST" 2>/dev/null || true

LAUNCHER="$HOME/Desktop/Open Replii.command"
cp "$DIR/Open Replii.command" "$LAUNCHER" 2>/dev/null || cp "$DIR/Install Replii.command" "$LAUNCHER"
chmod +x "$LAUNCHER" 2>/dev/null || true

echo "Opening Replii..."
open -a "$DEST"
osascript -e 'display notification "If macOS still blocks Replii, use Open Replii on your Desktop." with title "Replii installed"'
