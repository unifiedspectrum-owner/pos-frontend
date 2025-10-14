"use client"

/* Libraries imports */
import { useState, useCallback, useEffect, useRef } from 'react'
import { Control } from 'react-hook-form'

/* Shared module imports */
import { createToastNotification } from '@shared/utils/ui'
import { handleApiError } from '@shared/utils/api'
import { getCurrentISOString } from "@shared/utils";

/* Tenant module imports */
import { TenantInfoFormData } from '@tenant-management/schemas/account'
import { accountService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { 
  CreateAccountApiRequest, 
  TenantVerificationInfo, 
  TenantVerificationStatusCachedData 
} from '@tenant-management/types/account'
import { 
  cleanupAccountCreationStorage, 
  getTenantId, 
  transformFormDataToApiPayload, 
} from '@tenant-management/utils'
import { AxiosError } from 'axios'

/* Verification status management hook interface */
interface UseVerificationStatusOptions {
  control: Control<TenantInfoFormData>
  emailVerified: boolean
  phoneVerified: boolean
}

/* Verification status management hook return type */
interface UseVerificationStatusReturn {
  isUpdatingAccount: boolean
  isRestoringFromAPI: boolean
  saveVerificationStatus: () => void
  loadVerificationStatus: () => { emailVerified: boolean; phoneVerified: boolean }
  updateAccountWithVerification: () => Promise<void>
}

/* Hook for managing verification status persistence and API updates */
export const useVerificationStatus = ({
  control,
  emailVerified,
  phoneVerified
}: UseVerificationStatusOptions): UseVerificationStatusReturn => {
  /* State management */
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false)
  const [isRestoringFromAPI, setIsRestoringFromAPI] = useState(true)
  
  /* Refs to track previous verification states */
  const prevVerificationStatesRef = useRef({
    emailVerified: false,
    phoneVerified: false
  })

  /* Save verification status to localStorage */
  const saveVerificationStatus = useCallback(() => {
    const verificationStatus: TenantVerificationStatusCachedData = {
      email_verified: emailVerified,
      phone_verified: phoneVerified,
      email_verified_at: emailVerified ? getCurrentISOString() : null,
      phone_verified_at: phoneVerified ? getCurrentISOString() : null,
    }
    localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA, JSON.stringify(verificationStatus))
  }, [emailVerified, phoneVerified])

  /* Load verification status from localStorage */
  const loadVerificationStatus = useCallback(() => {
    try {
      const verificationData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_VERIFICATION_DATA)
      if (verificationData) {
        const status: TenantVerificationStatusCachedData = JSON.parse(verificationData)
        
        /* Initialize the ref with loaded states to prevent API calls on mount */
        prevVerificationStatesRef.current = {
          emailVerified: status.email_verified || false,
          phoneVerified: status.phone_verified || false
        }
        
        return {
          emailVerified: status.email_verified || false,
          phoneVerified: status.phone_verified || false
        }
      }
      return { emailVerified: false, phoneVerified: false }
    } catch (error) {
      console.log("Error loading verification status", error)
      return { emailVerified: false, phoneVerified: false }
    }
  }, [])

  /* Update account with verification status */
  const updateAccountWithVerification = useCallback(async () => {
    try {
      /* Prevent multiple simultaneous calls */
      if (isUpdatingAccount) return
      
      const currentValues = control._formValues as TenantInfoFormData

      setIsUpdatingAccount(true)

      const verificationStatus: TenantVerificationInfo = {
        email_verified: emailVerified,
        phone_verified: phoneVerified,
        email_verified_at: emailVerified ? getCurrentISOString() : null,
        phone_verified_at: phoneVerified ? getCurrentISOString() : null
      }

      /* Check for existing tenant_id */
      const existingTenantId = getTenantId()

      /* Prepare API request with verification status and tenant_id if updating */
      const apiRequest: CreateAccountApiRequest = transformFormDataToApiPayload(currentValues, verificationStatus, existingTenantId)

      const response = await accountService.createTenantAccount(apiRequest)
      
      if (response.data && response.success) {
        console.log('Account updated with verification status:', response.data);
        const { tenant_id } = response.data
        if (tenant_id) {
          localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID, tenant_id)
          console.log('Tenant ID stored:', tenant_id)
        } 
        createToastNotification({
          title: response.message || 'Verification Updated',
          description: 'Your account has been updated with the latest verification status.'
        })
      }
    } catch (error) {
      console.warn('Failed to update account with verification status:', error)
      cleanupAccountCreationStorage()
      const err = error as AxiosError;
      handleApiError(err, {
        title: 'Verification Update Failed'
      });
    } finally {
      setIsUpdatingAccount(false)
    }
  }, [control, emailVerified, phoneVerified, isUpdatingAccount])

  /* Initialize verification status on mount */
  useEffect(() => {
    loadVerificationStatus()
    /* Allow API calls after a short delay to ensure restoration is complete */
    const timer = setTimeout(() => {
      setIsRestoringFromAPI(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [loadVerificationStatus])

  /* Save verification status when states change */
  useEffect(() => {
    saveVerificationStatus()
  }, [saveVerificationStatus])

  /* Update account when verification status changes (debounced) */
  useEffect(() => {
    /* Skip API calls if currently restoring from API data */
    if (isRestoringFromAPI) {
      return
    }
    
    const currentStates = {
      emailVerified: emailVerified,
      phoneVerified: phoneVerified
    }
    
    const previousStates = prevVerificationStatesRef.current
    
    /* Only call API if verification state actually changed from false to true */
    const emailJustVerified = !previousStates.emailVerified && currentStates.emailVerified
    const phoneJustVerified = !previousStates.phoneVerified && currentStates.phoneVerified
    
    if (emailJustVerified || phoneJustVerified) {
      const timeoutId = setTimeout(() => {
        updateAccountWithVerification()
      }, 500) /* 500ms debounce */
      
      /* Update the ref with current states */
      prevVerificationStatesRef.current = currentStates
      
      return () => clearTimeout(timeoutId)
    }
    
    /* Update ref even when no API call is made */
    prevVerificationStatesRef.current = currentStates
  }, [emailVerified, phoneVerified, updateAccountWithVerification, isRestoringFromAPI])

  return {
    isUpdatingAccount,
    isRestoringFromAPI,
    saveVerificationStatus,
    loadVerificationStatus,
    updateAccountWithVerification
  }
}