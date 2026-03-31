@echo off
chcp 65001 > nul
title ทดสอบเปิด Chrome Profile

echo.
echo ========================================
echo   🧪 ทดสอบเปิด Chrome Profile
echo ========================================
echo.

set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set USER_DATA="C:\Users\Winon\AppData\Local\Google\Chrome\User Data"
set PROFILE=Default
set URL=https://www.tiktok.com/@rizanntry/live

echo 📂 User Data: %USER_DATA%
echo 👤 Profile: %PROFILE%
echo 🔗 URL: %URL%
echo.

echo 🔍 กำลังเปิด Chrome...
echo.

%CHROME_PATH% --user-data-dir=%USER_DATA% --profile-directory=%PROFILE% %URL%

echo.
echo ========================================
echo   ✅ Chrome เปิดแล้ว!
echo.
echo   ตรวจสอบ:
echo   - มี TikTok login หรือไม่?
echo   - เปิด URL ถูกหรือไม่?
echo ========================================
echo.

pause
