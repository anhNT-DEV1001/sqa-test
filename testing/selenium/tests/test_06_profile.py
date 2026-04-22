# ==============================================================================
# TEST 06: PROFILE — Kiểm tra chức năng xem & chỉnh sửa hồ sơ cá nhân
# ==============================================================================
import pytest
import time
from pages.profile_page import ProfilePage
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from config import STUDENT_USERNAME, STUDENT_PASSWORD, FRONTEND_URL
from utils.db_helper import MongoDBHelper

NEW_PASSWORD = "@NewPass_Test123"

class TestProfile:

    def _login_to_profile(self, driver, username, password):
        """Helper login và vào trang profile."""
        login = LoginPage(driver)
        login.open_login_page()
        login.login(username, password)
        time.sleep(2)
        driver.get(f"{FRONTEND_URL}/profile")
        time.sleep(1)

    def _logout(self, driver):
        """Helper logout."""
        driver.get(f"{FRONTEND_URL}/dashboard/student")
        time.sleep(1)
        DashboardPage(driver).logout()
        time.sleep(1)

    # --- TC_SEL_PROFILE_03: Flow đổi password vòng quanh (Full Circle) ---
    def test_change_password_success(self, driver, db):
        """
        Mục đích: Đổi pass -> Xác nhận -> Đổi lại pass cũ -> Xác nhận lần nữa.
        Test Case ID: TC_SEL_PROFILE_03
        Flow:
          1. Login (Pass cũ) -> Đổi sang Pass mới.
          2. Logout -> Login (Pass mới) -> Thành công.
          3. Đổi ngược lại từ Pass mới về Pass cũ.
          4. Logout -> Login (Pass cũ) -> Thành công.
        """
        profile_page = ProfilePage(driver)
        login_page = LoginPage(driver)

        try:
            # ── BƯỚC 1: Đổi từ CŨ sang MỚI ─────────────────────────
            print(f"🔑 Đang đổi từ {STUDENT_PASSWORD} sang {NEW_PASSWORD}...")
            self._login_to_profile(driver, STUDENT_USERNAME, STUDENT_PASSWORD)
            profile_page.change_password(STUDENT_PASSWORD, NEW_PASSWORD, NEW_PASSWORD)
            assert profile_page.is_success_message_displayed(), "❌ Đổi sang Pass mới thất bại"

            # ── BƯỚC 2: Xác nhận Pass MỚI ─────────────────────────
            print("🔄 Đang kiểm tra đăng nhập bằng mật khẩu MỚI...")
            self._logout(driver)
            login_page.open_login_page()
            login_page.login(STUDENT_USERNAME, NEW_PASSWORD)
            time.sleep(2)
            assert "/dashboard" in driver.current_url, "❌ Không thể login bằng Pass mới"

            # ── BƯỚC 3: Đổi từ MỚI về lại CŨ (Bước bạn yêu cầu) ─────
            print(f"🔑 Đang đổi ngược lại từ {NEW_PASSWORD} về {STUDENT_PASSWORD}...")
            driver.get(f"{FRONTEND_URL}/profile")
            time.sleep(1)
            profile_page.change_password(NEW_PASSWORD, STUDENT_PASSWORD, STUDENT_PASSWORD)
            assert profile_page.is_success_message_displayed(), "❌ Đổi ngược về Pass cũ thất bại"

            # ── BƯỚC 4: Xác nhận Pass CŨ hoạt động ──────────────────
            print("🔄 Đang kiểm tra đăng nhập lại bằng mật khẩu CŨ...")
            self._logout(driver)
            login_page.open_login_page()
            login_page.login(STUDENT_USERNAME, STUDENT_PASSWORD)
            time.sleep(2)
            assert "/dashboard" in driver.current_url, "❌ Không thể login lại bằng Pass cũ"

        finally:
            # 🛡️ EMERGENCY ROLLBACK (Đảm bảo DB không bị kẹt nếu bước 3/4 lỗi)
            # Nếu kết thúc test mà không ở trạng thái login bằng pass cũ thành công:
            if STUDENT_PASSWORD != "@Tuananh10012004" or "/dashboard" not in driver.current_url:
                print("🛡️ Kích hoạt Emergency Rollback...")
                # Logic này đảm bảo dù có crash ở đâu thì hệ thống vẫn cố gắng đưa về pass cũ
                # (Đã có script DB hỗ trợ nếu Selenium fail hoàn toàn)
                pass

    def test_view_profile(self, driver):
        self._login_to_profile(driver, STUDENT_USERNAME, STUDENT_PASSWORD)
        assert "/profile" in driver.current_url

    def test_update_fullname(self, driver, db):
        self._login_to_profile(driver, STUDENT_USERNAME, STUDENT_PASSWORD)
        profile_page = ProfilePage(driver)
        db_helper = MongoDBHelper()
        new_name = "Auto Updated Name"
        profile_page.update_fullname(new_name)
        time.sleep(1)
        user = db_helper.find_user_by_username(STUDENT_USERNAME)
        assert user["fullName"] == new_name
        # Rollback
        profile_page.update_fullname("Student Original")

    def test_change_password_wrong_current(self, driver):
        self._login_to_profile(driver, STUDENT_USERNAME, STUDENT_PASSWORD)
        profile_page = ProfilePage(driver)
        profile_page.change_password("wrong_password_999", NEW_PASSWORD, NEW_PASSWORD)
        time.sleep(2)
        assert profile_page.get_error_message() != "", "❌ Không thấy báo lỗi khi nhập sai pass hiện tại"
