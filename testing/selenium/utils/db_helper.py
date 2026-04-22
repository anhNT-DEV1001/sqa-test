# ==============================================================================
# DB HELPER — Kết nối và thao tác MongoDB cho verification & rollback
# ==============================================================================
# Sử dụng pymongo để:
#   - Verify: Kiểm tra dữ liệu sau khi tạo/sửa/xóa qua UI
#   - Rollback: Xóa dữ liệu test để đảm bảo DB sạch
# ==============================================================================

from pymongo import MongoClient
from config import MONGODB_URI, DB_NAME
import logging

# Cấu hình logging cơ bản cho console
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger("DB_ROLLBACK")

class MongoDBHelper:
    """Helper class cho thao tác MongoDB trong test."""

    def __init__(self):
        """Kết nối tới MongoDB Atlas."""
        self.client = MongoClient(MONGODB_URI)
        self.db = self.client[DB_NAME]

    def close(self):
        """Đóng kết nối MongoDB."""
        self.client.close()

    # --- User Operations ---
    def find_user_by_username(self, username: str):
        """Tìm user theo username. Dùng để verify sau khi register."""
        return self.db.users.find_one({"username": username})

    def find_user_by_email(self, email: str):
        """Tìm user theo email."""
        return self.db.users.find_one({"email": email})

    def delete_user_by_username(self, username: str):
        """Xóa user test theo username (rollback after register test)."""
        logger.info(f"🔄 [ROLLBACK] Thực hiện xóa user có username: '{username}'")
        result = self.db.users.delete_one({"username": username})
        if result.deleted_count > 0:
            logger.info(f"✅ [ROLLBACK] Đã xóa thành công {result.deleted_count} user '{username}'")
        return result.deleted_count

    def delete_user_by_email(self, email: str):
        """Xóa user test theo email (rollback)."""
        logger.info(f"🔄 [ROLLBACK] Thực hiện xóa user có email: '{email}'")
        result = self.db.users.delete_one({"email": email})
        if result.deleted_count > 0:
            logger.info(f"✅ [ROLLBACK] Đã xóa thành công {result.deleted_count} user '{email}'")
        return result.deleted_count

    # --- Course Operations ---
    def find_course_by_name(self, course_name: str):
        """Tìm course theo tên. Dùng để verify sau khi tạo course."""
        return self.db.courses.find_one({"courseName": course_name})

    def delete_course_by_name(self, course_name: str):
        """Xóa course test (rollback)."""
        logger.info(f"🔄 [ROLLBACK] Thực hiện xóa course có tên: '{course_name}'")
        result = self.db.courses.delete_one({"courseName": course_name})
        if result.deleted_count > 0:
            logger.info(f"✅ [ROLLBACK] Đã xóa thành công {result.deleted_count} course '{course_name}'")
        return result.deleted_count

    # --- Exam Operations ---
    def find_exam_by_title(self, title: str):
        """Tìm exam theo title."""
        return self.db.exams.find_one({"title": title})

    def delete_exam_by_title(self, title: str):
        """Xóa exam test (rollback)."""
        logger.info(f"🔄 [ROLLBACK] Thực hiện xóa exam có title: '{title}'")
        result = self.db.exams.delete_one({"title": title})
        if result.deleted_count > 0:
            logger.info(f"✅ [ROLLBACK] Đã xóa thành công {result.deleted_count} exam '{title}'")
        return result.deleted_count

    # --- Submission Operations ---
    def find_submission_by_student(self, student_id: str, exam_id: str):
        """Tìm submission của student cho exam cụ thể."""
        return self.db.submissions.find_one({
            "studentId": student_id,
            "examId": exam_id
        })

    def delete_submission(self, student_id: str, exam_id: str):
        """Xóa submission test (rollback)."""
        logger.info(f"🔄 [ROLLBACK] Thực hiện xóa submission của student: '{student_id}' cho exam '{exam_id}'")
        result = self.db.submissions.delete_one({
            "studentId": student_id,
            "examId": exam_id
        })
        if result.deleted_count > 0:
            logger.info(f"✅ [ROLLBACK] Đã xóa thành công {result.deleted_count} submission")
        return result.deleted_count
