/* Comprehensive test suite for RoleFormLayout component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Role module imports */
import RoleFormLayout from '@role-management/forms/layout'
import { CreateRoleFormData } from '@role-management/schemas'
import { ROLE_FORM_MODES } from '@role-management/constants'
import * as useModulesHook from '@role-management/hooks/use-modules'

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

vi.mock('@role-management/forms/sections', () => ({
  RoleInfoSection: () => <div data-testid="role-info-section">Role Info Section</div>,
  ModuleAssignmentsSection: ({ modules, isLoading, error, onRetry }: { modules: unknown[]; isLoading: boolean; error: string | null; onRetry: () => void }) => (
    <div data-testid="module-assignments-section">
      {isLoading ? (
        <div>Loading modules...</div>
      ) : error ? (
        <div>
          <div>Error: {error}</div>
          <button onClick={onRetry}>Retry Modules</button>
        </div>
      ) : (
        <div>Module Assignments - {modules.length} modules</div>
      )}
    </div>
  )
}))

vi.mock('@role-management/forms', () => ({
  NavigationButtons: ({ onCancel, onSubmit, loading }: { onCancel: () => void; onSubmit: () => void; loading: boolean }) => (
    <div data-testid="navigation-buttons">
      <button onClick={onCancel} data-testid="cancel-button" disabled={loading}>Cancel</button>
      <button onClick={onSubmit} data-testid="submit-button" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  )
}))

