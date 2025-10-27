/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UseFormReturn, FieldErrors } from 'react-hook-form'
import { ReactNode } from 'react'

/* Auth module imports */
import VerifyOTPStep from '@auth-management/forms/two-factor-steps/verify-otp'
import { Enable2FAFormData } from '@auth-management/schemas'

/* Type definitions for mock components */
interface MockChakraProps {
  children?: ReactNode
  [key: string]: unknown
}

interface PrimaryButtonProps {
  onClick?: () => void
  buttonText?: string
  disabled?: boolean
  isLoading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

interface SecondaryButtonProps {
  onClick?: () => void
  buttonText?: string
  disabled?: boolean
}

interface PinInputFieldProps {
  value?: string[]
  onChange?: (value: string[]) => void
  errorMessage?: string
  isInValid?: boolean
  autoFocus?: boolean
  disabled?: boolean
}

/* Mock Chakra UI components */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    VStack: ({ children, ...props }: MockChakraProps) => <div data-testid="vstack" {...props}>{children}</div>,
    HStack: ({ children, ...props }: MockChakraProps) => <div data-testid="hstack" {...props}>{children}</div>,
    Box: ({ children, ...props }: MockChakraProps) => <div data-testid="box" {...props}>{children}</div>,
    Heading: ({ children, ...props }: MockChakraProps) => <h1 data-testid="heading" {...props}>{children}</h1>,
    Text: ({ children, ...props }: MockChakraProps) => <p data-testid="text" {...props}>{children}</p>,
    SimpleGrid: ({ children, ...props }: MockChakraProps) => <div data-testid="simple-grid" {...props}>{children}</div>,
    GridItem: ({ children, ...props }: MockChakraProps) => <div data-testid="grid-item" {...props}>{children}</div>
  }
})

/* Mock shared components */
vi.mock('@shared/components', () => ({
  PrimaryButton: vi.fn(({ onClick, buttonText, disabled, isLoading, type }: PrimaryButtonProps) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      disabled={disabled || isLoading}
      type={type}
    >
      {buttonText}
    </button>
  )),
  SecondaryButton: vi.fn(({ onClick, buttonText, disabled }: SecondaryButtonProps) => (
    <button
      data-testid="secondary-button"
      onClick={onClick}
      disabled={disabled}
    >
      {buttonText}
    </button>
  )),
  PinInputField: vi.fn(({ value, onChange, errorMessage, isInValid, autoFocus, disabled }: PinInputFieldProps) => (
    <div data-testid="pin-input-field">
      <input
        data-testid="pin-input"
        value={value?.join('') || ''}
        onChange={(e) => onChange?.(e.target.value.split(''))}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      {isInValid && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
    </div>
  ))
}))

/* Mock constants */
vi.mock('@auth-management/constants', () => ({
  ENABLE_2FA_FORM_QUESTIONS: [
    {
      id: 1,
      schema_key: 'code',
      label: 'Verification Code',
      type: 'pin',
      is_active: true,
      is_required: true,
      display_order: 1,
      grid: { col_span: 1 }
    }
  ]
}))

vi.mock('@shared/constants', () => ({
  FORM_FIELD_TYPES: {
    PIN: 'pin',
    TEXT: 'text',
    EMAIL: 'email',
    PASSWORD: 'password'
  }
}))

/* Type definitions for react-hook-form mocks */
interface ControllerRenderProps {
  field: {
    value: string[]
    onChange: () => void
    onBlur: () => void
    name: string
    ref: () => void
  }
}

interface ControllerProps {
  render: (props: ControllerRenderProps) => ReactNode
  name: string
  control: unknown
}

/* Mock react-hook-form Controller */
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form')
  return {
    ...actual,
    Controller: ({ render, name }: ControllerProps) => {
      const mockField = {
        value: [],
        onChange: vi.fn(),
        onBlur: vi.fn(),
        name,
        ref: vi.fn()
      }
      return render({ field: mockField })
    }
  }
})

