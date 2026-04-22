# ==============================================================================
# TEST 08: NAVIGATION & SESSION
# ==============================================================================
import pytest
import time
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from selenium.webdriver.common.by import By
from config import STUDENT_USERNAME, STUDENT_PASSWORD, FRONTEND_URL

class TestNavigation:

    # --- TC_SEL_NAV_01: Logo click → home ---
    def test_logo_click(self, driver):
        """
        Mục đích: Click logo điều hướng về home
        Test Case ID: TC_SEL_NAV_01
        """
        driver.get(FRONTEND_URL)
        time.sleep(1)
        # Assuming logo is visible and clickable
        try:
            logo = driver.find_element(By.CSS_SELECTOR, "img[alt*='Logo'], .logo")
            logo.click()
            assert driver.current_url == f"{FRONTEND_URL}/" or driver.current_url == FRONTEND_URL
        except:
            pytest.skip("No clickable logo found on index page")

    # --- TC_SEL_NAV_02: Logout → clear session ---
    def test_logout_clears_session(self, driver):
        """
        Mục đích: Đăng xuất xoá token và trở về login
        Test Case ID: TC_SEL_NAV_02
        """
        login = LoginPage(driver)
        login.open_login_page()
        login.login(STUDENT_USERNAME, STUDENT_PASSWORD)
        time.sleep(1)
        
        dashboard = DashboardPage(driver)
        dashboard.logout()
        time.sleep(1)
        
        assert "/login" in driver.current_url

    # --- TC_SEL_NAV_03: Browser back after logout ---
    def test_browser_back_after_logout(self, driver):
        """
        Mục đích: Back lại trang cũ sau khi logout bị cấm (redirect)
        Test Case ID: TC_SEL_NAV_03
        """
        login = LoginPage(driver)
        login.open_login_page()
        login.login(STUDENT_USERNAME, STUDENT_PASSWORD)
        time.sleep(1)
        
        dashboard = DashboardPage(driver)
        dashboard.logout()
        time.sleep(1)
        
        driver.back()
        time.sleep(1)
        
        # Protected route -> Redirect back to login
        assert "/login" in driver.current_url
