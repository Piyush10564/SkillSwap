@echo off
echo Killing existing Node processes on port 4000...
taskkill /F /IM node.exe 2>nul

if errorlevel 1 (
    echo No Node processes found to kill
) else (
    echo ✓ Node processes killed successfully
)

echo.
echo Waiting 2 seconds before starting server...
timeout /t 2 /nobreak

echo.
echo Starting SkillSwap server...
node src/server.js

pause
