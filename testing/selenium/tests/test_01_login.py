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
import csv
import os
from pages.login_page import LoginPage
from config import FRONTEND_URL, TEACHER_USERNAME, TEACHER_PASSWORD, STUDENT_USERNAME, STUDENT_PASSWORD, TEST_DATA_DIR


class TestLogin:
    """Bộ test cho chức năng Login."""

    # --- TC_SEL_LOGIN_01: Login thành công với tài khoản Teacher ---
    def test_login_success_teacher(self, driver):
        """
        TC_SEL_LOGIN_01: Đăng nhập thành công với tài khoản teacher.
        Input: anhnt39 / @Tuananh10012004
        Expected: Redirect tới /dashboard/teacher
        """
        # TODO: Implement test
        pass

    # --- TC_SEL_LOGIN_02: Login thành công với tài khoản Student ---
    def test_login_success_student(self, driver):
        """
        TC_SEL_LOGIN_02: Đăng nhập thành công với tài khoản student.
        Input: anhnt36 / @Tuananh10012004
        Expected: Redirect tới /dashboard/student
        """
        # TODO: Implement test
        pass

    # --- TC_SEL_LOGIN_03: Login sai password ---
    def test_login_wrong_password(self, driver):
        """
        TC_SEL_LOGIN_03: Đăng nhập với password sai.
        Input: anhnt36 / wrong_password
        Expected: Hiển thị thông báo lỗi
        """
        # TODO: Implement test
        pass

    # --- TC_SEL_LOGIN_04: Login user không tồn tại ---
    def test_login_nonexistent_user(self, driver):
        """
        TC_SEL_LOGIN_04: Đăng nhập với user không tồn tại.
        Input: fake_user_999 / any_password
        Expected: Hiển thị thông báo lỗi
        """
        # TODO: Implement test
        pass

    # --- TC_SEL_LOGIN_05: Login để trống username ---
    def test_login_empty_username(self, driver):
        """
        TC_SEL_LOGIN_05: Bỏ trống trường username.
        Expected: Hiển thị validation error (HTML5 required)
        """
        # TODO: Implement test
        pass

    # --- TC_SEL_LOGIN_06: Login để trống password ---
    def test_login_empty_password(self, driver):
        """
        TC_SEL_LOGIN_06: Bỏ trống trường password.
        Expected: Hiển thị validation error
        """
        # TODO: Implement test
        pass

    # --- TC_SEL_LOGIN_07: Login để trống cả 2 field ---
    def test_login_empty_both(self, driver):
        """
        TC_SEL_LOGIN_07: Bỏ trống cả username và password.
        Expected: Hiển thị validation error
        """
        # TODO: Implement test
        pass

    # --- TC_SEL_LOGIN_08: Click link "Quên mật khẩu" ---
    def test_forgot_password_link(self, driver):
        """
        TC_SEL_LOGIN_08: Click vào link 'Quên mật khẩu'.
        Expected: Redirect tới /forgot-password
        """
        # TODO: Implement test
        pass
