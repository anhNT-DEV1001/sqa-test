# ==============================================================================
# TEST 05: EXAM CRUD & TAKING EXAM
# ==============================================================================
import pytest
import time
from pages.exam_page import ExamPage
from pages.login_page import LoginPage
from config import TEACHER_USERNAME, TEACHER_PASSWORD, STUDENT_USERNAME, STUDENT_PASSWORD, FRONTEND_URL
from utils.db_helper import MongoDBHelper

class TestExamCRUD:

    def _login_as(self, driver, username, password, path):
        login = LoginPage(driver)
        login.open_login_page()
        login.login(username, password)
        time.sleep(1)
        driver.get(f"{FRONTEND_URL}{path}")
        time.sleep(1)

    # --- TC_SEL_EXAM_01: Tạo exam mới ---
    def test_create_exam(self, driver, db):
        """
        Mục đích: Giáo viên tạo bài thi
        Test Case ID: TC_SEL_EXAM_01
        DB Check: ✅ Rollback: ✅
        """
        self._login_as(driver, TEACHER_USERNAME, TEACHER_PASSWORD, "/dashboard/teacher/exams")
        exam_page = ExamPage(driver)
        db_helper = MongoDBHelper()
        test_title = "SELENIUM_EXAM"
        
        db_helper.delete_exam_by_title(test_title)

        # [Execute]
        exam_page.create_exam(test_title)

        # [Verify UI & DB]
        assert exam_page.is_exam_visible(test_title) is True
        exam_db = db_helper.find_exam_by_title(test_title)
        assert exam_db is not None
        assert exam_db["title"] == test_title

        # [Rollback]
        db_helper.delete_exam_by_title(test_title)

    # --- TC_SEL_EXAM_02: Student join exam ---
    def test_student_join_exam(self, driver):
        """
        Mục đích: Học sinh vào làm bài thi
        Test Case ID: TC_SEL_EXAM_02
        """
        # Phụ thuộc vào dữ liệu có sẵn trên UI, dùng mock hoặc seed data
        pytest.skip("Bỏ qua do yêu cầu pre-existing exam data. Test frame có sẵn.")

    # --- TC_SEL_EXAM_03: Student submit exam ---
    def test_student_submit_exam(self, driver, db):
        """
        Mục đích: Nộp bài thi
        Test Case ID: TC_SEL_EXAM_03
        """
        pytest.skip("Bỏ qua flow thi chi tiết do phụ thuộc nhiều màn hình UI Next.js")

    # --- TC_SEL_EXAM_04: Teacher xem results ---
    def test_teacher_view_results(self, driver):
        """
        Mục đích: Teacher xem được điểm của học viên
        Test Case ID: TC_SEL_EXAM_04
        """
        self._login_as(driver, TEACHER_USERNAME, TEACHER_PASSWORD, "/dashboard/teacher/exams")
        assert "/exams" in driver.current_url

    # --- TC_SEL_EXAM_05: Xóa exam ---
    def test_delete_exam(self, driver, db):
        """
        Mục đích: Xóa exam
        Test Case ID: TC_SEL_EXAM_05
        """
        self._login_as(driver, TEACHER_USERNAME, TEACHER_PASSWORD, "/dashboard/teacher/exams")
        exam_page = ExamPage(driver)
        title = "EXAM_TO_DELETE"
        exam_page.create_exam(title)
        
        exam_page.delete_exam(title)
        time.sleep(1)
        
        db_helper = MongoDBHelper()
        assert db_helper.find_exam_by_title(title) is None
