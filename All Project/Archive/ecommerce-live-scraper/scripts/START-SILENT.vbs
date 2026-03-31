' E-commerce Live Scraper - Silent Launcher
' เปิด server โดยไม่แสดงหน้าต่าง command prompt

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get current directory
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Start server in hidden window
WshShell.Run "cmd /c cd /d """ & currentDir & """ && node server.js", 0, False

' Wait 2 seconds
WScript.Sleep 2000

' Open browser
WshShell.Run "http://localhost:3000", 1, False

' Show notification (optional)
WshShell.Popup "✅ Server started!" & vbCrLf & "🌐 Browser opened!" & vbCrLf & vbCrLf & "📍 http://localhost:3000", 3, "E-commerce Live Scraper", 64
