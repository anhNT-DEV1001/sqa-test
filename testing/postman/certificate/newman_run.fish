#!/usr/bin/env fish

# ==============================================================================
# NEWMAN CLI - Run Certificate API Postman Collection and generate HTML report
# ==============================================================================
# Requirements on Arch Linux:
#   sudo pacman -S nodejs npm
#   npm install -g newman newman-reporter-htmlextra
# ==============================================================================

if not type -q newman
  echo "ERROR: newman is not installed or is not in PATH."
  echo "Install it on Arch Linux with:"
  echo "  sudo pacman -S nodejs npm"
  echo "  npm install -g newman newman-reporter-htmlextra"
  exit 127
end

mkdir -p reports

newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "04 - Certificate APIs" \
  -r cli,htmlextra \
  --reporter-htmlextra-export reports/certificate_postman_report.html \
  --reporter-htmlextra-title "Academix Certificate API Test Report"

set newman_status $status

if test $newman_status -ne 0
  echo ""
  echo "ERROR: Newman run failed. No successful HTML report export was confirmed."
  exit $newman_status
end

echo ""
echo "Report generated: reports/certificate_postman_report.html"
