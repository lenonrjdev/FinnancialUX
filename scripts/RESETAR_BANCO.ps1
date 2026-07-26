$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
Write-Host "ATENÇÃO: todos os dados locais serão apagados." -ForegroundColor Yellow
$confirmation = Read-Host "Digite RESETAR para continuar"
if ($confirmation -ne "RESETAR") { Write-Host "Cancelado."; exit 0 }
docker compose down -v
docker compose up -d postgres
Start-Sleep -Seconds 8
Set-Location "$root/backend"
npm run prisma:deploy
npm run prisma:seed
Write-Host "Banco recriado." -ForegroundColor Green
