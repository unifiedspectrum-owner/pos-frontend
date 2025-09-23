"use client"

/* React hooks */
import { useState, useCallback } from 'react'

/* Shared module imports */
import { handleApiError, validatePayload } from '@shared/utils'
import { createToastNotification } from '@shared/utils'

/* Plan management module imports */
import { Plan } from '@plan-management/types/plans'

/* Tenant module imports */
import { subscriptionService } from '@tenant-management/api'
import { assignPlanToTenantSchema } from '@tenant-management/schemas'
import { SelectedAddon, PlanBillingCycle } from '@tenant-management/types/subscription'
import { validatePlanSelection, validateBranchCount } from '@tenant-management/utils/business'
import { StepTracker } from '@tenant-management/utils/workflow'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { AxiosError } from 'axios'

/* Tenant form submission data structure */
interface TenantSubmissionData {
  selectedPlan: Plan | null
  billingCycle: PlanBillingCycle
  branchCount: number
  selectedAddons: SelectedAddon[]
}

/* Submission hook state management */
interface SubmissionState {
  isSubmitting: boolean
  error: string | null
}

/* Custom hook for handling tenant form submission to API */
export const useTenantFormSubmission = () => {
  /* State management for submission process */
  const [state, setState] = useState<SubmissionState>({
    isSubmitting: false,
    error: null
  })

  /* Validate tenant submission data before API call */
  const validateSubmissionData = useCallback((data: TenantSubmissionData) => {
    const planValidation = validatePlanSelection(data.selectedPlan)
    const branchValidation = validateBranchCount(
      data.branchCount, 
      data.selectedPlan?.included_branches_count
    )

    if (!planValidation.isValid && planValidation.message) {
      createToastNotification({
        title: 'Plan Selection Required',
        description: planValidation.message,
        type: 'warning'
      })
      return false
    }

    if (!branchValidation.isValid && branchValidation.message) {
      createToastNotification({
        title: 'Branch Configuration Error',
        description: branchValidation.message,
        type: 'warning'
      })
      return false
    }

    return true
  }, [])

  /* Format organization-scoped addons for API payload */
  const formatOrganizationAddons = useCallback((selectedAddons: SelectedAddon[]) => {
    return selectedAddons
      .filter(addon => addon.pricing_scope === 'organization')
      .map(addon => ({
        addon_id: addon.addon_id,
        feature_level: 'basic' as const
      }))
  }, [])

  /* Format branch-scoped addons for API payload */
  const formatBranchAddons = useCallback((selectedAddons: SelectedAddon[], branchCount: number) => {
    return Array.from({ length: branchCount }, (_, index) => ({
      branch_id: index + 1,
      addon_assignments: selectedAddons
        .filter(addon => addon.pricing_scope === 'branch')
        .filter(addon => {
          const branchSelection = addon.branches.find(b => b.branchIndex === index)
          return branchSelection?.isSelected || false
        })
        .map(addon => ({
          addon_id: addon.addon_id,
          feature_level: 'basic' as const
        }))
    }))
  }, [])

  /* Submit tenant form data to API with plan assignment */
  const submitTenantForm = useCallback(async (
    data: TenantSubmissionData,
    onSuccess?: () => void
  ) => {
    /* Reset error state */
    setState(prev => ({ ...prev, error: null }))

    /* Validate submission data before processing */
    if (!validateSubmissionData(data)) {
      return
    }

    /* Start submission process */
    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      /* Get tenant ID from localStorage */
      const tenantId = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.TENANT_ID)
      if (!tenantId) {
        createToastNotification({
          title: 'Tenant ID Required',
          description: 'Please complete the tenant information step before proceeding.',
          type: 'warning'
        })
        setState(prev => ({ ...prev, isSubmitting: false }))
        return
      }

      /* Format addon assignments for API request */
      const organizationAddonAssignments = formatOrganizationAddons(data.selectedAddons)
      const branchAddonAssignments = formatBranchAddons(data.selectedAddons, data.branchCount)

      /* Build API request payload */
      const apiPayload = {
        tenant_id: tenantId,
        plan_id: data.selectedPlan?.id,
        billing_cycle: data.billingCycle,
        branches_count: data.branchCount,
        organization_addon_assignments: organizationAddonAssignments,
        branch_addon_assignments: branchAddonAssignments
      }

      /* Validate API payload against schema */
      const validationResult = validatePayload(apiPayload, assignPlanToTenantSchema, 'Account Creation Form Payload');
      
      if (!validationResult.isValid) {
        const errorMessages = validationResult.errors?.map(err => `${err.field}: ${err.message}`).join(', ') || 'Unknown validation error'
        createToastNotification({
          title: 'Validation Error',
          description: errorMessages,
          type: 'warning'
        })
        setState(prev => ({ ...prev, isSubmitting: false }))
        return
      }
      
      const validatedPayload = validationResult.data!

      /* Execute plan assignment API call */
      const response = await subscriptionService.assignPlanToTenant(validatedPayload)

      if (response.data && response.success) {
        /* Cache submission data for cross-step persistence */
        const submissionCache = {
          selectedPlan: data.selectedPlan,
          billingCycle: data.billingCycle,
          branchCount: data.branchCount,
          selectedAddons: data.selectedAddons
        }
        localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA, JSON.stringify(submissionCache))

        /* Mark plan selection step as completed */
        StepTracker.markStepCompleted('PLAN_SELECTION')

        /* Display success notification */
        createToastNotification({
          title: 'Plan Assigned Successfully',
          description: `${data.selectedPlan?.name} plan has been assigned to your tenant account.`,
          type: 'success'
        })

        /* Reset state */
        setState({ isSubmitting: false, error: null })

        /* Call success callback */
        onSuccess?.()
      } else {
        throw new Error(response.error || 'Failed to assign plan to tenant')
      }
    } catch (error) {
      console.error('Failed to assign plan to tenant:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      /* Set error state */
      setState({
        isSubmitting: false,
        error: errorMessage
      })

      /* Display error notification */
      const err = error as AxiosError;
      handleApiError(err, { title: 'Failed to assign plan to tenant' })
    }
  }, [validateSubmissionData, formatOrganizationAddons, formatBranchAddons])

  /* Clear error state */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  /* Get current submission status details */
  const getSubmissionStatus = useCallback(() => {
    return {
      isSubmitting: state.isSubmitting,
      hasError: state.error !== null,
      errorMessage: state.error
    }
  }, [state])

  /* Return hook interface with actions and state */
  return {
    /* Current submission state */
    isSubmitting: state.isSubmitting,
    error: state.error,
    
    /* Primary actions */
    submitTenantForm,
    clearError,
    
    /* Utility methods */
    getSubmissionStatus,
    validateSubmissionData,
    
    /* Computed state properties */
    canSubmit: !state.isSubmitting,
    hasError: state.error !== null
  }
}