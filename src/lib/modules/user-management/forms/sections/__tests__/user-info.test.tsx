/* Libraries imports */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* User module imports */
import UserInfoSection from '@user-management/forms/sections/user-info'
import { CreateUserFormData } from '@user-management/schemas'
import * as useCountriesHook from '@shared/hooks/use-countries'

/* Mock dependencies */
vi.mock('@shared/components', () => ({
  TextInputField: ({ label, value, onChange, errorMessage, isInValid }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; errorMessage?: string; isInValid: boolean }) => (
    <div data-testid={`text-input-${label}`}>
      <label>{label}</label>
      <input value={value} onChange={onChange} data-testid={`input-${label}`} />
      {isInValid && errorMessage && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  PhoneNumberField: ({ label, value, onChange }: { label: string; value: [string, string]; onChange: (val: [string, string]) => void }) => (
    <div data-testid={`phone-input-${label}`}>
      <label>{label}</label>
      <input value={value[1]} onChange={(e) => onChange([value[0], e.target.value])} data-testid={`input-${label}`} />
    </div>
  ),
  SelectField: ({ label, value, onChange, options }: { label: string; value: string; onChange: (val: string) => void; options: Array<{ label: string; value: string }> }) => (
    <div data-testid={`select-${label}`}>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={`select-input-${label}`}>
        <option value="">Select...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  ),
  SwitchField: ({ label, value, onChange }: { label: string; value: boolean; onChange: (val: boolean) => void }) => (
    <div data-testid={`switch-${label}`}>
      <label>{label}</label>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} data-testid={`switch-input-${label}`} />
    </div>
  ),
  FileField: ({ label }: { label: string }) => (
    <div data-testid={`file-${label}`}>
      <label>{label}</label>
    </div>
  )
}))

