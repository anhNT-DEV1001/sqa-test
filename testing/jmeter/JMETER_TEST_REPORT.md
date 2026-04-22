# JMETER PERFORMANCE TEST REPORT — Academix Platform

> **Tool:** Apache JMeter 5.6+
> **Target:** http://localhost:8000/api/v1
> **Report Date:** _Điền sau khi chạy test_
> **Người thực hiện:** _Điền tên_

---

## 1. Test Scenarios

| # | Scenario | VUs | Ramp-up | Target RT | Target Error Rate |
|---|----------|-----|---------|-----------|-------------------|
| 1 | Login Load Test | 50 | 10s | < 2s | < 1% |
| 2 | API Endpoint Stress | 100 | 20s | < 3s | < 5% |
| 3 | Concurrent Exam Taking | 30 | 5s | < 5s | < 2% |
| 4 | Certificate Verification | 200 | 30s | < 1s | < 1% |

## 2. Results Summary

| Scenario | Avg RT | 95th RT | Throughput | Error Rate | Status |
|----------|--------|---------|------------|------------|--------|
| Login Load | _ms | _ms | _req/s | _% | ⬜ |
| API Stress | _ms | _ms | _req/s | _% | ⬜ |
| Exam Taking | _ms | _ms | _req/s | _% | ⬜ |
| Cert Verify | _ms | _ms | _req/s | _% | ⬜ |

## 3. Execution Command

```powershell
jmeter -n -t Academix_Performance.jmx -l results.jtl -e -o report/
```

## 4. Report Screenshots

> 📷 **[Screenshot]** — JMeter Aggregate Report
> 📷 **[Screenshot]** — Response Time Graph
> 📷 **[Screenshot]** — HTML Dashboard overview

## 5. JMeter Test Plan

> File JMX: `Academix_Performance.jmx`
> Thành viên phụ trách tạo JMX file bằng JMeter GUI với các Thread Groups theo bảng trên.
> Xem chi tiết: `.github/prompts/tool-test.prompt.md` (Part 3)
