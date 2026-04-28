$files = Get-ChildItem -Path "w:\directory\haha\testing_project" -Recurse -Include *.vue,*.jsx -File | Where-Object { $_._FullName -notmatch "node_modules" }
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    if ($content -match "http://localhost:8001") {
        $content = $content.Replace("http://localhost:8001", "http://localhost:3000")
        $changed = $true
    }
    if ($content -match "http://localhost:8002") {
        $content = $content.Replace("http://localhost:8002", "http://localhost:3000")
        $changed = $true
    }
    if ($changed) {
        Set-Content $file.FullName -Value $content
        Write-Host "Updated $($file.FullName)"
    }
}
