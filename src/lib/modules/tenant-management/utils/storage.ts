/* LocalStorage and workflow management utilities */

/* Tenant module imports */
import { TENANT_ACCOUNT_CREATION_LS_KEYS, STEP_IDS } from '@tenant-management/constants'
import { CachedPaymentStatusData, CachedPlanData, TenantAccountCreationStepType, TenantVerificationStatusCachedData } from '@tenant-management/types'

/* ==================== LocalStorage Getters ==================== */

/* Get tenant ID from localStorage */
export const getTenantId = (): string | null => localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID);

/* Parse payment data from localStorage */
export const getPaymentStatus = (): boolean => {
  const paymentData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_DATA)
  if (!paymentData) return false

  try {
    const parsed: CachedPaymentStatusData = JSON.parse(paymentData)
    return parsed.paymentSucceeded || false
  } catch (error) {
    console.error('Failed to parse payment data:', error)
    return false
  }
}

/* Check if plan summary is completed */
export const isPlanSummaryCompleted = (): boolean => {
  return !!localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PLAN_SUMMARY_COMPLETED)
}

/* Get verification status from localStorage with defaults */
export const getCachedVerificationStatus = (): TenantVerificationStatusCachedData => {
  const defaultStatus: TenantVerificationStatusCachedData = {
    email_verified: false,
    phone_verified: false,
    email_verified_at: null,
    phone_verified_at: null
  }

  const verificationData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA)

  if (!verificationData) return defaultStatus

  try {
    const savedVerification: TenantVerificationStatusCachedData = JSON.parse(verificationData)
    return {
      email_verified: savedVerification.email_verified || false,
      phone_verified: savedVerification.phone_verified || false,
      email_verified_at: savedVerification.email_verified_at || null,
      phone_verified_at: savedVerification.phone_verified_at || null
    }
  } catch {
    return defaultStatus
  }
}

/* ==================== Storage Cleanup ==================== */

/* Clean localStorage data while preserving tenant_id for retry scenarios */
export const cleanupAccountCreationStorage = (): void => {
  const tenantId = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID)

  /* Keys to remove on error - preserve tenant_id for retry */
  const keysToRemove = [
    TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA,
    TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA,
    TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
    TENANT_ACCOUNT_CREATION_LS_KEYS.PLAN_SUMMARY_COMPLETED,
    TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_DATA,
    TENANT_ACCOUNT_CREATION_LS_KEYS.PAYMENT_ACKNOWLEDGED,
    TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE
  ]

  keysToRemove.forEach(key => localStorage.removeItem(key))
  console.log('Cleaned localStorage due to API error, preserved tenant_id:', tenantId)
}

/* Clear OTP state when verification is successful */
export const clearOTPState = (): void => {
  localStorage.removeItem(TENANT_ACCOUNT_CREATION_LS_KEYS.OTP_STATE)
  console.log('Cleared OTP state from localStorage')
}

/* ==================== Step Tracking ==================== */

/* Step tracking keys for localStorage */
export const STEP_TRACKING_KEYS = {
  TENANT_INFO: 'tenant_step_info_completed',
  EMAIL_VERIFICATION: 'tenant_step_email_verification_completed',
  PHONE_VERIFICATION: 'tenant_step_phone_verification_completed',
  PLAN_SELECTION: 'tenant_step_plan_selection_completed',
  ADDON_SELECTION: 'tenant_step_addon_selection_completed',
  PLAN_SUMMARY: 'tenant_step_plan_summary_completed',
  COMPLETED_STEPS: 'tenant_completed_steps'
} as const

/* Available step identifiers */
export type StepKey = keyof typeof STEP_TRACKING_KEYS

/* Step completion tracking utilities */
export class StepTracker {

  /* Mark a specific step as completed */
  static markStepCompleted(stepKey: keyof typeof STEP_TRACKING_KEYS): void {
    try {
      const storageKey = STEP_TRACKING_KEYS[stepKey]
      localStorage.setItem(storageKey, 'true')

      /* Update the completed steps list */
      this.updateCompletedStepsList(stepKey)

      console.log(`Step ${stepKey} marked as completed`)
    } catch (error) {
      console.error('Error marking step as completed:', error)
    }
  }

  /* Check if a specific step is completed */
  static isStepCompleted(stepKey: keyof typeof STEP_TRACKING_KEYS): boolean {
    try {
      const storageKey = STEP_TRACKING_KEYS[stepKey]
      return localStorage.getItem(storageKey) === 'true'
    } catch (error) {
      console.error('Error checking step completion:', error)
      return false
    }
  }

