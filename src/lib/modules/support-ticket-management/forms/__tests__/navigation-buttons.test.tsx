/* Comprehensive test suite for NavigationButtons */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Support ticket module imports */
import NavigationButtons from '@support-ticket-management/forms/navigation-buttons'

/* Mock button component interfaces */
interface MockPrimaryButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
  loadingText: string
  buttonText: string
}

interface MockSecondaryButtonProps {
  onClick: () => void
  disabled: boolean
}

/* Mock button components */
vi.mock('@shared/components/form-elements/buttons', () => ({
  PrimaryButton: ({ onClick, loading, disabled, loadingText, buttonText }: MockPrimaryButtonProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="primary-button"
      data-loading={loading}
      data-loading-text={loadingText}
    >
      {buttonText}
    </button>
  ),
  SecondaryButton: ({ onClick, disabled }: MockSecondaryButtonProps) => (
    <button onClick={onClick} disabled={disabled} data-testid="secondary-button">
      Cancel
    </button>
  )
}))

describe('NavigationButtons', () => {
  const mockOnCancel = vi.fn()
  const mockOnSubmit = vi.fn()

  const defaultProps = {
    onCancel: mockOnCancel,
    onSubmit: mockOnSubmit,
    loading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render both cancel and submit buttons', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
    })

    it('should display default submit text', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Create Ticket')).toBeInTheDocument()
    })

    it('should display custom submit text', () => {
      render(
        <NavigationButtons {...defaultProps} submitText="Update Ticket" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Update Ticket')).toBeInTheDocument()
    })

    it('should have default loading text', () => {
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const button = screen.getByTestId('primary-button')
      expect(button).toHaveAttribute('data-loading-text', 'Creating Ticket...')
    })

    it('should display custom loading text', () => {
      render(
        <NavigationButtons {...defaultProps} loading={true} loadingText="Updating Ticket..." />,
        { wrapper: TestWrapper }
      )

      const button = screen.getByTestId('primary-button')
      expect(button).toHaveAttribute('data-loading-text', 'Updating Ticket...')
    })
  })

  describe('Button Actions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByTestId('secondary-button')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onSubmit when submit button is clicked', async () => {
      const user = userEvent.setup()

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('primary-button')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('primary-button')
      expect(submitButton).toBeDisabled()
    })

    it('should disable cancel button when loading', () => {
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByTestId('secondary-button')
      expect(cancelButton).toBeDisabled()
    })

    it('should pass loading state to primary button', () => {
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('primary-button')
      expect(submitButton).toHaveAttribute('data-loading', 'true')
    })

    it('should not disable buttons when not loading', () => {
      render(<NavigationButtons {...defaultProps} loading={false} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('primary-button')
      const cancelButton = screen.getByTestId('secondary-button')

      expect(submitButton).not.toBeDisabled()
      expect(cancelButton).not.toBeDisabled()
    })
  })

  describe('Disabled State', () => {
    it('should disable submit button when disabled prop is true', () => {
      render(<NavigationButtons {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('primary-button')
      expect(submitButton).toBeDisabled()
    })

    it('should disable cancel button when disabled prop is true', () => {
      render(<NavigationButtons {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByTestId('secondary-button')
      expect(cancelButton).toBeDisabled()
    })

    it('should disable buttons when both loading and disabled', () => {
      render(
        <NavigationButtons {...defaultProps} loading={true} disabled={true} />,
        { wrapper: TestWrapper }
      )

      const submitButton = screen.getByTestId('primary-button')
      const cancelButton = screen.getByTestId('secondary-button')

      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    it('should use false as default for disabled prop', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('primary-button')
      const cancelButton = screen.getByTestId('secondary-button')

      expect(submitButton).not.toBeDisabled()
      expect(cancelButton).not.toBeDisabled()
    })
  })

  describe('Button Layout', () => {
    it('should arrange buttons with space-between', () => {
      const { container } = render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const flexContainer = container.querySelector('[data-testid="secondary-button"]')?.parentElement
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe('Multiple Clicks', () => {
    it('should handle multiple submit clicks', async () => {
      const user = userEvent.setup()

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('primary-button')
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledTimes(3)
    })

    it('should handle multiple cancel clicks', async () => {
      const user = userEvent.setup()

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByTestId('secondary-button')
      await user.click(cancelButton)
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(2)
    })

    it('should not allow clicks when disabled', async () => {
      const user = userEvent.setup()

      render(<NavigationButtons {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const submitButton = screen.getByTestId('primary-button')
      const cancelButton = screen.getByTestId('secondary-button')

      await user.click(submitButton)
      await user.click(cancelButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
      expect(mockOnCancel).not.toHaveBeenCalled()
    })
  })

  describe('Props Validation', () => {
    it('should work with all props provided', () => {
      render(
        <NavigationButtons
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
          loading={true}
          disabled={false}
          submitText="Custom Submit"
          loadingText="Custom Loading..."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Custom Submit')).toBeInTheDocument()
    })

    it('should work with minimal props', () => {
      render(
        <NavigationButtons
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
          loading={false}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
    })
  })
})
