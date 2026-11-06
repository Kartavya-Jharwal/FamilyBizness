$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
  bun run ci:local
  if ($LASTEXITCODE -ne 0) { throw 'Local CI failed' }
} finally { Pop-Location }
