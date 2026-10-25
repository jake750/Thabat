#!/bin/bash
# Thabat library on this Mac - created by jake750_
# Starts the library server (thabat-library.py) so your phone can watch the courses in the folders you choose.
# The first run asks for the folders and whether to start the library when you sign in.
cd "$(dirname "$0")" || exit 1
HERE="$(pwd)"
DATA="$HOME/Library/Application Support/Thabat"
PLIST="$HOME/Library/LaunchAgents/tn.thabat.library.plist"
mkdir -p "$DATA"
say_ar() { osascript -e "display dialog \"$1\" buttons {\"OK\"} default button 1 with title \"ثبات · Thabat\"" >/dev/null 2>&1; }

# python3 comes with Apple's command line tools; macOS offers to install them the first time
if ! /usr/bin/python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 7) else 1)' >/dev/null 2>&1; then
  say_ar "تحتاج المكتبة إلى Python 3. اقبل تثبيت «أدوات سطر الأوامر» الذي يقترحه macOS ثم شغّل هذا الملف مرة أخرى.\n\nThe library needs Python 3: accept the «command line developer tools» install that macOS offers, then run this file again."
  xcode-select --install >/dev/null 2>&1
  exit 1
fi

# folders: asked only when none is set yet (later: Thabat > Library > Settings)
if ! /usr/bin/python3 -c "import json,sys; c=json.load(open(sys.argv[1])); sys.exit(0 if c.get('roots') else 1)" "$DATA/library.json" >/dev/null 2>&1; then
  ROOTS=$(osascript -e 'set fs to choose folder with prompt "اختر مجلدات الدورات (يمكنك اختيار عدّة مجلدات) · Choose your course folders" with multiple selections allowed' \
                   -e 'set out to ""' -e 'repeat with f in fs' -e 'set out to out & POSIX path of f & linefeed' -e 'end repeat' -e 'return out' 2>/dev/null)
  if [ -n "$ROOTS" ]; then
    printf '%s' "$ROOTS" | /usr/bin/python3 -c "
import json,sys,os
p=sys.argv[1]
try: c=json.load(open(p))
except Exception: c={}
c['roots']=[l.rstrip('/') for l in sys.stdin.read().splitlines() if l.strip()]
json.dump(c,open(p,'w'),ensure_ascii=False)" "$DATA/library.json"
  fi
fi

# start at sign-in (asked once)
if [ ! -f "$PLIST" ] && [ ! -f "$DATA/library.noauto" ]; then
  A=$(osascript -e 'button returned of (display dialog "تشغيل المكتبة تلقائيًا عند الدخول إلى الحاسوب؟ · Start the library when you sign in?" buttons {"لا · No","نعم · Yes"} default button 2 with title "ثبات · Thabat")' 2>/dev/null)
  if [ "$A" = "نعم · Yes" ]; then
    mkdir -p "$HOME/Library/LaunchAgents"
    cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>tn.thabat.library</string>
<key>ProgramArguments</key><array><string>/usr/bin/python3</string><string>$HERE/thabat-library.py</string></array>
<key>RunAtLoad</key><true/>
</dict></plist>
EOF
    launchctl load "$PLIST" >/dev/null 2>&1
  else
    touch "$DATA/library.noauto"
  fi
fi

# start it now (it exits by itself if it is already running)
nohup /usr/bin/python3 "$HERE/thabat-library.py" >/dev/null 2>&1 &
sleep 1
say_ar "مكتبة ثبات تعمل الآن على هذا الحاسوب. افتح ثبات ← المكتبة ← الإعدادات لترى رمز الربط للهاتف.\n\nThe Thabat library is running on this Mac. Open Thabat › Library › Settings for the phone pairing code."
