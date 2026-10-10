#!/bin/bash
# Thabat (ثبات) for macOS — created by jake750_
# Creates "Thabat.app" in your Applications folder (~/Applications) with the Thabat icon.
# It shows in Launchpad and Spotlight, can be kept in the Dock, and opens Thabat from this folder.
DIR="$(cd "$(dirname "$0")" && pwd)"
if [ ! -f "$DIR/Thabat.html" ] || [ ! -f "$DIR/Thabat.command" ]; then
  osascript -e 'display alert "ثبات" message "Keep Create-Shortcut.command next to Thabat.html and Thabat.command."' >/dev/null 2>&1
  exit 1
fi
DEST="$HOME/Applications"
APP="$DEST/Thabat.app"
mkdir -p "$DEST"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
[ -f "$DIR/Thabat.icns" ] && cp "$DIR/Thabat.icns" "$APP/Contents/Resources/Thabat.icns"
cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Thabat</string>
  <key>CFBundleDisplayName</key><string>Thabat</string>
  <key>CFBundleIdentifier</key><string>tn.thabat.mac</string>
  <key>CFBundleExecutable</key><string>Thabat</string>
  <key>CFBundleIconFile</key><string>Thabat</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>10.13</string>
  <key>NSHumanReadableCopyright</key><string>Thabat — created by jake750_</string>
</dict>
</plist>
PLIST
# The app remembers this folder; run Create-Shortcut.command again if you move it.
Q=$(printf '%q' "$DIR")
cat > "$APP/Contents/MacOS/Thabat" <<EOF
#!/bin/bash
DIR=$Q
if [ ! -f "\$DIR/Thabat.command" ]; then
  osascript -e 'display alert "ثبات" message "The Thabat folder was moved. Open it and run Create-Shortcut.command again."' >/dev/null 2>&1
  exit 1
fi
exec /bin/bash "\$DIR/Thabat.command"
EOF
chmod +x "$APP/Contents/MacOS/Thabat"
touch "$APP"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP" >/dev/null 2>&1
echo "Done: Thabat.app is in $DEST"
echo "تم: أُضيف Thabat.app إلى مجلد التطبيقات. افتحه من Launchpad أو Spotlight، واسحبه إلى Dock إن أردت."
open -R "$APP"
