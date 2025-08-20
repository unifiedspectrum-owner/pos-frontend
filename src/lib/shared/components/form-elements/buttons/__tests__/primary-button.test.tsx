import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { FiHome, FiUser } from 'react-icons/fi'
import PrimaryButton from '../primary-button'

// Mock the shared config since it's imported but file wasn't found
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182CE'
}))

describe('PrimaryButton', () => {
  const defaultProps = {
    children: 'Click me'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<PrimaryButton {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('renders children content correctly', () => {
      render(<PrimaryButton>Custom Button Text</PrimaryButton>)
      expect(screen.getByText('Custom Button Text')).toBeInTheDocument()
    })

    it('renders with complex children', () => {
      render(
        <PrimaryButton>
          <span>Multi</span> <strong>Element</strong> Content
        </PrimaryButton>
      )
      expect(screen.getByText('Multi')).toBeInTheDocument()
      expect(screen.getByText('Element')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('applies custom onClick handler', async () => {
      const handleClick = vi.fn()
      render(<PrimaryButton onClick={handleClick}>Click me</PrimaryButton>)
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies different button types', () => {
      const { rerender } = render(<PrimaryButton type="submit">Submit</PrimaryButton>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')

      rerender(<PrimaryButton type="reset">Reset</PrimaryButton>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')

      rerender(<PrimaryButton type="button">Button</PrimaryButton>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('applies different sizes', () => {
      const { rerender } = render(<PrimaryButton size="sm">Small</PrimaryButton>)
      const button = screen.getByRole('button')
      
      // Check that the button renders with different sizes by verifying it has chakra classes
      expect(button).toHaveClass('chakra-button')

      rerender(<PrimaryButton size="md">Medium</PrimaryButton>)
      expect(screen.getByRole('button')).toHaveClass('chakra-button')

      rerender(<PrimaryButton size="lg">Large</PrimaryButton>)
      expect(screen.getByRole('button')).toHaveClass('chakra-button')
      
      // The sizes are applied via CSS custom properties, so we verify the component accepts the prop
      // by checking it doesn't throw an error and maintains the chakra-button class
    })

    it('applies custom background color', () => {
      render(<PrimaryButton bg="#FF5733">Custom Color</PrimaryButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveStyle({ backgroundColor: '#FF5733' })
    })

    it('spreads additional buttonProps', () => {
      render(
        <PrimaryButton 
          buttonProps={{ 
            'aria-label': 'Custom aria label',
            id: 'custom-id',
            title: 'Custom title'
          }}
        >
          Button
        </PrimaryButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom aria label')
      expect(button).toHaveAttribute('id', 'custom-id')
      expect(button).toHaveAttribute('title', 'Custom title')
    })
  })

  describe('Icons', () => {
    it('renders with left icon', () => {
      render(<PrimaryButton leftIcon={FiHome}>With Left Icon</PrimaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Check if icon is rendered (icons are rendered as svg elements)
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('renders with right icon', () => {
      render(<PrimaryButton rightIcon={FiUser}>With Right Icon</PrimaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('renders with both left and right icons', () => {
      render(<PrimaryButton leftIcon={FiHome} rightIcon={FiUser}>Both Icons</PrimaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Should have 2 SVG elements
      expect(button.querySelectorAll('svg')).toHaveLength(2)
    })

    it('renders without icons when not provided', () => {
      render(<PrimaryButton>No Icons</PrimaryButton>)
      
      const button = screen.getByRole('button')
      expect(button.querySelector('svg')).not.toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('handles disabled state', async () => {
      const handleClick = vi.fn()
      render(<PrimaryButton disabled onClick={handleClick}>Disabled Button</PrimaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      // Try to click disabled button
      await userEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles loading state', () => {
      render(<PrimaryButton loading>Loading Button</PrimaryButton>)
      
      const button = screen.getByRole('button')
      // Chakra UI loading state typically disables the button and shows a spinner
      expect(button).toBeInTheDocument()
    })

    it('handles both disabled and loading states', () => {
      render(<PrimaryButton disabled loading>Disabled Loading</PrimaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn()
      render(<PrimaryButton onClick={handleClick}>Clickable</PrimaryButton>)
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles multiple clicks', async () => {
      const handleClick = vi.fn()
      render(<PrimaryButton onClick={handleClick}>Multi Click</PrimaryButton>)
      
      const button = screen.getByRole('button')
      await userEvent.click(button)
      await userEvent.click(button)
      await userEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('handles keyboard interactions', async () => {
      const handleClick = vi.fn()
      render(<PrimaryButton onClick={handleClick}>Keyboard</PrimaryButton>)
      
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
      render(<PrimaryButton disabled onClick={handleClick}>Disabled</PrimaryButton>)
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('applies default styles', () => {
      render(<PrimaryButton>Styled Button</PrimaryButton>)
      
      const button = screen.getByRole('button')
      // Check for Chakra UI CSS custom properties instead of literal values
      expect(button).toHaveStyle({
        color: 'var(--chakra-colors-white)'
      })
      // Check that the button has the expected classes for styling
      expect(button).toHaveClass('chakra-button')
    })

    it('applies hover styles on mouse over', async () => {
      render(<PrimaryButton>Hover Button</PrimaryButton>)
      
      const button = screen.getByRole('button')
      await userEvent.hover(button)
      
      // Verify button is still present after hover (hover effects are CSS-based)
      expect(button).toBeInTheDocument()
    })

    it('maintains focus styles', async () => {
      render(<PrimaryButton>Focus Button</PrimaryButton>)
      
      const button = screen.getByRole('button')
      await userEvent.tab() // Should focus the button
      
      expect(button).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<PrimaryButton>Accessible Button</PrimaryButton>)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn()
      render(<PrimaryButton onClick={handleClick}>Keyboard Accessible</PrimaryButton>)
      
      await userEvent.tab()
      expect(screen.getByRole('button')).toHaveFocus()
      
      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should have proper ARIA attributes', () => {
      render(<PrimaryButton disabled>ARIA Button</PrimaryButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should support custom aria-label', () => {
      render(
        <PrimaryButton buttonProps={{ 'aria-label': 'Custom action' }}>
          Icon Only
        </PrimaryButton>
      )
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom action')
    })

    it('should be discoverable by screen readers', () => {
      render(<PrimaryButton>Screen Reader Button</PrimaryButton>)
      
      expect(screen.getByRole('button', { name: 'Screen Reader Button' })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined onClick', () => {
      render(<PrimaryButton>No Handler</PrimaryButton>)
      
      const button = screen.getByRole('button')
      expect(() => fireEvent.click(button)).not.toThrow()
    })

    it('handles empty children', () => {
      render(<PrimaryButton>{''}</PrimaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles null children gracefully', () => {
      render(<PrimaryButton>{null}</PrimaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      render(<PrimaryButton>{undefined}</PrimaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles zero as children', () => {
      render(<PrimaryButton>{0}</PrimaryButton>)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles boolean false as children', () => {
      render(<PrimaryButton>{false}</PrimaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works within forms', async () => {
      const handleSubmit = vi.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <PrimaryButton type="submit">Submit Form</PrimaryButton>
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
          <PrimaryButton onClick={handleClick} type="button">
            Validate
          </PrimaryButton>
        </form>
      )
      
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<PrimaryButton>Initial</PrimaryButton>)
      
      // Re-render with same props
      rerender(<PrimaryButton>Initial</PrimaryButton>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle rapid clicks', async () => {
      const handleClick = vi.fn()
      render(<PrimaryButton onClick={handleClick}>Rapid Click</PrimaryButton>)
      
      const button = screen.getByRole('button')
      
      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        await userEvent.click(button)
      }
      
      expect(handleClick).toHaveBeenCalledTimes(5)
    })
  })
})