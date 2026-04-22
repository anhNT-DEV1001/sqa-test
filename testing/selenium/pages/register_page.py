# ==============================================================================
# REGISTER PAGE — Page Object cho trang đăng ký
# ==============================================================================
# URL: /register
# Tất cả locators dùng XPath
# ==============================================================================

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from pages.base_page import BasePage
from config import FRONTEND_URL
import time


class RegisterPage(BasePage):
    """Page Object cho trang Register (/register)."""

    URL = f"{FRONTEND_URL}/register"

    # --- Locators (XPath) ---
    INPUT_FULLNAME        = (By.XPATH, "//input[@id='fullName']")
    INPUT_USERNAME        = (By.XPATH, "//input[@id='username']")
    INPUT_EMAIL           = (By.XPATH, "//input[@id='email']")
    INPUT_PASSWORD        = (By.XPATH, "//input[@id='password']")
    INPUT_CONFIRM_PW      = (By.XPATH, "//input[@id='confirmPassword']")

    # Ant Design Select: click vào selector để mở dropdown
    SELECT_ROLE           = (By.XPATH, "//div[contains(@class,'ant-select-selector')]")

    # Ant Design Checkbox: ô vuông nhìn thấy được (span inner), KHÔNG phải label
    # vì label chứa link /terms → click label sẽ redirect sang trang /terms
    CHECKBOX_TERMS_INNER  = (By.XPATH, "//input[@id='agreeToTerms']/following-sibling::span[contains(@class,'ant-checkbox-inner')]")
    CHECKBOX_TERMS_WRAP   = (By.XPATH, "//input[@id='agreeToTerms']/parent::span[contains(@class,'ant-checkbox')]")
    CHECKBOX_TERMS_INPUT  = (By.XPATH, "//input[@id='agreeToTerms']")  # hidden input — dùng JS click

    # Submit button
    BTN_SUBMIT            = (By.XPATH, "//button[@type='submit']")

    # Error message
    ERROR_MESSAGE         = (By.XPATH, "//*[contains(@class,'text-red-600')]")

    # --- Helpers ---
    def get_role_option_locator(self, role: str):
        """Trả về XPath của option trong Ant Design Select."""
        capitalized_role = role.capitalize()
        return (By.XPATH,
                f"//div[contains(@class,'ant-select-item-option')]"
                f"//div[text()='{capitalized_role}']")

    def _click_terms_checkbox(self):
        """
        Click vào ô checkbox 'I agree to Terms & Conditions'.

        Ant Design Checkbox render cấu trúc:
          <span class="ant-checkbox">
            <input type="checkbox" id="agreeToTerms" class="ant-checkbox-input">  ← hidden
            <span class="ant-checkbox-inner">  ← ô vuông nhìn thấy — CẦN CLICK VÀO ĐÂY
          </span>
          <label for="agreeToTerms">
            I agree to the <a href="/terms">Terms & Conditions</a>  ← KHÔNG click label
          </label>

        Chiến lược (XPath):
          1. Click vào ant-checkbox-inner (ô vuông visual) → ưu tiên nhất
          2. Fallback: click vào ant-checkbox wrapper span
          3. Fallback cuối: JavaScript click hidden input (luôn hoạt động)
        """
        # Ưu tiên 1: XPath → span.ant-checkbox-inner (ô vuông nhìn thấy)
        try:
            inner = self.wait.until(
                EC.element_to_be_clickable(self.CHECKBOX_TERMS_INNER)
            )
            inner.click()
            time.sleep(0.3)
            return
        except Exception:
            pass

        # Ưu tiên 2: XPath → span.ant-checkbox (wrapper)
        try:
            wrap = self.wait.until(
                EC.element_to_be_clickable(self.CHECKBOX_TERMS_WRAP)
            )
            wrap.click()
            time.sleep(0.3)
            return
        except Exception:
            pass

        # Fallback: JavaScript click vào hidden input
        try:
            hidden_input = self.driver.find_element(*self.CHECKBOX_TERMS_INPUT)
            self.driver.execute_script("arguments[0].click();", hidden_input)
            time.sleep(0.3)
        except Exception as e:
            raise RuntimeError(f"Không thể click vào Terms checkbox: {e}")

    # --- Actions ---
    def open_register_page(self):
        """Mở trang đăng ký."""
        self.open(self.URL)
        time.sleep(1)

    def register(self, fullname: str, username: str, email: str,
                 password: str, confirm_password: str,
                 role: str = "student", agree_terms: bool = True):
        """Điền form đăng ký và submit."""
        if fullname:         self.type_text(*self.INPUT_FULLNAME, fullname)
        if username:         self.type_text(*self.INPUT_USERNAME, username)
        if email:            self.type_text(*self.INPUT_EMAIL, email)

        # Chọn role qua Ant Design Select dropdown
        if role:
            self.click(*self.SELECT_ROLE)
            time.sleep(0.5)  # chờ dropdown animation
            self.click(*self.get_role_option_locator(role))

        if password:         self.type_text(*self.INPUT_PASSWORD, password)
        if confirm_password: self.type_text(*self.INPUT_CONFIRM_PW, confirm_password)

        # Tick checkbox Terms & Conditions (dùng XPath, tránh click link /terms)
        if agree_terms:
            self._click_terms_checkbox()

        self.click(*self.BTN_SUBMIT)

    def get_error_message(self) -> str:
        """Lấy thông báo lỗi."""
        return self.get_text(*self.ERROR_MESSAGE)

    def is_error_displayed(self) -> bool:
        """Kiểm tra có thông báo lỗi hiển thị không."""
        return self.is_element_visible(*self.ERROR_MESSAGE)
