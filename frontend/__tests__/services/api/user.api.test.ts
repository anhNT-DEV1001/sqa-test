/**
 * ============================================================================
 * UNIT TESTS: User API (user.api.ts)
 * ============================================================================
 * File under test: src/services/api/user.api.ts
 *
 * Tests for the user API functions which call the backend for
 * profile management. The httpClient (Axios) is fully mocked
 * to ensure deterministic, isolated unit tests.
 *
 * Mocking Strategy:
 * - Mock the entire httpClient module to intercept all HTTP calls
 * - Each test sets up its own mock return value
 * - afterEach clears all mocks for isolation
 * ============================================================================
 */

// Mock httpClient before importing the module under test
jest.mock('@/services/httpClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

import httpClient from '@/services/httpClient'
import {
  getProfile,
  updateProfile,
  validateProfileImage
} from '@/services/api/user.api'

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>

afterEach(() => {
  jest.clearAllMocks()
})

// ===========================================================================
// 1. getProfile — Lấy thông tin user profile
// ===========================================================================
describe('getProfile', () => {
  // Test Case ID: TC_USER_API_01
  it('should_ReturnUserProfile_When_APICallSucceeds', async () => {
    // Arrange — Mock successful response
    const mockResponse = {
      success: true,
      data: {
        user: {
          id: 'u1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'student',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01'
        }
      },
      message: 'Profile fetched'
    }
    mockHttpClient.get.mockResolvedValue(mockResponse)

    // Act
    const result = await getProfile()

    // Assert — Should return the mock response
    expect(result).toEqual(mockResponse)
    expect(result.success).toBe(true)
    expect(result.data.user.username).toBe('testuser')
  })

  // Test Case ID: TC_USER_API_02
  it('should_ThrowError_When_APICallFails', async () => {
    // Arrange — Mock API failure
    mockHttpClient.get.mockRejectedValue(new Error('Network Error'))

    // Act & Assert — Should propagate the error
    await expect(getProfile()).rejects.toThrow('Network Error')
  })
})

// ===========================================================================
// 2. updateProfile — Cập nhật thông tin user profile
// ===========================================================================
describe('updateProfile', () => {
  // Test Case ID: TC_USER_API_03
  it('should_ReturnUpdatedProfile_When_UpdateSucceeds', async () => {
    // Arrange
    const updateData = { fullName: 'New Name', email: 'new@example.com' }
    const mockResponse = {
      success: true,
      data: {
        user: {
          id: 'u1',
          username: 'testuser',
          email: 'new@example.com',
          fullName: 'New Name',
          role: 'student' as const,
          createdAt: '2026-01-01',
          updatedAt: '2026-04-15'
        }
      },
      message: 'Profile updated'
    }
    mockHttpClient.put.mockResolvedValue(mockResponse)

    // Act
    const result = await updateProfile(updateData)

    // Assert — Verify the updated data
    expect(result.success).toBe(true)
    expect(result.data.user.fullName).toBe('New Name')
    expect(result.data.user.email).toBe('new@example.com')
  })
})

// ===========================================================================
// 3. validateProfileImage — Kiểm tra ảnh profile (AI face detection)
// ===========================================================================
describe('validateProfileImage', () => {
  // Test Case ID: TC_USER_API_04
  it('should_ReturnSuccess_When_ImageIsValid', async () => {
    // Arrange — Mock valid face detection response
    const mockResponse = {
      success: true,
      message: 'Valid face detected'
    }
    mockHttpClient.post.mockResolvedValue(mockResponse)

    // Act
    const result = await validateProfileImage('base64_encoded_image_data')

    // Assert
    expect(result.success).toBe(true)
    expect(result.message).toBe('Valid face detected')
  })

  // Test Case ID: TC_USER_API_05
  it('should_ReturnFailure_When_NoFaceDetected', async () => {
    // Arrange — Mock no face detected response
    const mockResponse = {
      success: false,
      message: 'No face detected in image'
    }
    mockHttpClient.post.mockResolvedValue(mockResponse)

    // Act
    const result = await validateProfileImage('base64_no_face_image')

    // Assert
    expect(result.success).toBe(false)
    expect(result.message).toBe('No face detected in image')
  })
})
