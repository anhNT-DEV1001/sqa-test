# POSTMAN API TEST REPORT - Academix Platform

> **Tool:** Postman + Newman CLI + newman-reporter-htmlextra  
> **Base URL:** http://localhost:8000/api/v1  
> **Report Date:** 2026-04-22  
> **Tester:** _Fill in name_

---

## 1. Test Cases Summary

| Folder | Module | # TCs | Pass | Fail | Status |
|--------|--------|-------|------|------|--------|
| 01 - Auth APIs | Authentication | 11 | 11 | 0 | Executed - HTML report generated |
| 02 - Course APIs | Course CRUD | 7 | 7 | 0 | Executed - HTML report generated |
| 03 - Exam APIs | Exam Management | 12 | 12 | 0 | Executed - HTML report generated |
| 04 - Certificate APIs | Certificates | 7 | 7 | 0 | Executed - HTML report generated |
| 05 - Dashboard & Notifications | Dashboard & Notifications | 5 | 5 | 0 | Executed - HTML report generated |
| **Total** | | **42** | **42** | **0** | All Postman API test folders executed |

## 2. Execution Commands

### Run Implemented Folders Together

```fish
cd testing/postman
fish ./newman_run.fish
```

This runs Folder 01 Auth APIs first, then Folder 02 Course APIs, then Folder 03 Exam APIs, then Folder 04 Certificate APIs, then Folder 05 Dashboard & Notifications, and writes separate HTML reports.

### Auth APIs

```fish
cd testing/postman/auth
fish ./newman_run.fish
```

Expected HTML report:

```text
testing/postman/auth/reports/auth_postman_report.html
```

### Course APIs

```fish
cd testing/postman/course
fish ./newman_run.fish
```

Expected HTML report:

```text
testing/postman/course/reports/course_postman_report.html
```

Direct Course Newman command:

```fish
cd testing/postman/course
mkdir -p reports
newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "02 - Course APIs" \
  -r cli,htmlextra \
  --reporter-htmlextra-export reports/course_postman_report.html \
  --reporter-htmlextra-title "Academix Course API Test Report"
```

### Exam APIs

```fish
cd testing/postman/exam
fish ./newman_run.fish
```

Expected HTML report:

```text
testing/postman/exam/reports/exam_postman_report.html
```

Direct Exam Newman command:

```fish
cd testing/postman/exam
mkdir -p reports
newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "03 - Exam APIs" \
  -r cli,htmlextra \
  --reporter-htmlextra-export reports/exam_postman_report.html \
  --reporter-htmlextra-title "Academix Exam API Test Report"
```

### Certificate APIs

```fish
cd testing/postman/certificate
fish ./newman_run.fish
```

Expected HTML report:

```text
testing/postman/certificate/reports/certificate_postman_report.html
```

Direct Certificate Newman command:

```fish
cd testing/postman/certificate
mkdir -p reports
newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "04 - Certificate APIs" \
  -r cli,htmlextra \
  --reporter-htmlextra-export reports/certificate_postman_report.html \
  --reporter-htmlextra-title "Academix Certificate API Test Report"
```

### Dashboard & Notifications

```fish
cd testing/postman/dashboard
fish ./newman_run.fish
```

Expected HTML report:

```text
testing/postman/dashboard/reports/dashboard_notifications_postman_report.html
```

Direct Dashboard & Notifications Newman command:

```fish
cd testing/postman/dashboard
mkdir -p reports
newman run Academix_API.postman_collection.json \
  -e Academix_ENV.postman_environment.json \
  --folder "05 - Dashboard & Notifications" \
  -r cli,htmlextra \
  --reporter-htmlextra-export reports/dashboard_notifications_postman_report.html \
  --reporter-htmlextra-title "Academix Dashboard & Notifications API Test Report"
```

## 3. Execution Status

The Auth, Course, Exam, Certificate, and Dashboard & Notifications API collection files parse successfully as valid Postman Collection v2.1 JSON.

The latest Newman HTML reports were generated successfully:

| Report | Path | Failed Tests |
|--------|------|--------------|
| Auth APIs | `testing/postman/auth/reports/auth_postman_report.html` | 0 |
| Course APIs | `testing/postman/course/reports/course_postman_report.html` | 0 |
| Exam APIs | `testing/postman/exam/reports/exam_postman_report.html` | 0 |
| Certificate APIs | `testing/postman/certificate/reports/certificate_postman_report.html` | 0 |
| Dashboard & Notifications | `testing/postman/dashboard/reports/dashboard_notifications_postman_report.html` | 0 |

