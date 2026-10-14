# Thabat video library server - created by jake750_
# Serves the folders you chose in Thabat (Settings > Library) to your own devices:
# the phone on the same Wi-Fi, or anywhere through Tailscale. Every request needs
# the secret token Thabat shows you; files outside the chosen folders are never served.
# Port 47815. It stops when %LOCALAPPDATA%\Thabat\library.stop appears.
$ErrorActionPreference = 'SilentlyContinue'
$dir = Join-Path $env:LOCALAPPDATA 'Thabat'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$cfgFile = Join-Path $dir 'library.json'
$thumbDir = Join-Path $dir 'thumbs'
New-Item -ItemType Directory -Force -Path $thumbDir | Out-Null
$stopFile = Join-Path $dir 'library.stop'
$trScript = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'Thabat-Transcribe.ps1'
Remove-Item -LiteralPath $stopFile -ErrorAction SilentlyContinue

# config: a random token on first run, the chosen folders, the port
$cfg = $null
if (Test-Path -LiteralPath $cfgFile) { try { $cfg = [IO.File]::ReadAllText($cfgFile, [Text.Encoding]::UTF8) | ConvertFrom-Json } catch {} }
if (-not $cfg) { $cfg = New-Object PSObject }
if (-not $cfg.token) {
  $b = New-Object byte[] 18; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($b)
  $tok = [Convert]::ToBase64String($b).Replace('+', 'A').Replace('/', 'B').Replace('=', '')
  $cfg | Add-Member -NotePropertyName token -NotePropertyValue $tok -Force
}
if (-not $cfg.roots) { $cfg | Add-Member -NotePropertyName roots -NotePropertyValue @() -Force }
[IO.File]::WriteAllText($cfgFile, ($cfg | ConvertTo-Json -Depth 4 -Compress), (New-Object Text.UTF8Encoding($false)))

$port = 47815
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
try { $listener.Start() } catch { exit }   # already running

