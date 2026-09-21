@echo off
title VaaniSetu App Launcher
cd /d "%~dp0"
echo ========================================================
echo Starting VaaniSetu - AI Vernacular Pedagogy App...
echo ========================================================
echo.
echo Opening browser at http://localhost:5173/ ...
start http://localhost:5173/
npm run dev
pause
