# ==============================================================================
# NEWMAN CLI - Run implemented Postman API test folders and generate HTML reports
# ==============================================================================
# Requirements: npm install -g newman newman-reporter-htmlextra
# ==============================================================================

if (-not (Get-Command newman -ErrorAction SilentlyContinue)) {
  Write-Error "newman is not installed or is not in PATH. Install with: npm install -g newman newman-reporter-htmlextra"
  exit 127
}

# Create report directories before Newman writes HTML files.
New-Item -ItemType Directory -Force -Path auth/reports | Out-Null
New-Item -ItemType Directory -Force -Path course/reports | Out-Null
New-Item -ItemType Directory -Force -Path exam/reports | Out-Null
New-Item -ItemType Directory -Force -Path certificate/reports | Out-Null
New-Item -ItemType Directory -Force -Path dashboard/reports | Out-Null

# Run Folder 01 - Auth APIs.
newman run Academix_API.postman_collection.json `
  -e Academix_ENV.postman_environment.json `
  --folder "01 - Auth APIs" `
  -r cli,htmlextra `
  --reporter-htmlextra-export auth/reports/auth_postman_report.html `
  --reporter-htmlextra-title "Academix Auth API Test Report"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Auth Newman run failed. Course tests were not started."
  exit $LASTEXITCODE
}

# Run Folder 02 - Course APIs.
newman run Academix_API.postman_collection.json `
  -e Academix_ENV.postman_environment.json `
  --folder "02 - Course APIs" `
  -r cli,htmlextra `
  --reporter-htmlextra-export course/reports/course_postman_report.html `
  --reporter-htmlextra-title "Academix Course API Test Report"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Course Newman run failed. No successful Course HTML report export was confirmed."
  exit $LASTEXITCODE
}

# Run Folder 03 - Exam APIs.
newman run Academix_API.postman_collection.json `
  -e Academix_ENV.postman_environment.json `
  --folder "03 - Exam APIs" `
  -r cli,htmlextra `
  --reporter-htmlextra-export exam/reports/exam_postman_report.html `
  --reporter-htmlextra-title "Academix Exam API Test Report"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Exam Newman run failed. No successful Exam HTML report export was confirmed."
  exit $LASTEXITCODE
}

# Run Folder 04 - Certificate APIs.
newman run Academix_API.postman_collection.json `
  -e Academix_ENV.postman_environment.json `
  --folder "04 - Certificate APIs" `
  -r cli,htmlextra `
  --reporter-htmlextra-export certificate/reports/certificate_postman_report.html `
  --reporter-htmlextra-title "Academix Certificate API Test Report"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Certificate Newman run failed. No successful Certificate HTML report export was confirmed."
  exit $LASTEXITCODE
}

# Run Folder 05 - Dashboard & Notifications.
newman run Academix_API.postman_collection.json `
  -e Academix_ENV.postman_environment.json `
  --folder "05 - Dashboard & Notifications" `
  -r cli,htmlextra `
  --reporter-htmlextra-export dashboard/reports/dashboard_notifications_postman_report.html `
  --reporter-htmlextra-title "Academix Dashboard & Notifications API Test Report"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Dashboard & Notifications Newman run failed. No successful Dashboard HTML report export was confirmed."
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Reports generated:"
Write-Host "- auth/reports/auth_postman_report.html"
Write-Host "- course/reports/course_postman_report.html"
Write-Host "- exam/reports/exam_postman_report.html"
Write-Host "- certificate/reports/certificate_postman_report.html"
Write-Host "- dashboard/reports/dashboard_notifications_postman_report.html"
