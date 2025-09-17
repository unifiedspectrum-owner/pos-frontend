/* Tenant module imports */
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { CachedPaymentStatusData } from '@tenant-management/types/subscription'
import { formatPhoneForAPI, parsePhoneFromAPI } from '@shared/utils/formatting'
import { TenantInfoFormData } from '../../schemas/account/creation'
import { TenantAccountFormCacheData, TenantVerificationStatusCachedData } from '../../types/account/status'
import { CreateAccountApiRequest } from '../../types/account/creation'

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

/* Transform form data to tenant data format */
export const transformFormDataToTenantCacheData = (formData: TenantInfoFormData): TenantAccountFormCacheData => {
  return {
    company_name: formData.company_name,
    contact_person: formData.contact_person,
    primary_email: formData.primary_email,
    primary_phone: formatPhoneForAPI(formData.primary_phone),
    address_line1: formData.address_line1,
    address_line2: formData?.address_line2,
    city: formData.city,
    state_province: formData.state_province,
    postal_code: formData.postal_code,
    country: formData.country
  }
}

/* Transform form data to API request payload */
export const transformFormDataToApiPayload = (
  formData: TenantInfoFormData,
  verificationStatus: TenantVerificationStatusCachedData,
  tenant_id?: string | null
): CreateAccountApiRequest => {
  const TenantInfoFormData = transformFormDataToTenantCacheData(formData)
  return {
    ...(tenant_id && { tenant_id }),
    ...TenantInfoFormData,
    ...verificationStatus,
  }
}

/* Check if current form data differs from stored tenant data */
export const hasFormDataChanged = (formData: TenantInfoFormData): boolean => {
  try {
    const storedData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)
    if (!storedData) return true
    
    const stored: TenantAccountFormCacheData = JSON.parse(storedData)
    
    /* Field-by-field comparison */
    const changes = {
      company_name: formData.company_name !== stored.company_name,
      contact_person: formData.contact_person !== stored.contact_person,
      primary_email: formData.primary_email !== stored.primary_email,
      primary_phone: formData.primary_phone !== parsePhoneFromAPI(stored.primary_phone),
      address_line1: formData.address_line1 !== stored.address_line1,
      address_line2: (formData.address_line2 || '') !== (stored.address_line2 || ''),
      city: formData.city !== stored.city,
      state_province: formData.state_province !== stored.state_province,
      postal_code: formData.postal_code !== stored.postal_code,
      country: formData.country !== stored.country
    }
    
    const hasChanged = Object.values(changes).some(changed => changed)
    
    console.log('Data comparison:', {
      stored: stored,
      current: formData,
      changes: changes,
      hasChanged: hasChanged
    })
    
    return hasChanged
  } catch (error) {
    console.warn('Error comparing data:', error)
    return true
  }
}