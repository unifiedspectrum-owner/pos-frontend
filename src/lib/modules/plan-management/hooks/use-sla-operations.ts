/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Plan management module imports */
import { slaService } from '@plan-management/api'
import { CreateSlaApiRequest, SupportSLA } from '@plan-management/types'

/* Hook interface */
interface UseSlaOperationsReturn {
  /* Fetch operations */
  fetchSlas: () => Promise<SupportSLA[] | null>
  isFetching: boolean
  fetchError: string | null
  /* Create operations */
  createSla: (slaData: CreateSlaApiRequest) => Promise<boolean>
  isCreating: boolean
  createError: string | null
}

/* Custom hook for SLA CRUD operations */
export const useSlaOperations = (): UseSlaOperationsReturn => {
  /* Hook state */
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)

  /* Fetch all SLAs operation */
  const fetchSlas = useCallback(async (): Promise<SupportSLA[] | null> => {
    try {
      setIsFetching(true)
      setFetchError(null)

      console.log('[useSlaOperations] Fetching SLAs')

      /* Call SLAs list API */
      const response = await slaService.getAllSLAs()

      /* Check if fetch was successful */
      if (response.success && response.data) {
        console.log('[useSlaOperations] Successfully fetched SLAs')
        return response.data
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to fetch SLAs'
        console.error('[useSlaOperations] Fetch failed:', errorMsg)
        setFetchError(errorMsg)
        return null
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to fetch SLAs'
      console.error('[useSlaOperations] Fetch error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Fetch SLAs'
      })

      setFetchError(errorMsg)
      return null

    } finally {
      setIsFetching(false)
    }
  }, [])

  /* Create new SLA operation */
  const createSla = useCallback(async (slaData: CreateSlaApiRequest): Promise<boolean> => {
    try {
      setIsCreating(true)
      setCreateError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useSlaOperations] Creating new SLA:', slaData)

      /* Call SLA creation API */
      const response = await slaService.createSLA(slaData)

      /* Check if creation was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'SLA Created Successfully',
          description: response.message || 'The SLA has been successfully created.'
        })

        console.log('[useSlaOperations] Successfully created SLA')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to create SLA'
        console.error('[useSlaOperations] Create failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Creation Failed',
          description: errorMsg
        })

        setCreateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to create SLA'
      console.error('[useSlaOperations] Create error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Create SLA'
      })

      setCreateError(errorMsg)
      return false

    } finally {
      setIsCreating(false)
    }
  }, [])

  return {
    /* Fetch operations */
    fetchSlas,
    isFetching,
    fetchError,
    /* Create operations */
    createSla,
    isCreating,
    createError
  }
}
