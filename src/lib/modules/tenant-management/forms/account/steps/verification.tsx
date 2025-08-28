/* React and Chakra UI component imports */
import React, { useEffect, useCallback, useRef } from 'react'
import { Flex, SimpleGrid } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'
import { createToastMessage } from '@shared/utils/ui/toast'
import { handleApiError } from '@shared/utils/api-error-handler'
import { useCountdownTimer } from '@shared/hooks/use-countdown-timer'

/* Tenant module imports */
import { TENANT_COMPANY_VERIFICATION_QUESTIONS } from '@tenant-management/constants'
import { EmailOTPVerificationData, emailOTPVerificationSchema, PhoneOTPVerificationData, phoneOTPVerificationSchema } from '@tenant-management/schemas/validation'
import { TenantVerificationStatus } from '@tenant-management/types'
import { tenantApiService } from '@tenant-management/api/tenants'
import { StepTracker } from '@tenant-management/utils'
import { useOTPVerification, type VerificationConfig } from '@tenant-management/hooks'
import { VerificationSection } from '@tenant-management/forms/account/steps/components'

interface VerificationStepProps {
  isCompleted: (completed: boolean) => void
  onPrevious?: () => void
  isReviewMode?: boolean
}

/* Verification configurations */
const VERIFICATION_CONFIGS: Record<string, VerificationConfig> = {
  email: {
    type: 'email_verification',
    stepType: 'EMAIL_VERIFICATION',
    verifyButtonText: 'Verify Email OTP',
    resendDescriptionText: 'A new OTP has been sent to your email address.',
    successMessage: 'Email',
    verificationKey: 'email_otp'
  },
  phone: {
    type: 'phone_verification',
    stepType: 'PHONE_VERIFICATION', 
    verifyButtonText: 'Verify Phone OTP',
    resendDescriptionText: 'A new OTP has been sent to your phone number.',
    successMessage: 'Phone',
    verificationKey: 'phone_otp'
  }
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  isCompleted,
  onPrevious,
  isReviewMode = false
}) => {

  /* Initialize verification hooks with configs */
  const emailVerification = useOTPVerification(VERIFICATION_CONFIGS.email)
  const phoneVerification = useOTPVerification(VERIFICATION_CONFIGS.phone)
  
  /* Setup countdown timers for resend functionality */
  useCountdownTimer(emailVerification.resendTimer, emailVerification.setResendTimer)
  useCountdownTimer(phoneVerification.resendTimer, phoneVerification.setResendTimer)

  /* Form configurations with validation */
  const emailForm = useForm<EmailOTPVerificationData>({
    resolver: zodResolver(emailOTPVerificationSchema)
  })
  
  const phoneForm = useForm<PhoneOTPVerificationData>({
    resolver: zodResolver(phoneOTPVerificationSchema)
  })

  /* OTP submission handlers */
  const handleEmailSubmit = useCallback((data: EmailOTPVerificationData) => {
    emailVerification.verifyOTP(data.email_otp)
  }, [emailVerification])

  const handlePhoneSubmit = useCallback((data: PhoneOTPVerificationData) => {
    phoneVerification.verifyOTP(data.phone_otp)
  }, [phoneVerification])

  /* Prevent duplicate OTP sending */
  const otpSentRef = useRef(false)

  /* Send OTPs for all verification types on component initialization */
  const sendInitialOTPs = useCallback(async (tenantId: string, verificationStatus: TenantVerificationStatus) => {
    if (otpSentRef.current) return
    
    const needsVerification = !verificationStatus.email_verified && !verificationStatus.phone_verified
    if (!needsVerification) return
    
    otpSentRef.current = true
    
    try {
      await tenantApiService.requestTenantAccountVerificationOTP({
        tenant_id: tenantId,
        otp_type: 'all'
      })
      
      createToastMessage({
        title: 'Verification Codes Sent',
        description: 'OTP codes have been sent to your email and phone number.'
      })
    } catch (error) {
      otpSentRef.current = false
      console.log("Error sending initial OTPs", error)
      handleApiError(error, {
        title: "Failed to Send Verification Codes"
      })
    }
  }, [])

  /* Load verification state from localStorage and initialize hooks */
  const initializeVerificationStep = useCallback(async () => {
    try {
      const tenantId = localStorage.getItem('tenant_id')
      const tenantVerificationData = localStorage.getItem('tenant_verification_data')
      
      if (!tenantId) {
        createToastMessage({
          title: "Tenant ID not Found",
          description: "Please refresh or reload the page",
          type: 'error',
        })
        return
      }
      
      if (!tenantVerificationData) return
      
      /* Set tenant ID for both verification hooks */
      emailVerification.setTenantId(tenantId)
      phoneVerification.setTenantId(tenantId)
      
      const verificationStatus: TenantVerificationStatus = JSON.parse(tenantVerificationData)
      
      /* Restore verification states */
      if (verificationStatus.email_verified) {
        emailVerification.setIsVerified(true)
        StepTracker.markStepCompleted('EMAIL_VERIFICATION')
      }
      
      if (verificationStatus.phone_verified) {
        phoneVerification.setIsVerified(true)
        StepTracker.markStepCompleted('PHONE_VERIFICATION')
      }
      
      /* Send OTPs if not in review mode */
      if (!isReviewMode) {
        await sendInitialOTPs(tenantId, verificationStatus)
      }
    } catch (error) {
      console.log("Error from initializeVerificationStep", error)
    }
  }, [emailVerification, phoneVerification, sendInitialOTPs, isReviewMode])

  /* Run initialization on component mount */
  useEffect(() => {
    initializeVerificationStep()
  }, [initializeVerificationStep])

  /* Monitor completion status and notify parent */
  const allVerified = emailVerification.isVerified && phoneVerification.isVerified
  
  useEffect(() => {
    /* Auto-complete only if not in review mode */
    console.log("Is Review Mode", isReviewMode)
    if (allVerified && !isReviewMode) {
      isCompleted(true)
    }
  }, [allVerified, isCompleted, isReviewMode])
  
  /* Handle continue button click with validation */
  const handleContinue = () => {
    if (allVerified) {
      isCompleted(true)
      return
    }
    
    /* Trigger validation for incomplete fields */
    if (!emailVerification.isVerified) {
      emailForm.handleSubmit(() => {})() 
    }
    if (!phoneVerification.isVerified) {
      phoneForm.handleSubmit(() => {})()
    }
  }

  return (
    <Flex flexDir={'column'} w={'100%'} gap={6}>
      {/* Render verification sections based on question configuration */}
      <SimpleGrid columns={1} gap={8}>
        {TENANT_COMPANY_VERIFICATION_QUESTIONS.map((question) => {
          const isEmailOTP = question.type === "PIN" && question.schema_key === 'email_otp'
          const isPhoneOTP = question.type === "PIN" && question.schema_key === 'phone_otp'
          
          if (isEmailOTP) {
            return (
              <VerificationSection
                key={question.id}
                question={question}
                isVerified={emailVerification.isVerified}
                isLoading={emailVerification.isLoading}
                isResending={emailVerification.isResending}
                resendTimer={emailVerification.resendTimer}
                errors={emailForm.formState.errors}
                control={emailForm.control}
                onVerify={emailForm.handleSubmit(handleEmailSubmit)}
                onResend={emailVerification.resendOTP}
                verifyButtonText={VERIFICATION_CONFIGS.email.verifyButtonText}
                successMessage={VERIFICATION_CONFIGS.email.successMessage}
                isReviewMode={isReviewMode}
              />
            )
          }

          if (isPhoneOTP) {
            return (
              <VerificationSection
                key={question.id}
                question={question}
                isVerified={phoneVerification.isVerified}
                isLoading={phoneVerification.isLoading}
                isResending={phoneVerification.isResending}
                resendTimer={phoneVerification.resendTimer}
                errors={phoneForm.formState.errors}
                control={phoneForm.control}
                onVerify={phoneForm.handleSubmit(handlePhoneSubmit)}
                onResend={phoneVerification.resendOTP}
                verifyButtonText={VERIFICATION_CONFIGS.phone.verifyButtonText}
                successMessage={VERIFICATION_CONFIGS.phone.successMessage}
                isReviewMode={isReviewMode}
              />
            )
          }

          return null
        })}
      </SimpleGrid>


      {/* Navigation buttons */}
      <Flex justify="space-between" pt={6}>
        {/* Previous step button */}
        {onPrevious && (
          <SecondaryButton onClick={onPrevious} size="md">
            Previous
          </SecondaryButton>
        )}
        {/* Continue button */}
        <PrimaryButton 
          onClick={handleContinue}
          size="lg"
        >
          Continue to Plan Selection
        </PrimaryButton>
      </Flex>
    </Flex>
  )
}

export default VerificationStep