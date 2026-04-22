# ==============================================================================
# TEST 02: REGISTER — Kiểm tra chức năng đăng ký
# ==============================================================================
# Test Cases: TC_SEL_REG_01 → TC_SEL_REG_08
# Data Source: test_data/register_data.csv
# DB Check: TC_SEL_REG_01, TC_SEL_REG_02 (verify user tạo trong MongoDB)
# Rollback: TC_SEL_REG_01, TC_SEL_REG_02 (xóa user test sau khi verify)
# ==============================================================================

import pytest
from pages.register_page import RegisterPage


class TestRegister:
    """Bộ test cho chức năng Register."""

    # --- TC_SEL_REG_01 → TC_SEL_REG_08 ---
    # TODO: Implement 8 test cases (xem tool-test.prompt.md)
    pass