describe('RoleFormLayout', () => {
  const mockFetchModules = vi.fn()
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnRetry = vi.fn()

  const mockModules = [
    { id: 1, name: 'Users', description: 'User Management', display_order: 1, is_active: true },
    { id: 2, name: 'Roles', description: 'Role Management', display_order: 2, is_active: true }
  ]

  const defaultModulesHookReturn = {
    modules: mockModules,
    isLoading: false,
    error: null,
    isCached: false,
    fetchModules: mockFetchModules
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useModulesHook, 'useModules').mockReturnValue(defaultModulesHookReturn)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = (props: Partial<React.ComponentProps<typeof RoleFormLayout>> = {}) => {
    const methods = useForm<CreateRoleFormData>({
      defaultValues: {
        name: '',
        description: '',
        is_active: true,
        module_assignments: []
      }
    })

    return (
      <RoleFormLayout
        mode={ROLE_FORM_MODES.CREATE}
        methods={methods}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        {...props}
      />
    )
  }

  describe('Loading States', () => {
    it('should show full page loader when isLoading is true', () => {
      render(<TestComponent isLoading={true} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('full-page-loader')).toBeInTheDocument()
      expect(screen.queryByText('Create New Role')).not.toBeInTheDocument()
    })

    it('should not show loader when data is loaded', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      expect(screen.getByText('Create New Role')).toBeInTheDocument()
    })

    it('should show loading state in module assignments when modules are loading', () => {
      vi.spyOn(useModulesHook, 'useModules').mockReturnValue({
        ...defaultModulesHookReturn,
        isLoading: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading modules...')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should display error when error prop is provided', () => {
      render(<TestComponent error="Failed to load role" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      expect(screen.getByText('Failed to load role')).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent error="Failed to load role" onRetry={mockOnRetry} />, { wrapper: TestWrapper })

      const retryButton = screen.getByTestId('retry-button')
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('should display modules error in module assignments section', () => {
      vi.spyOn(useModulesHook, 'useModules').mockReturnValue({
        ...defaultModulesHookReturn,
        error: 'Failed to load modules'
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Error: Failed to load modules')).toBeInTheDocument()
    })

    it('should allow retry for modules error', async () => {
      const user = userEvent.setup()
      vi.spyOn(useModulesHook, 'useModules').mockReturnValue({
        ...defaultModulesHookReturn,
        error: 'Failed to load modules'
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const retryButton = screen.getByText('Retry Modules')
      await user.click(retryButton)

      expect(mockFetchModules).toHaveBeenCalled()
    })

    it('should not show form when error exists', () => {
      render(<TestComponent error="Failed to load role" />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('role-info-section')).not.toBeInTheDocument()
      expect(screen.queryByTestId('module-assignments-section')).not.toBeInTheDocument()
    })
  })

  describe('Form Rendering', () => {
    it('should render form title for CREATE mode', () => {
      render(<TestComponent mode={ROLE_FORM_MODES.CREATE} />, { wrapper: TestWrapper })

      expect(screen.getByText('Create New Role')).toBeInTheDocument()
    })

    it('should render form title for EDIT mode', () => {
      render(<TestComponent mode={ROLE_FORM_MODES.EDIT} />, { wrapper: TestWrapper })

      expect(screen.getByText('Edit Role')).toBeInTheDocument()
    })

    it('should render form title for VIEW mode', () => {
      render(<TestComponent mode={ROLE_FORM_MODES.VIEW} />, { wrapper: TestWrapper })

      expect(screen.getByText('View Role')).toBeInTheDocument()
    })

    it('should render breadcrumbs', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('should render role info section', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('role-info-section')).toBeInTheDocument()
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

      expect(screen.getByText('Role Information')).toBeInTheDocument()
      expect(screen.getByText('Module Assignments')).toBeInTheDocument()
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

    it('should disable submit button when isSubmitting is true', () => {
      render(<TestComponent isSubmitting={true} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })

    it('should show loading text when submitting', () => {
      render(<TestComponent isSubmitting={true} />, { wrapper: TestWrapper })

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

    it('should disable cancel button when submitting', () => {
      render(<TestComponent isSubmitting={true} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByTestId('cancel-button')
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Data Fetching', () => {
    it('should fetch modules on mount', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(mockFetchModules).toHaveBeenCalledTimes(1)
    })

    it('should not fetch modules again if already cached', () => {
      vi.spyOn(useModulesHook, 'useModules').mockReturnValue({
        ...defaultModulesHookReturn,
        isCached: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      /* fetchModules should still be called once due to useEffect */
      expect(mockFetchModules).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Provider', () => {
    it('should wrap form in FormProvider', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* FormProvider should enable form context for child components */
      expect(screen.getByTestId('role-info-section')).toBeInTheDocument()
      expect(screen.getByTestId('module-assignments-section')).toBeInTheDocument()
    })
  })

  describe('Form Mode Context', () => {
    it('should provide CREATE mode to children', () => {
      render(<TestComponent mode={ROLE_FORM_MODES.CREATE} />, { wrapper: TestWrapper })

      /* Navigation buttons should receive the mode context */
      expect(screen.getByTestId('navigation-buttons')).toBeInTheDocument()
    })

    it('should provide EDIT mode to children', () => {
      render(<TestComponent mode={ROLE_FORM_MODES.EDIT} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('navigation-buttons')).toBeInTheDocument()
    })

    it('should provide VIEW mode to children', () => {
      render(<TestComponent mode={ROLE_FORM_MODES.VIEW} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('navigation-buttons')).toBeInTheDocument()
    })
  })

  describe('Props Passing', () => {
    it('should pass modules to ModuleAssignmentsSection', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText(/2 modules/)).toBeInTheDocument()
    })

    it('should pass empty modules array when no modules', () => {
      vi.spyOn(useModulesHook, 'useModules').mockReturnValue({
        ...defaultModulesHookReturn,
        modules: []
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText(/0 modules/)).toBeInTheDocument()
    })

    it('should pass onRetry to ModuleAssignmentsSection', async () => {
      const user = userEvent.setup()
      vi.spyOn(useModulesHook, 'useModules').mockReturnValue({
        ...defaultModulesHookReturn,
        error: 'Failed to load modules'
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const retryButton = screen.getByText('Retry Modules')
      await user.click(retryButton)

      expect(mockFetchModules).toHaveBeenCalled()
    })
  })

  describe('Layout Structure', () => {
    it('should render form sections properly', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Both sections should be present */
      expect(screen.getByTestId('role-info-section')).toBeInTheDocument()
      expect(screen.getByTestId('module-assignments-section')).toBeInTheDocument()
    })

    it('should have proper section layout with borders', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Both sections should be present */
      expect(screen.getByTestId('role-info-section')).toBeInTheDocument()
      expect(screen.getByTestId('module-assignments-section')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined onRetry gracefully', () => {
      render(<TestComponent error="Failed to load" />, { wrapper: TestWrapper })

      expect(screen.getByTestId('error-container')).toBeInTheDocument()
      /* Should not render retry button if onRetry is undefined */
      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument()
    })

    it('should handle modules fetch failure', () => {
      vi.spyOn(useModulesHook, 'useModules').mockReturnValue({
        ...defaultModulesHookReturn,
        modules: [],
        error: 'Network error'
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Error: Network error')).toBeInTheDocument()
    })

    it('should render form even when modules are still loading', () => {
      vi.spyOn(useModulesHook, 'useModules').mockReturnValue({
        ...defaultModulesHookReturn,
        isLoading: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      /* Form should still render, just modules section shows loading */
      expect(screen.getByTestId('role-info-section')).toBeInTheDocument()
      expect(screen.getByText('Loading modules...')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete form workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Verify all sections are rendered */
      expect(screen.getByText('Create New Role')).toBeInTheDocument()
      expect(screen.getByTestId('role-info-section')).toBeInTheDocument()
      expect(screen.getByTestId('module-assignments-section')).toBeInTheDocument()

      /* Verify data is loaded */
      expect(screen.getByText(/2 modules/)).toBeInTheDocument()

      /* Submit form */
      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('should handle error recovery workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent error="Network error" onRetry={mockOnRetry} />, { wrapper: TestWrapper })

      /* Verify error is shown */
      expect(screen.getByText('Network error')).toBeInTheDocument()

      /* Retry */
      const retryButton = screen.getByTestId('retry-button')
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalled()
    })
  })
})
