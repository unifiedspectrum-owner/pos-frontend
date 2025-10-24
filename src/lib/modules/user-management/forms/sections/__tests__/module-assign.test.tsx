/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* User module imports */
import ModuleAssignmentsSection from '@user-management/forms/sections/module-assign'
import { CreateUserFormData } from '@user-management/schemas'
import { Module, RolePermission, ModuleAssignment } from '@role-management/types'

/* Mock dependencies */
vi.mock('@shared/components/common', () => ({
  EmptyStateContainer: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
  ErrorMessageContainer: ({ title, error, onRetry }: { title: string; error: string; onRetry?: () => void }) => (
    <div data-testid="error-container">
      <div>{title}</div>
      <div>{error}</div>
      {onRetry && <button onClick={onRetry} data-testid="retry-button">Retry</button>}
    </div>
  )
}))

vi.mock('@role-management/components', () => ({
  ModuleAssignmentsSkeleton: ({ count }: { count: number }) => (
    <div data-testid="module-skeleton">Loading {count} modules...</div>
  )
}))

vi.mock('@role-management/tables', () => ({
  ModuleAssignmentsTable: ({ label, disabled, readOnly }: { label: string; disabled: boolean; readOnly: boolean }) => (
    <div data-testid={`module-table-${label}`}>
      {label} - Disabled: {disabled.toString()} - ReadOnly: {readOnly.toString()}
    </div>
  )
}))

