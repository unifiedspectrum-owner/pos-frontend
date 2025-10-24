/* Comprehensive test suite for useModules hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'

/* Role module imports */
import { useModules } from '@role-management/hooks/use-modules'
import { roleManagementService } from '@role-management/api'
import { Module } from '@role-management/types'
import { PaginationInfo } from '@shared/types'

/* Mock dependencies */
vi.mock('@role-management/api', () => ({
  roleManagementService: {
    listAllModules: vi.fn()
  }
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

describe('useModules Hook', () => {
  /* Mock data */
  const mockModules: Module[] = [
    {
      id: 1,
      name: 'Users',
      description: 'User management module',
      display_order: 1,
      is_active: true
    },
    {
      id: 2,
      name: 'Roles',
      description: 'Role management module',
      display_order: 2,
      is_active: true
    },
    {
      id: 3,
      name: 'Settings',
      description: 'Settings module',
      display_order: 3,
      is_active: false
    }
  ]

  const mockPagination: PaginationInfo = {
    current_page: 1,
    total_pages: 1,
    limit: 100,
    total_count: 3,
    has_next_page: false,
    has_prev_page: false
  }

  /* Mock service functions */
  const mockListAllModules = vi.mocked(roleManagementService.listAllModules)
  const mockHandleApiError = vi.mocked(sharedUtils.handleApiError)

  beforeEach(() => {
    vi.clearAllMocks()
    /* Suppress console logs */
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useModules())

      expect(result.current.modules).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.isCached).toBe(false)
    })

    it('should have fetchModules function', () => {
      const { result } = renderHook(() => useModules())

      expect(typeof result.current.fetchModules).toBe('function')
    })
  })

  describe('fetchModules Function', () => {
    it('should fetch modules successfully', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBe(null)
        expect(result.current.isCached).toBe(true)
      })

      expect(mockListAllModules).toHaveBeenCalledTimes(1)
    })

    it('should set loading state during fetch', async () => {
      mockListAllModules.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { modules: mockModules },
          pagination: mockPagination,
          message: 'Success'
        }), 50))
      )

      const { result } = renderHook(() => useModules())

      const promise = result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle fetch API error', async () => {
      mockListAllModules.mockResolvedValue({
        success: false,
        message: 'Failed to fetch modules',
        data: { modules: [] },
        pagination: {
          current_page: 1,
          limit: 100,
          total_count: 0,
          total_pages: 0,
          has_next_page: false,
          has_prev_page: false
        }
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch modules')
        expect(result.current.modules).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isCached).toBe(false)
      })
    })

    it('should handle fetch network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockListAllModules.mockRejectedValue(mockError)

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch modules')
        expect(result.current.modules).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Fetch Modules'
        })
      })
    })

    it('should clear previous errors on successful fetch', async () => {
      mockListAllModules.mockResolvedValueOnce({
        success: false,
        message: 'Error',
        data: { modules: [] },
        pagination: {
          current_page: 1,
          limit: 100,
          total_count: 0,
          total_pages: 0,
          has_next_page: false,
          has_prev_page: false
        }
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.error).toBe('Error')
      })

      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      /* Reset cache for second fetch */
      const { result: result2 } = renderHook(() => useModules())

      await result2.current.fetchModules()

      await waitFor(() => {
        expect(result2.current.error).toBe(null)
        expect(result2.current.modules).toEqual(mockModules)
      })
    })

    it('should handle missing modules data in response', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {} as { modules: Module[] },
        pagination: mockPagination
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.modules).toEqual([])
      })
    })

    it('should handle empty modules array', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: [] },
        pagination: {
          current_page: 1,
          limit: 100,
          total_count: 0,
          total_pages: 0,
          has_next_page: false,
          has_prev_page: false
        },
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.modules).toEqual([])
        expect(result.current.error).toBe(null)
        expect(result.current.isCached).toBe(true)
      })
    })
  })

  describe('Caching Behavior', () => {
    it('should use cached data on second fetch', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      /* First fetch */
      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.isCached).toBe(true)
      })

      expect(mockListAllModules).toHaveBeenCalledTimes(1)

      /* Second fetch should use cache */
      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules)
      })

      /* Should not call API again */
      expect(mockListAllModules).toHaveBeenCalledTimes(1)
    })

    it('should not refetch when already cached', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.isCached).toBe(true)
      })

      const callCountBefore = mockListAllModules.mock.calls.length

      await result.current.fetchModules()
      await result.current.fetchModules()
      await result.current.fetchModules()

      /* Should not make additional API calls */
      expect(mockListAllModules.mock.calls.length).toBe(callCountBefore)
    })

    it('should start fresh with new hook instance', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      /* First hook instance */
      const { result: result1 } = renderHook(() => useModules())

      await result1.current.fetchModules()

      await waitFor(() => {
        expect(result1.current.isCached).toBe(true)
      })

      expect(mockListAllModules).toHaveBeenCalledTimes(1)

      /* Second hook instance should not have cached data */
      const { result: result2 } = renderHook(() => useModules())

      expect(result2.current.isCached).toBe(false)

      await result2.current.fetchModules()

      await waitFor(() => {
        expect(result2.current.isCached).toBe(true)
      })

      /* Should make another API call for new instance */
      expect(mockListAllModules).toHaveBeenCalledTimes(2)
    })
  })

  describe('Concurrent Fetch Handling', () => {
    it('should handle concurrent fetch calls by reusing promise', async () => {
      let resolvePromise: (value: unknown) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      mockListAllModules.mockReturnValue(promise as Promise<never>)

      const { result } = renderHook(() => useModules())

      /* Make multiple concurrent calls */
      const promise1 = result.current.fetchModules()
      const promise2 = result.current.fetchModules()
      const promise3 = result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      /* Resolve the promise */
      resolvePromise!({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      await Promise.all([promise1, promise2, promise3])

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules)
        expect(result.current.isLoading).toBe(false)
      })

      /* Should only call API once despite multiple concurrent calls */
      expect(mockListAllModules).toHaveBeenCalledTimes(1)
    })

    it('should clear fetch promise after completion', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.isCached).toBe(true)
      })

      /* Promise should be cleared, but cache prevents new fetch */
      await result.current.fetchModules()

      /* Should use cache, not make new API call */
      expect(mockListAllModules).toHaveBeenCalledTimes(1)
    })

    it('should allow new fetch after error is cleared', async () => {
      mockListAllModules.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch modules')
        expect(result.current.isCached).toBe(false)
      })

      /* First call failed */
      expect(mockListAllModules).toHaveBeenCalledTimes(1)

      /* Should allow retry since cache is false */
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules)
        expect(result.current.isCached).toBe(true)
      })

      /* Second call should succeed */
      expect(mockListAllModules).toHaveBeenCalledTimes(2)
    })
  })

  describe('State Management', () => {
    it('should update all state correctly on successful fetch', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBe(null)
        expect(result.current.isCached).toBe(true)
      })
    })

    it('should maintain modules on error', async () => {
      mockListAllModules.mockResolvedValueOnce({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result: result1 } = renderHook(() => useModules())

      await result1.current.fetchModules()

      await waitFor(() => {
        expect(result1.current.modules).toEqual(mockModules)
      })

      /* New instance should start fresh */
      const mockError = new Error('Network error') as AxiosError
      mockListAllModules.mockRejectedValue(mockError)

      const { result: result2 } = renderHook(() => useModules())

      await result2.current.fetchModules()

      await waitFor(() => {
        expect(result2.current.modules).toEqual([])
        expect(result2.current.error).toBe('Failed to fetch modules')
      })
    })

    it('should reset loading state on error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockListAllModules.mockRejectedValue(mockError)

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBe('Failed to fetch modules')
      })
    })

    it('should maintain cache flag after successful fetch', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: mockModules },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      expect(result.current.isCached).toBe(false)

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.isCached).toBe(true)
      })

      /* Cache flag should remain true */
      expect(result.current.isCached).toBe(true)
    })

    it('should not set cache flag on error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockListAllModules.mockRejectedValue(mockError)

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isCached).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null modules data gracefully', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: null as unknown as Module[] },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.modules).toEqual([])
      })
    })

    it('should handle undefined data object', async () => {
      mockListAllModules.mockResolvedValue({
        success: true,
        data: undefined as never,
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.modules).toEqual([])
      })
    })

    it('should handle empty message in error response', async () => {
      mockListAllModules.mockResolvedValue({
        success: false,
        message: '',
        data: { modules: [] },
        pagination: {
          current_page: 1,
          limit: 100,
          total_count: 0,
          total_pages: 0,
          has_next_page: false,
          has_prev_page: false
        }
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch modules')
      })
    })

    it('should preserve module order from API', async () => {
      const orderedModules = [mockModules[2], mockModules[0], mockModules[1]]

      mockListAllModules.mockResolvedValue({
        success: true,
        data: { modules: orderedModules },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useModules())

      await result.current.fetchModules()

      await waitFor(() => {
        expect(result.current.modules).toEqual(orderedModules)
      })
    })
  })
})
