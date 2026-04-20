# SkillSwap Server Startup Script (PowerShell)
# This script kills existing Node processes and starts the server

Write-Host "🔍 Checking for existing Node processes on port 4000..." -ForegroundColor Cyan

$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "❌ Found $($nodeProcesses.Count) Node process(es) running" -ForegroundColor Red
    Write-Host "🛑 Stopping Node processes..." -ForegroundColor Yellow
    
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Node processes stopped" -ForegroundColor Green
    
    Write-Host "⏳ Waiting 2 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
} else {
    Write-Host "✓ No Node processes found" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting SkillSwap Server..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

& node src/server.js

Write-Host ""
Write-Host "Server stopped. Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