describe('VerifyOTPStep', () => {
  const mockOnSubmit = vi.fn()
  const mockOnBack = vi.fn()

  const createMockMethods = (
    defaultValues: Partial<Enable2FAFormData> = {},
    errors: FieldErrors<Enable2FAFormData> = {}
  ): UseFormReturn<Enable2FAFormData> => {
    const methods = {
      control: {
        _formState: { errors },
        register: vi.fn(),
        unregister: vi.fn(),
        _subjects: {
          values: { next: vi.fn() },
          array: { next: vi.fn() },
          state: { next: vi.fn() }
        },
        _getWatch: vi.fn(),
        _formValues: defaultValues,
        _defaultValues: defaultValues
      },
      handleSubmit: vi.fn((onSubmit) => (e?: React.FormEvent) => {
        e?.preventDefault?.()
        onSubmit(defaultValues as Enable2FAFormData)
      }),
      formState: {
        errors,
        isDirty: false,
        isValid: false,
        isSubmitting: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        isValidating: false,
        submitCount: 0,
        touchedFields: {},
        dirtyFields: {}
      },
      setValue: vi.fn(),
      getValues: vi.fn(() => defaultValues as Enable2FAFormData),
      watch: vi.fn(),
      reset: vi.fn(),
      clearErrors: vi.fn(),
      setError: vi.fn(),
      trigger: vi.fn(),
      register: vi.fn(),
      unregister: vi.fn(),
      setFocus: vi.fn(),
      getFieldState: vi.fn(),
      resetField: vi.fn()
    }
    return methods as unknown as UseFormReturn<Enable2FAFormData>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render verify OTP step', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByText('Verify Authenticator Code')).toBeInTheDocument()
      expect(screen.getByText(/Enter the 6-digit code from your authenticator app/)).toBeInTheDocument()
    })

    it('should render PIN input field', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByTestId('pin-input-field')).toBeInTheDocument()
      expect(screen.getByTestId('pin-input')).toBeInTheDocument()
    })

    it('should render instruction steps', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByText('How to find your code:')).toBeInTheDocument()
      const instructionTexts = screen.getAllByText(/Open your authenticator app/)
      expect(instructionTexts.length).toBeGreaterThan(0)
    })

    it('should render troubleshooting section', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByText('Troubleshooting:')).toBeInTheDocument()
      expect(screen.getByText(/ensure your device's time is set to automatic/)).toBeInTheDocument()
    })

    it('should render verify button', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const verifyButton = screen.getByTestId('primary-button')
      expect(verifyButton).toBeInTheDocument()
      expect(verifyButton).toHaveTextContent('Verify Code')
    })

    it('should render back button', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const backButton = screen.getByTestId('secondary-button')
      expect(backButton).toBeInTheDocument()
      expect(backButton).toHaveTextContent('Back')
    })

    it('should render tip message', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByText(/The code changes every 30 seconds/)).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit when verify button is clicked', async () => {
      const methods = createMockMethods({ code: ['1', '2', '3', '4', '5', '6'] })
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const verifyButton = screen.getByTestId('primary-button')
      await userEvent.click(verifyButton)

      expect(methods.handleSubmit).toHaveBeenCalled()
    })

    it('should call onBack when back button is clicked', async () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const backButton = screen.getByTestId('secondary-button')
      await userEvent.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('should have form with submit type button', () => {
      const methods = createMockMethods()
      const { container } = render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should disable verify button when loading', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={true}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const verifyButton = screen.getByTestId('primary-button')
      expect(verifyButton).toBeDisabled()
    })

    it('should disable back button when loading', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={true}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const backButton = screen.getByTestId('secondary-button')
      expect(backButton).toBeDisabled()
    })

    it('should disable PIN input when loading', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={true}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const pinInput = screen.getByTestId('pin-input')
      expect(pinInput).toBeDisabled()
    })
  })

  describe('PIN Input Handling', () => {
    it('should call setValue when PIN input changes', async () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const pinInput = screen.getByTestId('pin-input')
      await userEvent.type(pinInput, '123456')

      await waitFor(() => {
        expect(methods.setValue).toHaveBeenCalled()
      })
    })

    it('should render PIN input field for code entry', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const pinInput = screen.getByTestId('pin-input')
      expect(pinInput).toBeInTheDocument()
      expect(pinInput).not.toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should show error message when validation fails', () => {
      const errors = {
        code: { message: 'All 6 digits are required' }
      }
      const methods = createMockMethods({}, errors)

      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByTestId('error-message')).toHaveTextContent('All 6 digits are required')
    })

    it('should not show error message when validation passes', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })
  })

  describe('Instructions and Help Text', () => {
    it('should display all instruction steps', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByText(/1\. Open your authenticator app \(Google Authenticator, Authy, etc\.\)/)).toBeInTheDocument()
      expect(screen.getByText(/2\. Find the entry you just added/)).toBeInTheDocument()
      expect(screen.getByText(/3\. The app displays a 6-digit code/)).toBeInTheDocument()
      expect(screen.getByText(/4\. Enter the current code/)).toBeInTheDocument()
    })

    it('should display troubleshooting tips', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByText(/ensure your device's time is set to automatic/)).toBeInTheDocument()
      expect(screen.getByText(/Wait for the code to refresh/)).toBeInTheDocument()
      expect(screen.getByText(/Make sure you're entering the code for the correct account/)).toBeInTheDocument()
    })
  })

  describe('Auto-submit Behavior', () => {
    it('should handle complete PIN entry', async () => {
      const methods = createMockMethods({ code: [] })
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const pinInput = screen.getByTestId('pin-input')
      await userEvent.type(pinInput, '123456')

      await waitFor(() => {
        expect(methods.setValue).toHaveBeenCalled()
      })
    })
  })

  describe('Component Integration', () => {
    it('should render all sections together', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByText('Verify Authenticator Code')).toBeInTheDocument()
      expect(screen.getByTestId('pin-input-field')).toBeInTheDocument()
      expect(screen.getByText('How to find your code:')).toBeInTheDocument()
      expect(screen.getByText('Troubleshooting:')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByTestId('secondary-button')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty form state', () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByTestId('pin-input')).toBeInTheDocument()
    })

    it('should handle multiple error messages', () => {
      const errors = {
        code: { message: 'Invalid code format' }
      }
      const methods = createMockMethods({}, errors)

      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={false}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid code format')
    })

    it('should not call onBack when button is disabled', async () => {
      const methods = createMockMethods()
      render(
        <VerifyOTPStep
          methods={methods}
          isLoading={true}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />
      )

      const backButton = screen.getByTestId('secondary-button')
      await userEvent.click(backButton)

      expect(mockOnBack).not.toHaveBeenCalled()
    })
  })
})
