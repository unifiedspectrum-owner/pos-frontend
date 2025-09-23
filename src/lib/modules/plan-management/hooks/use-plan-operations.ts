/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Plan management module imports */
import { planService } from '@plan-management/api'

/* Hook interface */
interface UsePlanOperationsReturn {
  /* Delete operations */
  deletePlan: (planId: number, planName?: string) => Promise<boolean>
  isDeleting: boolean
  deleteError: string | null
}

/* Custom hook for plan operations */
export const usePlanOperations = (): UsePlanOperationsReturn => {
  /* Hook state */
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  /* Delete plan operation */
  const deletePlan = useCallback(async (planId: number, planName?: string): Promise<boolean> => {
    try {
      setIsDeleting(true)
      setDeleteError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[usePlanOperations] Deleting plan:', planId)

      /* Call plan deletion API */
      const response = await planService.deleteSubscriptionPlan(planId)

      /* Check if deletion was successful */
      if (response.data.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Plan Deleted Successfully',
          description: planName
            ? `The plan '${planName}' has been successfully deleted.`
            : 'The plan has been successfully deleted.'
        })

        console.log('[usePlanOperations] Successfully deleted plan:', planId)
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.data.message || 'Failed to delete plan'
        console.error('[usePlanOperations] Delete failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Deletion Failed',
          description: errorMsg
        })

        setDeleteError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to delete plan'
      console.error('[usePlanOperations] Delete error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Delete Plan'
      })

      setDeleteError(errorMsg)
      return false

    } finally {
      setIsDeleting(false)
    }
  }, [])

  return {
    /* Delete operations */
    deletePlan,
    isDeleting,
    deleteError
  }
}