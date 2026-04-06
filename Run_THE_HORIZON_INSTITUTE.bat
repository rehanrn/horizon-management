@echo off
title Launching THE HORIZON INSTITUTE & SOFTWARE HOUSE
echo ==================================================
echo [STEP 1] Checking Node.js Environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install it from nodejs.org
    pause
    exit /b
)

echo [STEP 2] Initializing Application Shell...
call npm install --no-fund --no-audit

echo [STEP 3] Starting THE HORIZON INSTITUTE & SOFTWARE HOUSE...
call npm start

echo ==================================================
pause
