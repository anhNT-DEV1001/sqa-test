# ==============================================================================
# TEST 03: DASHBOARD — Kiểm tra UI Dashboard
# ==============================================================================
import pytest
import time
from pages.dashboard_page import DashboardPage
from pages.login_page import LoginPage
from config import TEACHER_USERNAME, TEACHER_PASSWORD, STUDENT_USERNAME, STUDENT_PASSWORD

class TestDashboard:
    """Bộ test cho Dashboard."""

    # --- Setup Helper ---
    def _login(self, driver, user, pwd):
        """Helper để đăng nhập vào test flow."""
        login_page = LoginPage(driver)
        login_page.open_login_page()
        login_page.login(user, pwd)
        time.sleep(1)

    # --- TC_SEL_DASH_01: Teacher dashboard hiển thị stats ---
    def test_teacher_dashboard_stats(self, driver):
        """
        Mục đích: Teacher đăng nhập xong phải thấy các thẻ Stats
        Test Case ID: TC_SEL_DASH_01
        """
        # [Setup]: Đăng nhập với teacher
        self._login(driver, TEACHER_USERNAME, TEACHER_PASSWORD)
        dashboard = DashboardPage(driver)
        
        # [Verify]: Chờ card hiển thị
        assert dashboard.is_stats_visible() is True

    # --- TC_SEL_DASH_02: Student dashboard hiển thị ---
    def test_student_dashboard_loads(self, driver):
        """
        Mục đích: Student load được dashboard của mình
        Test Case ID: TC_SEL_DASH_02
        """
        self._login(driver, STUDENT_USERNAME, STUDENT_PASSWORD)
        dashboard = DashboardPage(driver)
        assert "/dashboard/student" in dashboard.get_current_url()

    # --- TC_SEL_DASH_03: Sidebar navigation hoạt động ---
    def test_sidebar_navigation(self, driver):
        """
        Mục đích: Click menu sidebar phải chuyển trang
        Test Case ID: TC_SEL_DASH_03
        """
        self._login(driver, TEACHER_USERNAME, TEACHER_PASSWORD)
        dashboard = DashboardPage(driver)
        
        # [Execute]: Click vào Courses
        dashboard.click_sidebar_item("Courses")
        time.sleep(1)
        
        # [Verify]: URL chuyển sang trang khóa học
        assert "/courses" in dashboard.get_current_url()

    # --- TC_SEL_DASH_04: Student → teacher page ---
    def test_student_access_teacher_route(self, driver):
        """
        Mục đích: Kiểm tra phân quyền (RBAC) trên frontend
        Test Case ID: TC_SEL_DASH_04
        """
        self._login(driver, STUDENT_USERNAME, STUDENT_PASSWORD)
        dashboard = DashboardPage(driver)
        
        # [Execute]: Sinh viên cố tình truy cập link của giáo viên
        dashboard.open_teacher_dashboard()
        time.sleep(1)
        
        # [Verify]: Bị redirect về trang báo lỗi hoặc trang gốc
        assert "unauthorized" in dashboard.get_current_url().lower() or "/dashboard/student" in dashboard.get_current_url()

    # --- TC_SEL_DASH_05: Unauthenticated → redirect login ---
    def test_unauthenticated_access(self, driver):
        """
        Mục đích: Guest không được vào dashboard
        Test Case ID: TC_SEL_DASH_05
        """
        dashboard = DashboardPage(driver)
        
        # [Execute]: Cố tình truy cập thẳng dashboard không có token
        dashboard.open_teacher_dashboard()
        time.sleep(1)
        
        # [Verify]: Phải redirect về trang login
        assert "/login" in dashboard.get_current_url()
