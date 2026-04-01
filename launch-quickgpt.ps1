param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Escape-SingleQuoted {
    param([string]$Value)
    return $Value -replace "'", "''"
}

function Resolve-AgentPython {
    param([string]$AgentDir)

    $venvPython = Join-Path $AgentDir "venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        return $venvPython
    }

    $pyCommand = Get-Command py -ErrorAction SilentlyContinue
    if ($pyCommand) {
        return $pyCommand.Source
    }

    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCommand) {
        return $pythonCommand.Source
    }

    throw "Python was not found. Install Python or create agent\venv first."
}

function Start-ComponentWindow {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )

    $safeTitle = Escape-SingleQuoted $Title
    $safeWorkingDirectory = Escape-SingleQuoted $WorkingDirectory
    $windowCommand = "& { `$Host.UI.RawUI.WindowTitle = '$safeTitle'; Set-Location -LiteralPath '$safeWorkingDirectory'; $Command }"

    if ($DryRun) {
        Write-Host "[$Title]"
        Write-Host "  Dir: $WorkingDirectory"
        Write-Host "  Cmd: $Command"
        return
    }

    Start-Process -FilePath "powershell.exe" `
        -WorkingDirectory $WorkingDirectory `
        -ArgumentList @(
            "-NoExit",
            "-ExecutionPolicy", "Bypass",
            "-Command", $windowCommand
        ) | Out-Null
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$clientDir = Join-Path $projectRoot "client"
$serverDir = Join-Path $projectRoot "server"
$wsServerDir = Join-Path $projectRoot "ws-server"
$agentDir = Join-Path $projectRoot "agent"

$requiredDirs = @($clientDir, $serverDir, $wsServerDir, $agentDir)
foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        throw "Missing required folder: $dir"
    }
}

$agentPython = Resolve-AgentPython -AgentDir $agentDir
$safeAgentPython = Escape-SingleQuoted $agentPython

Write-Host "Launching QuickGPT stack from $projectRoot"

Start-ComponentWindow -Title "QuickGPT Backend" -WorkingDirectory $serverDir -Command "npm start"
Start-ComponentWindow -Title "QuickGPT WS Server" -WorkingDirectory $wsServerDir -Command "npm start"
Start-ComponentWindow -Title "QuickGPT Frontend" -WorkingDirectory $clientDir -Command "npm run dev"

if (-not $DryRun) {
    Start-Sleep -Seconds 3
}

Start-ComponentWindow -Title "QuickGPT Agent" -WorkingDirectory $agentDir -Command "& '$safeAgentPython' 'agent.py'"

Write-Host ""
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:3000"
Write-Host "WS:       http://localhost:5000"
Write-Host "Agent:    connected through ws-server"
