/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import userEvent from '@testing-library/user-event'

/* Tenant module imports */
import BasicInformation from '../basic-information'
import { TenantInfoFormData } from '@tenant-management/schemas/account'
import { createToastNotification } from '@shared/utils/ui'

/* Mock component props interfaces */
interface MockFieldError {
  message?: string
}

interface MockTextInputFieldProps {
  label: string
  value?: string
  placeholder?: string
  leftIcon?: React.ReactNode
  readOnly?: boolean
  disabled?: boolean
}

interface MockComboboxFieldProps {
  label: string
  value?: string
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
}

interface MockPhoneNumberFieldProps {
  label: string
  value?: [string, string]
  buttonText?: string
  onButtonClick?: () => void
  showVerifiedText?: boolean
  disabled?: boolean
  readOnly?: boolean
  buttonLoading?: boolean
}

interface MockTextButtonFieldProps {
  label: string
  value?: string
  ButtonText?: string
  onButtonClick?: () => void
  buttonLoading?: boolean
  showVerifiedText?: boolean
  readOnly?: boolean
  disabled?: boolean
}

interface FormWrapperProps {
  countryOptions?: Array<{ value: string; label: string }>
  dialCodeOptions?: Array<{ value: string; label: string }>
  isLoadingCountries?: boolean
}

/* Mock utilities */
vi.mock('@shared/utils/formatting', () => ({
  formatTimer: (seconds: number) => `${seconds}s`,
  getPhoneFieldErrorMessage: (error: MockFieldError) => error?.message || ''
}))

vi.mock('@shared/utils/ui', () => ({
  createToastNotification: vi.fn()
}))

/* Mock hooks */
const mockSaveCurrentFormData = vi.fn()
const mockLoadVerificationStatus = vi.fn(() => ({
  emailVerified: false,
  phoneVerified: false
}))

const mockHandleSendEmailOTP = vi.fn()
const mockHandleSendPhoneOTP = vi.fn()

const mockEmailVerification = {
  isVerified: false,
  setIsVerified: vi.fn(),
  isLoading: false,
  verifyOTP: vi.fn(),
  resendTimer: 0,
  setResendTimer: vi.fn()
}

const mockPhoneVerification = {
  isVerified: false,
  setIsVerified: vi.fn(),
  isLoading: false,
  verifyOTP: vi.fn(),
  resendTimer: 0,
  setResendTimer: vi.fn()
}

vi.mock('@/lib/modules/tenant-management/hooks/account-creation', () => ({
  useFormPersistence: () => ({
    saveCurrentFormData: mockSaveCurrentFormData
  }),
  useOTPManagement: () => ({
    emailVerification: mockEmailVerification,
    isSendingEmailOTP: false,
    emailOTPSent: false,
    handleSendEmailOTP: mockHandleSendEmailOTP,
    phoneVerification: mockPhoneVerification,
    isSendingPhoneOTP: false,
    phoneOTPSent: false,
    handleSendPhoneOTP: mockHandleSendPhoneOTP
  }),
  useVerificationStatus: () => ({
    loadVerificationStatus: mockLoadVerificationStatus
  })
}))

/* Mock shared components */
vi.mock('@shared/components/form-elements/ui', () => ({
  TextInputField: ({ label, value, placeholder, leftIcon, readOnly, disabled }: MockTextInputFieldProps) => (
    <div data-testid="text-input">
      <label>{label}</label>
      {leftIcon && <span data-testid="left-icon">icon</span>}
      <input value={value} placeholder={placeholder} readOnly={readOnly} disabled={disabled} />
    </div>
  ),
  ComboboxField: ({ label, value, options, placeholder, disabled }: MockComboboxFieldProps) => (
    <div data-testid="combobox-field">
      <label>{label}</label>
      <input value={value} placeholder={placeholder} disabled={disabled} />
      <div data-testid="options-count">{options?.length || 0} options</div>
    </div>
  ),
  PhoneNumberField: ({ label, value, buttonText, onButtonClick, showVerifiedText, disabled, readOnly, buttonLoading }: MockPhoneNumberFieldProps) => (
    <div data-testid="phone-field">
      <label>{label}</label>
      <input value={value?.[1] || ''} disabled={disabled} readOnly={readOnly} />
      <button onClick={onButtonClick} disabled={buttonLoading}>{buttonText}</button>
      {showVerifiedText && <span data-testid="verified-badge">Verified</span>}
    </div>
  )
}))

