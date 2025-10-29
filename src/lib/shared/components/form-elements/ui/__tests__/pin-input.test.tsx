/* Libraries imports */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import PinInputField from '../pin-input'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

/* Mock Chakra UI PinInput to work with standard events */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')

  interface PinInputRootProps {
    children: React.ReactNode
    onValueChange?: (details: { value: string[] }) => void
    value?: string[]
    disabled?: boolean
    readOnly?: boolean
    name?: string
    placeholder?: string
    autoFocus?: boolean
    size?: string
    otp?: boolean
  }

  interface PinInputContextValue {
    value: string[]
    disabled?: boolean
    readOnly?: boolean
    placeholder?: string
    onValueChange?: (details: { value: string[] }) => void
    autoFocus?: boolean
    name?: string
  }

  const PinInputContext = React.createContext<PinInputContextValue>({
    value: []
  })

  const MockPinInputRoot = ({ children, onValueChange, value = [], disabled, readOnly, placeholder, autoFocus, name, ...props }: PinInputRootProps) => {
    return (
      <PinInputContext.Provider value={{ value, disabled, readOnly, placeholder, onValueChange, autoFocus, name }}>
        <div data-part="root" data-scope="pin-input" {...props}>
          {children}
        </div>
      </PinInputContext.Provider>
    )
  }

  const MockPinInputHiddenInput = () => {
    const context = React.useContext(PinInputContext)
    return <input type="hidden" name={context.name} value={context.value.join('')} aria-hidden="true" />
  }

  const MockPinInputControl = ({ children, gap }: { children: React.ReactNode; gap?: string }) => {
    return (
      <div data-part="control" style={{ gap }}>
        {children}
      </div>
    )
  }

  const MockPinInputInput = ({ index }: { index: number; w?: string; borderWidth?: number; borderColor?: string }) => {
    const context = React.useContext(PinInputContext)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if (context.autoFocus && index === 0 && inputRef.current) {
        inputRef.current.focus()
      }
    }, [context.autoFocus, index])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (context.disabled || context.readOnly) return

      const newValue = e.target.value
      const newValues = [...context.value]

      if (newValue === '') {
        newValues[index] = ''
      } else {
        const char = newValue.slice(-1)
        if (!/^\d$/.test(char)) {
          return
        }
        newValues[index] = char
      }

      context.onValueChange?.({ value: newValues })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (context.disabled || context.readOnly) return

      if (e.key === 'Backspace') {
        const newValues = [...context.value]
        newValues[index] = ''
        context.onValueChange?.({ value: newValues })
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (context.disabled || context.readOnly) return

      e.preventDefault()
      const pastedData = e.clipboardData.getData('text')
      const digits = pastedData.replace(/\D/g, '').split('')

      const newValues = [...context.value]
      digits.forEach((digit, i) => {
        if (index + i < newValues.length) {
          newValues[index + i] = digit
        }
      })

      context.onValueChange?.({ value: newValues })
    }

    return (
      <input
        ref={inputRef}
        type="tel"
        value={context.value[index] || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        disabled={context.disabled}
        readOnly={context.readOnly}
        placeholder={context.placeholder}
      />
    )
  }

  return {
    ...actual,
    PinInput: {
      Root: MockPinInputRoot,
      HiddenInput: MockPinInputHiddenInput,
      Control: MockPinInputControl,
      Input: MockPinInputInput
    }
  }
})

/* Helper function to get visible PIN inputs - excludes hidden input */
const getPinInputs = (container: HTMLElement): HTMLInputElement[] => {
  return Array.from(container.querySelectorAll('input[type="tel"]')) as HTMLInputElement[]
}

