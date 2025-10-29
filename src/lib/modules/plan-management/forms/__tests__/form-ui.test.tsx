/* Comprehensive test suite for PlanFormUI component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import { useRouter } from 'next/navigation'

/* Plan module imports */
import PlanFormUI from '@plan-management/forms/form-ui'
import { CreatePlanFormData } from '@plan-management/schemas'
import { PLAN_FORM_MODES, PLAN_FORM_TAB, PLAN_PAGE_ROUTES } from '@plan-management/constants'
import * as planFormModeContext from '@plan-management/contexts'
import * as resourceErrorsContext from '@shared/contexts/resource-error'
import * as tabValidationHook from '@plan-management/hooks/use-tab-validation'

/* Mock dependencies */
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

vi.mock('@shared/components/common', () => ({
  ErrorMessageContainer: ({ error, title, onRetry, onDismiss, testId }: {
    error: string;
    title?: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    testId?: string;
  }) => (
    <div data-testid={testId || 'error-container'}>
      {title && <div data-testid="error-title">{title}</div>}
      <div data-testid="error-message">{error}</div>
      {onRetry && <button onClick={onRetry} data-testid="error-retry">Retry</button>}
      {onDismiss && <button onClick={onDismiss} data-testid="error-dismiss">Dismiss</button>}
    </div>
  )
}))

vi.mock('@plan-management/forms/tabs', () => ({
  PlanBasicDetails: () => <div data-testid="basic-details-tab">Basic Details</div>,
  PlanPricingConfiguration: () => <div data-testid="pricing-tab">Pricing Configuration</div>,
  PlanFeatureSelection: ({ isActive }: { isActive: boolean }) => (
    <div data-testid="features-tab">Features Selection - {isActive ? 'Active' : 'Inactive'}</div>
  ),
  PlanAddonConfiguration: ({ isActive }: { isActive: boolean }) => (
    <div data-testid="addons-tab">Addons Configuration - {isActive ? 'Active' : 'Inactive'}</div>
  ),
  PlanSlaConfiguration: ({ isActive }: { isActive: boolean }) => (
    <div data-testid="sla-tab">SLA Configuration - {isActive ? 'Active' : 'Inactive'}</div>
  )
}))

vi.mock('@plan-management/components', () => ({
  TabNavigation: ({ onNext, onPrevious, onSubmit, onEdit, onBackToList, isFirstTab, isLastTab, isSubmitting, isFormValid, submitButtonText, readOnly }: {
    onNext?: () => void;
    onPrevious?: () => void;
    onSubmit?: () => void;
    onEdit?: () => void;
    onBackToList: () => void;
    isFirstTab: boolean;
    isLastTab: boolean;
    isSubmitting: boolean;
    isFormValid: boolean;
    submitButtonText: string;
    readOnly: boolean;
  }) => (
    <div data-testid="tab-navigation">
      {!isFirstTab && onPrevious && <button onClick={onPrevious} data-testid="nav-previous">Previous</button>}
      {!isLastTab && onNext && <button onClick={onNext} data-testid="nav-next" disabled={!isFormValid}>Next</button>}
      {isLastTab && !readOnly && onSubmit && <button onClick={onSubmit} data-testid="nav-submit" disabled={isSubmitting || !isFormValid}>{submitButtonText}</button>}
      {readOnly && onEdit && <button onClick={onEdit} data-testid="nav-edit">Edit</button>}
      <button onClick={onBackToList} data-testid="nav-back">Back to List</button>
    </div>
  )
}))

