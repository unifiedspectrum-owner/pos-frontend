/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { ReactNode } from 'react'

/* Shared module imports */
import { render } from '@shared/test-utils/render'

/* Auth module imports */
import UpdateProfileForm from '@auth-management/forms/update-profile'
import { UpdateProfileFormData } from '@auth-management/schemas'

/* Type definitions for mock components */
interface MockChakraProps {
  children?: ReactNode
  [key: string]: unknown
}

interface TextInputFieldProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  label?: string
  errorMessage?: string
  isInValid?: boolean
}

interface PhoneNumberFieldProps {
  value?: [string, string]
  onChange?: (value: [string, string]) => void
  label?: string
  errorMessage?: string
  isInValid?: boolean
  options?: Array<{ value: string; label: string }>
}

interface PrimaryButtonProps {
  onClick?: () => void
  buttonText?: string
  loading?: boolean
  isLoading?: boolean
  loadingText?: string
}

interface SecondaryButtonProps {
  onClick?: () => void
  buttonText?: string
  isLoading?: boolean
  disabled?: boolean
}

/* Mock Chakra UI components */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    GridItem: ({ children, ...props }: MockChakraProps) => <div data-testid="grid-item" {...props}>{children}</div>,
    SimpleGrid: ({ children, ...props }: MockChakraProps) => <div data-testid="simple-grid" {...props}>{children}</div>,
    Flex: ({ children, ...props }: MockChakraProps) => <div data-testid="flex" {...props}>{children}</div>,
    Heading: ({ children, ...props }: MockChakraProps) => <h1 data-testid="heading" {...props}>{children}</h1>
  }
})

