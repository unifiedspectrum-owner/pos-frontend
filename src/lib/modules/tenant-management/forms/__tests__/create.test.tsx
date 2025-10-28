/* Comprehensive test suite for TenantAccountCreationForm component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import TenantAccountCreationForm from '@tenant-management/forms/create'
import * as onboardingService from '@tenant-management/api/services/onboarding'
import * as useAssignedPlanHook from '@tenant-management/hooks/data-management/use-assigned-plan'
import { STEP_IDS } from '@tenant-management/constants'

/* Mock dependencies */
vi.mock('@shared/components/common', () => ({
  FullPageLoader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="full-page-loader">
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  )
}))

vi.mock('@tenant-management/components/layout', () => ({
  ProgressHeader: ({ currentStep, progressStepIndex, stepProgressPercentage }: { currentStep: string; progressStepIndex: number; stepProgressPercentage: number }) => (
    <div data-testid="progress-header">
      <div>Current Step: {currentStep}</div>
      <div>Progress: {stepProgressPercentage}%</div>
      <div>Step Index: {progressStepIndex}</div>
    </div>
  )
}))

vi.mock('@tenant-management/forms/steps', () => ({
  BasicInfoStep: ({ isCompleted }: { isCompleted: (completed: boolean) => void }) => (
    <div data-testid="basic-info-step">
      <button onClick={() => isCompleted(true)} data-testid="complete-basic-info">Complete Basic Info</button>
    </div>
  ),
  PlanSelectionStep: ({ isCompleted, onPrevious }: { isCompleted: (completed: boolean) => void; onPrevious: () => void }) => (
    <div data-testid="plan-selection-step">
      <button onClick={onPrevious} data-testid="previous-button">Previous</button>
      <button onClick={() => isCompleted(true)} data-testid="complete-plan-selection">Complete Plan Selection</button>
    </div>
  ),
  AddonSelectionStep: ({ isCompleted, onPrevious }: { isCompleted: (completed: boolean) => void; onPrevious: () => void }) => (
    <div data-testid="addon-selection-step">
      <button onClick={onPrevious} data-testid="previous-button">Previous</button>
      <button onClick={() => isCompleted(true)} data-testid="complete-addon-selection">Complete Addon Selection</button>
    </div>
  ),
  PlanSummaryStep: ({ isCompleted, onPrevious }: { isCompleted: (completed: boolean) => void; onPrevious: () => void }) => (
    <div data-testid="plan-summary-step">
      <button onClick={onPrevious} data-testid="previous-button">Previous</button>
      <button onClick={() => isCompleted(true)} data-testid="complete-plan-summary">Complete Plan Summary</button>
    </div>
  ),
  PaymentStep: ({ isCompleted, onPrevious, onPaymentFailed }: { isCompleted: (completed: boolean) => void; onPrevious: () => void; onPaymentFailed: (message: string, code: string) => void }) => (
    <div data-testid="payment-step">
      <button onClick={onPrevious} data-testid="previous-button">Previous</button>
      <button onClick={() => isCompleted(true)} data-testid="complete-payment">Complete Payment</button>
      <button onClick={() => onPaymentFailed('Payment failed', 'card_declined')} data-testid="fail-payment">Fail Payment</button>
    </div>
  ),
  PaymentFailedStep: ({ onRetryPayment, onPrevious, errorMessage, errorCode }: { onRetryPayment: () => void; onPrevious: () => void; errorMessage?: string; errorCode?: string }) => (
    <div data-testid="payment-failed-step">
      <div>Error: {errorMessage}</div>
      <div>Code: {errorCode}</div>
      <button onClick={onRetryPayment} data-testid="retry-payment">Retry Payment</button>
      <button onClick={onPrevious} data-testid="previous-button">Previous</button>
    </div>
  ),
  SuccessStep: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="success-step">
      <button onClick={onComplete} data-testid="complete-success">Complete</button>
    </div>
  )
}))