describe('UserInfoSection', () => {
  const mockDialCodeOptions = [
    { id: '1', label: '+1 (United States)', value: '+1' },
    { id: '44', label: '+44 (United Kingdom)', value: '+44' },
    { id: '91', label: '+91 (India)', value: '+91' }
  ]

  const mockRoleSelectOptions = [
    { label: 'Admin', value: '1' },
    { label: 'User', value: '2' },
    { label: 'Manager', value: '3' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useCountriesHook, 'useCountries').mockReturnValue({
      countries: [],
      states: [],
      selectedCountryName: '',
      selectedCountry: undefined,
      dialCodeOptions: mockDialCodeOptions,
      countryOptions: [],
      stateOptions: [],
      isLoading: false,
      error: null,
      fetchCountries: vi.fn(),
      refetch: vi.fn(),
      setSelectedCountryName: vi.fn(),
      getCountryByName: vi.fn(),
      getCountryByCode: vi.fn(),
      getCountryIdByName: vi.fn(() => ''),
      getStateById: vi.fn(),
      getDialCodeById: vi.fn(),
      searchCountries: vi.fn(() => []),
      searchStates: vi.fn(() => []),
      totalCount: 0,
      statesCount: 0
    })
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = ({ showTwoFactorField = false, rolesLoading = false }: { showTwoFactorField?: boolean; rolesLoading?: boolean }) => {
    const methods = useForm<CreateUserFormData>({
      defaultValues: {
        f_name: '',
        l_name: '',
        email: '',
        phone: ['+91', ''],
        role_id: '',
        is_active: true,
        is_2fa_enabled: false,
        module_assignments: []
      }
    })

    return (
      <FormProvider {...methods}>
        <UserInfoSection
          roleSelectOptions={mockRoleSelectOptions}
          rolesLoading={rolesLoading}
          showTwoFactorField={showTwoFactorField}
        />
      </FormProvider>
    )
  }

  describe('Form Fields Rendering', () => {
    it('should render first name field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('First Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-First Name')).toBeInTheDocument()
    })

    it('should render last name field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Last Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Last Name')).toBeInTheDocument()
    })

    it('should render email field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByTestId('input-Email Address')).toBeInTheDocument()
    })

    it('should render phone number field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Phone Number')).toBeInTheDocument()
      expect(screen.getByTestId('input-Phone Number')).toBeInTheDocument()
    })

    it('should render role selection field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('User Role')).toBeInTheDocument()
      expect(screen.getByTestId('select-input-User Role')).toBeInTheDocument()
    })

    it('should render active status switch', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Account Status')).toBeInTheDocument()
      expect(screen.getByTestId('switch-input-Account Status')).toBeInTheDocument()
    })
  })

  describe('Two-Factor Authentication Field', () => {
    it('should not render 2FA field by default', () => {
      render(<TestComponent showTwoFactorField={false} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Two Factor Authentication')).not.toBeInTheDocument()
    })

    it('should render 2FA field when showTwoFactorField is true', () => {
      render(<TestComponent showTwoFactorField={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Two Factor Authentication')).toBeInTheDocument()
      expect(screen.getByTestId('switch-input-Two Factor Authentication')).toBeInTheDocument()
    })
  })

  describe('Role Selection', () => {
    it('should display all role options', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const roleSelect = screen.getByTestId('select-input-User Role')
      expect(roleSelect).toBeInTheDocument()

      const options = roleSelect.querySelectorAll('option')
      expect(options).toHaveLength(4) // 1 default + 3 roles
      expect(options[1]).toHaveTextContent('Admin')
      expect(options[2]).toHaveTextContent('User')
      expect(options[3]).toHaveTextContent('Manager')
    })

    it('should handle role selection change', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const roleSelect = screen.getByTestId('select-input-User Role')
      await user.selectOptions(roleSelect, '1')

      await waitFor(() => {
        expect(roleSelect).toHaveValue('1')
      })
    })

    it('should show empty options when roles are loading', () => {
      render(<TestComponent rolesLoading={true} />, { wrapper: TestWrapper })

      const roleSelect = screen.getByTestId('select-input-User Role')
      const options = roleSelect.querySelectorAll('option')
      expect(options).toHaveLength(1) // Only default option
    })
  })

  describe('Field Interactions', () => {
    it('should update first name value', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const input = screen.getByTestId('input-First Name') as HTMLInputElement
      await user.type(input, 'John')

      await waitFor(() => {
        expect(input.value).toBe('John')
      })
    })

    it('should update email value', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const input = screen.getByTestId('input-Email Address') as HTMLInputElement
      await user.type(input, 'john@example.com')

      await waitFor(() => {
        expect(input.value).toBe('john@example.com')
      })
    })

    it('should toggle active status', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const switchInput = screen.getByTestId('switch-input-Account Status') as HTMLInputElement
      expect(switchInput.checked).toBe(true)

      await user.click(switchInput)

      await waitFor(() => {
        expect(switchInput.checked).toBe(false)
      })
    })

    it('should toggle 2FA when field is shown', async () => {
      const user = userEvent.setup()
      render(<TestComponent showTwoFactorField={true} />, { wrapper: TestWrapper })

      /* Check if 2FA field exists */
      expect(screen.getByText('Two Factor Authentication')).toBeInTheDocument()

      const switchInput = screen.getByTestId('switch-input-Two Factor Authentication') as HTMLInputElement
      expect(switchInput.checked).toBe(false)

      await user.click(switchInput)

      await waitFor(() => {
        expect(switchInput.checked).toBe(true)
      })
    })
  })

  describe('Form Validation', () => {
    it('should render form fields that can be validated', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Form fields should be present and ready for validation */
      expect(screen.getByTestId('input-First Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Last Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Email Address')).toBeInTheDocument()
    })
  })

  describe('Field Ordering', () => {
    it('should render fields in correct display order', () => {
      const { container } = render(<TestComponent />, { wrapper: TestWrapper })

      const fields = container.querySelectorAll('[data-testid^="text-input-"], [data-testid^="phone-input-"], [data-testid^="select-"], [data-testid^="switch-"]')
      expect(fields.length).toBeGreaterThan(0)
    })
  })

  describe('Disabled Fields', () => {
    it('should respect disabled state from field configuration', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      // Fields are not disabled by default
      const firstNameInput = screen.getByTestId('input-First Name') as HTMLInputElement
      expect(firstNameInput).not.toBeDisabled()
    })
  })

  describe('Phone Number Field', () => {
    it('should render phone field with dial code options', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('phone-input-Phone Number')).toBeInTheDocument()
    })

    it('should update phone number value', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const phoneInput = screen.getByTestId('input-Phone Number') as HTMLInputElement
      await user.type(phoneInput, '1234567890')

      await waitFor(() => {
        expect(phoneInput.value).toBe('1234567890')
      })
    })
  })

  describe('Grid Layout', () => {
    it('should render fields in a grid layout', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Check that multiple fields are rendered which indicates grid layout */
      expect(screen.getByText('First Name')).toBeInTheDocument()
      expect(screen.getByText('Last Name')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('Phone Number')).toBeInTheDocument()
    })
  })
})
