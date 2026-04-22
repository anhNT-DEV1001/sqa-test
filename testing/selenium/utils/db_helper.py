# ==============================================================================
# DB HELPER — Kết nối và thao tác MongoDB cho verification & rollback
# ==============================================================================
# Sử dụng pymongo để:
#   - Verify: Kiểm tra dữ liệu sau khi tạo/sửa/xóa qua UI
#   - Rollback: Xóa dữ liệu test để đảm bảo DB sạch
# ==============================================================================

from pymongo import MongoClient
from config import MONGODB_URI, DB_NAME


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
        result = self.db.users.delete_one({"username": username})
        return result.deleted_count

    def delete_user_by_email(self, email: str):
        """Xóa user test theo email (rollback)."""
        result = self.db.users.delete_one({"email": email})
        return result.deleted_count

    # --- Course Operations ---
    def find_course_by_name(self, course_name: str):
        """Tìm course theo tên. Dùng để verify sau khi tạo course."""
        return self.db.courses.find_one({"courseName": course_name})

    def delete_course_by_name(self, course_name: str):
        """Xóa course test (rollback)."""
        result = self.db.courses.delete_one({"courseName": course_name})
        return result.deleted_count

    # --- Exam Operations ---
    def find_exam_by_title(self, title: str):
        """Tìm exam theo title."""
        return self.db.exams.find_one({"title": title})

    def delete_exam_by_title(self, title: str):
        """Xóa exam test (rollback)."""
        result = self.db.exams.delete_one({"title": title})
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
        result = self.db.submissions.delete_one({
            "studentId": student_id,
            "examId": exam_id
        })
        return result.deleted_count
