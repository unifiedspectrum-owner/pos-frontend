/* Tenant module imports */
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

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