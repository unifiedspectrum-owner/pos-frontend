"use client"

/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'
import { addMinutesToCurrentTime } from '@shared/utils/formatting'

/* Auth module imports */
import { authManagementService } from '@auth-management/api'
import { Generate2FAApiResponse, Enable2FAApiRequest, Enable2FAApiResponse, Disable2FAApiResponse, Verify2FAApiRequest, LoginApiResponse } from '@auth-management/types'
import { AUTH_STORAGE_KEYS, SESSION_TIMEOUT } from '@auth-management/constants'

/* Hook interface */
interface UseTwoFactorOperationsReturn {
  /* Generate 2FA operations */
  generate2FA: () => Promise<{ qrCodeData: string; backupCodes: string[] } | null>
  isGenerating2FA: boolean
  generate2FAError: string | null

  /* Enable 2FA operations */
  enable2FA: (enableData: Enable2FAApiRequest) => Promise<boolean>
  isEnabling2FA: boolean
  enable2FAError: string | null

  /* Disable 2FA operations */
  disable2FA: () => Promise<boolean>
  isDisabling2FA: boolean
  disable2FAError: string | null

  /* 2FA verification operations */
  verify2FA: (verify2FAData: Verify2FAApiRequest) => Promise<boolean>
  isVerifying2FA: boolean
  verify2FAError: string | null
}

