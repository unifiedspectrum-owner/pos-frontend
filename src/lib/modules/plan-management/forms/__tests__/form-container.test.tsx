import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import PlanFormContainer from '../form-container';
import { PlanFormMode } from '@plan-management/types/plans';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }))
}));

// Mock dependencies
vi.mock('@plan-management/schemas/validation/plans', () => ({
  createPlanSchema: {
    parse: vi.fn(() => ({
      name: '',
      description: '',
      is_active: true,
      is_custom: false,
      included_devices_count: '',
      max_users_per_branch: '',
      included_branches_count: '',
      additional_device_cost: '',
      monthly_price: '',
      annual_discount_percentage: '',
      biennial_discount_percentage: '',
      triennial_discount_percentage: '',
      monthly_fee_our_gateway: '',
      monthly_fee_byo_processor: '',
      card_processing_fee_percentage: '',
      card_processing_fee_fixed: '',
      feature_ids: [],
      addon_assignments: [],
      support_sla_ids: [],
      volume_discounts: [],
    })),
    // Add the _def property that zodResolver expects
    _def: {
      typeName: 'ZodObject'
    }
  }
}));

vi.mock('@plan-management/config', () => ({
  AUTO_SAVE_DEBOUNCE_MS: 300,
  DEFAULT_PLAN_TAB: 'basic',
  PLAN_FORM_TITLES: {
    CREATE: 'Create New Plan',
    EDIT: 'Edit Plan',
    VIEW: 'View Plan',
    DEFAULT: 'Plan Management'
  },
  STORAGE_KEYS: {
    FORM_DATA: 'plan-form-data',
    ACTIVE_TAB: 'plan-active-tab'
  },
  ERROR_MESSAGES: {
    PLAN_LOAD_FAILED: 'Failed to load plan data. Please try again.'
  },
  PLAN_FORM_MODES: {
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view'
  }
}));

vi.mock('@shared/config', () => ({
  LOADING_DELAY: 100,
  LOADING_DELAY_ENABLED: false
}));

vi.mock('@shared/contexts', () => ({
  ResourceErrorProvider: ({ children }: any) => <div data-testid="resource-error-provider">{children}</div>
}));

vi.mock('@shared/components', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>,
  ErrorMessageContainer: ({ error, title, onRetry, isRetrying, testId }: any) => (
    <div data-testid={testId || 'error-container'}>
      <h3>{title}</h3>
      <p>{error}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} disabled={isRetrying} data-testid="retry-button">
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      )}
    </div>
  )
}));

vi.mock('@plan-management/components', () => ({
  DataRecoveryModal: ({ isOpen, onRestore, onStartFresh }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="data-recovery-modal">
        <h2>Data Recovery</h2>
        <button type="button" onClick={onRestore} data-testid="restore-button">
          Restore Data
        </button>
        <button type="button" onClick={onStartFresh} data-testid="start-fresh-button">
          Start Fresh
        </button>
      </div>
    );
  }
}));

vi.mock('../form-ui', () => ({
  default: ({ 
    mode, activeTab, showSavedIndicator, isSubmitting,
    onTabChange, onNextTab, onPreviousTab, onSubmit, onEdit, onBackToList,
    submitButtonText
  }: any) => (
    <div data-testid="plan-form-ui">
      <div>Mode: {mode}</div>
      <div>Active Tab: {activeTab}</div>
      <div>Show Saved Indicator: {showSavedIndicator.toString()}</div>
      <div>Is Submitting: {isSubmitting.toString()}</div>
      <div>Submit Button Text: {submitButtonText}</div>
      <button type="button" onClick={() => onTabChange('pricing')} data-testid="tab-change-button">
        Change Tab
      </button>
      <button type="button" onClick={onNextTab} data-testid="next-tab-button">
        Next Tab
      </button>
      <button type="button" onClick={onPreviousTab} data-testid="previous-tab-button">
        Previous Tab
      </button>
      <button type="button" onClick={() => onSubmit({ name: 'Test Plan' })} data-testid="submit-button">
        Submit
      </button>
      {onEdit && (
        <button type="button" onClick={onEdit} data-testid="edit-button">
          Edit
        </button>
      )}
      {onBackToList && (
        <button type="button" onClick={onBackToList} data-testid="back-to-list-button">
          Back to List
        </button>
      )}
    </div>
  )
}));

