# ==============================================================================
# NEWMAN CLI - Run Dashboard & Notifications API tests and generate HTML report
# ==============================================================================
# Requirements: npm install -g newman newman-reporter-htmlextra
# ==============================================================================

if (-not (Get-Command newman -ErrorAction SilentlyContinue)) {
  Write-Error "newman is not installed or is not in PATH. Install with: npm install -g newman newman-reporter-htmlextra"
  exit 127
}

New-Item -ItemType Directory -Force -Path reports | Out-Null

newman run Academix_API.postman_collection.json `
  -e Academix_ENV.postman_environment.json `
  --folder "05 - Dashboard & Notifications" `
  -r cli,htmlextra `
  --reporter-htmlextra-export reports/dashboard_notifications_postman_report.html `
  --reporter-htmlextra-title "Academix Dashboard & Notifications API Test Report"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Newman run failed. No successful HTML report export was confirmed."
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Report generated: reports/dashboard_notifications_postman_report.html"
