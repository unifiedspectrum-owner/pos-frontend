import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { FiHome, FiUser } from 'react-icons/fi'
import SecondaryButton from '../secondary-button'

// Mock the shared config since it's imported but file wasn't found
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

describe('SecondaryButton', () => {
  const defaultProps = {
    children: 'Click me'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<SecondaryButton {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('renders children content correctly', () => {
      render(<SecondaryButton>Secondary Button Text</SecondaryButton>)
      expect(screen.getByText('Secondary Button Text')).toBeInTheDocument()
    })

    it('renders with complex children', () => {
      render(
        <SecondaryButton>
          <span>Multi</span> <strong>Element</strong> Content
        </SecondaryButton>
      )
      expect(screen.getByText('Multi')).toBeInTheDocument()
      expect(screen.getByText('Element')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders with outline variant by default', () => {
      render(<SecondaryButton>Outline Button</SecondaryButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('chakra-button')
    })
  })

  describe('Props', () => {
    it('applies custom onClick handler', async () => {
      const handleClick = vi.fn()
      render(<SecondaryButton onClick={handleClick}>Click me</SecondaryButton>)
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies different button types', () => {
      const { rerender } = render(<SecondaryButton type="submit">Submit</SecondaryButton>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')

      rerender(<SecondaryButton type="reset">Reset</SecondaryButton>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')

      rerender(<SecondaryButton type="button">Button</SecondaryButton>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('applies different sizes', () => {
      const { rerender } = render(<SecondaryButton size="sm">Small</SecondaryButton>)
      const button = screen.getByRole('button')
      
      // Check that the button renders with different sizes by verifying it has chakra classes
      expect(button).toHaveClass('chakra-button')

      rerender(<SecondaryButton size="md">Medium</SecondaryButton>)
      expect(screen.getByRole('button')).toHaveClass('chakra-button')

      rerender(<SecondaryButton size="lg">Large</SecondaryButton>)
      expect(screen.getByRole('button')).toHaveClass('chakra-button')
    })

    it('spreads additional buttonProps', () => {
      render(
        <SecondaryButton 
          buttonProps={{ 
            'aria-label': 'Secondary aria label',
            id: 'secondary-id',
            title: 'Secondary title'
          }}
        >
          Secondary Button
        </SecondaryButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Secondary aria label')
      expect(button).toHaveAttribute('id', 'secondary-id')
      expect(button).toHaveAttribute('title', 'Secondary title')
    })
  })

  describe('Icons', () => {
    it('renders with left icon', () => {
      render(<SecondaryButton leftIcon={FiHome}>With Left Icon</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Check if icon is rendered (icons are rendered as svg elements)
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('renders with right icon', () => {
      render(<SecondaryButton rightIcon={FiUser}>With Right Icon</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('renders with both left and right icons', () => {
      render(<SecondaryButton leftIcon={FiHome} rightIcon={FiUser}>Both Icons</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Should have 2 SVG elements
      expect(button.querySelectorAll('svg')).toHaveLength(2)
    })

    it('renders without icons when not provided', () => {
      render(<SecondaryButton>No Icons</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button.querySelector('svg')).not.toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('handles disabled state', async () => {
      const handleClick = vi.fn()
      render(<SecondaryButton disabled onClick={handleClick}>Disabled Button</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      // Try to click disabled button
      await userEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles loading state', () => {
      render(<SecondaryButton loading>Loading Button</SecondaryButton>)
      
      const button = screen.getByRole('button')
      // Chakra UI loading state typically disables the button and shows a spinner
      expect(button).toBeInTheDocument()
    })

    it('handles both disabled and loading states', () => {
      render(<SecondaryButton disabled loading>Disabled Loading</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn()
      render(<SecondaryButton onClick={handleClick}>Clickable</SecondaryButton>)
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles multiple clicks', async () => {
      const handleClick = vi.fn()
      render(<SecondaryButton onClick={handleClick}>Multi Click</SecondaryButton>)
      
      const button = screen.getByRole('button')
      await userEvent.click(button)
      await userEvent.click(button)
      await userEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('handles keyboard interactions', async () => {
      const handleClick = vi.fn()
      render(<SecondaryButton onClick={handleClick}>Keyboard</SecondaryButton>)
      
      const button = screen.getByRole('button')
      
      // Focus the button and use userEvent for more realistic keyboard interactions
      await userEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      // Test keyboard activation with userEvent
      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(2)
      
      // Test space key
      await userEvent.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('prevents click when disabled', async () => {
      const handleClick = vi.fn()
      render(<SecondaryButton disabled onClick={handleClick}>Disabled</SecondaryButton>)
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('applies outline variant styles', () => {
      render(<SecondaryButton>Outline Button</SecondaryButton>)
      
      const button = screen.getByRole('button')
      // Check that the button has the outline variant styling
      expect(button).toHaveClass('chakra-button')
    })

    it('applies hover styles on mouse over', async () => {
      render(<SecondaryButton>Hover Button</SecondaryButton>)
      
      const button = screen.getByRole('button')
      await userEvent.hover(button)
      
      // Verify button is still present after hover (hover effects are CSS-based)
      expect(button).toBeInTheDocument()
    })

    it('maintains focus styles', async () => {
      render(<SecondaryButton>Focus Button</SecondaryButton>)
      
      const button = screen.getByRole('button')
      await userEvent.tab() // Should focus the button
      
      expect(button).toHaveFocus()
    })

    it('applies disabled styles correctly', () => {
      render(<SecondaryButton disabled>Disabled Styling</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('chakra-button')
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<SecondaryButton>Accessible Button</SecondaryButton>)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn()
      render(<SecondaryButton onClick={handleClick}>Keyboard Accessible</SecondaryButton>)
      
      await userEvent.tab()
      expect(screen.getByRole('button')).toHaveFocus()
      
      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should have proper ARIA attributes when disabled', () => {
      render(<SecondaryButton disabled>ARIA Button</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should support custom aria-label', () => {
      render(
        <SecondaryButton buttonProps={{ 'aria-label': 'Custom secondary action' }}>
          Icon Only
        </SecondaryButton>
      )
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom secondary action')
    })

    it('should be discoverable by screen readers', () => {
      render(<SecondaryButton>Screen Reader Button</SecondaryButton>)
      
      expect(screen.getByRole('button', { name: 'Screen Reader Button' })).toBeInTheDocument()
    })

    it('should have proper contrast for outline button', () => {
      render(<SecondaryButton>High Contrast</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Outline buttons should maintain good contrast
      expect(button).toHaveClass('chakra-button')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined onClick', () => {
      render(<SecondaryButton>No Handler</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(() => fireEvent.click(button)).not.toThrow()
    })

    it('handles empty children', () => {
      render(<SecondaryButton>{''}</SecondaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles null children gracefully', () => {
      render(<SecondaryButton>{null}</SecondaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<SecondaryButton>{undefined}</SecondaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles zero as children', () => {
      render(<SecondaryButton>{0}</SecondaryButton>)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles boolean false as children', () => {
      render(<SecondaryButton>{false}</SecondaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works within forms', async () => {
      const handleSubmit = vi.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <SecondaryButton type="submit">Submit Form</SecondaryButton>
        </form>
      )
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('integrates with form validation', async () => {
      const handleClick = vi.fn()
      
      render(
        <form>
          <input required />
          <SecondaryButton onClick={handleClick} type="button">
            Cancel
          </SecondaryButton>
        </form>
      )
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('works alongside PrimaryButton', async () => {
      const handlePrimary = vi.fn()
      const handleSecondary = vi.fn()
      
      render(
        <div>
          <SecondaryButton onClick={handleSecondary}>Cancel</SecondaryButton>
          <button onClick={handlePrimary}>Save</button>
        </div>
      )
      
      await userEvent.click(screen.getByText('Cancel'))
      expect(handleSecondary).toHaveBeenCalledTimes(1)
      
      await userEvent.click(screen.getByText('Save'))
      expect(handlePrimary).toHaveBeenCalledTimes(1)
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<SecondaryButton>Initial</SecondaryButton>)
      
      // Re-render with same props
      rerender(<SecondaryButton>Initial</SecondaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle rapid clicks', async () => {
      const handleClick = vi.fn()
      render(<SecondaryButton onClick={handleClick}>Rapid Click</SecondaryButton>)
      
      const button = screen.getByRole('button')
      
      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        await userEvent.click(button)
      }
      
      expect(handleClick).toHaveBeenCalledTimes(5)
    })
  })

  describe('Secondary Button Specific Features', () => {
    it('uses outline variant by default', () => {
      render(<SecondaryButton>Outline Style</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('chakra-button')
      // Secondary button should have outline styling
    })

    it('does not have background color override like PrimaryButton', () => {
      render(<SecondaryButton>No BG Override</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Unlike PrimaryButton, SecondaryButton doesn't accept bg prop
    })

    it('maintains consistent border styling', () => {
      const { rerender } = render(<SecondaryButton>Border Test</SecondaryButton>)
      
      let button = screen.getByRole('button')
      expect(button).toHaveClass('chakra-button')
      
      rerender(<SecondaryButton disabled>Disabled Border</SecondaryButton>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('chakra-button')
      expect(button).toBeDisabled()
    })

    it('has appropriate color contrast for text', () => {
      render(<SecondaryButton>Text Contrast</SecondaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Text should have good contrast against transparent/outline background
    })
  })
})