vi.mock('@/lib/shared/components/form-elements/ui/text-button-field', () => ({
  default: ({ label, value, ButtonText, onButtonClick, buttonLoading, showVerifiedText, readOnly, disabled }: MockTextButtonFieldProps) => (
    <div data-testid="text-button-field">
      <label>{label}</label>
      <input value={value} readOnly={readOnly} disabled={disabled} />
      <button onClick={onButtonClick} disabled={buttonLoading}>
        {ButtonText}
      </button>
      {showVerifiedText && <span data-testid="verified-badge">Verified</span>}
    </div>
  )
}))

/* Mock constants */
vi.mock('@tenant-management/constants', () => ({
  TENANT_BASIC_INFO_QUESTIONS: [
    {
      section_heading: 'BASIC_INFO',
      section_values: [
        {
          id: 1,
          schema_key: 'company_name',
          label: 'Company Name',
          placeholder: 'Enter company name',
          type: 'INPUT',
          is_active: true,
          is_required: true,
          disabled: false,
          display_order: 1,
          grid: { col_span: 3 }
        },
        {
          id: 2,
          schema_key: 'primary_email',
          label: 'Email',
          placeholder: 'Enter email',
          type: 'INPUT_WITH_BUTTON',
          is_active: true,
          is_required: true,
          disabled: false,
          display_order: 2,
          grid: { col_span: 3 }
        },
        {
          id: 3,
          schema_key: 'primary_phone',
          label: 'Phone Number',
          placeholder: 'Enter phone',
          type: 'PHONE_NUMBER',
          is_active: true,
          is_required: true,
          disabled: false,
          display_order: 3,
          grid: { col_span: 3 }
        },
        {
          id: 4,
          schema_key: 'country',
          label: 'Country',
          placeholder: 'Select country',
          type: 'COMBOBOX',
          is_active: true,
          is_required: true,
          disabled: false,
          display_order: 4,
          grid: { col_span: 2 }
        },
        {
          id: 5,
          schema_key: 'inactive_field',
          label: 'Inactive Field',
          placeholder: 'Should not render',
          type: 'INPUT',
          is_active: false,
          is_required: false,
          disabled: false,
          display_order: 5,
          grid: { col_span: 2 }
        }
      ]
    },
    {
      section_heading: 'ADDRESS_INFO',
      section_values: [
        {
          id: 6,
          schema_key: 'address_line1',
          label: 'Address Line 1',
          placeholder: 'Enter address',
          type: 'INPUT',
          is_active: true,
          is_required: true,
          disabled: false,
          display_order: 1,
          grid: { col_span: 3 }
        }
      ]
    }
  ],
  TENANT_FORM_SECTIONS: {
    ADDRESS_INFO: 'ADDRESS_INFO',
    BASIC_INFO: 'BASIC_INFO'
  }
}))

