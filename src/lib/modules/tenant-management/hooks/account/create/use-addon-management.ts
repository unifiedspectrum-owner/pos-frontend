import { useState, useCallback } from 'react'
import { Addon } from '@/lib/modules/plan-management/types/plans'
import { calculateTotalSelectedAddonsCost } from '@tenant-management/utils/pricing-helpers'
import { AddonBranchSelection, SelectedAddon } from '@tenant-management/types'

export const useAddonManagement = () => {
  /* Track currently selected addons with branch configurations */
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([])
  /* Track addon being viewed/configured in modal */
  const [currentAddon, setCurrentAddon] = useState<Addon | null>(null)
  /* Control addon selection modal visibility */
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)

  /* Open modal with specific addon for configuration */
  const openAddonModal = useCallback((addon: Addon) => {
    setCurrentAddon(addon)
    setIsAddonModalOpen(true)
  }, [])

  /* Close modal and clear current addon */
  const closeAddonModal = useCallback(() => {
    setIsAddonModalOpen(false)
    setCurrentAddon(null)
  }, [])

  /* Handle addon selection with branch configuration */
  const handleAddonSelection = useCallback((addon: Addon, branchSelections: AddonBranchSelection[]) => {
    /* Check if addon already exists to update or add new */
    const existingIndex = selectedAddons.findIndex(sa => sa.addonId === addon.id)
    
    /* Create selected addon object with branch data */
    const newSelectedAddon: SelectedAddon = {
      addonId: addon.id,
      addonName: addon.name,
      addonPrice: addon.add_on_price,
      pricingScope: addon.pricing_scope,
      branches: addon.pricing_scope === 'organization' ? [] : branchSelections,
      isIncluded: addon.is_included
    }
    
    /* Update existing addon or add new one */
    setSelectedAddons(prev => {
      if (existingIndex >= 0) {
        return prev.map((sa, index) => index === existingIndex ? newSelectedAddon : sa)
      }
      return [...prev, newSelectedAddon]
    })
    
    closeAddonModal()
  }, [selectedAddons, closeAddonModal])

  /* Remove addon from selection */
  const removeAddon = useCallback((addonId: number) => {
    setSelectedAddons(prev => prev.filter(sa => sa.addonId !== addonId))
  }, [])

  /* Check if addon is selected with valid configuration */
  const isAddonSelected = useCallback((addonId: number) => {
    return selectedAddons.some(sa => {
      if (sa.addonId === addonId) {
        /* Organization-scoped addons don't need branch selections */
        if (sa.pricingScope === 'organization') return true
        /* Branch-scoped addons need at least one branch selected */
        return sa.branches.some(b => b.isSelected)
      }
      return false
    })
  }, [selectedAddons])

  /* Get specific addon selection data */
  const getAddonSelection = useCallback((addonId: number) => {
    return selectedAddons.find(sa => sa.addonId === addonId) || null
  }, [selectedAddons])

  /* Calculate total cost of all selected addons */
  const getTotalAddonCost = useCallback(() => {
    return calculateTotalSelectedAddonsCost(selectedAddons)
  }, [selectedAddons])

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
    getTotalAddonCost
  }
}