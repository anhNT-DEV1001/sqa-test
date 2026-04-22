# ==============================================================================
# TEST 02: REGISTER — Kiểm tra chức năng đăng ký
# ==============================================================================
import pytest
import time
from pages.register_page import RegisterPage
from pages.login_page import LoginPage
from utils.db_helper import MongoDBHelper

class TestRegister:
    """Bộ test cho chức năng Register."""

    # --- TC_SEL_REG_01: Register student thành công + verify login ---
    def test_register_success_student(self, driver, db):
        """
        Mục đích: Kiểm tra flow đăng ký tài khoản Student mới
        Test Case ID: TC_SEL_REG_01
        Flow:
          1. Điền form register với agree_terms=True → submit
          2. Verify redirect về /login
          3. Verify user tồn tại trong DB
          4. Đăng nhập bằng email + mật khẩu vừa tạo → phải vào được dashboard
        Rollback: Xoá user vừa tạo
        """
        register_page = RegisterPage(driver)
        register_page.open_register_page()

        test_username  = "auto_student_test"
        test_email     = "auto_student@test.com"
        test_password  = "@TestPassword123"
        db_helper = MongoDBHelper()

        # [Clear trước khi test]
        db_helper.delete_user_by_username(test_username)

        # [Execute]: Điền form + tick Terms
        register_page.register(
            fullname="Auto Student",
            username=test_username,
            email=test_email,
            password=test_password,
            confirm_password=test_password,
            role="student",
            agree_terms=True
        )
        time.sleep(2)

        # [Verify UI]: Redirect về login
        assert "/login" in register_page.get_current_url(), \
            f"❌ Không redirect về /login. URL hiện tại: {register_page.get_current_url()}"

        # [Verify DB]: User đã lưu vào MongoDB
        user_in_db = db_helper.find_user_by_username(test_username)
        assert user_in_db is not None, "❌ User không tồn tại trong DB"
        assert user_in_db["email"] == test_email
        assert user_in_db["role"] == "student"

        # [Verify LOGIN]: Đăng nhập với email + mật khẩu vừa đăng ký
        login_page = LoginPage(driver)
        login_page.open_login_page()
        login_page.login(test_email, test_password)  # dùng email làm identifier
        time.sleep(2)

        assert "/dashboard" in driver.current_url, \
            f"❌ Không đăng nhập được với tài khoản mới. URL: {driver.current_url}"

        # [Rollback]: Xoá user để DB sạch
        db_helper.delete_user_by_username(test_username)

    # --- TC_SEL_REG_02: Register teacher thành công + verify login ---
    def test_register_success_teacher(self, driver, db):
        """
        Mục đích: Kiểm tra flow đăng ký tài khoản Teacher + verify login
        Test Case ID: TC_SEL_REG_02
        """
        register_page = RegisterPage(driver)
        register_page.open_register_page()

        test_username = "auto_teacher_test"
        test_email    = "auto_teacher@test.com"
        test_password = "@TestPassword123"
        db_helper = MongoDBHelper()
        db_helper.delete_user_by_username(test_username)

        # [Execute]: Điền form + tick Terms
        register_page.register(
            fullname="Auto Teacher",
            username=test_username,
            email=test_email,
            password=test_password,
            confirm_password=test_password,
            role="teacher",
            agree_terms=True
        )
        time.sleep(2)

        # [Verify UI]
        assert "/login" in register_page.get_current_url(), \
            f"❌ Không redirect về /login. URL: {register_page.get_current_url()}"

        # [Verify DB]
        user_in_db = db_helper.find_user_by_username(test_username)
        assert user_in_db is not None, "❌ User không tồn tại trong DB"
        assert user_in_db["role"] == "teacher"

        # [Verify LOGIN]: Đăng nhập với email + mật khẩu vừa đăng ký
        login_page = LoginPage(driver)
        login_page.open_login_page()
        login_page.login(test_email, test_password)
        time.sleep(2)

        assert "/dashboard" in driver.current_url, \
            f"❌ Không đăng nhập được với tài khoản teacher mới. URL: {driver.current_url}"

        # [Rollback]
        db_helper.delete_user_by_username(test_username)

    # --- TC_SEL_REG_03: Register email đã tồn tại ---
    def test_register_duplicate_email(self, driver):
        """
        Mục đích: Validate trùng email — phải hiện lỗi, không sang trang login
        Test Case ID: TC_SEL_REG_03
        """
        register_page = RegisterPage(driver)
        register_page.open_register_page()

        register_page.register(
            fullname="Test Dup",
            username="testdup_email123",
            email="anhnt36@gmail.com",  # Email đã tồn tại
            password="@TestPassword123",
            confirm_password="@TestPassword123",
            role="student",
            agree_terms=True
        )
        time.sleep(2)

        # [Verify]: Phải hiện lỗi, không chuyển sang /login
        assert register_page.is_error_displayed() is True, \
            "❌ Không hiển thị thông báo lỗi trùng email"

    # --- TC_SEL_REG_04: Register username đã tồn tại ---
    def test_register_duplicate_username(self, driver):
        """
        Mục đích: Validate trùng username
        Test Case ID: TC_SEL_REG_04
        """
        register_page = RegisterPage(driver)
        register_page.open_register_page()

        register_page.register(
            fullname="Test Dup",
            username="anhnt36",           # Username đã tồn tại
            email="newemail123@test.com",
            password="@TestPassword123",
            confirm_password="@TestPassword123",
            role="student",
            agree_terms=True
        )
        time.sleep(2)

        assert register_page.is_error_displayed() is True, \
            "❌ Không hiển thị thông báo lỗi trùng username"

    # --- TC_SEL_REG_05: Register password quá ngắn ---
    def test_register_short_password(self, driver):
        """
        Mục đích: Validate password quá ngắn — bị chặn client-side
        Test Case ID: TC_SEL_REG_05
        """
        register_page = RegisterPage(driver)
        register_page.open_register_page()
        register_page.register(
            fullname="Test", username="test_shortpass", email="test_short@test.com",
            password="123", confirm_password="123", role="student",
            agree_terms=False  # Client validation xảy ra trước cả terms check
        )
        time.sleep(1)
        assert "/register" in register_page.get_current_url()

    # --- TC_SEL_REG_06: Register password không khớp ---
    def test_register_mismatch_password(self, driver):
        """
        Mục đích: Validate confirm password không khớp
        Test Case ID: TC_SEL_REG_06
        """
        register_page = RegisterPage(driver)
        register_page.open_register_page()
        register_page.register(
            fullname="Test", username="test_mismatch", email="test_mismatch@test.com",
            password="@Password1", confirm_password="@Password2", role="student",
            agree_terms=False
        )
        time.sleep(1)
        assert "/register" in register_page.get_current_url()

    # --- TC_SEL_REG_07: Register email sai format ---
    def test_register_invalid_email(self, driver):
        """
        Mục đích: Validate format email
        Test Case ID: TC_SEL_REG_07
        """
        register_page = RegisterPage(driver)
        register_page.open_register_page()
        register_page.register(
            fullname="Test", username="test_invalidemail", email="not_an_email",
            password="@Password1", confirm_password="@Password1", role="student",
            agree_terms=True
        )
        time.sleep(1)
        assert "/register" in register_page.get_current_url()

    # --- TC_SEL_REG_08: Register trống required fields ---
    def test_register_empty_fields(self, driver):
        """
        Mục đích: Không cho phép form rỗng
        Test Case ID: TC_SEL_REG_08
        """
        register_page = RegisterPage(driver)
        register_page.open_register_page()
        register_page.register("", "", "", "", "", "student", agree_terms=False)
        time.sleep(1)
        assert "/register" in register_page.get_current_url()
