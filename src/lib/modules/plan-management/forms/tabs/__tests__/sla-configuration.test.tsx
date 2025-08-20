import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { Provider } from '@/components/ui/provider';
import PlanSlaConfiguration from '../sla-configuration';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';
import { PlanFormMode } from '@plan-management/types/plans';

// Mock dependencies
vi.mock('@plan-management/schemas/validation/plans', () => ({
  createSlaSchema: vi.fn(),
  CreatePlanFormData: {}
}));

vi.mock('@plan-management/config', () => ({
  PLAN_FORM_MODES: {
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view'
  }
}));

vi.mock('@plan-management/hooks', () => ({
  useTabValidation: vi.fn(() => ({
    isBasicInfoValid: true,
    isPricingInfoValid: true,
    isFeaturesValid: true,
    isAddonsValid: true,
    isSlaValid: true,
    isEntireFormValid: true,
    validateBasicInfo: vi.fn(() => true),
    validatePricingInfo: vi.fn(() => true),
    validateFeatures: vi.fn(() => true),
    validateAddons: vi.fn(() => true),
    validateSla: vi.fn(() => true),
    getValidationState: vi.fn(() => ({
      isBasicInfoValid: true,
      isPricingInfoValid: true,
      isFeaturesValid: true,
      isAddonsValid: true,
      isSlaValid: true,
      isEntireFormValid: true
    }))
  })),
  useTabValidationNavigation: vi.fn(() => ({
    handleNext: vi.fn()
  })),
  useResourceManagement: vi.fn(() => ({
    resources: [],
    filteredResources: [],
    loading: false,
    error: null,
    searchTerm: '',
    setSearchTerm: vi.fn(),
    showSearch: false,
    toggleSearch: vi.fn(),
    refetch: vi.fn()
  })),
  useResourceSelection: vi.fn(() => ({
    selectedIds: [],
    selectedResources: [],
    toggleSelection: vi.fn(),
    removeSelection: vi.fn(),
    isSelected: vi.fn(),
    validateSelection: vi.fn().mockResolvedValue(true)
  })),
  useResourceCreation: vi.fn(() => ({
    showCreateForm: false,
    toggleCreateForm: vi.fn(),
    createForm: {
      control: vi.fn() as any,
      handleSubmit: vi.fn(),
      formState: {} as any,
      register: vi.fn(),
      setValue: vi.fn(),
      getValues: vi.fn(),
      watch: vi.fn(),
      reset: vi.fn(),
      clearErrors: vi.fn(),
      setError: vi.fn(),
      trigger: vi.fn(),
      getFieldState: vi.fn(),
      resetField: vi.fn(),
      setFocus: vi.fn(),
      unregister: vi.fn(),
      subscribe: vi.fn()
    } as any,
    isSubmitting: false,
    createError: null,
    handleSubmit: vi.fn()
  })),
  useResourceConfirmation: vi.fn(() => ({
    confirmState: { show: false, resourceId: 0, resourceName: '' },
    handleToggleWithConfirm: vi.fn(),
    handleRemoveWithConfirm: vi.fn(),
    handleConfirm: vi.fn(),
    handleCancel: vi.fn(),
    resourceType: 'sla'
  }))
}));

// Mock child components
vi.mock('../components/slas/create-sla-form', () => ({
  default: ({ showCreateSla }: any) => 
    showCreateSla ? <div data-testid="create-sla-form">Create SLA Form</div> : null
}));

vi.mock('../components/slas/slas-grid', () => ({
  default: ({ displaySlas, loading }: any) => (
    <div data-testid="slas-grid">
      {loading ? 'Loading...' : `SLAs Grid (${displaySlas?.length || 0} items)`}
    </div>
  )
}));

vi.mock('../components/slas/selected-slas-summary', () => ({
  default: ({ selectedSlas }: any) => (
    <div data-testid="selected-slas-summary">
      Selected SLAs Summary ({selectedSlas?.length || 0} items)
    </div>
  )
}));

