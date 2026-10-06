#!/bin/bash
# Thabat (ثبات) launcher for macOS — created by jake750_
# Opens Thabat.html in its own app window (Chrome, Edge, Brave or Chromium), or in Safari.
DIR="$(cd "$(dirname "$0")" && pwd)"
FILE="$DIR/Thabat.html"
if [ ! -f "$FILE" ]; then
  osascript -e 'display alert "ثبات" message "Thabat.html is missing next to this launcher."' >/dev/null 2>&1
  exit 1
fi
URL="file://$(printf '%s' "$FILE" | sed -e 's/%/%25/g' -e 's/ /%20/g' -e 's/#/%23/g' -e 's/?/%3F/g')"
for APP in "Google Chrome" "Microsoft Edge" "Brave Browser" "Chromium"; do
  if open -Ra "$APP" >/dev/null 2>&1; then
    open -na "$APP" --args --app="$URL" --allow-file-access-from-files
    exit 0
  fi
done
open -a Safari "$FILE"
