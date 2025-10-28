/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Tenant module imports */
import AddressInformation from '../address-information'
import { TenantInfoFormData } from '@tenant-management/schemas/account'
import { ComboboxOption } from '@/lib/shared/components/form-elements/ui/combobox-field'

/* Mock component props interfaces */
interface MockTextInputFieldProps {
  label: string
  value?: string
  placeholder?: string
}

interface MockSelectOption {
  value: string
  label: string
}

interface MockSelectFieldProps {
  label: string
  value?: string
  options: MockSelectOption[]
}

interface MockTextAreaFieldProps {
  label: string
  value?: string
}

interface MockComboboxFieldProps {
  label: string
  value?: string
  options?: ComboboxOption[]
  placeholder?: string
}

/* Mock shared components */
vi.mock('@shared/components/form-elements/ui', () => ({
  TextInputField: ({ label, value, placeholder }: MockTextInputFieldProps) => (
    <div data-testid="text-input">
      <label>{label}</label>
      <input value={value} placeholder={placeholder} />
    </div>
  ),
  SelectField: ({ label, value, options }: MockSelectFieldProps) => (
    <div data-testid="select-field">
      <label>{label}</label>
      <select value={value}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  ),
  TextAreaField: ({ label, value }: MockTextAreaFieldProps) => (
    <div data-testid="textarea-field">
      <label>{label}</label>
      <textarea value={value} />
    </div>
  ),
  ComboboxField: ({ label, value, options, placeholder }: MockComboboxFieldProps) => (
    <div data-testid="combobox-field">
      <label>{label}</label>
      <input value={value} placeholder={placeholder} />
      <div>{options?.length || 0} options</div>
    </div>
  )
}))

/* Mock constants */
vi.mock('@tenant-management/constants', () => ({
  TENANT_BASIC_INFO_QUESTIONS: [
    {
      section_heading: 'ADDRESS_INFO',
      section_values: [
        {
          id: 1,
          schema_key: 'address_line1',
          label: 'Address Line 1',
          placeholder: 'Enter address',
          type: 'INPUT',
          is_active: true,
          is_required: true,
          disabled: false,
          display_order: 1,
          grid: { col_span: 3 }
        },
        {
          id: 2,
          schema_key: 'address_line2',
          label: 'Address Line 2',
          placeholder: 'Apartment, suite, etc',
          type: 'INPUT',
          is_active: true,
          is_required: false,
          disabled: false,
          display_order: 2,
          grid: { col_span: 3 }
        },
        {
          id: 3,
          schema_key: 'state_province',
          label: 'State/Province',
          placeholder: 'Select state',
          type: 'COMBOBOX',
          is_active: true,
          is_required: true,
          disabled: false,
          display_order: 3,
          grid: { col_span: 2 }
        }
      ]
    }
  ],
  TENANT_FORM_SECTIONS: {
    ADDRESS_INFO: 'ADDRESS_INFO',
    BASIC_INFO: 'BASIC_INFO'
  }
}))

