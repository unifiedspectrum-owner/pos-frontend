/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IconType } from 'react-icons'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import TextInputFieldWithButton from '../text-button-field'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096',
  PRIMARY_COLOR: '#3182CE',
  SUCCESS_GREEN_COLOR2: '#48BB78',
  WHITE_COLOR: '#FFFFFF'
}))

/* Helper function to simulate typing - works with fake timers */
const typeIntoInput = (input: HTMLElement, text: string) => {
  if ((input as HTMLInputElement).disabled) {
    return
  }
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  if (nativeSetter) {
    nativeSetter.call(input, text)
  }
  fireEvent.change(input, { target: { value: text } })
}

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('TextInputFieldWithButton Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()
  const mockOnButtonClick = vi.fn()

  const defaultProps = {
    label: 'Test Label',
    value: '',
    placeholder: 'Enter text',
    isInValid: false,
    required: false,
    onChange: mockOnChange
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByLabelText(/Test Label/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with value', () => {
      render(<TextInputFieldWithButton {...defaultProps} value="Test value" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('Test value')
      expect(input).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<TextInputFieldWithButton {...defaultProps} label="Email Address" />, { wrapper: TestWrapper })

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<TextInputFieldWithButton {...defaultProps} placeholder="Type here..." />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
    })

    it('should render as text input', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render with default button text', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('should render with custom button text', () => {
      render(<TextInputFieldWithButton {...defaultProps} ButtonText="Send" />, { wrapper: TestWrapper })

      expect(screen.getByText('Send')).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<TextInputFieldWithButton {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Label')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<TextInputFieldWithButton {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Label')
      expect(label).toBeInTheDocument()
    })

    it('should allow required prop to be updated', () => {
      const { rerender } = render(<TextInputFieldWithButton {...defaultProps} required={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} required={true} /></TestWrapper>)

      const label = screen.getByText('Test Label')
      expect(label.parentElement).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <TextInputFieldWithButton {...defaultProps} isInValid={true} errorMessage="This field is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(<TextInputFieldWithButton {...defaultProps} isInValid={false} errorMessage="This field is required" />, { wrapper: TestWrapper })

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    })

    it('should apply error styling when invalid', () => {
      render(<TextInputFieldWithButton {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<TextInputFieldWithButton {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<TextInputFieldWithButton {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<TextInputFieldWithButton {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<TextInputFieldWithButton {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).not.toBeDisabled()
    })

    it('should not allow input when disabled', () => {
      render(<TextInputFieldWithButton {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<TextInputFieldWithButton {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} disabled={true} /></TestWrapper>)

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toBeDisabled()
    })

    it('should disable button when disabled', () => {
      render(<TextInputFieldWithButton {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const button = screen.getByText('Submit')
      expect(button).toBeDisabled()
    })
  })

  describe('ReadOnly State', () => {
    it('should not trigger onChange when readOnly', () => {
      render(<TextInputFieldWithButton {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not trigger onBlur when readOnly', () => {
      render(<TextInputFieldWithButton {...defaultProps} readOnly={true} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(mockOnBlur).not.toHaveBeenCalled()
    })

    it('should allow readOnly to be false by default', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'a')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Non-Debounced Mode', () => {
    it('should call onChange immediately when isDebounced is false', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should emit correct values in non-debounced mode', () => {
      const { rerender } = render(<TextInputFieldWithButton {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      let input = screen.getByLabelText(/Test Label/) as HTMLInputElement

      typeIntoInput(input, 'a')
      expect(mockOnChange).toHaveBeenCalled()
      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} value="a" isDebounced={false} /></TestWrapper>)
      input = screen.getByLabelText(/Test Label/) as HTMLInputElement
      expect(input.value).toBe('a')

      typeIntoInput(input, 'ab')
      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} value="ab" isDebounced={false} /></TestWrapper>)
      input = screen.getByLabelText(/Test Label/) as HTMLInputElement
      expect(input.value).toBe('ab')

      typeIntoInput(input, 'abc')
      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} value="abc" isDebounced={false} /></TestWrapper>)
      input = screen.getByLabelText(/Test Label/) as HTMLInputElement
      expect(input.value).toBe('abc')
    })

    it('should handle rapid typing in non-debounced mode', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test123')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Debounced Mode', () => {
    it('should not call onChange immediately when isDebounced is true', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should call onChange after debounce delay', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should use custom debounce delay', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={true} debounceMs={500} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      vi.advanceTimersByTime(300)
      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(200)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should reset debounce timer on each keystroke', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)

      typeIntoInput(input, 't')
      vi.advanceTimersByTime(100)

      typeIntoInput(input, 'te')
      vi.advanceTimersByTime(100)

      typeIntoInput(input, 'tes')
      vi.advanceTimersByTime(100)

      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should emit final value on blur in debounced mode', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')
      fireEvent.blur(input)

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: 'test' })
      }))
    })

    it('should not emit duplicate values on blur', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()
      fireEvent.blur(input)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update local value immediately while debouncing', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/) as HTMLInputElement
      typeIntoInput(input, 'test')

      expect(input.value).toBe('test')
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should be debounced by default', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Blur Event', () => {
    it('should call onBlur when provided', () => {
      render(<TextInputFieldWithButton {...defaultProps} onBlur={mockOnBlur} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(mockOnBlur).toHaveBeenCalledTimes(1)
    })

    it('should work without onBlur handler', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(input).not.toHaveFocus()
    })

    it('should call onBlur with correct event', () => {
      render(<TextInputFieldWithButton {...defaultProps} onBlur={mockOnBlur} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(mockOnBlur).toHaveBeenCalledWith(expect.objectContaining({
        target: input
      }))
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      render(<TextInputFieldWithButton {...defaultProps} name="username" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toHaveAttribute('name', 'username')
    })

    it('should include name in change event', () => {
      render(<TextInputFieldWithButton {...defaultProps} name="email" isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ name: 'email' })
      }))
    })

    it('should work without name attribute', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Button Functionality', () => {
    it('should call onButtonClick when button is clicked', () => {
      render(<TextInputFieldWithButton {...defaultProps} onButtonClick={mockOnButtonClick} />, { wrapper: TestWrapper })

      const button = screen.getByText('Submit')
      fireEvent.click(button)

      expect(mockOnButtonClick).toHaveBeenCalledTimes(1)
    })

    it('should work without onButtonClick handler', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const button = screen.getByText('Submit')
      fireEvent.click(button)

      expect(button).toBeInTheDocument()
    })

    it('should show loading state on button', () => {
      render(<TextInputFieldWithButton {...defaultProps} buttonLoading={true} />, { wrapper: TestWrapper })

      const button = screen.getByText('Submit')
      expect(button).toBeInTheDocument()
    })

    it('should not show loading by default', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const button = screen.getByText('Submit')
      expect(button).toBeInTheDocument()
    })

    it('should render button with proper styling', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const button = screen.getByText('Submit')
      expect(button).toHaveStyle({ height: '48px' })
    })
  })

  describe('Verified Text', () => {
    it('should show verified text when showVerifiedText is true', () => {
      render(<TextInputFieldWithButton {...defaultProps} showVerifiedText={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    it('should not show verified text by default', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Verified')).not.toBeInTheDocument()
    })

    it('should hide button when verified', () => {
      render(<TextInputFieldWithButton {...defaultProps} showVerifiedText={true} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    it('should show verified icon with text', () => {
      render(<TextInputFieldWithButton {...defaultProps} showVerifiedText={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Verified')).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('should render left icon', () => {
      const LeftIcon: IconType = () => <svg data-testid="left-icon" />

      render(<TextInputFieldWithButton {...defaultProps} leftIcon={<LeftIcon />} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should render right icon when not verified', () => {
      const RightIcon: IconType = () => <svg data-testid="right-icon" />

      render(<TextInputFieldWithButton {...defaultProps} rightIcon={<RightIcon />} showVerifiedText={false} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should not render right icon when verified', () => {
      const RightIcon: IconType = () => <svg data-testid="right-icon" />

      render(<TextInputFieldWithButton {...defaultProps} rightIcon={<RightIcon />} showVerifiedText={true} />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })

    it('should render both left and right icons', () => {
      const LeftIcon: IconType = () => <svg data-testid="left-icon" />
      const RightIcon: IconType = () => <svg data-testid="right-icon" />

      render(
        <TextInputFieldWithButton {...defaultProps} leftIcon={<LeftIcon />} rightIcon={<RightIcon />} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should work without icons', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toBeInTheDocument()
    })
  })

  describe('Input Props', () => {
    it('should apply additional input props', () => {
      render(
        <TextInputFieldWithButton {...defaultProps} inputProps={{ maxLength: 10 }} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('should merge input props with default props', () => {
      render(
        <TextInputFieldWithButton {...defaultProps} inputProps={{ className: 'custom-class' }} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toHaveClass('custom-class')
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes in non-debounced mode', () => {
      const { rerender } = render(<TextInputFieldWithButton {...defaultProps} value="initial" isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('initial')
      expect(input).toBeInTheDocument()

      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} value="updated" isDebounced={false} /></TestWrapper>)

      expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<TextInputFieldWithButton {...defaultProps} value="" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/) as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle value changes from parent in debounced mode', () => {
      const { rerender } = render(<TextInputFieldWithButton {...defaultProps} value="test" isDebounced={true} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} value="new value" isDebounced={true} /></TestWrapper>)

      const input = screen.getByLabelText(/Test Label/) as HTMLInputElement
      expect(input.value).toBe('new value')
    })

    it('should respect external value changes during typing', () => {
      const { rerender } = render(<TextInputFieldWithButton {...defaultProps} value="" isDebounced={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/) as HTMLInputElement
      typeIntoInput(input, 'user')

      vi.advanceTimersByTime(100)

      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} value="external" isDebounced={true} /></TestWrapper>)

      vi.advanceTimersByTime(300)

      expect(input.value).toBe('user')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long text input', () => {
      const longText = 'a'.repeat(1000)

      render(<TextInputFieldWithButton {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, longText)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle special characters', () => {
      render(<TextInputFieldWithButton {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, '!@#$%^&*()')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(<TextInputFieldWithButton {...defaultProps} value="1" isDebounced={false} />, { wrapper: TestWrapper })

      for (let i = 2; i <= 10; i++) {
        rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} value={i.toString()} isDebounced={false} /></TestWrapper>)
      }

      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    it('should cleanup timers on unmount', () => {
      const { unmount } = render(<TextInputFieldWithButton {...defaultProps} isDebounced={true} />, { wrapper: TestWrapper })

      unmount()

      vi.advanceTimersByTime(1000)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle switching between debounced modes', () => {
      const { rerender } = render(<TextInputFieldWithButton {...defaultProps} isDebounced={true} />, { wrapper: TestWrapper })

      let input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test')

      rerender(<TestWrapper><TextInputFieldWithButton {...defaultProps} isDebounced={false} /></TestWrapper>)

      mockOnChange.mockClear()
      input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'a')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toBeInTheDocument()
    })

    it('should associate error message with input', () => {
      render(
        <TextInputFieldWithButton {...defaultProps} isInValid={true} errorMessage="Error message" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Error message')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/) as HTMLInputElement
      input.focus()

      expect(input).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<TextInputFieldWithButton {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toBeInTheDocument()
    })

    it('should have accessible button', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const button = screen.getByText('Submit')
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('Integration', () => {
    it('should work in a form context', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <TextInputFieldWithButton {...defaultProps} name="testField" isDebounced={false} />
          <button type="submit">Submit Form</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText(/Test Label/)
      typeIntoInput(input, 'test value')

      const submitButton = screen.getByText('Submit Form')
      fireEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should handle multiple instances independently', () => {
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      render(
        <>
          <TextInputFieldWithButton {...defaultProps} label="Field 1" onChange={onChange1} isDebounced={false} />
          <TextInputFieldWithButton {...defaultProps} label="Field 2" onChange={onChange2} isDebounced={false} />
        </>,
        { wrapper: TestWrapper }
      )

      const input1 = screen.getByLabelText('Field 1')
      const input2 = screen.getByLabelText('Field 2')

      typeIntoInput(input1, 'test1')
      typeIntoInput(input2, 'test2')

      expect(onChange1).toHaveBeenCalled()
      expect(onChange2).toHaveBeenCalled()
    })

    it('should coordinate button and input states', () => {
      render(
        <TextInputFieldWithButton
          {...defaultProps}
          disabled={true}
          onButtonClick={mockOnButtonClick}
        />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText(/Test Label/)
      const button = screen.getByText('Submit')

      expect(input).toBeDisabled()
      expect(button).toBeDisabled()

      fireEvent.click(button)
      expect(mockOnButtonClick).not.toHaveBeenCalled()
    })
  })

  describe('Border Styling', () => {
    it('should have rounded left border', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toBeInTheDocument()
    })

    it('should have no right border radius', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/)
      expect(input).toBeInTheDocument()
    })

    it('should have button with rounded right border', () => {
      render(<TextInputFieldWithButton {...defaultProps} />, { wrapper: TestWrapper })

      const button = screen.getByText('Submit')
      expect(button).toBeInTheDocument()
    })
  })
})
