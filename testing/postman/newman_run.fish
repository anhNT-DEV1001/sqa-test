#!/usr/bin/env fish

# ==============================================================================
# NEWMAN CLI - Run implemented Postman API test folders and generate HTML reports
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

mkdir -p auth/reports course/reports exam/reports certificate/reports dashboard/reports

newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "01 - Auth APIs" \
  -r cli,htmlextra \
  --reporter-htmlextra-export auth/reports/auth_postman_report.html \
  --reporter-htmlextra-title "Academix Auth API Test Report"

set auth_status $status
if test $auth_status -ne 0
  echo ""
  echo "ERROR: Auth Newman run failed. Course tests were not started."
  exit $auth_status
end

newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "02 - Course APIs" \
  -r cli,htmlextra \
  --reporter-htmlextra-export course/reports/course_postman_report.html \
  --reporter-htmlextra-title "Academix Course API Test Report"

set course_status $status
if test $course_status -ne 0
  echo ""
  echo "ERROR: Course Newman run failed. No successful Course HTML report export was confirmed."
  exit $course_status
end

newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "03 - Exam APIs" \
  -r cli,htmlextra \
  --reporter-htmlextra-export exam/reports/exam_postman_report.html \
  --reporter-htmlextra-title "Academix Exam API Test Report"

set exam_status $status
if test $exam_status -ne 0
  echo ""
  echo "ERROR: Exam Newman run failed. No successful Exam HTML report export was confirmed."
  exit $exam_status
end

newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "04 - Certificate APIs" \
  -r cli,htmlextra \
  --reporter-htmlextra-export certificate/reports/certificate_postman_report.html \
  --reporter-htmlextra-title "Academix Certificate API Test Report"

set certificate_status $status
if test $certificate_status -ne 0
  echo ""
  echo "ERROR: Certificate Newman run failed. No successful Certificate HTML report export was confirmed."
  exit $certificate_status
end

newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "05 - Dashboard & Notifications" \
  -r cli,htmlextra \
  --reporter-htmlextra-export dashboard/reports/dashboard_notifications_postman_report.html \
  --reporter-htmlextra-title "Academix Dashboard & Notifications API Test Report"

set dashboard_status $status
if test $dashboard_status -ne 0
  echo ""
  echo "ERROR: Dashboard & Notifications Newman run failed. No successful Dashboard HTML report export was confirmed."
  exit $dashboard_status
end

echo ""
echo "Reports generated:"
echo "- auth/reports/auth_postman_report.html"
echo "- course/reports/course_postman_report.html"
echo "- exam/reports/exam_postman_report.html"
echo "- certificate/reports/certificate_postman_report.html"
echo "- dashboard/reports/dashboard_notifications_postman_report.html"
