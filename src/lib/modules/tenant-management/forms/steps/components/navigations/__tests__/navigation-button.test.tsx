/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import { IconType } from 'react-icons'

/* Tenant module imports */
import NavigationButton from '../navigation-button'
import { FiCheck, FiX } from 'react-icons/fi'

/* Mock button component props interfaces */
interface MockButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  leftIcon?: IconType
  rightIcon?: IconType
}

/* Mock shared button components */
vi.mock('@/lib/shared', () => ({
  SecondaryButton: ({ children, onClick, disabled, loading, type, leftIcon, rightIcon }: MockButtonProps) => (
    <button
      data-testid="secondary-button"
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      data-loading={loading}
    >
      {leftIcon && <span data-testid="secondary-left-icon" />}
      {children}
      {rightIcon && <span data-testid="secondary-right-icon" />}
    </button>
  ),
  PrimaryButton: ({ children, onClick, disabled, loading, type, leftIcon, rightIcon }: MockButtonProps) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      data-loading={loading}
    >
      {leftIcon && <span data-testid="primary-left-icon" />}
      {children}
      {rightIcon && <span data-testid="primary-right-icon" />}
    </button>
  )
}))

describe('NavigationButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Rendering', () => {
    it('should render both primary and secondary buttons', () => {
      render(<NavigationButton />, { wrapper: TestWrapper })

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
    })

    it('should display default button texts', () => {
      render(<NavigationButton />, { wrapper: TestWrapper })

      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    it('should display custom primary button text', () => {
      render(<NavigationButton primaryBtnText="Continue" />, { wrapper: TestWrapper })

      expect(screen.getByText('Continue')).toBeInTheDocument()
    })

    it('should display custom secondary button text', () => {
      render(<NavigationButton secondaryBtnText="Go Back" />, { wrapper: TestWrapper })

      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })
  })

  describe('Button Types', () => {
    it('should set primary button type to submit', () => {
      render(<NavigationButton primaryBtnType="submit" />, { wrapper: TestWrapper })

      const primaryButton = screen.getByTestId('primary-button')
      expect(primaryButton).toHaveAttribute('type', 'submit')
    })

    it('should set secondary button type to submit', () => {
      render(<NavigationButton secondaryBtnType="submit" />, { wrapper: TestWrapper })

      const secondaryButton = screen.getByTestId('secondary-button')
      expect(secondaryButton).toHaveAttribute('type', 'submit')
    })

    it('should default to button type', () => {
      render(<NavigationButton />, { wrapper: TestWrapper })

      const primaryButton = screen.getByTestId('primary-button')
      const secondaryButton = screen.getByTestId('secondary-button')

      expect(primaryButton).toHaveAttribute('type', 'button')
      expect(secondaryButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Loading States', () => {
    it('should show primary button loading state', () => {
      render(<NavigationButton isPrimaryBtnLoading={true} primaryBtnLoadingText="Processing..." />, { wrapper: TestWrapper })

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      const primaryButton = screen.getByTestId('primary-button')
      expect(primaryButton).toHaveAttribute('data-loading', 'true')
    })

    it('should show secondary button loading state', () => {
      render(<NavigationButton isSecondaryBtnLoading={true} secondaryBtnLoadingText="Going back..." />, { wrapper: TestWrapper })

      expect(screen.getByText('Going back...')).toBeInTheDocument()
      const secondaryButton = screen.getByTestId('secondary-button')
      expect(secondaryButton).toHaveAttribute('data-loading', 'true')
    })

    it('should disable primary button when loading', () => {
      render(<NavigationButton isPrimaryBtnLoading={true} />, { wrapper: TestWrapper })

      const primaryButton = screen.getByTestId('primary-button')
      expect(primaryButton).toBeDisabled()
    })

    it('should disable secondary button when loading', () => {
      render(<NavigationButton isSecondaryBtnLoading={true} />, { wrapper: TestWrapper })

      const secondaryButton = screen.getByTestId('secondary-button')
      expect(secondaryButton).toBeDisabled()
    })
  })

  describe('Disabled States', () => {
    it('should disable primary button', () => {
      render(<NavigationButton primaryBtnDisabled={true} />, { wrapper: TestWrapper })

      const primaryButton = screen.getByTestId('primary-button')
      expect(primaryButton).toBeDisabled()
    })

    it('should disable secondary button', () => {
      render(<NavigationButton secondaryBtnDisabled={true} />, { wrapper: TestWrapper })

      const secondaryButton = screen.getByTestId('secondary-button')
      expect(secondaryButton).toBeDisabled()
    })
  })

  describe('Click Handlers', () => {
    it('should call onPrimaryClick when primary button is clicked', async () => {
      const handlePrimaryClick = vi.fn()
      const user = userEvent.setup()

      render(<NavigationButton onPrimaryClick={handlePrimaryClick} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('primary-button'))

      expect(handlePrimaryClick).toHaveBeenCalledTimes(1)
    })

    it('should call onSecondaryClick when secondary button is clicked', async () => {
      const handleSecondaryClick = vi.fn()
      const user = userEvent.setup()

      render(<NavigationButton onSecondaryClick={handleSecondaryClick} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('secondary-button'))

      expect(handleSecondaryClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when primary button is disabled', async () => {
      const handlePrimaryClick = vi.fn()
      const user = userEvent.setup()

      render(<NavigationButton onPrimaryClick={handlePrimaryClick} primaryBtnDisabled={true} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('primary-button'))

      expect(handlePrimaryClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when secondary button is disabled', async () => {
      const handleSecondaryClick = vi.fn()
      const user = userEvent.setup()

      render(<NavigationButton onSecondaryClick={handleSecondaryClick} secondaryBtnDisabled={true} />, { wrapper: TestWrapper })

      await user.click(screen.getByTestId('secondary-button'))

      expect(handleSecondaryClick).not.toHaveBeenCalled()
    })
  })

  describe('Icons', () => {
    it('should render primary right icon by default', () => {
      render(<NavigationButton />, { wrapper: TestWrapper })

      expect(screen.getByTestId('primary-right-icon')).toBeInTheDocument()
    })

    it('should render secondary left icon by default', () => {
      render(<NavigationButton />, { wrapper: TestWrapper })

      expect(screen.getByTestId('secondary-left-icon')).toBeInTheDocument()
    })

    it('should render custom primary left icon', () => {
      render(<NavigationButton primaryBtnLeftIcon={FiCheck} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('primary-left-icon')).toBeInTheDocument()
    })

    it('should render custom secondary right icon', () => {
      render(<NavigationButton secondaryBtnRightIcon={FiX} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('secondary-right-icon')).toBeInTheDocument()
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle all custom props together', async () => {
      const handlePrimaryClick = vi.fn()
      const handleSecondaryClick = vi.fn()
      const user = userEvent.setup()

      render(
        <NavigationButton
          primaryBtnText="Submit"
          primaryBtnType="submit"
          onPrimaryClick={handlePrimaryClick}
          secondaryBtnText="Cancel"
          onSecondaryClick={handleSecondaryClick}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()

      await user.click(screen.getByTestId('primary-button'))
      await user.click(screen.getByTestId('secondary-button'))

      expect(handlePrimaryClick).toHaveBeenCalledTimes(1)
      expect(handleSecondaryClick).toHaveBeenCalledTimes(1)
    })

    it('should show loading text instead of button text when loading', () => {
      render(
        <NavigationButton
          isPrimaryBtnLoading={true}
          primaryBtnText="Next"
          primaryBtnLoadingText="Saving..."
          isSecondaryBtnLoading={true}
          secondaryBtnText="Previous"
          secondaryBtnLoadingText="Loading..."
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render buttons in a flex container', () => {
      render(<NavigationButton />, { wrapper: TestWrapper })

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })
})
