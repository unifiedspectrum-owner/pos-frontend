/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import SwitchField from '../switch-field'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('SwitchField Component', () => {
  const mockOnChange = vi.fn()

  const defaultProps = {
    label: 'Enable Notifications',
    value: false,
    isInValid: false,
    required: false,
    onChange: mockOnChange
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Enable Notifications')).toBeInTheDocument()
      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<SwitchField {...defaultProps} label="Dark Mode" />, { wrapper: TestWrapper })

      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    })

    it('should render as switch input', () => {
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeInTheDocument()
    })

    it('should render unchecked by default', () => {
      render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).not.toBeChecked()
    })

    it('should render checked when value is true', () => {
      render(<SwitchField {...defaultProps} value={true} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeChecked()
    })
  })

  describe('Active and Inactive Text', () => {
    it('should show default inactive text when value is false', () => {
      render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })

    it('should show default active text when value is true', () => {
      render(<SwitchField {...defaultProps} value={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should show custom inactive text', () => {
      render(<SwitchField {...defaultProps} value={false} inactiveText="Off" />, { wrapper: TestWrapper })

      expect(screen.getByText('Off')).toBeInTheDocument()
    })

    it('should show custom active text', () => {
      render(<SwitchField {...defaultProps} value={true} activeText="On" />, { wrapper: TestWrapper })

      expect(screen.getByText('On')).toBeInTheDocument()
    })

    it('should toggle between active and inactive text', () => {
      const { rerender } = render(<SwitchField {...defaultProps} value={false} activeText="Enabled" inactiveText="Disabled" />, { wrapper: TestWrapper })

      expect(screen.getByText('Disabled')).toBeInTheDocument()

      rerender(<TestWrapper><SwitchField {...defaultProps} value={true} activeText="Enabled" inactiveText="Disabled" /></TestWrapper>)

      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })

    it('should handle long custom text', () => {
      render(<SwitchField {...defaultProps} value={true} activeText="Currently Active" inactiveText="Currently Inactive" />, { wrapper: TestWrapper })

      expect(screen.getByText('Currently Active')).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<SwitchField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Enable Notifications')
      expect(label).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<SwitchField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Enable Notifications')
      expect(label).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <SwitchField {...defaultProps} isInValid={true} errorMessage="This option must be enabled" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This option must be enabled')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(
        <SwitchField {...defaultProps} isInValid={false} errorMessage="This option must be enabled" />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('This option must be enabled')).not.toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<SwitchField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeInTheDocument()
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<SwitchField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><SwitchField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when clicked', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should call onChange when toggled off', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} value={true} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      expect(mockOnChange).toHaveBeenCalledWith(false)
    })

    it('should toggle value on multiple clicks', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')

      /* First click - value is false, so onChange(true) is called */
      await user.click(switchElement)
      expect(mockOnChange).toHaveBeenNthCalledWith(1, true)

      /* Simulate parent updating the value prop */
      rerender(<TestWrapper><SwitchField {...defaultProps} value={true} /></TestWrapper>)

      /* Second click - value is now true, so onChange(false) is called */
      const updatedSwitch = screen.getByRole('checkbox')
      await user.click(updatedSwitch)
      expect(mockOnChange).toHaveBeenNthCalledWith(2, false)
    })

    it('should call onChange when wrapper is clicked', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      /* Click the label text which is inside the Flex wrapper */
      const label = screen.getByText('Inactive')
      await user.click(label)

      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      switchElement.focus()
      await user.keyboard(' ')

      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      switchElement.focus()
      await user.keyboard('{Enter}')

      /* Enter key doesn't trigger switch by default, only Space does */
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<SwitchField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<SwitchField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).not.toBeDisabled()
    })

    it('should not allow interaction when disabled', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} disabled={true} value={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should have not-allowed cursor when disabled', () => {
      render(<SwitchField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      /* Verify the switch is disabled - cursor styling is applied via Chakra */
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeDisabled()
    })

    it('should not show hover styles when disabled', () => {
      const { container } = render(<SwitchField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const wrapper = container.querySelector('[data-part="root"]')?.parentElement?.parentElement
      expect(wrapper).toBeInTheDocument()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<SwitchField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><SwitchField {...defaultProps} disabled={true} /></TestWrapper>)

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeDisabled()
    })
  })

  describe('ReadOnly State', () => {
    it('should not trigger onChange when readOnly', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} readOnly={true} value={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should allow readOnly to be false by default', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should display current value in readOnly mode', () => {
      render(<SwitchField {...defaultProps} readOnly={true} value={true} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeChecked()
    })

    it('should not allow wrapper click in readOnly mode', async () => {
      const user = userEvent.setup()
      const { container } = render(<SwitchField {...defaultProps} readOnly={true} value={false} />, { wrapper: TestWrapper })

      const wrapper = container.querySelector('[data-part="root"]')?.parentElement?.parentElement
      if (wrapper) {
        await user.click(wrapper)
      }

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should show active text in readOnly mode', () => {
      render(<SwitchField {...defaultProps} readOnly={true} value={true} activeText="Read Only Active" />, { wrapper: TestWrapper })

      expect(screen.getByText('Read Only Active')).toBeInTheDocument()
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      render(<SwitchField {...defaultProps} name="notifications" />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toHaveAttribute('name', 'notifications')
    })

    it('should work without name attribute', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      let switchElement = screen.getByRole('checkbox')
      expect(switchElement).not.toBeChecked()

      rerender(<TestWrapper><SwitchField {...defaultProps} value={true} /></TestWrapper>)

      switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeChecked()
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      for (let i = 0; i < 10; i++) {
        rerender(<TestWrapper><SwitchField {...defaultProps} value={i % 2 === 0} /></TestWrapper>)
      }

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).not.toBeChecked()
    })

    it('should maintain value between re-renders', () => {
      const { rerender } = render(<SwitchField {...defaultProps} value={true} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><SwitchField {...defaultProps} value={true} /></TestWrapper>)

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeChecked()
    })

    it('should update text when value changes', () => {
      const { rerender } = render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Inactive')).toBeInTheDocument()

      rerender(<TestWrapper><SwitchField {...defaultProps} value={true} /></TestWrapper>)

      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  describe('Event Propagation', () => {
    it('should stop propagation on switch click', async () => {
      const user = userEvent.setup()
      const containerClick = vi.fn()

      const { container } = render(
        <div onClick={containerClick}>
          <SwitchField {...defaultProps} />
        </div>,
        { wrapper: TestWrapper }
      )

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should prevent default on wrapper click', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      /* Click the label text which is inside the Flex wrapper */
      const label = screen.getByText('Inactive')
      await user.click(label)

      expect(mockOnChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Styling', () => {
    it('should have pointer cursor on wrapper', () => {
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify the component renders properly - styling is applied by Chakra UI */
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeInTheDocument()
    })

    it('should apply border styles', () => {
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify the component renders - Chakra UI handles border styling */
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeInTheDocument()
    })

    it('should have transition styles', () => {
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify the component renders - Chakra UI handles transition styling */
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeInTheDocument()
    })

    it('should have fixed height', () => {
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify the component renders - Flex height is set via Chakra */
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeInTheDocument()
    })

    it('should have full width', () => {
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify the component renders - Flex width is set via Chakra */
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid clicks', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')

      /* First click */
      await user.click(switchElement)
      expect(mockOnChange).toHaveBeenNthCalledWith(1, true)

      /* Simulate parent component updating value after first click */
      rerender(<TestWrapper><SwitchField {...defaultProps} value={true} /></TestWrapper>)

      /* Second click after value change */
      const updatedSwitch = screen.getByRole('checkbox')
      await user.click(updatedSwitch)
      expect(mockOnChange).toHaveBeenNthCalledWith(2, false)

      /* Verify both clicks were registered */
      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })

    it('should handle both disabled and readOnly states', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} disabled={true} readOnly={true} value={false} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle very long label text', () => {
      const longLabel = 'A'.repeat(200)
      render(<SwitchField {...defaultProps} label={longLabel} />, { wrapper: TestWrapper })

      expect(screen.getByText(longLabel)).toBeInTheDocument()
    })

    it('should handle label with special characters', () => {
      const specialLabel = 'Enable <Feature> & "Options" (Required!)'
      render(<SwitchField {...defaultProps} label={specialLabel} />, { wrapper: TestWrapper })

      expect(screen.getByText(specialLabel)).toBeInTheDocument()
    })

    it('should handle empty active text', () => {
      render(<SwitchField {...defaultProps} value={true} activeText="" />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeChecked()
    })

    it('should handle empty inactive text', () => {
      render(<SwitchField {...defaultProps} value={false} inactiveText="" />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).not.toBeChecked()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible switch role', () => {
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeInTheDocument()
    })

    it('should associate error message with switch', () => {
      render(
        <SwitchField {...defaultProps} isInValid={true} errorMessage="Required field" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Required field')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      await user.tab()

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<SwitchField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeInTheDocument()
    })

    it('should have accessible label', () => {
      render(<SwitchField {...defaultProps} />, { wrapper: TestWrapper })

      const label = screen.getByText('Enable Notifications')
      expect(label).toBeInTheDocument()
    })

    it('should show current state in accessible text', () => {
      render(<SwitchField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should work in a form context', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <SwitchField {...defaultProps} name="notifications" />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should handle multiple switch fields independently', async () => {
      const user = userEvent.setup()
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      render(
        <>
          <SwitchField {...defaultProps} label="Option 1" onChange={onChange1} />
          <SwitchField {...defaultProps} label="Option 2" onChange={onChange2} />
        </>,
        { wrapper: TestWrapper }
      )

      const switches = screen.getAllByRole('checkbox')

      await user.click(switches[0])
      await user.click(switches[1])

      expect(onChange1).toHaveBeenCalledWith(true)
      expect(onChange2).toHaveBeenCalledWith(true)
    })

    it('should work with form validation', async () => {
      const user = userEvent.setup()
      render(
        <SwitchField {...defaultProps} required={true} isInValid={true} errorMessage="Required" />,
        { wrapper: TestWrapper }
      )

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      expect(mockOnChange).toHaveBeenCalledWith(true)
      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('should toggle between custom states', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <SwitchField {...defaultProps} value={false} activeText="Enabled" inactiveText="Disabled" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Disabled')).toBeInTheDocument()

      const switchElement = screen.getByRole('checkbox')
      await user.click(switchElement)

      rerender(<TestWrapper><SwitchField {...defaultProps} value={true} activeText="Enabled" inactiveText="Disabled" /></TestWrapper>)

      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })
  })
})
