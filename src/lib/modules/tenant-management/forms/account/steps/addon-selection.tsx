/* React and Chakra UI component imports */
import React, { useState, useCallback, useEffect } from 'react'
import { Box, Flex } from '@chakra-ui/react'


/* Plan module imports */
import { Addon, Plan } from '@plan-management/types/plans'

/* Tenant module imports */
import { AddonSelectionModal, SelectedAddonsSummary, AvailableAddonsGrid, NavigationButton } from './components'
import { useBranchManagement, useAddonManagement } from '@tenant-management/hooks'
import { usePlanStorage } from '@tenant-management/hooks/account/creation'
import { PlanBillingCycle, AddonBranchSelection, CachedPlanData } from '@tenant-management/types'
import { StepTracker } from '@tenant-management/utils/workflow'
import { PRIMARY_COLOR, WHITE_COLOR } from '@/lib/shared/config'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '../../../constants'

/* Props interface for addon selection step component */
interface AddonSelectionStepProps {
  isCompleted: (completed: boolean) => void
  onPrevious: () => void
}

/* Addon selection step component for tenant account creation */
const AddonSelectionStep: React.FC<AddonSelectionStepProps> = ({
  isCompleted, 
  onPrevious
}) => {
  /* State management for current selections */
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [billingCycle, setBillingCycle] = useState<PlanBillingCycle>('monthly')

  /* Custom hooks for data fetching and management */
  const { branchCount, branches, handleBranchNameChange } = useBranchManagement()
  
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
    isAddonSelected, getAddonSelection,
    
    /* Data management */
    refreshAddonData
  } = useAddonManagement()

  /* Plan storage hook for API submission */
  const { 
    isSubmitting, 
    assignPlanToTenant 
  } = usePlanStorage()

  /* Restore previously selected plan data from localStorage */
  useEffect(() => {
    try {
      const savedPlanData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA)
      if (savedPlanData) {
        const planData = JSON.parse(savedPlanData)
        setSelectedPlan(planData.selectedPlan)
        setBillingCycle(planData.billingCycle)
        
        /* Also restore selected addons to prevent empty state after API calls */
        if (planData.selectedAddons && Array.isArray(planData.selectedAddons)) {
          setSelectedAddons(planData.selectedAddons)
        }
      }
    } catch (error) {
      console.warn('Failed to restore plan data from localStorage:', error)
    }
  }, [setSelectedAddons])

  /* Save addon data to localStorage whenever it changes */
  const saveAddonDataToLocalStorage = useCallback(() => {
    if (!selectedPlan) return

    const planData: CachedPlanData = {
      selectedPlan,
      billingCycle,
      branchCount,
      branches,
      selectedAddons,
    }

    try {
      localStorage.setItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA, JSON.stringify(planData))
    } catch (error) {
      console.warn('Failed to save addon data to localStorage:', error)
    }
  }, [selectedPlan, billingCycle, branchCount, branches, selectedAddons])

  /* Auto-save addon data whenever selectedAddons changes */
  useEffect(() => {
    if (selectedPlan) {
      saveAddonDataToLocalStorage()
    }
  }, [selectedAddons, saveAddonDataToLocalStorage, selectedPlan])

  /* Enhanced branch name handler that updates addon selections and saves to localStorage */
  const onBranchNameChange = useCallback((branchIndex: number, newName: string) => {
    handleBranchNameChange(branchIndex, newName, setSelectedAddons)
    /* Data will be auto-saved via useEffect above */
  }, [handleBranchNameChange, setSelectedAddons])

  /* Handle addon configuration modal opening */
  const handleAddonClick = useCallback((addon: Addon) => {
    if (addon.is_included) return
    openAddonModal(addon)
  }, [openAddonModal])

  /* Enhanced addon removal handler that auto-saves changes */
  const handleAddonRemove = useCallback((addonId: number) => {
    removeAddon(addonId)
    /* Data will be auto-saved via useEffect above */
  }, [removeAddon])

  /* Enhanced addon selection handler that auto-saves changes */
  const handleAddonSelectionWithSave = useCallback((addon: Addon, branchSelections: AddonBranchSelection[]) => {
    handleAddonSelection(addon, branchSelections)
    /* Data will be auto-saved via useEffect above */
  }, [handleAddonSelection])

  /* Handle editing addon from summary by finding it in selected plan */
  const handleAddonEdit = useCallback((addonId: number) => {
    const addon = selectedPlan?.add_ons.find(a => a.id === addonId)
    if (addon) {
      handleAddonClick(addon)
    }
  }, [selectedPlan, handleAddonClick])

  /* Save addon selections to localStorage, assign to API, and complete step */
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
        /* Refresh addon data to ensure UI stays in sync after API call */
        refreshAddonData()
        
        /* After API success, mark step as completed */
        StepTracker.markStepCompleted('ADDON_SELECTION')
        isCompleted(true)
      }
    } catch (error) {
      console.error('Failed to save addon data or assign plan:', error)
      /* Don't proceed if API fails */
    }
  }, [selectedPlan, billingCycle, branchCount, branches, selectedAddons, assignPlanToTenant, refreshAddonData, isCompleted])

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
      {/* Available plan add-ons */}
      <Box>
        <AvailableAddonsGrid
          selectedPlan={selectedPlan}
          billingCycle={billingCycle}
          onAddonConfigure={handleAddonClick}
          onAddonRemove={handleAddonRemove}
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
            onRemove={handleAddonRemove}
            onBranchNameChange={onBranchNameChange}
          />
        </Box>
      </Box>

      {/* Modal for configuring addon options */}
      <AddonSelectionModal
        isOpen={isAddonModalOpen}
        onClose={closeAddonModal}
        addon={currentAddon}
        branchCount={branchCount}
        billingCycle={billingCycle}
        planDiscountPercentage={selectedPlan?.annual_discount_percentage || 0}
        currentSelection={currentAddon ? getAddonSelection(currentAddon.id) : null}
        onSave={handleAddonSelectionWithSave}
      />

      {/* Step navigation controls */}
      <NavigationButton
        secondaryBtnText="Back to Plan Selection"
        onSecondaryClick={onPrevious}
        primaryBtnText="Continue to Summary"
        primaryBtnLoadingText="Assigning Plan..."
        onPrimaryClick={handleContinue}
        primaryBtnDisabled={isSubmitting}
        isPrimaryBtnLoading={isSubmitting}
      />
    </Flex>
  )
}

export default AddonSelectionStep