  /* Get all completed steps */
  static getCompletedSteps(): string[] {
    try {
      const completedSteps = localStorage.getItem(STEP_TRACKING_KEYS.COMPLETED_STEPS)
      return completedSteps ? JSON.parse(completedSteps) : []
    } catch (error) {
      console.error('Error getting completed steps:', error)
      return []
    }
  }

  /* Update the completed steps list */
  private static updateCompletedStepsList(stepKey: keyof typeof STEP_TRACKING_KEYS): void {
    try {
      const completedSteps = this.getCompletedSteps()
      if (!completedSteps.includes(stepKey)) {
        completedSteps.push(stepKey)
        localStorage.setItem(STEP_TRACKING_KEYS.COMPLETED_STEPS, JSON.stringify(completedSteps))
      }
    } catch (error) {
      console.error('Error updating completed steps list:', error)
    }
  }

  /* Clear a specific step completion */
  static clearStepCompletion(stepKey: keyof typeof STEP_TRACKING_KEYS): void {
    try {
      const storageKey = STEP_TRACKING_KEYS[stepKey]
      localStorage.removeItem(storageKey)

      /* Remove from completed steps list */
      const completedSteps = this.getCompletedSteps()
      const updatedSteps = completedSteps.filter(step => step !== stepKey)
      localStorage.setItem(STEP_TRACKING_KEYS.COMPLETED_STEPS, JSON.stringify(updatedSteps))

      console.log(`Step ${stepKey} completion cleared`)
    } catch (error) {
      console.error('Error clearing step completion:', error)
    }
  }

  /* Clear all step completions */
  static clearAllStepCompletions(): void {
    try {
      Object.values(STEP_TRACKING_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      console.log('All step completions cleared')
    } catch (error) {
      console.error('Error clearing all step completions:', error)
    }
  }

  /* Get step completion progress percentage */
  static getCompletionProgress(): number {
    try {
      const totalSteps = Object.keys(STEP_TRACKING_KEYS).length - 1 // Exclude COMPLETED_STEPS key
      const completedSteps = this.getCompletedSteps().length
      return Math.round((completedSteps / totalSteps) * 100)
    } catch (error) {
      console.error('Error calculating completion progress:', error)
      return 0
    }
  }

  /* Check if all steps are completed */
  static areAllStepsCompleted(): boolean {
    const requiredSteps: (keyof typeof STEP_TRACKING_KEYS)[] = [
      'TENANT_INFO',
      'EMAIL_VERIFICATION',
      'PHONE_VERIFICATION'
    ]

    return requiredSteps.every(step => this.isStepCompleted(step))
  }
}

/* ==================== Step Progression ==================== */

/* Calculate next step based on current completion state */
export const calculateStepProgression = (
  isBasicInfoComplete: boolean,
  isVerificationComplete: boolean,
  assignedPlanData: CachedPlanData | null,
  paymentSucceeded: boolean,
  planSummaryCompleted: boolean
): { targetStep: TenantAccountCreationStepType; completedSteps: Set<TenantAccountCreationStepType> } => {
  const completedSteps = new Set<TenantAccountCreationStepType>()

  /* Stay on tenant info if prerequisites not met */
  if (!isBasicInfoComplete || !isVerificationComplete) {
    return { targetStep: STEP_IDS.TENANT_INFO, completedSteps }
  }

  /* Basic info and verification complete */
  completedSteps.add(STEP_IDS.TENANT_INFO)

  /* Check if plan is assigned */
  if (!assignedPlanData) {
    return { targetStep: STEP_IDS.PLAN_SELECTION, completedSteps }
  }

  /* Plan is assigned */
  completedSteps.add(STEP_IDS.PLAN_SELECTION)

  /* Check if addons are configured */
  if (assignedPlanData.selectedAddons === undefined) {
    return { targetStep: STEP_IDS.ADDON_SELECTION, completedSteps }
  }

  /* Addons are configured */
  completedSteps.add(STEP_IDS.ADDON_SELECTION)

  /* Check if ready for payment */
  if (planSummaryCompleted) {
    completedSteps.add(STEP_IDS.PLAN_SUMMARY)
    return { targetStep: STEP_IDS.PAYMENT, completedSteps }
  }

  /* Check payment status */
  if (paymentSucceeded) {
    completedSteps.add(STEP_IDS.PAYMENT)
    return { targetStep: STEP_IDS.SUCCESS, completedSteps }
  }

  /* Default to plan summary */
  return { targetStep: STEP_IDS.PLAN_SUMMARY, completedSteps }
}
