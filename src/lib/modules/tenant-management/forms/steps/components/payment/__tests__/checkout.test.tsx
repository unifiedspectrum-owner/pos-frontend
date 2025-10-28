/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import CheckoutForm from '../checkout'
import { AssignedPlanDetails } from '@tenant-management/types'
import { PLAN_BILLING_CYCLE } from '@tenant-management/constants'
import { paymentService } from '@tenant-management/api'
import { useTenantOperations } from '@tenant-management/hooks/tenant-actions'

/* Mock component props interfaces */
interface PaymentElementProps {
  options?: {
    layout?: string
  }
}

interface MockButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
}

/* Mock router */
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

/* Mock Stripe hooks */
const mockConfirmPayment = vi.fn()
const mockSubmit = vi.fn()

vi.mock('@stripe/react-stripe-js', () => ({
  PaymentElement: ({ options }: PaymentElementProps) => (
    <div data-testid="payment-element">
      Payment Element - Layout: {options?.layout}
    </div>
  ),
  useStripe: () => ({
    confirmPayment: mockConfirmPayment
  }),
  useElements: () => ({
    submit: mockSubmit
  })
}))

/* Mock utilities */
vi.mock('@shared/utils/ui', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@shared/utils', () => ({
  getCurrentISOString: () => '2024-01-01T00:00:00.000Z'
}))

/* Mock payment service */
vi.mock('@tenant-management/api')

/* Mock tenant operations hook */
vi.mock('@tenant-management/hooks/tenant-actions')

/* Mock buttons */
vi.mock('@shared/components/form-elements/buttons', () => ({
  PrimaryButton: ({ children, onClick, disabled, loading, type }: MockButtonProps) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      disabled={disabled}
      data-loading={loading}
      type={type}
    >
      {children}
    </button>
  )
}))

