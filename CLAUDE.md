# Thabat (ثبات): project guide for Claude

Thabat is a prayer-centred productivity app by Fourat Bouchaa (فرات بوشاعة), credited as **jake750_**.
It plans the day around the five prayers: prayer times and adhan, a Quran reader, a work timer, tasks, calendar, health and notes.
Current version: **3.11.0** (`APP_VER` in `dev/src.html`). The Android `versionCode` is still 32 and must be bumped before any Play upload.

## Working with the owner

- Reply in Modern Standard Arabic (فصحى) or English. Never use Franco-Arabic (Arabic in Latin letters). He writes in Tunisian/Libyan dialect; answer in فصحى.
- Dates: Hijri first, Gregorian below it, with Maghrebi month names (جانفي، فيفري، مارس، أفريل، ماي، جوان، جويلية، أوت، سبتمبر، أكتوبر، نوفمبر، ديسمبر).
- Ship builds for **Android, Windows and macOS**. Do not build anything for iOS.
- He reports bugs with phone or PC screenshots (his phone is about 411×860 CSS px, Android; his PC is 1920×1040 with the interface size around 125%). Reproduce each one at the matching size before fixing it.
- When he asks for «اقتراحات», show 2–3 options as a visual mockup (the visualize widget) with a recommendation, then implement the one he picks. Ask before large redesigns.
- After every change: rebuild, run `dev/release.py`, send him `Thabat.apk`, `Thabat-Windows.zip` and `Thabat-Mac.zip`, commit, push and publish a GitHub release (see «Release»).
- His personal copy is `C:\Users\foura\Documents\Thabat\`. `release.py` replaces only `Thabat.html` there (old one kept as `Thabat.html.bak`). Touch nothing else in that folder: it holds his data (`الأيام`, `نسخ أسبوعية`, `thabat-backup.json`). Never package from it.
- Never remove or weaken the "created by jake750_" credit, the logo or `LICENSE.txt`.

## This machine (Windows 11)

- Project: `C:\Users\foura\Documents\Thabat Dev` (git repo, remote https://github.com/jake750/Thabat, public, branch `main`). The home folder `C:\Users\foura` is also a git repo with no commits; ignore it.
- Use `python` (3.14) and `node`. `dev/lib.py` and `dev/build.py` read and write UTF-8 with `newline=''`, so LF endings survive on Windows.
- GitHub CLI: `C:\Program Files\GitHub CLI\gh.exe` (logged in as `jake750`). Prepend it to `PATH` in Bash: `export PATH="/c/Program Files/GitHub CLI:$PATH"`.
- Android SDK build-tools 35.0.1 (`zipalign.exe`, `lib/apksigner.jar`) under `%LOCALAPPDATA%\Android\Sdk`; JDK `C:\Users\foura\.jdks\temurin-24.0.2`. There is **no apktool/d8/aapt2/bundletool** here, so the APK is made by swapping the HTML into `android/base.apk` (see «Android»).
- `android/` (git-ignored) holds `thabat-signing.keystore` and `base.apk`. The keystore password is **not** written anywhere in the repo; the owner gives it, and it goes in the `THABAT_KS_PASS` environment variable.
- Playwright is not installed. Test in the built-in browser pane (below).

## Folder layout

| Path | What it is |
|---|---|
| `dev/src.html` | **The source of truth.** Single-file app (HTML + CSS + JS) with placeholders for large inline assets |
| `dev/placeholders.json` | Values of `__MQ_RAW__`, `__ICON192__`, `__ICON32__` that `build.py` fills in |
| `dev/build.py` | Writes `Thabat/Thabat.html` from `src.html` |
| `dev/release.py` | Build, syntax check, package zips and APK, update the personal copy, print versions |
| `dev/lib.py` | Patch helper class `P` (see below) |
| `dev/modules/` | Modules already merged into `src.html`, kept for reference: c1–c9, d1–d5, e1–e2, f1–f3, g1–g13 (g13 + g13b + g13c, css g13 + g13bc; + matching `.css`), demo.js |
| `dev/tlchk.sh` | Checks a new module for top-level name collisions |
| `dev/src_vNNN.html` | Local backups before each patch (git-ignored) |
| `dev/mac/` | Everything `release.py` puts into `Thabat-Mac.zip` besides the HTML: `Thabat.command` (launcher), `Create-Shortcut.command` (makes `~/Applications/Thabat.app` with the icon, pointing at that folder), `Thabat.icns` (built from the PNG frames of `Thabat.ico`), the bilingual read-me. `.command` files are stored as executable |
| `dev/android/` | Java sources, stubs, `res/`, manifest and the Linux build scripts of the Android wrapper |
| `Thabat/Thabat.html`, `Thabat.html` | Build output (git-ignored) |
| `Thabat.apk`, `Thabat-Windows.zip`, `Thabat-Mac.zip` | Release outputs (git-ignored; published as GitHub release assets). The zips are also the base for the next release |
| `android/` | `thabat-signing.keystore` (**private, never publish or commit**) and `base.apk` (the 3.3.1 APK used as the shell) |
| `.claude/launch.json` | Preview server for testing (`python -m http.server 8765`) |

## Architecture (short)

- **One HTML file, no framework, no build step at runtime.** It must work from `file://`.
- **Windows:** Edge app mode (`msedge --app=file:///…`) through `Thabat.bat`/`Thabat.vbs`. `Thabat-Helper.ps1` is a loopback HTTP listener on port 47813 for file saving and downloads. LAN transfer uses port 47814 with a 6-digit code.
- **macOS:** no helper. `Create-Shortcut.command` makes a `Thabat.app` (untested on a real Mac so far). `Thabat.command` opens the HTML in Chrome/Edge/Brave app mode, or Safari. `MAC` (user-agent check) sets `html.mac`, which hides helper-only features (Mawaqit search, link downloads, LAN transfer, ICS by URL, active-app detection, PC notifications); setup goes straight to calculated times. GitHub sync works (api.github.com allows CORS; Mawaqit does not).
- **Android:** package `tn.thabat.app`, a WebView wrapper loading `assets/www/Thabat.html`. The bridge `window.ThabatAndroid` (`Bridge.java`) provides alarms, the adhan (`AdhanService`), widgets (`Widget`…`Widget5`), biometrics, share and file saving. Native inset measurements are in `window.ANDNAV`. minSdk 26, targetSdk 36.
- **State:** a global `S` saved to `localStorage['thabat.v1']` and mirrored to IndexedDB `thabat`. Per-day data is under `day(key)`, keys `YYYY-MM-DD`. GitHub (gist) sync works per record (`d:<date>` for days).
- **i18n:** `t(key,…args)` with one Arabic and one English table. Every visible string goes through it. Default is `ar`/RTL.
- **Theme:** CSS variables (`--bg --panel --line --text --muted --accent --water --gold`) set by `applyTheme()`; `applyLook2()` applies contrast and the interface zoom. Classes on `<html>`: `st-glass` (the glass style), `lite` (performance mode), `lg` (light glass: phones in automatic performance mode), `android`, `mac`, `qfs`/`qfs-one` (full-screen Quran), `mode-light`.
- **Feature flags:** `THABAT_PLAY` (true only in the Play build), `SUPPORT_EMAIL` (still empty; the privacy page also has a placeholder).
- **What's new:** `CHANGES` maps each `APP_VER` to an i18n key (`chg.38` …). The dialog opens after an update only when that key changed, so patch versions reuse the current key. A new feature release adds a new `chg.NN` in both languages.