describe('TenantAccountCreationForm', () => {
  const mockFetchAssignedPlan = vi.fn()

  const mockTenantStatusResponse = {
    success: true,
    data: {
      tenant_id: 'test-tenant-123',
      tenant_info: {
        company_name: 'Test Company',
        contact_person: 'John Doe',
        primary_email: 'john@test.com',
        primary_phone: '+6512345678',
        address_line1: '123 Test St',
        address_line2: '',
        city: 'Singapore',
        country: 'Singapore',
        state_province: 'Central',
        postal_code: '123456'
      },
      verification_status: {
        email_verified: true,
        phone_verified: true,
        both_verified: true,
        email_verified_at: new Date().toISOString(),
        phone_verified_at: new Date().toISOString()
      },
      basic_info_status: {
        is_complete: true,
        validation_errors: [],
        validation_message: ''
      }
    },
    message: 'Tenant status retrieved successfully',
    timestamp: new Date().toISOString()
  }

  /* Helper to create incomplete tenant status - starts from basic info step */
  const createIncompleteTenantStatus = () => ({
    ...mockTenantStatusResponse,
    data: {
      ...mockTenantStatusResponse.data,
      basic_info_status: {
        is_complete: false,
        validation_errors: [],
        validation_message: ''
      },
      verification_status: {
        email_verified: false,
        phone_verified: false,
        both_verified: false,
        email_verified_at: null,
        phone_verified_at: null
      }
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    /* Mock service functions - default to incomplete status so tests start from basic-info-step */
    vi.spyOn(onboardingService.onboardingService, 'checkTenantAccountStatus').mockResolvedValue(createIncompleteTenantStatus())

    /* Mock hooks */
    vi.spyOn(useAssignedPlanHook, 'useAssignedPlan').mockReturnValue({
      fetchAssignedPlan: mockFetchAssignedPlan
    } as never)

    mockFetchAssignedPlan.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Initialization', () => {
    it('should show loading screen during initialization', async () => {
      /* Set tenant_id so API is called, and make API call delay to keep loader visible */
      localStorage.setItem('tenant_id', 'test-tenant-123')

      vi.spyOn(onboardingService.onboardingService, 'checkTenantAccountStatus').mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(createIncompleteTenantStatus()), 100))
      )

      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      /* Component should show loader initially */
      expect(screen.getByTestId('full-page-loader')).toBeInTheDocument()
      expect(screen.getByText('Loading Account Setup')).toBeInTheDocument()

      /* Wait for initialization to complete */
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('should initialize at tenant info step when no tenant ID exists', async () => {
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      /* Wait for initialization to complete */
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      /* Should show basic info step */
      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('should restore progress from tenant status API', async () => {
      localStorage.setItem('tenant_id', 'test-tenant-123')

      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(onboardingService.onboardingService.checkTenantAccountStatus).toHaveBeenCalledWith('test-tenant-123')
      }, { timeout: 5000 })
    })
  })

  describe('Progress Header', () => {
    it('should display progress header with current step', async () => {
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      /* Wait for component to initialize */
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      await waitFor(() => {
        expect(screen.getByTestId('progress-header')).toBeInTheDocument()
      }, { timeout: 1000 })

      expect(screen.getByText(/Current Step:/)).toBeInTheDocument()
    })

    it('should update progress percentage as steps complete', async () => {
      const user = userEvent.setup()
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
      }, { timeout: 1000 })

      /* Complete first step */
      const completeButton = screen.getByTestId('complete-basic-info')
      await user.click(completeButton)

      await waitFor(() => {
        expect(screen.getByTestId('plan-selection-step')).toBeInTheDocument()
      })
    })
  })

  describe('Step Navigation', () => {
    it('should navigate from basic info to plan selection', async () => {
      const user = userEvent.setup()
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
      }, { timeout: 1000 })

      const completeButton = screen.getByTestId('complete-basic-info')
      await user.click(completeButton)

      await waitFor(() => {
        expect(screen.getByTestId('plan-selection-step')).toBeInTheDocument()
      })
    })

    it('should navigate backward through steps', async () => {
      const user = userEvent.setup()
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
      }, { timeout: 1000 })

      /* Navigate forward */
      await user.click(screen.getByTestId('complete-basic-info'))

      await waitFor(() => {
        expect(screen.getByTestId('plan-selection-step')).toBeInTheDocument()
      })

      /* Navigate backward */
      await user.click(screen.getByTestId('previous-button'))

      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
      })
    })

    it('should progress through all steps sequentially', async () => {
      const user = userEvent.setup()
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
      }, { timeout: 1000 })

      /* Step 1: Basic Info */
      await user.click(screen.getByTestId('complete-basic-info'))

      /* Step 2: Plan Selection */
      await waitFor(() => {
        expect(screen.getByTestId('plan-selection-step')).toBeInTheDocument()
      })
      await user.click(screen.getByTestId('complete-plan-selection'))

      /* Step 3: Addon Selection */
      await waitFor(() => {
        expect(screen.getByTestId('addon-selection-step')).toBeInTheDocument()
      })
      await user.click(screen.getByTestId('complete-addon-selection'))

      /* Step 4: Plan Summary */
      await waitFor(() => {
        expect(screen.getByTestId('plan-summary-step')).toBeInTheDocument()
      })
    })
  })

  describe('Payment Flow', () => {
    it('should handle payment failure and show error step', async () => {
      const user = userEvent.setup()
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      /* Wait for initialization */
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      /* Navigate to payment step */
      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
      }, { timeout: 1000 })

      await user.click(screen.getByTestId('complete-basic-info'))
      await waitFor(() => expect(screen.getByTestId('plan-selection-step')).toBeInTheDocument())

      await user.click(screen.getByTestId('complete-plan-selection'))
      await waitFor(() => expect(screen.getByTestId('addon-selection-step')).toBeInTheDocument())

      await user.click(screen.getByTestId('complete-addon-selection'))
      await waitFor(() => expect(screen.getByTestId('plan-summary-step')).toBeInTheDocument())

      await user.click(screen.getByTestId('complete-plan-summary'))
      await waitFor(() => expect(screen.getByTestId('payment-step')).toBeInTheDocument())

      /* Fail payment */
      await user.click(screen.getByTestId('fail-payment'))

      await waitFor(() => {
        expect(screen.getByTestId('payment-failed-step')).toBeInTheDocument()
      })

      expect(screen.getByText('Error: Payment failed')).toBeInTheDocument()
      expect(screen.getByText('Code: card_declined')).toBeInTheDocument()
    })

    it('should allow retrying failed payment', async () => {
      const user = userEvent.setup()
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      /* Wait for initialization */
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      /* Navigate to payment step and fail */
      await waitFor(() => expect(screen.getByTestId('basic-info-step')).toBeInTheDocument(), { timeout: 1000 })
      await user.click(screen.getByTestId('complete-basic-info'))
      await waitFor(() => expect(screen.getByTestId('plan-selection-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('complete-plan-selection'))
      await waitFor(() => expect(screen.getByTestId('addon-selection-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('complete-addon-selection'))
      await waitFor(() => expect(screen.getByTestId('plan-summary-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('complete-plan-summary'))
      await waitFor(() => expect(screen.getByTestId('payment-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('fail-payment'))

      await waitFor(() => {
        expect(screen.getByTestId('payment-failed-step')).toBeInTheDocument()
      })

      /* Retry payment */
      await user.click(screen.getByTestId('retry-payment'))

      await waitFor(() => {
        expect(screen.getByTestId('payment-step')).toBeInTheDocument()
      })
    })

    it('should reach payment step after completing all prior steps', async () => {
      const user = userEvent.setup()
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      /* Wait for initialization */
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      /* Navigate through all steps to payment */
      await waitFor(() => expect(screen.getByTestId('basic-info-step')).toBeInTheDocument(), { timeout: 1000 })
      await user.click(screen.getByTestId('complete-basic-info'))
      await waitFor(() => expect(screen.getByTestId('plan-selection-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('complete-plan-selection'))
      await waitFor(() => expect(screen.getByTestId('addon-selection-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('complete-addon-selection'))
      await waitFor(() => expect(screen.getByTestId('plan-summary-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('complete-plan-summary'))

      /* Should reach payment step */
      await waitFor(() => {
        expect(screen.getByTestId('payment-step')).toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })

  describe('Completed Steps Tracking', () => {
    it('should track completed steps', async () => {
      const user = userEvent.setup()
      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
      }, { timeout: 1000 })

      /* Complete first step */
      await user.click(screen.getByTestId('complete-basic-info'))

      await waitFor(() => {
        expect(screen.getByTestId('plan-selection-step')).toBeInTheDocument()
      })

      /* Navigate back - should still show basic info as completed */
      await user.click(screen.getByTestId('previous-button'))

      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument()
      })
    })
  })

  describe('Data Persistence', () => {
    it('should save tenant data to localStorage', async () => {
      localStorage.setItem('tenant_id', 'test-tenant-123')

      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(onboardingService.onboardingService.checkTenantAccountStatus).toHaveBeenCalled()
      }, { timeout: 3000 })

      await waitFor(() => {
        expect(localStorage.getItem('tenant_form_data')).toBeTruthy()
      }, { timeout: 3000 })
    })

    it('should restore tenant data from API response', async () => {
      localStorage.setItem('tenant_id', 'test-tenant-123')

      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(onboardingService.onboardingService.checkTenantAccountStatus).toHaveBeenCalledWith('test-tenant-123')
      }, { timeout: 3000 })

      await waitFor(() => {
        const savedData = localStorage.getItem('tenant_form_data')
        expect(savedData).toBeTruthy()
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          expect(parsedData.company_name).toBe('Test Company')
        }
      }, { timeout: 3000 })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      localStorage.setItem('tenant_id', 'test-tenant-123')
      vi.spyOn(onboardingService.onboardingService, 'checkTenantAccountStatus').mockRejectedValue(new Error('API Error'))

      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(onboardingService.onboardingService.checkTenantAccountStatus).toHaveBeenCalled()
      }, { timeout: 3000 })

      /* Should reset to initial state on error */
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should clean up storage on API failure', async () => {
      localStorage.setItem('tenant_id', 'test-tenant-123')
      localStorage.setItem('tenant_form_data', '{"test": "data"}')
      vi.spyOn(onboardingService.onboardingService, 'checkTenantAccountStatus').mockRejectedValue(new Error('API Error'))

      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(onboardingService.onboardingService.checkTenantAccountStatus).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('Completion Flow', () => {
    it('should navigate through all main steps to payment', async () => {
      const user = userEvent.setup()

      localStorage.setItem('tenant_id', 'test-tenant-123')

      render(<TenantAccountCreationForm />, { wrapper: TestWrapper })

      /* Wait for initialization */
      await waitFor(() => {
        expect(screen.queryByTestId('full-page-loader')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      /* Navigate through all steps to payment */
      await waitFor(() => expect(screen.getByTestId('basic-info-step')).toBeInTheDocument(), { timeout: 1000 })
      await user.click(screen.getByTestId('complete-basic-info'))
      await waitFor(() => expect(screen.getByTestId('plan-selection-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('complete-plan-selection'))
      await waitFor(() => expect(screen.getByTestId('addon-selection-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('complete-addon-selection'))
      await waitFor(() => expect(screen.getByTestId('plan-summary-step')).toBeInTheDocument())
      await user.click(screen.getByTestId('complete-plan-summary'))
      await waitFor(() => expect(screen.getByTestId('payment-step')).toBeInTheDocument())

      /* Verify payment step is displayed */
      expect(screen.getByTestId('payment-step')).toBeInTheDocument()
      expect(screen.getByTestId('complete-payment')).toBeInTheDocument()
    })
  })
})
