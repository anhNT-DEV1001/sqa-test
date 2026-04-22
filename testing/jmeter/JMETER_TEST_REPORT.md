# JMETER PERFORMANCE TEST REPORT — Academix Platform

> **Tool:** Apache JMeter 5.6+
> **Target:** http://localhost:8000/api/v1
> **Report Date:** 22/04/2026
> **Executed by:** anhbq

---

## 1. Tools & Environment

| Item | Value |
|------|-------|
| JMeter Version | 5.6.3 |
| Java Version | JDK 17+ |
| Target Server | localhost:8000 |
| Database | MongoDB Atlas |
| OS | Windows |

## 2. Test Scenarios (4 Thread Groups)

### TG1 — Login Load Test (TC_PERF_01)
- **Objective:** Test concurrent login handling capacity.
- **Config:** 50 Virtual Users, Ramp-up 10s, Loop 5 (= 250 total requests).
- **API:** POST `/api/v1/auth/login`
- **Data:** CSV `test_data/users.csv` (teacher + student accounts).
- **Assertions:** Status 200, Response Time < 2000ms.
- **Target:** Error Rate < 1%.

### TG2 — API Endpoint Stress Test (TC_PERF_02)
- **Objective:** Stress test core API endpoints under concurrent access.
- **Config:** 100 Virtual Users, Ramp-up 20s, Loop 10.
- **APIs tested:**
  - POST `/auth/login` (setup - token extraction)
  - GET `/auth/profile`
  - GET `/courses/teacher/:teacherId`
  - GET `/exams/teacher/:teacherId`
  - GET `/notifications`
  - GET `/dashboard/teacher`
- **Assertions:** Status 200, Response Time < 3000ms.
- **Target:** Error Rate < 5%.

### TG3 — Concurrent Exam Taking (TC_PERF_03)
- **Objective:** Simulate 30 students participating in an exam concurrently.
- **Config:** 30 Virtual Users, Ramp-up 5s, Loop 1.
- **APIs tested:**
  - POST `/auth/login` (student login)
  - GET `/exams/:publicId/take` (Load exam content/questions)
  - GET `/exams/my-completed`
  - GET `/auth/profile`
  - GET `/notifications`
- **Assertions:** Status 200, Response Time < 5000ms.
- **Target:** Error Rate < 2%.

### TG4 — Certificate Verification - Public (TC_PERF_04)
- **Objective:** Test load capacity for public endpoints (no auth required).
- **Config:** 200 Virtual Users, Ramp-up 30s, Loop 5 (= 1000 total per sampler).
- **APIs tested:**
  - GET `/public/certificates/lookup`
  - GET `/public/certificates/verify/:id`
- **Assertions:** Response Time < 1000ms.
- **Target:** Error Rate < 1%.

## 3. Results Summary & Conclusion

**Report Date:** 22/04/2026
**Overall Throughput:** ~31.40 req/s
**Total Error Rate:** 38.67% (Exclusively due to response time exceeding thresholds in TG2. TG1, TG3, and TG4 are 100% successful)

| Scenario | Avg RT | 95th %ile RT | Throughput | Error Rate | Status |
|----------|--------|-------------|------------|------------|--------|
| TG1 - Login Load | ~466 ms | 678 ms | 21.3 req/s | 0.00% | ✅ PASS |
| TG2 - API Stress | 1871-4637 ms | 2071-5764 ms| ~4.5 req/s | 0% - 92.7% | ❌ FAIL |
| TG3 - Exam Taking | ~56-130 ms | ~60-151 ms | ~6 req/s | 0.00% | ✅ PASS |
| TG4 - Cert Verify | ~26 ms | ~30 ms | 33.2 req/s | 0.00% | ✅ PASS |