## Current design (3.6 → 3.10)

- **Navigation:** pages sit in a floating pill (`nav.side.flt .navpill`, side on PC, bottom on phone); settings is a separate round button (`.navset`). Every page has a small title (`.pgt`, 20 px / 18 px on phone).
- **Today:** date card | next-prayer card (same height, prayer times inside), then the ayah of the day as its own card.
- **Settings:** a grouped list with coloured icons (`SETG` in g1.js); a group opens only its cards; search shows matches from all groups. Anything that scrolls to a setting opens its group first.
- **Summary:** one «🧰 الأدوات» menu (`#btPanel`, grouped, each tool with a description) beside week/month and prev/now/next.
- **Quran on phone:** one bar (`#qbTop`): position button «سورة · ج · ص» → «انتقل إلى» sheet; riwaya picker; full-screen icon; «⋯» → tools sheet. The PC bar is unchanged. Existing elements are moved, not copied.
- **Notes:** row 1 sections + «⋯» (letters, Obsidian import/export) + «ملاحظة جديدة»; row 2 search.
- **Calendar:** PC stars sit in the gaps; on phones stars and moons spread evenly over the whole calendar (best-candidate sampling) and never cover a day's text. The day panel shows sleep, pages read and the «يومك بين الصلوات» bar for any day.
- **Day between the prayers (3.9, g11):** card `#pdlCard`, right after the wall card (`.glasswrap`) in the narrow column. The owner wants the wall card first; `S.settings.wallTop` moved it first once for saved card orders (3.10.2). One row per prayer (after Fajr … after Isha) with tasks whose `after` is that prayer, focus time from sessions, timed events, and for the current period the time left and «ابدأ جلسة». Tasks drag between rows (PC) or tap → `tpMenu` (phone); today's tasks without a prayer show as chips below. No new data fields.
- **Ctrl+K** also searches settings labels (`cmdSetHits`); the phone swipe shows an edge hint (`.swphint`); nav tooltips show the 1–5 shortcuts.
- **Compact Today (3.9.1, approved, on by default):** `S.settings.tdCompact!==false` → `html.tdc`: on phones the date and next-prayer cards join into one, chips sit in one scrolling row; on PC date | ayah | prayers in one row. The ayah of the day is always shown in full (the owner does not want it folded). The look settings can switch it off.
- **3.10 (g12):** phones get ≥38–40 px buttons; task rows on phones show only ⠿ / check / ⋯ / ✕ (postpone, subtask, timer, matrix moved into ⋯). Dialogs (`.modal.uxsheet`, all but `cmdk`, `noteModal`, `setupModal`, `pinModal`) are bottom sheets on phones with a `.uxgrab` handle; dragging down closes them by clicking the backdrop, then an `…X`/cancel button, then removing `on`. Calendar grid swipe = month. Scroll position per page (`UX_POS`); `S.settings.openLast` reopens the last page (`localStorage['thabat.lastView']`). Smart task input `uxParse` (غدًا/غدوة/بعد غد/يوم الخميس/بعد N أيام, بعد العصر, كل جمعة/كل يوم/كل شهر, and English) with a live preview line. The existing task «⋯» menu (`tkMenu`) is extended by `uxMenuExtras`; right click and long press open it. Shift-click or «تحديد» selects several tasks (`UXT.sel`, bar `#uxSel`). «الكل إلى الغد» copies unfinished tasks like `postponeTask`. Trash `S.trash` (tasks and notes, 30 days; note images and audio are dropped only when purged), `openTrash()`. «يومك في سطور» card `#uxRecap` from Isha+20 min. Every Today card has a «⋯» (`uxcm`): fold (`home3[k].c`), move, hide. Ctrl +/−/0 set `S.settings.zoom`. `html.wide3` (effective width ≥1450, `S.settings.wide3`) makes Today three equal columns (`#uxCol3` added): the wall, the timer and the tasks head their columns (`.uxanchor`), every other card goes in order to the shortest column (`uxBalance`; cards are detached first so heights are measured right). Each card remembers its stack and index (`data-uxp`, `data-uxi`) and goes back when the window narrows (`uxUnbalance`). Fold/hide re-balance. The owner asked for visual balance (no empty column). Shortcut keys in tooltips. Offline note `#uxNet`.
- **3.11 (g13*):** Mulk task daily (`mulk-<date>`, after Isha, `S.settings.mulk`); late prayer asks a reason (`day.lateWhy`, shown in the Summary prayer card); repeat rule `nw` («N times a week», `rcMatch` wrapped, smart input and 🔁 menu); stuck tasks (`tkChain`≥3) offer split/drop/keep; «to the lightest day» in the task menu; the existing Ramadan chip (last 40 days) is extended from 120 days; «a Hijri year ago» chip; bedtime line in the recap; year-goal pace; wake lock while working (`S.settings.wakeWork`); Summary card `#bPeriods` (focus per prayer period); Fajr line in `corr()`. Ctrl+K value commands (`cmdArgs`), custom keys (`S.settings.keymap`), pull-to-sync, sliding page change (`uxsl-f/b`), presentation mode (`html.privm`, Ctrl+Shift+H), gestures guide (`S.gestSeen`), `html.comfy`, nav pages (`S.settings.navCfg`), undo history (`UNDO.tm`), «what you do not use» (`localStorage['thabat.use']`). Notes: backlinks, nested tags (`noteTags` replaced), share PNG/PDF. Ayah image card (shows the riwaya when not Hafs; text riwayat number ayat their own way, e.g. Qalun's 2:255 is Hafs's 2:256). Agenda, calendar layers (`S.settings.calLayers`), drag events between days, drop files on Today.
- **Quran tracking:** in full screen, 40 s on a page marks it read (`day.quran.pgs`), counts toward the wird, and moves the khatma only when it is the next page. Scanned riwayat have a highlighter (`S.quran.lmarks`).

