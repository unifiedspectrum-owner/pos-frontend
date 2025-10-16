/* React and Chakra UI component imports */
import React, { useState, useCallback, useEffect } from 'react'
import { Flex } from '@chakra-ui/react'


/* Plan module imports */
import { Plan } from '@plan-management/types'

/* Tenant module imports */
import { PlansGrid, BillingCycleSelector, NavigationButton } from './components'
import { PlanSelectionSkeleton } from '@tenant-management/components/loading'
import { useBranchManagement, useAddonManagement, usePlanData } from '@tenant-management/hooks'
import { usePlanStorage } from '@/lib/modules/tenant-management/hooks/account-creation'
import { CachedPlanData, PlanBillingCycle } from '@tenant-management/types'
import { MAX_BRANCH_COUNT, TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'
import { StepTracker } from '@tenant-management/utils/workflow'
import { PRIMARY_COLOR, WHITE_COLOR } from '@/lib/shared/config'

/* Props interface for plan selection step component */
interface PlanSelectionStepProps {
  isCompleted: (completed: boolean) => void
  onPrevious: () => void
}

/* Plan selection step component for tenant account creation */
const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  isCompleted, 
  onPrevious
}) => {
  /* State management for plan and billing selections */
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [billingCycle, setBillingCycle] = useState<PlanBillingCycle>('monthly')

  /* Custom hooks for data fetching and management */
  const { plans, isLoading: isPlanLoading } = usePlanData()
  const { branchCount, branches, handleBranchCountChange } = useBranchManagement()
  const { selectedAddons, setSelectedAddons } = useAddonManagement()
  
  /* Plan storage hook for API submission */
  const { 
    isSubmitting, 
    assignPlanToTenant,
  } = usePlanStorage()
  
  /* Auto-select the first featured plan when plans load and no plan is selected */
  useEffect(() => {
    if (!selectedPlan && plans && plans.length > 0) {
      const featuredPlan = plans.find(plan => plan.is_featured) || plans[2]
      setSelectedPlan(featuredPlan)
    }
  }, [plans, selectedPlan])

  /* Restore previously selected plan data from localStorage */
  useEffect(() => {
    try {
      const savedPlanData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA)
      if (savedPlanData) {
        const planData: CachedPlanData = JSON.parse(savedPlanData);
        if (planData.selectedPlan) {
          setSelectedPlan(planData.selectedPlan)
        }
        if (planData.billingCycle) {
          setBillingCycle(planData.billingCycle)
        }
      }
    } catch (error) {
      console.warn('Failed to restore plan data from localStorage:', error)
    }
  }, [])

  /* Plan selection handler with branch count adjustment and addon filtering */
  const handlePlanSelect = useCallback((plan: Plan) => {
    setSelectedPlan(plan)
    
    /* Adjust branch count if current selection exceeds new plan's limit */
    const planMaxBranches = plan.included_branches_count || MAX_BRANCH_COUNT
    const effectiveMaxBranches = Math.min(planMaxBranches, MAX_BRANCH_COUNT)
    
    if (branchCount > effectiveMaxBranches) {
      const newBranchCount = effectiveMaxBranches
      handleBranchCountChange(newBranchCount, setSelectedAddons)
    }

    /* Filter selected addons to only keep those available in the new plan */
    setSelectedAddons(prevSelectedAddons => {
      const planAddonIds = new Set(plan.add_ons.map(addon => addon.id))
      
      return prevSelectedAddons
        .filter(selectedAddon => planAddonIds.has(selectedAddon.addon_id))
        .map(selectedAddon => {
          /* Addon is available, but need to adjust branch count if it was reduced */
          if (selectedAddon.pricing_scope === 'branch' && selectedAddon.branches.length > effectiveMaxBranches) {
            /* Create new addon object with trimmed branches */
            return {
              ...selectedAddon,
              branches: selectedAddon.branches.slice(0, effectiveMaxBranches)
            }
          }
          return selectedAddon
        })
    })

  }, [branchCount, handleBranchCountChange, setSelectedAddons])

  /* Billing cycle change handler */
  const handleBillingCycleChange = useCallback((cycle: PlanBillingCycle) => setBillingCycle(cycle), [])

  /* Enhanced branch count handler that updates addon selections */
  const onBranchCountChange = useCallback((value: number) => {
    handleBranchCountChange(value, setSelectedAddons)
  }, [handleBranchCountChange, setSelectedAddons])

  /* Save plan data, call API, and complete step after success */
  const handleContinue = useCallback(async () => {
    const planData: CachedPlanData = {
      selectedPlan,
      billingCycle,
      branchCount,
      branches,
      selectedAddons,
    }

    try {
      /* Store complete plan data in localStorage first */
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA, JSON.stringify(planData))
      
      /* Assign plan to tenant via API */
      const success = await assignPlanToTenant()
      
      if (success) {
        /* After API success, mark step as completed */
        StepTracker.markStepCompleted('PLAN_SELECTION')
        isCompleted(true)
      }
    } catch (error) {
      console.error('Failed to save plan data or assign plan:', error)
      /* Don't proceed if API fails */
    }
  }, [selectedPlan, billingCycle, branchCount, branches, selectedAddons, assignPlanToTenant, isCompleted])
  
  /* Show skeleton while loading plans */
  if (isPlanLoading) {
    return (
      <PlanSelectionSkeleton 
        showBranchConfig={false}
        showAddons={false}
        planCount={4}
      />
    )
  }

  return (
    <Flex
      flexDir={'column'} 
      gap={6} 
      borderWidth={1} 
      bg={WHITE_COLOR} 
      borderBottomRadius={'lg'} 
      p={8}
      transition="all 0.3s ease"
      borderColor={PRIMARY_COLOR}
      _hover={{
        boxShadow: "0 8px 24px rgba(136, 92, 247, 0.15)"
      }}
    >
      {/* Billing cycle selection toggle */}
      <BillingCycleSelector
        value={billingCycle}
        onChange={handleBillingCycleChange}
        discountPercentage={plans[3]?.annual_discount_percentage ?? 0}
      />

      {/* Available subscription plans grid */}
      <PlansGrid
        plans={plans}
        selectedPlan={selectedPlan}
        billingCycle={billingCycle}
        onPlanSelect={handlePlanSelect}
        branchCount={branchCount}
        onBranchCountChange={onBranchCountChange}
      />

      {/* Step navigation controls */}
      <NavigationButton
        secondaryBtnText="Back to Account Info"
        onSecondaryClick={onPrevious}
        primaryBtnText="Continue to Addon Selection"
        primaryBtnLoadingText="Assigning Plan..."
        onPrimaryClick={handleContinue}
        primaryBtnDisabled={!selectedPlan || isSubmitting}
        isPrimaryBtnLoading={isSubmitting}
      />
    </Flex>
  )
}

export default PlanSelectionStep