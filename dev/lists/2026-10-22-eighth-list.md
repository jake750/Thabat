# Eighth list (2026-10-22, asked right after his seventh-list picks)

Checked against the code: the weekly review, the witr reminder (`dw2.witr*`) and the duha reminder exist; the rawatib already have a Summary line and a prayer-map tab; the week view's prayer dots (`.wkp`) are not clickable; there is no night brightness setting for scanned pages; the Obsidian sync has no conflict copy and no «open in Obsidian».

1. One record for qiyam and witr (a fix): the evening self-accounting writes `d.qiyam={rk,witr}` and the nawafil sheet writes `d.nfl.qiyam/witr` — two places. Make them one, and stop the witr reminder when witr is logged in either (today it only checks `d.qiyam.witr`).
2. The duha reminder does not ring in the app once duha is logged, and offers «صلّيتها» (+2 rak'at in the nawafil).
3. Week view: tap a prayer dot to open that prayer's menu for that day.
4. Week view: the day's nawafil and rawatib rak'at under each day.
5. Calendar day panel: a nawafil and rawatib section, editable for past days (like the Quran section).
6. «افتحها في Obsidian» on a synced note (an `obsidian://open` link).
7. Obsidian conflicts keep both: when both sides changed since the last sync, the vault gets a «(تعارض)» copy instead of the newer one winning silently.
8. Night brightness for scanned mushaf pages and PDF books (a slider).
9. Ctrl+K commands for nawafil: «ضحى 4», «قيام 8», «وتر» log at once.
