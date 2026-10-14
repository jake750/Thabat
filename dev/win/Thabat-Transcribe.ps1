# Thabat lesson transcription - created by jake750_
# Started by the library server (Thabat-Library.ps1). Works through %LOCALAPPDATA%\Thabat\tr\queue.txt one lesson at a time:
# the sound is taken out with ffmpeg, whisper.cpp writes the text with its times, and the result is kept as tr\<id>.json.
# With -Install it downloads whisper.cpp (official GitHub release) and the chosen speech model instead.
param([string]$Dir, [switch]$Install, [switch]$InstallOcr, [string]$Model = 'small', [string]$Convert, [string]$In, [switch]$Lite)
$ErrorActionPreference = 'SilentlyContinue'
if (-not $Dir) { $Dir = Join-Path $env:LOCALAPPDATA 'Thabat' }
$tr = Join-Path $Dir 'tr'; New-Item -ItemType Directory -Force -Path $tr | Out-Null
$wdir = Join-Path $Dir 'whisper'; New-Item -ItemType Directory -Force -Path (Join-Path $wdir 'models') | Out-Null
$exe = Join-Path $wdir 'Release\whisper-cli.exe'
$models = @{ small = 'ggml-small.bin'; medium = 'ggml-medium-q5_0.bin' }
$utf8 = New-Object Text.UTF8Encoding($false)
function Put($file, $obj) { [IO.File]::WriteAllText($file, ($obj | ConvertTo-Json -Compress -Depth 6), $utf8) }

if ($Convert) {
  # 3.29: a video in a format the browser cannot play made into an MP4 once (h264 and aac/mp3 are copied, which is quick; anything else is re-encoded), kept in conv\<id>.mp4
  $cv = Join-Path $Dir 'conv'; New-Item -ItemType Directory -Force -Path $cv | Out-Null
  $id = $Convert -replace '[^A-Za-z0-9_\-]', ''; $st = Join-Path $cv "$id.st"; $part = Join-Path $cv "$id.part.mp4"; $out = Join-Path $cv "$id.mp4"; $prog = Join-Path $cv "$id.prog"; $pidf = Join-Path $cv "$id.pid"
  [IO.File]::WriteAllText($pidf, [string]$PID, $utf8)
  try {
    # conversions not watched for 60 days are removed, and the oldest ones while the folder is over 30 GB
    Get-ChildItem -LiteralPath $cv -Filter '*.mp4' | Where-Object { $_.LastAccessTime -lt (Get-Date).AddDays(-60) } | Remove-Item -ErrorAction SilentlyContinue
    $all = @(Get-ChildItem -LiteralPath $cv -Filter '*.mp4' | Sort-Object LastWriteTime); $sum = [double](($all | Measure-Object Length -Sum).Sum)
    foreach ($f in $all) { if ($sum -le 30GB) { break }; $sum -= $f.Length; Remove-Item -LiteralPath $f.FullName -ErrorAction SilentlyContinue }
    Put $st @{ s = 'run'; p = 0 }
    $info = $null; try { $info = (& ffprobe -v error -show_entries 'stream=codec_type,codec_name:format=duration' -of json "$In" 2>$null | Out-String) | ConvertFrom-Json } catch {}
    $dur = 0; $vc = ''; $ac = ''
    if ($info) { $dur = [double]$info.format.duration; $vs = @($info.streams | Where-Object { $_.codec_type -eq 'video' }); $as = @($info.streams | Where-Object { $_.codec_type -eq 'audio' }); if ($vs.Count) { $vc = [string]$vs[0].codec_name }; if ($as.Count) { $ac = [string]$as[0].codec_name } }
    $fa = @('-y', '-hide_banner', '-loglevel', 'error', '-i', $In, '-map', '0:v:0?', '-map', '0:a:0?', '-sn', '-dn')
    if ($Lite) {
      # 3.51: a lighter copy for the phone: at most 720 lines high, smaller bitrate, stereo AAC 96k
      $fa += @('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-vf', "scale=-2:'min(720,trunc(ih/2)*2)'", '-c:a', 'aac', '-b:a', '96k', '-ac', '2')
    } else {
    if ($vc -eq 'h264') { $fa += @('-c:v', 'copy') } else { $fa += @('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2') }
    if ($ac -eq 'aac' -or $ac -eq 'mp3') { $fa += @('-c:a', 'copy') } else { $fa += @('-c:a', 'aac', '-b:a', '160k', '-ac', '2') }
    }
    $fa += @('-movflags', '+faststart', '-progress', $prog, '-nostats', $part)
    $p = Start-Process -FilePath 'ffmpeg' -ArgumentList (($fa | ForEach-Object { '"' + $_ + '"' }) -join ' ') -WindowStyle Hidden -PassThru; $null = $p.Handle
    while (-not $p.HasExited) {
      Start-Sleep -Milliseconds 1000
      if (Test-Path -LiteralPath (Join-Path $cv "$id.cancel")) { try { $p.Kill() } catch {}; Start-Sleep -Milliseconds 500; Remove-Item -LiteralPath (Join-Path $cv "$id.cancel"), $part, $st -ErrorAction SilentlyContinue; exit }
      $pc = 0; try { $m = @(Get-Content -LiteralPath $prog -Tail 14 -ErrorAction SilentlyContinue | Where-Object { $_ -match '^out_time_(us|ms)=\d+' }); if ($m.Count -and $dur -gt 0) { $pc = [Math]::Min(99, [Math]::Round(([double]($m[-1].Split('=')[1]) / 1e6) / $dur * 100)) } } catch {}
      Put $st @{ s = 'run'; p = $pc; copy = ($vc -eq 'h264' -and -not $Lite) }
    }
    $p.WaitForExit()
    if ($p.ExitCode -eq 0 -and (Test-Path -LiteralPath $part) -and (Get-Item -LiteralPath $part).Length -gt 1000) { Move-Item -LiteralPath $part -Destination $out -Force; Put $st @{ s = 'ok'; p = 100 } }
    else { Remove-Item -LiteralPath $part -ErrorAction SilentlyContinue; Put $st @{ s = 'err'; p = 0 } }
  } catch { Put $st @{ s = 'err'; p = 0 } } finally { Remove-Item -LiteralPath $prog, $pidf -ErrorAction SilentlyContinue }
  exit
}

