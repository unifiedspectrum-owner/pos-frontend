/* Tenant module imports */

import { VerificationConfig } from "@tenant-management/hooks/account-creation"

/* LocalStorage keys for tenant account creation process */
export const TENANT_ACCOUNT_CREATION_LS_KEYS = {
  TENANT_ID: 'tenant_id',
  TENANT_FORM_DATA: 'tenant_form_data',
  TENANT_VERIFICATION_DATA: 'tenant_verification_data',
  SELECTED_PLAN_DATA: 'selected_plan_data',
  PLAN_SUMMARY_COMPLETED: 'plan_summary_completed',
  PAYMENT_DATA: 'payment_data',
  PAYMENT_ACKNOWLEDGED: 'payment_acknowledged',
  FAILED_PAYMENT_INTENT: 'failed_payment_intent',
  OTP_STATE: 'otp_state',
  COMPLETED_STEPS: 'completed_steps'
} as const

/* Verification configurations */
export const VERIFICATION_CONFIGS: Record<string, VerificationConfig> = {
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