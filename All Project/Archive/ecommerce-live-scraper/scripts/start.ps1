# E-commerce Live Scraper - PowerShell Launcher
# Encoding: UTF-8

Clear-Host

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🛒 E-commerce Live Scraper" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 กำลังเริ่มต้น server..." -ForegroundColor Green
Write-Host ""

# Start Node.js server in background
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -NoNewWindow

# Wait 2 seconds for server to start
Start-Sleep -Seconds 2

Write-Host "✅ Server เริ่มต้นแล้ว! (PID: $($serverProcess.Id))" -ForegroundColor Green
Write-Host "🌐 เปิดบราวเซอร์..." -ForegroundColor Cyan
Write-Host ""

# Open browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✨ เปิดเรียบร้อยแล้ว!" -ForegroundColor Green
Write-Host "   📍 URL: http://localhost:3000" -ForegroundColor White
Write-Host "   🔢 Process ID: $($serverProcess.Id)" -ForegroundColor White
Write-Host "   ⏹️  กด Ctrl+C เพื่อหยุด server" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Wait for user to press Ctrl+C
try {
    Write-Host "กด Ctrl+C เพื่อหยุดและปิด server..." -ForegroundColor Yellow
    Wait-Process -Id $serverProcess.Id
}
catch {
    Write-Host ""
    Write-Host "🛑 กำลังหยุด server..." -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    Write-Host "✅ ปิดเรียบร้อยแล้ว!" -ForegroundColor Green
}
