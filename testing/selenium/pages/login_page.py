# ==============================================================================
# LOGIN PAGE — Page Object cho trang đăng nhập
# ==============================================================================
# URL: /login
# Tất cả locators dùng XPath
# ==============================================================================

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import FRONTEND_URL


class LoginPage(BasePage):
    """Page Object cho trang Login (/login)."""

    # --- URL ---
    URL = f"{FRONTEND_URL}/login"

    # --- Locators (XPath) ---
    INPUT_IDENTIFIER      = (By.XPATH, "//input[@id='identifier']")
    INPUT_PASSWORD        = (By.XPATH, "//input[@id='password']")
    BTN_SUBMIT            = (By.XPATH, "//button[@type='submit']")
    ERROR_MESSAGE         = (By.XPATH, "//*[contains(@class,'text-red-600')]")
    LINK_FORGOT_PASSWORD  = (By.XPATH, "//a[@href='/forgot-password']")
    LINK_REGISTER         = (By.XPATH, "//a[@href='/register']")
    CHECKBOX_REMEMBER     = (By.XPATH, "//input[@id='rememberMe']")

    # --- Actions ---
    def open_login_page(self):
        """Mở trang login."""
        self.open(self.URL)

    def login(self, identifier: str, password: str, remember_me: bool = False):
        """Thực hiện đăng nhập với identifier và password."""
        # Nhập username/email
        self.type_text(*self.INPUT_IDENTIFIER, identifier)
        # Nhập password
        self.type_text(*self.INPUT_PASSWORD, password)
        # Check remember me
        if remember_me:
            # Lưu ý: Nếu là Ant Design Checkbox thì cần dùng JS click hoặc XPath inner span
            # Nhưng ở trang Login có vẻ là checkbox thuần hoặc id hoạt động được.
            # Để chắc chắn, dùng JS click.
            try:
                self.click(*self.CHECKBOX_REMEMBER)
            except:
                element = self.driver.find_element(*self.CHECKBOX_REMEMBER)
                self.driver.execute_script("arguments[0].click();", element)
        
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
