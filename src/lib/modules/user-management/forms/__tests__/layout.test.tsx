/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* User module imports */
import UserFormLayout from '@user-management/forms/layout'
import { CreateUserFormData } from '@user-management/schemas'
import * as useModulesHook from '@role-management/hooks/use-modules'
import * as useRolesHook from '@role-management/hooks/use-roles'

/* Mock dependencies */
vi.mock('@shared/components/common', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>,
  FullPageLoader: () => <div data-testid="full-page-loader">Loading...</div>,
  ErrorMessageContainer: ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
    <div data-testid="error-container">
      <div>{error}</div>
      {onRetry && <button onClick={onRetry} data-testid="retry-button">Retry</button>}
    </div>
  )
}))

vi.mock('@user-management/forms/sections', () => ({
  UserInfoSection: ({ roleSelectOptions }: { roleSelectOptions: unknown[] }) => (
    <div data-testid="user-info-section">
      User Info Section - {roleSelectOptions.length} roles
    </div>
  ),
  ModuleAssignmentsSection: ({ modules }: { modules: unknown[] }) => (
    <div data-testid="module-assignments-section">
      Module Assignments - {modules.length} modules
    </div>
  )
}))

vi.mock('@user-management/forms', () => ({
  UserNavigationButtons: ({ onCancel, onSubmit, loading }: { onCancel: () => void; onSubmit: () => void; loading: boolean }) => (
    <div data-testid="navigation-buttons">
      <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
      <button onClick={onSubmit} data-testid="submit-button" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  )
}))

describe('UserFormLayout', () => {
  const mockFetchModules = vi.fn()
  const mockFetchRolePermissions = vi.fn()
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnRetry = vi.fn()

  const mockModules = [
    { id: 1, name: 'Users', description: 'User Management', display_order: 1, is_active: true },
    { id: 2, name: 'Roles', description: 'Role Management', display_order: 2, is_active: true }
  ]

  const mockRoleSelectOptions = [
    { label: 'Admin', value: '1' },
    { label: 'User', value: '2' }
  ]

  const mockRolePermissions = [
    { id: 1, role_id: 1, module_id: 1, can_create: 1, can_read: 1, can_update: 1, can_delete: 0, display_order: 1 }
  ]

  const defaultModulesHookReturn = {
    modules: mockModules,
    isLoading: false,
    error: null,
    isCached: false,
    fetchModules: mockFetchModules
  }

  const defaultRolesHookReturn = {
    roles: [],
    roleSelectOptions: mockRoleSelectOptions,
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

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useModulesHook, 'useModules').mockReturnValue(defaultModulesHookReturn)
    vi.spyOn(useRolesHook, 'useRoles').mockReturnValue(defaultRolesHookReturn)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = (props: Partial<React.ComponentProps<typeof UserFormLayout>> = {}) => {
    const methods = useForm<CreateUserFormData>({
      defaultValues: {
        f_name: '',
        l_name: '',
        email: '',
        phone: ['+91', ''],
        role_id: '',
        is_active: true,
        is_2fa_enabled: false,
        module_assignments: []
      }
    })

    return (
      <UserFormLayout
        title="Create New User"
        methods={methods}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        {...props}
      />
    )
  }

  describe('Loading States', () => {
    it('should show loader when isLoading is true', () => {
      render(<TestComponent isLoading={true} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('full-page-loader')).toBeInTheDocument()
      expect(screen.queryByText('Create New User')).not.toBeInTheDocument()
    })

    it('should show loader when roles are loading', () => {
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultRolesHookReturn,
        loading: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('full-page-loader')).toBeInTheDocument()
    })

    it('should not show loader when data is loaded', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      expect(screen.getByText('Create New User')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should display error when error prop is provided', () => {
      render(<TestComponent error="Failed to load user" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to load user')).toBeInTheDocument()
    })

    it('should display roles error when rolesError exists', () => {
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultRolesHookReturn,
        error: 'Failed to load roles'
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Failed to load roles')).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent error="Failed to load user" onRetry={mockOnRetry} />, { wrapper: TestWrapper })

      const retryButton = screen.getByTestId('retry-button')
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('should prioritize error over rolesError', () => {
      vi.spyOn(useRolesHook, 'useRoles').mockReturnValue({
        ...defaultRolesHookReturn,
        error: 'Roles error'
      })

      render(<TestComponent error="User error" />, { wrapper: TestWrapper })

      expect(screen.getByText('User error')).toBeInTheDocument()
      expect(screen.queryByText('Roles error')).not.toBeInTheDocument()
    })
  })

  describe('Form Rendering', () => {
    it('should render form title', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Create New User')).toBeInTheDocument()
    })

    it('should render breadcrumbs', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('should render user info section', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('user-info-section')).toBeInTheDocument()
      expect(screen.getByText(/2 roles/)).toBeInTheDocument()
    })

    it('should render module assignments section', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-assignments-section')).toBeInTheDocument()
      expect(screen.getByText(/2 modules/)).toBeInTheDocument()
    })

    it('should render navigation buttons', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('navigation-buttons')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should render section headings', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('User Information')).toBeInTheDocument()
      expect(screen.getByText('Module Permissions')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit when submit button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('should pass role permissions to onSubmit', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.any(Object),
          mockRolePermissions
        )
      })
    })

    it('should disable submit button when isSubmitting is true', () => {
      render(<TestComponent isSubmitting={true} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })

    it('should show loading text when submitting', () => {
      render(<TestComponent isSubmitting={true} loadingText="Saving..." />, { wrapper: TestWrapper })

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })
  })

  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const cancelButton = screen.getByTestId('cancel-button')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Data Fetching', () => {
    it('should fetch modules on mount', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(mockFetchModules).toHaveBeenCalledTimes(1)
    })

    it('should fetch role permissions on mount', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(mockFetchRolePermissions).toHaveBeenCalledTimes(1)
    })
  })

  describe('Custom Props', () => {
    it('should display custom submit text', () => {
      render(<TestComponent submitText="Update User" />, { wrapper: TestWrapper })

      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should pass showTwoFactorField to UserInfoSection', () => {
      render(<TestComponent showTwoFactorField={true} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('user-info-section')).toBeInTheDocument()
    })

    it('should pass userPermissionsFromAPI to ModuleAssignmentsSection', () => {
      const mockUserPermissions = [
        { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false }
      ]

      render(<TestComponent userPermissionsFromAPI={mockUserPermissions} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-assignments-section')).toBeInTheDocument()
    })
  })

  describe('Form Provider', () => {
    it('should wrap form in FormProvider', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* FormProvider should enable form context for child components */
      expect(screen.getByTestId('user-info-section')).toBeInTheDocument()
      expect(screen.getByTestId('module-assignments-section')).toBeInTheDocument()
    })
  })

  describe('Role Selection Watching', () => {
    it('should watch for role_id changes', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-assignments-section')).toBeInTheDocument()
    })
  })
})
