[CmdletBinding()]
param()

$ErrorActionPreference = 'SilentlyContinue'
$projectRoot = Split-Path -Parent $PSScriptRoot
$processFile = Join-Path $projectRoot '.progressly-local\processes.json'

if (Test-Path $processFile) {
    $processes = Get-Content $processFile -Raw | ConvertFrom-Json
    foreach ($entry in @($processes)) {
        $process = Get-Process -Id $entry.pid -ErrorAction SilentlyContinue
        if ($process) {
            & taskkill.exe /PID $entry.pid /T /F 2>$null | Out-Null
            Write-Host "Stopped $($entry.name) (PID $($entry.pid))"
        }
    }
    Remove-Item $processFile -Force
}

$containerCli = if (Get-Command docker -ErrorAction SilentlyContinue) { 'docker' } elseif (Get-Command podman -ErrorAction SilentlyContinue) { 'podman' } else { $null }
if ($containerCli) {
    Push-Location $projectRoot
    try { & $containerCli compose down } finally { Pop-Location }
}
Write-Host 'Progressly application processes and local infrastructure stopped.'
