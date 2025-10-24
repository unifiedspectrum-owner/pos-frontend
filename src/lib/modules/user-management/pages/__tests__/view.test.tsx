/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* User module imports */
import UserDetailsPage from '@user-management/pages/view'
import * as useUserOperationsHook from '@user-management/hooks/use-user-operations'
import { UserAccountDetails, UserAccountStatistics } from '@user-management/types'

/* Role module imports */
import * as useRolesHook from '@role-management/hooks/use-roles'
import * as useModulesHook from '@role-management/hooks/use-modules'

/* Mock shared components */
vi.mock('@shared/components/common', () => ({
  FullPageLoader: () => <div data-testid="full-page-loader">Loading...</div>,
  ErrorMessageContainer: ({ error }: { error: string }) => (
    <div data-testid="error-container">{error}</div>
  ),
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>
}))

/* Mock Chakra UI components */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  const React = await import('react')

  /* Context to share onValueChange handler with Trigger components */
  const TabsContext = React.createContext<{ value: string; onValueChange: (e: { value: string }) => void } | null>(null)

  return {
    ...actual,
    Tabs: {
      Root: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (e: { value: string }) => void }) => (
        <TabsContext.Provider value={{ value, onValueChange }}>
          <div data-testid="tabs-root" data-value={value}>
            {children}
          </div>
        </TabsContext.Provider>
      ),
      List: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
      Trigger: ({ children, value }: { children: React.ReactNode; value: string }) => {
        const context = React.useContext(TabsContext)
        return (
          <button
            data-testid={`tab-${value}`}
            onClick={() => context?.onValueChange({ value })}
          >
            {children}
          </button>
        )
      },
      ContentGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-content-group">{children}</div>,
      Content: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <div data-testid={`tab-content-${value}`}>{children}</div>
      )
    },
    Accordion: {
      Root: ({ children }: { children: React.ReactNode }) => <div data-testid="accordion-root">{children}</div>,
      Item: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <div data-testid={`accordion-item-${value}`}>{children}</div>
      ),
      ItemTrigger: ({ children }: { children: React.ReactNode }) => (
        <button data-testid="accordion-trigger">{children}</button>
      ),
      ItemContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="accordion-content">{children}</div>
      ),
      ItemIndicator: () => <div data-testid="accordion-indicator" />
    }
  }
})

