# RocketMoon App - Build Script (PowerShell)

Write-Host ""
Write-Host "========================================"
Write-Host "  RocketMoon App - Build Script"
Write-Host "========================================"
Write-Host ""

$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

try {
    # Step 1: Build Frontend
    Write-Host "[1/3] Building Frontend..." -ForegroundColor Cyan
    Set-Location "romo.client"
    npm install
    npm run build
    Set-Location $scriptPath
    Write-Host "     Frontend build complete!" -ForegroundColor Green
    Write-Host ""

    # Step 2: Publish Backend
    Write-Host "[2/3] Publishing Backend (Single-File)..." -ForegroundColor Cyan
    Set-Location "RoMo.Server"
    dotnet publish -c Release -r win-x64 --self-contained -o "$scriptPath\publish"
    Set-Location $scriptPath
    Write-Host "     Backend publish complete!" -ForegroundColor Green
    Write-Host ""

    # Step 3: Done
    Write-Host "[3/3] Build Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  Output: publish\RoMo.Server.exe" -ForegroundColor Yellow
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Doppelklick auf RoMo.Server.exe zum Starten!"

    # Open folder
    Invoke-Item "$scriptPath\publish"
}
catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    exit 1
}
