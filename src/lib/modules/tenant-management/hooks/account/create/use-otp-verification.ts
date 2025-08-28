"use client"

/* React hooks */
import { useState, useCallback } from 'react'

/* UI components */
import { toaster } from '@/components/ui/toaster'

/* Module-specific imports */
import { tenantApiService } from '@tenant-management/api/tenants'
import { VerifyTenantAccountVerificationOTPAPIRequest, RequestTenantAccountVerificationOTPAPIRequest } from '@tenant-management/types'
import { StepTracker } from '@tenant-management/utils'
import { handleApiError } from '@shared/utils/api-error-handler'

/* Type definitions for verification types */
export type VerificationType = 'email_verification' | 'phone_verification'
export type StepType = 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION'

/* Configuration interface for OTP verification */
export interface VerificationConfig {
  type: VerificationType
  stepType: StepType
  verifyButtonText: string
  resendDescriptionText: string
  successMessage: string
  verificationKey: 'email_otp' | 'phone_otp'
}

/* Custom hook for OTP verification with resend functionality */
export const useOTPVerification = (config: VerificationConfig) => {
  /* State management for verification process */
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [tenantId, setTenantId] = useState<string>('')

  /* Validate and convert OTP array to number */
  const validateOTP = useCallback((otpArray: string[]): number | null => {
    const otpString = otpArray.join('')
    const otpNumber = parseInt(otpString, 10)
    
    /* Show error toast if OTP is not a valid number */
    if (isNaN(otpNumber)) {
      toaster.create({
        title: 'Invalid OTP',
        description: 'Please enter a valid numeric OTP code.',
        type: 'error',
        duration: 5000,
        closable: true
      })
      return null
    }
    return otpNumber
  }, [])

  /* Verify OTP with API call and handle success/error states */
  const verifyOTP = useCallback(async (otpArray: string[]) => {
    const otpNumber = validateOTP(otpArray)
    if (!otpNumber) return

    setIsLoading(true)
    try {
      /* Prepare API request payload */
      const apiRequest: VerifyTenantAccountVerificationOTPAPIRequest = {
        tenant_id: tenantId,
        otp_type: config.type,
        otp_code: otpNumber
      }

      const response = await tenantApiService.verifyTenantAccountVerificationOTP(apiRequest)
      
      /* Handle successful verification */
      if (response.data.success && response.data.data?.verified) {
        setIsVerified(true)
        StepTracker.markStepCompleted(config.stepType)
        toaster.create({
          title: `${config.successMessage} Verification Successful`,
          description: `${config.successMessage} has been verified successfully.`,
          type: 'success',
          duration: 5000,
          closable: true
        })
      }
    } catch (err) {
      /* Handle verification errors */
      console.log(`${config.type} OTP Error`, err)
      handleApiError(err, {
        title: `${config.successMessage} OTP Validation Error`
      })
    } finally {
      setIsLoading(false)
    }
  }, [tenantId, config, validateOTP])

  /* Resend OTP with cooldown timer to prevent spam */
  const resendOTP = useCallback(async () => {
    /* Prevent resend if timer is active or already resending */
    if (resendTimer > 0 || isResending) return
    
    setIsResending(true)
    try {
      /* Prepare resend request payload */
      const apiRequest: RequestTenantAccountVerificationOTPAPIRequest = {
        tenant_id: tenantId,
        otp_type: config.type
      }

      const response = await tenantApiService.requestTenantAccountVerificationOTP(apiRequest)
      
      /* Handle successful OTP resend */
      if (response.data.success) {
        setResendTimer(300) /* Set 5-minute cooldown timer */
        toaster.create({
          title: 'OTP Sent Successfully',
          description: config.resendDescriptionText,
          type: 'success',
          duration: 5000,
          closable: true
        })
      }
    } catch (err) {
      /* Handle resend errors */
      console.log(`${config.type} Resend API error`, err)
      handleApiError(err, {
        title: `${config.successMessage} OTP Resending API error`
      })
    } finally {
      setIsResending(false)
    }
  }, [resendTimer, isResending, tenantId, config])

  /* Return hook interface with state and actions */
  return {
    isLoading,
    isVerified,
    setIsVerified,
    resendTimer,
    setResendTimer,
    isResending,
    verifyOTP,
    resendOTP,
    setTenantId
  }
}