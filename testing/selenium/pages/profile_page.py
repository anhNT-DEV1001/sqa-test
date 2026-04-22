# ==============================================================================
# PROFILE PAGE — Page Object cho trang hồ sơ cá nhân
# ==============================================================================
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from pages.base_page import BasePage
import time

class ProfilePage(BasePage):
    """Page Object cho trang Profile (XPath version)."""

    # --- Locators: Nút mở modal ---
    BTN_EDIT_PROFILE      = (By.XPATH, "//button[contains(., 'Edit Personal Information')]")
    BTN_OPEN_CHANGE_PWD   = (By.XPATH, "//button[contains(., 'Change Password')]")

    # --- Locators: EditProfileModal ---
    EDIT_FULLNAME_INPUT   = (By.XPATH, "//div[contains(@class,'ant-modal')]//input[@placeholder='Enter your full name']")
    BTN_SAVE_PROFILE      = (By.XPATH, "//div[contains(@class,'ant-modal')]//button[@type='submit' and contains(., 'Update')]")

    # --- Locators: ChangePasswordModal ---
    # Dùng XPath theo name attribute vì Ant Design Controller có truyền name vào input
    CURRENT_PWD_INPUT     = (By.XPATH, "//input[@name='currentPassword' or @placeholder='Enter your current password']")
    NEW_PWD_INPUT         = (By.XPATH, "//input[@name='newPassword' or @placeholder='Enter your new password']")
    CONFIRM_PWD_INPUT     = (By.XPATH, "//input[@name='confirmPassword' or @placeholder='Confirm your new password']")
    
    # Nút Submit trong modal: Tìm nút có type=submit nằm bên trong modal
    BTN_SUBMIT_CHANGE_PWD = (By.XPATH, "//div[contains(@class,'ant-modal')]//button[@type='submit']")

    # --- Locators: Messages ---
    SUCCESS_MSG = (By.XPATH, "//*[contains(@class,'ant-message-success')] | //*[contains(@class,'text-green-600')]")
    ERROR_MSG   = (By.XPATH, "//*[contains(@class,'ant-message-error')] | //*[contains(@class,'ant-form-item-explain-error')]")

    def _safe_type(self, locator, text):
        """Nhập text an toàn, trigger React state."""
        element = self.wait.until(EC.visibility_of_element_located(locator))
        element.click()
        time.sleep(0.1)
        # Xóa sạch bằng Ctrl+A -> Backspace
        element.send_keys(Keys.CONTROL + "a")
        element.send_keys(Keys.BACKSPACE)
        time.sleep(0.2)
        element.send_keys(text)
        time.sleep(0.2)
        # Tab ra ngoài để trigger blur/change event
        element.send_keys(Keys.TAB)

    def update_fullname(self, new_name: str):
        """Cập nhật tên."""
        self.click(*self.BTN_EDIT_PROFILE)
        time.sleep(0.8)
        self._safe_type(self.EDIT_FULLNAME_INPUT, new_name)
        self.click(*self.BTN_SAVE_PROFILE)
        time.sleep(1.5)

    def change_password(self, current: str, new_pwd: str, confirm: str):
        """Đổi mật khẩu."""
        # Click nút mở modal nếu modal chưa hiện
        if not self.is_element_visible(*self.BTN_SUBMIT_CHANGE_PWD):
            btn_open = self.wait.until(EC.element_to_be_clickable(self.BTN_OPEN_CHANGE_PWD))
            btn_open.click()
            time.sleep(1)

        # Nhập liệu
        self._safe_type(self.CURRENT_PWD_INPUT, current)
        self._safe_type(self.NEW_PWD_INPUT, new_pwd)
        self._safe_type(self.CONFIRM_PWD_INPUT, confirm)
        time.sleep(0.5)

        # Submit
        submit_btn = self.wait.until(EC.element_to_be_clickable(self.BTN_SUBMIT_CHANGE_PWD))
        # Nếu nút bị disabled (do không dirty), thử click trực tiếp bằng JS
        if not submit_btn.is_enabled():
            self.driver.execute_script("arguments[0].click();", submit_btn)
        else:
            submit_btn.click()
        
        time.sleep(2)

    def is_success_message_displayed(self) -> bool:
        """Kiểm tra thông báo thành công."""
        try:
            # Chờ ngắn để thông báo hiện lên
            self.wait.until(EC.presence_of_element_located(self.SUCCESS_MSG))
            return True
        except:
            return False

    def get_error_message(self) -> str:
        try:
            return self.get_text(*self.ERROR_MSG)
        except:
            return ""
