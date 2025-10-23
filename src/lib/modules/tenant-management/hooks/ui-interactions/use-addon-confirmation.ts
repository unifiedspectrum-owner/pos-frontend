"use client"

/* Libraries imports */
import { useState, useCallback } from 'react'

/* Tenant module imports */
import { SelectedAddon } from '@tenant-management/types'

/* Addon confirmation dialog state interface */
interface AddonConfirmationState {
  show: boolean
  addonId?: number
  addonName?: string
  action?: 'remove' | 'unselect'
}

/* Addon confirmation dialog management hook */
export const useAddonConfirmation = () => {
  /* Confirmation dialog state */
  const [confirmState, setConfirmState] = useState<AddonConfirmationState>({
    show: false
  })

  /* Show remove confirmation for selected addon */
  const showRemoveConfirmation = useCallback((addon: SelectedAddon) => {
    setConfirmState({
      show: true,
      addonId: addon.addon_id,
      addonName: addon.addon_name,
      action: 'remove'
    })
  }, [])

  /* Show unselect confirmation for addon */
  const showUnselectConfirmation = useCallback((addon: SelectedAddon) => {
    setConfirmState({
      show: true,
      addonId: addon.addon_id,
      addonName: addon.addon_name,
      action: 'unselect'
    })
  }, [])

  /* Show remove confirmation by addon ID and name */
  const showRemoveConfirmationById = useCallback((addonId: number, addonName: string) => {
    setConfirmState({
      show: true,
      addonId,
      addonName,
      action: 'remove'
    })
  }, [])

  /* Hide confirmation dialog */
  const hideConfirmation = useCallback(() => {
    setConfirmState({ show: false })
  }, [])

  /* Generate confirmation message based on action */
  const getConfirmationMessage = () => {
    if (!confirmState.addonName) return ''
    
    if (confirmState.action === 'remove') {
      return `Are you sure you want to remove "${confirmState.addonName}" from your plan? This will remove all configuration settings for this add-on.`
    } else {
      return `Are you sure you want to unselect "${confirmState.addonName}"? Your current branch configuration will be lost.`
    }
  }

  /* Get confirmation dialog title */
  const getConfirmationTitle = () => {
    return confirmState.action === 'remove' ? 'Remove Add-on' : 'Unselect Add-on'
  }

  /* Get confirm button text */
  const getConfirmText = () => {
    return confirmState.action === 'remove' ? 'Remove' : 'Unselect'
  }

  return {
    confirmState,
    showRemoveConfirmation,
    showUnselectConfirmation,
    showRemoveConfirmationById,
    hideConfirmation,
    getConfirmationMessage,
    getConfirmationTitle,
    getConfirmText
  }
}