# PowerShell script para gerar ícones PWA usando ImageMagick (magick)
# Salve sua imagem como public\pwa-source.png e execute este script na raiz do projeto.

if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Error "ImageMagick não encontrado (comando 'magick'). Instale-o ou adicione ao PATH."
    exit 1
}

$src = "public\pwa-source.png"
$iconsDir = "public\icons"

if (-not (Test-Path $src)) {
    Write-Error "Arquivo de origem não encontrado: $src. Salve a imagem (anexo) como public/pwa-source.png"
    exit 1
}

if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir | Out-Null }

Write-Host "Gerando public/icons/icon-192.png..."
magick $src -resize 192x192^ -gravity center -extent 192x192 "$iconsDir\icon-192.png"

Write-Host "Gerando public/icons/icon-512.png..."
magick $src -resize 512x512^ -gravity center -extent 512x512 "$iconsDir\icon-512.png"

Write-Host "Gerando public/favicon.ico (múltiplos tamanhos)..."
magick $src -define icon:auto-resize=256,128,64,48,32,16 public\favicon.ico

Write-Host "Pronto. Verifique os arquivos em public\icons e public\favicon.ico"
