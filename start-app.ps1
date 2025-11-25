# Start Expo app with automatic backend URL

Write-Host "Starting Expo app with auto-detected backend URL..." -ForegroundColor Green
Write-Host "" 

# Detect local IPv4 address (non-loopback)
$ip = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -ne '0.0.0.0' } |
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $ip) {
    Write-Host "Could not automatically detect local IP address." -ForegroundColor Red
    $ip = Read-Host "Please enter your machine's IP address (e.g., 192.168.x.x)"
}

$port = 8000
$apiBaseUrl = "http://${ip}:${port}"

# Set environment variable for Expo (read by config/api.ts)
$env:EXPO_PUBLIC_API_BASE_URL = $apiBaseUrl

Write-Host "Using API base URL: $apiBaseUrl" -ForegroundColor Yellow
Write-Host "This will be available in the app as EXPO_PUBLIC_API_BASE_URL" -ForegroundColor Yellow
Write-Host "" 

# Start Expo using npm script
Write-Host "Running: npm start" -ForegroundColor Cyan
npm start