## How to change the code

Patch `dev/src.html` with a small Python script using `lib.P` (write it to the scratchpad, or a heredoc). Never hand-edit the built `Thabat/Thabat.html`.

```python
import sys; sys.path.insert(0, r'C:\Users\foura\Documents\Thabat Dev\dev')
from lib import P
p = P()
p.rep(old, new, count=1)          # exact replace; asserts the number of matches
p.css("…")                        # appends CSS before the /* image viewer */ marker
p.js("modules/x.js")              # inserts a JS module before the image-viewer section
p.i18n({'k': 'عربي'}, {'k': 'English'})   # adds strings to both languages
p.save()
```

Before applying a patch:
1. Back up the source: `cp dev/src.html dev/src_vNNN.html`.
2. Write new code as `dev/modules/<name>.js` (+ `.css`) and run `bash dev/tlchk.sh dev/modules/x.js dev/src.html`. A second `function foo()` silently replaces the first one.
3. When a later fix changes a module, apply the same `rep` to the module file too. **Read a file before reopening it for writing** (opening with `'w'` empties it first).

To extend an existing function, wrap it instead of rewriting it (function declarations can be reassigned; callers use the new one):

```js
{const _f = renderCal; renderCal = function(...a){ const r=_f(...a); /* extra */ return r }}
```

