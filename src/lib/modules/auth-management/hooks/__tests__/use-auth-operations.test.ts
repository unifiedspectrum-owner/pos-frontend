/* Comprehensive test suite for useAuthOperations hook */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils/api'
import * as notificationUtils from '@shared/utils/ui/notifications'
import * as sharedConfig from '@shared/config'

/* Auth module imports */
import { useAuthOperations } from '@auth-management/hooks/use-auth-operations'
import { authManagementService } from '@auth-management/api'
import { AUTH_STORAGE_KEYS, AUTH_PAGE_ROUTES } from '@auth-management/constants'

/* Mock router */
const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

/* Mock dependencies */
vi.mock('@auth-management/api', () => ({
  authManagementService: {
    loginUser: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    validateResetToken: vi.fn(),
    refreshToken: vi.fn(),
    logoutUser: vi.fn()
  }
}))

vi.mock('@shared/utils/api', () => ({
  handleApiError: vi.fn()
}))

vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@shared/utils/formatting', () => ({
  addMinutesToCurrentTime: vi.fn(() => Date.now() + 24 * 60 * 60 * 1000)
}))

vi.mock('@shared/config', async () => {
  const actual = await vi.importActual('@shared/config')
  return {
    ...actual,
    LOADING_DELAY_ENABLED: false,
    LOADING_DELAY: 0
  }
})

