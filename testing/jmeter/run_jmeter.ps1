# ==============================================================================
# JMETER CLI — Chạy Performance Test và tạo HTML Dashboard
# ==============================================================================
# Yêu cầu: Apache JMeter 5.6+ (https://jmeter.apache.org)
# Java: JDK 8+
# ==============================================================================

# Đường dẫn JMeter (chỉnh lại nếu cài ở chỗ khác)
$JMETER_HOME = "D:\download\apache-jmeter-5.6.3\apache-jmeter-5.6.3"

# Xóa kết quả cũ nếu có (JMeter yêu cầu thư mục report phải trống)
if (Test-Path "results") {
    Remove-Item -Recurse -Force "results"
}
New-Item -ItemType Directory -Force -Path "results"

# Chạy test plan ở chế độ CLI (non-GUI) và tạo HTML report
& "$JMETER_HOME\bin\jmeter.bat" `
  -n `
  -t Academix_Performance.jmx `
  -l results\results.jtl `
  -e `
  -o results\report

Write-Host ""
Write-Host "✅ JMeter HTML Dashboard: results/report/index.html"
