"use client"

/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'
import { useRouter } from '@/i18n/navigation'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Auth module imports */
import { authManagementService } from '@auth-management/api'
import { LoginApiRequest, LoginApiResponse, ForgotPasswordApiRequest, ForgotPasswordApiResponse, ResetPasswordApiRequest, ResetPasswordApiResponse, ValidateResetTokenApiResponse } from '@auth-management/types'
import { AUTH_STORAGE_KEYS, AUTH_PAGE_ROUTES } from '@auth-management/constants'

/* Hook interface */
interface UseAuthOperationsReturn {
  /* Login operations */
  loginUser: (loginData: LoginApiRequest) => Promise<boolean>
  isLoggingIn: boolean
  loginError: string | null

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
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState<boolean>(false)
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null)
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState<boolean>(false)
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null)
  const [isValidatingToken, setIsValidatingToken] = useState<boolean>(false)
  const [tokenValidationErrorCode, setTokenValidationErrorCode] = useState<string | null>(null)
  const [tokenValidationErrorMsg, setTokenValidationErrorMsg] = useState<string | null>(null)
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
        /* Check if 2FA is required */
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
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken)
          localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken)
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.data.user))
          localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

          /* Dispatch auth state change event */
          window.dispatchEvent(new Event('authStateChanged'))

          /* Success notification */
          createToastNotification({
            type: 'success',
            title: 'Login Successful',
            description: `Welcome back, ${response.data.user.name}!`
          })

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

    /* Logout operations */
    logoutUser,
    isLoggingOut,
    logoutError
  }
}