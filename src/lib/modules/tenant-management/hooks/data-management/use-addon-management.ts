"use client"

/* Libraries imports */
import { useState, useCallback, useEffect } from 'react'

/* Plan management module imports */
import { Addon } from '@plan-management/types'

/* Tenant module imports */
import { AddonBranchSelection, SelectedAddon, CachedPlanData, PlanBillingCycle } from '@tenant-management/types/subscription'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

/* Addon selection and configuration management hook */
export const useAddonManagement = () => {
  /* Selected addons with branch configurations */
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([])
  /* Currently viewed addon in modal */
  const [currentAddon, setCurrentAddon] = useState<Addon | null>(null)
  /* Addon modal visibility state */
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)

  /* Load addon data from localStorage with error handling */
  const loadAddonDataFromStorage = useCallback(() => {
    try {
      const savedPlanData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA)
      
      if (savedPlanData) {
        const planData: CachedPlanData = JSON.parse(savedPlanData)
        console.log('Found plan data:', planData)
        
        if (planData.selectedAddons && Array.isArray(planData.selectedAddons)) {
          setSelectedAddons(planData.selectedAddons)
          console.log('Loaded addons:', planData.selectedAddons)
        } else {
          console.log('No selectedAddons found, clearing')
          setSelectedAddons([])
        }
      } else {
        console.log('No plan data found, clearing addons')
        setSelectedAddons([])
      }
    } catch (error) {
      console.warn('Failed to load addons from localStorage', error)
      setSelectedAddons([])
    }
  }, [])

  /* Load saved addon selections from localStorage */
  useEffect(() => {
    loadAddonDataFromStorage()
  }, [loadAddonDataFromStorage])

  /* Refresh addon data from localStorage */
  const refreshAddonData = useCallback(() => {
    loadAddonDataFromStorage()
  }, [loadAddonDataFromStorage])

  /* Open addon configuration modal */
  const openAddonModal = useCallback((addon: Addon) => {
    setCurrentAddon(addon)
    setIsAddonModalOpen(true)
  }, [])

  /* Close addon modal and clear state */
  const closeAddonModal = useCallback(() => {
    setIsAddonModalOpen(false)
    setCurrentAddon(null)
  }, [])

  /* Process addon selection with branch assignments */
  const handleAddonSelection = useCallback((addon: Addon, branchSelections: AddonBranchSelection[]) => {
    /* Find existing addon for update or create new */
    const existingIndex = selectedAddons.findIndex(sa => sa.addon_id === addon.id)
    
    /* Build addon selection object */
    const newSelectedAddon: SelectedAddon = {
      addon_id: addon.id,
      addon_name: addon.name,
      addon_price: addon.addon_price,
      pricing_scope: addon.pricing_scope,
      branches: addon.pricing_scope === 'organization' ? [] : branchSelections,
      is_included: addon.is_included
    }
    
    /* Update or add addon selection */
    setSelectedAddons(prev => {
      if (existingIndex >= 0) {
        return prev.map((sa, index) => index === existingIndex ? newSelectedAddon : sa)
      }
      return [...prev, newSelectedAddon]
    })
    
    closeAddonModal()
  }, [selectedAddons, closeAddonModal])

  /* Remove addon from selections */
  const removeAddon = useCallback((addonId: number) => {
    setSelectedAddons(prev => prev.filter(sa => sa.addon_id !== addonId))
  }, [])

  /* Check if addon is properly selected */
  const isAddonSelected = useCallback((addonId: number) => {
    return selectedAddons.some(sa => {
      if (sa.addon_id === addonId) {
        /* Organization addons are always valid */
        if (sa.pricing_scope === 'organization') return true
        /* Branch addons need at least one branch */
        return sa.branches.some(b => b.isSelected)
      }
      return false
    })
  }, [selectedAddons])

  /* Get addon selection details */
  const getAddonSelection = useCallback((addonId: number) => {
    return selectedAddons.find(sa => sa.addon_id === addonId) || null
  }, [selectedAddons])

  /* Calculate individual addon cost with proper billing cycle and discount logic */
  const calculateSingleAddonCost = useCallback((
    addon: SelectedAddon,
    billingCycle: PlanBillingCycle = 'monthly',
    annualDiscountPercentage: number = 0
  ) => {
    if (addon.is_included) return 0
    
    const isYearly = billingCycle === 'yearly'
    const discount = annualDiscountPercentage / 100
    
    /* Calculate addon price with billing cycle and discount */
    const price = isYearly 
      ? Math.floor(addon.addon_price * 12 * (1 - discount))
      : addon.addon_price
    
    /* Apply pricing scope multiplier */
    if (addon.pricing_scope === 'organization') {
      return price
    } else {
      /* Branch-scoped: multiply by number of selected branches */
      const selectedBranchCount = addon.branches.filter(b => b.isSelected).length
      return price * selectedBranchCount
    }
  }, [])

  /* Calculate total addon cost with proper billing cycle and discount logic */
  const getTotalAddonCost = useCallback((
    billingCycle: PlanBillingCycle = 'monthly',
    annualDiscountPercentage: number = 0
  ) => {
    return selectedAddons.reduce((total, addon) => {
      return total + calculateSingleAddonCost(addon, billingCycle, annualDiscountPercentage)
    }, 0)
  }, [selectedAddons, calculateSingleAddonCost])

  return {
    selectedAddons,
    setSelectedAddons,
    currentAddon,
    isAddonModalOpen,
    openAddonModal,
    closeAddonModal,
    handleAddonSelection,
    removeAddon,
    isAddonSelected,
    getAddonSelection,
    calculateSingleAddonCost,
    getTotalAddonCost,
    refreshAddonData
  }
}