# SELENIUM AUTOMATION TEST REPORT

## 1. Tools & Libraries

| Tool | Version | Purpose |
|------|---------|---------|
| Selenium WebDriver | >=4.20 | Browser automation |
| Pytest | >=8.0 | Test framework |
| pytest-html | >=4.0 | HTML report generation |
| pymongo | >=4.7 | MongoDB verification & rollback |
| webdriver-manager | >=4.0 | Auto ChromeDriver management |

## 2. Test Cases Summary

| Test File | Module | # TCs | Pass | Fail | Skip |
|-----------|--------|-------|------|------|------|
| test_01_login.py | Login | 8 | 8 | 0 | 0 |
| test_02_register.py | Register | 8 | 8 | 0 | 0 |
| test_03_dashboard.py | Dashboard | 5 | 5 | 0 | 0 |
| test_04_course_crud.py | Course CRUD | 6 | 4 | 1 | 1 |
| test_05_exam_crud.py | Exam CRUD | 5 | 1 | 2 | 2 |
| test_06_profile.py | Profile | 4 | 1 | 3 | 0 |
| test_07_certificate.py | Certificate | 3 | 0 | 2 | 1 |
| test_08_navigation.py | Navigation | 3 | 0 | 2 | 1 |
| **Total** | | **42** | **27** | **10** | **5** |

---

## 3. Detailed Results

### AUTH (LOGIN & REGISTER)
| TC ID | Purpose | Expected | Actual | Status | Notes |
|-------|---------|----------|--------|--------|-------|
| TC_SEL_LOGIN_01 | Login Teacher | Redirect to /dashboard/teacher | Match | **PASS** | |
| TC_SEL_LOGIN_02 | Login Student | Redirect to /dashboard/student | Match | **PASS** | |
| TC_SEL_LOGIN_03 | Wrong Password | Show error message | Match | **PASS** | |
| TC_SEL_LOGIN_04 | Non-existent User | Show error message | Match | **PASS** | |
| TC_SEL_LOGIN_05 | Empty Username | Stay at /login | Match | **PASS** | |
| TC_SEL_LOGIN_06 | Empty Password | Stay at /login | Match | **PASS** | |
| TC_SEL_LOGIN_07 | Empty Both | Stay at /login | Match | **PASS** | |
| TC_SEL_LOGIN_08 | Forgot Pwd Link | Redirect to /forgot-password | Match | **PASS** | |
| TC_SEL_REG_01 | Register Student | Redirect & Login Success | Match | **PASS** | Fix: Checkbox XPath |
| TC_SEL_REG_02 | Register Teacher | Redirect & Login Success | Match | **PASS** | |
| TC_SEL_REG_03 | Dup Email | Show error message | Match | **PASS** | |
| TC_SEL_REG_04 | Dup Username | Show error message | Match | **PASS** | |
| TC_SEL_REG_05 | Short Password | Client-side validation | Match | **PASS** | |
| TC_SEL_REG_06 | Mismatch Password | Client-side validation | Match | **PASS** | |
| TC_SEL_REG_07 | Invalid Email | Client-side validation | Match | **PASS** | |
| TC_SEL_REG_08 | Empty Fields | Client-side validation | Match | **PASS** | |

### DASHBOARD & COURSE
| TC ID | Purpose | Expected | Actual | Status | Notes |
|-------|---------|----------|--------|--------|-------|
| TC_SEL_DASH_01 | Teacher Stats | Stats displayed | Match | **PASS** | |
| TC_SEL_DASH_02 | Student Loads | Dashboard loads | Match | **PASS** | |
| TC_SEL_DASH_03 | Sidebar Nav | Links working | Match | **PASS** | |
| TC_SEL_DASH_04 | Role Protection | Redirect if unauthorized | Match | **PASS** | |
| TC_SEL_DASH_05 | Unauth Access | Redirect to /login | Match | **PASS** | |
| TC_SEL_COURSE_01 | Create Course | Success & DB Verify | Match | **PASS** | |
| TC_SEL_COURSE_02 | Empty Course | Show validation error | Match | **PASS** | |
| TC_SEL_COURSE_03 | Edit Course | Update success | N/A | **SKIP** | Feature pending |
| TC_SEL_COURSE_04 | Delete Course | Remove from list | Timeout | **FAIL** | Modal confirm error |
| TC_SEL_COURSE_05 | Search Course | Filter results | Match | **PASS** | |
| TC_SEL_COURSE_06 | View List | Pagination works | Match | **PASS** | |

### EXAM & CERTIFICATE
| TC ID | Purpose | Expected | Actual | Status | Notes |
|-------|---------|----------|--------|--------|-------|
| TC_SEL_EXAM_01 | Create Exam | Success & DB Verify | Failed | **FAIL** | Form interaction error |
| TC_SEL_EXAM_02 | Join Exam | Redirect to quiz page | N/A | **SKIP** | Dep. on TC_01 |
| TC_SEL_EXAM_03 | Submit Exam | Success message | N/A | **SKIP** | Dep. on TC_01 |
| TC_SEL_EXAM_04 | View Results | Table displayed | Match | **PASS** | |
| TC_SEL_EXAM_05 | Delete Exam | Remove from list | Timeout | **FAIL** | |
| TC_SEL_CERT_01 | View Cert List | Table displayed | Failed | **FAIL** | |
| TC_SEL_CERT_02 | Verify Public | Show cert details | Failed | **FAIL** | |
| TC_SEL_CERT_03 | Lookup Cert | Result found | N/A | **SKIP** | |

### PROFILE & NAVIGATION
| TC ID | Purpose | Expected | Actual | Status | Notes |
|-------|---------|----------|--------|--------|-------|
| TC_SEL_PROFILE_01 | View Profile | Info displayed | Match | **PASS** | |
| TC_SEL_PROFILE_02 | Update Name | Success & DB Verify | Failed | **FAIL** | Modal logic issue |
| TC_SEL_PROFILE_03 | Change Password | Circle flow Success | Failed | **FAIL** | Success msg not found |
| TC_SEL_NAV_01 | Logo Click | Redirect to dashboard | N/A | **SKIP** | |
| TC_SEL_NAV_02 | Logout | Redirect & Clear session | Failed | **FAIL** | Avatar not clickable |
| TC_SEL_NAV_03 | Browser Back | Prevent re-entry | Failed | **FAIL** | |

---

## 4. Notes & Recommendations
- **XPath Fix**: Đã ổn định được các tương tác cơ bản với Ant Design Checkbox và Input.
- **Video Recorder**: Tất cả các test đều có video 3s pause cuối để dễ dàng audit kết quả.
- **Password Rollback**: Đã triển khai cơ chế Reset Password tự động trong DB để tránh kẹt tài khoản khi test đổi pass fail.
- **Kế hoạch tiếp theo**: Cần tối ưu lại các locators cho Modal (Course/Exam) và xử lý animation của Ant Design trơn tru hơn.
