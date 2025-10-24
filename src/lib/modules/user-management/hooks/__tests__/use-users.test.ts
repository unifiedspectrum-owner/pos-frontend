/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils'

/* User module imports */
import { useUsers } from '@user-management/hooks/use-users'
import { userManagementService } from '@user-management/api'
import { UserAccountDetails } from '@user-management/types'
import { PaginationInfo } from '@shared/types'

/* Mock dependencies */
vi.mock('@user-management/api', () => ({
  userManagementService: {
    listAllUsers: vi.fn()
  }
}))

vi.mock('@shared/utils', async () => {
  const actual = await vi.importActual('@shared/utils')
  return {
    ...actual,
    getCurrentISOString: vi.fn(() => '2024-01-01T00:00:00.000Z'),
    handleApiError: vi.fn()
  }
})

describe('useUsers Hook', () => {
  /* Mock data */
  const mockUsers: UserAccountDetails[] = [
    {
      id: 1,
      f_name: 'John',
      l_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+11234567890',
      profile_image_url: null,
      user_status: 'active',
      is_2fa_required: false,
      is_2fa_enabled: false,
      is_active: true,
      email_verified: true,
      phone_verified: true,
      email_verified_at: '2024-01-01T00:00:00Z',
      phone_verified_at: '2024-01-01T00:00:00Z',
      last_password_change: null,
      account_locked_until: null,
      user_created_at: '2024-01-01T00:00:00Z',
      user_updated_at: '2024-01-01T00:00:00Z',
      role_details: {
        id: 1,
        name: 'Admin',
        description: 'Administrator role',
        display_order: 1,
        user_count: 5,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    },
    {
      id: 2,
      f_name: 'Jane',
      l_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+10987654321',
      profile_image_url: null,
      user_status: 'inactive',
      is_2fa_required: true,
      is_2fa_enabled: true,
      is_active: false,
      email_verified: true,
      phone_verified: false,
      email_verified_at: '2024-01-01T00:00:00Z',
      phone_verified_at: null,
      last_password_change: '2024-01-01T00:00:00Z',
      account_locked_until: null,
      user_created_at: '2024-01-01T00:00:00Z',
      user_updated_at: '2024-01-01T00:00:00Z',
      role_details: {
        id: 2,
        name: 'Manager',
        description: 'Manager role',
        display_order: 2,
        user_count: 3,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    }
  ]

  const mockPagination: PaginationInfo = {
    current_page: 1,
    total_pages: 5,
    limit: 10,
    total_count: 50,
    has_next_page: true,
    has_prev_page: false
  }

  /* Mock service functions */
  const mockListAllUsers = vi.mocked(userManagementService.listAllUsers)
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
    it('should initialize with default values when autoFetch is false', () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      expect(result.current.users).toEqual([])
      expect(result.current.userSelectOptions).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.lastUpdated).toBe('')
      expect(result.current.pagination).toBeUndefined()
    })

    it('should initialize with loading state when autoFetch is true', () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: true }))

      expect(result.current.loading).toBe(true)
    })

    it('should use default parameters when none provided', () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useUsers())

      expect(mockListAllUsers).toHaveBeenCalledWith(1, 10)
    })

    it('should use custom initial page and limit', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useUsers({ initialPage: 2, initialLimit: 25 }))

      await waitFor(() => {
        expect(mockListAllUsers).toHaveBeenCalledWith(2, 25)
      })
    })
  })

  describe('fetchUsers Function', () => {
    it('should fetch users successfully', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await waitFor(() => expect(result.current.loading).toBe(false))

      result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.users).toEqual(mockUsers)
        expect(result.current.pagination).toEqual(mockPagination)
        expect(result.current.lastUpdated).toBe('2024-01-01T00:00:00.000Z')
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
      })
    })

    it('should set loading state during fetch', async () => {
      mockListAllUsers.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { users: mockUsers },
          pagination: mockPagination,
          message: 'Success'
        }), 100))
      )

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 200 })
    })

    it('should fetch with custom page and limit', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers(3, 15)

      await waitFor(() => {
        expect(mockListAllUsers).toHaveBeenCalledWith(3, 15)
      })
    })

    it('should handle API error response', async () => {
      mockListAllUsers.mockResolvedValue({
        success: false,
        data: { users: [] },
        pagination: {
          current_page: 1,
          limit: 10,
          total_count: 0,
          total_pages: 0,
          has_next_page: false,
          has_prev_page: false
        },
        message: 'Failed to fetch users',
        error: 'Server error'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch users')
        expect(result.current.users).toEqual([])
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockListAllUsers.mockRejectedValue(mockError)

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load user data')
        expect(result.current.users).toEqual([])
        expect(result.current.loading).toBe(false)
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Load Users'
        })
      })
    })

    it('should handle invalid page number', async () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers(NaN, 10)

      await waitFor(() => {
        expect(result.current.error).toBe('Page number must be a valid number')
        expect(result.current.loading).toBe(false)
        expect(mockListAllUsers).not.toHaveBeenCalled()
      })
    })

    it('should clear previous errors on successful fetch', async () => {
      mockListAllUsers.mockResolvedValueOnce({
        success: false,
        data: { users: [] },
        pagination: {
          current_page: 1,
          limit: 10,
          total_count: 0,
          total_pages: 0,
          has_next_page: false,
          has_prev_page: false
        },
        message: 'Error'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.error).toBe('Error')
      })

      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.error).toBe(null)
        expect(result.current.users).toEqual(mockUsers)
      })
    })
  })

  describe('refetch Function', () => {
    it('should refetch with current page and limit', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      /* Fetch users with specific page and limit */
      await act(async () => {
        await result.current.fetchUsers(2, 20)
      })

      await waitFor(() => {
        expect(mockListAllUsers).toHaveBeenCalledWith(2, 20)
        expect(result.current.loading).toBe(false)
      })

      mockListAllUsers.mockClear()

      /* Refetch should use the same page and limit */
      await act(async () => {
        await result.current.refetch()
      })

      await waitFor(() => {
        expect(mockListAllUsers).toHaveBeenCalledWith(2, 20)
      })
    })

    it('should maintain current page and limit across refetches', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ initialPage: 3, initialLimit: 25 }))

      await waitFor(() => {
        expect(mockListAllUsers).toHaveBeenCalledWith(3, 25)
      })

      mockListAllUsers.mockClear()

      await result.current.refetch()

      await waitFor(() => {
        expect(mockListAllUsers).toHaveBeenCalledWith(3, 25)
      })
    })
  })

  describe('userSelectOptions', () => {
    it('should transform users to select options', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.userSelectOptions).toEqual([
          { label: 'John Doe', value: '1' },
          { label: 'Jane Smith', value: '2' }
        ])
      })
    })

    it('should return empty array when no users', () => {
      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      expect(result.current.userSelectOptions).toEqual([])
    })

    it('should update select options when users change', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: [mockUsers[0]] },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.userSelectOptions).toEqual([
          { label: 'John Doe', value: '1' }
        ])
      })

      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.userSelectOptions).toEqual([
          { label: 'John Doe', value: '1' },
          { label: 'Jane Smith', value: '2' }
        ])
      })
    })
  })

  describe('Auto-fetch', () => {
    it('should auto-fetch on mount when autoFetch is true', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useUsers({ autoFetch: true }))

      await waitFor(() => {
        expect(mockListAllUsers).toHaveBeenCalledTimes(1)
      })
    })

    it('should not auto-fetch when autoFetch is false', () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useUsers({ autoFetch: false }))

      expect(mockListAllUsers).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty users array', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: [] },
        pagination: {
          ...mockPagination,
          total_count: 0,
          total_pages: 0
        },
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.users).toEqual([])
        expect(result.current.userSelectOptions).toEqual([])
        expect(result.current.error).toBe(null)
      })
    })

    it('should handle pagination correctly', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.pagination).toEqual(mockPagination)
        expect(result.current.users).toEqual(mockUsers)
      })
    })

    it('should handle concurrent fetch calls', async () => {
      mockListAllUsers.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { users: mockUsers },
          pagination: mockPagination,
          message: 'Success'
        }), 50))
      )

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      result.current.fetchUsers(1, 10)
      result.current.fetchUsers(2, 10)
      result.current.fetchUsers(3, 10)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 200 })

      /* Last call should win */
      expect(mockListAllUsers).toHaveBeenCalledWith(3, 10)
    })
  })

  describe('State Updates', () => {
    it('should update all state correctly on successful fetch', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers(2, 15)

      await waitFor(() => {
        expect(result.current.users).toEqual(mockUsers)
        expect(result.current.pagination).toEqual(mockPagination)
        expect(result.current.lastUpdated).toBe('2024-01-01T00:00:00.000Z')
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
        expect(result.current.userSelectOptions).toHaveLength(2)
      })
    })

    it('should reset users on error', async () => {
      mockListAllUsers.mockResolvedValue({
        success: true,
        data: { users: mockUsers },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useUsers({ autoFetch: false }))

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.users).toEqual(mockUsers)
      })

      const mockError = new Error('Network error') as AxiosError
      mockListAllUsers.mockRejectedValue(mockError)

      await result.current.fetchUsers()

      await waitFor(() => {
        expect(result.current.users).toEqual([])
        expect(result.current.error).toBe('Failed to load user data')
      })
    })
  })
})
