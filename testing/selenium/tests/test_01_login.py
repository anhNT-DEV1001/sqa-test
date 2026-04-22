# ==============================================================================
# TEST 01: LOGIN — Kiểm tra chức năng đăng nhập
# ==============================================================================
# File: tests/test_01_login.py
# Test Cases: TC_SEL_LOGIN_01 → TC_SEL_LOGIN_08
# Data Source: test_data/login_data.csv
# DB Check: Không cần (chỉ kiểm tra UI redirect/error)
# Rollback: Không cần
# ==============================================================================

import pytest
import time
from pages.login_page import LoginPage
from config import TEACHER_USERNAME, TEACHER_PASSWORD, STUDENT_USERNAME, STUDENT_PASSWORD

class TestLogin:
    """Bộ test cho chức năng Login."""

    # --- TC_SEL_LOGIN_01: Login thành công với tài khoản Teacher ---
    def test_login_success_teacher(self, driver):
        """
        Mục đích: Kiểm tra đăng nhập thành công với tài khoản Teacher hợp lệ
        Test Case ID: TC_SEL_LOGIN_01
        Rollback: Không cần
        """
        # [Setup]: Khởi tạo page object và mở trang login
        login_page = LoginPage(driver)
        login_page.open_login_page()
        time.sleep(1) # Đợi trang load

        # [Execute]: Nhập username và password của teacher, sau đó click submit
        login_page.login(TEACHER_USERNAME, TEACHER_PASSWORD)
        
        # [Verify]: Chờ đợi URL chuyển hướng tới dashboard của teacher
        login_page.wait_for_url_contains("/dashboard/teacher")
        
        # [Assert]: Kiểm tra URL hiện tại chứa đúng endpoint mong muốn
        assert "/dashboard/teacher" in login_page.get_current_url()

    # --- TC_SEL_LOGIN_02: Login thành công với tài khoản Student ---
    def test_login_success_student(self, driver):
        """
        Mục đích: Kiểm tra đăng nhập thành công với tài khoản Student hợp lệ
        Test Case ID: TC_SEL_LOGIN_02
        Rollback: Không cần
        """
        # [Setup]: Mở trang login
        login_page = LoginPage(driver)
        login_page.open_login_page()

        # [Execute]: Nhập credentials của student và submit
        login_page.login(STUDENT_USERNAME, STUDENT_PASSWORD)
        
        # [Verify]: Hệ thống phải chuyển về dashboard của student
        login_page.wait_for_url_contains("/dashboard/student")
        
        # [Assert]: Xác minh URL
        assert "/dashboard/student" in login_page.get_current_url()

    # --- TC_SEL_LOGIN_03: Login sai password ---
    def test_login_wrong_password(self, driver):
        """
        Mục đích: Kiểm tra hành vi khi nhập sai password cho user hợp lệ
        Test Case ID: TC_SEL_LOGIN_03
        Rollback: Không cần
        """
        # [Setup]: Mở trang login
        login_page = LoginPage(driver)
        login_page.open_login_page()

        # [Execute]: Nhập username đúng, password sai
        login_page.login(STUDENT_USERNAME, "wrong_password_123")
        time.sleep(1) # Chờ API trả về lỗi

        # [Verify & Assert]: Kiểm tra thông báo lỗi hiển thị trên UI
        assert login_page.is_error_displayed() is True

    # --- TC_SEL_LOGIN_04: Login user không tồn tại ---
    def test_login_nonexistent_user(self, driver):
        """
        Mục đích: Kiểm tra hành vi khi nhập username không tồn tại trong hệ thống
        Test Case ID: TC_SEL_LOGIN_04
        Rollback: Không cần
        """
        # [Setup]
        login_page = LoginPage(driver)
        login_page.open_login_page()

        # [Execute]: Nhập user ngẫu nhiên không có trong DB
        login_page.login("fake_user_999", "any_password")
        time.sleep(1)

        # [Verify & Assert]: Phải hiện thông báo lỗi
        assert login_page.is_error_displayed() is True

    # --- TC_SEL_LOGIN_05: Login để trống username ---
    def test_login_empty_username(self, driver):
        """
        Mục đích: Xác thực validate form khi bỏ trống trường username
        Test Case ID: TC_SEL_LOGIN_05
        Rollback: Không cần
        """
        # [Setup]
        login_page = LoginPage(driver)
        login_page.open_login_page()

        # [Execute]: Để trống user, chỉ nhập password
        login_page.login("", STUDENT_PASSWORD)

        # [Verify & Assert]: URL không đổi (không submit được) và hiển thị validation
        assert "/login" in login_page.get_current_url()

    # --- TC_SEL_LOGIN_06: Login để trống password ---
    def test_login_empty_password(self, driver):
        """
        Mục đích: Xác thực validate form khi bỏ trống password
        Test Case ID: TC_SEL_LOGIN_06
        Rollback: Không cần
        """
        # [Setup]
        login_page = LoginPage(driver)
        login_page.open_login_page()

        # [Execute]: Chỉ nhập user, bỏ trống pass
        login_page.login(STUDENT_USERNAME, "")

        # [Verify & Assert]
        assert "/login" in login_page.get_current_url()

    # --- TC_SEL_LOGIN_07: Login để trống cả 2 field ---
    def test_login_empty_both(self, driver):
        """
        Mục đích: Xác thực validate form khi bỏ trống cả 2 trường bắt buộc
        Test Case ID: TC_SEL_LOGIN_07
        Rollback: Không cần
        """
        # [Setup]
        login_page = LoginPage(driver)
        login_page.open_login_page()

        # [Execute]: Bỏ trống tất cả
        login_page.login("", "")

        # [Verify & Assert]
        assert "/login" in login_page.get_current_url()

    # --- TC_SEL_LOGIN_08: Click link "Quên mật khẩu" ---
    def test_forgot_password_link(self, driver):
        """
        Mục đích: Kiểm tra navigation của link "Quên mật khẩu"
        Test Case ID: TC_SEL_LOGIN_08
        Rollback: Không cần
        """
        # [Setup]
        login_page = LoginPage(driver)
        login_page.open_login_page()

        # [Execute]: Click vào link quên mật khẩu
        login_page.click_forgot_password()
        time.sleep(1)

        # [Verify & Assert]: Đảm bảo redirect sang trang reset password
        assert "/forgot-password" in login_page.get_current_url()
