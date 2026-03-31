@echo off
REM TikTok Live Scraper - WORKING VERSION (No Lock Issues!)
cd /d "%~dp0"

echo ============================================================
echo   TikTok Live Comment Scraper - WORKING VERSION
echo   No Profile Lock - Always Works!
echo ============================================================
echo.

echo Starting scraper (120 seconds, visible mode)...
echo.
python scripts\scrape_live_working.py --duration 120 --visible

echo.
echo Done! Check data\comments\
pause
