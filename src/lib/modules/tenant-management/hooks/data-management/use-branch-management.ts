"use client"

/* Libraries imports */
import { useState, useCallback, useEffect } from 'react'

/* Tenant module imports */
import { BranchSelection, CachedPlanData, SelectedAddon } from '@tenant-management/types/subscription'
import { MAX_BRANCH_COUNT, TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

/* Branch configuration and management hook */
export const useBranchManagement = () => {
  /* Number of branches for addon assignments */
  const [branchCount, setBranchCount] = useState<number>(1)
  /* Branch details with custom names */
  const [branches, setBranches] = useState<BranchSelection[]>([{ branchIndex: 0, branchName: 'Branch 1', isSelected: false }])

  /* Apply safe count limits to prevent memory issues */
  const getSafeCount = useCallback((count: number, minimum: number = 0): number => {
    return Math.min(Math.max(minimum, count), MAX_BRANCH_COUNT)
  }, [])

  /* Generate branch object with default properties */
  const createBranchObject = useCallback((index: number, customName?: string): BranchSelection => ({
    branchIndex: index,
    branchName: customName || `Branch ${index + 1}`,
    isSelected: false
  }), [])

  /* Generate branch selections with default state */
  const createBranchSelections = useCallback((count: number): BranchSelection[] => {
    const safeCount = getSafeCount(count)
    return Array.from({ length: safeCount }, (_, index) => createBranchObject(index))
  }, [getSafeCount, createBranchObject])

  /* Load saved branch configuration from localStorage */
  useEffect(() => {
    try {
      const savedPlanData = localStorage.getItem(TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA)
      if (savedPlanData) {
        const planData: CachedPlanData = JSON.parse(savedPlanData)
        if (planData.branchCount) {
          setBranchCount(planData.branchCount)
        }
        if (planData.branches && Array.isArray(planData.branches)) {
          setBranches(planData.branches)
        } else if (planData.branchCount) {
          /* Generate default branches using helper */
          setBranches(createBranchSelections(planData.branchCount))
        }
      }
    } catch (error) {
      console.warn('Failed to restore branch data from localStorage:', error)
    }
  }, [createBranchSelections])

  /* Sync addon branches with count changes */
  const updateAddonBranches = useCallback((addons: SelectedAddon[], newBranchCount: number, branchList: BranchSelection[]): SelectedAddon[] => {
    const safeBranchCount = getSafeCount(newBranchCount)
    
    return addons.map(addon => {
      const updatedBranches = [...addon.branches]
      
      /* Add branches for increased count */
      while (updatedBranches.length < safeBranchCount && updatedBranches.length < MAX_BRANCH_COUNT) {
        const branchIndex = updatedBranches.length
        const branchInfo = branchList.find(b => b.branchIndex === branchIndex)
        updatedBranches.push(createBranchObject(branchIndex, branchInfo?.branchName))
      }
      
      /* Remove branches for decreased count */
      if (updatedBranches.length > safeBranchCount) {
        updatedBranches.splice(safeBranchCount)
      }
      
      return { ...addon, branches: updatedBranches }
    })
  }, [getSafeCount, createBranchObject])

  /* Process branch count changes and sync addons */
  const handleBranchCountChange = useCallback((
    value: number,
    setSelectedAddons?: React.Dispatch<React.SetStateAction<SelectedAddon[]>>
  ) => {
    const newBranchCount = getSafeCount(value, 1)
    setBranchCount(newBranchCount)
    
    /* Update branch list to match new count */
    setBranches(prev => {
      const updatedBranches = [...prev]
      
      /* Add branches for increased count */
      while (updatedBranches.length < newBranchCount) {
        updatedBranches.push(createBranchObject(updatedBranches.length))
      }
      
      /* Remove branches for decreased count */
      if (updatedBranches.length > newBranchCount) {
        updatedBranches.splice(newBranchCount)
      }
      
      /* Sync selected addons if setter provided */
      if (setSelectedAddons) {
        setSelectedAddons(prevAddons => updateAddonBranches(prevAddons, newBranchCount, updatedBranches))
      }
      
      return updatedBranches
    })
  }, [getSafeCount, createBranchObject, updateAddonBranches])

  /* Update branch names across all selections */
  const handleBranchNameChange = useCallback((
    branchIndex: number, 
    newName: string, 
    setSelectedAddons: React.Dispatch<React.SetStateAction<SelectedAddon[]>>
  ) => {
    /* Update branch list */
    setBranches(prev => 
      prev.map(branch => 
        branch.branchIndex === branchIndex 
          ? { ...branch, branchName: newName }
          : branch
      )
    )

    /* Update branch names in addon selections */
    setSelectedAddons(prevAddons => 
      prevAddons.map(addon => ({
        ...addon,
        branches: addon.branches.map(branch => 
          branch.branchIndex === branchIndex
            ? { ...branch, branchName: newName }
            : branch
        )
      }))
    )
  }, [])

  return {
    branchCount,
    branches,
    setBranchCount,
    setBranches,
    createBranchSelections,
    updateAddonBranches,
    handleBranchCountChange,
    handleBranchNameChange
  }
}