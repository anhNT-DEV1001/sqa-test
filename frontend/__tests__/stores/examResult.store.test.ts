/**
 * ============================================================================
 * UNIT TESTS: Exam Result Store (examResult.store.ts)
 * ============================================================================
 * File under test: src/stores/examResult.store.ts
 *
 * Tests for the Zustand examResult store which holds the result of a
 * submitted exam for display on the result page. Simple set/clear operations.
 *
 * Mocking Strategy:
 * - No mocks needed — pure Zustand store with no side effects
 * ============================================================================
 */

import { useExamResultStore } from '@/stores/examResult.store'

// ---------------------------------------------------------------------------
// Reset store state before each test for isolation
// ---------------------------------------------------------------------------
beforeEach(() => {
  useExamResultStore.setState({ result: null })
})

// ===========================================================================
// Mock data — Submission result matching SubmissionResult type
// ===========================================================================
const mockSubmissionResult = {
  submissionId: 'sub-001',
  examId: 'exam-001',
  score: 85,
  totalQuestions: 20,
  correctAnswers: 17,
  passed: true,
  submittedAt: '2026-04-15T10:00:00Z'
}

// ===========================================================================
// 1. setResult — Lưu kết quả bài thi
// ===========================================================================
describe('ExamResult Store - setResult', () => {
  // Test Case ID: TC_EXAM_RESULT_01
  it('should_StoreResult_When_CalledWithSubmissionResult', () => {
    // Act
    useExamResultStore.getState().setResult(mockSubmissionResult as any)

    // Assert — Result should be stored in state
    const state = useExamResultStore.getState()
    expect(state.result).toEqual(mockSubmissionResult)
  })

  // Test Case ID: TC_EXAM_RESULT_02
  it('should_OverwritePreviousResult_When_CalledAgain', () => {
    // Arrange — Set initial result
    useExamResultStore.getState().setResult(mockSubmissionResult as any)

    // Act — Set new result
    const newResult = { ...mockSubmissionResult, score: 50, passed: false }
    useExamResultStore.getState().setResult(newResult as any)

    // Assert — Should have the new result
    expect(useExamResultStore.getState().result).toEqual(newResult)
  })
})

// ===========================================================================
// 2. clearResult — Xóa kết quả bài thi
// ===========================================================================
describe('ExamResult Store - clearResult', () => {
  // Test Case ID: TC_EXAM_RESULT_03
  it('should_ClearResult_When_Called', () => {
    // Arrange — Set a result first
    useExamResultStore.getState().setResult(mockSubmissionResult as any)
    expect(useExamResultStore.getState().result).not.toBeNull()

    // Act
    useExamResultStore.getState().clearResult()

    // Assert — Result should be null
    expect(useExamResultStore.getState().result).toBeNull()
  })

  // Test Case ID: TC_EXAM_RESULT_04
  it('should_NotThrow_When_ClearingAlreadyNullResult', () => {
    // Arrange — Result is already null
    expect(useExamResultStore.getState().result).toBeNull()

    // Act & Assert — Should not throw
    expect(() => {
      useExamResultStore.getState().clearResult()
    }).not.toThrow()

    expect(useExamResultStore.getState().result).toBeNull()
  })
})
