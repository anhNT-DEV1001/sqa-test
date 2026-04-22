# AI INSTRUCTION: TOOL TESTING PLAN — Academix Platform

**Role:** Act as a Senior QA Automation Engineer. Execute the following testing plan for the Academix educational platform using Selenium WebDriver, Postman/Newman, and JMeter.

---

## ⚠️ CRITICAL RULE: CODE COMMENTS

> **Với MỌI Part, MỌI test case, MỌI file:** Code PHẢI được comment rõ ràng, chi tiết.
> - Comment giải thích mục đích của từng test case
> - Comment mô tả từng bước (Arrange/Act/Assert hoặc Setup/Execute/Verify)
> - Comment mapping Test Case ID với report
> - Comment giải thích logic rollback/cleanup
> - Không được viết code mà không có comment

---

## PROJECT CONTEXT

- **Project:** Academix — Educational & Certification Platform (Web3 + AI)
- **Stack:** NestJS 11 (Backend, port 8000) + Next.js 15 (Frontend, port 3000) + MongoDB Atlas + Avalanche Fuji
- **Base API:** `http://localhost:8000/api/v1`
- **Frontend URL:** `http://localhost:3000`
- **Database:** MongoDB Atlas (connection string in `backend/.env` → `MONGODB_URI`)
- **Browser:** Chrome (with ChromeDriver via webdriver-manager)

### Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Student | `anhnt36` | `@Tuananh10012004` |
| Teacher | `anhnt39` | `@Tuananh10012004` |

### Database Verification

- Kiểm tra trực tiếp MongoDB qua connection string (tham khảo `backend/.env` → `MONGODB_URI`)
- Sử dụng pymongo (Python) hoặc mongoose queries để verify data sau mỗi mutation test

---

## DIRECTORY STRUCTURE

```
sqa-test/
└── testing/
    ├── selenium/                    # Part 1: Selenium WebDriver
    │   ├── requirements.txt
    │   ├── conftest.py
    │   ├── config.py
    │   ├── test_data/
    │   │   ├── login_data.csv
    │   │   ├── register_data.csv
    │   │   └── course_data.csv
    │   ├── pages/                   # Page Object Model
    │   │   ├── base_page.py
    │   │   ├── login_page.py
    │   │   ├── register_page.py
    │   │   ├── dashboard_page.py
    │   │   ├── course_page.py
    │   │   ├── exam_page.py
    │   │   ├── profile_page.py
    │   │   └── certificate_page.py
    │   ├── tests/
    │   │   ├── test_01_login.py
    │   │   ├── test_02_register.py
    │   │   ├── test_03_dashboard.py
    │   │   ├── test_04_course_crud.py
    │   │   ├── test_05_exam_crud.py
    │   │   ├── test_06_profile.py
    │   │   ├── test_07_certificate.py
    │   │   └── test_08_navigation.py
    │   ├── utils/
    │   │   ├── db_helper.py
    │   │   └── report_helper.py
    │   └── SELENIUM_TEST_REPORT.md
    │
    ├── postman/                     # Part 2: Postman API Tests
    │   ├── Academix_API.postman_collection.json
    │   ├── Academix_ENV.postman_environment.json
    │   ├── newman_run.ps1
    │   └── POSTMAN_TEST_REPORT.md
    │
    └── jmeter/                      # Part 3: JMeter Performance
        ├── Academix_Performance.jmx
        ├── test_data/users.csv
        ├── run_jmeter.ps1
        └── JMETER_TEST_REPORT.md
```

---

## PART 1: SELENIUM WEBDRIVER — System/UI Testing

**Technology:** Python + Selenium WebDriver 4 + Pytest + pytest-html + pymongo

### Dependencies (requirements.txt)
```
selenium>=4.20
pytest>=8.0
pytest-html>=4.0
pymongo>=4.7
webdriver-manager>=4.0
openpyxl>=3.1
```

### Architecture: Page Object Model (POM)
- `base_page.py`: Common methods (wait, click, type, screenshot)
- Each page class encapsulates element locators + actions
- Tests only interact through page objects

### Test Cases (~42 TCs)

#### test_01_login.py (8 TCs)

