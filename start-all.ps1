# Alternative: Manual PowerShell without concurrently (uses Jobs, works without npm)
# Usage: powershell -ExecutionPolicy Bypass -File ./start-all.ps1

$root = $PSScriptRoot
if (-not $root) { $root = Split-Path -Parent $MyInvocation.MyCommand.Path }
Set-Location $root

Write-Host "`n=== MediChat (manual jobs) ===" -ForegroundColor Cyan
Write-Host "Starting Python, Backend, Frontend as background jobs..." -ForegroundColor Gray

$jobs = @()

# Python
$jobs += Start-Job -Name "py" -ScriptBlock {
  Set-Location $using:root
  python -m uvicorn rag_pipeline.api.main:app --app-dir src --host 127.0.0.1 --port 8000 --reload
}
# Backend
$jobs += Start-Job -Name "api" -ScriptBlock {
  Set-Location "$using:root/backend"
  node --watch src/server.js
}
# Frontend
$jobs += Start-Job -Name "web" -ScriptBlock {
  Set-Location "$using:root/frontend"
  npx vite --port 5173 --host 0.0.0.0
}

Write-Host "Jobs started. Streaming logs (Ctrl+C to stop)..." -ForegroundColor Green
Write-Host "  py  : http://127.0.0.1:8000/docs"
Write-Host "  api : http://localhost:5000/health"
Write-Host "  web : http://localhost:5173`n"

try {
  while ($true) {
    Receive-Job -Job $jobs -Keep | ForEach-Object { Write-Host $_ }
    Start-Sleep -Seconds 1
    $running = $jobs | Where-Object State -eq Running
    if (-not $running) { break }
  }
} finally {
  Write-Host "`nStopping all..." -ForegroundColor Yellow
  $jobs | Stop-Job -ErrorAction SilentlyContinue
  $jobs | Remove-Job -Force -ErrorAction SilentlyContinue
  # Kill any leftover node/python on ports
  Get-Process node,python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*$root*" } | Stop-Process -Force -ErrorAction SilentlyContinue
}
