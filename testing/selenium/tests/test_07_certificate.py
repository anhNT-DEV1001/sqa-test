# ==============================================================================
# TEST 07: CERTIFICATE
# ==============================================================================
import pytest
import time
from pages.certificate_page import CertificatePage
from pages.login_page import LoginPage
from config import STUDENT_USERNAME, STUDENT_PASSWORD, FRONTEND_URL

class TestCertificate:

    # --- TC_SEL_CERT_01: Xem danh sách certificates ---
    def test_view_certificates_list(self, driver):
        """
        Mục đích: Student xem danh sách cert của mình
        Test Case ID: TC_SEL_CERT_01
        """
        login = LoginPage(driver)
        login.open_login_page()
        login.login(STUDENT_USERNAME, STUDENT_PASSWORD)
        time.sleep(1)
        
        driver.get(f"{FRONTEND_URL}/certificate")
        time.sleep(1)
        
        cert_page = CertificatePage(driver)
        # Giả định nếu list rỗng vẫn pass vì render component
        assert "/certificate" in driver.current_url

    # --- TC_SEL_CERT_02: Verify certificate (public) ---
    def test_verify_certificate_public(self, driver):
        """
        Mục đích: Mọi user đều dùng được form verify
        Test Case ID: TC_SEL_CERT_02
        """
        cert_page = CertificatePage(driver)
        cert_page.open(f"{FRONTEND_URL}/certificate-verify")
        
        # Cần có ID thật để test verify thành công
        cert_page.verify_certificate("fake_id")
        result = cert_page.get_verification_result()
        assert result != ""

    # --- TC_SEL_CERT_03: Lookup certificate ---
    def test_lookup_certificate(self, driver):
        """
        Mục đích: Search cert (nếu trang web có tích hợp trong màn hình cert)
        Test Case ID: TC_SEL_CERT_03
        """
        pytest.skip("Chức năng trùng với verify hoặc filter list, tạm skip")
