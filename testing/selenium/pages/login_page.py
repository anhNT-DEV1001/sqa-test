# ==============================================================================
# LOGIN PAGE — Page Object cho trang đăng nhập
# ==============================================================================
# URL: /login
# Elements: identifier input, password input, submit button, error message
# TODO: Thành viên phụ trách cập nhật locators cho đúng với UI thực tế
# ==============================================================================

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import FRONTEND_URL


class LoginPage(BasePage):
    """Page Object cho trang Login (/login)."""

    # --- URL ---
    URL = f"{FRONTEND_URL}/login"

    # --- Locators ---
    # TODO: Cập nhật locators theo HTML thực tế của LoginCard component
    INPUT_IDENTIFIER = (By.CSS_SELECTOR, "input[name='identifier']")
    INPUT_PASSWORD = (By.CSS_SELECTOR, "input[name='password']")
    BTN_SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".ant-alert-message, .error-message")
    LINK_FORGOT_PASSWORD = (By.CSS_SELECTOR, "a[href='/forgot-password']")
    LINK_REGISTER = (By.CSS_SELECTOR, "a[href='/register']")

    # --- Actions ---
    def open_login_page(self):
        """Mở trang login."""
        self.open(self.URL)

    def login(self, identifier: str, password: str):
        """Thực hiện đăng nhập với identifier và password."""
        # Nhập username/email
        self.type_text(*self.INPUT_IDENTIFIER, identifier)
        # Nhập password
        self.type_text(*self.INPUT_PASSWORD, password)
        # Click nút đăng nhập
        self.click(*self.BTN_SUBMIT)

    def get_error_message(self) -> str:
        """Lấy nội dung thông báo lỗi (nếu có)."""
        return self.get_text(*self.ERROR_MESSAGE)

    def click_forgot_password(self):
        """Click link 'Quên mật khẩu'."""
        self.click(*self.LINK_FORGOT_PASSWORD)

    def click_register(self):
        """Click link 'Đăng ký'."""
        self.click(*self.LINK_REGISTER)

    def is_error_displayed(self) -> bool:
        """Kiểm tra có thông báo lỗi hiển thị không."""
        return self.is_element_visible(*self.ERROR_MESSAGE)
