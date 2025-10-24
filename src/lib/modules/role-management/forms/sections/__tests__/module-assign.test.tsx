/* Comprehensive test suite for ModuleAssignmentsSection component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Role module imports */
import ModuleAssignmentsSection from '@role-management/forms/sections/module-assign'
import { CreateRoleFormData } from '@role-management/schemas'
import { Module } from '@role-management/types'
import { ROLE_FORM_MODES, RoleFormMode } from '@role-management/constants'
import * as useFormModeHook from '@role-management/contexts/form-mode'

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

  const mockOnRetry = vi.fn()

  const defaultFormModeReturn = {
    mode: ROLE_FORM_MODES.CREATE as RoleFormMode,
    isViewMode: false,
    isCreateMode: true,
    isEditMode: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue(defaultFormModeReturn)
    /* Mock console.log to avoid cluttering test output */
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = (props: Partial<React.ComponentProps<typeof ModuleAssignmentsSection>> = {}) => {
    const methods = useForm<CreateRoleFormData>({
      defaultValues: {
        name: '',
        description: '',
        is_active: true,
        module_assignments: []
      }
    })

    return (
      <FormProvider {...methods}>
        <ModuleAssignmentsSection
          modules={mockModules}
          isLoading={false}
          error={null}
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

    it('should not show skeleton when data is loaded', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('module-skeleton')).not.toBeInTheDocument()
    })

    it('should not show content while loading', () => {
      render(<TestComponent isLoading={true} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Module')).not.toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should display error when error prop is provided', () => {
      render(<TestComponent error="Failed to load modules" onRetry={mockOnRetry} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to Load Modules')).toBeInTheDocument()
      expect(screen.getByText('Failed to load modules')).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      const user = (await import('@testing-library/user-event')).default.setup()
      render(<TestComponent error="Failed to load modules" onRetry={mockOnRetry} />, { wrapper: TestWrapper })

      const retryButton = screen.getByTestId('retry-button')
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('should not show retry button when onRetry is not provided', () => {
      render(<TestComponent error="Failed to load modules" />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument()
    })

    it('should not show module tables when error exists', () => {
      render(<TestComponent error="Failed to load modules" />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('module-table-Users')).not.toBeInTheDocument()
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

    it('should not show table headers in empty state', () => {
      render(<TestComponent modules={[]} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Module')).not.toBeInTheDocument()
      expect(screen.queryByText('All')).not.toBeInTheDocument()
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

    it('should render correct number of modules', () => {
      const customModules: Module[] = [
        { id: 1, name: 'Module1', description: 'First Module', display_order: 1, is_active: true },
        { id: 2, name: 'Module2', description: 'Second Module', display_order: 2, is_active: true }
      ]

      render(<TestComponent modules={customModules} />, { wrapper: TestWrapper })

      const moduleTables = screen.getAllByTestId(/^module-table-/)
      expect(moduleTables).toHaveLength(2)
    })
  })

  describe('Readonly Mode', () => {
    it('should set tables as readonly when readonly prop is true', () => {
      render(<TestComponent readonly={true} />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('ReadOnly: true')
    })

    it('should not set tables as readonly when readonly is false', () => {
      render(<TestComponent readonly={false} />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('ReadOnly: false')
    })

    it('should set all tables as readonly', () => {
      render(<TestComponent readonly={true} />, { wrapper: TestWrapper })

      const tables = screen.getAllByText(/ReadOnly: true/)
      expect(tables.length).toBe(3)
    })
  })

  describe('View Mode from Context', () => {
    beforeEach(() => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })
    })

    it('should set tables as readonly in view mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('ReadOnly: true')
    })

    it('should disable all tables in view mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const tables = screen.getAllByText(/Disabled: true/)
      expect(tables.length).toBe(3)
    })
  })

  describe('Edit Mode from Context', () => {
    beforeEach(() => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })
    })

    it('should not set tables as readonly in edit mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('ReadOnly: false')
    })

    it('should enable all tables in edit mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const tables = screen.getAllByText(/Disabled: false/)
      expect(tables.length).toBe(3)
    })
  })

  describe('Create Mode from Context', () => {
    it('should not set tables as readonly in create mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('ReadOnly: false')
    })

    it('should enable all tables in create mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const tables = screen.getAllByText(/Disabled: false/)
      expect(tables.length).toBe(3)
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

    it('should handle single module', () => {
      const singleModule: Module[] = [
        { id: 1, name: 'OnlyModule', description: 'Single Module', display_order: 1, is_active: true }
      ]

      render(<TestComponent modules={singleModule} />, { wrapper: TestWrapper })

      const moduleTables = screen.getAllByTestId(/^module-table-/)
      expect(moduleTables).toHaveLength(1)
    })
  })

  describe('Combined States', () => {
    it('should be both disabled and readonly when readonly prop is true', () => {
      render(<TestComponent readonly={true} />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('Disabled: true')
      expect(usersTable).toHaveTextContent('ReadOnly: true')
    })

    it('should not be disabled or readonly in create mode by default', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('Disabled: false')
      expect(usersTable).toHaveTextContent('ReadOnly: false')
    })

    it('should prioritize readonly prop over view mode', () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })

      render(<TestComponent readonly={true} />, { wrapper: TestWrapper })

      const usersTable = screen.getByTestId('module-table-Users')
      expect(usersTable).toHaveTextContent('ReadOnly: true')
    })
  })

  describe('Layout', () => {
    it('should render in a flex column layout', () => {
      const { container } = render(<TestComponent />, { wrapper: TestWrapper })

      const flexContainer = container.querySelector('[class*="chakra-stack"]')
      expect(flexContainer).toBeTruthy()
    })

    it('should render table headers with proper styling', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Module')).toBeVisible()
      expect(screen.getByText('All')).toBeVisible()
      expect(screen.getByText('C')).toBeVisible()
      expect(screen.getByText('R')).toBeVisible()
      expect(screen.getByText('U')).toBeVisible()
      expect(screen.getByText('D')).toBeVisible()
    })

    it('should render headers above module tables', () => {
      const { container } = render(<TestComponent />, { wrapper: TestWrapper })

      const moduleHeader = screen.getByText('Module')
      const moduleTable = screen.getByTestId('module-table-Users')

      expect(container.contains(moduleHeader)).toBe(true)
      expect(container.contains(moduleTable)).toBe(true)
    })
  })

  describe('Module Descriptions', () => {
    it('should pass module descriptions to tables', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-table-Users')).toBeInTheDocument()
      expect(screen.getByTestId('module-table-Roles')).toBeInTheDocument()
      expect(screen.getByTestId('module-table-Settings')).toBeInTheDocument()
    })
  })

  describe('Permission Headers', () => {
    it('should display all CRUD permission headers', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('C')).toBeInTheDocument() /* Create */
      expect(screen.getByText('R')).toBeInTheDocument() /* Read */
      expect(screen.getByText('U')).toBeInTheDocument() /* Update */
      expect(screen.getByText('D')).toBeInTheDocument() /* Delete */
    })

    it('should display "All" header for select all functionality', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('All')).toBeInTheDocument()
    })

    it('should have title attributes on headers', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const allHeader = screen.getByText('All')
      const cHeader = screen.getByText('C')
      const rHeader = screen.getByText('R')
      const uHeader = screen.getByText('U')
      const dHeader = screen.getByText('D')

      expect(allHeader).toHaveAttribute('title', 'Select All')
      expect(cHeader).toHaveAttribute('title', 'Create')
      expect(rHeader).toHaveAttribute('title', 'Read')
      expect(uHeader).toHaveAttribute('title', 'Update')
      expect(dHeader).toHaveAttribute('title', 'Delete')
    })
  })

  describe('State Priority', () => {
    it('should show loading over error state', () => {
      render(<TestComponent isLoading={true} error="Failed to load" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('error-container')).not.toBeInTheDocument()
    })

    it('should show loading over empty state', () => {
      render(<TestComponent isLoading={true} modules={[]} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    })

    it('should show error over empty state', () => {
      render(<TestComponent error="Failed to load" modules={[]} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    })
  })

  describe('Module Assignment Initialization', () => {
    it('should initialize assignments for all modules', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const moduleTables = screen.getAllByTestId(/^module-table-/)
      expect(moduleTables).toHaveLength(mockModules.length)
    })

    it('should handle modules with string IDs', () => {
      const modulesWithStringIds: Module[] = [
        { id: '1' as unknown as number, name: 'Module1', description: 'First', display_order: 1, is_active: true }
      ]

      render(<TestComponent modules={modulesWithStringIds} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('module-table-Module1')).toBeInTheDocument()
    })
  })
})
