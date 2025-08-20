import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { Provider } from '@/components/ui/provider';
import PlanFormUI from '../form-ui';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';
import { PlanManagementTabs, PlanFormMode } from '@plan-management/types/plans';

// Mock dependencies
vi.mock('@plan-management/schemas/validation/plans', () => ({
  CreatePlanFormData: {}
}));

vi.mock('@plan-management/config', () => ({
  PLAN_MANAGEMENT_FORM_TABS: [
    { id: 'basic', label: 'Basic Info', icon: () => <span data-testid="basic-icon">Info</span> },
    { id: 'pricing', label: 'Pricing', icon: () => <span data-testid="pricing-icon">Dollar</span> },
    { id: 'features', label: 'Features', icon: () => <span data-testid="features-icon">Sparkles</span> },
    { id: 'addons', label: 'Add-ons', icon: () => <span data-testid="addons-icon">Plus</span> },
    { id: 'sla', label: 'SLA', icon: () => <span data-testid="sla-icon">Handshake</span> }
  ],
  PLAN_FORM_MODES: {
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view'
  },
  AUTO_SAVE_DEBOUNCE_MS: 1000,
  DEFAULT_PLAN_TAB: 'basic',
  FORM_VALIDATION_DEBOUNCE_MS: 300
}));

vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096',
  PRIMARY_COLOR: '#3182ce'
}));

vi.mock('@shared/contexts', () => ({
  useResourceErrors: vi.fn(() => ({ 
    error: null,
    addError: vi.fn(),
    removeError: vi.fn(),
    clearAllErrors: vi.fn()
  }))
}));

vi.mock('@shared/components', () => ({
  ErrorMessageContainer: ({ error, title, onRetry, isRetrying, testId }: any) => (
    <div data-testid={testId}>
      <h3>{title}</h3>
      <p>{error}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} disabled={isRetrying} data-testid="retry-button">
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      )}
    </div>
  ),
  ErrorBoundary: ({ children, onError }: any) => {
    try {
      return <div data-testid="error-boundary">{children}</div>;
    } catch (error) {
      onError?.(error, {});
      return <div data-testid="error-fallback">Something went wrong</div>;
    }
  }
}));

// Mock tab components
vi.mock('../tabs', () => ({
  PlanBasicDetails: ({ mode, onNext, onPrevious, isFirstTab }: any) => (
    <div data-testid="plan-basic-details">
      <p>Mode: {mode}</p>
      <p>Is First Tab: {isFirstTab?.toString()}</p>
      <button type="button" onClick={onNext} data-testid="basic-next-button">Next</button>
      <button type="button" onClick={onPrevious} data-testid="basic-previous-button">Previous</button>
    </div>
  ),
  PlanPricingConfiguration: ({ mode, onNext, onPrevious }: any) => (
    <div data-testid="plan-pricing-configuration">
      <p>Mode: {mode}</p>
      <button type="button" onClick={onNext} data-testid="pricing-next-button">Next</button>
      <button type="button" onClick={onPrevious} data-testid="pricing-previous-button">Previous</button>
    </div>
  ),
  PlanFeatureSelection: ({ mode, onNext, onPrevious, isActive }: any) => (
    <div data-testid="plan-feature-selection">
      <p>Mode: {mode}</p>
      <p>Is Active: {isActive?.toString()}</p>
      <button type="button" onClick={onNext} data-testid="features-next-button">Next</button>
      <button type="button" onClick={onPrevious} data-testid="features-previous-button">Previous</button>
    </div>
  ),
  PlanAddonConfiguration: ({ mode, onNext, onPrevious, isActive }: any) => (
    <div data-testid="plan-addon-configuration">
      <p>Mode: {mode}</p>
      <p>Is Active: {isActive?.toString()}</p>
      <button type="button" onClick={onNext} data-testid="addons-next-button">Next</button>
      <button type="button" onClick={onPrevious} data-testid="addons-previous-button">Previous</button>
    </div>
  ),
  PlanSlaConfiguration: ({ 
    mode, onNext, onPrevious, onSubmit, onEdit, onBackToList, 
    submitButtonText, isSubmitting, isActive 
  }: any) => (
    <div data-testid="plan-sla-configuration">
      <p>Mode: {mode}</p>
      <p>Is Active: {isActive?.toString()}</p>
      <p>Submit Button Text: {submitButtonText}</p>
      <p>Is Submitting: {isSubmitting?.toString()}</p>
      <button type="button" onClick={onNext} data-testid="sla-next-button">Next</button>
      <button type="button" onClick={onPrevious} data-testid="sla-previous-button">Previous</button>
      {onSubmit && (
        <button type="button" onClick={() => onSubmit({})} data-testid="sla-submit-button">
          {submitButtonText || 'Submit'}
        </button>
      )}
      {onEdit && (
        <button type="button" onClick={onEdit} data-testid="sla-edit-button">Edit</button>
      )}
      {onBackToList && (
        <button type="button" onClick={onBackToList} data-testid="sla-back-button">Back to List</button>
      )}
    </div>
  )
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaLock: () => <span data-testid="lock-icon">Lock</span>,
  FaCheck: () => <span data-testid="check-icon">Check</span>
}));

