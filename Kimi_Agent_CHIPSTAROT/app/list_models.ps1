$key = "AIzaSyBP2QMudxEAiUSpd-HMKU5wiiU5c-V9lp4"
$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$key"
$response = Invoke-RestMethod -Uri $url -Method Get
$response.models | Select-Object name, version, supportedGenerationMethods | Format-Table -AutoSize
