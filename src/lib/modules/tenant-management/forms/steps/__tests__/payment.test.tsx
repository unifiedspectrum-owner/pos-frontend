/* Comprehensive test suite for PaymentStep component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import PaymentStep from '@tenant-management/forms/steps/payment'
import * as subscriptionService from '@tenant-management/api/services/subscriptions'

/* Mock Stripe */
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({}))
}))

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div data-testid="stripe-elements">{children}</div>
}))

/* Mock dependencies */
vi.mock('@tenant-management/forms/steps/components', () => ({
  CheckoutForm: ({ planData, amount, onPaymentSuccess, onPaymentFailed, isRetryAttempt }: {
    planData: unknown
    amount: number
    onPaymentSuccess: () => void
    onPaymentFailed: (message: string, code: string) => void
    isRetryAttempt: boolean
  }) => (
    <div data-testid="checkout-form">
      <div>Amount: ${amount}</div>
      <div>Retry: {isRetryAttempt ? 'Yes' : 'No'}</div>
      <button onClick={onPaymentSuccess} data-testid="success-payment">Success</button>
      <button onClick={() => onPaymentFailed('Card declined', 'card_declined')} data-testid="fail-payment">Fail</button>
    </div>
  )
}))

describe('PaymentStep', () => {
  const mockIsCompleted = vi.fn()
  const mockOnPrevious = vi.fn()
  const mockOnPaymentFailed = vi.fn()

  const mockAssignedPlanData = {
    plan: {
      id: 1,
      name: 'Pro Plan',
      description: 'Professional plan for growing businesses',
      display_order: 2,
      is_active: true,
      is_custom: false,
      is_featured: true,
      monthly_price: 100,
      included_branches_count: 3,
      annual_discount_percentage: 15,
      features: [],
      add_ons: []
    },
    billingCycle: 'monthly' as const,
    branchCount: 3,
    branches: [
      { branchIndex: 0, branchName: 'Main Branch', isSelected: true },
      { branchIndex: 1, branchName: 'Branch 2', isSelected: false },
      { branchIndex: 2, branchName: 'Branch 3', isSelected: false }
    ],
    add_ons: [
      {
        addon_id: 1,
        addon_name: 'Advanced Analytics',
        addon_price: 20,
        pricing_scope: 'organization' as const,
        is_included: false,
        branches: []
      },
      {
        addon_id: 2,
        addon_name: 'Multi-Currency',
        addon_price: 15,
        pricing_scope: 'branch' as const,
        is_included: false,
        branches: [
          { branchIndex: 0, branchName: 'Main Branch', isSelected: true },
          { branchIndex: 1, branchName: 'Branch 2', isSelected: true }
        ]
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('tenant_id', 'test-tenant-123')

    /* Mock service functions */
    vi.spyOn(subscriptionService.subscriptionService, 'getAssignedPlanForTenant').mockResolvedValue({
      success: true,
      data: mockAssignedPlanData,
      message: 'Assigned plan retrieved successfully',
      timestamp: new Date().toISOString()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      expect(screen.getByText('Loading payment details...')).toBeInTheDocument()
    })

    it('should fetch assigned plan data on mount', async () => {
      const spy = vi.spyOn(subscriptionService.subscriptionService, 'getAssignedPlanForTenant')
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith('test-tenant-123')
      })
    })
  })

  describe('Rendering', () => {
    it('should render payment summary after loading', async () => {
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Payment Summary')).toBeInTheDocument()
      })
    })

    it('should render Stripe checkout form', async () => {
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('stripe-elements')).toBeInTheDocument()
        expect(screen.getByTestId('checkout-form')).toBeInTheDocument()
      })
    })

    it('should display plan details', async () => {
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument()
      })
    })

    it('should display subscription plan section', async () => {
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Subscription Plan')).toBeInTheDocument()
      })
    })
  })

  describe('Payment Amount Calculation', () => {
    it('should calculate monthly total correctly', async () => {
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('checkout-form')).toBeInTheDocument()
      })

      /* Plan: 100 * 3 branches = 300 */
      /* Org Addon: 20 */
      /* Branch Addon: 15 * 2 selected branches = 30 */
      /* Total: 300 + 20 + 30 = 350 */
      expect(screen.getByText('Amount: $350')).toBeInTheDocument()
    })

    it('should calculate yearly total with discount', async () => {
      const yearlyPlanData = {
        ...mockAssignedPlanData,
        billingCycle: 'yearly' as const
      }

      vi.spyOn(subscriptionService.subscriptionService, 'getAssignedPlanForTenant').mockResolvedValue({
        success: true,
        data: yearlyPlanData,
        message: 'Assigned plan retrieved successfully',
        timestamp: new Date().toISOString()
      })

      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('checkout-form')).toBeInTheDocument()
      })

      /* Should apply 15% discount for yearly billing */
      /* (300 + 20 + 30) * 12 * 0.85 = 3570 */
      expect(screen.getByText('Amount: $3570')).toBeInTheDocument()
    })
  })

  describe('Addons Display', () => {
    it('should display organization addons', async () => {
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
      })
    })

    it('should display branch addons', async () => {
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Multi-Currency')).toBeInTheDocument()
      })
    })

    it('should show selected addons section when addons exist', async () => {
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Selected Add-ons')).toBeInTheDocument()
      })
    })
  })

  describe('Payment Success', () => {
    it('should handle successful payment', async () => {
      const user = userEvent.setup()
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('success-payment')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('success-payment'))

      /* Should clear failed payment intent from localStorage */
      expect(localStorage.getItem('failed_payment_intent')).toBeNull()
    })
  })

  describe('Payment Failure', () => {
    it('should handle payment failure', async () => {
      const user = userEvent.setup()
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} onPaymentFailed={mockOnPaymentFailed} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('fail-payment')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('fail-payment'))

      expect(mockOnPaymentFailed).toHaveBeenCalledWith('Card declined', 'card_declined')
    })

    it('should call onPaymentFailed with error details', async () => {
      const user = userEvent.setup()
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} onPaymentFailed={mockOnPaymentFailed} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByTestId('fail-payment')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('fail-payment'))

      expect(mockOnPaymentFailed).toHaveBeenCalledWith('Card declined', 'card_declined')
    })
  })

  describe('Retry Payment', () => {
    it('should show retry banner when retry attempt exists', async () => {
      localStorage.setItem('failed_payment_intent', 'pi_test_123')

      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Retry Payment')).toBeInTheDocument()
      })
    })

    it('should pass retry flag to checkout form', async () => {
      localStorage.setItem('failed_payment_intent', 'pi_test_123')

      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Retry: Yes')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should call onPrevious when back button clicked', async () => {
      const user = userEvent.setup()
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      /* Wait for loading to complete */
      await waitFor(() => {
        expect(screen.queryByText('Loading payment details...')).not.toBeInTheDocument()
      }, { timeout: 3000 })

      /* Now the button should be visible */
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      }, { timeout: 1000 })

      await user.click(screen.getByText('Cancel'))

      expect(mockOnPrevious).toHaveBeenCalledTimes(1)
    })
  })

  describe('Billing Cycle Display', () => {
    it('should display annual billing benefits for yearly cycle', async () => {
      const yearlyPlanData = {
        ...mockAssignedPlanData,
        billingCycle: 'yearly' as const
      }

      vi.spyOn(subscriptionService.subscriptionService, 'getAssignedPlanForTenant').mockResolvedValue({
        success: true,
        data: yearlyPlanData,
        message: 'Assigned plan retrieved successfully',
        timestamp: new Date().toISOString()
      })

      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText('Annual Billing Benefits')).toBeInTheDocument()
      })
    })

    it('should show discount percentage for annual billing', async () => {
      const yearlyPlanData = {
        ...mockAssignedPlanData,
        billingCycle: 'yearly' as const
      }

      vi.spyOn(subscriptionService.subscriptionService, 'getAssignedPlanForTenant').mockResolvedValue({
        success: true,
        data: yearlyPlanData,
        message: 'Assigned plan retrieved successfully',
        timestamp: new Date().toISOString()
      })

      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(screen.getByText(/15% annual discount applied/)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const spy = vi.spyOn(subscriptionService.subscriptionService, 'getAssignedPlanForTenant').mockRejectedValue(new Error('API Error'))

      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(spy).toHaveBeenCalled()
      })
    })

    it('should handle missing tenant ID', async () => {
      localStorage.removeItem('tenant_id')
      const spy = vi.spyOn(subscriptionService.subscriptionService, 'getAssignedPlanForTenant')

      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      await waitFor(() => {
        expect(spy).not.toHaveBeenCalled()
      })
    })
  })

  describe('Integration', () => {
    it('should handle complete payment workflow', async () => {
      const user = userEvent.setup()
      render(<PaymentStep isCompleted={mockIsCompleted} onPrevious={mockOnPrevious} />, { wrapper: TestWrapper })

      /* Wait for data to load */
      await waitFor(() => {
        expect(screen.getByTestId('checkout-form')).toBeInTheDocument()
      })

      /* Verify payment details are displayed */
      expect(screen.getByText('Payment Summary')).toBeInTheDocument()
      expect(screen.getByText('Pro Plan')).toBeInTheDocument()

      /* Complete payment successfully */
      await user.click(screen.getByTestId('success-payment'))

      /* Verify cleanup */
      expect(localStorage.getItem('failed_payment_intent')).toBeNull()
    })
  })
})
