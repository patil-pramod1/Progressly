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
    Remove-Item -LiteralPath $stdout, $stderr -Force -ErrorAction SilentlyContinue
    $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $WorkingDirectory -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
    return [pscustomobject]@{ name = $Name; pid = $process.Id; port = $null; url = $null; log = $stdout }
}

function Stop-TrackedProcesses {
    if (-not (Test-Path -LiteralPath $processFile)) { return }
    try { $tracked = Get-Content -LiteralPath $processFile -Raw | ConvertFrom-Json } catch { $tracked = @() }
    foreach ($entry in @($tracked)) {
        if (Get-Process -Id $entry.pid -ErrorAction SilentlyContinue) {
            & taskkill.exe /PID $entry.pid /T /F 2>$null | Out-Null
            Write-Host "Stopped stale $($entry.name) (PID $($entry.pid))" -ForegroundColor DarkGray
        }
    }
    Remove-Item -LiteralPath $processFile -Force -ErrorAction SilentlyContinue
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
    $env:PROMETHEUS_HOST = 'host.containers.internal'
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
} else {
    $env:PROMETHEUS_HOST = 'host.docker.internal'
}

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
Stop-TrackedProcesses
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
    @{ Name = 'service-discovery'; Directory = 'service-discovery'; Port = 8761; Url = 'http://localhost:8761/api/v1/health' },
    @{ Name = 'api-gateway'; Directory = 'api-gateway'; Port = 8080; Url = 'http://localhost:8080/api/v1/health' },
    @{ Name = 'identity-service'; Directory = 'identity-service'; Port = 8081; Url = 'http://localhost:8081/api/v1/health' },
    @{ Name = 'goal-service'; Directory = 'goal-service'; Port = 8082; Url = 'http://localhost:8082/api/v1/health' },
    @{ Name = 'activity-service'; Directory = 'activity-service'; Port = 8083; Url = 'http://localhost:8083/api/v1/health' },
    @{ Name = 'reporting-service'; Directory = 'reporting-service'; Port = 8084; Url = 'http://localhost:8084/api/v1/health' },
    @{ Name = 'notification-service'; Directory = 'notification-service'; Port = 8085; Url = 'http://localhost:8085/api/v1/health' }
)

foreach ($definition in $serviceDefinitions) {
    $directory = Join-Path $servicesRoot $definition.Directory
    $entry = Start-LocalProcess $definition.Name $directory $mvn @('spring-boot:run')
    $entry.port = $definition.Port
    $entry.url = $definition.Url
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
$frontendEntry.url = 'http://localhost:5173'
$processes += $frontendEntry
$processes | ConvertTo-Json | Set-Content -Path $processFile

Write-Host "`nWaiting for application processes (up to $TimeoutSeconds seconds)..." -ForegroundColor Cyan
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
do {
    Start-Sleep -Seconds 2
    $ready = @($processes | Where-Object { (Test-Port $_.port) -and (Test-Url $_.url) }).Count -eq $processes.Count
} while (-not $ready -and (Get-Date) -lt $deadline)

Write-Host "`nProgressly local status" -ForegroundColor White
Write-Host ('-' * 72)
foreach ($entry in $processes) {
    $isReady = (Test-Port $entry.port) -and (Test-Url $entry.url)
    $label = if ($isReady) { 'RUNNING' } else { 'NOT READY' }
    $color = if ($isReady) { 'Green' } else { 'Red' }
    Write-Host ("{0,-22} {1,-10} http://localhost:{2}  PID {3}" -f $entry.name, $label, $entry.port, $entry.pid) -ForegroundColor $color
}
Write-Host ("{0,-22} {1,-10} http://localhost:8025" -f 'mailpit', $(if (Test-Port 8025) { 'RUNNING' } else { 'NOT READY' }))
Write-Host ("{0,-22} {1,-10} http://localhost:9090" -f 'prometheus', $(if (Test-Port 9090) { 'RUNNING' } else { 'NOT READY' }))
Write-Host "`nLogs: $logRoot"
Write-Host 'Stop everything with: .\scripts\stop-local.ps1'
