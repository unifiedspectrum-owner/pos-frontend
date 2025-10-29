/* Comprehensive test suite for SelectedAddonsConfiguration component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import SelectedAddonsConfiguration from '@plan-management/forms/tabs/components/addons/selected-addons-configuration'
import { CreatePlanFormData } from '@plan-management/schemas'
import { Addon } from '@plan-management/types'
import { FieldArrayWithId } from 'react-hook-form'

type AddonAssignmentFieldArray = FieldArrayWithId<CreatePlanFormData, "addon_assignments", "id">

/* Mock shared components */
vi.mock('@shared/components', () => ({
  TextInputField: ({ label, value, onChange, isInValid, errorMessage, required, disabled, name, onBlur }: {
    label: string;
    value: string;
    onChange: (value: { target: { value: string } }) => void;
    isInValid?: boolean;
    errorMessage?: string;
    required?: boolean;
    disabled?: boolean;
    name?: string;
    onBlur?: () => void;
  }) => (
    <div data-testid={`text-input-${label}`}>
      <label>
        {label}
        {required && ' *'}
      </label>
      <input
        value={value}
        onChange={(e) => onChange({ target: { value: e.target.value } })}
        onBlur={onBlur}
        disabled={disabled}
        name={name}
        data-testid={`input-${label}`}
      />
      {isInValid && errorMessage && (
        <span data-testid={`error-${label}`}>{errorMessage}</span>
      )}
    </div>
  ),
  SelectField: ({ label, value, onChange, isInValid, errorMessage, options, name }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    isInValid?: boolean;
    errorMessage?: string;
    options: Array<{ value: string; label: string }>;
    name?: string;
  }) => (
    <div data-testid={`select-${label}`}>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        name={name}
        data-testid={`select-input-${label}`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {isInValid && errorMessage && (
        <span data-testid={`error-${label}`}>{errorMessage}</span>
      )}
    </div>
  ),
  SwitchField: ({ label, value, onChange, isInValid, errorMessage, activeText, inactiveText, name }: {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    isInValid?: boolean;
    errorMessage?: string;
    activeText?: string;
    inactiveText?: string;
    name?: string;
  }) => (
    <div data-testid={`switch-${label}`}>
      <label>{label}</label>
      <button
        onClick={() => onChange(!value)}
        name={name}
        data-testid={`switch-button-${label}`}
      >
        {value ? (activeText || 'On') : (inactiveText || 'Off')}
      </button>
      {isInValid && errorMessage && (
        <span data-testid={`error-${label}`}>{errorMessage}</span>
      )}
    </div>
  )
}))

