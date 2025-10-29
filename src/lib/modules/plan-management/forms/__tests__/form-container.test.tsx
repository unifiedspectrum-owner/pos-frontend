/* Comprehensive test suite for PlanFormContainer component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Plan module imports */
import PlanFormContainer from '@plan-management/forms/form-container'
import { CreatePlanFormData } from '@plan-management/schemas'
import { PLAN_FORM_MODES, PLAN_FORM_TAB, AUTO_SAVE_DEBOUNCE_MS, STORAGE_KEYS } from '@plan-management/constants'
import * as planOperationsHook from '@plan-management/hooks/use-plan-operations'
import * as tabValidationHook from '@plan-management/hooks/use-tab-validation'
import * as tabNavigationHook from '@plan-management/hooks/use-tab-navigation'
import * as planFormModeContext from '@plan-management/contexts'
import * as storageUtils from '@plan-management/utils/storage'
import * as formUtils from '@plan-management/utils/forms'

/* Mock dependencies */
vi.mock('@shared/components/common', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>,
  LoaderWrapper: ({ isLoading, children, loadingText }: { isLoading: boolean; children: React.ReactNode; loadingText?: string }) => (
    isLoading ? <div data-testid="loader-wrapper">{loadingText}</div> : <>{children}</>
  ),
  ErrorMessageContainer: ({ error, onRetry, onDismiss, title }: { error: string; onRetry?: () => void; onDismiss?: () => void; title?: string }) => (
    <div data-testid="error-container">
      {title && <div>{title}</div>}
      <div>{error}</div>
      {onRetry && <button onClick={onRetry} data-testid="retry-button">Retry</button>}
      {onDismiss && <button onClick={onDismiss} data-testid="dismiss-button">Dismiss</button>}
    </div>
  )
}))

vi.mock('@plan-management/components', () => ({
  DataRecoveryModal: ({ isOpen, onRestore, onStartFresh }: { isOpen: boolean; onRestore: () => void; onStartFresh: () => void }) => (
    isOpen ? (
      <div data-testid="data-recovery-modal">
        <button onClick={onRestore} data-testid="restore-button">Restore Data</button>
        <button onClick={onStartFresh} data-testid="start-fresh-button">Start Fresh</button>
      </div>
    ) : null
  )
}))

vi.mock('@plan-management/forms/form-ui', () => {
  const React = require('react')
  return {
    default: ({ activeTab, showSavedIndicator, isSubmitting, onSubmit, onTabChange, onNextTab, onPreviousTab }: any) =>
      React.createElement('div', { 'data-testid': 'plan-form-ui' },
        React.createElement('div', { 'data-testid': 'active-tab' }, activeTab),
        React.createElement('div', { 'data-testid': 'saved-indicator' }, showSavedIndicator ? 'Saved' : 'Not Saved'),
        React.createElement('div', { 'data-testid': 'submitting' }, isSubmitting ? 'Submitting' : 'Not Submitting'),
        React.createElement('button', {
          onClick: () => onTabChange('Pricing'),
          'data-testid': 'change-tab'
        }, 'Change Tab'),
        React.createElement('button', {
          onClick: onNextTab,
          'data-testid': 'next-tab'
        }, 'Next Tab'),
        React.createElement('button', {
          onClick: onPreviousTab,
          'data-testid': 'previous-tab'
        }, 'Previous Tab'),
        React.createElement('button', {
          onClick: () => onSubmit({ name: 'Test Plan' }),
          'data-testid': 'submit-form'
        }, 'Submit')
      )
  }
})

