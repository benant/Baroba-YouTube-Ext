# Baroba-YouTube-Ext build helper: package src/ into dist/
# Prefer calling Compress-Archive from SKILL.md if -File is blocked by execution policy.
# Usage from repo root:
#   powershell.exe -NoProfile -Command "& '.cursor/skills/baroba-build/scripts/build.ps1'"
# Optional: -Version 1.2.5  (defaults to version in src/manifest.json)

param(
    [string]$Version = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")
$srcDir = Join-Path $repoRoot "src"
$distDir = Join-Path $repoRoot "dist"
$manifestPath = Join-Path $srcDir "manifest.json"

if (-not (Test-Path $manifestPath)) {
    throw "manifest.json not found: $manifestPath"
}

if (-not $Version) {
    $manifest = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json
    $Version = $manifest.version
}

if (-not $Version) {
    throw "Could not determine version from manifest.json"
}

if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

$zipName = "Baroba-YouTube-Ext-v$Version.zip"
$zipPath = Join-Path $distDir $zipName

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

# Package src contents at ZIP root (not the src folder itself)
Compress-Archive -Path (Join-Path $srcDir "*") -DestinationPath $zipPath -Force

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
    $entries = $archive.Entries | ForEach-Object { $_.FullName }
    if ($entries -notcontains "manifest.json") {
        throw "ZIP validation failed: manifest.json missing at archive root"
    }
    Write-Host "Created: $zipPath"
    Write-Host "Version: $Version"
    Write-Host "Entries:"
    $entries | ForEach-Object { Write-Host "  $_" }
}
finally {
    $archive.Dispose()
}
