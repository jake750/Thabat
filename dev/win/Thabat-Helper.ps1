# Thabat helper: a tiny local bridge so the app (opened from a file) can read
# public mosque data from mawaqit.net and, if enabled in settings, the name of
# the program in front (active-app detection), and audio of YouTube/SoundCloud
# links you choose to keep (via yt-dlp, fetched once on request). It can also list a playlist's items (/ytlist) so the app downloads them one by one, each as a background job (/ytjob) so it keeps answering meanwhile. It only listens on this computer
# (127.0.0.1) — except while you use "transfer over the local network" in
# Settings, when it also accepts /lan/ requests with a one-time code for up to
# 15 minutes — only forwards requests to https://mawaqit.net/ (and Quran audio
# from https://everyayah.com/data/ for offline download), and exits by
# itself after 20 minutes without requests. It can also start the video library
# server (Thabat-Library.ps1), show the folder picker for it, and add Thabat or the
# library to the Startup folder when you turn that on in Settings.
# On request it updates Thabat from github.com/jake750/Thabat releases (program files only).
$ErrorActionPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
$port = 47813
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
try { $listener.Start() } catch { exit }   # already running
# 3.20: a secret key, so only Thabat itself (opened from its folder) can use the helper — not a website open in the browser.
# It lives in %LOCALAPPDATA%\Thabat\helper.key and is copied into thabat-key.js beside Thabat.html (web pages cannot read that file).
$kdir = Join-Path $env:LOCALAPPDATA 'Thabat'; New-Item -ItemType Directory -Force -Path $kdir | Out-Null
$kfile = Join-Path $kdir 'helper.key'; $global:hkey = ''
try { $global:hkey = ([IO.File]::ReadAllText($kfile)).Trim() } catch {}
if ($global:hkey -notmatch '^[0-9a-f]{32}$') { $kb = New-Object byte[] 16; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($kb); $global:hkey = -join ($kb | ForEach-Object { $_.ToString('x2') }); [IO.File]::WriteAllText($kfile, $global:hkey) }
$kjs = Join-Path $PSScriptRoot 'thabat-key.js'; $kwant = "window.THABAT_KEY='$($global:hkey)';"
try { if (-not (Test-Path -LiteralPath $kjs) -or ([IO.File]::ReadAllText($kjs)) -ne $kwant) { [IO.File]::WriteAllText($kjs, $kwant) } } catch {}
$last = Get-Date
$global:lan = $null; $global:lanCode = ''; $global:lanUntil = Get-Date
$global:blob = @{ pc = @{}; ph = @{} }; $global:blobN = @{ pc = 0; ph = 0 }
function Lan-Close() { if ($global:lan) { try { $global:lan.Stop() } catch {} }; $global:lan = $null; $global:lanCode = '' }

# Optional: name of the program in front, for the app's "active app detection"
# setting. Read locally only, never sent anywhere.
try {
  Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class ThabatFg {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [StructLayout(LayoutKind.Sequential)] public struct LII { public uint cbSize; public uint dwTime; }
  [DllImport("user32.dll")] public static extern bool GetLastInputInfo(ref LII i);
  public static uint IdleSeconds() { LII i = new LII(); i.cbSize = (uint)Marshal.SizeOf(i); if (!GetLastInputInfo(ref i)) return 0; return ((uint)Environment.TickCount - i.dwTime) / 1000; }
}
"@
} catch {}

$global:sched = @()
$global:restart = $false
$global:alive = [DateTime]::MinValue
$global:lastTick = Get-Date
$global:adhanFile = 'adhan.mp3'
$global:adhanVol = 100
$global:player = $null

function Show-Toast($title, $body) {
  try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $e = { param($x) [Security.SecurityElement]::Escape([string]$x) }
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml("<toast scenario='reminder'><visual><binding template='ToastGeneric'><text>$(& $e $title)</text><text>$(& $e $body)</text></binding></visual><actions><action content='OK' arguments='ok' activationType='system'/></actions></toast>")
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe').Show($toast)
  } catch {}
}

function Play-Adhan() {
  try {
    Add-Type -AssemblyName PresentationCore
    $file = Join-Path $PSScriptRoot $global:adhanFile
    if (-not (Test-Path $file)) { return }
    $global:player = New-Object System.Windows.Media.MediaPlayer
    $global:player.Open([Uri]$file)
    $global:player.Volume = [Math]::Max(0.05, [Math]::Min(1, $global:adhanVol / 100))
    $global:player.Play()
  } catch {}
}

