/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

/* Auth module imports */
import ResetPasswordPage from '@auth-management/pages/reset-password'
import * as useAuthOperationsHook from '@auth-management/hooks/use-auth-operations'
import { TOKEN_VALIDATION_STATE } from '@auth-management/constants'

/* Mock useSearchParams */
const mockGet = vi.fn()
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet
  })
}))

/* Mock ResetPasswordForm component */
vi.mock('@auth-management/forms', () => ({
  ResetPasswordForm: vi.fn(({ token, tokenValidationState, isValidatingToken, tokenValidationErrorCode, tokenValidationErrorMsg }) => (
    <div data-testid="reset-password-form">
      <div data-testid="form-token">{token}</div>
      <div data-testid="form-validation-state">{tokenValidationState}</div>
      <div data-testid="form-is-validating">{isValidatingToken ? 'true' : 'false'}</div>
      <div data-testid="form-error-code">{tokenValidationErrorCode || 'null'}</div>
      <div data-testid="form-error-msg">{tokenValidationErrorMsg || 'null'}</div>
    </div>
  ))
}))

/* Mock AuthLayout component */
vi.mock('@auth-management/components', () => ({
  AuthLayout: vi.fn(({ children }) => (
    <div data-testid="auth-layout">{children}</div>
  ))
}))

describe('ResetPasswordPage', () => {
  const mockValidateResetToken = vi.fn()

  const defaultHookReturn = {
    loginUser: vi.fn(),
    isLoggingIn: false,
    loginError: null,
    shouldShow2FAReminder: false,
    forgotPassword: vi.fn(),
    isForgotPasswordLoading: false,
    forgotPasswordError: null,
    resetPassword: vi.fn(),
    isResetPasswordLoading: false,
    resetPasswordError: null,
    validateResetToken: mockValidateResetToken,
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
    mockGet.mockReturnValue('test-token-123')
    vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue(defaultHookReturn)
    mockValidateResetToken.mockResolvedValue(true)
  })

  describe('Rendering', () => {
    it('should render the reset password page', () => {
      render(<ResetPasswordPage />)

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
      expect(screen.getByTestId('reset-password-form')).toBeInTheDocument()
    })

    it('should render form with correct props', () => {
      render(<ResetPasswordPage />)

      expect(screen.getByTestId('form-token')).toHaveTextContent('test-token-123')
      expect(screen.getByTestId('form-is-validating')).toHaveTextContent('false')
    })
  })

  describe('Token Validation', () => {
    it('should validate token on mount', async () => {
      render(<ResetPasswordPage />)

      await waitFor(() => {
        expect(mockValidateResetToken).toHaveBeenCalledWith('test-token-123')
      })
    })

    it('should set validation state to VALID when token is valid', async () => {
      mockValidateResetToken.mockResolvedValue(true)

      render(<ResetPasswordPage />)

      await waitFor(() => {
        expect(screen.getByTestId('form-validation-state')).toHaveTextContent(TOKEN_VALIDATION_STATE.VALID)
      })
    })

    it('should set validation state to INVALID when token is invalid', async () => {
      mockValidateResetToken.mockResolvedValue(false)

      render(<ResetPasswordPage />)

      await waitFor(() => {
        expect(screen.getByTestId('form-validation-state')).toHaveTextContent(TOKEN_VALIDATION_STATE.INVALID)
      })
    })

    it('should set validation state to INVALID when no token provided', async () => {
      mockGet.mockReturnValue(null)

      render(<ResetPasswordPage />)

      await waitFor(() => {
        expect(screen.getByTestId('form-validation-state')).toHaveTextContent(TOKEN_VALIDATION_STATE.INVALID)
      })
    })

    it('should not call validateResetToken when no token provided', async () => {
      mockGet.mockReturnValue(null)

      render(<ResetPasswordPage />)

      await waitFor(() => {
        expect(mockValidateResetToken).not.toHaveBeenCalled()
      })
    })
  })

  describe('Loading State', () => {
    it('should pass isValidatingToken to form', () => {
      vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue({
        ...defaultHookReturn,
        isValidatingToken: true
      })

      render(<ResetPasswordPage />)

      expect(screen.getByTestId('form-is-validating')).toHaveTextContent('true')
    })

    it('should show validation state as PENDING initially', () => {
      render(<ResetPasswordPage />)

      expect(screen.getByTestId('form-validation-state')).toHaveTextContent(TOKEN_VALIDATION_STATE.PENDING)
    })
  })

  describe('Error Handling', () => {
    it('should pass validation error code to form', () => {
      vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue({
        ...defaultHookReturn,
        tokenValidationErrorCode: 'INVALID_TOKEN'
      })

      render(<ResetPasswordPage />)

      expect(screen.getByTestId('form-error-code')).toHaveTextContent('INVALID_TOKEN')
    })

    it('should pass validation error message to form', () => {
      vi.spyOn(useAuthOperationsHook, 'useAuthOperations').mockReturnValue({
        ...defaultHookReturn,
        tokenValidationErrorMsg: 'Token has expired'
      })

      render(<ResetPasswordPage />)

      expect(screen.getByTestId('form-error-msg')).toHaveTextContent('Token has expired')
    })

    it('should show null for error code when no error', () => {
      render(<ResetPasswordPage />)

      expect(screen.getByTestId('form-error-code')).toHaveTextContent('null')
    })

    it('should show null for error message when no error', () => {
      render(<ResetPasswordPage />)

      expect(screen.getByTestId('form-error-msg')).toHaveTextContent('null')
    })
  })

  describe('Component Integration', () => {
    it('should use useAuthOperations hook', () => {
      const spy = vi.spyOn(useAuthOperationsHook, 'useAuthOperations')

      render(<ResetPasswordPage />)

      expect(spy).toHaveBeenCalled()
    })

    it('should get token from search params', () => {
      render(<ResetPasswordPage />)

      expect(mockGet).toHaveBeenCalledWith('token')
    })

    it('should pass token to form', () => {
      render(<ResetPasswordPage />)

      expect(screen.getByTestId('form-token')).toHaveTextContent('test-token-123')
    })
  })
})
