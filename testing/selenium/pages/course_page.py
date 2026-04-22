# ==============================================================================
# COURSE PAGE — Page Object cho trang quản lý khóa học
# ==============================================================================
# Tất cả locators dùng XPath
# ==============================================================================

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
import time

class CoursePage(BasePage):
    """Page Object cho trang Course Management."""

    # --- Locators (XPath) ---
    CREATE_BTN         = (By.XPATH, "//button[contains(., 'Create Course') or contains(., 'New Course')]")
    COURSE_TITLE_INPUT = (By.XPATH, "//input[@id='course-title' or @id='title']")
    SUBMIT_COURSE_BTN  = (By.XPATH, "//button[contains(., 'Create course') or contains(., 'Submit')]")
    SEARCH_INPUT       = (By.XPATH, "//input[contains(@placeholder, 'Search')]")
    COURSE_LIST_ITEMS  = (By.XPATH, "//*[contains(@class, 'course-card') or contains(@class, 'ant-card')]")
    ERROR_MESSAGE      = (By.XPATH, "//*[contains(@class, 'text-red-500') or contains(@class, 'ant-form-item-explain-error')]")
    
    # Locators for edit/delete
    def get_course_locator(self, course_name: str):
        return (By.XPATH, f"//div[contains(@class, 'card')]//h3[contains(text(), '{course_name}')] | //*[contains(text(), '{course_name}')]")
        
    def get_delete_btn_locator(self, course_name: str):
        return (By.XPATH, f"//h3[contains(text(), '{course_name}')]/ancestor::div[contains(@class, 'card')]//button[contains(@aria-label, 'Delete') or contains(., 'Delete')]")

    def get_edit_btn_locator(self, course_name: str):
        return (By.XPATH, f"//h3[contains(text(), '{course_name}')]/ancestor::div[contains(@class, 'card')]//button[contains(@aria-label, 'Edit') or contains(., 'Edit')]")

    # --- Actions ---
    def click_create_course(self):
        """Click nút tạo khoá học."""
        self.click(*self.CREATE_BTN)
        
    def fill_and_submit_course(self, title: str):
        """Điền title và submit form tạo khoá học."""
        if title:
            self.type_text(*self.COURSE_TITLE_INPUT, title)
        self.click(*self.SUBMIT_COURSE_BTN)
        time.sleep(1) # wait for API

    def search_course(self, keyword: str):
        """Tìm kiếm khoá học."""
        self.type_text(*self.SEARCH_INPUT, keyword)
        time.sleep(1) # wait for debounce

    def delete_course(self, course_name: str):
        """Xoá khoá học (nếu UI có hỗ trợ)."""
        locator = self.get_delete_btn_locator(course_name)
        if self.is_element_visible(*locator):
            self.click(*locator)
            # Confirm modal if any
            confirm = (By.XPATH, "//button[contains(., 'OK') or contains(., 'Yes') or contains(., 'Xác nhận')]")
            if self.is_element_visible(*confirm):
                self.click(*confirm)

    def is_course_visible(self, course_name: str) -> bool:
        """Kiểm tra khoá học có hiển thị trên danh sách không."""
        return self.is_element_visible(*self.get_course_locator(course_name))
        
    def edit_course(self, old_name: str, new_name: str):
        """Sửa tên khoá học."""
        edit_btn = self.get_edit_btn_locator(old_name)
        self.click(*edit_btn)
        time.sleep(1)
        # Sửa tên
        self.type_text(*self.COURSE_TITLE_INPUT, new_name)
        # Bấm lưu (dùng nút submit chung)
        self.click(*self.SUBMIT_COURSE_BTN)
        time.sleep(1)

    def get_error_message(self) -> str:
        """Lấy thông báo lỗi validation."""
        return self.get_text(*self.ERROR_MESSAGE)
