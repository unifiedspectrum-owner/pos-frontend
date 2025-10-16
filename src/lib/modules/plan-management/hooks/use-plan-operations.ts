/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Plan management module imports */
import { planService } from '@plan-management/api'
import { CreatePlanApiRequest, PlanDetails } from '@plan-management/types'

/* Hook interface */
interface UsePlanOperationsReturn {
  /* Create operations */
  createPlan: (planData: CreatePlanApiRequest) => Promise<boolean>
  isCreating: boolean
  createError: string | null
  /* Fetch operations */
  fetchPlanDetails: (planId: number) => Promise<PlanDetails | null>
  isFetching: boolean
  fetchError: string | null
  /* Update operations */
  updatePlan: (planId: number, planData: CreatePlanApiRequest) => Promise<boolean>
  isUpdating: boolean
  updateError: string | null
  /* Delete operations */
  deletePlan: (planId: number, planName?: string) => Promise<boolean>
  isDeleting: boolean
  deleteError: string | null
}

/* Custom hook for plan CRUD operations */
export const usePlanOperations = (): UsePlanOperationsReturn => {
  /* Hook state */
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  /* Create new plan operation */
  const createPlan = useCallback(async (planData: CreatePlanApiRequest): Promise<boolean> => {
    try {
      setIsCreating(true)
      setCreateError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[usePlanOperations] Creating new plan:', planData)

      /* Call plan creation API */
      const response = await planService.createSubscriptionPlan(planData)

      /* Check if creation was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Plan Created Successfully',
          description: response.message || 'The plan has been successfully created.'
        })

        console.log('[usePlanOperations] Successfully created plan')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to create plan'
        console.error('[usePlanOperations] Create failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Creation Failed',
          description: errorMsg
        })

        setCreateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to create plan'
      console.error('[usePlanOperations] Create error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Create Plan'
      })

      setCreateError(errorMsg)
      return false

    } finally {
      setIsCreating(false)
    }
  }, [])

  /* Fetch plan details operation */
  const fetchPlanDetails = useCallback(async (planId: number): Promise<PlanDetails | null> => {
    try {
      setIsFetching(true)
      setFetchError(null)

      console.log('[usePlanOperations] Fetching plan details:', planId)

      /* Call plan details API */
      const response = await planService.getSubscriptionPlanDetails(planId)

      /* Check if fetch was successful */
      if (response.success && response.data) {
        console.log('[usePlanOperations] Successfully fetched plan details')
        return response.data
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to fetch plan details'
        console.error('[usePlanOperations] Fetch failed:', errorMsg)
        setFetchError(errorMsg)
        return null
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to fetch plan details'
      console.error('[usePlanOperations] Fetch error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Fetch Plan Details'
      })

      setFetchError(errorMsg)
      return null

    } finally {
      setIsFetching(false)
    }
  }, [])

  /* Update plan operation */
  const updatePlan = useCallback(async (planId: number, planData: CreatePlanApiRequest): Promise<boolean> => {
    try {
      setIsUpdating(true)
      setUpdateError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[usePlanOperations] Updating plan:', planId, planData)

      /* Call plan update API */
      const response = await planService.updateSubscriptionPlan(planId, planData)

      /* Check if update was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Plan Updated Successfully',
          description: response.message || 'The plan has been successfully updated.'
        })

        console.log('[usePlanOperations] Successfully updated plan')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to update plan'
        console.error('[usePlanOperations] Update failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Update Failed',
          description: errorMsg
        })

        setUpdateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to update plan'
      console.error('[usePlanOperations] Update error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Update Plan'
      })

      setUpdateError(errorMsg)
      return false

    } finally {
      setIsUpdating(false)
    }
  }, [])

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
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Plan Deleted Successfully',
          description: response.message || (planName
            ? `The plan '${planName}' has been successfully deleted.`
            : 'The plan has been successfully deleted.')
        })

        console.log('[usePlanOperations] Successfully deleted plan:', planId)
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.message || 'Failed to delete plan'
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
    /* Create operations */
    createPlan,
    isCreating,
    createError,
    /* Fetch operations */
    fetchPlanDetails,
    isFetching,
    fetchError,
    /* Update operations */
    updatePlan,
    isUpdating,
    updateError,
    /* Delete operations */
    deletePlan,
    isDeleting,
    deleteError
  }
}
