# Thabat (ثبات): project guide for Claude

Thabat is a prayer-centred productivity app by Fourat Bouchaa (فرات بوشاعة), credited as **jake750_**.
It plans the day around the five prayers: prayer times and adhan, a Quran reader, a work timer, tasks, calendar, health and notes.
Current version: **3.8.0** (`APP_VER` in `dev/src.html`; the Android versionCode is still 32 and must be bumped before the next store upload).

## Working with the owner

- Reply in Modern Standard Arabic (فصحى) or English. Never use Franco-Arabic (Arabic in Latin letters).
- Dates: Hijri first, Gregorian below it, with Maghrebi month names (جانفي، فيفري، مارس، أفريل، ماي، جوان، جويلية، أوت، سبتمبر، أكتوبر، نوفمبر، ديسمبر).
- Ship builds for **Android, Windows and macOS**. Do not build anything for iOS.
- He reports bugs with phone or PC screenshots. Reproduce each one at the matching size before fixing it.
- After every change, rebuild and send him the updated files: `Thabat.apk`, `Thabat/Thabat.html`, plus `Thabat-Windows.zip`, `Thabat-Mac.zip` and `Thabat-Play.aab` when relevant.
- Also copy the built `Thabat/Thabat.html` into his personal copy `C:\Users\foura\Documents\Thabat\Thabat.html` (back up the old one as `Thabat.html.bak` first). Touch nothing else there: it holds his data.
- Never remove or weaken the "created by jake750_" credit, the logo or `LICENSE.txt`.

## Folder layout

| Path | What it is |
|---|---|
| `dev/src.html` | **The source of truth.** Single-file app (HTML + CSS + JS) with placeholders for large inline assets |
| `dev/placeholders.json` | Values of `__MQ_RAW__`, `__ICON192__`, `__ICON32__` that `build.py` fills in |
| `dev/build.py` | Writes `Thabat/Thabat.html` from `src.html` |
| `dev/lib.py` | Patch helper class `P` (see below) |
| `dev/modules/*.js` | Feature modules already merged into `src.html` (c1–c9, d1–d5, e1–e2, f1 + f1.css, f2, f3 + f3.css, g1 + g1.css, g2, g3, g4 + g4.css, g5, g6, g7, g8 + g8.css, demo.js); kept for reference |
| `dev/tlchk.sh` | Checks a new module for top-level name collisions |
| `dev/mac/` | macOS launcher `Thabat.command` and the bilingual read-me that go into `Thabat-Mac.zip` |
| `dev/android/` | Java sources, stubs, `res/`, manifest and build scripts of the Android wrapper |
| `Thabat/` | The Windows app folder: `Thabat.html`, launchers, `Thabat-Helper.ps1`, `mushaf/`, `tafsir/`, `LICENSE.txt` |
| `Thabat.html` | Copy of the built app at the root |
| `Thabat.apk`, `Thabat-Play.aab`, `Thabat-Windows.zip`, `Thabat-Mac.zip` | Release outputs |
| `store/` | `privacy.html` and `store-listing.txt` for Google Play |
| `android/thabat-signing.keystore` | Signing key: **private, never publish or commit it** |

## Architecture (short)

- **One HTML file, no framework, no build step at runtime.** It must work from `file://`.
- **Windows:** Edge app mode (`msedge --app=file:///…`) through `Thabat.bat`/`Thabat.vbs`. `Thabat-Helper.ps1` is a loopback HTTP listener on port 47813 for file saving and downloads. LAN transfer uses port 47814 with a 6-digit code.
- **macOS:** no helper. `Thabat.command` opens the HTML in Chrome/Edge/Brave app mode, or Safari. `MAC` (user-agent check) sets `html.mac`, which hides helper-only features (Mawaqit search, link downloads, LAN transfer, ICS by URL, active-app detection, PC notifications); setup goes straight to calculated times. GitHub sync works (api.github.com allows CORS; Mawaqit does not).
- **Android:** package `tn.thabat.app`, a WebView wrapper loading `assets/www/Thabat.html`. The bridge `window.ThabatAndroid` (`Bridge.java`) provides alarms, the adhan (`AdhanService`), widgets (`Widget`…`Widget5`), biometrics, share and file saving. minSdk 26, targetSdk 36.
- **State:** a global `S` saved to `localStorage['thabat.v1']` and mirrored to IndexedDB `thabat`. Per-day data is under `day(key)`, with keys `YYYY-MM-DD`.
- **i18n:** `t(key,…args)` with one Arabic and one English table. Every visible string goes through it. Default is `ar`/RTL.
- **Theme:** CSS variables (`--bg --panel --line --text --muted --accent --water --gold`) set by `applyTheme()`. `html.lite` turns off heavy effects on weak devices, `html.android` marks the Android wrapper, `html.qfs` marks full-screen Quran.
- **Feature flags:** `THABAT_PLAY` (true only in the Play build), `SUPPORT_EMAIL` (still empty; the privacy page also has a placeholder).

## How to change the code

Patch `dev/src.html` with a small Python script using `lib.P`. Never hand-edit the built `Thabat/Thabat.html`.

```python
import sys; sys.path.insert(0, '/home/claude/app/dev')
from lib import P
p = P()
p.rep(old, new, count=1)          # exact replace; asserts the number of matches
p.css("…")                        # appends CSS before the /* image viewer */ marker
p.js("modules/x.js")              # inserts a JS module before the image-viewer section
p.i18n({'k': 'عربي'}, {'k': 'English'})   # adds strings to both languages
p.save()
```

