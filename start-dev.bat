@echo off
echo Starting DairyFlow Development Environment...
echo.

echo Starting Backend Server (Fastify)...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Vite)...
start "Frontend Server" cmd /k "pnpm dev"

echo.
echo Both servers are starting...
echo Backend:  https://dairy-flow-backend.onrender.com
echo Frontend: http://localhost:8080
echo API Docs:  https://dairy-flow-backend.onrender.com/docs
echo.
pause