| TC ID | Mô tả | Input (CSV) | Expected | DB Check | Rollback |
|-------|--------|-------------|----------|----------|----------|
| TC_SEL_LOGIN_01 | Login thành công (teacher) | anhnt39 / @Tuananh10012004 | Redirect → `/dashboard/teacher` | ❌ | ❌ |
| TC_SEL_LOGIN_02 | Login thành công (student) | anhnt36 / @Tuananh10012004 | Redirect → `/dashboard/student` | ❌ | ❌ |
| TC_SEL_LOGIN_03 | Login sai password | valid user + wrong pass | Error message | ❌ | ❌ |
| TC_SEL_LOGIN_04 | Login user không tồn tại | fake_user_999 | Error message | ❌ | ❌ |
| TC_SEL_LOGIN_05 | Login trống username | empty + password | Validation error | ❌ | ❌ |
| TC_SEL_LOGIN_06 | Login trống password | username + empty | Validation error | ❌ | ❌ |
| TC_SEL_LOGIN_07 | Login trống cả 2 | empty + empty | Validation error | ❌ | ❌ |
| TC_SEL_LOGIN_08 | Link "Quên mật khẩu" | Click link | Redirect → `/forgot-password` | ❌ | ❌ |

#### test_02_register.py (8 TCs)

| TC ID | Mô tả | Input (CSV) | Expected | DB Check | Rollback |
|-------|--------|-------------|----------|----------|----------|
| TC_SEL_REG_01 | Register student thành công | valid data | Redirect → `/login` | ✅ | ✅ Xóa user |
| TC_SEL_REG_02 | Register teacher thành công | valid data | Redirect → `/login` | ✅ | ✅ Xóa user |
| TC_SEL_REG_03 | Register email đã tồn tại | duplicate email | Error message | ❌ | ❌ |
| TC_SEL_REG_04 | Register username đã tồn tại | duplicate username | Error message | ❌ | ❌ |
| TC_SEL_REG_05 | Register password quá ngắn | short password | Validation error | ❌ | ❌ |
| TC_SEL_REG_06 | Register password không khớp | mismatch confirm | Validation error | ❌ | ❌ |
| TC_SEL_REG_07 | Register email sai format | invalid email | Validation error | ❌ | ❌ |
| TC_SEL_REG_08 | Register trống required fields | empty fields | Validation errors | ❌ | ❌ |

#### test_03_dashboard.py (5 TCs)

| TC ID | Mô tả | Expected | DB Check |
|-------|--------|----------|----------|
| TC_SEL_DASH_01 | Teacher dashboard hiển thị stats | Stats cards visible | ❌ |
| TC_SEL_DASH_02 | Student dashboard hiển thị | Dashboard loads | ❌ |
| TC_SEL_DASH_03 | Sidebar navigation hoạt động | Click → correct page | ❌ |
| TC_SEL_DASH_04 | Student → teacher page | Redirect `/unauthorized` | ❌ |
| TC_SEL_DASH_05 | Unauthenticated → redirect login | Redirect `/login` | ❌ |

#### test_04_course_crud.py (6 TCs)

| TC ID | Mô tả | Expected | DB Check | Rollback |
|-------|--------|----------|----------|----------|
| TC_SEL_COURSE_01 | Tạo course mới | Course in list | ✅ | ✅ |
| TC_SEL_COURSE_02 | Tạo course tên trống | Validation error | ❌ | ❌ |
| TC_SEL_COURSE_03 | Sửa tên course | Tên updated | ✅ | ✅ |
| TC_SEL_COURSE_04 | Xóa course | Course removed | ✅ | ❌ |
| TC_SEL_COURSE_05 | Tìm kiếm course | Filtered results | ❌ | ❌ |
| TC_SEL_COURSE_06 | Xem danh sách courses | Full list | ❌ | ❌ |

#### test_05_exam_crud.py (5 TCs)

| TC ID | Mô tả | Expected | DB Check | Rollback |
|-------|--------|----------|----------|----------|
| TC_SEL_EXAM_01 | Tạo exam mới | Exam in list | ✅ | ✅ |
| TC_SEL_EXAM_02 | Student join exam | Exam room displayed | ❌ | ❌ |
| TC_SEL_EXAM_03 | Student submit exam | Score hiển thị | ✅ | ✅ |
| TC_SEL_EXAM_04 | Teacher xem results | Results table | ❌ | ❌ |
| TC_SEL_EXAM_05 | Xóa exam | Exam removed | ✅ | ❌ |