/* Custom hook for 2FA setup operations */
export const useTwoFactorOperations = (): UseTwoFactorOperationsReturn => {
  /* Hook state */
  const [isGenerating2FA, setIsGenerating2FA] = useState<boolean>(false)
  const [generate2FAError, setGenerate2FAError] = useState<string | null>(null)
  const [isEnabling2FA, setIsEnabling2FA] = useState<boolean>(false)
  const [enable2FAError, setEnable2FAError] = useState<string | null>(null)
  const [isDisabling2FA, setIsDisabling2FA] = useState<boolean>(false)
  const [disable2FAError, setDisable2FAError] = useState<string | null>(null)
  const [isVerifying2FA, setIsVerifying2FA] = useState<boolean>(false)
  const [verify2FAError, setVerify2FAError] = useState<string | null>(null)

  /* Generate 2FA operation */
  const generate2FA = useCallback(async (): Promise<{ qrCodeData: string; backupCodes: string[] } | null> => {
    try {
      setIsGenerating2FA(true)
      setGenerate2FAError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTwoFactorOperations] Generating 2FA QR code and backup codes')

      /* Call generate 2FA API */
      const response: Generate2FAApiResponse = await authManagementService.generate2FA()

      /* Check if generation was successful */
      if (response.success && response.data) {
        /* Parse backup codes from JSON string to array */
        const backupCodes = response.data.backup_codes
          ? JSON.parse(response.data.backup_codes)
          : []

        /* QR code is already in data URL format (data:image/svg+xml;base64,<data>) */
        const qrCodeData = response.data.qr_code_url || ''

        console.log('[useTwoFactorOperations] Successfully generated 2FA data')
        return {
          qrCodeData,
          backupCodes
        }
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to generate 2FA data'
        console.error('[useTwoFactorOperations] Generate 2FA failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: '2FA Generation Failed',
          description: errorMsg
        })

        setGenerate2FAError(errorMsg)
        return null
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to generate 2FA data. Please try again.'
      console.error('[useTwoFactorOperations] Generate 2FA error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: '2FA Generation Failed'
      })

      setGenerate2FAError(errorMsg)
      return null

    } finally {
      setIsGenerating2FA(false)
    }
  }, [])

  /* Enable 2FA operation */
  const enable2FA = useCallback(async (enableData: Enable2FAApiRequest): Promise<boolean> => {
    try {
      setIsEnabling2FA(true)
      setEnable2FAError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTwoFactorOperations] Enabling 2FA for user')

      /* Call enable 2FA API */
      const response: Enable2FAApiResponse = await authManagementService.enable2FA(enableData)

      /* Check if enabling was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: '2FA Enabled Successfully',
          description: 'Two-factor authentication has been enabled for your account.'
        })

        console.log('[useTwoFactorOperations] Successfully enabled 2FA')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to enable 2FA'
        console.error('[useTwoFactorOperations] Enable 2FA failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: '2FA Enable Failed',
          description: errorMsg
        })

        setEnable2FAError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to enable 2FA. Please try again.'
      console.error('[useTwoFactorOperations] Enable 2FA error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: '2FA Enable Failed'
      })

      setEnable2FAError(errorMsg)
      return false

    } finally {
      setIsEnabling2FA(false)
    }
  }, [])

  /* Disable 2FA operation */
  const disable2FA = useCallback(async (): Promise<boolean> => {
    try {
      setIsDisabling2FA(true)
      setDisable2FAError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTwoFactorOperations] Disabling 2FA for user')

      /* Call disable 2FA API */
      const response: Disable2FAApiResponse = await authManagementService.disable2FA()

      /* Check if disabling was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: '2FA Disabled Successfully',
          description: 'Two-factor authentication has been disabled for your account.'
        })

        console.log('[useTwoFactorOperations] Successfully disabled 2FA')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to disable 2FA'
        console.error('[useTwoFactorOperations] Disable 2FA failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: '2FA Disable Failed',
          description: errorMsg
        })

        setDisable2FAError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to disable 2FA. Please try again.'
      console.error('[useTwoFactorOperations] Disable 2FA error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: '2FA Disable Failed'
      })

      setDisable2FAError(errorMsg)
      return false

    } finally {
      setIsDisabling2FA(false)
    }
  }, [])

  /* 2FA verification operation */
  const verify2FA = useCallback(async (verify2FAData: Verify2FAApiRequest): Promise<boolean> => {
    try {
      setIsVerifying2FA(true)
      setVerify2FAError(null)

      console.log('[useTwoFactorSetup] Attempting 2FA verification for user:', { user_id: verify2FAData.user_id })

      /* Call 2FA verification API */
      const response: LoginApiResponse = await authManagementService.verify2fa(verify2FAData)

      /* Check if verification was successful */
      if (response.success && response.data) {
        /* Complete login with tokens */
        if (response.data.is_2fa_authenticated && response.data.accessToken && response.data.refreshToken) {
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken)
          localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken)
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.data.user))
          localStorage.setItem(AUTH_STORAGE_KEYS.LOGGED_IN, 'true')

          /* Set session expiry time */
          const sessionExpiryTime = addMinutesToCurrentTime(SESSION_TIMEOUT)
          localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRY_TIME, sessionExpiryTime.toString())

          /* Clear pending 2FA data */
          localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_USER_ID)
          localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_2FA_EMAIL)

          /* Dispatch auth state change event */
          window.dispatchEvent(new Event('authStateChanged'))

          /* Success notification */
          createToastNotification({
            type: 'success',
            title: '2FA Verification Successful',
            description: `Welcome, ${response.data.user.name}! You are now logged in.`
          })

          console.log('[useTwoFactorSetup] Successfully verified 2FA and logged in user')
          return true
        }

        /* Handle incomplete verification response */
        const errorMsg = '2FA verification incomplete - missing authentication tokens'
        console.error('[useTwoFactorSetup] 2FA verification incomplete:', errorMsg)
        setVerify2FAError(errorMsg)
        return false
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || '2FA verification failed'
        console.error('[useTwoFactorSetup] 2FA verification failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: '2FA Verification Failed',
          description: errorMsg
        })

        setVerify2FAError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to verify 2FA code. Please try again.'
      console.error('[useTwoFactorSetup] 2FA verification error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: '2FA Verification Failed'
      })

      setVerify2FAError(errorMsg)
      return false

    } finally {
      setIsVerifying2FA(false)
    }
  }, [])

  return {
    /* Generate 2FA operations */
    generate2FA,
    isGenerating2FA,
    generate2FAError,

    /* Enable 2FA operations */
    enable2FA,
    isEnabling2FA,
    enable2FAError,

    /* Disable 2FA operations */
    disable2FA,
    isDisabling2FA,
    disable2FAError,

    /* 2FA verification operations */
    verify2FA,
    isVerifying2FA,
    verify2FAError
  }
}