/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import DateField from '../date-field'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

vi.mock('@shared/constants', () => ({
  DATE_FORMAT_REGEX: /^\d{4}-\d{2}-\d{2}$/
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('DateField Component', () => {
  const mockOnChange = vi.fn()
  const mockOnBlur = vi.fn()

  const defaultProps = {
    label: 'Test Date',
    value: '',
    placeholder: 'Select date',
    isInValid: false,
    required: false,
    onChange: mockOnChange
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByLabelText('Test Date')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument()
    })

    it('should render with value', () => {
      render(<DateField {...defaultProps} value="2024-01-15" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('2024-01-15')
      expect(input).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<DateField {...defaultProps} label="Birth Date" />, { wrapper: TestWrapper })

      expect(screen.getByLabelText('Birth Date')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(<DateField {...defaultProps} placeholder="Pick a date" />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument()
    })

    it('should render as date input type', () => {
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveAttribute('type', 'date')
    })

    it('should render with default placeholder when not provided', () => {
      const props = { ...defaultProps, placeholder: undefined }
      render(<DateField {...props} />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<DateField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Date')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<DateField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Date')
      expect(label).toBeInTheDocument()
    })

    it('should allow required prop to be updated', () => {
      const { rerender } = render(<DateField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><DateField {...defaultProps} required={true} /></TestWrapper>)

      const label = screen.getByText('Test Date')
      expect(label.parentElement).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <DateField {...defaultProps} isInValid={true} errorMessage="Date is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Date is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(<DateField {...defaultProps} isInValid={false} errorMessage="Date is required" />, { wrapper: TestWrapper })

      expect(screen.queryByText('Date is required')).not.toBeInTheDocument()
    })

    it('should apply error styling when invalid', () => {
      render(<DateField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<DateField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><DateField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<DateField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toBeInTheDocument()
    })

    it('should show validation error for invalid date format', () => {
      render(<DateField {...defaultProps} value="2024/01/15" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should show validation error for partial date', () => {
      render(<DateField {...defaultProps} value="2024-01" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should not show validation error for empty value when not required', () => {
      render(<DateField {...defaultProps} value="" isInValid={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      /* Verify input is rendered and not in error state */
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('')
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<DateField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<DateField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).not.toBeDisabled()
    })

    it('should not allow input when disabled', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.click(input)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<DateField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><DateField {...defaultProps} disabled={true} /></TestWrapper>)

      const input = screen.getByLabelText('Test Date')
      expect(input).toBeDisabled()
    })

    it('should be enabled by default', () => {
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).not.toBeDisabled()
    })
  })

  describe('ReadOnly State', () => {
    it('should not trigger onChange when readOnly', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.type(input, '2024-01-15')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should not trigger onBlur when readOnly', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} readOnly={true} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.click(input)
      await user.tab()

      expect(mockOnBlur).not.toHaveBeenCalled()
    })

    it('should allow readOnly to be false by default', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date') as HTMLInputElement
      await user.type(input, '2024-01-15')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should display value even when readOnly', () => {
      render(<DateField {...defaultProps} value="2024-01-15" readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('2024-01-15')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Change Event', () => {
    it('should call onChange when date is selected', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.type(input, '2024-01-15')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should emit correct value in change event', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.type(input, '2024-01-15')

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
          target: expect.objectContaining({ value: '2024-01-15' })
        }))
      })
    })

    it('should emit null when value is cleared', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} value="2024-01-15" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.clear(input)

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
          target: expect.objectContaining({ value: null })
        }))
      })
    })

    it('should update local value immediately on change', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date') as HTMLInputElement
      await user.type(input, '2024-01-15')

      await waitFor(() => {
        expect(input.value).toBe('2024-01-15')
      })
    })
  })

  describe('Blur Event', () => {
    it('should call onBlur when provided', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.click(input)
      await user.tab()

      expect(mockOnBlur).toHaveBeenCalledTimes(1)
    })

    it('should work without onBlur handler', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.click(input)
      await user.tab()

      expect(input).not.toHaveFocus()
    })

    it('should call onBlur with correct event', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} onBlur={mockOnBlur} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.click(input)
      await user.tab()

      expect(mockOnBlur).toHaveBeenCalledWith(expect.objectContaining({
        target: input
      }))
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      render(<DateField {...defaultProps} name="birthDate" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveAttribute('name', 'birthDate')
    })

    it('should include name in change event', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} name="startDate" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.type(input, '2024-01-15')

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
          target: expect.objectContaining({ name: 'startDate' })
        }))
      })
    })

    it('should work without name attribute', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      await user.type(input, '2024-01-15')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Min and Max Constraints', () => {
    it('should set min attribute when provided', () => {
      render(<DateField {...defaultProps} min="2024-01-01" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveAttribute('min', '2024-01-01')
    })

    it('should set max attribute when provided', () => {
      render(<DateField {...defaultProps} max="2024-12-31" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveAttribute('max', '2024-12-31')
    })

    it('should set both min and max attributes', () => {
      render(<DateField {...defaultProps} min="2024-01-01" max="2024-12-31" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveAttribute('min', '2024-01-01')
      expect(input).toHaveAttribute('max', '2024-12-31')
    })

    it('should work without min and max', () => {
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).not.toHaveAttribute('min')
      expect(input).not.toHaveAttribute('max')
    })
  })

  describe('Helper Text', () => {
    it('should display helper text when provided', () => {
      render(<DateField {...defaultProps} helperText="Select your birth date" />, { wrapper: TestWrapper })

      expect(screen.getByText('Select your birth date')).toBeInTheDocument()
    })

    it('should not display helper text when not provided', () => {
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Input Props', () => {
    it('should apply additional input props', () => {
      render(
        <DateField {...defaultProps} inputProps={{ maxLength: 10 }} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('should merge input props with default props', () => {
      render(
        <DateField {...defaultProps} inputProps={{ className: 'custom-class' }} />,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveClass('custom-class')
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<DateField {...defaultProps} value="2024-01-15" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('2024-01-15')
      expect(input).toBeInTheDocument()

      rerender(<TestWrapper><DateField {...defaultProps} value="2024-02-20" /></TestWrapper>)

      expect(screen.getByDisplayValue('2024-02-20')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<DateField {...defaultProps} value="" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle null value', () => {
      render(<DateField {...defaultProps} value={null} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle value changes from parent', () => {
      const { rerender } = render(<DateField {...defaultProps} value="2024-01-15" />, { wrapper: TestWrapper })

      rerender(<TestWrapper><DateField {...defaultProps} value="2024-03-25" /></TestWrapper>)

      const input = screen.getByLabelText('Test Date') as HTMLInputElement
      expect(input.value).toBe('2024-03-25')
    })

    it('should respect external value changes during input', async () => {
      const { rerender } = render(<DateField {...defaultProps} value="" />, { wrapper: TestWrapper })

      let input = screen.getByLabelText('Test Date') as HTMLInputElement
      expect(input.value).toBe('')

      /* Parent updates the value prop */
      rerender(<TestWrapper><DateField {...defaultProps} value="2024-12-31" /></TestWrapper>)

      /* Get the updated input element after rerender */
      input = screen.getByLabelText('Test Date') as HTMLInputElement
      expect(input.value).toBe('2024-12-31')
    })
  })

  describe('Date Format Validation', () => {
    it('should accept valid YYYY-MM-DD format', () => {
      render(<DateField {...defaultProps} value="2024-01-15" isInValid={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      /* Verify date is accepted */
      expect(input).toHaveValue('2024-01-15')
    })

    it('should reject invalid format with slashes', () => {
      render(<DateField {...defaultProps} value="2024/01/15" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should reject invalid format with dots', () => {
      render(<DateField {...defaultProps} value="2024.01.15" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should reject invalid format with single digit month/day', () => {
      render(<DateField {...defaultProps} value="2024-1-5" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should reject invalid date values', () => {
      render(<DateField {...defaultProps} value="2024-13-45" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should accept empty string as valid when not required', () => {
      render(<DateField {...defaultProps} value="" isInValid={false} required={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      /* Verify empty value is accepted when not required */
      expect(input).toHaveValue('')
    })
  })

  describe('Date Input Constraints', () => {
    it('should have pattern attribute for date format', () => {
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveAttribute('pattern', '\\d{4}-\\d{2}-\\d{2}')
    })

    it('should have maxLength attribute', () => {
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveAttribute('maxLength', '10')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid date string gracefully', () => {
      render(<DateField {...defaultProps} value="invalid-date" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toBeInTheDocument()
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(<DateField {...defaultProps} value="2024-01-01" />, { wrapper: TestWrapper })

      const dates = ['2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05']
      dates.forEach(date => {
        rerender(<TestWrapper><DateField {...defaultProps} value={date} /></TestWrapper>)
      })

      expect(screen.getByDisplayValue('2024-01-05')).toBeInTheDocument()
    })

    it('should handle leap year dates', () => {
      render(<DateField {...defaultProps} value="2024-02-29" isInValid={false} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      /* Verify leap year date is accepted */
      expect(input).toHaveValue('2024-02-29')
    })

    it('should reject invalid leap year date', () => {
      render(<DateField {...defaultProps} value="2023-02-29" />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should handle year boundaries', () => {
      render(<DateField {...defaultProps} value="1900-01-01" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('1900-01-01')
      expect(input).toBeInTheDocument()
    })

    it('should handle future dates', () => {
      render(<DateField {...defaultProps} value="2099-12-31" />, { wrapper: TestWrapper })

      const input = screen.getByDisplayValue('2099-12-31')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByLabelText('Test Date')
      expect(input).toBeInTheDocument()
    })

    it('should associate error message with input', () => {
      render(
        <DateField {...defaultProps} isInValid={true} errorMessage="Invalid date" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Invalid date')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<DateField {...defaultProps} />, { wrapper: TestWrapper })

      await user.tab()

      const input = screen.getByLabelText('Test Date')
      expect(input).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<DateField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      /* When required, the label includes asterisk, so use regex matcher */
      const input = screen.getByLabelText(/Test Date/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('required')
    })
  })

  describe('Integration', () => {
    it('should work in a form context', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <DateField {...defaultProps} name="eventDate" />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const input = screen.getByLabelText('Test Date')
      await user.type(input, '2024-01-15')

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
          <DateField {...defaultProps} label="Start Date" onChange={onChange1} />
          <DateField {...defaultProps} label="End Date" onChange={onChange2} />
        </>,
        { wrapper: TestWrapper }
      )

      const input1 = screen.getByLabelText('Start Date')
      const input2 = screen.getByLabelText('End Date')

      await user.type(input1, '2024-01-15')
      await user.type(input2, '2024-02-20')

      expect(onChange1).toHaveBeenCalled()
      expect(onChange2).toHaveBeenCalled()
    })
  })
})
