/* Comprehensive test suite for PlanSlaConfiguration component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider, Control, FieldValues } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Plan module imports */
import PlanSlaConfiguration from '@plan-management/forms/tabs/sla-configuration'
import { CreatePlanFormData } from '@plan-management/schemas'
import { PLAN_FORM_MODES } from '@plan-management/constants'
import * as planFormModeContext from '@plan-management/contexts'
import * as resourceManagementHook from '@plan-management/hooks/use-resource-management'
import * as resourceSelectionHook from '@plan-management/hooks/use-resource-selection'
import * as resourceConfirmationHook from '@plan-management/hooks/use-resource-confirmation'

/* Type definitions for mock components */
interface MockSLA {
  id: number;
  name: string;
  support_channel: string;
  response_time_hours: number;
  availability_schedule: string;
  notes: string;
  display_order: number;
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

vi.mock('@plan-management/forms/tabs/components/slas/create-sla-form', () => ({
  default: ({ showCreateSla, createSlaSubmitting, handleCreateSla }: {
    showCreateSla: boolean;
    createSlaSubmitting: boolean;
    handleCreateSla: () => void
  }) => (
    showCreateSla ? (
      <div data-testid="create-sla-form">
        <input data-testid="sla-name-input" placeholder="SLA name" />
        <button
          onClick={handleCreateSla}
          disabled={createSlaSubmitting}
          data-testid="submit-sla"
        >
          {createSlaSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    ) : null
  )
}))

vi.mock('@plan-management/forms/tabs/components/slas/slas-grid', () => ({
  default: ({ loading, displaySlas, selectedSlaIds, handleToggleWithConfirm, isReadOnly }: {
    loading: boolean;
    displaySlas: MockSLA[];
    selectedSlaIds: number[];
    handleToggleWithConfirm: (id: number) => void;
    isReadOnly: boolean
  }) => (
    <div data-testid="slas-grid">
      {loading ? (
        <div data-testid="loading-skeleton">Loading...</div>
      ) : displaySlas.length === 0 ? (
        <div data-testid="empty-state">No SLAs available</div>
      ) : (
        <div>
          {displaySlas.map((sla) => (
            <div key={sla.id} data-testid={`sla-card-${sla.id}`}>
              <span>{sla.name}</span>
              {!isReadOnly && (
                <input
                  type="checkbox"
                  checked={selectedSlaIds.includes(sla.id)}
                  onChange={() => handleToggleWithConfirm(sla.id)}
                  data-testid={`sla-checkbox-${sla.id}`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}))

vi.mock('@plan-management/forms/tabs/components/slas/selected-slas-summary', () => ({
  default: ({ selectedSlas, onRemove, readOnly }: {
    selectedSlas: MockSLA[];
    onRemove: (id: number) => void;
    readOnly: boolean
  }) => (
    !readOnly && selectedSlas.length > 0 ? (
      <div data-testid="selected-slas-summary">
        <h3>Selected SLAs: {selectedSlas.length}</h3>
        {selectedSlas.map((sla) => (
          <div key={sla.id} data-testid={`selected-sla-${sla.id}`}>
            <span>{sla.name}</span>
            <button onClick={() => onRemove(sla.id)} data-testid={`remove-sla-${sla.id}`}>
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

describe('PlanSlaConfiguration', () => {
  const mockSlas = [
    { id: 1, name: 'SLA One', support_channel: 'Email', response_time_hours: 24, availability_schedule: '24/7', notes: 'Basic support', display_order: 1 },
    { id: 2, name: 'SLA Two', support_channel: 'Phone', response_time_hours: 4, availability_schedule: 'Business hours', notes: 'Priority support', display_order: 2 },
    { id: 3, name: 'SLA Three', support_channel: 'Chat', response_time_hours: 1, availability_schedule: '24/7', notes: 'Premium support', display_order: 3 }
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
    resources: mockSlas,
    filteredResources: mockSlas,
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
    selectedResources: [mockSlas[0]],
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
    resourceType: 'sla'
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
      mode: PLAN_FORM_MODES.CREATE,
      planId: undefined
    })

    vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue(defaultResourceManagementReturn)
    vi.spyOn(resourceSelectionHook, 'useResourceSelection').mockReturnValue(defaultResourceSelectionReturn)
    vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue(defaultResourceCreationReturn)
    vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue(defaultResourceConfirmationReturn)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = (props: Partial<React.ComponentProps<typeof PlanSlaConfiguration>> = {}) => {
    const methods = useForm<CreatePlanFormData>({
      defaultValues: {
        support_sla_ids: [1]
      }
    })

    return (
      <FormProvider {...methods}>
        <PlanSlaConfiguration isActive={true} {...props} />
      </FormProvider>
    )
  }

  describe('Component Rendering', () => {
    it('should render resource search header', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('resource-search-header')).toBeInTheDocument()
    })

    it('should render SLAs grid', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('slas-grid')).toBeInTheDocument()
    })

    it('should render selected SLAs summary', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('selected-slas-summary')).toBeInTheDocument()
    })

    it('should not render create form initially', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('create-sla-form')).not.toBeInTheDocument()
    })
  })

  describe('CREATE Mode', () => {
    it('should display "Available SLAs" title in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Available SLAs')).toBeInTheDocument()
    })

    it('should show create button in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('create-button')).toBeInTheDocument()
    })

    it('should show search toggle in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('toggle-search')).toBeInTheDocument()
    })

    it('should display all SLAs in grid', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('sla-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('sla-card-2')).toBeInTheDocument()
      expect(screen.getByTestId('sla-card-3')).toBeInTheDocument()
    })

    it('should show checkboxes for SLA selection', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('sla-checkbox-1')).toBeInTheDocument()
      expect(screen.getByTestId('sla-checkbox-2')).toBeInTheDocument()
    })
  })

  describe('EDIT Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })
    })

    it('should allow SLA selection in EDIT mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('sla-checkbox-1')).toBeInTheDocument()
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

    it('should display "Included SLAs" title with count in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Included SLAs (1)')).toBeInTheDocument()
    })

    it('should not show create button in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('create-button')).not.toBeInTheDocument()
    })

