# ==============================================================================
# DASHBOARD PAGE — Page Object cho trang Dashboard
# ==============================================================================
# URL: /dashboard/teacher hoặc /dashboard/student
# TODO: Thành viên phụ trách cập nhật locators
# ==============================================================================

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import FRONTEND_URL


class DashboardPage(BasePage):
    """Page Object cho trang Dashboard."""

    TEACHER_URL = f"{FRONTEND_URL}/dashboard/teacher"
    STUDENT_URL = f"{FRONTEND_URL}/dashboard/student"

    # --- Locators ---
    # TODO: Cập nhật locators theo UI thực tế
    STATS_CARDS = (By.CSS_SELECTOR, ".stats-card, .ant-card")
    SIDEBAR_MENU = (By.CSS_SELECTOR, ".ant-menu-item")
    LOGOUT_BUTTON = (By.CSS_SELECTOR, "[data-testid='logout'], .logout-btn")

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
        # TODO: Implement navigation qua sidebar
        pass

    def logout(self):
        """Thực hiện logout."""
        # TODO: Implement logout flow
        pass
