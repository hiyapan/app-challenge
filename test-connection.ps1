# Test Backend Connection
Write-Host "Testing Backend Connection..." -ForegroundColor Green
Write-Host ""

# Detect local IPv4 address used for phone access
$ip = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -ne '0.0.0.0' } |
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $ip) {
    Write-Host "Could not automatically detect local IP address." -ForegroundColor Red
    $ip = Read-Host "Enter your machine's IP address (e.g., 192.168.x.x)"
}

$port = 8000
$url = "http://${ip}:${port}/health"

Write-Host "Your IP: $ip" -ForegroundColor Yellow
Write-Host "Backend URL: $url" -ForegroundColor Yellow
Write-Host ""

# Test if backend is running
Write-Host "1. Testing local connection..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
    Write-Host "   Backend is running locally" -ForegroundColor Green
    Write-Host "   Response: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Backend is NOT running" -ForegroundColor Red
    Write-Host "   Please start the backend first: .\start-backend.ps1" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "2. Testing if port is open on network..." -ForegroundColor Cyan
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect($ip, $port)
    $tcpClient.Close()
    Write-Host "   Port 8000 is accessible on network" -ForegroundColor Green
} catch {
    Write-Host "   Port 8000 is blocked (likely firewall)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   TO FIX (choose one):" -ForegroundColor Yellow
    Write-Host "   A. Run PowerShell as Administrator and execute:" -ForegroundColor White
    Write-Host "      netsh advfirewall firewall add rule name='Python Backend' dir=in action=allow protocol=TCP localport=8000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   B. Or manually:" -ForegroundColor White
    Write-Host "      - Press Windows + R" -ForegroundColor Gray
    Write-Host "      - Type: wf.msc" -ForegroundColor Gray
    Write-Host "      - Inbound Rules > New Rule > Port > TCP 8000 > Allow" -ForegroundColor Gray
    exit
}

Write-Host ""
Write-Host "3. Test from your phone:" -ForegroundColor Cyan
Write-Host "   Open browser on phone: $url" -ForegroundColor White
Write-Host "   You should see JSON with ok: true" -ForegroundColor White
Write-Host ""
Write-Host "Everything looks good! Your phone should be able to connect." -ForegroundColor Green
