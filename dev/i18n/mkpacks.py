# Thabat languages (3.171): turns dev/i18n/<code>.json into dev/data/Thabat-lang-<code>.js, refreshes the reference
# texts in dev/i18n/source/, and returns the LANGS list that build.py writes into the page.
# Run alone to see each language's state:  python dev/i18n/mkpacks.py
import json, os, re, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
DEV = os.path.dirname(D)
SRC = os.path.join(D, 'source')
DATA = os.path.join(DEV, 'data')

# every language Thabat offers or plans; a language appears in the app once its file has translations
LANGS = [
    ('ar', 'العربية', 'rtl'), ('en', 'English', 'ltr'),
    ('tr', 'Türkçe', 'ltr'), ('id', 'Bahasa Indonesia', 'ltr'), ('ur', 'اردو', 'rtl'),
    ('fr', 'Français', 'ltr'), ('fa', 'فارسی', 'rtl'), ('ms', 'Bahasa Melayu', 'ltr'),
    ('bn', 'বাংলা', 'ltr'), ('de', 'Deutsch', 'ltr'), ('es', 'Español', 'ltr'),
    ('it', 'Italiano', 'ltr'), ('zh', '中文', 'ltr'), ('ja', '日本語', 'ltr'),
]

PH = re.compile(r'\{\d\}')
TAG = re.compile(r'</?[a-zA-Z][^>]*>')


def source():
    """The Arabic and English tables, read from dev/src/js/i18n.js with node (the app's own literal)."""
    js = os.path.join(DEV, 'src', 'js', 'i18n.js')
    code = ("const fs=require('fs');const t=fs.readFileSync(process.argv[1],'utf8');const a=t.indexOf('const I18N='),b=t.indexOf('const LOC=');"
            "const I=eval('('+t.slice(a+11,b).trim().replace(/;\\s*$/,'')+')');process.stdout.write(JSON.stringify({ar:I.ar,en:I.en}))")
    out = subprocess.run(['node', '-e', code, js], capture_output=True, check=True).stdout
    return json.loads(out.decode('utf-8'))


def tags(s):
    return sorted(re.sub(r'\s+', ' ', x) for x in TAG.findall(s))


def check(key, en, tr):
    """why a translation cannot be used, or ''"""
    if not isinstance(tr, str) or not tr.strip():
        return 'empty'
    if sorted(PH.findall(en)) != sorted(PH.findall(tr)):
        return 'placeholders {0}… differ from the English text'
    if tags(en) != tags(tr):
        return 'HTML tags differ from the English text'
    return ''


def build(write=True, verbose=False):
    tb = source()
    en, ar = tb['en'], tb['ar']
    if write:
        os.makedirs(SRC, exist_ok=True)
        for n, d in (('en', en), ('ar', ar)):
            txt = json.dumps(dict(sorted(d.items())), ensure_ascii=False, indent=1)
            p = os.path.join(SRC, n + '.json')
            if not os.path.exists(p) or open(p, encoding='utf-8').read() != txt:
                open(p, 'w', encoding='utf-8', newline='\n').write(txt)
    out = []
    for c, n, d in LANGS:
        if c in ('ar', 'en'):
            out.append({'c': c, 'n': n, 'dir': d, 'pct': 100})
            continue
        f = os.path.join(D, c + '.json')
        pct = 0
        if os.path.exists(f):
            j = json.load(open(f, encoding='utf-8'))
            meta = j.get('_meta', {})
            st, bad = {}, []
            for k, v in (j.get('strings') or {}).items():
                if k not in en:
                    continue
                why = check(k, en[k], v)
                if why:
                    bad.append((k, why))
                    continue
                st[k] = v
            ne = sum(1 for v in en.values() if v)
            pct = int(len(st) * 100 / ne) if ne else 0
            if verbose:
                print(f'{c}: {len(st)}/{len(en)} texts ({pct}%), {len(bad)} refused')
                for k, why in bad[:40]:
                    print('   ', k, '—', why)
            loc = {x: meta[x] for x in ('months', 'days', 'sdays') if isinstance(meta.get(x), list) and len(meta[x]) in (7, 12)}
            pack = {'n': meta.get('name', n), 'dir': meta.get('dir', d), 'loc': loc, 's': st,
                    'x': {k: v for k, v in (j.get('extra') or {}).items() if isinstance(v, str) and v.strip()}}
            if write:
                js = ('/* Thabat language file: ' + c + ' (made from dev/i18n/' + c + '.json by dev/i18n/mkpacks.py; edit the .json) */\n'
                      '(window.THLANG=window.THLANG||{})[' + json.dumps(c) + ']=' + json.dumps(pack, ensure_ascii=False, separators=(',', ':')) + ';\n')
                p = os.path.join(DATA, 'Thabat-lang-' + c + '.js')
                if not os.path.exists(p) or open(p, encoding='utf-8').read() != js:
                    open(p, 'w', encoding='utf-8', newline='\n').write(js)
            n, d = pack['n'], pack['dir']
        out.append({'c': c, 'n': n, 'dir': d, 'pct': pct})
    return out


if __name__ == '__main__':
    r = build(write='--check' not in sys.argv, verbose=True)
    for x in r:
        print(f"{x['c']:3} {x['pct']:3}%  {x['n']}")