Result: all 42 counted API test cases passed based on the generated Newman HTML reports.

To rerun from fish terminal, start the backend first and then execute:

```fish
cd testing/postman
fish ./newman_run.fish
```

## 4. Auth API Test Cases

| TC ID | Method | Endpoint | Purpose | Expected | Actual | Status | Notes |
|-------|--------|----------|---------|----------|--------|--------|-------|
| TC_PM_AUTH_01 | POST | `/auth/register` | Register student successfully | `201`, `success=true` | 201 Created; success=true; response time 299ms; assertions passed | Passed | Creates a temporary unique student account. |
| TC_PM_AUTH_02 | POST | `/auth/register` | Reject duplicate email | `409`, `success=false`, `error.code=CONFLICT` | 409 Conflict; error.code=CONFLICT; response time 66ms; assertions passed | Passed | Reuses the email from TC_PM_AUTH_01. |
| TC_PM_AUTH_03 | POST | `/auth/register` | Reject invalid registration data | `400`, validation error | 400 Bad Request; validation error returned; response time 7ms; assertions passed | Passed | Invalid username, fullName, email, password, and role. |
| TC_PM_AUTH_04 | POST | `/auth/login` | Login successfully | `200`, save `accessToken`, `refreshToken`, `studentId` | 200 OK; accessToken/refreshToken/studentId saved; response time 187ms; assertions passed | Passed | Uses seed account `anhnt36`. |
| TC_PM_AUTH_05 | POST | `/auth/login` | Reject wrong password | `401`, unauthorized error | 401 Unauthorized; error.code=UNAUTHORIZED; response time 94ms; assertions passed | Passed | Negative login test. |
| TC_PM_AUTH_06 | POST | `/auth/login` | Reject non-existent user | `401`, unauthorized error | 401 Unauthorized; error.code=UNAUTHORIZED; response time 35ms; assertions passed | Passed | Confirms account existence is not leaked. |
| TC_PM_AUTH_07 | GET | `/auth/profile` | Get profile with bearer token | `200`, user data | 200 OK; authenticated user profile returned; response time 101ms; assertions passed | Passed | Uses token from TC_PM_AUTH_04. |
| TC_PM_AUTH_08 | GET | `/auth/profile` | Reject profile request without token | `401`, unauthorized error | 401 Unauthorized; no-token request rejected; response time 5ms; assertions passed | Passed | Request uses `noauth`. |
| TC_PM_AUTH_09 | PUT | `/auth/profile` | Update profile | `200`, updated `fullName` | 200 OK; fullName updated and cleanup restored it; response time 91ms; assertions passed | Passed | Script restores original `fullName` after assertion. |
| TC_PM_AUTH_10 | POST | `/auth/change-password` | Change password | `200`, `success=true` | 200 OK; password changed, rollback login/restoration succeeded; response time 179ms; assertions passed | Passed | Script changes to a temporary password, logs in, restores the seed password, then refreshes tokens. |
| TC_PM_AUTH_11 | POST | `/auth/refresh` | Refresh tokens | `200`, new `accessToken`, `refreshToken` | 200 OK; refreshed accessToken/refreshToken saved; response time 184ms; assertions passed | Passed | Uses the latest refresh token after password rollback. |

## 5. Course API Test Cases

Course tests are implemented in:

```text
testing/postman/course/Academix_API.postman_collection.json
```

The Course folder contains one setup request plus 7 counted Course test cases. The setup request logs in with the seed teacher account and saves `accessToken`, `refreshToken`, and `teacherId` for the Course requests.

