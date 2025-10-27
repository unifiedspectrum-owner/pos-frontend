/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'

/* Auth module imports */
import LoginForm from '@auth-management/forms/login'
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
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  label?: string
  errorMessage?: string
  isInValid?: boolean
  placeholder?: string
}

interface PasswordInputFieldProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  label?: string
  errorMessage?: string
  isInValid?: boolean
  placeholder?: string
}

interface CheckboxFieldProps {
  value?: boolean
  onChange?: (checked: boolean) => void
  label?: string
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
  TextInputField: vi.fn(({ value, onChange, onBlur, onKeyDown, label, errorMessage, isInValid, placeholder }: TextInputFieldProps) => (
    <div data-testid={`text-input-${label}`}>
      <label>{label}</label>
      <input
        data-testid={`input-${label}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
      {isInValid && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
    </div>
  )),
  PasswordInputField: vi.fn(({ value, onChange, onBlur, onKeyDown, label, errorMessage, isInValid, placeholder }: PasswordInputFieldProps) => (
    <div data-testid={`password-input-${label}`}>
      <label>{label}</label>
      <input
        data-testid={`input-${label}`}
        type="password"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
      {isInValid && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
    </div>
  )),
  CheckboxField: vi.fn(({ value, onChange, label }: CheckboxFieldProps) => (
    <div data-testid={`checkbox-${label}`}>
      <label>
        <input
          data-testid={`checkbox-input-${label}`}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        {label}
      </label>
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

/* Mock useFieldNavigation hook */
vi.mock('@shared/hooks', () => ({
  useFieldNavigation: vi.fn(() => ({
    getFieldProps: vi.fn((fieldName: string) => ({
      onKeyDown: vi.fn()
    }))
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

describe('LoginForm', () => {
  const mockLoginUser = vi.fn()

  const defaultHookReturn = {
    loginUser: mockLoginUser,
    isLoggingIn: false,
    loginError: null,
    shouldShow2FAReminder: false,
    forgotPassword: vi.fn(),
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
    it('should render login form', () => {
      render(<LoginForm />)

      expect(screen.getByTestId('box')).toBeInTheDocument()
      expect(screen.getByText('Login to Your Account')).toBeInTheDocument()
      expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument()
    })

    it('should render email input field', () => {
      render(<LoginForm />)

      expect(screen.getByTestId('text-input-Email Address')).toBeInTheDocument()
      expect(screen.getByTestId('input-Email Address')).toBeInTheDocument()
    })

    it('should render password input field', () => {
      render(<LoginForm />)

      expect(screen.getByTestId('password-input-Password')).toBeInTheDocument()
      expect(screen.getByTestId('input-Password')).toBeInTheDocument()
    })

    it('should render remember me checkbox', () => {
      render(<LoginForm />)

      expect(screen.getByTestId('checkbox-Remember Me')).toBeInTheDocument()
      expect(screen.getByTestId('checkbox-input-Remember Me')).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      render(<LoginForm />)

      expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<LoginForm />)

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      render(<LoginForm />)

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should show error for invalid email format', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'invalid-email')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should show error when password is empty', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should show error when password is less than 8 characters', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'short')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should clear error when user starts typing in email field', async () => {
      render(<LoginForm />)

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')

      await userEvent.clear(emailInput)
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.clear(passwordInput)
      await userEvent.type(passwordInput, 'password123')

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBe(0)
      }, { timeout: 3000 })
    })

    it('should clear error when user starts typing in password field', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })

      const passwordInput = screen.getByTestId('input-Password')
      await userEvent.clear(passwordInput)
      await userEvent.type(passwordInput, 'password123')

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBe(0)
      })
    })
  })

  describe('Form Submission', () => {
    it('should call loginUser with correct data on valid submission', async () => {
      mockLoginUser.mockResolvedValue(true)

      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          remember_me: false
        })
      })
    })

    it('should include remember_me value when checkbox is checked', async () => {
      mockLoginUser.mockResolvedValue(true)

      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')
      const rememberMeCheckbox = screen.getByTestId('checkbox-input-Remember Me')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(rememberMeCheckbox)

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          remember_me: true
        })
      })
    })

    it('should redirect to admin home on successful login', async () => {
      mockLoginUser.mockResolvedValue(true)

      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/support-ticket-management')
      })
    })

    it('should not redirect when login fails', async () => {
      mockLoginUser.mockResolvedValue(false)

      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrong-password')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should not call loginUser when form has validation errors', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, 'invalid-email')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })

      expect(mockLoginUser).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue({
        ...defaultHookReturn,
        isLoggingIn: true
      })

      render(<LoginForm />)

      const submitButton = screen.getByTestId('primary-button')
      expect(submitButton).toBeDisabled()
    })

    it('should show loading text when logging in', () => {
      vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue({
        ...defaultHookReturn,
        isLoggingIn: true
      })

      render(<LoginForm />)

      expect(screen.getByText('Signing in...')).toBeInTheDocument()
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    })
  })

  describe('Forgot Password Link', () => {
    it('should navigate to forgot password page when link is clicked', async () => {
      render(<LoginForm />)

      const forgotPasswordLink = screen.getByText('Forgot password?')
      await userEvent.click(forgotPasswordLink)

      expect(mockPush).toHaveBeenCalledWith('/auth/forgot-password')
    })
  })

  describe('Remember Me Checkbox', () => {
    it('should toggle remember me checkbox', async () => {
      render(<LoginForm />)

      const checkbox = screen.getByTestId('checkbox-input-Remember Me') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await userEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)

      await userEvent.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })

    it('should default remember me to false', () => {
      render(<LoginForm />)

      const checkbox = screen.getByTestId('checkbox-input-Remember Me') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })
  })

  describe('Form Fields', () => {
    it('should accept email input', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address') as HTMLInputElement
      await userEvent.type(emailInput, 'user@example.com')

      expect(emailInput.value).toBe('user@example.com')
    })

    it('should accept password input', async () => {
      render(<LoginForm />)

      const passwordInput = screen.getByTestId('input-Password') as HTMLInputElement
      await userEvent.type(passwordInput, 'mypassword123')

      expect(passwordInput.value).toBe('mypassword123')
    })

    it('should have correct placeholders', () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')

      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email address')
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password')
    })
  })

  describe('Component Integration', () => {
    it('should use useAuthOperations hook', () => {
      const spy = vi.spyOn(useAuthOperationsHook, 'useAuthOperations')

      render(<LoginForm />)

      expect(spy).toHaveBeenCalled()
    })

    it('should render form with noValidate attribute', () => {
      const { container } = render(<LoginForm />)

      const form = container.querySelector('form')
      expect(form).toHaveAttribute('noValidate')
    })
  })

  describe('Edge Cases', () => {
    it('should handle email with special characters', async () => {
      mockLoginUser.mockResolvedValue(true)

      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')

      await userEvent.type(emailInput, 'test+user@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledWith({
          email: 'test+user@example.com',
          password: 'password123',
          remember_me: false
        })
      })
    })

    it('should handle whitespace in email', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      await userEvent.type(emailInput, ' test@example.com ')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('should handle exactly 8 character password', async () => {
      mockLoginUser.mockResolvedValue(true)

      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, '12345678')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalled()
      })
    })

    it('should handle multiple form submissions', async () => {
      mockLoginUser.mockResolvedValue(false)

      render(<LoginForm />)

      const emailInput = screen.getByTestId('input-Email Address')
      const passwordInput = screen.getByTestId('input-Password')
      const submitButton = screen.getByTestId('primary-button')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledTimes(1)
      })

      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledTimes(2)
      })
    })
  })
})