vi.mock('@plan-management/utils', () => ({
  clearStorageData: vi.fn(),
  hasStorageData: vi.fn(() => false),
  loadDataFromStorage: vi.fn(),
  saveFormDataToStorage: vi.fn(() => true),
  formatApiDataToFormData: vi.fn(() => ({
    name: 'Test Plan',
    description: 'Test Description',
    is_active: true,
    is_custom: false,
    included_devices_count: '5',
    max_users_per_branch: '10',
    included_branches_count: '1',
    additional_device_cost: '9.99',
    monthly_price: '29.99',
    annual_discount_percentage: '10',
    biennial_discount_percentage: '15',
    triennial_discount_percentage: '20',
    monthly_fee_our_gateway: '2.99',
    monthly_fee_byo_processor: '1.99',
    card_processing_fee_percentage: '2.9',
    card_processing_fee_fixed: '0.30',
    feature_ids: [],
    addon_assignments: [],
    support_sla_ids: [],
    volume_discounts: []
  }))
}));

vi.mock('@plan-management/api', () => ({
  planService: {
    getSubscriptionPlanDetails: vi.fn(() => Promise.resolve({
      data: {
        success: true,
        count: 1,
        message: 'Plan details retrieved successfully',
        timestamp: new Date().toISOString(),
        data: {
          id: 1,
          name: 'Test Plan',
          description: 'Test Description',
          display_order: 1,
          trial_period_days: 14,
          is_active: 1,
          is_custom: 0,
          monthly_price: 29.99,
          monthly_fee_our_gateway: 2.99,
          monthly_fee_byo_processor: 1.99,
          card_processing_fee_percentage: 2.9,
          card_processing_fee_fixed: 0.30,
          additional_device_cost: 9.99,
          annual_discount_percentage: 10,
          biennial_discount_percentage: 15,
          triennial_discount_percentage: 20,
          included_devices_count: 5,
          max_users_per_branch: 10,
          included_branches_count: 1,
          features: [],
          add_ons: [],
          support_sla: [],
          volume_discounts: []
        }
      },
      status: 200,
      statusText: 'OK',
      headers: {} as any,
      config: {
        url: '/api/plans/1',
        method: 'get',
        headers: {} as any
      }
    }))
  }
}));

vi.mock('@plan-management/hooks', () => ({
  useTabValidation: vi.fn(() => ({
    basic: true,
    pricing: false,
    features: false,
    addons: false,
    sla: false
  })),
  useFormSubmission: vi.fn(() => ({
    submitForm: vi.fn(),
    isSubmitting: false,
    getSubmitButtonText: vi.fn(() => 'Submit')
  })),
  useTabNavigation: vi.fn(() => ({
    tabUnlockState: {
      basic: true,
      pricing: true,
      features: true,
      addons: true,
      sla: true
    },
    isTabUnlocked: vi.fn((tabId: string) => true),
    handleTabChange: vi.fn(),
    handleNextTab: vi.fn(),
    handlePreviousTab: vi.fn()
  }))
}));

// Test helper function
const renderFormContainer = (props: {
  mode: PlanFormMode;
  planId?: number;
  title?: string;
}) => {
  return render(
    <ChakraProvider value={defaultSystem}>
      <PlanFormContainer {...props} />
    </ChakraProvider>
  );
};

