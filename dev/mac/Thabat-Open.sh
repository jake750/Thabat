#!/bin/bash
# Thabat (ثبات) for macOS — created by jake750_
# 3.168: «Open with Thabat» for PDF files. Thabat.app (made by Create-Shortcut.command) runs this with the file's path.
# The page cannot read files by itself, so the book is copied beside it as a small script in inbox/;
# the open Thabat window picks it up within a few seconds and asks for a short name. Copies older than two days are removed.
DIR="$(cd "$(dirname "$0")" && pwd)"
P="$1"
[ -f "$P" ] || exit 1
case "$(printf '%s' "$P" | tr 'A-Z' 'a-z')" in *.pdf) ;; *) exit 1 ;; esac
head -c 5 "$P" | grep -q '%PDF-' || exit 1
SZ=$(stat -f%z "$P" 2>/dev/null || wc -c <"$P" | tr -d ' ')
if [ "$SZ" -gt 83886080 ]; then
  osascript -e 'display alert "ثبات" message "الملف أكبر من 80 م.ب.، أضفه من «الكتب» في ثبات.\nThe file is over 80 MB; add it from Books in Thabat."' >/dev/null 2>&1
  exit 1
fi
IN="$DIR/inbox"; mkdir -p "$IN"
find "$IN" -name 'thabat-pdf-*.js' -mtime +2 -delete 2>/dev/null
ID="$(date +%s)$RANDOM"
NAME="$(basename "$P" | tr -d '\r\n' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')"
{ printf '(window.__THPDF=window.__THPDF||{})["%s"]={n:"%s",s:%s,b:"' "$ID" "$NAME" "$SZ"; base64 -i "$P" | tr -d '\n'; printf '"};\n'; } > "$IN/thabat-pdf-$ID.js.part" && mv -f "$IN/thabat-pdf-$ID.js.part" "$IN/thabat-pdf-$ID.js"
# the list the page reads: the ten newest
LIST=$(ls -1t "$IN"/thabat-pdf-*.js 2>/dev/null | head -10 | sed -e 's#.*/thabat-pdf-##' -e 's#\.js$##' | awk '{printf "%s\"%s\"", (NR>1?",":""), $0}')
printf 'window.__THINB=[%s];\n' "$LIST" > "$IN/thabat-inbox.js"
# open Thabat when no window of it is open
if ! pgrep -f "Thabat.html" >/dev/null 2>&1; then /bin/bash "$DIR/Thabat.command" >/dev/null 2>&1 & fi
exit 0
