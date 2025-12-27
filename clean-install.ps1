Write-Host "Nettoyage des dependances..." -ForegroundColor Yellow

if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
    Write-Host "node_modules supprime" -ForegroundColor Green
}

if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json
    Write-Host "package-lock.json supprime" -ForegroundColor Green
}

Write-Host "Nettoyage du cache npm..." -ForegroundColor Yellow
npm.cmd cache clean --force

Write-Host "Installation des dependances..." -ForegroundColor Yellow
npm.cmd install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "Installation terminee avec succes!" -ForegroundColor Green
    Write-Host "Vous pouvez maintenant executer: npm start" -ForegroundColor Cyan
} else {
    Write-Host "Erreur lors de l'installation. Verifiez les messages ci-dessus." -ForegroundColor Red
}