Before applying a patch:
1. Back up the source: `cp dev/src.html dev/src_vNN.html`.
2. If you add a new module, run `bash dev/tlchk.sh dev/modules/x.js dev/src.html`. A second `function foo()` silently replaces the first one.

To extend an existing function, wrap it instead of rewriting it:

```js
{const _f = renderCal; renderCal = function(){ _f(); /* extra */ }}
```

After applying a patch:
1. Build: `python3 dev/build.py`, then `cp Thabat/Thabat.html Thabat.html`.
2. Syntax check: extract the largest `<script>` and run `node --check` on it.
3. Visual check with Playwright (Chromium is preinstalled). Test at:
   - phone 360×780 and 390×844;
   - PC 1366×700 and a short 1280×520 window;
   - Arabic and English, dark and light.

Then repackage what changed:
- **Windows:** `zip -q Thabat-Windows.zip Thabat/Thabat.html` (and any other changed files).
- **macOS:** `Thabat-Mac.zip` = folder `Thabat/` with `Thabat.html`, `Thabat.command` (Unix mode 755 in the zip, LF endings), the read-me, `LICENSE.txt`, both adhan mp3s, `mushaf/`, `tafsir/`. No `.bat`, `.vbs`, `.ps1` or `.ico`.
- **Never** package from the owner's installed folder `Documents\Thabat`: it holds his personal data (`الأيام`, `نسخ أسبوعية`, `thabat-backup.json`). Use the last release zip as the base.
- **Android APK and Play AAB:** see below.

## Android builds

The toolchain is not stored in this folder: apktool 2.4.1, d8, apksigner, bundletool, aapt2 and the Android stub jars. The scripts in `dev/android/` expect it under `/tmp/apkt` and `/tmp/aab`.

| Script | What it does |
|---|---|
| `build.sh` | Compiles the Java sources to `classes.dex` |
| `mkapk.sh` | Copies the HTML, `mushaf/`, `tafsir/` and `LICENSE.txt` into the assets, then builds, aligns and signs `Thabat.apk` |
| `mkaab.sh` | Sets `THABAT_PLAY=true`, converts the resources to proto, then builds and signs `Thabat-Play.aab` |

- **Bump the version for each store upload:** `versionCode`/`versionName` in `apktool.yml` / the manifest, and `APP_VER` in `src.html`.
- **Signing:** alias `thabat`. The scripts read the password from the `THABAT_KS_PASS` environment variable; it is not written in the repo. Ask the owner.
- **Play policy:** declare `USE_EXACT_ALARM`, since this is an alarm app for the adhan. The privacy policy is `store/privacy.html`.

## Web demo (for job applications)

The demo is published at https://claude.ai/artifact/CSQQYksYKEch1bv2puJfzv (shared with anyone who has the link). To rebuild it, start from the built `Thabat/Thabat.html` and make three changes:

1. **Pre-script:** insert it right after `<meta charset="UTF-8">`. It provides a safe storage shim and first-run defaults, and when `thabat.demoReset` is set it clears `thabat.v1` and deletes the `thabat` IndexedDB.
2. **Title:** change it to `<title>ثبات Thabat</title>`.
3. **Sample data:** insert `dev/modules/demo.js` after `setInterval(()=>folderBackup(),5*6e4);`. It seeds the sample data and adds the ribbon with the language switch and the reset button.

The current demo page lives in `/home/claude/demo/index.html`, next to `mushaf/` and the adhan mp3. Republish it to the same artifact URL.

## Known pitfalls (all happened before)

- **One settings key, two meanings.** `S.settings.water` was both the water colour and the water-tracker config, so `--water` became invalid and the logo vanished on PC. The tracker now lives in `S.settings.waterCfg`; `applyTheme` only accepts a string colour.
- **Generic CSS class names clash.** `.hrow` broke the hifz map and `.yh` clashed too. Prefix new classes.
- **Grid overflow on phones.** Use `minmax(0,1fr)` and `min-width:0` on inputs, otherwise fields spill off narrow screens (this happened in the add-activity form).
- **Text on a coloured fill must stay readable.** Calendar days with ≥45% fill get class `fl`, which switches to dark bold text.
- **Lite mode must not kill essential motion.** Mushaf page turns keep a 0.28 s transition.
- **Android bottom bar.** It must never sit under the system navigation: insets are measured natively (`--andfix`), with a manual "raise the bottom bar" setting (default 32 px) as a fallback. This is still not confirmed on every device.
- **PC height.** `pcFit()` sizes the app to the visible height (`--pch`) for Edge app windows. The interface-size setting zooms `body`, so the app height is divided by `--uiz` (the zoom); popups and menus divide screen coordinates by it too (`uiZoom()`).
- **Logo.** The «ثبات» wordmark is drawn in two layers, text plus a `::after` clipped copy in `--water`. Do not go back to `background-clip:text`.
- **Accuracy over invention.** Only 8 riwayat have verified digital text; the rest of the 20 come from the user's own scans. Never fabricate Quran text, sajdah positions or prayer data.

## Open items

- Support e-mail for `SUPPORT_EMAIL` and the contact line in `store/privacy.html`.
- Confirm on a real phone that the bottom navigation no longer overlaps the system buttons.
- The owner's pick from the 12 visual polish suggestions.
