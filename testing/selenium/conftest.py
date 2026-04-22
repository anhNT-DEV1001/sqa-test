# ==============================================================================
# PYTEST FIXTURES — Cấu hình chung cho tất cả Selenium test
# ==============================================================================
# File này chứa các fixture dùng chung:
#   - driver: Khởi tạo và đóng WebDriver
#   - db: Kết nối MongoDB cho DB verification
#   - video_on_test: Tự động quay video màn hình mỗi test case
#     → Video lưu vào thư mục screenshots/ (cả PASS lẫn FAIL đều lưu)
#     → Sau khi test xong, dừng 3 giây để video capture rõ màn hình kết quả
# ==============================================================================

import pytest
import os
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from pymongo import MongoClient
from config import (
    BROWSER, HEADLESS, IMPLICIT_WAIT, PAGE_LOAD_TIMEOUT,
    SCREENSHOT_DIR, MONGODB_URI, DB_NAME
)
from utils.video_recorder import SeleniumVideoRecorder

# Số giây dừng lại sau khi test xong để video hiển thị rõ kết quả
RESULT_PAUSE_SECONDS = 3


# --- Fixture: WebDriver ---
# Khởi tạo Chrome WebDriver trước mỗi test, đóng sau khi test xong
@pytest.fixture(scope="function")
def driver():
    """Khởi tạo WebDriver cho mỗi test function."""
    options = webdriver.ChromeOptions()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    # Khởi tạo driver với webdriver-manager (tự tải ChromeDriver)
    service = Service(ChromeDriverManager().install())
    _driver = webdriver.Chrome(service=service, options=options)
    _driver.implicitly_wait(IMPLICIT_WAIT)
    _driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)

    yield _driver

    # Teardown: Đóng trình duyệt sau mỗi test
    _driver.quit()


# --- Fixture: MongoDB Connection ---
# Kết nối MongoDB để verify dữ liệu sau các mutation test
@pytest.fixture(scope="session")
def db():
    """Kết nối MongoDB Atlas cho database verification."""
    client = MongoClient(MONGODB_URI)
    database = client[DB_NAME]
    yield database
    client.close()


# ==============================================================================
# Hook: VIDEO RECORDING mỗi test case
# ==============================================================================
# Mỗi test sẽ được quay video và lưu vào screenshots/<test_name>_<timestamp>.mp4
# Cả test PASS lẫn FAIL đều được lưu video.
# Sau khi test body hoàn thành, dừng lại 3 giây để video capture kết quả cuối.
# ==============================================================================

_recorders: dict[str, SeleniumVideoRecorder] = {}  # nodeid → recorder


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_call(item):
    """Bắt đầu quay video trước khi test chạy, dừng và lưu sau khi xong."""
    driver = item.funcargs.get("driver", None)
    recorder = None

    if driver:
        # Chuẩn bị tên file video
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = item.name.replace("[", "_").replace("]", "").replace("/", "_")
        video_path = os.path.join(SCREENSHOT_DIR, f"{safe_name}_{timestamp}.mp4")

        recorder = SeleniumVideoRecorder(driver, video_path, fps=5)
        _recorders[item.nodeid] = recorder
        recorder.start()

    yield  # ← test chạy ở đây

    if recorder:
        # ⏸️ Dừng lại 3 giây để video capture rõ màn hình kết quả cuối cùng
        print(f"\n⏸️  Pausing {RESULT_PAUSE_SECONDS}s để video capture kết quả...")
        time.sleep(RESULT_PAUSE_SECONDS)
        recorder.stop()
        _recorders.pop(item.nodeid, None)


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """In thêm thông tin khi test FAIL (video đã được lưu bởi hook ở trên)."""
    outcome = yield
    report = outcome.get_result()

    if report.when == "call" and report.failed:
        driver = item.funcargs.get("driver", None)
        if driver:
            # Lưu thêm ảnh chụp màn hình tại thời điểm fail để tiện debug
            os.makedirs(SCREENSHOT_DIR, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = item.name.replace("[", "_").replace("]", "").replace("/", "_")
            png_path = os.path.join(SCREENSHOT_DIR, f"FAIL_{safe_name}_{timestamp}.png")
            driver.save_screenshot(png_path)
            print(f"\n📷 Failure screenshot: {png_path}")
            print(f"🎬 Full video saved in: {SCREENSHOT_DIR}/")
