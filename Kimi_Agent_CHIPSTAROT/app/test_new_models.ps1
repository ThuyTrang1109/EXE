$key = "AIzaSyBP2QMudxEAiUSpd-HMKU5wiiU5c-V9lp4"

$models = @(
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3-flash-preview",
    "gemini-3.1-pro-preview"
)

foreach ($model in $models) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=$key"
    $body = @{
        contents = @(@{ parts = @(@{ text = "Say hello" }) })
    } | ConvertTo-Json -Depth 5

    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Host "✅ $model - OK: $($response.candidates[0].content.parts[0].text.Substring(0, [Math]::Min(30, $response.candidates[0].content.parts[0].text.Length)))"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ $model - HTTP $statusCode"
    }
}