describe('AddressInformation', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  interface FormWrapperProps {
    stateOptions?: ComboboxOption[]
    countryValue?: string
  }

  const FormWrapper = ({ stateOptions = [], countryValue = '' }: FormWrapperProps) => {
    const { control, formState: { errors } } = useForm<TenantInfoFormData>({
      defaultValues: {
        address_line1: '',
        address_line2: '',
        state_province: ''
      }
    })

    return (
      <TestWrapper>
        <AddressInformation
          control={control}
          errors={errors}
          stateOptions={stateOptions}
          countryValue={countryValue}
        />
      </TestWrapper>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render address information form', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Address Line 1')).toBeInTheDocument()
    })

    it('should render all address fields', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Address Line 1')).toBeInTheDocument()
      expect(screen.getByText('Address Line 2')).toBeInTheDocument()
      expect(screen.getByText('State/Province')).toBeInTheDocument()
    })

    it('should render fields in correct order', () => {
      const { container } = render(<FormWrapper />)

      const labels = Array.from(container.querySelectorAll('label')).map(l => l.textContent)
      expect(labels).toEqual(['Address Line 1', 'Address Line 2', 'State/Province'])
    })
  })

  describe('Input Fields', () => {
    it('should render text input fields', () => {
      render(<FormWrapper />)

      expect(screen.getAllByTestId('text-input')).toHaveLength(2)
    })

    it('should display placeholder text', () => {
      render(<FormWrapper />)

      expect(screen.getByPlaceholderText('Enter address')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Apartment, suite, etc')).toBeInTheDocument()
    })
  })

  describe('State/Province Combobox', () => {
    it('should render state combobox field', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('combobox-field')).toBeInTheDocument()
    })

    it('should display state options when provided', () => {
      const stateOptions = [
        { value: 'CA', label: 'California' },
        { value: 'NY', label: 'New York' }
      ]

      render(<FormWrapper stateOptions={stateOptions} countryValue="US" />)

      expect(screen.getByText('2 options')).toBeInTheDocument()
    })

    it('should show empty placeholder when no country selected', () => {
      render(<FormWrapper stateOptions={[]} countryValue="" />)

      expect(screen.getByPlaceholderText('Select country first')).toBeInTheDocument()
    })

    it('should show no states placeholder when country has no states', () => {
      render(<FormWrapper stateOptions={[]} countryValue="SG" />)

      expect(screen.getByPlaceholderText('No states available')).toBeInTheDocument()
    })

    it('should be disabled when no country is selected', () => {
      const { container } = render(<FormWrapper stateOptions={[]} countryValue="" />)

      expect(screen.getByPlaceholderText('Select country first')).toBeInTheDocument()
    })

    it('should be disabled when no state options available', () => {
      const { container } = render(<FormWrapper stateOptions={[]} countryValue="SG" />)

      expect(screen.getByPlaceholderText('No states available')).toBeInTheDocument()
    })

    it('should display normal placeholder when states available', () => {
      const stateOptions = [{ value: 'CA', label: 'California' }]

      render(<FormWrapper stateOptions={stateOptions} countryValue="US" />)

      expect(screen.getByPlaceholderText('Select state')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should accept control prop', () => {
      expect(() => render(<FormWrapper />)).not.toThrow()
    })

    it('should accept errors prop', () => {
      expect(() => render(<FormWrapper />)).not.toThrow()
    })

    it('should accept stateOptions prop', () => {
      const stateOptions = [{ value: 'CA', label: 'California' }]

      expect(() => render(<FormWrapper stateOptions={stateOptions} />)).not.toThrow()
    })

    it('should accept countryValue prop', () => {
      expect(() => render(<FormWrapper countryValue="US" />)).not.toThrow()
    })

    it('should handle empty stateOptions', () => {
      expect(() => render(<FormWrapper stateOptions={[]} />)).not.toThrow()
    })

    it('should handle undefined countryValue', () => {
      expect(() => render(<FormWrapper countryValue={undefined} />)).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should render without errors', () => {
      expect(() => render(<FormWrapper />)).not.toThrow()
    })

    it('should handle large state options list', () => {
      const manyStates = Array.from({ length: 50 }, (_, i) => ({
        value: `S${i}`,
        label: `State ${i}`
      }))

      render(<FormWrapper stateOptions={manyStates} countryValue="XX" />)

      expect(screen.getByText('50 options')).toBeInTheDocument()
    })

    it('should update when country value changes', () => {
      const { rerender } = render(<FormWrapper countryValue="" />)

      expect(screen.getByPlaceholderText('Select country first')).toBeInTheDocument()

      rerender(<FormWrapper countryValue="US" />)

      expect(screen.getByPlaceholderText('No states available')).toBeInTheDocument()
    })

    it('should update when stateOptions change', () => {
      const { rerender } = render(
        <FormWrapper stateOptions={[]} countryValue="US" />
      )

      expect(screen.getByText('0 options')).toBeInTheDocument()

      const newStates = [{ value: 'CA', label: 'California' }]
      rerender(<FormWrapper stateOptions={newStates} countryValue="US" />)

      expect(screen.getByText('1 options')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render in a grid layout', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Address Line 1')).toBeInTheDocument()
      expect(screen.getByText('Address Line 2')).toBeInTheDocument()
      expect(screen.getByText('State/Province')).toBeInTheDocument()
    })

    it('should render all fields in grid items', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Address Line 1')).toBeInTheDocument()
      expect(screen.getByText('Address Line 2')).toBeInTheDocument()
      expect(screen.getByText('State/Province')).toBeInTheDocument()
    })
  })
})