Bump `APP_VER` (and the `CHANGES` map) in the same patch.

## Testing

1. `python dev/build.py` (or `python dev/release.py --no-apk`), then the syntax check is automatic in `release.py`.
2. Start the preview: `preview_start` with name `thabat` (serves the project root on port 8765), then open `http://localhost:8765/Thabat.html?v=<something new>`. **Always change `?v=`**: the browser caches the old build otherwise.
3. In the page, first close overlays: `document.querySelectorAll('.modal.on,.praymodal.on').forEach(m=>m.classList.remove('on'))` (the prayer reminder and «الجديد» dialog pop up in the test).
4. Sizes: phone 360×780, 390×844 and 411×860; PC 1366×700, a short 1280×520, and 1920×1040 with `S.settings.zoom=1.25;applyLook2()`. Arabic and English, dark and light, and glass + lite. Simulate the phone's automatic lite mode with `window.LOWP_=true;applyTheme()`.
5. Prefer measuring with JavaScript (bounding boxes, overlaps, `scrollWidth>innerWidth`) and confirm with a screenshot. Screenshots taken right after `showView` can catch the 0.25 s fade.
6. Reset the viewport with `resize_window` preset `desktop` when done.

## Release

1. `THABAT_KS_PASS` must be set (ask the owner), then `python dev/release.py`. It builds, checks syntax, swaps the HTML into `Thabat-Windows.zip`, `Thabat-Mac.zip` and `android/base.apk` (then zipalign + apksigner; it checks the certificate SHA-256 `cf19fc4a…22f0`), updates the personal copy and prints the version inside every output.
2. Update «Current version» and the module list in this file.
3. Commit (message ends with the Co-Authored-By line), `git push`, then:
   `gh release create vX.Y.Z Thabat.apk Thabat-Windows.zip Thabat-Mac.zip --target main --title "ثبات X.Y.Z" --notes "<Arabic notes>\n\ncreated by jake750_"`
4. Send the three files to the owner.

Collaborator: `YoussefDOT` has write access (invited). `main` is not protected yet; the owner may ask to require pull requests.

## Android

