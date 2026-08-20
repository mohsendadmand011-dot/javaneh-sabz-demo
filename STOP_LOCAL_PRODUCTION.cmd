@echo off
setlocal
title Javaneh Sabz - Stop Local Production
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -State Listen -LocalPort 3100 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
call npm.cmd run db:local:stop
if errorlevel 1 (
  echo ERROR: PostgreSQL did not stop cleanly. Review the message above.
) else (
  echo Javaneh Sabz application and local PostgreSQL were stopped.
)
pause