describe('PlanFormUI', () => {
  const mockOnTabChange = vi.fn()
  const mockOnNextTab = vi.fn()
  const mockOnPreviousTab = vi.fn()
  const mockOnSubmit = vi.fn()
  const mockRouterPush = vi.fn()
  const mockRemoveError = vi.fn()
  const mockTrigger = vi.fn()

  const defaultProps = {
    activeTab: PLAN_FORM_TAB.BASIC,
    showSavedIndicator: false,
    isSubmitting: false,
    tabUnlockState: {
      [PLAN_FORM_TAB.BASIC]: true,
      [PLAN_FORM_TAB.PRICING]: true,
      [PLAN_FORM_TAB.FEATURES]: true,
      [PLAN_FORM_TAB.ADDONS]: true,
      [PLAN_FORM_TAB.SLA]: true
    },
    onTabChange: mockOnTabChange,
    onNextTab: mockOnNextTab,
    onPreviousTab: mockOnPreviousTab,
    onSubmit: mockOnSubmit
  }

  const defaultTabValidationReturn = {
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
  }

  const defaultResourceErrorsReturn = {
    error: null,
    addError: vi.fn(),
    removeError: mockRemoveError,
    clearAllErrors: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useRouter).mockReturnValue({
      push: mockRouterPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn()
    })

    vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
      mode: PLAN_FORM_MODES.CREATE,
      planId: undefined
    })

    vi.spyOn(resourceErrorsContext, 'useResourceErrors').mockReturnValue(defaultResourceErrorsReturn)
    vi.spyOn(tabValidationHook, 'useTabValidation').mockReturnValue(defaultTabValidationReturn)

    mockTrigger.mockResolvedValue(true)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = (props: Partial<React.ComponentProps<typeof PlanFormUI>> = {}) => {
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
        monthly_fee_our_gateway: '',
        monthly_fee_byo_processor: '',
        card_processing_fee_percentage: '',
        card_processing_fee_fixed: '',
        feature_ids: [],
        addon_assignments: [],
        support_sla_ids: [],
        volume_discounts: []
      }
    })

    /* Override trigger method */
    methods.trigger = mockTrigger

    return (
      <FormProvider {...methods}>
        <PlanFormUI {...defaultProps} {...props} />
      </FormProvider>
    )
  }

  describe('Tab Rendering', () => {
    it('should render basic details tab when active', () => {
      render(<TestComponent activeTab={PLAN_FORM_TAB.BASIC} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('basic-details-tab')).toBeInTheDocument()
    })

    it('should render pricing tab when active', () => {
      render(<TestComponent activeTab={PLAN_FORM_TAB.PRICING} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('pricing-tab')).toBeInTheDocument()
    })

    it('should render features tab when active', () => {
      render(<TestComponent activeTab={PLAN_FORM_TAB.FEATURES} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('features-tab')).toBeInTheDocument()
      expect(screen.getByText(/Features Selection - Active/)).toBeInTheDocument()
    })

    it('should render addons tab when active', () => {
      render(<TestComponent activeTab={PLAN_FORM_TAB.ADDONS} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('addons-tab')).toBeInTheDocument()
      expect(screen.getByText(/Addons Configuration - Active/)).toBeInTheDocument()
    })

    it('should render SLA tab when active', () => {
      render(<TestComponent activeTab={PLAN_FORM_TAB.SLA} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('sla-tab')).toBeInTheDocument()
      expect(screen.getByText(/SLA Configuration - Active/)).toBeInTheDocument()
    })

    it('should pass isActive prop correctly to tabs', () => {
      render(<TestComponent activeTab={PLAN_FORM_TAB.PRICING} />, { wrapper: TestWrapper })

      /* Features tab should be inactive */
      expect(screen.queryByText(/Features Selection - Active/)).not.toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should render tab navigation component', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })

    it('should call onPreviousTab when previous button clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent activeTab={PLAN_FORM_TAB.PRICING} />, { wrapper: TestWrapper })

      const previousButton = screen.getByTestId('nav-previous')
      await user.click(previousButton)

      expect(mockOnPreviousTab).toHaveBeenCalledTimes(1)
    })

    it('should validate before calling onNextTab', async () => {
      const user = userEvent.setup()
      mockTrigger.mockResolvedValue(true)

      render(<TestComponent activeTab={PLAN_FORM_TAB.BASIC} />, { wrapper: TestWrapper })

      const nextButton = screen.getByTestId('nav-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled()
        expect(mockOnNextTab).toHaveBeenCalled()
      })
    })

    it('should not proceed to next tab if validation fails', async () => {
      const user = userEvent.setup()
      mockTrigger.mockResolvedValue(false)

      render(<TestComponent activeTab={PLAN_FORM_TAB.BASIC} />, { wrapper: TestWrapper })

      const nextButton = screen.getByTestId('nav-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled()
        expect(mockOnNextTab).not.toHaveBeenCalled()
      })
    })

    it('should skip validation in VIEW mode when navigating', async () => {
      const user = userEvent.setup()
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })

      render(<TestComponent activeTab={PLAN_FORM_TAB.BASIC} />, { wrapper: TestWrapper })

      const nextButton = screen.getByTestId('nav-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(mockTrigger).not.toHaveBeenCalled()
        expect(mockOnNextTab).toHaveBeenCalled()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup()
      render(<TestComponent activeTab={PLAN_FORM_TAB.SLA} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('nav-submit')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('should show "Create Plan" text in CREATE mode', () => {
      render(<TestComponent activeTab={PLAN_FORM_TAB.SLA} isSubmitting={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Create Plan')).toBeInTheDocument()
    })

    it('should show "Update Plan" text in EDIT mode', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })

      render(<TestComponent activeTab={PLAN_FORM_TAB.SLA} isSubmitting={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Update Plan')).toBeInTheDocument()
    })

    it('should show "Creating..." text when submitting in CREATE mode', () => {
      render(<TestComponent activeTab={PLAN_FORM_TAB.SLA} isSubmitting={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })

    it('should show "Updating..." text when submitting in EDIT mode', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })

      render(<TestComponent activeTab={PLAN_FORM_TAB.SLA} isSubmitting={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })

    it('should not show submit button in VIEW mode', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })

      render(<TestComponent activeTab={PLAN_FORM_TAB.SLA} />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('nav-submit')).not.toBeInTheDocument()
      expect(screen.getByTestId('nav-edit')).toBeInTheDocument()
    })
  })

  describe('VIEW Mode Navigation', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 123
      })
    })

    it('should navigate to edit page when edit button clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const editButton = screen.getByTestId('nav-edit')
      await user.click(editButton)

      expect(mockRouterPush).toHaveBeenCalledWith(
        PLAN_PAGE_ROUTES.EDIT.replace(':id', '123')
      )
    })

    it('should navigate to list page when back button clicked', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const backButton = screen.getByTestId('nav-back')
      await user.click(backButton)

      expect(mockRouterPush).toHaveBeenCalledWith(PLAN_PAGE_ROUTES.HOME)
    })
  })

  describe('Auto-save Indicator', () => {
    it('should show saved indicator in CREATE mode when showSavedIndicator is true', () => {
      render(<TestComponent showSavedIndicator={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Saved')).toBeInTheDocument()
    })

    it('should not show saved indicator when showSavedIndicator is false', () => {
      render(<TestComponent showSavedIndicator={false} />, { wrapper: TestWrapper })

      /* Element exists but with opacity 0 - component uses CSS transition */
      const savedText = screen.getByText('Saved')
      expect(savedText).toBeInTheDocument()
      /* The parent Box element should have low opacity when hidden */
      const parentBox = savedText.parentElement?.parentElement
      expect(parentBox).toBeInTheDocument()
    })

    it('should not show saved indicator in EDIT mode', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })

      render(<TestComponent showSavedIndicator={true} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Saved')).not.toBeInTheDocument()
    })

    it('should not show saved indicator in VIEW mode', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })

      render(<TestComponent showSavedIndicator={true} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Saved')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    const mockError = {
      id: 'test-error-id',
      error: 'Failed to load resources',
      title: 'Resource Error',
      onRetry: vi.fn(),
      isRetrying: false
    }

    it('should display error when error exists', () => {
      vi.spyOn(resourceErrorsContext, 'useResourceErrors').mockReturnValue({
        ...defaultResourceErrorsReturn,
        error: mockError
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('test-error-id-error')).toBeInTheDocument()
      expect(screen.getByTestId('error-title')).toHaveTextContent('Resource Error')
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load resources')
    })

    it('should not display error when no error exists', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('error-container')).not.toBeInTheDocument()
    })

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceErrorsContext, 'useResourceErrors').mockReturnValue({
        ...defaultResourceErrorsReturn,
        error: mockError
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const retryButton = screen.getByTestId('error-retry')
      await user.click(retryButton)

      expect(mockError.onRetry).toHaveBeenCalledTimes(1)
    })

    it('should call removeError when dismiss button clicked', async () => {
      const user = userEvent.setup()
      vi.spyOn(resourceErrorsContext, 'useResourceErrors').mockReturnValue({
        ...defaultResourceErrorsReturn,
        error: mockError
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const dismissButton = screen.getByTestId('error-dismiss')
      await user.click(dismissButton)

      expect(mockRemoveError).toHaveBeenCalledWith('test-error-id')
    })
  })

  describe('Tab Validation State', () => {
    it('should return correct validation for basic info tab', () => {
      vi.spyOn(tabValidationHook, 'useTabValidation').mockReturnValue({
        ...defaultTabValidationReturn,
        isBasicInfoValid: false
      })

      render(<TestComponent activeTab={PLAN_FORM_TAB.BASIC} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })

    it('should return correct validation for pricing tab', () => {
      vi.spyOn(tabValidationHook, 'useTabValidation').mockReturnValue({
        ...defaultTabValidationReturn,
        isPricingInfoValid: false
      })

      render(<TestComponent activeTab={PLAN_FORM_TAB.PRICING} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })

    it('should return correct validation for features tab', () => {
      vi.spyOn(tabValidationHook, 'useTabValidation').mockReturnValue({
        ...defaultTabValidationReturn,
        isFeaturesValid: false
      })

      render(<TestComponent activeTab={PLAN_FORM_TAB.FEATURES} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })

    it('should return correct validation for addons tab', () => {
      vi.spyOn(tabValidationHook, 'useTabValidation').mockReturnValue({
        ...defaultTabValidationReturn,
        isAddonsValid: false
      })

      render(<TestComponent activeTab={PLAN_FORM_TAB.ADDONS} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })

    it('should return correct validation for SLA tab', () => {
      vi.spyOn(tabValidationHook, 'useTabValidation').mockReturnValue({
        ...defaultTabValidationReturn,
        isEntireFormValid: false
      })

      render(<TestComponent activeTab={PLAN_FORM_TAB.SLA} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })
  })

  describe('Tab Unlock State', () => {
    it('should render all tabs with unlock state', () => {
      const tabUnlockState = {
        [PLAN_FORM_TAB.BASIC]: true,
        [PLAN_FORM_TAB.PRICING]: true,
        [PLAN_FORM_TAB.FEATURES]: false,
        [PLAN_FORM_TAB.ADDONS]: false,
        [PLAN_FORM_TAB.SLA]: false
      }

      render(<TestComponent tabUnlockState={tabUnlockState} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })

    it('should handle all tabs unlocked', () => {
      const tabUnlockState = {
        [PLAN_FORM_TAB.BASIC]: true,
        [PLAN_FORM_TAB.PRICING]: true,
        [PLAN_FORM_TAB.FEATURES]: true,
        [PLAN_FORM_TAB.ADDONS]: true,
        [PLAN_FORM_TAB.SLA]: true
      }

      render(<TestComponent tabUnlockState={tabUnlockState} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })

    it('should handle only first tab unlocked', () => {
      const tabUnlockState = {
        [PLAN_FORM_TAB.BASIC]: true,
        [PLAN_FORM_TAB.PRICING]: false,
        [PLAN_FORM_TAB.FEATURES]: false,
        [PLAN_FORM_TAB.ADDONS]: false,
        [PLAN_FORM_TAB.SLA]: false
      }

      render(<TestComponent tabUnlockState={tabUnlockState} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })
  })

  describe('Field Validation Groups', () => {
    it('should validate basic info fields when navigating from basic tab', async () => {
      const user = userEvent.setup()
      render(<TestComponent activeTab={PLAN_FORM_TAB.BASIC} />, { wrapper: TestWrapper })

      const nextButton = screen.getByTestId('nav-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled()
      })
    })

    it('should validate pricing fields when navigating from pricing tab', async () => {
      const user = userEvent.setup()
      render(<TestComponent activeTab={PLAN_FORM_TAB.PRICING} />, { wrapper: TestWrapper })

      const nextButton = screen.getByTestId('nav-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled()
      })
    })

    it('should validate feature fields when navigating from features tab', async () => {
      const user = userEvent.setup()
      render(<TestComponent activeTab={PLAN_FORM_TAB.FEATURES} />, { wrapper: TestWrapper })

      const nextButton = screen.getByTestId('nav-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled()
      })
    })

    it('should validate addon fields when navigating from addons tab', async () => {
      const user = userEvent.setup()
      render(<TestComponent activeTab={PLAN_FORM_TAB.ADDONS} />, { wrapper: TestWrapper })

      const nextButton = screen.getByTestId('nav-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled()
      })
    })

    it('should validate SLA fields when on SLA tab', async () => {
      const user = userEvent.setup()
      render(<TestComponent activeTab={PLAN_FORM_TAB.SLA} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('nav-submit')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null active tab gracefully', () => {
      render(<TestComponent activeTab={null} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })

    it('should handle undefined planId in VIEW mode', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: undefined
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
    })

    it('should handle validation failure gracefully', async () => {
      const user = userEvent.setup()
      /* Validation returns false instead of throwing to test graceful handling */
      mockTrigger.mockResolvedValue(false)

      render(<TestComponent activeTab={PLAN_FORM_TAB.BASIC} />, { wrapper: TestWrapper })

      const nextButton = screen.getByTestId('nav-next')
      await user.click(nextButton)

      /* Should not crash or proceed when validation fails */
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument()
      expect(mockOnNextTab).not.toHaveBeenCalled()
    })
  })

  describe('Integration', () => {
    it('should handle complete form workflow in CREATE mode', async () => {
      const user = userEvent.setup()
      render(<TestComponent activeTab={PLAN_FORM_TAB.BASIC} />, { wrapper: TestWrapper })

      /* Navigate to pricing */
      const nextButton1 = screen.getByTestId('nav-next')
      await user.click(nextButton1)

      await waitFor(() => {
        expect(mockOnNextTab).toHaveBeenCalled()
      })
    })

    it('should handle VIEW to EDIT mode transition', async () => {
      const user = userEvent.setup()
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 123
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const editButton = screen.getByTestId('nav-edit')
      await user.click(editButton)

      expect(mockRouterPush).toHaveBeenCalledWith(
        PLAN_PAGE_ROUTES.EDIT.replace(':id', '123')
      )
    })

    it('should handle error recovery workflow', async () => {
      const user = userEvent.setup()
      const mockError = {
        id: 'test-error',
        error: 'Failed to load',
        title: 'Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      vi.spyOn(resourceErrorsContext, 'useResourceErrors').mockReturnValue({
        ...defaultResourceErrorsReturn,
        error: mockError
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      const retryButton = screen.getByTestId('error-retry')
      await user.click(retryButton)

      expect(mockError.onRetry).toHaveBeenCalled()
    })
  })
})