### Analysis and Conclusion:
1.  **TG1 (Login Load) & TG4 (Certificate Verify):** The system performed excellently. Average Response Time (RT) was very low (ranging from 26ms to 466ms), fully meeting the performance targets with a **0% error rate**. 
2.  **TG2 (API Stress - Teacher Workflow):** **Did not meet targets (FAIL)**.
    - The heavy APIs (Course List and Dashboard) continue to show high latency (Avg RT > 4.6 seconds) under a load of 100 concurrent teachers.
    - Most requests are failing due to the `Duration Assertion` (RT < 3000ms), with error rates exceeding 91%.
    - **Optimization needed:** Database indexing and caching are critical for these endpoints.
3.  **TG3 (Exam Taking):** **100% Success!** 
    - After updating the exam `startTime` and `endTime` to valid dates, the `GET /exams/:publicId/take` API now returns a **0% error rate**.
    - The performance of the Exam flow is **outstanding**, with all APIs (`login`, `profile`, `take exam`, `my-completed`, `notifications`) responding in **less than 150ms** on average.

## 4. Detailed Statistics (by Sampler)

This table provides a granular view of every API request tested during the session, as recorded in `statistics.json`.

| Sampler Name | Samples | Average (ms) | 95th %ile (ms) | Throughput | Errors |
|--------------|---------|--------------|----------------|------------|--------|
| **POST /auth/login** | 250 | 466.70 | 678.35 | 21.35/s | 0.00% |
| **Setup - Login Teacher** | 1000 | 2204.38 | 2849.95 | 4.71/s | 0.00% |
| **GET /auth/profile** | 1000 | 2841.86 | 3762.00 | 4.67/s | 53.10% |
| **GET /courses/teacher/:id** | 1000 | 4612.87 | 5135.95 | 4.61/s | 92.70% |
| **GET /exams/teacher/:id** | 1000 | 3727.35 | 4164.95 | 4.57/s | 87.60% |
| **GET /notifications** | 1000 | 1871.24 | 2071.00 | 4.57/s | 0.00% |
| **GET /dashboard/teacher** | 1000 | 4637.11 | 5764.85 | 4.55/s | 91.40% |
| **Setup - Login Student** | 30 | 130.67 | 151.30 | 6.03/s | 0.00% |
| **GET /exams/:publicId/take** | 30 | 110.03 | 132.85 | 6.07/s | 0.00% |
| **GET /exams/my-completed** | 30 | 56.37 | 63.25 | 6.14/s | 0.00% |
| **GET Student Profile** | 30 | 83.23 | 120.90 | 6.13/s | 0.00% |
| **GET Student Notifications** | 30 | 56.23 | 62.00 | 6.16/s | 0.00% |
| **GET /public/certificates/lookup** | 1000 | 26.78 | 30.00 | 33.25/s | 0.00% |
| **GET /public/certificates/verify/:id** | 1000 | 26.56 | 30.00 | 33.26/s | 0.00% |
| **Total** | **8400** | **2390.23** | **5072.00** | **31.41/s** | **38.67%** |

## 5. How to Run

### Prerequisites
```
- Java JDK 17+ installed
- Apache JMeter 5.6+ downloaded
- Backend running on localhost:8000
```

### Run via CLI (Non-GUI mode)
```powershell
# Adjust JMeter path
$JMETER = "D:\download\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat"

# Run test + generate HTML report
& $JMETER -n -t Academix_Performance.jmx -l results/results.jtl -e -o results/report
```

### Run via GUI (for debugging)
```powershell
& $JMETER -t Academix_Performance.jmx
```

## 6. Report Screenshots

> 📷 **[Screenshot 1]** — JMeter Aggregate Report
>
> 📷 **[Screenshot 2]** — Response Time Graph
>
> 📷 **[Screenshot 3]** — HTML Dashboard Overview

## 7. Files

| File | Purpose |
|------|---------|
| `Academix_Performance.jmx` | JMeter Test Plan (generated) |
| `test_data/users.csv` | CSV data for Login Load Test |
| `run_jmeter.ps1` | PowerShell script for CLI execution |
| `results/` | Directory for results and reports (auto-generated) |
