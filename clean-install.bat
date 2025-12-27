@echo off
echo ========================================
echo   Installation propre d'ArVision
echo ========================================
echo.
echo Nettoyage des dependances...
if exist node_modules (
    rmdir /s /q node_modules
    echo [OK] node_modules supprime
) else (
    echo [INFO] node_modules n'existe pas
)

if exist package-lock.json (
    del /f package-lock.json
    echo [OK] package-lock.json supprime
) else (
    echo [INFO] package-lock.json n'existe pas
)

echo.
echo Nettoyage du cache npm...
call npm.cmd cache clean --force
echo [OK] Cache nettoye

echo.
echo Installation des dependances (cela peut prendre plusieurs minutes)...
call npm.cmd install --legacy-peer-deps

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Installation terminee avec succes!
    echo ========================================
    echo.
    echo Vous pouvez maintenant executer: npm start
) else (
    echo.
    echo ========================================
    echo   Erreur lors de l'installation
    echo ========================================
    echo.
    echo Verifiez les messages d'erreur ci-dessus.
    echo.
    echo Solutions possibles:
    echo 1. Mettre a jour Node.js vers une version LTS (^20.17.0 ou ^22.9.0)
    echo 2. Utiliser: npm install -g npm@9
    echo 3. Consulter INSTALL.md pour plus d'informations
)

echo.
pause

