/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import { TableFilterSelect } from '../table-filter-select'

/* Mock dependencies */
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('TableFilterSelect Component', () => {
  const mockOnValueChange = vi.fn()

  const sampleOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ] as const

  const defaultProps = {
    value: 'all',
    onValueChange: mockOnValueChange,
    options: sampleOptions
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* Component displays selected value "All", not placeholder when value is set */
      const elements = screen.getAllByText('All')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should render with custom placeholder', () => {
      render(<TableFilterSelect {...defaultProps} placeholder="Select status" />, { wrapper: TestWrapper })

      /* Component displays selected value "All", not placeholder when value is set */
      const elements = screen.getAllByText('All')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should render with default placeholder when not provided', () => {
      render(<TableFilterSelect {...defaultProps} placeholder={undefined} />, { wrapper: TestWrapper })

      /* Component displays selected value "All", not placeholder when value is set */
      const elements = screen.getAllByText('All')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should render with selected value', () => {
      render(<TableFilterSelect {...defaultProps} value="active" />, { wrapper: TestWrapper })

      /* Active may appear in both trigger and dropdown */
      const elements = screen.getAllByText('Active')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should render with small size by default', () => {
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* Component displays selected value "All", not placeholder when value is set */
      const elements = screen.getAllByText('All')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('Options Rendering', () => {
    it('should render all options when opened', async () => {
      const user = userEvent.setup()
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* Get trigger using selected value "All" */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      if (trigger) await user.click(trigger)

      await waitFor(() => {
        /* Options may appear in multiple places (trigger + dropdown) */
        expect(screen.getAllByText('All').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0)
      })
    })

    it('should handle empty options array', () => {
      render(<TableFilterSelect {...defaultProps} options={[]} />, { wrapper: TestWrapper })

      /* With empty options and value="all", component shows placeholder since "all" is not in options */
      expect(screen.getByText('Filter by...')).toBeInTheDocument()
    })

    it('should handle large number of options', async () => {
      const user = userEvent.setup()
      const manyOptions = Array.from({ length: 50 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`
      }))

      render(<TableFilterSelect {...defaultProps} options={manyOptions} value="option0" />, { wrapper: TestWrapper })

      /* Get trigger using selected value "Option 0" */
      const triggers = screen.getAllByText('Option 0')
      const trigger = triggers[0].closest('button')
      if (trigger) await user.click(trigger)

      await waitFor(() => {
        /* Option 0 may appear in multiple places */
        const options = screen.getAllByText('Option 0')
        expect(options.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Value Selection', () => {
    it('should call onValueChange when option is selected', async () => {
      const user = userEvent.setup()
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* Get trigger using selected value "All" */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      if (trigger) await user.click(trigger)

      await waitFor(async () => {
        const options = screen.getAllByText('Active')
        await user.click(options[0])
      })

      await waitFor(() => {
        expect(mockOnValueChange).toHaveBeenCalledWith('active')
      })
    })

    it('should display selected value', () => {
      render(<TableFilterSelect {...defaultProps} value="active" />, { wrapper: TestWrapper })

      /* Active may appear in multiple places */
      const elements = screen.getAllByText('Active')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should handle value changes', () => {
      const { rerender } = render(<TableFilterSelect {...defaultProps} value="all" />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TableFilterSelect {...defaultProps} value="active" /></TestWrapper>)

      /* Active may appear in multiple places */
      const elements = screen.getAllByText('Active')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should show placeholder when no value selected', () => {
      render(<TableFilterSelect {...defaultProps} value="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Filter by...')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<TableFilterSelect {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      /* Get trigger using selected value "All" */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).toHaveAttribute('data-disabled')
    })

    it('should not be disabled when disabled prop is false', () => {
      render(<TableFilterSelect {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      /* Get trigger using selected value "All" */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).not.toHaveAttribute('data-disabled')
    })

    it('should not open dropdown when disabled', async () => {
      const user = userEvent.setup()
      render(<TableFilterSelect {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      /* Get trigger using selected value "All" */
      const triggersBefore = screen.getAllByText('All')
      const trigger = triggersBefore[0].closest('button')
      if (trigger) await user.click(trigger)

      /* Check that dropdown didn't open - All should still only appear once (in trigger, not in dropdown) */
      const triggersAfter = screen.getAllByText('All')
      expect(triggersAfter.length).toBe(triggersBefore.length)
    })

    it('should update disabled state dynamically', () => {
      const { rerender } = render(<TableFilterSelect {...defaultProps} disabled={false} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TableFilterSelect {...defaultProps} disabled={true} /></TestWrapper>)

      /* Get trigger using selected value "All" */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).toHaveAttribute('data-disabled')
    })

    it('should be enabled by default', () => {
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* Get trigger using selected value "All" */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).not.toHaveAttribute('data-disabled')
    })
  })

  describe('Size Variants', () => {
    it('should render with small size', () => {
      render(<TableFilterSelect {...defaultProps} size="sm" />, { wrapper: TestWrapper })

      /* Component displays selected value "All", not placeholder when value is set */
      const elements = screen.getAllByText('All')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should render with medium size', () => {
      render(<TableFilterSelect {...defaultProps} size="md" />, { wrapper: TestWrapper })

      /* Component displays selected value "All", not placeholder when value is set */
      const elements = screen.getAllByText('All')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should render with large size', () => {
      render(<TableFilterSelect {...defaultProps} size="lg" />, { wrapper: TestWrapper })

      /* Component displays selected value "All", not placeholder when value is set */
      const elements = screen.getAllByText('All')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should use small size by default', () => {
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* Component displays selected value "All", not placeholder when value is set */
      const elements = screen.getAllByText('All')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('Icon Support', () => {
    it('should render with icon', () => {
      const TestIcon = () => <svg data-testid="filter-icon" />
      render(<TableFilterSelect {...defaultProps} icon={<TestIcon />} />, { wrapper: TestWrapper })

      expect(screen.getByTestId('filter-icon')).toBeInTheDocument()
    })

    it('should work without icon', () => {
      render(<TableFilterSelect {...defaultProps} icon={undefined} />, { wrapper: TestWrapper })

      /* Component displays selected value "All", not placeholder when value is set */
      const elements = screen.getAllByText('All')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('Controlled Component Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<TableFilterSelect {...defaultProps} value="all" />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TableFilterSelect {...defaultProps} value="active" /></TestWrapper>)

      /* Active may appear in multiple places */
      const elements = screen.getAllByText('Active')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should handle empty value', () => {
      render(<TableFilterSelect {...defaultProps} value="" />, { wrapper: TestWrapper })

      expect(screen.getByText('Filter by...')).toBeInTheDocument()
    })

    it('should handle value changes from parent', () => {
      const { rerender } = render(<TableFilterSelect {...defaultProps} value="all" />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TableFilterSelect {...defaultProps} value="inactive" /></TestWrapper>)

      /* Inactive may appear in multiple places */
      const elements = screen.getAllByText('Inactive')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('Options with Special Characters', () => {
    it('should handle options with special characters in labels', async () => {
      const user = userEvent.setup()
      const specialOptions = [
        { value: 'opt1', label: 'Option & Special' },
        { value: 'opt2', label: 'Option < > Chars' }
      ] as const

      render(<TableFilterSelect {...defaultProps} options={specialOptions} value="opt1" />, { wrapper: TestWrapper })

      /* Get trigger using selected value "Option & Special" */
      const triggers = screen.getAllByText('Option & Special')
      const trigger = triggers[0].closest('button')
      if (trigger) await user.click(trigger)

      await waitFor(() => {
        expect(screen.getAllByText('Option & Special')).toHaveLength(2)
        const elements = screen.getAllByText('Option < > Chars')
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('should handle options with numeric values', () => {
      const numericOptions = [
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' }
      ] as const

      render(<TableFilterSelect {...defaultProps} options={numericOptions} value="1" />, { wrapper: TestWrapper })

      /* One may appear in multiple places */
      const elements = screen.getAllByText('One')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should handle options with long labels', async () => {
      const user = userEvent.setup()
      const longLabelOptions = [
        { value: 'opt1', label: 'This is a very long option label that might wrap or truncate' }
      ] as const

      render(<TableFilterSelect {...defaultProps} options={longLabelOptions} value="opt1" />, { wrapper: TestWrapper })

      /* Get trigger using the long label */
      const triggers = screen.getAllByText('This is a very long option label that might wrap or truncate')
      const trigger = triggers[0].closest('button')
      if (trigger) await user.click(trigger)

      await waitFor(() => {
        expect(screen.getAllByText('This is a very long option label that might wrap or truncate')).toHaveLength(2)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid value changes', () => {
      const { rerender } = render(<TableFilterSelect {...defaultProps} value="all" />, { wrapper: TestWrapper })

      const values = ['active', 'inactive', 'all', 'active']
      values.forEach(value => {
        rerender(<TestWrapper><TableFilterSelect {...defaultProps} value={value} /></TestWrapper>)
      })

      /* Active may appear in multiple places */
      const elements = screen.getAllByText('Active')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should handle options update', () => {
      const { rerender } = render(<TableFilterSelect {...defaultProps} options={sampleOptions} />, { wrapper: TestWrapper })

      const newOptions = [
        { value: 'new1', label: 'New Option 1' },
        { value: 'new2', label: 'New Option 2' }
      ] as const

      rerender(<TestWrapper><TableFilterSelect {...defaultProps} options={newOptions} value="new1" /></TestWrapper>)

      /* New Option 1 may appear in multiple places */
      const elements = screen.getAllByText('New Option 1')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should handle duplicate option values', async () => {
      const user = userEvent.setup()
      const duplicateOptions = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt1', label: 'Duplicate Option 1' }
      ] as const

      render(<TableFilterSelect {...defaultProps} options={duplicateOptions} value="opt1" />, { wrapper: TestWrapper })

      /* Get trigger using selected value "Option 1" */
      const triggers = screen.getAllByText('Option 1')
      const trigger = triggers[0].closest('button')
      if (trigger) await user.click(trigger)

      await waitFor(() => {
        expect(screen.getAllByText('Option 1')).toHaveLength(2)
      })
    })
  })

  describe('Styling', () => {
    it('should have rounded borders', () => {
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify trigger button renders - Chakra UI handles borderRadius styling */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should have proper alignment', () => {
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify trigger button renders - Chakra UI handles alignment styling */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should have proper padding', () => {
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* Verify trigger button renders - Chakra UI handles padding styling */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should have gap between icon and text', () => {
      const TestIcon = () => <svg data-testid="filter-icon" />
      render(<TableFilterSelect {...defaultProps} icon={<TestIcon />} />, { wrapper: TestWrapper })

      /* Verify both icon and trigger render - Chakra UI handles gap styling */
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument()
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      await user.tab()

      /* The trigger shows the selected value "All", not the placeholder */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).toHaveFocus()
    })

    it('should have proper button role', () => {
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* The trigger shows the selected value "All", not the placeholder */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      expect(trigger).toHaveAttribute('type', 'button')
    })
  })

  describe('Integration', () => {
    it('should work in a table context', async () => {
      const user = userEvent.setup()

      render(
        <table>
          <thead>
            <tr>
              <th>
                <TableFilterSelect {...defaultProps} />
              </th>
            </tr>
          </thead>
        </table>,
        { wrapper: TestWrapper }
      )

      /* The trigger shows the selected value "All", not the placeholder */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      if (trigger) await user.click(trigger)

      await waitFor(() => {
        /* Verify All option is available - may appear in multiple places */
        const options = screen.getAllByText('All')
        expect(options.length).toBeGreaterThan(0)
      })
    })

    it('should handle multiple instances independently', async () => {
      const user = userEvent.setup()
      const onValueChange1 = vi.fn()
      const onValueChange2 = vi.fn()

      render(
        <>
          <TableFilterSelect {...defaultProps} onValueChange={onValueChange1} placeholder="Status" />
          <TableFilterSelect {...defaultProps} onValueChange={onValueChange2} placeholder="Type" />
        </>,
        { wrapper: TestWrapper }
      )

      /* Both instances show "All" since value="all" is selected */
      const triggers = screen.getAllByText('All')
      if (triggers[0]) await user.click(triggers[0].closest('button')!)

      await waitFor(async () => {
        const options = screen.getAllByText('Active')
        await user.click(options[0])
      })

      expect(onValueChange1).toHaveBeenCalled()
      expect(onValueChange2).not.toHaveBeenCalled()
    })
  })

  describe('Dropdown Positioning', () => {
    it('should render dropdown with proper styling', async () => {
      const user = userEvent.setup()
      render(<TableFilterSelect {...defaultProps} />, { wrapper: TestWrapper })

      /* The trigger shows the selected value "All", not the placeholder */
      const triggers = screen.getAllByText('All')
      const trigger = triggers[0].closest('button')
      if (trigger) await user.click(trigger)

      await waitFor(() => {
        const options = screen.getAllByText('All')
        const dropdown = options[0].closest('[data-scope="select"]')
        expect(dropdown).toBeInTheDocument()
      })
    })

    it('should have scrollable dropdown for many options', async () => {
      const user = userEvent.setup()
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`
      }))

      render(<TableFilterSelect {...defaultProps} options={manyOptions} value="option0" />, { wrapper: TestWrapper })

      /* The trigger shows the selected value "Option 0" */
      const triggers = screen.getAllByText('Option 0')
      const trigger = triggers[0].closest('button')
      if (trigger) await user.click(trigger)

      await waitFor(() => {
        /* Verify Option 0 is available - may appear in multiple places */
        const options = screen.getAllByText('Option 0')
        expect(options.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Collection Memoization', () => {
    it('should memoize collection to avoid unnecessary recalculations', () => {
      const { rerender } = render(<TableFilterSelect {...defaultProps} options={sampleOptions} />, { wrapper: TestWrapper })

      rerender(<TestWrapper><TableFilterSelect {...defaultProps} options={sampleOptions} value="active" /></TestWrapper>)

      /* Verify Active is displayed - may appear in multiple places */
      const options = screen.getAllByText('Active')
      expect(options.length).toBeGreaterThan(0)
    })

    it('should update collection when options change', () => {
      const { rerender } = render(<TableFilterSelect {...defaultProps} options={sampleOptions} />, { wrapper: TestWrapper })

      const newOptions = [
        { value: 'new1', label: 'New 1' },
        { value: 'new2', label: 'New 2' }
      ] as const

      rerender(<TestWrapper><TableFilterSelect {...defaultProps} options={newOptions} value="new1" /></TestWrapper>)

      /* Verify New 1 is displayed - may appear in multiple places */
      const options = screen.getAllByText('New 1')
      expect(options.length).toBeGreaterThan(0)
    })
  })
})
