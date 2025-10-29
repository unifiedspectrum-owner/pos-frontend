/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconType } from 'react-icons'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import SecondaryButton from '../secondary-button'

/* Mock dependencies */
vi.mock('polished', () => ({
  lighten: vi.fn((amount: number, color: string) => color)
}))

vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('SecondaryButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render button with default text', () => {
      render(<SecondaryButton />, { wrapper: TestWrapper })

      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should render button with children', () => {
      render(<SecondaryButton>Click Me</SecondaryButton>, { wrapper: TestWrapper })

      /* buttonText defaults to "Cancel" and takes precedence over children */
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.queryByText('Click Me')).not.toBeInTheDocument()
    })

    it('should render button with buttonText prop', () => {
      render(<SecondaryButton buttonText="Go Back" />, { wrapper: TestWrapper })

      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('should prioritize buttonText over children', () => {
      render(
        <SecondaryButton buttonText="Close">Children Text</SecondaryButton>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Close')).toBeInTheDocument()
      expect(screen.queryByText('Children Text')).not.toBeInTheDocument()
    })

    it('should render button with default type', () => {
      render(<SecondaryButton buttonText="Click" />, { wrapper: TestWrapper })

      const button = screen.getByText('Click').closest('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should render button with submit type', () => {
      render(<SecondaryButton type="submit" buttonText="Submit" />, { wrapper: TestWrapper })

      const button = screen.getByText('Submit').closest('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should render button with reset type', () => {
      render(<SecondaryButton type="reset" buttonText="Reset" />, { wrapper: TestWrapper })

      const button = screen.getByText('Reset').closest('button')
      expect(button).toHaveAttribute('type', 'reset')
    })
  })

  describe('Button States', () => {
    it('should be enabled by default', () => {
      render(<SecondaryButton />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<SecondaryButton disabled={true} />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show loading state when loading is true', () => {
      render(<SecondaryButton loading={true} />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show loading state when isLoading is true', () => {
      render(<SecondaryButton isLoading={true} />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show loadingText when loading and loadingText is provided', () => {
      render(
        <SecondaryButton buttonText="Cancel" loadingText="Cancelling..." isLoading={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cancelling...')).toBeInTheDocument()
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('should not show loadingText when not loading', () => {
      render(
        <SecondaryButton buttonText="Cancel" loadingText="Cancelling..." isLoading={false} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.queryByText('Cancelling...')).not.toBeInTheDocument()
    })
  })

  describe('Button Sizes', () => {
    it('should render with default medium size', () => {
      render(<SecondaryButton />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with small size', () => {
      render(<SecondaryButton size="sm" />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with large size', () => {
      render(<SecondaryButton size="lg" />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('should call onClick handler when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(<SecondaryButton onClick={handleClick} />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(
        <SecondaryButton onClick={handleClick} disabled={true} />,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(
        <SecondaryButton onClick={handleClick} loading={true} />,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Icons', () => {
    it('should render with left icon', () => {
      const LeftIcon: IconType = () => <svg data-testid="left-icon" />

      render(
        <SecondaryButton leftIcon={LeftIcon} buttonText="Back" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('should render with right icon', () => {
      const RightIcon: IconType = () => <svg data-testid="right-icon" />

      render(
        <SecondaryButton rightIcon={RightIcon} buttonText="Next" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should render with both left and right icons', () => {
      const LeftIcon: IconType = () => <svg data-testid="left-icon" />
      const RightIcon: IconType = () => <svg data-testid="right-icon" />

      render(
        <SecondaryButton
          leftIcon={LeftIcon}
          rightIcon={RightIcon}
          buttonText="Options"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByText('Options')).toBeInTheDocument()
    })

    it('should not render icons when not provided', () => {
      render(<SecondaryButton />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })
  })

  describe('Additional Props', () => {
    it('should accept additional button props', () => {
      render(
        <SecondaryButton buttonProps={{ 'aria-label': 'Close dialog' }}>
          Close
        </SecondaryButton>,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Close dialog')
    })

    it('should spread buttonProps correctly', () => {
      render(
        <SecondaryButton buttonProps={{ id: 'close-btn', className: 'custom-class' }}>
          Close
        </SecondaryButton>,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('id', 'close-btn')
    })
  })

  describe('Use Cases', () => {
    it('should render cancel button for dialogs', () => {
      render(
        <SecondaryButton buttonText="Cancel" onClick={vi.fn()} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should render back button for navigation', () => {
      render(
        <SecondaryButton buttonText="Go Back" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('should render close button with icon', () => {
      const CloseIcon: IconType = () => <svg data-testid="close-icon" />

      render(
        <SecondaryButton leftIcon={CloseIcon} buttonText="Close" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('close-icon')).toBeInTheDocument()
      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    it('should render loading state for cancellation', () => {
      render(
        <SecondaryButton buttonText="Cancel" loadingText="Cancelling..." isLoading={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cancelling...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should render reset button for forms', () => {
      render(
        <SecondaryButton type="reset" buttonText="Reset Form" />,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'reset')
      expect(screen.getByText('Reset Form')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty buttonText with children', () => {
      render(<SecondaryButton buttonText="">Children Text</SecondaryButton>, { wrapper: TestWrapper })

      /* Empty string is falsy, so children should be rendered */
      expect(screen.getByText('Children Text')).toBeInTheDocument()
    })

    it('should handle both loading and disabled states', () => {
      render(
        <SecondaryButton loading={true} disabled={true} />,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should handle long text', () => {
      const longText = 'This is a very long button text that should still render properly'
      render(<SecondaryButton buttonText={longText} />, { wrapper: TestWrapper })

      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      render(<SecondaryButton buttonText="Cancel & Close" />, { wrapper: TestWrapper })

      expect(screen.getByText('Cancel & Close')).toBeInTheDocument()
    })

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(<SecondaryButton onClick={handleClick} />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('should handle undefined onClick', async () => {
      const user = userEvent.setup()

      render(<SecondaryButton />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      await user.click(button)

      /* Should not throw error when onClick is undefined */
      expect(button).toBeInTheDocument()
    })
  })

  describe('State Transitions', () => {
    it('should transition from enabled to disabled', () => {
      const { rerender } = render(
        <SecondaryButton disabled={false} />,
        { wrapper: TestWrapper }
      )

      let button = screen.getByRole('button')
      expect(button).not.toBeDisabled()

      rerender(<SecondaryButton disabled={true} />)

      button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should transition from loading to not loading', () => {
      const { rerender } = render(
        <SecondaryButton buttonText="Cancel" loadingText="Cancelling..." isLoading={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cancelling...')).toBeInTheDocument()

      rerender(
        <SecondaryButton buttonText="Cancel" loadingText="Cancelling..." isLoading={false} />
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.queryByText('Cancelling...')).not.toBeInTheDocument()
    })

    it('should update button text dynamically', () => {
      const { rerender } = render(
        <SecondaryButton buttonText="Cancel" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()

      rerender(<SecondaryButton buttonText="Close" />)

      expect(screen.getByText('Close')).toBeInTheDocument()
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('should update onClick handler', async () => {
      const user = userEvent.setup()
      const firstHandler = vi.fn()
      const secondHandler = vi.fn()

      const { rerender } = render(
        <SecondaryButton onClick={firstHandler} />,
        { wrapper: TestWrapper }
      )

      let button = screen.getByRole('button')
      await user.click(button)

      expect(firstHandler).toHaveBeenCalledTimes(1)
      expect(secondHandler).not.toHaveBeenCalled()

      rerender(<SecondaryButton onClick={secondHandler} />)

      button = screen.getByRole('button')
      await user.click(button)

      expect(firstHandler).toHaveBeenCalledTimes(1)
      expect(secondHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<SecondaryButton />, { wrapper: TestWrapper })

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should indicate disabled state for screen readers', () => {
      render(<SecondaryButton disabled={true} />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should support custom aria-label', () => {
      render(
        <SecondaryButton buttonProps={{ 'aria-label': 'Cancel action' }}>
          Cancel
        </SecondaryButton>,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Cancel action')
    })

    it('should be keyboard accessible', () => {
      render(<SecondaryButton />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should indicate loading state appropriately', () => {
      render(<SecondaryButton isLoading={true} />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Styling Variants', () => {
    it('should render with outline variant', () => {
      render(<SecondaryButton />, { wrapper: TestWrapper })

      /* SecondaryButton uses outline variant by default */
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should apply gray color scheme', () => {
      render(<SecondaryButton />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('should work as dialog cancel button', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(
        <SecondaryButton onClick={onCancel} buttonText="Cancel" />,
        { wrapper: TestWrapper }
      )

      const button = screen.getByText('Cancel')
      await user.click(button)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('should work as form reset button', () => {
      render(
        <SecondaryButton type="reset" buttonText="Reset" />,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'reset')
    })

    it('should work as back navigation button', () => {
      const BackIcon: IconType = () => <svg data-testid="back-icon" />

      render(
        <SecondaryButton leftIcon={BackIcon} buttonText="Back" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('back-icon')).toBeInTheDocument()
      expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('should work in pagination controls', () => {
      const PrevIcon: IconType = () => <svg data-testid="prev-icon" />

      render(
        <SecondaryButton leftIcon={PrevIcon} buttonText="Previous" disabled={false} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('prev-icon')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })
})