describe('useAuthOperations Hook', () => {
  /* Mock data */
  const mockLoginData = {
    email: 'test@example.com',
    password: 'TestPass123!',
    remember_me: false
  }

  const mockUserData = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    is_2fa_required: false,
    is_2fa_enabled: false
  }

  const mockLoginResponse = {
    success: true,
    data: {
      user: mockUserData,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      requires_2fa: false,
      is_2fa_authenticated: true
    },
    message: 'Login successful',
    timestamp: new Date().toISOString()
  }

  /* Mock service functions */
  const mockLoginUser = vi.mocked(authManagementService.loginUser)
  const mockForgotPassword = vi.mocked(authManagementService.forgotPassword)
  const mockResetPassword = vi.mocked(authManagementService.resetPassword)
  const mockValidateResetToken = vi.mocked(authManagementService.validateResetToken)
  const mockRefreshToken = vi.mocked(authManagementService.refreshToken)
  const mockLogoutUser = vi.mocked(authManagementService.logoutUser)
  const mockHandleApiError = vi.mocked(sharedUtils.handleApiError)
  const mockCreateToastNotification = vi.mocked(notificationUtils.createToastNotification)

  /* Mock window event dispatch */
  const mockDispatchEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockPush.mockClear()
    /* Set up window.dispatchEvent spy that allows the event to fire */
    mockDispatchEvent.mockReturnValue(true)
    vi.spyOn(window, 'dispatchEvent').mockImplementation(mockDispatchEvent)
    /* Suppress console logs */
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAuthOperations())

      expect(result.current.isLoggingIn).toBe(false)
      expect(result.current.loginError).toBe(null)
      expect(result.current.shouldShow2FAReminder).toBe(false)
      expect(result.current.isForgotPasswordLoading).toBe(false)
      expect(result.current.forgotPasswordError).toBe(null)
      expect(result.current.isResetPasswordLoading).toBe(false)
      expect(result.current.resetPasswordError).toBe(null)
      expect(result.current.isValidatingToken).toBe(false)
      expect(result.current.tokenValidationErrorCode).toBe(null)
      expect(result.current.tokenValidationErrorMsg).toBe(null)
      expect(result.current.isRefreshingToken).toBe(false)
      expect(result.current.refreshTokenError).toBe(null)
      expect(result.current.isLoggingOut).toBe(false)
      expect(result.current.logoutError).toBe(null)
    })
  })

  describe('loginUser Function', () => {
    it('should login user successfully', async () => {
      mockLoginUser.mockResolvedValue(mockLoginResponse)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isLoggingIn).toBe(false)
        expect(result.current.loginError).toBe(null)
      })

      expect(mockLoginUser).toHaveBeenCalledWith(mockLoginData)
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBe('mock-access-token')
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)).toBe('mock-refresh-token')
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.LOGGED_IN)).toBe('true')
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event))
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Login Successful',
        description: `Welcome back, ${mockUserData.name}!`
      })
    })

    it('should set loading state during login', async () => {
      mockLoginUser.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockLoginResponse), 50))
      )

      const { result } = renderHook(() => useAuthOperations())

      const promise = result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false)
      })
    })

    it('should redirect to 2FA setup when required but not enabled', async () => {
      const setupRequiredResponse = {
        ...mockLoginResponse,
        data: {
          ...mockLoginResponse.data,
          user: { ...mockUserData, is_2fa_required: true },
          requires_2fa: false
        }
      }

      mockLoginUser.mockResolvedValue(setupRequiredResponse)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.SETUP_2FA)
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED)).toBe('true')
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'warning',
          title: '2FA Setup Required',
          description: 'Please set up two-factor authentication to continue.'
        })
      })
    })

    it('should redirect to 2FA verification when required and enabled', async () => {
      const verificationRequiredResponse = {
        ...mockLoginResponse,
        data: {
          ...mockLoginResponse.data,
          requires_2fa: true,
          is_2fa_authenticated: false
        }
      }

      mockLoginUser.mockResolvedValue(verificationRequiredResponse)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.VERIFY_2FA)
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)).toBe(mockUserData.id)
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)).toBe(mockUserData.email)
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'warning',
          title: '2FA Verification Required',
          description: 'Please enter the 6-digit code from your authenticator app.'
        })
      })
    })

    it('should show 2FA reminder for users with 2FA required', async () => {
      const reminderResponse = {
        ...mockLoginResponse,
        data: {
          ...mockLoginResponse.data,
          user: { ...mockUserData, is_2fa_required: true, is_2fa_enabled: true },
          is_2fa_authenticated: true,
          requires_2fa: true
        }
      }

      mockLoginUser.mockResolvedValue(reminderResponse)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.shouldShow2FAReminder).toBe(true)
      })
    })

    it('should handle login API error', async () => {
      mockLoginUser.mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
        error: 'Invalid credentials',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.loginError).toBe('Invalid credentials')
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'error',
          title: 'Login Failed',
          description: 'Invalid credentials'
        })
      })
    })

    it('should handle login network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockLoginUser.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.loginError).toBe('Failed to login. Please try again.')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Login Failed'
        })
      })
    })

    it('should handle incomplete login data', async () => {
      mockLoginUser.mockResolvedValue({
        success: true,
        data: {
          ...mockLoginResponse.data,
          accessToken: undefined,
          refreshToken: undefined
        },
        message: 'Success',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.loginError).toBe('Login incomplete - missing authentication tokens')
      })
    })
  })

  describe('forgotPassword Function', () => {
    it('should send forgot password request successfully', async () => {
      mockForgotPassword.mockResolvedValue({
        success: true,
        data: 'Password reset email sent',
        message: 'Success',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.forgotPassword({ email: 'test@example.com' })

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isForgotPasswordLoading).toBe(false)
        expect(result.current.forgotPasswordError).toBe(null)
      })

      expect(mockForgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' })
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Password Reset Email Sent',
        description: 'Password reset email sent'
      })
    })

    it('should set loading state during forgot password', async () => {
      mockForgotPassword.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: 'Email sent',
          message: 'Success',
          timestamp: new Date().toISOString()
        }), 50))
      )

      const { result } = renderHook(() => useAuthOperations())

      const promise = result.current.forgotPassword({ email: 'test@example.com' })

      await waitFor(() => {
        expect(result.current.isForgotPasswordLoading).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isForgotPasswordLoading).toBe(false)
      })
    })

    it('should handle forgot password API error', async () => {
      mockForgotPassword.mockResolvedValue({
        success: false,
        message: 'Email not found',
        error: 'Email not found',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.forgotPassword({ email: 'nonexistent@example.com' })

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.forgotPasswordError).toBe('Email not found')
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'error',
          title: 'Password Reset Request Failed',
          description: 'Email not found'
        })
      })
    })

    it('should handle forgot password network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockForgotPassword.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.forgotPassword({ email: 'test@example.com' })

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.forgotPasswordError).toBe('Failed to send reset link. Please try again.')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to send reset link'
        })
      })
    })
  })

  describe('resetPassword Function', () => {
    const resetData = {
      token: 'reset-token-123',
      new_password: 'NewPass123!',
      confirm_password: 'NewPass123!'
    }

    it('should reset password successfully', async () => {
      mockResetPassword.mockResolvedValue({
        success: true,
        message: 'Password reset successful',
        data: {
          user_id: '1',
          reset_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.resetPassword(resetData)

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isResetPasswordLoading).toBe(false)
        expect(result.current.resetPasswordError).toBe(null)
      })

      expect(mockResetPassword).toHaveBeenCalledWith(resetData)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Password Reset Successfully',
        description: 'Your password has been reset successfully. Please log in with your new password.'
      })
    })

    it('should set loading state during password reset', async () => {
      mockResetPassword.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          timestamp: new Date().toISOString()
        }), 50))
      )

      const { result } = renderHook(() => useAuthOperations())

      const promise = result.current.resetPassword(resetData)

      await waitFor(() => {
        expect(result.current.isResetPasswordLoading).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isResetPasswordLoading).toBe(false)
      })
    })

    it('should handle reset password API error', async () => {
      mockResetPassword.mockResolvedValue({
        success: false,
        message: 'Invalid token',
        error: 'Invalid token',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.resetPassword(resetData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.resetPasswordError).toBe('Invalid token')
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'error',
          title: 'Password Reset Failed',
          description: 'Invalid token'
        })
      })
    })

    it('should handle reset password network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockResetPassword.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.resetPassword(resetData)

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.resetPasswordError).toBe('Failed to reset password. Please try again.')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Failed to reset password'
        })
      })
    })
  })

  describe('validateResetToken Function', () => {
    it('should validate token successfully', async () => {
      mockValidateResetToken.mockResolvedValue({
        success: true,
        data: {
          token_valid: true,
          user_id: '1',
          expires_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        message: 'Token is valid',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const isValid = await result.current.validateResetToken('valid-token')

      await waitFor(() => {
        expect(isValid).toBe(true)
        expect(result.current.isValidatingToken).toBe(false)
        expect(result.current.tokenValidationErrorCode).toBe(null)
        expect(result.current.tokenValidationErrorMsg).toBe(null)
      })

      expect(mockValidateResetToken).toHaveBeenCalledWith('valid-token')
    })

    it('should set loading state during token validation', async () => {
      mockValidateResetToken.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {
            token_valid: true,
            user_id: '1',
            expires_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          message: 'Valid',
          timestamp: new Date().toISOString()
        }), 50))
      )

      const { result } = renderHook(() => useAuthOperations())

      const promise = result.current.validateResetToken('token')

      await waitFor(() => {
        expect(result.current.isValidatingToken).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isValidatingToken).toBe(false)
      })
    })

    it('should handle invalid token', async () => {
      mockValidateResetToken.mockResolvedValue({
        success: false,
        data: {
          token_valid: false,
          user_id: '1',
          expires_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        message: 'Token expired',
        error: 'Token expired',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const isValid = await result.current.validateResetToken('expired-token')

      await waitFor(() => {
        expect(isValid).toBe(false)
        expect(result.current.tokenValidationErrorCode).toBe('Token expired')
        expect(result.current.tokenValidationErrorMsg).toBe('Token expired')
      })
    })

    it('should handle token validation network error', async () => {
      const mockError = {
        response: {
          data: {
            error: 'INVALID_TOKEN',
            message: 'Token validation failed'
          }
        }
      } as AxiosError
      mockValidateResetToken.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthOperations())

      const isValid = await result.current.validateResetToken('token')

      await waitFor(() => {
        expect(isValid).toBe(false)
        expect(result.current.tokenValidationErrorCode).toBe('INVALID_TOKEN')
        expect(result.current.tokenValidationErrorMsg).toBe('Token validation failed')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Token Validation Failed'
        })
      })
    })
  })

  describe('refreshToken Function', () => {
    beforeEach(() => {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(mockUserData))
    })

    it('should refresh token successfully', async () => {
      mockRefreshToken.mockResolvedValue({
        success: true,
        data: { accessToken: 'new-access-token' },
        message: 'Token refreshed',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.refreshToken()

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isRefreshingToken).toBe(false)
        expect(result.current.refreshTokenError).toBe(null)
      })

      expect(mockRefreshToken).toHaveBeenCalledWith({ email: mockUserData.email })
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBe('new-access-token')
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event))
    })

    it('should handle missing user data', async () => {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.refreshToken()

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.refreshTokenError).toBe('User data not found. Please log in again.')
      })

      expect(mockRefreshToken).not.toHaveBeenCalled()
    })

    it('should handle refresh token API error', async () => {
      mockRefreshToken.mockResolvedValue({
        success: false,
        message: 'Refresh failed',
        error: 'Refresh failed',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.refreshToken()

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.refreshTokenError).toBe('Refresh failed')
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'error',
          title: 'Session Refresh Failed',
          description: 'Your session could not be refreshed. Please log in again.'
        })
      })
    })

    it('should handle refresh token network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockRefreshToken.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.refreshToken()

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.refreshTokenError).toBe('Failed to refresh token. Please log in again.')
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Session Refresh Failed'
        })
      })
    })
  })

  describe('logoutUser Function', () => {
    beforeEach(() => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'token')
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, 'refresh')
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(mockUserData))
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')
    })

    it('should logout user successfully', async () => {
      mockLogoutUser.mockResolvedValue({
        success: true,
        message: 'Logged out',
        data: {
          logged_out_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.logoutUser()

      await waitFor(() => {
        expect(success).toBe(true)
        expect(result.current.isLoggingOut).toBe(false)
        expect(result.current.logoutError).toBe(null)
      })

      expect(mockLogoutUser).toHaveBeenCalled()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.USER)).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.LOGGED_IN)).toBeNull()
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event))
      expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
      expect(mockCreateToastNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Logout Successful',
        description: 'You have been successfully logged out.'
      })
    })

    it('should set loading state during logout', async () => {
      mockLogoutUser.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Success',
          timestamp: new Date().toISOString()
        }), 50))
      )

      const { result } = renderHook(() => useAuthOperations())

      const promise = result.current.logoutUser()

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(true)
      })

      await promise

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(false)
      })
    })

    it('should handle logout API error', async () => {
      mockLogoutUser.mockResolvedValue({
        success: false,
        message: 'Logout failed',
        error: 'Logout failed',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.logoutUser()

      await waitFor(() => {
        expect(success).toBe(false)
        expect(result.current.logoutError).toBe('Logout failed')
        expect(mockCreateToastNotification).toHaveBeenCalledWith({
          type: 'error',
          title: 'Logout Failed',
          description: 'Logout failed'
        })
      })
    })

    it('should clear local data even if logout API fails', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockLogoutUser.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthOperations())

      const success = await result.current.logoutUser()

      await waitFor(() => {
        expect(success).toBe(true) // Returns true because local data was cleared
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.USER)).toBeNull()
        expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event))
        expect(mockPush).toHaveBeenCalledWith(AUTH_PAGE_ROUTES.LOGIN)
        expect(mockHandleApiError).toHaveBeenCalledWith(mockError, {
          title: 'Logout Failed'
        })
      })
    })

    it('should clear pending 2FA data on logout', async () => {
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID, 'user-id')
      localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL, 'email@test.com')

      mockLogoutUser.mockResolvedValue({
        success: true,
        message: 'Logged out',
        data: {
          logged_out_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      await result.current.logoutUser()

      await waitFor(() => {
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)).toBeNull()
        expect(localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)).toBeNull()
      })
    })
  })

  describe('State Management', () => {
    it('should clear errors when starting new operation', async () => {
      mockLoginUser.mockResolvedValue({
        success: false,
        error: 'First error',
        message: 'Failed',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      await result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(result.current.loginError).toBe('First error')
      })

      mockLoginUser.mockResolvedValue(mockLoginResponse)
      await result.current.loginUser(mockLoginData)

      await waitFor(() => {
        expect(result.current.loginError).toBe(null)
      })
    })

    it('should handle multiple concurrent operations', async () => {
      mockLoginUser.mockResolvedValue(mockLoginResponse)
      mockForgotPassword.mockResolvedValue({
        success: true,
        data: 'Email sent',
        message: 'Success',
        timestamp: new Date().toISOString()
      })

      const { result } = renderHook(() => useAuthOperations())

      const loginPromise = result.current.loginUser(mockLoginData)
      const forgotPromise = result.current.forgotPassword({ email: 'test@example.com' })

      await Promise.all([loginPromise, forgotPromise])

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false)
        expect(result.current.isForgotPasswordLoading).toBe(false)
      })
    })
  })
})
