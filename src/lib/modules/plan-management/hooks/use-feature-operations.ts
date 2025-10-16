/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Plan management module imports */
import { featureService } from '@plan-management/api'
import { CreateFeatureApiRequest, Feature } from '@plan-management/types'

/* Hook interface */
interface UseFeatureOperationsReturn {
  /* Fetch operations */
  fetchFeatures: () => Promise<Feature[] | null>
  isFetching: boolean
  fetchError: string | null
  /* Create operations */
  createFeature: (featureData: CreateFeatureApiRequest) => Promise<boolean>
  isCreating: boolean
  createError: string | null
}

/* Custom hook for feature CRUD operations */
export const useFeatureOperations = (): UseFeatureOperationsReturn => {
  /* Hook state */
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)

  /* Fetch all features operation */
  const fetchFeatures = useCallback(async (): Promise<Feature[] | null> => {
    try {
      setIsFetching(true)
      setFetchError(null)

      console.log('[useFeatureOperations] Fetching features')

      /* Call features list API */
      const response = await featureService.getAllFeatures()

      /* Check if fetch was successful */
      if (response.success && response.data) {
        console.log('[useFeatureOperations] Successfully fetched features')
        return response.data
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to fetch features'
        console.error('[useFeatureOperations] Fetch failed:', errorMsg)
        setFetchError(errorMsg)
        return null
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to fetch features'
      console.error('[useFeatureOperations] Fetch error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Fetch Features'
      })

      setFetchError(errorMsg)
      return null

    } finally {
      setIsFetching(false)
    }
  }, [])

  /* Create new feature operation */
  const createFeature = useCallback(async (featureData: CreateFeatureApiRequest): Promise<boolean> => {
    try {
      setIsCreating(true)
      setCreateError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useFeatureOperations] Creating new feature:', featureData)

      /* Call feature creation API */
      const response = await featureService.createFeature(featureData)

      /* Check if creation was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Feature Created Successfully',
          description: response.message || 'The feature has been successfully created.'
        })

        console.log('[useFeatureOperations] Successfully created feature')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to create feature'
        console.error('[useFeatureOperations] Create failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Creation Failed',
          description: errorMsg
        })

        setCreateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to create feature'
      console.error('[useFeatureOperations] Create error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Create Feature'
      })

      setCreateError(errorMsg)
      return false

    } finally {
      setIsCreating(false)
    }
  }, [])

  return {
    /* Fetch operations */
    fetchFeatures,
    isFetching,
    fetchError,
    /* Create operations */
    createFeature,
    isCreating,
    createError
  }
}
