/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'

/* Auth module imports */
import ResetPasswordForm from '@auth-management/forms/reset-password'
import * as useAuthOperationsHook from '@auth-management/hooks/use-auth-operations'
import { TOKEN_VALIDATION_STATE } from '@auth-management/constants'

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

interface LoaderWrapperProps {
  isLoading?: boolean
  loadingText?: string
  children?: ReactNode
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
  showStrengthMeter?: boolean
  showRequirements?: boolean
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

/* Mock LoaderWrapper component */
vi.mock('@shared/components/common', () => ({
  LoaderWrapper: vi.fn(({ isLoading, loadingText, children }: LoaderWrapperProps) => (
    <div data-testid="loader-wrapper">
      {isLoading && <div data-testid="loading-text">{loadingText}</div>}
      {children}
    </div>
  ))
}))

/* Mock form field components */
vi.mock('@shared/components/form-elements', () => ({
  PasswordInputField: vi.fn(({ value, onChange, onBlur, onKeyDown, label, errorMessage, isInValid, placeholder, showStrengthMeter, showRequirements }: PasswordInputFieldProps) => (
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
      {showStrengthMeter && <div data-testid="strength-meter">Strength Meter</div>}
      {showRequirements && <div data-testid="requirements">Requirements</div>}
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

describe('ResetPasswordForm', () => {
  const mockResetPassword = vi.fn()

  const defaultHookReturn = {
    loginUser: vi.fn(),
    isLoggingIn: false,
    loginError: null,
    shouldShow2FAReminder: false,
    forgotPassword: vi.fn(),
    isForgotPasswordLoading: false,
    forgotPasswordError: null,
    resetPassword: mockResetPassword,
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

  const defaultProps = {
    token: 'valid-token-123',
    tokenValidationState: TOKEN_VALIDATION_STATE.VALID ,
    isValidatingToken: false,
    tokenValidationErrorCode: null,
    tokenValidationErrorMsg: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue(defaultHookReturn)
  })

  describe('Rendering - Valid Token', () => {
    it('should render reset password form when token is valid', () => {
      render(<ResetPasswordForm {...defaultProps} />)

      expect(screen.getByTestId('heading')).toHaveTextContent('Reset Password')
      expect(screen.getByText('Enter your new password below')).toBeInTheDocument()
    })

    it('should render new password input field', () => {
      render(<ResetPasswordForm {...defaultProps} />)

      expect(screen.getByTestId('password-input-New Password')).toBeInTheDocument()
      expect(screen.getByTestId('input-New Password')).toBeInTheDocument()
    })

    it('should render confirm password input field', () => {
      render(<ResetPasswordForm {...defaultProps} />)

      expect(screen.getByTestId('password-input-Confirm Password')).toBeInTheDocument()
      expect(screen.getByTestId('input-Confirm Password')).toBeInTheDocument()
    })

    it('should show password strength meter for new password field', () => {
      render(<ResetPasswordForm {...defaultProps} />)

      expect(screen.getByTestId('strength-meter')).toBeInTheDocument()
    })

    it('should show password requirements for new password field', () => {
      render(<ResetPasswordForm {...defaultProps} />)

      expect(screen.getByTestId('requirements')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<ResetPasswordForm {...defaultProps} />)

      expect(screen.getByTestId('primary-button')).toBeInTheDocument()
      expect(screen.getByTestId('primary-button')).toHaveTextContent('Reset Password')
    })

    it('should render back to login link', () => {
      render(<ResetPasswordForm {...defaultProps} />)

      expect(screen.getByText('Back to Login')).toBeInTheDocument()
    })
  })

  describe('Rendering - Invalid Token', () => {
    it('should show error message when token is invalid', () => {
      render(
        <ResetPasswordForm
          {...defaultProps}
          tokenValidationState={TOKEN_VALIDATION_STATE.INVALID }
          tokenValidationErrorMsg="Invalid Reset Link"
          tokenValidationErrorCode="This reset link is invalid or has expired."
        />
      )

      expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument()
      expect(screen.getByText('This reset link is invalid or has expired.')).toBeInTheDocument()
    })

    it('should not render form when token is invalid', () => {
      render(
        <ResetPasswordForm
          {...defaultProps}
          tokenValidationState={TOKEN_VALIDATION_STATE.INVALID }
        />
      )

      expect(screen.queryByTestId('password-input-New Password')).not.toBeInTheDocument()
      expect(screen.queryByTestId('password-input-Confirm Password')).not.toBeInTheDocument()
    })

    it('should show back to login link even when token is invalid', () => {
      render(
        <ResetPasswordForm
          {...defaultProps}
          tokenValidationState={TOKEN_VALIDATION_STATE.INVALID }
        />
      )

      expect(screen.getByText('Back to Login')).toBeInTheDocument()
    })
  })

  describe('Rendering - Loading State', () => {
    it('should show loading state when validating token', () => {
      render(
        <ResetPasswordForm
          {...defaultProps}
          isValidatingToken={true}
        />
      )

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Validating reset link...')
    })

    it('should show loading state when token validation is pending', () => {
      render(
        <ResetPasswordForm
          {...defaultProps}
          tokenValidationState={TOKEN_VALIDATION_STATE.PENDING }
        />
      )

      expect(screen.getByTestId('loading-text')).toHaveTextContent('Validating reset link...')
    })
  })

  describe('Form Validation', () => {
    it('should show error when new password is empty', async () => {
      render(<ResetPasswordForm {...defaultProps} />)

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should show error when new password is less than 8 characters', async () => {
      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      await userEvent.type(newPasswordInput, 'short')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should show error when new password does not match regex', async () => {
      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      await userEvent.type(newPasswordInput, 'weakpassword')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should show error when confirm password is empty', async () => {
      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      await userEvent.type(newPasswordInput, 'ValidPass123!')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should show error when passwords do not match', async () => {
      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      const confirmPasswordInput = screen.getByTestId('input-Confirm Password')

      await userEvent.type(newPasswordInput, 'ValidPass123!')
      await userEvent.type(confirmPasswordInput, 'DifferentPass123!')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('should clear error when user starts typing in new password field', async () => {
      render(<ResetPasswordForm {...defaultProps} />)

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBeGreaterThan(0)
      })

      const newPasswordInput = screen.getByTestId('input-New Password')
      const confirmPasswordInput = screen.getByTestId('input-Confirm Password')

      await userEvent.clear(newPasswordInput)
      await userEvent.type(newPasswordInput, 'ValidPass123!')
      await userEvent.clear(confirmPasswordInput)
      await userEvent.type(confirmPasswordInput, 'ValidPass123!')

      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message')
        expect(errorMessages.length).toBe(0)
      }, { timeout: 3000 })
    })
  })

  describe('Form Submission', () => {
    it('should call resetPassword with correct data on valid submission', async () => {
      mockResetPassword.mockResolvedValue(true)

      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      const confirmPasswordInput = screen.getByTestId('input-Confirm Password')

      await userEvent.type(newPasswordInput, 'ValidPass123!')
      await userEvent.type(confirmPasswordInput, 'ValidPass123!')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          token: 'valid-token-123',
          new_password: 'ValidPass123!',
          confirm_password: 'ValidPass123!'
        })
      })
    })

    it('should redirect to login page on successful submission', async () => {
      mockResetPassword.mockResolvedValue(true)

      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      const confirmPasswordInput = screen.getByTestId('input-Confirm Password')

      await userEvent.type(newPasswordInput, 'ValidPass123!')
      await userEvent.type(confirmPasswordInput, 'ValidPass123!')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('should not redirect when submission fails', async () => {
      mockResetPassword.mockResolvedValue(false)

      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      const confirmPasswordInput = screen.getByTestId('input-Confirm Password')

      await userEvent.type(newPasswordInput, 'ValidPass123!')
      await userEvent.type(confirmPasswordInput, 'ValidPass123!')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should not call resetPassword when form has validation errors', async () => {
      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      await userEvent.type(newPasswordInput, 'weak')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })

      expect(mockResetPassword).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue({
        ...defaultHookReturn,
        isResetPasswordLoading: true
      })

      render(<ResetPasswordForm {...defaultProps} />)

      const submitButton = screen.getByTestId('primary-button')
      expect(submitButton).toBeDisabled()
    })

    it('should show loading text when resetting', () => {
      vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue({
        ...defaultHookReturn,
        isResetPasswordLoading: true
      })

      render(<ResetPasswordForm {...defaultProps} />)

      const submitButton = screen.getByTestId('primary-button')
      expect(submitButton).toHaveTextContent('Resetting...')
    })
  })

  describe('Back to Login Link', () => {
    it('should navigate to login page when link is clicked', async () => {
      render(<ResetPasswordForm {...defaultProps} />)

      const backToLoginLink = screen.getByText('Back to Login')
      await userEvent.click(backToLoginLink)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  describe('Token Management', () => {
    it('should set token value in form when token is valid', async () => {
      mockResetPassword.mockResolvedValue(true)

      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      const confirmPasswordInput = screen.getByTestId('input-Confirm Password')

      await userEvent.type(newPasswordInput, 'ValidPass123!')
      await userEvent.type(confirmPasswordInput, 'ValidPass123!')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith(
          expect.objectContaining({
            token: 'valid-token-123'
          })
        )
      })
    })

    it('should not set token when token validation is pending', () => {
      render(
        <ResetPasswordForm
          {...defaultProps}
          tokenValidationState={TOKEN_VALIDATION_STATE.PENDING }
        />
      )

      expect(screen.getByTestId('loading-text')).toBeInTheDocument()
    })

    it('should handle null token', () => {
      render(
        <ResetPasswordForm
          {...defaultProps}
          token={null}
        />
      )

      expect(screen.getByTestId('heading')).toHaveTextContent('Reset Password')
    })
  })

  describe('Component Integration', () => {
    it('should use useAuthOperations hook', () => {
      const spy = vi.spyOn(useAuthOperationsHook, 'useAuthOperations')

      render(<ResetPasswordForm {...defaultProps} />)

      expect(spy).toHaveBeenCalled()
    })

    it('should render form with noValidate attribute', () => {
      const { container } = render(<ResetPasswordForm {...defaultProps} />)

      const form = container.querySelector('form')
      expect(form).toHaveAttribute('noValidate')
    })
  })

  describe('Edge Cases', () => {
    it('should handle valid password with special characters', async () => {
      mockResetPassword.mockResolvedValue(true)

      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      const confirmPasswordInput = screen.getByTestId('input-Confirm Password')

      await userEvent.type(newPasswordInput, 'P@ssw0rd!#$%')
      await userEvent.type(confirmPasswordInput, 'P@ssw0rd!#$%')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          token: 'valid-token-123',
          new_password: 'P@ssw0rd!#$%',
          confirm_password: 'P@ssw0rd!#$%'
        })
      })
    })

    it('should handle exactly 8 character password with all requirements', async () => {
      mockResetPassword.mockResolvedValue(true)

      render(<ResetPasswordForm {...defaultProps} />)

      const newPasswordInput = screen.getByTestId('input-New Password')
      const confirmPasswordInput = screen.getByTestId('input-Confirm Password')

      await userEvent.type(newPasswordInput, 'Pass123!')
      await userEvent.type(confirmPasswordInput, 'Pass123!')

      const submitButton = screen.getByTestId('primary-button')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalled()
      })
    })

    it('should show default error message when no custom error provided for invalid token', () => {
      render(
        <ResetPasswordForm
          {...defaultProps}
          tokenValidationState={TOKEN_VALIDATION_STATE.INVALID}
          tokenValidationErrorMsg={null}
          tokenValidationErrorCode={null}
        />
      )

      expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument()
      expect(screen.getByText('This reset link is invalid or has expired. Please request a new one.')).toBeInTheDocument()
    })
  })
})
