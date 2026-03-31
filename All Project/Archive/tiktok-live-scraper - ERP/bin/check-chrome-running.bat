@echo off
chcp 65001 > nul
title ตรวจสอบ Chrome Process

echo.
echo ========================================
echo   🔍 ตรวจสอบ Chrome Process
echo ========================================
echo.

echo 📋 Chrome processes ที่กำลังทำงาน:
echo.
tasklist /FI "IMAGENAME eq chrome.exe" 2>nul

echo.
echo ========================================
if errorlevel 1 (
    echo ✅ ไม่พบ Chrome process (ดี!)
) else (
    echo ⚠️  พบ Chrome กำลังทำงานอยู่!
    echo.
    echo 💡 ต้องปิด Chrome ทั้งหมดก่อน:
    echo    1. ปิด Chrome windows ทั้งหมด
    echo    2. เช็ค Task Manager (Ctrl+Shift+Esc)
    echo    3. End Task chrome.exe ทั้งหมด
    echo.
    echo หรือรันคำสั่งนี้เพื่อปิดอัตโนมัติ:
    echo    taskkill /F /IM chrome.exe /T
)
echo ========================================
echo.

pause
