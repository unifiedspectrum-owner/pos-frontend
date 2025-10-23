/* Libraries imports */
import { useCallback } from 'react'
import { Control } from 'react-hook-form'

/* Tenant module imports */
import { TenantInfoFormData } from '@tenant-management/schemas/account'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { hasFormDataChanged, transformFormDataToTenantCacheData } from '@tenant-management/utils'

/* Hook for form data persistence */
export const useFormPersistence = (control: Control<TenantInfoFormData>) => {
  /* Save current form data to localStorage */
  const saveCurrentFormData = useCallback(() => {
    try {
      const currentValues = control._formValues as TenantInfoFormData
      if (currentValues) {
        const tenantFormData = transformFormDataToTenantCacheData(currentValues)
        localStorage.setItem(
          TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA, 
          JSON.stringify(tenantFormData)
        )
      }
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error)
    }
  }, [control])

  /* Load form data from localStorage */
  const loadFormData = useCallback(() => {
    try {
      const storedData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)
      return storedData ? JSON.parse(storedData) : null
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error)
      return null
    }
  }, [])

  /* Clear form data from localStorage */
  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_FORM_DATA)
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error)
    }
  }, [])

  /* Check if form data has changed */
  const checkFormDataChanged = useCallback(() => {
    const currentValues = control._formValues as TenantInfoFormData
    return currentValues ? hasFormDataChanged(currentValues) : true
  }, [control])

  return {
    saveCurrentFormData,
    loadFormData,
    clearFormData,
    checkFormDataChanged
  }
}