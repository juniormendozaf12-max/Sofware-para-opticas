@echo off
echo Abriendo Centro Optico Sicuani en Google Chrome...

REM Rutas comunes de Chrome
set CHROME1="C:\Program Files\Google\Chrome\Application\chrome.exe"
set CHROME2="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set CHROME3="%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

REM Intentar abrir con la primera ruta que exista
if exist %CHROME1% (
    start "" %CHROME1% "%~dp0Centro_Optico_Sicuani_v5_Purple.html"
    exit
)

if exist %CHROME2% (
    start "" %CHROME2% "%~dp0Centro_Optico_Sicuani_v5_Purple.html"
    exit
)

if exist %CHROME3% (
    start "" %CHROME3% "%~dp0Centro_Optico_Sicuani_v5_Purple.html"
    exit
)

echo Google Chrome no encontrado. Instalalo desde https://www.google.com/chrome/
pause