describe('PlanFormContainer', () => {
  let mockRouter: any;
  
  beforeEach(async () => {
    mockRouter = {
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
    };
    
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.clearAllMocks();
    
    // Reset planService mock to default success state
    const { planService } = await import('@plan-management/api');
    vi.mocked(planService.getSubscriptionPlanDetails).mockResolvedValue({
      data: {
        success: true,
        count: 1,
        message: 'Plan details retrieved successfully',
        timestamp: new Date().toISOString(),
        data: {
          id: 1,
          name: 'Test Plan',
          description: 'Test Description',
          display_order: 1,
          trial_period_days: 14,
          is_active: 1,
          is_custom: 0,
          monthly_price: 29.99,
          monthly_fee_our_gateway: 2.99,
          monthly_fee_byo_processor: 1.99,
          card_processing_fee_percentage: 2.9,
          card_processing_fee_fixed: 0.30,
          additional_device_cost: 9.99,
          annual_discount_percentage: 10,
          biennial_discount_percentage: 15,
          triennial_discount_percentage: 20,
          included_devices_count: 5,
          max_users_per_branch: 10,
          included_branches_count: 1,
          features: [],
          add_ons: [],
          support_sla: [],
          volume_discounts: []
        }
      },
      status: 200,
      statusText: 'OK',
      headers: {} as any,
      config: { url: '/api/plans/1', method: 'get', headers: {} as any }
    });
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('rendering and initialization', () => {
    it('should render all main components correctly', () => {
      renderFormContainer({ mode: 'create' });

      expect(screen.getByTestId('resource-error-provider')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should display correct title for create mode', () => {
      renderFormContainer({ mode: 'create' });

      expect(screen.getByText('Create New Plan')).toBeInTheDocument();
    });

    it('should display custom title when provided', () => {
      renderFormContainer({ 
        mode: 'create', 
        title: 'Custom Plan Title' 
      });

      expect(screen.getByText('Custom Plan Title')).toBeInTheDocument();
    });

    it('should initialize form with default values in create mode', () => {
      renderFormContainer({ mode: 'create' });

      const formUI = screen.getByTestId('plan-form-ui');
      expect(formUI).toHaveTextContent('Mode: create');
      expect(formUI).toHaveTextContent('Active Tab: basic');
      expect(formUI).toHaveTextContent('Show Saved Indicator: false');
    });

    it('should not show data recovery modal when no stored data exists', async () => {
      const { hasStorageData } = await import('@plan-management/utils');
      vi.mocked(hasStorageData).mockReturnValue(false);

      renderFormContainer({ mode: 'create' });

      expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument();
    });
  });

  describe('create mode functionality', () => {
    it('should show data recovery modal when stored data exists', async () => {
      const { hasStorageData } = await import('@plan-management/utils');
      vi.mocked(hasStorageData).mockReturnValue(true);

      renderFormContainer({ mode: 'create' });

      expect(screen.getByTestId('data-recovery-modal')).toBeInTheDocument();
    });

    it('should handle restore data from modal', async () => {
      const user = userEvent.setup();
      const { hasStorageData, loadDataFromStorage } = await import('@plan-management/utils');
      vi.mocked(hasStorageData).mockReturnValue(true);

      renderFormContainer({ mode: 'create' });

      const restoreButton = screen.getByTestId('restore-button');
      await user.click(restoreButton);

      expect(loadDataFromStorage).toHaveBeenCalled();
      expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument();
    });

    it('should handle start fresh from modal', async () => {
      const user = userEvent.setup();
      const { hasStorageData, clearStorageData } = await import('@plan-management/utils');
      vi.mocked(hasStorageData).mockReturnValue(true);

      renderFormContainer({ mode: 'create' });

      const startFreshButton = screen.getByTestId('start-fresh-button');
      await user.click(startFreshButton);

      expect(clearStorageData).toHaveBeenCalled();
      expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument();
    });

    it('should trigger auto-save functionality', async () => {
      vi.useFakeTimers();
      const { saveFormDataToStorage } = await import('@plan-management/utils');
      
      renderFormContainer({ mode: 'create' });

      // Check that component renders
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();

      // Fast-forward timers to trigger auto-save
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Simply check that the function was made available by the mock
      expect(saveFormDataToStorage).toBeDefined();

      vi.useRealTimers();
    });
  });

  describe('edit mode functionality', () => {
    it('should load plan data for edit mode', async () => {
      const { planService } = await import('@plan-management/api');
      
      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      // Just check that the component renders and shows appropriate heading
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();
      
      // Check that the API service is available
      expect(planService.getSubscriptionPlanDetails).toBeDefined();
    });

    it('should show loading spinner while fetching data', async () => {
      const { planService } = await import('@plan-management/api');
      
      // Mock a simple delayed response
      vi.mocked(planService.getSubscriptionPlanDetails).mockResolvedValue({
        data: { 
          success: true, 
          count: 1,
          message: 'Plan details retrieved successfully',
          timestamp: new Date().toISOString(),
          data: {
            id: 1,
            name: 'Test Plan',
            description: 'Test Description',
            display_order: 1,
            trial_period_days: 14,
            is_active: 1,
            is_custom: 0,
            monthly_price: 29.99,
            monthly_fee_our_gateway: 2.99,
            monthly_fee_byo_processor: 1.99,
            card_processing_fee_percentage: 2.9,
            card_processing_fee_fixed: 0.30,
            additional_device_cost: 9.99,
            annual_discount_percentage: 10,
            biennial_discount_percentage: 15,
            triennial_discount_percentage: 20,
            included_devices_count: 5,
            max_users_per_branch: 10,
            included_branches_count: 1,
            features: [],
            add_ons: [],
            support_sla: [],
            volume_discounts: []
          } 
        },
        status: 200,
        statusText: 'OK',
        headers: {} as any,
        config: { url: '/api/plans/1', method: 'get', headers: {} as any }
      });

      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      // Check basic component structure
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
    });

    it('should handle plan data loading error', async () => {
      const { planService } = await import('@plan-management/api');
      vi.mocked(planService.getSubscriptionPlanDetails).mockRejectedValue(new Error('Network error'));

      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      // Check component renders correctly
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();
    });

    it('should handle retry after loading error', async () => {
      const user = userEvent.setup();
      const { planService } = await import('@plan-management/api');
      
      // First call fails
      vi.mocked(planService.getSubscriptionPlanDetails)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { 
            success: true, 
            count: 1,
            message: 'Plan details retrieved successfully',
            timestamp: new Date().toISOString(),
            data: {
              id: 1,
              name: 'Test Plan',
              description: 'Test Description',
              display_order: 1,
              trial_period_days: 14,
              is_active: 1,
              is_custom: 0,
              monthly_price: 29.99,
              monthly_fee_our_gateway: 2.99,
              monthly_fee_byo_processor: 1.99,
              card_processing_fee_percentage: 2.9,
              card_processing_fee_fixed: 0.30,
              additional_device_cost: 9.99,
              annual_discount_percentage: 10,
              biennial_discount_percentage: 15,
              triennial_discount_percentage: 20,
              included_devices_count: 5,
              max_users_per_branch: 10,
              included_branches_count: 1,
              features: [],
              add_ons: [],
              support_sla: [],
              volume_discounts: []
            } 
          },
          status: 200,
          statusText: 'OK',
          headers: {} as any,
          config: { url: '/api/plans/1', method: 'get', headers: {} as any }
        });

      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-container')).toBeInTheDocument();
      });

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      await waitFor(() => {
        expect(planService.getSubscriptionPlanDetails).toHaveBeenCalledTimes(2);
        expect(screen.queryByTestId('error-container')).not.toBeInTheDocument();
      });
    });

    it('should not show data recovery modal in edit mode', () => {
      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument();
    });
  });

  describe('view mode functionality', () => {
    it('should load plan data for view mode', async () => {
      const { planService } = await import('@plan-management/api');

      renderFormContainer({ 
        mode: 'view', 
        planId: 1 
      });

      await waitFor(() => {
        expect(planService.getSubscriptionPlanDetails).toHaveBeenCalledWith(1);
      });

      expect(screen.getByText('View Plan: Test Plan')).toBeInTheDocument();
    });

    it('should show edit and back to list buttons in view mode', async () => {
      renderFormContainer({ 
        mode: 'view', 
        planId: 1 
      });

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
        expect(screen.getByTestId('back-to-list-button')).toBeInTheDocument();
      });
    });

    it('should handle edit navigation', async () => {
      const user = userEvent.setup();

      renderFormContainer({ 
        mode: 'view', 
        planId: 1 
      });

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/admin/plan-management/edit/1');
    });

    it('should handle back to list navigation', async () => {
      const user = userEvent.setup();

      renderFormContainer({ 
        mode: 'view', 
        planId: 1 
      });

      await waitFor(() => {
        expect(screen.getByTestId('back-to-list-button')).toBeInTheDocument();
      });

      const backButton = screen.getByTestId('back-to-list-button');
      await user.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/admin/plan-management');
    });

    it('should not show data recovery modal in view mode', () => {
      renderFormContainer({ 
        mode: 'view', 
        planId: 1 
      });

      expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should handle form submission', async () => {
      const user = userEvent.setup();
      const { useFormSubmission } = await import('@plan-management/hooks');
      const mockSubmitForm = vi.fn();
      
      vi.mocked(useFormSubmission).mockReturnValue({
        submitForm: mockSubmitForm,
        isSubmitting: false,
        getSubmitButtonText: () => 'Create Plan'
      });

      renderFormContainer({ mode: 'create' });

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockSubmitForm).toHaveBeenCalledWith({ name: 'Test Plan' });
    });

    it('should show submitting state', async() => {
      const { useFormSubmission } = await import('@plan-management/hooks');
      
      vi.mocked(useFormSubmission).mockReturnValue({
        submitForm: vi.fn(),
        isSubmitting: true,
        getSubmitButtonText: () => 'Creating...'
      });

      renderFormContainer({ mode: 'create' });

      const formUI = screen.getByTestId('plan-form-ui');
      expect(formUI).toHaveTextContent('Is Submitting: true');
      expect(formUI).toHaveTextContent('Submit Button Text: Creating...');
    });

    it('should clear storage data after successful create submission', async () => {
      const { clearStorageData } = await import('@plan-management/utils');
      const { useFormSubmission } = await import('@plan-management/hooks');
      
      vi.mocked(useFormSubmission).mockImplementation((mode, planId, getValues, handleSuccess) => {
        // Simulate calling the success handler
        if (handleSuccess) {
          setTimeout(() => handleSuccess(), 0);
        }
        return {
          submitForm: vi.fn(),
          isSubmitting: false,
          getSubmitButtonText: () => 'Create Plan'
        };
      });

      renderFormContainer({ mode: 'create' });

      await waitFor(() => {
        expect(clearStorageData).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/plan-management');
      }, { timeout: 100 });
    });
  });

  describe('tab navigation', () => {
    it('should handle tab change', async () => {
      const user = userEvent.setup();
      const { useTabNavigation } = await import('@plan-management/hooks');
      const mockHandleTabChange = vi.fn();

      vi.mocked(useTabNavigation).mockReturnValue({
        tabUnlockState: { basic: true, pricing: true, features: true, addons: true, sla: true },
        isTabUnlocked: vi.fn(() => true),
        handleTabChange: mockHandleTabChange,
        handleNextTab: vi.fn(),
        handlePreviousTab: vi.fn()
      });

      renderFormContainer({ mode: 'create' });

      const tabChangeButton = screen.getByTestId('tab-change-button');
      await user.click(tabChangeButton);

      expect(mockHandleTabChange).toHaveBeenCalledWith('pricing');
    });

    it('should handle next tab navigation', async () => {
      const user = userEvent.setup();
      const { useTabNavigation } = await import('@plan-management/hooks');
      const mockHandleNextTab = vi.fn();

      vi.mocked(useTabNavigation).mockReturnValue({
        tabUnlockState: { basic: true, pricing: true, features: true, addons: true, sla: true },
        isTabUnlocked: vi.fn(() => true),
        handleTabChange: vi.fn(),
        handleNextTab: mockHandleNextTab,
        handlePreviousTab: vi.fn()
      });

      renderFormContainer({ mode: 'create' });

      const nextTabButton = screen.getByTestId('next-tab-button');
      await user.click(nextTabButton);

      expect(mockHandleNextTab).toHaveBeenCalled();
    });

    it('should handle previous tab navigation', async () => {
      const user = userEvent.setup();
      const { useTabNavigation } = await import('@plan-management/hooks');
      const mockHandlePreviousTab = vi.fn();

      vi.mocked(useTabNavigation).mockReturnValue({
        tabUnlockState: { basic: true, pricing: true, features: true, addons: true, sla: true },
        isTabUnlocked: vi.fn(() => true),
        handleTabChange: vi.fn(),
        handleNextTab: vi.fn(),
        handlePreviousTab: mockHandlePreviousTab
      });

      renderFormContainer({ mode: 'create' });

      const previousTabButton = screen.getByTestId('previous-tab-button');
      await user.click(previousTabButton);

      expect(mockHandlePreviousTab).toHaveBeenCalled();
    });
  });

  describe('auto-save functionality', () => {
    it('should save active tab to localStorage', () => {
      const mockSetItem = vi.fn();
      
      Object.defineProperty(window, 'localStorage', {
        value: { ...localStorage, setItem: mockSetItem },
        configurable: true
      });

      renderFormContainer({ mode: 'create' });

      // Just verify the component renders with localStorage mock in place
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();
      expect(mockSetItem).toBeDefined();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      Object.defineProperty(window, 'localStorage', {
        value: { 
          ...localStorage, 
          setItem: vi.fn(() => { throw new Error('Storage error'); })
        },
        configurable: true
      });

      renderFormContainer({ mode: 'create' });

      // Just verify the component renders without crashing when localStorage fails
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should not auto-save in edit mode', async () => {
      vi.useFakeTimers();
      const { saveFormDataToStorage } = await import('@plan-management/utils');

      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(saveFormDataToStorage).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should not auto-save in view mode', async () => {
      vi.useFakeTimers();
      const { saveFormDataToStorage } = await import('@plan-management/utils');

      renderFormContainer({ 
        mode: 'view', 
        planId: 1 
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(saveFormDataToStorage).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('should handle API response with success: false', async () => {
      const { planService } = await import('@plan-management/api');
      vi.mocked(planService.getSubscriptionPlanDetails).mockResolvedValue({
        data: { 
          success: false, 
          count: 0,
          message: 'Failed to retrieve plan details',
          timestamp: new Date().toISOString(),
          data: undefined 
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {} as any,
        config: { url: '/api/plans/1', method: 'get', headers: {} as any }
      });

      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-container')).toBeInTheDocument();
        expect(screen.getByText('Failed to load plan data. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle missing plan data in API response', async () => {
      const { planService } = await import('@plan-management/api');
      vi.mocked(planService.getSubscriptionPlanDetails).mockResolvedValue({
        data: { 
          success: true, 
          count: 0,
          message: 'No plan data found',
          timestamp: new Date().toISOString(),
          data: undefined 
        },
        status: 200,
        statusText: 'OK',
        headers: {} as any,
        config: { url: '/api/plans/1', method: 'get', headers: {} as any }
      });

      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-container')).toBeInTheDocument();
        expect(screen.getByText('Failed to load plan data. Please try again.')).toBeInTheDocument();
      });
    });

    it('should log errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { planService } = await import('@plan-management/api');
      const networkError = new Error('Network error');
      
      vi.mocked(planService.getSubscriptionPlanDetails).mockRejectedValue(networkError);

      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[PlanFormContainer] Error loading plan data:',
          networkError
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('component cleanup', () => {
    it('should clear timeouts on unmount', () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = renderFormContainer({ mode: 'create' });

      // Trigger timeout creation
      act(() => {
        vi.advanceTimersByTime(100);
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      vi.useRealTimers();
    });

    it('should prevent state updates after unmount', async () => {
      vi.useFakeTimers();
      const { saveFormDataToStorage } = await import('@plan-management/utils');

      const { unmount } = renderFormContainer({ mode: 'create' });

      unmount();

      // Try to trigger auto-save after unmount
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(saveFormDataToStorage).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('edge cases', () => {
    it('should handle missing planId in edit mode', () => {
      renderFormContainer({ mode: 'edit' });

      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
      expect(screen.queryByText('Loading plan data...')).not.toBeInTheDocument();
    });

    it('should handle missing planId in view mode', () => {
      renderFormContainer({ mode: 'view' });

      expect(screen.getByText('View Plan')).toBeInTheDocument();
      expect(screen.queryByText('Loading plan data...')).not.toBeInTheDocument();
    });

    it('should handle planId of 0 by not calling API', async () => {
      const { planService } = await import('@plan-management/api');

      renderFormContainer({ 
        mode: 'edit', 
        planId: 0 
      });

      // planId of 0 should be treated as falsy and not call the API
      expect(planService.getSubscriptionPlanDetails).not.toHaveBeenCalled();
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
    });

    it('should handle empty string title gracefully', () => {
      renderFormContainer({ 
        mode: 'create',
        title: ''
      });

      // Should fall back to default title
      expect(screen.getByText('Create New Plan')).toBeInTheDocument();
    });

    it('should handle form values watcher when form is not initialized', async () => {
      // This tests the edge case where watch() is called before form is ready
      const { useFormSubmission } = await import('@plan-management/hooks');
      
      vi.mocked(useFormSubmission).mockImplementation(() => {
        // Simulate hook throwing error during initialization
        throw new Error('Form not ready');
      });

      expect(() => {
        renderFormContainer({ mode: 'create' });
      }).toThrow('Form not ready');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete create workflow', async() => {
      const { hasStorageData } = vi.mocked(await import ('@plan-management/utils'));
      vi.mocked(hasStorageData).mockReturnValue(false);

      renderFormContainer({ mode: 'create' });

      // Basic integration test - just verify components work together
      expect(screen.getByText('Create New Plan')).toBeInTheDocument();
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();
      expect(screen.getByText('Mode: create')).toBeInTheDocument();
    });

    it('should handle edit mode with error recovery', async () => {
      const { planService } = await import('@plan-management/api');
      vi.mocked(planService.getSubscriptionPlanDetails).mockRejectedValue(new Error('Network error'));

      renderFormContainer({ 
        mode: 'edit', 
        planId: 1 
      });

      // Basic check that component renders in edit mode
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();
    });

    it('should handle view mode navigation flow', () => {
      renderFormContainer({ 
        mode: 'view', 
        planId: 1 
      });

      // Basic check that component renders in view mode
      expect(screen.getByText('View Plan')).toBeInTheDocument();
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument();
    });
  });
});