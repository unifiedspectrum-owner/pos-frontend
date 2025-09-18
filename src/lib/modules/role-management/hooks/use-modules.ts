/* Libraries imports */
import { useState, useCallback, useRef } from 'react'

/* Shared module imports */
import { handleApiError } from '@shared/utils'

/* Role module imports */
import { roleManagementService } from '@role-management/api'
import { Module } from '@role-management/types'
import { AxiosError } from 'axios'

/* Hook interface */
interface UseModulesReturn {
  /* Data */
  modules: Module[]
  /* Loading states */
  isLoading: boolean
  /* Error states */
  error: string | null
  /* Operations */
  fetchModules: () => Promise<void>
  /* Cache status */
  isCached: boolean
}

/* Custom hook for modules data management with caching */
export const useModules = (): UseModulesReturn => {
  /* Hook state */
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /* Cache tracking */
  const hasFetched = useRef<boolean>(false)
  const fetchPromise = useRef<Promise<void> | null>(null)

  /* Fetch modules operation with caching */
  const fetchModules = useCallback(async (): Promise<void> => {
    /* Return cached data if already fetched */
    if (hasFetched.current) {
      console.log('[useModules] Using cached modules data')
      return
    }

    /* Return existing promise if fetch is already in progress */
    if (fetchPromise.current) {
      console.log('[useModules] Fetch already in progress, waiting...')
      return fetchPromise.current
    }

    /* Create new fetch promise */
    fetchPromise.current = (async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('[useModules] Fetching modules from API')

        /* Call modules list API */
        const response = await roleManagementService.listAllModules()

        /* Check if fetch was successful */
        if (response.success && response.data?.modules) {
          setModules(response.data.modules)
          hasFetched.current = true
          console.log('[useModules] Successfully fetched modules:', response.data.modules.length)
        } else {
          /* Handle API success=false case */
          const errorMsg = response.message || 'Failed to fetch modules'
          console.error('[useModules] Fetch failed:', errorMsg)
          setError(errorMsg)
        }

      } catch (error: unknown) {
        const errorMsg = 'Failed to fetch modules'
        console.error('[useModules] Fetch error:', error)

        const err = error as AxiosError
        handleApiError(err, {
          title: 'Failed to Fetch Modules'
        })

        setError(errorMsg)

      } finally {
        setIsLoading(false)
        fetchPromise.current = null
      }
    })()

    return fetchPromise.current
  }, [])

  return {
    /* Data */
    modules,
    /* Loading states */
    isLoading,
    /* Error states */
    error,
    /* Operations */
    fetchModules,
    /* Cache status */
    isCached: hasFetched.current
  }
}