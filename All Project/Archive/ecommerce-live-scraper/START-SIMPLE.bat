@echo off
cls
echo Starting E-commerce Live Scraper...
echo.

cd /d "%~dp0"
start /B node server.js
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo Server started!
echo URL: http://localhost:3000
echo.
echo Press any key to close...
pause >nul