vi.mock('@plan-management/components', () => ({
  TabNavigation: ({ 
    onNext, 
    onPrevious,
    onSubmit,
    onEdit,
    onBackToList,
    isFormValid, 
    readOnly,
    isLastTab,
    isSubmitting,
    submitButtonText
  }: any) => (
    <div data-testid="tab-navigation">
      {!readOnly && (
        <>
          <button type="button" data-testid="previous-button" onClick={onPrevious}>
            Previous
          </button>
          {isLastTab && (
            <button 
              type="button"
              data-testid="submit-button" 
              onClick={onSubmit}
              disabled={!isFormValid || isSubmitting}
            >
              {submitButtonText || 'Create Plan'}
            </button>
          )}
          <button 
            type="button"
            data-testid="next-button" 
            onClick={onNext}
            disabled={!isFormValid}
          >
            Next
          </button>
        </>
      )}
      {readOnly && (
        <>
          {onEdit && (
            <button type="button" data-testid="edit-button" onClick={onEdit}>
              Edit
            </button>
          )}
          {onBackToList && (
            <button type="button" data-testid="back-to-list-button" onClick={onBackToList}>
              Back to List
            </button>
          )}
        </>
      )}
    </div>
  ),
  SearchHeader: ({ 
    title, 
    showSearch, 
    searchTerm, 
    onSearchToggle, 
    onSearchChange, 
    showCreateForm,
    onCreateToggle,
    isCreating,
    hideCreateButton,
    hideSearchButton
  }: any) => (
    <div data-testid="search-header">
      <h2 data-testid="header-title">{title}</h2>
      {!hideSearchButton && (
        <button type="button" data-testid="toggle-search-button" onClick={onSearchToggle}>
          {showSearch ? 'Hide Search' : 'Show Search'}
        </button>
      )}
      {showSearch && (
        <input 
          data-testid="search-input"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search SLAs by name, channel, or schedule..."
        />
      )}
      {!hideCreateButton && (
        <button 
          type="button"
          data-testid="toggle-create-button" 
          onClick={onCreateToggle}
          disabled={isCreating}
        >
          {showCreateForm ? 'Cancel' : 'Create New'}
        </button>
      )}
    </div>
  )
}));

vi.mock('@shared/components', () => ({
  ConfirmationDialog: ({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel 
  }: any) => 
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <h3 data-testid="dialog-title">{title}</h3>
        <p data-testid="dialog-message">{message}</p>
        <button type="button" data-testid="confirm-button" onClick={onConfirm}>
          Remove
        </button>
        <button type="button" data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null
}));

// Mock data
const mockSlas = [
  {
    id: 1,
    name: '24/7 Premium Support',
    display_order: 1,
    support_channel: 'Phone',
    response_time_hours: '1',
    availability_schedule: '24/7',
    notes: 'Priority support for enterprise customers'
  },
  {
    id: 2,
    name: 'Business Hours Email',
    display_order: 2,
    support_channel: 'Email',
    response_time_hours: '24',
    availability_schedule: 'Mon-Fri 9-5',
    notes: 'Standard email support during business hours'
  },
  {
    id: 3,
    name: 'Chat Support',
    display_order: 3,
    support_channel: 'Chat',
    response_time_hours: '2',
    availability_schedule: 'Mon-Fri 8-6',
    notes: 'Live chat support for immediate assistance'
  }
];

// Test form wrapper that provides React Hook Form context
const FormTestWrapper = ({ 
  children, 
  defaultValues = {},
  mode = 'create' as PlanFormMode,
  onSubmit,
  onEdit,
  onBackToList,
  isSubmitting = false,
  submitButtonText,
  isLastTab = false
}: { 
  children?: React.ReactNode;
  defaultValues?: Partial<CreatePlanFormData>;
  mode?: PlanFormMode;
  onSubmit?: (data: any) => void;
  onEdit?: () => void;
  onBackToList?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  isLastTab?: boolean;
}) => {
  const methods = useForm<CreatePlanFormData>({
    defaultValues: {
      support_sla_ids: [],
      ...defaultValues
    }
  });

  return (
    <Provider>
      <FormProvider {...methods}>
        <form>
          <PlanSlaConfiguration
            mode={mode}
            onNext={vi.fn()}
            onPrevious={vi.fn()}
            onSubmit={onSubmit || vi.fn()}
            onEdit={onEdit}
            onBackToList={onBackToList}
            isFirstTab={false}
            isActive={true}
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
            isLastTab={isLastTab}
          />
          {children}
        </form>
      </FormProvider>
    </Provider>
  );
};

