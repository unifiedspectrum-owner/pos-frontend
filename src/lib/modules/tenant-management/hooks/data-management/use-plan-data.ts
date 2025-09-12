"use client"

/* Libraries imports */
import { useState, useEffect, useCallback } from 'react'

/* Shared module imports */
import { handleApiError } from '@shared/utils'
import { createToastNotification } from '@shared/utils/ui'

/* Plan management module imports */
import { planService } from '@plan-management/api'
import { Plan } from '@plan-management/types'

/* Tenant module imports */
import { PLANS_CACHE_CONFIG } from '@tenant-management/constants'
import { AxiosError } from 'axios'

/* Plan data hook state interface */
interface UsePlanDataState {
  plans: Plan[]
  isLoading: boolean
  error: string | null
  isRefreshing: boolean
}

/* Subscription plan data management hook with caching */
export const usePlanData = () => {
  /* Plan data and loading state */
  const [state, setState] = useState<UsePlanDataState>({
    plans: [],
    isLoading: true,
    error: null,
    isRefreshing: false
  })

  /* Load plans from localStorage cache */
  const loadCachedPlans = useCallback(() => {
    try {
      const cachedPlans = localStorage.getItem(PLANS_CACHE_CONFIG.KEY)
      const cacheTimestamp = localStorage.getItem(PLANS_CACHE_CONFIG.TIMESTAMP_KEY)
      
      if (cachedPlans && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp)
        const now = Date.now()
        
        /* Validate cache expiration */
        if (now - timestamp < PLANS_CACHE_CONFIG.DURATION) {
          const plans: Plan[] = JSON.parse(cachedPlans)
          console.log('Loading plans from cache:', plans.length, 'plans')
          setState(prev => ({
            ...prev,
            plans: plans,
            isLoading: false,
            error: null
          }))
          return true
        } else {
          console.log('Cache expired, will fetch fresh data')
        }
      }
      return false
    } catch (error) {
      console.warn('Failed to load cached plans:', error)
      return false
    }
  }, [])

  /* Save plans to localStorage with timestamp */
  const cachePlans = useCallback((plans: Plan[]) => {
    try {
      localStorage.setItem(PLANS_CACHE_CONFIG.KEY, JSON.stringify(plans))
      localStorage.setItem(PLANS_CACHE_CONFIG.TIMESTAMP_KEY, Date.now().toString())
      console.log('Plans cached successfully:', plans.length, 'plans')
    } catch (error) {
      console.warn('Failed to cache plans:', error)
    }
  }, [])

  /* Fetch subscription plans from API with cache fallback */
  const fetchPlans = useCallback(async (isRefresh = false) => {
    /* Try cache first for initial loads */
    if (!isRefresh) {
      const cacheLoaded = loadCachedPlans()
      if (cacheLoaded) {
        return
      }
    }

    /* Set loading state based on operation type */
    setState(prev => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      error: null
    }))

    try {
      console.log('Fetching plans from API...')
      /* Get plans from API service */
      const { data: response} = await planService.getAllSubscriptionPlans()
      
      /* Process successful response */
      if (response.success && response.data) {
        const plans = response.data || []
        
        /* Cache fetched data */
        cachePlans(plans)
        
        setState(prev => ({
          ...prev,
          plans: plans,
          isLoading: false,
          isRefreshing: false,
          error: null
        }))
        
        console.log('Plans fetched and cached successfully:', plans.length, 'plans')
      } else {
        /* Handle API failure response */
        const errorMessage = response.message || 'Failed to fetch subscription plans'
        createToastNotification({
          title: 'Failed to Load Plans',
          description: errorMessage,
          type: 'error'
        })
        throw new Error(errorMessage)
      }
    } catch (error) {
      /* Log and handle API errors */
      console.error('[usePlanData] Failed to fetch plans:', error)
      const err = error as AxiosError;
      /* Display user-friendly error */
      handleApiError(err, {
        title: 'Failed to Load Plans'
      })
      
      /* Update error state */
      setState(prev => ({
        ...prev,
        plans: [],
        isLoading: false,
        isRefreshing: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      }))
    }
  }, [loadCachedPlans, cachePlans])

  /* Force refresh plans data */
  const refreshPlans = useCallback(() => {
    return fetchPlans(true)
  }, [fetchPlans])

  /* Clear error state */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }))
  }, [])

  /* Remove cached plan data */
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(PLANS_CACHE_CONFIG.KEY)
      localStorage.removeItem(PLANS_CACHE_CONFIG.TIMESTAMP_KEY)
      console.log('Plans cache cleared')
    } catch (error) {
      console.warn('Failed to clear plans cache:', error)
    }
  }, [])

  /* Fetch plans on component mount */
  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  /* Hook interface with state and actions */
  return {
    /* Current state */
    plans: state.plans,
    isLoading: state.isLoading,
    error: state.error,
    isRefreshing: state.isRefreshing,
    
    /* Actions */
    refreshPlans,
    clearError,
    clearCache,
    refetch: fetchPlans,
    
    /* Computed values */
    hasPlans: state.plans.length > 0,
    activePlansCount: state.plans.filter(plan => Boolean(plan.is_active)).length,
    featuredPlansCount: state.plans.filter(plan => Boolean(plan.is_featured)).length
  }
}