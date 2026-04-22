#!/usr/bin/env fish

# ==============================================================================
# NEWMAN CLI - Run Course API Postman Collection and generate HTML report
# ==============================================================================
# Requirements on Arch Linux:
#   sudo pacman -S nodejs npm
#   npm install -g newman newman-reporter-htmlextra
# ==============================================================================

# Stop early with a clear message if Newman is not installed.
if not type -q newman
  echo "ERROR: newman is not installed or is not in PATH."
  echo "Install it on Arch Linux with:"
  echo "  sudo pacman -S nodejs npm"
  echo "  npm install -g newman newman-reporter-htmlextra"
  exit 127
end

# Ensure the HTML report output directory exists before Newman writes the file.
mkdir -p reports

# Run only Folder 02 - Course APIs with CLI + HTML report output.
newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "02 - Course APIs" \
  -r cli,htmlextra \
  --reporter-htmlextra-export reports/course_postman_report.html \
  --reporter-htmlextra-title "Academix Course API Test Report"

set newman_status $status

if test $newman_status -ne 0
  echo ""
  echo "ERROR: Newman run failed. No successful HTML report export was confirmed."
  exit $newman_status
end

echo ""
echo "Report generated: reports/course_postman_report.html"