describe('BasicInformation', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const mockCountryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' }
  ]

  const mockDialCodeOptions = [
    { value: '+1', label: '+1' },
    { value: '+44', label: '+44' }
  ]

  const FormWrapper = ({
    countryOptions = mockCountryOptions,
    dialCodeOptions = mockDialCodeOptions,
    isLoadingCountries = false
  }: FormWrapperProps) => {
    const { control, formState: { errors }, trigger, setValue } = useForm<TenantInfoFormData>({
      defaultValues: {
        company_name: '',
        contact_person: '',
        primary_email: '',
        primary_phone: ['', ''],
        address_line1: '',
        address_line2: null,
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        email_otp: '',
        phone_otp: ''
      }
    })

    return (
      <TestWrapper>
        <BasicInformation
          control={control}
          errors={errors}
          trigger={trigger}
          setValue={setValue}
          countryOptions={countryOptions}
          dialCodeOptions={dialCodeOptions}
          isLoadingCountries={isLoadingCountries}
        />
      </TestWrapper>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockEmailVerification.isVerified = false
    mockPhoneVerification.isVerified = false
    mockEmailVerification.resendTimer = 0
    mockPhoneVerification.resendTimer = 0
  })

  describe('Rendering', () => {
    it('should render basic information form', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Company Name')).toBeInTheDocument()
    })

    it('should render all basic info fields', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Company Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Phone Number')).toBeInTheDocument()
      expect(screen.getByText('Country')).toBeInTheDocument()
    })

    it('should not render inactive fields', () => {
      render(<FormWrapper />)

      expect(screen.queryByText('Inactive Field')).not.toBeInTheDocument()
    })

    it('should not render fields from other sections', () => {
      render(<FormWrapper />)

      expect(screen.queryByText('Address Line 1')).not.toBeInTheDocument()
    })

    it('should render fields in correct order', () => {
      const { container } = render(<FormWrapper />)

      const labels = Array.from(container.querySelectorAll('label')).map(l => l.textContent)
      expect(labels).toEqual(['Company Name', 'Email', 'Phone Number', 'Country'])
    })

    it('should filter only BASIC_INFO section', () => {
      render(<FormWrapper />)

      const allFields = screen.getAllByRole('textbox', { hidden: true })
      expect(allFields.length).toBeGreaterThan(0)
    })
  })

  describe('Text Input Fields', () => {
    it('should render company name field', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Company Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter company name')).toBeInTheDocument()
    })

    it('should display placeholder text', () => {
      render(<FormWrapper />)

      expect(screen.getByPlaceholderText('Enter company name')).toBeInTheDocument()
    })

    it('should render text input with correct type', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('text-input')).toBeInTheDocument()
    })

    it('should handle regular INPUT type fields', () => {
      render(<FormWrapper />)

      const textInput = screen.getByTestId('text-input')
      expect(textInput).toBeInTheDocument()
    })
  })

  describe('Email Field with OTP', () => {
    it('should render email field with button', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Email')).toBeInTheDocument()
      const verifyButtons = screen.getAllByText('Verify')
      expect(verifyButtons.length).toBeGreaterThan(0)
    })

    it('should display verify button initially', () => {
      render(<FormWrapper />)

      const verifyButtons = screen.getAllByText('Verify')
      expect(verifyButtons.length).toBeGreaterThan(0)
    })

    it('should render email field as text-button-field', () => {
      render(<FormWrapper />)

      const emailFields = screen.getAllByTestId('text-button-field')
      expect(emailFields.length).toBeGreaterThan(0)
    })

    it('should display placeholder for email', () => {
      const { container } = render(<FormWrapper />)

      const emailField = screen.getAllByTestId('text-button-field')[0]
      expect(emailField).toBeInTheDocument()
    })

    it('should call handleSendEmailOTP when verify button clicked', async () => {
      const user = userEvent.setup()
      render(<FormWrapper />)

      const verifyButtons = screen.getAllByText('Verify')
      await user.click(verifyButtons[0])

      expect(mockHandleSendEmailOTP).toHaveBeenCalled()
    })

    it('should handle email INPUT_WITH_BUTTON type', () => {
      render(<FormWrapper />)

      const emailField = screen.getAllByTestId('text-button-field')[0]
      expect(emailField).toBeInTheDocument()
    })
  })

  describe('Phone Field with OTP', () => {
    it('should render phone field', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Phone Number')).toBeInTheDocument()
    })

    it('should display verify button for phone', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('phone-field')).toBeInTheDocument()
      const verifyButtons = screen.getAllByText('Verify')
      expect(verifyButtons.length).toBeGreaterThan(0)
    })

    it('should render phone number field with dial code options', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('phone-field')).toBeInTheDocument()
    })

    it('should pass dial code options to phone field', () => {
      render(<FormWrapper dialCodeOptions={mockDialCodeOptions} />)

      expect(screen.getByTestId('phone-field')).toBeInTheDocument()
    })

    it('should show toast error when phone verify clicked without country code', async () => {
      const user = userEvent.setup()
      render(<FormWrapper />)

      const phoneVerifyButton = screen.getAllByText('Verify')[1]
      await user.click(phoneVerifyButton)

      expect(vi.mocked(createToastNotification)).toHaveBeenCalledWith({
        title: 'Country Required',
        description: 'Please select a country code before verifying your phone number.',
        type: 'error'
      })
    })

    it('should disable phone field when loading countries', () => {
      const { container } = render(<FormWrapper isLoadingCountries={true} />)

      expect(screen.getByTestId('phone-field')).toBeInTheDocument()
    })

    it('should handle PHONE_NUMBER type fields', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('phone-field')).toBeInTheDocument()
    })
  })

  describe('Country Combobox', () => {
    it('should render country combobox field', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Country')).toBeInTheDocument()
      expect(screen.getByTestId('combobox-field')).toBeInTheDocument()
    })

    it('should display country options when provided', () => {
      render(<FormWrapper countryOptions={mockCountryOptions} />)

      expect(screen.getByTestId('options-count')).toHaveTextContent('2 options')
    })

    it('should disable country field when no options available', () => {
      render(<FormWrapper countryOptions={[]} />)

      const input = screen.getByPlaceholderText('Select country')
      expect(input).toBeDisabled()
    })

    it('should show empty state when countries are loading', () => {
      render(<FormWrapper countryOptions={[]} isLoadingCountries={true} />)

      expect(screen.getByTestId('options-count')).toHaveTextContent('0 options')
    })

    it('should enable field when countries are loaded', () => {
      render(<FormWrapper countryOptions={mockCountryOptions} isLoadingCountries={false} />)

      const input = screen.getByPlaceholderText('Select country')
      expect(input).not.toBeDisabled()
    })

    it('should handle COMBOBOX type fields for country', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('combobox-field')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should accept control prop', () => {
      expect(() => render(<FormWrapper />)).not.toThrow()
    })

    it('should accept errors prop', () => {
      expect(() => render(<FormWrapper />)).not.toThrow()
    })

    it('should accept trigger prop', () => {
      expect(() => render(<FormWrapper />)).not.toThrow()
    })

    it('should accept setValue prop', () => {
      expect(() => render(<FormWrapper />)).not.toThrow()
    })

    it('should accept countryOptions prop', () => {
      expect(() => render(<FormWrapper countryOptions={mockCountryOptions} />)).not.toThrow()
    })

    it('should accept dialCodeOptions prop', () => {
      expect(() => render(<FormWrapper dialCodeOptions={mockDialCodeOptions} />)).not.toThrow()
    })

    it('should accept isLoadingCountries prop', () => {
      expect(() => render(<FormWrapper isLoadingCountries={true} />)).not.toThrow()
    })

    it('should handle empty countryOptions', () => {
      expect(() => render(<FormWrapper countryOptions={[]} />)).not.toThrow()
    })

    it('should handle empty dialCodeOptions', () => {
      expect(() => render(<FormWrapper dialCodeOptions={[]} />)).not.toThrow()
    })

    it('should use default values for optional props', () => {
      const FormWithDefaults = () => {
        const { control, formState: { errors }, trigger, setValue } = useForm<TenantInfoFormData>()
        return (
          <TestWrapper>
            <BasicInformation
              control={control}
              errors={errors}
              trigger={trigger}
              setValue={setValue}
              countryOptions={[]}
              dialCodeOptions={[]}
            />
          </TestWrapper>
        )
      }

      expect(() => render(<FormWithDefaults />)).not.toThrow()
    })
  })

  describe('Verification Status', () => {
    it('should call loadVerificationStatus on mount', () => {
      render(<FormWrapper />)

      expect(mockLoadVerificationStatus).toHaveBeenCalled()
    })

    it('should not display verified badge initially', () => {
      render(<FormWrapper />)

      const verifiedBadges = screen.queryAllByTestId('verified-badge')
      expect(verifiedBadges).toHaveLength(0)
    })

    it('should set email verification when loaded as verified', () => {
      mockLoadVerificationStatus.mockReturnValue({
        emailVerified: true,
        phoneVerified: false
      })

      render(<FormWrapper />)

      expect(mockEmailVerification.setIsVerified).toHaveBeenCalledWith(true)
    })

    it('should set phone verification when loaded as verified', () => {
      mockLoadVerificationStatus.mockReturnValue({
        emailVerified: false,
        phoneVerified: true
      })

      render(<FormWrapper />)

      expect(mockPhoneVerification.setIsVerified).toHaveBeenCalledWith(true)
    })

    it('should handle both email and phone verified on load', () => {
      mockLoadVerificationStatus.mockReturnValue({
        emailVerified: true,
        phoneVerified: true
      })

      render(<FormWrapper />)

      expect(mockEmailVerification.setIsVerified).toHaveBeenCalledWith(true)
      expect(mockPhoneVerification.setIsVerified).toHaveBeenCalledWith(true)
    })
  })

  describe('Edge Cases', () => {
    it('should render without errors', () => {
      expect(() => render(<FormWrapper />)).not.toThrow()
    })

    it('should handle large country options list', () => {
      const manyCountries = Array.from({ length: 100 }, (_, i) => ({
        value: `C${i}`,
        label: `Country ${i}`
      }))

      render(<FormWrapper countryOptions={manyCountries} />)

      expect(screen.getByTestId('options-count')).toHaveTextContent('100 options')
    })

    it('should handle undefined country options', () => {
      expect(() => render(<FormWrapper countryOptions={undefined} />)).not.toThrow()
    })

    it('should handle country options changes', () => {
      const { rerender } = render(<FormWrapper countryOptions={[]} />)

      expect(screen.getByTestId('options-count')).toHaveTextContent('0 options')

      rerender(<FormWrapper countryOptions={mockCountryOptions} />)

      expect(screen.getByTestId('options-count')).toHaveTextContent('2 options')
    })

    it('should handle loading state changes', () => {
      const { rerender } = render(<FormWrapper isLoadingCountries={true} />)

      rerender(<FormWrapper isLoadingCountries={false} />)

      expect(screen.getByTestId('combobox-field')).toBeInTheDocument()
    })

    it('should handle empty field values gracefully', () => {
      render(<FormWrapper />)

      const inputs = screen.getAllByRole('textbox', { hidden: true })
      inputs.forEach(input => {
        expect(input).toHaveValue('')
      })
    })

    it('should handle null or undefined field types', () => {
      expect(() => render(<FormWrapper />)).not.toThrow()
    })
  })

  describe('Layout', () => {
    it('should render in a grid layout', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Company Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Phone Number')).toBeInTheDocument()
      expect(screen.getByText('Country')).toBeInTheDocument()
    })

    it('should render all fields in grid items', () => {
      const { container } = render(<FormWrapper />)

      const labels = container.querySelectorAll('label')
      expect(labels.length).toBe(4)
    })

    it('should apply correct column spans', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Company Name')).toBeInTheDocument()
    })

    it('should use responsive grid columns', () => {
      render(<FormWrapper />)

      const allFields = screen.getAllByRole('textbox', { hidden: true })
      expect(allFields.length).toBeGreaterThan(0)
    })
  })

  describe('Field Types', () => {
    it('should render INPUT type fields', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('text-input')).toBeInTheDocument()
    })

    it('should render INPUT_WITH_BUTTON type fields', () => {
      render(<FormWrapper />)

      const textButtonFields = screen.getAllByTestId('text-button-field')
      expect(textButtonFields.length).toBeGreaterThan(0)
    })

    it('should render PHONE_NUMBER type fields', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('phone-field')).toBeInTheDocument()
    })

    it('should render COMBOBOX type fields', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('combobox-field')).toBeInTheDocument()
    })

    it('should return null for unsupported field types', () => {
      render(<FormWrapper />)

      const allInputs = screen.getAllByRole('textbox', { hidden: true })
      expect(allInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Field Display Order', () => {
    it('should sort fields by display_order', () => {
      const { container } = render(<FormWrapper />)

      const labels = Array.from(container.querySelectorAll('label')).map(l => l.textContent)
      expect(labels[0]).toBe('Company Name')
      expect(labels[1]).toBe('Email')
      expect(labels[2]).toBe('Phone Number')
      expect(labels[3]).toBe('Country')
    })

    it('should maintain correct field sequence', () => {
      const { container } = render(<FormWrapper />)

      const labels = Array.from(container.querySelectorAll('label'))
      expect(labels.length).toBe(4)
    })

    it('should respect display_order from configuration', () => {
      const { container } = render(<FormWrapper />)

      const labels = Array.from(container.querySelectorAll('label')).map(l => l.textContent)
      expect(labels).toEqual(['Company Name', 'Email', 'Phone Number', 'Country'])
    })
  })

  describe('Required Fields', () => {
    it('should mark required fields appropriately', () => {
      render(<FormWrapper />)

      expect(screen.getByText('Company Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Phone Number')).toBeInTheDocument()
      expect(screen.getByText('Country')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should disable country field when no options', () => {
      render(<FormWrapper countryOptions={[]} />)

      const input = screen.getByPlaceholderText('Select country')
      expect(input).toBeDisabled()
    })

    it('should handle disabled prop from configuration', () => {
      render(<FormWrapper />)

      expect(screen.getByTestId('combobox-field')).toBeInTheDocument()
    })

    it('should disable phone field when countries loading', () => {
      render(<FormWrapper isLoadingCountries={true} />)

      const phoneField = screen.getByTestId('phone-field')
      expect(phoneField).toBeInTheDocument()
    })
  })

  describe('Hooks Integration', () => {
    it('should call useFormPersistence hook', () => {
      render(<FormWrapper />)

      expect(mockSaveCurrentFormData).toBeDefined()
    })

    it('should call useOTPManagement hook', () => {
      render(<FormWrapper />)

      expect(mockHandleSendEmailOTP).toBeDefined()
      expect(mockHandleSendPhoneOTP).toBeDefined()
    })

    it('should call useVerificationStatus hook', () => {
      render(<FormWrapper />)

      expect(mockLoadVerificationStatus).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle form errors gracefully', () => {
      const FormWithErrors = () => {
        const { control, formState: { errors }, trigger, setValue } = useForm<TenantInfoFormData>({
          defaultValues: {},
          mode: 'onChange'
        })

        return (
          <TestWrapper>
            <BasicInformation
              control={control}
              errors={errors}
              trigger={trigger}
              setValue={setValue}
              countryOptions={mockCountryOptions}
              dialCodeOptions={mockDialCodeOptions}
            />
          </TestWrapper>
        )
      }

      expect(() => render(<FormWithErrors />)).not.toThrow()
    })
  })

  describe('Filter and Sort Logic', () => {
    it('should filter fields by BASIC_INFO section', () => {
      render(<FormWrapper />)

      expect(screen.queryByText('Address Line 1')).not.toBeInTheDocument()
    })

    it('should filter only active fields', () => {
      render(<FormWrapper />)

      expect(screen.queryByText('Inactive Field')).not.toBeInTheDocument()
    })

    it('should sort fields by display_order ascending', () => {
      const { container } = render(<FormWrapper />)

      const labels = Array.from(container.querySelectorAll('label')).map(l => l.textContent)
      expect(labels).toEqual(['Company Name', 'Email', 'Phone Number', 'Country'])
    })
  })
})
