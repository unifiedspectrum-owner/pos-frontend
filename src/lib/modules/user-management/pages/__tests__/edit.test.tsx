/* Libraries imports */
import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* User module imports */
import EditUserPage from '@user-management/pages/edit'
import * as useUserOperationsHook from '@user-management/hooks/use-user-operations'
import * as buildPayloadUtil from '@user-management/utils'
import { UserAccountDetails } from '@user-management/types'

/* Role module imports */
import * as useRolesHook from '@role-management/hooks/use-roles'
import * as useModulesHook from '@role-management/hooks/use-modules'

/* Shared module imports */
import * as phoneUtil from '@shared/utils/formatting/phone'
import * as notificationUtil from '@shared/utils/ui/notifications'

/* Mock next/navigation */
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn()
  })
}))

/* Mock UserFormLayout component */
vi.mock('@user-management/forms/layout', () => ({
  default: vi.fn(({ title, isLoading, error, onRetry, methods, onSubmit, onCancel, isSubmitting, submitText, loadingText, showTwoFactorField }) => {
    /* Show error if there's an error (takes priority over loading) */
    if (error) {
      return (
        <div data-testid="error-container">
          <div data-testid="error-message">{error}</div>
          {onRetry && <button onClick={onRetry} data-testid="retry-button">Retry</button>}
        </div>
      )
    }

    /* Show loading state if isLoading is true and no error */
    if (isLoading) {
      return <div data-testid="loading">Loading...</div>
    }

    return (
      <div data-testid="user-form-layout">
        <h1>{title}</h1>
        <div data-testid="form-submitting">{isSubmitting ? 'true' : 'false'}</div>
        <div data-testid="submit-text">{submitText || 'Create User'}</div>
        <div data-testid="loading-text">{loadingText || 'Creating User...'}</div>
        <div data-testid="show-2fa">{showTwoFactorField ? 'true' : 'false'}</div>
        <button onClick={() => onSubmit(methods.getValues(), undefined)} data-testid="submit-button">
          Submit
        </button>
        <button onClick={onCancel} data-testid="cancel-button">
          Cancel
        </button>
      </div>
    )
  })
}))

