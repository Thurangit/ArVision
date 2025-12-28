# Script simple pour générer les icônes PWA
Add-Type -AssemblyName System.Drawing

$sourceImage = "public\logoAR.png"
$outputDir = "public"

if (-not (Test-Path $sourceImage)) {
    Write-Host "ERREUR: $sourceImage introuvable!" -ForegroundColor Red
    exit 1
}

Write-Host "Chargement de l'image source..." -ForegroundColor Cyan
$originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceImage).Path)

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

Write-Host "Génération des icônes..." -ForegroundColor Green

foreach ($icon in $sizes) {
    $outputPath = Join-Path $outputDir $icon.name
    $size = $icon.size
    
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($originalImage, 0, 0, $size, $size)
    
    $fullPath = (Resolve-Path $outputDir).Path + "\" + $icon.name
    $bitmap.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "  ✓ $($icon.name) ($size x $size)" -ForegroundColor Green
}

$originalImage.Dispose()

Write-Host "`n✓ Toutes les icônes ont été générées avec succès!" -ForegroundColor Green
Write-Host "`nNote: Pour créer favicon.ico, utilisez un outil en ligne comme:" -ForegroundColor Yellow
Write-Host "  https://realfavicongenerator.net/" -ForegroundColor Cyan

