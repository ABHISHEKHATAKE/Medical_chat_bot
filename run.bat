@echo off
REM MediChat - One command to run all three services (double-click friendly)
REM Requires: Python, Node.js, npm in PATH

echo.
echo === MediChat - Starting all services ===
echo.

where python >nul 2>nul || (echo ERROR: python not found & pause & exit /b 1)
where node >nul 2>nul || (echo ERROR: node not found & pause & exit /b 1)

if not exist "%~dp0node_modules\.bin\concurrently.cmd" (
  echo Installing root dev tools...
  call npm install --prefix "%~dp0" 
)

echo Starting in DEV mode - Press Ctrl+C to stop all
echo   Python : http://127.0.0.1:8000
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:5173
echo.

call npm run dev

pause
