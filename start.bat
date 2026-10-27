@echo off
chcp 65001 >nul
title University FYP Management System Launcher
color 0B

set "PATH=D:\;C:\Users\Modern Tech\AppData\Roaming\npm;%PATH%"

echo ==============================================================================================
echo                 UNIVERSITY FINAL YEAR PROJECT (FYP) MANAGEMENT SYSTEM
echo ==============================================================================================
echo.
echo   Initializing all services step-by-step and launching directly into your browser...
echo.

REM --------------------------------------------------------------------------------------------
REM STEP 1: DATABASE (MongoDB Port 27017)
REM --------------------------------------------------------------------------------------------
echo   [Step 1/4] Checking Database Service: MongoDB Port 27017...
netstat -ano | findstr /R ":27017\>" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 goto DB_RUNNING
echo              Starting local MongoDB engine...
start "FYP Database" /min cmd /c "cd /d %~dp0backend && node start_mongo.js"
timeout /t 3 /nobreak >nul
goto STEP_AI

:DB_RUNNING
echo              [OK] Database is already running and ready.

:STEP_AI
REM --------------------------------------------------------------------------------------------
REM STEP 2: AI MICROSERVICE (FastAPI Port 8000)
REM --------------------------------------------------------------------------------------------
echo   [Step 2/4] Checking AI Similarity Microservice: Port 8000...
netstat -ano | findstr /R ":8000\>" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 goto AI_RUNNING
echo              Starting AI Microservice...
start "FYP AI Service" /min cmd /c "cd /d %~dp0ai-service && .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul
goto STEP_BACKEND

:AI_RUNNING
echo              [OK] AI Microservice is already running and ready.

:STEP_BACKEND
REM --------------------------------------------------------------------------------------------
REM STEP 3: BACKEND API (Express Port 5000)
REM --------------------------------------------------------------------------------------------
echo   [Step 3/4] Checking Backend API Server: Port 5000...
netstat -ano | findstr /R ":5000\>" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 goto BACKEND_RUNNING
echo              Starting Express Backend API...
start "FYP Backend API" /min cmd /c "cd /d %~dp0backend && node server.js"
timeout /t 3 /nobreak >nul
goto STEP_FRONTEND

:BACKEND_RUNNING
echo              [OK] Backend API Server is already running and ready.

:STEP_FRONTEND
REM --------------------------------------------------------------------------------------------
REM STEP 4: FRONTEND PORTAL (Vite React Port 5173)
REM --------------------------------------------------------------------------------------------
echo   [Step 4/4] Checking Frontend React Portal: Port 5173...
netstat -ano | findstr /R ":5173\>" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 goto FRONTEND_RUNNING
echo              Starting Vite Frontend Dev Server...
start "FYP Frontend" /min cmd /c "cd /d %~dp0frontend && \"C:\Users\Modern Tech\AppData\Roaming\npm\npm.cmd\" run dev -- --host 127.0.0.1 --port 5173"
timeout /t 3 /nobreak >nul
goto LAUNCH_BROWSER

:FRONTEND_RUNNING
echo              [OK] Frontend portal is already running and ready.

:LAUNCH_BROWSER
REM --------------------------------------------------------------------------------------------
REM STEP 5: LAUNCH DIRECTLY TO BROWSER
REM --------------------------------------------------------------------------------------------
echo.
echo ==============================================================================================
echo   ALL SERVICES OPERATIONAL! OPENING BROWSER DIRECTLY...
echo ==============================================================================================
echo.
echo   Local Web Portal:     http://localhost:5173
echo   Online Live Link:     https://invision-insulation-seventh-andrea.trycloudflare.com
echo   Backend REST API:     http://localhost:5000
echo   AI Similarity Engine: http://localhost:8000
echo.
echo   ------------------------------------------------------------------------------------------
echo   PRE-CONFIGURED TEST LOGINS - Password for all is Password@123
echo   ------------------------------------------------------------------------------------------
echo    - Admin:      admin@university.edu
echo    - Supervisor: dr.khursheed@university.edu
echo    - Student:    shivo55batra@gmail.com  /  shivani@university.edu
echo   ------------------------------------------------------------------------------------------
echo.
start "" "http://localhost:5173"
echo   [SUCCESS] Browser opened directly to http://localhost:5173
echo   All services are running. You can keep or minimize this window.
pause >nul
