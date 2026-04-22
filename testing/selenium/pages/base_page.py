# ==============================================================================
# BASE PAGE — Lớp cơ sở cho tất cả Page Objects
# ==============================================================================
# Chứa các phương thức dùng chung: click, type, wait, get_text, screenshot...
# Tất cả page objects khác sẽ kế thừa từ class này.
# ==============================================================================

from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


class BasePage:
    """Lớp cơ sở — chứa các thao tác chung cho mọi trang."""

    def __init__(self, driver: WebDriver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    # --- Navigation ---
    def open(self, url: str):
        """Mở một URL trong trình duyệt."""
        self.driver.get(url)

    def get_current_url(self) -> str:
        """Lấy URL hiện tại."""
        return self.driver.current_url

    def get_title(self) -> str:
        """Lấy title của trang."""
        return self.driver.title

    # --- Element Interactions ---
    def find_element(self, by: By, value: str) -> WebElement:
        """Tìm element với explicit wait."""
        return self.wait.until(EC.presence_of_element_located((by, value)))

    def click(self, by: By, value: str):
        """Click vào element (chờ element clickable)."""
        element = self.wait.until(EC.element_to_be_clickable((by, value)))
        element.click()

    def type_text(self, by: By, value: str, text: str):
        """Xóa nội dung cũ và nhập text mới vào input."""
        element = self.find_element(by, value)
        element.clear()
        element.send_keys(text)

    def get_text(self, by: By, value: str) -> str:
        """Lấy text content của element."""
        return self.find_element(by, value).text

    def is_element_visible(self, by: By, value: str) -> bool:
        """Kiểm tra element có hiển thị hay không."""
        try:
            self.wait.until(EC.visibility_of_element_located((by, value)))
            return True
        except:
            return False

    def wait_for_url_contains(self, text: str, timeout: int = 10):
        """Chờ đến khi URL chứa chuỗi chỉ định."""
        WebDriverWait(self.driver, timeout).until(
            EC.url_contains(text)
        )

    # --- Screenshots ---
    def take_screenshot(self, filename: str):
        """Chụp screenshot và lưu vào file."""
        self.driver.save_screenshot(filename)