#### test_06_profile.py (4 TCs)

| TC ID | Mô tả | Expected | DB Check | Rollback |
|-------|--------|----------|----------|----------|
| TC_SEL_PROFILE_01 | Xem profile | Profile data đúng | ❌ | ❌ |
| TC_SEL_PROFILE_02 | Cập nhật fullName | Tên mới hiển thị | ✅ | ✅ |
| TC_SEL_PROFILE_03 | Đổi password thành công | Success message | ✅ | ✅ |
| TC_SEL_PROFILE_04 | Đổi password sai current | Error message | ❌ | ❌ |

#### test_07_certificate.py (3 TCs)

| TC ID | Mô tả | Expected |
|-------|--------|----------|
| TC_SEL_CERT_01 | Xem danh sách certificates | List hiển thị |
| TC_SEL_CERT_02 | Verify certificate (public) | Verification result |
| TC_SEL_CERT_03 | Lookup certificate | Search results |

#### test_08_navigation.py (3 TCs)

| TC ID | Mô tả | Expected |
|-------|--------|----------|
| TC_SEL_NAV_01 | Logo click → home | Home page |
| TC_SEL_NAV_02 | Logout → clear session | Login page, no localStorage |
| TC_SEL_NAV_03 | Browser back after logout | Redirect login |

### Execution & Report
```powershell
cd testing/selenium
pip install -r requirements.txt
pytest tests/ -v --html=report.html --self-contained-html
```

---

## PART 2: POSTMAN — API Testing

**Technology:** Postman Collections + Newman CLI + newman-reporter-htmlextra

### API Test Cases (~42 TCs)

#### Folder 1: Auth APIs (11 TCs)

| TC ID | Method | Endpoint | Purpose | Assertions |
|-------|--------|----------|---------|------------|
| TC_PM_AUTH_01 | POST | `/auth/register` | Register student OK | 201, success=true |
| TC_PM_AUTH_02 | POST | `/auth/register` | Duplicate email | 409, error |
| TC_PM_AUTH_03 | POST | `/auth/register` | Invalid data | 400 |
| TC_PM_AUTH_04 | POST | `/auth/login` | Login OK | 200, save token |
| TC_PM_AUTH_05 | POST | `/auth/login` | Wrong password | 401 |
| TC_PM_AUTH_06 | POST | `/auth/login` | Non-existent user | 401 |
| TC_PM_AUTH_07 | GET | `/auth/profile` | Get profile (auth) | 200, user data |
| TC_PM_AUTH_08 | GET | `/auth/profile` | No token | 401 |
| TC_PM_AUTH_09 | PUT | `/auth/profile` | Update profile | 200, updated |
| TC_PM_AUTH_10 | POST | `/auth/change-password` | Change password | 200 |
| TC_PM_AUTH_11 | POST | `/auth/refresh` | Refresh tokens | 200, new tokens |

#### Folder 2: Course APIs (7 TCs)

| TC ID | Method | Endpoint | Purpose |
|-------|--------|----------|---------|
| TC_PM_COURSE_01 | POST | `/courses` | Create course |
| TC_PM_COURSE_02 | POST | `/courses` | Empty name → 400 |
| TC_PM_COURSE_03 | GET | `/courses/teacher/:id` | List courses |
| TC_PM_COURSE_04 | GET | `/courses/teacher/:id?search=x` | Search |
| TC_PM_COURSE_05 | PATCH | `/courses/:id/name` | Update name |
| TC_PM_COURSE_06 | DELETE | `/courses/delete/:id` | Delete course |
| TC_PM_COURSE_07 | DELETE | `/courses/delete/invalid` | Not found → 404 |

#### Folder 3: Exam APIs (12 TCs)

| TC ID | Method | Endpoint | Purpose |
|-------|--------|----------|---------|
| TC_PM_EXAM_01 | POST | `/exams` | Create exam (teacher) |
| TC_PM_EXAM_02 | POST | `/exams` | No auth → 401 |
| TC_PM_EXAM_03 | GET | `/exams/:id` | Get exam by ID |
| TC_PM_EXAM_04 | GET | `/exams/:id` | Not owner → 403 |
| TC_PM_EXAM_05 | PUT | `/exams/:id` | Update exam |
| TC_PM_EXAM_06 | PATCH | `/exams/:id/status` | Transition status |
| TC_PM_EXAM_07 | DELETE | `/exams/:id` | Delete exam |
| TC_PM_EXAM_08 | POST | `/exams/join` | Student join |
| TC_PM_EXAM_09 | GET | `/exams/:publicId/take` | Get for taking |
| TC_PM_EXAM_10 | POST | `/exams/:publicId/submit` | Submit answers |
| TC_PM_EXAM_11 | GET | `/exams/:id/results` | Get results |
| TC_PM_EXAM_12 | GET | `/exams/teacher/:id` | List with pagination |

