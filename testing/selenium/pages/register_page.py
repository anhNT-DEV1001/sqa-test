# ==============================================================================
# REGISTER PAGE — Page Object cho trang đăng ký
# ==============================================================================
# URL: /register
# TODO: Thành viên phụ trách cập nhật locators cho đúng với UI thực tế
# ==============================================================================

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import FRONTEND_URL


class RegisterPage(BasePage):
    """Page Object cho trang Register (/register)."""

    URL = f"{FRONTEND_URL}/register"

    # --- Locators ---
    # TODO: Cập nhật locators theo RegisterCard component
    INPUT_FULLNAME = (By.CSS_SELECTOR, "input[name='fullName']")
    INPUT_USERNAME = (By.CSS_SELECTOR, "input[name='username']")
    INPUT_EMAIL = (By.CSS_SELECTOR, "input[name='email']")
    INPUT_PASSWORD = (By.CSS_SELECTOR, "input[name='password']")
    INPUT_CONFIRM_PASSWORD = (By.CSS_SELECTOR, "input[name='confirmPassword']")
    SELECT_ROLE = (By.CSS_SELECTOR, "select[name='role']")
    CHECKBOX_TERMS = (By.CSS_SELECTOR, "input[name='agreeToTerms']")
    BTN_SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".ant-alert-message, .error-message")

    # --- Actions ---
    def open_register_page(self):
        """Mở trang đăng ký."""
        self.open(self.URL)

    def register(self, fullname: str, username: str, email: str,
                 password: str, confirm_password: str, role: str = "student"):
        """Điền form đăng ký và submit."""
        # TODO: Implement theo UI thực tế
        pass

    def get_error_message(self) -> str:
        """Lấy thông báo lỗi."""
        return self.get_text(*self.ERROR_MESSAGE)
