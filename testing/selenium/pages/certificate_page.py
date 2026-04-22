# ==============================================================================
# CERTIFICATE PAGE — Page Object cho trang Certificate
# ==============================================================================
# Tất cả locators dùng XPath
# ==============================================================================

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
import time

class CertificatePage(BasePage):
    """Page Object cho trang Certificate."""

    # --- Locators (XPath) ---
    CERTIFICATE_LIST    = (By.XPATH, "//*[contains(@class, 'certificate-card') or contains(@class, 'ant-card')]")
    VERIFY_INPUT        = (By.XPATH, "//input[contains(@placeholder, 'certificate ID') or contains(@placeholder, 'ID')]")
    VERIFY_BTN          = (By.XPATH, "//button[contains(., 'Verify') or contains(., 'Xác thực')]")
    VERIFICATION_RESULT = (By.XPATH, "//*[contains(@class, 'verification-result') or contains(@class, 'ant-alert')]")

    # --- Actions ---
    def is_certificate_list_visible(self) -> bool:
        """Kiểm tra danh sách chứng chỉ."""
        return self.is_element_visible(*self.CERTIFICATE_LIST)

    def verify_certificate(self, cert_id: str):
        """Xác thực chứng chỉ."""
        self.type_text(*self.VERIFY_INPUT, cert_id)
        self.click(*self.VERIFY_BTN)
        time.sleep(1)
        
    def get_verification_result(self) -> str:
        """Lấy kết quả xác thực."""
        return self.get_text(*self.VERIFICATION_RESULT)
