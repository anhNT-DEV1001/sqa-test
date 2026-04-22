# ==============================================================================
# CẤU HÌNH CHUNG CHO SELENIUM TESTS
# ==============================================================================
# File này chứa tất cả các hằng số, URL, credentials cần thiết cho test.
# Các thành viên chỉ cần chỉnh sửa file này khi thay đổi môi trường.
# ==============================================================================

# --- URL cấu hình ---
FRONTEND_URL = "http://localhost:3000"
API_BASE_URL = "http://localhost:8000/api/v1"

# --- MongoDB Connection (tham khảo backend/.env) ---
MONGODB_URI = "mongodb+srv://ducna1:nguyenanhduc2003@edu-chain-block.0veohpv.mongodb.net/test?retryWrites=true&w=majority&appName=edu-chain-block"
DB_NAME = "test"

# --- Test Accounts ---
TEACHER_USERNAME = "anhnt39"
TEACHER_PASSWORD = "@Tuananh10012004"
STUDENT_USERNAME = "anhnt36"
STUDENT_PASSWORD = "@Tuananh10012004"

# --- Browser Settings ---
BROWSER = "chrome"           # chrome | edge
HEADLESS = True            # True = chạy không hiện trình duyệt
IMPLICIT_WAIT = 10           # seconds
PAGE_LOAD_TIMEOUT = 30       # seconds
SCREENSHOT_ON_FAILURE = True # Chụp màn hình khi test fail

# --- Paths ---
SCREENSHOT_DIR = "screenshots"
REPORT_DIR = "reports"
TEST_DATA_DIR = "test_data"
