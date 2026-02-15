@echo off
color 0A
title Centro Optico Sicuani - Servidor Local
cls

echo ===============================================
echo    CENTRO OPTICO SICUANI
echo    Servidor Local HTTP
echo ===============================================
echo.
echo Iniciando servidor local en http://localhost:8000
echo.
echo IMPORTANTE:
echo - Mantener esta ventana ABIERTA mientras uses el sistema
echo - Abrir en tu navegador: http://localhost:8000/Centro_Optico_Sicuani_v5_Purple.html
echo - Presiona Ctrl+C para detener el servidor
echo.
echo ===============================================
echo.

REM Intentar con Python 3
python --version >nul 2>&1
if %errorlevel%==0 (
    echo Usando Python 3...
    echo.
    python -m http.server 8000
    goto fin
)

REM Intentar con Python 2
python2 --version >nul 2>&1
if %errorlevel%==0 (
    echo Usando Python 2...
    echo.
    python2 -m SimpleHTTPServer 8000
    goto fin
)

REM Si no hay Python instalado
echo ERROR: Python no esta instalado en tu sistema.
echo.
echo Para instalar Python:
echo 1. Ve a https://www.python.org/downloads/
echo 2. Descarga Python 3.x
echo 3. Durante la instalacion, marca "Add Python to PATH"
echo 4. Reinicia esta aplicacion
echo.
echo Alternativa: Usa los archivos .bat para abrir directamente en tu navegador
echo (Abrir_en_Chrome.bat, Abrir_en_Edge.bat, etc.)
echo.
pause

:fin
