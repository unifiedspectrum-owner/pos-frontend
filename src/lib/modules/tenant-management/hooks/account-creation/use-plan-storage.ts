"use client"

/* Libraries imports */
import { useState, useCallback } from 'react'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { createToastNotification } from '@shared/utils/ui'

/* Tenant module imports */
import { subscriptionService } from '@tenant-management/api'
import { CachedPlanData } from '@tenant-management/types/subscription'
import { AssignPlanToTenantApiRequest } from '@tenant-management/types/subscription'
import { TENANT_ACCOUNT_CREATION_LS_KEYS, ADDON_PRICING_SCOPE } from '@tenant-management/constants'
import { AxiosError } from 'axios'

/* Hook return type interface */
interface UsePlanStorageReturn {
  /* State */
  isSubmitting: boolean
  error: string | null
  
  /* Data loading */
  loadPlanData: () => CachedPlanData | null
  
  /* API submission */
  assignPlanToTenant: () => Promise<boolean>
  
  /* Storage management */
  markPlanSummaryCompleted: () => void
  isPlanSummaryCompleted: () => boolean
}

/* Custom hook for handling plan data storage and API submission */
export const usePlanStorage = (): UsePlanStorageReturn => {
  /* State management */
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Load plan data from localStorage */
  const loadPlanData = useCallback((): CachedPlanData | null => {
    try {
      const savedPlanData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA)
      
      if (!savedPlanData) {
        setError('No plan data found in localStorage')
        return null
      }

      const parsedData: CachedPlanData = JSON.parse(savedPlanData)
      setError(null)
      return parsedData
    } catch (error) {
      console.error('Failed to load plan data from localStorage:', error)
      setError('Failed to parse plan data from storage')
      return null
    }
  }, [])

  /* Transform plan data to API request format */
  const transformPlanDataToApiRequest = useCallback((planData: CachedPlanData): AssignPlanToTenantApiRequest | null => {
    try {
      /* Get tenant ID from localStorage */
      const tenantId = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID)
      
      if (!tenantId || !planData.selectedPlan?.id) {
        throw new Error('Missing tenant ID or plan ID')
      }

      /* Transform organization addons */
      const organizationAddonAssignments = planData.selectedAddons
        .filter(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.ORGANIZATION)
        .map(addon => ({
          addon_id: addon.addon_id,
          feature_level: 'basic' as 'basic' | 'premium' | 'custom'
        }))

      /* Transform branch addons */
      const branchAddonAssignments = planData.selectedAddons
        .filter(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.BRANCH)
        .reduce((acc, addon) => {
          addon.branches
            .filter(branch => branch.isSelected && branch.branchIndex < planData.branchCount)
            .forEach(branch => {
              const branchId = branch.branchIndex + 1 // Convert 0-based to 1-based
              const existingBranch = acc.find(b => b.branch_id === branchId)
              
              if (existingBranch) {
                existingBranch.addon_assignments.push({
                  addon_id: addon.addon_id,
                  feature_level: 'basic' as 'basic' | 'premium' | 'custom'
                })
              } else {
                acc.push({
                  branch_id: branchId,
                  addon_assignments: [{
                    addon_id: addon.addon_id,
                    feature_level: 'basic' as 'basic' | 'premium' | 'custom'
                  }]
                })
              }
            })
          return acc
        }, [] as Array<{ branch_id: number; addon_assignments: Array<{ addon_id: number; feature_level: 'basic' | 'premium' | 'custom' }> }>)

      /* Return API request payload */
      return {
        tenant_id: tenantId,
        plan_id: planData.selectedPlan.id,
        billing_cycle: planData.billingCycle,
        branches_count: planData.branchCount,
        organization_addon_assignments: organizationAddonAssignments,
        branch_addon_assignments: branchAddonAssignments
      }
    } catch (error) {
      console.error('Failed to transform plan data:', error)
      setError('Failed to prepare plan data for submission')
      return null
    }
  }, [])

  /* Submit plan data to API */
  const assignPlanToTenant = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      /* Load and validate plan data */
      const planData = loadPlanData()
      if (!planData) {
        createToastNotification({
          title: 'No Plan Data',
          description: 'Please go back and select a plan first.',
          type: 'error'
        })
        return false
      }

      /* Transform data to API format */
      const apiRequestData = transformPlanDataToApiRequest(planData)
      if (!apiRequestData) {
        createToastNotification({
          title: 'Invalid Plan Data',
          description: 'Unable to process plan data. Please try again.',
          type: 'error'
        })
        return false
      }

      /* Submit to API */
      await subscriptionService.assignPlanToTenant(apiRequestData)
      
      createToastNotification({
        title: 'Plan Assigned Successfully',
        description: 'Your plan has been assigned successfully. Proceeding to payment.',
      })
      
      return true
    } catch (error) {
      console.error('Failed to assign plan to tenant:', error)
      const err = error as AxiosError;
      handleApiError(err, { title: 'Failed to assign plan' })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [loadPlanData, transformPlanDataToApiRequest])

  /* Mark plan summary as completed in localStorage */
  const markPlanSummaryCompleted = useCallback((): void => {
    try {
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PLAN_SUMMARY_COMPLETED, 'true')
    } catch (error) {
      console.error('Failed to mark plan summary as completed:', error)
    }
  }, [])

  /* Check if plan summary is completed */
  const isPlanSummaryCompleted = useCallback((): boolean => {
    try {
      return !!localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.PLAN_SUMMARY_COMPLETED)
    } catch (error) {
      console.error('Failed to check plan summary completion status:', error)
      return false
    }
  }, [])

  return {
    /* State */
    isSubmitting,
    error,
    
    /* Data loading */
    loadPlanData,
    
    /* API submission */
    assignPlanToTenant,
    
    /* Storage management */
    markPlanSummaryCompleted,
    isPlanSummaryCompleted
  }
}