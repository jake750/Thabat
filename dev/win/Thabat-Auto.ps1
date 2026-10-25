# Thabat automation (3.105): lets other programs on this PC add a task or a note to Thabat, or start/stop its timer.
# It talks only to the Thabat helper on this PC (127.0.0.1:47813) with the key in %LOCALAPPDATA%\Thabat\helper.key.
# Thabat picks the command up within a few seconds while it is open, or the next time it opens.
#   Thabat-Auto.ps1 task "Call the client" [-After asr] [-Day 2026-10-25] [-At 14:30]
#   Thabat-Auto.ps1 note "Title" "Text of the note"
#   Thabat-Auto.ps1 timer start [-Cat <category id>]      Thabat-Auto.ps1 timer stop
#   Thabat-Auto.ps1 pdf "C:\path\book.pdf"     Thabat-Auto.ps1 open "thabat://quran/301"   (3.125: «Open with Thabat» and thabat:// links)
param([Parameter(Position = 0)][string]$What, [Parameter(Position = 1)][string]$Text, [Parameter(Position = 2)][string]$Body,
      [string]$After, [string]$Day, [string]$At, [string]$Cat)
$ErrorActionPreference = 'Stop'
function Usage() { Write-Output 'ثبات · Thabat automation'; Write-Output '  Thabat-Auto.ps1 task "text" [-After fajr|dhuhr|asr|maghrib|isha] [-Day YYYY-MM-DD] [-At HH:MM]'; Write-Output '  Thabat-Auto.ps1 note "title" "text"'; Write-Output '  Thabat-Auto.ps1 timer start|stop [-Cat id]'; exit 2 }
if ($What -notmatch '^(task|note|timer|pdf|open)$') { Usage }
$e = { param($s) [Uri]::EscapeDataString([string]$s) }
if ($What -eq 'task') { if (-not $Text) { Usage }; $q = 'text=' + (& $e $Text); if ($After) { $q += '&after=' + (& $e $After.ToLower()) }; if ($Day) { $q += '&day=' + (& $e $Day) }; if ($At) { $q += '&at=' + (& $e $At) } }
elseif ($What -eq 'note') { if (-not $Text -and -not $Body) { Usage }; $q = 'title=' + (& $e $Text) + '&body=' + (& $e $Body) }
elseif ($What -eq 'pdf') { if (-not $Text) { Usage }; $q = 'p=' + (& $e ((Resolve-Path -LiteralPath $Text).Path)) }
elseif ($What -eq 'open') { if ($Text -notmatch '^thabat://') { Usage }; $q = 'u=' + (& $e $Text) }
else { if ($Text -notmatch '^(start|stop)$') { Usage }; $q = 'a=' + $Text; if ($Cat) { $q += '&cat=' + (& $e $Cat) } }
$kf = Join-Path (Join-Path $env:LOCALAPPDATA 'Thabat') 'helper.key'
function Key() { try { return ([IO.File]::ReadAllText($kf)).Trim() } catch { return '' } }
function Send-Cmd() { $k = Key; if ($k -notmatch '^[0-9a-f]{32}$') { throw 'nokey' }; return Invoke-RestMethod -UseBasicParsing -TimeoutSec 5 -Uri ("http://127.0.0.1:47813/auto/$What" + '?' + $q + '&k=' + $k) }
try { $r = Send-Cmd } catch {
  # the helper is not running: start it from this folder, then try again
  $h = Join-Path $PSScriptRoot 'Thabat-Helper.ps1'
  if (Test-Path -LiteralPath $h) { Start-Process powershell.exe -WindowStyle Hidden -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $h + '"'); Start-Sleep -Seconds 3 }
  try { $r = Send-Cmd } catch { Write-Output ('Thabat helper not reachable: ' + $_.Exception.Message); exit 1 }
}
if ($r.ok -and ($What -eq 'pdf' -or $What -eq 'open') -and -not $r.open) { $vbs = Join-Path $PSScriptRoot 'Thabat.vbs'; if (Test-Path -LiteralPath $vbs) { Start-Process wscript.exe -ArgumentList ('"' + $vbs + '"') } }
if ($r.ok) { if ($r.open) { Write-Output 'OK: sent to Thabat.' } else { Write-Output 'OK: queued; Thabat adds it when it opens.' }; exit 0 }
Write-Output 'Refused (check the text and options).'; exit 1
