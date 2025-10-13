"use client"

/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'
import { useRouter } from '@/i18n/navigation'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'
import { addMinutesToCurrentTime } from '@shared/utils/formatting'

/* Auth module imports */
import { authManagementService } from '@auth-management/api'
import { LoginApiRequest, LoginApiResponse, ForgotPasswordApiRequest, ForgotPasswordApiResponse, ResetPasswordApiRequest, ResetPasswordApiResponse, ValidateResetTokenApiResponse, RefreshTokenApiRequest, RefreshTokenApiResponse } from '@auth-management/types'
import { AUTH_STORAGE_KEYS, AUTH_PAGE_ROUTES, SESSION_TIMEOUT } from '@auth-management/constants'

/* Hook interface */
interface UseAuthOperationsReturn {
  /* Login operations */
  loginUser: (loginData: LoginApiRequest) => Promise<boolean>
  isLoggingIn: boolean
  loginError: string | null
  shouldShow2FAReminder: boolean

  /* Forgot password operations */
  forgotPassword: (forgotPasswordData: ForgotPasswordApiRequest) => Promise<boolean>
  isForgotPasswordLoading: boolean
  forgotPasswordError: string | null

  /* Reset password operations */
  resetPassword: (resetPasswordData: ResetPasswordApiRequest) => Promise<boolean>
  isResetPasswordLoading: boolean
  resetPasswordError: string | null

  /* Token validation operations */
  validateResetToken: (token: string) => Promise<boolean>
  isValidatingToken: boolean
  tokenValidationErrorCode: string | null
  tokenValidationErrorMsg: string | null

  /* Refresh token operations */
  refreshToken: () => Promise<boolean>
  isRefreshingToken: boolean
  refreshTokenError: string | null

  /* Logout operations */
  logoutUser: () => Promise<boolean>
  isLoggingOut: boolean
  logoutError: string | null
}

