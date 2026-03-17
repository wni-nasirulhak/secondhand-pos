@echo off
REM TikTok Live Auto Reply System - Quick Start
REM ต้องเปิด Webhook Server ก่อน!

echo ======================================================================
echo TikTok Live Auto Reply System
echo ======================================================================
echo.
echo ** IMPORTANT **
echo 1. Make sure Webhook Server is running (webhook_server.py)
echo 2. You will need to login to TikTok manually in the browser
echo.
echo Starting in 3 seconds...
timeout /t 3 >nul
echo.

python auto_reply_system.py --duration 600 --visible

pause
