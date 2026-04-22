# ==============================================================================
# DASHBOARD PAGE — Page Object cho trang Dashboard
# ==============================================================================
# URL: /dashboard/teacher hoặc /dashboard/student
# Tất cả locators dùng XPath
# ==============================================================================

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import FRONTEND_URL
import time

class DashboardPage(BasePage):
    """Page Object cho trang Dashboard."""

    TEACHER_URL = f"{FRONTEND_URL}/dashboard/teacher"
    STUDENT_URL = f"{FRONTEND_URL}/dashboard/student"

    # --- Locators (XPath) ---
    STATS_CARDS      = (By.XPATH, "//div[contains(., 'Total Students') or contains(., 'Active Exams')]")
    USER_AVATAR      = (By.XPATH, "//*[contains(@class, 'ant-avatar')]")
    LOGOUT_MENU_ITEM = (By.XPATH, "//span[text()='Logout']/ancestor::li | //*[contains(text(), 'Logout')]")

    # --- Actions ---
    def open_teacher_dashboard(self):
        """Mở dashboard giáo viên."""
        self.open(self.TEACHER_URL)

    def open_student_dashboard(self):
        """Mở dashboard sinh viên."""
        self.open(self.STUDENT_URL)

    def is_stats_visible(self) -> bool:
        """Kiểm tra stats cards có hiển thị."""
        return self.is_element_visible(*self.STATS_CARDS)

    def click_sidebar_item(self, menu_text: str):
        """Click vào menu item trên sidebar."""
        # Dùng XPath để tìm menu item theo text
        locator = (By.XPATH, f"//span[text()='{menu_text}']/ancestor::a | //*[text()='{menu_text}']")
        self.click(*locator)

    def logout(self):
        """Thực hiện logout qua UserMenu."""
        self.click(*self.USER_AVATAR)
        time.sleep(0.5) # Chờ dropdown hiện ra
        self.click(*self.LOGOUT_MENU_ITEM)
