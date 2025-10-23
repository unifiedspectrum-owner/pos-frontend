/* React and Chakra UI component imports */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Flex, Text } from '@chakra-ui/react'
import { FaExclamationTriangle } from 'react-icons/fa'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'
import { FullPageLoader, EmptyStateContainer } from '@shared/components/common'
import { createToastNotification } from '@shared/utils/ui'

/* Tenant module imports */
import { CachedPlanData } from '@tenant-management/types'
import { BranchAddonsSummary, OrganizationAddonsSummary, PlanDetailsSummary, AccountSummary } from './components'
import { PLAN_BILLING_CYCLE, ADDON_PRICING_SCOPE } from '@tenant-management/constants'
import { StepTracker } from '@tenant-management/utils'
import { PRIMARY_COLOR, WHITE_COLOR } from '@/lib/shared/config'
import { FiArrowLeft, FiArrowRight, FiFileText } from 'react-icons/fi'
import { getTenantId } from '../../../utils'
import { usePlanStorage } from '@/lib/modules/tenant-management/hooks/account-creation'

/* Props for plan summary step component */
interface PlanSummaryStepProps {
  isCompleted: (completed: boolean) => void /* Callback when step is completed */
  onPrevious: () => void /* Handler for previous step navigation */
}

/* Plan summary step component for tenant account creation */
const PlanSummaryStep: React.FC<PlanSummaryStepProps> = ({
  isCompleted,
  onPrevious
}) => {
  /* State management for plan data and loading states */
  const [planData, setPlanData] = useState<CachedPlanData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  /* Plan storage hook */
  const { 
    isSubmitting, 
    loadPlanData, 
    assignPlanToTenant 
  } = usePlanStorage()

  useEffect(() => {
    const loadPlanDataFromStorage = () => {
      try {
        /* Load plan data using the hook */
        const loadedPlanData = loadPlanData()
        
        if (!loadedPlanData) {
          createToastNotification({
            title: 'No Plan Data Found',
            description: 'Please go back and select a plan first.',
            type: 'error'
          })
          setIsLoading(false)
          return
        }

        /* Set plan data */
        setPlanData(loadedPlanData)
        
        createToastNotification({
          title: 'Plan Details Loaded',
          description: `Successfully loaded ${loadedPlanData.selectedPlan?.name} plan details with all addons.`,
        })
      } catch (error) {
        console.error('Failed to load plan data from localStorage:', error)
        createToastNotification({
          title: 'Error Loading Plan Data',
          description: 'Failed to load saved plan data. Please go back and reselect your plan.',
          type: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPlanDataFromStorage()
  }, [loadPlanData])

  /* Transform localStorage data to API format for summary components */
  const transformToApiFormat = useCallback(() => {
    if (!planData?.selectedPlan) return null
    
    const tenantId = getTenantId()
    
    const planDetails = {
      plan: planData.selectedPlan,
      billingCycle: planData.billingCycle,
      branchCount: planData.branchCount,
      branches: planData.branches,
      add_ons: planData.selectedAddons
    }

    const organizationAddons = planData.selectedAddons
      .filter(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.ORGANIZATION)
      .map((selection, index) => ({
        assignment_id: index + 1,
        tenant_id: tenantId!,
        branch_id: null,
        addon_id: selection.addon_id,
        addon_name: selection.addon_name,
        addon_description: '',
        addon_price: selection.addon_price,
        pricing_scope: selection.pricing_scope as 'organization' | 'branch',
        status: 'active',
        feature_level: 'basic' as 'basic' | 'premium' | 'custom',
        billing_cycle: planData.billingCycle,
      }))

    const branchScopedAddons = planData.selectedAddons.filter(addon => addon.pricing_scope === 'branch')

    const branchAddons = branchScopedAddons
      .flatMap((selection, addonIndex) => {
        const selectedBranches = selection.branches.filter(branch => branch.isSelected && branch.branchIndex < planData.branchCount)
        
        return selectedBranches.map((branch, branchIndex) => {
            // Use branch name from the addon's branch selection or default
            const branchName = branch.branchName || `Branch ${branch.branchIndex + 1}`            
            return {
              assignment_id: addonIndex * 100 + branchIndex + 1, // Unique assignment ID
              tenant_id: tenantId!,
              branch_id: branchName, // Use branch name from addon selection
              addon_id: selection.addon_id,
              addon_name: selection.addon_name,
              addon_description: '',
              addon_price: selection.addon_price,
              pricing_scope: selection.pricing_scope as 'organization' | 'branch',
              status: 'active',
              feature_level: 'basic' as 'basic' | 'premium' | 'custom',
              billing_cycle: planData.billingCycle,
            }
          })
      })


    return {
      plan_details: planDetails,
      addon_details: {
        organization_addons: organizationAddons,
        branch_addons: branchAddons
      }
    }
  }, [planData])

  /* Calculate pricing totals from localStorage data */
  const calculatePricing = useCallback(() => {
    if (!planData?.selectedPlan) return { planTotal: 0, orgAddonsTotal: 0, branchAddonsTotal: 0, grandTotal: 0 }
    
    const isAnnual = planData.billingCycle === PLAN_BILLING_CYCLE.YEARLY
    const discountFactor = isAnnual ? (100 - (planData.selectedPlan.annual_discount_percentage || 0)) / 100 : 1
    
    /* Calculate plan total */
    const planTotal = planData.selectedPlan.monthly_price * planData.branchCount * (isAnnual ? 12 : 1) * discountFactor
    
    /* Calculate organization addons total */
    const orgAddonsTotal = planData.selectedAddons
      .filter(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.ORGANIZATION)
      .reduce((total, selection) => {
        return total + (selection.addon_price * (isAnnual ? 12 : 1) * discountFactor)
      }, 0)
    
    /* Calculate branch addons total */
    const branchAddonsTotal = planData.selectedAddons
      .filter(addon => addon.pricing_scope === ADDON_PRICING_SCOPE.BRANCH)
      .reduce((total, selection) => {
        const selectedBranchCount = selection.branches.filter(branch => branch.isSelected && branch.branchIndex < planData.branchCount).length
        return total + (selection.addon_price * selectedBranchCount * (isAnnual ? 12 : 1) * discountFactor)
      }, 0)
    
    const grandTotal = planTotal + orgAddonsTotal + branchAddonsTotal
    
    return { planTotal, orgAddonsTotal, branchAddonsTotal, grandTotal }
  }, [planData])

  /* Calculate addon price with billing cycle and discount */
  const calculateSingleAddonPrice = useCallback((monthlyPrice: number) => {
    if (!planData?.selectedPlan) return monthlyPrice
    
    const isAnnual = planData.billingCycle === PLAN_BILLING_CYCLE.YEARLY
    const discountFactor = isAnnual ? (100 - (planData.selectedPlan.annual_discount_percentage || 0)) / 100 : 1
    return monthlyPrice * (isAnnual ? 12 : 1) * discountFactor
  }, [planData])

  /* Group branch addons by branch and create ordered list */
  const getOrderedBranchData = useCallback((transformedData: ReturnType<typeof transformToApiFormat>) => {
    if (!transformedData || !planData) return []

    /* Group actual branch addons by branch ID */
    const branchAddonsGrouped = transformedData.addon_details.branch_addons.reduce((acc, addon) => {
      const branchId = addon.branch_id || 'unknown'
      if (!acc[branchId]) {
        acc[branchId] = []
      }
      acc[branchId].push(addon)
      return acc
    }, {} as Record<string, typeof transformedData.addon_details.branch_addons>)
    
    /* Create ordered branch list with index preservation */
    const orderedBranchData = []
    
    /* Add all branches up to branch count, getting names from addon data or using defaults */
    for (let i = 0; i < planData.branchCount; i++) {
      /* Try to find a custom name from any addon's branch data */
      let customBranchName = `Branch ${i + 1}`
      
      for (const selectedAddon of planData.selectedAddons) {
        if (selectedAddon.pricing_scope === ADDON_PRICING_SCOPE.BRANCH) {
          const branchInfo = selectedAddon.branches.find(branch => branch.branchIndex === i)
          if (branchInfo?.branchName) {
            customBranchName = branchInfo.branchName
            break
          }
        }
      }
      
      /* Add branch with its addons or empty array, preserving index order */
      orderedBranchData.push({
        branchIndex: i,
        branchName: customBranchName,
        addons: branchAddonsGrouped[customBranchName] || []
      })
    }
    
    return orderedBranchData
  }, [planData])

  /* Handle proceeding to payment step with API submission */
  const handleProceedToPayment = async () => {
    if (!planData) return

    /* Use the hook's assignPlanToTenant method */
    const success = await assignPlanToTenant()
    
    if (success) {
      /* After API success, mark step as completed */
      StepTracker.markStepCompleted('PLAN_SUMMARY')
      isCompleted(true)
    }
  }

  /* Memoized calculations to avoid repeated function calls */
  const transformedData = useMemo(() => transformToApiFormat(), [transformToApiFormat])
  const pricing = useMemo(() => calculatePricing(), [calculatePricing])
  const orderedBranchData = useMemo(() => getOrderedBranchData(transformedData), [transformedData, getOrderedBranchData])

  if (isLoading) {
    return (
      <FullPageLoader
        title="Loading Plan Summary"
        subtitle="Retrieving your selected plan details and addon configurations..."
      />
    )
  }

  if (!planData || !planData.selectedPlan) {
    return (
      <EmptyStateContainer
        title="No Plan Data Found"
        description="We couldn't find your selected plan details. Please go back and select a plan."
        icon={<FaExclamationTriangle />}
      />
    )
  }

  return (
    <Flex
      w="full"
      flexDir={'column'} 
      gap={6} 
      borderWidth={1} 
      bg={WHITE_COLOR} 
      borderBottomRadius={'lg'} 
      p={8}
      transition="all 0.3s ease"
      borderColor={PRIMARY_COLOR}
      _hover={{
        //transform: "scale(1.02)",
        boxShadow: "0 8px 24px rgba(136, 92, 247, 0.15)"
      }}
    >
      <Flex flexDir={'column'} gap={2}>
        <Flex alignItems={'center'} gap={2}>
          <Text fontSize={20} color={PRIMARY_COLOR}>
            <FiFileText/> 
          </Text>
          <Text fontSize="xl" fontWeight="bold">
            Plan Summary
          </Text>
        </Flex>
        <Text color={'gray.600'}>Review your selected plan and add-ons before proceeding to payment</Text>
      </Flex>

{transformedData && (
        <>
          <Flex w={'100%'} gap={4}>
            {/* Plan Details Summary */}
            <PlanDetailsSummary
              planDetails={transformedData.plan_details}
              billingCycle={planData.billingCycle}
              planTotalAMount={pricing.planTotal}
            />

            {/* Organization Add-ons */}
            <OrganizationAddonsSummary
              organizationAddons={transformedData.addon_details.organization_addons || []}
              billingCycle={planData.billingCycle}
              calculateSingleAddonPrice={calculateSingleAddonPrice}
            />
          </Flex>

          {/* Branch Add-ons */}
          <BranchAddonsSummary
            branchAddons={orderedBranchData}
            billingCycle={planData.billingCycle}
            calculateSingleAddonPrice={calculateSingleAddonPrice}
          />

          {/* Account Summary */}
          <AccountSummary
            assignedPlanData={transformedData.plan_details}
            planTotalAmount={pricing.planTotal}
            organizationAddonsTotal={pricing.orgAddonsTotal}
            branchAddonsTotal={pricing.branchAddonsTotal}
            grandTotal={pricing.grandTotal}
          />
        </>
      )}

      {/* Navigation buttons */}
      <Flex justify="space-between" pt={4}>
        <SecondaryButton 
          onClick={onPrevious}
          leftIcon={FiArrowLeft}  
        >
          Back to Addon Selection
        </SecondaryButton>
        
        <PrimaryButton 
          onClick={handleProceedToPayment}
          loading={isSubmitting}
          disabled={isSubmitting}
          rightIcon={FiArrowRight}
        >
          {isSubmitting ? 'Assigning Plan...' : 'Proceed to Payment'}
        </PrimaryButton>
      </Flex>
    </Flex>
  )
}

export default PlanSummaryStep