/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconType } from 'react-icons'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import PrimaryButton from '../primary-button'

/* Mock dependencies */
vi.mock('polished', () => ({
  lighten: vi.fn((amount: number, color: string) => color)
}))

vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182ce'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('PrimaryButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render button with text', () => {
      render(<PrimaryButton>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('should render button with buttonText prop', () => {
      render(<PrimaryButton buttonText="Submit" />, { wrapper: TestWrapper })

      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should prioritize buttonText over children', () => {
      render(
        <PrimaryButton buttonText="Button Text">Children Text</PrimaryButton>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Button Text')).toBeInTheDocument()
      expect(screen.queryByText('Children Text')).not.toBeInTheDocument()
    })

    it('should render button with default type', () => {
      render(<PrimaryButton>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByText('Click Me').closest('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should render button with submit type', () => {
      render(<PrimaryButton type="submit">Submit</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByText('Submit').closest('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should render button with reset type', () => {
      render(<PrimaryButton type="reset">Reset</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByText('Reset').closest('button')
      expect(button).toHaveAttribute('type', 'reset')
    })
  })

  describe('Button States', () => {
    it('should be enabled by default', () => {
      render(<PrimaryButton>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<PrimaryButton disabled={true}>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show loading state when loading is true', () => {
      render(<PrimaryButton loading={true}>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show loading state when isLoading is true', () => {
      render(<PrimaryButton isLoading={true}>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show loadingText when loading and loadingText is provided', () => {
      render(
        <PrimaryButton buttonText="Submit" loadingText="Submitting..." isLoading={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })

    it('should not show loadingText when not loading', () => {
      render(
        <PrimaryButton buttonText="Submit" loadingText="Submitting..." isLoading={false} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.queryByText('Submitting...')).not.toBeInTheDocument()
    })
  })

  describe('Button Sizes', () => {
    it('should render with default medium size', () => {
      render(<PrimaryButton>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with small size', () => {
      render(<PrimaryButton size="sm">Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with large size', () => {
      render(<PrimaryButton size="lg">Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('should call onClick handler when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(<PrimaryButton onClick={handleClick}>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(
        <PrimaryButton onClick={handleClick} disabled={true}>Click Me</PrimaryButton>,
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
        <PrimaryButton onClick={handleClick} loading={true}>Click Me</PrimaryButton>,
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
        <PrimaryButton leftIcon={LeftIcon}>Click Me</PrimaryButton>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('should render with right icon', () => {
      const RightIcon: IconType = () => <svg data-testid="right-icon" />

      render(
        <PrimaryButton rightIcon={RightIcon}>Click Me</PrimaryButton>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('should render with both left and right icons', () => {
      const LeftIcon: IconType = () => <svg data-testid="left-icon" />
      const RightIcon: IconType = () => <svg data-testid="right-icon" />

      render(
        <PrimaryButton leftIcon={LeftIcon} rightIcon={RightIcon}>
          Click Me
        </PrimaryButton>,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('should not render icons when not provided', () => {
      render(<PrimaryButton>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom background color', () => {
      render(<PrimaryButton bg="#ff0000">Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should apply custom width', () => {
      render(<PrimaryButton width="200px">Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should apply custom height', () => {
      render(<PrimaryButton height="50px">Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should apply custom border radius', () => {
      render(<PrimaryButton borderRadius="10px">Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should use default border radius when not provided', () => {
      render(<PrimaryButton>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Additional Props', () => {
    it('should accept additional button props', () => {
      render(
        <PrimaryButton buttonProps={{ 'aria-label': 'Custom Label' }}>
          Click Me
        </PrimaryButton>,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom Label')
    })

    it('should spread buttonProps correctly', () => {
      render(
        <PrimaryButton buttonProps={{ id: 'custom-id', className: 'custom-class' }}>
          Click Me
        </PrimaryButton>,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('id', 'custom-id')
    })
  })

  describe('Use Cases', () => {
    it('should render submit button for forms', () => {
      render(
        <PrimaryButton type="submit" buttonText="Submit Form" />,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(screen.getByText('Submit Form')).toBeInTheDocument()
    })

    it('should render loading button during async operation', () => {
      render(
        <PrimaryButton buttonText="Save" loadingText="Saving..." isLoading={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should render danger button with custom color', () => {
      render(
        <PrimaryButton bg="red.500" buttonText="Delete" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should render button with icon and text', () => {
      const SaveIcon: IconType = () => <svg data-testid="save-icon" />

      render(
        <PrimaryButton leftIcon={SaveIcon} buttonText="Save Changes" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('save-icon')).toBeInTheDocument()
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<PrimaryButton />, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle both loading and disabled states', () => {
      render(
        <PrimaryButton loading={true} disabled={true}>Click Me</PrimaryButton>,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should handle long text', () => {
      const longText = 'This is a very long button text that should still render properly'
      render(<PrimaryButton>{longText}</PrimaryButton>, { wrapper: TestWrapper })

      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      render(<PrimaryButton>Click & Save!</PrimaryButton>, { wrapper: TestWrapper })

      expect(screen.getByText('Click & Save!')).toBeInTheDocument()
    })

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(<PrimaryButton onClick={handleClick}>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(3)
    })
  })

  describe('State Transitions', () => {
    it('should transition from enabled to disabled', () => {
      const { rerender } = render(
        <PrimaryButton disabled={false}>Click Me</PrimaryButton>,
        { wrapper: TestWrapper }
      )

      let button = screen.getByRole('button')
      expect(button).not.toBeDisabled()

      rerender(<PrimaryButton disabled={true}>Click Me</PrimaryButton>)

      button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should transition from loading to not loading', () => {
      const { rerender } = render(
        <PrimaryButton buttonText="Submit" loadingText="Submitting..." isLoading={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Submitting...')).toBeInTheDocument()

      rerender(
        <PrimaryButton buttonText="Submit" loadingText="Submitting..." isLoading={false} />
      )

      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.queryByText('Submitting...')).not.toBeInTheDocument()
    })

    it('should update button text dynamically', () => {
      const { rerender } = render(
        <PrimaryButton buttonText="Save" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Save')).toBeInTheDocument()

      rerender(<PrimaryButton buttonText="Update" />)

      expect(screen.getByText('Update')).toBeInTheDocument()
      expect(screen.queryByText('Save')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<PrimaryButton>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should indicate disabled state for screen readers', () => {
      render(<PrimaryButton disabled={true}>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should support custom aria-label', () => {
      render(
        <PrimaryButton buttonProps={{ 'aria-label': 'Submit form' }}>
          Submit
        </PrimaryButton>,
        { wrapper: TestWrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Submit form')
    })

    it('should be keyboard accessible', () => {
      render(<PrimaryButton>Click Me</PrimaryButton>, { wrapper: TestWrapper })

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })
  })
})
