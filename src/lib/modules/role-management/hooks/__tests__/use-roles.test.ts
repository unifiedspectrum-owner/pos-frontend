/* Comprehensive test suite for useRoles hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils'

/* Role module imports */
import { useRoles } from '@role-management/hooks/use-roles'
import { roleManagementService } from '@role-management/api'
import { Role, RolePermission } from '@role-management/types'
import { PaginationInfo } from '@shared/types'

/* Mock dependencies */
vi.mock('@role-management/api', () => ({
  roleManagementService: {
    listAllRoles: vi.fn(),
    listAllRolePermissions: vi.fn()
  }
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils', async () => {
  const actual = await vi.importActual('@shared/utils')
  return {
    ...actual,
    getCurrentISOString: vi.fn(() => '2024-01-01T00:00:00.000Z')
  }
})

describe('useRoles Hook', () => {
  /* Mock data */
  const mockRoles: Role[] = [
    {
      id: 1,
      name: 'Admin',
      description: 'Administrator role with full access',
      display_order: 1,
      user_count: 5,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Manager role with limited access',
      display_order: 2,
      user_count: 3,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      name: 'Viewer',
      description: 'Viewer role with read-only access',
      display_order: 3,
      user_count: 10,
      is_active: false,
      created_at: '2024-01-03T00:00:00Z'
    }
  ]

  const mockRolePermissions: RolePermission[] = [
    {
      id: 1,
      role_id: 1,
      module_id: 1,
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: false,
      display_order: 1
    },
    {
      id: 2,
      role_id: 1,
      module_id: 2,
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: true,
      display_order: 2
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
  const mockListAllRoles = vi.mocked(roleManagementService.listAllRoles)
  const mockListAllRolePermissions = vi.mocked(roleManagementService.listAllRolePermissions)

  /* Import mocked function after vi.mock() */
  let mockHandleApiError: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    const apiModule = await import('@shared/utils/api')
    mockHandleApiError = vi.mocked(apiModule.handleApiError)

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
      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      expect(result.current.roles).toEqual([])
      expect(result.current.roleOptions).toEqual([{ label: 'All Roles', value: 'all' }])
      expect(result.current.roleSelectOptions).toEqual([])
      expect(result.current.rolePermissions).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.permissionsLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.permissionsError).toBe(null)
      expect(result.current.lastUpdated).toBe('')
      expect(result.current.pagination).toBeUndefined()
    })

    it('should initialize with loading state when autoFetch is true', () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: true }))

      expect(result.current.loading).toBe(true)
    })

    it('should use default parameters when none provided', () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useRoles())

      expect(mockListAllRoles).toHaveBeenCalledWith(1, 10)
    })

    it('should use custom initial page and limit', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useRoles({ initialPage: 2, initialLimit: 25 }))

      await waitFor(() => {
        expect(mockListAllRoles).toHaveBeenCalledWith(2, 25)
      })
    })
  })

  describe('fetchRoles Function', () => {
    it('should fetch roles successfully', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await waitFor(() => expect(result.current.loading).toBe(false))

      result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roles).toEqual(mockRoles)
        expect(result.current.pagination).toEqual(mockPagination)
        expect(result.current.lastUpdated).toBe('2024-01-01T00:00:00.000Z')
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
      })
    })

    it('should set loading state during fetch', async () => {
      mockListAllRoles.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { roles: mockRoles },
          pagination: mockPagination,
          message: 'Success'
        }), 100))
      )

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 200 })
    })

    it('should fetch with custom page and limit', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles(3, 15)

      await waitFor(() => {
        expect(mockListAllRoles).toHaveBeenCalledWith(3, 15)
      })
    })

    it('should handle API error response', async () => {
      mockListAllRoles.mockResolvedValue({
        success: false,
        data: { roles: [] },
        pagination: {
          current_page: 1,
          limit: 10,
          total_count: 0,
          total_pages: 0,
          has_next_page: false,
          has_prev_page: false
        },
        message: 'Failed to fetch roles',
        error: 'Server error'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch roles')
        expect(result.current.roles).toEqual([])
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockListAllRoles.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchRoles()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load role data')
        expect(result.current.roles).toEqual([])
        expect(result.current.loading).toBe(false)
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
        title: 'Failed to Load Roles'
      })
    })

    it('should handle invalid page number', async () => {
      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles(NaN, 10)

      await waitFor(() => {
        expect(result.current.error).toBe('Page number must be a valid number')
        expect(result.current.loading).toBe(false)
        expect(mockListAllRoles).not.toHaveBeenCalled()
      })
    })

    it('should clear previous errors on successful fetch', async () => {
      mockListAllRoles.mockResolvedValueOnce({
        success: false,
        data: { roles: [] },
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

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.error).toBe('Error')
      })

      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.error).toBe(null)
        expect(result.current.roles).toEqual(mockRoles)
      })
    })
  })

  describe('fetchRolePermissions Function', () => {
    it('should fetch role permissions successfully', async () => {
      mockListAllRolePermissions.mockResolvedValue({
        success: true,
        data: { permissions: mockRolePermissions },
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRolePermissions()

      await waitFor(() => {
        expect(result.current.rolePermissions).toEqual(mockRolePermissions)
        expect(result.current.permissionsLoading).toBe(false)
        expect(result.current.permissionsError).toBe(null)
      })

      expect(mockListAllRolePermissions).toHaveBeenCalledTimes(1)
    })

    it('should set loading state during permissions fetch', async () => {
      mockListAllRolePermissions.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { permissions: mockRolePermissions },
          message: 'Success'
        }), 50))
      )

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      const promise = result.current.fetchRolePermissions()

      await waitFor(() => {
        expect(result.current.permissionsLoading).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.permissionsLoading).toBe(false)
      })
    })

    it('should handle permissions fetch API error', async () => {
      mockListAllRolePermissions.mockResolvedValue({
        success: false,
        message: 'Failed to fetch permissions',
        error: 'Server error',
        data: { permissions: [] }
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRolePermissions()

      await waitFor(() => {
        expect(result.current.permissionsError).toBe('Failed to fetch permissions')
        expect(result.current.rolePermissions).toEqual([])
        expect(result.current.permissionsLoading).toBe(false)
      })
    })

    it('should handle permissions fetch network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockListAllRolePermissions.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await act(async () => {
        await result.current.fetchRolePermissions()
      })

      await waitFor(() => {
        expect(result.current.permissionsError).toBe('Failed to load role permissions data')
        expect(result.current.rolePermissions).toEqual([])
        expect(result.current.permissionsLoading).toBe(false)
      })

      expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
        title: 'Failed to Load Role Permissions'
      })
    })

    it('should clear previous permissions errors on successful fetch', async () => {
      mockListAllRolePermissions.mockResolvedValueOnce({
        success: false,
        message: 'Error',
        data: { permissions: [] }
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRolePermissions()

      await waitFor(() => {
        expect(result.current.permissionsError).toBe('Error')
      })

      mockListAllRolePermissions.mockResolvedValue({
        success: true,
        data: { permissions: mockRolePermissions },
        message: 'Success'
      })

      await result.current.fetchRolePermissions()

      await waitFor(() => {
        expect(result.current.permissionsError).toBe(null)
        expect(result.current.rolePermissions).toEqual(mockRolePermissions)
      })
    })
  })

  describe('refetch Function', () => {
    it('should refetch with current page and limit', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      /* Fetch roles with specific page and limit */
      await act(async () => {
        await result.current.fetchRoles(2, 20)
      })

      await waitFor(() => {
        expect(mockListAllRoles).toHaveBeenCalledWith(2, 20)
        expect(result.current.loading).toBe(false)
      })

      mockListAllRoles.mockClear()

      /* Refetch should use the same page and limit */
      await act(async () => {
        await result.current.refetch()
      })

      await waitFor(() => {
        expect(mockListAllRoles).toHaveBeenCalledWith(2, 20)
      })
    })

    it('should maintain current page and limit across refetches', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ initialPage: 3, initialLimit: 25 }))

      await waitFor(() => {
        expect(mockListAllRoles).toHaveBeenCalledWith(3, 25)
      })

      mockListAllRoles.mockClear()

      await result.current.refetch()

      await waitFor(() => {
        expect(mockListAllRoles).toHaveBeenCalledWith(3, 25)
      })
    })
  })

  describe('roleOptions', () => {
    it('should include "All Roles" option by default', () => {
      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      expect(result.current.roleOptions).toEqual([
        { label: 'All Roles', value: 'all' }
      ])
    })

    it('should transform roles to options with "All Roles" prefix', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roleOptions).toEqual([
          { label: 'All Roles', value: 'all' },
          { label: 'Admin', value: '1' },
          { label: 'Manager', value: '2' },
          { label: 'Viewer', value: '3' }
        ])
      })
    })

    it('should update options when roles change', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: [mockRoles[0]] },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roleOptions).toEqual([
          { label: 'All Roles', value: 'all' },
          { label: 'Admin', value: '1' }
        ])
      })

      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roleOptions).toHaveLength(4)
      })
    })
  })

  describe('roleSelectOptions', () => {
    it('should return empty array when no roles', () => {
      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      expect(result.current.roleSelectOptions).toEqual([])
    })

    it('should transform roles to select options without "All Roles"', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roleSelectOptions).toEqual([
          { label: 'Admin', value: '1' },
          { label: 'Manager', value: '2' },
          { label: 'Viewer', value: '3' }
        ])
      })
    })

    it('should update select options when roles change', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: [mockRoles[0]] },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roleSelectOptions).toEqual([
          { label: 'Admin', value: '1' }
        ])
      })

      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roleSelectOptions).toEqual([
          { label: 'Admin', value: '1' },
          { label: 'Manager', value: '2' },
          { label: 'Viewer', value: '3' }
        ])
      })
    })
  })

  describe('Auto-fetch', () => {
    it('should auto-fetch on mount when autoFetch is true', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useRoles({ autoFetch: true }))

      await waitFor(() => {
        expect(mockListAllRoles).toHaveBeenCalledTimes(1)
      })
    })

    it('should not auto-fetch when autoFetch is false', () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      renderHook(() => useRoles({ autoFetch: false }))

      expect(mockListAllRoles).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty roles array', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: [] },
        pagination: {
          ...mockPagination,
          total_count: 0,
          total_pages: 0
        },
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roles).toEqual([])
        expect(result.current.roleOptions).toEqual([{ label: 'All Roles', value: 'all' }])
        expect(result.current.roleSelectOptions).toEqual([])
        expect(result.current.error).toBe(null)
      })
    })

    it('should handle pagination correctly', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.pagination).toEqual(mockPagination)
        expect(result.current.roles).toEqual(mockRoles)
      })
    })

    it('should handle concurrent fetch calls', async () => {
      mockListAllRoles.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { roles: mockRoles },
          pagination: mockPagination,
          message: 'Success'
        }), 50))
      )

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      result.current.fetchRoles(1, 10)
      result.current.fetchRoles(2, 10)
      result.current.fetchRoles(3, 10)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 200 })

      /* Last call should win */
      expect(mockListAllRoles).toHaveBeenCalledWith(3, 10)
    })
  })

  describe('State Updates', () => {
    it('should update all state correctly on successful fetch', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles(2, 15)

      await waitFor(() => {
        expect(result.current.roles).toEqual(mockRoles)
        expect(result.current.pagination).toEqual(mockPagination)
        expect(result.current.lastUpdated).toBe('2024-01-01T00:00:00.000Z')
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
        expect(result.current.roleSelectOptions).toHaveLength(3)
      })
    })

    it('should reset roles on error', async () => {
      mockListAllRoles.mockResolvedValue({
        success: true,
        data: { roles: mockRoles },
        pagination: mockPagination,
        message: 'Success'
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roles).toEqual(mockRoles)
      })

      const mockError = new Error('Network error') as AxiosError
      mockListAllRoles.mockRejectedValue(mockError)

      await result.current.fetchRoles()

      await waitFor(() => {
        expect(result.current.roles).toEqual([])
        expect(result.current.error).toBe('Failed to load role data')
      })
    })

    it('should maintain independent state for roles and permissions', async () => {
      mockListAllRoles.mockResolvedValue({
        success: false,
        message: 'Roles error',
        data: { roles: [] },
        pagination: {
          current_page: 1,
          limit: 10,
          total_count: 0,
          total_pages: 0,
          has_next_page: false,
          has_prev_page: false
        }
      })

      mockListAllRolePermissions.mockResolvedValue({
        success: false,
        message: 'Permissions error',
        data: { permissions: [] }
      })

      const { result } = renderHook(() => useRoles({ autoFetch: false }))

      await result.current.fetchRoles()
      await result.current.fetchRolePermissions()

      await waitFor(() => {
        expect(result.current.error).toBe('Roles error')
        expect(result.current.permissionsError).toBe('Permissions error')
      })
    })
  })
})