$handler = {
  param($client, $cfgFile, $thumbDir, $trScript)
  $ErrorActionPreference = 'SilentlyContinue'
  $utf8 = New-Object Text.UTF8Encoding($false)
  try {
    $client.ReceiveTimeout = 20000; $client.SendTimeout = 120000
    $s = $client.GetStream()
    # read the request head byte by byte (the body, if any, stays in the stream)
    $ms = New-Object IO.MemoryStream; $last4 = 0; $n = 0
    while ($n -lt 16384) { $b = $s.ReadByte(); if ($b -lt 0) { break }; $ms.WriteByte([byte]$b); $n++; $last4 = (($last4 -shl 8) -bor $b) -band 0xFFFFFFFF; if ($last4 -eq 0x0D0A0D0A) { break } }
    $head = [Text.Encoding]::UTF8.GetString($ms.ToArray()) -split "`r`n"
    $req = $head[0] -split ' '; $method = $req[0]; $path = $req[1]
    $hd = @{}; foreach ($l in $head[1..($head.Count - 1)]) { $i = $l.IndexOf(':'); if ($i -gt 0) { $hd[$l.Substring(0, $i).Trim().ToLower()] = $l.Substring($i + 1).Trim() } }
    $q = @{}; $route = $path; if ($path -match '^([^?]*)\?(.*)$') { $route = $matches[1]; foreach ($kv in ($matches[2] -split '&')) { $a = $kv -split '=', 2; if ($a.Count -eq 2) { $q[$a[0]] = [Uri]::UnescapeDataString($a[1].Replace('+', ' ')) } } }
    $remote = $client.Client.RemoteEndPoint.Address
    $local = [System.Net.IPAddress]::IsLoopback($remote)
    $cors = "Access-Control-Allow-Origin: *`r`nAccess-Control-Allow-Private-Network: true`r`nAccess-Control-Allow-Methods: GET, POST, HEAD, OPTIONS`r`nAccess-Control-Allow-Headers: *`r`nAccess-Control-Expose-Headers: Content-Length, Content-Range`r`n"
    function Send($status, $type, [byte[]]$body, $extra) {
      if (-not $body) { $body = [byte[]]@() }
      $h = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`n$cors$extra" + "Cache-Control: no-store`r`nConnection: close`r`n`r`n"
      $hb = [Text.Encoding]::ASCII.GetBytes($h); $s.Write($hb, 0, $hb.Length); if ($method -ne 'HEAD' -and $body.Length) { $s.Write($body, 0, $body.Length) }; $s.Flush()
    }
    function Json($o) { Send '200 OK' 'application/json; charset=utf-8' ($utf8.GetBytes(($o | ConvertTo-Json -Depth 30 -Compress))) '' }
    function Fail($st, $e) { Send $st 'application/json' ($utf8.GetBytes('{"error":"' + $e + '"}')) '' }
    if ($method -eq 'OPTIONS') { Send '204 No Content' 'text/plain' $null ''; return }
    # 3.20: refuse web pages (Thabat runs from a file or the Android app, never from a website)
    if ([string]$hd['origin'] -match '^https?://') { Fail '403 Forbidden' 'origin'; return }
    # the routes that only this PC may use (/cfg, /roots, /open) also need the helper's secret key
    $hkey = ''; try { $hkey = ([IO.File]::ReadAllText((Join-Path (Split-Path $cfgFile) 'helper.key'))).Trim() } catch {}
    $kOk = ($hkey -and $q['k'] -eq $hkey)
    $cfg = [IO.File]::ReadAllText($cfgFile, [Text.Encoding]::UTF8) | ConvertFrom-Json
    $roots = @($cfg.roots)
    if ($route -eq '/ping') { Json @{ ok = $true; v = 1; name = $env:COMPUTERNAME; auth = ($q['t'] -eq $cfg.token) }; return }
    if ($route -eq '/cfg') {
      if (-not $local) { Fail '403 Forbidden' 'local'; return }
      if (-not $kOk) { Fail '401 Unauthorized' 'key'; return }
      $ips = @([System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object { $_.AddressFamily -eq 'InterNetwork' -and -not $_.ToString().StartsWith('127.') -and -not $_.ToString().StartsWith('169.254.') } | ForEach-Object { $_.ToString() })
      Json @{ ok = $true; token = $cfg.token; port = 47815; roots = $roots; ips = $ips; name = $env:COMPUTERNAME }; return
    }
    if ($route -eq '/roots') {
      if (-not $local) { Fail '403 Forbidden' 'local'; return }
      if (-not $kOk) { Fail '401 Unauthorized' 'key'; return }
      $d = $q['d'].Replace('-', '+').Replace('_', '/'); while ($d.Length % 4) { $d += '=' }
      $list = @([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($d)) | ConvertFrom-Json) | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Container) }
      $cfg | Add-Member -NotePropertyName roots -NotePropertyValue @($list) -Force
      [IO.File]::WriteAllText($cfgFile, ($cfg | ConvertTo-Json -Depth 4 -Compress), $utf8)
      Json @{ ok = $true; roots = @($list) }; return
    }
    if ($q['t'] -ne $cfg.token) { Fail '403 Forbidden' 'token'; return }
    function IdOf($ri, $rel) { [Convert]::ToBase64String($utf8.GetBytes("$ri|$rel")).Replace('+', '-').Replace('/', '_').TrimEnd('=') }
    function Resolve($id) {
      try { $d = $id.Replace('-', '+').Replace('_', '/'); while ($d.Length % 4) { $d += '=' }; $x = $utf8.GetString([Convert]::FromBase64String($d)); $p = $x.IndexOf('|'); $ri = [int]$x.Substring(0, $p); $rel = $x.Substring($p + 1)
        $root = [IO.Path]::GetFullPath($roots[$ri]).TrimEnd('\') ; $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
        if ($full -eq $root -or $full.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)) { return $full } } catch {}
      return $null
    }
    $vid = @('mp4', 'm4v', 'webm', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'mpg', 'mpeg', 'ts', 'm2ts', 'mts', '3gp', 'ogv', 'vob', 'f4v', 'asf', 'divx', 'rmvb'); $aud = @('mp3', 'm4a', 'aac', 'ogg', 'opus', 'wav')
    if ($route -eq '/list') {
      $count = 0
      function Walk($ri, $root, $dirPath, $depth) {
        $kids = @()
        $items = Get-ChildItem -LiteralPath $dirPath -Force -ErrorAction SilentlyContinue | Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::Hidden) -and $_.Name -notmatch '^\.' }
        foreach ($it in ($items | Sort-Object Name)) {
          if ($script:count -gt 6000) { break }
          $rel = $it.FullName.Substring($root.Length).TrimStart('\').Replace('\', '/')
          if ($it.PSIsContainer) { if ($depth -lt 6) { $kids += , @{ n = $it.Name; id = (IdOf $ri $rel); k = 'd'; c = @(Walk $ri $root $it.FullName ($depth + 1)) } } }
          else { $script:count++; $e = $it.Extension.TrimStart('.').ToLower(); $k = 'f'; if ($vid -contains $e) { $k = 'v' } elseif ($aud -contains $e) { $k = 'a' }
            $kids += , @{ n = $it.Name; id = (IdOf $ri $rel); k = $k; s = $it.Length; m = [int64]([DateTimeOffset]$it.LastWriteTimeUtc).ToUnixTimeMilliseconds(); th = (Test-Path -LiteralPath (Join-Path $thumbDir ((IdOf $ri $rel) + '.jpg'))) } }
        }
        return $kids
      }
      $out = @(); for ($i = 0; $i -lt $roots.Count; $i++) { $r = [IO.Path]::GetFullPath($roots[$i]).TrimEnd('\'); if (Test-Path -LiteralPath $r) { $out += , @{ n = (Split-Path $r -Leaf); id = (IdOf $i ''); k = 'd'; c = @(Walk $i $r $r 0) } } }
      Json @{ ok = $true; name = $env:COMPUTERNAME; roots = $out }; return
    }
    if ($route -eq '/thumb') {
      $tf = Join-Path $thumbDir (($q['id'] -replace '[^A-Za-z0-9_\-]', '') + '.jpg')
      if ($method -eq 'POST') {
        $len = [int]$hd['content-length']; if ($len -le 0 -or $len -gt 1500000) { Fail '400 Bad Request' 'size'; return }
        $buf = New-Object byte[] $len; $got = 0; while ($got -lt $len) { $r = $s.Read($buf, $got, $len - $got); if ($r -le 0) { break }; $got += $r }
        [IO.File]::WriteAllBytes($tf, $buf); Json @{ ok = $true }; return
      }
      if (Test-Path -LiteralPath $tf) { Send '200 OK' 'image/jpeg' ([IO.File]::ReadAllBytes($tf)) "Cache-Control: max-age=86400`r`n" } else { Fail '404 Not Found' 'none' }; return
    }
    # 3.24: lesson transcription (whisper.cpp through Thabat-Transcribe.ps1, one lesson at a time); the text stays on this PC in tr\
    if ($route -like '/tr/*') {
      $base = Split-Path $cfgFile; $trDir = Join-Path $base 'tr'; New-Item -ItemType Directory -Force -Path $trDir | Out-Null
      $wd = Join-Path $base 'whisper'
      $inst = @{ exe = (Test-Path -LiteralPath (Join-Path $wd 'Release\whisper-cli.exe')); small = (Test-Path -LiteralPath (Join-Path $wd 'models\ggml-small.bin')); medium = (Test-Path -LiteralPath (Join-Path $wd 'models\ggml-medium-q5_0.bin')); ff = [bool](Get-Command ffmpeg -ErrorAction SilentlyContinue) }
      $qf = Join-Path $trDir 'queue.txt'
      $TQ = @(); if (Test-Path -LiteralPath $qf) { $TQ = @([IO.File]::ReadAllLines($qf, $utf8) | Where-Object { $_ -match '\|' }) }
      $sid = ([string]$q['id']) -replace '[^A-Za-z0-9_\-]', ''
      $pf = Join-Path $trDir 'worker.pid'; $alive = $false
      if (Test-Path -LiteralPath $pf) { $o = [int](Get-Content -LiteralPath $pf); if ($o -and (Get-Process -Id $o -ErrorAction SilentlyContinue)) { $alive = $true } }
      if ($route -eq '/tr/state') {
        $out = @{}
        foreach ($i in @(([string]$q['ids']) -split ',')) { $i = $i -replace '[^A-Za-z0-9_\-]', ''; if (-not $i) { continue }
          $o = @{ done = (Test-Path -LiteralPath (Join-Path $trDir "$i.json")); pos = -1 }
          $stf = Join-Path $trDir "$i.st"; if (Test-Path -LiteralPath $stf) { try { $o.st = [IO.File]::ReadAllText($stf) | ConvertFrom-Json } catch {} }
          for ($k = 0; $k -lt $TQ.Count; $k++) { if (($TQ[$k] -split '\|', 2)[0] -eq $i) { $o.pos = $k; break } }
          $out[$i] = $o }
        $ist = $null; $isf = Join-Path $trDir 'install.st'; if (Test-Path -LiteralPath $isf) { try { $ist = [IO.File]::ReadAllText($isf) | ConvertFrom-Json } catch {} }
        Json @{ ok = $true; inst = $inst; install = $ist; items = $out; queue = $TQ.Count; busy = $alive }; return
      }
      if ($route -eq '/tr/get') { $f = Join-Path $trDir "$sid.json"; if ($sid -and (Test-Path -LiteralPath $f)) { Send '200 OK' 'application/json; charset=utf-8' ([IO.File]::ReadAllBytes($f)) '' } else { Fail '404 Not Found' 'none' }; return }
      if ($route -eq '/tr/start') {
        $m = [string]$q['m']; if ($m -ne 'medium') { $m = 'small' }; $l = [string]$q['l']; if ($l -notmatch '^(auto|ar|en|fr)$') { $l = 'auto' }
        $add = @()
        foreach ($i in @(([string]$q['ids']) -split ',')) { $i = $i -replace '[^A-Za-z0-9_\-]', ''; if (-not $i) { continue }
          $full = Resolve $i; if (-not $full -or -not (Test-Path -LiteralPath $full -PathType Leaf)) { continue }
          if (@($TQ | Where-Object { ($_ -split '\|', 2)[0] -eq $i }).Count) { continue }
          $add += "$i|$m|$l|$full"; [IO.File]::WriteAllText((Join-Path $trDir "$i.st"), '{"s":"wait","p":0}', $utf8) }
        if ($add.Count) { [IO.File]::AppendAllLines($qf, [string[]]$add, $utf8) }
        if (-not $alive -and $inst.exe -and $inst.ff -and ($inst.small -or $inst.medium) -and (Test-Path -LiteralPath $trScript)) { Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$trScript`"", '-Dir', "`"$base`"") }
        Json @{ ok = $true; added = $add.Count; inst = $inst }; return
      }
      if ($route -eq '/tr/cancel') {
        if ($sid) {
          if ($alive -and $TQ.Count -and ($TQ[0] -split '\|', 2)[0] -eq $sid) { [IO.File]::WriteAllText((Join-Path $trDir "$sid.cancel"), '1', $utf8) }
          else { [IO.File]::WriteAllLines($qf, [string[]]@($TQ | Where-Object { ($_ -split '\|', 2)[0] -ne $sid }), $utf8); Remove-Item -LiteralPath (Join-Path $trDir "$sid.st") -ErrorAction SilentlyContinue }
        }
        Json @{ ok = $true }; return
      }
      if ($route -eq '/tr/del') { if ($sid) { Remove-Item -LiteralPath (Join-Path $trDir "$sid.json"), (Join-Path $trDir "$sid.st") -ErrorAction SilentlyContinue }; Json @{ ok = $true }; return }
      if ($route -eq '/tr/install') {
        if (-not $local) { Fail '403 Forbidden' 'local'; return }
        if (-not $kOk) { Fail '401 Unauthorized' 'key'; return }
        $m = [string]$q['m']; if ($m -ne 'medium') { $m = 'small' }
        [IO.File]::WriteAllText((Join-Path $trDir 'install.st'), '{"s":"run","w":"start"}', $utf8)
        Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$trScript`"", '-Dir', "`"$base`"", '-Install', '-Model', $m)
        Json @{ ok = $true }; return
      }
      if ($route -eq '/tr/search') {
        # words are compared without diacritics, tatweel, or the different alef / taa marbuta / alef maqsura forms
        $A = [string][char]0x0627
        function Nrm([string]$x) { $x = [regex]::Replace($x, '[ً-ٰٟـ]', ''); $x = [regex]::Replace($x, '[آأإٱ]', $A); $x = $x.Replace([string][char]0x0629, [string][char]0x0647).Replace([string][char]0x0649, [string][char]0x064A); return $x.ToLowerInvariant() }
        $needle = Nrm ([string]$q['q']); $hits = @()
        if ($needle.Length -ge 2) {
          foreach ($f in (Get-ChildItem -LiteralPath $trDir -Filter '*.json' | Sort-Object LastWriteTime -Descending)) {
            if ($hits.Count -ge 80) { break }
            try { $j = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8) | ConvertFrom-Json } catch { continue }
            $n = 0; foreach ($sg in $j.segs) { if ((Nrm ([string]$sg[2])).Contains($needle)) { $hits += , @{ id = $j.id; f = $sg[0]; x = $sg[2] }; $n++; if ($n -ge 6 -or $hits.Count -ge 80) { break } } }
          }
        }
        Json @{ ok = $true; hits = @($hits) }; return
      }
      Fail '404 Not Found' 'route'; return
    }
    # 3.25: reading the text of scanned book pages (Tesseract with Arabic data); the page image is sent, the text comes back, nothing is kept here
    if ($route -like '/ocr*') {
      $base = Split-Path $cfgFile; $la = Split-Path $base
      $tx = $null
      foreach ($c in @((Join-Path $la 'Programs\Tesseract-OCR\tesseract.exe'), 'C:\Program Files\Tesseract-OCR\tesseract.exe', 'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe')) { if (-not $tx -and (Test-Path -LiteralPath $c)) { $tx = $c } }
      if (-not $tx) { $g = Get-Command tesseract -ErrorAction SilentlyContinue; if ($g) { $tx = $g.Source } }
      $langs = @(); if ($tx) { $langs = @(Get-ChildItem -LiteralPath (Join-Path (Split-Path $tx) 'tessdata') -Filter '*.traineddata' -ErrorAction SilentlyContinue | ForEach-Object { $_.BaseName }) }
      if ($route -eq '/ocr/state') {
        $ist = $null; $isf = Join-Path (Join-Path $base 'tr') 'ocrinstall.st'; if (Test-Path -LiteralPath $isf) { try { $ist = [IO.File]::ReadAllText($isf) | ConvertFrom-Json } catch {} }
        Json @{ ok = $true; inst = [bool]$tx; langs = @($langs); install = $ist }; return
      }
      if ($route -eq '/ocr/install') {
        if (-not $local) { Fail '403 Forbidden' 'local'; return }
        if (-not $kOk) { Fail '401 Unauthorized' 'key'; return }
        New-Item -ItemType Directory -Force -Path (Join-Path $base 'tr') | Out-Null
        [IO.File]::WriteAllText((Join-Path (Join-Path $base 'tr') 'ocrinstall.st'), '{"s":"run"}', $utf8)
        Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$trScript`"", '-Dir', "`"$base`"", '-InstallOcr')
        Json @{ ok = $true }; return
      }
      if ($route -eq '/ocr' -and $method -eq 'POST') {
        if (-not $tx) { Fail '428 Precondition Required' 'setup'; return }
        $len = [int]$hd['content-length']; if ($len -le 0 -or $len -gt 15000000) { Fail '400 Bad Request' 'size'; return }
        $buf = New-Object byte[] $len; $got = 0; while ($got -lt $len) { $r = $s.Read($buf, $got, $len - $got); if ($r -le 0) { break }; $got += $r }
        $want = @(([string]$q['l']) -split '\+' | Where-Object { $langs -contains $_ }); if (-not $want.Count) { $want = @(@('ara', 'eng') | Where-Object { $langs -contains $_ }) }; if (-not $want.Count) { $want = @('eng') }
        $tmp = Join-Path $env:TEMP ('thabat_ocr_' + [Guid]::NewGuid().ToString('N'))
        try {
          [IO.File]::WriteAllBytes("$tmp.png", $buf)
          & $tx "$tmp.png" $tmp -l ($want -join '+') --psm 3 2>$null | Out-Null
          $text = ''; if (Test-Path -LiteralPath "$tmp.txt") { $text = [IO.File]::ReadAllText("$tmp.txt", [Text.Encoding]::UTF8) }
          Json @{ ok = $true; text = $text; l = ($want -join '+') }
        } finally { Remove-Item -LiteralPath "$tmp.png", "$tmp.txt" -ErrorAction SilentlyContinue }
        return
      }
      Fail '404 Not Found' 'route'; return
    }
    # 3.29: videos the browser cannot play (AVI, WMV, FLV, MPEG, MKV with HEVC...) are made into an MP4 once with ffmpeg (Thabat-Transcribe.ps1 -Convert) and kept in conv\
    if ($route -like '/cv/*') {
      $cvd = Join-Path (Split-Path $cfgFile) 'conv'; New-Item -ItemType Directory -Force -Path $cvd | Out-Null
      $sid = ([string]$q['id']) -replace '[^A-Za-z0-9_\-]', ''
      if (-not $sid) { Fail '400 Bad Request' 'id'; return }
      # 3.51: lite=1 is a lighter copy for phones (720p at most), kept as conv\<id>-lite.mp4
      $srcId = $sid; $lite = ($q['lite'] -eq '1'); if ($lite) { $sid = "$srcId-lite" }
      $ff = [bool](Get-Command ffmpeg -ErrorAction SilentlyContinue)
      $stf = Join-Path $cvd "$sid.st"; $o = @{ s = 'none'; p = 0 }
      if (Test-Path -LiteralPath (Join-Path $cvd "$sid.mp4")) { $o = @{ s = 'ok'; p = 100 } }
      elseif (Test-Path -LiteralPath $stf) {
        try { $o = [IO.File]::ReadAllText($stf) | ConvertFrom-Json } catch {}
        if ($o.s -eq 'run') { $pidf = Join-Path $cvd "$sid.pid"; $alive = $false; if (Test-Path -LiteralPath $pidf) { $w = [int](Get-Content -LiteralPath $pidf); if ($w -and (Get-Process -Id $w -ErrorAction SilentlyContinue)) { $alive = $true } }
          if (-not $alive -and ((Get-Date) - (Get-Item -LiteralPath $stf).LastWriteTime).TotalSeconds -gt 20) { $o = @{ s = 'err'; p = 0 } } }
      }
      if ($route -eq '/cv/state') { Json @{ ok = $true; ff = $ff; st = $o }; return }
      if ($route -eq '/cv/start') {
        if ($o.s -ne 'ok' -and $o.s -ne 'run') {
          if (-not $ff) { Fail '428 Precondition Required' 'ffmpeg'; return }
          $full = Resolve $srcId; if (-not $full -or -not (Test-Path -LiteralPath $full -PathType Leaf)) { Fail '404 Not Found' 'path'; return }
          [IO.File]::WriteAllText($stf, '{"s":"run","p":0}', $utf8)
          $cargs = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$trScript`"", '-Dir', "`"$(Split-Path $cfgFile)`"", '-Convert', $sid, '-In', "`"$full`""); if ($lite) { $cargs += '-Lite' }
          Start-Process powershell.exe -WindowStyle Hidden -ArgumentList $cargs
          $o = @{ s = 'run'; p = 0 }
        }
        Json @{ ok = $true; ff = $ff; st = $o }; return
      }
      if ($route -eq '/cv/cancel') { [IO.File]::WriteAllText((Join-Path $cvd "$sid.cancel"), '1', $utf8); Json @{ ok = $true }; return }
      Fail '404 Not Found' 'route'; return
    }
    # 3.51: add a file to a library folder — from the phone (110, token, Wi-Fi/Tailscale) or a file dropped on the PC app (146).
    # Only video, audio, PDF and pictures, at most 2 GB, only inside a folder already in the library, never over an existing
    # file (a number is added to the name), written to a hidden .part file first and renamed when complete.
    if ($route -eq '/put') {
      if ($method -ne 'POST') { Fail '405 Method Not Allowed' 'method'; return }
      $dir = $null; $dq = [string]$q['dir']
      if ($dq -match '^r(\d+)$') { $ri = [int]$matches[1]; if ($ri -lt $roots.Count) { $dir = [IO.Path]::GetFullPath($roots[$ri]).TrimEnd('\') } } else { $dir = Resolve $dq }
      if (-not $dir -or -not (Test-Path -LiteralPath $dir -PathType Container)) { Fail '404 Not Found' 'dir'; return }
      $nm = [IO.Path]::GetFileName([string]$q['n']); $nm = ($nm -replace '[\x00-\x1f<>:"/\\|?*]', '_').Trim().TrimStart('.').TrimEnd('.', ' ')
      if ($nm.Length -gt 180) { $ext0 = [IO.Path]::GetExtension($nm); $nm = $nm.Substring(0, 180 - $ext0.Length) + $ext0 }
      $ext = [IO.Path]::GetExtension($nm).TrimStart('.').ToLower()
      $okExt = $vid + $aud + @('pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic')
      if (-not $nm -or -not ($okExt -contains $ext)) { Fail '415 Unsupported Media Type' 'type'; return }
      $len = [int64]0; [void][int64]::TryParse([string]$hd['content-length'], [ref]$len)
      if ($len -le 0 -or $len -gt 2147483648) { Fail '413 Payload Too Large' 'size'; return }
      $base = [IO.Path]::GetFileNameWithoutExtension($nm); $dst = Join-Path $dir $nm; $k = 2
      while ((Test-Path -LiteralPath $dst) -and $k -lt 1000) { $dst = Join-Path $dir ("$base ($k).$ext"); $k++ }
      $part = Join-Path $dir ('.thabat-upload-' + [Guid]::NewGuid().ToString('N') + '.part')
      $client.ReceiveTimeout = 60000
      $fs = [IO.File]::Open($part, 'CreateNew', 'Write', 'None'); $got = [int64]0
      try { $buf = New-Object byte[] 262144
        while ($got -lt $len) { $r = $s.Read($buf, 0, [int][Math]::Min($buf.Length, $len - $got)); if ($r -le 0) { break }; $fs.Write($buf, 0, $r); $got += $r }
      } finally { $fs.Close() }
      if ($got -ne $len) { Remove-Item -LiteralPath $part -ErrorAction SilentlyContinue; Fail '400 Bad Request' 'short'; return }
      if (Test-Path -LiteralPath $dst) { Remove-Item -LiteralPath $part -ErrorAction SilentlyContinue; Fail '409 Conflict' 'exists'; return }
      Move-Item -LiteralPath $part -Destination $dst
      $ri = -1; for ($i = 0; $i -lt $roots.Count; $i++) { $rt = [IO.Path]::GetFullPath($roots[$i]).TrimEnd('\'); if ($dst.StartsWith($rt + '\', [StringComparison]::OrdinalIgnoreCase)) { $ri = $i; $rel = $dst.Substring($rt.Length + 1); break } }
      Json @{ ok = $true; n = [IO.Path]::GetFileName($dst); id = $(if ($ri -ge 0) { IdOf $ri $rel } else { '' }); size = $got }; return
    }
    if ($route -eq '/open') {
      if (-not $local) { Fail '403 Forbidden' 'local'; return }
      if (-not $kOk) { Fail '401 Unauthorized' 'key'; return }
      $full = Resolve $q['id']; if (-not $full) { Fail '404 Not Found' 'path'; return }
      if ($q['folder'] -eq '1' -and -not (Test-Path -LiteralPath $full -PathType Container)) { Start-Process explorer.exe -ArgumentList ('/select,"' + $full + '"') } else { Start-Process -FilePath $full }
      Json @{ ok = $true }; return
    }
    if ($route -eq '/f') {
      if ($q['cv'] -eq '1') { $full = Join-Path (Join-Path (Split-Path $cfgFile) 'conv') ((([string]$q['id']) -replace '[^A-Za-z0-9_\-]', '') + '.mp4') } else { $full = Resolve $q['id'] }
      if (-not $full -or -not (Test-Path -LiteralPath $full -PathType Leaf)) { Fail '404 Not Found' 'path'; return }
      $fi = New-Object IO.FileInfo $full; $len = $fi.Length; $e = $fi.Extension.TrimStart('.').ToLower()
      $types = @{ mp4 = 'video/mp4'; m4v = 'video/mp4'; mov = 'video/mp4'; webm = 'video/webm'; mkv = 'video/webm'; ogv = 'video/ogg'; mp3 = 'audio/mpeg'; m4a = 'audio/mp4'; aac = 'audio/aac'; ogg = 'audio/ogg'; opus = 'audio/ogg'; wav = 'audio/wav'; pdf = 'application/pdf'; png = 'image/png'; jpg = 'image/jpeg'; jpeg = 'image/jpeg'; gif = 'image/gif'; txt = 'text/plain; charset=utf-8'; md = 'text/plain; charset=utf-8' }
      $type = $types[$e]; if (-not $type) { $type = 'application/octet-stream' }
      $start = [int64]0; $end = [int64]($len - 1); $status = '200 OK'; $extra = "Accept-Ranges: bytes`r`n"
      if ($hd['range'] -match 'bytes=(\d*)-(\d*)') {
        if ($matches[1] -ne '') { $start = [int64]$matches[1]; if ($matches[2] -ne '') { $end = [int64]$matches[2] } }
        elseif ($matches[2] -ne '') { $start = [Math]::Max([int64]0, $len - [int64]$matches[2]) }
        if ($end -ge $len) { $end = $len - 1 }
        if ($start -gt $end) { Send '416 Range Not Satisfiable' 'text/plain' $null "Content-Range: bytes */$len`r`n"; return }
        $status = '206 Partial Content'; $extra += "Content-Range: bytes $start-$end/$len`r`n"
      }
      if ($q['dl'] -eq '1') { $extra += "Content-Disposition: attachment; filename*=UTF-8''" + [Uri]::EscapeDataString($fi.Name) + "`r`n" }
      $count = $end - $start + 1
      $h = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $count`r`n$cors$extra" + "Cache-Control: private, max-age=600`r`nConnection: close`r`n`r`n"
      $hb = [Text.Encoding]::ASCII.GetBytes($h); $s.Write($hb, 0, $hb.Length)
      if ($method -ne 'HEAD') {
        $fs = [IO.File]::Open($full, 'Open', 'Read', 'ReadWrite'); try { [void]$fs.Seek($start, 'Begin'); $buf = New-Object byte[] 262144; $left = $count
          while ($left -gt 0) { $r = $fs.Read($buf, 0, [int][Math]::Min($buf.Length, $left)); if ($r -le 0) { break }; $s.Write($buf, 0, $r); $left -= $r } } finally { $fs.Close() }
      }
      $s.Flush(); return
    }
    Fail '404 Not Found' 'route'
  } catch {} finally { try { $client.Close() } catch {} }
}

$pool = [runspacefactory]::CreateRunspacePool(1, 12); $pool.Open()
$jobs = New-Object System.Collections.ArrayList
$tick = Get-Date
while ($true) {
  if ($listener.Pending()) {
    $c = $listener.AcceptTcpClient()
    $ps = [powershell]::Create(); $ps.RunspacePool = $pool
    [void]$ps.AddScript($handler).AddArgument($c).AddArgument($cfgFile).AddArgument($thumbDir).AddArgument($trScript)
    [void]$jobs.Add(@($ps, $ps.BeginInvoke()))
  } else { Start-Sleep -Milliseconds 40 }
  for ($i = $jobs.Count - 1; $i -ge 0; $i--) { if ($jobs[$i][1].IsCompleted) { try { [void]$jobs[$i][0].EndInvoke($jobs[$i][1]) } catch {}; $jobs[$i][0].Dispose(); $jobs.RemoveAt($i) } }
  if (((Get-Date) - $tick).TotalSeconds -ge 2) { $tick = Get-Date; if (Test-Path -LiteralPath $stopFile) { Remove-Item -LiteralPath $stopFile -ErrorAction SilentlyContinue; break } }
}
$listener.Stop(); $pool.Close()
