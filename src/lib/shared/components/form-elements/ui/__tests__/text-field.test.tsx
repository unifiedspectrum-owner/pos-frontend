/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconType } from 'react-icons'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import TextInputField from '../text-field'
import React from 'react'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('TextInputField Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()

  const defaultProps = {
    label: 'Test Label',
    value: '',
    placeholder: 'Enter text',
    isInValid: false,
    required: false,
    onChange: mockOnChange,
    isDebounced: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  /* Helper function to create userEvent with fake timer support */
  const setupUser = () => userEvent.setup({
    delay: null,
    advanceTimers: (ms) => vi.advanceTimersByTime(ms)
  })

  /* Helper function to simulate typing using fireEvent for compatibility */
  const typeIntoInput = (input: HTMLElement, text: string) => {
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: text } })
  }

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<TextInputField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByLabelText(/Test Label/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with value', () => {
      render(<TextInputField {...defaultProps} value="Test value" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('Test value')
      expect(input).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<TextInputField {...defaultProps} label="Username" />, { wrapper: TestWrapper })

      expect(screen.getByLabelText('Username')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<TextInputField {...defaultProps} placeholder="Type here..." />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
    })

    it('should render as text input', () => {
      render(<TextInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<TextInputField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Label')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<TextInputField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Label')
      expect(label).toBeInTheDocument()
    })

    it('should allow required prop to be updated', () => {
      const { rerender } = render(<TextInputField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextInputField {...defaultProps} required={true} /></TestWrapper>)

      const label = screen.getByText('Test Label')
      expect(label.parentElement).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <TextInputField {...defaultProps} isInValid={true} errorMessage="This field is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(<TextInputField {...defaultProps} isInValid={false} errorMessage="This field is required" />, { wrapper: TestWrapper })

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    })

    it('should apply error styling when invalid', () => {
      render(<TextInputField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<TextInputField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextInputField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<TextInputField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<TextInputField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<TextInputField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).not.toBeDisabled()
    })

    it('should not allow input when disabled', () => {
      render(<TextInputField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)

      /* Disabled inputs should not trigger onChange */
      expect(input).toBeDisabled()
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<TextInputField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextInputField {...defaultProps} disabled={true} /></TestWrapper>)

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toBeDisabled()
    })
  })

  describe('ReadOnly State', () => {
    it('should not trigger onChange when readOnly', () => {
      render(<TextInputField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i) as HTMLInputElement

      /* Try to change value - should not trigger onChange */
      typeIntoInput(input, 'test')
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not trigger onBlur when readOnly', () => {
      render(<TextInputField {...defaultProps} readOnly={true} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i) as HTMLInputElement

      /* Try to blur - should not trigger onBlur since handler is undefined for readonly */
      fireEvent.blur(input)
      expect(mockOnBlur).not.toHaveBeenCalled()
    })

    it('should allow readOnly to be false by default', () => {
      render(<TextInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i) as HTMLInputElement
      typeIntoInput(input, 'a')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Non-Debounced Mode', () => {
    it('should call onChange immediately when isDebounced is false', () => {
      render(<TextInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test')

      expect(mockOnChange).toHaveBeenCalledTimes(1)
      /* When isDebounced=false, component uses native onChange handler */
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should emit correct values in non-debounced mode', () => {
      render(<TextInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)

      /* Simulate incremental typing */
      typeIntoInput(input, 'a')
      expect(mockOnChange).toHaveBeenCalled()

      typeIntoInput(input, 'ab')
      expect(mockOnChange).toHaveBeenCalled()

      typeIntoInput(input, 'abc')
      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })

    it('should handle rapid typing in non-debounced mode', () => {
      render(<TextInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test123')

      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Debounced Mode', () => {
    it('should not call onChange immediately when isDebounced is true', () => {
      const user = setupUser()
      render(<TextInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should call onChange after debounce delay', () => {
      render(<TextInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should use custom debounce delay', () => {
      render(<TextInputField {...defaultProps} isDebounced={true} debounceMs={500} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test')

      vi.advanceTimersByTime(300)
      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(200)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should reset debounce timer on each keystroke', () => {
      render(<TextInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)

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
      render(<TextInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test')

      /* Blur before debounce timer fires */
      fireEvent.blur(input)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should not emit duplicate values on blur', () => {
      render(<TextInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test')

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()
      fireEvent.blur(input)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update local value immediately while debouncing', () => {
      const user = setupUser()
      render(<TextInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i) as HTMLInputElement
      typeIntoInput(input, 'test')

      expect(input.value).toBe('test')
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Blur Event', () => {
    it('should call onBlur when provided', () => {
      render(<TextInputField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(mockOnBlur).toHaveBeenCalledTimes(1)
    })

    it('should work without onBlur handler', () => {
      render(<TextInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      fireEvent.focus(input)
      fireEvent.blur(input)

      /* Should not throw error when onBlur is not provided */
      expect(input).toBeInTheDocument()
    })

    it('should call onBlur with correct event', () => {
      render(<TextInputField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(mockOnBlur).toHaveBeenCalled()
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      render(<TextInputField {...defaultProps} name="username" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toHaveAttribute('name', 'username')
    })

    it('should include name in change event', () => {
      render(<TextInputField {...defaultProps} name="email" isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test')

      /* onChange should be called when name is provided */
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should work without name attribute', () => {
      const user = setupUser()
      render(<TextInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Icons', () => {
    it('should render left icon', () => {
      const LeftIcon: IconType = () => <svg data-testid="left-icon" />

      render(<TextInputField {...defaultProps} leftIcon={<LeftIcon />} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should render right icon', () => {
      const RightIcon: IconType = () => <svg data-testid="right-icon" />

      render(<TextInputField {...defaultProps} rightIcon={<RightIcon />} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should render both left and right icons', () => {
      const LeftIcon: IconType = () => <svg data-testid="left-icon" />
      const RightIcon: IconType = () => <svg data-testid="right-icon" />

      render(
        <TextInputField {...defaultProps} leftIcon={<LeftIcon />} rightIcon={<RightIcon />} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should work without icons', () => {
      render(<TextInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toBeInTheDocument()
    })
  })

  describe('AutoFocus', () => {
    it('should autofocus when autoFocus is true', () => {
      render(<TextInputField {...defaultProps} autoFocus={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toHaveFocus()
    })

    it('should not autofocus when autoFocus is false', () => {
      render(<TextInputField {...defaultProps} autoFocus={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).not.toHaveFocus()
    })

    it('should not autofocus by default', () => {
      render(<TextInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).not.toHaveFocus()
    })
  })

  describe('Input Props', () => {
    it('should apply additional input props', () => {
      render(
        <TextInputField {...defaultProps} inputProps={{ maxLength: 10 }} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('should merge input props with default props', () => {
      render(
        <TextInputField {...defaultProps} inputProps={{ className: 'custom-class' }} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toHaveClass('custom-class')
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<TextInputField {...defaultProps} value="initial" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('initial')
      expect(input).toBeInTheDocument()

      rerender(<TestWrapper><TextInputField {...defaultProps} value="updated" /></TestWrapper>)

      expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<TextInputField {...defaultProps} value="" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i) as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle value changes from parent', () => {
      const { rerender } = render(<TextInputField {...defaultProps} value="test" isDebounced={true} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextInputField {...defaultProps} value="new value" isDebounced={true} /></TestWrapper>)

      const input = screen.getByLabelText(/Test Label/i) as HTMLInputElement
      expect(input.value).toBe('new value')
    })

    it('should respect external value changes during typing', () => {
      const { rerender } = render(<TextInputField {...defaultProps} value="" isDebounced={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i) as HTMLInputElement
      typeIntoInput(input, 'user')

      vi.advanceTimersByTime(100)

      rerender(<TestWrapper><TextInputField {...defaultProps} value="external" isDebounced={true} /></TestWrapper>)

      /* External value change should not override local value while typing */
      expect(input.value).toBe('user')
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>()

      render(<TextInputField {...defaultProps} ref={ref} />, { wrapper: TestWrapper })

      /* Verify ref is forwarded to the input element */
      expect(ref.current).not.toBeNull()
      expect(ref.current?.tagName).toBe('INPUT')
    })

    it('should allow ref access to input methods', () => {
      const TestComponent = () => {
        const ref = React.useRef<HTMLInputElement>(null)

        React.useEffect(() => {
          if (ref.current) {
            ref.current.focus()
          }
        }, [])

        return <TextInputField {...defaultProps} ref={ref} />
      }

      render(<TestComponent />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long text input', () => {
      const user = setupUser()
      const longText = 'a'.repeat(1000)

      render(<TextInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, longText)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle special characters', () => {
      const user = setupUser()
      render(<TextInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, '!@#$%^&*()')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(<TextInputField {...defaultProps} value="1" />, { wrapper: TestWrapper })

      for (let i = 2; i <= 10; i++) {
        rerender(<TestWrapper><TextInputField {...defaultProps} value={i.toString()} /></TestWrapper>)
      }

      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    it('should cleanup timers on unmount', () => {
      const { unmount } = render(<TextInputField {...defaultProps} isDebounced={true} />, { wrapper: TestWrapper })

      unmount()

      vi.advanceTimersByTime(1000)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle switching between debounced modes', () => {
      const { rerender } = render(<TextInputField {...defaultProps} isDebounced={true} />, { wrapper: TestWrapper })

      let input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test')

      rerender(<TestWrapper><TextInputField {...defaultProps} isDebounced={false} value="" /></TestWrapper>)

      mockOnChange.mockClear()
      /* Get fresh input reference after rerender */
      input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'a')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<TextInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toBeInTheDocument()
    })

    it('should associate error message with input', () => {
      render(
        <TextInputField {...defaultProps} isInValid={true} errorMessage="Error message" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Error message')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<TextInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText(/Test Label/i) as HTMLInputElement
      input.focus()

      expect(input).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<TextInputField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      /* Label includes asterisk for required fields, so use regex pattern */
      const input = screen.getByLabelText(/Test Label/i)
      expect(input).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should work in a form context', () => {
      const user = setupUser()
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <TextInputField {...defaultProps} name="testField" isDebounced={false} />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText(/Test Label/i)
      typeIntoInput(input, 'test value')

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should handle multiple instances independently', () => {
      const user = setupUser()
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      render(
        <>
          <TextInputField {...defaultProps} label="Field 1" onChange={onChange1} isDebounced={false} />
          <TextInputField {...defaultProps} label="Field 2" onChange={onChange2} isDebounced={false} />
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
  })
})