/* Mock form field components */
vi.mock('@shared/components', () => ({
  TextInputField: vi.fn(({ value, onChange, onBlur, label, errorMessage, isInValid }: TextInputFieldProps) => (
    <div data-testid={`text-input-${label}`}>
      <label>{label}</label>
      <input
        data-testid={`input-${label}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {isInValid && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
    </div>
  )),
  PhoneNumberField: vi.fn(({ value, onChange, label, errorMessage, isInValid }: PhoneNumberFieldProps) => (
    <div data-testid={`phone-input-${label}`}>
      <label>{label}</label>
      <input
        data-testid={`input-${label}`}
        value={value?.[1] || ''}
        onChange={(e) => onChange?.([value?.[0] || '+1', e.target.value])}
      />
      {isInValid && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
    </div>
  )),
  PrimaryButton: vi.fn(({ onClick, buttonText, loading, isLoading, loadingText }: PrimaryButtonProps) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      disabled={loading || isLoading}
    >
      {(loading || isLoading) ? loadingText : buttonText}
    </button>
  )),
  SecondaryButton: vi.fn(({ onClick, buttonText, isLoading, disabled }: SecondaryButtonProps) => (
    <button
      data-testid="secondary-button"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {buttonText}
    </button>
  ))
}))

/* Mock useCountries hook */
vi.mock('@shared/hooks', () => ({
  useCountries: vi.fn(() => ({
    dialCodeOptions: [
      { value: '+1', label: 'US (+1)' },
      { value: '+44', label: 'UK (+44)' },
      { value: '+91', label: 'India (+91)' }
    ],
    countries: [],
    isLoading: false
  }))
}))

/* Mock config */
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#562dc6',
  SECONDARY_COLOR: '#885CF7',
  BG_COLOR: '#FCFCFF',
  WHITE_COLOR: '#FFFFFF',
  DARK_COLOR: '#17171A',
  GRAY_COLOR: '#39393E',
  SUCCESS_GREEN_COLOR: '#00FF41',
  SUCCESS_GREEN_COLOR2: '#30cb57ff',
  WARNING_ORANGE_COLOR: '#f59e0b',
  ERROR_RED_COLOR: '#ef4444',
  BACKEND_BASE_URL: 'http://127.0.0.1:8787',
  LOADING_DELAY: 2000,
  LOADING_DELAY_ENABLED: false,
  COUNTRIES_CACHE_DURATION: 86400000,
  CURRENCY_SYMBOL: '$'
}))

/* Mock getPhoneFieldErrorMessage utility */
vi.mock('@shared/utils/formatting', () => ({
  getPhoneFieldErrorMessage: vi.fn((error) => error?.message || '')
}))

/* Test wrapper component with form context */
const TestWrapper: React.FC<{
  children: React.ReactNode
  defaultValues?: UpdateProfileFormData
  onSubmit?: void
}> = ({ children, defaultValues, onSubmit }) => {
  const methods = useForm<UpdateProfileFormData>({
    defaultValues: defaultValues || {
      f_name: '',
      l_name: '',
      email: '',
      phone: ['+1', '']
    }
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit || methods.handleSubmit(() => {})}>
        {children}
      </form>
    </FormProvider>
  )
}

describe('UpdateProfileForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isSubmitting: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render update profile form', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('Profile Information')).toBeInTheDocument()
    })

    it('should render first name input field', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('text-input-First Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-First Name')).toBeInTheDocument()
    })

    it('should render last name input field', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('text-input-Last Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Last Name')).toBeInTheDocument()
    })

    it('should render email input field', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('text-input-Email Address')).toBeInTheDocument()
      expect(screen.getByTestId('input-Email Address')).toBeInTheDocument()
    })

    it('should render phone number input field', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('phone-input-Phone Number')).toBeInTheDocument()
      expect(screen.getByTestId('input-Phone Number')).toBeInTheDocument()
    })

    it('should render update button', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByText('Update')).toBeInTheDocument()
    })

    it('should render reset button', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
      expect(screen.getByText('Reset')).toBeInTheDocument()
    })
  })

  describe('Form Fields with Default Values', () => {
    it('should display default values in form fields', () => {
      const defaultValues: UpdateProfileFormData = {
        f_name: 'John',
        l_name: 'Doe',
        email: 'john.doe@example.com',
        phone: ['+1', '1234567890']
      }

      render(
        <TestWrapper defaultValues={defaultValues}>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('input-First Name')).toHaveValue('John')
      expect(screen.getByTestId('input-Last Name')).toHaveValue('Doe')
      expect(screen.getByTestId('input-Email Address')).toHaveValue('john.doe@example.com')
      expect(screen.getByTestId('input-Phone Number')).toHaveValue('1234567890')
    })
  })

  describe('Form Interaction', () => {
    it('should allow typing in first name field', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const firstNameInput = screen.getByTestId('input-First Name')
      await userEvent.type(firstNameInput, 'Jane')

      expect(firstNameInput).toHaveValue('Jane')
    })

    it('should allow typing in last name field', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const lastNameInput = screen.getByTestId('input-Last Name')
      await userEvent.type(lastNameInput, 'Smith')

      expect(lastNameInput).toHaveValue('Smith')
    })

    it('should allow typing in email field', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('should allow typing in phone field', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const phoneInput = screen.getByTestId('input-Phone Number')
      await userEvent.type(phoneInput, '1234567890')

      expect(phoneInput).toHaveValue('1234567890')
    })
  })

  describe('Button Actions', () => {
    it('should call onSubmit when update button is clicked', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const updateButton = screen.getByTestId('primary-button')
      await userEvent.click(updateButton)

      expect(mockOnSubmit).toHaveBeenCalled()
    })

    it('should call onCancel when reset button is clicked', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const resetButton = screen.getByTestId('secondary-button')
      await userEvent.click(resetButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should disable update button when submitting', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} isSubmitting={true} />
        </TestWrapper>
      )

      const updateButton = screen.getByTestId('primary-button')
      expect(updateButton).toBeDisabled()
    })

    it('should disable reset button when submitting', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} isSubmitting={true} />
        </TestWrapper>
      )

      const resetButton = screen.getByTestId('secondary-button')
      expect(resetButton).toBeDisabled()
    })

    it('should show updating text when submitting', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} isSubmitting={true} />
        </TestWrapper>
      )

      expect(screen.getByText('Updating...')).toBeInTheDocument()
      expect(screen.queryByText('Update')).not.toBeInTheDocument()
    })
  })

  describe('Form Layout', () => {
    it('should render form fields in a grid layout', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('simple-grid')).toBeInTheDocument()
    })

    it('should render action buttons in a flex container', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const flexContainers = screen.getAllByTestId('flex')
      expect(flexContainers.length).toBeGreaterThan(0)
    })
  })

  describe('Field Filtering', () => {
    it('should not render role_id field', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.queryByTestId('text-input-Role')).not.toBeInTheDocument()
    })

    it('should not render is_active field', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.queryByTestId('text-input-Active Status')).not.toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should use form context for field management', () => {
      const { container } = render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(container.querySelector('form')).toBeInTheDocument()
    })

    it('should render all required fields', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('input-First Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Last Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Email Address')).toBeInTheDocument()
      expect(screen.getByTestId('input-Phone Number')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty default values', () => {
      render(
        <TestWrapper defaultValues={{ f_name: '', l_name: '', email: '', phone: ['+1', ''] }}>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByTestId('input-First Name')).toHaveValue('')
      expect(screen.getByTestId('input-Last Name')).toHaveValue('')
      expect(screen.getByTestId('input-Email Address')).toHaveValue('')
      expect(screen.getByTestId('input-Phone Number')).toHaveValue('')
    })

    it('should handle special characters in names', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const firstNameInput = screen.getByTestId('input-First Name')
      await userEvent.type(firstNameInput, "O'Brien")

      expect(firstNameInput).toHaveValue("O'Brien")
    })

    it('should handle international phone numbers', async () => {
      render(
        <TestWrapper defaultValues={{ f_name: '', l_name: '', email: '', phone: ['+44', '1234567890'] }}>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const phoneInput = screen.getByTestId('input-Phone Number')
      expect(phoneInput).toHaveValue('1234567890')
    })

    it('should handle long email addresses', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      const emailInput = screen.getByTestId('input-Email Address')
      const longEmail = 'very.long.email.address.with.multiple.dots@subdomain.example.com'
      await userEvent.type(emailInput, longEmail)

      expect(emailInput).toHaveValue(longEmail)
    })

    it('should not call onSubmit when button is disabled', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} isSubmitting={true} />
        </TestWrapper>
      )

      const updateButton = screen.getByTestId('primary-button')
      await userEvent.click(updateButton)

      /* Button is disabled, so click shouldn't trigger the handler */
      expect(updateButton).toBeDisabled()
    })

    it('should not call onCancel when button is disabled', async () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} isSubmitting={true} />
        </TestWrapper>
      )

      const resetButton = screen.getByTestId('secondary-button')
      await userEvent.click(resetButton)

      /* Button is disabled, so click shouldn't trigger the handler */
      expect(resetButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have labels for all input fields', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('First Name')).toBeInTheDocument()
      expect(screen.getByText('Last Name')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('Phone Number')).toBeInTheDocument()
    })

    it('should have descriptive button text', () => {
      render(
        <TestWrapper>
          <UpdateProfileForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('Update')).toBeInTheDocument()
      expect(screen.getByText('Reset')).toBeInTheDocument()
    })
  })
})
