@echo off
setlocal
cd /d "%~dp0"
title Javaneh Sabz - Local Production
where node.exe >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or is not available in PATH.
  pause
  exit /b 1
)
if not exist ".env" (
  echo ERROR: .env is missing. Copy .env.example to .env and configure it.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo ERROR: Dependencies are missing. Run: npm.cmd ci
  pause
  exit /b 1
)
if not exist "dist" (
  echo ERROR: Production build is missing. Run: npm.cmd run build
  pause
  exit /b 1
)
echo LOCAL WEBSITE: http://127.0.0.1:3100
echo ADMIN:         http://127.0.0.1:3100/admin
echo HEALTH:        http://127.0.0.1:3100/api/health
echo.
call npm.cmd run preview:production
if errorlevel 1 echo ERROR: The production environment stopped with an error.
pause
