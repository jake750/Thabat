# The app source lives in dev/src/ as small parts; joined in the order of dev/src/order.txt they make the single-file app.
#   head.html            everything up to and including <style>
#   css/<name>.css       the styles: base.css, then one part per version comment (/* v3.x … */), then image-viewer.css
#   body.html            </style> … <script> (the page markup)
#   js/<name>.js         the script: core.js, then one part per module marker (/* ============ … ============ */)
#   tail.html            </script> to the end
# split() and join() are exact inverses, so the built Thabat.html is unchanged byte for byte.
# dev/src.html is regenerated from the parts on every save/build (git-ignored) so grep, tlchk.sh and the src_vNNN backups keep working.
import os, re
D = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(D, 'src')
CSS_MARK = re.compile(r'^/\* (-+ )?v\d|^/\* image viewer \*/')
JS_MARK = '/* ============'

def _slug(line, used):
    t = re.sub(r'^/\*[\s=\-]*', '', line)
    t = re.sub(r'[\s=\-]*\*/.*$', '', t)
    t = re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:48].strip('-') or 'part'
    n, k = t, 2
    while n in used: n, k = f'{t}-{k}', k + 1
    used.add(n)
    return n

def _cut(text, starts):
    # cut text at the given line-start offsets
    starts = [0] + [p for p in starts if p > 0] + [len(text)]
    return [text[a:b] for a, b in zip(starts, starts[1:])]

def _line_starts(text, pred):
    out, pos = [], 0
    for line in text.split('\n'):
        if pred(line): out.append(pos)
        pos += len(line) + 1
    return out

def _css_starts(css):
    # version comments that sit outside any {…} block
    out, pos, depth = [], 0, 0
    for line in css.split('\n'):
        if depth == 0 and CSS_MARK.match(line): out.append(pos)
        t = re.sub(r'/\*.*?\*/', '', line)
        depth += t.count('{') - t.count('}')
        pos += len(line) + 1
    return out

def split(s):
    a = s.index('<style>') + len('<style>')
    b = s.index('</style>', a)
    c = s.index('<script>', b) + len('<script>')
    d = s.rindex('</script>')
    parts = [('head.html', s[:a])]
    css, used = s[a:b], set()
    for i, chunk in enumerate(_cut(css, _css_starts(css))):
        first = chunk.lstrip('\n').split('\n', 1)[0]
        name = 'base' if i == 0 else _slug(first, used)
        parts.append((f'css/{name}.css', chunk))
    parts.append(('body.html', s[b:c]))
    js, used = s[c:d], {'core'}
    for i, chunk in enumerate(_cut(js, _line_starts(js, lambda l: l.startswith(JS_MARK)))):
        name = 'core' if i == 0 and not chunk.lstrip('\n').startswith(JS_MARK) else _slug(chunk.lstrip('\n').split('\n', 1)[0], used)
        parts.append((f'js/{name}.js', chunk))
    parts.append(('tail.html', s[d:]))
    assert ''.join(p for _, p in parts) == s
    return parts

def join():
    order = open(os.path.join(SRC, 'order.txt'), encoding='utf-8').read().split()
    return ''.join(open(os.path.join(SRC, n), encoding='utf-8', newline='').read() for n in order)

def write(s):
    """Split s into dev/src/, drop parts that no longer exist, and regenerate dev/src.html."""
    parts = split(s)
    names = [n for n, _ in parts]
    assert len(set(names)) == len(names)
    for n, p in parts:
        f = os.path.join(SRC, n)
        os.makedirs(os.path.dirname(f), exist_ok=True)
        old = open(f, encoding='utf-8', newline='').read() if os.path.exists(f) else None
        if old != p: open(f, 'w', encoding='utf-8', newline='').write(p)
    keep = set(names)
    for sub in ('css', 'js'):
        for f in os.listdir(os.path.join(SRC, sub)):
            if f'{sub}/{f}' not in keep: os.remove(os.path.join(SRC, sub, f))
    open(os.path.join(SRC, 'order.txt'), 'w', encoding='utf-8', newline='').write('\n'.join(names) + '\n')
    assert join() == s
    open(os.path.join(D, 'src.html'), 'w', encoding='utf-8', newline='').write(s)

if __name__ == '__main__':
    # python dev/srcparts.py         -> regenerate dev/src.html from the parts
    # python dev/srcparts.py --init  -> create dev/src/ from the current dev/src.html (one time)
    import sys
    if '--init' in sys.argv:
        write(open(os.path.join(D, 'src.html'), encoding='utf-8', newline='').read())
        print('parts:', len(open(os.path.join(SRC, 'order.txt')).read().split()))
    else:
        open(os.path.join(D, 'src.html'), 'w', encoding='utf-8', newline='').write(join())
        print('src.html regenerated')
