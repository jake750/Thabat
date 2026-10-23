@echo off
rem Thabat automation: thabat-auto task "text" [-After asr] | note "title" "text" | timer start^|stop
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Thabat-Auto.ps1" %*
