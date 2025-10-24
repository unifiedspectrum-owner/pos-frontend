/* Comprehensive test suite for useRoleOperations hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'
import * as notificationUtils from '@shared/utils/ui/notifications'
import * as sharedConfig from '@shared/config'

/* Role module imports */
import { useRoleOperations } from '@role-management/hooks/use-role-operations'
import { roleManagementService } from '@role-management/api'
import { Role, RolePermission, RoleCreationRequest, RoleUpdateRequest } from '@role-management/types'

/* Mock dependencies */
vi.mock('@role-management/api', () => ({
  roleManagementService: {
    createRole: vi.fn(),
    getRoleDetails: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn()
  }
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@shared/config', async () => {
  const actual = await vi.importActual('@shared/config')
  return {
    ...actual,
    LOADING_DELAY_ENABLED: false,
    LOADING_DELAY: 0
  }
})

describe('useRoleOperations Hook', () => {
  /* Mock data */
  const mockRole: Role = {
    id: 1,
    name: 'Admin',
    description: 'Administrator role with full access',
    display_order: 1,
    user_count: 5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }

  const mockPermissions: RolePermission[] = [
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

  const mockRoleCreationData: RoleCreationRequest = {
    name: 'Manager',
    description: 'Manager role with limited access',
    is_active: true,
    module_assignments: [
      {
        module_id: '1',
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false
      }
    ]
  }

  const mockRoleUpdateData: RoleUpdateRequest = {
    name: 'Updated Manager',
    description: 'Updated description'
  }

  /* Mock service functions */
  const mockCreateRole = vi.mocked(roleManagementService.createRole)
  const mockGetRoleDetails = vi.mocked(roleManagementService.getRoleDetails)
  const mockUpdateRole = vi.mocked(roleManagementService.updateRole)
  const mockDeleteRole = vi.mocked(roleManagementService.deleteRole)
  const mockHandleApiError = vi.mocked(sharedUtils.handleApiError)
  const mockCreateToastNotification = vi.mocked(notificationUtils.createToastNotification)

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
      const { result } = renderHook(() => useRoleOperations())

      expect(result.current.isCreating).toBe(false)
      expect(result.current.createError).toBe(null)
      expect(result.current.isFetching).toBe(false)
      expect(result.current.fetchError).toBe(null)
      expect(result.current.isUpdating).toBe(false)
      expect(result.current.updateError).toBe(null)
      expect(result.current.isDeleting).toBe(false)
      expect(result.current.deleteError).toBe(null)
    })

    it('should have all required functions', () => {
      const { result } = renderHook(() => useRoleOperations())

      expect(typeof result.current.createRole).toBe('function')
      expect(typeof result.current.fetchRoleDetails).toBe('function')
      expect(typeof result.current.updateRole).toBe('function')
      expect(typeof result.current.deleteRole).toBe('function')
    })
  })

  describe('createRole Function', () => {
    it('should create role successfully', async () => {
      mockCreateRole.mockResolvedValue({
        success: true,
        data: { roleId: '123' },
        message: 'Role created successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.createRole(mockRoleCreationData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isCreating).toBe(false)
        expect(result.current.createError).toBe(null)
      })

      expect(mockCreateRole).toHaveBeenCalledWith(mockRoleCreationData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Role Created Successfully',
        description: 'Role created successfully'
      })
    })

    it('should set loading state during creation', async () => {
      mockCreateRole.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { roleId: '123' },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => useRoleOperations())

      const promise = result.current.createRole(mockRoleCreationData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })

    it('should handle create API error', async () => {
      mockCreateRole.mockResolvedValue({
        success: false,
        message: 'Role name already exists',
        error: 'Duplicate role name',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.createRole(mockRoleCreationData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Duplicate role name')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Creation Failed',
        description: 'Duplicate role name'
      })
    })

    it('should handle create network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockCreateRole.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.createRole(mockRoleCreationData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Failed to create role')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Create Role'
        })
      })
    })

    it('should clear previous create errors on new creation', async () => {
      mockCreateRole.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      await result.current.createRole(mockRoleCreationData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Error 1')
      })

      mockCreateRole.mockResolvedValue({
        success: true,
        data: { roleId: '123' },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.createRole(mockRoleCreationData)

      await waitFor(() => {
        expect(result.current.createError).toBe(null)
      })
    })

    it('should handle missing message in success response', async () => {
      mockCreateRole.mockResolvedValue({
        success: true,
        data: { roleId: '123' },
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      await result.current.createRole(mockRoleCreationData)

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Role Created Successfully',
          description: 'The role has been successfully created.'
        })
      })
    })

    it('should handle missing error in failure response', async () => {
      mockCreateRole.mockResolvedValue({
        success: false,
        message: 'Failed to create',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      await result.current.createRole(mockRoleCreationData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Failed to create')
      })
    })
  })

  describe('fetchRoleDetails Function', () => {
    it('should fetch role details successfully', async () => {
      mockGetRoleDetails.mockResolvedValue({
        success: true,
        data: {
          role: mockRole,
          permissions: mockPermissions
        },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const details = await result.current.fetchRoleDetails('1')

      await waitFor(() => {
        expect(details).toEqual({
          role: mockRole,
          permissions: mockPermissions
        })
        expect(result.current.isFetching).toBe(false)
        expect(result.current.fetchError).toBe(null)
      })

      expect(mockGetRoleDetails).toHaveBeenCalledWith('1')
    })

    it('should set loading state during fetch', async () => {
      mockGetRoleDetails.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {
            role: mockRole,
            permissions: mockPermissions
          },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => useRoleOperations())

      const promise = result.current.fetchRoleDetails('1')

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
    })

    it('should handle fetch API error', async () => {
      mockGetRoleDetails.mockResolvedValue({
        success: false,
        message: 'Role not found',
        error: 'Not found',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const details = await result.current.fetchRoleDetails('999')

      await waitFor(() => {
        expect(details).toBe(null)
        expect(result.current.fetchError).toBe('Not found')
      })
    })

    it('should handle fetch network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetRoleDetails.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRoleOperations())

      const details = await result.current.fetchRoleDetails('1')

      await waitFor(() => {
        expect(details).toBe(null)
        expect(result.current.fetchError).toBe('Failed to fetch role details')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Fetch Role Details'
        })
      })
    })

    it('should clear previous fetch errors on new fetch', async () => {
      mockGetRoleDetails.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      await result.current.fetchRoleDetails('1')

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Error 1')
      })

      mockGetRoleDetails.mockResolvedValue({
        success: true,
        data: {
          role: mockRole,
          permissions: mockPermissions
        },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.fetchRoleDetails('1')

      await waitFor(() => {
        expect(result.current.fetchError).toBe(null)
      })
    })

    it('should handle missing data in response', async () => {
      mockGetRoleDetails.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const details = await result.current.fetchRoleDetails('1')

      await waitFor(() => {
        expect(details).toBe(null)
      })
    })

    it('should handle empty permissions array', async () => {
      mockGetRoleDetails.mockResolvedValue({
        success: true,
        data: {
          role: mockRole,
          permissions: []
        },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const details = await result.current.fetchRoleDetails('1')

      await waitFor(() => {
        expect(details?.permissions).toEqual([])
      })
    })
  })

  describe('updateRole Function', () => {
    it('should update role successfully', async () => {
      mockUpdateRole.mockResolvedValue({
        success: true,
        message: 'Role updated successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.updateRole('1', mockRoleUpdateData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isUpdating).toBe(false)
        expect(result.current.updateError).toBe(null)
      })

      expect(mockUpdateRole).toHaveBeenCalledWith('1', mockRoleUpdateData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Role Updated Successfully',
        description: 'Role updated successfully'
      })
    })

    it('should set loading state during update', async () => {
      mockUpdateRole.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => useRoleOperations())

      const promise = result.current.updateRole('1', mockRoleUpdateData)

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })
    })

    it('should handle update API error', async () => {
      mockUpdateRole.mockResolvedValue({
        success: false,
        message: 'Role not found',
        error: 'Not found',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.updateRole('999', mockRoleUpdateData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.updateError).toBe('Not found')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Update Failed',
        description: 'Not found'
      })
    })

    it('should handle update network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockUpdateRole.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.updateRole('1', mockRoleUpdateData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.updateError).toBe('Failed to update role')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Update Role'
        })
      })
    })

    it('should clear previous update errors on new update', async () => {
      mockUpdateRole.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      await result.current.updateRole('1', mockRoleUpdateData)

      await waitFor(() => {
        expect(result.current.updateError).toBe('Error 1')
      })

      mockUpdateRole.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.updateRole('1', mockRoleUpdateData)

      await waitFor(() => {
        expect(result.current.updateError).toBe(null)
      })
    })

    it('should handle missing message in success response', async () => {
      mockUpdateRole.mockResolvedValue({
        success: true,
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      await result.current.updateRole('1', mockRoleUpdateData)

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Role Updated Successfully',
          description: 'The role has been successfully updated.'
        })
      })
    })
  })

  describe('deleteRole Function', () => {
    it('should delete role successfully', async () => {
      mockDeleteRole.mockResolvedValue({
        success: true,
        message: 'Role deleted successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.deleteRole('1', 'Admin')

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isDeleting).toBe(false)
        expect(result.current.deleteError).toBe(null)
      })

      expect(mockDeleteRole).toHaveBeenCalledWith('1')
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Role Deleted Successfully',
        description: 'Role deleted successfully'
      })
    })

    it('should delete role without roleName', async () => {
      mockDeleteRole.mockResolvedValue({
        success: true,
        message: 'Role deleted',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.deleteRole('1')

      await waitFor(() => {
        expect(success).toBe(true)
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Role Deleted Successfully',
        description: 'Role deleted'
      })
    })

    it('should use default message when roleName provided but no message in response', async () => {
      mockDeleteRole.mockResolvedValue({
        success: true,
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      await result.current.deleteRole('1', 'Admin')

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'Role Deleted Successfully',
          description: "The role 'Admin' has been successfully deleted."
        })
      })
    })

    it('should set loading state during deletion', async () => {
      mockDeleteRole.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => useRoleOperations())

      const promise = result.current.deleteRole('1')

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false)
      })
    })

    it('should handle delete API error', async () => {
      mockDeleteRole.mockResolvedValue({
        success: false,
        message: 'Cannot delete role with active users',
        error: 'Active users exist',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.deleteRole('1')

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.deleteError).toBe('Active users exist')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Deletion Failed',
        description: 'Active users exist'
      })
    })

    it('should handle delete network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockDeleteRole.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRoleOperations())

      const success = await result.current.deleteRole('1')

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.deleteError).toBe('Failed to delete role')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Delete Role'
        })
      })
    })

    it('should clear previous delete errors on new deletion', async () => {
      mockDeleteRole.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      await result.current.deleteRole('1')

      await waitFor(() => {
        expect(result.current.deleteError).toBe('Error 1')
      })

      mockDeleteRole.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.deleteRole('1')

      await waitFor(() => {
        expect(result.current.deleteError).toBe(null)
      })
    })
  })

  describe('State Independence', () => {
    it('should maintain independent state for create, fetch, update, and delete operations', async () => {
      mockCreateRole.mockResolvedValue({
        success: false,
        message: 'Create error',
        timestamp: '2024-01-01T00:00:00Z'
      })
      mockGetRoleDetails.mockResolvedValue({
        success: false,
        message: 'Fetch error',
        timestamp: '2024-01-01T00:00:00Z'
      })
      mockUpdateRole.mockResolvedValue({
        success: false,
        message: 'Update error',
        timestamp: '2024-01-01T00:00:00Z'
      })
      mockDeleteRole.mockResolvedValue({
        success: false,
        message: 'Delete error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      await result.current.createRole(mockRoleCreationData)
      await result.current.fetchRoleDetails('1')
      await result.current.updateRole('1', mockRoleUpdateData)
      await result.current.deleteRole('1')

      await waitFor(() => {
        expect(result.current.createError).toBe('Create error')
        expect(result.current.fetchError).toBe('Fetch error')
        expect(result.current.updateError).toBe('Update error')
        expect(result.current.deleteError).toBe('Delete error')
      })
    })

    it('should not interfere with other operations when one is in progress', async () => {
      mockCreateRole.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 200))
      )

      mockGetRoleDetails.mockResolvedValue({
        success: true,
        data: {
          role: mockRole,
          permissions: mockPermissions
        },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useRoleOperations())

      const createPromise = result.current.createRole(mockRoleCreationData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await result.current.fetchRoleDetails('1')

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })

      /* Create should still be in progress */
      expect(result.current.isCreating).toBe(true)

      await createPromise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })
  })
})
