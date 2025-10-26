@echo off
echo ====================================================================
echo EMS Data Sender - Automated Setup and Execution
echo ====================================================================
echo.

cd /d "%~dp0"
cd server

echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [2/3] Testing API connection...
call node test-api.js
echo.
echo Press any key to continue with full data send, or Ctrl+C to cancel...
pause
echo.

echo [3/3] Starting full data transmission...
echo This will take approximately 4-8 minutes...
echo.
call node ems-data-sender.js

echo.
echo ====================================================================
echo PROCESS COMPLETE
echo ====================================================================
pause
