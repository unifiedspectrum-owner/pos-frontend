"use client"

/* React hooks */
import { useState, useEffect, useCallback } from 'react'

/* API service */
import { planService } from '@plan-management/api/plans'

/* Types */
import { Plan } from '@plan-management/types/plans'

/* Shared utilities */
import { handleApiError } from '@shared/utils/api-error-handler'

/* Hook state interface */
interface UsePlanDataState {
  plans: Plan[]
  isLoading: boolean
  error: string | null
  isRefreshing: boolean
}

/* Custom hook for fetching and managing subscription plan data */
export const usePlanData = () => {
  /* State management for plan data and loading states */
  const [state, setState] = useState<UsePlanDataState>({
    plans: [],
    isLoading: true,
    error: null,
    isRefreshing: false
  })

  /* Fetch all subscription plans from API */
  const fetchPlans = useCallback(async (isRefresh = false) => {
    /* Set appropriate loading state based on operation type */
    setState(prev => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      error: null
    }))

    try {
      /* Call API service to get all subscription plans */
      const response = await planService.getAllSubscriptionPlans()
      
      /* Handle successful response */
      if (response.data.success && response.data.data) {
        setState(prev => ({
          ...prev,
          plans: response.data.data || [],
          isLoading: false,
          isRefreshing: false,
          error: null
        }))
      } else {
        /* Handle API success=false response */
        throw new Error(response.data.message || 'Failed to fetch subscription plans')
      }
    } catch (err) {
      /* Handle API errors */
      console.error('[usePlanData] Failed to fetch plans:', err)
      
      /* Use shared error handler for consistent UX */
      handleApiError(err, {
        title: 'Failed to Load Plans'
      })
      
      /* Set error state */
      setState(prev => ({
        ...prev,
        plans: [],
        isLoading: false,
        isRefreshing: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      }))
    }
  }, [])

  /* Refresh plans data (for manual refresh actions) */
  const refreshPlans = useCallback(() => {
    return fetchPlans(true)
  }, [fetchPlans])

  /* Reset error state */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }))
  }, [])

  /* Get plans filtered by active status */
  const getActivePlans = useCallback(() => {
    return state.plans.filter(plan => plan.is_active === 1)
  }, [state.plans])

  /* Get featured plans for highlighting */
  const getFeaturedPlans = useCallback(() => {
    return state.plans.filter(plan => plan.is_featured === 1)
  }, [state.plans])

  /* Get plan by ID */
  const getPlanById = useCallback((planId: number) => {
    return state.plans.find(plan => plan.id === planId) || null
  }, [state.plans])

  /* Get plans sorted by display order */
  const getSortedPlans = useCallback(() => {
    return [...state.plans].sort((a, b) => a.display_order - b.display_order)
  }, [state.plans])

  /* Initial data fetch on component mount */
  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  /* Return hook interface with state and actions */
  return {
    /* State properties */
    plans: state.plans,
    isLoading: state.isLoading,
    error: state.error,
    isRefreshing: state.isRefreshing,
    
    /* Action methods */
    refreshPlans,
    clearError,
    refetch: fetchPlans,
    
    /* Utility methods */
    getActivePlans,
    getFeaturedPlans,
    getPlanById,
    getSortedPlans,
    
    /* Computed properties */
    hasPlans: state.plans.length > 0,
    activePlansCount: state.plans.filter(plan => plan.is_active === 1).length,
    featuredPlansCount: state.plans.filter(plan => plan.is_featured === 1).length
  }
}