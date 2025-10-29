/* Comprehensive test suite for PlanFeatureSelection component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider, Control, FieldValues } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Plan module imports */
import PlanFeatureSelection from '@plan-management/forms/tabs/feature-selection'
import { CreatePlanFormData } from '@plan-management/schemas'
import { PLAN_FORM_MODES } from '@plan-management/constants'
import * as planFormModeContext from '@plan-management/contexts'
import * as resourceManagementHook from '@plan-management/hooks/use-resource-management'
import * as resourceSelectionHook from '@plan-management/hooks/use-resource-selection'
import * as resourceConfirmationHook from '@plan-management/hooks/use-resource-confirmation'

/* Type definitions for mock components */
interface MockFeature {
  id: number;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
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

vi.mock('@plan-management/forms/tabs/components/features/create-feature-form', () => ({
  default: ({ showCreateFeature, createFeatureSubmitting, handleCreateFeature }: {
    showCreateFeature: boolean;
    createFeatureSubmitting: boolean;
    handleCreateFeature: () => void
  }) => (
    showCreateFeature ? (
      <div data-testid="create-feature-form">
        <input data-testid="feature-name-input" placeholder="Feature name" />
        <button
          onClick={handleCreateFeature}
          disabled={createFeatureSubmitting}
          data-testid="submit-feature"
        >
          {createFeatureSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    ) : null
  )
}))

vi.mock('@plan-management/forms/tabs/components/features/features-grid', () => ({
  default: ({ loading, displayResources, selectedFeatureIds, handleToggleWithConfirm, isReadOnly }: {
    loading: boolean;
    displayResources: MockFeature[];
    selectedFeatureIds: number[];
    handleToggleWithConfirm: (id: number) => void;
    isReadOnly: boolean
  }) => (
    <div data-testid="features-grid">
      {loading ? (
        <div data-testid="loading-skeleton">Loading...</div>
      ) : displayResources.length === 0 ? (
        <div data-testid="empty-state">No features available</div>
      ) : (
        <div>
          {displayResources.map((feature) => (
            <div key={feature.id} data-testid={`feature-card-${feature.id}`}>
              <span>{feature.name}</span>
              {!isReadOnly && (
                <input
                  type="checkbox"
                  checked={selectedFeatureIds.includes(feature.id)}
                  onChange={() => handleToggleWithConfirm(feature.id)}
                  data-testid={`feature-checkbox-${feature.id}`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}))

vi.mock('@plan-management/forms/tabs/components/features/selected-features-summary', () => ({
  default: ({ selectedFeatures, onRemove, readOnly }: {
    selectedFeatures: MockFeature[];
    onRemove: (id: number) => void;
    readOnly: boolean
  }) => (
    !readOnly && selectedFeatures.length > 0 ? (
      <div data-testid="selected-features-summary">
        <h3>Selected Features: {selectedFeatures.length}</h3>
        {selectedFeatures.map((feature) => (
          <div key={feature.id} data-testid={`selected-feature-${feature.id}`}>
            <span>{feature.name}</span>
            <button onClick={() => onRemove(feature.id)} data-testid={`remove-feature-${feature.id}`}>
              Remove
            </button>
          </div>
        ))}
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

describe('PlanFeatureSelection', () => {
  const mockFeatures = [
    { id: 1, name: 'Feature One', description: 'First feature', display_order: 1, is_active: true },
    { id: 2, name: 'Feature Two', description: 'Second feature', display_order: 2, is_active: true },
    { id: 3, name: 'Feature Three', description: 'Third feature', display_order: 3, is_active: true }
  ]

  const mockRefetch = vi.fn()
  const mockSetSearchTerm = vi.fn()
  const mockToggleSearch = vi.fn()
  const mockToggleSelection = vi.fn()
  const mockRemoveSelection = vi.fn()
  const mockToggleCreateForm = vi.fn()
  const mockHandleSubmit = vi.fn()
  const mockHandleToggleWithConfirm = vi.fn()
  const mockHandleRemoveWithConfirm = vi.fn()
  const mockHandleConfirm = vi.fn()
  const mockHandleCancel = vi.fn()

  const defaultResourceManagementReturn = {
    resources: mockFeatures,
    filteredResources: mockFeatures,
    loading: false,
    error: '',
    searchTerm: '',
    setSearchTerm: mockSetSearchTerm,
    showSearch: false,
    toggleSearch: mockToggleSearch,
    refetch: mockRefetch
  }

  const defaultResourceSelectionReturn = {
    selectedIds: [1],
    selectedResources: [mockFeatures[0]],
    toggleSelection: mockToggleSelection,
    removeSelection: mockRemoveSelection,
    isSelected: vi.fn((id: number) => [1].includes(id)),
    validateSelection: vi.fn()
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
    resourceType: 'feature'
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
      mode: PLAN_FORM_MODES.CREATE,
      planId: undefined
    })

    vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue(defaultResourceManagementReturn)
    vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue(defaultResourceCreationReturn)
    vi.spyOn(resourceSelectionHook, 'useResourceSelection').mockReturnValue(defaultResourceSelectionReturn)
    vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue(defaultResourceConfirmationReturn)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = (props: Partial<React.ComponentProps<typeof PlanFeatureSelection>> = {}) => {
    const methods = useForm<CreatePlanFormData>({
      defaultValues: {
        feature_ids: [1]
      }
    })

    return (
      <FormProvider {...methods}>
        <PlanFeatureSelection isActive={true} {...props} />
      </FormProvider>
    )
  }

  describe('Component Rendering', () => {
    it('should render resource search header', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('resource-search-header')).toBeInTheDocument()
    })

    it('should render features grid', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('features-grid')).toBeInTheDocument()
    })

    it('should render selected features summary', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('selected-features-summary')).toBeInTheDocument()
    })

    it('should not render create form initially', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('create-feature-form')).not.toBeInTheDocument()
    })
  })

  describe('CREATE Mode', () => {
    it('should display "Available Features" title in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Available Features')).toBeInTheDocument()
    })

    it('should show create button in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('create-button')).toBeInTheDocument()
    })

    it('should show search toggle in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('toggle-search')).toBeInTheDocument()
    })

    it('should display all features in grid', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('feature-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('feature-card-2')).toBeInTheDocument()
      expect(screen.getByTestId('feature-card-3')).toBeInTheDocument()
    })

    it('should show checkboxes for feature selection', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('feature-checkbox-1')).toBeInTheDocument()
      expect(screen.getByTestId('feature-checkbox-2')).toBeInTheDocument()
    })
  })

  describe('EDIT Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })
    })

