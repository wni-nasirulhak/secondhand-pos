# TikTok LIVE Comment Scraper Loop
param(
    [int]$Duration = 60,
    [int]$Interval = 3
)

$allComments = @()
$seenKeys = @{}
$startTime = Get-Date
$endTime = $startTime.AddSeconds($Duration)
$round = 0

Write-Host "🔴 Starting TikTok LIVE comment scraper for $Duration seconds..." -ForegroundColor Green
Write-Host "📊 Checking every $Interval seconds..." -ForegroundColor Cyan

while ((Get-Date) -lt $endTime) {
    $round++
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)
    
    Write-Host "`n[Round $round | ${elapsed}s] Fetching comments..." -ForegroundColor Yellow
    
    # Read and execute the JavaScript
    $jsCode = Get-Content "C:\Users\Winon\.openclaw\workspace\scrape_tiktok_comments.js" -Raw
    
    # Call browser evaluate via openclaw CLI (simulated - we'll do this via browser tool instead)
    # For now, just mark the timing
    
    Start-Sleep -Seconds $Interval
}

Write-Host "`n✅ Scraping completed!" -ForegroundColor Green
Write-Host "📝 Total rounds: $round" -ForegroundColor Cyan
