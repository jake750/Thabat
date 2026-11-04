@echo off
setlocal
rem Opens Thabat as a standalone app window. Looks for Edge, then Chrome, then Brave.
set "APP=%~dp0Thabat.html"
set "B="

for %%P in (
  "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
  "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
  "%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
  "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  "%LocalAppData%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
  "%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe"
) do (
  if not defined B if exist %%P set "B=%%~P"
)

rem Start the small local helper used to find mosques on mawaqit.net (hidden, closes itself when idle)
if exist "%~dp0Thabat-Helper.ps1" start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0Thabat-Helper.ps1"

rem Start the video library server if it has been set up (it exits by itself if already running)
if exist "%LOCALAPPDATA%\Thabat\library.json" if exist "%~dp0Thabat-Library.ps1" start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0Thabat-Library.ps1"

rem 3.168: open the window where it was last time (the helper keeps its place and size in win.txt)
set "WIN=--window-size=1320,860"
if exist "%LOCALAPPDATA%\Thabat\win.txt" for /f "usebackq tokens=1-5" %%a in ("%LOCALAPPDATA%\Thabat\win.txt") do (
  if "%%e"=="1" (set "WIN=--start-maximized --window-position=%%a,%%b") else (set "WIN=--window-position=%%a,%%b --window-size=%%c,%%d")
)

if defined B (
  start "" "%B%" --app="%APP%" %WIN% --autoplay-policy=no-user-gesture-required
) else (
  rem No Edge/Chrome found: open with the default browser
  start "" "%APP%"
)
endlocal
