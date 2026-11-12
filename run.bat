@echo off
chcp 65001 >nul
title University FYP Management System Launcher
color 0B

setlocal enabledelayedexpansion
set "PATH=D:\;C:\Users\Modern Tech\AppData\Roaming\npm;C:\Program Files\Git\cmd;%PATH%"

echo ==============================================================================================
echo                 UNIVERSITY FINAL YEAR PROJECT (FYP) MANAGEMENT SYSTEM
echo ==============================================================================================
echo.
echo   Initializing all system services and launching portal in your browser...
echo.

REM --------------------------------------------------------------------------------------------
REM STEP 1: DATABASE (MongoDB Port 27017)
REM --------------------------------------------------------------------------------------------
echo   [Step 1/5] Checking Database Engine (Port 27017)...
netstat -ano | findstr /R ":27017\>" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 (
    echo              [OK] Database is already running.
) else (
    echo              Starting local MongoDB engine...
    start "FYP Database" /min cmd /c "cd /d %~dp0backend && node start_mongo.js"
    timeout /t 3 /nobreak >nul
)

REM --------------------------------------------------------------------------------------------
REM STEP 2: AI MICROSERVICE (FastAPI Port 8000)
REM --------------------------------------------------------------------------------------------
echo   [Step 2/5] Checking AI Similarity Microservice (Port 8000)...
netstat -ano | findstr /R ":8000\>" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 (
    echo              [OK] AI Microservice is already running.
) else (
    echo              Starting AI Microservice...
    start "FYP AI Service" /min cmd /c "cd /d %~dp0ai-service && .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
    timeout /t 3 /nobreak >nul
)

REM --------------------------------------------------------------------------------------------
REM STEP 3: BACKEND API & WEB SERVER (Port 5000)
REM --------------------------------------------------------------------------------------------
echo   [Step 3/5] Checking Backend Server (Port 5000)...
netstat -ano | findstr /R ":5000\>" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 (
    echo              [OK] Backend server is already running.
) else (
    echo              Starting Backend Server...
    start "FYP Backend" /min cmd /c "cd /d %~dp0backend && node server.js"
    timeout /t 3 /nobreak >nul
)

REM --------------------------------------------------------------------------------------------
REM STEP 4: CLOUDFLARE LIVE TUNNEL
REM --------------------------------------------------------------------------------------------
echo   [Step 4/5] Checking Cloudflare Live Tunnel...
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | findstr /I "cloudflared.exe" >nul 2>nul
if %errorlevel% equ 0 (
    echo              [OK] Live tunnel is already running.
) else (
    echo              Starting Live Tunnel Manager...
    start "FYP Tunnel Manager" /min cmd /c "cd /d %~dp0 && node tunnel_manager.js"
    timeout /t 4 /nobreak >nul
)

REM --------------------------------------------------------------------------------------------
REM STEP 5: DISPLAY STATUS & LAUNCH BROWSER
REM --------------------------------------------------------------------------------------------
echo.
echo ==============================================================================================
echo                      ALL PORTAL SERVICES ARE OPERATIONAL!
echo ==============================================================================================
echo.
echo   Local Web Portal:     http://localhost:5000
echo   Cloud Vercel Link:    https://fyp-management-system-ten.vercel.app

if exist "%~dp0CURRENT_LIVE_URL.txt" (
    set /p LIVE_URL=<"%~dp0CURRENT_LIVE_URL.txt"
    echo   Live Tunnel Link:     !LIVE_URL!
)

echo.
echo   ------------------------------------------------------------------------------------------
echo   QUICK TEST ACCOUNTS (Password for all is: Password@123)
echo   ------------------------------------------------------------------------------------------
echo    - Admin / Coordinator:   admin@university.edu
echo    - Faculty Supervisor:    dr.khursheed@university.edu
echo    - Student (CSE):         student@university.edu
echo   ------------------------------------------------------------------------------------------
echo.

start "" "http://localhost:5000"

echo   [SUCCESS] Browser opened to http://localhost:5000
echo   Keep this window open or minimized while using the system.
echo.
pause
