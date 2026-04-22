# ==============================================================================
# NEWMAN CLI — Chạy Postman Collection và tạo HTML Report
# ==============================================================================
# Yêu cầu: npm install -g newman newman-reporter-htmlextra
# ==============================================================================

# Chạy toàn bộ collection với HTML report
newman run Academix_API.postman_collection.json `
  -e Academix_ENV.postman_environment.json `
  -r htmlextra `
  --reporter-htmlextra-export reports/postman_report.html `
  --reporter-htmlextra-title "Academix API Test Report"

Write-Host ""
Write-Host "✅ Report generated: reports/postman_report.html"
