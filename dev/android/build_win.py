# Build a new Android shell on Windows from dev/android (Java, manifest, res) -> android/base-next.apk
# release.py then swaps Thabat.html into it and signs it, exactly as it does with android/base.apk.
#   python dev/android/build_win.py            build android/base-next.apk
#   python dev/android/build_win.py --use      ...and make it the shell release.py uses (old one kept as android/base-<old version>.apk)
# Tools (installed 2026-10-11): JDK temurin-24, Android SDK build-tools 35.0.1 (d8, zipalign, apksigner),
# platforms/android-36/android.jar, and %LOCALAPPDATA%\Android\Sdk\thabat-tools\apktool_2.10.0.jar.
# The assets (mushaf/, tafsir/, www/) come from the current android/base.apk, so they never need rebuilding.
import os, re, shutil, subprocess, sys, zipfile
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DA = os.path.join(ROOT, 'dev', 'android')
SDK = os.path.join(os.environ['LOCALAPPDATA'], 'Android', 'Sdk')
BT = os.path.join(SDK, 'build-tools', '35.0.1')
ANDROID_JAR = os.path.join(SDK, 'platforms', 'android-36', 'android.jar')
APKTOOL = os.path.join(SDK, 'thabat-tools', 'apktool_2.10.0.jar')
JDK = r'C:\Users\foura\.jdks\temurin-24.0.2\bin'
BASE = os.path.join(ROOT, 'android', 'base.apk')
OUT = os.path.join(ROOT, 'android', 'base-next.apk')
WORK = os.path.join(os.environ.get('TEMP', ROOT), 'thabat-apk-build')

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0:
        print(r.stdout[-3000:], r.stderr[-3000:]); raise SystemExit('failed: ' + ' '.join(map(str, cmd[:3])))
    return r.stdout + r.stderr

def main():
    for f in (ANDROID_JAR, APKTOOL, BASE): assert os.path.exists(f), f
    shutil.rmtree(WORK, ignore_errors=True); os.makedirs(WORK)
    dec, cls, dex = (os.path.join(WORK, n) for n in ('dec', 'cls', 'dex'))
    # 1. the current shell, decoded (classes.dex kept as is; it is replaced below)
    run([os.path.join(JDK, 'java'), '-jar', APKTOOL, 'd', '-s', '-f', '-o', dec, BASE])
    # 2. manifest and resources from dev/android
    shutil.copy(os.path.join(DA, 'AndroidManifest.xml'), os.path.join(dec, 'AndroidManifest.xml'))
    shutil.rmtree(os.path.join(dec, 'res')); shutil.copytree(os.path.join(DA, 'res'), os.path.join(dec, 'res'))
    m = open(os.path.join(DA, 'AndroidManifest.xml'), encoding='utf-8').read()
    vc = re.search(r'android:versionCode="(\d+)"', m).group(1); vn = re.search(r'android:versionName="([^"]+)"', m).group(1)
    y = open(os.path.join(dec, 'apktool.yml'), encoding='utf-8').read()
    y = re.sub(r"versionCode: '?\d+'?", f'versionCode: {vc}', y); y = re.sub(r"versionName: '?[^\n']+'?", f'versionName: {vn}', y)
    open(os.path.join(dec, 'apktool.yml'), 'w', encoding='utf-8').write(y)
    # 3. Java -> classes.dex (compiled against the real android.jar)
    srcs = [os.path.join(dp, f) for dp, _, fs in os.walk(os.path.join(DA, 'src')) for f in fs if f.endswith('.java')]
    os.makedirs(cls); os.makedirs(dex)
    print(run([os.path.join(JDK, 'javac'), '--release', '8', '-nowarn', '-encoding', 'UTF-8', '-cp', ANDROID_JAR, '-d', cls] + srcs).strip() or 'javac ok')
    classes = [os.path.join(dp, f) for dp, _, fs in os.walk(cls) for f in fs if f.endswith('.class')]
    # d8 run with this JDK (d8.bat would pick whatever old Java is first on PATH)
    run([os.path.join(JDK, 'java'), '-cp', os.path.join(BT, 'lib', 'd8.jar'), 'com.android.tools.r8.D8', '--release', '--min-api', '26', '--lib', ANDROID_JAR, '--output', dex] + classes)
    shutil.copy(os.path.join(dex, 'classes.dex'), os.path.join(dec, 'classes.dex'))
    # 4. pack (unsigned; release.py aligns and signs)
    run([os.path.join(JDK, 'java'), '-jar', APKTOOL, 'b', dec, '-o', OUT])
    z = zipfile.ZipFile(OUT)
    names = set(z.namelist())
    assert 'classes.dex' in names and 'AndroidManifest.xml' in names and 'assets/www/Thabat.html' in names
    print(f'built {OUT}  versionCode {vc}  versionName {vn}  {len(names)} files  {os.path.getsize(OUT)//1024} KB')
    if '--use' in sys.argv:
        old = os.path.join(ROOT, 'android', 'base-before-' + vn + '.apk')
        shutil.copy(BASE, old); shutil.copy(OUT, BASE)
        print('android/base.apk replaced; previous shell kept as', os.path.basename(old))

if __name__ == '__main__':
    main()