    it('should allow feature selection in EDIT mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('feature-checkbox-1')).toBeInTheDocument()
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

    it('should display "Included Features" title with count in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Included Features (1)')).toBeInTheDocument()
    })

    it('should not show create button in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('create-button')).not.toBeInTheDocument()
    })

    it('should not show checkboxes in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('feature-checkbox-1')).not.toBeInTheDocument()
    })

    it('should only display selected features in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Only feature 1 is selected */
      expect(screen.getByTestId('feature-card-1')).toBeInTheDocument()
    })

    it('should not show selected features summary in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('selected-features-summary')).not.toBeInTheDocument()
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

    it('should display filtered features based on search', () => {
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        filteredResources: [mockFeatures[0]]
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('feature-card-1')).toBeInTheDocument()
      expect(screen.queryByTestId('feature-card-2')).not.toBeInTheDocument()
    })
  })

  describe('Feature Creation', () => {
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

      expect(screen.getByTestId('create-feature-form')).toBeInTheDocument()
    })

    it('should hide features grid when create form is shown', () => {
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('features-grid')).not.toBeInTheDocument()
    })

    it('should display "Create New Feature" title when creating', () => {
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Create Feature')).toBeInTheDocument()
    })

    it('should handle create form submission', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('submit-feature')
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

      const submitButton = screen.getByTestId('submit-feature')
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Submitting...')
    })
  })

  describe('Feature Selection', () => {
    it('should handle feature selection toggle', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const checkbox = screen.getByTestId('feature-checkbox-2')
      await user.click(checkbox)

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(2)
    })

    it('should show selected feature in summary', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('selected-feature-1')).toBeInTheDocument()
      const selectedFeature = screen.getByTestId('selected-feature-1')
      expect(selectedFeature).toHaveTextContent('Feature One')
    })

    it('should display selected features count', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Selected Features: 1')).toBeInTheDocument()
    })

    it('should handle remove feature from summary', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const removeButton = screen.getByTestId('remove-feature-1')
      await user.click(removeButton)

      expect(mockHandleRemoveWithConfirm).toHaveBeenCalledWith(1)
    })
  })

  describe('Confirmation Dialog', () => {
    it('should not show confirmation dialog initially', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })

    it('should show confirmation dialog when removing feature', () => {
      vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        ...defaultResourceConfirmationReturn,
        confirmState: { show: true, resourceId: 1, resourceName: 'Feature One' }
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      const confirmDialog = screen.getByTestId('confirmation-dialog')
      expect(confirmDialog).toHaveTextContent('Feature One')
    })

    it('should handle confirmation', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        ...defaultResourceConfirmationReturn,
        confirmState: { show: true, resourceId: 1, resourceName: 'Feature One' }
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
        confirmState: { show: true, resourceId: 1, resourceName: 'Feature One' }
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
    it('should show empty state when no features available', () => {
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        resources: [],
        filteredResources: []
      })

      vi.spyOn(resourceSelectionHook, 'useResourceSelection').mockReturnValue({
        ...defaultResourceSelectionReturn,
        selectedIds: [],
        selectedResources: []
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText('No features available')).toBeInTheDocument()
    })

    it('should not show selected features summary when none selected', () => {
      vi.spyOn(resourceSelectionHook, 'useResourceSelection').mockReturnValue({
        ...defaultResourceSelectionReturn,
        selectedIds: [],
        selectedResources: []
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('selected-features-summary')).not.toBeInTheDocument()
    })

    it('should hide search toggle in VIEW mode when no features selected', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })

      vi.spyOn(resourceSelectionHook, 'useResourceSelection').mockReturnValue({
        ...defaultResourceSelectionReturn,
        selectedIds: [],
        selectedResources: []
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('toggle-search')).not.toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete feature selection workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Toggle search */
      await user.click(screen.getByTestId('toggle-search'))
      expect(mockToggleSearch).toHaveBeenCalled()

      /* Select feature */
      await user.click(screen.getByTestId('feature-checkbox-2'))
      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(2)
    })

    it('should handle feature creation workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Open create form */
      await user.click(screen.getByTestId('create-button'))
      expect(mockToggleCreateForm).toHaveBeenCalled()
    })
  })
})
