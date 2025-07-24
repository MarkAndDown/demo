@echo off
echo ========================================
echo    NB Man - Build Script
echo ========================================
echo.

echo Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not found, please install Node.js first
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version

echo.
echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Choose build type:
echo 1. Build Windows Installer
echo 2. Build Windows Portable
echo 3. Build All Platforms
echo 4. Package Only (no installer)
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Building Windows Installer...
    npm run build-win
) else if "%choice%"=="2" (
    echo.
    echo Building Windows Portable...
    npm run build-win-portable
) else if "%choice%"=="3" (
    echo.
    echo Building All Platforms...
    npm run build
) else if "%choice%"=="4" (
    echo.
    echo Packaging Application...
    npm run pack
) else (
    echo Invalid choice
    pause
    exit /b 1
)

if %errorlevel% neq 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo Build completed!
echo Output files are in the dist directory
echo.

if exist dist (
    echo Build output files:
    dir /b dist
)

pause 