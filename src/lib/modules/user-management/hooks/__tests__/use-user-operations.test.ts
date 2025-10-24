/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'
import * as notificationUtils from '@shared/utils/ui/notifications'
import * as sharedConfig from '@shared/config'

/* User module imports */
import { useUserOperations } from '@user-management/hooks/use-user-operations'
import { userManagementService } from '@user-management/api'
import { UserAccountDetails, UserAccountStatistics, UserPermissions, UserCreationApiRequest, UserUpdationApiRequest } from '@user-management/types'

/* Mock dependencies */
vi.mock('@user-management/api', () => ({
  userManagementService: {
    getUserBasicDetails: vi.fn(),
    getUserDetails: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
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

describe('useUserOperations Hook', () => {
  /* Mock data */
  const mockUserDetails: UserAccountDetails = {
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
  }

  const mockUserStatistics: UserAccountStatistics = {
    total_logins: 100,
    successful_logins: 95,
    failed_logins: 5,
    consecutive_failed_attempts: 0,
    first_login_at: '2024-01-01T00:00:00Z',
    last_successful_login_at: '2024-01-15T10:30:00Z',
    last_failed_login_at: null,
    last_login_ip: '192.168.1.1',
    active_sessions: 2,
    max_concurrent_sessions: 5,
    password_changes_count: 3,
    account_lockouts_count: 0,
    last_lockout_at: null,
    last_user_agent: 'Mozilla/5.0',
    last_device_fingerprint: 'device123'
  }

  const mockPermissions: UserPermissions[] = [
    {
      module_id: 1,
      module_name: 'Users',
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: false,
      permission_expires_at: null
    }
  ]

  const mockUserCreationData: UserCreationApiRequest = {
    f_name: 'Jane',
    l_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+10987654321',
    role_id: 2,
    is_active: true,
    is_2fa_required: false
  }

  const mockUserUpdationData: UserUpdationApiRequest = {
    f_name: 'Jane',
    l_name: 'Smith Updated',
    phone: '+10987654321'
  }

  /* Mock service functions */
  const mockGetUserBasicDetails = vi.mocked(userManagementService.getUserBasicDetails)
  const mockGetUserDetails = vi.mocked(userManagementService.getUserDetails)
  const mockCreateUser = vi.mocked(userManagementService.createUser)
  const mockUpdateUser = vi.mocked(userManagementService.updateUser)
  const mockDeleteUser = vi.mocked(userManagementService.deleteUser)
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
      const { result } = renderHook(() => useUserOperations())

      expect(result.current.userDetails).toBe(null)
      expect(result.current.userStatistics).toBe(null)
      expect(result.current.permissions).toEqual([])
      expect(result.current.isFetching).toBe(false)
      expect(result.current.fetchError).toBe(null)
      expect(result.current.isCreating).toBe(false)
      expect(result.current.createError).toBe(null)
      expect(result.current.isUpdating).toBe(false)
      expect(result.current.updateError).toBe(null)
      expect(result.current.isDeleting).toBe(false)
      expect(result.current.deleteError).toBe(null)
    })
  })

  describe('fetchUserDetails Function', () => {
    describe('Basic Details Fetch', () => {
      it('should fetch user basic details successfully', async () => {
        mockGetUserBasicDetails.mockResolvedValue({
          success: true,
          data: { user_details: mockUserDetails },
          message: 'Success'
        })

        const { result } = renderHook(() => useUserOperations())

        const success = await result.current.fetchUserDetails('1', true)

        await waitFor(() => {
          expect(success).toBe(true)
          expect(result.current.userDetails).toEqual(mockUserDetails)
          expect(result.current.userStatistics).toBe(null)
          expect(result.current.permissions).toEqual([])
          expect(result.current.isFetching).toBe(false)
          expect(result.current.fetchError).toBe(null)
        })

        expect(mockGetUserBasicDetails).toHaveBeenCalledWith('1')
      })

      it('should set loading state during basic fetch', async () => {
        mockGetUserBasicDetails.mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve({
            success: true,
            data: { user_details: mockUserDetails },
            message: 'Success'
          }), 50))
        )

        const { result } = renderHook(() => useUserOperations())

        const promise = result.current.fetchUserDetails('1', true)

        await waitFor(() => {
          expect(result.current.isFetching).toBe(true)
        })

        await promise

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false)
        })
      })

      it('should handle basic fetch API error', async () => {
        mockGetUserBasicDetails.mockResolvedValue({
          success: false,
          message: 'User not found',
          error: 'Not found',
          data: {
            user_details: {} as UserAccountDetails
          }
        })

        const { result } = renderHook(() => useUserOperations())

        const success = await result.current.fetchUserDetails('999', true)

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.fetchError).toBe('Not found')
          expect(result.current.isFetching).toBe(false)
        })
      })

      it('should handle basic fetch network error', async () => {
        const mockError = new Error('Network error') as AxiosError
        mockGetUserBasicDetails.mockRejectedValue(mockError)

        const { result } = renderHook(() => useUserOperations())

        const success = await result.current.fetchUserDetails('1', true)

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.fetchError).toBe('Failed to fetch user basic details')
          expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
            title: 'Failed to Fetch User Basic Details'
          })
        })
      })
    })

    describe('Full Details Fetch', () => {
      it('should fetch full user details successfully', async () => {
        mockGetUserDetails.mockResolvedValue({
          success: true,
          data: {
            user_details: mockUserDetails,
            user_statistics: mockUserStatistics,
            permissions: mockPermissions
          },
          message: 'Success'
        })

        const { result } = renderHook(() => useUserOperations())

        const success = await result.current.fetchUserDetails('1', false)

        await waitFor(() => {
          expect(success).toBe(true)
          expect(result.current.userDetails).toEqual(mockUserDetails)
          expect(result.current.userStatistics).toEqual(mockUserStatistics)
          expect(result.current.permissions).toEqual(mockPermissions)
          expect(result.current.isFetching).toBe(false)
          expect(result.current.fetchError).toBe(null)
        })

        expect(mockGetUserDetails).toHaveBeenCalledWith('1')
      })

      it('should fetch full details by default when basicOnly not specified', async () => {
        mockGetUserDetails.mockResolvedValue({
          success: true,
          data: {
            user_details: mockUserDetails,
            user_statistics: mockUserStatistics,
            permissions: mockPermissions
          },
          message: 'Success'
        })

        const { result } = renderHook(() => useUserOperations())

        await result.current.fetchUserDetails('1')

        await waitFor(() => {
          expect(mockGetUserDetails).toHaveBeenCalledWith('1')
          expect(result.current.userStatistics).toEqual(mockUserStatistics)
        })
      })

      it('should handle full fetch API error', async () => {
        mockGetUserDetails.mockResolvedValue({
          success: false,
          message: 'Unauthorized',
          error: 'Access denied',
          data: {
            user_details: {} as UserAccountDetails,
            user_statistics: {} as UserAccountStatistics,
            permissions: []
          }
        })

        const { result } = renderHook(() => useUserOperations())

        const success = await result.current.fetchUserDetails('1', false)

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.fetchError).toBe('Access denied')
        })
      })

      it('should handle full fetch network error', async () => {
        const mockError = new Error('Network error') as AxiosError
        mockGetUserDetails.mockRejectedValue(mockError)

        const { result } = renderHook(() => useUserOperations())

        const success = await result.current.fetchUserDetails('1', false)

        await waitFor(() => {
          expect(success).toBe(false)
          expect(result.current.fetchError).toBe('Failed to fetch user details')
          expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
            title: 'Failed to Fetch User Details'
          })
        })
      })

      it('should handle missing permissions in response', async () => {
        mockGetUserDetails.mockResolvedValue({
          success: true,
          data: {
            user_details: mockUserDetails,
            user_statistics: mockUserStatistics,
            permissions: []
          },
          message: 'Success'
        })

        const { result } = renderHook(() => useUserOperations())

        await result.current.fetchUserDetails('1', false)

        await waitFor(() => {
          expect(result.current.permissions).toEqual([])
        })
      })
    })

    describe('Fetch State Management', () => {
      it('should clear previous fetch errors on new fetch', async () => {
        mockGetUserDetails.mockResolvedValueOnce({
          success: false,
          message: 'Error 1'
        })

        const { result } = renderHook(() => useUserOperations())

        await result.current.fetchUserDetails('1')

        await waitFor(() => {
          expect(result.current.fetchError).toBe('Error 1')
        })

        mockGetUserDetails.mockResolvedValue({
          success: true,
          data: {
            user_details: mockUserDetails,
            user_statistics: mockUserStatistics,
            permissions: mockPermissions
          },
          message: 'Success'
        })

        await result.current.fetchUserDetails('1')

        await waitFor(() => {
          expect(result.current.fetchError).toBe(null)
        })
      })
    })
  })

  describe('createUser Function', () => {
    it('should create user successfully', async () => {
      mockCreateUser.mockResolvedValue({
        success: true,
        data: { userId: '123' },
        message: 'User created successfully',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.createUser(mockUserCreationData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isCreating).toBe(false)
        expect(result.current.createError).toBe(null)
      })

      expect(mockCreateUser).toHaveBeenCalledWith(mockUserCreationData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'User Created Successfully',
        description: 'User created successfully'
      })
    })

    it('should set loading state during creation', async () => {
      mockCreateUser.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { userId: '123' },
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => useUserOperations())

      const promise = result.current.createUser(mockUserCreationData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false)
      })
    })

    it('should handle create API error', async () => {
      mockCreateUser.mockResolvedValue({
        success: false,
        message: 'Email already exists',
        error: 'Duplicate email',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.createUser(mockUserCreationData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Duplicate email')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Creation Failed',
        description: 'Duplicate email'
      })
    })

    it('should handle create network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockCreateUser.mockRejectedValue(mockError)

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.createUser(mockUserCreationData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.createError).toBe('Failed to create user')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Create User'
        })
      })
    })

    it('should clear previous create errors on new creation', async () => {
      mockCreateUser.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useUserOperations())

      await result.current.createUser(mockUserCreationData)

      await waitFor(() => {
        expect(result.current.createError).toBe('Error 1')
      })

      mockCreateUser.mockResolvedValue({
        success: true,
        data: { userId: '123' },
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.createUser(mockUserCreationData)

      await waitFor(() => {
        expect(result.current.createError).toBe(null)
      })
    })
  })

  describe('updateUser Function', () => {
    it('should update user successfully', async () => {
      mockUpdateUser.mockResolvedValue({
        success: true,
        message: 'User updated successfully'
      })

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.updateUser('1', mockUserUpdationData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isUpdating).toBe(false)
        expect(result.current.updateError).toBe(null)
      })

      expect(mockUpdateUser).toHaveBeenCalledWith('1', mockUserUpdationData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'User Updated Successfully',
        description: 'User updated successfully'
      })
    })

    it('should set loading state during update', async () => {
      mockUpdateUser.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success'
        }), 50))
      )

      const { result } = renderHook(() => useUserOperations())

      const promise = result.current.updateUser('1', mockUserUpdationData)

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })
    })

    it('should handle update API error', async () => {
      mockUpdateUser.mockResolvedValue({
        success: false,
        message: 'User not found',
        error: 'Not found'
      })

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.updateUser('999', mockUserUpdationData)

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
      mockUpdateUser.mockRejectedValue(mockError)

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.updateUser('1', mockUserUpdationData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.updateError).toBe('Failed to update user')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Update User'
        })
      })
    })

    it('should clear previous update errors on new update', async () => {
      mockUpdateUser.mockResolvedValueOnce({
        success: false,
        message: 'Error 1'
      })

      const { result } = renderHook(() => useUserOperations())

      await result.current.updateUser('1', mockUserUpdationData)

      await waitFor(() => {
        expect(result.current.updateError).toBe('Error 1')
      })

      mockUpdateUser.mockResolvedValue({
        success: true,
        message: 'Success'
      })

      await result.current.updateUser('1', mockUserUpdationData)

      await waitFor(() => {
        expect(result.current.updateError).toBe(null)
      })
    })
  })

  describe('deleteUser Function', () => {
    it('should delete user successfully', async () => {
      mockDeleteUser.mockResolvedValue({
        success: true,
        message: 'User deleted successfully',
        data: {
          deletedUserId: 1,
          deletedByUserId: 2,
          deletedAt: '2024-01-01T00:00:00Z',
          cleanupSummary: {
            userAccount: 'Deleted',
            sessions: '2 sessions removed',
            permissions: 'All permissions removed',
            twoFactorAuth: '2FA disabled',
            resetTokens: 'All tokens revoked'
          }
        },
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.deleteUser('1', 'John Doe')

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isDeleting).toBe(false)
        expect(result.current.deleteError).toBe(null)
      })

      expect(mockDeleteUser).toHaveBeenCalledWith('1')
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'User Deleted Successfully',
        description: 'User deleted successfully'
      })
    })

    it('should delete user without userName', async () => {
      mockDeleteUser.mockResolvedValue({
        success: true,
        message: 'User deleted',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.deleteUser('1')

      await waitFor(() => {
        expect(success).toBe(true)
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'User Deleted Successfully',
        description: 'User deleted'
      })
    })

    it('should use default message when userName provided but no message in response', async () => {
      mockDeleteUser.mockResolvedValue({
        success: true,
        message: '',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useUserOperations())

      await result.current.deleteUser('1', 'John Doe')

      await waitFor(() => {
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'success',
          title: 'User Deleted Successfully',
          description: "The user 'John Doe' has been successfully deleted."
        })
      })
    })

    it('should set loading state during deletion', async () => {
      mockDeleteUser.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 50))
      )

      const { result } = renderHook(() => useUserOperations())

      const promise = result.current.deleteUser('1')

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false)
      })
    })

    it('should handle delete API error', async () => {
      mockDeleteUser.mockResolvedValue({
        success: false,
        message: 'Cannot delete user with active sessions',
        error: 'Active sessions exist',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.deleteUser('1')

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.deleteError).toBe('Active sessions exist')
      })

      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Deletion Failed',
        description: 'Active sessions exist'
      })
    })

    it('should handle delete network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockDeleteUser.mockRejectedValue(mockError)

      const { result } = renderHook(() => useUserOperations())

      const success = await result.current.deleteUser('1')

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.deleteError).toBe('Failed to delete user')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to Delete User'
        })
      })
    })

    it('should clear previous delete errors on new deletion', async () => {
      mockDeleteUser.mockResolvedValueOnce({
        success: false,
        message: 'Error 1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useUserOperations())

      await result.current.deleteUser('1')

      await waitFor(() => {
        expect(result.current.deleteError).toBe('Error 1')
      })

      mockDeleteUser.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: '2024-01-01T00:00:00Z'
      })

      await result.current.deleteUser('1')

      await waitFor(() => {
        expect(result.current.deleteError).toBe(null)
      })
    })
  })

  describe('State Independence', () => {
    it('should maintain independent state for fetch, create, update, and delete operations', async () => {
      mockGetUserDetails.mockResolvedValue({
        success: false,
        message: 'Fetch error',
        data: {
          user_details: {} as UserAccountDetails,
          user_statistics: {} as UserAccountStatistics,
          permissions: []
        }
      })
      mockCreateUser.mockResolvedValue({
        success: false,
        message: 'Create error',
        timestamp: '2024-01-01T00:00:00Z'
      })
      mockUpdateUser.mockResolvedValue({
        success: false,
        message: 'Update error',
        data: {
          userId: 0
        }
      })
      mockDeleteUser.mockResolvedValue({
        success: false,
        message: 'Delete error',
        timestamp: '2024-01-01T00:00:00Z'
      })

      const { result } = renderHook(() => useUserOperations())

      await result.current.fetchUserDetails('1')
      await result.current.createUser(mockUserCreationData)
      await result.current.updateUser('1', mockUserUpdationData)
      await result.current.deleteUser('1')

      await waitFor(() => {
        expect(result.current.fetchError).toBe('Fetch error')
        expect(result.current.createError).toBe('Create error')
        expect(result.current.updateError).toBe('Update error')
        expect(result.current.deleteError).toBe('Delete error')
      })
    })

    it('should not interfere with other operations when one is in progress', async () => {
      mockCreateUser.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          timestamp: '2024-01-01T00:00:00Z'
        }), 200))
      )

      mockGetUserDetails.mockResolvedValue({
        success: true,
        data: {
          user_details: mockUserDetails,
          user_statistics: mockUserStatistics,
          permissions: mockPermissions
        },
        message: 'Success'
      })

      const { result } = renderHook(() => useUserOperations())

      const createPromise = result.current.createUser(mockUserCreationData)

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true)
      })

      await result.current.fetchUserDetails('1')

      await waitFor(() => {
        expect(result.current.userDetails).toEqual(mockUserDetails)
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
