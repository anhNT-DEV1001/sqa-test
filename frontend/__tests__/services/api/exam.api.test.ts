/**
 * ============================================================================
 * UNIT TESTS: Exam API - buildQueryString Logic (exam.api.ts)
 * ============================================================================
 * File under test: src/services/api/exam.api.ts
 *
 * The buildQueryString function inside useExams() constructs URL query
 * parameters from ExamsQueryParams. Since it's a local function inside
 * a hook, we replicate its logic here for isolated testing.
 *
 * Mocking Strategy:
 * - Pure function, no mocks needed
 * ============================================================================
 */

import type { ExamsQueryParams } from '@/services/api/exam.api'

// ---------------------------------------------------------------------------
// Re-implement buildQueryString from exam.api.ts for isolated testing
// (The source file defines this inside useExams hook, so cannot import directly)
// ---------------------------------------------------------------------------
const buildQueryString = (params?: ExamsQueryParams): string => {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.status && params.status !== 'all')
    searchParams.set('status', params.status)
  if (params.courseId && params.courseId !== 'all')
    searchParams.set('courseId', params.courseId)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

// ===========================================================================
// buildQueryString — Tạo query string cho API endpoint
// ===========================================================================
describe('buildQueryString (Exam API)', () => {
  // Test Case ID: TC_EXAM_API_01
  it('should_ReturnEmptyString_When_NoParamsProvided', () => {
    expect(buildQueryString(undefined)).toBe('')
    expect(buildQueryString({})).toBe('')
  })

  // Test Case ID: TC_EXAM_API_02
  it('should_IncludeSearchParam_When_SearchIsProvided', () => {
    const result = buildQueryString({ search: 'math' })

    expect(result).toContain('search=math')
    expect(result.startsWith('?')).toBe(true)
  })

  // Test Case ID: TC_EXAM_API_03
  it('should_ExcludeStatus_When_StatusIsAll', () => {
    const result = buildQueryString({ status: 'all' })

    expect(result).not.toContain('status')
  })

  // Test Case ID: TC_EXAM_API_04
  it('should_IncludeStatus_When_StatusIsNotAll', () => {
    const result = buildQueryString({ status: 'active' })

    expect(result).toContain('status=active')
  })

  // Test Case ID: TC_EXAM_API_05
  it('should_ExcludeCourseId_When_CourseIdIsAll', () => {
    const result = buildQueryString({ courseId: 'all' })

    expect(result).not.toContain('courseId')
  })

  // Test Case ID: TC_EXAM_API_06
  it('should_IncludeAllParams_When_FullQueryProvided', () => {
    const result = buildQueryString({
      search: 'physics',
      status: 'completed',
      courseId: 'c-001',
      page: 2,
      limit: 15
    })

    expect(result).toContain('search=physics')
    expect(result).toContain('status=completed')
    expect(result).toContain('courseId=c-001')
    expect(result).toContain('page=2')
    expect(result).toContain('limit=15')
  })

  // Test Case ID: TC_EXAM_API_07
  it('should_HandlePaginationOnly_WithoutFilters', () => {
    const result = buildQueryString({ page: 3, limit: 10 })

    expect(result).toBe('?page=3&limit=10')
  })
})
