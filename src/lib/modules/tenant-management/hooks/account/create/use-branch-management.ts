"use client"

import { useState, useCallback, useEffect } from 'react'
import { AddonBranchSelection, SelectedAddon } from '@tenant-management/types'

export const useBranchManagement = () => {
  /* Track number of branches for addon selections */
  const [branchCount, setBranchCount] = useState<number>(1)

  /* Restore branch count from localStorage on mount */
  useEffect(() => {
    try {
      const savedPlanData = localStorage.getItem('selected_plan')
      if (savedPlanData) {
        const planData = JSON.parse(savedPlanData)
        if (planData.branchCount) {
          setBranchCount(planData.branchCount)
        }
      }
    } catch (error) {
      console.warn('Failed to restore branch count from localStorage:', error)
    }
  }, [])

  /* Create branch selection array with default unselected state */
  const createBranchSelections = useCallback((count: number): AddonBranchSelection[] => {
    return Array.from({ length: count }, (_, index) => ({
      branchIndex: index,
      isSelected: false
    }))
  }, [])

  /* Update addon branches when branch count changes */
  const updateAddonBranches = useCallback((addons: SelectedAddon[], newBranchCount: number): SelectedAddon[] => {
    return addons.map(addon => {
      const updatedBranches = [...addon.branches]
      
      /* Add branches if count increased */
      while (updatedBranches.length < newBranchCount) {
        updatedBranches.push({
          branchIndex: updatedBranches.length,
          isSelected: false
        })
      }
      
      /* Remove branches if count decreased */
      if (updatedBranches.length > newBranchCount) {
        updatedBranches.splice(newBranchCount)
      }
      
      return { ...addon, branches: updatedBranches }
    })
  }, [])

  /* Handle branch count changes and update addons accordingly */
  const handleBranchCountChange = useCallback((
    value: number,
    setSelectedAddons: React.Dispatch<React.SetStateAction<SelectedAddon[]>>
  ) => {
    /* Ensure minimum of 1 branch */
    const newBranchCount = Math.max(1, value)
    setBranchCount(newBranchCount)
    
    /* Update all selected addons with new branch count */
    setSelectedAddons(prev => updateAddonBranches(prev, newBranchCount))
  }, [updateAddonBranches])

  return {
    branchCount,
    setBranchCount,
    createBranchSelections,
    updateAddonBranches,
    handleBranchCountChange
  }
}