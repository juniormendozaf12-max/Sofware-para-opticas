@echo off
color 0D
title Centro Optico Sicuani - Selector de Navegador
cls

echo ===============================================
echo    CENTRO OPTICO SICUANI
echo    Sistema de Gestion Integral
echo ===============================================
echo.
echo Seleccione el navegador para abrir el sistema:
echo.
echo [1] Google Chrome
echo [2] Microsoft Edge
echo [3] Brave Browser
echo [4] Navegador por defecto
echo [5] Salir
echo.
set /p opcion="Ingrese su opcion (1-5): "

if "%opcion%"=="1" goto chrome
if "%opcion%"=="2" goto edge
if "%opcion%"=="3" goto brave
if "%opcion%"=="4" goto default
if "%opcion%"=="5" goto salir

echo Opcion invalida
pause
goto inicio

:chrome
echo.
echo Abriendo en Google Chrome...
call Abrir_en_Chrome.bat
goto fin

:edge
echo.
echo Abriendo en Microsoft Edge...
call Abrir_en_Edge.bat
goto fin

:brave
echo.
echo Abriendo en Brave...
call Abrir_en_Brave.bat
goto fin

:default
echo.
echo Abriendo en navegador por defecto...
start "" "%~dp0Centro_Optico_Sicuani_v5_Purple.html"
goto fin

:salir
echo.
echo Saliendo...
exit

:fin
echo.
echo Sistema iniciado correctamente!
echo.
timeout /t 2 >nul
exit
