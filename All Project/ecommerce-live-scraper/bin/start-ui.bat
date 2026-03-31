@echo off
chcp 65001 > nul
title TikTok Live Scraper UI

echo.
echo ========================================
echo   🎨 TikTok Live Scraper UI
echo ========================================
echo.

REM Check if node_modules exists in root
if not exist "..\node_modules\" (
    echo 📦 Installing dependencies...
    pushd ..
    call npm install
    popd
    echo.
)

echo 🚀 Starting server...
echo.
echo 📱 Open in browser: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

node ..\server.js

pause