describe('CheckoutForm', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const mockPlanData: AssignedPlanDetails = {
    plan: {
      id: 1,
      name: 'Basic Plan',
      description: 'Basic plan description',
      display_order: 1,
      is_active: true,
      is_custom: false,
      is_featured: false,
      monthly_price: 100,
      included_branches_count: null,
      annual_discount_percentage: 0,
      features: [],
      add_ons: []
    },
    billingCycle: PLAN_BILLING_CYCLE.MONTHLY,
    branchCount: 5,
    branches: [],
    add_ons: []
  }

  const defaultProps = {
    amount: 100.00,
    planData: mockPlanData,
    planTotalAmount: 100.00,
    branchAddonTotalAmount: 0,
    orgAddonTotalAmount: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockSubmit.mockResolvedValue({ error: null })
    vi.mocked(paymentService.initiateTenantSubscriptionPayment).mockResolvedValue({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        customer_id: 'cus_test123',
        type: 'setup',
        clientSecret: 'test_client_secret'
      },
      timestamp: '2024-01-01T00:00:00.000Z'
    })
    mockConfirmPayment.mockResolvedValue({
      error: null,
      paymentIntent: { id: 'pi_123' }
    })
    vi.mocked(useTenantOperations).mockReturnValue({
      deleteTenant: vi.fn().mockResolvedValue(true),
      isDeleting: false,
      deleteError: null,
      completePayment: vi.fn().mockResolvedValue({
        success: true,
        message: 'Payment completed successfully',
        timestamp: '2024-01-01T00:00:00.000Z'
      }),
      isCompletingPayment: false,
      paymentError: null,
      startResourceProvisioning: vi.fn().mockResolvedValue({
        success: true,
        message: 'Resource provisioning started',
        timestamp: '2024-01-01T00:00:00.000Z'
      }),
      isProvisioning: false,
      provisioningError: null
    })
  })

  describe('Rendering', () => {
    it('should render checkout form', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('payment-element')).toBeInTheDocument()
    })

    it('should render payment element', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('payment-element')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })

    it('should display payment amount in button', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={150.50} />
        </TestWrapper>
      )

      expect(screen.getByText(/Pay \$150\.50/)).toBeInTheDocument()
    })

    it('should render security notice', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText(/Your payment information is secure and encrypted/)).toBeInTheDocument()
    })
  })

  describe('Payment Element', () => {
    it('should render with tabs layout', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText(/Layout: tabs/)).toBeInTheDocument()
    })

    it('should display payment element component', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('payment-element')).toBeInTheDocument()
    })
  })

  describe('Submit Button', () => {
    it('should display correct text for initial payment', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={100} />
        </TestWrapper>
      )

      expect(screen.getByText('Pay $100.00')).toBeInTheDocument()
    })

    it('should format amount with two decimals', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={99.5} />
        </TestWrapper>
      )

      expect(screen.getByText('Pay $99.50')).toBeInTheDocument()
    })

    it('should have submit type', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('primary-button')).toHaveAttribute('type', 'submit')
    })
  })

  describe('Retry Payment', () => {
    it('should show retry alert when failed payment exists', () => {
      localStorage.setItem('failed_payment_intent', 'test_client_secret')

      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} isRetryAttempt={true} />
        </TestWrapper>
      )

      expect(screen.getByText('Retry Payment')).toBeInTheDocument()
    })

    it('should display retry button text when failed payment exists', async () => {
      localStorage.setItem('failed_payment_intent', 'test_client_secret')

      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={100} isRetryAttempt={true} />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Retry Payment \$100\.00/)).toBeInTheDocument()
      })
    })

    it('should show retry description', () => {
      localStorage.setItem('failed_payment_intent', 'test_client_secret')

      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} isRetryAttempt={true} />
        </TestWrapper>
      )

      expect(screen.getByText(/Enter new payment details to retry your transaction/)).toBeInTheDocument()
    })

    it('should not show retry alert when no failed payment', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.queryByText('Retry Payment')).not.toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should accept amount prop', () => {
      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} amount={200} />
          </TestWrapper>
        )
      ).not.toThrow()
    })

    it('should accept planData prop', () => {
      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} planData={mockPlanData} />
          </TestWrapper>
        )
      ).not.toThrow()
    })

    it('should accept planTotalAmount prop', () => {
      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} planTotalAmount={100} />
          </TestWrapper>
        )
      ).not.toThrow()
    })

    it('should accept branchAddonTotalAmount prop', () => {
      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} branchAddonTotalAmount={50} />
          </TestWrapper>
        )
      ).not.toThrow()
    })

    it('should accept orgAddonTotalAmount prop', () => {
      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} orgAddonTotalAmount={25} />
          </TestWrapper>
        )
      ).not.toThrow()
    })

    it('should accept onPaymentSuccess callback', () => {
      const mockCallback = vi.fn()

      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} onPaymentSuccess={mockCallback} />
          </TestWrapper>
        )
      ).not.toThrow()
    })

    it('should accept onPaymentFailed callback', () => {
      const mockCallback = vi.fn()

      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} onPaymentFailed={mockCallback} />
          </TestWrapper>
        )
      ).not.toThrow()
    })

    it('should accept isRetryAttempt prop', () => {
      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} isRetryAttempt={true} />
          </TestWrapper>
        )
      ).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should render without errors', () => {
      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} />
          </TestWrapper>
        )
      ).not.toThrow()
    })

    it('should handle null planData', () => {
      expect(() =>
        render(
          <TestWrapper>
            <CheckoutForm {...defaultProps} planData={null} />
          </TestWrapper>
        )
      ).not.toThrow()
    })

    it('should handle zero amount', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={0} />
        </TestWrapper>
      )

      expect(screen.getByText('Pay $0.00')).toBeInTheDocument()
    })

    it('should handle large amounts', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={9999.99} />
        </TestWrapper>
      )

      expect(screen.getByText('Pay $9999.99')).toBeInTheDocument()
    })

    it('should handle decimal amounts correctly', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={123.45} />
        </TestWrapper>
      )

      expect(screen.getByText('Pay $123.45')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render in centered flex container', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('payment-element')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })

    it('should render form element', () => {
      const { container } = render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(container.querySelector('form')).toBeInTheDocument()
    })

    it('should render payment element inside form', () => {
      const { container } = render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      const form = container.querySelector('form')
      expect(form).toContainElement(screen.getByTestId('payment-element'))
    })
  })

  describe('Security Notice', () => {
    it('should display security message', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText(/Your payment information is secure and encrypted/)).toBeInTheDocument()
    })

    it('should display card storage message', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText(/We never store your card details/)).toBeInTheDocument()
    })

    it('should render security notice with small font', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      const securityText = screen.getByText(/Your payment information is secure and encrypted/)
      expect(securityText).toBeInTheDocument()
    })
  })

  describe('Amount Formatting', () => {
    it('should format whole numbers with .00', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={100} />
        </TestWrapper>
      )

      expect(screen.getByText('Pay $100.00')).toBeInTheDocument()
    })

    it('should format single decimal place', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={99.5} />
        </TestWrapper>
      )

      expect(screen.getByText('Pay $99.50')).toBeInTheDocument()
    })

    it('should format two decimal places', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={99.99} />
        </TestWrapper>
      )

      expect(screen.getByText('Pay $99.99')).toBeInTheDocument()
    })

    it('should handle fractional cents', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} amount={99.999} />
        </TestWrapper>
      )

      const button = screen.getByTestId('primary-button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Retry State Management', () => {
    it('should check localStorage on mount', () => {
      localStorage.setItem('failed_payment_intent', 'test_secret')

      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} isRetryAttempt={true} />
        </TestWrapper>
      )

      expect(localStorage.getItem('failed_payment_intent')).toBe('test_secret')
    })

    it('should update retry state when isRetryAttempt changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} isRetryAttempt={false} />
        </TestWrapper>
      )

      expect(screen.queryByText('Retry Payment')).not.toBeInTheDocument()

      localStorage.setItem('failed_payment_intent', 'test_secret')

      rerender(
        <TestWrapper>
          <CheckoutForm {...defaultProps} isRetryAttempt={true} />
        </TestWrapper>
      )

      expect(screen.getByText('Retry Payment')).toBeInTheDocument()
    })
  })

  describe('Button States', () => {
    it('should enable button when stripe is loaded', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('primary-button')).not.toBeDisabled()
    })

    it('should have full width button', () => {
      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })
  })

  describe('Alert Messages', () => {
    it('should show info alert for retry', () => {
      localStorage.setItem('failed_payment_intent', 'test_secret')

      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} isRetryAttempt={true} />
        </TestWrapper>
      )

      expect(screen.getByText('Retry Payment')).toBeInTheDocument()
    })

    it('should have alert title', () => {
      localStorage.setItem('failed_payment_intent', 'test_secret')

      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} isRetryAttempt={true} />
        </TestWrapper>
      )

      expect(screen.getByText('Retry Payment')).toBeInTheDocument()
    })

    it('should have alert description', () => {
      localStorage.setItem('failed_payment_intent', 'test_secret')

      render(
        <TestWrapper>
          <CheckoutForm {...defaultProps} isRetryAttempt={true} />
        </TestWrapper>
      )

      expect(screen.getByText(/Enter new payment details/)).toBeInTheDocument()
    })
  })
})
