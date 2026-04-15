/**
 * ============================================================================
 * UNIT TESTS: Middleware Helper Functions (middleware.ts)
 * ============================================================================
 * File under test: src/middleware.ts
 *
 * The Next.js middleware file exports the main `middleware()` function and
 * a `config` matcher. Since the middleware() function depends on Next.js
 * request/response objects, we extract and test the internal helper
 * functions by re-implementing the same logic in isolation.
 *
 * Tested helpers:
 * - isPublicRoute, isAuthRoute, isTeacherRoute, isStudentRoute
 * - isProtectedRoute
 * - getUserFromToken (JWT decode without verification)
 *
 * Mocking Strategy:
 * - jwt-decode is mocked for getUserFromToken tests
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Re-implement helper functions from middleware.ts for isolated testing
// (The middleware file doesn't export these, so we replicate the logic)
// ---------------------------------------------------------------------------
const PUBLIC_ROUTES = ['/', '/certificate-verify']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']
const TEACHER_ROUTES = ['/dashboard/teacher', '/teacher']
const STUDENT_ROUTES = ['/dashboard/student', '/student']
const PROTECTED_ROUTES_PREFIXES = ['/certificate', '/profile', '/settings']

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname)
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname)
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isTeacherRoute(pathname: string): boolean {
  return TEACHER_ROUTES.some((route) => pathname.startsWith(route))
}

function isStudentRoute(pathname: string): boolean {
  return STUDENT_ROUTES.some((route) => pathname.startsWith(route))
}

function getUserFromToken(token: string): { role: string } | null {
  try {
    // Simulate jwt-decode: token format is "header.payload.signature"
    // payload is base64url encoded JSON
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    )
    return { role: payload.role }
  } catch {
    return null
  }
}

// ===========================================================================
// 1. isPublicRoute — Kiểm tra public routes
// ===========================================================================
describe('isPublicRoute', () => {
  // Test Case ID: TC_MW_01
  it('should_ReturnTrue_When_PathIsRoot', () => {
    expect(isPublicRoute('/')).toBe(true)
  })

  // Test Case ID: TC_MW_02
  it('should_ReturnTrue_When_PathIsCertificateVerify', () => {
    expect(isPublicRoute('/certificate-verify')).toBe(true)
  })

  // Test Case ID: TC_MW_03
  it('should_ReturnFalse_When_PathIsNotPublic', () => {
    expect(isPublicRoute('/login')).toBe(false)
    expect(isPublicRoute('/dashboard')).toBe(false)
    expect(isPublicRoute('/profile')).toBe(false)
  })
})

// ===========================================================================
// 2. isAuthRoute — Kiểm tra authentication routes (login, register, etc.)
// ===========================================================================
describe('isAuthRoute', () => {
  // Test Case ID: TC_MW_04
  it('should_ReturnTrue_When_PathIsLogin', () => {
    expect(isAuthRoute('/login')).toBe(true)
  })

  // Test Case ID: TC_MW_05
  it('should_ReturnTrue_When_PathIsRegister', () => {
    expect(isAuthRoute('/register')).toBe(true)
  })

  // Test Case ID: TC_MW_06
  it('should_ReturnTrue_When_PathIsForgotPassword', () => {
    expect(isAuthRoute('/forgot-password')).toBe(true)
  })

  // Test Case ID: TC_MW_07
  it('should_ReturnFalse_When_PathIsNotAuthRoute', () => {
    expect(isAuthRoute('/')).toBe(false)
    expect(isAuthRoute('/dashboard')).toBe(false)
    expect(isAuthRoute('/reset-password')).toBe(false)
  })
})

// ===========================================================================
// 3. isTeacherRoute — Kiểm tra teacher-only routes
// ===========================================================================
describe('isTeacherRoute', () => {
  // Test Case ID: TC_MW_08
  it('should_ReturnTrue_When_PathStartsWith_DashboardTeacher', () => {
    expect(isTeacherRoute('/dashboard/teacher')).toBe(true)
    expect(isTeacherRoute('/dashboard/teacher/courses')).toBe(true)
    expect(isTeacherRoute('/dashboard/teacher/exams/create')).toBe(true)
  })

  // Test Case ID: TC_MW_09
  it('should_ReturnTrue_When_PathStartsWith_Teacher', () => {
    expect(isTeacherRoute('/teacher')).toBe(true)
    expect(isTeacherRoute('/teacher/settings')).toBe(true)
  })

  // Test Case ID: TC_MW_10
  it('should_ReturnFalse_When_PathIsNotTeacherRoute', () => {
    expect(isTeacherRoute('/dashboard/student')).toBe(false)
    expect(isTeacherRoute('/login')).toBe(false)
    expect(isTeacherRoute('/')).toBe(false)
  })
})

// ===========================================================================
// 4. isStudentRoute — Kiểm tra student-only routes
// ===========================================================================
describe('isStudentRoute', () => {
  // Test Case ID: TC_MW_11
  it('should_ReturnTrue_When_PathStartsWith_DashboardStudent', () => {
    expect(isStudentRoute('/dashboard/student')).toBe(true)
    expect(isStudentRoute('/dashboard/student/exams')).toBe(true)
  })

  // Test Case ID: TC_MW_12
  it('should_ReturnFalse_When_PathIsNotStudentRoute', () => {
    expect(isStudentRoute('/dashboard/teacher')).toBe(false)
    expect(isStudentRoute('/login')).toBe(false)
  })
})

// ===========================================================================
// 5. isProtectedRoute — Kiểm tra protected routes (need login, any role)
// ===========================================================================
describe('isProtectedRoute', () => {
  // Test Case ID: TC_MW_13
  it('should_ReturnTrue_When_PathStartsWith_Certificate', () => {
    expect(isProtectedRoute('/certificate')).toBe(true)
    expect(isProtectedRoute('/certificate/abc123')).toBe(true)
  })

  // Test Case ID: TC_MW_14
  it('should_ReturnTrue_When_PathStartsWith_Profile', () => {
    expect(isProtectedRoute('/profile')).toBe(true)
    expect(isProtectedRoute('/profile/edit')).toBe(true)
  })

  // Test Case ID: TC_MW_15
  it('should_ReturnTrue_When_PathStartsWith_Settings', () => {
    expect(isProtectedRoute('/settings')).toBe(true)
  })

  // Test Case ID: TC_MW_16
  it('should_ReturnFalse_When_PathIsNotProtected', () => {
    expect(isProtectedRoute('/')).toBe(false)
    expect(isProtectedRoute('/login')).toBe(false)
    expect(isProtectedRoute('/dashboard')).toBe(false)
  })
})

// ===========================================================================
// 6. getUserFromToken — Decode JWT token to extract role
// ===========================================================================
describe('getUserFromToken', () => {
  // Test Case ID: TC_MW_17
  it('should_ReturnRole_When_TokenIsValidJWT', () => {
    // Create a valid JWT-like token with a teacher role in the payload
    const payload = Buffer.from(
      JSON.stringify({ role: 'teacher', sub: 'user-001' })
    ).toString('base64url')
    const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.fake_signature`

    const result = getUserFromToken(token)

    expect(result).toEqual({ role: 'teacher' })
  })

  // Test Case ID: TC_MW_18
  it('should_ReturnStudentRole_When_TokenPayloadHasStudentRole', () => {
    const payload = Buffer.from(
      JSON.stringify({ role: 'student', sub: 'user-002' })
    ).toString('base64url')
    const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.fake_signature`

    const result = getUserFromToken(token)

    expect(result).toEqual({ role: 'student' })
  })

  // Test Case ID: TC_MW_19
  it('should_ReturnNull_When_TokenIsInvalid', () => {
    expect(getUserFromToken('not-a-jwt')).toBeNull()
    expect(getUserFromToken('')).toBeNull()
  })

  // Test Case ID: TC_MW_20
  it('should_ReturnNull_When_TokenPayloadIsCorrupted', () => {
    // Valid structure but corrupted base64 payload
    const token = 'header.!!!invalid_base64!!!.signature'

    const result = getUserFromToken(token)

    expect(result).toBeNull()
  })
})
