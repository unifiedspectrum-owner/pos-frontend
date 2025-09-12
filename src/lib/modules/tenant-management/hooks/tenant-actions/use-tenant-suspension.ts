import { useState, useCallback } from 'react'

/* Shared module imports */
import { createToastNotification, handleApiError } from '@shared/utils'

/* Tenant module imports */
import { tenantActionsService } from '@tenant-management/api'
import { 
  SuspendTenantApiRequest,
  HoldTenantApiRequest,
  ActivateTenantApiRequest
} from '@tenant-management/types/account/suspension'
import { AxiosError } from 'axios'

/* Hook interface for tenant suspension operations */
interface UseTenantSuspensionOptions {
  onSuccess?: () => void
  onError?: (error: any) => void
}

/* Return type for the hook */
interface UseTenantSuspensionReturn {
  suspendTenant: (data: SuspendTenantApiRequest) => Promise<void>
  holdTenant: (data: HoldTenantApiRequest) => Promise<void>
  activateTenant: (data: ActivateTenantApiRequest) => Promise<void>
  isSuspending: boolean
  isHolding: boolean
  isActivating: boolean
  isLoading: boolean
}

/* Hook for managing tenant suspension, hold, and activation operations */
const useTenantSuspension = (options: UseTenantSuspensionOptions = {}): UseTenantSuspensionReturn => {
  const { onSuccess, onError } = options

  /* Loading states for each operation */
  const [isSuspending, setIsSuspending] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  /* Combined loading state */
  const isLoading = isSuspending || isHolding || isActivating

  /* Suspend tenant operation */
  const suspendTenant = useCallback(async (data: SuspendTenantApiRequest) => {
    try {
      setIsSuspending(true)

      const response = await tenantActionsService.suspendTenant(data)

      if (response.success) {
        createToastNotification({
          type: 'success',
          title: 'Tenant Suspended',
          description: `The tenant account has been successfully suspended.`
        })
        
        onSuccess?.()
      } else {
        throw new Error(response.message || 'Failed to suspend tenant')
      }
    } catch (error) {
      console.error('[useTenantSuspension] Error suspending tenant:', error);
      const err = error as AxiosError;
      handleApiError(err, {title:"Suspension Failed"})
      
      onError?.(error)
    } finally {
      setIsSuspending(false)
    }
  }, [onSuccess, onError])

  /* Hold tenant operation */
  const holdTenant = useCallback(async (data: HoldTenantApiRequest) => {
    try {
      setIsHolding(true)

      const response = await tenantActionsService.holdTenant(data)

      if (response.success) {
        createToastNotification({
          type: 'success',
          title: 'Tenant Placed on Hold',
          description: `The tenant account has been successfully placed on hold.`
        })
        
        onSuccess?.()
      } else {
        throw new Error(response.message || 'Failed to hold tenant')
      }
    } catch (error) {
      console.error('[useTenantSuspension] Error holding tenant:', error)

      const err = error as AxiosError;
      handleApiError(err, {title:"Suspension Failed"})
      
      onError?.(error)
    } finally {
      setIsHolding(false)
    }
  }, [onSuccess, onError])

  /* Activate tenant operation */
  const activateTenant = useCallback(async (data: ActivateTenantApiRequest) => {
    try {
      setIsActivating(true)

      const response = await tenantActionsService.activateTenant(data)

      if (response.success) {
        createToastNotification({
          type: 'success',
          title: 'Tenant Activated',
          description: `The tenant account has been successfully activated.`
        })
        
        onSuccess?.()
      } else {
        throw new Error(response.message || 'Failed to activate tenant')
      }
    } catch (error) {
      console.error('[useTenantSuspension] Error activating tenant:', error)
      const err = error as AxiosError;
      handleApiError(err, {title:"Activation Failed"})
      onError?.(error)
    } finally {
      setIsActivating(false)
    }
  }, [onSuccess, onError])

  return {
    suspendTenant,
    holdTenant,
    activateTenant,
    isSuspending,
    isHolding,
    isActivating,
    isLoading
  }
}

export default useTenantSuspension