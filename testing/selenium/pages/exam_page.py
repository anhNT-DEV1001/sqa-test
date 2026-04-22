# ==============================================================================
# EXAM PAGE — Page Object cho trang quản lý bài thi
# ==============================================================================
# Tất cả locators dùng XPath
# ==============================================================================

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
import time

class ExamPage(BasePage):
    """Page Object cho trang Exam Management."""

    # --- Locators (XPath) ---
    CREATE_BTN  = (By.XPATH, "//button[contains(., 'Create Exam') or contains(., 'New Exam')]")
    TITLE_INPUT = (By.XPATH, "//input[@id='title' or @name='title']")
    SUBMIT_BTN  = (By.XPATH, "//button[contains(., 'Create') or contains(., 'Save') or contains(., 'Submit')]")
    
    # --- Actions ---
    def create_exam(self, title: str):
        """Tạo bài thi mới."""
        self.click(*self.CREATE_BTN)
        time.sleep(0.5)
        self.type_text(*self.TITLE_INPUT, title)
        self.click(*self.SUBMIT_BTN)
        time.sleep(1)

    def join_exam(self, title: str):
        """Học sinh join bài thi."""
        join_btn = (By.XPATH, f"//h3[contains(text(), '{title}')]/ancestor::div[contains(@class, 'card')]//button[contains(., 'Join') or contains(., 'Start')]")
        self.click(*join_btn)
        
    def submit_exam(self):
        """Nộp bài thi."""
        submit_btn = (By.XPATH, "//button[contains(., 'Submit')]")
        self.click(*submit_btn)
        # Confirm
        confirm_btn = (By.XPATH, "//button[contains(., 'Confirm') or contains(., 'Yes') or contains(., 'Xác nhận')]")
        if self.is_element_visible(*confirm_btn):
            self.click(*confirm_btn)
            
    def delete_exam(self, title: str):
        """Giáo viên xoá bài thi."""
        del_btn = (By.XPATH, f"//h3[contains(text(), '{title}')]/ancestor::div[contains(@class, 'card')]//button[contains(@aria-label, 'Delete') or contains(., 'Delete')]")
        if self.is_element_visible(*del_btn):
            self.click(*del_btn)
            confirm = (By.XPATH, "//button[contains(., 'OK') or contains(., 'Yes') or contains(., 'Xác nhận')]")
            if self.is_element_visible(*confirm):
                self.click(*confirm)

    def is_exam_visible(self, title: str) -> bool:
        return self.is_element_visible(By.XPATH, f"//h3[contains(text(), '{title}')] | //*[contains(text(), '{title}')]")