describe('EditUserPage', () => {
  const mockUpdateUser = vi.fn()
  const mockFetchUserDetails = vi.fn()
  const mockFetchRolePermissions = vi.fn()
  const mockFetchModules = vi.fn()
  let mockBuildUpdateUserPayload: MockInstance
  let mockGetChangedFields: MockInstance
  let mockMergeRoleAndUserPermissions: MockInstance
  let mockConvertPermissionsToModuleAssignments: MockInstance
  let mockParsePhoneFromAPI: MockInstance
  let mockCreateToastNotification: MockInstance

  const mockUserDetails: UserAccountDetails = {
    id: 123,
    f_name: 'John',
    l_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+11234567890',
    profile_image_url: null,
    phone_verified: true,
    email_verified: true,
    email_verified_at: '2024-01-01T00:00:00Z',
    phone_verified_at: '2024-01-01T00:00:00Z',
    is_active: true,
    is_2fa_enabled: true,
    is_2fa_required: true,
    user_status: 'active',
    account_locked_until: null,
    role_details: {
      id: 1,
      name: 'Admin',
      description: 'Administrator role',
      display_order: 1,
      user_count: 5,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    last_password_change: '2024-01-01T00:00:00Z',
    user_created_at: '2024-01-01T00:00:00Z',
    user_updated_at: '2024-01-01T00:00:00Z'
  }

  const mockPermissions = [
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

  const mockRolePermissions = [
    {
      id: 1,
      role_id: 1,
      module_id: 1,
      can_create: 1,
      can_read: 1,
      can_update: 1,
      can_delete: 0,
      display_order: 1
    }
  ]

  const mockModules = [
    {
      id: 1,
      name: 'Users',
      description: 'User Management',
      display_order: 1,
      is_active: true
    }
  ]

  const defaultHookReturn = {
    createUser: vi.fn(),
    isCreating: false,
    createError: null,
    updateUser: mockUpdateUser,
    isUpdating: false,
    updateError: null,
    deleteUser: vi.fn(),
    isDeleting: false,
    deleteError: null,
    fetchUserDetails: mockFetchUserDetails,
    fetchUserBasicDetails: vi.fn(),
    userDetails: mockUserDetails,
    userStatistics: null,
    permissions: mockPermissions,
    isFetching: false,
    fetchError: null
  }

  const defaultRolesHookReturn = {
    roles: [],
    roleSelectOptions: [],
    roleOptions: [],
    loading: false,
    error: null,
    lastUpdated: '2024-01-01T00:00:00Z',
    rolePermissions: mockRolePermissions,
    permissionsLoading: false,
    permissionsError: null,
    fetchRolePermissions: mockFetchRolePermissions,
    fetchRoles: vi.fn(),
    refetch: vi.fn()
  }

  const defaultModulesHookReturn = {
    modules: mockModules,
    isLoading: false,
    error: null,
    isCached: false,
    fetchModules: mockFetchModules
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue(defaultHookReturn)
    vi.spyOn(useRolesHook, 'useRoles').mockReturnValue(defaultRolesHookReturn)
    vi.spyOn(useModulesHook, 'useModules').mockReturnValue(defaultModulesHookReturn)
    mockBuildUpdateUserPayload = vi.spyOn(buildPayloadUtil, 'buildUpdateUserPayload').mockReturnValue({})
    mockGetChangedFields = vi.spyOn(buildPayloadUtil, 'getChangedFields').mockReturnValue({ f_name: 'Jane' })
    mockMergeRoleAndUserPermissions = vi.spyOn(buildPayloadUtil, 'mergeRoleAndUserPermissions').mockReturnValue([])
    mockConvertPermissionsToModuleAssignments = vi.spyOn(buildPayloadUtil, 'convertPermissionsToModuleAssignments').mockReturnValue([])
    mockParsePhoneFromAPI = vi.spyOn(phoneUtil, 'parsePhoneFromAPI').mockReturnValue(['+1', '1234567890'])
    mockCreateToastNotification = vi.spyOn(notificationUtil, 'createToastNotification').mockImplementation(() => {})

    mockFetchUserDetails.mockResolvedValue(true)
    mockFetchRolePermissions.mockResolvedValue(undefined)
    mockFetchModules.mockResolvedValue(undefined)
  })

  it('should render the edit user page', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('user-form-layout')).toBeInTheDocument()
    })

    expect(screen.getByText('Edit User')).toBeInTheDocument()
  })

  it('should fetch user details on mount', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(mockFetchUserDetails).toHaveBeenCalledWith('user-123', false)
    })
  })

  it('should fetch role permissions on mount', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(mockFetchRolePermissions).toHaveBeenCalled()
    })
  })

  it('should fetch modules on mount', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(mockFetchModules).toHaveBeenCalled()
    })
  })

  it('should show loading state while fetching data', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      isFetching: true
    })

    render(<EditUserPage userId="user-123" />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should show error when fetch fails', async () => {
    mockFetchUserDetails.mockResolvedValue(false)

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load user details')
    })
  })

  it('should show error when user details are not found', async () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: null,
      isFetching: false
    })

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('User details not found')
    })
  })

  it('should parse phone number from API format', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(mockParsePhoneFromAPI).toHaveBeenCalledWith('+11234567890')
    })
  })

  it('should merge role and user permissions', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(mockMergeRoleAndUserPermissions).toHaveBeenCalledWith(
        mockPermissions,
        mockRolePermissions,
        '1',
        '1',
        [1]
      )
    })
  })

  it('should display submit text as "Update User"', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('submit-text')).toHaveTextContent('Update User')
    })
  })

  it('should display loading text as "Updating User..."', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Updating User...')
    })
  })

  it('should show two factor field when user has 2FA enabled', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('show-2fa')).toHaveTextContent('true')
    })
  })

  it('should not show two factor field when user has 2FA disabled', async () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: {
        ...mockUserDetails,
        is_2fa_enabled: false
      }
    })

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('show-2fa')).toHaveTextContent('false')
    })
  })

  it('should detect changed fields on submit', async () => {
    const user = userEvent.setup()
    mockGetChangedFields.mockReturnValue({ f_name: 'Jane' })
    mockUpdateUser.mockResolvedValue(true)

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockGetChangedFields).toHaveBeenCalled()
    })
  })

  it('should show toast and not submit when no changes detected', async () => {
    const user = userEvent.setup()
    mockGetChangedFields.mockReturnValue(null)

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'warning',
        title: 'No Changes Detected',
        description: 'No modifications were made to the user data.'
      })
    })

    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('should build update payload with changed fields', async () => {
    const user = userEvent.setup()
    const changedFields = { f_name: 'Jane' }
    mockGetChangedFields.mockReturnValue(changedFields)
    mockUpdateUser.mockResolvedValue(true)

    render(<EditUserPage userId="user-123" />)

    /* Wait for form to be fully loaded and ready */
    await waitFor(() => {
      expect(screen.getByTestId('user-form-layout')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockBuildUpdateUserPayload).toHaveBeenCalledWith(
        changedFields,
        mockRolePermissions,
        '1'
      )
    })
  })

  it('should call updateUser with payload on submit', async () => {
    const user = userEvent.setup()
    const mockPayload = { f_name: 'Jane' }
    mockGetChangedFields.mockReturnValue({ f_name: 'Jane' })
    mockBuildUpdateUserPayload.mockReturnValue(mockPayload)
    mockUpdateUser.mockResolvedValue(true)

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('user-123', mockPayload)
    })
  })

  it('should navigate to user list on successful update', async () => {
    const user = userEvent.setup()
    mockGetChangedFields.mockReturnValue({ f_name: 'Jane' })
    mockUpdateUser.mockResolvedValue(true)

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/user-management')
    })
  })

  it('should not navigate when update fails', async () => {
    const user = userEvent.setup()
    mockGetChangedFields.mockReturnValue({ f_name: 'Jane' })
    mockUpdateUser.mockResolvedValue(false)

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should navigate to user list when cancel is clicked', async () => {
    const user = userEvent.setup()

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('cancel-button'))

    expect(mockPush).toHaveBeenCalledWith('/admin/user-management')
  })

  it('should handle errors during submission gracefully', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetChangedFields.mockReturnValue({ f_name: 'Jane' })
    mockUpdateUser.mockRejectedValue(new Error('Network error'))

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating user:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })

  it('should show submitting state when updating user', async () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      isUpdating: true
    })

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('form-submitting')).toHaveTextContent('true')
    })
  })

  it('should handle fetch error from API', async () => {
    /* Override mockFetchUserDetails to return false, triggering local error state */
    mockFetchUserDetails.mockResolvedValueOnce(false)

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load user details')
    })
  })

  it('should retry fetching data when retry button is clicked', async () => {
    const user = userEvent.setup()
    mockFetchUserDetails.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('retry-button'))

    await waitFor(() => {
      expect(mockFetchUserDetails).toHaveBeenCalledTimes(2)
    })
  })

  it('should convert permissions to module assignments', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(mockConvertPermissionsToModuleAssignments).toHaveBeenCalledWith(mockPermissions)
    })
  })

  it('should fetch all data in parallel on mount', async () => {
    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(mockFetchUserDetails).toHaveBeenCalled()
      expect(mockFetchRolePermissions).toHaveBeenCalled()
      expect(mockFetchModules).toHaveBeenCalled()
    })
  })

  it('should log form data and payload before submission', async () => {
    const user = userEvent.setup()
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockGetChangedFields.mockReturnValue({ f_name: 'Jane' })
    mockUpdateUser.mockResolvedValue(true)

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Original data:', expect.any(Object))
      expect(consoleLogSpy).toHaveBeenCalledWith('Current data:', expect.any(Object))
      expect(consoleLogSpy).toHaveBeenCalledWith('Changed fields:', expect.any(Object))
      expect(consoleLogSpy).toHaveBeenCalledWith('Role permissions:', expect.any(Array))
      expect(consoleLogSpy).toHaveBeenCalledWith('Payload being sent:', expect.any(Object))
    })

    consoleLogSpy.mockRestore()
  })

  it('should handle exception during data fetch', async () => {
    mockFetchUserDetails.mockRejectedValue(new Error('Network error'))

    render(<EditUserPage userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('An error occurred while loading user details')
    })
  })

  it('should show loading state when form is not ready', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: null,
      isFetching: true
    })

    render(<EditUserPage userId="user-123" />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })
})
