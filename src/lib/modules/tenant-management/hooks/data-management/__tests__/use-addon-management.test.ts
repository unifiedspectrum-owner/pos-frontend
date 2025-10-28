/* Libraries imports */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

/* Tenant module imports */
import { useAddonManagement } from '../use-addon-management'
import { Addon } from '@plan-management/types'
import { SelectedAddon, AddonBranchSelection } from '@tenant-management/types'
import { TENANT_ACCOUNT_CREATION_LS_KEYS } from '@tenant-management/constants'

describe('useAddonManagement', () => {
  const mockAddon: Addon = {
    id: 1,
    name: 'Advanced Reporting',
    description: 'Advanced reporting features',
    addon_price: 50,
    pricing_scope: 'organization',
    default_quantity: null,
    is_included: false,
    feature_level: null,
    min_quantity: null,
    max_quantity: null,
    display_order: 1
  }

  const mockBranchAddon: Addon = {
    id: 2,
    name: 'Extra Storage',
    description: 'Additional storage',
    addon_price: 30,
    pricing_scope: 'branch',
    default_quantity: null,
    is_included: false,
    feature_level: null,
    min_quantity: null,
    max_quantity: null,
    display_order: 2
  }

  const mockBranchSelections: AddonBranchSelection[] = [
    { branchIndex: 0, branchName: 'Branch 1', isSelected: true },
    { branchIndex: 1, branchName: 'Branch 2', isSelected: false }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('Hook Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useAddonManagement())

      expect(result.current.selectedAddons).toEqual([])
      expect(result.current.currentAddon).toBe(null)
      expect(result.current.isAddonModalOpen).toBe(false)
    })

    it('loads addons from localStorage on mount', () => {
      const cachedData = {
        selectedAddons: [
          {
            addon_id: 1,
            addon_name: 'Test Addon',
            addon_price: 50,
            pricing_scope: 'organization' as const,
            branches: [],
            is_included: false
          }
        ]
      }

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(cachedData)
      )

      const { result } = renderHook(() => useAddonManagement())

      expect(result.current.selectedAddons).toEqual(cachedData.selectedAddons)
    })

    it('handles missing localStorage data', () => {
      const { result } = renderHook(() => useAddonManagement())

      expect(result.current.selectedAddons).toEqual([])
    })

    it('handles corrupted localStorage data', () => {
      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        'invalid json {'
      )

      const { result } = renderHook(() => useAddonManagement())

      expect(result.current.selectedAddons).toEqual([])
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('openAddonModal', () => {
    it('opens modal with selected addon', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.openAddonModal(mockAddon)
      })

      expect(result.current.isAddonModalOpen).toBe(true)
      expect(result.current.currentAddon).toEqual(mockAddon)
    })

    it('replaces current addon when opening new modal', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.openAddonModal(mockAddon)
      })

      expect(result.current.currentAddon?.id).toBe(1)

      act(() => {
        result.current.openAddonModal(mockBranchAddon)
      })

      expect(result.current.currentAddon?.id).toBe(2)
    })
  })

  describe('closeAddonModal', () => {
    it('closes modal and clears current addon', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.openAddonModal(mockAddon)
      })

      expect(result.current.isAddonModalOpen).toBe(true)

      act(() => {
        result.current.closeAddonModal()
      })

      expect(result.current.isAddonModalOpen).toBe(false)
      expect(result.current.currentAddon).toBe(null)
    })
  })

  describe('handleAddonSelection', () => {
    it('adds new organization addon', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.handleAddonSelection(mockAddon, [])
      })

      expect(result.current.selectedAddons).toHaveLength(1)
      expect(result.current.selectedAddons[0]).toMatchObject({
        addon_id: 1,
        addon_name: 'Advanced Reporting',
        addon_price: 50,
        pricing_scope: 'organization' as const,
        branches: [],
        is_included: false
      })
    })

    it('adds new branch addon with selections', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.handleAddonSelection(mockBranchAddon, mockBranchSelections)
      })

      expect(result.current.selectedAddons).toHaveLength(1)
      expect(result.current.selectedAddons[0]).toMatchObject({
        addon_id: 2,
        addon_name: 'Extra Storage',
        pricing_scope: 'branch' as const,
        branches: mockBranchSelections
      })
    })

    it('updates existing addon selection', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.handleAddonSelection(mockBranchAddon, [mockBranchSelections[0]])
      })

      expect(result.current.selectedAddons[0].branches).toHaveLength(1)

      act(() => {
        result.current.handleAddonSelection(mockBranchAddon, mockBranchSelections)
      })

      expect(result.current.selectedAddons).toHaveLength(1)
      expect(result.current.selectedAddons[0].branches).toHaveLength(2)
    })

    it('closes modal after selection', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.openAddonModal(mockAddon)
      })

      expect(result.current.isAddonModalOpen).toBe(true)

      act(() => {
        result.current.handleAddonSelection(mockAddon, [])
      })

      expect(result.current.isAddonModalOpen).toBe(false)
    })

    it('clears branches for organization addons', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.handleAddonSelection(mockAddon, mockBranchSelections)
      })

      expect(result.current.selectedAddons[0].branches).toEqual([])
    })
  })

  describe('removeAddon', () => {
    it('removes addon from selections', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.handleAddonSelection(mockAddon, [])
        result.current.handleAddonSelection(mockBranchAddon, mockBranchSelections)
      })

      expect(result.current.selectedAddons).toHaveLength(2)

      act(() => {
        result.current.removeAddon(1)
      })

      expect(result.current.selectedAddons).toHaveLength(1)
      expect(result.current.selectedAddons[0].addon_id).toBe(2)
    })

    it('handles removing non-existent addon', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.removeAddon(999)
      })

      expect(result.current.selectedAddons).toEqual([])
    })
  })

  describe('isAddonSelected', () => {
    it('returns true for selected organization addon', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.handleAddonSelection(mockAddon, [])
      })

      expect(result.current.isAddonSelected(1)).toBe(true)
    })

    it('returns true for branch addon with selected branches', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.handleAddonSelection(mockBranchAddon, mockBranchSelections)
      })

      expect(result.current.isAddonSelected(2)).toBe(true)
    })

    it('returns false for branch addon with no selected branches', () => {
      const { result } = renderHook(() => useAddonManagement())

      const noSelections = mockBranchSelections.map(b => ({ ...b, isSelected: false }))

      act(() => {
        result.current.handleAddonSelection(mockBranchAddon, noSelections)
      })

      expect(result.current.isAddonSelected(2)).toBe(false)
    })

    it('returns false for non-selected addon', () => {
      const { result } = renderHook(() => useAddonManagement())

      expect(result.current.isAddonSelected(999)).toBe(false)
    })
  })

  describe('getAddonSelection', () => {
    it('returns addon selection details', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.handleAddonSelection(mockAddon, [])
      })

      const selection = result.current.getAddonSelection(1)
      expect(selection).toMatchObject({
        addon_id: 1,
        addon_name: 'Advanced Reporting'
      })
    })

    it('returns null for non-selected addon', () => {
      const { result } = renderHook(() => useAddonManagement())

      const selection = result.current.getAddonSelection(999)
      expect(selection).toBe(null)
    })
  })

  describe('calculateSingleAddonCost', () => {
    it('calculates organization addon cost for monthly billing', () => {
      const { result } = renderHook(() => useAddonManagement())

      const selectedAddon: SelectedAddon = {
        addon_id: 1,
        addon_name: 'Test',
        addon_price: 100,
        pricing_scope: 'organization' as const,
        branches: [],
        is_included: false
      }

      const cost = result.current.calculateSingleAddonCost(selectedAddon, 'monthly', 0)
      expect(cost).toBe(100)
    })

    it('calculates organization addon cost for yearly billing with discount', () => {
      const { result } = renderHook(() => useAddonManagement())

      const selectedAddon: SelectedAddon = {
        addon_id: 1,
        addon_name: 'Test',
        addon_price: 100,
        pricing_scope: 'organization' as const,
        branches: [],
        is_included: false
      }

      /* 100 * 12 * (1 - 0.20) = 960 */
      const cost = result.current.calculateSingleAddonCost(selectedAddon, 'yearly', 20)
      expect(cost).toBe(960)
    })

    it('calculates branch addon cost based on selected branches', () => {
      const { result } = renderHook(() => useAddonManagement())

      const selectedAddon: SelectedAddon = {
        addon_id: 2,
        addon_name: 'Branch Addon',
        addon_price: 50,
        pricing_scope: 'branch' as const,
        branches: [
          { branchIndex: 0, branchName: 'B1', isSelected: true },
          { branchIndex: 1, branchName: 'B2', isSelected: true },
          { branchIndex: 2, branchName: 'B3', isSelected: false }
        ],
        is_included: false
      }

      const cost = result.current.calculateSingleAddonCost(selectedAddon, 'monthly', 0)
      expect(cost).toBe(100) /* 50 * 2 selected branches */
    })

    it('returns 0 for included addons', () => {
      const { result } = renderHook(() => useAddonManagement())

      const selectedAddon: SelectedAddon = {
        addon_id: 1,
        addon_name: 'Free Addon',
        addon_price: 100,
        pricing_scope: 'organization' as const,
        branches: [],
        is_included: true
      }

      const cost = result.current.calculateSingleAddonCost(selectedAddon, 'monthly', 0)
      expect(cost).toBe(0)
    })
  })

  describe('getTotalAddonCost', () => {
    it('calculates total cost for multiple addons', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.setSelectedAddons([
          {
            addon_id: 1,
            addon_name: 'Org Addon',
            addon_price: 100,
            pricing_scope: 'organization' as const,
            branches: [],
            is_included: false
          },
          {
            addon_id: 2,
            addon_name: 'Branch Addon',
            addon_price: 50,
            pricing_scope: 'branch' as const,
            branches: [
              { branchIndex: 0, branchName: 'B1', isSelected: true },
              { branchIndex: 1, branchName: 'B2', isSelected: true }
            ],
            is_included: false
          }
        ])
      })

      /* Org: 100, Branch: 50 * 2 = 100, Total: 200 */
      const total = result.current.getTotalAddonCost('monthly', 0)
      expect(total).toBe(200)
    })

    it('excludes included addons from total', () => {
      const { result } = renderHook(() => useAddonManagement())

      act(() => {
        result.current.setSelectedAddons([
          {
            addon_id: 1,
            addon_name: 'Paid Addon',
            addon_price: 100,
            pricing_scope: 'organization' as const,
            branches: [],
            is_included: false
          },
          {
            addon_id: 2,
            addon_name: 'Free Addon',
            addon_price: 200,
            pricing_scope: 'organization' as const,
            branches: [],
            is_included: true
          }
        ])
      })

      const total = result.current.getTotalAddonCost('monthly', 0)
      expect(total).toBe(100)
    })

    it('returns 0 for no selected addons', () => {
      const { result } = renderHook(() => useAddonManagement())

      const total = result.current.getTotalAddonCost('monthly', 0)
      expect(total).toBe(0)
    })
  })

  describe('refreshAddonData', () => {
    it('reloads addon data from localStorage', () => {
      const { result } = renderHook(() => useAddonManagement())

      expect(result.current.selectedAddons).toEqual([])

      const cachedData = {
        selectedAddons: [
          {
            addon_id: 1,
            addon_name: 'New Addon',
            addon_price: 75,
            pricing_scope: 'organization' as const,
            branches: [] as AddonBranchSelection[],
            is_included: false
          }
        ]
      }

      localStorage.setItem(
        TENANT_ACCOUNT_CREATION_LS_KEYS.SELECTED_PLAN_DATA,
        JSON.stringify(cachedData)
      )

      act(() => {
        result.current.refreshAddonData()
      })

      expect(result.current.selectedAddons).toEqual(cachedData.selectedAddons)
    })
  })
})
