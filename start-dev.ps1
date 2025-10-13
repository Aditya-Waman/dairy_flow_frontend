Write-Host "Starting DairyFlow Development Environment..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend Server (Fastify)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server (Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend:  https://dairy-flow-backend.onrender.com" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "API Docs:  https://dairy-flow-backend.onrender.com/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
