@echo off
chcp 65001 >nul
cls

echo.
echo ═══════════════════════════════════════════════════════
echo    🛒 E-commerce Live Scraper
echo ═══════════════════════════════════════════════════════
echo.
echo 🚀 กำลังเริ่มต้น server...
echo.

REM Start Node.js server in background
start /B node server.js

REM Wait 2 seconds for server to start
timeout /t 2 /nobreak >nul

echo ✅ Server เริ่มต้นแล้ว!
echo 🌐 เปิดบราวเซอร์...
echo.

REM Open browser
start http://localhost:3000

echo.
echo ═══════════════════════════════════════════════════════
echo    ✨ เปิดเรียบร้อยแล้ว!
echo    📍 URL: http://localhost:3000
echo    ⏹️  กด Ctrl+C เพื่อหยุด server
echo ═══════════════════════════════════════════════════════
echo.

REM Keep the window open and show server logs
node server.js
