# Thabat (ثبات) — uninstaller. Created by jake750_.
# Started from Windows «Apps» (the entry Thabat-Setup writes). It removes ONLY the program files that the setup copied
# (listed in install-manifest.txt), the Desktop / Start menu / Startup shortcuts that point into this folder, and the «Apps»
# entry. It never deletes your data: your days, tasks and notes live in the browser; backups, «الأيام», «نسخ أسبوعية»,
# thabat-backup.json and %LOCALAPPDATA%\Thabat (helper key, library settings, Whisper models) are left where they are.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
$DIR = $PSScriptRoot
$TESTDIR = $env:THABAT_SETUP_TEST   # test mode: shortcuts and the «Apps» entry live in the test folder / a test key
$RK = $(if ($TESTDIR) { 'HKCU:\Software\ThabatTest\Uninstall\Thabat' } else { 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Thabat' })
function ThDir($k) { if ($TESTDIR) { Join-Path $TESTDIR $k } else { [Environment]::GetFolderPath($k) } }

if ($env:THABAT_SETUP_AUTO -ne '1') {
  $msg = "إزالة ثبات من هذا الحاسوب؟`n`nتُحذف ملفات البرنامج والاختصارات فقط.`nبياناتك (في المتصفح) ونسخك الاحتياطية وإعدادات المساعد تبقى كما هي."
  $r = [Windows.Forms.MessageBox]::Show($msg, 'ثبات · Thabat', 'YesNo', 'Question', 'Button2', [Windows.Forms.MessageBoxOptions]::RightAlign -bor [Windows.Forms.MessageBoxOptions]::RtlReading)
  if ($r -ne 'Yes') { exit }
}

# stop the helper, the library server and the transcriber started from this folder
try {
  Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($DIR) -and $_.ProcessId -ne $PID } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
} catch {}
Start-Sleep -Milliseconds 600

# shortcuts that point into this folder
$sh = New-Object -ComObject WScript.Shell
foreach ($p in @((Join-Path (ThDir 'Desktop') 'Thabat.lnk'), (Join-Path (ThDir 'Programs') 'Thabat.lnk'), (Join-Path (ThDir 'Startup') 'Thabat Helper.lnk'))) {
  try { if (Test-Path -LiteralPath $p) { $l = $sh.CreateShortcut($p); if (($l.TargetPath + ' ' + $l.Arguments + ' ' + $l.WorkingDirectory).Contains($DIR)) { Remove-Item -LiteralPath $p -Force } } } catch {}
}

# program files: what the setup copied (install-manifest.txt), plus their .bak copies from updates
$man = Join-Path $DIR 'install-manifest.txt'
$names = @()
if (Test-Path -LiteralPath $man) { $names = Get-Content -LiteralPath $man -Encoding UTF8 | Where-Object { $_ -and $_ -notmatch '[\\/:]|^\.\.' } }
else { $names = @('Thabat.html', 'Thabat-Roots.js', 'Thabat-Helper.ps1', 'Thabat-Library.ps1', 'Thabat-Transcribe.ps1', 'Thabat.bat', 'Thabat.vbs', 'Thabat.ico', 'LICENSE.txt', 'Install-Thabat.bat', 'Create-Shortcut.bat', 'Download-Mushaf-Images.bat', 'pdfjs') }
$names += @('thabat-key.js', 'install-manifest.txt')
foreach ($n in $names) {
  foreach ($q in @((Join-Path $DIR $n), (Join-Path $DIR ($n + '.bak')))) {
    try { if (Test-Path -LiteralPath $q) { Remove-Item -LiteralPath $q -Recurse -Force } } catch {}
  }
}
try { Remove-Item -LiteralPath $RK -Recurse -Force -ErrorAction SilentlyContinue } catch {}

$left = @(Get-ChildItem -LiteralPath $DIR -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne 'Uninstall-Thabat.ps1' })
$self = Join-Path $DIR 'Uninstall-Thabat.ps1'
if ($left.Count -eq 0) {
  # remove this script and the empty folder once this process has ended
  $cmd = "Start-Sleep -Seconds 2; Remove-Item -LiteralPath '" + ($self -replace "'", "''") + "' -Force -ErrorAction SilentlyContinue; Remove-Item -LiteralPath '" + ($DIR -replace "'", "''") + "' -Force -ErrorAction SilentlyContinue"
  Start-Process powershell.exe -WindowStyle Hidden -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -EncodedCommand ' + [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($cmd)))
  $done = 'أُزيل ثبات. بياناتك في المتصفح لم تُمسّ؛ إن ثبّته من جديد ستجدها كما هي.'
} else {
  Remove-Item -LiteralPath $self -Force -ErrorAction SilentlyContinue
  $done = "أُزيل ثبات. بقي في المجلد ما ليس من ملفات البرنامج (نسخك الاحتياطية وما شابه)، فلم يُحذف:`n" + $DIR
}
if ($env:THABAT_SETUP_AUTO -eq '1') { Set-Content -LiteralPath (Join-Path $TESTDIR 'uninstall.txt') -Value ('ok ' + $left.Count) }
else { [void][Windows.Forms.MessageBox]::Show($done, 'ثبات · Thabat', 'OK', 'Information', 'Button1', [Windows.Forms.MessageBoxOptions]::RightAlign -bor [Windows.Forms.MessageBoxOptions]::RtlReading) }
