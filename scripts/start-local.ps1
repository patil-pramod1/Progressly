[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [int]$TimeoutSeconds = 90
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$servicesRoot = Join-Path $projectRoot 'services'
$frontendRoot = Join-Path $projectRoot 'frontend'
$runtimeRoot = Join-Path $projectRoot '.progressly-local'
$logRoot = Join-Path $runtimeRoot 'logs'
$processFile = Join-Path $runtimeRoot 'processes.json'

function Require-Command([string]$Name, [string]$InstallHint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name was not found on PATH. $InstallHint"
    }
}

function Start-LocalProcess([string]$Name, [string]$WorkingDirectory, [string]$FilePath, [string[]]$Arguments) {
    $stdout = Join-Path $logRoot "$Name.out.log"
    $stderr = Join-Path $logRoot "$Name.err.log"
    $argumentList = @('-NoLogo', '-NoProfile', '-Command', "Set-Location -LiteralPath '$WorkingDirectory'; & '$FilePath' $($Arguments -join ' ')")
    $process = Start-Process -FilePath 'powershell.exe' -ArgumentList $argumentList -WorkingDirectory $WorkingDirectory -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
    return [pscustomobject]@{ name = $Name; pid = $process.Id; port = $null; log = $stdout }
}

function Test-Port([int]$Port) {
    try { return (Test-NetConnection -ComputerName 'localhost' -Port $Port -WarningAction SilentlyContinue).TcpTestSucceeded } catch { return $false }
}

function Test-Url([string]$Url) {
    try { Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 | Out-Null; return $true } catch { return $false }
}

Require-Command 'mvn' 'Install Maven 3.9+ and Java 21, then restart PowerShell.'
Require-Command 'npm.cmd' 'Install Node.js 20+.'

$containerCli = $null
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $containerCli = 'docker'
} elseif (Get-Command podman -ErrorAction SilentlyContinue) {
    $containerCli = 'podman'
} else {
    throw 'Neither docker nor podman was found on PATH. Install Docker Desktop or Podman Desktop, start its local machine, and reopen PowerShell.'
}

if (-not (Get-Command "$containerCli-compose" -ErrorAction SilentlyContinue)) {
    try { & $containerCli compose version | Out-Null } catch { throw "$containerCli compose is unavailable. Install the Compose provider for $containerCli." }
}

if ($containerCli -eq 'podman') {
    Write-Host 'Checking Podman machine...' -ForegroundColor Cyan
    $machineName = 'podman-machine-default'
    $machineState = $null
    try {
        $machineState = (& podman machine inspect $machineName --format '{{.State}}' 2>$null | Select-Object -First 1)
    } catch {
        # A missing default machine is expected on first startup.
        $machineState = $null
    }
    if (-not $machineState) {
        Write-Host 'Initializing Podman machine. This downloads a one-time Linux VM image.' -ForegroundColor Yellow
        & podman machine init $machineName
        if ($LASTEXITCODE -ne 0) { throw 'Podman machine initialization failed.' }
        $machineState = 'Stopped'
    }
    if ($machineState.Trim() -ne 'Running') {
        Write-Host 'Starting Podman machine...' -ForegroundColor Cyan
        & podman machine start $machineName
        if ($LASTEXITCODE -ne 0) { throw 'Podman machine could not be started.' }
    }
    & podman info | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Podman is installed, but the Podman machine is not reachable.' }
    Write-Host 'Podman machine is ready.' -ForegroundColor Green
}

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
if (-not (Test-Path (Join-Path $projectRoot '.env'))) {
    Copy-Item (Join-Path $projectRoot '.env.example') (Join-Path $projectRoot '.env')
    Write-Host 'Created .env from .env.example' -ForegroundColor Yellow
}

Write-Host 'Starting Progressly infrastructure...' -ForegroundColor Cyan
Push-Location $projectRoot
try { & $containerCli compose up -d } finally { Pop-Location }

if (-not $SkipBuild) {
    Write-Host 'Building microservices...' -ForegroundColor Cyan
    Push-Location $servicesRoot
    try { mvn clean package -DskipTests } finally { Pop-Location }
}

$processes = @()
$mvn = (Get-Command mvn).Source
$serviceDefinitions = @(
    @{ Name = 'service-discovery'; Directory = 'service-discovery'; Port = 8761 },
    @{ Name = 'api-gateway'; Directory = 'api-gateway'; Port = 8080 },
    @{ Name = 'identity-service'; Directory = 'identity-service'; Port = 8081 },
    @{ Name = 'goal-service'; Directory = 'goal-service'; Port = 8082 },
    @{ Name = 'activity-service'; Directory = 'activity-service'; Port = 8083 },
    @{ Name = 'reporting-service'; Directory = 'reporting-service'; Port = 8084 },
    @{ Name = 'notification-service'; Directory = 'notification-service'; Port = 8085 }
)

foreach ($definition in $serviceDefinitions) {
    $directory = Join-Path $servicesRoot $definition.Directory
    $entry = Start-LocalProcess $definition.Name $directory $mvn @('spring-boot:run')
    $entry.port = $definition.Port
    $processes += $entry
    Write-Host "Started $($definition.Name) (PID $($entry.pid))" -ForegroundColor DarkGray
}

if (-not (Test-Path (Join-Path $frontendRoot 'node_modules'))) {
    Write-Host 'Installing frontend dependencies...' -ForegroundColor Cyan
    Push-Location $frontendRoot
    try { npm.cmd install } finally { Pop-Location }
}

$frontendEntry = Start-LocalProcess 'frontend' $frontendRoot (Get-Command npm.cmd).Source @('run', 'dev', '--', '--host', 'localhost')
$frontendEntry.port = 5173
$processes += $frontendEntry
$processes | ConvertTo-Json | Set-Content -Path $processFile

Write-Host "`nWaiting for application processes (up to $TimeoutSeconds seconds)..." -ForegroundColor Cyan
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
do {
    Start-Sleep -Seconds 2
    $ready = @($processes | Where-Object { Test-Port $_.port }).Count -eq $processes.Count
} while (-not $ready -and (Get-Date) -lt $deadline)

Write-Host "`nProgressly local status" -ForegroundColor White
Write-Host ('-' * 72)
foreach ($entry in $processes) {
    $isReady = Test-Port $entry.port
    $label = if ($isReady) { 'RUNNING' } else { 'NOT READY' }
    $color = if ($isReady) { 'Green' } else { 'Red' }
    Write-Host ("{0,-22} {1,-10} http://localhost:{2}  PID {3}" -f $entry.name, $label, $entry.port, $entry.pid) -ForegroundColor $color
}
Write-Host ("{0,-22} {1,-10} http://localhost:8025" -f 'mailpit', $(if (Test-Port 8025) { 'RUNNING' } else { 'NOT READY' }))
Write-Host "`nLogs: $logRoot"
Write-Host 'Stop everything with: .\scripts\stop-local.ps1'
