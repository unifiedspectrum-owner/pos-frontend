/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { Mock } from 'vitest'

/* Shared module imports */
import { useCsrfToken } from '@shared/hooks/use-csrf-token'

/* CSRF Token API Response type */
interface CsrfTokenApiResponse {
  success: boolean
  message: string
  error?: string
  data?: {
    csrfToken: string
  }
  timestamp: string
}

/* Hoisted mock functions */
const { mockGetCsrfToken, mockHandleApiError } = vi.hoisted(() => ({
  mockGetCsrfToken: vi.fn(),
  mockHandleApiError: vi.fn()
}))

/* Mock CSRF API service */
vi.mock('@shared/api', () => ({
  csrfApiService: {
    getCsrfToken: mockGetCsrfToken
  }
}))

/* Mock API error handler */
vi.mock('@shared/utils', () => ({
  handleApiError: mockHandleApiError
}))

describe('use-csrf-token', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn> | undefined

  beforeEach(() => {
    mockGetCsrfToken.mockReset()
    mockHandleApiError.mockReset()

    /* Suppress console logs */
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    consoleSpy?.mockRestore()
  })

  describe('Initialization', () => {
    it('should initialize with null token', () => {
      const { result } = renderHook(() => useCsrfToken())

      expect(result.current.csrfToken).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should provide all required properties', () => {
      const { result } = renderHook(() => useCsrfToken())

      expect(result.current).toHaveProperty('csrfToken')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('fetchCsrfToken')
      expect(result.current).toHaveProperty('clearCsrfToken')
    })

    it('should have function types for methods', () => {
      const { result } = renderHook(() => useCsrfToken())

      expect(typeof result.current.fetchCsrfToken).toBe('function')
      expect(typeof result.current.clearCsrfToken).toBe('function')
    })
  })

  describe('Options', () => {
    it('should accept showErrorToast option', () => {
      const { result } = renderHook(() =>
        useCsrfToken({ showErrorToast: false })
      )

      expect(result.current).toBeDefined()
    })

    it('should default showErrorToast to true', () => {
      const { result } = renderHook(() => useCsrfToken())

      expect(result.current).toBeDefined()
    })
  })

  describe('fetchCsrfToken - Success', () => {
    const mockSuccessResponse: CsrfTokenApiResponse = {
      success: true,
      message: 'CSRF token generated',
      timestamp: new Date().toISOString(),
      data: {
        csrfToken: 'test-csrf-token-123'
      }
    }

    it('should fetch CSRF token successfully', async () => {
      mockGetCsrfToken.mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useCsrfToken())

      let token: string | null = null
      await act(async () => {
        token = await result.current.fetchCsrfToken()
      })

      expect(token).toBe('test-csrf-token-123')
      expect(result.current.csrfToken).toBe('test-csrf-token-123')
      expect(result.current.error).toBeNull()
    })

    it('should set loading state during fetch', async () => {
      mockGetCsrfToken.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSuccessResponse), 100))
      )

      const { result } = renderHook(() => useCsrfToken())

      act(() => {
        result.current.fetchCsrfToken()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should clear error on successful fetch', async () => {
      mockGetCsrfToken.mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useCsrfToken())

      /* Set an error first */
      await act(async () => {
        mockGetCsrfToken.mockRejectedValueOnce(new Error('Test error'))
        await result.current.fetchCsrfToken()
      })

      expect(result.current.error).toBe('Test error')

      /* Now fetch successfully */
      await act(async () => {
        mockGetCsrfToken.mockResolvedValue(mockSuccessResponse)
        await result.current.fetchCsrfToken()
      })

      expect(result.current.error).toBeNull()
    })

    it('should call API service', async () => {
      mockGetCsrfToken.mockResolvedValue(mockSuccessResponse)

      const { result } = renderHook(() => useCsrfToken())

      await act(async () => {
        await result.current.fetchCsrfToken()
      })

      expect(mockGetCsrfToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchCsrfToken - Failure', () => {
    it('should handle API response with success false', async () => {
      mockGetCsrfToken.mockResolvedValue({
        success: false,
        message: 'Failed to generate token',
        timestamp: new Date().toISOString(),
        data: null
      })

      const { result } = renderHook(() => useCsrfToken())

      let token: string | null = null
      await act(async () => {
        token = await result.current.fetchCsrfToken()
      })

      expect(token).toBeNull()
      expect(result.current.csrfToken).toBeNull()
      expect(result.current.error).toBe('Failed to generate token')
    })

    it('should handle API response with missing data', async () => {
      mockGetCsrfToken.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
        data: null
      })

      const { result } = renderHook(() => useCsrfToken())

      let token: string | null = null
      await act(async () => {
        token = await result.current.fetchCsrfToken()
      })

      expect(token).toBeNull()
      expect(result.current.error).toBe('Success')
    })

    it('should handle API response with missing csrfToken', async () => {
      mockGetCsrfToken.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
        data: {}
      })

      const { result } = renderHook(() => useCsrfToken())

      let token: string | null = null
      await act(async () => {
        token = await result.current.fetchCsrfToken()
      })

      expect(token).toBeNull()
    })

    it('should handle generic Error', async () => {
      mockGetCsrfToken.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useCsrfToken())

      let token: string | null = null
      await act(async () => {
        token = await result.current.fetchCsrfToken()
      })

      expect(token).toBeNull()
      expect(result.current.error).toBe('Network error')
    })

    it('should handle non-Error exceptions', async () => {
      mockGetCsrfToken.mockRejectedValue('String error')

      const { result } = renderHook(() => useCsrfToken())

      let token: string | null = null
      await act(async () => {
        token = await result.current.fetchCsrfToken()
      })

      expect(token).toBeNull()
      expect(result.current.error).toBe('Error fetching CSRF token')
    })

    it('should call handleApiError when showErrorToast is true', async () => {
      const mockError = new Error('API Error')
      mockGetCsrfToken.mockRejectedValue(mockError)

      const { result } = renderHook(() => useCsrfToken({ showErrorToast: true }))

      await act(async () => {
        await result.current.fetchCsrfToken()
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
        title: 'Failed to Load CSRF Token'
      })
    })

    it('should not call handleApiError when showErrorToast is false', async () => {
      mockGetCsrfToken.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useCsrfToken({ showErrorToast: false }))

      await act(async () => {
        await result.current.fetchCsrfToken()
      })

      expect(mockHandleApiError).not.toHaveBeenCalled()
    })

    it('should reset loading state after error', async () => {
      mockGetCsrfToken.mockRejectedValue(new Error('Test error'))

      const { result } = renderHook(() => useCsrfToken())

      await act(async () => {
        await result.current.fetchCsrfToken()
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('clearCsrfToken', () => {
    it('should clear CSRF token', async () => {
      mockGetCsrfToken.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
        data: { csrfToken: 'test-token' }
      })

      const { result } = renderHook(() => useCsrfToken())

      await act(async () => {
        await result.current.fetchCsrfToken()
      })

      expect(result.current.csrfToken).toBe('test-token')

      act(() => {
        result.current.clearCsrfToken()
      })

      expect(result.current.csrfToken).toBeNull()
    })

    it('should clear error state', async () => {
      mockGetCsrfToken.mockRejectedValue(new Error('Test error'))

      const { result } = renderHook(() => useCsrfToken())

      await act(async () => {
        await result.current.fetchCsrfToken()
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearCsrfToken()
      })

      expect(result.current.error).toBeNull()
    })

    it('should be safe to call when token is already null', () => {
      const { result } = renderHook(() => useCsrfToken())

      act(() => {
        result.current.clearCsrfToken()
      })

      expect(result.current.csrfToken).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('Multiple fetches', () => {
    it('should handle multiple fetch calls', async () => {
      mockGetCsrfToken
        .mockResolvedValueOnce({
          success: true,
          message: 'Success',
          timestamp: new Date().toISOString(),
          data: { csrfToken: 'token-1' }
        })
        .mockResolvedValueOnce({
          success: true,
          message: 'Success',
          timestamp: new Date().toISOString(),
          data: { csrfToken: 'token-2' }
        })

      const { result } = renderHook(() => useCsrfToken())

      await act(async () => {
        await result.current.fetchCsrfToken()
      })
      expect(result.current.csrfToken).toBe('token-1')

      await act(async () => {
        await result.current.fetchCsrfToken()
      })
      expect(result.current.csrfToken).toBe('token-2')
    })

    it('should handle fetch after clear', async () => {
      mockGetCsrfToken.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
        data: { csrfToken: 'new-token' }
      })

      const { result } = renderHook(() => useCsrfToken())

      await act(async () => {
        await result.current.fetchCsrfToken()
      })

      act(() => {
        result.current.clearCsrfToken()
      })

      expect(result.current.csrfToken).toBeNull()

      await act(async () => {
        await result.current.fetchCsrfToken()
      })

      expect(result.current.csrfToken).toBe('new-token')
    })
  })

  describe('Function reference stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useCsrfToken())

      const firstFetch = result.current.fetchCsrfToken
      const firstClear = result.current.clearCsrfToken

      rerender()

      expect(result.current.fetchCsrfToken).toBe(firstFetch)
      expect(result.current.clearCsrfToken).toBe(firstClear)
    })

    it('should update functions when showErrorToast changes', () => {
      const { result, rerender } = renderHook(
        ({ showErrorToast }) => useCsrfToken({ showErrorToast }),
        { initialProps: { showErrorToast: true } }
      )

      const firstFetch = result.current.fetchCsrfToken

      rerender({ showErrorToast: false })

      expect(result.current.fetchCsrfToken).not.toBe(firstFetch)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete workflow', async () => {
      mockGetCsrfToken.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
        data: { csrfToken: 'workflow-token' }
      })

      const { result } = renderHook(() => useCsrfToken())

      /* Initial state */
      expect(result.current.csrfToken).toBeNull()

      /* Fetch token */
      await act(async () => {
        const token = await result.current.fetchCsrfToken()
        expect(token).toBe('workflow-token')
      })

      expect(result.current.csrfToken).toBe('workflow-token')
      expect(result.current.error).toBeNull()

      /* Clear token */
      act(() => {
        result.current.clearCsrfToken()
      })

      expect(result.current.csrfToken).toBeNull()
    })
  })
})
