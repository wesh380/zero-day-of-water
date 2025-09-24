$ErrorActionPreference="Stop"
$domain="api.wesh360.ir"; $upstream="127.0.0.1:8010"
$root="C:\wesh360"; $cdir="$root\caddy"; $logs="$root\logs\caddy"
New-Item -ItemType Directory -Force -Path $cdir,$logs | Out-Null
choco install caddy -y
netsh advfirewall firewall add rule name="HTTP In 80"  dir=in action=allow protocol=TCP localport=80   | Out-Null
netsh advfirewall firewall add rule name="HTTPS In 443" dir=in action=allow protocol=TCP localport=443 | Out-Null
$caddyFile="$cdir\Caddyfile"
@"
{
    email admin@wesh360.ir
}
$domain {
    encode zstd gzip
    reverse_proxy $upstream
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "no-referrer-when-downgrade"
    }
    log { output file $logs\api_access.log }
}
"@ | Out-File -Encoding utf8 $caddyFile
& "C:\ProgramData\chocolatey\lib\caddy\tools\caddy.exe" install --config $caddyFile
Start-Sleep 1
Start-Service caddy