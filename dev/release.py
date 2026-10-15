"""Thabat release packaging (Windows dev machine).

Usage (from the project root):
    set THABAT_KS_PASS=...            (PowerShell: $env:THABAT_KS_PASS='...')
    python dev/release.py             build + check + package + personal copy
    python dev/release.py --no-apk    skip the APK (no signing password needed)

What it does:
  1. dev/build.py  ->  Thabat/Thabat.html, copied to ./Thabat.html
  2. node --check on the largest <script>
  3. Thabat-Windows.zip and Thabat-Mac.zip: the previous release zips with
     Thabat/Thabat.html swapped in (mushaf/, tafsir/, launchers are kept);
     the files in dev/mac/ (launchers, icon, read-me) replace or join the Mac zip,
     and the files in dev/win/ (helper, library server, Thabat.bat) the Windows zip
     and dev/vendor/pdfjs/ (pdf.js, loaded only when a book opens) goes to Thabat/pdfjs/ in both
  4. Thabat.apk: android/base.apk with assets/www/Thabat.html swapped in (and assets/www/pdfjs/ added),
     zipaligned and signed with android/thabat-signing.keystore (alias thabat)
  5. copies the build into the owner's personal copy, after backing it up
     as Thabat.html.bak (nothing else in that folder is touched)
  6. prints APP_VER found inside every output

It never commits, pushes or publishes; see CLAUDE.md for those steps.
"""
import os, re, shutil, subprocess, sys, tempfile, time, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'Thabat', 'Thabat.html')
PERSONAL = os.path.expanduser(r'~\Documents\Thabat\Thabat.html')
# the copy Thabat-Setup.exe installs (his desktop shortcut opens it since he tried the setup on 2026-10-14)
INSTALLED = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs', 'Thabat', 'Thabat.html')
SDK_BT = os.path.expanduser(r'~\AppData\Local\Android\Sdk\build-tools\35.0.1')
JDK = os.path.expanduser(r'~\.jdks\temurin-24.0.2\bin')
KEYSTORE = os.path.join(ROOT, 'android', 'thabat-signing.keystore')
BASE_APK = os.path.join(ROOT, 'android', 'base.apk')
VENDOR = os.path.join(ROOT, 'dev', 'vendor', 'pdfjs')
DATA = os.path.join(ROOT, 'dev', 'data')   # Thabat's own data files loaded on demand (3.37: Thabat-Roots.js)


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(f'FAILED: {" ".join(cmd)}\n{r.stdout}\n{r.stderr}')
    return r.stdout


def swap(src, out, name, html, drop_meta=False):
    n = 0
    with zipfile.ZipFile(src) as zi, zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zo:
        for it in zi.infolist():
            if drop_meta and it.filename.startswith('META-INF/'):
                continue
            d = zi.read(it)
            if it.filename == name:
                d, n = html, n + 1
            zo.writestr(it, d, compress_type=it.compress_type)
    assert n == 1, f'{name} not found in {src}'


def put_files(path, folder, prefix):
    """Replace or add every file of folder in the zip under prefix; .command files stay executable."""
    new = {prefix + n: os.path.join(folder, n) for n in os.listdir(folder) if os.path.isfile(os.path.join(folder, n))}
    tmp = path + '.tmp'
    with zipfile.ZipFile(path) as zi, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zo:
        for it in zi.infolist():
            if it.filename not in new:
                zo.writestr(it, zi.read(it), compress_type=it.compress_type)
        for name, src in sorted(new.items()):
            it = zipfile.ZipInfo(name, date_time=time.localtime(os.path.getmtime(src))[:6])
            it.create_system = 3
            it.external_attr = (0o100755 if name.endswith('.command') else 0o100644) << 16
            it.compress_type = zipfile.ZIP_DEFLATED
            zo.writestr(it, open(src, 'rb').read())
    os.replace(tmp, path)


def put_tree(path, folder, prefix):
    """Replace or add every file under folder (recursively) in the zip under prefix."""
    new = {}
    for dp, _, fs in os.walk(folder):
        for n in fs:
            src = os.path.join(dp, n)
            new[prefix + os.path.relpath(src, folder).replace(os.sep, '/')] = src
    tmp = path + '.tmp'
    with zipfile.ZipFile(path) as zi, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zo:
        for it in zi.infolist():
            if it.filename not in new:
                zo.writestr(it, zi.read(it), compress_type=it.compress_type)
        for name, src in sorted(new.items()):
            it = zipfile.ZipInfo(name, date_time=time.localtime(os.path.getmtime(src))[:6])
            it.create_system = 3
            it.external_attr = 0o100644 << 16
            it.compress_type = zipfile.ZIP_DEFLATED
            zo.writestr(it, open(src, 'rb').read())
    os.replace(tmp, path)


