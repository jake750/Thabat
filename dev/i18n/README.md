# Translating Thabat · ترجمة ثبات

Thabat is written in Arabic and English. Every other language is one file in this folder, `<code>.json`
(for example `tr.json` for Turkish). The app loads a language only when someone chooses it.

يُكتب ثبات بالعربية والإنجليزية، وكل لغة أخرى ملفّ واحد في هذا المجلد باسم `<الرمز>.json`
(مثل `tr.json` للتركية). لا يحمّل التطبيق اللغة إلا حين يختارها المستخدم.

## Languages · اللغات

| Code | Language | Direction |
|---|---|---|
| `tr` | Türkçe | ltr |
| `id` | Bahasa Indonesia | ltr |
| `ur` | اردو | rtl |
| `fr` | Français | ltr |
| `fa` | فارسی | rtl |
| `ms` | Bahasa Melayu | ltr |
| `bn` | বাংলা | ltr |
| `de` | Deutsch | ltr |
| `es` | Español | ltr |
| `it` | Italiano | ltr |
| `zh` | 中文 | ltr |
| `ja` | 日本語 | ltr |

The first drafts are machine translations. Corrections by native speakers are very welcome.

المسوّدات الأولى ترجمة آلية، وتصحيحات أهل اللغة مرحَّب بها كثيرًا.

## The file · بنية الملف

```json
{
 "_meta": {
  "name": "Türkçe",
  "dir": "ltr",
  "months": ["Ocak", "…12 names"],
  "days": ["Pazar", "…7 names, Sunday first"],
  "sdays": ["Paz", "…7 short names, Sunday first"],
  "translators": ["Your name"]
 },
 "strings": { "key": "translated text" },
 "extra":   { "English text": "translated text" }
}
```

- `strings`: one entry per key. The reference texts are in `source/en.json` (English) and `source/ar.json` (Arabic), with the same keys.
- `extra`: a few names that are not in the table (prayer-time methods, riwayat, colours, cities). The key is the English text, exactly as written.
- A key that is missing or empty falls back to English.

- `strings`: مدخل لكل مفتاح. النصوص المرجعية في `source/en.json` و`source/ar.json` بالمفاتيح نفسها.
- `extra`: أسماء قليلة خارج الجدول (طرق الحساب، الروايات، الألوان، المدن)، مفتاحها النصّ الإنجليزي كما هو.
- كل مفتاح ناقص أو فارغ يظهر بالإنجليزية.

## Rules · القواعد

1. Keep `{0}`, `{1}` … exactly: the same numbers, as many times as in the English text. Their order may change.
2. Keep HTML tags (`<b>`, `<br>`, `<a …>`) exactly as they are.
3. Keep emoji and symbols (✓ ✕ ★ ← →), and keep the line breaks of texts that have them.
4. Keep the names of Thabat, the prayers and the Quran terms where your language normally keeps them (Fajr, wird, hifz…) or use the usual word in your language.
5. Short labels on buttons should stay short.

`python dev/i18n/mkpacks.py` checks the file, prints how much is translated, and lists any text it refused
(a placeholder or a tag that differs from the English). Refused texts fall back to English.

١. أبقِ `{0}` و`{1}`… كما هي بعددها. يجوز تغيير ترتيبها.
٢. أبقِ وسوم HTML كما هي.
٣. أبقِ الرموز التعبيرية والعلامات وأسطر النصوص متعدّدة الأسطر.
٤. أسماء الصلوات ومصطلحات القرآن: كما تُكتب عادةً في لغتك.
٥. اجعل عناوين الأزرار قصيرة.

## Sending a translation · إرسال ترجمة

Open a pull request that changes only `dev/i18n/<code>.json`, or open an issue with the file attached.
To start a new language, copy `source/en.json` into `strings` of a new file and translate the values.
The app's own `dev/data/Thabat-lang-<code>.js` is made from the `.json` by the build: do not edit it.

افتح طلب دمج يغيّر `dev/i18n/<الرمز>.json` وحده، أو افتح بلاغًا وأرفق الملف.
لبدء لغة جديدة انسخ `source/en.json` إلى `strings` في ملف جديد وترجم القيم.
الملف `dev/data/Thabat-lang-<الرمز>.js` يُصنع من الـ`.json` عند البناء: لا تعدّله.

created by jake750_
