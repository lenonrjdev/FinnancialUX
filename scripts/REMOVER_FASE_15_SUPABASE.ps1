$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $root "frontend"

$paths = @(
  "supabase",
  "lib/supabase",
  "lib/hooks/use-workspace-module-state.ts",
  "lib/sync-storage.ts",
  "lib/access-repository.ts",
  "lib/auth.ts",
  "lib/env.ts",
  "lib/invitations.ts",
  "lib/workspaces.ts",
  "types/sync.ts",
  "proxy.ts",
  "app/auth/callback",
  "app/api/health",
  "app/offline",
  "app/manifest.ts",
  "components/pwa",
  "public/sw.js",
  "public/icons",
  "content/sistema.ts",
  "components/system",
  "components/configuracoes/system-panel.tsx",
  "tests/sync-storage.test.ts",
  "scripts/validate-env.mjs"
)

foreach ($relative in $paths) {
  $target = Join-Path $frontendRoot $relative
  if (Test-Path $target) {
    Remove-Item $target -Recurse -Force
    Write-Host "Removido: $relative"
  }
}

Write-Host "Arquivos da implementação Supabase removidos." -ForegroundColor Green
