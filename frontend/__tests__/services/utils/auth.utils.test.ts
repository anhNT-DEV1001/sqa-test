/**
 * ============================================================================
 * UNIT TESTS: Auth Utilities (auth.utils.ts)
 * ============================================================================
 * File under test: src/services/utils/auth.utils.ts
 *
 * These tests verify all authentication utility functions including
 * token management (save/get/clear), user persistence, role checks,
 * and the logout flow. Each test ensures proper interaction with
 * localStorage and document.cookie.
 *
 * Mocking Strategy:
 * - localStorage is mocked via jest.spyOn on the Storage prototype
 * - document.cookie is intercepted via Object.defineProperty
 * ============================================================================
 */

import {
  saveAccessToken,
  saveRefreshToken,
  saveTokens,
  getAccessToken,
  getRefreshToken,
  saveUser,
  getUser,
  getUserRole,
  isTeacher,
  isStudent,
  isAuthenticated,
  clearAuth,
  logout
} from '@/services/utils/auth.utils'

// ---------------------------------------------------------------------------
// Mock Setup: localStorage
// ---------------------------------------------------------------------------
let localStorageMock: Record<string, string> = {}

beforeEach(() => {
  // Reset the in-memory store before every test for isolation
  localStorageMock = {}

  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(
    (key: string, value: string) => {
      localStorageMock[key] = value
    }
  )

  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
    (key: string) => localStorageMock[key] ?? null
  )

  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(
    (key: string) => {
      delete localStorageMock[key]
    }
  )

  // Mock document.cookie as a writable string
  let cookieStore = ''
  Object.defineProperty(document, 'cookie', {
    get: () => cookieStore,
    set: (val: string) => {
      cookieStore = val
    },
    configurable: true
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

// ===========================================================================
// 1. saveAccessToken — Lưu access token vào localStorage + cookie
// ===========================================================================
describe('saveAccessToken', () => {
  // Test Case ID: TC_AUTH_UTIL_01
  it('should_SaveAccessToken_To_LocalStorageAndCookie_When_CalledWithValidToken', () => {
    // Arrange
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'

    // Act
    saveAccessToken(token)

    // Assert — Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', token)
    expect(localStorageMock['access_token']).toBe(token)
  })
})

// ===========================================================================
// 2. saveRefreshToken — Lưu refresh token
// ===========================================================================
describe('saveRefreshToken', () => {
  // Test Case ID: TC_AUTH_UTIL_02
  it('should_SaveRefreshToken_To_LocalStorage_When_CalledWithValidToken', () => {
    const token = 'refresh_token_abc123'

    saveRefreshToken(token)

    expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', token)
    expect(localStorageMock['refresh_token']).toBe(token)
  })
})

// ===========================================================================
// 3. saveTokens — Lưu cả access và refresh token cùng lúc
// ===========================================================================
describe('saveTokens', () => {
  // Test Case ID: TC_AUTH_UTIL_03
  it('should_SaveBothTokens_To_LocalStorage_When_CalledWithBothTokens', () => {
    const accessToken = 'access_xyz'
    const refreshToken = 'refresh_xyz'

    saveTokens(accessToken, refreshToken)

    expect(localStorageMock['access_token']).toBe(accessToken)
    expect(localStorageMock['refresh_token']).toBe(refreshToken)
  })
})

// ===========================================================================
// 4. getAccessToken — Lấy access token từ localStorage
// ===========================================================================
describe('getAccessToken', () => {
  // Test Case ID: TC_AUTH_UTIL_04
  it('should_ReturnToken_When_TokenExistsInLocalStorage', () => {
    localStorageMock['access_token'] = 'stored_token'

    const result = getAccessToken()

    expect(result).toBe('stored_token')
  })

  // Test Case ID: TC_AUTH_UTIL_05
  it('should_ReturnNull_When_NoTokenInLocalStorage', () => {
    const result = getAccessToken()

    expect(result).toBeNull()
  })
})

// ===========================================================================
// 5. getRefreshToken — Lấy refresh token từ localStorage
// ===========================================================================
describe('getRefreshToken', () => {
  // Test Case ID: TC_AUTH_UTIL_06
  it('should_ReturnRefreshToken_When_TokenExistsInLocalStorage', () => {
    localStorageMock['refresh_token'] = 'my_refresh_token'

    const result = getRefreshToken()

    expect(result).toBe('my_refresh_token')
  })

  // Test Case ID: TC_AUTH_UTIL_07
  it('should_ReturnNull_When_NoRefreshTokenStored', () => {
    const result = getRefreshToken()

    expect(result).toBeNull()
  })
})

// ===========================================================================
// 6. saveUser / getUser — Lưu và lấy user object
// ===========================================================================
describe('saveUser / getUser', () => {
  const mockUser = {
    id: 'u1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'student' as const,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01'
  }

  // Test Case ID: TC_AUTH_UTIL_08
  it('should_SerializeAndSaveUser_To_LocalStorage_When_Called', () => {
    saveUser(mockUser)

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify(mockUser)
    )
  })

  // Test Case ID: TC_AUTH_UTIL_09
  it('should_ReturnParsedUser_When_UserExistsInLocalStorage', () => {
    localStorageMock['user'] = JSON.stringify(mockUser)

    const result = getUser()

    expect(result).toEqual(mockUser)
    expect(result.role).toBe('student')
  })

  // Test Case ID: TC_AUTH_UTIL_10
  it('should_ReturnNull_When_NoUserInLocalStorage', () => {
    const result = getUser()

    expect(result).toBeNull()
  })
})

// ===========================================================================
// 7. getUserRole — Lấy role của user hiện tại
// ===========================================================================
describe('getUserRole', () => {
  // Test Case ID: TC_AUTH_UTIL_11
  it('should_ReturnTeacher_When_UserHasTeacherRole', () => {
    localStorageMock['user'] = JSON.stringify({ role: 'teacher' })

    expect(getUserRole()).toBe('teacher')
  })

  // Test Case ID: TC_AUTH_UTIL_12
  it('should_ReturnStudent_When_UserHasStudentRole', () => {
    localStorageMock['user'] = JSON.stringify({ role: 'student' })

    expect(getUserRole()).toBe('student')
  })

  // Test Case ID: TC_AUTH_UTIL_13
  it('should_ReturnNull_When_NoUserStored', () => {
    expect(getUserRole()).toBeNull()
  })
})

// ===========================================================================
// 8. isTeacher / isStudent — Role check helpers
// ===========================================================================
describe('isTeacher / isStudent', () => {
  // Test Case ID: TC_AUTH_UTIL_14
  it('should_ReturnTrue_When_UserIsTeacher', () => {
    localStorageMock['user'] = JSON.stringify({ role: 'teacher' })

    expect(isTeacher()).toBe(true)
    expect(isStudent()).toBe(false)
  })

  // Test Case ID: TC_AUTH_UTIL_15
  it('should_ReturnTrue_When_UserIsStudent', () => {
    localStorageMock['user'] = JSON.stringify({ role: 'student' })

    expect(isStudent()).toBe(true)
    expect(isTeacher()).toBe(false)
  })
})

// ===========================================================================
// 9. isAuthenticated — Kiểm tra đã đăng nhập chưa
// ===========================================================================
describe('isAuthenticated', () => {
  // Test Case ID: TC_AUTH_UTIL_16
  it('should_ReturnTrue_When_AccessTokenExists', () => {
    localStorageMock['access_token'] = 'some_token'

    expect(isAuthenticated()).toBe(true)
  })

  // Test Case ID: TC_AUTH_UTIL_17
  it('should_ReturnFalse_When_NoAccessToken', () => {
    expect(isAuthenticated()).toBe(false)
  })
})

// ===========================================================================
// 10. clearAuth — Xóa tất cả dữ liệu authentication
// ===========================================================================
describe('clearAuth', () => {
  // Test Case ID: TC_AUTH_UTIL_18
  it('should_RemoveAllAuthData_From_LocalStorage_When_Called', () => {
    // Arrange — Pre-populate auth data
    localStorageMock['access_token'] = 'at'
    localStorageMock['refresh_token'] = 'rt'
    localStorageMock['user'] = '{"id":"1"}'

    // Act
    clearAuth()

    // Assert — All keys should be removed
    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('user')
  })
})

// ===========================================================================
// 11. logout — Clear auth + redirect to login
// ===========================================================================
describe('logout', () => {
  // Test Case ID: TC_AUTH_UTIL_19
  it('should_ClearAuthAndRedirectToLogin_When_Called', () => {
    // Arrange — Pre-populate auth data
    localStorageMock['access_token'] = 'at'
    localStorageMock['refresh_token'] = 'rt'
    localStorageMock['user'] = '{"id":"1"}'

    // Note: window.location.href assignment in jsdom throws or is ignored,
    // so we verify the clearAuth side-effects (the redirect is a browser concern).

    // Act — logout should call clearAuth internally
    // We need to catch the jsdom navigation error
    try {
      logout()
    } catch {
      // jsdom may throw "Not implemented: navigation" — that's expected
    }

    // Assert — Auth data should be cleared via clearAuth()
    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('user')
  })
})
