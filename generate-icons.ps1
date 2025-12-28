# Script PowerShell pour générer les différentes tailles d'icônes à partir de logoAR.png
# Nécessite ImageMagick ou utilise .NET System.Drawing

Write-Host "Génération des icônes PWA à partir de logoAR.png..." -ForegroundColor Green

$sourceImage = "public\logoAR.png"
$outputDir = "public"

# Vérifier si l'image source existe
if (-not (Test-Path $sourceImage)) {
    Write-Host "ERREUR: $sourceImage introuvable!" -ForegroundColor Red
    exit 1
}

# Tailles d'icônes nécessaires pour PWA
$sizes = @(
    @{size=16; name="favicon-16x16.png"},
    @{size=32; name="favicon-32x32.png"},
    @{size=48; name="favicon-48x48.png"},
    @{size=64; name="favicon-64x64.png"},
    @{size=96; name="favicon-96x96.png"},
    @{size=128; name="favicon-128x128.png"},
    @{size=192; name="logo192.png"},
    @{size=256; name="logo256.png"},
    @{size=384; name="logo384.png"},
    @{size=512; name="logo512.png"},
    @{size=180; name="apple-touch-icon.png"}
)

# Vérifier si ImageMagick est disponible
$imagemagickAvailable = $false
try {
    $null = Get-Command magick -ErrorAction Stop
    $imagemagickAvailable = $true
    Write-Host "ImageMagick détecté, utilisation de magick..." -ForegroundColor Cyan
} catch {
    Write-Host "ImageMagick non trouvé, tentative avec .NET System.Drawing..." -ForegroundColor Yellow
}

if ($imagemagickAvailable) {
    # Utiliser ImageMagick
    foreach ($icon in $sizes) {
        $outputPath = Join-Path $outputDir $icon.name
        $size = $icon.size
        Write-Host "Génération de $($icon.name) ($size x $size)..." -ForegroundColor Gray
        & magick $sourceImage -resize "${size}x${size}" $outputPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $($icon.name) créé" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Erreur lors de la création de $($icon.name)" -ForegroundColor Red
        }
    }
} else {
    # Utiliser .NET System.Drawing (nécessite Add-Type)
    Add-Type -AssemblyName System.Drawing
    
    try {
        $originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceImage))
        
        foreach ($icon in $sizes) {
            $outputPath = Join-Path $outputDir $icon.name
            $size = $icon.size
            Write-Host "Génération de $($icon.name) ($size x $size)..." -ForegroundColor Gray
            
            $bitmap = New-Object System.Drawing.Bitmap($size, $size)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            $graphics.DrawImage($originalImage, 0, 0, $size, $size)
            
            $bitmap.Save((Resolve-Path $outputDir).Path + "\" + $icon.name, [System.Drawing.Imaging.ImageFormat]::Png)
            
            $graphics.Dispose()
            $bitmap.Dispose()
            
            Write-Host "  ✓ $($icon.name) créé" -ForegroundColor Green
        }
        
        $originalImage.Dispose()
        Write-Host "`nToutes les icônes ont été générées avec succès!" -ForegroundColor Green
    } catch {
        Write-Host "ERREUR: Impossible de générer les icônes avec .NET System.Drawing" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`nSolution alternative:" -ForegroundColor Yellow
        Write-Host "1. Installez ImageMagick: https://imagemagick.org/script/download.php" -ForegroundColor Yellow
        Write-Host "2. Ou utilisez un outil en ligne comme https://realfavicongenerator.net/" -ForegroundColor Yellow
        Write-Host "3. Ou redimensionnez manuellement logoAR.png aux tailles suivantes:" -ForegroundColor Yellow
        foreach ($icon in $sizes) {
            Write-Host "   - $($icon.name): $($icon.size)x$($icon.size)" -ForegroundColor Gray
        }
        exit 1
    }
}

# Créer un favicon.ico (nécessite ImageMagick ou un outil externe)
Write-Host "`nNote: Pour créer un favicon.ico, utilisez:" -ForegroundColor Yellow
Write-Host "  - ImageMagick: magick public\favicon-32x32.png public\favicon.ico" -ForegroundColor Gray
Write-Host "  - Ou un outil en ligne: https://realfavicongenerator.net/" -ForegroundColor Gray

Write-Host "`n✓ Génération terminée!" -ForegroundColor Green

