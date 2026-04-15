/**
 * ============================================================================
 * UNIT TESTS: Next.js Middleware (middleware.ts) — Direct Import
 * ============================================================================
 * File under test: src/middleware.ts
 *
 * These tests import the actual middleware function and test it with
 * mocked NextRequest objects. This achieves direct code coverage on
 * the middleware.ts file instead of replicating logic.
 *
 * Mocking Strategy:
 * - Mock 'next/server' NextRequest/NextResponse
 * - Mock 'jwt-decode' for token parsing
 * ============================================================================
 */

// Mock next/server before importing middleware
const mockRedirect = jest.fn()
const mockNext = jest.fn()

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: (...args: any[]) => {
      mockRedirect(...args)
      return { type: 'redirect' }
    },
    next: (...args: any[]) => {
      mockNext(...args)
      return { type: 'next' }
    }
  }
}))

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}))

import { middleware } from '@/middleware'
import { jwtDecode } from 'jwt-decode'

const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>

// ---------------------------------------------------------------------------
// Helper: Create a minimal mock NextRequest object
// ---------------------------------------------------------------------------
function createMockRequest(
  pathname: string,
  accessToken?: string
): any {
  const url = `http://localhost:3000${pathname}`
  return {
    nextUrl: {
      pathname
    },
    url,
    cookies: {
      get: (name: string) => {
        if (name === 'access_token' && accessToken) {
          return { value: accessToken }
        }
        return undefined
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Reset mocks before each test
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks()
})

// ===========================================================================
// 1. Public Routes — Cho qua mà không cần auth
// ===========================================================================
describe('Middleware - Public Routes', () => {
  // Test Case ID: TC_MW_DIRECT_01
  it('should_CallNextResponse_Next_When_PathIsPublicRoot', () => {
    const request = createMockRequest('/')

    const result = middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  // Test Case ID: TC_MW_DIRECT_02
  it('should_CallNextResponse_Next_When_PathIsCertificateVerify', () => {
    const request = createMockRequest('/certificate-verify')

    middleware(request)

    expect(mockNext).toHaveBeenCalled()
  })
})

// ===========================================================================
// 2. Auth Routes — Redirect nếu đã login
// ===========================================================================
describe('Middleware - Auth Routes (logged in user)', () => {
  // Test Case ID: TC_MW_DIRECT_03
  it('should_RedirectToTeacherDashboard_When_TeacherVisitsLogin', () => {
    mockJwtDecode.mockReturnValue({ role: 'teacher' } as any)
    const request = createMockRequest('/login', 'valid_token')

    middleware(request)

    // Should redirect to teacher dashboard
    expect(mockRedirect).toHaveBeenCalled()
    const redirectUrl = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/dashboard/teacher')
  })

  // Test Case ID: TC_MW_DIRECT_04
  it('should_RedirectToStudentDashboard_When_StudentVisitsLogin', () => {
    mockJwtDecode.mockReturnValue({ role: 'student' } as any)
    const request = createMockRequest('/login', 'valid_token')

    middleware(request)

    expect(mockRedirect).toHaveBeenCalled()
    const redirectUrl = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/dashboard/student')
  })

  // Test Case ID: TC_MW_DIRECT_05
  it('should_AllowAccess_When_NotLoggedInVisitsLogin', () => {
    const request = createMockRequest('/login')

    middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// 3. Teacher Routes — Cần login + role teacher
// ===========================================================================
describe('Middleware - Teacher Routes', () => {
  // Test Case ID: TC_MW_DIRECT_06
  it('should_RedirectToLogin_When_NotLoggedIn_AccessTeacherRoute', () => {
    const request = createMockRequest('/dashboard/teacher/courses')

    middleware(request)

    expect(mockRedirect).toHaveBeenCalled()
    const redirectUrl = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/login')
    // Should include redirectTo param
    expect(redirectUrl.searchParams.get('redirectTo')).toBe('/dashboard/teacher/courses')
  })

  // Test Case ID: TC_MW_DIRECT_07
  it('should_AllowAccess_When_TeacherAccessesTeacherRoute', () => {
    mockJwtDecode.mockReturnValue({ role: 'teacher' } as any)
    const request = createMockRequest('/dashboard/teacher/courses', 'teacher_token')

    middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  // Test Case ID: TC_MW_DIRECT_08
  it('should_RedirectToUnauthorized_When_StudentAccessesTeacherRoute', () => {
    mockJwtDecode.mockReturnValue({ role: 'student' } as any)
    const request = createMockRequest('/dashboard/teacher/courses', 'student_token')

    middleware(request)

    expect(mockRedirect).toHaveBeenCalled()
    const redirectUrl = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/unauthorized')
  })
})

// ===========================================================================
// 4. Student Routes — Cần login + role student
// ===========================================================================
describe('Middleware - Student Routes', () => {
  // Test Case ID: TC_MW_DIRECT_09
  it('should_RedirectToLogin_When_NotLoggedIn_AccessStudentRoute', () => {
    const request = createMockRequest('/dashboard/student/exams')

    middleware(request)

    expect(mockRedirect).toHaveBeenCalled()
    const redirectUrl = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/login')
  })

  // Test Case ID: TC_MW_DIRECT_10
  it('should_AllowAccess_When_StudentAccessesStudentRoute', () => {
    mockJwtDecode.mockReturnValue({ role: 'student' } as any)
    const request = createMockRequest('/dashboard/student/exams', 'student_token')

    middleware(request)

    expect(mockNext).toHaveBeenCalled()
  })

  // Test Case ID: TC_MW_DIRECT_11
  it('should_RedirectToUnauthorized_When_TeacherAccessesStudentRoute', () => {
    mockJwtDecode.mockReturnValue({ role: 'teacher' } as any)
    const request = createMockRequest('/dashboard/student/exams', 'teacher_token')

    middleware(request)

    expect(mockRedirect).toHaveBeenCalled()
    const redirectUrl = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/unauthorized')
  })
})

// ===========================================================================
// 5. Protected Routes — Cần login, bất kỳ role
// ===========================================================================
describe('Middleware - Protected Routes', () => {
  // Test Case ID: TC_MW_DIRECT_12
  it('should_RedirectToLogin_When_NotLoggedIn_AccessProfile', () => {
    const request = createMockRequest('/profile')

    middleware(request)

    expect(mockRedirect).toHaveBeenCalled()
    const redirectUrl = mockRedirect.mock.calls[0][0]
    expect(redirectUrl.pathname).toBe('/login')
  })

  // Test Case ID: TC_MW_DIRECT_13
  it('should_AllowAccess_When_LoggedIn_AccessProfile', () => {
    mockJwtDecode.mockReturnValue({ role: 'student' } as any)
    const request = createMockRequest('/profile', 'valid_token')

    middleware(request)

    // Protected route with valid token → should call next()
    expect(mockNext).toHaveBeenCalled()
  })
})

// ===========================================================================
// 6. JWT Decode Error — Token không hợp lệ
// ===========================================================================
describe('Middleware - Invalid Token', () => {
  // Test Case ID: TC_MW_DIRECT_14
  it('should_TreatAsNotLoggedIn_When_TokenIsInvalid', () => {
    // jwtDecode throws → getUserFromToken returns null → no user
    mockJwtDecode.mockImplementation(() => {
      throw new Error('Invalid token')
    })
    const request = createMockRequest('/login', 'invalid_token')

    middleware(request)

    // Should allow access to login page (treated as not logged in)
    expect(mockNext).toHaveBeenCalled()
  })
})
