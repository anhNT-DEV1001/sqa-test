# ==============================================================================
# PYTEST FIXTURES — Cấu hình chung cho tất cả Selenium test
# ==============================================================================
# File này chứa các fixture dùng chung:
#   - driver: Khởi tạo và đóng WebDriver
#   - db: Kết nối MongoDB cho DB verification
#   - screenshot_on_failure: Tự động chụp screenshot khi test fail
# ==============================================================================

import pytest
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from pymongo import MongoClient
from config import (
    BROWSER, HEADLESS, IMPLICIT_WAIT, PAGE_LOAD_TIMEOUT,
    SCREENSHOT_DIR, MONGODB_URI, DB_NAME
)


# --- Fixture: WebDriver ---
# Khởi tạo Chrome WebDriver trước mỗi test, đóng sau khi test xong
@pytest.fixture(scope="function")
def driver():
    """Khởi tạo WebDriver cho mỗi test function."""
    # TODO: Cấu hình Chrome options (headless, window size, etc.)
    options = webdriver.ChromeOptions()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

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


# --- Hook: Screenshot on Failure ---
# Tự động chụp screenshot khi test fail
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Chụp screenshot tự động khi test case FAIL."""
    outcome = yield
    report = outcome.get_result()

    if report.when == "call" and report.failed:
        # Lấy driver từ fixture (nếu có)
        driver = item.funcargs.get("driver", None)
        if driver:
            # Tạo thư mục screenshots nếu chưa có
            os.makedirs(SCREENSHOT_DIR, exist_ok=True)

            # Đặt tên file: test_name_timestamp.png
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{item.name}_{timestamp}.png"
            filepath = os.path.join(SCREENSHOT_DIR, filename)

            driver.save_screenshot(filepath)
            print(f"\n📷 Screenshot saved: {filepath}")
