#!/bin/bash
# Thabat (ثبات) for macOS — install or update from the latest GitHub release. Created by jake750_.
# Run in Terminal:
#   curl -fsSL https://raw.githubusercontent.com/jake750/Thabat/main/dev/mac/install.sh | bash
# Files fetched this way carry no quarantine mark, so macOS does not stop the launchers.
# It installs into ~/Thabat (an existing folder is updated; your data lives in the browser, not here)
# and adds Thabat.app to ~/Applications.
set -e
DEST="$HOME/Thabat"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
echo "ثبات · Thabat — downloading the latest Mac version…"
curl -fL --progress-bar "https://github.com/jake750/Thabat/releases/latest/download/Thabat-Mac.zip" -o "$TMP/Thabat-Mac.zip"
/usr/bin/ditto -x -k "$TMP/Thabat-Mac.zip" "$TMP/x"
SRC="$TMP/x/Thabat"
[ -f "$SRC/Thabat.html" ] || SRC="$TMP/x"
if [ ! -f "$SRC/Thabat.html" ]; then echo "The download looks wrong (Thabat.html missing). Nothing was changed."; exit 1; fi
mkdir -p "$DEST"
/usr/bin/ditto "$SRC" "$DEST"
chmod +x "$DEST"/*.command 2>/dev/null || true
/usr/bin/xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true
/bin/bash "$DEST/Create-Shortcut.command" >/dev/null 2>&1 || true
/usr/bin/xattr -dr com.apple.quarantine "$HOME/Applications/Thabat.app" 2>/dev/null || true
echo ""
echo "Done: Thabat is in $DEST and Thabat.app is in your Applications folder."
echo "تم: ثبات في المجلد $DEST، و Thabat.app في مجلد التطبيقات (Launchpad و Spotlight)."
echo "To update later, run the same command again. للتحديث لاحقًا شغّل الأمر نفسه مرة أخرى."
open "$HOME/Applications/Thabat.app" 2>/dev/null || /bin/bash "$DEST/Thabat.command"