if ($InstallOcr) {
  # Tesseract (UB-Mannheim build, official GitHub) installed for this user only, then the Arabic data from tesseract-ocr/tessdata_best
  $st = Join-Path $tr 'ocrinstall.st'
  try {
    Put $st @{ s = 'run'; w = 'tesseract' }
    $la = Split-Path $Dir; $home2 = Join-Path $la 'Programs\Tesseract-OCR'
    if (-not (Test-Path -LiteralPath (Join-Path $home2 'tesseract.exe'))) {
      $rel = Invoke-RestMethod -Uri 'https://api.github.com/repos/UB-Mannheim/tesseract/releases/latest' -Headers @{ 'User-Agent' = 'Thabat' }
      $asset = $rel.assets | Where-Object { $_.name -like 'tesseract-ocr-w64-setup-*.exe' } | Select-Object -First 1
      if (-not $asset) { throw 'asset' }
      $setup = Join-Path $env:TEMP $asset.name
      (New-Object Net.WebClient).DownloadFile($asset.browser_download_url, $setup)
      $env:__COMPAT_LAYER = 'RunAsInvoker'
      $p = Start-Process -FilePath $setup -ArgumentList @('/S') -PassThru; [void]$p.WaitForExit(600000)
      $env:__COMPAT_LAYER = $null
      Remove-Item -LiteralPath $setup -ErrorAction SilentlyContinue
    }
    $td = Join-Path $home2 'tessdata'
    if (-not (Test-Path -LiteralPath (Join-Path $td 'ara.traineddata'))) {
      Put $st @{ s = 'run'; w = 'ara' }
      (New-Object Net.WebClient).DownloadFile('https://github.com/tesseract-ocr/tessdata_best/raw/main/ara.traineddata', (Join-Path $td 'ara.traineddata.part'))
      Move-Item -LiteralPath (Join-Path $td 'ara.traineddata.part') -Destination (Join-Path $td 'ara.traineddata') -Force
    }
    if (-not (Test-Path -LiteralPath (Join-Path $home2 'tesseract.exe'))) { throw 'install' }
    Put $st @{ s = 'done' }
  } catch { Put $st @{ s = 'err' } }
  exit
}

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
