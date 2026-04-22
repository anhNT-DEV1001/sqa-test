# ==============================================================================
# NEWMAN CLI — Chạy Postman Collection và tạo HTML Report
# ==============================================================================
# Yêu cầu: npm install -g newman newman-reporter-htmlextra
# ==============================================================================

if (-not (Get-Command newman -ErrorAction SilentlyContinue)) {
  Write-Error "newman is not installed or is not in PATH. Install with: npm install -g newman newman-reporter-htmlextra"
  exit 127
}

# Tạo thư mục HTML report trước khi Newman ghi file
New-Item -ItemType Directory -Force -Path reports | Out-Null

# Chạy riêng Folder 01 - Auth APIs với HTML report
newman run Academix_API.postman_collection.json `
  -e Academix_ENV.postman_environment.json `
  --folder "01 - Auth APIs" `
  -r cli,htmlextra `
  --reporter-htmlextra-export reports/auth_postman_report.html `
  --reporter-htmlextra-title "Academix Auth API Test Report"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Newman run failed. No successful HTML report export was confirmed."
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Report generated: reports/auth_postman_report.html"
