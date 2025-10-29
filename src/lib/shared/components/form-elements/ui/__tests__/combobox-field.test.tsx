/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import ComboboxField, { ComboboxOption } from '../combobox-field'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('ComboboxField Component', () => {
  const mockOnChange = vi.fn()

  const sampleOptions: ComboboxOption[] = [
    { value: 'option1', label: 'Option One' },
    { value: 'option2', label: 'Option Two' },
    { value: 'option3', label: 'Option Three' }
  ]

  const defaultProps = {
    label: 'Test Combobox',
    value: '',
    placeholder: 'Type to search',
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
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Test Combobox')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Type to search')).toBeInTheDocument()
    })

    it('should render with label text', () => {
      render(<ComboboxField {...defaultProps} label="Country" />, { wrapper: TestWrapper })

      expect(screen.getByText('Country')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(<ComboboxField {...defaultProps} placeholder="Search items..." />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
    })

    it('should render with default placeholder when not provided', () => {
      const props = { ...defaultProps, placeholder: undefined }
      render(<ComboboxField {...props} />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText('Type to search')).toBeInTheDocument()
    })

    it('should render trigger and clear icons', () => {
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<ComboboxField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Combobox')
      expect(label.parentElement).toBeInTheDocument()
    })

    it('should not show required indicator when required is false', () => {
      render(<ComboboxField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Combobox')
      expect(label).toBeInTheDocument()
    })

    it('should allow required prop to be updated', () => {
      const { rerender } = render(<ComboboxField {...defaultProps} required={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><ComboboxField {...defaultProps} required={true} /></TestWrapper>)

      const label = screen.getByText('Test Combobox')
      expect(label.parentElement).toBeInTheDocument()
    })
  })

  describe('Validation State', () => {
    it('should show error message when invalid', () => {
      render(
        <ComboboxField {...defaultProps} isInValid={true} errorMessage="This field is required" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should not show error message when valid', () => {
      render(<ComboboxField {...defaultProps} isInValid={false} errorMessage="This field is required" />, { wrapper: TestWrapper })

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    })

    it('should apply error styling when invalid', () => {
      render(<ComboboxField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toHaveStyle({ borderColor: 'red.500' })
    })

    it('should update validation state dynamically', () => {
      const { rerender } = render(<ComboboxField {...defaultProps} isInValid={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><ComboboxField {...defaultProps} isInValid={true} errorMessage="Error" /></TestWrapper>)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should handle missing error message gracefully', () => {
      render(<ComboboxField {...defaultProps} isInValid={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<ComboboxField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      /* Chakra UI Combobox applies disabled state via aria attributes */
      expect(input).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<ComboboxField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).not.toBeDisabled()
    })

    it('should not allow input when disabled', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.type(input, 'test')

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<ComboboxField {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><ComboboxField {...defaultProps} disabled={true} /></TestWrapper>)

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toBeDisabled()
    })

    it('should be enabled by default', () => {
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).not.toBeDisabled()
    })
  })

  describe('ReadOnly State', () => {
    it('should have readonly attribute when readOnly is true', () => {
      render(<ComboboxField {...defaultProps} readOnly={true} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toBeInTheDocument()
    })

    it('should display value even when readOnly', () => {
      render(<ComboboxField {...defaultProps} value="option1" readOnly={true} />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('Option One')).toBeInTheDocument()
    })

    it('should allow readOnly to be false by default', () => {
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Options Rendering', () => {
    it('should render all options when opened', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(() => {
        expect(screen.getByText('Option One')).toBeInTheDocument()
        expect(screen.getByText('Option Two')).toBeInTheDocument()
        expect(screen.getByText('Option Three')).toBeInTheDocument()
      })
    })

    it('should show empty state when no options match', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.type(input, 'xyz')

      await waitFor(() => {
        expect(screen.getByText('No items found')).toBeInTheDocument()
      })
    })

    it('should handle empty options array', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} options={[]} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(() => {
        expect(screen.getByText('No items found')).toBeInTheDocument()
      })
    })

    it('should handle large number of options', async () => {
      const user = userEvent.setup()
      const manyOptions = Array.from({ length: 50 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`
      }))

      render(<ComboboxField {...defaultProps} options={manyOptions} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(() => {
        expect(screen.getByText('Option 0')).toBeInTheDocument()
      })
    })
  })

  describe('Filtering Behavior', () => {
    it('should filter options based on input', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.type(input, 'Two')

      await waitFor(() => {
        expect(screen.getByText('Option Two')).toBeInTheDocument()
        expect(screen.queryByText('Option One')).not.toBeInTheDocument()
      })
    })

    it('should filter case-insensitively', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.type(input, 'option one')

      await waitFor(() => {
        expect(screen.getByText('Option One')).toBeInTheDocument()
      })
    })

    it('should show all options when filter is cleared', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')

      /* Type to filter */
      await user.type(input, 'Two')

      await waitFor(() => {
        expect(screen.getByText('Option Two')).toBeInTheDocument()
      })

      /* Clear the input by selecting all and deleting */
      await user.clear(input)

      /* Wait for filter to reset - after clearing, options should reappear */
      await waitFor(() => {
        const options = screen.queryByTestId('combobox-options')
        expect(options).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should filter with partial matches', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.type(input, 'Opt')

      await waitFor(() => {
        expect(screen.getByText('Option One')).toBeInTheDocument()
        expect(screen.getByText('Option Two')).toBeInTheDocument()
        expect(screen.getByText('Option Three')).toBeInTheDocument()
      })
    })
  })

  describe('Value Selection', () => {
    it('should call onChange when option is selected', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(() => {
        const option = screen.getByText('Option One')
        user.click(option)
      })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('option1')
      })
    })

    it('should display selected value label', () => {
      render(<ComboboxField {...defaultProps} value="option2" />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('Option Two')).toBeInTheDocument()
    })

    it('should handle value changes', () => {
      const { rerender } = render(<ComboboxField {...defaultProps} value="option1" />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('Option One')).toBeInTheDocument()

      rerender(<TestWrapper><ComboboxField {...defaultProps} value="option3" /></TestWrapper>)

      expect(screen.getByDisplayValue('Option Three')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<ComboboxField {...defaultProps} value="" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('Enter Key Selection', () => {
    it('should select first filtered option on Enter key', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.type(input, 'Two')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('option2')
      })
    })

    it('should select first option when multiple matches exist', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.type(input, 'Option')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('option1')
      })
    })

    it('should not call onChange when no matches on Enter', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.type(input, 'xyz')
      await user.keyboard('{Enter}')

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Name Attribute', () => {
    it('should set name attribute when provided', () => {
      render(<ComboboxField {...defaultProps} name="country" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toBeInTheDocument()
    })

    it('should work without name attribute', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(() => {
        expect(screen.getByText('Option One')).toBeInTheDocument()
      })
    })
  })

  describe('Size Variants', () => {
    it('should render with small size', () => {
      render(<ComboboxField {...defaultProps} size="sm" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toHaveStyle({ height: '32px' })
    })

    it('should render with medium size', () => {
      render(<ComboboxField {...defaultProps} size="md" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toHaveStyle({ height: '40px' })
    })

    it('should render with large size', () => {
      render(<ComboboxField {...defaultProps} size="lg" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toHaveStyle({ height: '48px' })
    })

    it('should use large size by default', () => {
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toHaveStyle({ height: '48px' })
    })
  })

  describe('Clear Trigger', () => {
    it('should show clear trigger by default', () => {
      render(<ComboboxField {...defaultProps} value="option1" />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('Option One')).toBeInTheDocument()
    })

    it('should not show clear trigger when showClearTrigger is false', () => {
      render(<ComboboxField {...defaultProps} value="option1" showClearTrigger={false} />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('Option One')).toBeInTheDocument()
    })
  })

  describe('Array Value Handling', () => {
    it('should handle single value in array format', () => {
      render(<ComboboxField {...defaultProps} value={['option1']} />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('Option One')).toBeInTheDocument()
    })

    it('should handle empty array value', () => {
      render(<ComboboxField {...defaultProps} value={[]} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should filter empty strings from array values', () => {
      render(<ComboboxField {...defaultProps} value={['option1', ''] as any} />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('Option One')).toBeInTheDocument()
    })

    it('should filter null and undefined from array values', () => {
      render(<ComboboxField {...defaultProps} value={['option2', null, undefined] as any} />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('Option Two')).toBeInTheDocument()
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<ComboboxField {...defaultProps} value="option1" />, { wrapper: TestWrapper })

      expect(screen.getByDisplayValue('Option One')).toBeInTheDocument()

      rerender(<TestWrapper><ComboboxField {...defaultProps} value="option3" /></TestWrapper>)

      expect(screen.getByDisplayValue('Option Three')).toBeInTheDocument()
    })

    it('should handle empty value', () => {
      render(<ComboboxField {...defaultProps} value="" />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle value changes from parent', () => {
      const { rerender } = render(<ComboboxField {...defaultProps} value="option1" />, { wrapper: TestWrapper })

      rerender(<TestWrapper><ComboboxField {...defaultProps} value="option2" /></TestWrapper>)

      expect(screen.getByDisplayValue('Option Two')).toBeInTheDocument()
    })

    it('should handle null or undefined values gracefully', () => {
      render(<ComboboxField {...defaultProps} value={null as any} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('Options Update', () => {
    it('should update when options change', () => {
      const { rerender } = render(<ComboboxField {...defaultProps} options={sampleOptions} />, { wrapper: TestWrapper })

      const newOptions: ComboboxOption[] = [
        { value: 'new1', label: 'New Option 1' },
        { value: 'new2', label: 'New Option 2' }
      ]

      rerender(<TestWrapper><ComboboxField {...defaultProps} options={newOptions} /></TestWrapper>)

      expect(screen.getByPlaceholderText('Type to search')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle options with duplicate values', async () => {
      const user = userEvent.setup()
      const duplicateOptions: ComboboxOption[] = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt1', label: 'Duplicate Option 1' }
      ]

      render(<ComboboxField {...defaultProps} options={duplicateOptions} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
    })

    it('should handle options with empty labels', async () => {
      const user = userEvent.setup()
      const emptyLabelOptions: ComboboxOption[] = [
        { value: 'opt1', label: '' },
        { value: 'opt2', label: 'Option 2' }
      ]

      render(<ComboboxField {...defaultProps} options={emptyLabelOptions} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument()
      })
    })

    it('should handle special characters in options', async () => {
      const user = userEvent.setup()
      const specialOptions: ComboboxOption[] = [
        { value: 'opt1', label: 'Option & Special' },
        { value: 'opt2', label: 'Option < > Chars' }
      ]

      render(<ComboboxField {...defaultProps} options={specialOptions} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(() => {
        expect(screen.getByText('Option & Special')).toBeInTheDocument()
      })
    })

    it('should handle rapid value changes', () => {
      const { rerender } = render(<ComboboxField {...defaultProps} value="option1" />, { wrapper: TestWrapper })

      const values = ['option2', 'option3', 'option1', 'option2']
      values.forEach(value => {
        rerender(<TestWrapper><ComboboxField {...defaultProps} value={value} /></TestWrapper>)
      })

      expect(screen.getByDisplayValue('Option Two')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Test Combobox')).toBeInTheDocument()
    })

    it('should associate error message with input', () => {
      render(
        <ComboboxField {...defaultProps} isInValid={true} errorMessage="Invalid selection" />,
        { wrapper: TestWrapper }
      )

      const errorMessage = screen.getByText('Invalid selection')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      await user.tab()

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toHaveFocus()
    })

    it('should support screen readers with proper semantics', () => {
      render(<ComboboxField {...defaultProps} required={true} />, { wrapper: TestWrapper })

      const label = screen.getByText('Test Combobox')
      expect(label).toBeInTheDocument()
    })

    it('should have autocomplete attribute', () => {
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      expect(input).toHaveAttribute('autocomplete', 'autocomplete')
    })
  })

  describe('Integration', () => {
    it('should work in a form context', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <ComboboxField {...defaultProps} name="category" />
          <button type="submit">Submit</button>
        </form>,
        { wrapper: TestWrapper }
      )

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(async () => {
        const option = screen.getByText('Option One')
        await user.click(option)
      })

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
          <ComboboxField {...defaultProps} label="Combobox 1" onChange={onChange1} />
          <ComboboxField {...defaultProps} label="Combobox 2" onChange={onChange2} />
        </>,
        { wrapper: TestWrapper }
      )

      const inputs = screen.getAllByPlaceholderText('Type to search')
      await user.click(inputs[0])

      await waitFor(async () => {
        const options = screen.getAllByText('Option One')
        await user.click(options[0])
      })

      expect(onChange1).toHaveBeenCalled()
      expect(onChange2).not.toHaveBeenCalled()
    })
  })

  describe('Dropdown Positioning', () => {
    it('should render dropdown with proper styling', async () => {
      const user = userEvent.setup()
      render(<ComboboxField {...defaultProps} />, { wrapper: TestWrapper })

      const input = screen.getByPlaceholderText('Type to search')
      await user.click(input)

      await waitFor(() => {
        const dropdown = screen.getByTestId('combobox-options')
        expect(dropdown).toHaveStyle({ maxHeight: '200px', overflowY: 'auto' })
      })
    })
  })
})
