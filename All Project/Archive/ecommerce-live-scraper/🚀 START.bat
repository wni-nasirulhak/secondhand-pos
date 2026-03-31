@echo off
chcp 65001 >nul
title E-commerce Live Scraper - Starting...

cls
echo.
echo ============================================
echo    E-commerce Live Scraper
echo    Starting Server...
echo ============================================
echo.

cd /d "%~dp0"

echo [*] Starting Node.js server...
timeout /t 1 /nobreak >nul
start /B node server.js

echo [*] Waiting for server to initialize...
timeout /t 2 /nobreak >nul

echo [*] Opening browser...
start http://localhost:3000

cls
echo.
echo ============================================
echo    Server Started Successfully!
echo ============================================
echo.
echo    URL: http://localhost:3000
echo.
echo    - Server is running in background
echo    - Browser should open automatically
echo    - Use STOP.bat to stop the server
echo.
echo ============================================
echo.
echo Press any key to close this window...
pause >nul