- The APK shell (`android/base.apk`, from 3.3.1) holds the Java wrapper, resources, `mushaf/` and `tafsir/`. Releases only replace `assets/www/Thabat.html`, so the Java code and `versionCode` (32) stay as in 3.3.1. Changing Java or resources needs the Linux toolchain (`dev/android/build.sh`, `mkapk.sh`, `mkaab.sh`, which expect apktool 2.4.1, d8, aapt2 and bundletool under `/tmp/apkt` and `/tmp/aab`).
- Same key and certificate as every earlier release, so the APK installs over the old one without losing data.
- **Play:** bump `versionCode`/`versionName` in `apktool.yml` / the manifest and `APP_VER`; declare `USE_EXACT_ALARM` (adhan alarm app); the privacy policy is `store/privacy.html`. The AAB cannot be built on this machine.

## Web demo (for job applications)

Published at https://claude.ai/artifact/CSQQYksYKEch1bv2puJfzv. To rebuild it, start from the built `Thabat/Thabat.html` and make three changes: (1) insert the pre-script (safe storage shim, first-run defaults, `thabat.demoReset` clears `thabat.v1` and the `thabat` IndexedDB) right after `<meta charset="UTF-8">`; (2) title `<title>ثبات Thabat</title>`; (3) insert `dev/modules/demo.js` after `setInterval(()=>folderBackup(),5*6e4);`. The old demo page (`/home/claude/demo/index.html`) was on a different machine and is not here; rebuild it from these steps. It is outdated (pre-3.4).

## Known pitfalls (all happened before)

- **One settings key, two meanings.** `S.settings.water` was both the water colour and the water-tracker config; the tracker now lives in `S.settings.waterCfg`; `applyTheme` only accepts a string colour.
- **Generic CSS class names clash.** `.hrow` broke the hifz map and `.yh` clashed too. Prefix new classes.
- **Grid overflow on phones.** Use `minmax(0,1fr)` and `min-width:0` on inputs.
- **Text on a coloured fill must stay readable.** Calendar days with ≥45% fill get class `fl`.
- **Lite mode must not kill essential motion.** Mushaf page turns keep a 0.28 s transition.
- **`.btn` beats `[hidden]`.** Buttons with `hidden` still show when a rule sets `display`; add `[hidden]{display:none!important}` for the container you style.
- **Glass `.card` is `position:relative`.** Anything with class `card` that must be `position:fixed` needs `!important`.
- **`position:fixed` inside a view.** `.view` animates with `transform`, which turns fixed children into relative ones; append floating panels to `document.body`.
- **Interface zoom.** The size setting sets `body.style.zoom`; the app height is divided by `--uiz`, and popups divide screen coordinates by `uiZoom()`. Test at 125%.
- **Popups that load content later** must re-fit: `qPopAt` uses a MutationObserver plus ResizeObserver (`ppFit`).
- **Phones and animation.** Never animate registered custom properties on `<html>` for phones (it restyles every element each frame). Light glass moves only `#aurora` blobs with `transform`; card edges get a static sheen.
- **Android bottom bar.** Insets are measured natively; the old automatic +32 px lift is reset to 0 on phones where `ANDNAV` reports them (`andLiftMigrate`). The manual setting stays as a fallback.
- **PC height.** `pcFit()` sets `--pch` to the visible height for Edge app windows.
- **Synced duplicates.** Tasks created automatically on two devices need a fixed id (al-Kahf uses `kahf-<date>`) or they duplicate after sync.
- **Logo.** The «ثبات» wordmark is two layers (text plus a `::after` clipped copy in `--water`). Do not go back to `background-clip:text`.
- **Accuracy over invention.** Only 8 riwayat have verified digital text; the rest come from the owner's own scans. Never fabricate Quran text, sajdah positions or prayer data.

## Open items

- Support e-mail for `SUPPORT_EMAIL` and the contact line in `store/privacy.html`.
- Confirm on his phone: the bottom bar height after the lift reset, light-glass smoothness, the full-screen Quran controls below the camera.
- Maghrebi month names: `gShort`/`gStr` showed «أكتوبر» in tests; check the other months use the Maghrebi list.
- After switching language and back, the ayah-of-the-day label stays in the other language until reload (pre-existing).
- `main` branch protection for collaborators, if the owner wants it.
