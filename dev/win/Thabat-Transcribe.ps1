# Thabat lesson transcription - created by jake750_
# Started by the library server (Thabat-Library.ps1). Works through %LOCALAPPDATA%\Thabat\tr\queue.txt one lesson at a time:
# the sound is taken out with ffmpeg, whisper.cpp writes the text with its times, and the result is kept as tr\<id>.json.
# With -Install it downloads whisper.cpp (official GitHub release) and the chosen speech model instead.
param([string]$Dir, [switch]$Install, [string]$Model = 'small')
$ErrorActionPreference = 'SilentlyContinue'
if (-not $Dir) { $Dir = Join-Path $env:LOCALAPPDATA 'Thabat' }
$tr = Join-Path $Dir 'tr'; New-Item -ItemType Directory -Force -Path $tr | Out-Null
$wdir = Join-Path $Dir 'whisper'; New-Item -ItemType Directory -Force -Path (Join-Path $wdir 'models') | Out-Null
$exe = Join-Path $wdir 'Release\whisper-cli.exe'
$models = @{ small = 'ggml-small.bin'; medium = 'ggml-medium-q5_0.bin' }
$utf8 = New-Object Text.UTF8Encoding($false)
function Put($file, $obj) { [IO.File]::WriteAllText($file, ($obj | ConvertTo-Json -Compress -Depth 6), $utf8) }

if ($Install) {
  $st = Join-Path $tr 'install.st'
  try {
    Put $st @{ s = 'run'; w = 'exe' }
    if (-not (Test-Path -LiteralPath $exe)) {
      $rel = Invoke-RestMethod -Uri 'https://api.github.com/repos/ggml-org/whisper.cpp/releases?per_page=8' -Headers @{ 'User-Agent' = 'Thabat' }
      $asset = $null; foreach ($r in $rel) { foreach ($a in $r.assets) { if (-not $asset -and $a.name -eq 'whisper-blas-bin-x64.zip') { $asset = $a } } }
      if (-not $asset) { throw 'asset' }
      $zip = Join-Path $wdir 'whisper.zip'
      (New-Object Net.WebClient).DownloadFile($asset.browser_download_url, $zip)
      Expand-Archive -Force -LiteralPath $zip -DestinationPath $wdir; Remove-Item -LiteralPath $zip
    }
    if (-not $models.ContainsKey($Model)) { $Model = 'small' }
    $mf = Join-Path $wdir ('models\' + $models[$Model])
    if (-not (Test-Path -LiteralPath $mf)) {
      Put $st @{ s = 'run'; w = $Model }
      $tmp = "$mf.part"
      (New-Object Net.WebClient).DownloadFile('https://huggingface.co/ggerganov/whisper.cpp/resolve/main/' + $models[$Model], $tmp)
      Move-Item -LiteralPath $tmp -Destination $mf -Force
    }
    Put $st @{ s = 'done' }
  } catch { Put $st @{ s = 'err' } }
  exit
}

# one worker at a time
$pidFile = Join-Path $tr 'worker.pid'
if (Test-Path -LiteralPath $pidFile) { $old = [int](Get-Content -LiteralPath $pidFile); if ($old -and (Get-Process -Id $old -ErrorAction SilentlyContinue)) { exit } }
[IO.File]::WriteAllText($pidFile, "$PID")
$queue = Join-Path $tr 'queue.txt'
$ff = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source
$threads = [Math]::Max(2, [Environment]::ProcessorCount - 2)
try {
  while ($true) {
    $lines = @(); if (Test-Path -LiteralPath $queue) { $lines = @([IO.File]::ReadAllLines($queue, $utf8) | Where-Object { $_ -match '\|' }) }
    if ($lines.Count -eq 0) { break }
    $p = $lines[0] -split '\|', 4; $id = $p[0]; $m = $p[1]; $lang = $p[2]; $file = $p[3]
    $st = Join-Path $tr "$id.st"; $cancel = Join-Path $tr "$id.cancel"; Remove-Item -LiteralPath $cancel -ErrorAction SilentlyContinue
    $wav = Join-Path $env:TEMP ("thabat_tr_$id.wav"); $base = Join-Path $env:TEMP ("thabat_tr_$id"); $log = "$base.log"
    $ok = $false
    try {
      if (-not $models.ContainsKey($m)) { $m = 'small' }
      $mf = Join-Path $wdir ('models\' + $models[$m])
      if (-not (Test-Path -LiteralPath $mf)) { $mf = Join-Path $wdir ('models\' + $models['small']); $m = 'small' }
      if (-not $ff -or -not (Test-Path -LiteralPath $exe) -or -not (Test-Path -LiteralPath $mf) -or -not (Test-Path -LiteralPath $file)) { throw 'setup' }
      Put $st @{ s = 'audio'; p = 0 }
      & $ff -y -v error -i $file -vn -ar 16000 -ac 1 -c:a pcm_s16le $wav 2>$null | Out-Null
      if (-not (Test-Path -LiteralPath $wav)) { throw 'audio' }
      Put $st @{ s = 'run'; p = 0; m = $m }
      $wa = @('-m', "`"$mf`"", '-f', "`"$wav`"", '-l', $lang, '-oj', '-of', "`"$base`"", '-t', "$threads", '-pp', '-np')
      $proc = Start-Process -FilePath $exe -ArgumentList $wa -WindowStyle Hidden -PassThru -RedirectStandardError $log -RedirectStandardOutput "$base.out"
      $last = -1
      while (-not $proc.HasExited) {
        Start-Sleep -Seconds 2
        if (Test-Path -LiteralPath $cancel) { try { $proc.Kill() } catch {}; throw 'cancel' }
        try { $fs = [IO.File]::Open($log, 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs); $txt = $sr.ReadToEnd(); $sr.Close() } catch { $txt = '' }
        $mm = [regex]::Matches($txt, 'progress =\s*(\d+)%'); if ($mm.Count) { $pc = [int]$mm[$mm.Count - 1].Groups[1].Value; if ($pc -ne $last) { $last = $pc; Put $st @{ s = 'run'; p = $pc; m = $m } } }
      }
      $jf = "$base.json"
      if (-not (Test-Path -LiteralPath $jf)) { throw 'whisper' }
      $j = [IO.File]::ReadAllText($jf, [Text.Encoding]::UTF8) | ConvertFrom-Json
      $segs = @(); foreach ($x in $j.transcription) { $t = ([string]$x.text).Trim(); if ($t) { $segs += , @([int]$x.offsets.from, [int]$x.offsets.to, $t) } }
      $res = @{ ok = $true; id = $id; model = $m; lang = [string]$j.result.language; at = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()); segs = $segs }
      Put (Join-Path $tr "$id.json") $res
      Put $st @{ s = 'done'; p = 100; m = $m }
      $ok = $true
    } catch {
      $e = "$_"; if ($e -eq 'cancel') { Remove-Item -LiteralPath $st -ErrorAction SilentlyContinue } else { Put $st @{ s = 'err'; e = $e } }
    } finally {
      Remove-Item -LiteralPath $wav, $log, "$base.out", "$base.json", $cancel -ErrorAction SilentlyContinue
    }
    # take this lesson off the queue (the file may have changed meanwhile)
    $now = @(); if (Test-Path -LiteralPath $queue) { $now = @([IO.File]::ReadAllLines($queue, $utf8)) }
    [IO.File]::WriteAllLines($queue, @($now | Where-Object { $_ -and ($_ -split '\|', 2)[0] -ne $id }), $utf8)
  }
} finally { Remove-Item -LiteralPath $pidFile -ErrorAction SilentlyContinue }
