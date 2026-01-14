@echo off
echo.
echo ========================================
echo   RocketMoon App - Build Script
echo ========================================
echo.

:: Navigate to project root
cd /d "%~dp0"

:: Step 1: Build Frontend
echo [1/3] Building Frontend...
cd romo.client
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo ERROR: npm build failed!
    pause
    exit /b 1
)
cd ..
echo      Frontend build complete!
echo.

:: Step 2: Publish Backend (Single-File)
echo [2/3] Publishing Backend (Single-File)...
cd RoMo.Server
dotnet publish -c Release -r win-x64 --self-contained -o ..\publish
if errorlevel 1 (
    echo ERROR: dotnet publish failed!
    pause
    exit /b 1
)
cd ..
echo      Backend publish complete!
echo.

:: Step 3: Done!
echo [3/3] Build Complete!
echo.
echo ========================================
echo   Output: publish\RoMo.Server.exe
echo ========================================
echo.
echo Doppelklick auf RoMo.Server.exe zum Starten!
echo.

:: Open publish folder
explorer publish

pause