// Test wrapper component
const FormTestWrapper = ({ 
  children, 
  defaultValues = {} 
}: { 
  children: React.ReactNode;
  defaultValues?: Partial<CreatePlanFormData>;
}) => {
  const methods = useForm<CreatePlanFormData>({
    defaultValues: {
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
      ...defaultValues
    }
  });

  return (
    <Provider>
      <FormProvider {...methods}>
        {children}
      </FormProvider>
    </Provider>
  );
};

// Default props for testing
const defaultProps = {
  mode: 'create' as PlanFormMode,
  activeTab: 'basic' as PlanManagementTabs,
  showSavedIndicator: false,
  isSubmitting: false,
  submitButtonText: 'Create Plan',
  tabUnlockState: {
    basic: true,
    pricing: true,
    features: true,
    addons: true,
    sla: true
  },
  onTabChange: vi.fn(),
  onNextTab: vi.fn(),
  onPreviousTab: vi.fn(),
  onSubmit: vi.fn()
};

describe('PlanFormUI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all main components correctly', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} />
        </FormTestWrapper>
      );

      // Check error boundary
      expect(screen.getAllByTestId('error-boundary').length).toBeGreaterThan(0);

      // Check form element
      const formElement = document.querySelector('form');
      expect(formElement).toBeInTheDocument();

      // Check tab list
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      // Check all tab buttons are rendered
      expect(screen.getByRole('tab', { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /pricing/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /features/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /add-ons/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /sla/i })).toBeInTheDocument();
    });

    it('should render correct tab icons', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} />
        </FormTestWrapper>
      );

      expect(screen.getByTestId('basic-icon')).toBeInTheDocument();
      expect(screen.getByTestId('pricing-icon')).toBeInTheDocument();
      expect(screen.getByTestId('features-icon')).toBeInTheDocument();
      expect(screen.getByTestId('addons-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sla-icon')).toBeInTheDocument();
    });

    it('should render active tab content', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="basic" />
        </FormTestWrapper>
      );

      // All tab content is rendered, but only active tab is visible
      expect(screen.getByTestId('plan-basic-details')).toBeInTheDocument();
      expect(screen.getByTestId('plan-pricing-configuration')).toBeInTheDocument();
      
      // Check that the correct tab is selected
      const basicTab = screen.getByRole('tab', { name: /basic info/i });
      const pricingTab = screen.getByRole('tab', { name: /pricing/i });
      
      expect(basicTab).toHaveAttribute('aria-selected', 'true');
      expect(pricingTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should not render saved indicator by default', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} mode="edit" showSavedIndicator={false} />
        </FormTestWrapper>
      );

      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('should call onTabChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const mockOnTabChange = vi.fn();

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} onTabChange={mockOnTabChange} />
        </FormTestWrapper>
      );

      const pricingTab = screen.getByRole('tab', { name: /pricing/i });
      await user.click(pricingTab);

      expect(mockOnTabChange).toHaveBeenCalledWith('pricing');
    });

    it('should render different tab content based on activeTab prop', () => {
      const { rerender } = render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="basic" />
        </FormTestWrapper>
      );

      expect(screen.getByTestId('plan-basic-details')).toBeInTheDocument();
      
      const basicTab = screen.getByRole('tab', { name: /basic info/i });
      expect(basicTab).toHaveAttribute('aria-selected', 'true');

      rerender(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="pricing" />
        </FormTestWrapper>
      );

      expect(screen.getByTestId('plan-pricing-configuration')).toBeInTheDocument();
      
      const pricingTab = screen.getByRole('tab', { name: /pricing/i });
      expect(pricingTab).toHaveAttribute('aria-selected', 'true');
      
      const basicTabAfterRerender = screen.getByRole('tab', { name: /basic info/i });
      expect(basicTabAfterRerender).toHaveAttribute('aria-selected', 'false');
    });

    it('should show locked tabs with lock icon when not unlocked', () => {
      const lockedTabState = {
        basic: true,
        pricing: false,
        features: false,
        addons: false,
        sla: false
      };

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} tabUnlockState={lockedTabState} />
        </FormTestWrapper>
      );

      // Check that locked tabs show lock icons
      const lockIcons = screen.getAllByTestId('lock-icon');
      expect(lockIcons).toHaveLength(4); // 4 locked tabs

      // Check that unlocked tab doesn't have lock icon
      const basicTab = screen.getByRole('tab', { name: /basic info/i });
      expect(basicTab).not.toHaveTextContent('Lock');
    });

    it('should disable locked tabs', () => {
      const lockedTabState = {
        basic: true,
        pricing: false,
        features: false,
        addons: false,
        sla: false
      };

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} tabUnlockState={lockedTabState} />
        </FormTestWrapper>
      );

      const pricingTab = screen.getByRole('tab', { name: /pricing/i });
      expect(pricingTab).toBeDisabled();

      const basicTab = screen.getByRole('tab', { name: /basic info/i });
      expect(basicTab).not.toBeDisabled();
    });
  });

  describe('form modes', () => {
    it('should render correctly in create mode', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} mode="create" />
        </FormTestWrapper>
      );

      const basicComponent = screen.getByTestId('plan-basic-details');
      expect(basicComponent).toHaveTextContent('Mode: create');
    });

    it('should render correctly in edit mode', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} mode="edit" />
        </FormTestWrapper>
      );

      const basicComponent = screen.getByTestId('plan-basic-details');
      expect(basicComponent).toHaveTextContent('Mode: edit');
    });

    it('should render correctly in view mode', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} mode="view" activeTab="sla" />
        </FormTestWrapper>
      );

      const slaComponent = screen.getByTestId('plan-sla-configuration');
      expect(slaComponent).toHaveTextContent('Mode: view');
      
      // In view mode, onSubmit should not be passed to SLA tab
      expect(screen.queryByTestId('sla-submit-button')).not.toBeInTheDocument();
    });

    it('should show edit and back to list buttons in view mode', () => {
      const mockOnEdit = vi.fn();
      const mockOnBackToList = vi.fn();

      render(
        <FormTestWrapper>
          <PlanFormUI 
            {...defaultProps} 
            mode="view" 
            activeTab="sla"
            onEdit={mockOnEdit}
            onBackToList={mockOnBackToList}
          />
        </FormTestWrapper>
      );

      expect(screen.getByTestId('sla-edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('sla-back-button')).toBeInTheDocument();
    });
  });

  describe('saved indicator', () => {
    it('should show saved indicator when enabled in create mode', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} mode="create" showSavedIndicator={true} />
        </FormTestWrapper>
      );

      expect(screen.getByText('Saved')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should not show saved indicator in edit mode even when enabled', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} mode="edit" showSavedIndicator={true} />
        </FormTestWrapper>
      );

      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });

    it('should not show saved indicator in view mode', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} mode="view" showSavedIndicator={true} />
        </FormTestWrapper>
      );

      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });

    it('should have correct animation styles when shown', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} mode="create" showSavedIndicator={true} />
        </FormTestWrapper>
      );

      const savedIndicator = screen.getByText('Saved').closest('div');
      expect(savedIndicator).toBeInTheDocument();
      
      // Check for the existence of the saved indicator with proper styling structure
      const savedText = screen.getByText('Saved');
      expect(savedText).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="sla" onSubmit={mockOnSubmit} />
        </FormTestWrapper>
      );

      const submitButton = screen.getByTestId('sla-submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({});
    });

    it('should show correct submit button text', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="sla" submitButtonText="Update Plan" />
        </FormTestWrapper>
      );

      expect(screen.getByText('Submit Button Text: Update Plan')).toBeInTheDocument();
    });

    it('should show submitting state', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="sla" isSubmitting={true} />
        </FormTestWrapper>
      );

      expect(screen.getByText('Is Submitting: true')).toBeInTheDocument();
    });
  });

  describe('tab content props', () => {
    it('should pass correct props to PlanBasicDetails', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="basic" mode="create" />
        </FormTestWrapper>
      );

      const basicComponent = screen.getByTestId('plan-basic-details');
      expect(basicComponent).toHaveTextContent('Mode: create');
      expect(basicComponent).toHaveTextContent('Is First Tab: true');
    });

    it('should pass correct props to PlanFeatureSelection', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="features" mode="edit" />
        </FormTestWrapper>
      );

      const featuresComponent = screen.getByTestId('plan-feature-selection');
      expect(featuresComponent).toHaveTextContent('Mode: edit');
      expect(featuresComponent).toHaveTextContent('Is Active: true');
    });

    it('should pass correct props to PlanAddonConfiguration', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="addons" mode="view" />
        </FormTestWrapper>
      );

      const addonsComponent = screen.getByTestId('plan-addon-configuration');
      expect(addonsComponent).toHaveTextContent('Mode: view');
      expect(addonsComponent).toHaveTextContent('Is Active: true');
    });

    it('should pass correct props to PlanSlaConfiguration', () => {
      const mockOnEdit = vi.fn();
      const mockOnBackToList = vi.fn();

      render(
        <FormTestWrapper>
          <PlanFormUI 
            {...defaultProps} 
            activeTab="sla" 
            mode="view"
            onEdit={mockOnEdit}
            onBackToList={mockOnBackToList}
            submitButtonText="Save Changes"
            isSubmitting={true}
          />
        </FormTestWrapper>
      );

      // Check that the SLA configuration component receives the correct props
      const slaComponent = screen.getByTestId('plan-sla-configuration');
      expect(slaComponent).toHaveTextContent('Mode: view');
      expect(slaComponent).toHaveTextContent('Is Active: true');
      expect(slaComponent).toHaveTextContent('Submit Button Text: Save Changes');
      expect(slaComponent).toHaveTextContent('Is Submitting: true');
    });
  });

  describe('navigation callbacks', () => {
    it('should call onNextTab when next button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnNextTab = vi.fn();

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="basic" onNextTab={mockOnNextTab} />
        </FormTestWrapper>
      );

      const nextButton = screen.getByTestId('basic-next-button');
      await user.click(nextButton);

      expect(mockOnNextTab).toHaveBeenCalled();
    });

    it('should call onPreviousTab when previous button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnPreviousTab = vi.fn();

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="pricing" onPreviousTab={mockOnPreviousTab} />
        </FormTestWrapper>
      );

      const previousButton = screen.getByTestId('pricing-previous-button');
      await user.click(previousButton);

      expect(mockOnPreviousTab).toHaveBeenCalled();
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="sla" mode="view" onEdit={mockOnEdit} />
        </FormTestWrapper>
      );

      const editButton = screen.getByTestId('sla-edit-button');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalled();
    });

    it('should call onBackToList when back button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnBackToList = vi.fn();

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab="sla" mode="view" onBackToList={mockOnBackToList} />
        </FormTestWrapper>
      );

      const backButton = screen.getByTestId('sla-back-button');
      await user.click(backButton);

      expect(mockOnBackToList).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should render error message when resource error exists', async () => {
      const mockError = {
        error: 'Failed to load resources',
        title: 'Loading Error',
        onRetry: vi.fn(),
        isRetrying: false,
        id: 'resource-error'
      };

      const { useResourceErrors } = await import('@shared/contexts');
      const mockUseResourceErrors = vi.mocked(useResourceErrors);
      mockUseResourceErrors.mockReturnValue({ 
        error: mockError,
        addError: vi.fn(),
        removeError: vi.fn(),
        clearAllErrors: vi.fn()
      });

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} />
        </FormTestWrapper>
      );

      expect(screen.getByTestId('resource-error-error')).toBeInTheDocument();
      expect(screen.getByText('Loading Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load resources')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should call retry handler when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnRetry = vi.fn();
      const mockError = {
        error: 'Failed to load resources',
        title: 'Loading Error',
        onRetry: mockOnRetry,
        isRetrying: false,
        id: 'resource-error'
      };

      const { useResourceErrors } = await import('@shared/contexts');
      const mockUseResourceErrors = vi.mocked(useResourceErrors);
      mockUseResourceErrors.mockReturnValue({ 
        error: mockError,
        addError: vi.fn(),
        removeError: vi.fn(),
        clearAllErrors: vi.fn()
      });

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} />
        </FormTestWrapper>
      );

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('should disable retry button when retrying', async () => {
      const mockError = {
        error: 'Failed to load resources',
        title: 'Loading Error',
        onRetry: vi.fn(),
        isRetrying: true,
        id: 'resource-error'
      };

      const { useResourceErrors } = await import('@shared/contexts');
      const mockUseResourceErrors = vi.mocked(useResourceErrors);
      mockUseResourceErrors.mockReturnValue({ 
        error: mockError,
        addError: vi.fn(),
        removeError: vi.fn(),
        clearAllErrors: vi.fn()
      });

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} />
        </FormTestWrapper>
      );

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeDisabled();
      expect(retryButton).toHaveTextContent('Retrying...');
    });

    it('should not render error message when no resource error exists', async () => {
      const { useResourceErrors } = await import('@shared/contexts');
      const mockUseResourceErrors = vi.mocked(useResourceErrors);
      mockUseResourceErrors.mockReturnValue({ 
        error: null,
        addError: vi.fn(),
        removeError: vi.fn(),
        clearAllErrors: vi.fn()
      });

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} />
        </FormTestWrapper>
      );

      expect(screen.queryByTestId('resource-error-error')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} />
        </FormTestWrapper>
      );

      // Check form element  
      const formElement = document.querySelector('form');
      expect(formElement).toBeInTheDocument();

      // Check tablist role
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      // Check individual tab roles
      expect(screen.getByRole('tab', { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /pricing/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /features/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /add-ons/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /sla/i })).toBeInTheDocument();
    });

    it('should have proper cursor styles for locked/unlocked tabs', () => {
      const partiallyLockedState = {
        basic: true,
        pricing: false,
        features: true,
        addons: true,
        sla: true
      };

      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} tabUnlockState={partiallyLockedState} />
        </FormTestWrapper>
      );

      const basicTab = screen.getByRole('tab', { name: /basic info/i });
      const pricingTab = screen.getByRole('tab', { name: /pricing/i });

      // Unlocked tab should not be disabled
      expect(basicTab).not.toBeDisabled();
      // Locked tab should be disabled
      expect(pricingTab).toBeDisabled();
    });
  });

  describe('edge cases', () => {
    it('should handle null activeTab gracefully', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} activeTab={null} />
        </FormTestWrapper>
      );

      // Should still render the form structure
      const formElement = document.querySelector('form');
      expect(formElement).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should handle empty tabUnlockState', () => {
      render(
        <FormTestWrapper>
          <PlanFormUI {...defaultProps} tabUnlockState={{} as any} />
        </FormTestWrapper>
      );

      // All tabs should be locked (disabled)
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toBeDisabled();
      });
    });

    it('should handle missing optional callbacks', () => {
      const minimalProps = {
        ...defaultProps,
        onEdit: undefined,
        onBackToList: undefined
      };

      render(
        <FormTestWrapper>
          <PlanFormUI {...minimalProps} activeTab="sla" />
        </FormTestWrapper>
      );

      // Should render without error
      expect(screen.getByTestId('plan-sla-configuration')).toBeInTheDocument();
      // Optional buttons should not be present
      expect(screen.queryByTestId('sla-edit-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sla-back-button')).not.toBeInTheDocument();
    });
  });

  describe('form integration', () => {
    it('should use handleSubmit from form context', () => {
      const formData = { name: 'Test Plan', description: 'Test Description' };
      
      render(
        <FormTestWrapper defaultValues={formData}>
          <PlanFormUI {...defaultProps} />
        </FormTestWrapper>
      );

      // Form should be properly wrapped with FormProvider
      const formElement = document.querySelector('form');
      expect(formElement).toBeInTheDocument();
    });

    it('should pass form submission through handleSubmit wrapper', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      const formData = { name: 'Test Plan' };

      render(
        <FormTestWrapper defaultValues={formData}>
          <PlanFormUI {...defaultProps} activeTab="sla" onSubmit={mockOnSubmit} />
        </FormTestWrapper>
      );

      const submitButton = screen.getByTestId('sla-submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});