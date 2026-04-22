# Tool Testing — Academix Platform

> Xem kế hoạch chi tiết tại: [`.github/prompts/tool-test.prompt.md`](../.github/prompts/tool-test.prompt.md)

## Phân công thành viên

| Part | Thư mục | Công cụ | Người thực hiện | Trạng thái |
|------|---------|---------|-----------------|------------|
| 1 | `selenium/` | Selenium WebDriver (Python) | _Điền tên_ | ⬜ Chưa bắt đầu |
| 2 | `postman/` | Postman + Newman | _Điền tên_ | ⬜ Chưa bắt đầu |
| 3 | `jmeter/` | Apache JMeter | _Điền tên_ | ⬜ Chưa bắt đầu |

## Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Student | `anhnt36` | `@Tuananh10012004` |
| Teacher | `anhnt39` | `@Tuananh10012004` |

## Cách chạy

```powershell
# Part 1: Selenium
cd testing/selenium
pip install -r requirements.txt
pytest tests/ -v --html=report.html --self-contained-html

# Part 2: Postman
npm install -g newman newman-reporter-htmlextra
cd testing/postman
newman run Academix_API.postman_collection.json -e Academix_ENV.postman_environment.json -r htmlextra

# Part 3: JMeter
cd testing/jmeter
jmeter -n -t Academix_Performance.jmx -l results.jtl -e -o report/
```
