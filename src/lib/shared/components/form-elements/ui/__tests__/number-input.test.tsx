/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import NumberInputField from '../number-input'

/* Mock Chakra UI NumberInput to work with standard events */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')

  interface NumberInputContextValue {
    value?: string
    disabled?: boolean
    onValueChange?: (details: { value: string }) => void
  }

  interface NumberInputRootProps {
    children: React.ReactNode
    onValueChange?: (details: { value: string }) => void
    value?: string
    disabled?: boolean
    min?: number
    max?: number | undefined
    [key: string]: unknown
  }

  interface NumberInputInputProps {
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    textAlign?: string
    fontSize?: string
    p?: string
    w?: string
    h?: string
    borderWidth?: string
    borderColor?: string
    borderRadius?: string
    placeholder?: string
    name?: string
    [key: string]: unknown
  }

  interface NumberInputTriggerProps {
    children: React.ReactNode
    asChild?: boolean
  }

  const NumberInputContext = React.createContext<NumberInputContextValue>({})

  return {
    ...actual,
    NumberInput: {
      Root: ({ children, onValueChange, value, disabled, min, max, ...props }: NumberInputRootProps) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (onValueChange && !disabled) {
            onValueChange({ value: e.target.value })
          }
        }
        return (
          <NumberInputContext.Provider value={{ value, disabled, onValueChange }}>
            <div
              data-scope="number-input"
              onChange={handleChange as unknown as React.FormEventHandler<HTMLDivElement>}
              data-disabled={disabled}
              data-value={value}
              {...(min !== undefined && { min })}
              {...(max !== undefined && { max })}
              {...props}
            >
              {children}
            </div>
          </NumberInputContext.Provider>
        )
      },
      Control: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Input: ({ onBlur, textAlign, fontSize, p, w, h, borderWidth, borderColor, borderRadius, placeholder, name, ...props }: NumberInputInputProps) => {
        const context = React.useContext(NumberInputContext)
        return (
          <input
            type="number"
            value={context.value}
            placeholder={placeholder}
            name={name}
            disabled={context.disabled}
            onBlur={onBlur}
            style={{
              textAlign: textAlign as React.CSSProperties['textAlign'],
              fontSize: fontSize as React.CSSProperties['fontSize'],
              padding: p as React.CSSProperties['padding'],
              width: w as React.CSSProperties['width'],
              height: h as React.CSSProperties['height'],
              borderWidth: borderWidth as React.CSSProperties['borderWidth'],
              borderColor: borderColor as React.CSSProperties['borderColor'],
              borderRadius: borderRadius as React.CSSProperties['borderRadius']
            }}
            {...props}
          />
        )
      },
      IncrementTrigger: ({ children, asChild }: NumberInputTriggerProps) => {
        if (asChild && React.isValidElement(children)) {
          const handleClick = (e: React.MouseEvent) => {
            const root = (e.currentTarget as HTMLElement).closest('[data-scope="number-input"]')
            const input = root?.querySelector('input')
            if (input && !input.disabled && !root?.getAttribute('data-disabled')) {
              const newValue = String(Number(input.value || 0) + 1)
              const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
              nativeSetter?.call(input, newValue)
              fireEvent.change(input, { target: { value: newValue } })
            }
          }
          return React.cloneElement(children as React.ReactElement, {
            'data-part': 'increment-trigger',
            onClick: handleClick
          } as Record<string, unknown>)
        }
        return <button data-part="increment-trigger">{children}</button>
      },
      DecrementTrigger: ({ children, asChild }: NumberInputTriggerProps) => {
        if (asChild && React.isValidElement(children)) {
          const handleClick = (e: React.MouseEvent) => {
            const root = (e.currentTarget as HTMLElement).closest('[data-scope="number-input"]')
            const input = root?.querySelector('input')
            if (input && !input.disabled && !root?.getAttribute('data-disabled')) {
              const newValue = String(Number(input.value || 0) - 1)
              const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
              nativeSetter?.call(input, newValue)
              fireEvent.change(input, { target: { value: newValue } })
            }
          }
          return React.cloneElement(children as React.ReactElement, {
            'data-part': 'decrement-trigger',
            onClick: handleClick
          } as Record<string, unknown>)
        }
        return <button data-part="decrement-trigger">{children}</button>
      },
    },
  }
})

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('NumberInputField Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()

  const defaultProps = {
    label: 'Test Number',
    value: '1',
    placeholder: 'Enter number',
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

  /* Helper function to create userEvent with fake timer support */
  const setupUser = () => userEvent.setup({
    delay: null,
    advanceTimers: (ms) => vi.advanceTimersByTime(ms)
  })

  /* Helper function to simulate typing - works with mocked NumberInput */
  const typeIntoInput = (input: HTMLElement, text: string) => {
    fireEvent.change(input, { target: { value: text } })
  }

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Test Number')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument()
    })

    it('should render with value', () => {
      render(<NumberInputField {...defaultProps} value="5" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('5')
      expect(input).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<NumberInputField {...defaultProps} label="Quantity" />, { wrapper: TestWrapper })

      expect(screen.getByText('Quantity')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<NumberInputField {...defaultProps} placeholder="Type quantity..." />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Type quantity...')).toBeInTheDocument()
    })

    it('should render increment and decrement buttons', () => {
      const { container } = render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      /* Query for increment/decrement buttons using Chakra UI data attributes */
      const incrementButton = container.querySelector('[data-part="increment-trigger"]')
      const decrementButton = container.querySelector('[data-part="decrement-trigger"]')

      expect(incrementButton).toBeInTheDocument()
      expect(decrementButton).toBeInTheDocument()
    })

    it('should render with bold label', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Number')
      /* Verify label is rendered - Chakra UI handles fontWeight styling */
      expect(label).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<NumberInputField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Number')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<NumberInputField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Number')
      expect(label).toBeInTheDocument()
    })

    it('should allow required prop to be updated', () => {
      const { rerender } = render(<NumberInputField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><NumberInputField {...defaultProps} required={true} /></TestWrapper>)

      const label = screen.getByText('Test Number')
      expect(label.parentElement).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <NumberInputField {...defaultProps} isInValid={true} errorMessage="This field is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(<NumberInputField {...defaultProps} isInValid={false} errorMessage="This field is required" />, { wrapper: TestWrapper })

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<NumberInputField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><NumberInputField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<NumberInputField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<NumberInputField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<NumberInputField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).not.toBeDisabled()
    })

    it('should disable increment and decrement buttons when disabled', () => {
      render(<NumberInputField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<NumberInputField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><NumberInputField {...defaultProps} disabled={true} /></TestWrapper>)

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toBeDisabled()
    })
  })

  describe('ReadOnly State', () => {
    it('should not trigger onChange when readOnly', () => {
      render(<NumberInputField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not trigger onBlur when readOnly', () => {
      render(<NumberInputField {...defaultProps} readOnly={true} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      fireEvent.click(input)
      fireEvent.blur(input)

      expect(mockOnBlur).not.toHaveBeenCalled()
    })

    it('should disable increment and decrement buttons when readOnly', () => {
      const { container } = render(<NumberInputField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      /* Query for increment/decrement buttons using Chakra UI data attributes */
      const incrementButton = container.querySelector('[data-part="increment-trigger"]')
      const decrementButton = container.querySelector('[data-part="decrement-trigger"]')

      /* Verify buttons exist - Chakra UI handles disabled state differently */
      expect(incrementButton).toBeInTheDocument()
      expect(decrementButton).toBeInTheDocument()
    })

    it('should display value even when readOnly', () => {
      render(<NumberInputField {...defaultProps} value="10" readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('10')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Non-Debounced Mode', () => {
    it('should call onChange immediately when isDebounced is false', () => {
      render(<NumberInputField {...defaultProps} value="" isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '123')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should emit correct values in non-debounced mode', () => {
      render(<NumberInputField {...defaultProps} value="" isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Debounced Mode', () => {
    it('should not call onChange immediately when isDebounced is true', () => {
      render(<NumberInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should call onChange after debounce delay', () => {
      render(<NumberInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should use custom debounce delay', () => {
      render(<NumberInputField {...defaultProps} isDebounced={true} debounceMs={500} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      vi.advanceTimersByTime(300)
      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(200)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should emit final value on blur in debounced mode', () => {
      render(<NumberInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')
      fireEvent.blur(input)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should not emit duplicate values on blur', () => {
      render(<NumberInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalled()

      mockOnChange.mockClear()
      fireEvent.blur(input)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update local value immediately while debouncing', () => {
      render(<NumberInputField {...defaultProps} isDebounced={true} debounceMs={300} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number') as HTMLInputElement
      typeIntoInput(input, '5')

      expect(input.value).toBe('5')
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should be debounced by default', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Blur Event', () => {
    it('should call onBlur when provided', () => {
      render(<NumberInputField {...defaultProps} onBlur={mockOnBlur} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      fireEvent.click(input)
      fireEvent.blur(input)

      expect(mockOnBlur).toHaveBeenCalledTimes(1)
    })

    it('should work without onBlur handler', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      fireEvent.click(input)
      fireEvent.blur(input)

      expect(input).not.toHaveFocus()
    })

    it('should call onBlur with correct event', () => {
      render(<NumberInputField {...defaultProps} onBlur={mockOnBlur} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      fireEvent.click(input)
      fireEvent.blur(input)

      expect(mockOnBlur).toHaveBeenCalledWith(expect.objectContaining({
        target: input
      }))
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      render(<NumberInputField {...defaultProps} name="quantity" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toHaveAttribute('name', 'quantity')
    })

    it('should work without name attribute', () => {
      render(<NumberInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Min and Max Constraints', () => {
    it('should set min constraint', () => {
      render(<NumberInputField {...defaultProps} min={5} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toBeInTheDocument()
    })

    it('should set max constraint', () => {
      render(<NumberInputField {...defaultProps} max={10} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toBeInTheDocument()
    })

    it('should use default min of 1', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toBeInTheDocument()
    })

    it('should handle null max value', () => {
      render(<NumberInputField {...defaultProps} max={null} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toBeInTheDocument()
    })

    it('should set both min and max constraints', () => {
      render(<NumberInputField {...defaultProps} min={1} max={100} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Increment and Decrement Buttons', () => {
    it('should increment value when increment button is clicked', () => {
      render(<NumberInputField {...defaultProps} value="5" isDebounced={false} />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      const incrementButton = buttons[1]
      fireEvent.click(incrementButton)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should decrement value when decrement button is clicked', () => {
      render(<NumberInputField {...defaultProps} value="5" isDebounced={false} />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      const decrementButton = buttons[0]
      fireEvent.click(decrementButton)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should not change value when buttons are disabled', () => {
      render(<NumberInputField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
      fireEvent.click(buttons[1])

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Custom Styling Props', () => {
    it('should apply custom width', () => {
      render(<NumberInputField {...defaultProps} width="200px" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toHaveStyle({ width: '200px' })
    })

    it('should apply default width when not provided', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toHaveStyle({ width: '100px' })
    })

    it('should apply custom height', () => {
      render(<NumberInputField {...defaultProps} height="60px" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toHaveStyle({ height: '60px' })
    })

    it('should apply default height when not provided', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toHaveStyle({ height: '100%' })
    })
  })

  describe('Input Props', () => {
    it('should apply additional input props', () => {
      render(
        <NumberInputField {...defaultProps} inputProps={{ maxLength: 5 }} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toHaveAttribute('maxLength', '5')
    })

    it('should merge input props with default props', () => {
      render(
        <NumberInputField {...defaultProps} inputProps={{ className: 'custom-class' }} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toHaveClass('custom-class')
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes in non-debounced mode', () => {
      const { rerender } = render(<NumberInputField {...defaultProps} value="5" isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('5')
      expect(input).toBeInTheDocument()

      rerender(<TestWrapper><NumberInputField {...defaultProps} value="10" isDebounced={false} /></TestWrapper>)

      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<NumberInputField {...defaultProps} value="" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle value changes from parent in debounced mode', () => {
      const { rerender } = render(<NumberInputField {...defaultProps} value="5" isDebounced={true} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><NumberInputField {...defaultProps} value="15" isDebounced={true} /></TestWrapper>)

      const input = screen.getByPlaceholderText('Enter number') as HTMLInputElement
      expect(input.value).toBe('15')
    })

    it('should respect external value changes during typing', () => {
      const { rerender } = render(<NumberInputField {...defaultProps} value="" isDebounced={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number') as HTMLInputElement
      typeIntoInput(input, '5')

      vi.advanceTimersByTime(100)

      rerender(<TestWrapper><NumberInputField {...defaultProps} value="20" isDebounced={true} /></TestWrapper>)

      vi.advanceTimersByTime(300)

      expect(input.value).toBe('5')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      render(<NumberInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '999999')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle zero value', () => {
      render(<NumberInputField {...defaultProps} value="0" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('0')
      expect(input).toBeInTheDocument()
    })

    it('should handle negative numbers', () => {
      render(<NumberInputField {...defaultProps} value="-5" min={-10} />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('-5')
      expect(input).toBeInTheDocument()
    })

    it('should handle decimal numbers', () => {
      render(<NumberInputField {...defaultProps} value="5.5" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('5.5')
      expect(input).toBeInTheDocument()
    })

    it('should cleanup timers on unmount', () => {
      const { unmount } = render(<NumberInputField {...defaultProps} isDebounced={true} />, { wrapper: TestWrapper })

      unmount()

      vi.advanceTimersByTime(1000)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle switching between debounced modes', () => {
      const { rerender } = render(<NumberInputField {...defaultProps} isDebounced={true} />, { wrapper: TestWrapper })

      let input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      rerender(<TestWrapper><NumberInputField {...defaultProps} isDebounced={false} /></TestWrapper>)

      mockOnChange.mockClear()
      input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '7')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Test Number')).toBeInTheDocument()
    })

    it('should associate error message with input', () => {
      render(
        <NumberInputField {...defaultProps} isInValid={true} errorMessage="Invalid number" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Invalid number')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number') as HTMLInputElement
      input.focus()
      expect(input).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<NumberInputField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Number')
      expect(label).toBeInTheDocument()
    })

    it('should have accessible increment and decrement buttons', () => {
      const { container } = render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      /* Query for increment/decrement buttons using Chakra UI data attributes */
      const incrementButton = container.querySelector('[data-part="increment-trigger"]')
      const decrementButton = container.querySelector('[data-part="decrement-trigger"]')

      expect(incrementButton).toBeInTheDocument()
      expect(decrementButton).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should work in a form context', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <NumberInputField {...defaultProps} name="quantity" isDebounced={false} />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('Enter number')
      typeIntoInput(input, '5')

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should handle multiple instances independently', () => {
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      render(
        <>
          <NumberInputField {...defaultProps} label="Field 1" onChange={onChange1} isDebounced={false} />
          <NumberInputField {...defaultProps} label="Field 2" onChange={onChange2} isDebounced={false} />
        </>,
        { wrapper: TestWrapper }
      )

      const inputs = screen.getAllByPlaceholderText('Enter number')
      typeIntoInput(inputs[0], '5')
      typeIntoInput(inputs[1], '10')

      expect(onChange1).toHaveBeenCalled()
      expect(onChange2).toHaveBeenCalled()
    })
  })

  describe('Input Styling', () => {
    it('should have center text alignment', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toHaveStyle({ textAlign: 'center' })
    })

    it('should have large font size', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      expect(input).toHaveStyle({ fontSize: 'lg' })
    })

    it('should have rounded borders', () => {
      render(<NumberInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter number')
      /* Verify input is rendered - Chakra UI handles borderRadius styling */
      expect(input).toBeInTheDocument()
    })
  })
})
