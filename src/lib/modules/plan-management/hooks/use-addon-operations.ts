/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Plan management module imports */
import { addonService } from '@plan-management/api'
import { CreateAddonApiRequest, Addon } from '@plan-management/types'

/* Hook interface */
interface UseAddonOperationsReturn {
  /* Fetch operations */
  fetchAddons: () => Promise<Addon[] | null>
  isFetching: boolean
  fetchError: string | null
  /* Create operations */
  createAddon: (addonData: CreateAddonApiRequest) => Promise<boolean>
  isCreating: boolean
  createError: string | null
}

/* Custom hook for addon CRUD operations */
export const useAddonOperations = (): UseAddonOperationsReturn => {
  /* Hook state */
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)

  /* Fetch all addons operation */
  const fetchAddons = useCallback(async (): Promise<Addon[] | null> => {
    try {
      setIsFetching(true)
      setFetchError(null)

      console.log('[useAddonOperations] Fetching addons')

      /* Call addons list API */
      const response = await addonService.getAllAddOns()

      /* Check if fetch was successful */
      if (response.success && response.data) {
        console.log('[useAddonOperations] Successfully fetched addons')
        return response.data
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to fetch add-ons'
        console.error('[useAddonOperations] Fetch failed:', errorMsg)
        setFetchError(errorMsg)
        return null
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to fetch add-ons'
      console.error('[useAddonOperations] Fetch error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Fetch Add-ons'
      })

      setFetchError(errorMsg)
      return null

    } finally {
      setIsFetching(false)
    }
  }, [])

  /* Create new addon operation */
  const createAddon = useCallback(async (addonData: CreateAddonApiRequest): Promise<boolean> => {
    try {
      setIsCreating(true)
      setCreateError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useAddonOperations] Creating new addon:', addonData)

      /* Call addon creation API */
      const response = await addonService.createAddOn(addonData)

      /* Check if creation was successful */
      if (response.success) {
        /* Success notification */
        createToastNotification({
          type: 'success',
          title: 'Add-on Created Successfully',
          description: response.message || 'The add-on has been successfully created.'
        })

        console.log('[useAddonOperations] Successfully created addon')
        return true
      } else {
        /* Handle API success=false case */
        const errorMsg = response.error || response.message || 'Failed to create add-on'
        console.error('[useAddonOperations] Create failed:', errorMsg)

        createToastNotification({
          type: 'error',
          title: 'Creation Failed',
          description: errorMsg
        })

        setCreateError(errorMsg)
        return false
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to create add-on'
      console.error('[useAddonOperations] Create error:', error)

      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Create Add-on'
      })

      setCreateError(errorMsg)
      return false

    } finally {
      setIsCreating(false)
    }
  }, [])

  return {
    /* Fetch operations */
    fetchAddons,
    isFetching,
    fetchError,
    /* Create operations */
    createAddon,
    isCreating,
    createError
  }
}
