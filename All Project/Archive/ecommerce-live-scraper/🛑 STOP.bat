@echo off
chcp 65001 >nul
title E-commerce Live Scraper - Stopping...

cls
echo.
echo ============================================
echo    Stopping Server...
echo ============================================
echo.

echo [*] Finding Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if errorlevel 1 (
    echo [!] No Node.js server found running.
) else (
    echo [*] Stopping Node.js server...
    taskkill /F /IM node.exe >nul 2>&1
    echo [+] Server stopped successfully!
)

timeout /t 1 /nobreak >nul

cls
echo.
echo ============================================
echo    Server Stopped Successfully!
echo ============================================
echo.
echo    All Node.js processes have been terminated.
echo.
echo ============================================
echo.
echo Press any key to close...
timeout /t 2 >nul