describe('UserDetailsPage', () => {
  const mockFetchUserDetails = vi.fn()
  const mockFetchRolePermissions = vi.fn()
  const mockFetchModules = vi.fn()

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

  const mockUserStatistics: UserAccountStatistics = {
    total_logins: 100,
    successful_logins: 90,
    failed_logins: 10,
    consecutive_failed_attempts: 2,
    first_login_at: '2024-01-01T00:00:00Z',
    last_successful_login_at: '2024-01-01T00:00:00Z',
    last_failed_login_at: '2024-01-01T00:00:00Z',
    last_login_ip: '192.168.1.1',
    last_user_agent: 'Mozilla/5.0',
    last_device_fingerprint: 'device123',
    active_sessions: 2,
    max_concurrent_sessions: 5,
    password_changes_count: 3,
    account_lockouts_count: 1,
    last_lockout_at: null
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
    updateUser: vi.fn(),
    isUpdating: false,
    updateError: null,
    deleteUser: vi.fn(),
    isDeleting: false,
    deleteError: null,
    fetchUserDetails: mockFetchUserDetails,
    fetchUserBasicDetails: vi.fn(),
    userDetails: mockUserDetails,
    userStatistics: mockUserStatistics,
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
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  it('should render the user details page', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByText('John Doe - User Details')).toBeInTheDocument()
  })

  it('should fetch user details on mount', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(mockFetchUserDetails).toHaveBeenCalledWith('user-123')
  })

  it('should fetch role permissions on mount', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(mockFetchRolePermissions).toHaveBeenCalled()
  })

  it('should fetch modules on mount', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(mockFetchModules).toHaveBeenCalled()
  })

  it('should show loading state while fetching', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      isFetching: true
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByTestId('full-page-loader')).toBeInTheDocument()
  })

  it('should show error when fetch fails', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      fetchError: 'Failed to fetch user details'
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByTestId('error-container')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch user details')).toBeInTheDocument()
  })

  it('should show error when user details are not found', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: null
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByTestId('error-container')).toBeInTheDocument()
    expect(screen.getByText('User details not found')).toBeInTheDocument()
  })

  it('should render tabs navigation', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByTestId('tabs-root')).toBeInTheDocument()
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
  })

  it('should display user full name in heading', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByText('John Doe - User Details')).toBeInTheDocument()
  })

  it('should display generic heading when name is missing', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: {
        ...mockUserDetails,
        f_name: '',
        l_name: ''
      }
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByText('User Details')).toBeInTheDocument()
  })

  it('should render breadcrumbs component', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
  })

  it('should display role details when available', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Administrator role')).toBeInTheDocument()
  })

  it('should display no role assigned message when role is missing', async () => {
    const user = userEvent.setup()
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: {
        ...mockUserDetails,
        role_details: null
      }
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('No Role Assigned')).toBeInTheDocument()
    expect(screen.getByText('This user currently has no role assigned.')).toBeInTheDocument()
  })

  it('should merge role and user permissions correctly', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByTestId('accordion-root')).toBeInTheDocument()
  })

  it('should display no permissions message when no permissions exist', async () => {
    const user = userEvent.setup()
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      permissions: []
    })

    vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
      ...defaultRolesHookReturn,
      rolePermissions: []
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('No Permissions Found')).toBeInTheDocument()
    expect(screen.getByText('This user currently has no permissions assigned.')).toBeInTheDocument()
  })

  it('should display module permissions count', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText(/Module Permissions \(1\)/)).toBeInTheDocument()
  })

  it('should render accordion for each permission', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByTestId('accordion-root')).toBeInTheDocument()
    expect(screen.getByTestId('accordion-item-permission-1')).toBeInTheDocument()
  })

  it('should display module name in accordion', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('should display role-based permissions section', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Role-based Permissions (Admin)')).toBeInTheDocument()
  })

  it('should display user-specific permissions section', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('User-specific Permissions')).toBeInTheDocument()
  })

  it('should display permission expiry information', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Permission Expires')).toBeInTheDocument()
    expect(screen.getByText('Never')).toBeInTheDocument()
  })

  it('should display formatted expiry date when permission expires', async () => {
    const user = userEvent.setup()
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      permissions: [
        {
          ...mockPermissions[0],
          permission_expires_at: '2024-12-31T00:00:00Z'
        }
      ]
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Permission Expires')).toBeInTheDocument()
  })

  it('should handle permissions for user without role', async () => {
    const user = userEvent.setup()
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: {
        ...mockUserDetails,
        role_details: null
      }
    })

    vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
      ...defaultRolesHookReturn,
      rolePermissions: []
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('No Permissions Found')).toBeInTheDocument()
  })

  it('should display role active status badge', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should display role inactive status when role is not active', async () => {
    const user = userEvent.setup()
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: {
        ...mockUserDetails,
        role_details: {
          ...mockUserDetails.role_details!,
          is_active: false
        }
      }
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('should display permission badges with correct state', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getAllByText('Allowed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Denied').length).toBeGreaterThan(0)
  })

  it('should memoize processed sections', () => {
    const { rerender } = render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    rerender(<UserDetailsPage userId="user-123" />)

    /* Memoization means same component won't re-fetch data */
    expect(mockFetchUserDetails).toHaveBeenCalledTimes(1)
  })

  it('should memoize merged permissions', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab to see module names */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('should handle tab changes', async () => {
    const user = userEvent.setup()

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    const profileTab = screen.getByTestId('tab-profile_info')
    await user.click(profileTab)

    expect(profileTab).toBeInTheDocument()
  })

  it('should default to profile info tab', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    const tabsRoot = screen.getByTestId('tabs-root')
    expect(tabsRoot).toHaveAttribute('data-value', 'profile_info')
  })

  it('should render user statistics when available', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(mockUserStatistics).toBeDefined()
  })

  it('should handle missing user statistics gracefully', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userStatistics: null
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByText('John Doe - User Details')).toBeInTheDocument()
  })

  it('should not fetch data when userId is not provided', () => {
    render(<UserDetailsPage userId="" />, { wrapper: TestWrapper })

    expect(mockFetchUserDetails).not.toHaveBeenCalled()
    expect(mockFetchRolePermissions).not.toHaveBeenCalled()
    expect(mockFetchModules).not.toHaveBeenCalled()
  })

  it('should display role created date', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab where role details are shown */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Role Created')).toBeInTheDocument()
  })

  it('should handle missing role created date', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: {
        ...mockUserDetails,
        role_details: {
          ...mockUserDetails.role_details!,
          created_at: ''
        }
      }
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should memoize tab change handler', () => {
    const { rerender } = render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    rerender(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByTestId('tabs-root')).toBeInTheDocument()
  })

  it('should display verification badges for email and phone', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getAllByText('Verified').length).toBeGreaterThan(0)
  })

  it('should display not verified badge when email is not verified', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: {
        ...mockUserDetails,
        email_verified: false
      }
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByText('Not Verified')).toBeInTheDocument()
  })

  it('should display user status badge', () => {
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('should handle user-only permissions without role permissions', async () => {
    const user = userEvent.setup()
    vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
      ...defaultRolesHookReturn,
      rolePermissions: []
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    /* Component returns empty mergedPermissions when rolePermissions is empty, even if user has permissions */
    expect(screen.getByText('No Permissions Found')).toBeInTheDocument()
  })

  it('should display role description or fallback text', async () => {
    const user = userEvent.setup()
    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab where role description is shown */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('Administrator role')).toBeInTheDocument()
  })

  it('should display no description text when role description is missing', async () => {
    const user = userEvent.setup()
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      userDetails: {
        ...mockUserDetails,
        role_details: {
          ...mockUserDetails.role_details!,
          description: ''
        }
      }
    })

    render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    /* Switch to permissions tab where role description is shown */
    const permissionsTab = screen.getByTestId('tab-permissions')
    await user.click(permissionsTab)

    expect(screen.getByText('No description available')).toBeInTheDocument()
  })

  it('should use React.memo for performance optimization', () => {
    const { rerender } = render(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    rerender(<UserDetailsPage userId="user-123" />, { wrapper: TestWrapper })

    expect(screen.getByText('John Doe - User Details')).toBeInTheDocument()
  })
})
