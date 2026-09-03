# MediChat - One command to run all three services
# Usage: powershell -ExecutionPolicy Bypass -File ./run.ps1
#        or: ./run.ps1 (if execution policy allows)
#        or: npm run dev (from root, uses concurrently)

param(
  [switch]$NoReload,
  [switch]$Build
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $root) { $root = Split-Path -Parent $MyInvocation.MyCommand.Path }
Set-Location $root

Write-Host "`n=== MediChat - Starting all services ===" -ForegroundColor Cyan
Write-Host "Root: $root`n" -ForegroundColor Gray

# --- checks ---
function Test-Command($cmd) { $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue) }
if (-not (Test-Command python)) { Write-Error "python not found in PATH"; exit 1 }
if (-not (Test-Command node)) { Write-Error "node not found in PATH"; exit 1 }
if (-not (Test-Command npm)) { Write-Error "npm not found in PATH"; exit 1 }

# --- ensure concurrently installed at root ---
if (-not (Test-Path "$root/node_modules/.bin/concurrently*")) {
  Write-Host "Installing root dev tools (concurrently)..." -ForegroundColor Yellow
  npm install --prefix $root 2>&1 | Out-Null
}

# --- ports ---
$ports = @(8000, 5000, 5173)
foreach ($p in $ports) {
  $conn = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Where-Object State -eq Listen
  if ($conn) {
    Write-Host "Port $p already in use (PID $($conn.OwningProcess)), will be reused or killed on Ctrl+C" -ForegroundColor Yellow
  }
}

# --- mode ---
if ($Build) {
  Write-Host "Building frontend..." -ForegroundColor Yellow
  npm run build --prefix frontend
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "Starting in PRODUCTION mode (no reload)" -ForegroundColor Green
  npm start
} elseif ($NoReload) {
  Write-Host "Starting in PRODUCTION mode (no reload)" -ForegroundColor Green
  npm start
} else {
  Write-Host "Starting in DEV mode (with reload) - Press Ctrl+C to stop all" -ForegroundColor Green
  Write-Host "  Python : http://127.0.0.1:8000  (docs: /docs)" -ForegroundColor Blue
  Write-Host "  Backend: http://localhost:5000  (health: /health)" -ForegroundColor Green
  Write-Host "  Frontend: http://localhost:5173`n" -ForegroundColor Magenta
  npm run dev
}
