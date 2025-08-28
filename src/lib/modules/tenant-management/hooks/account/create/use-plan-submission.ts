/* React hooks */
import { useState, useCallback } from 'react'

/* Shared utilities */
import { handleApiError } from '@/lib/shared'

/* Module-specific imports */
import { Plan } from '@/lib/modules/plan-management/types/plans'
import { tenantApiService } from '@tenant-management/api/tenants'
import { assignPlanToTenantSchema } from '@tenant-management/schemas/validation/tenants'
import { SelectedAddon } from '@tenant-management/types'
import { PlanBillingCycle } from '@tenant-management/types'
import { validatePlanSelection, validateBranchCount } from '@tenant-management/utils/validation-helpers'
import { createToastMessage } from '@shared/utils/ui'

/* Plan submission data interface */
interface PlanSubmissionData {
  selectedPlan: Plan | null
  billingCycle: PlanBillingCycle
  branchCount: number
  selectedAddons: SelectedAddon[]
}

/* Plan submission hook state */
interface PlanSubmissionState {
  isSubmitting: boolean
  error: string | null
}

/* Custom hook for handling plan submission to API */
export const usePlanSubmission = () => {
  /* State management for submission process */
  const [state, setState] = useState<PlanSubmissionState>({
    isSubmitting: false,
    error: null
  })

  /* Validate plan selection data */
  const validatePlanData = useCallback((data: PlanSubmissionData) => {
    const planValidation = validatePlanSelection(data.selectedPlan)
    const branchValidation = validateBranchCount(
      data.branchCount, 
      data.selectedPlan?.included_branches_count ?? 1
    )

    if (!planValidation.isValid  && planValidation.message) {
      createToastMessage({
        title: 'Plan Selection Required',
        description: planValidation.message,
        type: 'warning'
      })
      return false
    }

    if (!branchValidation.isValid && planValidation.message) {
      createToastMessage({
        title: 'Branch Configuration Error',
        description: planValidation.message,
        type: 'warning'
      })
      return false
    }

    return true
  }, [])

  /* Prepare organization addon assignments */
  const prepareOrganizationAddons = useCallback((selectedAddons: SelectedAddon[]) => {
    return selectedAddons
      .filter(addon => addon.pricingScope === 'organization')
      .map(addon => ({
        addon_id: addon.addonId,
        feature_level: 'basic'
      }))
  }, [])

  /* Prepare branch addon assignments */
  const prepareBranchAddons = useCallback((selectedAddons: SelectedAddon[], branchCount: number) => {
    return Array.from({ length: branchCount }, (_, index) => ({
      branch_id: index + 1,
      addon_assignments: selectedAddons
        .filter(addon => addon.pricingScope === 'branch')
        .filter(addon => {
          const branchSelection = addon.branches.find(b => b.branchIndex === index)
          return branchSelection?.isSelected || false
        })
        .map(addon => ({
          addon_id: addon.addonId,
          feature_level: 'basic'
        }))
    }))
  }, [])

  /* Submit plan selection to API */
  const submitPlan = useCallback(async (
    data: PlanSubmissionData,
    onSuccess?: () => void
  ) => {
    /* Reset error state */
    setState(prev => ({ ...prev, error: null }))

    /* Validate plan data */
    if (!validatePlanData(data)) {
      return
    }

    /* Start submission process */
    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      /* Get tenant ID from localStorage */
      const tenantId = localStorage.getItem('tenant_id')
      if (!tenantId) {
        throw new Error('Tenant ID not found. Please complete previous steps.')
      }

      /* Prepare addon assignments */
      const organizationAddonAssignments = prepareOrganizationAddons(data.selectedAddons)
      const branchAddonAssignments = prepareBranchAddons(data.selectedAddons, data.branchCount)

      /* Prepare API request data */
      const requestData = {
        tenant_id: tenantId,
        plan_id: data.selectedPlan?.id,
        billing_cycle: data.billingCycle,
        branches_count: data.branchCount,
        organization_addon_assignments: organizationAddonAssignments,
        branch_addon_assignments: branchAddonAssignments
      }

      /* Validate request data against schema */
      const validatedData = assignPlanToTenantSchema.parse(requestData)

      /* Call assign plan API */
      const response = await tenantApiService.assignPlanToTenant(validatedData)

      if (response.data.success) {

        /* Show success toast */
        createToastMessage({
          title: 'Plan Assigned Successfully',
          description: `${data.selectedPlan?.name} plan has been assigned to your tenant account.`,
          type: 'success'
        })

        /* Reset state */
        setState({ isSubmitting: false, error: null })

        /* Call success callback */
        onSuccess?.()
      } else {
        throw new Error(response.data.error || 'Failed to assign plan to tenant')
      }
    } catch (error) {
      console.error('Failed to assign plan to tenant:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      /* Set error state */
      setState({
        isSubmitting: false,
        error: errorMessage
      })

      /* Show error toast */
      handleApiError(error, { title: 'Failed to assign plan to tenant' })
    }
  }, [validatePlanData, prepareOrganizationAddons, prepareBranchAddons])

  /* Clear error state */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  /* Get submission status */
  const getSubmissionStatus = useCallback(() => {
    return {
      isSubmitting: state.isSubmitting,
      hasError: state.error !== null,
      errorMessage: state.error
    }
  }, [state])

  /* Return hook interface */
  return {
    /* State properties */
    isSubmitting: state.isSubmitting,
    error: state.error,
    
    /* Actions */
    submitPlan,
    clearError,
    
    /* Utilities */
    getSubmissionStatus,
    
    /* Validation helpers */
    validatePlanData,
    
    /* Computed properties */
    canSubmit: !state.isSubmitting,
    hasError: state.error !== null
  }
}