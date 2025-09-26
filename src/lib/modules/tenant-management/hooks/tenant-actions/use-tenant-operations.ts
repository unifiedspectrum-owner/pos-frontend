"use client"

/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Tenant management module imports */
import { tenantActionsService } from '@tenant-management/api'

/* Hook interface */
interface UseTenantOperationsReturn {
  /* Delete operations */
  deleteTenant: (tenantId: string, tenantName?: string) => Promise<boolean>
  isDeleting: boolean
  deleteError: string | null
}

/* Custom hook for tenant operations */
export const useTenantOperations = (): UseTenantOperationsReturn => {
  /* Hook state */
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
      const response = await tenantActionsService.deleteTenant(tenantId)

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

  return {
    /* Delete operations */
    deleteTenant,
    isDeleting,
    deleteError
  }
}