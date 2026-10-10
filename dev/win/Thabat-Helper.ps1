# Thabat helper: a tiny local bridge so the app (opened from a file) can read
# public mosque data from mawaqit.net and, if enabled in settings, the name of
# the program in front (active-app detection), and audio of YouTube/SoundCloud
# links you choose to keep (via yt-dlp, fetched once on request). It only listens on this computer
# (127.0.0.1) — except while you use "transfer over the local network" in
# Settings, when it also accepts /lan/ requests with a one-time code for up to
# 15 minutes — only forwards requests to https://mawaqit.net/ (and Quran audio
# from https://everyayah.com/data/ for offline download), and exits by
# itself after 20 minutes without requests. It can also start the video library
# server (Thabat-Library.ps1), show the folder picker for it, and add Thabat or the
# library to the Startup folder when you turn that on in Settings.
$ErrorActionPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
$port = 47813
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
try { $listener.Start() } catch { exit }   # already running
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

while ($true) {
  if ($global:lan -and (Get-Date) -gt $global:lanUntil) { Lan-Close }
  $isLan = $false
  if ($listener.Pending()) { $client = $listener.AcceptTcpClient() }
  elseif ($global:lan -and $global:lan.Pending()) { $client = $global:lan.AcceptTcpClient(); $isLan = $true }
  else {
    Start-Sleep -Milliseconds 150
    if (((Get-Date) - $global:lastTick).TotalSeconds -ge 5) { $global:lastTick = Get-Date; Check-Schedule }
    if (((Get-Date) - $last).TotalMinutes -gt 20 -and $global:sched.Count -eq 0 -and -not $global:lan) { break }
    continue
  }
  $last = Get-Date
  try {
    $client.ReceiveTimeout = 5000
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream, [Text.Encoding]::ASCII)
    $line = $reader.ReadLine()
    while ($true) { $h = $reader.ReadLine(); if ($h -eq $null -or $h -eq '') { break } }
    $parts = "$line" -split ' '
    $method = $parts[0]; $path = $parts[1]
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    if ($method -eq 'OPTIONS') {
      Send-Response $stream '204 No Content' 'text/plain' ([byte[]]@())
    } elseif ($isLan) {
      # requests from the phone on the same network: only /lan/ with the one-time code
      $q = @{}; if ($path -match '\?(.*)$') { foreach ($kv in ($matches[1] -split '&')) { $a = $kv -split '=', 2; if ($a.Count -eq 2) { $q[$a[0]] = $a[1] } } }
      if (-not $global:lanCode -or $q['c'] -ne $global:lanCode) { Send-Response $stream '403 Forbidden' 'application/json' ($utf8.GetBytes('{"error":"code"}')) }
      elseif ($path -like '/lan/info*') { Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"pc":' + $global:blobN.pc + ',"ok":true}')) }
      elseif ($path -like '/lan/get*') { $i = [int]$q['i']; $v = [string]$global:blob.pc[$i]; Send-Response $stream '200 OK' 'text/plain' ($utf8.GetBytes($v)) }
      elseif ($path -like '/lan/put*') { $i = [int]$q['i']; $global:blob.ph[$i] = [string]$q['d']; $global:blobN.ph = [int]$q['n']; $global:lanUntil = (Get-Date).AddMinutes(15); Send-Response $stream '200 OK' 'application/json' ($utf8.GetBytes('{"ok":true}')) }
      else { Send-Response $stream '404 Not Found' 'application/json' ($utf8.GetBytes('{}')) }
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
        $dlg = New-Object System.Windows.Forms.FolderBrowserDialog; $dlg.ShowNewFolderButton = $false
        if ($dlg.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) { $picked = $dlg.SelectedPath }
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
    } elseif ($path -match '^/yt\?u=(.+)$') {
      # download the audio of one YouTube / SoundCloud link (only those sites)
      $url = [Uri]::UnescapeDataString($matches[1])
      $exe = Join-Path (Join-Path $env:LOCALAPPDATA 'Thabat') 'yt-dlp.exe'
      if ($url -notmatch '^https://((www|m|music|on)\.)?(youtube\.com|youtu\.be|soundcloud\.com)/[A-Za-z0-9_\-\./\?=&%:]+$') {
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
}
Lan-Close
$listener.Stop()