| TC ID | Method | Endpoint | Purpose | Expected | Actual | Status | Notes |
|-------|--------|----------|---------|----------|--------|--------|-------|
| SETUP_COURSE | POST | `/auth/login` | Login as teacher before Course tests | `200`, save teacher token and `teacherId` | 200 OK; teacher token and teacherId saved; response time 225ms; setup passed | Passed | Setup request; not counted as a Course TC. |
| TC_PM_COURSE_01 | POST | `/courses` | Create a course | `201`, `success=true`, course data returned | 201 Created; courseId/publicId saved; response time 152ms; assertions passed | Passed | Generates a unique `courseName`; saves `courseId` and `coursePublicId`. |
| TC_PM_COURSE_02 | POST | `/courses` | Reject empty course name | `400`, validation error | 400 Bad Request; validation error returned; response time 63ms; assertions passed | Passed | Sends `courseName=""` with a valid `teacherId`. |
| TC_PM_COURSE_03 | GET | `/courses/teacher/:teacherId` | List teacher courses | `200`, courses array includes created course | 200 OK; created course found in list; response time 143ms; assertions passed | Passed | Depends on TC_PM_COURSE_01. |
| TC_PM_COURSE_04 | GET | `/courses/teacher/:teacherId?search=x` | Search teacher courses | `200`, search result includes created course | 200 OK; search result includes created course; response time 140ms; assertions passed | Passed | Searches by generated course name. |
| TC_PM_COURSE_05 | PATCH | `/courses/:courseId/name` | Update course name | `200`, updated `courseName` returned | 200 OK; updated courseName returned; response time 174ms; assertions passed | Passed | Depends on saved `courseId`. |
| TC_PM_COURSE_06 | DELETE | `/courses/delete/:courseId` | Delete created course | `200`, deletion success message | 200 OK; course deleted successfully; response time 120ms; assertions passed | Passed | Rollback step for TC_PM_COURSE_01. |
| TC_PM_COURSE_07 | DELETE | `/courses/delete/000000000000000000000000` | Delete non-existent course | `404`, `error.code=NOT_FOUND` | 404 Not Found; error.code=NOT_FOUND; response time 91ms; assertions passed | Passed | Uses a valid ObjectId format that should not exist. |

## 6. Exam API Test Cases

Exam tests are implemented in:

```text
testing/postman/exam/Academix_API.postman_collection.json
```

The Exam folder contains 3 setup requests plus 12 counted Exam test cases. Setup requests log in as the seed teacher, create a temporary teacher-owned course, and log in as the seed student. The temporary exam is deleted in `TC_PM_EXAM_07`, and the temporary course is deleted by that test's cleanup script.

| TC ID | Method | Endpoint | Purpose | Expected | Actual | Status | Notes |
|-------|--------|----------|---------|----------|--------|--------|-------|
| SETUP_EXAM_01 | POST | `/auth/login` | Login as teacher before Exam tests | `200`, save teacher token and `teacherId` | 200 OK; teacher token and teacherId saved; response time 226ms; setup passed | Passed | Setup request; not counted as an Exam TC. |
| SETUP_EXAM_02 | POST | `/courses` | Create a temporary course for Exam tests | `201`, save `examCourseId` | 201 Created; temporary course created and examCourseId saved; response time 156ms; setup passed | Passed | Required because `POST /exams` validates course ownership. |
| TC_PM_EXAM_01 | POST | `/exams` | Create exam as teacher | `201`, `success=true`, exam data returned | 201 Created; examId/publicId/questionId saved; response time 222ms; assertions passed | Passed | Saves `examId`, `examPublicId`, and first question ID. |
| TC_PM_EXAM_02 | POST | `/exams` | Reject create exam without auth | `401`, `error.code=UNAUTHORIZED` | 401 Unauthorized; no-auth create rejected; response time 5ms; assertions passed | Passed | Uses `noauth` on the same create payload. |
| TC_PM_EXAM_03 | GET | `/exams/:id` | Get exam by ID | `200`, full exam details | 200 OK; full exam details returned; response time 119ms; assertions passed | Passed | Uses owning teacher token. |
| SETUP_EXAM_03 | POST | `/auth/login` | Login as student before student Exam tests | `200`, save student token and `studentId` | 200 OK; student token and studentId saved; response time 180ms; setup passed | Passed | Setup request; not counted as an Exam TC. |
| TC_PM_EXAM_04 | GET | `/exams/:id` | Reject non-owner exam detail access | `403`, `error.code=FORBIDDEN` | 403 Forbidden; non-owner access rejected; response time 32ms; assertions passed | Passed | Uses student token against teacher-only detail endpoint. |
| TC_PM_EXAM_05 | PUT | `/exams/:id` | Update exam | `200`, updated title and questions returned | 200 OK; updated title/questions returned; response time 212ms; assertions passed | Passed | Replaces metadata and questions for the created exam. |
| TC_PM_EXAM_06 | PATCH | `/exams/:id/status` | Transition exam status to active | `200`, exam status `active` | 200 OK; exam status active; response time 115ms; assertions passed | Passed | Uses a start time in the past and end time in the future. |
| TC_PM_EXAM_08 | POST | `/exams/join` | Student join exam | `200`, join card data returned | 200 OK; join card data returned; response time 120ms; assertions passed | Passed | Uses the active exam public ID. |
| TC_PM_EXAM_09 | GET | `/exams/:publicId/take` | Get exam for taking | `200`, questions without correct answers | 200 OK; take-safe questions returned; response time 122ms; assertions passed | Passed | Saves `examTakeQuestionId` for submission. |
| TC_PM_EXAM_10 | POST | `/exams/:publicId/submit` | Submit answers | `201`, graded result and `submissionId` | 201 Created; submissionId and score returned; response time 178ms; assertions passed | Passed | Submits one answer for the active exam. |
| TC_PM_EXAM_11 | GET | `/exams/:id/results` | Get exam results | `200`, results array returned | 200 OK; exam results array returned; response time 157ms; assertions passed | Passed | Uses owning teacher token after submission. |
| TC_PM_EXAM_12 | GET | `/exams/teacher/:id` | List exams with pagination | `200`, paginated exams include created exam | 200 OK; paginated list includes created exam; response time 124ms; assertions passed | Passed | Filters by temporary course ID. |
| TC_PM_EXAM_07 | DELETE | `/exams/:id` | Delete exam | `200`, deletion success message | 200 OK; exam deleted and course cleanup passed; response time 126ms; assertions passed | Passed | Executed last as cleanup; also deletes the temporary exam course. |

