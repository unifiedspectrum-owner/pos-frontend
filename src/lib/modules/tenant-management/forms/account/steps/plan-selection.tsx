/* React and Chakra UI component imports */
import React, { useState, useCallback, useEffect } from 'react'
import { Text, Box, Flex } from '@chakra-ui/react'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'
import NumberInputField from '@shared/components/form-elements/ui/number-input'

/* Plan module imports */
import { Addon, Plan } from '@plan-management/types/plans'

/* Tenant module imports */
import { AddonSelectionModal, SelectedAddonsSummary, AvailableAddonsGrid, PlansGrid } from '@tenant-management/forms/account/steps/components'
import BillingCycleSelector from '@tenant-management/forms/account/steps/components/plan-selection/billing-cycle-selector'
import { PlanSelectionSkeleton } from '@tenant-management/components/skeleton'
import { useBranchManagement, useAddonManagement, usePlanData, usePlanSubmission } from '@tenant-management/hooks'
import { formatPlanPriceLabel } from '@tenant-management/utils/pricing-helpers'
import { PlanBillingCycle } from '@tenant-management/types'

/* Props interface for plan selection step component */
interface PlanSelectionStepProps {
  isCompleted: (completed: boolean) => void
  isReviewMode?: boolean
  onPrevious: () => void
}

 /* Plan selection step component for tenant account creation */
