/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'

/* Auth module imports */
import ForgotPasswordForm from '@auth-management/forms/forgot-password'
import * as useAuthOperationsHook from '@auth-management/hooks/use-auth-operations'

/* Type definitions for mock components */
interface MockChakraProps {
  children?: ReactNode
  [key: string]: unknown
}

interface LinkProps {
  children?: ReactNode
  onClick?: () => void
  [key: string]: unknown
}

interface TextInputFieldProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  label?: string
  errorMessage?: string
  isInValid?: boolean
  placeholder?: string
}

interface PrimaryButtonProps {
  children?: ReactNode
  onClick?: () => void
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

/* Mock next/navigation */
const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

/* Mock Chakra UI components */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    VStack: ({ children, ...props }: MockChakraProps) => <div data-testid="vstack" {...props}>{children}</div>,
    Heading: ({ children, ...props }: MockChakraProps) => <h1 data-testid="heading" {...props}>{children}</h1>,
    Text: ({ children, ...props }: MockChakraProps) => <p data-testid="text" {...props}>{children}</p>,
    Link: ({ children, onClick, ...props }: LinkProps) => <a data-testid="link" onClick={onClick} {...props}>{children}</a>,
    Box: ({ children, ...props }: MockChakraProps) => <div data-testid="box" {...props}>{children}</div>,
    SimpleGrid: ({ children, ...props }: MockChakraProps) => <div data-testid="simple-grid" {...props}>{children}</div>,
    GridItem: ({ children, ...props }: MockChakraProps) => <div data-testid="grid-item" {...props}>{children}</div>,
    Flex: ({ children, ...props }: MockChakraProps) => <div data-testid="flex" {...props}>{children}</div>
  }
})

/* Mock form field components */
vi.mock('@shared/components/form-elements', () => ({
  TextInputField: vi.fn(({ value, onChange, onBlur, label, errorMessage, isInValid, placeholder }: TextInputFieldProps) => (
    <div data-testid={`text-input-${label}`}>
      <label>{label}</label>
      <input
        data-testid={`input-${label}`}
        value={value}
        onChange={(e) => onChange?.(e)}
        onBlur={onBlur}
        placeholder={placeholder}
      />
      {isInValid && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
    </div>
  )),
  PrimaryButton: vi.fn(({ children, onClick, loading, type }: PrimaryButtonProps) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      disabled={loading}
      type={type}
    >
      {children}
    </button>
  ))
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

describe('ForgotPasswordForm', () => {
  const mockForgotPassword = vi.fn()

  const defaultHookReturn = {
    loginUser: vi.fn(),
    isLoggingIn: false,
    loginError: null,
    shouldShow2FAReminder: false,
    forgotPassword: mockForgotPassword,
    isForgotPasswordLoading: false,
    forgotPasswordError: null,
    resetPassword: vi.fn(),
    isResetPasswordLoading: false,
    resetPasswordError: null,
    validateResetToken: vi.fn(),
    isValidatingToken: false,
    tokenValidationErrorCode: null,
    tokenValidationErrorMsg: null,
    refreshToken: vi.fn(),
    isRefreshingToken: false,
    refreshTokenError: null,
    logoutUser: vi.fn(),
    isLoggingOut: false,
    logoutError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue(defaultHookReturn)
  })

  describe('Rendering', () => {
    it('should render forgot password form', () => {
      render(<ForgotPasswordForm />)

      expect(screen.getByTestId('box')).toBeInTheDocument()
      expect(screen.getByText('Forgot Password')).toBeInTheDocument()
      expect(screen.getByText("Enter your email address and we'll send you a reset link")).toBeInTheDocument()
    })

    it('should render email input field', () => {
      render(<ForgotPasswordForm />)

      expect(screen.getByTestId('text-input-Email Address')).toBeInTheDocument()
      expect(screen.getByTestId('input-Email Address')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<ForgotPasswordForm />)

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByText('Send Reset Link')).toBeInTheDocument()
    })

    it('should render back to login link', () => {
      render(<ForgotPasswordForm />)

      expect(screen.getByText('Back to Login')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      render(<ForgotPasswordForm />)

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should show error for invalid email format', async () => {
      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'invalid-email')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should clear error when user starts typing', async () => {
      render(<ForgotPasswordForm />)

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.clear(emailInput)
      await userEvent.type(emailInput, 'test@example.com')

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBe(0)
      })
    })

    it('should accept valid email format', async () => {
      mockForgotPassword.mockResolvedValue(true)

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalled()
      })

      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call forgotPassword with correct data on valid submission', async () => {
      mockForgotPassword.mockResolvedValue(true)

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith({
          email: 'test@example.com'
        })
      })
    })

    it('should redirect to login page on successful submission', async () => {
      mockForgotPassword.mockResolvedValue(true)

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('should not redirect when submission fails', async () => {
      mockForgotPassword.mockResolvedValue(false)

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should not call forgotPassword when form has validation errors', async () => {
      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'invalid-email')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })

      expect(mockForgotPassword).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue({
        ...defaultHookReturn,
        isForgotPasswordLoading: true
      })

      render(<ForgotPasswordForm />)

      const submitButton = screen.getByTestId('primary-button')
      expect(submitButton).toBeDisabled()
    })

    it('should show loading text when sending', () => {
      vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue({
        ...defaultHookReturn,
        isForgotPasswordLoading: true
      })

      render(<ForgotPasswordForm />)

      expect(screen.getByText('Sending...')).toBeInTheDocument()
      expect(screen.queryByText('Send Reset Link')).not.toBeInTheDocument()
    })
  })

  describe('Back to Login Link', () => {
    it('should navigate to login page when link is clicked', async () => {
      render(<ForgotPasswordForm />)

      const backToLoginLink = screen.getByText('Back to Login')
      await userEvent.click(backToLoginLink)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  describe('Form Fields', () => {
    it('should accept email input', async () => {
      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address') as HTMLInputElement
      await userEvent.type(emailInput, 'user@example.com')

      expect(emailInput.value).toBe('user@example.com')
    })

    it('should have correct placeholder', () => {
      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your registered email address')
    })
  })

  describe('Component Integration', () => {
    it('should use useAuthOperations hook', () => {
      const spy = vi.spyOn(useAuthOperationsHook, 'useAuthOperations')

      render(<ForgotPasswordForm />)

      expect(spy).toHaveBeenCalled()
    })

    it('should render form with noValidate attribute', () => {
      const { container } = render(<ForgotPasswordForm />)

      const form = container.querySelector('form')
      expect(form).toHaveAttribute('noValidate')
    })
  })

  describe('Edge Cases', () => {
    it('should handle email with special characters', async () => {
      mockForgotPassword.mockResolvedValue(true)

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'test+user@example.com')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith({
          email: 'test+user@example.com'
        })
      })
    })

    it('should handle whitespace in email', async () => {
      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, ' test@example.com ')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('should handle multiple form submissions', async () => {
      mockForgotPassword.mockResolvedValue(false)

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const submitButton = screen.getByTestId('primary-button')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledTimes(1)
      })

      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle email with uppercase letters', async () => {
      mockForgotPassword.mockResolvedValue(true)

      render(<ForgotPasswordForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'TEST@EXAMPLE.COM')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith({
          email: 'TEST@EXAMPLE.COM'
        })
      })
    })
  })
})