# 3.47: the update itself (used by /selfupdate and by the check at sign-in); throws on any failure
function Run-SelfUpdate {
  $wc = New-Object System.Net.WebClient; $wc.Headers.Add('User-Agent', 'Thabat/1.0'); $wc.Encoding = [Text.Encoding]::UTF8
  $rel = $wc.DownloadString('https://api.github.com/repos/jake750/Thabat/releases/latest') | ConvertFrom-Json
  $asset = $rel.assets | Where-Object { $_.name -eq 'Thabat-Windows.zip' } | Select-Object -First 1
  $url = [string]$asset.browser_download_url
  if ($url -notlike 'https://github.com/jake750/Thabat/releases/download/*') { throw 'asset' }
  $zip = Join-Path $env:TEMP ('thabat_upd_' + [Guid]::NewGuid().ToString('N') + '.zip')
  $wc2 = New-Object System.Net.WebClient; $wc2.Headers.Add('User-Agent', 'Thabat/1.0'); $wc2.DownloadFile($url, $zip)
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $za = [IO.Compression.ZipFile]::OpenRead($zip)
  $names = @('Thabat.html', 'Thabat-Helper.ps1', 'Thabat-Library.ps1', 'Thabat-Transcribe.ps1', 'Thabat.bat', 'Thabat.vbs', 'Thabat.ico', 'LICENSE.txt', 'Install-Thabat.bat', 'Create-Shortcut.bat', 'Download-Mushaf-Images.bat', 'Thabat-Roots.js', 'Uninstall-Thabat.ps1', 'Thabat-Auto.ps1', 'thabat-auto.cmd')
  $new = @{}
  foreach ($e in $za.Entries) { $n = $e.FullName -replace '^Thabat/', ''; if ($names -contains $n -or ($n -like 'pdfjs/*' -and -not $n.EndsWith('/') -and $n -notmatch '\.\.')) { $ms = New-Object IO.MemoryStream; $st = $e.Open(); $st.CopyTo($ms); $st.Close(); $new[$n] = $ms.ToArray() } }
  $za.Dispose(); Remove-Item -LiteralPath $zip -ErrorAction SilentlyContinue
  if (-not $new.ContainsKey('Thabat.html')) { throw 'nohtml' }
  $ver = ''; if ([Text.Encoding]::UTF8.GetString($new['Thabat.html']) -match "APP_VER='([0-9.]+)'") { $ver = $matches[1] }
  $changed = @()
  foreach ($n in @($new.Keys)) {
    $dst = Join-Path $PSScriptRoot ($n -replace '/', '\'); $sub = $n -like 'pdfjs/*'
    if ($sub) { New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null }
    $same = $false
    if (Test-Path -LiteralPath $dst) { $old = [IO.File]::ReadAllBytes($dst); $same = ($old.Length -eq $new[$n].Length) -and ([Convert]::ToBase64String($old) -eq [Convert]::ToBase64String($new[$n])) }
    if (-not $same) { if ((Test-Path -LiteralPath $dst) -and -not $sub) { Copy-Item -LiteralPath $dst -Destination ($dst + '.bak') -Force }; [IO.File]::WriteAllBytes($dst, $new[$n]); $changed += $n }
  }
  $global:restart = $changed -contains 'Thabat-Helper.ps1'
  if ($changed -contains 'Thabat-Library.ps1') {
    # restart the library server only if it is running: ask the old one to stop, start the new one a little later
    $libUp = $false; try { $tc = New-Object System.Net.Sockets.TcpClient; $tc.Connect('127.0.0.1', 47815); $libUp = $tc.Connected; $tc.Close() } catch {}
    if ($libUp) {
      $ld = Join-Path $env:LOCALAPPDATA 'Thabat'; New-Item -ItemType Directory -Force -Path $ld | Out-Null; Set-Content -LiteralPath (Join-Path $ld 'library.stop') -Value '1'
      $cmd = "Start-Sleep -Seconds 6; & '" + ((Join-Path $PSScriptRoot 'Thabat-Library.ps1') -replace "'", "''") + "'"
      Start-Process powershell.exe -WindowStyle Hidden -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -EncodedCommand ' + [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($cmd)))
    }
  }
  # 3.47: keep the version shown in Windows «Apps» right (only for the install made by Thabat-Setup)
  try { $rk = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Thabat'; if ($ver -and (Test-Path $rk) -and ((Get-ItemProperty $rk).InstallLocation -eq $PSScriptRoot)) { Set-ItemProperty -Path $rk -Name DisplayVersion -Value $ver } } catch {}
  return @{ ok = $true; ver = $ver; changed = $changed; restart = [bool]$global:restart }
}
# 3.47 (151): at sign-in and every 12 hours, look for a new release; «notify» shows a Windows notification, «auto» updates
# by itself. %LOCALAPPDATA%\Thabat\upd.json = {mode: notify|auto|off, at: last check (ms), told: version already announced}
$global:updTick = Get-Date; $global:startedAt = Get-Date
function Upd-Cfg() { $p = Join-Path (Join-Path $env:LOCALAPPDATA 'Thabat') 'upd.json'; $c = @{ mode = 'notify'; at = 0; told = '' }
  try { if (Test-Path -LiteralPath $p) { $j = [IO.File]::ReadAllText($p) | ConvertFrom-Json; if ($j.mode) { $c.mode = [string]$j.mode }; if ($j.at) { $c.at = [double]$j.at }; if ($j.told) { $c.told = [string]$j.told } } } catch {}
  return $c }
function Upd-Save($c) { try { $d = Join-Path $env:LOCALAPPDATA 'Thabat'; New-Item -ItemType Directory -Force -Path $d | Out-Null; [IO.File]::WriteAllText((Join-Path $d 'upd.json'), ($c | ConvertTo-Json -Compress)) } catch {} }
function Check-Update() {
  $c = Upd-Cfg; if ($c.mode -eq 'off') { return }
  if (((Get-Date) - $global:startedAt).TotalSeconds -lt 90) { return }
  $now = [double][DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); if (($now - $c.at) -lt 12 * 3600000) { return }
  $c.at = $now; Upd-Save $c
  try {
    $wc = New-Object System.Net.WebClient; $wc.Headers.Add('User-Agent', 'Thabat/1.0'); $wc.Encoding = [Text.Encoding]::UTF8
    $rel = $wc.DownloadString('https://api.github.com/repos/jake750/Thabat/releases/latest') | ConvertFrom-Json
    $latest = ([string]$rel.tag_name) -replace '^v', ''
    $cur = ''; $hp = Join-Path $PSScriptRoot 'Thabat.html'; if (Test-Path -LiteralPath $hp) { $tx = [IO.File]::ReadAllText($hp); if ($tx -match "APP_VER='([0-9.]+)'") { $cur = $matches[1] } }
    if (-not $latest -or -not $cur) { return }
    if ([version]$latest -le [version]$cur) { return }
    if ($c.mode -eq 'auto') { $r = Run-SelfUpdate; Show-Toast 'ثبات' ('حُدِّث ثبات إلى ' + $r.ver + ' — أعد فتحه لترى الجديد.') }
    elseif ($c.told -ne $latest) { Show-Toast 'ثبات' ('إصدار جديد من ثبات (' + $latest + ') متاح. افتح ثبات واضغط «حدّث الآن».'); $c.told = $latest; Upd-Save $c }
  } catch {}
}
# alerts the app scheduled; shown only while the app window itself is closed
function Check-Schedule() {
  if ($global:sched.Count -eq 0) { return }
  $now = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
  $appOpen = ((Get-Date) - $global:alive).TotalSeconds -lt 100
  $keep = @()
  foreach ($it in $global:sched) {
    if ($it[0] -le $now) {
      if (-not $appOpen -and ($now - $it[0]) -lt 600000) { Show-Toast $it[1] $it[2]; if ($it[3] -eq 1) { Play-Adhan } }
    } else { $keep += ,$it }
  }
  $global:sched = $keep
}

# load the last schedule (so notifications keep working after a restart)
try {
  $sf = Join-Path (Join-Path $env:LOCALAPPDATA 'Thabat') 'sched.json'
  if (Test-Path $sf) {
    $o = [IO.File]::ReadAllText($sf, [Text.Encoding]::UTF8) | ConvertFrom-Json
    $L = @(); foreach ($x in $o.items) { $L += ,@([int64]$x[0], [string]$x[1], [string]$x[2], [int]$x[3]) }
    $global:sched = $L
    if ($o.adhan -match '^[a-z_]+\.mp3$') { $global:adhanFile = $o.adhan }
    if ($o.vol) { $global:adhanVol = [int]$o.vol }
  }
} catch {}

# 3.81: YouTube / SoundCloud addresses yt-dlp may be asked for (SoundCloud lists give api-v2 track addresses after the first five)
function Yt-UrlOk($u) { return ($u -match '^https://((www|m|music|on)\.)?(youtube\.com|youtu\.be|soundcloud\.com)/[A-Za-z0-9_\-\./\?=&%:@,]+$') -or ($u -match '^https://api(-v2)?\.soundcloud\.com/tracks/\d+$') }
# 3.81: downloads run as background jobs, so the helper keeps answering (prayer alerts, other requests) during a long download.
# yt-dlp gets its options from a config file (no shell quoting); cmd.exe only redirects its output to files.
$global:ytjobs = @{}
function Yt-Why($t) {
  if ($t -match 'not a bot|Sign in to confirm you') { return 'bot' }
  if ($t -match 'confirm your age|age-restricted|inappropriate') { return 'age' }
  if ($t -match 'Private video|private') { return 'private' }
  if ($t -match 'members-only|Join this channel') { return 'members' }
  if ($t -match 'not available in your country|geo') { return 'geo' }
  if ($t -match 'Video unavailable|not available|removed|404') { return 'gone' }
  if ($t -match 'HTTP Error 429|Too Many Requests') { return 'rate' }
  if ($t -match 'timed out|getaddrinfo|Connection|Network|SSL') { return 'net' }
  return 'other'
}
function Yt-Start($url, $vdir, $pre) {
  $exe = Join-Path (Join-Path $env:LOCALAPPDATA 'Thabat') 'yt-dlp.exe'
  $id = [Guid]::NewGuid().ToString('N'); $tmp = Join-Path $env:TEMP ('thabat_' + $id)
  $cfg = @('--no-playlist', '--newline', '--no-warnings', '--no-simulate', '--concurrent-fragments 8', '--retries 5', '--fragment-retries 10', '--socket-timeout 30',
    "--print-to-file `"after_move:%(title)s|||%(uploader)s|||%(duration)s|||%(filepath)s`" `"$tmp.txt`"")
  if ($vdir) {
    # 3.87: a video (up to 720p, mp4) written straight into a library folder; forward slashes so the config parser keeps the path as it is
    $out = ($vdir.TrimEnd('\') + '\' + $pre + '%(title).150B.%(ext)s') -replace '\\', '/'
    $cfg += @('-f "bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720][ext=mp4]/bv*[height<=720]+ba/b[height<=720]/b"', '--merge-output-format mp4', '--windows-filenames', "-o `"$out`"")
  } else {
    $cfg += @('-f "bestaudio[ext=m4a]/bestaudio"', "-o `"$tmp.%(ext)s`"")
    if (Get-Command ffmpeg -ErrorAction SilentlyContinue) { $cfg += @('-x', '--audio-format mp3', '--audio-quality 2') }
  }
  [IO.File]::WriteAllLines("$tmp.conf", [string[]](@('# coding: utf-8') + $cfg), (New-Object Text.UTF8Encoding($false)))
  $psi = New-Object Diagnostics.ProcessStartInfo
  $psi.FileName = $env:ComSpec; $psi.UseShellExecute = $false; $psi.CreateNoWindow = $true
  $psi.Arguments = '/d /s /c ""' + $exe + '" --ignore-config --config-locations "' + "$tmp.conf" + '" "' + $url + '" > "' + "$tmp.out" + '" 2> "' + "$tmp.err" + '""'
  $p = [Diagnostics.Process]::Start($psi)
  $global:ytjobs[$id] = @{ p = $p; tmp = $tmp; at = Get-Date }
  return $id
}
function Yt-VDir($ri, $name) {
  try {
    $lj = Join-Path (Join-Path $env:LOCALAPPDATA 'Thabat') 'library.json'; if (-not (Test-Path $lj)) { return $null }
    $roots = @((Get-Content -LiteralPath $lj -Raw -Encoding UTF8 | ConvertFrom-Json).roots); $i = 0; if (-not [int]::TryParse([string]$ri, [ref]$i)) { return $null }
    if ($i -lt 0 -or $i -ge $roots.Count) { return $null }
    $root = [IO.Path]::GetFullPath([string]$roots[$i]).TrimEnd('\'); if (-not (Test-Path -LiteralPath $root)) { return $null }
    $n = ([string]$name) -replace '[\\/:*?"<>|\x00-\x1f]', '_'; $n = $n.Trim().TrimStart('.').TrimEnd('.', ' '); if ($n.Length -gt 120) { $n = $n.Substring(0, 120).Trim() }
    if (-not $n) { return $null }
    $full = [IO.Path]::GetFullPath((Join-Path $root $n)); if (-not $full.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)) { return $null }
    if (-not (Test-Path -LiteralPath $full)) { New-Item -ItemType Directory -Path $full -Force | Out-Null }
    return $full
  } catch { return $null }
}
function Yt-Clean($id) { $j = $global:ytjobs[$id]; if (-not $j) { return }; try { if (-not $j.p.HasExited) { & taskkill.exe /PID $j.p.Id /T /F 2>$null | Out-Null } } catch {}; Get-ChildItem -Path ($j.tmp + '*') -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue; $global:ytjobs.Remove($id) }
function Yt-State($id) {
  $j = $global:ytjobs[$id]; if (-not $j) { return @{ s = 'none' } }
  if (-not $j.p.HasExited) {
    $pc = 0; try { $tail = Get-Content -LiteralPath ($j.tmp + '.out') -Tail 3 -ErrorAction SilentlyContinue; foreach ($l in $tail) { if ($l -match '\[download\]\s+([\d\.]+)%') { $pc = [double]$matches[1] } } } catch {}
    return @{ s = 'run'; p = $pc }
  }
  $line = $null; if (Test-Path ($j.tmp + '.txt')) { $line = (Get-Content -LiteralPath ($j.tmp + '.txt') -Encoding UTF8 | Where-Object { $_ -like '*|||*' } | Select-Object -Last 1) }
  if ($line) { $parts = $line -split '\|\|\|'; if ($parts.Count -ge 4 -and (Test-Path -LiteralPath $parts[3])) { return @{ s = 'ok'; file = $parts[3]; title = $parts[0]; uploader = $parts[1]; duration = $parts[2] } } }
  $err = ''; try { $err = ((Get-Content -LiteralPath ($j.tmp + '.err') -Encoding UTF8 -ErrorAction SilentlyContinue | Where-Object { $_ -match 'ERROR' } | Select-Object -Last 1) -as [string]) } catch {}
  return @{ s = 'err'; why = (Yt-Why $err); msg = $(if ($err) { $err.Substring(0, [Math]::Min(240, $err.Length)) } else { '' }) }
}

function Send-ResponseMeta($stream, $type, [byte[]]$body, $meta) {
  $head = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nX-Meta: $meta`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Expose-Headers: X-Meta`r`nAccess-Control-Allow-Private-Network: true`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $hb = [Text.Encoding]::ASCII.GetBytes($head)
  $stream.Write($hb, 0, $hb.Length)
  $stream.Write($body, 0, $body.Length)
  $stream.Flush()
}

function Send-Response($stream, $status, $type, [byte[]]$body) {
  $head = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Private-Network: true`r`nAccess-Control-Allow-Methods: GET, OPTIONS`r`nAccess-Control-Allow-Headers: *`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $hb = [Text.Encoding]::ASCII.GetBytes($head)
  $stream.Write($hb, 0, $hb.Length)
  if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
  $stream.Flush()
}

# 3.105: automation — other programs on this PC (with the key from helper.key, e.g. Thabat-Auto.ps1) queue a task, a note or a timer start/stop;
# Thabat takes the queue every few seconds while it is open (kept in auto.json until then). And a tray icon (tray.json {on}), on by default.
$global:autoF = Join-Path $kdir 'auto.json'; $global:autoQ = New-Object System.Collections.ArrayList
try { if (Test-Path -LiteralPath $global:autoF) { $arr = [IO.File]::ReadAllText($global:autoF, [Text.Encoding]::UTF8) | ConvertFrom-Json; foreach ($x in $arr) { if ($x -and $x.t) { [void]$global:autoQ.Add($x) } } } } catch {}
function Auto-Save() { try { [IO.File]::WriteAllText($global:autoF, (ConvertTo-Json -InputObject @($global:autoQ) -Depth 4 -Compress), (New-Object System.Text.UTF8Encoding($false))) } catch {} }
function Auto-Push($o) { if ($global:autoQ.Count -ge 200) { $global:autoQ.RemoveAt(0) }; $o['ts'] = [DateTimeOffset]::Now.ToUnixTimeMilliseconds(); [void]$global:autoQ.Add([pscustomobject]$o); Auto-Save }
# 3.125: «Open with Thabat» for PDF files and thabat:// links (this user's registry only); the opened PDF is read once through /lfile
$global:pdfOk = New-Object 'System.Collections.Generic.HashSet[string]'
function Assoc-On() { return (Test-Path 'HKCU:\Software\Classes\Thabat.PDF\shell\open\command') }
function Assoc-Set($on) {
  $auto = Join-Path $PSScriptRoot 'Thabat-Auto.ps1'; $ico = Join-Path $PSScriptRoot 'Thabat.ico'
  $pre = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $auto + '" '
  $C = 'HKCU:\Software\Classes'
  if ($on) {
    foreach ($k in @("$C\Thabat.PDF", "$C\Thabat.PDF\shell", "$C\Thabat.PDF\shell\open", "$C\Thabat.PDF\shell\open\command", "$C\Thabat.PDF\DefaultIcon", "$C\.pdf", "$C\.pdf\OpenWithProgids", "$C\thabat", "$C\thabat\shell", "$C\thabat\shell\open", "$C\thabat\shell\open\command")) { if (-not (Test-Path $k)) { New-Item -Path $k | Out-Null } }
    Set-ItemProperty -Path "$C\Thabat.PDF" -Name '(default)' -Value 'PDF (Thabat)'
    Set-ItemProperty -Path "$C\Thabat.PDF\DefaultIcon" -Name '(default)' -Value $ico
    Set-ItemProperty -Path "$C\Thabat.PDF\shell\open\command" -Name '(default)' -Value ($pre + 'pdf "%1"')
    New-ItemProperty -Path "$C\.pdf\OpenWithProgids" -Name 'Thabat.PDF' -Value '' -PropertyType String -Force | Out-Null
    Set-ItemProperty -Path "$C\thabat" -Name '(default)' -Value 'URL:Thabat'
    New-ItemProperty -Path "$C\thabat" -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
    Set-ItemProperty -Path "$C\thabat\shell\open\command" -Name '(default)' -Value ($pre + 'open "%1"')
  } else {
    if (Test-Path "$C\Thabat.PDF") { Remove-Item -Path "$C\Thabat.PDF" -Recurse -Force }
    if (Test-Path "$C\.pdf\OpenWithProgids") { Remove-ItemProperty -Path "$C\.pdf\OpenWithProgids" -Name 'Thabat.PDF' -ErrorAction SilentlyContinue }
    if (Test-Path "$C\thabat") { Remove-Item -Path "$C\thabat" -Recurse -Force }
  }
}

function Q-Dec($s) { try { $v = ([string]$s) -replace '\+', ' '; return [Uri]::UnescapeDataString($v) } catch { return '' } }
# 3.110: the title of a web page pasted into a note (public http/https addresses only; nothing on this PC or the home network)
function Page-Title($u) {
  if ($u -notmatch '^https?://[^\s/?#]+') { return $null }
  try { $uri = [Uri]$u } catch { return $null }
  try { $ips = [System.Net.Dns]::GetHostAddresses($uri.Host) } catch { return $null }
  foreach ($ip in $ips) { $b = $ip.GetAddressBytes(); $v4 = $ip.AddressFamily -eq 'InterNetwork'
    if ([System.Net.IPAddress]::IsLoopback($ip) -or $ip.IsIPv6LinkLocal -or $ip.IsIPv6SiteLocal) { return $null }
    if ($v4 -and ($b[0] -eq 10 -or $b[0] -eq 127 -or $b[0] -eq 0 -or ($b[0] -eq 169 -and $b[1] -eq 254) -or ($b[0] -eq 172 -and $b[1] -ge 16 -and $b[1] -le 31) -or ($b[0] -eq 192 -and $b[1] -eq 168) -or ($b[0] -eq 100 -and $b[1] -ge 64 -and $b[1] -le 127))) { return $null }
    if (-not $v4 -and ($b[0] -band 0xfe) -eq 0xfc) { return $null } }
  try {
    $rq = [System.Net.HttpWebRequest]::Create($uri); $rq.Timeout = 8000; $rq.ReadWriteTimeout = 8000; $rq.AllowAutoRedirect = $true; $rq.MaximumAutomaticRedirections = 4
    $rq.UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Thabat'; $rq.Accept = 'text/html,*/*;q=0.5'
    $rs = $rq.GetResponse(); $st = $rs.GetResponseStream(); $buf = New-Object byte[] 307200; $n = 0
    while ($n -lt $buf.Length) { $r = $st.Read($buf, $n, $buf.Length - $n); if ($r -le 0) { break }; $n += $r }
    $rs.Close()
    $html = [Text.Encoding]::UTF8.GetString($buf, 0, $n)
    $tt = ''
    if ($html -match '<meta[^>]+property=["'']og:title["''][^>]+content=["'']([^"'']+)') { $tt = $matches[1] }
    elseif ($html -match '<meta[^>]+content=["'']([^"'']+)["''][^>]+property=["'']og:title') { $tt = $matches[1] }
    elseif ($html -match '(?is)<title[^>]*>(.*?)</title>') { $tt = $matches[1] }
    $tt = [System.Net.WebUtility]::HtmlDecode(($tt -replace '\s+', ' ').Trim())
    if ($tt.Length -gt 200) { $tt = $tt.Substring(0, 200) }
    return $tt
  } catch { return $null }
}

$global:tray = $null; $global:trayF = Join-Path $kdir 'tray.json'; $global:trayTick = [DateTime]::MinValue
function Tray-On() { try { $o = [IO.File]::ReadAllText($global:trayF) | ConvertFrom-Json; return [bool]$o.on } catch { return $true } }
function App-Open() { return ((Get-Date) - $global:alive).TotalSeconds -lt 100 }
function Tray-Say($msg) { if ($global:tray) { try { $global:tray.ShowBalloonTip(2500, 'ثبات', $msg, [System.Windows.Forms.ToolTipIcon]::None) } catch {} } }
function Tray-Open() { if (App-Open) { Tray-Say 'ثبات مفتوح الآن.'; return }; $vbs = Join-Path $PSScriptRoot 'Thabat.vbs'; if (Test-Path -LiteralPath $vbs) { Start-Process 'wscript.exe' -ArgumentList ('"' + $vbs + '"') } }
function Tray-Task() {
  try { Add-Type -AssemblyName Microsoft.VisualBasic; $s = [Microsoft.VisualBasic.Interaction]::InputBox('اكتب المهمة، وتظهر في «اليوم» في ثبات:', 'ثبات — مهمة سريعة', '') } catch { $s = '' }
  $s = ([string]$s).Trim(); if (-not $s) { return }
  Auto-Push @{ t = 'task'; text = $s.Substring(0, [Math]::Min(500, $s.Length)) }
  if (App-Open) { Tray-Say 'أُضيفت المهمة.' } else { Tray-Say 'أُضيفت، وتظهر حين تفتح ثبات.' }
}
function Tray-Set() {
  if (-not (Tray-On)) { if ($global:tray) { try { $global:tray.Visible = $false; $global:tray.Dispose() } catch {}; $global:tray = $null }; return }
  if ($global:tray) { return }
  try {
    Add-Type -AssemblyName System.Windows.Forms, System.Drawing
    $ni = New-Object System.Windows.Forms.NotifyIcon
    $ico = Join-Path $PSScriptRoot 'Thabat.ico'
    if (Test-Path -LiteralPath $ico) { $ni.Icon = New-Object System.Drawing.Icon($ico) } else { $ni.Icon = [System.Drawing.SystemIcons]::Application }
    $ni.Text = 'ثبات'
    $m = New-Object System.Windows.Forms.ContextMenuStrip; $m.RightToLeft = [System.Windows.Forms.RightToLeft]::Yes
    $a = $m.Items.Add('افتح ثبات'); $a.add_Click({ Tray-Open })
    $b = $m.Items.Add('مهمة سريعة…'); $b.add_Click({ Tray-Task })
    $c = $m.Items.Add('ابدأ جلسة عمل'); $c.add_Click({ Auto-Push @{ t = 'timer'; a = 'start' }; if (App-Open) { Tray-Say 'بدأت الجلسة.' } else { Tray-Open } })
    $d = $m.Items.Add('أوقف الجلسة'); $d.add_Click({ Auto-Push @{ t = 'timer'; a = 'stop' }; if (App-Open) { Tray-Say 'أُوقفت الجلسة.' } })
    [void]$m.Items.Add('-')
    $e = $m.Items.Add('أخفِ هذه الأيقونة'); $e.add_Click({ try { [IO.File]::WriteAllText($global:trayF, '{"on":false}') } catch {}; Tray-Set })
    $ni.ContextMenuStrip = $m; $ni.add_DoubleClick({ Tray-Open }); $ni.Visible = $true; $global:tray = $ni
    $global:trayTick = [DateTime]::MinValue; $global:trayB = -1
  } catch { $global:tray = $null }
}
$global:trayGoal = $null; $global:trayB = -1
function Tray-Fm($m) { $h = [Math]::Floor($m / 60); $r = $m % 60; if ($h -and $r) { return ([string]$h + ' س ' + $r + ' د') } elseif ($h) { return ([string]$h + ' س') } else { return ([string]$r + ' د') } }
$global:trayLogo = $null
function Tray-Logo() {
  if ($global:trayLogo) { return $global:trayLogo }
  try {
    $by = [IO.File]::ReadAllBytes((Join-Path $PSScriptRoot 'Thabat.ico')); $n = [BitConverter]::ToUInt16($by, 4); $best = $null
    for ($i = 0; $i -lt $n; $i++) { $e = 6 + 16 * $i; $w = [int]$by[$e]; if ($w -eq 0) { $w = 256 }; $sz = [BitConverter]::ToInt32($by, $e + 8); $of = [BitConverter]::ToInt32($by, $e + 12); if ($w -ge 32 -and (-not $best -or $w -lt $best.w)) { $best = @{ w = $w; sz = $sz; of = $of } } }
    if ($best -and $best.w -lt 64) { foreach ($i in 0..($n - 1)) { $e = 6 + 16 * $i; if ([int]$by[$e] -eq 64) { $best = @{ w = 64; sz = [BitConverter]::ToInt32($by, $e + 8); of = [BitConverter]::ToInt32($by, $e + 12) } } } }
    $ms = New-Object IO.MemoryStream(,$by[$best.of..($best.of + $best.sz - 1)]); $global:trayLogo = [System.Drawing.Image]::FromStream($ms)
  } catch { $global:trayLogo = $null }
  return $global:trayLogo
}
function Tray-Icon($b) {
  if ($b -eq $global:trayB -or -not $global:tray) { return }; $global:trayB = $b
  try {
    $ico = Join-Path $PSScriptRoot 'Thabat.ico'
    if ($b -lt 0) { if (Test-Path -LiteralPath $ico) { $global:tray.Icon = New-Object System.Drawing.Icon($ico) }; return }
    $bmp = New-Object System.Drawing.Bitmap 32, 32; $gr = [System.Drawing.Graphics]::FromImage($bmp); $gr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $lg = Tray-Logo; if ($lg) { $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic; $gr.DrawImage($lg, (New-Object System.Drawing.Rectangle 3, 0, 26, 26)) }
    $bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 60, 60, 60)); $gr.FillRectangle($bg, 2, 27, 28, 5)
    $w = [int][Math]::Round(28 * $b / 10); if ($w -gt 0) { $fg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 253, 219, 0)); $gr.FillRectangle($fg, (30 - $w), 27, $w, 5); $fg.Dispose() }
    $bg.Dispose(); $gr.Dispose(); $global:tray.Icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon()); $bmp.Dispose()
  } catch {}
}
function Tray-Tick() {
  if ($global:tray) { try { [System.Windows.Forms.Application]::DoEvents() } catch {} }
  if (((Get-Date) - $global:trayTick).TotalSeconds -lt 30) { return }; $global:trayTick = Get-Date
  Tray-Set; if (-not $global:tray) { return }
  $now = [DateTimeOffset]::Now.ToUnixTimeMilliseconds(); $nx = $null
  foreach ($it in $global:sched) { if ($it[0] -gt $now -and $it[3] -eq 1 -and (-not $nx -or $it[0] -lt $nx[0])) { $nx = $it } }
  $txt = 'ثبات'
  if ($nx) { $tm = [DateTimeOffset]::FromUnixTimeMilliseconds($nx[0]).LocalDateTime.ToString('HH:mm'); $txt = ('ثبات · ' + ($nx[1] -replace '[^\p{L}\p{N}\s:·—-]', '').Trim() + ' ' + $tm) }
  $tg = $global:trayGoal
  if ($tg -and $tg.d -eq (Get-Date).ToString('yyyy-MM-dd') -and $tg.g -gt 0) {
    $pc = [int][Math]::Min(100, [Math]::Round(100 * $tg.w / $tg.g)); $l2 = (Tray-Fm $tg.w) + ' من ' + (Tray-Fm $tg.g) + ' · ' + $pc + '%'
    $room = 62 - $l2.Length; if ($txt.Length -gt $room) { $txt = $txt.Substring(0, [Math]::Max(0, $room)) }; $txt = $txt + "`n" + $l2
    Tray-Icon ([int][Math]::Floor($pc / 10))
  } else { Tray-Icon -1 }
  if ($txt.Length -gt 63) { $txt = $txt.Substring(0, 63) }
  try { $global:tray.Text = $txt } catch {}
}
Tray-Set

