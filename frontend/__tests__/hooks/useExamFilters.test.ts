/**
 * ============================================================================
 * UNIT TESTS: useExamFilters Hook (hooks/useExamFilters.ts)
 * ============================================================================
 * File under test: src/hooks/useExamFilters.ts
 *
 * Tests for the useExamFilters custom hook which manages exam list
 * filter state including search, status, courseId, pagination,
 * debounced search, and queryParams building.
 *
 * Mocking Strategy:
 * - React hooks are tested via @testing-library/react's renderHook
 * - useDebounce is mocked to return the value immediately (no delay)
 * ============================================================================
 */

import { renderHook, act } from '@testing-library/react'
import { useExamFilters, type ExamStatusFilter } from '@/hooks/useExamFilters'

// Mock useDebounce to return value immediately (no timer delay in tests)
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T, _delay: number): T => value
}))

// ===========================================================================
// 1. Initialization — Default values
// ===========================================================================
describe('useExamFilters - Initialization', () => {
  // Test Case ID: TC_EXAM_FILTER_01
  it('should_InitializeWithDefaultFilters_When_NoInitialFiltersProvided', () => {
    const { result } = renderHook(() => useExamFilters())

    expect(result.current.filters).toEqual({
      search: '',
      status: 'all',
      courseId: 'all',
      page: 1,
      limit: 10
    })
  })

  // Test Case ID: TC_EXAM_FILTER_02
  it('should_MergeCustomInitialFilters_When_PartialFiltersProvided', () => {
    const { result } = renderHook(() =>
      useExamFilters({ search: 'math', limit: 20 })
    )

    expect(result.current.filters.search).toBe('math')
    expect(result.current.filters.limit).toBe(20)
    // Defaults should still apply for unset fields
    expect(result.current.filters.status).toBe('all')
    expect(result.current.filters.page).toBe(1)
  })
})

// ===========================================================================
// 2. setSearch — Cập nhật search và reset page
// ===========================================================================
describe('useExamFilters - setSearch', () => {
  // Test Case ID: TC_EXAM_FILTER_03
  it('should_UpdateSearch_And_ResetPageTo1_When_SearchChanges', () => {
    const { result } = renderHook(() => useExamFilters())

    // First, set page to 3
    act(() => {
      result.current.setPage(3)
    })
    expect(result.current.filters.page).toBe(3)

    // Now change search — page should reset to 1
    act(() => {
      result.current.setSearch('javascript')
    })

    expect(result.current.filters.search).toBe('javascript')
    expect(result.current.filters.page).toBe(1) // Page reset
  })
})

// ===========================================================================
// 3. setStatus — Cập nhật status filter
// ===========================================================================
describe('useExamFilters - setStatus', () => {
  // Test Case ID: TC_EXAM_FILTER_04
  it('should_UpdateStatus_And_ResetPageTo1_When_StatusChanges', () => {
    const { result } = renderHook(() => useExamFilters())

    act(() => {
      result.current.setPage(5)
    })

    act(() => {
      result.current.setStatus('active' as ExamStatusFilter)
    })

    expect(result.current.filters.status).toBe('active')
    expect(result.current.filters.page).toBe(1)
  })
})

// ===========================================================================
// 4. setCourseId — Cập nhật course filter
// ===========================================================================
describe('useExamFilters - setCourseId', () => {
  // Test Case ID: TC_EXAM_FILTER_05
  it('should_UpdateCourseId_And_ResetPageTo1_When_CourseFilterChanges', () => {
    const { result } = renderHook(() => useExamFilters())

    act(() => {
      result.current.setPage(2)
    })

    act(() => {
      result.current.setCourseId('course-123')
    })

    expect(result.current.filters.courseId).toBe('course-123')
    expect(result.current.filters.page).toBe(1)
  })
})

// ===========================================================================
// 5. setPage / setLimit — Pagination controls
// ===========================================================================
describe('useExamFilters - Pagination', () => {
  // Test Case ID: TC_EXAM_FILTER_06
  it('should_UpdatePage_When_SetPageCalled', () => {
    const { result } = renderHook(() => useExamFilters())

    act(() => {
      result.current.setPage(3)
    })

    expect(result.current.filters.page).toBe(3)
  })

  // Test Case ID: TC_EXAM_FILTER_07
  it('should_UpdateLimit_And_ResetPageTo1_When_LimitChanges', () => {
    const { result } = renderHook(() => useExamFilters())

    act(() => {
      result.current.setPage(5)
    })

    act(() => {
      result.current.setLimit(25)
    })

    expect(result.current.filters.limit).toBe(25)
    expect(result.current.filters.page).toBe(1) // Reset when limit changes
  })
})

// ===========================================================================
// 6. resetFilters — Reset tất cả filters về default
// ===========================================================================
describe('useExamFilters - resetFilters', () => {
  // Test Case ID: TC_EXAM_FILTER_08
  it('should_ResetAllFilters_To_Defaults_When_Called', () => {
    const { result } = renderHook(() => useExamFilters())

    // Set various filters
    act(() => {
      result.current.setSearch('test')
      result.current.setStatus('completed')
      result.current.setCourseId('c1')
      result.current.setPage(3)
      result.current.setLimit(50)
    })

    // Reset
    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.filters).toEqual({
      search: '',
      status: 'all',
      courseId: 'all',
      page: 1,
      limit: 10
    })
  })
})

// ===========================================================================
// 7. queryParams — Build API query parameters
// ===========================================================================
describe('useExamFilters - queryParams', () => {
  // Test Case ID: TC_EXAM_FILTER_09
  it('should_ExcludeAllStatusAndCourseId_When_TheyAreAll', () => {
    const { result } = renderHook(() => useExamFilters())

    // With defaults: status='all', courseId='all', search=''
    expect(result.current.queryParams).toEqual({
      search: undefined,     // Empty search → undefined
      status: undefined,     // 'all' → undefined
      courseId: undefined,    // 'all' → undefined
      page: 1,
      limit: 10
    })
  })

  // Test Case ID: TC_EXAM_FILTER_10
  it('should_IncludeActiveFilters_In_QueryParams', () => {
    const { result } = renderHook(() => useExamFilters())

    act(() => {
      result.current.setSearch('biology')
      result.current.setStatus('active')
      result.current.setCourseId('course-456')
    })

    expect(result.current.queryParams).toEqual({
      search: 'biology',
      status: 'active',
      courseId: 'course-456',
      page: 1,
      limit: 10
    })
  })
})
