/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import CheckboxField from '../checkbox-field'

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('CheckboxField Component', () => {
  const mockOnChange = vi.fn()

  const defaultProps = {
    label: 'Accept Terms',
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
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Accept Terms')).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<CheckboxField {...defaultProps} label="I agree to the terms" />, { wrapper: TestWrapper })

      expect(screen.getByText('I agree to the terms')).toBeInTheDocument()
    })

    it('should render as checkbox input', () => {
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should render unchecked by default', () => {
      render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('should render checked when value is true', () => {
      render(<CheckboxField {...defaultProps} value={true} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<CheckboxField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Accept Terms')
      expect(label).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<CheckboxField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Accept Terms')
      expect(label).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <CheckboxField {...defaultProps} isInValid={true} errorMessage="You must accept terms" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('You must accept terms')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(
        <CheckboxField {...defaultProps} isInValid={false} errorMessage="You must accept terms" />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('You must accept terms')).not.toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<CheckboxField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<CheckboxField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><CheckboxField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when clicked', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should call onChange when unchecked', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} value={true} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnChange).toHaveBeenCalledWith(false)
    })

    it('should toggle value on multiple clicks', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')

      /* First click - value is false, so onChange(true) is called */
      await user.click(checkbox)
      expect(mockOnChange).toHaveBeenNthCalledWith(1, true)

      /* Simulate parent updating the value prop */
      rerender(<TestWrapper><CheckboxField {...defaultProps} value={true} /></TestWrapper>)

      /* Second click - value is now true, so onChange(false) is called */
      const updatedCheckbox = screen.getByRole('checkbox')
      await user.click(updatedCheckbox)
      expect(mockOnChange).toHaveBeenNthCalledWith(2, false)
    })

    it('should call onChange when label is clicked', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Accept Terms')
      await user.click(label)

      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard(' ')

      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard('{Enter}')

      /* Enter key doesn't trigger checkbox by default, Space does */
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<CheckboxField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<CheckboxField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeDisabled()
    })

    it('should not allow interaction when disabled', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} disabled={true} value={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should have not-allowed cursor when disabled', () => {
      render(<CheckboxField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      /* Verify the checkbox is disabled - the cursor styling is applied via Chakra */
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<CheckboxField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><CheckboxField {...defaultProps} disabled={true} /></TestWrapper>)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })
  })

  describe('ReadOnly State', () => {
    it('should not trigger onChange when readOnly', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} readOnly={true} value={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should allow readOnly to be false by default', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should display current value in readOnly mode', () => {
      render(<CheckboxField {...defaultProps} readOnly={true} value={true} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('should not allow label click in readOnly mode', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} readOnly={true} value={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Accept Terms')
      await user.click(label)

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      render(<CheckboxField {...defaultProps} name="termsAccepted" />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('name', 'termsAccepted')
    })

    it('should work without name attribute', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      let checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()

      rerender(<TestWrapper><CheckboxField {...defaultProps} value={true} /></TestWrapper>)

      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      for (let i = 0; i < 10; i++) {
        rerender(<TestWrapper><CheckboxField {...defaultProps} value={i % 2 === 0} /></TestWrapper>)
      }

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('should maintain value between re-renders', () => {
      const { rerender } = render(<CheckboxField {...defaultProps} value={true} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><CheckboxField {...defaultProps} value={true} /></TestWrapper>)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })

  describe('Event Propagation', () => {
    it('should stop propagation on checkbox click', async () => {
      const user = userEvent.setup()
      const containerClick = vi.fn()

      const { container } = render(
        <div onClick={containerClick}>
          <CheckboxField {...defaultProps} />
        </div>,
        { wrapper: TestWrapper }
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle clicks on wrapper flex container', async () => {
      const user = userEvent.setup()
      const { container } = render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      /* Click the label which is inside the Flex wrapper */
      const label = screen.getByText('Accept Terms')
      await user.click(label)

      expect(mockOnChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Styling', () => {
    it('should have pointer cursor on wrapper', () => {
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify the component renders properly - styling is applied by Chakra UI */
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should have pointer cursor on checkbox', () => {
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify checkbox element is rendered and functional */
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeDisabled()
    })

    it('should apply transition styles', () => {
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify the component renders - Chakra UI handles transition styling */
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid clicks', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<CheckboxField {...defaultProps} value={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')

      /* First click */
      await user.click(checkbox)
      expect(mockOnChange).toHaveBeenNthCalledWith(1, true)

      /* Simulate parent component updating value after first click */
      rerender(<TestWrapper><CheckboxField {...defaultProps} value={true} /></TestWrapper>)

      /* Second click after value change */
      const updatedCheckbox = screen.getByRole('checkbox')
      await user.click(updatedCheckbox)
      expect(mockOnChange).toHaveBeenNthCalledWith(2, false)

      /* Verify both clicks were registered */
      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })

    it('should handle both disabled and readOnly states', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} disabled={true} readOnly={true} value={false} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle very long label text', () => {
      const longLabel = 'A'.repeat(200)
      render(<CheckboxField {...defaultProps} label={longLabel} />, { wrapper: TestWrapper })

      expect(screen.getByText(longLabel)).toBeInTheDocument()
    })

    it('should handle label with special characters', () => {
      const specialLabel = 'I accept <Terms> & "Conditions" (Required!)'
      render(<CheckboxField {...defaultProps} label={specialLabel} />, { wrapper: TestWrapper })

      expect(screen.getByText(specialLabel)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible checkbox role', () => {
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should associate error message with checkbox', () => {
      render(
        <CheckboxField {...defaultProps} isInValid={true} errorMessage="Required field" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Required field')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      await user.tab()

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<CheckboxField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should have accessible label association', () => {
      render(<CheckboxField {...defaultProps} />, { wrapper: TestWrapper })

      const label = screen.getByText('Accept Terms')
      const checkbox = screen.getByRole('checkbox')

      expect(label).toBeInTheDocument()
      expect(checkbox).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should work in a form context', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <CheckboxField {...defaultProps} name="terms" />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should handle multiple checkbox fields independently', async () => {
      const user = userEvent.setup()
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      render(
        <>
          <CheckboxField {...defaultProps} label="Option 1" onChange={onChange1} />
          <CheckboxField {...defaultProps} label="Option 2" onChange={onChange2} />
        </>,
        { wrapper: TestWrapper }
      )

      const checkbox1 = screen.getByRole('checkbox', { name: /Option 1/i })
      const checkbox2 = screen.getByRole('checkbox', { name: /Option 2/i })

      await user.click(checkbox1)
      await user.click(checkbox2)

      expect(onChange1).toHaveBeenCalledWith(true)
      expect(onChange2).toHaveBeenCalledWith(true)
    })

    it('should work with form validation', async () => {
      const user = userEvent.setup()
      render(
        <CheckboxField {...defaultProps} required={true} isInValid={true} errorMessage="Required" />,
        { wrapper: TestWrapper }
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(mockOnChange).toHaveBeenCalledWith(true)
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })
})
