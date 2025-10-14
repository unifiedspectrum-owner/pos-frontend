"use client"

/* Libraries imports */
import { useState, useCallback, useEffect } from 'react'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui'
import { handleApiError } from '@shared/utils/api'
import { useCountdownTimer } from '@shared/hooks/use-countdown-timer'
import { getCurrentISOString } from "@shared/utils";

/* Tenant module imports */
import { accountService } from '@tenant-management/api'
import { useOTPVerification } from '@/lib/modules/tenant-management/hooks/account-creation'
import { VERIFICATION_CONFIGS, TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { cleanupAccountCreationStorage } from '@tenant-management/utils'
import { TenantInfoFormData } from '../../schemas/account/creation'
import { AxiosError } from 'axios'

/* OTP management hook interface */
interface UseOTPManagementOptions {
  onSuccess?: () => void
  trigger?: (field: keyof TenantInfoFormData) => Promise<boolean>
}

/* OTP management hook return type */
interface UseOTPManagementReturn {
  /* Email OTP state */
  emailVerification: ReturnType<typeof useOTPVerification>
  isSendingEmailOTP: boolean
  emailOTPSent: boolean
  handleSendEmailOTP: (email: string) => Promise<void>
  
  /* Phone OTP state */
  phoneVerification: ReturnType<typeof useOTPVerification>
  isSendingPhoneOTP: boolean
  phoneOTPSent: boolean
  handleSendPhoneOTP: (phone: [string, string]) => Promise<void>
}

/* OTP state interface for localStorage persistence */
interface OTPStateData {
  emailOTPSent: boolean
  phoneOTPSent: boolean
  emailResendTimer: number
  phoneResendTimer: number
  lastUpdated: string
}

/* Reusable hook for managing OTP operations */
export const useOTPManagement = ({ 
  onSuccess, 
  trigger 
}: UseOTPManagementOptions = {}): UseOTPManagementReturn => {
  /* Email OTP state */
  const [isSendingEmailOTP, setIsSendingEmailOTP] = useState(false)
  const [emailOTPSent, setEmailOTPSent] = useState(false)
  
  /* Phone OTP state */
  const [isSendingPhoneOTP, setIsSendingPhoneOTP] = useState(false)
  const [phoneOTPSent, setPhoneOTPSent] = useState(false)

  /* Initialize verification hooks */
  const emailVerification = useOTPVerification(VERIFICATION_CONFIGS.email)
  const phoneVerification = useOTPVerification(VERIFICATION_CONFIGS.phone)

  /* Setup countdown timers */
  useCountdownTimer(emailVerification.resendTimer, emailVerification.setResendTimer)
  useCountdownTimer(phoneVerification.resendTimer, phoneVerification.setResendTimer)


  /* Load OTP states on component mount only */
  useEffect(() => {
    try {
      const otpStateJson = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE)
      if (otpStateJson) {
        const otpState: OTPStateData = JSON.parse(otpStateJson)
        const lastUpdated = new Date(otpState.lastUpdated)
        const now = new Date()
        const timeDiff = now.getTime() - lastUpdated.getTime()
        
        /* Only restore if less than 1 hour old */
        if (timeDiff < 60 * 60 * 1000) {
          setEmailOTPSent(otpState.emailOTPSent)
          setPhoneOTPSent(otpState.phoneOTPSent)
          
          /* Restore timers if they haven't expired */
          const emailTimeRemaining = Math.max(0, otpState.emailResendTimer - Math.floor(timeDiff / 1000))
          const phoneTimeRemaining = Math.max(0, otpState.phoneResendTimer - Math.floor(timeDiff / 1000))
          
          if (emailTimeRemaining > 0) {
            emailVerification.setResendTimer(emailTimeRemaining)
          }
          if (phoneTimeRemaining > 0) {
            phoneVerification.setResendTimer(phoneTimeRemaining)
          }
          
          console.log('Restored OTP states:', { emailOTPSent: otpState.emailOTPSent, phoneOTPSent: otpState.phoneOTPSent, emailTimeRemaining, phoneTimeRemaining })
        }
      }
    } catch (error) {
      console.log('Error loading OTP states:', error)
    }
  }, [emailVerification, phoneVerification]) // Empty dependency array - only run on mount


  /* Handle sending email OTP */
  const handleSendEmailOTP = useCallback(async (email: string) => {
    if (trigger) {
      const isValid = await trigger('primary_email')
      if (!isValid || !email) return
    }

    if (emailVerification.resendTimer > 0 || isSendingEmailOTP) return

    /* Save current form data to localStorage before sending OTP */
    onSuccess?.()
    
    setIsSendingEmailOTP(true)
    try {
      const response = await accountService.requestOTP({
        otp_type: 'email_verification',
        email: email
      })
      
      if (response.success) {
        setEmailOTPSent(true)
        emailVerification.setResendTimer(300)
        // Save state asynchronously to avoid re-render loops
        setTimeout(() => {
          const otpStateData: OTPStateData = {
            emailOTPSent: true,
            phoneOTPSent,
            emailResendTimer: 300,
            phoneResendTimer: phoneVerification.resendTimer,
            lastUpdated: getCurrentISOString()
          }
          localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE, JSON.stringify(otpStateData))
        }, 0)
        createToastNotification({
          title: 'OTP Sent',
          description: 'Email OTP has been sent to your email address.'
        })
      }
    } catch (error) {
      cleanupAccountCreationStorage()
      const err = error as AxiosError;
      handleApiError(err, {
        title: 'Failed to Send Email OTP'
      })
    } finally {
      setIsSendingEmailOTP(false)
    }
  }, [trigger, emailVerification, isSendingEmailOTP, onSuccess, phoneOTPSent, phoneVerification.resendTimer])

  /* Handle sending phone OTP */
  const handleSendPhoneOTP = useCallback(async (phone: [string, string]) => {
    if (trigger) {
      const isValid = await trigger('primary_phone')
      if (!isValid || !phone) return
    }

    if (phoneVerification.resendTimer > 0 || isSendingPhoneOTP) return

    /* Save current form data to localStorage before sending OTP */
    onSuccess?.()

    const phoneNumber = `${phone[0]}-${phone[1]}`

    setIsSendingPhoneOTP(true)
    try {
      const response = await accountService.requestOTP({
        otp_type: 'phone_verification',
        phone: phoneNumber
      })
      
      if (response.success) {
        setPhoneOTPSent(true)
        phoneVerification.setResendTimer(300)
        // Save state asynchronously to avoid re-render loops
        setTimeout(() => {
          const otpStateData: OTPStateData = {
            emailOTPSent,
            phoneOTPSent: true,
            emailResendTimer: emailVerification.resendTimer,
            phoneResendTimer: 300,
            lastUpdated: getCurrentISOString()
          }
          localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE, JSON.stringify(otpStateData))
        }, 0)
        createToastNotification({
          title: 'OTP Sent',
          description: 'Phone OTP has been sent to your phone number.'
        })
      }
    } catch (error) {
      cleanupAccountCreationStorage();
      const err = error as AxiosError;
      handleApiError(err, {
        title: 'Failed to Send Phone OTP'
      })
    } finally {
      setIsSendingPhoneOTP(false)
    }
  }, [trigger, phoneVerification, isSendingPhoneOTP, onSuccess, emailOTPSent, emailVerification.resendTimer])

  return {
    emailVerification,
    isSendingEmailOTP,
    emailOTPSent,
    handleSendEmailOTP,
    phoneVerification,
    isSendingPhoneOTP,
    phoneOTPSent,
    handleSendPhoneOTP
  }
}