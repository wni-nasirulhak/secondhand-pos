@echo off
chcp 65001 > nul
title หา Chrome Profile Path

echo.
echo ========================================
echo   🔍 หา Chrome Profile Path
echo ========================================
echo.

REM Windows - Chrome User Data Path
set CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\User Data

echo 📂 Chrome Profile อยู่ที่:
echo %CHROME_PATH%
echo.

REM แสดง profiles ที่มี
echo 📋 Profiles ที่มี:
echo.
dir /B "%CHROME_PATH%\Profile*" "%CHROME_PATH%\Default" 2>nul
echo.

echo ========================================
echo   📝 คัดลอก path นี้:
echo ========================================
echo.
echo %CHROME_PATH%
echo.

pause
