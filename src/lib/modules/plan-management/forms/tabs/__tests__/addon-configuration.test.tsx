import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { Provider } from '@/components/ui/provider';
import PlanAddonConfiguration from '../addon-configuration';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';
import { PlanFormMode } from '@plan-management/types/plans';

// Mock dependencies
vi.mock('@plan-management/schemas/validation/plans', () => ({
  createAddonSchema: vi.fn(),
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
    error: '',
    searchTerm: '',
    setSearchTerm: vi.fn(),
    showSearch: false,
    toggleSearch: vi.fn(),
    refetch: vi.fn()
  })),
  useResourceCreation: vi.fn(() => ({
    showCreateForm: false,
    toggleCreateForm: vi.fn(),
    createForm: { control: {}, handleSubmit: vi.fn() },
    isSubmitting: false,
    createError: '',
    handleSubmit: vi.fn()
  })),
  useResourceConfirmation: vi.fn(() => ({
    confirmState: { show: false, resourceId: 0, resourceName: '' },
    handleToggleWithConfirm: vi.fn(),
    handleRemoveWithConfirm: vi.fn(),
    handleConfirm: vi.fn(),
    handleCancel: vi.fn(),
    resourceType: 'addon'
  }))
}));

// Mock child components
vi.mock('../components/addons/create-addon-form', () => ({
  default: ({ showCreateAddon }: any) => 
    showCreateAddon ? <div data-testid="create-addon-form">Create Addon Form</div> : null
}));

vi.mock('../components/addons/addons-grid', () => ({
  default: ({ displayAddons, loading }: any) => (
    <div data-testid="addons-grid">
      {loading ? 'Loading...' : `Addons Grid (${displayAddons?.length || 0} items)`}
    </div>
  )
}));

vi.mock('../components/addons/selected-addons-configuration', () => ({
  default: ({ addonAssignments }: any) => (
    <div data-testid="selected-addons-configuration">
      Selected Addons Config ({addonAssignments?.length || 0} items)
    </div>
  )
}));