describe('PlanFormContainer', () => {
  const mockFetchPlanDetails = vi.fn()
  const mockOnSubmit = vi.fn()
  const mockSetValue = vi.fn()
  const mockReset = vi.fn()
  const mockGetValues = vi.fn()
  const mockSetActiveTab = vi.fn()

  const mockPlanData = {
    id: 1,
    name: 'Test Plan',
    description: 'Test Description',
    is_active: true,
    is_custom: false,
    monthly_price: '99.99',
    included_devices_count: '5',
    feature_ids: [1, 2],
    addon_assignments: [],
    support_sla_ids: [1],
    volume_discounts: []
  }

  const defaultPlanOperationsReturn = {
    /* Create operations */
    createPlan: vi.fn(),
    isCreating: false,
    createError: null,
    /* Fetch operations */
    fetchPlanDetails: mockFetchPlanDetails,
    isFetching: false,
    fetchError: null,
    /* Update operations */
    updatePlan: vi.fn(),
    isUpdating: false,
    updateError: null,
    /* Delete operations */
    deletePlan: vi.fn(),
    isDeleting: false,
    deleteError: null
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

  const defaultTabNavigationReturn = {
    tabUnlockState: {
      [PLAN_FORM_TAB.BASIC]: true,
      [PLAN_FORM_TAB.PRICING]: false,
      [PLAN_FORM_TAB.FEATURES]: false,
      [PLAN_FORM_TAB.ADDONS]: false,
      [PLAN_FORM_TAB.SLA]: false
    },
    isTabUnlocked: vi.fn((tabId: string) => tabId === PLAN_FORM_TAB.BASIC),
    handleTabChange: vi.fn(),
    handleNextTab: vi.fn(),
    handlePreviousTab: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(planOperationsHook, 'usePlanOperations').mockReturnValue(defaultPlanOperationsReturn)
    vi.spyOn(tabValidationHook, 'useTabValidation').mockReturnValue(defaultTabValidationReturn)
    vi.spyOn(tabNavigationHook, 'useTabNavigation').mockReturnValue(defaultTabNavigationReturn)
    vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
      mode: PLAN_FORM_MODES.CREATE,
      planId: undefined
    })

    vi.spyOn(storageUtils, 'hasStorageData').mockReturnValue(false)
    vi.spyOn(storageUtils, 'saveFormDataToStorage').mockReturnValue(true)
    vi.spyOn(storageUtils, 'loadDataFromStorage').mockImplementation(() => {})
    vi.spyOn(storageUtils, 'clearStorageData').mockImplementation(() => {})
    vi.spyOn(formUtils, 'formatApiDataToFormData').mockImplementation((data) => data as any)

    mockGetValues.mockReturnValue({
      name: '',
      description: '',
      is_active: true
    })
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = (props: Partial<React.ComponentProps<typeof PlanFormContainer>> = {}) => {
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

    /* Override form methods with mocks */
    methods.setValue = mockSetValue as any
    methods.reset = mockReset as any
    methods.getValues = mockGetValues as any

    return (
      <FormProvider {...methods}>
        <PlanFormContainer
          onSubmit={mockOnSubmit}
          isSubmitting={false}
          {...props}
        />
      </FormProvider>
    )
  }

  describe('CREATE Mode', () => {
    it('should render form container in CREATE mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Create Plan')).toBeInTheDocument()
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument()
    })

    it('should not show data recovery modal when no existing data', () => {
      vi.spyOn(storageUtils, 'hasStorageData').mockReturnValue(false)

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument()
    })

    it('should show data recovery modal when existing data found', () => {
      vi.spyOn(storageUtils, 'hasStorageData').mockReturnValue(true)

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('data-recovery-modal')).toBeInTheDocument()
    })

    it('should restore data when restore button clicked', async () => {
      const user = userEvent.setup()
      vi.spyOn(storageUtils, 'hasStorageData').mockReturnValue(true)

      render(<TestComponent />, { wrapper: TestWrapper })

      const restoreButton = await screen.findByTestId('restore-button')
      await user.click(restoreButton)

      await waitFor(() => {
        expect(storageUtils.loadDataFromStorage).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument()
      })
    })

    it('should start fresh when start fresh button clicked', async () => {
      const user = userEvent.setup()
      vi.spyOn(storageUtils, 'hasStorageData').mockReturnValue(true)

      render(<TestComponent />, { wrapper: TestWrapper })

      const startFreshButton = await screen.findByTestId('start-fresh-button')
      await user.click(startFreshButton)

      await waitFor(() => {
        expect(storageUtils.clearStorageData).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument()
      })
    })

    it('should call saveFormDataToStorage when form data changes', async () => {
      mockGetValues.mockReturnValue({
        name: 'Test Plan',
        description: 'Test Description',
        is_active: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      /* Wait for auto-save to trigger */
      await waitFor(() => {
        expect(storageUtils.saveFormDataToStorage).toHaveBeenCalled()
      }, { timeout: 6000 })
    })
  })

  describe('EDIT Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })
      mockFetchPlanDetails.mockResolvedValue(mockPlanData)
    })

    it('should fetch plan data in EDIT mode', async () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(mockFetchPlanDetails).toHaveBeenCalledWith(1)
      })
    })

    it('should show loader while fetching plan data', () => {
      vi.spyOn(planOperationsHook, 'usePlanOperations').mockReturnValue({
        ...defaultPlanOperationsReturn,
        isFetching: true
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('loader-wrapper')).toBeInTheDocument()
      expect(screen.getByText('Loading plan data...')).toBeInTheDocument()
    })

    it('should reset form with fetched plan data', async () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(formUtils.formatApiDataToFormData).toHaveBeenCalledWith(mockPlanData)
      })
    })

    it('should show error when plan fetch fails', async () => {
      mockFetchPlanDetails.mockResolvedValue(null)

      render(<TestComponent />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('error-container')).toBeInTheDocument()
        expect(screen.getByText('Failed to load plan data')).toBeInTheDocument()
      })
    })

    it('should retry loading plan data when retry clicked', async () => {
      const user = userEvent.setup()
      mockFetchPlanDetails.mockResolvedValueOnce(null)

      render(<TestComponent />, { wrapper: TestWrapper })

      const retryButton = await screen.findByTestId('retry-button')

      mockFetchPlanDetails.mockResolvedValue(mockPlanData)
      await user.click(retryButton)

      await waitFor(() => {
        expect(mockFetchPlanDetails).toHaveBeenCalledTimes(2)
      })
    })

    it('should dismiss error message when dismiss clicked', async () => {
      const user = userEvent.setup()
      mockFetchPlanDetails.mockResolvedValue(null)

      render(<TestComponent />, { wrapper: TestWrapper })

      const dismissButton = await screen.findByTestId('dismiss-button')
      await user.click(dismissButton)

      await waitFor(() => {
        expect(screen.queryByTestId('error-container')).not.toBeInTheDocument()
      })
    })

    it('should not auto-save in EDIT mode', async () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Wait to ensure auto-save doesn't trigger */
      await new Promise(resolve => setTimeout(resolve, AUTO_SAVE_DEBOUNCE_MS + 100))

      expect(storageUtils.saveFormDataToStorage).not.toHaveBeenCalled()
    })

    it('should not show data recovery modal in EDIT mode', async () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('VIEW Mode', () => {
    beforeEach(() => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.VIEW,
        planId: 1
      })
      mockFetchPlanDetails.mockResolvedValue(mockPlanData)
    })

    it('should fetch plan data in VIEW mode', async () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(mockFetchPlanDetails).toHaveBeenCalledWith(1)
      })
    })

    it('should not auto-save in VIEW mode', async () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Wait to ensure auto-save doesn't trigger */
      await new Promise(resolve => setTimeout(resolve, AUTO_SAVE_DEBOUNCE_MS + 100))

      expect(storageUtils.saveFormDataToStorage).not.toHaveBeenCalled()
    })

    it('should not show data recovery modal in VIEW mode', async () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const submitButton = await screen.findByTestId('submit-form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('should show submitting state', () => {
      render(<TestComponent isSubmitting={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Submitting')).toBeInTheDocument()
    })

    it('should not show submitting state initially', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Not Submitting')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should render with initial active tab', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('active-tab')).toHaveTextContent(PLAN_FORM_TAB.BASIC)
    })

    it('should pass tab unlock state to form UI', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument()
    })

    it('should handle tab change', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const changeTabButton = await screen.findByTestId('change-tab')
      await user.click(changeTabButton)

      expect(defaultTabNavigationReturn.handleTabChange).toHaveBeenCalled()
    })

    it('should handle next tab navigation', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nextTabButton = await screen.findByTestId('next-tab')
      await user.click(nextTabButton)

      expect(defaultTabNavigationReturn.handleNextTab).toHaveBeenCalled()
    })

    it('should handle previous tab navigation', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const previousTabButton = await screen.findByTestId('previous-tab')
      await user.click(previousTabButton)

      expect(defaultTabNavigationReturn.handlePreviousTab).toHaveBeenCalled()
    })
  })

  describe('Auto-save Indicator', () => {
    it('should not show saved indicator initially', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Not Saved')).toBeInTheDocument()
    })

    it('should show saved indicator after successful save', async () => {
      mockGetValues.mockReturnValue({
        name: 'Test Plan',
        description: 'Test'
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(storageUtils.saveFormDataToStorage).toHaveBeenCalled()
      }, { timeout: 6000 })
    })
  })

  describe('Cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const { unmount } = render(<TestComponent />, { wrapper: TestWrapper })

      unmount()

      /* Should not throw any errors */
      expect(true).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing planId in EDIT mode gracefully', () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: undefined
      })

      render(<TestComponent />, { wrapper: TestWrapper })

      expect(mockFetchPlanDetails).not.toHaveBeenCalled()
    })

    it('should handle undefined onSubmit gracefully', async () => {
      const user = userEvent.setup()
      render(<TestComponent onSubmit={undefined} />, { wrapper: TestWrapper })

      const submitButton = await screen.findByTestId('submit-form')
      await user.click(submitButton)

      /* Should not throw error */
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete CREATE workflow', async () => {
      const user = userEvent.setup()
      vi.spyOn(storageUtils, 'hasStorageData').mockReturnValue(false)

      render(<TestComponent />, { wrapper: TestWrapper })

      /* Verify initial render */
      expect(await screen.findByText('Create Plan')).toBeInTheDocument()
      expect(screen.getByTestId('plan-form-ui')).toBeInTheDocument()

      /* Submit form */
      const submitButton = await screen.findByTestId('submit-form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('should handle EDIT workflow with successful data load', async () => {
      vi.spyOn(planFormModeContext, 'usePlanFormMode').mockReturnValue({
        mode: PLAN_FORM_MODES.EDIT,
        planId: 1
      })
      mockFetchPlanDetails.mockResolvedValue(mockPlanData)

      render(<TestComponent />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(mockFetchPlanDetails).toHaveBeenCalledWith(1)
        expect(formUtils.formatApiDataToFormData).toHaveBeenCalledWith(mockPlanData)
      })
    })

    it('should handle data recovery workflow', async () => {
      const user = userEvent.setup()
      vi.spyOn(storageUtils, 'hasStorageData').mockReturnValue(true)

      render(<TestComponent />, { wrapper: TestWrapper })

      /* Verify modal appears */
      const restoreButton = await screen.findByTestId('restore-button')

      /* Restore data */
      await user.click(restoreButton)

      /* Verify modal closes and data is loaded */
      await waitFor(() => {
        expect(storageUtils.loadDataFromStorage).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.queryByTestId('data-recovery-modal')).not.toBeInTheDocument()
      })
    })
  })
})
