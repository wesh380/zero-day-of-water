param(
    [string]$BaseUrl = 'https://filing-mere-plays-jobs.trycloudflare.com'
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
    $BaseUrl = 'https://filing-mere-plays-jobs.trycloudflare.com'
}
$BaseUrl = $BaseUrl.TrimEnd('/')

Write-Host ("Using BaseUrl: " + $BaseUrl)

$healthUrl = "$BaseUrl/api/health"
$submitUrl = "$BaseUrl/api/submit"

function Get-HeaderLines {
    param($Headers)

    $lines = @()
    if (-not $Headers) {
        return $lines
    }

    if ($Headers -is [System.Net.WebHeaderCollection]) {
        foreach ($key in $Headers.AllKeys) {
            $lines += ("    {0}: {1}" -f $key, $Headers.Get($key))
        }
    }
    elseif ($Headers -is [System.Net.Http.Headers.HttpHeaders]) {
        foreach ($entry in $Headers.GetEnumerator()) {
            $lines += ("    {0}: {1}" -f $entry.Key, (($entry.Value) -join ', '))
        }
    }
    elseif ($Headers -is [System.Collections.IDictionary]) {
        foreach ($key in $Headers.Keys) {
            $lines += ("    {0}: {1}" -f $key, $Headers[$key])
        }
    }

    return $lines
}

function Read-ResponseBody {
    param($Response)

    try {
        if ($Response -is [System.Net.Http.HttpResponseMessage]) {
            if ($Response.Content) {
                return $Response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            }
        }
        elseif ($Response -is [System.Net.HttpWebResponse]) {
            $stream = $Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                try {
                    return $reader.ReadToEnd()
                }
                finally {
                    $reader.Dispose()
                    $stream.Dispose()
                }
            }
        }
        elseif ($Response -is [System.Net.WebResponse]) {
            $stream = $Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                try {
                    return $reader.ReadToEnd()
                }
                finally {
                    $reader.Dispose()
                    $stream.Dispose()
                }
            }
        }
    }
    catch {
        return $null
    }

    return $null
}

function Write-ResponseSummary {
    param($Response)

    if (-not $Response) {
        return
    }

    try {
        if ($Response -is [System.Net.Http.HttpResponseMessage]) {
            $statusLine = "  HTTP {0} {1}" -f [int]$Response.StatusCode, $Response.ReasonPhrase
            Write-Host $statusLine
            $headerLines = @()
            $headerLines += Get-HeaderLines -Headers $Response.Headers
            if ($Response.Content) {
                $headerLines += Get-HeaderLines -Headers $Response.Content.Headers
            }
            if ($headerLines.Count) {
                Write-Host '  Headers:'
                $headerLines | Select-Object -First 10 | ForEach-Object { Write-Host $_ }
            }
            $body = Read-ResponseBody -Response $Response
            if ($body) {
                $snippet = $body.Trim()
                if ($snippet.Length -gt 500) {
                    $snippet = $snippet.Substring(0, 500) + '...'
                }
                Write-Host ("  Body: {0}" -f $snippet)
            }
            return
        }

        if ($Response -is [System.Net.WebResponse]) {
            $statusCode = $null
            $statusDescription = $null
            if ($Response.PSObject.Properties.Name -contains 'StatusCode') {
                $statusCode = [int]$Response.StatusCode
            }
            if ($Response.PSObject.Properties.Name -contains 'StatusDescription') {
                $statusDescription = $Response.StatusDescription
            }
            if ($statusCode -ne $null) {
                Write-Host ("  HTTP {0} {1}" -f $statusCode, $statusDescription)
            }
            $headerLines = Get-HeaderLines -Headers $Response.Headers
            if ($headerLines.Count) {
                Write-Host '  Headers:'
                $headerLines | Select-Object -First 10 | ForEach-Object { Write-Host $_ }
            }
            $body = Read-ResponseBody -Response $Response
            if ($body) {
                $snippet = $body.Trim()
                if ($snippet.Length -gt 500) {
                    $snippet = $snippet.Substring(0, 500) + '...'
                }
                Write-Host ("  Body: {0}" -f $snippet)
            }
        }
    }
    catch {
        Write-Host ("  (response summary unavailable: {0})" -f $_.Exception.Message)
    }
}