describe('ModuleAssignmentsSection', () => {
  const mockModules: Module[] = [
    { id: 1, name: 'Users', description: 'User Management', display_order: 1, is_active: true },
    { id: 2, name: 'Roles', description: 'Role Management', display_order: 2, is_active: true },
    { id: 3, name: 'Settings', description: 'System Settings', display_order: 3, is_active: true }
  ]

  const mockRolePermissions: RolePermission[] = [
    { id: 1, role_id: 1, module_id: 1, can_create: 1, can_read: 1, can_update: 1, can_delete: 0, display_order: 1 },
    { id: 2, role_id: 1, module_id: 2, can_create: 1, can_read: 1, can_update: 0, can_delete: 0, display_order: 2 }
  ]

  const mockUserPermissionsFromAPI: ModuleAssignment[] = [
    { module_id: '1', can_create: true, can_read: true, can_update: false, can_delete: false },
    { module_id: '3', can_create: false, can_read: true, can_update: false, can_delete: false }
  ]

  const mockOnRetry = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = (props: Partial<React.ComponentProps<typeof ModuleAssignmentsSection>> = {}) => {
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
      <FormProvider {...methods}>
        <ModuleAssignmentsSection
          modules={mockModules}
          isLoading={false}
          error={null}
          rolePermissions={mockRolePermissions}
          permissionsLoading={false}
          permissionsError={null}
          {...props}
        />
      </FormProvider>
    )
  }

  describe('Loading States', () => {
    it('should show skeleton when isLoading is true', () => {
      render(<TestComponent isLoading={true} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-skeleton')).toBeInTheDocument()
      expect(screen.getByText(/Loading 6 modules/)).toBeInTheDocument()
    })

    it('should show skeleton when permissionsLoading is true', () => {
      render(<TestComponent permissionsLoading={true} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-skeleton')).toBeInTheDocument()
    })

    it('should not show skeleton when data is loaded', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('module-skeleton')).not.toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should display error when error prop is provided', () => {
      render(<TestComponent error="Failed to load modules" onRetry={mockOnRetry} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to Load Modules')).toBeInTheDocument()
      expect(screen.getByText('Failed to load modules')).toBeInTheDocument()
    })

    it('should display permissions error when permissionsError exists', () => {
      render(<TestComponent permissionsError="Failed to load permissions" onRetry={mockOnRetry} />, { wrapper: TestWrapper })

      expect(screen.getByText('Failed to Load Role Permissions')).toBeInTheDocument()
      expect(screen.getByText('Failed to load permissions')).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      const user = (await import('@testing-library/user-event')).default.setup()
      render(<TestComponent error="Failed to load modules" onRetry={mockOnRetry} />, { wrapper: TestWrapper })

      const retryButton = screen.getByTestId('retry-button')
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('should prioritize error over permissionsError', () => {
      render(
        <TestComponent
          error="Module error"
          permissionsError="Permission error"
          onRetry={mockOnRetry}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Failed to Load Modules')).toBeInTheDocument()
      expect(screen.queryByText('Failed to Load Role Permissions')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no modules are available', () => {
      render(<TestComponent modules={[]} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText('No modules available')).toBeInTheDocument()
      expect(screen.getByText('There are no modules configured in the system')).toBeInTheDocument()
    })

    it('should display empty state when modules is undefined', () => {
      render(<TestComponent modules={undefined} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })
  })

  describe('Module Tables Rendering', () => {
    it('should render table headers', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Module')).toBeInTheDocument()
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.getByText('R')).toBeInTheDocument()
      expect(screen.getByText('U')).toBeInTheDocument()
      expect(screen.getByText('D')).toBeInTheDocument()
    })

    it('should render module table for each module', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-table-Users')).toBeInTheDocument()
      expect(screen.getByTestId('module-table-Roles')).toBeInTheDocument()
      expect(screen.getByTestId('module-table-Settings')).toBeInTheDocument()
    })

    it('should render all modules', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const moduleCount = screen.getAllByTestId(/^module-table-/)
      expect(moduleCount).toHaveLength(3)
    })
  })

  describe('Readonly Mode', () => {
    it('should set tables as readonly when readonly prop is true', () => {
      render(<TestComponent readonly={true} selectedRoleId="1" />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('ReadOnly: true')
    })

    it('should not set tables as readonly when readonly is false and role is selected', () => {
      render(<TestComponent readonly={false} selectedRoleId="1" />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('ReadOnly: false')
    })
  })

  describe('Role Selection', () => {
    it('should disable tables when no role is selected', () => {
      render(<TestComponent selectedRoleId={undefined} />, { wrapper: TestWrapper })

      const tables = screen.getAllByText(/Disabled: true/)
      expect(tables.length).toBe(3)
    })

    it('should enable tables when role is selected', () => {
      render(<TestComponent selectedRoleId="1" />, { wrapper: TestWrapper })

      const tables = screen.getAllByText(/Disabled: false/)
      expect(tables.length).toBe(3)
    })
  })

  describe('User Permissions from API', () => {
    it('should accept userPermissionsFromAPI prop', () => {
      render(<TestComponent userPermissionsFromAPI={mockUserPermissionsFromAPI} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-table-Users')).toBeInTheDocument()
    })

    it('should handle empty userPermissionsFromAPI', () => {
      render(<TestComponent userPermissionsFromAPI={[]} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-table-Users')).toBeInTheDocument()
    })
  })

  describe('Role Permissions', () => {
    it('should accept rolePermissions prop', () => {
      render(<TestComponent rolePermissions={mockRolePermissions} selectedRoleId="1" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-table-Users')).toBeInTheDocument()
    })

    it('should handle empty rolePermissions', () => {
      render(<TestComponent rolePermissions={[]} selectedRoleId="1" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-table-Users')).toBeInTheDocument()
    })
  })

  describe('Form Integration', () => {
    it('should initialize module assignments when modules are provided', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-table-Users')).toBeInTheDocument()
      expect(screen.getByTestId('module-table-Roles')).toBeInTheDocument()
      expect(screen.getByTestId('module-table-Settings')).toBeInTheDocument()
    })

    it('should handle modules with different IDs', () => {
      const customModules: Module[] = [
        { id: 10, name: 'Custom1', description: 'Custom Module 1', display_order: 1, is_active: true },
        { id: 20, name: 'Custom2', description: 'Custom Module 2', display_order: 2, is_active: true }
      ]

      render(<TestComponent modules={customModules} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-table-Custom1')).toBeInTheDocument()
      expect(screen.getByTestId('module-table-Custom2')).toBeInTheDocument()
    })
  })

  describe('Combined States', () => {
    it('should be both disabled and readonly when readonly is true', () => {
      render(<TestComponent readonly={true} selectedRoleId="1" />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('Disabled: true')
      expect(usersTable).toHaveTextContent('ReadOnly: true')
    })

    it('should be both disabled and readonly when no role selected', () => {
      render(<TestComponent readonly={false} selectedRoleId={undefined} />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('Disabled: true')
      expect(usersTable).toHaveTextContent('ReadOnly: true')
    })

    it('should not be disabled or readonly when role is selected and readonly is false', () => {
      render(<TestComponent readonly={false} selectedRoleId="1" />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('Disabled: false')
      expect(usersTable).toHaveTextContent('ReadOnly: false')
    })
  })

  describe('Layout', () => {
    it('should render in a flex column layout', () => {
      const { container } = render(<TestComponent />, { wrapper: TestWrapper })

      const flexContainer = container.querySelector('[class*="chakra-stack"]')
      expect(flexContainer).toBeInTheDocument()
    })

    it('should render table headers with proper styling', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      // Headers should be visible
      expect(screen.getByText('Module')).toBeVisible()
      expect(screen.getByText('All')).toBeVisible()
    })
  })
})
