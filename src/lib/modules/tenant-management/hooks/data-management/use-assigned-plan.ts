"use client"

/* Libraries imports */
import { useState, useCallback } from 'react'

/* Tenant module imports */
import { subscriptionService } from '@tenant-management/api'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { CachedPlanData } from '@tenant-management/types'

/* Custom hook for managing assigned plan data */
export const useAssignedPlan = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Fetch and cache assigned plan data */
  const fetchAssignedPlan = useCallback(async (tenantId: string): Promise<CachedPlanData | null> => {
    if (!tenantId) return null

    setLoading(true)
    setError(null)

    try {
      const response = await subscriptionService.getAssignedPlanForTenant(tenantId)
      
      if (response.success && response.data) {
        /* Transform API response to cached plan data format */
        const { plan, add_ons, ...remainingData } = response.data
        const assignedPlanData: CachedPlanData = {
          selectedPlan: plan,
          selectedAddons: add_ons,
          ...remainingData
        }
        
        /* Cache in localStorage */
        localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA, JSON.stringify(assignedPlanData))
        console.log('Assigned plan data fetched and cached successfully')
        
        return assignedPlanData
      }
      
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assigned plan'
      setError(errorMessage)
      console.warn('Error fetching assigned plan:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /* Get cached plan data from localStorage */
  const getCachedPlan = useCallback((): CachedPlanData | null => {
    try {
      const cached = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }, [])

  return {
    fetchAssignedPlan,
    getCachedPlan,
    loading,
    error
  }
}