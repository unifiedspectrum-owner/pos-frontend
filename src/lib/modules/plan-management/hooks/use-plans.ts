/* Libraries imports */
import { useState, useEffect, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Plan management module imports */
import { planService } from '@plan-management/api'
import { Plan } from '@plan-management/types'
import { getCurrentISOString } from '@shared/utils'

/* Hook interface */
interface UsePlansParams {
  autoFetch?: boolean
}

interface UsePlansReturn {
  plans: Plan[]
  loading: boolean
  error: string | null
  lastUpdated: string
  fetchPlans: () => Promise<void>
  refetch: () => Promise<void>
}

/* Custom hook for fetching and managing plans */
export const usePlans = (params: UsePlansParams = {}): UsePlansReturn => {
  const { autoFetch = true } = params

  /* Hook state */
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  /* Fetch plans from API */
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[usePlans] Fetching subscription plans')

      /* Call API to get all subscription plans */
      const response = await planService.getAllSubscriptionPlans()

      console.log('[usePlans] Plans API response:', response)

      /* Handle successful response */
      if (response.data.success && response.data.data) {
        setPlans(response.data.data)
        setLastUpdated(response.data.timestamp || getCurrentISOString())
        console.log('[usePlans] Successfully fetched', response.data.data.length, 'plans')
      } else {
        /* Handle API error response */
        const errorMsg = response.data.message || 'Failed to fetch plans'
        setError(errorMsg)
        console.error('[usePlans] API error:', errorMsg)
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to load plan data'
      console.error('[usePlans] Fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Plans'
      })
      setPlans([])
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  /* Refetch plans */
  const refetch = useCallback(async () => {
    await fetchPlans()
  }, [fetchPlans])

  /* Auto-fetch on mount if enabled */
  useEffect(() => {
    if (autoFetch) {
      fetchPlans()
    }
  }, [fetchPlans, autoFetch])

  return {
    plans,
    loading,
    error,
    lastUpdated,
    fetchPlans,
    refetch
  }
}