def ver_in(data):
    m = re.search(rb"APP_VER='([^']*)'", data)
    return m.group(1).decode() if m else '?'


def main():
    no_apk = '--no-apk' in sys.argv
    os.chdir(ROOT)
    print(run([sys.executable, 'dev/build.py']).strip())
    shutil.copy(HTML, 'Thabat.html')
    s = open(HTML, encoding='utf-8').read()
    tmp = tempfile.mkdtemp()
    js = os.path.join(tmp, 'main.js')
    open(js, 'w', encoding='utf-8').write(max(re.findall(r'<script[^>]*>(.*?)</script>', s, re.S), key=len))
    run(['node', '--check', js])
    print('syntax OK')
    # a second «function foo» silently replaces the first (hNum, 3.28.0): refuse to package one
    import collections
    dup = {k: v for k, v in collections.Counter(re.findall(r'(?:^|[;{}\n])\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(', s)).items() if v > 1}
    if dup:
        sys.exit('FAILED: functions declared more than once: ' + ', '.join(sorted(dup)))
    print('no duplicate functions')
    # a text key defined twice keeps the OLDER text (later in the table): the newer feature then shows someone else's words (3.40.1 fixed 13)
    for lang, a, b in (('ar', "app:'ثبات'", "app:'Thabat'"), ('en', "app:'Thabat'", None)):
        i = s.find(a); j = s.find(b) if b else s.find('\n}};', i)   # the English table ends the I18N object
        tbl = s[i:j] if j > i else s[i:i + 600000]
        vals = collections.defaultdict(set)
        for k, v in re.findall(r"'([A-Za-z0-9_.]+)':(\"[^\"]*\"|'[^']*')", tbl): vals[k].add(v[1:-1])
        clash = sorted(k for k, v in vals.items() if len(v) > 1)
        if clash: print(f'WARNING {lang}: text keys with two different texts (the older one wins):', ', '.join(clash))
    # stacked wrappers make every change riskier (3.35.0 moved the plain before/after ones into hookFn lists); keep the count visible
    wr = len(re.findall(r'\{\s*(?:const|let)\s+\w+\s*=\s*(\w+)\s*;\s*\1\s*=\s*(?:async\s+)?function', s))
    print(f'wrappers: {wr} stacked, {s.count("{hookFn('")} hooks')
    html = open(HTML, 'rb').read()
    for z in ('Thabat-Windows.zip', 'Thabat-Mac.zip'):
        prev = os.path.join(tmp, z)
        shutil.copy(z, prev)
        swap(prev, z, 'Thabat/Thabat.html', html)
    put_files('Thabat-Mac.zip', os.path.join(ROOT, 'dev', 'mac'), 'Thabat/')
    put_files('Thabat-Windows.zip', os.path.join(ROOT, 'dev', 'win'), 'Thabat/')
    # third-party files loaded on demand (pdf.js for the book reader) sit beside Thabat.html
    for z in ('Thabat-Windows.zip', 'Thabat-Mac.zip'):
        put_tree(z, VENDOR, 'Thabat/pdfjs/')
        put_files(z, DATA, 'Thabat/')
    if not no_apk:
        if not os.environ.get('THABAT_KS_PASS'):
            sys.exit('Set THABAT_KS_PASS (ask the owner) or pass --no-apk')
        u, a = os.path.join(tmp, 'u.apk'), os.path.join(tmp, 'a.apk')
        swap(BASE_APK, u, 'assets/www/Thabat.html', html, drop_meta=True)
        put_tree(u, VENDOR, 'assets/www/pdfjs/')
        put_files(u, DATA, 'assets/www/')
        run([os.path.join(SDK_BT, 'zipalign.exe'), '-f', '-p', '4', u, a])
        env = dict(os.environ, PATH=JDK + os.pathsep + os.environ['PATH'])
        signer = os.path.join(SDK_BT, 'lib', 'apksigner.jar')
        run(['java', '-jar', signer, 'sign', '--ks', KEYSTORE, '--ks-pass', 'env:THABAT_KS_PASS', '--key-pass', 'env:THABAT_KS_PASS',
             '--ks-key-alias', 'thabat', '--min-sdk-version', '26', '--v4-signing-enabled', 'false', '--out', 'Thabat.apk', a], env=env)
        cert = run(['java', '-jar', signer, 'verify', '--print-certs', 'Thabat.apk'], env=env)
        assert 'cf19fc4a36f04e0ec75c825cce5f99491390c7065c48070ae7156302d04722f0' in cert, 'APK signed with an unexpected key'
        print('APK signed with the Thabat key')
        # a test APK from a new Java shell (dev/android/build_win.py -> android/base-next.apk), for the owner to try before --use
        nxt = os.path.join(ROOT, 'android', 'base-next.apk')
        if '--test-shell' in sys.argv and os.path.exists(nxt):
            u2, a2 = os.path.join(tmp, 'u2.apk'), os.path.join(tmp, 'a2.apk')
            swap(nxt, u2, 'assets/www/Thabat.html', html, drop_meta=True)
            put_tree(u2, VENDOR, 'assets/www/pdfjs/')
            put_files(u2, DATA, 'assets/www/')
            run([os.path.join(SDK_BT, 'zipalign.exe'), '-f', '-p', '4', u2, a2])
            run(['java', '-jar', signer, 'sign', '--ks', KEYSTORE, '--ks-pass', 'env:THABAT_KS_PASS', '--key-pass', 'env:THABAT_KS_PASS',
                 '--ks-key-alias', 'thabat', '--min-sdk-version', '26', '--v4-signing-enabled', 'false', '--out', 'Thabat-Android-Test.apk', a2], env=env)
            assert 'cf19fc4a36f04e0ec75c825cce5f99491390c7065c48070ae7156302d04722f0' in run(['java', '-jar', signer, 'verify', '--print-certs', 'Thabat-Android-Test.apk'], env=env)
            print('test APK (new shell) signed: Thabat-Android-Test.apk')
    # the one-file Windows setup (dev/setup: IExpress, downloads the latest Thabat-Windows.zip when run)
    sys.path.insert(0, os.path.join(ROOT, 'dev', 'setup'))
    import build_setup
    build_setup.build()
    if os.path.exists(PERSONAL):
        shutil.copy(PERSONAL, PERSONAL + '.bak')
        shutil.copy(HTML, PERSONAL)
        # the pdf.js folder beside it (program files only; the owner's data is never touched)
        shutil.copytree(VENDOR, os.path.join(os.path.dirname(PERSONAL), 'pdfjs'), dirs_exist_ok=True)
        for n in os.listdir(DATA):
            shutil.copy(os.path.join(DATA, n), os.path.join(os.path.dirname(PERSONAL), n))
        print('personal copy updated (old one in Thabat.html.bak, pdfjs/ refreshed)')
    if os.path.exists(INSTALLED):
        # program files only, like the in-app update: the page, its data files and pdf.js
        shutil.copy(INSTALLED, INSTALLED + '.bak')
        shutil.copy(HTML, INSTALLED)
        shutil.copytree(VENDOR, os.path.join(os.path.dirname(INSTALLED), 'pdfjs'), dirs_exist_ok=True)
        for n in os.listdir(DATA):
            shutil.copy(os.path.join(DATA, n), os.path.join(os.path.dirname(INSTALLED), n))
        print('installed copy updated (%LOCALAPPDATA%\\Programs\\Thabat; old page in Thabat.html.bak)')
    print('versions:')
    print('  Thabat.html        ', ver_in(html))
    for z in ('Thabat-Windows.zip', 'Thabat-Mac.zip'):
        print(f'  {z:<19}', ver_in(zipfile.ZipFile(z).read('Thabat/Thabat.html')))
    if not no_apk:
        print('  Thabat.apk         ', ver_in(zipfile.ZipFile('Thabat.apk').read('assets/www/Thabat.html')))
    if os.path.exists(PERSONAL):
        print('  personal copy      ', ver_in(open(PERSONAL, 'rb').read()))
    if os.path.exists(INSTALLED):
        print('  installed copy     ', ver_in(open(INSTALLED, 'rb').read()))
    shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
