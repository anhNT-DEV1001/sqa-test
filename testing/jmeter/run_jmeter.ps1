# ==============================================================================
# JMETER CLI — Chạy Performance Test và tạo HTML Dashboard
# ==============================================================================
# Yêu cầu: Apache JMeter 5.6+ (https://jmeter.apache.org)
# Java: JDK 8+
# ==============================================================================

# Đường dẫn JMeter (chỉnh lại nếu cài ở chỗ khác)
$JMETER_HOME = "C:\apache-jmeter-5.6.3"  # TODO: Chỉnh đường dẫn JMeter

# Chạy test plan ở chế độ CLI (non-GUI) và tạo HTML report
& "$JMETER_HOME\bin\jmeter.bat" `
  -n `
  -t Academix_Performance.jmx `
  -l results\results.jtl `
  -e `
  -o results\report

Write-Host ""
Write-Host "✅ JMeter HTML Dashboard: results/report/index.html"
