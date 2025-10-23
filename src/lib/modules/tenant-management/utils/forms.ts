/* Form data transformation and payload building utilities */

/* Shared module imports */
import { formatPhoneForAPI, parsePhoneFromAPI } from '@shared/utils/formatting'

/* Tenant module imports */
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { TenantAccountFormCacheData, TenantVerificationStatusCachedData, CreateAccountApiRequest } from '@tenant-management/types'
import { TenantInfoFormData } from '@tenant-management/schemas'

/* ==================== Form Data Transformations ==================== */

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

/* ==================== Form Data Comparison ==================== */

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