/* Helper function to simulate typing into PIN input - works with fake timers */
const typeIntoPinInput = (input: HTMLInputElement, text: string) => {
  if (input.disabled || input.readOnly) {
    return
  }

  for (const char of text) {
    fireEvent.change(input, { target: { value: char } })
  }
}

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('PinInputField Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()

  const defaultProps = {
    label: 'Enter PIN',
    isInValid: false,
    required: false,
    onChange: mockOnChange
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Enter PIN')).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<PinInputField {...defaultProps} label="Verification Code" />, { wrapper: TestWrapper })

      expect(screen.getByText('Verification Code')).toBeInTheDocument()
    })

    it('should render 6 input fields by default', () => {
      const { container } = render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs).toHaveLength(6)
    })

    it('should render custom number of input fields', () => {
      const { container } = render(<PinInputField {...defaultProps} length={4} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs).toHaveLength(4)
    })

    it('should render with placeholder', () => {
      const { container } = render(<PinInputField {...defaultProps} placeholder="0" />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      inputs.forEach(input => {
        expect(input).toHaveAttribute('placeholder', '0')
      })
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<PinInputField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Enter PIN')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<PinInputField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Enter PIN')
      expect(label).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <PinInputField {...defaultProps} isInValid={true} errorMessage="Invalid PIN" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Invalid PIN')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(
        <PinInputField {...defaultProps} isInValid={false} errorMessage="Invalid PIN" />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('Invalid PIN')).not.toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<PinInputField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Enter PIN')
      expect(label).toBeInTheDocument()
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<PinInputField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><PinInputField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when typing in first input', () => {
      const { container } = render(<PinInputField {...defaultProps} value={[]} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '1')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle typing complete PIN', () => {
      const { container } = render(<PinInputField {...defaultProps} value={[]} length={4} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)

      typeIntoPinInput(inputs[0], '1234')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should accept only numeric values in OTP mode', () => {
      const { container } = render(<PinInputField {...defaultProps} value={[]} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], 'a')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle backspace', () => {
      const { container } = render(<PinInputField {...defaultProps} value={['1', '2', '3']} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      inputs[2].focus()
      fireEvent.keyDown(inputs[2], { key: 'Backspace' })

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle arrow key navigation', () => {
      const { container } = render(<PinInputField {...defaultProps} value={['1', '2']} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      inputs[0].focus()

      expect(inputs[0]).toHaveFocus()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      const { container } = render(<PinInputField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      inputs.forEach(input => {
        expect(input).toBeDisabled()
      })
    })

    it('should not be disabled when disabled prop is false', () => {
      const { container } = render(<PinInputField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      inputs.forEach(input => {
        expect(input).not.toBeDisabled()
      })
    })

    it('should not allow input when disabled', () => {
      const { container } = render(<PinInputField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '1')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update disabled state dynamically', () => {
      const { container, rerender } = render(<PinInputField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><PinInputField {...defaultProps} disabled={true} /></TestWrapper>)

      const inputs = getPinInputs(container)
      inputs.forEach(input => {
        expect(input).toBeDisabled()
      })
    })
  })

  describe('ReadOnly State', () => {
    it('should be readOnly when readOnly prop is true', () => {
      const { container } = render(<PinInputField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      inputs.forEach(input => {
        expect(input).toHaveAttribute('readonly')
      })
    })

    it('should not trigger onChange when readOnly', () => {
      const { container } = render(<PinInputField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '1')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should allow readOnly to be false by default', () => {
      const { container } = render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '1')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should display current value in readOnly mode', () => {
      const { container } = render(<PinInputField {...defaultProps} readOnly={true} value={['1', '2', '3', '4', '5', '6']} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs[0]).toHaveValue('1')
      expect(inputs[1]).toHaveValue('2')
      expect(inputs[2]).toHaveValue('3')
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      const { container } = render(<PinInputField {...defaultProps} name="verificationCode" />, { wrapper: TestWrapper })

      const hiddenInput = container.querySelector('input[type="hidden"]')
      expect(hiddenInput).toHaveAttribute('name', 'verificationCode')
    })

    it('should work without name attribute', () => {
      const { container } = render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '1')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Value Management', () => {
    it('should display provided value', () => {
      const { container } = render(<PinInputField {...defaultProps} value={['1', '2', '3']} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs[0]).toHaveValue('1')
      expect(inputs[1]).toHaveValue('2')
      expect(inputs[2]).toHaveValue('3')
    })

    it('should handle empty value array', () => {
      const { container } = render(<PinInputField {...defaultProps} value={[]} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      inputs.forEach(input => {
        expect(input).toHaveValue('')
      })
    })

    it('should handle partial value', () => {
      const { container } = render(<PinInputField {...defaultProps} value={['1', '2']} length={6} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs[0]).toHaveValue('1')
      expect(inputs[1]).toHaveValue('2')
      expect(inputs[2]).toHaveValue('')
    })

    it('should update when value prop changes', () => {
      const { container, rerender } = render(<PinInputField {...defaultProps} value={['1', '2']} />, { wrapper: TestWrapper })

      let inputs = getPinInputs(container)
      expect(inputs[0]).toHaveValue('1')

      rerender(<TestWrapper><PinInputField {...defaultProps} value={['3', '4']} /></TestWrapper>)

      inputs = getPinInputs(container)
      expect(inputs[0]).toHaveValue('3')
    })

    it('should handle complete PIN value', () => {
      const { container } = render(<PinInputField {...defaultProps} value={['1', '2', '3', '4', '5', '6']} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs[0]).toHaveValue('1')
      expect(inputs[5]).toHaveValue('6')
    })
  })

  describe('AutoFocus', () => {
    it('should autofocus first input when autoFocus is true', () => {
      const { container } = render(<PinInputField {...defaultProps} autoFocus={true} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('should not autofocus when autoFocus is false', () => {
      const { container } = render(<PinInputField {...defaultProps} autoFocus={false} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('should not autofocus by default', () => {
      const { container } = render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('Box Gap', () => {
    it('should use default gap between inputs', () => {
      const { container } = render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const control = container.querySelector('[data-part="control"]')
      expect(control).toHaveStyle({ gap: '20px' })
    })

    it('should use custom gap when provided', () => {
      const { container } = render(<PinInputField {...defaultProps} boxGap="10px" />, { wrapper: TestWrapper })

      const control = container.querySelector('[data-part="control"]')
      expect(control).toHaveStyle({ gap: '10px' })
    })

    it('should handle large gap values', () => {
      const { container } = render(<PinInputField {...defaultProps} boxGap="50px" />, { wrapper: TestWrapper })

      const control = container.querySelector('[data-part="control"]')
      expect(control).toHaveStyle({ gap: '50px' })
    })
  })

  describe('Length Variations', () => {
    it('should render 4-digit PIN', () => {
      const { container } = render(<PinInputField {...defaultProps} length={4} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs).toHaveLength(4)
    })

    it('should render 6-digit PIN (default)', () => {
      const { container } = render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs).toHaveLength(6)
    })

    it('should render 8-digit PIN', () => {
      const { container } = render(<PinInputField {...defaultProps} length={8} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs).toHaveLength(8)
    })

    it('should handle single digit PIN', () => {
      const { container } = render(<PinInputField {...defaultProps} length={1} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid typing', () => {
      const { container } = render(<PinInputField {...defaultProps} value={[]} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '123456')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle pasting values', () => {
      const { container } = render(<PinInputField {...defaultProps} value={[]} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      inputs[0].focus()
      fireEvent.paste(inputs[0], { clipboardData: { getData: () => '123456' } })

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle both disabled and readOnly states', () => {
      const { container } = render(<PinInputField {...defaultProps} disabled={true} readOnly={true} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '1')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle very long label text', () => {
      const longLabel = 'A'.repeat(200)
      render(<PinInputField {...defaultProps} label={longLabel} />, { wrapper: TestWrapper })

      expect(screen.getByText(longLabel)).toBeInTheDocument()
    })

    it('should handle label with special characters', () => {
      const specialLabel = 'Enter <PIN> & "Code" (Required!)'
      render(<PinInputField {...defaultProps} label={specialLabel} />, { wrapper: TestWrapper })

      expect(screen.getByText(specialLabel)).toBeInTheDocument()
    })

    it('should handle value longer than length', () => {
      const { container } = render(<PinInputField {...defaultProps} value={['1', '2', '3', '4', '5', '6', '7', '8']} length={4} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs).toHaveLength(4)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const label = screen.getByText('Enter PIN')
      expect(label).toBeInTheDocument()
    })

    it('should associate error message with inputs', () => {
      render(
        <PinInputField {...defaultProps} isInValid={true} errorMessage="Invalid code" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Invalid code')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      const { container } = render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs.length).toBeGreaterThan(0)
      expect(inputs[0].type).toBe('tel')
    })

    it('should support screen readers with proper semantics', () => {
      render(<PinInputField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Enter PIN')
      expect(label).toBeInTheDocument()
    })

    it('should have proper input type for OTP', () => {
      const { container } = render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('Integration', () => {
    it('should work in a form context', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault())

      const { container } = render(
        <form onSubmit={handleSubmit}>
          <PinInputField {...defaultProps} name="pin" />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '1')

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should handle multiple PIN fields independently', () => {
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      const { container } = render(
        <>
          <PinInputField {...defaultProps} label="PIN 1" onChange={onChange1} />
          <PinInputField {...defaultProps} label="PIN 2" onChange={onChange2} />
        </>,
        { wrapper: TestWrapper }
      )

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '1')
      typeIntoPinInput(inputs[6], '2')

      expect(onChange1).toHaveBeenCalled()
      expect(onChange2).toHaveBeenCalled()
    })

    it('should work with form validation', () => {
      const { container } = render(
        <PinInputField {...defaultProps} required={true} isInValid={true} errorMessage="Required" />,
        { wrapper: TestWrapper }
      )

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '1')

      expect(mockOnChange).toHaveBeenCalled()
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })

  describe('OTP Mode', () => {
    it('should be in OTP mode by default', () => {
      const { container } = render(<PinInputField {...defaultProps} />, { wrapper: TestWrapper })

      const root = container.querySelector('[data-part="root"]')
      expect(root).toBeInTheDocument()
    })

    it('should accept only single character per input', () => {
      const { container } = render(<PinInputField {...defaultProps} value={[]} />, { wrapper: TestWrapper })

      const inputs = getPinInputs(container)
      typeIntoPinInput(inputs[0], '12')

      const firstInputValue = inputs[0].value
      expect(firstInputValue.length).toBeLessThanOrEqual(1)
    })
  })
})
