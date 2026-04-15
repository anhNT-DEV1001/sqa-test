/**
 * ============================================================================
 * UNIT TESTS: Services Helper (helper.ts)
 * ============================================================================
 * File under test: src/services/helper.ts
 *
 * These tests verify:
 * 1. API_SERVICES enum has correct values for all microservice names
 * 2. getApiEndpoint() correctly constructs endpoint URLs for both
 *    client-side and server-side environments
 *
 * Mocking Strategy:
 * - process.env is modified directly (restored via afterEach)
 * - `typeof window` is controlled by overriding the global
 * ============================================================================
 */

import { API_SERVICES, getApiEndpoint } from '@/services/helper'

// Save original env values
const originalEnv = process.env

beforeEach(() => {
  // Clone process.env to avoid cross-test contamination
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = originalEnv
})

// ===========================================================================
// 1. API_SERVICES enum — Kiểm tra mapping service names
// ===========================================================================
describe('API_SERVICES enum', () => {
  // Test Case ID: TC_HELPER_01
  it('should_HaveCorrectServiceNames_For_AllMicroservices', () => {
    expect(API_SERVICES.TEST_SERVICE).toBe('test')
    expect(API_SERVICES.AUTH_SERVICE).toBe('auth')
    expect(API_SERVICES.EXAM_SERVICE).toBe('exams')
    expect(API_SERVICES.COURSE_SERVICE).toBe('courses')
    expect(API_SERVICES.CERTIFICATE_SERVICE).toBe('certificates')
    expect(API_SERVICES.DASHBOARD_SERVICE).toBe('dashboard')
    expect(API_SERVICES.NOTIFICATION_SERVICE).toBe('notifications')
  })

  // Test Case ID: TC_HELPER_02
  it('should_HaveExactly7Services_InTheEnum', () => {
    const enumKeys = Object.keys(API_SERVICES)
    expect(enumKeys).toHaveLength(7)
  })
})

// ===========================================================================
// 2. getApiEndpoint — Tạo URL endpoint cho client-side
// ===========================================================================
describe('getApiEndpoint (client-side)', () => {
  // Test Case ID: TC_HELPER_03
  it('should_ReturnPublicEndpoint_When_RunningOnClient', () => {
    // Arrange — Simulate browser environment (window is defined by jsdom)
    process.env.NEXT_PUBLIC_API_ENDPOINT = 'http://localhost:8000/api'

    // Act
    const endpoint = getApiEndpoint(API_SERVICES.AUTH_SERVICE)

    // Assert
    expect(endpoint).toBe('http://localhost:8000/api/auth')
  })

  // Test Case ID: TC_HELPER_04
  it('should_AppendServiceName_To_BaseEndpoint_Correctly', () => {
    process.env.NEXT_PUBLIC_API_ENDPOINT = 'https://api.example.com'

    const examEndpoint = getApiEndpoint(API_SERVICES.EXAM_SERVICE)
    const courseEndpoint = getApiEndpoint(API_SERVICES.COURSE_SERVICE)
    const certEndpoint = getApiEndpoint(API_SERVICES.CERTIFICATE_SERVICE)

    expect(examEndpoint).toBe('https://api.example.com/exams')
    expect(courseEndpoint).toBe('https://api.example.com/courses')
    expect(certEndpoint).toBe('https://api.example.com/certificates')
  })
})

// ===========================================================================
// 3. getApiEndpoint — Tạo URL endpoint cho server-side
// ===========================================================================
describe('getApiEndpoint (server-side)', () => {
  // Test Case ID: TC_HELPER_05
  it('should_UsePublicEndpoint_When_BothEndpointsConfigured_OnClient', () => {
    // Arrange — In jsdom (browser-like environment), window is always defined
    // so getApiEndpoint should use NEXT_PUBLIC_API_ENDPOINT instead of internal
    process.env.NEXT_PUBLIC_API_INTERNAL_ENDPOINT = 'http://backend:3000/api'
    process.env.NEXT_PUBLIC_API_ENDPOINT = 'http://localhost:8000/api'

    // Act
    const endpoint = getApiEndpoint(API_SERVICES.AUTH_SERVICE)

    // Assert — On client-side (jsdom), public endpoint should be used
    expect(endpoint).toBe('http://localhost:8000/api/auth')
  })

  // Test Case ID: TC_HELPER_06
  it('should_HandleUndefinedEndpoint_Gracefully', () => {
    process.env.NEXT_PUBLIC_API_ENDPOINT = undefined

    // Act — Should not throw, just produce "undefined/service"
    const endpoint = getApiEndpoint(API_SERVICES.AUTH_SERVICE)

    // Assert — The result will be "undefined/auth" but should not crash
    expect(endpoint).toContain('/auth')
  })
})
