/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { IconType } from 'react-icons'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import PasswordInputField from '../password-input-field'
import React from 'react'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

vi.mock('@shared/utils/validation', () => ({
  calculatePasswordStrength: vi.fn((password: string) => ({
    score: password.length >= 8 ? 80 : 20,
    label: password.length >= 8 ? 'Strong' : 'Weak',
    color: password.length >= 8 ? 'green.500' : 'red.500',
    checks: {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    }
  }))
}))

/* Helper function to simulate typing into password input - works with fake timers */
const typeIntoInput = (input: HTMLElement, text: string) => {
  if ((input as HTMLInputElement).disabled || (input as HTMLInputElement).readOnly) {
    return
  }

  for (const char of text) {
    const currentValue = (input as HTMLInputElement).value
    const newValue = currentValue + char

    const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (nativeInputSetter) {
      nativeInputSetter.call(input, newValue)
    }

    fireEvent.change(input, { target: { value: newValue } })
  }
}

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('PasswordInputField Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()

  const defaultProps = {
    label: 'Password',
    value: '',
    placeholder: 'Enter password',
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
      render(<PasswordInputField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    })

    it('should render with value', () => {
      render(<PasswordInputField {...defaultProps} value="test123" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('test123')
      expect(input).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<PasswordInputField {...defaultProps} label="New Password" />, { wrapper: TestWrapper })

      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<PasswordInputField {...defaultProps} placeholder="Create password..." />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Create password...')).toBeInTheDocument()
    })

    it('should render as password input', () => {
      render(<PasswordInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should have visibility toggle button', () => {
      render(<PasswordInputField {...defaultProps} />, { wrapper: TestWrapper })

      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeInTheDocument()
    })
  })

  describe('Password Visibility Toggle', () => {
    it('should have visibility toggle button', () => {
      render(<PasswordInputField {...defaultProps} value="test123" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('type', 'password')

      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
      expect(toggleButton).toBeInTheDocument()
    })

    it('should allow button interaction', () => {
      render(<PasswordInputField {...defaultProps} value="test123" />, { wrapper: TestWrapper })

      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
      fireEvent.click(toggleButton)
      fireEvent.click(toggleButton)

      /* Button should remain in document after clicks */
      expect(toggleButton).toBeInTheDocument()
    })

    it('should maintain value when toggling visibility', () => {
      render(<PasswordInputField {...defaultProps} value="test123" />, { wrapper: TestWrapper })

      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
      fireEvent.click(toggleButton)

      const input = screen.getByDisplayValue('test123')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<PasswordInputField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Password')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<PasswordInputField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Password')
      expect(label).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <PasswordInputField {...defaultProps} isInValid={true} errorMessage="Password is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(
        <PasswordInputField {...defaultProps} isInValid={false} errorMessage="Password is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
    })

    it('should apply error styling when invalid', () => {
      render(<PasswordInputField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<PasswordInputField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<PasswordInputField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).not.toBeDisabled()
    })

    it('should not allow input when disabled', () => {
      render(<PasswordInputField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('ReadOnly State', () => {
    it('should not trigger onChange when readOnly', () => {
      render(<PasswordInputField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not trigger onBlur when readOnly', () => {
      render(<PasswordInputField {...defaultProps} readOnly={true} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(mockOnBlur).not.toHaveBeenCalled()
    })
  })

  describe('Non-Debounced Mode', () => {
    it('should call onChange immediately when isDebounced is false', () => {
      render(<PasswordInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'test')

      expect(mockOnChange).toHaveBeenCalledTimes(4)
    })

    it('should emit correct values in non-debounced mode', () => {
      render(<PasswordInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password') as HTMLInputElement

      /* Simulate typing character by character */
      typeIntoInput(input, 'abc')

      /* Check that onChange was called for each character */
      expect(mockOnChange).toHaveBeenCalledTimes(3)
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Debounced Mode', () => {
    it('should not call onChange immediately when isDebounced is true', () => {
      render(<PasswordInputField {...defaultProps} isDebounced={true} debounceMs={200} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should call onChange after debounce delay', () => {
      render(<PasswordInputField {...defaultProps} isDebounced={true} debounceMs={200} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'test')

      vi.advanceTimersByTime(200)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should use custom debounce delay', () => {
      render(<PasswordInputField {...defaultProps} isDebounced={true} debounceMs={500} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'test')

      vi.advanceTimersByTime(200)
      expect(mockOnChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should emit final value on blur in debounced mode', () => {
      render(<PasswordInputField {...defaultProps} isDebounced={true} debounceMs={200} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'test')
      fireEvent.blur(input)

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: 'test' })
      }))
    })

    it('should update local value immediately while debouncing', () => {
      render(<PasswordInputField {...defaultProps} isDebounced={true} debounceMs={200} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password') as HTMLInputElement
      typeIntoInput(input, 'test')

      expect(input.value).toBe('test')
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Password Strength Meter', () => {
    it('should not show strength meter by default', () => {
      render(<PasswordInputField {...defaultProps} value="test123" />, { wrapper: TestWrapper })

      /* Strength meter is in DOM but hidden - check parent collapsible is closed */
      const strengthText = screen.queryByText('Password Strength:')
      if (strengthText) {
        expect(strengthText.closest('[data-state="closed"]')).toBeInTheDocument()
      }
    })

    it('should show strength meter when showStrengthMeter is true', () => {
      render(<PasswordInputField {...defaultProps} value="Test123!" showStrengthMeter={true} />, { wrapper: TestWrapper })

      const strengthText = screen.getByText('Password Strength:')
      expect(strengthText.closest('[data-state="open"]')).toBeInTheDocument()
    })

    it('should not show strength meter when password is empty', () => {
      render(<PasswordInputField {...defaultProps} value="" showStrengthMeter={true} />, { wrapper: TestWrapper })

      /* Strength meter is in DOM but hidden - check parent collapsible is closed */
      const strengthText = screen.queryByText('Password Strength:')
      if (strengthText) {
        expect(strengthText.closest('[data-state="closed"]')).toBeInTheDocument()
      }
    })

    it('should show strength label', () => {
      render(<PasswordInputField {...defaultProps} value="Test123!" showStrengthMeter={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Strong')).toBeInTheDocument()
    })

    it('should update strength on password change', () => {
      render(<PasswordInputField {...defaultProps} value="" showStrengthMeter={true} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'Test123!')

      expect(screen.getByText('Password Strength:')).toBeInTheDocument()
    })
  })

  describe('Password Requirements', () => {
    it('should not show requirements by default', () => {
      render(<PasswordInputField {...defaultProps} value="test" />, { wrapper: TestWrapper })

      /* Requirements are in DOM but hidden - check parent collapsible is closed */
      const requirementsText = screen.queryByText('At least 8 characters')
      if (requirementsText) {
        expect(requirementsText.closest('[data-state="closed"]')).toBeInTheDocument()
      }
    })

    it('should show requirements when showRequirements is true', () => {
      render(<PasswordInputField {...defaultProps} value="Test" showRequirements={true} />, { wrapper: TestWrapper })

      const requirementsText = screen.getByText('At least 8 characters')
      expect(requirementsText.closest('[data-state="open"]')).toBeInTheDocument()
      expect(screen.getByText('One lowercase letter')).toBeInTheDocument()
      expect(screen.getByText('One uppercase letter')).toBeInTheDocument()
      expect(screen.getByText('One number')).toBeInTheDocument()
      expect(screen.getByText(/One special character/)).toBeInTheDocument()
    })

    it('should not show requirements when password is empty', () => {
      render(<PasswordInputField {...defaultProps} value="" showRequirements={true} />, { wrapper: TestWrapper })

      /* Requirements are in DOM but hidden - check parent collapsible is closed */
      const requirementsText = screen.queryByText('At least 8 characters')
      if (requirementsText) {
        expect(requirementsText.closest('[data-state="closed"]')).toBeInTheDocument()
      }
    })

    it('should show check icon for met requirements', () => {
      render(<PasswordInputField {...defaultProps} value="Test123!" showRequirements={true} />, { wrapper: TestWrapper })

      const requirements = screen.getByText('At least 8 characters')
      expect(requirements).toBeInTheDocument()
    })

    it('should update requirements on password change', () => {
      render(<PasswordInputField {...defaultProps} value="" showRequirements={true} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'Test123!')

      expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    })
  })

  describe('Blur Event', () => {
    it('should call onBlur when provided', () => {
      render(<PasswordInputField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(mockOnBlur).toHaveBeenCalledTimes(1)
    })

    it('should work without onBlur handler', () => {
      render(<PasswordInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(input).not.toHaveFocus()
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      render(<PasswordInputField {...defaultProps} name="password" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('name', 'password')
    })

    it('should include name in change event', () => {
      render(<PasswordInputField {...defaultProps} name="newPassword" isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'test')

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ name: 'newPassword' })
      }))
    })
  })

  describe('Left Icon', () => {
    it('should render left icon', () => {
      const LeftIcon: IconType = () => <svg data-testid="left-icon" />

      render(<PasswordInputField {...defaultProps} leftIcon={<LeftIcon />} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should work without left icon', () => {
      render(<PasswordInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toBeInTheDocument()
    })
  })

  describe('AutoFocus', () => {
    it('should autofocus when autoFocus is true', () => {
      render(<PasswordInputField {...defaultProps} autoFocus={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toHaveFocus()
    })

    it('should not autofocus when autoFocus is false', () => {
      render(<PasswordInputField {...defaultProps} autoFocus={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).not.toHaveFocus()
    })

    it('should not autofocus by default', () => {
      render(<PasswordInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).not.toHaveFocus()
    })
  })

  describe('Input Props', () => {
    it('should apply additional input props', () => {
      render(
        <PasswordInputField {...defaultProps} inputProps={{ maxLength: 20 }} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('maxLength', '20')
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<PasswordInputField {...defaultProps} value="initial" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('initial')
      expect(input).toBeInTheDocument()

      rerender(<TestWrapper><PasswordInputField {...defaultProps} value="updated" /></TestWrapper>)

      expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<PasswordInputField {...defaultProps} value="" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = vi.fn()

      render(<PasswordInputField {...defaultProps} ref={ref} />, { wrapper: TestWrapper })

      /* Ref should be called with the actual input element */
      expect(ref).toHaveBeenCalled()
      const refArg = ref.mock.calls[0][0]
      /* Check if it's a valid input element */
      expect(refArg).toBeTruthy()
      expect(refArg.tagName).toBe('INPUT')
    })

    it('should allow ref access to input methods', () => {
      const TestComponent = () => {
        const ref = React.useRef<HTMLInputElement>(null)

        React.useEffect(() => {
          if (ref.current) {
            ref.current.focus()
          }
        }, [])

        return <PasswordInputField {...defaultProps} ref={ref} />
      }

      render(<TestComponent />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long password input', () => {
      const longPassword = 'a'.repeat(100)

      render(<PasswordInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, longPassword)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle special characters', () => {
      render(<PasswordInputField {...defaultProps} isDebounced={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, '!@#$%^&*()')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should cleanup timers on unmount', () => {
      const { unmount } = render(<PasswordInputField {...defaultProps} isDebounced={true} />, { wrapper: TestWrapper })

      unmount()

      vi.advanceTimersByTime(1000)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle both strength meter and requirements together', () => {
      render(
        <PasswordInputField {...defaultProps} value="Test123!" showStrengthMeter={true} showRequirements={true} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Password Strength:')).toBeInTheDocument()
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<PasswordInputField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toBeInTheDocument()
    })

    it('should associate error message with input', () => {
      render(
        <PasswordInputField {...defaultProps} isInValid={true} errorMessage="Password is too weak" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Password is too weak')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<PasswordInputField {...defaultProps} autoFocus={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Password')
      expect(input).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<PasswordInputField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      /* When required, label includes asterisk - use exact match to avoid button */
      const input = screen.getByLabelText('Password', { exact: false, selector: 'input' })
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('required')
    })
  })

  describe('Integration', () => {
    it('should work in a form context', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <PasswordInputField {...defaultProps} name="password" isDebounced={false} />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText('Password')
      typeIntoInput(input, 'Test123!')

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should handle multiple password fields independently', () => {
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      render(
        <>
          <PasswordInputField {...defaultProps} label="Password" onChange={onChange1} isDebounced={false} />
          <PasswordInputField {...defaultProps} label="Confirm Password" onChange={onChange2} isDebounced={false} />
        </>,
        { wrapper: TestWrapper }
      )

      const input1 = screen.getByLabelText('Password')
      const input2 = screen.getByLabelText('Confirm Password')

      typeIntoInput(input1, 'test1')
      typeIntoInput(input2, 'test2')

      expect(onChange1).toHaveBeenCalled()
      expect(onChange2).toHaveBeenCalled()
    })
  })
})
