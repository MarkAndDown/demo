@echo off
echo ========================================
echo    Postman Lite - API Testing Tool
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
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm not found
    pause
    exit /b 1
)

echo npm version:
npm --version

echo.
echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting NB Man...
npm start

pause 