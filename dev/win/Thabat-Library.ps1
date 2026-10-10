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
  param($client, $cfgFile, $thumbDir)
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
    $cfg = [IO.File]::ReadAllText($cfgFile, [Text.Encoding]::UTF8) | ConvertFrom-Json
    $roots = @($cfg.roots)
    if ($route -eq '/ping') { Json @{ ok = $true; v = 1; name = $env:COMPUTERNAME; auth = ($q['t'] -eq $cfg.token) }; return }
    if ($route -eq '/cfg') {
      if (-not $local) { Fail '403 Forbidden' 'local'; return }
      $ips = @([System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object { $_.AddressFamily -eq 'InterNetwork' -and -not $_.ToString().StartsWith('127.') -and -not $_.ToString().StartsWith('169.254.') } | ForEach-Object { $_.ToString() })
      Json @{ ok = $true; token = $cfg.token; port = 47815; roots = $roots; ips = $ips; name = $env:COMPUTERNAME }; return
    }
    if ($route -eq '/roots') {
      if (-not $local) { Fail '403 Forbidden' 'local'; return }
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
    $vid = @('mp4', 'm4v', 'webm', 'mkv', 'mov'); $aud = @('mp3', 'm4a', 'aac', 'ogg', 'opus', 'wav')
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
    if ($route -eq '/open') {
      if (-not $local) { Fail '403 Forbidden' 'local'; return }
      $full = Resolve $q['id']; if (-not $full) { Fail '404 Not Found' 'path'; return }
      if ($q['folder'] -eq '1' -and -not (Test-Path -LiteralPath $full -PathType Container)) { Start-Process explorer.exe -ArgumentList ('/select,"' + $full + '"') } else { Start-Process -FilePath $full }
      Json @{ ok = $true }; return
    }
    if ($route -eq '/f') {
      $full = Resolve $q['id']; if (-not $full -or -not (Test-Path -LiteralPath $full -PathType Leaf)) { Fail '404 Not Found' 'path'; return }
      $fi = New-Object IO.FileInfo $full; $len = $fi.Length; $e = $fi.Extension.TrimStart('.').ToLower()
      $types = @{ mp4 = 'video/mp4'; m4v = 'video/mp4'; mov = 'video/mp4'; webm = 'video/webm'; mkv = 'video/webm'; mp3 = 'audio/mpeg'; m4a = 'audio/mp4'; aac = 'audio/aac'; ogg = 'audio/ogg'; opus = 'audio/ogg'; wav = 'audio/wav'; pdf = 'application/pdf'; png = 'image/png'; jpg = 'image/jpeg'; jpeg = 'image/jpeg'; gif = 'image/gif'; txt = 'text/plain; charset=utf-8'; md = 'text/plain; charset=utf-8' }
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
    [void]$ps.AddScript($handler).AddArgument($c).AddArgument($cfgFile).AddArgument($thumbDir)
    [void]$jobs.Add(@($ps, $ps.BeginInvoke()))
  } else { Start-Sleep -Milliseconds 40 }
  for ($i = $jobs.Count - 1; $i -ge 0; $i--) { if ($jobs[$i][1].IsCompleted) { try { [void]$jobs[$i][0].EndInvoke($jobs[$i][1]) } catch {}; $jobs[$i][0].Dispose(); $jobs.RemoveAt($i) } }
  if (((Get-Date) - $tick).TotalSeconds -ge 2) { $tick = Get-Date; if (Test-Path -LiteralPath $stopFile) { Remove-Item -LiteralPath $stopFile -ErrorAction SilentlyContinue; break } }
}
$listener.Stop(); $pool.Close()
