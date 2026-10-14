# Build Thabat-Setup.exe (project root) with IExpress, which ships with Windows: install.ps1 (saved with a BOM so
# Windows PowerShell 5.1 reads its Arabic text right) and Thabat.ico are packed; the exe runs install.ps1 hidden.
import os, shutil, subprocess, tempfile, sys
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(D))
OUT = os.path.join(ROOT, 'Thabat-Setup.exe')
def build():
    # a short folder: IExpress also fails on long paths (the session temp folder is long)
    tmp = tempfile.mkdtemp(prefix='thsetup_', dir=os.path.join(os.environ.get('LOCALAPPDATA', os.environ['USERPROFILE']), 'Temp'))
    src = open(os.path.join(D, 'install.ps1'), encoding='utf-8').read()
    open(os.path.join(tmp, 'install.ps1'), 'w', encoding='utf-8-sig', newline='\r\n').write(src)
    shutil.copy(os.path.join(D, 'Thabat.ico'), os.path.join(tmp, 'Thabat.ico'))
    sed = os.path.join(tmp, 'thabat.sed')
    open(sed, 'w', encoding='ascii', newline='\r\n').write(f"""[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=%DisplayLicense%
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=%AdminQuietInstCmd%
UserQuietInstCmd=%UserQuietInstCmd%
SourceFiles=SourceFiles
[Strings]
InstallPrompt=
DisplayLicense=
FinishMessage=
TargetName={tmp}\\Thabat-Setup.exe
FriendlyName=Thabat
AppLaunched=powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -WindowStyle Hidden -File install.ps1
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
FILE0="install.ps1"
FILE1="Thabat.ico"
[SourceFiles]
SourceFiles0={tmp}\\
[SourceFiles0]
%FILE0%=
%FILE1%=
""")
    if os.path.exists(OUT): os.remove(OUT)
    r = subprocess.run([os.path.join(os.environ['WINDIR'], 'System32', 'iexpress.exe'), '/N', '/Q', sed], capture_output=True, text=True)
    import time
    built = os.path.join(tmp, 'Thabat-Setup.exe')   # IExpress fails on a target path with spaces («Thabat Dev»): build in tmp, then copy
    for _ in range(120):
        if os.path.exists(built) and os.path.getsize(built) > 0: break
        time.sleep(0.5)
    time.sleep(1)
    if os.path.exists(built): shutil.copy(built, OUT)
    shutil.rmtree(tmp, ignore_errors=True)
    if not os.path.exists(OUT): sys.exit('FAILED: IExpress did not write Thabat-Setup.exe ' + r.stdout + r.stderr)
    print('Thabat-Setup.exe', os.path.getsize(OUT) // 1024, 'KB')
if __name__ == '__main__': build()
