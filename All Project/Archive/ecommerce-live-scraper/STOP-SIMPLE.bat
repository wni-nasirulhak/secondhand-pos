@echo off
cls
echo Stopping E-commerce Live Scraper...
echo.

taskkill /F /IM node.exe >nul 2>&1

echo.
echo Server stopped!
echo.
timeout /t 2 >nul
