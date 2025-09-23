param()

$ErrorActionPreference = 'Stop'

$url = "https://wesh360.ir/config/api.json?v=$(Get-Random)"

try {
    $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -ErrorAction Stop
}
catch {
    Write-Error "request failed: $($_.Exception.Message)"
    exit 1
}

if ($response.StatusCode -ne 200) {
    Write-Error "unexpected status code: $($response.StatusCode)"
    exit 1
}

try {
    $config = $response.Content | ConvertFrom-Json -ErrorAction Stop
}
catch {
    Write-Error "invalid JSON payload"
    exit 1
}

if (-not ($config.PSObject.Properties.Name -contains 'baseUrl')) {
    Write-Error 'baseUrl field missing'
    exit 1
}

Write-Output "baseUrl: $($config.baseUrl)"
