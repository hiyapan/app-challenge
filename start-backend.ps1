# Start Backend Server Script
Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Your IP: 10.85.120.197" -ForegroundColor Yellow
Write-Host "Backend URL: http://10.85.120.197:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: If your phone can't connect:" -ForegroundColor Red
Write-Host "1. Windows Firewall may be blocking port 8000" -ForegroundColor Red
Write-Host "2. When Python starts, Windows will show a firewall prompt" -ForegroundColor Yellow
Write-Host "3. Click 'Allow access' when prompted" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Green
Write-Host ""

cd backend
python server.py
