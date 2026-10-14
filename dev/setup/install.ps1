# Thabat (ثبات) — Windows setup. Created by jake750_.
# Packed into Thabat-Setup.exe by dev/setup/build_setup.py (IExpress). It downloads the latest Windows release from the fixed
# address github.com/jake750/Thabat, installs it for this user in %LOCALAPPDATA%\Programs\Thabat (an existing install is updated;
# your data lives in the browser, not in that folder), adds shortcuts to the Desktop and the Start menu, and opens Thabat.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms, System.Drawing, System.IO.Compression.FileSystem
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$URL = 'https://github.com/jake750/Thabat/releases/latest/download/Thabat-Windows.zip'
$DST = Join-Path $env:LOCALAPPDATA 'Programs\Thabat'
# test mode (for building Thabat only): THABAT_SETUP_TEST=<folder> installs and makes the shortcuts inside that folder;
# THABAT_SETUP_AUTO=1 presses the button and closes at the end; THABAT_SETUP_SHOT=<png> saves a picture of the window
$TESTDIR = $env:THABAT_SETUP_TEST   # not $T: PowerShell names ignore case and $t is the title label below
function ThDir($k) { if ($TESTDIR) { $d = Join-Path $TESTDIR $k; New-Item -ItemType Directory -Force -Path $d | Out-Null; $d } else { [Environment]::GetFolderPath($k) } }
if ($TESTDIR) { $DST = Join-Path $TESTDIR 'Programs\Thabat' }
$upd = Test-Path -LiteralPath (Join-Path $DST 'Thabat.html')
$ico = Join-Path $PSScriptRoot 'Thabat.ico'

[Windows.Forms.Application]::EnableVisualStyles()
$f = New-Object Windows.Forms.Form
$f.Text = 'ثبات · Thabat'; $f.RightToLeft = 'Yes'; $f.RightToLeftLayout = $true
$f.ClientSize = New-Object Drawing.Size(480, 270); $f.FormBorderStyle = 'FixedDialog'; $f.MaximizeBox = $false; $f.StartPosition = 'CenterScreen'
$f.BackColor = [Drawing.Color]::FromArgb(22, 23, 27); $f.ForeColor = [Drawing.Color]::FromArgb(236, 228, 207)
$f.Font = New-Object Drawing.Font('Segoe UI', 10)
if (Test-Path -LiteralPath $ico) { $f.Icon = New-Object Drawing.Icon($ico) }

$t = New-Object Windows.Forms.Label; $t.Text = 'ثبات'; $t.Font = New-Object Drawing.Font('Segoe UI', 22, [Drawing.FontStyle]::Bold)
$t.ForeColor = [Drawing.Color]::FromArgb(255, 212, 0); $t.AutoSize = $true; $t.Location = New-Object Drawing.Point(24, 14)
$m = New-Object Windows.Forms.Label; $m.AutoSize = $false; $m.Size = New-Object Drawing.Size(432, 70); $m.Location = New-Object Drawing.Point(24, 70)
$m.Text = $(if ($upd) { 'ثبات مثبّت على هذا الحاسوب. سيُنزَّل آخر إصدار من صفحة ثبات على GitHub (نحو 20 ميغابايت) ويحلّ محلّ ملفات البرنامج. بياناتك لا تتأثّر.' } else { 'سيُنزَّل آخر إصدار من صفحة ثبات على GitHub (نحو 20 ميغابايت) ويُثبَّت لحسابك، مع اختصار على سطح المكتب وفي قائمة ابدأ.' })
$c = New-Object Windows.Forms.CheckBox; $c.Text = 'شغّل المساعد مع ويندوز (إشعارات الصلاة والتطبيق مغلق)'; $c.Checked = $true
$c.AutoSize = $true; $c.Location = New-Object Drawing.Point(24, 148)
$p = New-Object Windows.Forms.ProgressBar; $p.Size = New-Object Drawing.Size(432, 14); $p.Location = New-Object Drawing.Point(24, 182); $p.Visible = $false
$b = New-Object Windows.Forms.Button; $b.Text = $(if ($upd) { 'حدّث' } else { 'ثبّت' }); $b.Size = New-Object Drawing.Size(130, 38); $b.Location = New-Object Drawing.Point(24, 214)
$b.FlatStyle = 'Flat'; $b.BackColor = [Drawing.Color]::FromArgb(255, 212, 0); $b.ForeColor = [Drawing.Color]::Black
$x = New-Object Windows.Forms.Button; $x.Text = 'إلغاء'; $x.Size = New-Object Drawing.Size(100, 38); $x.Location = New-Object Drawing.Point(164, 214); $x.FlatStyle = 'Flat'
$f.Controls.AddRange(@($t, $m, $c, $p, $b, $x))
$x.Add_Click({ $f.Close() })

