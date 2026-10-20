# Windows: stop local nginx reverse proxy
$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
node "$Root\local-dev\proxy.js" stop