const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  isCompleted, 
  isReviewMode = false, 
  onPrevious
}) => {
  /* State management for selection */
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [billingCycle, setBillingCycle] = useState<PlanBillingCycle>('monthly')

  /* Custom hooks for data fetching and management */
  const { plans, isLoading: isPlanLoading } = usePlanData()
  const { branchCount, handleBranchCountChange } = useBranchManagement()
  
  /* Addon management hook - organized by functionality */
  const {
    /* State properties */
    selectedAddons, currentAddon, isAddonModalOpen,
    
    /* State setters */
    setSelectedAddons,
    
    /* Modal management */
    openAddonModal, closeAddonModal,
    
    /* Addon operations */
    handleAddonSelection, removeAddon,
    
    /* Query functions */
    isAddonSelected, getAddonSelection
  } = useAddonManagement()

  /* Plan submission hook */
  const { submitPlan, isSubmitting: isPlanSubmitting } = usePlanSubmission()

  /* Restore previously selected plan data from localStorage */
  useEffect(() => {
    try {
      const savedPlanData = localStorage.getItem('selected_plan')
      if (savedPlanData) {
        const planData = JSON.parse(savedPlanData)
        setSelectedPlan(planData.selectedPlan)
        setBillingCycle(planData.billingCycle)
        /* Branch count will be restored by the useBranchManagement hook */
        /* Selected addons will be restored by the useAddonManagement hook */
      }
    } catch (error) {
      console.warn('Failed to restore plan data from localStorage:', error)
    }
  }, [])

  /* Plan selection handler */
  const handlePlanSelect = useCallback((plan: Plan) => setSelectedPlan(plan), [])

  /* Billing cycle change handler */
  const handleBillingCycleChange = useCallback((cycle: PlanBillingCycle) => setBillingCycle(cycle), [])

  /* Enhanced branch count handler that updates addon selections */
  const onBranchCountChange = useCallback((value: number) => {
    handleBranchCountChange(value, setSelectedAddons)
  }, [handleBranchCountChange, setSelectedAddons])

  /* Handle addon configuration modal opening */
  const handleAddonClick = useCallback((addon: Addon) => {
    if (addon.is_included || isReviewMode) return
    openAddonModal(addon)
  }, [isReviewMode, openAddonModal])

  /* Handle editing addon from summary by finding it in selected plan */
  const handleAddonEdit = useCallback((addonId: number) => {
    const addon = selectedPlan?.add_ons.find(a => a.id === addonId)
    if (addon) {
      handleAddonClick(addon)
    }
  }, [selectedPlan, handleAddonClick])

  /* Submit plan selection and complete step */
  const handleContinue = useCallback(async () => {
    const planData = {
      selectedPlan,
      billingCycle,
      branchCount,
      selectedAddons,
    }

    await submitPlan(planData, () => {
      /* Mark step as completed on successful submission */
      isCompleted(true)
    })
  }, [selectedPlan, billingCycle, branchCount, selectedAddons, submitPlan, isCompleted]);

  /* Format plan price based on billing cycle */
  const getPriceLabel = useCallback((plan: Plan) => formatPlanPriceLabel(plan, billingCycle), [billingCycle])

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
    <Flex flexDir={'column'} gap={3}>
      {/* Billing cycle selection toggle */}
      <BillingCycleSelector
        value={billingCycle}
        onChange={handleBillingCycleChange}
        discountPercentage={plans[3]?.annual_discount_percentage ?? 0}
        disabled={isReviewMode}
      />

      {/*  Available subscription plans */}
      <PlansGrid
        plans={plans}
        selectedPlan={selectedPlan}
        isReviewMode={isReviewMode}
        onPlanSelect={handlePlanSelect}
        formatPriceLabel={getPriceLabel}
      />

      {/* Branch count input when plan selected */}
      {selectedPlan && (
        <Flex flexDir="column"  p={6} bg="gray.50" borderRadius="lg">
          <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
            Branch Configuration
          </Text>
          
          <Flex flexDir={'column'} gap={2}>
            <NumberInputField 
              label="Number of Branches"
              value={branchCount.toString()}
              placeholder="Enter number of branches"
              isInValid={false}
              required={true}
              min={1}
              max={selectedPlan.included_branches_count}
              disabled={isReviewMode}
              onChange={(value) => onBranchCountChange(parseInt(value) || 1)}
            />
            <Flex flexDir={'column'} gap={2}>
              <Text fontSize="xs">
                You can add upto: 
                <Text as={'b'}> {selectedPlan.included_branches_count || 'Unlimited'} branches</Text>
              </Text>
              
              <Text fontSize="xs">
                Additional branches may incur extra charges based on your selected plan.
              </Text>
            </Flex>
          </Flex>
          
        </Flex>
      )}

      {/* Available plan add-ons */}
      <Box mt={8}>
        <AvailableAddonsGrid
          selectedPlan={selectedPlan}
          billingCycle={billingCycle}
          isReviewMode={isReviewMode}
          onAddonConfigure={handleAddonClick}
          onAddonRemove={removeAddon}
          isAddonSelected={isAddonSelected}
          getAddonSelection={getAddonSelection}
        />
        
        {/* Summary of selected addons */}
        <Box mt={6}>
          <SelectedAddonsSummary
            selectedAddons={selectedAddons}
            branchCount={branchCount}
            billingCycle={billingCycle}
            planDiscountPercentage={selectedPlan?.annual_discount_percentage || 0}
            onEdit={handleAddonEdit}
            onRemove={removeAddon}
            readOnly={isReviewMode}
          />
        </Box>
      </Box>

      {/*  Modal for configuring addon options */}
      <AddonSelectionModal
        isOpen={isAddonModalOpen}
        onClose={closeAddonModal}
        addon={currentAddon}
        branchCount={branchCount}
        billingCycle={billingCycle}
        planDiscountPercentage={selectedPlan?.annual_discount_percentage || 0}
        currentSelection={currentAddon ? getAddonSelection(currentAddon.id) : null}
        onSave={handleAddonSelection}
      />

      {/* Step navigation controls */}
      <Flex justify="space-between" pt={4}>
        {/* Previous step button */}
        <SecondaryButton onClick={onPrevious}>
          Back to Verification
        </SecondaryButton>
        
        {/* Continue/Complete button */}
        <PrimaryButton 
          onClick={handleContinue}
          loading={isPlanSubmitting}
          disabled={isPlanSubmitting}
        >
          {isPlanSubmitting ? 'Saving Plan...' : 'Continue with Selected Plan'}
        </PrimaryButton>
      </Flex>
    </Flex>
  )
}

export default PlanSelectionStep