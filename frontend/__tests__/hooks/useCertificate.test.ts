/**
 * ============================================================================
 * UNIT TESTS: useCertificate Hook (hooks/certificate/useCertificate.ts)
 * ============================================================================
 * File under test: src/hooks/certificate/useCertificate.ts
 *
 * Tests for the certificate hooks:
 * 1. useCertificate — Fetches certificate list via CertificateService.useGet
 * 2. useCertificateIssue — Issues certificate via CertificateService.usePost
 *
 * Mocking Strategy:
 * - Mock @/services module to replace CertificateService
 * - Mock useGet/usePost to return controlled data
 * ============================================================================
 */

import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ---------------------------------------------------------------------------
// Mock: CertificateService (and its parent ApiService hooks)
// ---------------------------------------------------------------------------
const mockUseGet = jest.fn()
const mockUsePost = jest.fn()

jest.mock('@/services', () => ({
  CertificateService: {
    useGet: (...args: any[]) => mockUseGet(...args),
    usePost: (...args: any[]) => mockUsePost(...args)
  }
}))

import { useCertificate, useCertificateIssue } from '@/hooks/certificate/useCertificate'

// ---------------------------------------------------------------------------
// Helper: Create a QueryClient wrapper for React Query hooks
// ---------------------------------------------------------------------------
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

// ---------------------------------------------------------------------------
// Reset mocks before each test
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks()
})

// ===========================================================================
// 1. useCertificate — Lấy danh sách certificate
// ===========================================================================
describe('useCertificate', () => {
  // Test Case ID: TC_CERT_01
  it('should_ReturnCertificateData_When_APIReturnsSuccess', () => {
    // Arrange — Mock successful API response
    const mockCertificates = [
      { id: 'cert-001', studentName: 'Ngoc', courseName: 'Math 101' },
      { id: 'cert-002', studentName: 'Minh', courseName: 'Physics 201' }
    ]

    mockUseGet.mockReturnValue({
      data: { data: mockCertificates },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })

    // Act
    const { result } = renderHook(() => useCertificate(), {
      wrapper: createWrapper()
    })

    // Assert — data should be extracted from response
    expect(result.current.data).toEqual(mockCertificates)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.getCertificate).toBe('function')
  })

  // Test Case ID: TC_CERT_02
  it('should_ReturnEmptyArray_When_APIReturnsNoData', () => {
    // Arrange — Mock empty or undefined response
    mockUseGet.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })

    // Act
    const { result } = renderHook(() => useCertificate(), {
      wrapper: createWrapper()
    })

    // Assert — Should default to empty array, not crash
    expect(result.current.data).toEqual([])
  })

  // Test Case ID: TC_CERT_03
  it('should_ReturnLoadingTrue_When_APIIsLoading', () => {
    mockUseGet.mockReturnValue({
      data: { data: [] },
      isLoading: true,
      error: null,
      refetch: jest.fn()
    })

    const { result } = renderHook(() => useCertificate(), {
      wrapper: createWrapper()
    })

    expect(result.current.loading).toBe(true)
  })

  // Test Case ID: TC_CERT_04
  it('should_ReturnError_When_APIFails', () => {
    const mockError = new Error('Network Error')
    mockUseGet.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: mockError,
      refetch: jest.fn()
    })

    const { result } = renderHook(() => useCertificate(), {
      wrapper: createWrapper()
    })

    expect(result.current.error).toBe(mockError)
  })

  // Test Case ID: TC_CERT_05
  it('should_PassParams_To_CertificateService', () => {
    mockUseGet.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })

    // Act — Pass custom API params
    renderHook(
      () => useCertificate({ page: 1, limit: 10 }),
      { wrapper: createWrapper() }
    )

    // Assert — useGet should be called with the params
    expect(mockUseGet).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '',
        params: { page: 1, limit: 10 }
      })
    )
  })
})

// ===========================================================================
// 2. useCertificateIssue — Phát hành certificate (NFT/Blockchain)
// ===========================================================================
describe('useCertificateIssue', () => {
  // Test Case ID: TC_CERT_06
  it('should_ReturnIssueCertificateFunction_When_Initialized', () => {
    // Arrange
    mockUsePost.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
      error: null,
      data: null
    })

    // Act
    const { result } = renderHook(() => useCertificateIssue(), {
      wrapper: createWrapper()
    })

    // Assert — issueCertificate should be a callable function
    expect(typeof result.current.issueCertificate).toBe('function')
    expect(result.current.loading).toBe(false)
  })

  // Test Case ID: TC_CERT_07
  it('should_CallMutateAsync_When_IssueCertificateIsCalled', async () => {
    // Arrange — Mock the mutation
    const mockMutateAsync = jest.fn().mockResolvedValue({
      data: { certificateId: 'cert-new-001', txHash: '0xabc123' }
    })

    mockUsePost.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      data: null
    })

    // Act
    const { result } = renderHook(() => useCertificateIssue(), {
      wrapper: createWrapper()
    })

    const certificateData = {
      studentId: 'student-001',
      examId: 'exam-001',
      score: 85
    }

    await act(async () => {
      await result.current.issueCertificate(certificateData)
    })

    // Assert — mutateAsync should be called with { data: certificateData }
    expect(mockMutateAsync).toHaveBeenCalledWith({ data: certificateData })
  })

  // Test Case ID: TC_CERT_08
  it('should_ReturnLoadingTrue_When_IssuingCertificate', () => {
    mockUsePost.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true,
      error: null,
      data: null
    })

    const { result } = renderHook(() => useCertificateIssue(), {
      wrapper: createWrapper()
    })

    expect(result.current.loading).toBe(true)
  })
})
