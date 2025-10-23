"use client"

/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Tenant management module imports */
import { tenantService, paymentService, subscriptionService } from '@tenant-management/api'
import { completeTenantSubscriptionPayment } from '@tenant-management/schemas'
import { CompleteSubscriptionPaymentApiResponse, StartResourceProvisioningApiResponse } from '@tenant-management/types'

/* Hook interface */
interface UseTenantOperationsReturn {
  /* Delete operations */
  deleteTenant: (tenantId: string, tenantName?: string) => Promise<boolean>
  isDeleting: boolean
  deleteError: string | null

  /* Payment operations */
  completePayment: (data: completeTenantSubscriptionPayment) => Promise<CompleteSubscriptionPaymentApiResponse | null>
  isCompletingPayment: boolean
  paymentError: string | null

  /* Resource provisioning operations */
  startResourceProvisioning: (tenantId: string, tenantName?: string) => Promise<StartResourceProvisioningApiResponse | null>
  isProvisioning: boolean
  provisioningError: string | null
}

/* Custom hook for tenant operations */
export const useTenantOperations = (): UseTenantOperationsReturn => {
  /* Hook state */
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isCompletingPayment, setIsCompletingPayment] = useState<boolean>(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false)
  const [provisioningError, setProvisioningError] = useState<string | null>(null)

  /* Delete tenant operation */
  const deleteTenant = useCallback(async (tenantId: string, tenantName?: string): Promise<boolean> => {
    try {
      setIsDeleting(true)
      setDeleteError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTenantOperations] Deleting tenant:', tenantId)

      /* Call tenant deletion API */
      const response = await tenantService.deleteTenant(tenantId)

      /* Check if deletion was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Tenant Deleted Successfully',
          description: tenantName
            ? `The tenant '${tenantName}' has been successfully deleted.`
            : 'The tenant has been successfully deleted.'
        })

        console.log('[useTenantOperations] Successfully deleted tenant:', tenantId)
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.message || 'Failed to delete tenant'
        console.error('[useTenantOperations] Delete failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Deletion Failed',
          description: errorMsg
        })

        setDeleteError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to delete tenant'
      console.error('[useTenantOperations] Delete error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Delete Tenant'
      })

      setDeleteError(errorMsg)
      return false

    } finally {
      setIsDeleting(false)
    }
  }, [])

  /* Complete tenant subscription payment operation */
  const completePayment = useCallback(async (data: completeTenantSubscriptionPayment): Promise<CompleteSubscriptionPaymentApiResponse | null> => {
    try {
      setIsCompletingPayment(true)
      setPaymentError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTenantOperations] Completing payment for tenant:', data.tenant_id)

      /* Call payment completion API */
      const response = await paymentService.completeTenantSubscriptionPayment(data)

      /* Check if payment completion was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Payment Completed Successfully',
          description: response.message || 'Your subscription payment has been processed successfully.'
        })

        console.log('[useTenantOperations] Successfully completed payment:', response.data)
        return response

      } else {
        /* Handle API success=false case */
        const errorMsg = response.message || 'Failed to complete payment'
        console.error('[useTenantOperations] Payment completion failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Payment Completion Failed',
          description: errorMsg
        })

        setPaymentError(errorMsg)
        return null
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to complete payment'
      console.error('[useTenantOperations] Payment completion error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Complete Payment'
      })

      setPaymentError(errorMsg)
      return null

    } finally {
      setIsCompletingPayment(false)
    }
  }, [])

  /* Start resource provisioning operation */
  const startResourceProvisioning = useCallback(async (tenantId: string, tenantName?: string): Promise<StartResourceProvisioningApiResponse | null> => {
    try {
      setIsProvisioning(true)
      setProvisioningError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useTenantOperations] Starting resource provisioning for tenant:', tenantId)

      /* Call resource provisioning API */
      const response = await subscriptionService.startTenantResourceProvisioning(tenantId)

      /* Check if provisioning was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Resource Provisioning Started',
          description: tenantName
            ? `Resource provisioning has been initiated for '${tenantName}'.`
            : response.message || 'Resource provisioning has been initiated successfully.'
        })

        console.log('[useTenantOperations] Successfully started resource provisioning:', response.data)
        return response

      } else {
        /* Handle API success=false case */
        const errorMsg = response.message || 'Failed to start resource provisioning'
        console.error('[useTenantOperations] Resource provisioning failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Provisioning Failed',
          description: errorMsg
        })

        setProvisioningError(errorMsg)
        return null
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to start resource provisioning'
      console.error('[useTenantOperations] Resource provisioning error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Start Resource Provisioning'
      })

      setProvisioningError(errorMsg)
      return null

    } finally {
      setIsProvisioning(false)
    }
  }, [])

  return {
    /* Delete operations */
    deleteTenant,
    isDeleting,
    deleteError,

    /* Payment operations */
    completePayment,
    isCompletingPayment,
    paymentError,

    /* Resource provisioning operations */
    startResourceProvisioning,
    isProvisioning,
    provisioningError
  }
}