while ($true) {
  if ($global:lan -and (Get-Date) -gt $global:lanUntil) { Lan-Close }
  $isLan = $false
  if ($listener.Pending()) { $client = $listener.AcceptTcpClient() }
  elseif ($global:lan -and $global:lan.Pending()) { $client = $global:lan.AcceptTcpClient(); $isLan = $true }
  else {
    Start-Sleep -Milliseconds 150; Tray-Tick
    if (((Get-Date) - $global:lastTick).TotalSeconds -ge 5) { $global:lastTick = Get-Date; Check-Schedule }
    foreach ($k in @($global:ytjobs.Keys)) { if (((Get-Date) - $global:ytjobs[$k].at).TotalHours -gt 2) { Yt-Clean $k } }
    if ($global:ytjobs.Count -eq 0 -and ((Get-Date) - $global:updTick).TotalSeconds -ge 60) { $global:updTick = Get-Date; Check-Update; if ($global:restart) { break } }
    if (((Get-Date) - $last).TotalMinutes -gt 20 -and $global:sched.Count -eq 0 -and -not $global:lan -and $global:ytjobs.Count -eq 0 -and -not $global:tray -and $global:autoQ.Count -eq 0) { break }
    continue
  }
  $last = Get-Date
  try {
    $client.ReceiveTimeout = 5000
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream, [Text.Encoding]::ASCII)
    $line = $reader.ReadLine()
    $org = ''
    while ($true) { $h = $reader.ReadLine(); if ($h -eq $null -or $h -eq '') { break }; if ($h -match '^Origin:\s*(.*)$') { $org = $matches[1].Trim() } }
    $parts = "$line" -split ' '
    $method = $parts[0]; $path = $parts[1]
    # the key travels as k=…; take it out so the routes below see the same paths as before
    $kOk = ($global:hkey -and "$path" -match '[?&]k=([0-9a-f]{32})(&|$)' -and $matches[1] -eq $global:hkey)
    $path = [regex]::Replace([string]$path, '([?&])k=[0-9a-f]{32}(&?)', { param($m) if ($m.Groups[2].Value) { $m.Groups[1].Value } else { '' } })
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    if ($method -eq 'OPTIONS') {
      Send-Response $stream '204 No Content' 'text/plain' ([byte[]]@())
    } elseif (-not $isLan -and $org -match '^https?://') {
      # a web page (not Thabat, which runs from a file) is calling: refuse
      Send-Response $stream '403 Forbidden' 'application/json' ($utf8.GetBytes('{"error":"origin"}'))
    } elseif (-not $isLan -and -not $kOk -and $path -notmatch '^/(ping|alive)(\?|$)') {
      Send-Response $stream '401 Unauthorized' 'application/json' ($utf8.GetBytes('{"error":"key"}'))
    } elseif ($isLan) {
      # requests from the phone on the same network: only /lan/ with the one-time code
      $q = @{}; if ($path -match '\?(.*)$') { foreach ($kv in ($matches[1] -split '&')) { $a = $kv -split '=', 2; if ($a.Count -eq 2) { $q[$a[0]] = $a[1] } } }
      if (-not $global:lanCode -or $q['c'] -ne $global:lanCode) { Send-Response $stream '403 Forbidden' 'application/json' ($utf8.GetBytes('{"error":"code"}')) }
      elseif ($path -like '/lan/info*') { Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"pc":' + $global:blobN.pc + ',"ok":true}')) }
      elseif ($path -like '/lan/get*') { $i = [int]$q['i']; $v = [string]$global:blob.pc[$i]; Send-Response $stream '200 OK' 'text/plain' ($utf8.GetBytes($v)) }
      elseif ($path -like '/lan/put*') { $i = [int]$q['i']; $global:blob.ph[$i] = [string]$q['d']; $global:blobN.ph = [int]$q['n']; $global:lanUntil = (Get-Date).AddMinutes(15); Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}')) }
      else { Send-Response $stream '404 Not Found' 'application/json' ($utf8.GetBytes('{}')) }
    } elseif ($path -match '^/auto/(task|note|timer|pdf|open)\?(.*)$') {
      # 3.105: queue one command for Thabat (the key is checked above, like every route)
      $kind = $matches[1]; $q = @{}; foreach ($kv in ($matches[2] -split '&')) { $a = $kv -split '=', 2; if ($a.Count -eq 2) { $q[$a[0]] = Q-Dec $a[1] } }
      $o = @{ t = $kind }
      if ($kind -eq 'task') { $o.text = ([string]$q['text']).Trim(); if ($q['after'] -match '^(fajr|dhuhr|asr|maghrib|isha)$') { $o.after = $q['after'] }; if ($q['day'] -match '^\d{4}-\d{2}-\d{2}$') { $o.day = $q['day'] }; if ($q['at'] -match '^\d{2}:\d{2}$') { $o.at = $q['at'] } }
      elseif ($kind -eq 'note') { $o.title = ([string]$q['title']).Trim(); $o.body = [string]$q['body'] }
      else { $o.a = [string]$q['a']; if ($q['cat'] -match '^[\w-]{1,40}$') { $o.cat = $q['cat'] } }
      if ($kind -eq 'pdf') { $o.Remove('a'); $o.p = [string]$q['p']; if ($o.p -match '\.pdf$' -and (Test-Path -LiteralPath $o.p -PathType Leaf)) { [void]$global:pdfOk.Add($o.p) } else { $o.p = '' } }
      if ($kind -eq 'open') { $o.Remove('a'); $o.u = [string]$q['u']; if ($o.u -notmatch '^thabat://[a-zA-Z]+/' -or $o.u.Length -gt 600) { $o.u = '' } }
      $bad = ($kind -eq 'pdf' -and -not $o.p) -or ($kind -eq 'open' -and -not $o.u) -or ($kind -eq 'task' -and -not $o.text) -or ($kind -eq 'note' -and -not $o.title -and -not $o.body) -or ($kind -eq 'timer' -and $o.a -notmatch '^(start|stop)$')
      if ($bad -or ("$($o.text)$($o.title)$($o.body)").Length -gt 20000) { Send-Response $stream '400 Bad Request' 'application/json' ($utf8.GetBytes('{"error":"bad"}')) }
      else { Auto-Push $o; Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true,"queued":' + $global:autoQ.Count + ',"open":' + ([string](App-Open)).ToLower() + '}')) }
    } elseif ($path -match '^/lfile\?p=(.+)$') {
      $lp = Q-Dec $matches[1]
      if ($global:pdfOk.Contains($lp) -and (Test-Path -LiteralPath $lp -PathType Leaf) -and (Get-Item -LiteralPath $lp).Length -lt 400MB) { Send-Response $stream '200 OK' 'application/pdf' ([IO.File]::ReadAllBytes($lp)) }
      else { Send-Response $stream '404 Not Found' 'application/json' ($utf8.GetBytes('{"error":"file"}')) }
    } elseif ($path -match '^/assoc(\?on=([01]))?$') {
      $err = ''; if ($matches[2]) { try { Assoc-Set ($matches[2] -eq '1') } catch { $err = 'reg' } }
      Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":' + $(if ($err) { 'false' } else { 'true' }) + ',"on":' + ([string](Assoc-On)).ToLower() + '}'))
    } elseif ($path -like '/auto/take*') {
      $arr = @($global:autoQ); $global:autoQ.Clear(); Auto-Save
      $js = if ($arr.Count) { ConvertTo-Json -InputObject $arr -Depth 4 -Compress } else { '[]' }; if ($arr.Count -eq 1 -and $js -notmatch '^\[') { $js = '[' + $js + ']' }
      Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes($js))
    } elseif ($path -match '^/tray/goal\?w=(\d{1,5})&g=(\d{1,5})&d=(\d{4}-\d{2}-\d{2})$') {
      $global:trayGoal = @{ w = [int]$matches[1]; g = [int]$matches[2]; d = $matches[3] }; $global:trayTick = [DateTime]::MinValue
      Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}'))
    } elseif ($path -match '^/tray(\?on=([01]))?$') {
      if ($matches[2]) { try { [IO.File]::WriteAllText($global:trayF, ('{"on":' + ($(if ($matches[2] -eq '1') { 'true' } else { 'false' })) + '}')) } catch {}; $global:trayTick = [DateTime]::MinValue; Tray-Set }
      Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"on":' + ([string](Tray-On)).ToLower() + ',"shown":' + ([string]([bool]$global:tray)).ToLower() + '}'))
    } elseif ($path -match '^/title\?u=(.+)$') {
      $tt = Page-Title (Q-Dec $matches[1])
      if ($tt -eq $null) { Send-Response $stream '404 Not Found' 'application/json' ($utf8.GetBytes('{"error":"title"}')) }
      else { Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes((ConvertTo-Json -InputObject @{ t = $tt } -Compress))) }
    } elseif ($path -like '/lanopen*') {
      Lan-Close
      try {
        $global:lan = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, 47814); $global:lan.Start()
        $global:lanCode = [string](Get-Random -Minimum 100000 -Maximum 999999); $global:lanUntil = (Get-Date).AddMinutes(15)
        $global:blob = @{ pc = @{}; ph = @{} }; $global:blobN = @{ pc = 0; ph = 0 }
        $ips = @([System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object { $_.AddressFamily -eq 'InterNetwork' -and -not $_.ToString().StartsWith('127.') -and -not $_.ToString().StartsWith('169.254.') } | ForEach-Object { $_.ToString() })
        $o = @{ ok = $true; code = $global:lanCode; port = 47814; ips = $ips }
        Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes(($o | ConvertTo-Json -Compress)))
      } catch { Lan-Close; Send-Response $stream '500 Internal Server Error' 'application/json' ($utf8.GetBytes('{"error":"lan"}')) }
    } elseif ($path -match '^/lanstage\?i=(\d+)&n=(\d+)&d=(.*)$') {
      $global:blob.pc[[int]$matches[1]] = $matches[3]; $global:blobN.pc = [int]$matches[2]
      Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}'))
    } elseif ($path -like '/laninfo*') {
      Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ph":' + $global:blobN.ph + ',"got":' + $global:blob.ph.Count + ',"open":' + ([string]([bool]$global:lan)).ToLower() + '}'))
    } elseif ($path -match '^/lanpull\?i=(\d+)') {
      Send-Response $stream '200 OK' 'text/plain' ($utf8.GetBytes([string]$global:blob.ph[[int]$matches[1]]))
    } elseif ($path -like '/lanclose*') {
      Lan-Close; Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}'))
    } elseif ($path -match '^/libstart(\?|$)') {
      # start the video library server (it exits by itself if it is already running)
      $lib = Join-Path $PSScriptRoot 'Thabat-Library.ps1'
      if (Test-Path -LiteralPath $lib) { Start-Process powershell.exe -WindowStyle Hidden -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $lib + '"'); Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}')) }
      else { Send-Response $stream '404 Not Found' 'application/json' ($utf8.GetBytes('{"error":"nolib"}')) }
    } elseif ($path -like '/libpick*') {
      # the Windows folder picker, for choosing a library folder
      $picked = ''
      try {
        Add-Type -AssemblyName System.Windows.Forms
        $owner = New-Object System.Windows.Forms.Form; $owner.TopMost = $true; $owner.ShowInTaskbar = $false; $owner.WindowState = 'Minimized'; $owner.Show(); $owner.Hide()
        # 3.29: the modern Explorer folder dialog (IFileOpenDialog with FOS_PICKFOLDERS); the old small tree only if that fails
        $done = $false
        try {
          if (-not ('ThabatFolderPick' -as [type])) { Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices;
public static class ThabatFolderPick {
  [ComImport, Guid("DC1C5A9C-E88A-4dde-A5A1-60F82A20AEF7")] class FOD {}
  [ComImport, Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  interface IShellItem { void BindToHandler(IntPtr pbc, ref Guid bhid, ref Guid riid, out IntPtr ppv); void GetParent(out IShellItem i); void GetDisplayName(uint sigdn, [MarshalAs(UnmanagedType.LPWStr)] out string name); void GetAttributes(uint m, out uint a); void Compare(IShellItem i, uint h, out int o); }
  [ComImport, Guid("42f85136-db7e-439c-85f1-e4075d135fc8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  interface IFileDialog {
    [PreserveSig] int Show(IntPtr parent); void SetFileTypes(uint c, IntPtr f); void SetFileTypeIndex(uint i); void GetFileTypeIndex(out uint i); void Advise(IntPtr p, out uint c); void Unadvise(uint c);
    void SetOptions(uint o); void GetOptions(out uint o); void SetDefaultFolder(IShellItem i); void SetFolder(IShellItem i); void GetFolder(out IShellItem i); void GetCurrentSelection(out IShellItem i);
    void SetFileName([MarshalAs(UnmanagedType.LPWStr)] string n); void GetFileName([MarshalAs(UnmanagedType.LPWStr)] out string n); void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string t);
    void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string t); void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string t); void GetResult(out IShellItem i); }
  public static string Pick(IntPtr owner, string title, string ok) {
    IFileDialog d = (IFileDialog)new FOD(); uint o; d.GetOptions(out o); d.SetOptions(o | 0x20 | 0x40 | 0x800);
    if (title != null) d.SetTitle(title); if (ok != null) d.SetOkButtonLabel(ok);
    if (d.Show(owner) != 0) return ""; IShellItem it; d.GetResult(out it); string p; it.GetDisplayName(0x80058000, out p); return p ?? "";
  }
}
'@ }
          $picked = [ThabatFolderPick]::Pick($owner.Handle, 'ثبات · اختر مجلدًا للمكتبة', 'اختر هذا المجلد'); $done = $true
        } catch {}
        if (-not $done) {
          $dlg = New-Object System.Windows.Forms.FolderBrowserDialog; $dlg.ShowNewFolderButton = $false
          if ($dlg.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) { $picked = $dlg.SelectedPath }
        }
        $owner.Dispose()
      } catch {}
      Send-Response $stream '200 OK' 'application/json; charset=utf-8' ($utf8.GetBytes((@{ ok = $true; path = $picked } | ConvertTo-Json -Compress)))
    } elseif ($path -match '^/(lib|app)startup\?on=([01])') {
      # start the library server, or Thabat itself, with Windows (a shortcut in the Startup folder)
      $which = $matches[1]; $on = $matches[2] -eq '1'
      $lnk = Join-Path ([Environment]::GetFolderPath('Startup')) ($(if ($which -eq 'lib') { 'Thabat Library.lnk' } else { 'Thabat.lnk' }))
      try {
        if ($on) {
          $w = New-Object -ComObject WScript.Shell; $sc = $w.CreateShortcut($lnk)
          if ($which -eq 'lib') { $sc.TargetPath = 'powershell.exe'; $sc.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $PSScriptRoot 'Thabat-Library.ps1') + '"'; $sc.WindowStyle = 7 }
          else { $sc.TargetPath = (Join-Path $env:WINDIR 'System32\wscript.exe'); $sc.Arguments = '"' + (Join-Path $PSScriptRoot 'Thabat.vbs') + '"'; $sc.IconLocation = (Join-Path $PSScriptRoot 'Thabat.ico') }
          $sc.WorkingDirectory = $PSScriptRoot; $sc.Save()
        } else { Remove-Item -LiteralPath $lnk -ErrorAction SilentlyContinue }
        Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}'))
      } catch { Send-Response $stream '500 Internal Server Error' 'application/json' ($utf8.GetBytes('{"error":"lnk"}')) }
    } elseif ($path -like '/startupinfo*') {
      $sd = [Environment]::GetFolderPath('Startup')
      $o = @{ ok = $true; lib = (Test-Path -LiteralPath (Join-Path $sd 'Thabat Library.lnk')); app = (Test-Path -LiteralPath (Join-Path $sd 'Thabat.lnk')) }
      Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes(($o | ConvertTo-Json -Compress)))
    } elseif ($path -like '/selfupdate*') {
      # update Thabat from its official releases only (github.com/jake750/Thabat); the address is fixed here,
      # so a request can never point the helper anywhere else. Program files are replaced (old ones kept as .bak);
      # your data, the adhan files and the mushaf/tafsir folders are not touched.
      try { $o = Run-SelfUpdate
        Send-Response $stream '200 OK' 'application/json; charset=utf-8' ($utf8.GetBytes(($o | ConvertTo-Json -Compress)))
      } catch { Send-Response $stream '502 Bad Gateway' 'application/json' ($utf8.GetBytes('{"error":"update"}')) }
    } elseif ($path -match '^/updcfg(\?m=(notify|auto|off))?$') {
      $c = Upd-Cfg; if ($matches[2]) { $c.mode = $matches[2]; Upd-Save $c }
      Send-Response $stream '200 OK' 'application/json; charset=utf-8' ($utf8.GetBytes((@{ mode = $c.mode } | ConvertTo-Json -Compress)))
    } elseif ($path -like '/ping*') {
      Send-Response $stream '200 OK' 'application/json; charset=utf-8' ($utf8.GetBytes('{"ok":true,"v":1}'))
    } elseif ($path -like '/fg*') {
      $o = @{ p = ''; t = ''; i = 0 }
      try {
        $h = [ThabatFg]::GetForegroundWindow()
        $procId = [uint32]0
        [void][ThabatFg]::GetWindowThreadProcessId($h, [ref]$procId)
        $sb = New-Object System.Text.StringBuilder 512
        [void][ThabatFg]::GetWindowText($h, $sb, 512)
        $pr = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($pr) { $o.p = $pr.ProcessName }
        $o.t = $sb.ToString()
        $o.i = [ThabatFg]::IdleSeconds()
      } catch {}
      Send-Response $stream '200 OK' 'application/json; charset=utf-8' ($utf8.GetBytes(($o | ConvertTo-Json -Compress)))
    } elseif ($path -like '/alive*') {
      $global:alive = Get-Date
      Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}'))
    } elseif ($path -match '^/sched\?d=(.*)$') {
      # the next prayer times and reminders, so Windows can notify while the app is closed
      $global:alive = Get-Date
      try {
        $d = $matches[1].Replace('-', '+').Replace('_', '/')
        if ($d.Length -eq 0) { $global:sched = @() }
        else {
          while ($d.Length % 4) { $d += '=' }
          $o = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($d)) | ConvertFrom-Json
          $L = @(); foreach ($x in $o.items) { $L += ,@([int64]$x[0], [string]$x[1], [string]$x[2], [int]$x[3]) }
          $global:sched = $L
          try { $sd = Join-Path $env:LOCALAPPDATA 'Thabat'; New-Item -ItemType Directory -Force -Path $sd | Out-Null; [IO.File]::WriteAllText((Join-Path $sd 'sched.json'), ($o | ConvertTo-Json -Depth 5 -Compress), [Text.Encoding]::UTF8) } catch {}
          if ($o.adhan -match '^[a-z_]+\.mp3$') { $global:adhanFile = $o.adhan }
          if ($o.vol) { $global:adhanVol = [int]$o.vol }
        }
        Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}'))
      } catch { Send-Response $stream '400 Bad Request' 'application/json' ($utf8.GetBytes('{"error":"bad"}')) }
    } elseif ($path -match '^/ics\?u=(.+)$') {
      # read-only calendar subscription (an .ics address you entered)
      $url = [Uri]::UnescapeDataString($matches[1])
      if ($url -match '^https://[A-Za-z0-9\.\-]+/[A-Za-z0-9_\-\./\?=&%@:+]+$') {
        try {
          $wc = New-Object System.Net.WebClient
          $wc.Headers.Add('User-Agent', 'Thabat/1.0')
          $data = $wc.DownloadData($url)
          Send-Response $stream '200 OK' 'text/calendar; charset=utf-8' $data
        } catch { Send-Response $stream '502 Bad Gateway' 'application/json' ($utf8.GetBytes('{"error":"fetch"}')) }
      } else { Send-Response $stream '403 Forbidden' 'application/json' ($utf8.GetBytes('{"error":"forbidden"}')) }
    } elseif ($path -match '^/open\?p=(.+)$') {
      # open a project folder in Explorer (folders only)
      $p = [Uri]::UnescapeDataString($matches[1])
      if (Test-Path -LiteralPath $p -PathType Container) { Start-Process explorer.exe -ArgumentList ('"' + $p + '"'); Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}')) }
      else { Send-Response $stream '404 Not Found' 'application/json' ($utf8.GetBytes('{"error":"nofolder"}')) }
    } elseif ($path -like '/ytsetup*') {
      # one-time download (or update) of yt-dlp, an open-source downloader, into %LOCALAPPDATA%\Thabat
      $dir = Join-Path $env:LOCALAPPDATA 'Thabat'
      New-Item -ItemType Directory -Force -Path $dir | Out-Null
      $exe = Join-Path $dir 'yt-dlp.exe'
      try {
        if ((Test-Path $exe) -and ($path -like '*update=1*')) { & $exe -U 2>$null | Out-Null }
        if (-not (Test-Path $exe)) {
          $wc = New-Object System.Net.WebClient
          $wc.Headers.Add('User-Agent', 'Thabat/1.0')
          $wc.DownloadFile('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', $exe)
        }
        Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}'))
      } catch {
        Send-Response $stream '502 Bad Gateway' 'application/json' ($utf8.GetBytes('{"error":"setup"}'))
      }
    } elseif ($path -match '^/ytjob\?(u=.+)$') {
      # 3.81: start one download in the background; the app asks /ytjob/state, then /ytjob/get
      # 3.87: with r=<library root index>&d=<folder name>[&n=<number>] it is a video saved into that library folder (nothing is sent back)
      $qp = @{}; foreach ($kv in ($matches[1] -split '&')) { $ix = $kv.IndexOf('='); if ($ix -gt 0) { $qp[$kv.Substring(0, $ix)] = [Uri]::UnescapeDataString($kv.Substring($ix + 1)) } }
      $url = [string]$qp['u']; $exe = Join-Path (Join-Path $env:LOCALAPPDATA 'Thabat') 'yt-dlp.exe'; $vdir = $null; $pre = ''
      if ($qp.ContainsKey('r')) { $vdir = Yt-VDir $qp['r'] $qp['d']; $nn = 0; if ([int]::TryParse([string]$qp['n'], [ref]$nn) -and $nn -gt 0 -and $nn -lt 10000) { $pre = $nn.ToString('000') + ' - ' } }
      if (-not (Yt-UrlOk $url)) { Send-Response $stream '403 Forbidden' 'application/json' ($utf8.GetBytes('{"error":"forbidden"}')) }
      elseif ($qp.ContainsKey('r') -and -not $vdir) { Send-Response $stream '404 Not Found' 'application/json' ($utf8.GetBytes('{"error":"dir"}')) }
      elseif (-not (Test-Path $exe)) { Send-Response $stream '428 Precondition Required' 'application/json' ($utf8.GetBytes('{"error":"setup"}')) }
      elseif ($global:ytjobs.Count -ge 3) { Send-Response $stream '429 Too Many Requests' 'application/json' ($utf8.GetBytes('{"error":"busy"}')) }
      else { $jid = Yt-Start $url $vdir $pre; Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true,"id":"' + $jid + '"}')) }
    } elseif ($path -match '^/ytjob/(state|get|cancel)\?id=([0-9a-f]{32})$') {
      $act = $matches[1]; $jid = $matches[2]
      if ($act -eq 'cancel') { Yt-Clean $jid; Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}')) }
      else {
        $st = Yt-State $jid
        if ($act -eq 'state') { $o = @{ ok = $true; s = $st.s }; if ($st.p) { $o.p = $st.p }; if ($st.why) { $o.why = $st.why; $o.msg = $st.msg }; Send-Response $stream '200 OK' 'application/json; charset=utf-8' ($utf8.GetBytes(($o | ConvertTo-Json -Compress))) }
        elseif ($st.s -eq 'ok') {
          $file = $st.file; $bytes = [IO.File]::ReadAllBytes($file); $ext = [IO.Path]::GetExtension($file).TrimStart('.').ToLower()
          $type = 'audio/mpeg'; if ($ext -eq 'm4a' -or $ext -eq 'mp4') { $type = 'audio/mp4' } elseif ($ext -eq 'webm') { $type = 'audio/webm' } elseif ($ext -eq 'opus' -or $ext -eq 'ogg') { $type = 'audio/ogg' }
          $meta = [Convert]::ToBase64String($utf8.GetBytes((@{ title = $st.title; uploader = $st.uploader; duration = $st.duration; ext = $ext } | ConvertTo-Json -Compress)))
          Send-ResponseMeta $stream $type $bytes $meta; Remove-Item -LiteralPath $file -ErrorAction SilentlyContinue; Yt-Clean $jid
        } else { Send-Response $stream '409 Conflict' 'application/json' ($utf8.GetBytes('{"error":"notready"}')) }
      }
    } elseif ($path -match '^/ytlist\?u=(.+)$') {
      # the contents of a playlist (SoundCloud set or YouTube list) without downloading anything: title, and each item's address, name and length
      $url = [Uri]::UnescapeDataString($matches[1])
      $exe = Join-Path (Join-Path $env:LOCALAPPDATA 'Thabat') 'yt-dlp.exe'
      if (-not (Yt-UrlOk $url)) {
        Send-Response $stream '403 Forbidden' 'application/json' ($utf8.GetBytes('{"error":"forbidden"}'))
      } elseif (-not (Test-Path $exe)) {
        Send-Response $stream '428 Precondition Required' 'application/json' ($utf8.GetBytes('{"error":"setup"}'))
      } else {
        $info = Join-Path $env:TEMP ('thabat_list_' + [Guid]::NewGuid().ToString('N') + '.txt')
        try { & $exe '--flat-playlist' '--simulate' '--no-warnings' '--playlist-end' '500' '--print-to-file' '%(playlist_title)s|||%(url)s|||%(title)s|||%(duration)s' $info $url 2>$null | Out-Null } catch {}
        $items = @(); $ptitle = ''
        if (Test-Path $info) {
          foreach ($ln in (Get-Content -LiteralPath $info -Encoding UTF8)) {
            $p = $ln -split '\|\|\|'
            if ($p.Count -ge 4 -and $p[1] -match '^https://') { if (-not $ptitle -and $p[0] -ne 'NA') { $ptitle = $p[0] }; $d = 0; [void][double]::TryParse($p[3], [ref]$d); $items += ,@{ u = $p[1]; t = $(if ($p[2] -ne 'NA') { $p[2] } else { '' }); d = [int]$d } }
          }
          Remove-Item -LiteralPath $info -ErrorAction SilentlyContinue
        }
        $need = @($items | Where-Object { $_.u -match '^https://api(-v2)?\.soundcloud\.com/tracks/\d+$' -or (-not $_.t -and $_.u -match '^https://soundcloud\.com/') } | Select-Object -First 300)
        if ($need.Count) {
          $info2 = Join-Path $env:TEMP ('thabat_list2_' + [Guid]::NewGuid().ToString('N') + '.txt')
          try { & $exe '--simulate' '--no-warnings' '--ignore-errors' '--print-to-file' '%(original_url)s|||%(webpage_url)s|||%(title)s|||%(duration)s' $info2 @($need | ForEach-Object { $_.u }) 2>$null | Out-Null } catch {}
          if (Test-Path $info2) {
            $map = @{}; foreach ($ln in (Get-Content -LiteralPath $info2 -Encoding UTF8)) { $p = $ln -split '\|\|\|'; if ($p.Count -ge 4) { $map[$p[0]] = $p } }
            foreach ($it in $items) { $m = $map[$it.u]; if ($m) { if ($m[1] -match '^https://soundcloud\.com/') { $it.u = $m[1] }; if ($m[2] -ne 'NA') { $it.t = $m[2] }; $d = 0; [void][double]::TryParse($m[3], [ref]$d); if ($d) { $it.d = [int]$d } } }
            Remove-Item -LiteralPath $info2 -ErrorAction SilentlyContinue
          }
        }
        if ($items.Count -eq 0) { Send-Response $stream '502 Bad Gateway' 'application/json' ($utf8.GetBytes('{"error":"list"}')) }
        else { Send-Response $stream '200 OK' 'application/json; charset=utf-8' ($utf8.GetBytes((@{ ok = $true; title = $ptitle; items = $items } | ConvertTo-Json -Depth 4 -Compress))) }
      }
    } elseif ($path -match '^/yt\?u=(.+)$') {
      # download the audio of one YouTube / SoundCloud link (only those sites)
      $url = [Uri]::UnescapeDataString($matches[1])
      $exe = Join-Path (Join-Path $env:LOCALAPPDATA 'Thabat') 'yt-dlp.exe'
      if (-not (Yt-UrlOk $url)) {
        Send-Response $stream '403 Forbidden' 'application/json' ($utf8.GetBytes('{"error":"forbidden"}'))
      } elseif (-not (Test-Path $exe)) {
        Send-Response $stream '428 Precondition Required' 'application/json' ($utf8.GetBytes('{"error":"setup"}'))
      } else {
        $tmp = Join-Path $env:TEMP ('thabat_' + [Guid]::NewGuid().ToString('N'))
        $info = "$tmp.txt"
        $a = @('--no-playlist', '--no-progress', '--no-warnings', '--no-simulate', '-f', 'bestaudio[ext=m4a]/bestaudio', '-o', "$tmp.%(ext)s", '--print-to-file', 'after_move:%(title)s|||%(uploader)s|||%(duration)s|||%(filepath)s', $info)
        if (Get-Command ffmpeg -ErrorAction SilentlyContinue) { $a += @('-x', '--audio-format', 'mp3', '--audio-quality', '2') }
        $a += $url
        try { & $exe @a 2>$null | Out-Null } catch {}
        $line = $null
        if (Test-Path $info) { $line = (Get-Content -LiteralPath $info -Encoding UTF8 | Where-Object { $_ -like '*|||*' } | Select-Object -Last 1); Remove-Item -LiteralPath $info -ErrorAction SilentlyContinue }
        $file = $null
        if ($line) { $parts = $line -split '\|\|\|'; $file = $parts[3] }
        if ($file -and (Test-Path -LiteralPath $file)) {
          $bytes = [IO.File]::ReadAllBytes($file)
          Remove-Item -LiteralPath $file -ErrorAction SilentlyContinue
          $ext = [IO.Path]::GetExtension($file).TrimStart('.').ToLower()
          $type = 'audio/mpeg'
          if ($ext -eq 'm4a' -or $ext -eq 'mp4') { $type = 'audio/mp4' } elseif ($ext -eq 'webm') { $type = 'audio/webm' } elseif ($ext -eq 'opus' -or $ext -eq 'ogg') { $type = 'audio/ogg' }
          $m = @{ title = $parts[0]; uploader = $parts[1]; duration = $parts[2]; ext = $ext } | ConvertTo-Json -Compress
          $meta = [Convert]::ToBase64String($utf8.GetBytes($m))
          Send-ResponseMeta $stream $type $bytes $meta
        } else {
          Get-ChildItem -Path "$tmp.*" -ErrorAction SilentlyContinue | Remove-Item -ErrorAction SilentlyContinue
          Send-Response $stream '502 Bad Gateway' 'application/json' ($utf8.GetBytes('{"error":"download"}'))
        }
      }
    } elseif ($path -match '^/mq\?u=(.+)$') {
      $url = [Uri]::UnescapeDataString($matches[1])
      if ($url -match '^https://mawaqit\.net/[A-Za-z0-9/_\-\.\?=&%,]*$') {
        try {
          $wc = New-Object System.Net.WebClient
          $wc.Encoding = [Text.Encoding]::UTF8
          $wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Thabat/1.0')
          $wc.Headers.Add('Accept-Language', 'ar,en;q=0.8')
          $data = $wc.DownloadData($url)
          $type = 'text/html; charset=utf-8'
          if ($url -match '/api/') { $type = 'application/json; charset=utf-8' }
          Send-Response $stream '200 OK' $type $data
        } catch {
          Send-Response $stream '502 Bad Gateway' 'application/json' ($utf8.GetBytes('{"error":"fetch"}'))
        }
      } else {
        Send-Response $stream '403 Forbidden' 'application/json' ($utf8.GetBytes('{"error":"forbidden"}'))
      }
    } elseif ($path -match '^/au\?u=(.+)$') {
      $url = [Uri]::UnescapeDataString($matches[1])
      if ($url -match '^https://everyayah\.com/data/[A-Za-z0-9_/\-\.]+\.mp3$') {
        try {
          $wc = New-Object System.Net.WebClient
          $wc.Headers.Add('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Thabat/1.0')
          $data = $wc.DownloadData($url)
          Send-Response $stream '200 OK' 'audio/mpeg' $data
        } catch {
          Send-Response $stream '502 Bad Gateway' 'application/json' ($utf8.GetBytes('{"error":"fetch"}'))
        }
      } else {
        Send-Response $stream '403 Forbidden' 'application/json' ($utf8.GetBytes('{"error":"forbidden"}'))
      }
    } else {
      Send-Response $stream '404 Not Found' 'application/json' ($utf8.GetBytes('{}'))
    }
  } catch {} finally { $client.Close() }
  if ($global:restart) { break }
}
Lan-Close
if ($global:tray) { try { $global:tray.Visible = $false; $global:tray.Dispose() } catch {} }
$listener.Stop()
# after an update that changed this file: start the new helper (the port is free now)
if ($global:restart) { Start-Process powershell.exe -WindowStyle Hidden -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $PSScriptRoot 'Thabat-Helper.ps1') + '"') }
