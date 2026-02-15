@echo off
echo Abriendo Centro Optico Sicuani en Microsoft Edge...

REM Rutas comunes de Edge
set EDGE1="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set EDGE2="C:\Program Files\Microsoft\Edge\Application\msedge.exe"

REM Intentar abrir con la primera ruta que exista
if exist %EDGE1% (
    start "" %EDGE1% "%~dp0Centro_Optico_Sicuani_v5_Purple.html"
    exit
)

if exist %EDGE2% (
    start "" %EDGE2% "%~dp0Centro_Optico_Sicuani_v5_Purple.html"
    exit
)

echo Microsoft Edge no encontrado.
pause
