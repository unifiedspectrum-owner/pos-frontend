/* Comprehensive test suite for PlanAddonConfiguration component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider, Control, FieldValues } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Plan module imports */
import PlanAddonConfiguration from '@plan-management/forms/tabs/addon-configuration'
import { CreatePlanFormData } from '@plan-management/schemas'
import { PLAN_FORM_MODES } from '@plan-management/constants'
import * as planFormModeContext from '@plan-management/contexts'
import * as resourceManagementHook from '@plan-management/hooks/use-resource-management'
import * as resourceConfirmationHook from '@plan-management/hooks/use-resource-confirmation'

/* Type definitions for mock components */
interface MockAddon {
  id: number;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
  base_price: string;
  pricing_scope: string;
  default_quantity: number;
  min_quantity: number;
}

interface MockAddonAssignment {
  addon_id: number;
  feature_level: string;
  is_included: boolean;
  default_quantity: number | null;
  min_quantity: number | null;
  max_quantity: number | null;
}

/* Mock child components */
vi.mock('@plan-management/components', () => ({
  ResourceSearchHeader: ({ title, showSearch, searchTerm, onSearchChange, onSearchToggle, onCreateToggle, showCreateForm, hideCreateButton, hideSearchButton }: {
    title: string;
    showSearch: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSearchToggle: () => void;
    onCreateToggle: () => void;
    showCreateForm: boolean;
    hideCreateButton?: boolean;
    hideSearchButton?: boolean
  }) => (
    <div data-testid="resource-search-header">
      <h2>{title}</h2>
      {!hideSearchButton && (
        <button onClick={onSearchToggle} data-testid="toggle-search">
          {showSearch ? 'Hide Search' : 'Show Search'}
        </button>
      )}
      {showSearch && (
        <input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          data-testid="search-input"
          placeholder="Search..."
        />
      )}
      {!hideCreateButton && (
        <button onClick={onCreateToggle} data-testid="create-button">
          {showCreateForm ? 'Cancel' : 'Create New'}
        </button>
      )}
    </div>
  )
}))