$zip = Join-Path $env:TEMP ('thabat_setup_' + [Guid]::NewGuid().ToString('N') + '.zip')
$wc = New-Object Net.WebClient; $wc.Headers.Add('User-Agent', 'Thabat-Setup/1.0')
$script:done = $false
function Fail($e) { $m.Text = 'تعذّر الإكمال: ' + $e; $b.Enabled = $true; $b.Text = 'أعد المحاولة'; $x.Enabled = $true; $p.Visible = $false }
function Install {
  $tmp = Join-Path $env:TEMP ('thabat_setup_' + [Guid]::NewGuid().ToString('N'))
  [IO.Compression.ZipFile]::ExtractToDirectory($zip, $tmp)
  $src = Join-Path $tmp 'Thabat'; if (-not (Test-Path -LiteralPath (Join-Path $src 'Thabat.html'))) { throw 'Thabat.html missing in the download' }
  New-Item -ItemType Directory -Force -Path $DST | Out-Null
  $top = @(Get-ChildItem -LiteralPath $src -Force)
  $top | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $DST -Recurse -Force }
  # 3.47: what was installed (the uninstaller removes only these) and the entry in Windows «Apps» (current user, no admin)
  Set-Content -LiteralPath (Join-Path $DST 'install-manifest.txt') -Value ($top | ForEach-Object { $_.Name }) -Encoding UTF8
  $ver = ''; $tx = [IO.File]::ReadAllText((Join-Path $DST 'Thabat.html')); if ($tx -match "APP_VER='([0-9.]+)'") { $ver = $matches[1] }
  $rk = $(if ($TESTDIR) { 'HKCU:\Software\ThabatTest\Uninstall\Thabat' } else { 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Thabat' })
  New-Item -Path $rk -Force | Out-Null
  $un = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $DST 'Uninstall-Thabat.ps1') + '"'
  $kb = [int]((Get-ChildItem -LiteralPath $DST -Recurse -Force -File | Measure-Object -Property Length -Sum).Sum / 1KB)
  foreach ($kv in @(@('DisplayName', 'ثبات · Thabat'), @('DisplayVersion', $ver), @('Publisher', 'jake750_'), @('DisplayIcon', (Join-Path $DST 'Thabat.ico')), @('InstallLocation', $DST), @('UninstallString', $un), @('QuietUninstallString', $un), @('URLInfoAbout', 'https://github.com/jake750/Thabat'))) { New-ItemProperty -Path $rk -Name $kv[0] -Value $kv[1] -PropertyType String -Force | Out-Null }
  foreach ($kv in @(@('NoModify', 1), @('NoRepair', 1), @('EstimatedSize', $kb))) { New-ItemProperty -Path $rk -Name $kv[0] -Value $kv[1] -PropertyType DWord -Force | Out-Null }
  Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -LiteralPath $zip -Force -ErrorAction SilentlyContinue
  $w = New-Object -ComObject WScript.Shell; $q = [char]34
  foreach ($dir in @((ThDir 'Desktop'), (ThDir 'Programs'))) {
    $s = $w.CreateShortcut((Join-Path $dir 'Thabat.lnk')); $s.TargetPath = (Join-Path $env:WINDIR 'System32\wscript.exe')
    $s.Arguments = $q + (Join-Path $DST 'Thabat.vbs') + $q; $s.IconLocation = (Join-Path $DST 'Thabat.ico'); $s.WorkingDirectory = $DST; $s.Description = 'Thabat'; $s.Save() }
  $sl = Join-Path (ThDir 'Startup') 'Thabat Helper.lnk'
  if ($c.Checked) { $s = $w.CreateShortcut($sl); $s.TargetPath = 'powershell.exe'; $s.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ' + $q + (Join-Path $DST 'Thabat-Helper.ps1') + $q; $s.WindowStyle = 7; $s.Save() }
}
$wc.Add_DownloadProgressChanged({ param($s, $e) $p.Value = [Math]::Min(100, $e.ProgressPercentage); $m.Text = 'جارٍ التنزيل… ' + $e.ProgressPercentage + '%' })
$wc.Add_DownloadFileCompleted({ param($s, $e)
  if ($e.Error) { Fail $e.Error.Message; return }
  try { $m.Text = 'جارٍ التثبيت…'; $f.Refresh(); Install
    $script:done = $true; $p.Value = 100; $m.Text = 'تمّ ✓ ثبات في ' + $DST + ' ومعه اختصار على سطح المكتب وفي قائمة ابدأ.'
    $b.Text = 'افتح ثبات'; $b.Enabled = $true; $x.Text = 'إغلاق'; $x.Enabled = $true
    if ($env:THABAT_SETUP_AUTO -eq '1') { Set-Content -LiteralPath (Join-Path $TESTDIR 'result.txt') -Value ('ok ' + $DST); $f.Close() } } catch { Fail $_.Exception.Message; if ($env:THABAT_SETUP_AUTO -eq '1') { Set-Content -LiteralPath (Join-Path $TESTDIR 'result.txt') -Value ('fail ' + $_.Exception.Message); $f.Close() } } })
$b.Add_Click({
  if ($script:done) { Start-Process (Join-Path $env:WINDIR 'System32\wscript.exe') -ArgumentList ([char]34 + (Join-Path $DST 'Thabat.vbs') + [char]34); $f.Close(); return }
  $b.Enabled = $false; $x.Enabled = $false; $c.Enabled = $false; $p.Visible = $true; $p.Value = 0; $m.Text = 'جارٍ التنزيل…'
  try { $wc.DownloadFileAsync([Uri]$URL, $zip) } catch { Fail $_.Exception.Message } })
$f.Add_Shown({
  if ($env:THABAT_SETUP_SHOT) { $f.Refresh(); $bm = New-Object Drawing.Bitmap($f.Width, $f.Height); $f.DrawToBitmap($bm, (New-Object Drawing.Rectangle(0, 0, $f.Width, $f.Height))); $bm.Save($env:THABAT_SETUP_SHOT); if ($env:THABAT_SETUP_AUTO -ne '1') { $f.Close() } }
  if ($env:THABAT_SETUP_AUTO -eq '1') { $b.PerformClick() } })
[void]$f.ShowDialog()
