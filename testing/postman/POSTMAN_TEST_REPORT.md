# POSTMAN API TEST REPORT — Academix Platform

> **Tool:** Postman + Newman CLI + newman-reporter-htmlextra
> **Base URL:** http://localhost:8000/api/v1
> **Report Date:** _Điền sau khi chạy test_
> **Người thực hiện:** _Điền tên_

---

## 1. Test Cases Summary

| Folder | Module | # TCs | Pass | Fail |
|--------|--------|-------|------|------|
| 01 - Auth APIs | Authentication | 11 | _ | _ |
| 02 - Course APIs | Course CRUD | 7 | _ | _ |
| 03 - Exam APIs | Exam Management | 12 | _ | _ |
| 04 - Certificate APIs | Certificates | 7 | _ | _ |
| 05 - Dashboard & Notifications | Dashboard | 5 | _ | _ |
| **Total** | | **42** | _ | _ |

## 2. Execution Command

```powershell
newman run Academix_API.postman_collection.json -e Academix_ENV.postman_environment.json -r htmlextra
```

## 3. Report Screenshots

> 📷 **[Screenshot]** — Newman terminal output
> 📷 **[Screenshot]** — HTML report summary