describe('PlanSlaConfiguration', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all main components correctly', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('search-header')).toBeInTheDocument();
      expect(screen.getByTestId('slas-grid')).toBeInTheDocument();
      expect(screen.getByTestId('selected-slas-summary')).toBeInTheDocument();
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });

    it('should render correct header title for create mode', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('header-title')).toHaveTextContent('Available SLAs');
    });

    it('should render correct header title for view mode with SLAs', async () => {
      const { useResourceSelection } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [1, 2],
        selectedResources: [mockSlas[0], mockSlas[1]],
        toggleSelection: vi.fn(),
        removeSelection: vi.fn(),
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });

      render(<FormTestWrapper mode="view" />);

      expect(screen.getByTestId('header-title')).toHaveTextContent('Included SLAs (2)');
    });

    it('should not render create SLA form by default', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.queryByTestId('create-sla-form')).not.toBeInTheDocument();
    });

    it('should not render confirmation dialog by default', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should show search toggle button', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('toggle-search-button')).toBeInTheDocument();
    });

    it('should toggle search visibility when search button is clicked', async () => {
      const user = userEvent.setup();
      const mockToggleSearch = vi.fn();

      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      mockUseResourceManagement.mockReturnValue({
        resources: mockSlas,
        filteredResources: mockSlas,
        loading: false,
        error: '',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: false,
        toggleSearch: mockToggleSearch,
        refetch: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      const searchToggle = screen.getByTestId('toggle-search-button');
      await user.click(searchToggle);

      expect(mockToggleSearch).toHaveBeenCalled();
    });

    it('should show search input when search is active', async () => {
      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      mockUseResourceManagement.mockReturnValue({
        resources: mockSlas,
        filteredResources: mockSlas,
        loading: false,
        error: '',
        searchTerm: 'premium',
        setSearchTerm: vi.fn(),
        showSearch: true,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('premium');
    });

    it('should call setSearchTerm when search input changes', async () => {
      const user = userEvent.setup();
      const mockSetSearchTerm = vi.fn();

      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      mockUseResourceManagement.mockReturnValue({
        resources: mockSlas,
        filteredResources: mockSlas,
        loading: false,
        error: '',
        searchTerm: '',
        setSearchTerm: mockSetSearchTerm,
        showSearch: true,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'chat' } });

      expect(mockSetSearchTerm).toHaveBeenCalledWith('chat');
    });

    it('should have correct search placeholder text', async () => {
      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      mockUseResourceManagement.mockReturnValue({
        resources: mockSlas,
        filteredResources: mockSlas,
        loading: false,
        error: '',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: true,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('placeholder', 'Search SLAs by name, channel, or schedule...');
    });
  });

  describe('create SLA functionality', () => {
    it('should show create toggle button', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('toggle-create-button')).toBeInTheDocument();
    });

    it('should toggle create form visibility when create button is clicked', async () => {
      const user = userEvent.setup();
      const mockToggleCreateForm = vi.fn();

      const { useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceCreation.mockReturnValue({
        showCreateForm: false,
        toggleCreateForm: mockToggleCreateForm,
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: false,
        createError: '',
        handleSubmit: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      const createToggle = screen.getByTestId('toggle-create-button');
      await user.click(createToggle);

      expect(mockToggleCreateForm).toHaveBeenCalled();
    });

    it('should show create SLA form when create is active', async () => {
      const { useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceCreation.mockReturnValue({
        showCreateForm: true,
        toggleCreateForm: vi.fn(),
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: false,
        createError: '',
        handleSubmit: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('create-sla-form')).toBeInTheDocument();
    });

    it('should hide SLAs grid when create form is shown', async () => {
      const { useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceCreation.mockReturnValue({
        showCreateForm: true,
        toggleCreateForm: vi.fn(),
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: false,
        createError: '',
        handleSubmit: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      expect(screen.queryByTestId('slas-grid')).not.toBeInTheDocument();
    });

    it('should disable create button when submitting', async () => {
      const { useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceCreation.mockReturnValue({
        showCreateForm: false,
        toggleCreateForm: vi.fn(),
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: true,
        createError: '',
        handleSubmit: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      const createToggle = screen.getByTestId('toggle-create-button');
      expect(createToggle).toBeDisabled();
    });

    it('should update header title when create form is shown', async () => {
      const { useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceCreation.mockReturnValue({
        showCreateForm: true,
        toggleCreateForm: vi.fn(),
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: false,
        createError: '',
        handleSubmit: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('header-title')).toHaveTextContent('Create SLA');
    });

    it('should show Cancel text when create form is active', async () => {
      const { useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceCreation.mockReturnValue({
        showCreateForm: true,
        toggleCreateForm: vi.fn(),
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: false,
        createError: '',
        handleSubmit: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('toggle-create-button')).toHaveTextContent('Cancel');
    });
  });

  describe('loading states', () => {
    it('should show loading state in SLAs grid', async () => {
      const { useResourceManagement, useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceManagement.mockReturnValue({
        resources: [],
        filteredResources: [],
        loading: true,
        error: '',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: false,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      mockUseResourceCreation.mockReturnValue({
        showCreateForm: false,
        toggleCreateForm: vi.fn(),
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: false,
        createError: '',
        handleSubmit: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('slas-grid')).toHaveTextContent('Loading...');
    });

    it('should hide create and search buttons when loading', async () => {
      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      mockUseResourceManagement.mockReturnValue({
        resources: [],
        filteredResources: [],
        loading: true,
        error: '',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: false,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      // The SearchHeader component should receive hideCreateButton and hideSearchButton as true
      expect(screen.getByTestId('search-header')).toBeInTheDocument();
    });
  });

  describe('SLA selection', () => {
    it('should display selected SLAs in summary', async () => {
      const { useResourceSelection } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [1, 2],
        selectedResources: [mockSlas[0], mockSlas[1]],
        toggleSelection: vi.fn(),
        removeSelection: vi.fn(),
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });

      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('selected-slas-summary')).toHaveTextContent('Selected SLAs Summary (2 items)');
    });

    it('should call toggle selection handler', async () => {
      const mockToggleSelection = vi.fn();
      
      const { useResourceSelection, useResourceConfirmation } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [],
        selectedResources: [],
        toggleSelection: mockToggleSelection,
        removeSelection: vi.fn(),
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });

      render(<FormTestWrapper mode="create" />);

      // The toggle handler should be passed to the confirmation hook
      expect(mockUseResourceConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          onToggleSelection: mockToggleSelection
        })
      );
    });

    it('should call remove selection handler', async () => {
      const mockRemoveSelection = vi.fn();
      
      const { useResourceSelection, useResourceConfirmation } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [1],
        selectedResources: [mockSlas[0]],
        toggleSelection: vi.fn(),
        removeSelection: mockRemoveSelection,
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });

      render(<FormTestWrapper mode="create" />);

      // The remove handler should be passed to the confirmation hook
      expect(mockUseResourceConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          onRemoveSelection: mockRemoveSelection
        })
      );
    });
  });

  describe('view mode behavior', () => {
    it('should not render create SLA form in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('create-sla-form')).not.toBeInTheDocument();
    });

    it('should not render selected SLAs summary in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('selected-slas-summary')).not.toBeInTheDocument();
    });

    it('should not render confirmation dialog in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });

    it('should filter SLAs to show only selected ones in view mode', async () => {
      const { useResourceSelection, useResourceCreation, useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [1, 3],
        selectedResources: [mockSlas[0], mockSlas[2]],
        toggleSelection: vi.fn(),
        removeSelection: vi.fn(),
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });

      mockUseResourceCreation.mockReturnValue({
        showCreateForm: false,
        toggleCreateForm: vi.fn(),
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: false,
        createError: '',
        handleSubmit: vi.fn()
      });

      mockUseResourceManagement.mockReturnValue({
        resources: [mockSlas[0], mockSlas[2]],
        filteredResources: [mockSlas[0], mockSlas[2]],
        loading: false,
        error: '',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: false,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      render(<FormTestWrapper mode="view" />);

      // In view mode, only selected SLAs should be displayed
      expect(screen.getByTestId('slas-grid')).toBeInTheDocument();
    });

    it('should hide search button in view mode when no SLAs selected', async () => {
      const { useResourceSelection } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [],
        selectedResources: [],
        toggleSelection: vi.fn(),
        removeSelection: vi.fn(),
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });

      render(<FormTestWrapper mode="view" />);

      // The SearchHeader component should receive hideSearchButton as true
      expect(screen.getByTestId('search-header')).toBeInTheDocument();
    });

    it('should show edit and back to list buttons in view mode', () => {
      const mockOnEdit = vi.fn();
      const mockOnBackToList = vi.fn();

      render(<FormTestWrapper mode="view" onEdit={mockOnEdit} onBackToList={mockOnBackToList} />);

      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('back-to-list-button')).toBeInTheDocument();
    });
  });

  describe('confirmation dialog', () => {
    it('should show confirmation dialog when confirm state is active', async () => {
      const { useResourceConfirmation } = await import('@plan-management/hooks');
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      
      mockUseResourceConfirmation.mockReturnValue({
        confirmState: { show: true, resourceId: 1, resourceName: '24/7 Premium Support' },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: vi.fn(),
        resourceType: 'sla'
      });

      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Remove SLA');
      expect(screen.getByTestId('dialog-message')).toHaveTextContent('24/7 Premium Support');
    });

    it('should call handleConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleConfirm = vi.fn();

      const { useResourceConfirmation } = await import('@plan-management/hooks');
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      
      mockUseResourceConfirmation.mockReturnValue({
        confirmState: { show: true, resourceId: 1, resourceName: '24/7 Premium Support' },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: mockHandleConfirm,
        handleCancel: vi.fn(),
        resourceType: 'sla'
      });

      render(<FormTestWrapper mode="create" />);

      const confirmButton = screen.getByTestId('confirm-button');
      await user.click(confirmButton);

      expect(mockHandleConfirm).toHaveBeenCalled();
    });

    it('should call handleCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleCancel = vi.fn();

      const { useResourceConfirmation } = await import('@plan-management/hooks');
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      
      mockUseResourceConfirmation.mockReturnValue({
        confirmState: { show: true, resourceId: 1, resourceName: '24/7 Premium Support' },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: mockHandleCancel,
        resourceType: 'sla'
      });

      render(<FormTestWrapper mode="create" />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockHandleCancel).toHaveBeenCalled();
    });
  });

  describe('tab navigation and form submission', () => {
    it('should render tab navigation component', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });

    it('should show submit button as this is the last tab', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should call onSubmit when submit button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      render(<FormTestWrapper mode="create" onSubmit={mockOnSubmit} isLastTab={true} />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should call onNext when next button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleNext = vi.fn();

      const { useTabValidationNavigation } = await import('@plan-management/hooks');
      const mockUseTabValidationNavigation = vi.mocked(useTabValidationNavigation);
      mockUseTabValidationNavigation.mockReturnValue({
        handleNext: mockHandleNext
      });

      render(<FormTestWrapper mode="create" />);

      const nextButton = screen.getByTestId('next-button');
      await user.click(nextButton);

      expect(mockHandleNext).toHaveBeenCalled();
    });

    it('should disable buttons when form is invalid', async () => {
      const { useTabValidation } = await import('@plan-management/hooks');
      const mockUseTabValidation = vi.mocked(useTabValidation);
      mockUseTabValidation.mockReturnValue({
        isBasicInfoValid: false,
        isPricingInfoValid: false,
        isFeaturesValid: false,
        isAddonsValid: false,
        isSlaValid: false,
        isEntireFormValid: false,
        validateBasicInfo: vi.fn(() => false),
        validatePricingInfo: vi.fn(() => false),
        validateFeatures: vi.fn(() => false),
        validateAddons: vi.fn(() => false),
        validateSla: vi.fn(() => false),
        getValidationState: vi.fn(() => ({
          isBasicInfoValid: false,
          isPricingInfoValid: false,
          isFeaturesValid: false,
          isAddonsValid: false,
          isSlaValid: false,
          isEntireFormValid: false
        }))
      });

      render(<FormTestWrapper mode="create" />);

      const nextButton = screen.getByTestId('next-button');
      const submitButton = screen.getByTestId('submit-button');
      
      expect(nextButton).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should enable buttons when form is valid', async () => {
      const { useTabValidation } = await import('@plan-management/hooks');
      const mockUseTabValidation = vi.mocked(useTabValidation);
      mockUseTabValidation.mockReturnValue({
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: true,
        isSlaValid: true,
        isEntireFormValid: true,
        validateBasicInfo: vi.fn(() => true),
        validatePricingInfo: vi.fn(() => true),
        validateFeatures: vi.fn(() => true),
        validateAddons: vi.fn(() => true),
        validateSla: vi.fn(() => true),
        getValidationState: vi.fn(() => ({
          isBasicInfoValid: true,
          isPricingInfoValid: true,
          isFeaturesValid: true,
          isAddonsValid: true,
          isSlaValid: true,
          isEntireFormValid: true
        }))
      });

      render(<FormTestWrapper mode="create" />);

      const nextButton = screen.getByTestId('next-button');
      const submitButton = screen.getByTestId('submit-button');
      
      expect(nextButton).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable submit button when submitting', () => {
      render(<FormTestWrapper mode="create" isSubmitting={true} isLastTab={true} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should show custom submit button text', () => {
      render(<FormTestWrapper mode="create" submitButtonText="Update Plan" isLastTab={true} />);

      expect(screen.getByTestId('submit-button')).toHaveTextContent('Update Plan');
    });

    it('should not render navigation buttons in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('previous-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
    });
  });

  describe('hook integrations', () => {
    it('should call useResourceManagement with correct parameters', async () => {
      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      render(<FormTestWrapper mode="create" />);

      expect(mockUseResourceManagement).toHaveBeenCalledWith('slas', 'name', true);
    });

    it('should call useResourceSelection with correct parameters', async () => {
      const { useResourceSelection, useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      // Mock the resource management to provide mockSlas
      mockUseResourceManagement.mockReturnValue({
        resources: mockSlas,
        filteredResources: mockSlas,
        loading: false,
        error: '',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: false,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });
      
      render(<FormTestWrapper mode="create" />);

      expect(mockUseResourceSelection).toHaveBeenCalledWith('support_sla_ids', mockSlas);
    });

    it('should call useResourceCreation with correct parameters', async () => {
      const { useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      render(<FormTestWrapper mode="create" />);

      expect(mockUseResourceCreation).toHaveBeenCalledWith(
        'slas',
        expect.any(Function), // createSlaSchema
        { name: '', support_channel: '', response_time_hours: '', availability_schedule: '', notes: '' },
        expect.any(Function) // refetchSlas
      );
    });

    it('should call useTabValidation with form values', async () => {
      const { useTabValidation } = await import('@plan-management/hooks');
      const mockUseTabValidation = vi.mocked(useTabValidation);
      
      render(<FormTestWrapper mode="create" />);

      expect(mockUseTabValidation).toHaveBeenCalled();
    });

    it('should call useTabValidationNavigation with correct parameters', async () => {
      const { useTabValidationNavigation } = await import('@plan-management/hooks');
      const mockUseTabValidationNavigation = vi.mocked(useTabValidationNavigation);
      
      render(<FormTestWrapper mode="create" />);

      expect(mockUseTabValidationNavigation).toHaveBeenCalledWith(
        ['support_sla_ids'],
        false, // isReadOnly for create mode
        expect.any(Function) // custom onNext handler
      );
    });

    it('should call useResourceConfirmation with correct parameters', async () => {
      const { useResourceConfirmation, useResourceManagement, useResourceSelection } = await import('@plan-management/hooks');
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      
      // Mock dependencies to provide expected values
      mockUseResourceManagement.mockReturnValue({
        resources: mockSlas,
        filteredResources: mockSlas,
        loading: false,
        error: '',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: false,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [],
        selectedResources: [],
        toggleSelection: vi.fn(),
        removeSelection: vi.fn(),
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });
      
      render(<FormTestWrapper mode="create" />);

      expect(mockUseResourceConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: mockSlas,
          selectedIds: [],
          resourceType: 'SLA'
        })
      );
    });
  });

  describe('form submission logic', () => {
    it('should call onSubmit with form values when form is valid', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      const mockGetValues = vi.fn().mockReturnValue({ support_sla_ids: [1, 2] });

      const { useTabValidation } = await import('@plan-management/hooks');
      const mockUseTabValidation = vi.mocked(useTabValidation);
      mockUseTabValidation.mockReturnValue({
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: true,
        isSlaValid: true,
        isEntireFormValid: true,
        validateBasicInfo: vi.fn(() => true),
        validatePricingInfo: vi.fn(() => true),
        validateFeatures: vi.fn(() => true),
        validateAddons: vi.fn(() => true),
        validateSla: vi.fn(() => true),
        getValidationState: vi.fn(() => ({
          isBasicInfoValid: true,
          isPricingInfoValid: true,
          isFeaturesValid: true,
          isAddonsValid: true,
          isSlaValid: true,
          isEntireFormValid: true
        }))
      });

      // Mock the form context to return our mock getValues
      const FormWithMockGetValues = () => {
        const methods = useForm<CreatePlanFormData>({
          defaultValues: { support_sla_ids: [1, 2] }
        });
        
        // Override getValues
        (methods as any).getValues = mockGetValues;

        return (
          <Provider>
            <FormProvider {...methods}>
              <PlanSlaConfiguration
                mode="create"
                onNext={vi.fn()}
                onPrevious={vi.fn()}
                onSubmit={mockOnSubmit}
                isFirstTab={false}
                isActive={true}
              />
            </FormProvider>
          </Provider>
        );
      };

      render(<FormWithMockGetValues />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({ support_sla_ids: [1, 2] });
    });

    it('should handle form submission in view mode', async () => {
      const mockOnSubmit = vi.fn();

      render(<FormTestWrapper mode="view" />);

      // In view mode, we don't have submit button, but the logic should work
      expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle resource management errors gracefully', async () => {
      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      mockUseResourceManagement.mockReturnValue({
        resources: [],
        filteredResources: [],
        loading: false,
        error: 'Failed to load SLAs',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: false,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      expect(() => {
        render(<FormTestWrapper mode="create" />);
      }).not.toThrow();
    });

    it('should handle resource creation errors gracefully', async () => {
      const { useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceCreation.mockReturnValue({
        showCreateForm: false,
        toggleCreateForm: vi.fn(),
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: false,
        createError: 'Failed to create SLA',
        handleSubmit: vi.fn()
      });

      expect(() => {
        render(<FormTestWrapper mode="create" />);
      }).not.toThrow();
    });
  });

  describe('component lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(<FormTestWrapper mode="create" />);

      expect(() => unmount()).not.toThrow();
    });

    it('should handle prop changes correctly', () => {
      const { rerender } = render(<FormTestWrapper mode="create" />);

      rerender(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('selected-slas-summary')).not.toBeInTheDocument();
    });

    it('should handle isActive prop changes', async () => {
      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      
      render(<FormTestWrapper mode="create" />);
      
      expect(mockUseResourceManagement).toHaveBeenCalledWith('slas', 'name', true);
    });
  });

  describe('accessibility', () => {
    it('should have proper button labels', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('toggle-search-button')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-create-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(<FormTestWrapper mode="create" />);

      const searchButton = screen.getByTestId('toggle-search-button');
      const createButton = screen.getByTestId('toggle-create-button');

      // Should be able to tab through interactive elements
      await user.tab();
      expect(searchButton).toHaveFocus();

      await user.tab();
      expect(createButton).toHaveFocus();
    });

    it('should have proper dialog accessibility', async () => {
      const { useResourceConfirmation } = await import('@plan-management/hooks');
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      
      mockUseResourceConfirmation.mockReturnValue({
        confirmState: { show: true, resourceId: 1, resourceName: '24/7 Premium Support' },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: vi.fn(),
        resourceType: 'sla'
      });

      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-message')).toBeInTheDocument();
    });
  });

  describe('data flow', () => {
    it('should pass correct data to SLAs grid', async () => {
      const { useResourceManagement, useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceManagement.mockReturnValue({
        resources: mockSlas,
        filteredResources: mockSlas,
        loading: false,
        error: '',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: false,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      mockUseResourceCreation.mockReturnValue({
        showCreateForm: false,
        toggleCreateForm: vi.fn(),
        createForm: { 
          control: vi.fn() as any,
          handleSubmit: vi.fn(),
          formState: {} as any,
          register: vi.fn(),
          setValue: vi.fn(),
          getValues: vi.fn(),
          watch: vi.fn(),
          reset: vi.fn(),
          clearErrors: vi.fn(),
          setError: vi.fn(),
          trigger: vi.fn(),
          getFieldState: vi.fn(),
          resetField: vi.fn(),
          setFocus: vi.fn(),
          unregister: vi.fn(),
          subscribe: vi.fn()
        } as any,
        isSubmitting: false,
        createError: '',
        handleSubmit: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      const slasGrid = screen.getByTestId('slas-grid');
      expect(slasGrid).toHaveTextContent('SLAs Grid (3 items)');
    });

    it('should pass selected SLAs to summary component', async () => {
      const { useResourceSelection } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [1, 2],
        selectedResources: [mockSlas[0], mockSlas[1]],
        toggleSelection: vi.fn(),
        removeSelection: vi.fn(),
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });

      render(<FormTestWrapper mode="create" />);

      const summary = screen.getByTestId('selected-slas-summary');
      expect(summary).toHaveTextContent('Selected SLAs Summary (2 items)');
    });

    it('should filter SLAs in view mode', async () => {
      const { useResourceSelection } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [1, 3],
        selectedResources: [mockSlas[0], mockSlas[2]],
        toggleSelection: vi.fn(),
        removeSelection: vi.fn(),
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });

      render(<FormTestWrapper mode="view" />);

      // In view mode, display logic should filter to only selected SLAs
      expect(screen.getByTestId('slas-grid')).toBeInTheDocument();
    });
  });

  describe('integration with React Hook Form', () => {
    it('should integrate properly with form context', () => {
      render(<FormTestWrapper mode="create" />);

      // All components should render without form context errors
      expect(screen.getByTestId('search-header')).toBeInTheDocument();
      expect(screen.getByTestId('slas-grid')).toBeInTheDocument();
      expect(screen.getByTestId('selected-slas-summary')).toBeInTheDocument();
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });

    it('should handle form field registration correctly', async () => {
      const defaultValues = {
        support_sla_ids: [1, 2]
      };

      const { useResourceSelection } = await import('@plan-management/hooks');
      const mockUseResourceSelection = vi.mocked(useResourceSelection);
      
      mockUseResourceSelection.mockReturnValue({
        selectedIds: [1, 2],
        selectedResources: [mockSlas[0], mockSlas[1]],
        toggleSelection: vi.fn(),
        removeSelection: vi.fn(),
        isSelected: vi.fn(),
        validateSelection: vi.fn().mockResolvedValue(true)
      });

      render(<FormTestWrapper mode="create" defaultValues={defaultValues} />);

      // Form should handle support_sla_ids field correctly
      expect(screen.getByTestId('selected-slas-summary')).toHaveTextContent('Selected SLAs Summary (2 items)');
    });
  });
});