vi.mock('@plan-management/forms/tabs/components/addons/create-addon-form', () => ({
  default: ({ showCreateAddon, createAddonSubmitting, handleCreateAddon }: {
    showCreateAddon: boolean;
    createAddonSubmitting: boolean;
    handleCreateAddon: () => void
  }) => (
    showCreateAddon ? (
      <div data-testid="create-addon-form">
        <input data-testid="addon-name-input" placeholder="Addon name" />
        <button
          onClick={handleCreateAddon}
          disabled={createAddonSubmitting}
          data-testid="submit-addon"
        >
          {createAddonSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    ) : null
  )
}))

vi.mock('@plan-management/forms/tabs/components/addons/addons-grid', () => ({
  default: ({ loading, displayAddons, addonAssignments, handleToggleWithConfirm, isReadOnly }: {
    loading: boolean;
    displayAddons: MockAddon[];
    addonAssignments: MockAddonAssignment[];
    handleToggleWithConfirm: (id: number) => void;
    isReadOnly: boolean
  }) => (
    <div data-testid="addons-grid">
      {loading ? (
        <div data-testid="loading-skeleton">Loading...</div>
      ) : displayAddons.length === 0 ? (
        <div data-testid="empty-state">No add-ons available</div>
      ) : (
        <div>
          {displayAddons.map((addon) => {
            const isSelected = addonAssignments.some((a) => a.addon_id === addon.id)
            return (
              <div key={addon.id} data-testid={`addon-card-${addon.id}`}>
                <span>{addon.name}</span>
                {!isReadOnly && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleWithConfirm(addon.id)}
                    data-testid={`addon-checkbox-${addon.id}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}))

vi.mock('@plan-management/forms/tabs/components/addons/selected-addons-configuration', () => ({
  default: ({ addonAssignments, addons, onRemoveAddon }: {
    addonAssignments: MockAddonAssignment[];
    addons: MockAddon[];
    onRemoveAddon: (index: number) => void
  }) => (
    addonAssignments.length > 0 ? (
      <div data-testid="selected-addons-configuration">
        <h3>Selected Add-ons: {addonAssignments.length}</h3>
        {addonAssignments.map((assignment, index) => {
          const addon = addons.find((a) => a.id === assignment.addon_id)
          return addon ? (
            <div key={`${assignment.addon_id}-${index}`} data-testid={`addon-config-${index}`}>
              <span>{addon.name}</span>
              <button onClick={() => onRemoveAddon(index)} data-testid={`remove-addon-config-${index}`}>
                Remove
              </button>
            </div>
          ) : null
        })}
      </div>
    ) : null
  )
}))

vi.mock('@shared/components', () => ({
  ConfirmationDialog: ({ isOpen, title, message, onConfirm, onCancel }: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void
  }) => (
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
        <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
      </div>
    ) : null
  )
}))

describe('PlanAddonConfiguration', () => {
  const mockAddons = [
    { id: 1, name: 'Addon One', description: 'First addon', display_order: 1, is_active: true, base_price: '10.00', pricing_scope: 'branch', default_quantity: 1, min_quantity: 1 },
    { id: 2, name: 'Addon Two', description: 'Second addon', display_order: 2, is_active: true, base_price: '20.00', pricing_scope: 'organization', default_quantity: 1, min_quantity: 1 },
    { id: 3, name: 'Addon Three', description: 'Third addon', display_order: 3, is_active: true, base_price: '30.00', pricing_scope: 'branch', default_quantity: 1, min_quantity: 1 }
  ]

  const mockRefetch = vi.fn()
  const mockSetSearchTerm = vi.fn()
  const mockToggleSearch = vi.fn()
  const mockToggleCreateForm = vi.fn()
  const mockHandleSubmit = vi.fn()
  const mockHandleToggleWithConfirm = vi.fn()
  const mockHandleRemoveWithConfirm = vi.fn()
  const mockHandleConfirm = vi.fn()
  const mockHandleCancel = vi.fn()

  const defaultResourceManagementReturn = {
    resources: mockAddons,
    filteredResources: mockAddons,
    loading: false,
    error: '',
    searchTerm: '',
    setSearchTerm: mockSetSearchTerm,
    showSearch: false,
    toggleSearch: mockToggleSearch,
    refetch: mockRefetch
  }

  const defaultResourceCreationReturn = {
    showCreateForm: false,
    toggleCreateForm: mockToggleCreateForm,
    createForm: {
      register: vi.fn(),
      handleSubmit: vi.fn(),
      formState: { errors: {}, isDirty: false, isValid: false, isSubmitting: false, isValidating: false, isSubmitted: false, isSubmitSuccessful: false, submitCount: 0, touchedFields: {}, dirtyFields: {}, defaultValues: {}, isLoading: false, disabled: false, validatingFields: {}, isReady: true },
      watch: vi.fn(),
      getValues: vi.fn(),
      getFieldState: vi.fn(),
      setError: vi.fn(),
      clearErrors: vi.fn(),
      setValue: vi.fn(),
      trigger: vi.fn(),
      reset: vi.fn(),
      resetField: vi.fn(),
      setFocus: vi.fn(),
      unregister: vi.fn(),
      control: {} as Control<FieldValues>,
      subscribe: vi.fn()
    },
    isSubmitting: false,
    createError: null,
    handleSubmit: mockHandleSubmit
  }

  const defaultResourceConfirmationReturn = {
    confirmState: { show: false, resourceId: undefined, resourceName: undefined },
    handleToggleWithConfirm: mockHandleToggleWithConfirm,
    handleRemoveWithConfirm: mockHandleRemoveWithConfirm,
    handleConfirm: mockHandleConfirm,
    handleCancel: mockHandleCancel,
    resourceType: 'addon'
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
      mode: PLAN_FORM_MODES.CREATE,
      planId: undefined
    })

    vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue(defaultResourceManagementReturn)
    vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue(defaultResourceCreationReturn)
    vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue(defaultResourceConfirmationReturn)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = (props: Partial<React.ComponentProps<typeof PlanAddonConfiguration>> = {}) => {
    const methods = useForm<CreatePlanFormData>({
      defaultValues: {
        addon_assignments: [
          { addon_id: 1, feature_level: 'basic', is_included: false, default_quantity: 1, min_quantity: 1, max_quantity: null }
        ]
      }
    })

    return (
      <FormProvider {...methods}>
        <PlanAddonConfiguration isActive={true} {...props} />
      </FormProvider>
    )
  }

  describe('Component Rendering', () => {
    it('should render resource search header', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('resource-search-header')).toBeInTheDocument()
    })

    it('should render addons grid', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('addons-grid')).toBeInTheDocument()
    })

    it('should render selected addons configuration', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('selected-addons-configuration')).toBeInTheDocument()
    })

    it('should not render create form initially', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('create-addon-form')).not.toBeInTheDocument()
    })
  })

  describe('CREATE Mode', () => {
    it('should display "Available Add-ons" title in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Available Add-ons')).toBeInTheDocument()
    })

    it('should show create button in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('create-button')).toBeInTheDocument()
    })

    it('should show search toggle in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('toggle-search')).toBeInTheDocument()
    })

    it('should display all addons in grid', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('addon-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('addon-card-2')).toBeInTheDocument()
      expect(screen.getByTestId('addon-card-3')).toBeInTheDocument()
    })

    it('should show checkboxes for addon selection', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('addon-checkbox-1')).toBeInTheDocument()
      expect(screen.getByTestId('addon-checkbox-2')).toBeInTheDocument()
    })

    it('should show checked state for selected addons', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const checkbox = screen.getByTestId('addon-checkbox-1')
      expect(checkbox).toBeChecked()
    })
  })

  describe('EDIT Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })
    })

    it('should allow addon selection in EDIT mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('addon-checkbox-1')).toBeInTheDocument()
    })

    it('should show create button in EDIT mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('create-button')).toBeInTheDocument()
    })
  })

  describe('VIEW Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })
    })

    it('should display "Included Add-ons" title with count in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Included Add-ons (1)')).toBeInTheDocument()
    })

    it('should not show create button in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('create-button')).not.toBeInTheDocument()
    })

    it('should not show checkboxes in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('addon-checkbox-1')).not.toBeInTheDocument()
    })

    it('should only display selected addons in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Only addon 1 is selected */
      expect(screen.getByTestId('addon-card-1')).toBeInTheDocument()
    })

    it('should not show addon configuration in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('selected-addons-configuration')).not.toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should toggle search visibility', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTestId('toggle-search')
      await user.click(toggleButton)

      expect(mockToggleSearch).toHaveBeenCalledTimes(1)
    })

    it('should show search input when search is active', () => {
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        showSearch: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })

    it('should handle search term changes', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        showSearch: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'test')

      expect(mockSetSearchTerm).toHaveBeenCalled()
    })

    it('should display filtered addons based on search', () => {
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        filteredResources: [mockAddons[0]]
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('addon-card-1')).toBeInTheDocument()
      expect(screen.queryByTestId('addon-card-2')).not.toBeInTheDocument()
    })
  })

  describe('Addon Creation', () => {
    it('should toggle create form visibility', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const createButton = screen.getByTestId('create-button')
      await user.click(createButton)

      expect(mockToggleCreateForm).toHaveBeenCalledTimes(1)
    })

    it('should show create form when toggled', () => {
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('create-addon-form')).toBeInTheDocument()
    })

    it('should hide addons grid when create form is shown', () => {
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('addons-grid')).not.toBeInTheDocument()
    })

    it('should display "Create New Add-on" title when creating', () => {
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Create Add-on')).toBeInTheDocument()
    })

    it('should handle create form submission', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('submit-addon')
      await user.click(submitButton)

      expect(mockHandleSubmit).toHaveBeenCalled()
    })

    it('should disable submit button when submitting', () => {
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true,
        isSubmitting: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('submit-addon')
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Submitting...')
    })
  })

  describe('Addon Selection and Configuration', () => {
    it('should handle addon selection toggle', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const checkbox = screen.getByTestId('addon-checkbox-2')
      await user.click(checkbox)

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(2)
    })

    it('should show selected addon in configuration', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('addon-config-0')).toBeInTheDocument()
      const selectedAddon = screen.getByTestId('addon-config-0')
      expect(selectedAddon).toHaveTextContent('Addon One')
    })

    it('should display selected addons count', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Selected Add-ons: 1')).toBeInTheDocument()
    })

    it('should handle remove addon from configuration', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const removeButton = screen.getByTestId('remove-addon-config-0')
      await user.click(removeButton)

      expect(mockHandleRemoveWithConfirm).toHaveBeenCalledWith(1)
    })
  })

  describe('Confirmation Dialog', () => {
    it('should not show confirmation dialog initially', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })

    it('should show confirmation dialog when removing addon', () => {
      vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        ...defaultResourceConfirmationReturn,
        confirmState: { show: true, resourceId: 1, resourceName: 'Addon One' }
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      const confirmDialog = screen.getByTestId('confirmation-dialog')
      expect(confirmDialog).toHaveTextContent('Addon One')
    })

    it('should handle confirmation', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        ...defaultResourceConfirmationReturn,
        confirmState: { show: true, resourceId: 1, resourceName: 'Addon One' }
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const confirmButton = screen.getByTestId('confirm-button')
      await user.click(confirmButton)

      expect(mockHandleConfirm).toHaveBeenCalledTimes(1)
    })

    it('should handle cancellation', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        ...defaultResourceConfirmationReturn,
        confirmState: { show: true, resourceId: 1, resourceName: 'Addon One' }
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const cancelButton = screen.getByTestId('cancel-button')
      await user.click(cancelButton)

      expect(mockHandleCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading States', () => {
    it('should show loading skeleton when loading', () => {
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        loading: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should hide create button when loading', () => {
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        loading: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('create-button')).not.toBeInTheDocument()
    })

    it('should hide search toggle when loading', () => {
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        loading: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('toggle-search')).not.toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no addons available', () => {
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        resources: [],
        filteredResources: []
      })

      const TestComponentEmpty = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { addon_assignments: [] }
        })
        return (
          <FormProvider {...methods}>
            <PlanAddonConfiguration isActive={true} />
          </FormProvider>
        )
      }

      render(<TestComponentEmpty />, { wrapper: TestWrapper })

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText('No add-ons available')).toBeInTheDocument()
    })

    it('should not show addon configuration when none selected', () => {
      const TestComponentEmpty = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { addon_assignments: [] }
        })
        return (
          <FormProvider {...methods}>
            <PlanAddonConfiguration isActive={true} />
          </FormProvider>
        )
      }

      render(<TestComponentEmpty />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('selected-addons-configuration')).not.toBeInTheDocument()
    })

    it('should hide search toggle in VIEW mode when no addons selected', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })

      const TestComponentEmpty = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { addon_assignments: [] }
        })
        return (
          <FormProvider {...methods}>
            <PlanAddonConfiguration isActive={true} />
          </FormProvider>
        )
      }

      render(<TestComponentEmpty />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('toggle-search')).not.toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete addon configuration workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Toggle search */
      await user.click(screen.getByTestId('toggle-search'))
      expect(mockToggleSearch).toHaveBeenCalled()

      /* Select addon */
      await user.click(screen.getByTestId('addon-checkbox-2'))
      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(2)
    })

    it('should handle addon creation workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Open create form */
      await user.click(screen.getByTestId('create-button'))
      expect(mockToggleCreateForm).toHaveBeenCalled()
    })
  })
})
