/**
 * ============================================================================
 * UNIT TESTS: parseApiError (auth.utils.ts)
 * ============================================================================
 * File under test: src/services/utils/auth.utils.ts — parseApiError function
 *
 * These tests verify the API error parsing logic which translates
 * Axios error objects into user-friendly Vietnamese error messages
 * based on HTTP status codes.
 *
 * Mocking Strategy:
 * - We construct mock Axios error objects manually (no network calls)
 * ============================================================================
 */

import { parseApiError } from '@/services/utils/auth.utils'

// ---------------------------------------------------------------------------
// Helper: Create a mock Axios error with a given status and optional message
// ---------------------------------------------------------------------------
const createAxiosError = (
  status: number,
  message?: string
) => ({
  response: {
    status,
    data: { message }
  }
})

// ---------------------------------------------------------------------------
// Helper: Create a network error (request sent but no response received)
// ---------------------------------------------------------------------------
const createNetworkError = () => ({
  request: {},
  message: 'Network Error'
})

// ---------------------------------------------------------------------------
// Helper: Create an unknown error (e.g. config issues)
// ---------------------------------------------------------------------------
const createUnknownError = (message?: string) => ({
  message: message || undefined
})

// ===========================================================================
// parseApiError — Chuyển đổi Axios error thành message tiếng Việt
// ===========================================================================
describe('parseApiError', () => {
  // Test Case ID: TC_PARSE_ERR_01
  it('should_ReturnBadRequestMessage_When_StatusIs400', () => {
    const error = createAxiosError(400, 'Email không hợp lệ')

    const result = parseApiError(error)

    expect(result).toBe('Email không hợp lệ')
  })

  // Test Case ID: TC_PARSE_ERR_02
  it('should_ReturnDefaultBadRequestMessage_When_Status400WithNoMessage', () => {
    const error = createAxiosError(400)

    const result = parseApiError(error)

    expect(result).toBe('Dữ liệu không hợp lệ')
  })

  // Test Case ID: TC_PARSE_ERR_03
  it('should_ReturnUnauthorizedMessage_When_StatusIs401', () => {
    const error = createAxiosError(401)

    const result = parseApiError(error)

    expect(result).toBe('Email hoặc mật khẩu không đúng')
  })

  // Test Case ID: TC_PARSE_ERR_04
  it('should_ReturnForbiddenMessage_When_StatusIs403', () => {
    const error = createAxiosError(403)

    const result = parseApiError(error)

    expect(result).toBe('Bạn không có quyền truy cập')
  })

  // Test Case ID: TC_PARSE_ERR_05
  it('should_ReturnNotFoundMessage_When_StatusIs404', () => {
    const error = createAxiosError(404)

    const result = parseApiError(error)

    expect(result).toBe('Không tìm thấy tài nguyên')
  })

  // Test Case ID: TC_PARSE_ERR_06
  it('should_ReturnConflictMessage_When_StatusIs409', () => {
    const error = createAxiosError(409, 'Email đã được sử dụng')

    const result = parseApiError(error)

    expect(result).toBe('Email đã được sử dụng')
  })

  // Test Case ID: TC_PARSE_ERR_07
  it('should_ReturnRateLimitMessage_When_StatusIs429', () => {
    const error = createAxiosError(429)

    const result = parseApiError(error)

    expect(result).toBe('Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau')
  })

  // Test Case ID: TC_PARSE_ERR_08
  it('should_ReturnServerErrorMessage_When_StatusIs500_502_503', () => {
    const expectedMessage = 'Lỗi server. Vui lòng thử lại sau'

    expect(parseApiError(createAxiosError(500))).toBe(expectedMessage)
    expect(parseApiError(createAxiosError(502))).toBe(expectedMessage)
    expect(parseApiError(createAxiosError(503))).toBe(expectedMessage)
  })

  // Test Case ID: TC_PARSE_ERR_09
  it('should_ReturnNetworkErrorMessage_When_NoResponseReceived', () => {
    const error = createNetworkError()

    const result = parseApiError(error)

    expect(result).toBe('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng')
  })

  // Test Case ID: TC_PARSE_ERR_10
  it('should_ReturnGenericMessage_When_UnknownErrorOccurs', () => {
    const error = createUnknownError('Something broke')

    const result = parseApiError(error)

    expect(result).toBe('Something broke')
  })

  // Test Case ID: TC_PARSE_ERR_11
  it('should_ReturnFallbackMessage_When_ErrorHasNoMessageAtAll', () => {
    const error = createUnknownError()

    const result = parseApiError(error)

    expect(result).toBe('Có lỗi xảy ra. Vui lòng thử lại')
  })
})
