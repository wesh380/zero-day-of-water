param()

$ErrorActionPreference = 'Stop'

$baseUrl = 'http://127.0.0.1:8010'
$healthUrl = "$baseUrl/api/health"
$submitUrl = "$baseUrl/api/submit"

function Fail($message) {
    Write-Output "FAIL $message"
    exit 1
}

try {
    $health = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5
    if ($null -ne $health -and $health.ok) {
        Write-Output 'Health: OK'
    }
    else {
        Fail 'health endpoint returned unexpected payload'
    }
}
catch {
    Fail "health check error: $($_.Exception.Message)"
}

$jobPayload = [ordered]@{
    nodes = @(
        @{ id = 'n1'; label = 'Demand' }
        @{ id = 'n2'; label = 'Supply' }
    )
    edges = @(
        @{ source = 'n1'; target = 'n2'; sign = 'plus' }
    )
    meta = @{ model_id = 'health-check'; version = '0.1' }
}
$jobJson = $jobPayload | ConvertTo-Json -Depth 5

try {
    $submitResponse = Invoke-RestMethod -Uri $submitUrl -Method Post -ContentType 'application/json' -Body $jobJson
}
catch {
    Fail "submit error: $($_.Exception.Message)"
}

if (-not $submitResponse.job_id) {
    Fail 'submit response missing job_id'
}

$jobId = $submitResponse.job_id
Write-Output "Submitted job_id=$jobId"

$deadline = [DateTime]::UtcNow.AddSeconds(30)
$pollUrl = "$baseUrl/api/result/$jobId"

while ([DateTime]::UtcNow -lt $deadline) {
    try {
        $result = Invoke-RestMethod -Uri $pollUrl -Method Get -TimeoutSec 5
    }
    catch {
        Start-Sleep -Seconds 1
        continue
    }

    if ($result.PSObject.Properties.Name -contains 'summary') {
        $summary = $result.summary
        $summaryText = "nodes=$($summary.nodes) edges=$($summary.edges) has_meta=$($summary.has_meta)"
        Write-Output "DONE summary: $summaryText"
        exit 0
    }

    if ($result.status -eq 'failed') {
        Fail 'job reported failed state'
    }

    Start-Sleep -Seconds 1
}

Fail 'timeout waiting for job completion'