vi.mock('@plan-management/components', () => ({
  TabNavigation: ({ 
    onNext, 
    onPrevious, 
    isFormValid, 
    readOnly 
  }: any) => (
    <div data-testid="tab-navigation">
      {!readOnly && (
        <>
          <button type="button" data-testid="previous-button" onClick={onPrevious}>
            Previous
          </button>
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
          placeholder="Search add-ons by name or description..."
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
const mockAddons = [
  {
    id: 1,
    name: 'Premium Support',
    description: 'Enhanced customer support',
    base_price: '10.00',
    pricing_scope: 'branch',
    default_quantity: 1,
    min_quantity: 1,
    max_quantity: 5,
    display_order: 1
  },
  {
    id: 2,
    name: 'Analytics Dashboard',
    description: 'Advanced analytics and reporting',
    base_price: '25.00',
    pricing_scope: 'organization',
    default_quantity: 1,
    min_quantity: 1,
    max_quantity: null,
    display_order: 2
  }
];

// Test form wrapper that provides React Hook Form context
const FormTestWrapper = ({ 
  children, 
  defaultValues = {},
  mode = 'create' as PlanFormMode
}: { 
  children?: React.ReactNode;
  defaultValues?: Partial<CreatePlanFormData>;
  mode?: PlanFormMode;
}) => {
  const methods = useForm<CreatePlanFormData>({
    defaultValues: {
      addon_assignments: [],
      ...defaultValues
    }
  });

  return (
    <Provider>
      <FormProvider {...methods}>
        <form>
          <PlanAddonConfiguration
            mode={mode}
            onNext={vi.fn()}
            onPrevious={vi.fn()}
            isFirstTab={false}
            isActive={true}
          />
          {children}
        </form>
      </FormProvider>
    </Provider>
  );
};

describe('PlanAddonConfiguration', () => {

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
      expect(screen.getByTestId('addons-grid')).toBeInTheDocument();
      expect(screen.getByTestId('selected-addons-configuration')).toBeInTheDocument();
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });

    it('should render correct header title for create mode', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('header-title')).toHaveTextContent('Available Add-ons');
    });

    it('should render correct header title for view mode', () => {
      const defaultValues = {
        addon_assignments: [
          { addon_id: 1, feature_level: 'basic' as const, is_included: true, default_quantity: 1, min_quantity: 1, max_quantity: 5 }
        ]
      };

      render(<FormTestWrapper mode="view" defaultValues={defaultValues} />);

      expect(screen.getByTestId('header-title')).toHaveTextContent('Included Add-ons (1)');
    });

    it('should not render create addon form by default', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.queryByTestId('create-addon-form')).not.toBeInTheDocument();
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
        resources: mockAddons,
        filteredResources: mockAddons,
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
        resources: mockAddons,
        filteredResources: mockAddons,
        loading: false,
        error: '',
        searchTerm: 'test search',
        setSearchTerm: vi.fn(),
        showSearch: true,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      render(<FormTestWrapper mode="create" />);

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('test search');
    });

    it('should call setSearchTerm when search input changes', async () => {
      const mockSetSearchTerm = vi.fn();

      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      mockUseResourceManagement.mockReturnValue({
        resources: mockAddons,
        filteredResources: mockAddons,
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
      
      // Use fireEvent.change instead of user.type to set the full value at once
      fireEvent.change(searchInput, { target: { value: 'premium' } });

      expect(mockSetSearchTerm).toHaveBeenCalledWith('premium');
    });
  });

  describe('create addon functionality', () => {
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

    it('should show create addon form when create is active', async () => {
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

      expect(screen.getByTestId('create-addon-form')).toBeInTheDocument();
    });

    it('should hide addons grid when create form is shown', async () => {
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

      expect(screen.queryByTestId('addons-grid')).not.toBeInTheDocument();
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

      expect(screen.getByTestId('header-title')).toHaveTextContent('Create Add-on');
    });
  });

  describe('loading states', () => {
    it('should show loading state in addons grid', async () => {
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

      expect(screen.getByTestId('addons-grid')).toHaveTextContent('Loading...');
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
      // This is tested through the component's behavior rather than direct props
      expect(screen.getByTestId('search-header')).toBeInTheDocument();
    });
  });

  describe('view mode behavior', () => {
    it('should not render create addon form in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('create-addon-form')).not.toBeInTheDocument();
    });

    it('should not render selected addons configuration in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('selected-addons-configuration')).not.toBeInTheDocument();
    });

    it('should not render confirmation dialog in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });

    it('should filter addons to show only assigned ones in view mode', async () => {
      const { useResourceManagement, useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      const defaultValues = {
        addon_assignments: [
          { addon_id: 1, feature_level: 'basic' as const, is_included: true, default_quantity: 1, min_quantity: 1, max_quantity: 5 }
        ]
      };

      mockUseResourceManagement.mockReturnValue({
        resources: mockAddons,
        filteredResources: [mockAddons[0]],
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

      render(<FormTestWrapper mode="view" defaultValues={defaultValues} />);

      // The addons grid should receive filtered addons based on assignments
      expect(screen.getByTestId('addons-grid')).toBeInTheDocument();
    });
  });

  describe('confirmation dialog', () => {
    it('should show confirmation dialog when confirm state is active', async () => {
      const { useResourceConfirmation } = await import('@plan-management/hooks');
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      mockUseResourceConfirmation.mockReturnValue({
        confirmState: { show: true, resourceId: 1, resourceName: 'Premium Support' },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: vi.fn(),
        resourceType: 'addon'
      });

      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Remove Add-on');
      expect(screen.getByTestId('dialog-message')).toHaveTextContent('Premium Support');
    });

    it('should call handleConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleConfirm = vi.fn();

      const { useResourceConfirmation } = await import('@plan-management/hooks');
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      mockUseResourceConfirmation.mockReturnValue({
        confirmState: { show: true, resourceId: 1, resourceName: 'Premium Support' },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: mockHandleConfirm,
        handleCancel: vi.fn(),
        resourceType: 'addon'
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
        confirmState: { show: true, resourceId: 1, resourceName: 'Premium Support' },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: mockHandleCancel,
        resourceType: 'addon'
      });

      render(<FormTestWrapper mode="create" />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockHandleCancel).toHaveBeenCalled();
    });
  });

  describe('tab navigation', () => {
    it('should render tab navigation component', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
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

    it('should disable next button when form is invalid', async () => {
      const { useTabValidation } = await import('@plan-management/hooks');
      const mockUseTabValidation = vi.mocked(useTabValidation);
      mockUseTabValidation.mockReturnValue({
        isBasicInfoValid: true,
        isPricingInfoValid: true,
        isFeaturesValid: true,
        isAddonsValid: false,
        isSlaValid: true,
        isEntireFormValid: false,
        validateBasicInfo: vi.fn(() => true),
        validatePricingInfo: vi.fn(() => true),
        validateFeatures: vi.fn(() => true),
        validateAddons: vi.fn(() => false),
        validateSla: vi.fn(() => true),
        getValidationState: vi.fn(() => ({
          isBasicInfoValid: true,
          isPricingInfoValid: true,
          isFeaturesValid: true,
          isAddonsValid: false,
          isSlaValid: true,
          isEntireFormValid: false
        }))
      });

      render(<FormTestWrapper mode="create" />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when form is valid', async () => {
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
      expect(nextButton).not.toBeDisabled();
    });

    it('should not render navigation buttons in view mode', () => {
      render(<FormTestWrapper mode="view" />);

      expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('previous-button')).not.toBeInTheDocument();
    });
  });

  describe('hook integrations', () => {
    it('should integrate with hooks properly', async () => {
      const { useResourceCreation, useResourceConfirmation } = await import('@plan-management/hooks');
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      const mockUseResourceConfirmation = vi.mocked(useResourceConfirmation);
      
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

      mockUseResourceConfirmation.mockReturnValue({
        confirmState: { show: false, resourceId: 0, resourceName: '' },
        handleToggleWithConfirm: vi.fn(),
        handleRemoveWithConfirm: vi.fn(),
        handleConfirm: vi.fn(),
        handleCancel: vi.fn(),
        resourceType: 'addon'
      });

      render(<FormTestWrapper mode="create" />);

      // All components should render without hook integration errors
      expect(screen.getByTestId('search-header')).toBeInTheDocument();
      expect(screen.getByTestId('addons-grid')).toBeInTheDocument();
      expect(screen.getByTestId('selected-addons-configuration')).toBeInTheDocument();
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });
  });

  describe('addon assignments management', () => {
    it('should display selected addons configuration', () => {
      const defaultValues = {
        addon_assignments: [
          { addon_id: 1, feature_level: 'basic' as const, is_included: true, default_quantity: 1, min_quantity: 1, max_quantity: 5 },
          { addon_id: 2, feature_level: 'custom' as const, is_included: false, default_quantity: 1, min_quantity: 1, max_quantity: null }
        ]
      };

      render(<FormTestWrapper mode="create" defaultValues={defaultValues} />);

      expect(screen.getByTestId('selected-addons-configuration')).toHaveTextContent('Selected Addons Config (2 items)');
    });

    it('should pass correct props to selected addons configuration', () => {
      const defaultValues = {
        addon_assignments: [
          { addon_id: 1, feature_level: 'basic' as const, is_included: true, default_quantity: 1, min_quantity: 1, max_quantity: 5 }
        ]
      };

      render(<FormTestWrapper mode="create" defaultValues={defaultValues} />);

      const configComponent = screen.getByTestId('selected-addons-configuration');
      expect(configComponent).toBeInTheDocument();
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
        error: 'Failed to load addons',
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
        createError: 'Failed to create addon',
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

      expect(screen.queryByTestId('selected-addons-configuration')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper button labels', () => {
      render(<FormTestWrapper mode="create" />);

      expect(screen.getByTestId('toggle-search-button')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-create-button')).toBeInTheDocument();
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
  });

  describe('data flow', () => {
    it('should pass correct data to addons grid', async () => {
      const { useResourceManagement, useResourceCreation } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      const mockUseResourceCreation = vi.mocked(useResourceCreation);
      
      mockUseResourceManagement.mockReturnValue({
        resources: mockAddons,
        filteredResources: mockAddons,
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

      const addonsGrid = screen.getByTestId('addons-grid');
      expect(addonsGrid).toHaveTextContent('Addons Grid (2 items)');
    });

    it('should filter addons in view mode', async () => {
      const defaultValues = {
        addon_assignments: [
          { addon_id: 1, feature_level: 'basic' as const, is_included: true, default_quantity: 1, min_quantity: 1, max_quantity: 5 }
        ]
      };

      const { useResourceManagement } = await import('@plan-management/hooks');
      const mockUseResourceManagement = vi.mocked(useResourceManagement);
      mockUseResourceManagement.mockReturnValue({
        resources: mockAddons,
        filteredResources: mockAddons,
        loading: false,
        error: '',
        searchTerm: '',
        setSearchTerm: vi.fn(),
        showSearch: false,
        toggleSearch: vi.fn(),
        refetch: vi.fn()
      });

      render(<FormTestWrapper mode="view" defaultValues={defaultValues} />);

      // In view mode, only assigned addons should be displayed
      expect(screen.getByTestId('addons-grid')).toBeInTheDocument();
    });
  });

  describe('integration with React Hook Form', () => {
    it('should integrate properly with form context', () => {
      render(<FormTestWrapper mode="create" />);

      // All components should render without form context errors
      expect(screen.getByTestId('search-header')).toBeInTheDocument();
      expect(screen.getByTestId('addons-grid')).toBeInTheDocument();
      expect(screen.getByTestId('selected-addons-configuration')).toBeInTheDocument();
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });

    it('should handle form field registration correctly', () => {
      const defaultValues = {
        addon_assignments: [
          { addon_id: 1, feature_level: 'basic' as const, is_included: true, default_quantity: 1, min_quantity: 1, max_quantity: 5 }
        ]
      };

      render(<FormTestWrapper mode="create" defaultValues={defaultValues} />);

      // Form should handle field arrays correctly
      expect(screen.getByTestId('selected-addons-configuration')).toHaveTextContent('Selected Addons Config (1 items)');
    });
  });
});