/**
 * ============================================================================
 * UNIT TESTS: Navigation Utilities (navigation.ts)
 * ============================================================================
 * File under test: src/utils/navigation.ts
 *
 * Tests for resolveActiveSidebarItem() which determines the active sidebar
 * menu item based on the current URL path. This uses regex-based route
 * matching with a defined priority order.
 *
 * Mocking Strategy:
 * - Pure function, no mocks needed
 * ============================================================================
 */

import { resolveActiveSidebarItem } from '@/utils/navigation'

describe('resolveActiveSidebarItem', () => {
  // =========================================================================
  // Edge Cases — Invalid / Empty Input
  // =========================================================================

  // Test Case ID: TC_NAV_01
  it('should_ReturnNull_When_PathIsEmpty', () => {
    const result = resolveActiveSidebarItem('')

    expect(result).toBeNull()
  })

  // =========================================================================
  // Dashboard Routes — Root and role-specific paths
  // =========================================================================

  // Test Case ID: TC_NAV_02
  it('should_ReturnDashboard_When_PathIsRoot', () => {
    expect(resolveActiveSidebarItem('/')).toBe('dashboard')
  })

  // Test Case ID: TC_NAV_03
  it('should_ReturnDashboard_When_PathIsDashboardTeacher', () => {
    expect(resolveActiveSidebarItem('/dashboard/teacher')).toBe('dashboard')
  })

  // Test Case ID: TC_NAV_04
  it('should_ReturnDashboard_When_PathIsDashboardStudent', () => {
    expect(resolveActiveSidebarItem('/dashboard/student')).toBe('dashboard')
  })

  // Test Case ID: TC_NAV_05
  it('should_ReturnDashboard_When_PathIsDashboardOnly', () => {
    expect(resolveActiveSidebarItem('/dashboard')).toBe('dashboard')
  })

  // =========================================================================
  // Feature Routes — Courses, Exams, Students, etc.
  // =========================================================================

  // Test Case ID: TC_NAV_06
  it('should_ReturnCourses_When_PathContainsCourses', () => {
    expect(resolveActiveSidebarItem('/dashboard/teacher/courses')).toBe('courses')
    expect(resolveActiveSidebarItem('/courses/abc123')).toBe('courses')
  })

  // Test Case ID: TC_NAV_07
  it('should_ReturnExams_When_PathContainsExams', () => {
    expect(resolveActiveSidebarItem('/dashboard/teacher/exams')).toBe('exams')
    expect(resolveActiveSidebarItem('/exams/create')).toBe('exams')
  })

  // Test Case ID: TC_NAV_08
  it('should_ReturnStudents_When_PathContainsStudents', () => {
    expect(resolveActiveSidebarItem('/students')).toBe('students')
    expect(resolveActiveSidebarItem('/students/list')).toBe('students')
  })

  // Test Case ID: TC_NAV_09
  it('should_ReturnResults_When_PathContainsResults', () => {
    expect(resolveActiveSidebarItem('/results')).toBe('results')
    expect(resolveActiveSidebarItem('/results/exam-123')).toBe('results')
  })

  // Test Case ID: TC_NAV_10
  it('should_ReturnCertificates_When_PathContainsCertificates', () => {
    expect(resolveActiveSidebarItem('/certificates')).toBe('certificates')
    expect(resolveActiveSidebarItem('/certificates/verify')).toBe('certificates')
  })

  // Test Case ID: TC_NAV_11
  it('should_ReturnNotifications_When_PathContainsDashboardNotifications', () => {
    expect(resolveActiveSidebarItem('/dashboard/notifications')).toBe('notifications')
    expect(resolveActiveSidebarItem('/dashboard/notifications/')).toBe('notifications')
  })

  // =========================================================================
  // Unmatched Routes
  // =========================================================================

  // Test Case ID: TC_NAV_12
  it('should_ReturnNull_When_PathDoesNotMatchAnyRoute', () => {
    expect(resolveActiveSidebarItem('/settings')).toBeNull()
    expect(resolveActiveSidebarItem('/profile')).toBeNull()
    expect(resolveActiveSidebarItem('/unknown-page')).toBeNull()
  })

  // =========================================================================
  // Trailing Slash Normalization
  // =========================================================================

  // Test Case ID: TC_NAV_13
  it('should_HandleTrailingSlashes_Correctly', () => {
    // Trailing slash should be normalized away
    expect(resolveActiveSidebarItem('/courses/')).toBe('courses')
    expect(resolveActiveSidebarItem('/exams/')).toBe('exams')
  })
})
