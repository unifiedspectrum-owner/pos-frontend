/* React and Chakra UI component imports */
import React, { useState, useEffect, useRef } from 'react'
import { Flex } from '@chakra-ui/react'
import { FaExclamationTriangle } from 'react-icons/fa'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'
import { FullPageLoader, EmptyStateContainer } from '@shared/components/common'
import { handleApiError } from '@shared/utils'
import { createToastMessage } from '@shared/utils/ui'

/* Tenant module imports */
import { tenantApiService } from '@tenant-management/api/tenants'
import { AssignedAddonDetails, AssignedPlanApiResponse, PlanBillingCycle } from '@tenant-management/types'
import { BranchAddonsSummary, OrganizationAddonsSummary, PlanDetailsSummary, AccountSummary } from '@tenant-management/forms/account/steps/components'
import { usePlanPricingCalculation } from '@tenant-management/hooks'

interface PlanSummaryStepProps {
  isCompleted: (completed: boolean) => void
  onPrevious: () => void
  onCreateAccount?: () => void
}

const PlanSummaryStep: React.FC<PlanSummaryStepProps> = ({
  isCompleted,
  onPrevious,
  onCreateAccount
}) => {
  const [assignedPlanData, setAssignedPlanData] = useState<AssignedPlanApiResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<PlanBillingCycle | null>(null)
  
  /* Ref to prevent multiple API calls */
  const hasLoadedRef = useRef(false)

  /* Calculate pricing using custom hook */
  const { planTotalAmount, organizationAddonsTotal, branchAddonsTotal, grandTotal, calculateSingleAddonPrice } = usePlanPricingCalculation(
    assignedPlanData,
    billingCycle
  )

  useEffect(() => {
    /* Prevent multiple API calls using ref */
    if (hasLoadedRef.current) return
    
    const loadAssignedPlan = async () => {
      try {
        /* Get tenant ID from localStorage to identify the current tenant */
        const tenantId = localStorage.getItem('tenant_id')
        
        /* Validate tenant ID exists before proceeding */
        if (!tenantId) {
          /* Show error message if tenant ID is missing */
          createToastMessage({
            title: 'Invalid Tenant ID',
            description: 'Tenant ID not found. Please complete the previous steps or restart the account creation process.',
            type: 'error'
          })
          setIsLoading(false)
          return
        }

        /* Mark as loaded BEFORE the API call to prevent race conditions */
        hasLoadedRef.current = true

        /* Fetch assigned plan details from the API */
        const resp = await tenantApiService.getAssignedPlanForTenant({ tenant_id: tenantId })
        const response = resp.data

        /* Process successful API response */
        if (response.success && response.data) {
          console.log('Assigned Plan Data:', response.data)
          
          /* Update component state with fetched plan data */
          setAssignedPlanData(response.data)
          setBillingCycle(response.data.plan_details.billing_cycle as PlanBillingCycle)
          
          /* Show success notification to user */
          createToastMessage({
            title: 'Plan Details Loaded',
            description: `Successfully loaded ${response.data.plan_details.plan_name} plan details with all addons.`,
          })
        }
      } catch (error) {
        /* Log error for debugging purposes */
        console.error('Failed to load assigned plan:', error)
        
        /* Show user-friendly error message */
        handleApiError(error, { title: 'Failed to load assigned plan details' })
        
        /* Reset the ref if API fails so user can retry loading */
        hasLoadedRef.current = false
      } finally {
        /* Always stop loading spinner regardless of success or failure */
        setIsLoading(false)
      }
    }

    loadAssignedPlan()
  }, [])

  /* Helper function to get branch addons grouped by branch ID */
  const getBranchAddonsGrouped = () => {
    const branchAddons = assignedPlanData?.addon_details.branch_addons
    
    /* If it's already an object (grouped by branch), return as is */
    if (branchAddons && typeof branchAddons === 'object' && !Array.isArray(branchAddons)) {
      return branchAddons as Record<string, AssignedAddonDetails[]>
    }
    
    /* If it's an array, group it by branch ID (fallback) */
    if (Array.isArray(branchAddons)) {
      return branchAddons.reduce((acc, addon) => {
        const branchId = addon.branch_id || 'Unknown'
        if (!acc[branchId]) {
          acc[branchId] = []
        }
        acc[branchId].push(addon)
        return acc
      }, {} as Record<string, AssignedAddonDetails[]>)
    }
    
    return {}
  }

  /* Handle account creation completion */
  const handleComplete = () => {
    /* Show success toast for account completion */
    createToastMessage({
      title: 'Account Setup Complete!',
      description: 'Your tenant account has been successfully created. You can now start using your POS system.',
      type: 'success'
    })

    if (onCreateAccount) {
      onCreateAccount()
    } else {
      isCompleted(true)
    }
  }

  if (isLoading) {
    return (
      <FullPageLoader
        title="Loading Plan Summary"
        subtitle="Retrieving your selected plan details and addon configurations..."
      />
    )
  }

  if (!assignedPlanData || !billingCycle) {
    return (
      <EmptyStateContainer
        title="No Plan Data Found"
        description="We couldn't find your assigned plan details. Please go back and select a plan."
        icon={<FaExclamationTriangle />}
      />
    )
  }

  return (
    <Flex flexDir="column" gap={6} w="full">
      {/* Plan Details Summary */}
      <PlanDetailsSummary
        planDetails={assignedPlanData.plan_details}
        billingCycle={billingCycle}
        totalAmount={planTotalAmount}
      />

      {/* Organization Add-ons */}
      <OrganizationAddonsSummary
        organizationAddons={assignedPlanData.addon_details.organization_addons || []}
        billingCycle={billingCycle}
        calculateSingleAddonPrice={calculateSingleAddonPrice}
      />

      {/* Branch Add-ons */}
      {assignedPlanData.addon_details.branch_addons && 
       Object.keys(assignedPlanData.addon_details.branch_addons).length > 0 && (
        <BranchAddonsSummary
          branchAddons={getBranchAddonsGrouped()}
          billingCycle={billingCycle}
          calculateSingleAddonPrice={calculateSingleAddonPrice}
        />
      )}

      {/* Account Summary */}
      <AccountSummary
        assignedPlanData={assignedPlanData}
        planTotalAmount={planTotalAmount}
        organizationAddonsTotal={organizationAddonsTotal}
        branchAddonsTotal={branchAddonsTotal}
        grandTotal={grandTotal}
      />

      {/* Navigation buttons */}
      <Flex justify="space-between" pt={4}>
        <SecondaryButton onClick={onPrevious}>
          Back to Plan Selection
        </SecondaryButton>
        
        <PrimaryButton onClick={handleComplete}>
          Complete Account Setup
        </PrimaryButton>
      </Flex>
    </Flex>
  )
}

export default PlanSummaryStep