function Write-ErrorSummary {
    param([System.Management.Automation.ErrorRecord]$ErrorRecord)

    if (-not $ErrorRecord) {
        return
    }

    Write-Host ("  Exception: {0}: {1}" -f $ErrorRecord.Exception.GetType().FullName, $ErrorRecord.Exception.Message)

    $response = $null
    if ($ErrorRecord.Exception.PSObject.Properties['Response']) {
        $response = $ErrorRecord.Exception.Response
    }
    elseif ($ErrorRecord.Exception.PSObject.Properties['ResponseMessage']) {
        $response = $ErrorRecord.Exception.ResponseMessage
    }
    elseif ($ErrorRecord.Exception.InnerException -and $ErrorRecord.Exception.InnerException.PSObject.Properties['Response']) {
        $response = $ErrorRecord.Exception.InnerException.Response
    }

    if ($response) {
        Write-ResponseSummary -Response $response
    }

    if ($ErrorRecord.ErrorDetails -and $ErrorRecord.ErrorDetails.Message) {
        Write-Host ("  Details: {0}" -f $ErrorRecord.ErrorDetails.Message)
    }
}

function Fail {
    param(
        [string]$Message,
        [System.Management.Automation.ErrorRecord]$ErrorRecord = $null
    )

    Write-Host ("FAIL {0}" -f $Message)
    if ($ErrorRecord) {
        Write-ErrorSummary -ErrorRecord $ErrorRecord
    }
    exit 1
}

try {
    $health = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($null -ne $health -and $health.ok) {
        Write-Host 'Health: OK'
    }
    else {
        Fail 'health endpoint returned unexpected payload'
    }
}
catch {
    Fail 'health check error' $_
}

$jobPayload = [ordered]@{
    nodes = @(
        @{ id = 'n1'; label = 'Demand' }
        @{ id = 'n2'; label = 'Supply' }
    )
    edges = @(
        @{ source = 'n1'; target = 'n2'; sign = 'plus' }
    )
    meta = @{ model_id = 'health-check' }
}
$jobJson = $jobPayload | ConvertTo-Json -Depth 5

try {
    $submitResponse = Invoke-RestMethod -Uri $submitUrl -Method Post -ContentType 'application/json' -Body $jobJson -TimeoutSec 10 -ErrorAction Stop
}
catch {
    Fail 'submit error' $_
}

if (-not $submitResponse.job_id) {
    Fail 'submit response missing job_id'
}

$jobId = [string]$submitResponse.job_id
Write-Host ("Submitted job_id=" + $jobId)

$deadline = [DateTime]::UtcNow.AddSeconds(30)
$pollUrl = "$BaseUrl/api/result/$jobId"

while ([DateTime]::UtcNow -lt $deadline) {
    try {
        $result = Invoke-RestMethod -Uri $pollUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
    }
    catch {
        Write-Host ("Polling error: " + $_.Exception.Message)
        Write-ErrorSummary -ErrorRecord $_
        Start-Sleep -Seconds 1
        continue
    }

    if ($result -and $result.PSObject.Properties.Name -contains 'summary') {
        $summary = $result.summary
        $summaryText = "nodes={0} edges={1} has_meta={2}" -f $summary.nodes, $summary.edges, $summary.has_meta
        Write-Host ("DONE summary: " + $summaryText)
        exit 0
    }

    if ($result.status -eq 'failed') {
        Fail 'job reported failed state'
    }

    Start-Sleep -Seconds 1
}

Fail 'timeout waiting for job completion'