## 7. Certificate API Test Cases

Certificate tests are implemented in:

```text
testing/postman/certificate/Academix_API.postman_collection.json
```

The Certificate folder contains 5 setup requests plus 7 counted Certificate test cases. Setup requests log in as the seed teacher, create a temporary course, create an active exam, log in as the seed student, and submit the exam to create the graded submission required by `POST /certificates/issue`. `TC_PM_CERT_05` revokes the created certificate, and `TC_PM_CERT_07` cleans up the temporary exam and course.

| TC ID | Method | Endpoint | Purpose | Expected | Actual | Status | Notes |
|-------|--------|----------|---------|----------|--------|--------|-------|
| SETUP_CERT_01 | POST | `/auth/login` | Login as teacher before Certificate tests | `200`, save teacher token and `teacherId` | 200 OK; teacher token and teacherId saved; response time 300ms; setup passed | Passed | Setup request; not counted as a Certificate TC. |
| SETUP_CERT_02 | POST | `/courses` | Create a temporary course for Certificate tests | `201`, save `certCourseId` | 201 Created; temporary course created and certCourseId saved; response time 163ms; setup passed | Passed | Required because certificate setup needs an exam attached to a course. |
| SETUP_CERT_03 | POST | `/exams` | Create an active exam for Certificate tests | `201`, save `certExamId`, `certExamPublicId`, and `certQuestionId` | 201 Created; active exam created and certExamId/publicId/questionId saved; response time 212ms; setup passed | Passed | Uses a start time in the past and end time in the future. |
| SETUP_CERT_04 | POST | `/auth/login` | Login as student before submission setup | `200`, save student token, `studentId`, and `studentEmail` | 200 OK; student token/studentId/studentEmail saved; response time 215ms; setup passed | Passed | Setup request; not counted as a Certificate TC. |
| SETUP_CERT_05 | POST | `/exams/:publicId/submit` | Submit exam to create graded submission | `201`, save `certSubmissionId` | 201 Created; graded submission created and certSubmissionId saved; response time 176ms; setup passed | Passed | Required by `CertificateService.issue`, which searches by `examId` and `studentId`. |
| TC_PM_CERT_01 | POST | `/certificates/issue` | Issue certificate | `201`, `success=true`, certificate data returned | 201 Created; certificate ID/token context saved; response time 12.1s; assertions passed | Passed | Saves `certId` and `certTokenId`; may return `pending` if blockchain/IPFS services are unavailable. |
| TC_PM_CERT_02 | GET | `/certificates` | List certificates | `200`, paginated certificate list | 200 OK; paginated certificate list returned; response time 133ms; assertions passed | Passed | Uses teacher token; teacher query is scoped to the teacher's courses by the controller. |
| TC_PM_CERT_03 | GET | `/certificates/:id` | Get certificate by ID | `200`, requested certificate returned | 200 OK; requested certificate returned; response time 93ms; assertions passed | Passed | Uses `certId` from TC_PM_CERT_01. |
| TC_PM_CERT_04 | GET | `/certificates/student/:id` | List certificates by student | `200`, paginated student certificate list | 200 OK; student certificate list returned; response time 96ms; assertions passed | Passed | Uses the seed student's `studentId`. |
| TC_PM_CERT_05 | PATCH | `/certificates/:id/revoke` | Revoke certificate | `200`, certificate status `revoked` | 200 OK; certificate status=revoked; response time 168ms; assertions passed | Passed | Marks the certificate unusable while keeping the record for public verification. |
| TC_PM_CERT_06 | GET | `/public/certificates/verify/:id` | Verify certificate publicly | `200`, verification result returned | 200 OK; public verification result returned; response time 384ms; assertions passed | Passed | No auth required; after revocation, `valid=false` is acceptable. |
| TC_PM_CERT_07 | GET | `/public/certificates/lookup` | Lookup certificate publicly | `200`, lookup result contains certificate | 200 OK; lookup result returned and cleanup passed; response time 279ms; assertions passed | Passed | No auth required; cleanup deletes temporary exam and course after lookup. |

