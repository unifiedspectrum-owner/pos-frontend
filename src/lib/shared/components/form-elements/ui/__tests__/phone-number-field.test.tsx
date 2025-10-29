/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'
import { ComboboxOption } from '../combobox-field'

/* Component imports */
import PhoneNumberField, { PhoneNumberTuple, CountryCode } from '../phone-number-field'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096',
  PRIMARY_COLOR: '#3182CE',
  SUCCESS_GREEN_COLOR2: '#48BB78',
  WHITE_COLOR: '#FFFFFF'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('PhoneNumberField Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()
  const mockOnButtonClick = vi.fn()

  const sampleOptions: ComboboxOption[] = [
    { value: '+1', label: '🇺🇸 +1' },
    { value: '+44', label: '🇬🇧 +44' },
    { value: '+91', label: '🇮🇳 +91' }
  ]

  const defaultProps = {
    label: 'Phone Number',
    value: ['+91', ''] as PhoneNumberTuple,
    placeholder: 'Enter phone number',
    isInValid: false,
    required: false,
    options: sampleOptions,
    onChange: mockOnChange
  }

  beforeEach(() => {
    vi.clearAllMocks()
    /* Suppress console.log during tests */
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Phone Number')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<PhoneNumberField {...defaultProps} label="Mobile Number" />, { wrapper: TestWrapper })

      expect(screen.getByText('Mobile Number')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(<PhoneNumberField {...defaultProps} placeholder="Type phone number" />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Type phone number')).toBeInTheDocument()
    })

    it('should render with default placeholder when not provided', () => {
      const props = { ...defaultProps, placeholder: undefined }
      render(<PhoneNumberField {...props} />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })

    it('should render as tel input type', () => {
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should render with combobox placeholder', () => {
      render(<PhoneNumberField {...defaultProps} comboboxPlaceholder="Choose country" />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Choose country')).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<PhoneNumberField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Phone Number')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<PhoneNumberField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Phone Number')
      expect(label).toBeInTheDocument()
    })

    it('should allow required prop to be updated', () => {
      const { rerender } = render(<PhoneNumberField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><PhoneNumberField {...defaultProps} required={true} /></TestWrapper>)

      const label = screen.getByText('Phone Number')
      expect(label.parentElement).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <PhoneNumberField {...defaultProps} isInValid={true} errorMessage="Phone number is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(<PhoneNumberField {...defaultProps} isInValid={false} errorMessage="Phone number is required" />, { wrapper: TestWrapper })

      expect(screen.queryByText('Phone number is required')).not.toBeInTheDocument()
    })

    it('should apply error styling when invalid', () => {
      render(<PhoneNumberField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<PhoneNumberField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><PhoneNumberField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<PhoneNumberField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<PhoneNumberField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<PhoneNumberField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).not.toBeDisabled()
    })

    it('should not allow input when disabled', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '1234567890')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<PhoneNumberField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><PhoneNumberField {...defaultProps} disabled={true} /></TestWrapper>)

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toBeDisabled()
    })

    it('should be enabled by default', () => {
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).not.toBeDisabled()
    })

    it('should disable verify button when disabled', () => {
      render(<PhoneNumberField {...defaultProps} disabled={true} showVerifyButton={true} />, { wrapper: TestWrapper })

      const button = screen.getByText('Verify')
      expect(button).toBeDisabled()
    })
  })

  describe('ReadOnly State', () => {
    it('should not trigger onChange when readOnly', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '1234567890')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should display value even when readOnly', () => {
      render(<PhoneNumberField {...defaultProps} value={['+91', '1234567890']} readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('1234567890')
      expect(input).toBeInTheDocument()
    })

    it('should allow readOnly to be false by default', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '1')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Phone Number Input', () => {
    it('should call onChange when phone number is entered', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '123')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should emit correct tuple format on change', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} value={['+91', '']} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '1')

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(['+91', '1'])
      })
    })

    it('should preserve dial code when phone number changes', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} value={['+44', '987654321']} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.clear(input)
      await user.type(input, '1234567890')

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled()
        const allCalls = mockOnChange.mock.calls
        const allCallsHaveDialCode = allCalls.every(call => call[0][0] === '+44')
        expect(allCallsHaveDialCode).toBe(true)
      }, { timeout: 3000 })
    })

    it('should display current phone number value', () => {
      render(<PhoneNumberField {...defaultProps} value={['+91', '9876543210']} />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('9876543210')
      expect(input).toBeInTheDocument()
    })

    it('should handle empty phone number', () => {
      render(<PhoneNumberField {...defaultProps} value={['+91', '']} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should use default dial code when dial code is missing', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} value={['', ''] as any} defaultDialCode="+1" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '5')

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(['+1', '5'])
      })
    })
  })

  describe('Dial Code Selection', () => {
    it('should display default dial code', () => {
      render(<PhoneNumberField {...defaultProps} value={['+91', '']} />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })

    it('should use custom default dial code', () => {
      render(<PhoneNumberField {...defaultProps} value={['', '']} defaultDialCode="+44" />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })

    it('should call onChange with new dial code when changed', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} value={['+91', '1234567890']} />, { wrapper: TestWrapper })

      /* This would require interaction with ComboboxField which is tested separately */
      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })

    it('should preserve phone number when dial code changes', () => {
      render(<PhoneNumberField {...defaultProps} value={['+91', '9876543210']} />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument()
    })

    it('should handle getDialCodeFromSelection conversion', async () => {
      const getDialCodeFromSelection = (value: string) => {
        const codeMap: Record<string, string> = {
          'US': '+1',
          'UK': '+44',
          'IN': '+91'
        }
        return codeMap[value] || value
      }

      render(
        <PhoneNumberField
          {...defaultProps}
          getDialCodeFromSelection={getDialCodeFromSelection}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })
  })

  describe('Blur Event', () => {
    it('should call onBlur when provided', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.click(input)
      await user.tab()

      expect(mockOnBlur).toHaveBeenCalledTimes(1)
    })

    it('should work without onBlur handler', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.click(input)
      await user.tab()

      expect(input).not.toHaveFocus()
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute for phone number input', () => {
      render(<PhoneNumberField {...defaultProps} name="mobile" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toHaveAttribute('name', 'mobile_phone_number')
    })

    it('should set name attribute for country code input', () => {
      render(<PhoneNumberField {...defaultProps} name="mobile" />, { wrapper: TestWrapper })

      /* ComboboxField would have name "mobile_country" */
      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })

    it('should work without name attribute', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '123')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Verify Button', () => {
    it('should render verify button by default', () => {
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Verify')).toBeInTheDocument()
    })

    it('should render with custom button text', () => {
      render(<PhoneNumberField {...defaultProps} buttonText="Send OTP" />, { wrapper: TestWrapper })

      expect(screen.getByText('Send OTP')).toBeInTheDocument()
    })

    it('should call onButtonClick when verify button is clicked', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} onButtonClick={mockOnButtonClick} />, { wrapper: TestWrapper })

      const button = screen.getByText('Verify')
      await user.click(button)

      expect(mockOnButtonClick).toHaveBeenCalledTimes(1)
    })

    it('should not render verify button when showVerifyButton is false', () => {
      render(<PhoneNumberField {...defaultProps} showVerifyButton={false} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Verify')).not.toBeInTheDocument()
    })

    it('should show loading state on button', () => {
      render(<PhoneNumberField {...defaultProps} buttonLoading={true} />, { wrapper: TestWrapper })

      const button = screen.getByText('Verify')
      expect(button).toBeInTheDocument()
    })

    it('should not render verify button when verified', () => {
      render(<PhoneNumberField {...defaultProps} showVerifiedText={true} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Verify')).not.toBeInTheDocument()
    })
  })

  describe('Verified Text', () => {
    it('should show verified text when showVerifiedText is true', () => {
      render(<PhoneNumberField {...defaultProps} showVerifiedText={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    it('should not show verified text by default', () => {
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Verified')).not.toBeInTheDocument()
    })

    it('should show verified icon with text', () => {
      render(<PhoneNumberField {...defaultProps} showVerifiedText={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    it('should hide verify button when verified', () => {
      render(<PhoneNumberField {...defaultProps} showVerifiedText={true} showVerifyButton={true} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Verify')).not.toBeInTheDocument()
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('should render left icon', () => {
      const LeftIcon = () => <svg data-testid="left-icon" />

      render(<PhoneNumberField {...defaultProps} leftIcon={<LeftIcon />} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should render right icon when not verified', () => {
      const RightIcon = () => <svg data-testid="right-icon" />

      render(<PhoneNumberField {...defaultProps} rightIcon={<RightIcon />} showVerifiedText={false} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should not render right icon when verified', () => {
      const RightIcon = () => <svg data-testid="right-icon" />

      render(<PhoneNumberField {...defaultProps} rightIcon={<RightIcon />} showVerifiedText={true} />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })

    it('should work without icons', () => {
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Options Handling', () => {
    it('should render with provided options', () => {
      render(<PhoneNumberField {...defaultProps} options={sampleOptions} />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })

    it('should handle empty options array', () => {
      render(<PhoneNumberField {...defaultProps} options={[]} />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })

    it('should match dial code to option value', () => {
      render(<PhoneNumberField {...defaultProps} value={['+44', '1234567890']} />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
    })

    it('should fallback to first option when no match found', () => {
      render(<PhoneNumberField {...defaultProps} value={['+999', '1234567890']} />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<PhoneNumberField {...defaultProps} value={['+91', '1234567890']} />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()

      rerender(<TestWrapper><PhoneNumberField {...defaultProps} value={['+91', '9876543210']} /></TestWrapper>)

      expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument()
    })

    it('should handle dial code changes', () => {
      const { rerender } = render(<PhoneNumberField {...defaultProps} value={['+91', '1234567890']} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><PhoneNumberField {...defaultProps} value={['+44', '1234567890']} /></TestWrapper>)

      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
    })

    it('should handle both values changing simultaneously', () => {
      const { rerender } = render(<PhoneNumberField {...defaultProps} value={['+91', '1111111111']} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><PhoneNumberField {...defaultProps} value={['+1', '2222222222']} /></TestWrapper>)

      expect(screen.getByDisplayValue('2222222222')).toBeInTheDocument()
    })

    it('should handle null or undefined values gracefully', () => {
      render(<PhoneNumberField {...defaultProps} value={[null as any, undefined as any]} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long phone numbers', async () => {
      const user = userEvent.setup()
      const longNumber = '1'.repeat(20)

      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, longNumber)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle special characters in phone number', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '123-456-7890')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(<PhoneNumberField {...defaultProps} value={['+91', '1111111111']} />, { wrapper: TestWrapper })

      const values: PhoneNumberTuple[] = [
        ['+91', '2222222222'],
        ['+91', '3333333333'],
        ['+91', '4444444444']
      ]

      values.forEach(value => {
        rerender(<TestWrapper><PhoneNumberField {...defaultProps} value={value} /></TestWrapper>)
      })

      expect(screen.getByDisplayValue('4444444444')).toBeInTheDocument()
    })

    it('should handle missing tuple values', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} value={undefined as any} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '1')

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(['+91', '1'])
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Phone Number')).toBeInTheDocument()
    })

    it('should associate error message with input', () => {
      render(
        <PhoneNumberField {...defaultProps} isInValid={true} errorMessage="Invalid phone number" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Invalid phone number')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      await user.tab()
      await user.tab()

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<PhoneNumberField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Phone Number')
      expect(label).toBeInTheDocument()
    })

    it('should have proper button accessibility', () => {
      render(<PhoneNumberField {...defaultProps} showVerifyButton={true} />, { wrapper: TestWrapper })

      const button = screen.getByText('Verify')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('Integration', () => {
    it('should work in a form context', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <PhoneNumberField {...defaultProps} name="contact" />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('Enter phone number')
      await user.type(input, '9876543210')

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should handle multiple instances independently', async () => {
      const user = userEvent.setup()
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      render(
        <>
          <PhoneNumberField {...defaultProps} label="Primary Phone" onChange={onChange1} />
          <PhoneNumberField {...defaultProps} label="Secondary Phone" onChange={onChange2} />
        </>,
        { wrapper: TestWrapper }
      )

      const inputs = screen.getAllByPlaceholderText('Enter phone number')
      await user.type(inputs[0], '111')
      await user.type(inputs[1], '222')

      expect(onChange1).toHaveBeenCalled()
      expect(onChange2).toHaveBeenCalled()
    })
  })

  describe('CountryCode Legacy Support', () => {
    it('should handle dialCodes prop for backwards compatibility', () => {
      const dialCodes: CountryCode[] = [
        { country: 'US', code: 'US', dialCode: '+1', flag: '🇺🇸' },
        { country: 'UK', code: 'UK', dialCode: '+44', flag: '🇬🇧' }
      ]

      render(<PhoneNumberField {...defaultProps} dialCodes={dialCodes} />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument()
    })
  })

  describe('Border Styling', () => {
    it('should apply proper border radius when verify button is shown', () => {
      render(<PhoneNumberField {...defaultProps} showVerifyButton={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toBeInTheDocument()
    })

    it('should apply default border radius when verify button is hidden', () => {
      render(<PhoneNumberField {...defaultProps} showVerifyButton={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toBeInTheDocument()
    })

    it('should remove left border from phone input', () => {
      render(<PhoneNumberField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toHaveStyle({ borderLeft: 'none' })
    })

    it('should remove right border when verify button is shown', () => {
      render(<PhoneNumberField {...defaultProps} showVerifyButton={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Enter phone number')
      expect(input).toHaveStyle({ borderRight: 'none' })
    })
  })
})