/* Custom hook for authentication operations */
export const useAuthOperations = (): UseAuthOperationsReturn => {
  const router = useRouter()

  /* Hook state */
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [shouldShow2FAReminder, setShouldShow2FAReminder] = useState<boolean>(false)
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState<boolean>(false)
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null)
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState<boolean>(false)
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null)
  const [isValidatingToken, setIsValidatingToken] = useState<boolean>(false)
  const [tokenValidationErrorCode, setTokenValidationErrorCode] = useState<string | null>(null)
  const [tokenValidationErrorMsg, setTokenValidationErrorMsg] = useState<string | null>(null)
  const [isRefreshingToken, setIsRefreshingToken] = useState<boolean>(false)
  const [refreshTokenError, setRefreshTokenError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  /* Login user operation */
  const loginUser = useCallback(async (loginData: LoginApiRequest): Promise<boolean> => {
    try {
      setIsLoggingIn(true)
      setLoginError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useAuthOperations] Attempting user login:', { email: loginData.email })

      /* Call login API */
      const response: LoginApiResponse = await authManagementService.loginUser(loginData)

      /* Check if login was successful */
      if (response.success && response.data) {
        /* Check if user needs to set up 2FA (required but not enabled) */
        if (response.data.user.is_2fa_required && !response.data.requires_2fa) {
          console.log('[useAuthOperations] 2FA setup required before accessing admin')

          /* Store tokens temporarily for 2FA setup flow */
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken || '')
          localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken || '')
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.data.user))
          localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED, 'true')

          /* Show info notification */
          createToastNotification({
            type: 'warning',
            title: '2FA Setup Required',
            description: 'Please set up two-factor authentication to continue.'
          })

          /* Redirect to 2FA setup page */
          router.push(AUTH_PAGE_ROUTES.SETUP_2FA)

          return false // Don't complete login yet
        }

        /* Check if 2FA is required (already enabled, needs verification) */
        if (response.data.requires_2fa && !response.data.is_2fa_authenticated) {
          console.log('[useAuthOperations] 2FA verification required')

          /* Store pending 2FA data for verification page */
          localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID, response.data.user.id)
          localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL, response.data.user.email)

          /* Show info notification */
          createToastNotification({
            type: 'warning',
            title: '2FA Verification Required',
            description: 'Please enter the 6-digit code from your authenticator app.'
          })

          /* Redirect to 2FA verification page */
          router.push(AUTH_PAGE_ROUTES.VERIFY_2FA)

          return false // Don't complete login yet
        }

        /* Complete login if no 2FA required or already authenticated */
        if (response.data.accessToken && response.data.refreshToken) {
          console.log('[useAuthOperations] User data from API:', response.data.user)

          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken)
          localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken)
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.data.user))
          localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

          /* Set session expiry time */
          const sessionExpiryTime = addMinutesToCurrentTime(SESSION_TIMEOUT)
          localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, sessionExpiryTime.toString())

          console.log('[useAuthOperations] Stored user data:', JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.USER) || '{}'))

          /* Dispatch auth state change event */
          window.dispatchEvent(new Event('authStateChanged'))

          /* Success notification */
          createToastNotification({
            type: 'success',
            title: 'Login Successful',
            description: `Welcome back, ${response.data.user.name}!`
          })

          /* Check if user needs 2FA reminder */
          if (Boolean(response.data.user.is_2fa_required)) {
            setShouldShow2FAReminder(true)
          }

          console.log('[useAuthOperations] Successfully logged in user')
          return true
        }

        /* Handle incomplete login data */
        const errorMsg = 'Login incomplete - missing authentication tokens'
        console.error('[useAuthOperations] Login incomplete:', errorMsg)
        setLoginError(errorMsg)
        return false
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Login failed'
        console.error('[useAuthOperations] Login failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Login Failed',
          description: errorMsg
        })

        setLoginError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to login. Please try again.'
      console.error('[useAuthOperations] Login error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Login Failed'
      })

      setLoginError(errorMsg)
      return false

    } finally {
      setIsLoggingIn(false)
    }
  }, [router])

  /* Forgot password operation */
  const forgotPassword = useCallback(async (forgotPasswordData: ForgotPasswordApiRequest): Promise<boolean> => {
    try {
      setIsForgotPasswordLoading(true)
      setForgotPasswordError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useAuthOperations] Requesting password reset for:', { email: forgotPasswordData.email })

      /* Call forgot password API */
      const response: ForgotPasswordApiResponse = await authManagementService.forgotPassword(forgotPasswordData)

      /* Check if request was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Password Reset Email Sent',
          description: response.data || 'Please check your email for password reset instructions.'
        })

        console.log('[useAuthOperations] Password reset link sent successfully')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to send reset link'
        console.error('[useAuthOperations] Forgot password failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Password Reset Request Failed',
          description: errorMsg
        })

        setForgotPasswordError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to send reset link. Please try again.'
      console.error('[useAuthOperations] Forgot password error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to send reset link'
      })

      setForgotPasswordError(errorMsg)
      return false

    } finally {
      setIsForgotPasswordLoading(false)
    }
  }, [])

  /* Reset password operation */
  const resetPassword = useCallback(async (resetPasswordData: ResetPasswordApiRequest): Promise<boolean> => {
    try {
      setIsResetPasswordLoading(true)
      setResetPasswordError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useAuthOperations] Resetting password with token')

      /* Call reset password API */
      const response: ResetPasswordApiResponse = await authManagementService.resetPassword(resetPasswordData)

      /* Check if request was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Password Reset Successfully',
          description: 'Your password has been reset successfully. Please log in with your new password.'
        })

        console.log('[useAuthOperations] Password reset successfully')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to reset password'
        console.error('[useAuthOperations] Reset password failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Password Reset Failed',
          description: errorMsg
        })

        setResetPasswordError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to reset password. Please try again.'
      console.error('[useAuthOperations] Reset password error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to reset password'
      })

      setResetPasswordError(errorMsg)
      return false

    } finally {
      setIsResetPasswordLoading(false)
    }
  }, [])

  /* Validate reset token operation */
  const validateResetToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      setIsValidatingToken(true)
      setTokenValidationErrorCode(null)
      setTokenValidationErrorMsg(null)

      console.log('[useAuthOperations] Validating reset token')

      /* Call validate token API */
      const response: ValidateResetTokenApiResponse = await authManagementService.validateResetToken(token)

      /* Check if validation was successful and token is valid */
      if (response.success && response.data?.token_valid === true) {
        console.log('[useAuthOperations] Token validation successful')
        return true
      } else {
        /* Handle API success=false case or token_valid=false */
        const errorMsg = response.error || response.message || 'Invalid or expired token'
        console.error('[useAuthOperations] Token validation failed:', {
          success: response.success,
          token_valid: response.data?.token_valid,
          message: errorMsg
        })

        setTokenValidationErrorCode(errorMsg)
        setTokenValidationErrorMsg(errorMsg)
        return false
      }

    } catch (error: unknown) {
      console.error('[useAuthOperations] Token validation error:', error)
      
      const err = error as AxiosError;
      const errData = err?.response?.data as any;
      const errorCode = errData?.error || 'INVALID TOKEN'
      const errorMsg = errData?.message || 'Failed to validate token'
      handleApiError(err, {
        title: 'Token Validation Failed',
      })

      setTokenValidationErrorCode(errorCode)
      setTokenValidationErrorMsg(errorMsg)
      return false

    } finally {
      setIsValidatingToken(false)
    }
  }, [])

  /* Refresh token operation */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      setIsRefreshingToken(true)
      setRefreshTokenError(null)

      console.log('[useAuthOperations] Refreshing authentication token')

      /* Get user email from localStorage */
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER)
      if (!storedUser) {
        const errorMsg = 'User data not found. Please log in again.'
        console.error('[useAuthOperations] User data not found in localStorage')
        setRefreshTokenError(errorMsg)
        return false
      }

      const userData = JSON.parse(storedUser)
      const refreshTokenData: RefreshTokenApiRequest = {
        email: userData.email
      }

      /* Call refresh token API */
      const response: RefreshTokenApiResponse = await authManagementService.refreshToken(refreshTokenData)

      /* Check if refresh was successful */
      if (response.success && response.data?.accessToken) {
        /* Update access token in localStorage */
        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken)

        /* Extend session expiry time */
        const sessionExpiryTime = addMinutesToCurrentTime(SESSION_TIMEOUT)
        localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, sessionExpiryTime.toString())

        /* Dispatch auth state change event */
        window.dispatchEvent(new Event('authStateChanged'))

        console.log('[useAuthOperations] Token refreshed successfully')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to refresh token'
        console.error('[useAuthOperations] Token refresh failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Session Refresh Failed',
          description: 'Your session could not be refreshed. Please log in again.'
        })

        setRefreshTokenError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to refresh token. Please log in again.'
      console.error('[useAuthOperations] Token refresh error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Session Refresh Failed'
      })

      setRefreshTokenError(errorMsg)
      return false

    } finally {
      setIsRefreshingToken(false)
    }
  }, [])

  /* Logout user operation */
  const logoutUser = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoggingOut(true)
      setLogoutError(null)

      console.log('[useAuthOperations] Attempting user logout')

      /* Call logout API */
      const response = await authManagementService.logoutUser()

      /* Check if logout was successful */
      if (response.success) {
        /* Clear all authentication data */
        localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
        localStorage.removeItem(AUTH_STORAGE_KEYS.LOGGED_IN)
        localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME)

        /* Clear any pending 2FA data */
        localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)
        localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)

        /* Dispatch auth state change event */
        window.dispatchEvent(new Event('authStateChanged'))

        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Logout Successful',
          description: 'You have been successfully logged out.'
        })

        /* Redirect to login page */
        router.push(AUTH_PAGE_ROUTES.LOGIN)

        console.log('[useAuthOperations] Successfully logged out user')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Logout failed'
        console.error('[useAuthOperations] Logout failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Logout Failed',
          description: errorMsg
        })

        setLogoutError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to logout. Please try again.'
      console.error('[useAuthOperations] Logout error:', error)

      /* Even if API call fails, still clear local data for security */
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER)
      localStorage.removeItem(AUTH_STORAGE_KEYS.LOGGED_IN)
      localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME)
      localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)
      localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)

      /* Dispatch auth state change event */
      window.dispatchEvent(new Event('authStateChanged'))

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Logout Failed'
      })

      /* Redirect to login page anyway */
      router.push(AUTH_PAGE_ROUTES.LOGIN)

      setLogoutError(errorMsg)
      return true /* Return true since we cleared local data anyway */

    } finally {
      setIsLoggingOut(false)
    }
  }, [router])

  return {
    /* Login operations */
    loginUser,
    isLoggingIn,
    loginError,
    shouldShow2FAReminder,

    /* Forgot password operations */
    forgotPassword,
    isForgotPasswordLoading,
    forgotPasswordError,

    /* Reset password operations */
    resetPassword,
    isResetPasswordLoading,
    resetPasswordError,

    /* Token validation operations */
    validateResetToken,
    isValidatingToken,
    tokenValidationErrorCode,
    tokenValidationErrorMsg,

    /* Refresh token operations */
    refreshToken,
    isRefreshingToken,
    refreshTokenError,

    /* Logout operations */
    logoutUser,
    isLoggingOut,
    logoutError
  }
}