# Thabat (ثبات): guide for Claude

Prayer-centred productivity app by Fourat Bouchaa, credited **jake750_**. One HTML file (no framework, works from `file://`) + Android WebView shell + Windows helper.
- Version: **3.174.1** (`APP_VER`). Android shell: `android/base.apk` = versionCode 46, bridge 14.
- History, design notes per release, finished lists and **rejected suggestions** are in `CLAUDE_ARCHIVE.md` — grep it, never load it whole.

## Active
- Today chips, option A (time-aware strip + «المزيد N»): in the web demo only (`dev/modules/smartchips.js`); he wants it in the app later, ask before moving it.
- Languages: Turkish shipped (3.171). The rest wait until he asks, then one release each: id, ur, fr, fa, ms, bn, de, es, it, zh, ja (ur, fa are RTL).
- Waiting on him: font choice (Plex / Noto Kufi / Readex Pro / Tajawal / Almarai); logo idea (then items 181 icon, 183 About page); takbir wording; Quran content sources (asbab an-nuzul, mutashabihat, qira'at); Google Cloud OAuth client for two-way Google Calendar; support e-mail (`SUPPORT_EMAIL`, `store/privacy.html`).
- Note templates stay off until he reviews alternatives one by one.
- Untested on his devices: most of 3.125+; all Mac parts (never run on a real Mac).

## Working with the owner
- Reply in فصحى or English, never Franco-Arabic. Dates: Hijri first, Gregorian under it, Maghrebi month names.
- Ship Android, Windows, macOS. Never iOS.
- Never suggest audio features. No emoji in the app: icons only (`UIC_E`/`UIC_P`).
- Bugs come as screenshots: phone ≈411×860, PC 1920×1040 @125 %. Reproduce at that size first.
- «اقتراحات» → 2–3 options as a visual mockup with a recommendation; build his pick. Ask before big redesigns.
- Suggestion lists: numbered checkboxes in the visualize widget. Check the code and the rejected list in the archive first.
- Finish end to end without asking (build, release, server restarts); ask only for real design choices.
- Keystore password: only in `THABAT_KS_PASS` on the command line. Never in a file, commit or memory.
- Never remove the «created by jake750_» credit, the logo or `LICENSE.txt`.
- His copy `C:\Users\foura\Documents\Thabat\`: release.py replaces only `Thabat.html`. Helper/library scripts are copied there and to `%LOCALAPPDATA%\Programs\Thabat` (the running one) with `.bak`, then restarted.
- Editing this file: add or change single lines with Edit; never rewrite it whole. Move finished detail to `CLAUDE_ARCHIVE.md`. Keep it between 50 and 80 lines, always: anything beyond goes to the archive.

## Machine
- Repo: `C:\Users\foura\Documents\Thabat Dev`, remote github.com/jake750/Thabat (public, `main`). Owner pushes directly; collaborators need PRs.
- `python` 3.14, `node`. gh: `export PATH="/c/Program Files/GitHub CLI:$PATH"`.
- Android SDK `%LOCALAPPDATA%\Android\Sdk` (build-tools 35.0.1, apktool, bundletool); JDK `C:\Users\foura\.jdks\temurin-24.0.2` by full path (Java 8 is first on PATH).
- His PC has no Edge: the app runs in Chrome app mode.

## Code layout
- Source of truth: `dev/src/` (parts joined by `order.txt`). `dev/src.html` is generated; never edit it or `Thabat/Thabat.html`.
- `dev/build.py` builds; `dev/release.py` builds, checks, packages zips + APK + setup exe, updates his copies.
- `dev/modules/` = merged modules (latest g211). `dev/win/` helper/library scripts; `dev/mac/`; `dev/android/` (shell sources, `build_win.py`); `dev/i18n/` language packs; `dev/data/` side files.
- State: global `S` in IndexedDB `thabat`/`kv` (+ quick-start copy in localStorage). Days via `day(key)`.
- Strings: `t(key)`; every visible string goes through it.
- PC servers: helper 47813, library 47815. Every route needs the key check and refuses web origins.

## How to change code
- Patch with `lib.P` (`rep`, `css`, `js`, `i18n`, `save`), or edit a part file for small changes.
- Before adding: `bash dev/tlchk.sh dev/modules/x.js dev/src.html`; grep every new id, class, i18n key and table key (collisions happened many times).
- Extend functions with `hookFn(name, get, set, 'pre'|'post', fn)`; plain wrappers only when changing args/return. Declare extendable things with `function`, not `const`.
- `P.i18n` never replaces: change strings with `p.rep`.
- Bump `APP_VER` and `CHANGES` (new `chg.NN` per feature release) in the same patch.

## Test
- `python dev/build.py`, then `preview_start` name `thabat`, open `http://localhost:8765/Thabat.html?v=<new>`.
- Close overlays first; test 411×860 and 1920×1040 @125 %, Arabic/English, dark/light.
- Hidden pane: no rAF, animations stuck (`document.getAnimations().forEach(a=>a.finish())`), stub `prompt`.
- Mock library/helper URLs: tests must never touch his real servers. Reset viewport to desktop after.

## Release
1. `git fetch`; `origin/main` must be an ancestor of HEAD. Never hide push errors.
2. `THABAT_KS_PASS=… python dev/release.py`; read its WARNING lines. A fresh worktree first needs the last release's zips (`gh release download`) and `android/base.apk` + keystore copied from the main checkout.
3. Update the version line here (one Edit) and add the release's notes to `CLAUDE_ARCHIVE.md`.
4. Commit (Co-Authored-By line), push, `gh release create vX.Y.Z Thabat.apk Thabat-Windows.zip Thabat-Mac.zip Thabat-Setup.exe --target main`.
5. Send him the three files from the checkout where release.py ran.

## Pitfalls (short)
- Interface zoom: divide screen rects by `uiZoom()`, heights by `--uiz`.
- `position:fixed` inside `.view` breaks (transform): append to `body`. Glass `.card` needs `!important` for fixed.
- Grids holding user text: `minmax(0,1fr)` + `min-width:0`.
- Motion (3.173, g210): use `var(--apm-smooth|snappy|out|sheet)`, transform/opacity only, no bounce; never animate opacity/filter on `.view` or any ancestor of glass cards (breaks their blur, flicker); `apmRetime` retimes older rules at idle; tab rows animate generically (`apmTabGo`).
- PowerShell: variable names ignore case; commas inside method calls split arguments.
- Never fabricate Quran text or religious data; use only verified sources he approves.