describe('SelectedAddonsConfiguration', () => {
  const mockOnRemoveAddon = vi.fn()

  /* Helper to create field array items with id */
  const createFieldArrayItem = (addon_id: number, overrides: Partial<Omit<AddonAssignmentFieldArray, 'id'>> = {}): AddonAssignmentFieldArray => ({
    id: `addon-${addon_id}`,
    addon_id,
    default_quantity: null,
    is_included: false,
    feature_level: 'basic',
    min_quantity: null,
    max_quantity: null,
    ...overrides
  })

  const mockAddons: Addon[] = [
    {
      id: 1,
      name: 'Cloud Storage',
      description: 'Additional cloud storage',
      addon_price: 10,
      pricing_scope: 'branch',
      default_quantity: 5,
      is_included: false,
      feature_level: null,
      min_quantity: null,
      max_quantity: null,
      display_order: 1
    },
    {
      id: 2,
      name: 'Analytics Module',
      description: 'Advanced analytics',
      addon_price: 25,
      pricing_scope: 'organization',
      default_quantity: null,
      is_included: false,
      feature_level: null,
      min_quantity: null,
      max_quantity: null,
      display_order: 2
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = ({
    addonAssignments = [],
    addons = mockAddons,
    hasErrors = false
  }: {
    addonAssignments?: AddonAssignmentFieldArray[];
    addons?: Addon[];
    hasErrors?: boolean;
  }) => {
    /* Convert field array items back to plain assignments for form defaults */
    const plainAssignments = addonAssignments.map(({ id, ...rest }) => rest)

    const methods = useForm<CreatePlanFormData>({
      defaultValues: {
        addon_assignments: plainAssignments
      }
    })

    if (hasErrors) {
      React.useEffect(() => {
        methods.setError('addon_assignments', { message: 'At least one addon must be selected' })
      }, [methods])
    }

    return (
      <FormProvider {...methods}>
        <SelectedAddonsConfiguration
          addonAssignments={addonAssignments}
          addons={addons}
          errors={methods.formState.errors}
          control={methods.control}
          onRemoveAddon={mockOnRemoveAddon}
        />
      </FormProvider>
    )
  }

  describe('Visibility', () => {
    it('should return null when no addon assignments', () => {
      render(
        <TestComponent addonAssignments={[]} />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Selected Add-ons Configuration/)).not.toBeInTheDocument()
    })

    it('should render when addon assignments exist', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Selected Add-ons Configuration/)).toBeInTheDocument()
    })
  })

  describe('Header', () => {
    it('should display header with count', () => {
      render(
        <TestComponent
          addonAssignments={[
            createFieldArrayItem(1),
            createFieldArrayItem(2)
          ]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Add-ons Configuration (2)')).toBeInTheDocument()
    })

    it('should update count when assignments change', () => {
      const { rerender } = render(
        <TestComponent addonAssignments={[createFieldArrayItem(1)]} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Add-ons Configuration (1)')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <TestComponent
            addonAssignments={[
              createFieldArrayItem(1),
              createFieldArrayItem(2),
              createFieldArrayItem(3)
            ]}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Selected Add-ons Configuration (3)')).toBeInTheDocument()
    })
  })

  describe('Validation Errors', () => {
    it('should display global validation error', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
          hasErrors={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('At least one addon must be selected')).toBeInTheDocument()
    })

    it('should not display error when no errors exist', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
          hasErrors={false}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText('At least one addon must be selected')).not.toBeInTheDocument()
    })
  })

  describe('Addon Cards', () => {
    it('should render card for each addon assignment', () => {
      render(
        <TestComponent
          addonAssignments={[
            createFieldArrayItem(1),
            createFieldArrayItem(2)
          ]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cloud Storage')).toBeInTheDocument()
      expect(screen.getByText('Analytics Module')).toBeInTheDocument()
    })

    it('should display addon name in card header', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cloud Storage')).toBeInTheDocument()
    })

    it('should display fallback name when addon not found', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(999)]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Add-on #999')).toBeInTheDocument()
    })

    it('should render remove button for each card', () => {
      render(
        <TestComponent
          addonAssignments={[
            createFieldArrayItem(1),
            createFieldArrayItem(2)
          ]}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('svg')
      )
      expect(removeButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Configuration Fields', () => {
    it('should render addon name field as disabled', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      const nameInput = screen.getByTestId('input-Add-on Name')
      expect(nameInput).toBeDisabled()
      expect(nameInput).toHaveValue('Cloud Storage')
    })

    it('should render feature level select field', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('select-Feature Level')).toBeInTheDocument()
      expect(screen.getByTestId('select-input-Feature Level')).toBeInTheDocument()
    })

    it('should render is included toggle field', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('switch-Is Included')).toBeInTheDocument()
      expect(screen.getByTestId('switch-button-Is Included')).toBeInTheDocument()
    })

    it('should render quantity fields', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('text-input-Default Quantity')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Min Quantity')).toBeInTheDocument()
      expect(screen.getByTestId('text-input-Max Quantity')).toBeInTheDocument()
    })
  })

  describe('Field Interactions', () => {
    it('should allow changing feature level', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1, { feature_level: 'basic' })]}
        />,
        { wrapper: TestWrapper }
      )

      const featureLevelSelect = screen.getByTestId('select-input-Feature Level')
      await user.selectOptions(featureLevelSelect, 'custom')

      expect(featureLevelSelect).toHaveValue('custom')
    })

    it('should allow toggling is included switch', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1, { is_included: false })]}
        />,
        { wrapper: TestWrapper }
      )

      const switchButton = screen.getByTestId('switch-button-Is Included')
      expect(switchButton).toHaveTextContent('Optional')

      await user.click(switchButton)

      expect(switchButton).toHaveTextContent('Included')
    })

    it('should allow entering default quantity', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1, { default_quantity: null })]}
        />,
        { wrapper: TestWrapper }
      )

      const quantityInput = screen.getByTestId('input-Default Quantity')
      await user.type(quantityInput, '10')

      expect(quantityInput).toHaveValue('10')
    })

    it('should allow entering min quantity', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1, { min_quantity: null })]}
        />,
        { wrapper: TestWrapper }
      )

      const minInput = screen.getByTestId('input-Min Quantity')
      await user.type(minInput, '5')

      expect(minInput).toHaveValue('5')
    })

    it('should allow entering max quantity', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1, { max_quantity: null })]}
        />,
        { wrapper: TestWrapper }
      )

      const maxInput = screen.getByTestId('input-Max Quantity')
      await user.type(maxInput, '50')

      expect(maxInput).toHaveValue('50')
    })
  })

  describe('Remove Addon', () => {
    it('should call onRemoveAddon when remove button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      const allButtons = screen.getAllByRole('button')
      const removeButton = allButtons.find(btn => btn.querySelector('svg'))

      if (removeButton) {
        await user.click(removeButton)
        expect(mockOnRemoveAddon).toHaveBeenCalledWith(0)
      }
    })

    it('should call onRemoveAddon with correct index', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[
            createFieldArrayItem(1),
            createFieldArrayItem(2)
          ]}
        />,
        { wrapper: TestWrapper }
      )

      const allButtons = screen.getAllByRole('button')
      const removeButtons = allButtons.filter(btn => btn.querySelector('svg'))

      if (removeButtons.length >= 2) {
        await user.click(removeButtons[1])
        expect(mockOnRemoveAddon).toHaveBeenCalledWith(1)
      }
    })
  })

  describe('Multiple Addons', () => {
    it('should render multiple addon configuration cards', () => {
      render(
        <TestComponent
          addonAssignments={[
            createFieldArrayItem(1),
            createFieldArrayItem(2)
          ]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cloud Storage')).toBeInTheDocument()
      expect(screen.getByText('Analytics Module')).toBeInTheDocument()
    })

    it('should maintain separate state for each addon', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[
            createFieldArrayItem(1, { default_quantity: null }),
            createFieldArrayItem(2, { default_quantity: null })
          ]}
        />,
        { wrapper: TestWrapper }
      )

      const quantityInputs = screen.getAllByTestId('input-Default Quantity')

      await user.type(quantityInputs[0], '10')
      await user.type(quantityInputs[1], '20')

      expect(quantityInputs[0]).toHaveValue('10')
      expect(quantityInputs[1]).toHaveValue('20')
    })
  })

  describe('Field Values', () => {
    it('should display existing default quantity value', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1, { default_quantity: 15 })]}
        />,
        { wrapper: TestWrapper }
      )

      const quantityInput = screen.getByTestId('input-Default Quantity')
      expect(quantityInput).toHaveValue('15')
    })

    it('should display existing feature level value', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1, { feature_level: 'custom' })]}
        />,
        { wrapper: TestWrapper }
      )

      const featureLevelSelect = screen.getByTestId('select-input-Feature Level')
      expect(featureLevelSelect).toHaveValue('custom')
    })

    it('should default to basic feature level when not specified', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      const featureLevelSelect = screen.getByTestId('select-input-Feature Level')
      expect(featureLevelSelect).toHaveValue('basic')
    })
  })

  describe('Toggle Text', () => {
    it('should display "Included" when is_included is true', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1, { is_included: true })]}
        />,
        { wrapper: TestWrapper }
      )

      const switchButton = screen.getByTestId('switch-button-Is Included')
      expect(switchButton).toHaveTextContent('Included')
    })

    it('should display "Optional" when is_included is false', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1, { is_included: false })]}
        />,
        { wrapper: TestWrapper }
      )

      const switchButton = screen.getByTestId('switch-button-Is Included')
      expect(switchButton).toHaveTextContent('Optional')
    })
  })

  describe('Integration', () => {
    it('should handle complete addon configuration workflow', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      /* Configure addon */
      await user.selectOptions(screen.getByTestId('select-input-Feature Level'), 'custom')
      await user.click(screen.getByTestId('switch-button-Is Included'))
      await user.type(screen.getByTestId('input-Default Quantity'), '25')
      await user.type(screen.getByTestId('input-Min Quantity'), '10')
      await user.type(screen.getByTestId('input-Max Quantity'), '100')

      /* Verify values */
      expect(screen.getByTestId('select-input-Feature Level')).toHaveValue('custom')
      expect(screen.getByTestId('switch-button-Is Included')).toHaveTextContent('Included')
      expect(screen.getByTestId('input-Default Quantity')).toHaveValue('25')
      expect(screen.getByTestId('input-Min Quantity')).toHaveValue('10')
      expect(screen.getByTestId('input-Max Quantity')).toHaveValue('100')
    })

    it('should handle configuring multiple addons', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[
            createFieldArrayItem(1),
            createFieldArrayItem(2)
          ]}
        />,
        { wrapper: TestWrapper }
      )

      const quantityInputs = screen.getAllByTestId('input-Default Quantity')

      await user.type(quantityInputs[0], '15')
      await user.type(quantityInputs[1], '30')

      expect(quantityInputs[0]).toHaveValue('15')
      expect(quantityInputs[1]).toHaveValue('30')
    })
  })

  describe('Edge Cases', () => {
    it('should handle addon with no matching data', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(999)]}
          addons={mockAddons}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Add-on #999')).toBeInTheDocument()
    })

    it('should handle empty addons array', () => {
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
          addons={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Add-on #1')).toBeInTheDocument()
    })

    it('should handle large quantity values', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      const quantityInput = screen.getByTestId('input-Default Quantity')
      await user.type(quantityInput, '999999')

      expect(quantityInput).toHaveValue('999999')
    })
  })
})