#### Folder 4: Certificate APIs (7 TCs)

| TC ID | Method | Endpoint | Purpose |
|-------|--------|----------|---------|
| TC_PM_CERT_01 | POST | `/certificates/issue` | Issue certificate |
| TC_PM_CERT_02 | GET | `/certificates` | List certificates |
| TC_PM_CERT_03 | GET | `/certificates/:id` | Get by ID |
| TC_PM_CERT_04 | GET | `/certificates/student/:id` | List by student |
| TC_PM_CERT_05 | PATCH | `/certificates/:id/revoke` | Revoke |
| TC_PM_CERT_06 | GET | `/public/certificates/verify/:id` | Verify (public) |
| TC_PM_CERT_07 | GET | `/public/certificates/lookup` | Lookup |

#### Folder 5: Dashboard & Notifications (5 TCs)

| TC ID | Method | Endpoint | Purpose |
|-------|--------|----------|---------|
| TC_PM_DASH_01 | GET | `/dashboard/teacher` | Teacher stats |
| TC_PM_DASH_02 | GET | `/dashboard/teacher` | Student → 403 |
| TC_PM_NOTIF_01 | GET | `/notifications` | List notifications |
| TC_PM_NOTIF_02 | GET | `/notifications/unread-count` | Unread count |
| TC_PM_NOTIF_03 | PATCH | `/notifications/mark-all-read` | Mark all read |

### Each test includes:
- **Pre-request Script:** Token setup, dynamic data generation
- **Test Script:** Status code, schema validation, field assertions, response time
- **Rollback:** Cleanup requests at end of each folder

### Execution & Report
```powershell
npm install -g newman newman-reporter-htmlextra
cd testing/postman
newman run Academix_API.postman_collection.json -e Academix_ENV.postman_environment.json -r htmlextra
```

---

## PART 3: JMETER — Performance Testing

**Technology:** Apache JMeter 5.6+ (CLI mode)
**Download:** http://jmeter.apache.org

### Performance Scenarios

| Scenario | Thread Group | VUs | Ramp-up | Target RT | Error Rate |
|----------|-------------|-----|---------|-----------|------------|
| Login Load | POST `/auth/login` | 50 | 10s | < 2s | < 1% |
| API Stress | GET profile/courses/exams | 100 | 20s | < 3s | < 5% |
| Exam Taking | join → take → submit | 30 | 5s | < 5s | < 2% |
| Cert Verify | GET `/public/certificates/verify/:id` | 200 | 30s | < 1s | < 1% |

### JMX Components:
- **CSV Data Set Config:** Load users from `test_data/users.csv`
- **HTTP Header Manager:** Content-Type, Authorization
- **JSON Extractor:** Extract tokens from login response
- **Response Assertions:** Status code, response time
- **Listeners:** Summary Report, Aggregate Report, Response Time Graph

### Execution & Report
```powershell
cd testing/jmeter
jmeter -n -t Academix_Performance.jmx -l results.jtl -e -o report/
```
Opens HTML dashboard in `report/` folder.

---

## EXECUTION ORDER

```
1. Start Backend (npm run dev) + Frontend (npm run dev)
2. Run Selenium UI Tests → Generate HTML report
3. Run Postman/Newman API Tests → Generate HTML report  
4. Run JMeter Performance Tests → Generate HTML dashboard
5. Consolidate all reports into final markdown reports
```

## SUMMARY

| Part | Tool | Test Cases | Report |
|------|------|-----------|--------|
| 1 | Selenium WebDriver (Python) | ~42 system TCs | pytest-html |
| 2 | Postman + Newman | ~42 API TCs | newman-htmlextra |
| 3 | JMeter | 4 perf scenarios | JMeter HTML Dashboard |
| **Total** | | **~88 test cases** | **3 reports** |
