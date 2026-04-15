/**
 * ============================================================================
 * UNIT TESTS: Auth Store (stores/auth.ts)
 * ============================================================================
 * File under test: src/stores/auth.ts
 *
 * Tests for the Zustand auth store which manages user authentication state
 * including user profile data, loading states, and error handling.
 * The getUser action is tested by mocking the getProfile API call.
 *
 * Mocking Strategy:
 * - getProfile API is mocked via jest.mock
 * - Zustand store is tested directly (no React rendering needed for simple stores)
 * ============================================================================
 */

import { useAuth, type User } from '@/stores/auth'

// Mock the getProfile API function
jest.mock('@/services/api/user.api', () => ({
  getProfile: jest.fn()
}))

import { getProfile } from '@/services/api/user.api'
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>

// ---------------------------------------------------------------------------
// Reset store state before each test for isolation
// ---------------------------------------------------------------------------
beforeEach(() => {
  // Reset Zustand store to initial state
  useAuth.setState({
    user: null,
    isLoading: false,
    error: null
  })
  jest.clearAllMocks()
})

// ===========================================================================
// Test data — Mock user object
// ===========================================================================
const mockUser: User = {
  id: 'user-001',
  username: 'ngoctest',
  email: 'ngoc@test.com',
  fullName: 'Ngoc Test',
  role: 'student',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z'
}

// ===========================================================================
// 1. setUser — Cập nhật user và xóa error
// ===========================================================================
describe('Auth Store - setUser', () => {
  // Test Case ID: TC_AUTH_STORE_01
  it('should_SetUser_And_ClearError_When_CalledWithValidUser', () => {
    // Act
    useAuth.getState().setUser(mockUser)

    // Assert
    const state = useAuth.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.error).toBeNull()
  })

  // Test Case ID: TC_AUTH_STORE_02
  it('should_SetUserToNull_When_CalledWithNull', () => {
    // Arrange — Set a user first
    useAuth.getState().setUser(mockUser)

    // Act — Clear user
    useAuth.getState().setUser(null)

    // Assert
    expect(useAuth.getState().user).toBeNull()
  })
})

// ===========================================================================
// 2. setLoading — Cập nhật trạng thái loading
// ===========================================================================
describe('Auth Store - setLoading', () => {
  // Test Case ID: TC_AUTH_STORE_03
  it('should_UpdateLoadingState_When_Called', () => {
    useAuth.getState().setLoading(true)
    expect(useAuth.getState().isLoading).toBe(true)

    useAuth.getState().setLoading(false)
    expect(useAuth.getState().isLoading).toBe(false)
  })
})

// ===========================================================================
// 3. setError — Cập nhật error state
// ===========================================================================
describe('Auth Store - setError', () => {
  // Test Case ID: TC_AUTH_STORE_04
  it('should_SetError_And_StopLoading_When_CalledWithMessage', () => {
    // Arrange — Set loading to true
    useAuth.getState().setLoading(true)

    // Act
    useAuth.getState().setError('Something went wrong')

    // Assert — error should be set and loading should be false
    const state = useAuth.getState()
    expect(state.error).toBe('Something went wrong')
    expect(state.isLoading).toBe(false)
  })
})

// ===========================================================================
// 4. clearUser — Reset toàn bộ state về mặc định
// ===========================================================================
describe('Auth Store - clearUser', () => {
  // Test Case ID: TC_AUTH_STORE_05
  it('should_ResetAllState_When_Called', () => {
    // Arrange — Populate state
    useAuth.setState({
      user: mockUser,
      isLoading: true,
      error: 'some error'
    })

    // Act
    useAuth.getState().clearUser()

    // Assert — Everything should be reset
    const state = useAuth.getState()
    expect(state.user).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })
})

// ===========================================================================
// 5. getUser — Gọi API lấy user profile
// ===========================================================================
describe('Auth Store - getUser', () => {
  // Test Case ID: TC_AUTH_STORE_06
  it('should_FetchAndSetUser_When_APIReturnsSuccess', async () => {
    // Arrange — Mock successful API response
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { user: mockUser as any },
      message: 'Profile fetched'
    })

    // Act
    await useAuth.getState().getUser()

    // Assert — User should be populated, loading should be false
    const state = useAuth.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  // Test Case ID: TC_AUTH_STORE_07
  it('should_SetError_When_APIReturnsFailure', async () => {
    // Arrange — Mock failed API response (success: false)
    mockGetProfile.mockResolvedValue({
      success: false,
      data: { user: null as any },
      message: 'Unauthorized'
    })

    // Act
    await useAuth.getState().getUser()

    // Assert — Error should be set
    const state = useAuth.getState()
    expect(state.error).toBe('Unauthorized')
    expect(state.isLoading).toBe(false)
  })

  // Test Case ID: TC_AUTH_STORE_08
  it('should_ClearUser_When_APIReturns401Error', async () => {
    // Arrange — Mock 401 error
    const error401 = { response: { status: 401 } }
    mockGetProfile.mockRejectedValue(error401)

    // Act
    await useAuth.getState().getUser()

    // Assert — User should be null (token invalid), no error message
    const state = useAuth.getState()
    expect(state.user).toBeNull()
    expect(state.error).toBeNull()
    expect(state.isLoading).toBe(false)
  })

  // Test Case ID: TC_AUTH_STORE_09
  it('should_SetGenericError_When_APIThrowsNon401Error', async () => {
    // Arrange — Mock network error (non-401)
    mockGetProfile.mockRejectedValue(new Error('Network Error'))

    // Act
    await useAuth.getState().getUser()

    // Assert — Generic error message should be set
    const state = useAuth.getState()
    expect(state.error).toBe('Failed to get user')
    expect(state.isLoading).toBe(false)
  })
})
