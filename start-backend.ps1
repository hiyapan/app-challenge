# Start Backend Server Script
Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host ""

# Detect local IPv4 address for convenience
$ip = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -ne '0.0.0.0' } |
    Select-Object -First 1 -ExpandProperty IPAddress

if ($ip) {
    Write-Host "Your IP: $ip" -ForegroundColor Yellow
    Write-Host "Backend URL (from this laptop): http://localhost:8000" -ForegroundColor Yellow
    Write-Host "Backend URL (from your phone):  http://$ip:8000" -ForegroundColor Yellow
} else {
    Write-Host "Your IP: (could not auto-detect; use ipconfig)" -ForegroundColor Yellow
    Write-Host "Backend URL: http://localhost:8000" -ForegroundColor Yellow
}

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