    it('should not show checkboxes in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('sla-checkbox-1')).not.toBeInTheDocument()
    })

    it('should only display selected SLAs in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Only SLA 1 is selected */
      expect(screen.getByTestId('sla-card-1')).toBeInTheDocument()
    })

    it('should not show selected SLAs summary in VIEW mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('selected-slas-summary')).not.toBeInTheDocument()
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

    it('should display filtered SLAs based on search', () => {
      vi.spyOn(resourceManagementHook, 'useResourceManagement').mockReturnValue({
        ...defaultResourceManagementReturn,
        filteredResources: [mockSlas[0]]
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('sla-card-1')).toBeInTheDocument()
      expect(screen.queryByTestId('sla-card-2')).not.toBeInTheDocument()
    })
  })

  describe('SLA Creation', () => {
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

      expect(screen.getByTestId('create-sla-form')).toBeInTheDocument()
    })

    it('should hide SLAs grid when create form is shown', () => {
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('slas-grid')).not.toBeInTheDocument()
    })

    it('should display "Create New SLA" title when creating', () => {
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Create SLA')).toBeInTheDocument()
    })

    it('should handle create form submission', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceManagementHook, 'useResourceCreation').mockReturnValue({
        ...defaultResourceCreationReturn,
        showCreateForm: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('submit-sla')
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

      const submitButton = screen.getByTestId('submit-sla')
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Submitting...')
    })
  })

  describe('SLA Selection', () => {
    it('should handle SLA selection toggle', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const checkbox = screen.getByTestId('sla-checkbox-2')
      await user.click(checkbox)

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(2)
    })

    it('should show selected SLA in summary', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('selected-sla-1')).toBeInTheDocument()
      const selectedSla = screen.getByTestId('selected-sla-1')
      expect(selectedSla).toHaveTextContent('SLA One')
    })

    it('should display selected SLAs count', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Selected SLAs: 1')).toBeInTheDocument()
    })

    it('should handle remove SLA from summary', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const removeButton = screen.getByTestId('remove-sla-1')
      await user.click(removeButton)

      expect(mockHandleRemoveWithConfirm).toHaveBeenCalledWith(1)
    })
  })

  describe('Confirmation Dialog', () => {
    it('should not show confirmation dialog initially', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
    })

    it('should show confirmation dialog when removing SLA', () => {
      vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        ...defaultResourceConfirmationReturn,
        confirmState: { show: true, resourceId: 1, resourceName: 'SLA One' }
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
      const confirmDialog = screen.getByTestId('confirmation-dialog')
      expect(confirmDialog).toHaveTextContent('SLA One')
    })

    it('should handle confirmation', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceConfirmationHook, 'useResourceConfirmation').mockReturnValue({
        ...defaultResourceConfirmationReturn,
        confirmState: { show: true, resourceId: 1, resourceName: 'SLA One' }
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
        confirmState: { show: true, resourceId: 1, resourceName: 'SLA One' }
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
    it('should show empty state when no SLAs available', () => {
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
      expect(screen.getByText('No SLAs available')).toBeInTheDocument()
    })

    it('should not show selected SLAs summary when none selected', () => {
      vi.spyOn(resourceSelectionHook, 'useResourceSelection').mockReturnValue({
        ...defaultResourceSelectionReturn,
        selectedIds: [],
        selectedResources: []
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('selected-slas-summary')).not.toBeInTheDocument()
    })

    it('should hide search toggle in VIEW mode when no SLAs selected', () => {
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
    it('should handle complete SLA selection workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Toggle search */
      await user.click(screen.getByTestId('toggle-search'))
      expect(mockToggleSearch).toHaveBeenCalled()

      /* Select SLA */
      await user.click(screen.getByTestId('sla-checkbox-2'))
      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(2)
    })

    it('should handle SLA creation workflow', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Open create form */
      await user.click(screen.getByTestId('create-button'))
      expect(mockToggleCreateForm).toHaveBeenCalled()
    })
  })
})