## 8. Dashboard & Notifications API Test Cases

Dashboard & Notifications tests are implemented in:

```text
testing/postman/dashboard/Academix_API.postman_collection.json
```

The Dashboard & Notifications folder contains 2 setup requests plus 5 counted test cases. Setup requests log in as the seed teacher and seed student. The teacher token is used for teacher dashboard and notification requests; the student token is used to verify that a student cannot access the teacher dashboard.

| TC ID | Method | Endpoint | Purpose | Expected | Actual | Status | Notes |
|-------|--------|----------|---------|----------|--------|--------|-------|
| SETUP_DASH_01 | POST | `/auth/login` | Login as teacher before dashboard tests | `200`, save teacher token and `teacherId` | 200 OK; teacher token and teacherId saved; response time 222ms; setup passed | Passed | Setup request; not counted as a dashboard TC. |
| SETUP_DASH_02 | POST | `/auth/login` | Login as student before forbidden-access test | `200`, save student token and `studentId` | 200 OK; student token and studentId saved; response time 207ms; setup passed | Passed | Setup request; not counted as a dashboard TC. |
| TC_PM_DASH_01 | GET | `/dashboard/teacher?teacherId=:teacherId` | Teacher dashboard stats | `200`, `success=true`, dashboard stats returned | 200 OK; dashboard stats/examPerformance/activeExams returned; response time 154ms; assertions passed | Passed | The actual backend requires `teacherId` as a query parameter. |
| TC_PM_DASH_02 | GET | `/dashboard/teacher?teacherId=:teacherId` | Student cannot access teacher dashboard | `403`, `error.code=FORBIDDEN` | 403 Forbidden; student access rejected; response time 34ms; assertions passed | Passed | Uses seed student token against the teacher dashboard endpoint. |
| TC_PM_NOTIF_01 | GET | `/notifications?page=1&limit=10` | List notifications | `200`, notifications array and pagination values | 200 OK; notifications list total=2, page=1, limit=10; response time 66ms; assertions passed | Passed | Uses teacher token. Empty notification lists are valid. |
| TC_PM_NOTIF_02 | GET | `/notifications/unread-count` | Get unread count | `200`, numeric unread count | 200 OK; unread count returned; response time 57ms; assertions passed | Passed | Uses teacher token. |
| TC_PM_NOTIF_03 | PATCH | `/notifications/mark-all-read` | Mark all notifications as read | `200`, numeric updated count | 200 OK; updated count returned; response time 68ms; assertions passed | Passed | Idempotent mutation; `updated=0` is valid when no unread notifications exist. |

## 9. Report Screenshots

| Report | Status |
|--------|--------|
| Auth Newman HTML report | Generated |
| Course Newman HTML report | Generated |
| Exam Newman HTML report | Generated |
| Certificate Newman HTML report | Generated |
| Dashboard & Notifications Newman HTML report | Generated |

All generated Newman HTML reports show `Failed Tests = 0`.

## 10. Comments

The API test execution covered 42 counted Postman/Newman test cases across Auth, Course, Exam, Certificate, and Dashboard & Notifications modules. All counted test cases passed, and every generated Newman HTML report recorded `Failed Tests = 0`.

The results show that the main authenticated workflows are stable: users can authenticate, manage profiles, create and maintain courses, create and operate exams, submit exam answers, issue and verify certificates, and access dashboard/notification endpoints according to role-based permissions. Negative cases such as unauthenticated access, invalid input, forbidden student access, duplicate registration, and missing resources were also validated successfully.

Most API responses completed within a normal range for local/backend integration testing. The certificate issuance request was significantly slower than the other requests because it depends on certificate generation and external-style persistence flows such as blockchain/IPFS-related handling. This behavior should be monitored separately in performance testing, but it did not cause any functional failure in this Newman run.

Overall, the current Postman API test suite is suitable as a regression baseline for the implemented backend modules. Future test cycles should continue expanding edge cases, data cleanup validation, expired-token scenarios, pagination boundaries, and performance thresholds for certificate-related operations.
