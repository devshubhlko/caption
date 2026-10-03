param($file); $lines = Get-Content $file; $lines[0] = $lines[0] -replace "^pick", "edit"; $lines | Set-Content $file
