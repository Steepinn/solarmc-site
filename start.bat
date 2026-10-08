@echo off
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%

echo Stopping old servers...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

if exist .next rmdir /s /q .next

start "" "http://localhost:3000"
npm run dev
