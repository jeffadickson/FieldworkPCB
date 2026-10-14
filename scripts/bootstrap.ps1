param(
  [switch]$Doctor,
  [switch]$DepsOnly,
  [switch]$BrowsersOnly
)
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))
function Get-NodeMajor {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { return 0 }
  try { return [int]((node --version).TrimStart('v').Split('.')[0]) } catch { return 0 }
}
function Ensure-Node {
  if ((Get-NodeMajor) -ge 22 -and (Get-Command npm -ErrorAction SilentlyContinue)) { return }
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw 'Node 22+ missing; winget unavailable. Install Node LTS from https://nodejs.org/en/download then rerun.'
  }
  Write-Host 'Installing Node.js LTS using winget...'
  winget install --id OpenJS.NodeJS.LTS --exact --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) { throw 'winget installation failed.' }
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
  if ((Get-NodeMajor) -lt 22) { throw 'Node 22+ not found after installation. Open a new PowerShell session and retry.' }
}
function Install-Dependencies {
  if (Test-Path 'package-lock.json') { & npm.cmd ci }
  else { & npm.cmd install --no-audit --no-fund }
  if ($LASTEXITCODE -ne 0) { throw 'npm dependency installation failed.' }
}
function Install-Browser {
  & npx.cmd playwright install chromium
  if ($LASTEXITCODE -ne 0) { throw 'Playwright Chromium installation failed.' }
}
function Show-Doctor {
  Write-Host 'Platform: Windows'
  if (Get-Command node -ErrorAction SilentlyContinue) { & node --version } else { Write-Host 'Node missing' }
  if (Get-Command npm.cmd -ErrorAction SilentlyContinue) { & npm.cmd --version } else { Write-Host 'npm missing' }
  if (Get-Command git -ErrorAction SilentlyContinue) { & git --version } else { Write-Host 'Git optional and not installed' }
  if (Get-Command make -ErrorAction SilentlyContinue) { Write-Host 'GNU make installed' } else { Write-Host 'GNU make optional; invoke bootstrap.ps1 directly' }
}
if ($Doctor) { Show-Doctor; exit 0 }
Ensure-Node
if ($BrowsersOnly) { Install-Dependencies; Install-Browser; exit 0 }
Install-Dependencies
if (-not $DepsOnly) { Install-Browser }
Show-Doctor
