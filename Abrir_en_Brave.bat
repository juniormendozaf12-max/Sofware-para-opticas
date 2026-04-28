@echo off
echo Abriendo Centro Optico Sicuani en Brave...

REM Rutas comunes de Brave
set BRAVE1="C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
set BRAVE2="C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe"
set BRAVE3="%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe"

REM Intentar abrir con la primera ruta que exista
if exist %BRAVE1% (
    start "" %BRAVE1% "%~dp0Centro_Optico_Sicuani_v5_Purple.html"
    exit
)

if exist %BRAVE2% (
    start "" %BRAVE2% "%~dp0Centro_Optico_Sicuani_v5_Purple.html"
    exit
)

if exist %BRAVE3% (
    start "" %BRAVE3% "%~dp0Centro_Optico_Sicuani_v5_Purple.html"
    exit
)

echo Brave no encontrado. Instalalo desde https://brave.com/
pause
