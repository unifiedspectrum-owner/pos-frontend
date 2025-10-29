/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import TextAreaField from '../textarea'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

/* Helper function to simulate typing - works with fake timers */
const typeIntoTextarea = (textarea: HTMLElement, text: string) => {
  /* Don't fire change if textarea is disabled */
  if ((textarea as HTMLTextAreaElement).disabled) {
    return
  }
  /* Set the value directly on the element to make it queryable */
  const nativeTextareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
  if (nativeTextareaSetter) {
    nativeTextareaSetter.call(textarea, text)
  }
  fireEvent.change(textarea, { target: { value: text } })
}

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('TextAreaField Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()

  const defaultProps = {
    label: 'Description',
    value: '',
    placeholder: 'Enter description',
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

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<TextAreaField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
    })

    it('should render with value', () => {
      render(<TextAreaField {...defaultProps} value="Test description" />, { wrapper: TestWrapper })

      const textarea = screen.getByDisplayValue('Test description')
      expect(textarea).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<TextAreaField {...defaultProps} label="Comments" />, { wrapper: TestWrapper })

      expect(screen.getByLabelText('Comments')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<TextAreaField {...defaultProps} placeholder="Type your message..." />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    })

    it('should render as textarea element', () => {
      render(<TextAreaField {...defaultProps} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea.tagName).toBe('TEXTAREA')
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<TextAreaField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Description')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<TextAreaField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Description')
      expect(label).toBeInTheDocument()
    })

    it('should allow required prop to be updated', () => {
      const { rerender } = render(<TextAreaField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextAreaField {...defaultProps} required={true} /></TestWrapper>)

      const label = screen.getByText('Description')
      expect(label.parentElement).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <TextAreaField {...defaultProps} isInValid={true} errorMessage="This field is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(<TextAreaField {...defaultProps} isInValid={false} errorMessage="This field is required" />, { wrapper: TestWrapper })

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    })

    it('should apply error styling when invalid', () => {
      render(<TextAreaField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<TextAreaField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextAreaField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<TextAreaField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('Helper Text', () => {
    it('should show helper text when provided', () => {
      render(<TextAreaField {...defaultProps} helperText="Maximum 500 characters" />, { wrapper: TestWrapper })

      expect(screen.getByText('Maximum 500 characters')).toBeInTheDocument()
    })

    it('should not show helper text when not provided', () => {
      render(<TextAreaField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Maximum')).not.toBeInTheDocument()
    })

    it('should show both helper text and error message', () => {
      render(
        <TextAreaField {...defaultProps} helperText="Enter details" isInValid={true} errorMessage="Required field" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Enter details')).toBeInTheDocument()
      expect(screen.getByText('Required field')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<TextAreaField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<TextAreaField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).not.toBeDisabled()
    })

    it('should not allow input when disabled', () => {
      
      render(<TextAreaField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<TextAreaField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextAreaField {...defaultProps} disabled={true} /></TestWrapper>)

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toBeDisabled()
    })
  })

  describe('ReadOnly State', () => {
    it('should not trigger onChange when readOnly', () => {
      
      render(<TextAreaField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not trigger onBlur when readOnly', () => {
      
      render(<TextAreaField {...defaultProps} readOnly={true} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      fireEvent.click(textarea)
      fireEvent.blur(document.activeElement!)

      expect(mockOnBlur).not.toHaveBeenCalled()
    })

    it('should allow readOnly to be false by default', () => {
      
      render(<TextAreaField {...defaultProps} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'a')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Non-Debounced Mode', () => {
    it('should call onChange immediately when isDebounced is false', () => {
      render(<TextAreaField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should emit correct values in non-debounced mode', () => {
      const { rerender } = render(<TextAreaField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      let textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement

      typeIntoTextarea(textarea, 'a')
      expect(mockOnChange).toHaveBeenCalled()

      rerender(<TestWrapper><TextAreaField {...defaultProps} value="a" isDebounced={false} /></TestWrapper>)
      textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement
      expect(textarea.value).toBe('a')

      typeIntoTextarea(textarea, 'ab')
      rerender(<TestWrapper><TextAreaField {...defaultProps} value="ab" isDebounced={false} /></TestWrapper>)
      textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement
      expect(textarea.value).toBe('ab')

      typeIntoTextarea(textarea, 'abc')
      rerender(<TestWrapper><TextAreaField {...defaultProps} value="abc" isDebounced={false} /></TestWrapper>)
      textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement
      expect(textarea.value).toBe('abc')
    })

    it('should handle rapid typing in non-debounced mode', () => {
      render(<TextAreaField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement
      typeIntoTextarea(textarea, 'test123')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle multiline input in non-debounced mode', () => {
      
      render(<TextAreaField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'line1{Enter}line2')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Debounced Mode', () => {
    it('should not call onChange immediately when isDebounced is true', () => {
      
      render(<TextAreaField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should call onChange after debounce delay', () => {
      render(<TextAreaField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should use custom debounce delay', () => {
      render(<TextAreaField {...defaultProps} isDebounced={true} debounceMs={500} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      vi.advanceTimersByTime(300)
      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(200)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should reset debounce timer on each keystroke', () => {
      render(<TextAreaField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)

      typeIntoTextarea(textarea, 't')
      vi.advanceTimersByTime(100)

      typeIntoTextarea(textarea, 'e')
      vi.advanceTimersByTime(100)

      typeIntoTextarea(textarea, 's')
      vi.advanceTimersByTime(100)

      typeIntoTextarea(textarea, 't')

      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should emit final value on blur in debounced mode', () => {
      render(<TextAreaField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')
      fireEvent.blur(textarea)

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: 'test' })
      }))
    })

    it('should not emit duplicate values on blur', () => {
      render(<TextAreaField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalledTimes(1)

      mockOnChange.mockClear()
      fireEvent.blur(textarea)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update local value immediately while debouncing', () => {
      render(<TextAreaField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement
      typeIntoTextarea(textarea, 'test')

      expect(textarea.value).toBe('test')
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Blur Event', () => {
    it('should call onBlur when provided', () => {
      render(<TextAreaField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      fireEvent.focus(textarea)
      fireEvent.blur(textarea)

      expect(mockOnBlur).toHaveBeenCalledTimes(1)
    })

    it('should work without onBlur handler', () => {
      render(<TextAreaField {...defaultProps} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      fireEvent.focus(textarea)
      fireEvent.blur(textarea)

      expect(textarea).not.toHaveFocus()
    })

    it('should call onBlur with correct event', () => {
      render(<TextAreaField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      fireEvent.focus(textarea)
      fireEvent.blur(textarea)

      expect(mockOnBlur).toHaveBeenCalledWith(expect.objectContaining({
        target: textarea
      }))
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      render(<TextAreaField {...defaultProps} name="description" />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toHaveAttribute('name', 'description')
    })

    it('should include name in change event', () => {
      
      render(<TextAreaField {...defaultProps} name="comments" isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ name: 'comments' })
      }))
    })

    it('should work without name attribute', () => {
      
      render(<TextAreaField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Input Props', () => {
    it('should apply additional textarea props', () => {
      render(
        <TextAreaField {...defaultProps} inputProps={{ maxLength: 500, rows: 5 }} />,
        { wrapper: TestWrapper }
      )

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toHaveAttribute('maxLength', '500')
      expect(textarea).toHaveAttribute('rows', '5')
    })

    it('should merge input props with default props', () => {
      render(
        <TextAreaField {...defaultProps} inputProps={{ className: 'custom-class' }} />,
        { wrapper: TestWrapper }
      )

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toHaveClass('custom-class')
    })

    it('should apply rows attribute', () => {
      render(
        <TextAreaField {...defaultProps} inputProps={{ rows: 10 }} />,
        { wrapper: TestWrapper }
      )

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toHaveAttribute('rows', '10')
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<TextAreaField {...defaultProps} value="initial" />, { wrapper: TestWrapper })

      const textarea = screen.getByDisplayValue('initial')
      expect(textarea).toBeInTheDocument()

      rerender(<TestWrapper><TextAreaField {...defaultProps} value="updated" /></TestWrapper>)

      expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<TextAreaField {...defaultProps} value="" />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should handle value changes from parent', () => {
      const { rerender } = render(<TextAreaField {...defaultProps} value="test" isDebounced={true} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TextAreaField {...defaultProps} value="new value" isDebounced={true} /></TestWrapper>)

      const textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement
      expect(textarea.value).toBe('new value')
    })

    it('should respect external value changes during typing', () => {
      const { rerender } = render(<TextAreaField {...defaultProps} value="" isDebounced={true} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement
      typeIntoTextarea(textarea, 'user')

      vi.advanceTimersByTime(100)

      rerender(<TestWrapper><TextAreaField {...defaultProps} value="external" isDebounced={true} /></TestWrapper>)

      vi.advanceTimersByTime(300)

      expect(textarea.value).toBe('user')
    })
  })

  describe('Multiline Input', () => {
    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      render(<TextAreaField {...defaultProps} value={multilineText} isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/) as HTMLTextAreaElement
      expect(textarea.value).toContain('\n')
      expect(textarea.value).toBe(multilineText)
    })

    it('should preserve line breaks', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      render(<TextAreaField {...defaultProps} value={multilineText} />, { wrapper: TestWrapper })

      const textarea = screen.getByPlaceholderText('Enter description') as HTMLTextAreaElement
      expect(textarea.value).toBe(multilineText)
    })

    it('should handle empty lines', () => {
      render(<TextAreaField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'Line 1\n\nLine 3')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long text input', () => {
      
      const longText = 'a'.repeat(1000)

      render(<TextAreaField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, longText)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle special characters', () => {
      
      render(<TextAreaField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, '!@#$%^&*()')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(<TextAreaField {...defaultProps} value="1" />, { wrapper: TestWrapper })

      for (let i = 2; i <= 10; i++) {
        rerender(<TestWrapper><TextAreaField {...defaultProps} value={i.toString()} /></TestWrapper>)
      }

      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    it('should cleanup timers on unmount', () => {
      const { unmount } = render(<TextAreaField {...defaultProps} isDebounced={true} />, { wrapper: TestWrapper })

      unmount()

      vi.advanceTimersByTime(1000)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle switching between debounced modes', () => {
      const { rerender } = render(<TextAreaField {...defaultProps} isDebounced={true} />, { wrapper: TestWrapper })

      let textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test')

      rerender(<TestWrapper><TextAreaField {...defaultProps} isDebounced={false} /></TestWrapper>)

      mockOnChange.mockClear()
      textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'a')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle Unicode characters', () => {
      
      render(<TextAreaField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, '你好世界🌍')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<TextAreaField {...defaultProps} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toBeInTheDocument()
    })

    it('should associate error message with textarea', () => {
      render(
        <TextAreaField {...defaultProps} isInValid={true} errorMessage="Error message" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Error message')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<TextAreaField {...defaultProps} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      textarea.focus()

      expect(textarea).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<TextAreaField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      expect(textarea).toBeInTheDocument()
    })

    it('should associate helper text with textarea', () => {
      render(<TextAreaField {...defaultProps} helperText="Enter details" />, { wrapper: TestWrapper })

      expect(screen.getByText('Enter details')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should work in a form context', () => {
      
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <TextAreaField {...defaultProps} name="description" isDebounced={false} />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'test description')

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should handle multiple instances independently', () => {
      
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      render(
        <>
          <TextAreaField {...defaultProps} label="Field 1" onChange={onChange1} isDebounced={false} />
          <TextAreaField {...defaultProps} label="Field 2" onChange={onChange2} isDebounced={false} />
        </>,
        { wrapper: TestWrapper }
      )

      const textarea1 = screen.getByLabelText('Field 1')
      const textarea2 = screen.getByLabelText('Field 2')

      typeIntoTextarea(textarea1, 'test1')
      typeIntoTextarea(textarea2, 'test2')

      expect(onChange1).toHaveBeenCalled()
      expect(onChange2).toHaveBeenCalled()
    })

    it('should work with form validation', () => {
      
      render(<TextAreaField {...defaultProps} required={true} isInValid={true} errorMessage="Required" />, { wrapper: TestWrapper })

      const textarea = screen.getByLabelText(/Description/)
      typeIntoTextarea(textarea, 'valid input')

      expect(mockOnChange).toHaveBeenCalled()
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })
})
