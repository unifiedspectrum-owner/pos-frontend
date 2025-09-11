"use client"

/* Libraries imports */
import { useState, useCallback, useEffect } from 'react'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui'

/* Tenant module imports */
import { tenantApiService } from '@tenant-management/api'
import { VerificationOTPApiRequest, RequestOTPApiRequest, VerificationType } from '@tenant-management/types/account'
import { getCachedVerificationStatus, StepTracker, clearOTPState } from '@tenant-management/utils'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

/* Verification type definitions */
export type StepType = 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION'

/* OTP verification configuration parameters */
export interface VerificationConfig {
  type: VerificationType
  stepType: StepType
  verifyButtonText: string
  resendDescriptionText: string
  successMessage: string
  verificationKey: 'email_otp' | 'phone_otp'
}

/* Account verification hook with OTP validation and resend capability */
export const useOTPVerification = (config: VerificationConfig) => {
  /* Verification state management */
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [isResending, setIsResending] = useState(false)

  /* Load verification status from localStorage on mount */
  useEffect(() => {
    try {
      const verificationData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA)
      if (verificationData) {
        const status = JSON.parse(verificationData)
        
        /* Restore verification status based on config type */
        if (config.type === 'email_verification' && status.email_verified) {
          setIsVerified(true)
          console.log('Restored email verification status from localStorage')
        } else if (config.type === 'phone_verification' && status.phone_verified) {
          setIsVerified(true)
          console.log('Restored phone verification status from localStorage')
        }
      }
    } catch (error) {
      console.log('Error loading verification status:', error)
    }
  }, [config.type])

  /* Convert and validate OTP string to number */
  const validateOTP = useCallback((otpValue: string): number | null => {
    const otpNumber = parseInt(otpValue, 10);

    if (!otpValue) {
      createToastNotification({
        title: 'OTP Required',
        description: 'Please enter the OTP code to verify.',
        type: 'error'
      })
      return null;
    }
                                                          
    if (otpValue.length !== 6) {
      createToastNotification({
        title: 'Invalid OTP',
        description: 'Please enter a complete 6-digit OTP code.',
        type: 'error'
      })
      return null;
    }
    
    /* Validate numeric format */
    if (isNaN(otpNumber)) {
      createToastNotification({
        title: 'Invalid OTP',
        description: 'Please enter a valid numeric OTP code.',
        type: 'error'
      })
      return null
    }
    return otpNumber
  }, [])

  /* Submit OTP for verification via API */
  const verifyOTP = useCallback(async (otp: string) => {
    const otpNumber = validateOTP(otp)
    if (!otpNumber) return

    setIsLoading(true)
    try {
      /* Build verification request payload */
      const apiRequest: VerificationOTPApiRequest = {
        otp_type: config.type,
        otp_code: otpNumber
      }

      const response = await tenantApiService.verifyOTP(apiRequest)
      
      /* Process successful verification */
      if (response.success && response.data?.verified) {
        setIsVerified(true)
        StepTracker.markStepCompleted(config.stepType)
        
        /* Update localStorage immediately after successful verification */
        try {
          const verificationStatus = getCachedVerificationStatus()
          
          if (config.type === 'email_verification') {
            verificationStatus.email_verified = true
            verificationStatus.email_verified_at = new Date().toISOString()
          } else if (config.type === 'phone_verification') {
            verificationStatus.phone_verified = true
            verificationStatus.phone_verified_at = new Date().toISOString()
          }
          
          localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, JSON.stringify(verificationStatus))
          console.log(`Updated ${config.type} verification status in localStorage`)
          
          /* Clear OTP state if both email and phone are verified */
          if (verificationStatus.email_verified && verificationStatus.phone_verified) {
            clearOTPState()
          }
        } catch (error) {
          console.log('Error updating verification status in localStorage:', error)
        }
        
        createToastNotification({
          title: `${config.successMessage} Verification Successful`,
          description: `${config.successMessage} has been verified successfully.`,
        })
      }
    } catch (err) {
      /* Log and display verification errors */
      console.log(`${config.type} OTP Error`, err)
      handleApiError(err, {
        title: `${config.successMessage} OTP Validation Error`
      })
    } finally {
      setIsLoading(false)
    }
  }, [config, validateOTP])

  /* Request new OTP with anti-spam cooldown */
  const resendOTP = useCallback(async (email?: string, phone?: string) => {
    /* Check cooldown timer and resend state */
    if (resendTimer > 0 || isResending) return
    
    setIsResending(true)
    try {
      /* Build OTP request payload */
      const apiRequest: RequestOTPApiRequest = {
        otp_type: config.type,
        ...(email && { email }),
        ...(phone && { phone })
      }

      const response = await tenantApiService.requestOTP(apiRequest)
      
      /* Process successful resend */
      if (response.success) {
        setResendTimer(300) /* Set 5-minute cooldown */
        createToastNotification({
          title: 'OTP Sent Successfully',
          description: config.resendDescriptionText,
        })
      }
    } catch (err) {
      /* Log and display resend errors */
      console.log(`${config.type} Resend API error`, err)
      handleApiError(err, {
        title: `${config.successMessage} OTP Resending API error`
      })
    } finally {
      setIsResending(false)
    }
  }, [resendTimer, isResending, config])

  /* Hook interface with verification state and actions */
  return {
    isLoading,
    isVerified,
    setIsVerified,
    resendTimer,
    setResendTimer,
    isResending,
    verifyOTP,
    resendOTP
  }
}