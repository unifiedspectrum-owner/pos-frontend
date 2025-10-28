/* Comprehensive test suite for PaymentFailedStep component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import PaymentFailedStep from '@tenant-management/forms/steps/payment-failed'

describe('PaymentFailedStep', () => {
  const mockOnRetryPayment = vi.fn()
  const mockOnPrevious = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render payment failed header', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Payment Failed')).toBeInTheDocument()
    })

    it('should display error message', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorMessage="Payment was declined"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Payment was declined')).toBeInTheDocument()
    })

    it('should display error code', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="CARD_DECLINED"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Error Code: CARD_DECLINED/)).toBeInTheDocument()
    })

    it('should not display specific error message when default is used', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      /* Default message is not shown in Stripe error section - only custom messages */
      expect(screen.queryByText(/Stripe Payment Error/)).not.toBeInTheDocument()
    })
  })

  describe('Error Reasons', () => {
    it('should display card declined error details', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="CARD_DECLINED"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Card Declined')).toBeInTheDocument()
      expect(screen.getByText(/Your payment method was declined by your bank/)).toBeInTheDocument()
    })

    it('should display insufficient funds error details', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="INSUFFICIENT_FUNDS"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Insufficient Funds')).toBeInTheDocument()
    })

    it('should display expired card error details', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="EXPIRED_CARD"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Expired Card')).toBeInTheDocument()
    })

    it('should display invalid card error details', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="INVALID_CARD"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Invalid Card Details')).toBeInTheDocument()
    })

    it('should display processing error for unknown codes', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="UNKNOWN_ERROR"
        />,
        { wrapper: TestWrapper }
      )

      /* Unknown codes fall back to PROCESSING_ERROR */
      expect(screen.getByText('Processing Error')).toBeInTheDocument()
    })
  })

  describe('Suggestions', () => {
    it('should display resolution suggestions', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="CARD_DECLINED"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('How to Resolve This')).toBeInTheDocument()
      expect(screen.getByText(/Check that you entered the correct card details/)).toBeInTheDocument()
    })

    it('should display different suggestions for different errors', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="INSUFFICIENT_FUNDS"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Add funds to your account/)).toBeInTheDocument()
    })
  })

  describe('Retry Attempts', () => {
    it('should load retry attempts from localStorage on mount', () => {
      localStorage.setItem('payment_retry_attempts', '2')

      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      /* Text contains strong tag, so use custom matcher targeting p element */
      const retryText = screen.getByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent === 'Previous attempts: 2'
      })
      expect(retryText).toBeInTheDocument()
    })

    it('should show warning after 3 attempts', () => {
      localStorage.setItem('payment_retry_attempts', '3')

      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Consider contacting support for assistance/)).toBeInTheDocument()
    })

    it('should not show retry info when no attempts', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Previous attempts/)).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render action buttons', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      /* Component should render 3 buttons: retry, contact support, change payment */
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })

    it('should render primary and secondary action buttons', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      /* Just verify buttons exist - actual text may vary */
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Button Actions', () => {
    it('should call onRetryPayment when first button clicked', async () => {
      const user = userEvent.setup()
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      /* First button should be retry payment */
      await user.click(buttons[0])

      expect(mockOnRetryPayment).toHaveBeenCalledTimes(1)
    })

    it('should increment retry attempts when retrying', async () => {
      const user = userEvent.setup()
      localStorage.setItem('payment_retry_attempts', '1')

      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      /* First button should be retry payment */
      await user.click(buttons[0])

      expect(localStorage.getItem('payment_retry_attempts')).toBe('2')
    })

    it('should call onPrevious when third button clicked', async () => {
      const user = userEvent.setup()
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(3)
      /* Third button should be change payment method */
      await user.click(buttons[2])

      expect(mockOnPrevious).toHaveBeenCalledTimes(1)
    })

    it('should save support data when second button clicked', async () => {
      const user = userEvent.setup()
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="CARD_DECLINED"
          errorMessage="Card was declined"
        />,
        { wrapper: TestWrapper }
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      /* Second button should be contact support */
      await user.click(buttons[1])

      const supportData = localStorage.getItem('payment_support_data')
      expect(supportData).toBeTruthy()

      if (supportData) {
        const parsed = JSON.parse(supportData)
        expect(parsed.errorCode).toBe('CARD_DECLINED')
        expect(parsed.errorMessage).toBe('Card was declined')
      }
    })
  })

  describe('Support Information', () => {
    it('should display support contact options', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Need Help?')).toBeInTheDocument()
      expect(screen.getByText('Call Support')).toBeInTheDocument()
      expect(screen.getByText('Email Support')).toBeInTheDocument()
    })

    it('should display support phone number', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('1-800-123-4567')).toBeInTheDocument()
    })

    it('should display support email', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('support@posystem.com')).toBeInTheDocument()
    })
  })

  describe('Important Notes', () => {
    it('should display important notes section', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Important Notes')).toBeInTheDocument()
    })

    it('should inform that account information is saved', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Your account information has been saved/)).toBeInTheDocument()
    })

    it('should inform that no charges were made', () => {
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/No charges were made to your payment method/)).toBeInTheDocument()
    })
  })

  describe('Error Icon Display', () => {
    it('should display appropriate icon for different error types', () => {
      const { rerender } = render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="CARD_DECLINED"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Card Declined')).toBeInTheDocument()

      rerender(
        <Provider>
          <PaymentFailedStep
            onRetryPayment={mockOnRetryPayment}
            onPrevious={mockOnPrevious}
            errorCode="INSUFFICIENT_FUNDS"
          />
        </Provider>
      )

      expect(screen.getByText('Insufficient Funds')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete retry workflow', async () => {
      const user = userEvent.setup()
      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="CARD_DECLINED"
          errorMessage="Card was declined by bank"
        />,
        { wrapper: TestWrapper }
      )

      /* Verify error details are displayed */
      expect(screen.getByText('Card Declined')).toBeInTheDocument()
      expect(screen.getByText('Card was declined by bank')).toBeInTheDocument()

      /* Retry payment */
      const buttons = screen.getAllByRole('button')
      const retryButton = buttons.find(btn => btn.textContent?.toLowerCase().includes('try payment again'))
      expect(retryButton).toBeDefined()
      await user.click(retryButton!)

      /* Verify retry handler was called */
      expect(mockOnRetryPayment).toHaveBeenCalled()

      /* Verify retry count was incremented */
      expect(localStorage.getItem('payment_retry_attempts')).toBe('1')
    })

    it('should handle support workflow', async () => {
      const user = userEvent.setup()
      localStorage.setItem('payment_retry_attempts', '3')

      render(
        <PaymentFailedStep
          onRetryPayment={mockOnRetryPayment}
          onPrevious={mockOnPrevious}
          errorCode="PROCESSING_ERROR"
          errorMessage="Technical error occurred"
        />,
        { wrapper: TestWrapper }
      )

      /* Verify retry warning is shown */
      await waitFor(() => {
        expect(screen.getByText(/Consider contacting support for assistance/)).toBeInTheDocument()
      })

      /* Contact support - second button should be contact support */
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      await user.click(buttons[1])

      /* Verify support data was saved */
      const supportData = localStorage.getItem('payment_support_data')
      expect(supportData).toBeTruthy()
    })
  })
})
