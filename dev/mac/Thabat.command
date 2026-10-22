#!/bin/bash
# Thabat (ثبات) launcher for macOS — created by jake750_
# Opens Thabat.html in its own app window (Chrome, Edge, Brave or Chromium), or in Safari.
# 3.96: before opening, at most twice a day, it asks GitHub for the latest release; when a newer version exists it offers to
# update this folder in one click (Thabat-Mac.zip from the fixed repository, unpacked with ditto, quarantine mark removed).
# Everything runs inside main, so replacing this file during an update cannot disturb the script that is running.
main() {
  DIR="$(cd "$(dirname "$0")" && pwd)"
  FILE="$DIR/Thabat.html"
  if [ ! -f "$FILE" ]; then
    osascript -e 'display alert "ثبات" message "Thabat.html is missing next to this launcher."' >/dev/null 2>&1
    exit 1
  fi
  update_check
  URL="file://$(printf '%s' "$FILE" | sed -e 's/%/%25/g' -e 's/ /%20/g' -e 's/#/%23/g' -e 's/?/%3F/g')"
  for APP in "Google Chrome" "Microsoft Edge" "Brave Browser" "Chromium"; do
    if open -Ra "$APP" >/dev/null 2>&1; then
      open -na "$APP" --args --app="$URL" --allow-file-access-from-files
      exit 0
    fi
  done
  open -a Safari "$FILE"
}
vnum() { echo "$1" | awk -F. '{printf "%d%04d%04d\n", $1, $2, $3}'; }
update_check() {
  STAMP="$HOME/.thabat-update"
  NOW=$(date +%s); LAST=0
  [ -f "$STAMP" ] && LAST=$(head -1 "$STAMP" 2>/dev/null | tr -cd '0-9')
  [ -z "$LAST" ] && LAST=0
  [ $((NOW - LAST)) -lt 43200 ] && return 0
  echo "$NOW" > "$STAMP" 2>/dev/null
  LOCAL=$(grep -o "APP_VER='[0-9.]*'" "$FILE" | head -1 | sed -e "s/APP_VER='//" -e "s/'//")
  LATEST=$(curl -fsSL --max-time 6 "https://api.github.com/repos/jake750/Thabat/releases/latest" 2>/dev/null | grep -o '"tag_name": *"[^"]*"' | head -1 | sed -e 's/.*"v\{0,1\}\([0-9.]*\)"$/\1/')
  [ -z "$LOCAL" ] || [ -z "$LATEST" ] && return 0
  [ "$(vnum "$LATEST")" -gt "$(vnum "$LOCAL")" ] || return 0
  ANS=$(osascript -e "display dialog \"يوجد إصدار جديد من ثبات: $LATEST (عندك $LOCAL).\nA new version of Thabat is available: $LATEST (you have $LOCAL).\" with title \"ثبات · Thabat\" buttons {\"لاحقًا · Later\", \"حدّث الآن · Update now\"} default button 2 giving up after 120" 2>/dev/null)
  case "$ANS" in *"Update now"*) ;; *) return 0 ;; esac
  TMP="$(mktemp -d)"
  if curl -fsSL --max-time 600 "https://github.com/jake750/Thabat/releases/latest/download/Thabat-Mac.zip" -o "$TMP/Thabat-Mac.zip" && /usr/bin/ditto -x -k "$TMP/Thabat-Mac.zip" "$TMP/x"; then
    SRC="$TMP/x/Thabat"; [ -f "$SRC/Thabat.html" ] || SRC="$TMP/x"
    if [ -f "$SRC/Thabat.html" ]; then
      cp -f "$FILE" "$FILE.bak" 2>/dev/null
      /usr/bin/ditto "$SRC" "$DIR"
      chmod +x "$DIR"/*.command 2>/dev/null
      /usr/bin/xattr -dr com.apple.quarantine "$DIR" 2>/dev/null
      osascript -e "display notification \"$LATEST\" with title \"ثبات · تم التحديث / Updated\"" >/dev/null 2>&1
    fi
  else
    osascript -e 'display alert "ثبات" message "تعذّر التحديث الآن، سيُفتح الإصدار الحالي. The update failed; the current version opens."' >/dev/null 2>&1
  fi
  rm -rf "$TMP"
}
main "$@"; exit $?
