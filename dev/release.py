"""Thabat release packaging (Windows dev machine).

Usage (from the project root):
    set THABAT_KS_PASS=...            (PowerShell: $env:THABAT_KS_PASS='...')
    python dev/release.py             build + check + package + personal copy
    python dev/release.py --no-apk    skip the APK (no signing password needed)

What it does:
  1. dev/build.py  ->  Thabat/Thabat.html, copied to ./Thabat.html
  2. node --check on the largest <script>
  3. Thabat-Windows.zip and Thabat-Mac.zip: the previous release zips with
     Thabat/Thabat.html swapped in (mushaf/, tafsir/, launchers are kept)
  4. Thabat.apk: android/base.apk with assets/www/Thabat.html swapped in,
     zipaligned and signed with android/thabat-signing.keystore (alias thabat)
  5. copies the build into the owner's personal copy, after backing it up
     as Thabat.html.bak (nothing else in that folder is touched)
  6. prints APP_VER found inside every output

It never commits, pushes or publishes; see CLAUDE.md for those steps.
"""
import os, re, shutil, subprocess, sys, tempfile, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'Thabat', 'Thabat.html')
PERSONAL = os.path.expanduser(r'~\Documents\Thabat\Thabat.html')
SDK_BT = os.path.expanduser(r'~\AppData\Local\Android\Sdk\build-tools\35.0.1')
JDK = os.path.expanduser(r'~\.jdks\temurin-24.0.2\bin')
KEYSTORE = os.path.join(ROOT, 'android', 'thabat-signing.keystore')
BASE_APK = os.path.join(ROOT, 'android', 'base.apk')


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
    open(js, 'w', encoding='utf-8').write(max(re.findall(r'<script>(.*?)</script>', s, re.S), key=len))
    run(['node', '--check', js])
    print('syntax OK')
    html = open(HTML, 'rb').read()
    for z in ('Thabat-Windows.zip', 'Thabat-Mac.zip'):
        prev = os.path.join(tmp, z)
        shutil.copy(z, prev)
        swap(prev, z, 'Thabat/Thabat.html', html)
    if not no_apk:
        if not os.environ.get('THABAT_KS_PASS'):
            sys.exit('Set THABAT_KS_PASS (ask the owner) or pass --no-apk')
        u, a = os.path.join(tmp, 'u.apk'), os.path.join(tmp, 'a.apk')
        swap(BASE_APK, u, 'assets/www/Thabat.html', html, drop_meta=True)
        run([os.path.join(SDK_BT, 'zipalign.exe'), '-f', '-p', '4', u, a])
        env = dict(os.environ, PATH=JDK + os.pathsep + os.environ['PATH'])
        signer = os.path.join(SDK_BT, 'lib', 'apksigner.jar')
        run(['java', '-jar', signer, 'sign', '--ks', KEYSTORE, '--ks-pass', 'env:THABAT_KS_PASS', '--key-pass', 'env:THABAT_KS_PASS',
             '--ks-key-alias', 'thabat', '--min-sdk-version', '26', '--v4-signing-enabled', 'false', '--out', 'Thabat.apk', a], env=env)
        cert = run(['java', '-jar', signer, 'verify', '--print-certs', 'Thabat.apk'], env=env)
        assert 'cf19fc4a36f04e0ec75c825cce5f99491390c7065c48070ae7156302d04722f0' in cert, 'APK signed with an unexpected key'
        print('APK signed with the Thabat key')
    if os.path.exists(PERSONAL):
        shutil.copy(PERSONAL, PERSONAL + '.bak')
        shutil.copy(HTML, PERSONAL)
        print('personal copy updated (old one in Thabat.html.bak)')
    print('versions:')
    print('  Thabat.html        ', ver_in(html))
    for z in ('Thabat-Windows.zip', 'Thabat-Mac.zip'):
        print(f'  {z:<19}', ver_in(zipfile.ZipFile(z).read('Thabat/Thabat.html')))
    if not no_apk:
        print('  Thabat.apk         ', ver_in(zipfile.ZipFile('Thabat.apk').read('assets/www/Thabat.html')))
    if os.path.exists(PERSONAL):
        print('  personal copy      ', ver_in(open(PERSONAL, 'rb').read()))
    shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
