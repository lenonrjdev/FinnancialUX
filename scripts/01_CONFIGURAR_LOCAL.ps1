$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $root "frontend"

Set-Location $root
& "$PSScriptRoot/REMOVER_FASE_15_SUPABASE.ps1"

$backendEnv = Join-Path $root "backend/.env"
$backendExample = Join-Path $root "backend/.env.example"
if (Test-Path $backendEnv) {
  $currentEnv = Get-Content $backendEnv -Raw
  if ($currentEnv -notmatch "finance_dashboard" -or $currentEnv -notmatch "5434") {
    $backup = Join-Path $root "backend/.env.antes-fase-15"
    if (-not (Test-Path $backup)) { Copy-Item $backendEnv $backup }
    Copy-Item $backendExample $backendEnv -Force
    Write-Host "backend/.env anterior preservado em backend/.env.antes-fase-15"
  }
} else {
  Copy-Item $backendExample $backendEnv
  Write-Host "Criado backend/.env"
}

$frontendEnv = Join-Path $frontendRoot ".env.local"
if (Test-Path $frontendEnv) {
  $frontendLines = Get-Content $frontendEnv | Where-Object {
    $_ -notmatch "NEXT_PUBLIC_SUPABASE" -and $_ -notmatch "NEXT_PUBLIC_ALLOW_DEMO_MODE"
  }
  Set-Content $frontendEnv $frontendLines
  $frontendContent = Get-Content $frontendEnv -Raw
  if ($frontendContent -notmatch "NEXT_PUBLIC_API_URL") {
    Add-Content $frontendEnv "`nNEXT_PUBLIC_API_URL=http://localhost:3001/api/v1"
  }
} else {
  Copy-Item (Join-Path $frontendRoot ".env.example") $frontendEnv
  Write-Host "Criado .env.local"
}

Write-Host "Iniciando PostgreSQL..." -ForegroundColor Cyan
docker compose up -d postgres
if ($LASTEXITCODE -ne 0) { throw "Não foi possível iniciar o Docker. Confirme se o Docker Desktop está aberto." }

$healthy = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
  $status = docker inspect --format='{{.State.Health.Status}}' dashboard-financeira-postgres 2>$null
  if ($status -eq "healthy") { $healthy = $true; break }
  Start-Sleep -Seconds 2
}
if (-not $healthy) { throw "O PostgreSQL não ficou saudável dentro do tempo esperado." }

Set-Location "$root/backend"
npm install
if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar as dependências do backend." }
npm run prisma:generate
if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar o Prisma Client." }
npm run prisma:deploy
if ($LASTEXITCODE -ne 0) { throw "Falha ao aplicar as migrations." }
npm run prisma:seed
if ($LASTEXITCODE -ne 0) { throw "Falha ao executar o seed." }

Set-Location $frontendRoot
npm install
if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar as dependências do frontend." }

Write-Host "Configuração concluída." -ForegroundColor Green
Write-Host "Login: lenon@ateliux.com.br"
Write-Host "Senha inicial: financeiro2026"
