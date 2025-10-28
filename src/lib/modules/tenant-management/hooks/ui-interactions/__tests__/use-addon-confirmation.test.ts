/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'

/* Tenant module imports */
import { useAddonConfirmation } from '../use-addon-confirmation'
import { SelectedAddon } from '@tenant-management/types'

describe('useAddonConfirmation', () => {
  const mockSelectedAddon: SelectedAddon = {
    addon_id: 1,
    addon_name: 'Advanced Reporting',
    addon_price: 50,
    pricing_scope: 'organization',
    branches: [],
    is_included: false
  }

  const mockSelectedAddon2: SelectedAddon = {
    addon_id: 2,
    addon_name: 'Extra Storage',
    addon_price: 75,
    pricing_scope: 'branch',
    branches: [],
    is_included: false
  }

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      expect(result.current.confirmState.show).toBe(false)
      expect(result.current.confirmState.addonId).toBeUndefined()
      expect(result.current.confirmState.addonName).toBeUndefined()
      expect(result.current.confirmState.action).toBeUndefined()
    })

    it('provides all expected functions', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      expect(typeof result.current.showRemoveConfirmation).toBe('function')
      expect(typeof result.current.showUnselectConfirmation).toBe('function')
      expect(typeof result.current.showRemoveConfirmationById).toBe('function')
      expect(typeof result.current.hideConfirmation).toBe('function')
      expect(typeof result.current.getConfirmationMessage).toBe('function')
      expect(typeof result.current.getConfirmationTitle).toBe('function')
      expect(typeof result.current.getConfirmText).toBe('function')
    })

    it('returns empty strings for message helpers when no addon name', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      expect(result.current.getConfirmationMessage()).toBe('')
    })
  })

  describe('showRemoveConfirmation', () => {
    it('sets confirmation state for remove action', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.addonId).toBe(1)
      expect(result.current.confirmState.addonName).toBe('Advanced Reporting')
      expect(result.current.confirmState.action).toBe('remove')
    })

    it('handles different addon objects', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon2)
      })

      expect(result.current.confirmState.addonId).toBe(2)
      expect(result.current.confirmState.addonName).toBe('Extra Storage')
      expect(result.current.confirmState.action).toBe('remove')
    })

    it('overwrites previous confirmation state', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.addonId).toBe(1)

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon2)
      })

      expect(result.current.confirmState.addonId).toBe(2)
      expect(result.current.confirmState.addonName).toBe('Extra Storage')
    })
  })

  describe('showUnselectConfirmation', () => {
    it('sets confirmation state for unselect action', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showUnselectConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.addonId).toBe(1)
      expect(result.current.confirmState.addonName).toBe('Advanced Reporting')
      expect(result.current.confirmState.action).toBe('unselect')
    })

    it('handles different addon objects', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showUnselectConfirmation(mockSelectedAddon2)
      })

      expect(result.current.confirmState.addonId).toBe(2)
      expect(result.current.confirmState.addonName).toBe('Extra Storage')
      expect(result.current.confirmState.action).toBe('unselect')
    })

    it('changes action from remove to unselect', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.action).toBe('remove')

      act(() => {
        result.current.showUnselectConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.action).toBe('unselect')
    })
  })

  describe('showRemoveConfirmationById', () => {
    it('sets confirmation state with provided ID and name', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmationById(3, 'Premium Analytics')
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.addonId).toBe(3)
      expect(result.current.confirmState.addonName).toBe('Premium Analytics')
      expect(result.current.confirmState.action).toBe('remove')
    })

    it('handles numeric IDs correctly', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmationById(999, 'Test Addon')
      })

      expect(result.current.confirmState.addonId).toBe(999)
    })

    it('handles empty addon name', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmationById(1, '')
      })

      expect(result.current.confirmState.addonName).toBe('')
      expect(result.current.confirmState.show).toBe(true)
    })
  })

  describe('hideConfirmation', () => {
    it('hides confirmation dialog', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.show).toBe(true)

      act(() => {
        result.current.hideConfirmation()
      })

      expect(result.current.confirmState.show).toBe(false)
    })

    it('resets all confirmation state', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.addonId).toBe(1)
      expect(result.current.confirmState.addonName).toBe('Advanced Reporting')

      act(() => {
        result.current.hideConfirmation()
      })

      expect(result.current.confirmState.show).toBe(false)
      expect(result.current.confirmState.addonId).toBeUndefined()
      expect(result.current.confirmState.addonName).toBeUndefined()
      expect(result.current.confirmState.action).toBeUndefined()
    })

    it('can be called multiple times', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.hideConfirmation()
        result.current.hideConfirmation()
      })

      expect(result.current.confirmState.show).toBe(false)
    })
  })

  describe('getConfirmationMessage', () => {
    it('returns remove message for remove action', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      const message = result.current.getConfirmationMessage()
      expect(message).toContain('Advanced Reporting')
      expect(message).toContain('remove')
      expect(message).toContain('configuration settings')
    })

    it('returns unselect message for unselect action', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showUnselectConfirmation(mockSelectedAddon)
      })

      const message = result.current.getConfirmationMessage()
      expect(message).toContain('Advanced Reporting')
      expect(message).toContain('unselect')
      expect(message).toContain('branch configuration')
    })

    it('returns empty string when no addon name', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      const message = result.current.getConfirmationMessage()
      expect(message).toBe('')
    })

    it('includes addon name in quotes', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      const message = result.current.getConfirmationMessage()
      expect(message).toMatch(/"Advanced Reporting"/)
    })

    it('handles different addon names', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon2)
      })

      const message = result.current.getConfirmationMessage()
      expect(message).toContain('Extra Storage')
    })
  })

  describe('getConfirmationTitle', () => {
    it('returns Remove Add-on for remove action', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.getConfirmationTitle()).toBe('Remove Add-on')
    })

    it('returns Unselect Add-on for unselect action', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showUnselectConfirmation(mockSelectedAddon)
      })

      expect(result.current.getConfirmationTitle()).toBe('Unselect Add-on')
    })

    it('returns Unselect Add-on when action is undefined', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      /* Title defaults to unselect when no action set (else branch of ternary) */
      expect(result.current.getConfirmationTitle()).toBe('Unselect Add-on')
    })
  })

  describe('getConfirmText', () => {
    it('returns Remove for remove action', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.getConfirmText()).toBe('Remove')
    })

    it('returns Unselect for unselect action', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showUnselectConfirmation(mockSelectedAddon)
      })

      expect(result.current.getConfirmText()).toBe('Unselect')
    })

    it('returns Unselect when action is undefined', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      /* Text defaults to unselect when no action set (else branch of ternary) */
      expect(result.current.getConfirmText()).toBe('Unselect')
    })
  })

  describe('State Transitions', () => {
    it('transitions from remove to unselect', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.action).toBe('remove')
      expect(result.current.getConfirmationTitle()).toBe('Remove Add-on')

      act(() => {
        result.current.showUnselectConfirmation(mockSelectedAddon2)
      })

      expect(result.current.confirmState.action).toBe('unselect')
      expect(result.current.getConfirmationTitle()).toBe('Unselect Add-on')
    })

    it('transitions from shown to hidden', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.show).toBe(true)

      act(() => {
        result.current.hideConfirmation()
      })

      expect(result.current.confirmState.show).toBe(false)
    })

    it('can show confirmation again after hiding', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      act(() => {
        result.current.hideConfirmation()
      })

      act(() => {
        result.current.showUnselectConfirmation(mockSelectedAddon2)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.addonName).toBe('Extra Storage')
    })
  })

  describe('Edge Cases', () => {
    it('handles addon with special characters in name', () => {
      const specialAddon: SelectedAddon = {
        addon_id: 99,
        addon_name: "Premium & Advanced \"Analytics\"",
        addon_price: 100,
        pricing_scope: 'organization',
        branches: [],
        is_included: false
      }

      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(specialAddon)
      })

      const message = result.current.getConfirmationMessage()
      expect(message).toContain('Premium & Advanced "Analytics"')
    })

    it('handles addon ID of 0', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmationById(0, 'Zero ID Addon')
      })

      expect(result.current.confirmState.addonId).toBe(0)
    })

    it('handles very long addon names', () => {
      const longName = 'A'.repeat(200)
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmationById(1, longName)
      })

      expect(result.current.confirmState.addonName).toBe(longName)
      expect(result.current.getConfirmationMessage()).toContain(longName)
    })

    it('handles rapid state changes', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
        result.current.showUnselectConfirmation(mockSelectedAddon2)
        result.current.hideConfirmation()
        result.current.showRemoveConfirmationById(3, 'Final Addon')
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.confirmState.addonId).toBe(3)
      expect(result.current.confirmState.addonName).toBe('Final Addon')
      expect(result.current.confirmState.action).toBe('remove')
    })
  })

  describe('Callback Stability', () => {
    it('maintains stable function references', () => {
      const { result, rerender } = renderHook(() => useAddonConfirmation())

      const {
        showRemoveConfirmation: fn1,
        showUnselectConfirmation: fn2,
        showRemoveConfirmationById: fn3,
        hideConfirmation: fn4
      } = result.current

      rerender()

      expect(result.current.showRemoveConfirmation).toBe(fn1)
      expect(result.current.showUnselectConfirmation).toBe(fn2)
      expect(result.current.showRemoveConfirmationById).toBe(fn3)
      expect(result.current.hideConfirmation).toBe(fn4)
    })
  })

  describe('Complete Workflow', () => {
    it('completes full remove addon workflow', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      /* Initial state */
      expect(result.current.confirmState.show).toBe(false)

      /* User clicks remove on addon */
      act(() => {
        result.current.showRemoveConfirmation(mockSelectedAddon)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.getConfirmationTitle()).toBe('Remove Add-on')
      expect(result.current.getConfirmText()).toBe('Remove')
      expect(result.current.getConfirmationMessage()).toContain('remove')

      /* User confirms or cancels */
      act(() => {
        result.current.hideConfirmation()
      })

      expect(result.current.confirmState.show).toBe(false)
    })

    it('completes full unselect addon workflow', () => {
      const { result } = renderHook(() => useAddonConfirmation())

      /* User clicks unselect on addon */
      act(() => {
        result.current.showUnselectConfirmation(mockSelectedAddon2)
      })

      expect(result.current.confirmState.show).toBe(true)
      expect(result.current.getConfirmationTitle()).toBe('Unselect Add-on')
      expect(result.current.getConfirmText()).toBe('Unselect')
      expect(result.current.getConfirmationMessage()).toContain('unselect')

      /* User confirms or cancels */
      act(() => {
        result.current.hideConfirmation()
      })

      expect(result.current.confirmState.show).toBe(false)
    })
  })
})
