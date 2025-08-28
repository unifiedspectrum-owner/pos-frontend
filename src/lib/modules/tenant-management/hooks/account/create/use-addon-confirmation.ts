import { useState, useCallback } from 'react'
import { SelectedAddon } from '@tenant-management/types'

interface AddonConfirmationState {
  show: boolean
  addonId?: number
  addonName?: string
  action?: 'remove' | 'unselect'
}

export const useAddonConfirmation = () => {
  const [confirmState, setConfirmState] = useState<AddonConfirmationState>({
    show: false
  })

  const showRemoveConfirmation = useCallback((addon: SelectedAddon) => {
    setConfirmState({
      show: true,
      addonId: addon.addonId,
      addonName: addon.addonName,
      action: 'remove'
    })
  }, [])

  const showUnselectConfirmation = useCallback((addon: SelectedAddon) => {
    setConfirmState({
      show: true,
      addonId: addon.addonId,
      addonName: addon.addonName,
      action: 'unselect'
    })
  }, [])

  const showRemoveConfirmationById = useCallback((addonId: number, addonName: string) => {
    setConfirmState({
      show: true,
      addonId,
      addonName,
      action: 'remove'
    })
  }, [])

  const hideConfirmation = useCallback(() => {
    setConfirmState({ show: false })
  }, [])

  const getConfirmationMessage = () => {
    if (!confirmState.addonName) return ''
    
    if (confirmState.action === 'remove') {
      return `Are you sure you want to remove "${confirmState.addonName}" from your plan? This will remove all configuration settings for this add-on.`
    } else {
      return `Are you sure you want to unselect "${confirmState.addonName}"? Your current branch configuration will be lost.`
    }
  }

  const getConfirmationTitle = () => {
    return confirmState.action === 'remove' ? 'Remove Add-on' : 'Unselect Add-on'
  }

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